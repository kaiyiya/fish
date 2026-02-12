import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

@Entity('fish_product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  stock: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('json', { nullable: true })
  imageUrls: string[];

  @Column('text', { nullable: true })
  nutritionInfo: string;

  @Column('text', { nullable: true })
  cookingTips: string;

  @Column({ default: 1 })
  freshnessLevel: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
