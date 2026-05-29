import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

interface TokenPayload {
  sub: string;
  clientId: string;
  grantType: string;
  iat: number;
  exp: number;
}

export interface AccessTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

@Injectable()
export class OauthTokenService {
  constructor(private readonly configService: ConfigService) {}

  issueClientCredentialsToken(
    clientId: string,
    clientSecret: string,
  ): AccessTokenResponse {
    this.validateClientCredentials(clientId, clientSecret);

    const expiresIn = this.getAccessTokenExpiresIn();
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: TokenPayload = {
      sub: clientId,
      clientId,
      grantType: 'client_credentials',
      iat: issuedAt,
      exp: issuedAt + expiresIn,
    };

    return {
      access_token: this.sign(payload),
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  validateAccessToken(token: string): AuthenticatedUser {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Token de acesso inválido.');
    }

    const expectedSignature = this.createSignature(
      `${encodedHeader}.${encodedPayload}`,
    );

    if (!this.safeCompare(signature, expectedSignature)) {
      throw new UnauthorizedException('Token de acesso inválido.');
    }

    const payload = this.decodePayload(encodedPayload);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      throw new UnauthorizedException('Token de acesso expirado.');
    }

    return payload;
  }

  private validateClientCredentials(
    clientId: string,
    clientSecret: string,
  ): void {
    const expectedClientId =
      this.configService.getOrThrow<string>('auth.clientId');
    const expectedClientSecret =
      this.configService.getOrThrow<string>('auth.clientSecret');

    if (
      !this.safeCompare(clientId, expectedClientId) ||
      !this.safeCompare(clientSecret, expectedClientSecret)
    ) {
      throw new UnauthorizedException('Credenciais OAuth 2.0 inválidas.');
    }
  }

  private sign(payload: TokenPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private createSignature(value: string): string {
    return createHmac(
      'sha256',
      this.configService.getOrThrow<string>('auth.jwtSecret'),
    )
      .update(value)
      .digest('base64url');
  }

  private decodePayload(encodedPayload: string): AuthenticatedUser {
    try {
      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as TokenPayload;

      if (
        !payload.sub ||
        !payload.clientId ||
        payload.grantType !== 'client_credentials' ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number'
      ) {
        throw new Error('Payload inválido.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Token de acesso inválido.');
    }
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private safeCompare(value: string, expectedValue: string): boolean {
    const valueBuffer = Buffer.from(value);
    const expectedValueBuffer = Buffer.from(expectedValue);

    if (valueBuffer.length !== expectedValueBuffer.length) {
      return false;
    }

    return timingSafeEqual(valueBuffer, expectedValueBuffer);
  }

  private getAccessTokenExpiresIn(): number {
    const expiresIn = this.configService.getOrThrow<number>(
      'auth.accessTokenExpiresIn',
    );

    return Number.isNaN(expiresIn) ? 3600 : expiresIn;
  }
}
