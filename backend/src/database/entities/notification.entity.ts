import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('notification')
@Index(['userId', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['order', 'system', 'promotion', 'review'], default: 'system' })
  type: string; // 类型：order(订单), system(系统), promotion(促销), review(评价)

  @Column()
  title: string; // 通知标题

  @Column('text', { nullable: true })
  content: string; // 通知内容

  @Column({ nullable: true })
  relatedId: number; // 关联ID（如订单ID）

  @Column({ default: false })
  isRead: boolean; // 是否已读

  @CreateDateColumn()
  created_at: Date;
}
