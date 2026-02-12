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
import { Product } from './product.entity';
import { Order } from './order.entity';

@Entity('review')
@Index(['productId', 'userId']) // 同一用户对同一商品只能评价一次
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  orderId: number; // 关联订单（可选，用于验证是否购买过）

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'tinyint', default: 5 })
  rating: number; // 评分 1-5

  @Column('text', { nullable: true })
  content: string; // 评价内容

  @Column('json', { nullable: true })
  images: string[]; // 评价图片

  @Column({ default: 0 })
  helpfulCount: number; // 有用数

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
