import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * 创建通知（管理员或系统）
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  /**
   * 获取用户通知列表（需要登录）
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(
    @CurrentUser() user: any,
    @Query('isRead') isRead?: string,
    @Query('type') type?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.notificationService.getUserNotifications(
      user.id,
      isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      type,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * 获取未读通知数量（需要登录）
   */
  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * 标记通知为已读（需要登录）
   */
  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(user.id, +id);
  }

  /**
   * 标记所有通知为已读（需要登录）
   */
  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationService.markAllAsRead(user.id);
    return { message: '已全部标记为已读' };
  }

  /**
   * 删除通知（需要登录）
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.notificationService.remove(user.id, +id);
    return { message: '删除成功' };
  }

  /**
   * 清空所有通知（需要登录）
   */
  @Delete()
  @UseGuards(JwtAuthGuard)
  async clearAll(@CurrentUser() user: any) {
    await this.notificationService.clearAll(user.id);
    return { message: '清空成功' };
  }
}
