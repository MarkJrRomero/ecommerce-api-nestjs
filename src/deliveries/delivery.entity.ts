import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @ManyToOne(() => Customer, (customer) => customer.deliveries, {
    cascade: true,
  })
  customer: Customer;

  @ManyToOne(() => Product)
  product: Product;
}
