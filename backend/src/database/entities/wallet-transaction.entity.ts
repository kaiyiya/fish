import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type WalletTransactionType = 'recharge' | 'payment' | 'refund';

@Entity('wallet_transaction')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column({ type: 'enum', enum: ['recharge', 'payment', 'refund'] })
  type: WalletTransactionType;

  // 金额：充值为正，扣款为负（展示/统计可按 type 分组）
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  balanceBefore: number;

  @Column('decimal', { precision: 10, scale: 2 })
  balanceAfter: number;

  @Column({ nullable: true })
  orderId: number | null;

  @Column({ nullable: true })
  rechargeSessionId: number | null;

  @Column({ default: 'success' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

