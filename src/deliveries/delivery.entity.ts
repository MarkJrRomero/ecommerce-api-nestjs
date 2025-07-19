import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';
import { Transaction } from '../transactions/transaction.entity';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @ManyToOne(() => Customer, (customer) => customer.deliveries, {
    cascade: true,
  })
  customer: Customer;

  @ManyToOne(() => Product)
  product: Product;

  @OneToOne(() => Transaction)
  @JoinColumn()
  transaction: Transaction;
}
