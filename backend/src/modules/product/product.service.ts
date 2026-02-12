import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { Category } from '../../database/entities/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(UserBehavior)
    private behaviorRepository: Repository<UserBehavior>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // 如果提供了分类ID，验证分类是否存在
    if (createProductDto.categoryId !== undefined && createProductDto.categoryId !== null) {
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`分类ID ${createProductDto.categoryId} 不存在，请先创建该分类`);
      }
    }

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

    // 如果更新了分类ID，验证分类是否存在（如果提供了分类ID）
    if (data.categoryId !== undefined && data.categoryId !== null) {
      const category = await this.categoryRepository.findOne({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new BadRequestException(`分类ID ${data.categoryId} 不存在，请先创建该分类`);
      }
    } else if (data.categoryId === null) {
      // 允许设置为 null（清空分类）
      data.categoryId = null;
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
