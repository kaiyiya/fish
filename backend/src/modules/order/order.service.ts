import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { Product } from '../../database/entities/product.entity';
import { Address } from '../../database/entities/address.entity';
import { CreateOrderDto } from './dto/create-order.dto';

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
  ) {}

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

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = status;
    return this.orderRepository.save(order);
  }
}
