import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBehavior } from '../../../database/entities/user-behavior.entity';

/**
 * 基于流行度的推荐算法（用于冷启动）
 * 算法原理：推荐热门商品、最新商品等
 */

interface RecommendationResult {
  productId: number;
  score: number;
  reason?: string;
}

@Injectable()
export class PopularityBasedService {
  constructor(
    @InjectRepository(UserBehavior)
    private behaviorRepository: Repository<UserBehavior>,
  ) {}

  /**
   * 热门商品推荐
   */
  async getPopularProducts(
    days: number = 30,
    topN: number = 50,
  ): Promise<RecommendationResult[]> {
    // 获取最近N天的行为数据
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const behaviors = await this.behaviorRepository
      .createQueryBuilder('behavior')
      .where('behavior.created_at >= :startDate', { startDate })
      .getMany();

    // 统计每个商品的受欢迎程度（行为权重之和）
    const productScores: { [productId: number]: number } = {};

    for (const behavior of behaviors) {
      if (!productScores[behavior.productId]) {
        productScores[behavior.productId] = 0;
      }

      // 不同行为有不同的权重
      const weight = this.getBehaviorWeight(behavior.behaviorType);
      productScores[behavior.productId] += weight;
    }

    // 转换为推荐结果并排序
    const recommendations: RecommendationResult[] = Object.keys(productScores)
      .map(Number)
      .map((productId) => ({
        productId,
        score: productScores[productId],
        reason: `热门商品（近${days}天）`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    return recommendations;
  }

  /**
   * 最新商品推荐（需要结合商品表的时间戳）
   */
  async getNewProducts(topN: number = 20): Promise<RecommendationResult[]> {
    // 这里需要结合Product实体，按创建时间排序
    // 示例实现，实际需要从Product表查询
    return [];
  }

  /**
   * 获取行为权重
   */
  private getBehaviorWeight(behaviorType: string): number {
    const weights: { [key: string]: number } = {
      view: 1,
      collect: 3,
      add_cart: 5,
      purchase: 10,
      share: 2,
    };

    return weights[behaviorType] || 1;
  }
}
