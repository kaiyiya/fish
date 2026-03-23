import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payment_log')
export class PaymentLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  orderId: number;

  @Index()
  @Column()
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  method: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  transactionNo: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

