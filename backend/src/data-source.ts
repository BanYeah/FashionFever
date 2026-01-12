import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './auth/entities/user.entity';
import { Judge } from './auth/entities/judge.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE_NAME,
  entities: [User, Judge],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
