import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationLog } from './entities/integration-log.entity';
import { IntegrationLogService } from './integration-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationLog])],
  providers: [IntegrationLogService],
  exports: [IntegrationLogService],
})
export class IntegrationLogModule {}
