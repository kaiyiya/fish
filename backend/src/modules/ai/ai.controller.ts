import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { RecognitionService } from './recognition.service';
import { RecommendationService } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly recognitionService: RecognitionService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Post('recognize')
  @UseGuards(JwtAuthGuard)
  async recognize(@CurrentUser() user: any, @Body() body: { imageUrl: string }) {
    return this.recognitionService.recognize(user.id, body.imageUrl);
  }

  @Get('recommend')
  @UseGuards(JwtAuthGuard)
  async recommend(
    @CurrentUser() user: any,
    @Query('type') type: string = 'personalized',
  ) {
    return this.recommendationService.getRecommendations(user.id, type);
  }
}
