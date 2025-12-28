import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';
import { Product } from '../../database/entities/product.entity';
import { CollaborativeFilteringService } from './algorithms/collaborative-filtering.service';
import { ContentBasedService } from './algorithms/content-based.service';
import { PopularityBasedService } from './algorithms/popularity-based.service';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(RecommendationLog)
    private recommendationLogRepository: Repository<RecommendationLog>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private collaborativeFiltering: CollaborativeFilteringService,
    private contentBased: ContentBasedService,
    private popularityBased: PopularityBasedService,
  ) {}

  /**
   * 获取推荐商品
   * @param userId 用户ID
   * @param type 推荐类型：'personalized' | 'collaborative' | 'content' | 'popular' | 'hybrid'
   * @param topN 返回推荐数量
   */
  async getRecommendations(
    userId: number,
    type: string = 'personalized',
    topN: number = 20,
  ) {
    let recommendations: Array<{ productId: number; score: number; reason?: string }> = [];
    let algorithmType = type;

    try {
      switch (type) {
        case 'collaborative':
        case 'usercf':
          // 基于用户的协同过滤
          recommendations = await this.collaborativeFiltering.userBasedCF(userId, topN);
          algorithmType = 'usercf';
          break;

        case 'itemcf':
          // 基于物品的协同过滤
          recommendations = await this.collaborativeFiltering.itemBasedCF(userId, topN);
          algorithmType = 'itemcf';
          break;

        case 'content':
          // 基于内容的推荐
          recommendations = await this.contentBased.recommend(userId, topN);
          algorithmType = 'content';
          break;

        case 'popular':
          // 热门推荐（用于冷启动）
          recommendations = await this.popularityBased.getPopularProducts(30, topN);
          algorithmType = 'popular';
          break;

        case 'hybrid':
          // 混合推荐
          recommendations = await this.collaborativeFiltering.hybridCF(userId, 0.6, 0.4, topN);
          algorithmType = 'hybrid';
          break;

        case 'personalized':
        default:
          // 个性化推荐（智能选择策略）
          recommendations = await this.getPersonalizedRecommendations(userId, topN);
          algorithmType = 'personalized';
          break;
      }

      // 如果没有推荐结果，使用热门推荐作为兜底
      if (recommendations.length === 0) {
        recommendations = await this.popularityBased.getPopularProducts(30, topN);
        algorithmType = 'popular';
      }

      // 获取商品详细信息
      const productIds = recommendations.map((r) => r.productId);
      if (productIds.length === 0) {
        return [];
      }
      const products = await this.productRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...ids)', { ids: productIds })
        .getMany();

      // 构建返回结果
      const result = recommendations
        .map((rec) => {
          const product = products.find((p) => p.id === rec.productId);
          if (!product) return null;

          return {
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrls?.[0] || '',
            score: rec.score,
            reason: rec.reason || '推荐',
          };
        })
        .filter((item) => item !== null);

      // 记录推荐日志
      await this.logRecommendations(userId, recommendations, type, algorithmType);

      return result;
    } catch (error) {
      console.error('推荐算法执行错误:', error);
      
      // 降级到热门推荐
      const fallbackRecs = await this.popularityBased.getPopularProducts(30, topN);
      const productIds = fallbackRecs.map((r) => r.productId);
      if (productIds.length === 0) {
        return [];
      }
      const products = await this.productRepository
        .createQueryBuilder('product')
        .where('product.id IN (:...ids)', { ids: productIds })
        .getMany();

      return fallbackRecs
        .map((rec) => {
          const product = products.find((p) => p.id === rec.productId);
          return product
            ? {
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrls?.[0] || '',
                score: rec.score,
                reason: '热门推荐（降级方案）',
              }
            : null;
        })
        .filter((item) => item !== null);
    }
  }

  /**
   * 个性化推荐（智能选择最佳策略）
   */
  private async getPersonalizedRecommendations(
    userId: number,
    topN: number,
  ): Promise<Array<{ productId: number; score: number; reason?: string }>> {
    // 检查用户是否有足够的历史行为
    // 通过调用UserCF来间接检查（如果没有数据会返回空数组）
    const testRecs = await this.collaborativeFiltering.userBasedCF(userId, 10, 0.1);
    const hasEnoughData = testRecs.length > 0;

    // 如果用户行为数据不足，使用热门推荐或内容推荐
    if (!hasEnoughData) {
      // 尝试内容推荐
      const contentRecs = await this.contentBased.recommend(userId, topN);
      if (contentRecs.length > 0) {
        return contentRecs;
      }
      // 降级到热门推荐
      return this.popularityBased.getPopularProducts(30, topN);
    }

    // 用户有足够数据，使用混合推荐
    return this.collaborativeFiltering.hybridCF(userId, 0.6, 0.4, topN);
  }

  /**
   * 记录推荐日志
   */
  private async logRecommendations(
    userId: number,
    recommendations: Array<{ productId: number; score: number }>,
    recommendType: string,
    algorithmType: string,
  ): Promise<void> {
    const logs = recommendations.map((rec) =>
      this.recommendationLogRepository.create({
        userId,
        productId: rec.productId,
        recommendType,
        algorithmType,
        score: rec.score,
        clicked: false,
        purchased: false,
      }),
    );

    await this.recommendationLogRepository.save(logs);
  }

  /**
   * 记录用户点击推荐商品
   */
  async recordClick(userId: number, productId: number): Promise<void> {
    await this.recommendationLogRepository.update(
      { userId, productId },
      { clicked: true },
    );
  }

  /**
   * 记录用户购买推荐商品
   */
  async recordPurchase(userId: number, productId: number): Promise<void> {
    await this.recommendationLogRepository.update(
      { userId, productId },
      { purchased: true },
    );
  }
}
