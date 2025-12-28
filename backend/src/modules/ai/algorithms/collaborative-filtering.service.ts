import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBehavior } from '../../../database/entities/user-behavior.entity';
import { Product } from '../../../database/entities/product.entity';

/**
 * 协同过滤推荐算法服务
 * 实现基于用户的协同过滤（UserCF）和基于物品的协同过滤（ItemCF）
 */

interface UserItemMatrix {
  [userId: number]: {
    [productId: number]: number; // 用户对商品的评分/权重
  };
}

interface SimilarityResult {
  id: number;
  similarity: number;
}

interface RecommendationResult {
  productId: number;
  score: number;
  reason?: string;
}

@Injectable()
export class CollaborativeFilteringService {
  constructor(
    @InjectRepository(UserBehavior)
    private behaviorRepository: Repository<UserBehavior>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 行为权重映射
   */
  private readonly BEHAVIOR_WEIGHTS = {
    view: 1.0,
    collect: 3.0,
    add_cart: 5.0,
    purchase: 10.0,
    share: 2.0,
  };

  /**
   * 构建用户-物品评分矩阵
   */
  private async buildUserItemMatrix(): Promise<UserItemMatrix> {
    const behaviors = await this.behaviorRepository.find();
    const matrix: UserItemMatrix = {};

    for (const behavior of behaviors) {
      if (!matrix[behavior.userId]) {
        matrix[behavior.userId] = {};
      }

      const weight = this.BEHAVIOR_WEIGHTS[behavior.behaviorType] || 1.0;
      const currentValue = matrix[behavior.userId][behavior.productId] || 0;
      
      // 累加同一用户对同一商品的不同行为权重
      matrix[behavior.userId][behavior.productId] = currentValue + weight;
    }

    return matrix;
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(
    vec1: { [key: number]: number },
    vec2: { [key: number]: number },
  ): number {
    const keys1 = Object.keys(vec1).map(Number);
    const keys2 = Object.keys(vec2).map(Number);
    const commonKeys = keys1.filter((k) => keys2.includes(k));

    if (commonKeys.length === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    // 计算共同项的相似度
    for (const key of commonKeys) {
      dotProduct += vec1[key] * vec2[key];
      norm1 += vec1[key] * vec1[key];
      norm2 += vec2[key] * vec2[key];
    }

    // 考虑非共同项
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

  /**
   * 计算皮尔逊相关系数
   */
  private pearsonCorrelation(
    vec1: { [key: number]: number },
    vec2: { [key: number]: number },
  ): number {
    const keys1 = Object.keys(vec1).map(Number);
    const keys2 = Object.keys(vec2).map(Number);
    const commonKeys = keys1.filter((k) => keys2.includes(k));

    if (commonKeys.length === 0) return 0;

    // 计算平均值
    const avg1 = commonKeys.reduce((sum, k) => sum + vec1[k], 0) / commonKeys.length;
    const avg2 = commonKeys.reduce((sum, k) => sum + vec2[k], 0) / commonKeys.length;

    // 计算协方差和方差
    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;

    for (const key of commonKeys) {
      const diff1 = vec1[key] - avg1;
      const diff2 = vec2[key] - avg2;
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(variance1) * Math.sqrt(variance2);
    return denominator === 0 ? 0 : covariance / denominator;
  }

  /**
   * 基于用户的协同过滤（UserCF）
   * 算法原理：找到与目标用户相似的用户，推荐这些相似用户喜欢的商品
   * 时间复杂度：O(n²×m)，n为用户数，m为商品数
   */
  async userBasedCF(
    userId: number,
    topN: number = 50,
    minSimilarity: number = 0.1,
  ): Promise<RecommendationResult[]> {
    const matrix = await this.buildUserItemMatrix();
    const targetUserVector = matrix[userId];

    if (!targetUserVector || Object.keys(targetUserVector).length === 0) {
      return []; // 用户无行为数据，返回空
    }

    // 计算目标用户与其他所有用户的相似度
    const userSimilarities: SimilarityResult[] = [];
    const allUserIds = Object.keys(matrix).map(Number);

    for (const otherUserId of allUserIds) {
      if (otherUserId === userId) continue;

      const otherUserVector = matrix[otherUserId];
      if (!otherUserVector || Object.keys(otherUserVector).length === 0) continue;

      // 使用余弦相似度（也可使用皮尔逊相关系数）
      const similarity = this.cosineSimilarity(targetUserVector, otherUserVector);

      if (similarity >= minSimilarity) {
        userSimilarities.push({
          id: otherUserId,
          similarity,
        });
      }
    }

    // 按相似度降序排序
    userSimilarities.sort((a, b) => b.similarity - a.similarity);

    // 取前topN个相似用户
    const topSimilarUsers = userSimilarities.slice(0, topN);

    // 计算推荐分数
    const recommendationScores: { [productId: number]: number } = {};
    const targetUserProducts = new Set(Object.keys(targetUserVector).map(Number));

    for (const similarUser of topSimilarUsers) {
      const similarUserVector = matrix[similarUser.id];
      const similarity = similarUser.similarity;

      // 遍历相似用户喜欢的商品
      for (const productId of Object.keys(similarUserVector).map(Number)) {
        // 排除目标用户已经交互过的商品
        if (targetUserProducts.has(productId)) continue;

        // 累加推荐分数：相似度 × 用户对该商品的评分
        if (!recommendationScores[productId]) {
          recommendationScores[productId] = 0;
        }

        recommendationScores[productId] += similarity * similarUserVector[productId];
      }
    }

    // 转换为推荐结果数组并排序
    const recommendations: RecommendationResult[] = Object.keys(recommendationScores)
      .map(Number)
      .map((productId) => ({
        productId,
        score: recommendationScores[productId],
        reason: `基于用户协同过滤`,
      }))
      .sort((a, b) => b.score - a.score);

    return recommendations;
  }

  /**
   * 基于物品的协同过滤（ItemCF）
   * 算法原理：找到与用户喜欢的商品相似的商品进行推荐
   * 时间复杂度：O(m²×n)，m为商品数，n为用户数
   */
  async itemBasedCF(
    userId: number,
    topN: number = 50,
    minSimilarity: number = 0.1,
  ): Promise<RecommendationResult[]> {
    const matrix = await this.buildUserItemMatrix();
    const targetUserVector = matrix[userId];

    if (!targetUserVector || Object.keys(targetUserVector).length === 0) {
      return []; // 用户无行为数据，返回空
    }

    // 构建物品-用户矩阵（转置矩阵）
    const itemUserMatrix: { [productId: number]: { [userId: number]: number } } = {};
    const allUserIds = Object.keys(matrix).map(Number);

    for (const uid of allUserIds) {
      const userVector = matrix[uid];
      for (const productId of Object.keys(userVector).map(Number)) {
        if (!itemUserMatrix[productId]) {
          itemUserMatrix[productId] = {};
        }
        itemUserMatrix[productId][uid] = userVector[productId];
      }
    }

    // 获取目标用户喜欢的商品
    const userLikedProducts = Object.keys(targetUserVector).map(Number);
    const recommendationScores: { [productId: number]: number } = {};
    const userProductsSet = new Set(userLikedProducts);

    // 获取所有商品ID
    const allProductIds = Object.keys(itemUserMatrix).map(Number);

    // 对用户喜欢的每个商品，找到相似的商品
    for (const likedProductId of userLikedProducts) {
      const likedProductVector = itemUserMatrix[likedProductId];
      if (!likedProductVector) continue;

      const userRating = targetUserVector[likedProductId]; // 用户对该商品的评分

      // 计算与其他商品的相似度
      for (const otherProductId of allProductIds) {
        // 排除用户已经交互过的商品
        if (userProductsSet.has(otherProductId)) continue;

        const otherProductVector = itemUserMatrix[otherProductId];
        if (!otherProductVector) continue;

        // 计算商品相似度
        const similarity = this.cosineSimilarity(likedProductVector, otherProductVector);

        if (similarity >= minSimilarity) {
          // 累加推荐分数：用户评分 × 商品相似度
          if (!recommendationScores[otherProductId]) {
            recommendationScores[otherProductId] = 0;
          }

          recommendationScores[otherProductId] += userRating * similarity;
        }
      }
    }

    // 转换为推荐结果数组并排序
    const recommendations: RecommendationResult[] = Object.keys(recommendationScores)
      .map(Number)
      .map((productId) => ({
        productId,
        score: recommendationScores[productId],
        reason: `基于物品协同过滤`,
      }))
      .sort((a, b) => b.score - a.score);

    return recommendations;
  }

  /**
   * 混合推荐：结合UserCF和ItemCF
   */
  async hybridCF(
    userId: number,
    userCFWeight: number = 0.6,
    itemCFWeight: number = 0.4,
    topN: number = 50,
  ): Promise<RecommendationResult[]> {
    // 并行计算两种推荐结果
    const [userCFResults, itemCFResults] = await Promise.all([
      this.userBasedCF(userId, topN * 2, 0.1),
      this.itemBasedCF(userId, topN * 2, 0.1),
    ]);

    // 合并推荐结果
    const combinedScores: { [productId: number]: number } = {};

    // 添加UserCF结果
    for (const result of userCFResults) {
      if (!combinedScores[result.productId]) {
        combinedScores[result.productId] = 0;
      }
      combinedScores[result.productId] += result.score * userCFWeight;
    }

    // 添加ItemCF结果
    for (const result of itemCFResults) {
      if (!combinedScores[result.productId]) {
        combinedScores[result.productId] = 0;
      }
      combinedScores[result.productId] += result.score * itemCFWeight;
    }

    // 转换为推荐结果并排序
    const recommendations: RecommendationResult[] = Object.keys(combinedScores)
      .map(Number)
      .map((productId) => ({
        productId,
        score: combinedScores[productId],
        reason: `混合推荐（UserCF ${userCFWeight} + ItemCF ${itemCFWeight}）`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);

    return recommendations;
  }

  /**
   * 记录用户行为（用于构建推荐模型）
   */
  async recordBehavior(
    userId: number,
    productId: number,
    behaviorType: string,
  ): Promise<void> {
    const behavior = this.behaviorRepository.create({
      userId,
      productId,
      behaviorType,
      behaviorValue: this.BEHAVIOR_WEIGHTS[behaviorType] || 1.0,
    });

    await this.behaviorRepository.save(behavior);
  }
}
