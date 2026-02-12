import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { RecognitionService } from './recognition.service';
import { RecommendationService } from './recommendation.service';
import { ChatService } from './chat.service';
import { CollaborativeFilteringService } from './algorithms/collaborative-filtering.service';
import { ContentBasedService } from './algorithms/content-based.service';
import { PopularityBasedService } from './algorithms/popularity-based.service';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { RecommendationLog } from '../../database/entities/recommendation-log.entity';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { Product } from '../../database/entities/product.entity';
import { Category } from '../../database/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImageRecognition,
      RecommendationLog,
      UserBehavior,
      Product,
      Category,
    ]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    RecognitionService,
    RecommendationService,
    ChatService,
    CollaborativeFilteringService,
    ContentBasedService,
    PopularityBasedService,
  ],
  exports: [
    AiService,
    RecognitionService,
    RecommendationService,
    CollaborativeFilteringService,
  ],
})
export class AiModule { }
