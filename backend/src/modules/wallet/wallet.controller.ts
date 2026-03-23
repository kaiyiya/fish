import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WalletService } from './wallet.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';
import { AdminRechargeDto } from './dto/admin-recharge.dto';
import { AdminRechargeByPhoneDto } from './dto/admin-recharge-by-phone.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  @Post('recharge/create')
  @UseGuards(JwtAuthGuard)
  createRechargeCode(@CurrentUser() user: any, @Body() dto: CreateRechargeDto) {
    return this.walletService.createRechargeCode(user.id, dto.amount);
  }

  // 扫码确认：演示模式下通过 token 直接完成充值，不依赖用户登录态。
  @Get('recharge/confirm')
  confirmRecharge(@Query('token') token: string) {
    return this.walletService.confirmRechargeByToken(token);
  }

  /**
   * 管理员手动给普通用户充值
   */
  @Post('admin/recharge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminRecharge(@Body() dto: AdminRechargeDto) {
    return this.walletService.adminRecharge(dto.userId, dto.amount);
  }

  /**
   * 管理员通过手机号给普通用户充值
   */
  @Post('admin/recharge/by-phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  adminRechargeByPhone(@Body() dto: AdminRechargeByPhoneDto) {
    return this.walletService.adminRechargeByPhone(dto.phone, dto.amount);
  }
}
