import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export type ErrorResponseBody = {
  statusCode: number;
  error: string;
  message: string | string[] | Record<string, unknown>;
  timestamp: string;
  path: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body = exception instanceof HttpException
      ? exception.getResponse()
      : { message: exception instanceof Error ? exception.message : 'Internal server error' };

    const errorLabel =
      exception instanceof HttpException
        ? (typeof body === 'object' && body !== null && 'error' in body
            ? String((body as { error?: string }).error)
            : HttpStatus[status] ?? 'Error')
        : 'Internal Server Error';

    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? (body as { message?: string | string[] | Record<string, unknown> }).message
        : (typeof body === 'string' ? body : 'Internal server error');

    const responseBody: ErrorResponseBody = {
      statusCode: status,
      error: errorLabel,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url} ${status}`, message);
    }

    response.status(status).json(responseBody);
  }
}
