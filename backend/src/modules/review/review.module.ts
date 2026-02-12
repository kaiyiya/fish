import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from '../../database/entities/review.entity';
import { Product } from '../../database/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
