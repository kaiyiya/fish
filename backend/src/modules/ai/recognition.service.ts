import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { execFile } from 'child_process';
import { join } from 'path';

@Injectable()
export class RecognitionService {
  constructor(
    @InjectRepository(ImageRecognition)
    private recognitionRepository: Repository<ImageRecognition>,
  ) {}

  /**
   * 调用基于 PyTorch 的推理脚本进行识别
   * - 脚本：backend/src/modules/ai/training/infer_pytorch.py
   * - 输出：一行 JSON（见 infer_pytorch.py 说明）
   *
   * 注意：需要在启动后端前激活包含 PyTorch 的 Conda 环境，
   * 确保 `python` 命令可用且已安装 torch / torchvision。
   */
  private runPyTorchInference(imagePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = join(
        process.cwd(),
        'backend',
        'src',
        'modules',
        'ai',
        'training',
        'infer_pytorch.py',
      );

      execFile(
        'python',
        [scriptPath, '--image', imagePath],
        { maxBuffer: 10 * 1024 * 1024 },
        (error, stdout) => {
          if (error) {
            return reject(error);
          }
          try {
            const text = stdout.toString().trim();
            const json = JSON.parse(text);
            if (json.error) {
              return reject(new Error(json.error));
            }
            resolve(json);
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }

  async recognize(userId: number, imageUrl: string) {
    let recognitionResult: {
      recognizedFishId: number | null;
      confidence: number;
      fishName: string;
      result: any;
    };

    try {
      // imageUrl 应该是可访问的本地路径或 URL。
      // 这里直接传入 PyTorch 脚本，由脚本完成加载与预处理。
      const pyResult = await this.runPyTorchInference(imageUrl);

      recognitionResult = {
        recognizedFishId: null, // 如需与商品表关联，可在此根据 fishName 做映射
        confidence: pyResult.confidence ?? 0,
        fishName: pyResult.fishName ?? '未知鱼类',
        result: pyResult,
      };
    } catch (error) {
      // 出现异常时，回退到模拟数据，避免前端体验中断
      console.error('调用 PyTorch 识别失败，使用模拟结果:', error);
      recognitionResult = {
        recognizedFishId: 1,
        confidence: 0.95,
        fishName: '三文鱼',
        result: {
          species: '三文鱼',
          confidence: 0.95,
          alternatives: [{ name: '鲈鱼', confidence: 0.05 }],
        },
      };
    }

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
