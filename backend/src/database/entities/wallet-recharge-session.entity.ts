import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type WalletRechargeStatus = 'pending' | 'success' | 'failed';

@Entity('wallet_recharge_session')
export class WalletRechargeSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  })
  status: WalletRechargeStatus;

  // 二维码 token，用于“扫码确认”完成充值
  @Index({ unique: true })
  @Column()
  token: string;

  @Column({ nullable: true })
  paid_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
