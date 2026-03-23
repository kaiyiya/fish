import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局异常过滤器，统一错误返回格式
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器，统一返回格式：{ code, data, message }
  app.useGlobalInterceptors(new TransformInterceptor());

  // 启用CORS，允许跨域
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 静态文件服务（用于提供上传的文件访问）
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  app.useStaticAssets(join(process.cwd(), uploadDir), {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 后端服务已启动，运行在: http://localhost:${port}`);
  console.log(`📁 上传文件目录: ${uploadDir}`);
}

bootstrap();
