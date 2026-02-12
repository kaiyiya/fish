import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { Coupon } from '../../database/entities/coupon.entity';
import { UserCoupon } from '../../database/entities/user-coupon.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, UserCoupon]),
    NotificationModule,
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
