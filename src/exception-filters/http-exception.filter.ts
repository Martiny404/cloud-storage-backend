import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface BadRequestValidationExceptionResponse {
  message: string[] | string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(`Exception: ${exception.message}, status: ${status}`);

    const exResponse = exception.getResponse();

    const details: string[] = [];

    if (typeof exResponse == 'object') {
      const message = (exResponse as BadRequestValidationExceptionResponse)
        ?.message;

      if (Array.isArray(message)) {
        for (const m of message) {
          details.push(m);
        }
      }
    }
    response.status(status).json({
      timestamp: new Date().toISOString(),
      message: exception.message,
      details,
      status: exception.getStatus(),
    });
  }
}
