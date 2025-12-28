import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
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

    return this.findOne(savedOrder.id);
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }
}
