import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 保存上传的文件
   */
  async saveFile(file: Express.Multer.File): Promise<{ filename: string; url: string }> {
    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // 保存文件
    fs.writeFileSync(filepath, file.buffer);

    // 返回文件信息（使用完整URL）
    return {
      filename,
      url: `${this.baseUrl}/uploads/${filename}`,
    };
  }

  /**
   * 验证文件类型
   */
  validateFileType(mimetype: string): boolean {
    const allowedTypes = this.configService
      .get('ALLOWED_FILE_TYPES', 'jpg,jpeg,png')
      .split(',');
    const fileExt = mimetype.split('/')[1];
    return allowedTypes.includes(fileExt);
  }

  /**
   * 验证文件大小
   */
  validateFileSize(size: number): boolean {
    const maxSize = this.configService.get('MAX_FILE_SIZE', 5242880); // 默认5MB
    return size <= maxSize;
  }
}
