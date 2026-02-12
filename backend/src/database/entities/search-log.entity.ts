import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('search_log')
@Index(['userId', 'keyword'])
@Index(['created_at'])
export class SearchLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number; // 可为空，支持未登录用户搜索

  @Column()
  keyword: string; // 搜索关键词

  @Column({ default: 'keyword' })
  searchType: string; // 搜索类型：keyword, semantic

  @Column({ nullable: true })
  resultCount: number; // 搜索结果数量

  @CreateDateColumn()
  created_at: Date;
}
