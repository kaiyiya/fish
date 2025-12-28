import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';

@Injectable()
export class RecognitionService {
  constructor(
    @InjectRepository(ImageRecognition)
    private recognitionRepository: Repository<ImageRecognition>,
  ) {}

  async recognize(userId: number, imageUrl: string) {
    // TODO: 调用AI模型进行图像识别
    // 这里先返回模拟数据
    const recognitionResult = {
      recognizedFishId: 1,
      confidence: 0.95,
      fishName: '三文鱼',
      result: {
        species: '三文鱼',
        confidence: 0.95,
        alternatives: [
          { name: '鲈鱼', confidence: 0.05 },
        ],
      },
    };

    // 保存识别记录
    const recognition = this.recognitionRepository.create({
      userId,
      imageUrl,
      recognizedFishId: recognitionResult.recognizedFishId,
      confidence: recognitionResult.confidence,
      recognitionResultJson: recognitionResult.result,
    });

    await this.recognitionRepository.save(recognition);

    return {
      ...recognitionResult,
      recognitionId: recognition.id,
    };
  }

  async getRecognitionHistory(userId: number) {
    return this.recognitionRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
      take: 20,
    });
  }
}
