import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../database/entities/cart.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 添加商品到购物车
   */
  async addToCart(userId: number, productId: number, quantity: number = 1): Promise<Cart> {
    // 验证商品是否存在
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 检查库存
    if (product.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    // 检查购物车中是否已存在该商品
    const existingCart = await this.cartRepository.findOne({
      where: { userId, productId },
    });

    if (existingCart) {
      // 如果已存在，更新数量
      const newQuantity = existingCart.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('库存不足');
      }
      existingCart.quantity = newQuantity;
      return this.cartRepository.save(existingCart);
    } else {
      // 如果不存在，创建新记录
      const cart = this.cartRepository.create({
        userId,
        productId,
        quantity,
      });
      return this.cartRepository.save(cart);
    }
  }

  /**
   * 获取用户的购物车列表
   */
  async getCartList(userId: number): Promise<Cart[]> {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 更新购物车商品数量
   */
  async updateCartItem(userId: number, cartId: number, quantity: number): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId, userId },
      relations: ['product'],
    });

    if (!cart) {
      throw new NotFoundException('购物车商品不存在');
    }

    if (quantity <= 0) {
      throw new BadRequestException('数量必须大于0');
    }

    // 检查库存
    if (cart.product.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    cart.quantity = quantity;
    return this.cartRepository.save(cart);
  }

  /**
   * 删除购物车商品
   */
  async removeCartItem(userId: number, cartId: number): Promise<void> {
    const result = await this.cartRepository.delete({ id: cartId, userId });
    if (!result.affected) {
      throw new NotFoundException('购物车商品不存在');
    }
  }

  /**
   * 清空购物车
   */
  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  /**
   * 获取购物车商品总数
   */
  async getCartCount(userId: number): Promise<number> {
    const result = await this.cartRepository
      .createQueryBuilder('cart')
      .select('SUM(cart.quantity)', 'total')
      .where('cart.userId = :userId', { userId })
      .getRawOne();

    return parseInt(result?.total || '0', 10);
  }
}
