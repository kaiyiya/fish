import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Product } from '../../database/entities/product.entity';
import { User } from '../../database/entities/user.entity';
import { Category } from '../../database/entities/category.entity';

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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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

  /**
   * 后台数据中心：月销量/金额汇总、用户消费偏好（按品类）、总用户数等
   */
  async getDataCenterStats(query: any) {
    const startDate = query?.startDate ? String(query.startDate) : undefined
    const endDate = query?.endDate ? String(query.endDate) : undefined
    const cancelledStatus = 'cancelled'

    const baseOrdersQb = this.orderRepository
      .createQueryBuilder('order')
      .where('order.status != :cancelledStatus', { cancelledStatus })

    if (startDate) baseOrdersQb.andWhere('order.created_at >= :startDate', { startDate })
    if (endDate) baseOrdersQb.andWhere('order.created_at <= :endDate', { endDate })

    const totalOrders = await baseOrdersQb.clone().getCount()
    const totalRevenueRaw = await baseOrdersQb
      .clone()
      .select('COALESCE(SUM(order.totalAmount), 0)', 'total')
      .getRawOne()
    const totalRevenue = Number(totalRevenueRaw?.total || 0)

    const monthlySalesRaw = await baseOrdersQb
      .clone()
      .select("DATE_FORMAT(order.created_at, '%Y-%m')", 'month')
      .addSelect('COALESCE(SUM(order.totalAmount), 0)', 'amount')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_FORMAT(order.created_at, '%Y-%m')")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany()

    const totalUsers = await this.userRepository.count()

    const topUsersRaw = await baseOrdersQb
      .clone()
      .select('order.userId', 'userId')
      .addSelect('SUM(order.totalAmount)', 'totalAmount')
      .addSelect('COUNT(*)', 'orderCount')
      .groupBy('order.userId')
      .orderBy('totalAmount', 'DESC')
      .limit(10)
      .getRawMany()

    const topUserIds = topUsersRaw
      .map((r) => Number(r.userId))
      .filter((id) => Number.isFinite(id))

    const users = topUserIds.length ? await this.userRepository.find({ where: { id: In(topUserIds as any) } }) : []
    const userMap = new Map(users.map((u) => [u.id, u]))

    // 每个Top用户：消费最多的品类（按品类金额最大）
    const userTopCategoryById: Record<number, { categoryId: number; totalAmount: number }> = {}
    if (topUserIds.length) {
      const categoryTotalsQb = this.orderItemRepository
        .createQueryBuilder('item')
        .leftJoin('item.order', 'order')
        .leftJoin('item.product', 'product')
        .select('order.userId', 'userId')
        .addSelect('product.categoryId', 'categoryId')
        .addSelect('SUM(item.subtotal)', 'totalAmount')
        .where('order.status != :cancelledStatus', { cancelledStatus })
        .andWhere('product.categoryId IS NOT NULL')
        .andWhere('order.userId IN (:...topUserIds)', { topUserIds })

      if (startDate) categoryTotalsQb.andWhere('order.created_at >= :startDate', { startDate })
      if (endDate) categoryTotalsQb.andWhere('order.created_at <= :endDate', { endDate })

      const rawRows = await categoryTotalsQb
        .groupBy('order.userId')
        .addGroupBy('product.categoryId')
        .orderBy('totalAmount', 'DESC')
        .getRawMany()

      for (const row of rawRows) {
        const uid = Number(row.userId)
        const cid = Number(row.categoryId)
        const ta = Number(row.totalAmount)
        if (!Number.isFinite(uid) || !Number.isFinite(cid)) continue

        const existing = userTopCategoryById[uid]
        if (!existing || ta > existing.totalAmount) {
          userTopCategoryById[uid] = { categoryId: cid, totalAmount: ta }
        }
      }
    }

    const categoryIds = Array.from(
      new Set(
        Object.values(userTopCategoryById)
          .map((x) => x.categoryId)
          .filter((id) => id > 0),
      ),
    )
    const categories = categoryIds.length ? await this.categoryRepository.find({ where: { id: In(categoryIds as any) } }) : []
    const categoryMap = new Map(categories.map((c) => [c.id, c]))

    const topUsers = topUsersRaw.map((r) => {
      const uid = Number(r.userId)
      const user = userMap.get(uid)
      const topCategory = userTopCategoryById[uid]
      const category = topCategory ? categoryMap.get(topCategory.categoryId) : undefined

      return {
        userId: uid,
        username: user?.username || `用户${uid}`,
        totalAmount: Number(r.totalAmount || 0),
        orderCount: Number(r.orderCount || 0),
        topCategoryId: topCategory?.categoryId || null,
        topCategoryName: category?.name || null,
      }
    })

    const topCategoriesQb = this.orderItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.order', 'order')
      .leftJoin('item.product', 'product')
      .select('product.categoryId', 'categoryId')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.subtotal)', 'totalAmount')
      .where('order.status != :cancelledStatus', { cancelledStatus })
      .andWhere('product.categoryId IS NOT NULL')

    if (startDate) topCategoriesQb.andWhere('order.created_at >= :startDate', { startDate })
    if (endDate) topCategoriesQb.andWhere('order.created_at <= :endDate', { endDate })

    const topCategoriesRaw = await topCategoriesQb
      .groupBy('product.categoryId')
      .orderBy('totalAmount', 'DESC')
      .limit(5)
      .getRawMany()

    const tcIds = topCategoriesRaw.map((r) => Number(r.categoryId)).filter((id) => id > 0)
    const tcList = tcIds.length ? await this.categoryRepository.find({ where: { id: In(tcIds as any) } }) : []
    const tcMap = new Map(tcList.map((c) => [c.id, c]))

    const topCategories = topCategoriesRaw.map((r) => ({
      categoryId: Number(r.categoryId),
      categoryName: tcMap.get(Number(r.categoryId))?.name || null,
      totalQuantity: Number(r.totalQuantity || 0),
      totalAmount: Number(r.totalAmount || 0),
    }))

    return {
      totalUsers,
      totalOrders,
      totalRevenue,
      monthlySales: monthlySalesRaw.map((m) => ({
        month: m.month,
        amount: Number(m.amount || 0),
        count: Number(m.count || 0),
      })),
      topUsers,
      topCategories,
    }
  }
}
