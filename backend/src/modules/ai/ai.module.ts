import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { RecognitionService } from './recognition.service';
import { RecommendationService } from './recommendation.service';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageRecognition, RecommendationLog]),
  ],
  controllers: [AiController],
  providers: [AiService, RecognitionService, RecommendationService],
  exports: [AiService, RecognitionService, RecommendationService],
})
export class AiModule {}
