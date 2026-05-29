import 'dotenv/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './database.config';

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(databaseConfig)],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.getOrThrow<string>('database.host'),
    port: configService.getOrThrow<number>('database.port'),
    username: configService.getOrThrow<string>('database.username'),
    password: configService.getOrThrow<string>('database.password'),
    database: configService.getOrThrow<string>('database.database'),
    synchronize: false,
    autoLoadEntities: true,
    migrationsRun: false,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  }),
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: getRequiredEnv('DB_HOST'),
  port: parseInt(getRequiredEnv('DB_PORT'), 10),
  username: getRequiredEnv('DB_USERNAME'),
  password: getRequiredEnv('DB_PASSWORD'),
  database: getRequiredEnv('DB_DATABASE'),
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
};

export default new DataSource(dataSourceOptions);
