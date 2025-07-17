import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Delivery } from '../deliveries/delivery.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: 'PENDING' | 'APPROVED' | 'DECLINED';

  @Column()
  amount: number;

  @Column()
  transactionId: string;

  @ManyToOne(() => Delivery, (delivery) => delivery.transaction)
  delivery: Delivery;

  @CreateDateColumn()
  createdAt: Date;
}
