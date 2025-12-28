import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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
}
