import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(RecommendationLog)
    private recommendationLogRepository: Repository<RecommendationLog>,
  ) {}

  async getRecommendations(userId: number, type: string = 'personalized') {
    // TODO: 实现推荐算法
    // 这里先返回模拟数据
    
    const recommendations = [
      { id: 1, name: '三文鱼', price: 128, score: 0.95 },
      { id: 2, name: '鲈鱼', price: 68, score: 0.88 },
      { id: 3, name: '带鱼', price: 45, score: 0.82 },
    ];

    // 记录推荐日志
    for (const product of recommendations) {
      const log = this.recommendationLogRepository.create({
        userId,
        productId: product.id,
        recommendType: type,
        algorithmType: 'hybrid',
        score: product.score,
      });
      await this.recommendationLogRepository.save(log);
    }

    return recommendations;
  }
}
