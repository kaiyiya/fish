import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('recognition')
  getRecognitionStats(@Query() query: any) {
    return this.statisticsService.getRecognitionStats(query);
  }

  @Get('recommendation')
  getRecommendationStats(@Query() query: any) {
    return this.statisticsService.getRecommendationStats(query);
  }

  @Get('sales')
  getSalesStats(@Query() query: any) {
    return this.statisticsService.getSalesStats(query);
  }
}
