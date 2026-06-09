import 'dotenv/config';
import 'reflect-metadata';

import { DataSource } from 'typeorm';

const databaseUrl = process.env.DATABASE_URL;
const pgSslEnabled = (process.env.PG_SSL ?? 'true').toLowerCase() !== 'false';

const AppDataSource = new DataSource(
  databaseUrl
    ? {
      type: 'postgres',
      url: databaseUrl,
      ssl: pgSslEnabled ? { rejectUnauthorized: false } : undefined,
      extra: pgSslEnabled ? { ssl: { rejectUnauthorized: false } } : {},
      entities: [process.cwd() + '/src/**/*.entity{.ts,.js}'],
      migrations: [process.cwd() + '/src/migrations/*{.ts,.js}'],
      synchronize: false,
    }
    : {
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'online_learning',
      entities: [process.cwd() + '/src/**/*.entity{.ts,.js}'],
      migrations: [process.cwd() + '/src/migrations/*{.ts,.js}'],
      synchronize: false,
    },
);

export default AppDataSource;
