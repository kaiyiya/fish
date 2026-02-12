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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * 创建评价（需要登录）
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: any,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.create(user.id, createReviewDto);
  }

  /**
   * 获取商品评价列表（不需要登录）
   */
  @Get('product/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reviewService.getProductReviews(
      +productId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * 获取商品平均评分（不需要登录）
   */
  @Get('product/:productId/rating')
  async getProductRating(@Param('productId') productId: string) {
    return this.reviewService.getProductRating(+productId);
  }

  /**
   * 获取用户评价列表（需要登录）
   */
  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserReviews(@CurrentUser() user: any) {
    return this.reviewService.getUserReviews(user.id);
  }

  /**
   * 删除评价（需要登录）
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.reviewService.remove(user.id, +id);
    return { message: '删除成功' };
  }

  /**
   * 标记评价为有用（不需要登录）
   */
  @Post(':id/helpful')
  async markHelpful(@Param('id') id: string) {
    return this.reviewService.markHelpful(+id);
  }
}
