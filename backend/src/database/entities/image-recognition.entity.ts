import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('image_recognition')
export class ImageRecognition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  imageUrl: string;

  @Column()
  recognizedFishId: number;

  @Column('decimal', { precision: 5, scale: 2 })
  confidence: number;

  @Column('json')
  recognitionResultJson: any;

  @CreateDateColumn()
  created_at: Date;
}
