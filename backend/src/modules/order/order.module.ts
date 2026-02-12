import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { Product } from '../../database/entities/product.entity';
import { Address } from '../../database/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, UserBehavior, Product, Address])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
