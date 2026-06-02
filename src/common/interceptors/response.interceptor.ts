import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response.interface';

type ResponseBody<T> = ApiResponse<T> | T;

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseBody<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseBody<T>> {
    const skipResponseWrap = this.reflector.getAllAndOverride<boolean>(
      'skipResponseWrap',
      [context.getHandler(), context.getClass()],
    );

    if (skipResponseWrap) {
      return next.handle();
    }

    return next.handle().pipe(
      map((body: ResponseBody<T>) => {
        if (
          body &&
          typeof body === 'object' &&
          'success' in body &&
          'message' in body
        ) {
          return body;
        }

        return {
          success: true,
          message: 'Operação realizada com sucesso.',
          data: body,
        };
      }),
    );
  }
}
