import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { ProductService } from '../products/product.service';
import { Delivery } from '../deliveries/delivery.entity';
import { Customer } from '../customers/customer.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { WompiService } from './wpi.service';

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
    private readonly wompiService: WompiService,
  ) {}

  async createTransaction(dto: CreateTransactionDto) {
    // 1. Verifica producto y stock
    const product = await this.productService.findById(dto.productId);
    if (!product || product.stock <= 0) {
      throw new NotFoundException('Producto no disponible');
    }

    // 2. Crear transacción PENDING
    const transaction = this.transactionRepo.create({
      productId: product.id,
      status: 'PENDING',
      amount: dto.amount,
      wompiTransactionId: 'TEMP',
    });
    const savedTransaction = await this.transactionRepo.save(transaction);

    // 3. Consumir servicio de pago
    const wompiResponse = this.wompiService.pay({
      reference: `tx-${savedTransaction.id}`,
    });
    console.log(wompiResponse);

    // 4. Guardar cliente y entrega
    const customer = this.customerRepo.create(dto.delivery.customer);
    await this.customerRepo.save(customer);

    const delivery = this.deliveryRepo.create({
      address: dto.delivery.address,
      city: dto.delivery.city,
      product,
      customer,
      transaction: savedTransaction,
    });
    await this.deliveryRepo.save(delivery);

    // 5. Actualizar transacción con respuesta de Wompi
    savedTransaction.status = wompiResponse.status as
      | 'PENDING'
      | 'APPROVED'
      | 'DECLINED';
    savedTransaction.wompiTransactionId = wompiResponse.id;
    await this.transactionRepo.save(savedTransaction);

    // 6. Reducir stock
    await this.productService.reduceStock(product.id);

    return savedTransaction;
  }
}
