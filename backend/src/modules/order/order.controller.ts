import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(user.id, createOrderDto);
  }

  /**
   * 用户模拟支付：不接入第三方支付，只把订单状态更新为 paid，并写入支付日志。
   */
  @Post(':id/pay/simulate')
  async simulatePayment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orderService.simulatePayment(user.id, +id);
  }

  /**
   * 用户取消订单（仅待支付可取消）
   */
  @Post(':id/cancel')
  async cancelForUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.orderService.cancelForUser(user.id, +id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAllAdmin() {
    return this.orderService.findAll();
  }

  @Get('admin/user/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findByUserAdmin(@Param('userId') userId: string) {
    return this.orderService.findByUserAdmin(+userId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.orderService.findByUser(user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.orderService.updateStatus(+id, body.status, user?.id ?? null);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Get('admin/export')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async exportOrders(@Res() res: any) {
    return this.orderService.exportToExcel(res);
  }
}
