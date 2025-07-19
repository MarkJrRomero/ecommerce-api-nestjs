import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../products/product.service';
import { Delivery } from '../deliveries/delivery.entity';
import { Customer } from '../customers/customer.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WpiService } from './wpi.service';
import { sendEmail } from 'src/utils/utils';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Delivery)
    private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly productService: ProductService,
    private readonly wpiService: WpiService,
  ) {}

  async createTransaction(dto: CreateTransactionDto) {
    // 1. Validaciones
    const product = await this.productService.findById(dto.delivery.productId);
    if (!product || product.stock <= 0) {
      throw new NotFoundException(
        'El producto seleccionado no está disponible',
      );
    }

    if (dto.amount < 1500) {
      throw new BadRequestException(
        'El monto mínimo permitido es de $1.500 COP',
      );
    }

    if (dto.card.card_holder.length < 5) {
      throw new BadRequestException(
        'El nombre del titular de la tarjeta no puede tener menos de 5 caracteres',
      );
    }

    // 2. Crear el envio y la transacción PENDING
    const initialDelivery = this.deliveryRepo.create({
      address: dto.delivery.address,
      city: dto.delivery.city,
      country: dto.delivery.country,
      product,
      customer: dto.delivery.customer,
    });

    const savedDelivery = await this.deliveryRepo.save(initialDelivery);

    const initialTransaction = this.transactionRepo.create({
      status: 'PENDING',
      amount: dto.amount,
      delivery: savedDelivery,
      transactionId: 'N/A',
    });

    let savedTransaction = await this.transactionRepo.save(initialTransaction);

    try {
      // 3. Consumir servicio de pago

      const tokenWpi = await this.wpiService.tokenizeCard({
        number: dto.card.number,
        cvc: dto.card.cvc,
        exp_month: dto.card.exp_month,
        exp_year: dto.card.exp_year,
        card_holder: dto.card.card_holder,
      });

      const transaction = await this.wpiService.createTransactionWpi({
        token: tokenWpi,
        amountInCents: dto.amount * 100,
        reference: `ref_${savedTransaction.id}`,
        customerEmail: dto.delivery.customer.email,
      });

      const statusTransaction = transaction.data.status;

      // 4. Guardar cliente y entrega
      const customer = this.customerRepo.create(dto.delivery.customer);
      await this.customerRepo.save(customer);

      const delivery = this.deliveryRepo.create({
        address: dto.delivery.address,
        city: dto.delivery.city,
        country: dto.delivery.country,
        product,
        customer,
        transaction: savedTransaction,
      });
      await this.deliveryRepo.save(delivery);

      // 5. Actualizar transacción con respuesta de Wpi
      savedTransaction.status = statusTransaction;
      savedTransaction.transactionId = transaction.id;
      await this.transactionRepo.save(savedTransaction);

      // 6. Reducir stock
      await this.productService.reduceStock(product.id);

      await sendEmail(dto.delivery.customer.email, 'Transacción aprobada',
        `La transacción ${savedTransaction.id} ha sido aprobada`,
      );

      return savedTransaction;
    } catch (error) {
      savedTransaction.status = 'DECLINED';
      await this.transactionRepo.save(savedTransaction);

      const wpiError = error?.response?.data?.error;

      console.error('⚠️ Error al crear transacción en Wpi:');
      if (wpiError) {
        console.error(wpiError.messages);
      } else {
        console.error(error.message || error);
      }
      throw new BadRequestException(
        JSON.stringify(wpiError.messages) ||
          'Error inesperado al procesar el pago',
      );
    }
  }

  async checkTransaction(transactionId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
      relations: ['delivery', 'delivery.product'],
    });

    if (!transaction) {
      throw new NotFoundException('No se encontró la transacción');
    }

    return transaction;
  }

  async processWpiWebhook(payload: any) {
    if (payload == undefined) {
      return { received: false };
    }

    const transactionData = payload.data?.transaction;

    if (!transactionData || !transactionData.reference || !transactionData.id) {
      return { received: false };
    }

    const refId = transactionData.reference.replace('ref_', '');

    const transaction = await this.transactionRepo.findOne({
      where: { id: refId },
      relations: ['delivery', 'delivery.product'],
    });

    if (!transaction) {
      return { received: false };
    }

    transaction.status = transactionData.status; // APPROVED, DECLINED, etc.
    transaction.transactionId = transactionData.id;
    await this.transactionRepo.save(transaction);

    // Si no fue aprobado, aumentar stock que se habia reducido
    if (transactionData.status !== 'APPROVED') {
      await sendEmail(
        transaction.delivery.customer.email,
        'Transacción rechazada',
        `La transacción ${transaction.id} ha sido rechazada`,
      );
      await this.productService.increaseStock(transaction.delivery.product.id);
    }

    if (transactionData.status === 'DECLINED') {
      await sendEmail(
        transaction.delivery.customer.email,
        'Transacción rechazada',
        `La transacción ${transaction.id} ha sido rechazada`,
      );
    }

    return { received: true };
  }
}
