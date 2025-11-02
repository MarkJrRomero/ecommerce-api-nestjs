import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
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

  @OneToMany(() => Delivery, (delivery) => delivery.transaction)
  deliveries: Delivery[];

  @CreateDateColumn()
  createdAt: Date;
}
