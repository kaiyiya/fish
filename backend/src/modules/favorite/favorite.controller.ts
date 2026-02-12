import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /**
   * 添加收藏（需要登录）
   */
  @Post(':productId')
  @UseGuards(JwtAuthGuard)
  async addFavorite(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.favoriteService.addFavorite(user.id, +productId);
  }

  /**
   * 取消收藏（需要登录）
   */
  @Delete(':productId')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    await this.favoriteService.removeFavorite(user.id, +productId);
    return { message: '取消收藏成功' };
  }

  /**
   * 获取用户收藏列表（需要登录）
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserFavorites(@CurrentUser() user: any) {
    return this.favoriteService.getUserFavorites(user.id);
  }

  /**
   * 检查是否已收藏（需要登录）
   */
  @Get(':productId/check')
  @UseGuards(JwtAuthGuard)
  async isFavorite(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    const isFavorite = await this.favoriteService.isFavorite(user.id, +productId);
    return { isFavorite };
  }

  /**
   * 获取商品收藏数量（不需要登录）
   */
  @Get(':productId/count')
  async getFavoriteCount(@Param('productId') productId: string) {
    const count = await this.favoriteService.getFavoriteCount(+productId);
    return { count };
  }
}
