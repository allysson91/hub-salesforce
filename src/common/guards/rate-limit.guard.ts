import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from '../decorators/rate-limit.decorator';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const options = this.getOptions(context);
    const key = this.buildKey(request, context);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt <= now) {
      this.store.set(key, {
        count: 1,
        resetAt: now + options.ttlMs,
      });
      this.cleanup(now);
      return true;
    }

    if (entry.count >= options.limit) {
      throw new HttpException(
        'Muitas requisições. Aguarde antes de tentar novamente.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count += 1;
    return true;
  }

  private getOptions(context: ExecutionContext): RateLimitOptions {
    const routeOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (routeOptions) {
      return routeOptions;
    }

    const request = context.switchToHttp().getRequest<Request>();

    if (request.path.endsWith('/auth/token')) {
      return {
        limit:
          this.configService.get<number>('security.authRateLimitMax') ?? 5,
        ttlMs:
          this.configService.get<number>('security.authRateLimitTtlMs') ??
          60000,
      };
    }

    return {
      limit: this.configService.get<number>('security.rateLimitMax') ?? 60,
      ttlMs: this.configService.get<number>('security.rateLimitTtlMs') ?? 60000,
    };
  }

  private buildKey(request: Request, context: ExecutionContext): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const ip =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : request.ip;
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;

    return `${ip}:${className}:${handlerName}`;
  }

  private cleanup(now: number): void {
    if (this.store.size < 1000) {
      return;
    }

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }
}
