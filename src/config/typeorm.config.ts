import 'dotenv/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from './database.config';

function buildTypeOrmOptions(configService: ConfigService): DataSourceOptions {
  const databaseUrl = configService.get<string>('database.url');
  const ssl = configService.get<boolean>('database.ssl') ?? false;
  const sslRejectUnauthorized =
    configService.get<boolean>('database.sslRejectUnauthorized') ?? true;
  const commonOptions = {
    type: 'postgres' as const,
    synchronize: false,
    migrationsRun: false,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    ssl: ssl ? { rejectUnauthorized: sslRejectUnauthorized } : false,
  };

  if (databaseUrl) {
    return {
      ...commonOptions,
      url: databaseUrl,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    };
  }

  return {
    ...commonOptions,
    host: configService.getOrThrow<string>('database.host'),
    port: configService.getOrThrow<number>('database.port'),
    username: configService.getOrThrow<string>('database.username'),
    password: configService.getOrThrow<string>('database.password'),
    database: configService.getOrThrow<string>('database.database'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  };
}

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule.forFeature(databaseConfig)],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    ...buildTypeOrmOptions(configService),
    autoLoadEntities: true,
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
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
      }
    : {
        host: getRequiredEnv('DB_HOST'),
        port: parseInt(getRequiredEnv('DB_PORT'), 10),
        username: getRequiredEnv('DB_USERNAME'),
        password: getRequiredEnv('DB_PASSWORD'),
        database: getRequiredEnv('DB_DATABASE'),
      }),
  ssl:
    process.env.DB_SSL === 'true' || process.env.DATABASE_URL?.includes('sslmode=require')
      ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
      : false,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
};

export default new DataSource(dataSourceOptions);
