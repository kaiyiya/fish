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
import { Product } from './product.entity';

@Entity('favorite')
@Index(['userId', 'productId'], { unique: true }) // 同一用户同一商品只能收藏一次
export class Favorite {
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

  @CreateDateColumn()
  created_at: Date;
}
