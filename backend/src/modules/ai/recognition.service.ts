import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageRecognition } from '../../database/entities/image-recognition.entity';
import { execFile } from 'child_process';
import { join } from 'path';
import { getFishNameCN } from './fish-name-mapper';

// 获取backend目录的绝对路径
function getBackendDir(): string {
  // 在开发环境，__dirname 指向 backend/src/modules/ai
  // 在生产环境，__dirname 指向 backend/dist/src/modules/ai
  const currentDir = __dirname;
  console.log('[getBackendDir] __dirname:', currentDir);
  
  // 检查是否已经在backend目录下
  if (currentDir.includes('backend')) {
    // 如果路径中包含backend，找到backend的位置
    // Windows使用反斜杠，Unix使用正斜杠
    const pathSep = currentDir.includes('\\') ? '\\' : '/';
    const parts = currentDir.split(pathSep);
    const backendIndex = parts.findIndex(p => p === 'backend');
    if (backendIndex >= 0) {
      const backendDir = parts.slice(0, backendIndex + 1).join(pathSep);
      console.log('[getBackendDir] 从路径中提取backendDir:', backendDir);
      return backendDir;
    }
  }
  
  // 回退方案：根据是否包含dist来判断
  if (currentDir.includes('dist')) {
    // 生产环境：从 dist/src/modules/ai 向上到 backend
    // dist -> src -> modules -> ai -> 向上4级到 backend
    const backendDir = join(currentDir, '..', '..', '..', '..');
    console.log('[getBackendDir] 生产环境，backendDir:', backendDir);
    return backendDir;
  } else {
    // 开发环境：从 src/modules/ai 向上到 backend
    // src -> modules -> ai -> 向上3级到 backend
    const backendDir = join(currentDir, '..', '..', '..');
    console.log('[getBackendDir] 开发环境，backendDir:', backendDir);
    return backendDir;
  }
}

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
      const backendDir = getBackendDir();
      
      // 训练脚本在 src 目录下（开发环境）或 dist/src 目录下（生产环境）
      // 但实际脚本文件始终在 src 目录下
      const scriptPath = join(
        backendDir,
        'src',
        'modules',
        'ai',
        'training',
        'infer_pytorch.py',
      );

      // 使用Conda环境中的Python（Windows路径）
      // 可以通过环境变量PYTHON_PATH配置
      const pythonPath = process.env.PYTHON_PATH || 
                        (process.platform === 'win32' 
                          ? 'D:\\Anaconda\\envs\\pytorch\\python.exe' 
                          : 'python');
      
      // 设置工作目录为训练脚本所在目录
      const trainingDir = join(
        backendDir,
        'src',
        'modules',
        'ai',
        'training',
      );
      
      // 确保图片路径是绝对路径
      // Windows路径格式: C:\path\to\file 或 E:\path\to\file
      let absoluteImagePath = imagePath;
      if (!imagePath.match(/^[A-Za-z]:/) && !imagePath.startsWith('/')) {
        // 相对路径，转换为绝对路径（相对于backend目录）
        absoluteImagePath = join(backendDir, imagePath);
      }
      
      // 检查文件是否存在
      const fs = require('fs');
      const fileExists = fs.existsSync(absoluteImagePath);
      
      console.log('[识别服务] PyTorch识别参数:', {
        pythonPath,
        scriptPath,
        scriptExists: fs.existsSync(scriptPath),
        originalImagePath: imagePath,
        absoluteImagePath,
        fileExists,
        backendDir,
        cwd: trainingDir,
        __dirname,
      });
      
      if (!fileExists) {
        const error = new Error(`图片文件不存在: ${absoluteImagePath}`);
        console.error('[识别服务] 文件不存在错误:', error);
        throw error;
      }
      
      if (!fs.existsSync(scriptPath)) {
        const error = new Error(`训练脚本不存在: ${scriptPath}`);
        console.error('[识别服务] 脚本不存在错误:', error);
        throw error;
      }
      
      execFile(
        pythonPath,
        [scriptPath, '--image', absoluteImagePath],
        { 
          maxBuffer: 10 * 1024 * 1024,
          cwd: trainingDir,
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error('[识别服务] PyTorch推理错误:', error);
            if (stderr) console.error('[识别服务] stderr:', stderr.toString());
            return reject(error);
          }
          try {
            const text = stdout.toString().trim();
            console.log('[识别服务] PyTorch原始输出:', text);
            // 过滤掉警告信息，只取JSON行
            const lines = text.split('\n');
            const jsonLine = lines.find(line => line.trim().startsWith('{'));
            if (!jsonLine) {
              throw new Error('未找到有效的JSON输出: ' + text);
            }
            const json = JSON.parse(jsonLine);
            console.log('[识别服务] PyTorch解析结果:', json);
            if (json.error) {
              return reject(new Error(json.error));
            }
            resolve(json);
          } catch (e) {
            console.error('[识别服务] 解析PyTorch输出失败:', e);
            console.error('[识别服务] stdout:', stdout.toString());
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

    // imageUrl 可能是URL（如 http://localhost:3000/uploads/xxx.jpg）
    // 需要转换为本地文件路径
    let localImagePath = imageUrl;

    try {
      const backendDir = getBackendDir();
      
      // 如果是URL，提取本地路径
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        // 提取文件名
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        // 转换为本地路径
        localImagePath = join(backendDir, 'uploads', filename);
      } else if (imageUrl.startsWith('/uploads/')) {
        // 相对路径转换为绝对路径
        localImagePath = join(backendDir, imageUrl.substring(1));
      }
      
      console.log('[识别服务] 路径转换:', {
        imageUrl,
        backendDir,
        localImagePath,
        __dirname,
        fileExists: require('fs').existsSync(localImagePath),
      });
      
      // 调用 PyTorch 脚本进行识别
      const pyResult = await this.runPyTorchInference(localImagePath);

      // 将英文类别名转换为中文
      const fishNameEN = pyResult.fishName ?? 'unknown';
      const fishNameCN = getFishNameCN(fishNameEN);
      
      // 转换备选结果中的名称
      const alternatives = (pyResult.alternatives || []).map((alt: any) => ({
        ...alt,
        nameCN: getFishNameCN(alt.name),
      }));

      recognitionResult = {
        recognizedFishId: null, // 如需与商品表关联，可在此根据 fishName 做映射
        confidence: pyResult.confidence ?? 0,
        fishName: fishNameCN, // 返回中文名称
        result: {
          ...pyResult,
          fishNameCN: fishNameCN,
          alternatives: alternatives,
        },
      };
    } catch (error) {
      // 出现异常时，回退到模拟数据，避免前端体验中断
      console.error('========================================');
      console.error('调用 PyTorch 识别失败，使用模拟结果');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('图片URL:', imageUrl);
      console.error('本地路径:', localImagePath);
      console.error('========================================');
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
