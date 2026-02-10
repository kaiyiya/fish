import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(ImageRecognition)
    private recognitionRepository: Repository<ImageRecognition>,
    @InjectRepository(RecommendationLog)
    private recommendationLogRepository: Repository<RecommendationLog>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 获取识别统计
   */
  async getRecognitionStats(query: any) {
    const { startDate, endDate } = query;

    // 总识别次数
    const totalRecognitions = await this.recognitionRepository.count();

    // 日期范围查询
    const queryBuilder = this.recognitionRepository.createQueryBuilder('recognition');
    if (startDate) {
      queryBuilder.andWhere('recognition.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('recognition.created_at <= :endDate', { endDate });
    }

    // 每日识别统计
    const dailyRecognitions = await queryBuilder
      .select('DATE(recognition.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(recognition.created_at)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    // 热门鱼类统计（识别次数最多的鱼类）
    const popularFishes = await this.recognitionRepository
      .createQueryBuilder('recognition')
      .select('recognition.recognizedFishId', 'fishId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('recognition.recognizedFishId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalRecognitions,
      dailyRecognitions,
      popularFishes,
    };
  }

  /**
   * 获取推荐统计
   */
  async getRecommendationStats(query: any) {
    const { startDate, endDate } = query;

    const queryBuilder = this.recommendationLogRepository.createQueryBuilder('log');
    if (startDate) {
      queryBuilder.andWhere('log.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('log.created_at <= :endDate', { endDate });
    }

    // 总推荐次数
    const totalRecommendations = await queryBuilder.getCount();

    // 点击率 = 点击次数 / 推荐次数
    const clickedCount = await queryBuilder
      .andWhere('log.clicked = :clicked', { clicked: true })
      .getCount();
    const clickRate = totalRecommendations > 0 ? clickedCount / totalRecommendations : 0;

    // 转化率 = 购买次数 / 推荐次数
    const purchasedCount = await queryBuilder
      .andWhere('log.purchased = :purchased', { purchased: true })
      .getCount();
    const conversionRate = totalRecommendations > 0 ? purchasedCount / totalRecommendations : 0;

    // 各算法性能统计
    const algorithmPerformance = await this.recommendationLogRepository
      .createQueryBuilder('log')
      .select('log.algorithmType', 'algorithm')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN log.clicked = 1 THEN 1 ELSE 0 END)', 'clicks')
      .addSelect('SUM(CASE WHEN log.purchased = 1 THEN 1 ELSE 0 END)', 'purchases')
      .groupBy('log.algorithmType')
      .getRawMany();

    return {
      totalRecommendations,
      clickRate: Number(clickRate.toFixed(4)),
      conversionRate: Number(conversionRate.toFixed(4)),
      algorithmPerformance: algorithmPerformance.map((item) => ({
        algorithm: item.algorithm,
        total: Number(item.total),
        clicks: Number(item.clicks),
        purchases: Number(item.purchases),
        clickRate: Number(item.total) > 0 ? Number(item.clicks) / Number(item.total) : 0,
        conversionRate: Number(item.total) > 0 ? Number(item.purchases) / Number(item.total) : 0,
      })),
    };
  }

  /**
   * 获取销售统计
   */
  async getSalesStats(query: any) {
    const { startDate, endDate } = query;

    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder.where('order.status != :status', { status: 'cancelled' });

    if (startDate) {
      queryBuilder.andWhere('order.created_at >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('order.created_at <= :endDate', { endDate });
    }

    // 总销售额
    const totalSalesResult = await queryBuilder
      .select('SUM(order.totalAmount)', 'total')
      .getRawOne();
    const totalSales = Number(totalSalesResult?.total || 0);

    // 每日销售统计
    const dailySales = await queryBuilder
      .select('DATE(order.created_at)', 'date')
      .addSelect('SUM(order.totalAmount)', 'amount')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(order.created_at)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    // 热销商品统计
    const topProducts = await this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .select('item.productId', 'productId')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.subtotal)', 'totalAmount')
      .where('order.status != :status', { status: 'cancelled' })
      .groupBy('item.productId')
      .orderBy('totalQuantity', 'DESC')
      .limit(10)
      .getRawMany();

    // 获取商品信息
    const productIds = topProducts.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: productIds.map((id) => ({ id })),
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProductsWithInfo = topProducts.map((item) => ({
      productId: item.productId,
      productName: productMap.get(item.productId)?.name || '未知商品',
      totalQuantity: Number(item.totalQuantity),
      totalAmount: Number(item.totalAmount),
    }));

    return {
      totalSales,
      dailySales: dailySales.map((item) => ({
        date: item.date,
        amount: Number(item.amount),
        count: Number(item.count),
      })),
      topProducts: topProductsWithInfo,
    };
  }
}
