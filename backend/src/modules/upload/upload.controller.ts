import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // 验证文件类型
    if (!this.uploadService.validateFileType(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型，仅支持 jpg、jpeg、png');
    }

    // 验证文件大小
    if (!this.uploadService.validateFileSize(file.size)) {
      throw new BadRequestException('文件大小超过限制（最大5MB）');
    }

    const result = await this.uploadService.saveFile(file);
    return {
      success: true,
      data: result,
    };
  }
}
