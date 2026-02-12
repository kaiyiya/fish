import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../database/entities/favorite.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * 添加收藏
   */
  async addFavorite(userId: number, productId: number): Promise<Favorite> {
    // 验证商品是否存在
    const product = await this.productRepository.findOne({ 
      where: { id: productId } 
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 检查是否已收藏
    const existing = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });

    if (existing) {
      return existing; // 已收藏，直接返回
    }

    const favorite = this.favoriteRepository.create({
      userId,
      productId,
    });

    return this.favoriteRepository.save(favorite);
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: number, productId: number): Promise<void> {
    const result = await this.favoriteRepository.delete({ userId, productId });
    if (!result.affected) {
      throw new NotFoundException('收藏不存在');
    }
  }

  /**
   * 获取用户收藏列表
   */
  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * 检查是否已收藏
   */
  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, productId },
    });
    return !!favorite;
  }

  /**
   * 获取收藏数量
   */
  async getFavoriteCount(productId: number): Promise<number> {
    return this.favoriteRepository.count({
      where: { productId },
    });
  }
}
