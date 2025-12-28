import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('user_behavior')
@Index(['userId', 'productId']) // 复合索引优化查询
@Index(['userId', 'behaviorType'])
export class UserBehavior {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index()
    userId: number;

    @Column()
    @Index()
    productId: number;

    @Column()
    behaviorType: string; // 'view', 'collect', 'add_cart', 'purchase', 'share'

    @Column('decimal', { precision: 5, scale: 2, default: 1.0 })
    behaviorValue: number; // 行为权重值

    @CreateDateColumn()
    created_at: Date;
}
