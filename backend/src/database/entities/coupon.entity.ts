import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('coupon')
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // 优惠券名称

  @Column('text', { nullable: true })
  description: string; // 优惠券描述

  @Column({ type: 'enum', enum: ['discount', 'reduce', 'free'], default: 'discount' })
  type: string; // 类型：discount(折扣), reduce(满减), free(免运费)

  @Column('decimal', { precision: 10, scale: 2 })
  value: number; // 优惠值（折扣率、减免金额等）

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minAmount: number; // 最低使用金额（满减用）

  @Column({ type: 'int', default: -1 })
  totalCount: number; // 总发放数量（-1表示不限）

  @Column({ type: 'int', default: 0 })
  usedCount: number; // 已使用数量

  @Column({ type: 'int', default: 1 })
  limitPerUser: number; // 每个用户限领数量

  @Column({ type: 'datetime', nullable: true })
  startTime: Date; // 开始时间

  @Column({ type: 'datetime', nullable: true })
  endTime: Date; // 结束时间

  @Column({ default: true })
  isActive: boolean; // 是否启用

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
