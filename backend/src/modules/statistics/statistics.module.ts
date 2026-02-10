import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { Product } from '../../database/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImageRecognition,
      RecommendationLog,
      Order,
      OrderItem,
      Product,
    ]),
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
