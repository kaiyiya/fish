import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Coupon } from './coupon.entity';
import { Order } from './order.entity';

@Entity('user_coupon')
@Index(['userId', 'couponId'])
export class UserCoupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  couponId: number;

  @ManyToOne(() => Coupon)
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon;

  @Column({ type: 'enum', enum: ['unused', 'used', 'expired'], default: 'unused' })
  status: string; // 状态：unused(未使用), used(已使用), expired(已过期)

  @Column({ nullable: true })
  orderId: number; // 使用的订单ID

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'datetime', nullable: true })
  usedAt: Date; // 使用时间

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
