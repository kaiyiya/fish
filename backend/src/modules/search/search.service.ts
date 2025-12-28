import { Injectable } from '@nestjs/common';
import { ProductService } from '../product/product.service';

@Injectable()
export class SearchService {
  constructor(private productService: ProductService) {}

  async search(keyword: string, type: string = 'keyword') {
    if (type === 'semantic') {
      // TODO: 实现语义搜索
      return this.productService.findAll({ keyword });
    }
    
    // 关键词搜索
    return this.productService.findAll({ keyword });
  }
}
