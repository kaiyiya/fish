import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('keyword') keyword: string, @Query('type') type: string = 'keyword') {
    return this.searchService.search(keyword, type);
  }
}
