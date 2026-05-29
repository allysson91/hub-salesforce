import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { OauthTokenService } from './oauth-token.service';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class OauthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly oauthTokenService: OauthTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);
    request.user = this.oauthTokenService.validateAccessToken(token);

    return true;
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Token Bearer obrigatório.');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token Bearer inválido.');
    }

    return token;
  }
}
