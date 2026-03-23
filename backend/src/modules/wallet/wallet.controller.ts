import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WalletService } from './wallet.service';
import { CreateRechargeDto } from './dto/create-recharge.dto';

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
}

