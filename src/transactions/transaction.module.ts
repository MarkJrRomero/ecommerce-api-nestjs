import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { ProductModule } from '../products/product.module';
import { Delivery } from '../deliveries/delivery.entity';
import { Customer } from '../customers/customer.entity';
import { WpiService } from './wpi.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Delivery, Customer]),
    ProductModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService, WpiService],
})
export class TransactionModule {}
