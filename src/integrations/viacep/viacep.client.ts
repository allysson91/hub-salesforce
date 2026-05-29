import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ViaCepResponse } from './interfaces/viacep-response.interface';

@Injectable()
export class ViaCepClient {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('app.viacepBaseUrl');
  }

  async findAddressByCep(cep: string): Promise<ViaCepResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ViaCepResponse>(`${this.baseUrl}/${cep}/json/`, {
          timeout: 5000,
        }),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;

      throw new BadGatewayException(
        statusCode
          ? `ViaCEP retornou erro HTTP ${statusCode}.`
          : 'ViaCEP indisponível no momento.',
      );
    }
  }
}
