import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const res =
      exception instanceof HttpException
        ? exception.getResponse()
        : '服务器内部错误';

    const message =
      typeof res === 'string'
        ? res
        : (res as any).message || (res as any).error || '服务器内部错误';

    response.status(status).json({
      // 与全局 TransformInterceptor 保持一致的结构，方便前端统一处理
      code: status,
      data: null,
      message,
      // 保留额外调试信息
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
