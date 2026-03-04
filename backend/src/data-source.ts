import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { User } from './auth/entities/user.entity';
import { Judge } from './auth/entities/judge.entity';

import { Schedule } from './theme/entities/schedule.entity';
import { Banner } from './theme/entities/banner.entity';
import { Header } from './theme/entities/header.entity';
import { Reviewer } from './theme/entities/reviewer.entity';
import { ThemeJudge } from './theme/entities/theme-judge.entity';

import { GiftCollection } from './gift/entities/gift-collection.entity';
import { Gift } from './gift/entities/gift.entity';

import { Submission } from './submission/entities/submission.entity';
import { Vote } from './vote/entities/vote.entity';
import { VoteStat } from './vote/entities/vote-stat.entity';
import { Record } from './record/entities/record.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE_NAME,
  entities: [
    User,
    Judge,
    Schedule,
    Banner,
    Header,
    Reviewer,
    ThemeJudge,
    GiftCollection,
    Gift,
    Submission,
    Vote,
    VoteStat,
    Record,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
