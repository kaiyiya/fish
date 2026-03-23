import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('order_shipping_snapshot')
export class OrderShippingSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  orderId: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  detail: string;

  @Column({ nullable: true })
  postalCode: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

