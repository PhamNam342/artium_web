import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Đọc file .env thủ công cho CLI
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/!(*.spec).{ts,js}')],
  synchronize: false,
});
