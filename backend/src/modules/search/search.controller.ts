import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('keyword') keyword: string,
    @Query('type') type: string = 'keyword',
    @CurrentUser() user?: any,
  ) {
    return this.searchService.search(keyword, type, user?.id);
  }

  @Get('hot')
  getHotKeywords(@Query('limit') limit: string = '10') {
    return this.searchService.getHotKeywords(Number(limit));
  }
}
