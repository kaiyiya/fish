import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../database/entities/product.entity';
import { UserBehavior } from '../../../database/entities/user-behavior.entity';

/**
 * 基于内容的推荐算法
 * 算法原理：基于商品的特征（价格、分类、标签等）和用户历史偏好进行推荐
 */

interface RecommendationResult {
  productId: number;
  score: number;
  reason?: string;
}

@Injectable()
export class ContentBasedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserBehavior)
    private behaviorRepository: Repository<UserBehavior>,
  ) {}

  /**
   * 内容推荐算法
   */
  async recommend(
    userId: number,
    topN: number = 50,
  ): Promise<RecommendationResult[]> {
    // 1. 获取用户历史行为
    const userBehaviors = await this.behaviorRepository.find({
      where: { userId },
    });

    if (userBehaviors.length === 0) {
      return []; // 无历史行为，返回空
    }

    // 2. 获取用户喜欢的商品
    const likedProductIds = [...new Set(userBehaviors.map((b) => b.productId))];
    if (likedProductIds.length === 0) {
      return [];
    }
    const likedProducts = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids: likedProductIds })
      .getMany();

    // 3. 构建用户偏好向量（基于用户喜欢的商品特征）
    const userPreference = this.buildUserPreference(likedProducts);

    // 4. 获取所有商品
    const allProducts = await this.productRepository.find();
    const userLikedSet = new Set(likedProductIds);

    // 5. 计算每个商品与用户偏好的相似度
    const recommendations: RecommendationResult[] = [];

    for (const product of allProducts) {
      // 排除用户已经交互过的商品
      if (userLikedSet.has(product.id)) continue;

      // 构建商品特征向量
      const productFeatures = this.buildProductFeatures(product);

      // 计算相似度（余弦相似度）
      const similarity = this.cosineSimilarity(userPreference, productFeatures);

      if (similarity > 0) {
        recommendations.push({
          productId: product.id,
          score: similarity,
          reason: '基于内容推荐',
        });
      }
    }

    // 6. 按相似度排序并返回topN
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }

  /**
   * 构建用户偏好向量
   */
  private buildUserPreference(products: Product[]): { [key: string]: number } {
    const preference: { [key: string]: number } = {};

    if (products.length === 0) return preference;

    // 统计用户喜欢的商品特征
    let totalPrice = 0;
    const categories: { [categoryId: number]: number } = {};
    const priceRanges: { [range: string]: number } = {};

    for (const product of products) {
      // 价格统计
      totalPrice += Number(product.price);
      const priceRange = this.getPriceRange(Number(product.price));
      priceRanges[priceRange] = (priceRanges[priceRange] || 0) + 1;

      // 分类统计
      if (product.categoryId) {
        categories[product.categoryId] = (categories[product.categoryId] || 0) + 1;
      }
    }

    // 归一化
    const avgPrice = totalPrice / products.length;
    const maxCount = Math.max(...Object.values(categories), 1);

    preference['avg_price'] = avgPrice;
    
    for (const [categoryId, count] of Object.entries(categories)) {
      preference[`category_${categoryId}`] = count / maxCount;
    }

    for (const [range, count] of Object.entries(priceRanges)) {
      preference[`price_range_${range}`] = count / products.length;
    }

    return preference;
  }

  /**
   * 构建商品特征向量
   */
  private buildProductFeatures(product: Product): { [key: string]: number } {
    const features: { [key: string]: number } = {};

    features['avg_price'] = Number(product.price);
    
    if (product.categoryId) {
      features[`category_${product.categoryId}`] = 1.0;
    }

    const priceRange = this.getPriceRange(Number(product.price));
    features[`price_range_${priceRange}`] = 1.0;

    return features;
  }

  /**
   * 获取价格区间
   */
  private getPriceRange(price: number): string {
    if (price < 50) return 'low';
    if (price < 100) return 'medium';
    if (price < 200) return 'high';
    return 'premium';
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(
    vec1: { [key: string]: number },
    vec2: { [key: string]: number },
  ): number {
    const keys1 = Object.keys(vec1);
    const keys2 = Object.keys(vec2);
    const commonKeys = keys1.filter((k) => keys2.includes(k));

    if (commonKeys.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const key of commonKeys) {
      dotProduct += vec1[key] * vec2[key];
      norm1 += vec1[key] * vec1[key];
      norm2 += vec2[key] * vec2[key];
    }

    for (const key of keys1) {
      if (!commonKeys.includes(key)) {
        norm1 += vec1[key] * vec1[key];
      }
    }

    for (const key of keys2) {
      if (!commonKeys.includes(key)) {
        norm2 += vec2[key] * vec2[key];
      }
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
