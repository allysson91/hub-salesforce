import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { ViaCepResponse } from '../../integrations/viacep/interfaces/viacep-response.interface';
import { ViaCepClient } from '../../integrations/viacep/viacep.client';
import { IntegrationLogService } from '../integration-log/integration-log.service';

export interface NormalizedAddress {
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  stateName: string;
  region: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

@Injectable()
export class CepService {
  private readonly operation = 'FIND_ADDRESS_BY_CEP';
  private readonly provider = 'VIACEP';

  constructor(
    private readonly viaCepClient: ViaCepClient,
    private readonly integrationLogService: IntegrationLogService,
  ) {}

  async findAddress(cepParam: string): Promise<ApiResponse<NormalizedAddress>> {
    const startedAt = Date.now();
    const normalizedCep = this.normalizeCep(cepParam);
    const requestPayload = {
      receivedCep: cepParam,
      normalizedCep,
    };

    try {
      this.validateCep(normalizedCep);

      const viaCepResponse = await this.viaCepClient.findAddressByCep(
        normalizedCep,
      );

      if (viaCepResponse.erro) {
        throw new NotFoundException('CEP não encontrado.');
      }

      const address = this.normalizeViaCepResponse(viaCepResponse, normalizedCep);

      await this.integrationLogService.create({
        operation: this.operation,
        provider: this.provider,
        requestPayload,
        responsePayload: viaCepResponse as Record<string, unknown>,
        status: 'SUCCESS',
        statusCode: 200,
        executionTimeMs: Date.now() - startedAt,
      });

      return {
        success: true,
        message: 'Endereço encontrado com sucesso.',
        data: address,
      };
    } catch (error) {
      const exception = this.resolveException(error);

      await this.integrationLogService.create({
        operation: this.operation,
        provider: this.provider,
        requestPayload,
        responsePayload: this.resolveErrorPayload(error),
        status: 'ERROR',
        statusCode: exception.getStatus(),
        errorMessage: exception.message,
        executionTimeMs: Date.now() - startedAt,
      });

      throw exception;
    }
  }

  private normalizeCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  private validateCep(cep: string): void {
    if (!/^\d{8}$/.test(cep)) {
      throw new BadRequestException('CEP inválido. Informe exatamente 8 dígitos.');
    }
  }

  private normalizeViaCepResponse(
    viaCepResponse: ViaCepResponse,
    fallbackCep: string,
  ): NormalizedAddress {
    return {
      cep: viaCepResponse.cep?.replace(/\D/g, '') ?? fallbackCep,
      street: viaCepResponse.logradouro ?? '',
      complement: viaCepResponse.complemento ?? '',
      neighborhood: viaCepResponse.bairro ?? '',
      city: viaCepResponse.localidade ?? '',
      state: viaCepResponse.uf ?? '',
      stateName: viaCepResponse.estado ?? '',
      region: viaCepResponse.regiao ?? '',
      ibge: viaCepResponse.ibge ?? '',
      gia: viaCepResponse.gia ?? '',
      ddd: viaCepResponse.ddd ?? '',
      siafi: viaCepResponse.siafi ?? '',
    };
  }

  private resolveException(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    return new InternalServerErrorException(
      'Erro inesperado ao consultar o endereço.',
    );
  }

  private resolveErrorPayload(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
      };
    }

    return {
      message: 'Erro desconhecido.',
    };
  }
}
