import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { Product } from '../../database/entities/product.entity';
import { Address } from '../../database/entities/address.entity';
import { PaymentLog } from '../../database/entities/payment-log.entity';
import { OrderStatusHistory } from '../../database/entities/order-status-history.entity';
import { OrderShippingSnapshot } from '../../database/entities/order-shipping-snapshot.entity';
import { OrderCreationLog } from '../../database/entities/order-creation-log.entity';
import { NotificationModule } from '../notification/notification.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      UserBehavior,
      Product,
      Address,
      PaymentLog,
      OrderStatusHistory,
      OrderShippingSnapshot,
      OrderCreationLog,
    ]),
    NotificationModule,
    WalletModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
