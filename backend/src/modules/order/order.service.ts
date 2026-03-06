import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as Excel from 'exceljs';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { Product } from '../../database/entities/product.entity';
import { Address } from '../../database/entities/address.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(UserBehavior)
    private behaviorRepository: Repository<UserBehavior>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private notificationService: NotificationService,
  ) { }

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // 验证地址是否存在且属于当前用户
    const address = await this.addressRepository.findOne({
      where: { id: createOrderDto.addressId, userId },
    });
    if (!address) {
      throw new NotFoundException('收货地址不存在');
    }

    // 验证商品库存并扣减
    const productIds = createOrderDto.items.map(item => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('部分商品不存在');
    }

    // 检查库存
    for (const item of createOrderDto.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new NotFoundException(`商品ID ${item.productId} 不存在`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`商品 ${product.name} 库存不足，当前库存：${product.stock}`);
      }
    }

    // 批量扣减库存（提高性能）
    for (const item of createOrderDto.items) {
      const product = products.find(p => p.id === item.productId);
      product.stock -= item.quantity;
    }
    await this.productRepository.save(products);

    // 生成订单号
    const orderNo = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = this.orderRepository.create({
      userId,
      orderNo,
      totalAmount: createOrderDto.totalAmount,
      addressId: createOrderDto.addressId,
      status: 'pending',
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderItems = createOrderDto.items.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      }),
    );

    await this.orderItemRepository.save(orderItems);

    // 记录用户购买行为（用于推荐算法）
    const behaviors = createOrderDto.items.map((item) =>
      this.behaviorRepository.create({
        userId,
        productId: item.productId,
        behaviorType: 'purchase',
        behaviorValue: 10.0, // 购买行为权重较高
      })
    );
    await this.behaviorRepository.save(behaviors);

    // 发送订单创建通知
    try {
      await this.notificationService.create({
        userId,
        type: 'order',
        title: '订单创建成功',
        content: `您的订单 ${orderNo} 已创建成功，订单金额：¥${createOrderDto.totalAmount}`,
        relatedId: savedOrder.id,
      });
    } catch (error) {
      // 通知发送失败不影响订单创建
      console.error('发送订单通知失败:', error);
    }

    return this.findOne(savedOrder.id);
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const oldStatus = order.status;
    order.status = status;
    const savedOrder = await this.orderRepository.save(order);

    // 发送订单状态变更通知
    if (oldStatus !== status) {
      try {
        const statusMessages = {
          pending: '待处理',
          paid: '已支付',
          shipped: '已发货',
          completed: '已完成',
          cancelled: '已取消',
        };

        const statusMessage = statusMessages[status] || status;
        await this.notificationService.create({
          userId: order.userId,
          type: 'order',
          title: `订单状态更新：${statusMessage}`,
          content: `您的订单 ${order.orderNo} 状态已更新为：${statusMessage}`,
          relatedId: order.id,
        });
      } catch (error) {
        // 通知发送失败不影响状态更新
        console.error('发送订单状态通知失败:', error);
      }
    }

    return savedOrder;
  }

  /**
   * 导出订单到 Excel
   */
  async exportToExcel(res: any) {
    // 获取所有订单数据
    const orders = await this.findAll();

    // 创建工作簿和工作表
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('订单列表');

    // 设置列头
    worksheet.columns = [
      { header: '订单号', key: 'orderNo', width: 25 },
      { header: '下单时间', key: 'created_at', width: 20 },
      { header: '用户 ID', key: 'userId', width: 10 },
      { header: '商品名称', key: 'productNames', width: 40 },
      { header: '商品数量', key: 'totalQuantity', width: 12 },
      { header: '订单金额', key: 'totalAmount', width: 12 },
      { header: '订单状态', key: 'status', width: 12 },
      { header: '收货人', key: 'receiverName', width: 15 },
      { header: '联系电话', key: 'receiverPhone', width: 15 },
      { header: '收货地址', key: 'fullAddress', width: 50 },
    ];

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 填充数据
    for (const order of orders) {
      // 获取收货地址信息
      const address = await this.addressRepository.findOne({ where: { id: order.addressId } });
      
      // 合并商品名称和数量
      const productNames = order.items.map(item => item.product?.name || '未知商品').join('; ');
      const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

      worksheet.addRow({
        orderNo: order.orderNo,
        created_at: new Date(order.created_at).toLocaleString('zh-CN'),
        userId: order.userId,
        productNames,
        totalQuantity,
        totalAmount: `¥${order.totalAmount}`,
        status: this.translateStatus(order.status),
        receiverName: address?.name || '-',
        receiverPhone: address?.phone || '-',
        fullAddress: this.buildFullAddress(address),
      });
    }

    // 设置所有列的对齐方式
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', wrapText: true };
      }
    });

    // 设置响应头，触发浏览器下载
    const fileName = `订单列表_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Disposition'
    );

    // 写入 Excel 到响应流
    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * 翻译订单状态
   */
  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      pending: '待处理',
      paid: '已支付',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
    };
    return statusMap[status] || status;
  }

  /**
   * 构建完整地址
   */
  private buildFullAddress(address: Address | null): string {
    if (!address) return '-';
    const parts = [
      address.province,
      address.city,
      address.district,
      address.detail,
    ].filter(Boolean);
    return parts.join(' ') || '-';
  }
}
