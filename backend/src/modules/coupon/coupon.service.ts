import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Coupon } from '../../database/entities/coupon.entity';
import { UserCoupon } from '../../database/entities/user-coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(UserCoupon)
    private userCouponRepository: Repository<UserCoupon>,
  ) {}

  /**
   * 创建优惠券（管理员）
   */
  async create(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const coupon = this.couponRepository.create(createCouponDto);
    return this.couponRepository.save(coupon);
  }

  /**
   * 获取可用优惠券列表（用户）
   */
  async getAvailableCoupons(userId?: number): Promise<Coupon[]> {
    const now = new Date();
    return this.couponRepository.find({
      where: {
        isActive: true,
        startTime: LessThan(now),
        endTime: MoreThan(now),
      },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 领取优惠券
   */
  async receiveCoupon(userId: number, couponId: number): Promise<UserCoupon> {
    // 检查优惠券是否存在且可用
    const coupon = await this.couponRepository.findOne({
      where: { id: couponId, isActive: true },
    });

    if (!coupon) {
      throw new NotFoundException('优惠券不存在或已失效');
    }

    // 检查是否在有效期内
    const now = new Date();
    if (coupon.startTime && now < coupon.startTime) {
      throw new BadRequestException('优惠券尚未开始');
    }
    if (coupon.endTime && now > coupon.endTime) {
      throw new BadRequestException('优惠券已过期');
    }

    // 检查是否还有剩余数量
    if (coupon.totalCount > 0 && coupon.usedCount >= coupon.totalCount) {
      throw new BadRequestException('优惠券已领完');
    }

    // 检查用户是否已领取过
    const existing = await this.userCouponRepository.findOne({
      where: { userId, couponId, status: 'unused' },
    });

    if (existing) {
      throw new BadRequestException('您已领取过该优惠券');
    }

    // 检查用户领取数量限制
    const userCouponCount = await this.userCouponRepository.count({
      where: { userId, couponId },
    });

    if (userCouponCount >= coupon.limitPerUser) {
      throw new BadRequestException('已达到领取上限');
    }

    // 创建用户优惠券记录
    const userCoupon = this.userCouponRepository.create({
      userId,
      couponId,
      status: 'unused',
    });

    // 更新优惠券已使用数量
    coupon.usedCount += 1;
    await this.couponRepository.save(coupon);

    return this.userCouponRepository.save(userCoupon);
  }

  /**
   * 获取用户优惠券列表
   */
  async getUserCoupons(userId: number, status?: string): Promise<UserCoupon[]> {
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    return this.userCouponRepository.find({
      where,
      relations: ['coupon'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 使用优惠券
   */
  async useCoupon(userId: number, userCouponId: number, orderId: number): Promise<void> {
    const userCoupon = await this.userCouponRepository.findOne({
      where: { id: userCouponId, userId, status: 'unused' },
      relations: ['coupon'],
    });

    if (!userCoupon) {
      throw new NotFoundException('优惠券不存在或已使用');
    }

    // 检查是否过期
    const now = new Date();
    if (userCoupon.coupon.endTime && now > userCoupon.coupon.endTime) {
      userCoupon.status = 'expired';
      await this.userCouponRepository.save(userCoupon);
      throw new BadRequestException('优惠券已过期');
    }

    userCoupon.status = 'used';
    userCoupon.orderId = orderId;
    userCoupon.usedAt = now;
    await this.userCouponRepository.save(userCoupon);
  }

  /**
   * 计算优惠金额
   */
  calculateDiscount(coupon: Coupon, totalAmount: number): number {
    // 检查最低使用金额
    if (coupon.minAmount && totalAmount < coupon.minAmount) {
      return 0;
    }

    switch (coupon.type) {
      case 'discount':
        // 折扣：value 是折扣率（如 0.9 表示 9 折）
        return totalAmount * (1 - coupon.value);
      case 'reduce':
        // 满减：value 是减免金额
        return coupon.value;
      case 'free':
        // 免运费：这里假设运费是固定的，可以根据实际情况调整
        return 0; // 或者返回运费金额
      default:
        return 0;
    }
  }

  /**
   * 获取所有优惠券（管理员）
   */
  async getAllCoupons(): Promise<Coupon[]> {
    return this.couponRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 更新优惠券（管理员）
   */
  async update(id: number, updateData: Partial<CreateCouponDto>): Promise<Coupon> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('优惠券不存在');
    }

    Object.assign(coupon, updateData);
    return this.couponRepository.save(coupon);
  }

  /**
   * 删除优惠券（管理员）
   */
  async remove(id: number): Promise<void> {
    const result = await this.couponRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('优惠券不存在');
    }
  }
}
