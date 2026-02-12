import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  /**
   * 创建优惠券（管理员）
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  /**
   * 获取可用优惠券列表（不需要登录）
   */
  @Get('available')
  async getAvailableCoupons() {
    return this.couponService.getAvailableCoupons();
  }

  /**
   * 领取优惠券（需要登录）
   */
  @Post(':id/receive')
  @UseGuards(JwtAuthGuard)
  async receiveCoupon(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.couponService.receiveCoupon(user.id, +id);
  }

  /**
   * 获取用户优惠券列表（需要登录）
   */
  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserCoupons(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.couponService.getUserCoupons(user.id, status);
  }

  /**
   * 使用优惠券（需要登录）
   */
  @Post(':id/use')
  @UseGuards(JwtAuthGuard)
  async useCoupon(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { orderId: number },
  ) {
    await this.couponService.useCoupon(user.id, +id, body.orderId);
    return { message: '使用成功' };
  }

  /**
   * 获取所有优惠券（管理员）
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllCoupons() {
    return this.couponService.getAllCoupons();
  }

  /**
   * 更新优惠券（管理员）
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateCouponDto>,
  ) {
    return this.couponService.update(+id, updateData);
  }

  /**
   * 删除优惠券（管理员）
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.couponService.remove(+id);
    return { message: '删除成功' };
  }
}
