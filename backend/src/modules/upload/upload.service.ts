import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ filename: string; url: string }> {
    const extFromName = path.extname(file.originalname || '');
    const extFromMime = this.getExtensionFromMime(file.mimetype);
    const ext = extFromName || extFromMime || '.png';
    const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      filename,
      url: `/uploads/${filename}`,
    };
  }

  private getExtensionFromMime(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/heic': '.heic',
      'image/heif': '.heif',
    };

    return map[mimetype] || '';
  }

  validateFileType(mimetype: string): boolean {
    if (!mimetype) return true;

    const allowedTypes = this.configService
      .get('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,webp,heic,heif')
      .split(',')
      .map((item) => item.trim().toLowerCase());

    const fileExt = mimetype.split('/')[1]?.toLowerCase();
    return !!fileExt && allowedTypes.includes(fileExt);
  }

  validateFileSize(size: number): boolean {
    const maxSize = this.configService.get('MAX_FILE_SIZE', 5242880);
    return size <= maxSize;
  }
}
