import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { SearchLog } from '../../database/entities/search-log.entity';

@Injectable()
export class SearchService {
  constructor(
    private productService: ProductService,
    @InjectRepository(SearchLog)
    private searchLogRepository: Repository<SearchLog>,
  ) {}

  async search(keyword: string, type: string = 'keyword', userId?: number) {
    if (!keyword || keyword.trim() === '') {
      return [];
    }

    // 执行搜索
    let results;
    if (type === 'semantic') {
      // TODO: 实现语义搜索
      results = await this.productService.findAll({ keyword });
    } else {
      // 关键词搜索
      results = await this.productService.findAll({ keyword });
    }

    // 记录搜索日志
    const searchLog = this.searchLogRepository.create({
      userId: userId || null,
      keyword: keyword.trim(),
      searchType: type,
      resultCount: results.length,
    });
    await this.searchLogRepository.save(searchLog);

    return results;
  }

  /**
   * 获取热门搜索关键词
   */
  async getHotKeywords(limit: number = 10) {
    const hotKeywords = await this.searchLogRepository
      .createQueryBuilder('log')
      .select('log.keyword', 'keyword')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.keyword')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return hotKeywords.map((item) => ({
      keyword: item.keyword,
      count: Number(item.count),
    }));
  }
}
