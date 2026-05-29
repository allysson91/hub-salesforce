import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesforceAuthService {
  async getAccessToken(): Promise<string> {
    throw new Error('Método getAccessToken ainda não implementado.');
  }

  async refreshToken(): Promise<string> {
    throw new Error('Método refreshToken ainda não implementado.');
  }

  async validateToken(): Promise<boolean> {
    throw new Error('Método validateToken ainda não implementado.');
  }
}
