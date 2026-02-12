import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { Product } from '../../database/entities/product.entity';
import { User } from '../../database/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  /**
   * 创建评价
   */
  async create(userId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    // 验证商品是否存在
    const product = await this.productRepository.findOne({ 
      where: { id: createReviewDto.productId } 
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 验证评分范围
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('评分必须在1-5之间');
    }

    // 检查是否已评价过（同一用户对同一商品只能评价一次）
    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: createReviewDto.productId },
    });

    if (existing) {
      throw new BadRequestException('您已经评价过该商品');
    }

    const review = this.reviewRepository.create({
      userId,
      ...createReviewDto,
    });

    const savedReview = await this.reviewRepository.save(review);

    // 发送评价通知给管理员
    try {
      const adminUsers = await this.userRepository.find({
        where: { role: 'admin' },
      });

      if (adminUsers.length > 0) {
        const userIds = adminUsers.map(u => u.id);
        await this.notificationService.createBatch(userIds, {
          type: 'review',
          title: '收到新评价',
          content: `商品 ${product.name} 收到了一条新评价，评分：${createReviewDto.rating}星`,
          relatedId: savedReview.id,
        });
      }
    } catch (error) {
      // 通知发送失败不影响评价创建
      console.error('发送评价通知失败:', error);
    }

    return savedReview;
  }

  /**
   * 获取商品评价列表
   */
  async getProductReviews(productId: number, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number }> {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { productId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { reviews, total };
  }

  /**
   * 获取用户评价列表
   */
  async getUserReviews(userId: number): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 获取商品平均评分
   */
  async getProductRating(productId: number): Promise<{ average: number; count: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0', 10),
    };
  }

  /**
   * 删除评价
   */
  async remove(userId: number, reviewId: number): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new NotFoundException('评价不存在或无权限删除');
    }

    await this.reviewRepository.remove(review);
  }

  /**
   * 标记评价为有用
   */
  async markHelpful(reviewId: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    review.helpfulCount += 1;
    return this.reviewRepository.save(review);
  }
}
