import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Delivery } from '../deliveries/delivery.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @OneToMany(() => Delivery, (delivery) => delivery.customer)
  deliveries: Delivery[];
}
