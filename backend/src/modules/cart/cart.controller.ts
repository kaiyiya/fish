import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * 添加商品到购物车
   */
  @Post()
  async addToCart(
    @CurrentUser() user: any,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(
      user.id,
      addToCartDto.productId,
      addToCartDto.quantity || 1,
    );
  }

  /**
   * 获取购物车列表
   */
  @Get()
  async getCartList(@CurrentUser() user: any) {
    return this.cartService.getCartList(user.id);
  }

  /**
   * 获取购物车商品总数
   */
  @Get('count')
  async getCartCount(@CurrentUser() user: any) {
    const count = await this.cartService.getCartCount(user.id);
    return { count };
  }

  /**
   * 更新购物车商品数量
   */
  @Patch(':id')
  async updateCartItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(user.id, +id, updateCartDto.quantity);
  }

  /**
   * 删除购物车商品
   */
  @Delete(':id')
  async removeCartItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.cartService.removeCartItem(user.id, +id);
    return { message: '删除成功' };
  }

  /**
   * 清空购物车
   */
  @Delete()
  async clearCart(@CurrentUser() user: any) {
    await this.cartService.clearCart(user.id);
    return { message: '清空成功' };
  }
}
