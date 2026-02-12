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

@Entity('address')
@Index(['userId'])
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string; // 收货人姓名

  @Column()
  phone: string; // 收货人电话

  @Column()
  province: string; // 省份

  @Column()
  city: string; // 城市

  @Column()
  district: string; // 区/县

  @Column()
  detail: string; // 详细地址

  @Column({ nullable: true })
  postalCode: string; // 邮编

  @Column({ default: false })
  isDefault: boolean; // 是否默认地址

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
