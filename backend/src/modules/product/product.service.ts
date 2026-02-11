import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UserBehavior } from '../../database/entities/user-behavior.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserBehavior)
    private behaviorRepository: Repository<UserBehavior>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(query: any): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    if (query.categoryId) {
      queryBuilder.where('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    
    if (query.keyword) {
      queryBuilder.andWhere('product.name LIKE :keyword', {
        keyword: `%${query.keyword}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({ where: { id } });
  }

  async update(id: number, data: any): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Product not found');
    }
  }

  /**
   * 记录用户浏览商品行为
   */
  async recordView(userId: number, productId: number): Promise<void> {
    // 检查是否已记录（避免重复记录）
    const existing = await this.behaviorRepository.findOne({
      where: {
        userId,
        productId,
        behaviorType: 'view',
      },
    });

    if (!existing) {
      const behavior = this.behaviorRepository.create({
        userId,
        productId,
        behaviorType: 'view',
        behaviorValue: 1.0,
      });
      await this.behaviorRepository.save(behavior);
    }
  }
}
