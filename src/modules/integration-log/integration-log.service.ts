import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntegrationLog } from './entities/integration-log.entity';

export interface CreateIntegrationLogInput {
  operation: string;
  provider: string;
  requestPayload: Record<string, unknown>;
  responsePayload?: Record<string, unknown> | null;
  status: 'SUCCESS' | 'ERROR';
  statusCode?: number | null;
  errorMessage?: string | null;
  executionTimeMs?: number | null;
}

@Injectable()
export class IntegrationLogService {
  private readonly logger = new Logger(IntegrationLogService.name);

  constructor(
    @InjectRepository(IntegrationLog)
    private readonly integrationLogRepository: Repository<IntegrationLog>,
  ) {}

  async create(input: CreateIntegrationLogInput): Promise<IntegrationLog | null> {
    try {
      const log = this.integrationLogRepository.create({
        ...input,
        responsePayload: input.responsePayload ?? null,
        statusCode: input.statusCode ?? null,
        errorMessage: input.errorMessage ?? null,
        executionTimeMs: input.executionTimeMs ?? null,
      });

      return await this.integrationLogRepository.save(log);
    } catch (error) {
      this.logger.error(
        'Não foi possível registrar o log da integração.',
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }
}
