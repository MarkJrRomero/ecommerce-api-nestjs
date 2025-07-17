import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: 'PENDING' | 'APPROVED' | 'DECLINED';

  @Column()
  productId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  wompiTransactionId: string;

  @CreateDateColumn()
  createdAt: Date;
}
