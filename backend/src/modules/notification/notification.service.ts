import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  /**
   * 创建通知
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  /**
   * 批量创建通知（给多个用户）
   */
  async createBatch(userIds: number[], createNotificationDto: Omit<CreateNotificationDto, 'userId'>): Promise<Notification[]> {
    const notifications = userIds.map(userId => 
      this.notificationRepository.create({
        ...createNotificationDto,
        userId,
      })
    );
    return this.notificationRepository.save(notifications);
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(
    userId: number,
    isRead?: boolean,
    type?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    if (type) {
      where.type = type;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { notifications, total };
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  /**
   * 标记所有通知为已读
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  /**
   * 删除通知
   */
  async remove(userId: number, notificationId: number): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (!result.affected) {
      throw new NotFoundException('通知不存在');
    }
  }

  /**
   * 清空所有通知
   */
  async clearAll(userId: number): Promise<void> {
    await this.notificationRepository.delete({ userId });
  }
}
