import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { typeOrmModuleOptions } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { CepModule } from './modules/cep/cep.module';
import { IntegrationLogModule } from './modules/integration-log/integration-log.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    CepModule,
    IntegrationLogModule,
  ],
})
export class AppModule {}
