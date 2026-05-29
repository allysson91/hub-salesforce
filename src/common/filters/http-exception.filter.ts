import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const payload =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ExceptionResponse)
        : null;

    const message = this.resolveMessage(exceptionResponse, payload, status);
    const error = this.resolveError(payload, status);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      message,
      error,
    });
  }

  private resolveMessage(
    exceptionResponse: string | object | null,
    payload: ExceptionResponse | null,
    status: number,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (Array.isArray(payload?.message)) {
      return payload.message.join('; ');
    }

    if (typeof payload?.message === 'string') {
      return payload.message;
    }

    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'Erro inesperado ao processar a requisição.'
      : 'Não foi possível processar a requisição.';
  }

  private resolveError(payload: ExceptionResponse | null, status: number): string {
    if (payload?.error) {
      return payload.error.toUpperCase().replace(/\s+/g, '_');
    }

    return HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}
