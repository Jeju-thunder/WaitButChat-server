import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import CustomResponse from 'src/interface/custom-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = exception.getStatus();
    const status = HttpStatus[code];

    this.logger.error(
      `Error Occur ${request.url} ${request.method}, errorMessage: ${exception.message}`,
    );

    const errorResponse = new CustomResponse(
      code,
      status,
      exception.message,
      {},
    );

    response.status(code).json(errorResponse);
  }
}
