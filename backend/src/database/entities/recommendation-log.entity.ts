import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('recommendation_log')
export class RecommendationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @Column()
  recommendType: string;

  @Column()
  algorithmType: string;

  @Column('decimal', { precision: 5, scale: 2 })
  score: number;

  @Column({ default: false })
  clicked: boolean;

  @Column({ default: false })
  purchased: boolean;

  @CreateDateColumn()
  created_at: Date;
}
