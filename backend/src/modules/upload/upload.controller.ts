import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!this.uploadService.validateFileType(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型，仅支持 jpg、jpeg、png、webp、heic、heif');
    }

    if (!this.uploadService.validateFileSize(file.size)) {
      throw new BadRequestException('文件大小超过限制（最大5MB）');
    }

    if (!file.originalname && !file.mimetype) {
      throw new BadRequestException('无法识别上传文件类型');
    }

    return await this.uploadService.saveFile(file);
  }
}
