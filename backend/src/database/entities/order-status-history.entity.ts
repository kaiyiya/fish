import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  orderId: number;

  @Column()
  fromStatus: string;

  @Column()
  toStatus: string;

  // 可能是管理员 ID，也可能是用户 ID（看具体业务场景）
  @Column({ nullable: true })
  changedBy: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

