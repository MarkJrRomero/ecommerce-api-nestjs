import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../products/product.service';
import { Delivery } from '../deliveries/delivery.entity';
import { Customer } from '../customers/customer.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WpiService } from './wpi.service';

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
    if (!dto.products || dto.products.length === 0) {
      throw new BadRequestException('Debe incluir al menos un producto');
    }

    const products = await Promise.all(
      dto.products.map((item) => this.productService.findById(item.productId)),
    );

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const item = dto.products[i];

      if (!product) {
        throw new NotFoundException(`El producto con ID ${item.productId} no existe`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `El producto "${product.name}" no tiene suficiente stock. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
        );
      }

      if (item.quantity <= 0) {
        throw new BadRequestException(`La cantidad del producto "${product.name}" debe ser mayor a 0`);
      }
    }

    const validProducts = products.filter((p): p is NonNullable<typeof p> => p !== null);

    const totalAmount = validProducts.reduce((sum, product, index) => {
      return sum + product.price * dto.products[index].quantity;
    }, 0);

    if (totalAmount < 1500) {
      throw new BadRequestException('El monto mínimo permitido es de $1.500 COP');
    }

    if (dto.card.card_holder.length < 5) {
      throw new BadRequestException('El nombre del titular de la tarjeta no puede tener menos de 5 caracteres');
    }

    const customer = this.customerRepo.create(dto.delivery.customer);
    await this.customerRepo.save(customer);

    const initialTransaction = this.transactionRepo.create({
      status: 'PENDING',
      amount: totalAmount,
      transactionId: 'N/A',
    });

    let savedTransaction = await this.transactionRepo.save(initialTransaction);

    try {
      const tokenWpi = await this.wpiService.tokenizeCard({
        number: dto.card.number,
        cvc: dto.card.cvc,
        exp_month: dto.card.exp_month,
        exp_year: dto.card.exp_year,
        card_holder: dto.card.card_holder,
      });

      const transaction = await this.wpiService.createTransactionWpi({
        token: tokenWpi,
        amountInCents: totalAmount * 100,
        reference: `ref_${savedTransaction.id}`,
        customerEmail: dto.delivery.customer.email,
      });

      const statusTransaction = transaction.data.status;

      const deliveries = await Promise.all(
        validProducts.map((product, index) => {
          const quantity = dto.products[index].quantity || 1;
          const delivery = this.deliveryRepo.create({
            address: dto.delivery.address,
            city: dto.delivery.city,
            country: dto.delivery.country,
            product: product,
            customer,
            transaction: savedTransaction,
            quantity: quantity,
          });
          return this.deliveryRepo.save(delivery);
        }),
      );

      savedTransaction.status = statusTransaction;
      savedTransaction.transactionId = transaction.id;
      await this.transactionRepo.save(savedTransaction);

      for (let i = 0; i < validProducts.length; i++) {
        const product = validProducts[i];
        const quantity = dto.products[i].quantity;
        for (let j = 0; j < quantity; j++) {
          await this.productService.reduceStock(product.id);
        }
      }

      savedTransaction.deliveries = deliveries;
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
        JSON.stringify(wpiError.messages) || 'Error inesperado al procesar el pago',
      );
    }
  }

  async checkTransaction(transactionId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
      relations: ['deliveries', 'deliveries.product'],
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

    console.log(payload);

    const transactionData = payload.data?.transaction;
  
    if (!transactionData || !transactionData.reference || !transactionData.id) {
      return { received: false };
    }
  
    const refId = transactionData.reference.replace('ref_', '');
  
    const transaction = await this.transactionRepo.findOne({
      where: { id: refId },
      relations: ['deliveries', 'deliveries.product'],
    });

    if (!transaction) {
      return { received: false };
    }

    transaction.status = transactionData.status;
    transaction.transactionId = transactionData.id;
    await this.transactionRepo.save(transaction);

    if (transactionData.status !== 'APPROVED') {
      for (const delivery of transaction.deliveries) {
        for (let i = 0; i < delivery.quantity; i++) {
          await this.productService.increaseStock(delivery.product.id);
        }
      }
    }
  
    return { received: true };
  }
}
