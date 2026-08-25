import { config } from 'dotenv';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function getTestDatabaseOptions(): PostgresConnectionOptions {
  config({ path: '.env.test' });

  const database = process.env.TEST_DB_NAME;
  if (!database) {
    throw new Error(
      'TEST_DB_NAME is required to run database integration tests. Create backend/.env.test from .env.test.example.',
    );
  }

  return {
    type: 'postgres',
    host: process.env.TEST_DB_HOST ?? 'localhost',
    port: parseInt(process.env.TEST_DB_PORT ?? '5432', 10),
    username: process.env.TEST_DB_USER ?? 'postgres',
    password: process.env.TEST_DB_PASSWORD,
    database,
  };
}
