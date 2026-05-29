import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ViaCepClient } from '../../integrations/viacep/viacep.client';
import { IntegrationLogModule } from '../integration-log/integration-log.module';
import { CepController } from './cep.controller';
import { CepService } from './cep.service';

@Module({
  imports: [HttpModule, IntegrationLogModule],
  controllers: [CepController],
  providers: [CepService, ViaCepClient],
})
export class CepModule {}
