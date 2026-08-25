import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { getTestDatabaseOptions } from './test-database.config';

// Đọc file .env thủ công cho CLI
if (process.env.NODE_ENV !== 'test') config();

const databaseOptions =
  process.env.NODE_ENV === 'test'
    ? getTestDatabaseOptions()
    : {
        type: 'postgres' as const,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };

export default new DataSource({
  ...databaseOptions,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  //migrations: [join(__dirname, '../database/migrations/!(*.spec).{ts,js}')],
  migrations: [join(__dirname, '../database/migrations/!(*.spec){.ts,.js}')],
  synchronize: false,
});
