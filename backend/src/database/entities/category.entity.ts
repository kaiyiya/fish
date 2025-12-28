import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  parentId: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  created_at: Date;
}
