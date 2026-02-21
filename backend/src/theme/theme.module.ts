import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from './entities/schedule.entity';
import { Banner } from './entities/banner.entity';
import { Header } from './entities/header.entity';
import { GiftCollection } from 'src/gift/entities/gift-collection.entity';
import { Gift } from 'src/gift/entities/gift.entity';

import { User } from 'src/auth/entities/user.entity';
import { Reviewer } from './entities/reviewer.entity';
import { ThemeJudge } from './entities/theme-judge.entity';
import { Submission } from 'src/submission/entities/submission.entity';

import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { ThemeCron } from './theme.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      Banner,
      Header,
      GiftCollection,
      Gift,
      User,
      Reviewer,
      ThemeJudge,
      Submission,
    ]),
  ],
  controllers: [ThemeController],
  providers: [ThemeService, ThemeCron],
  exports: [ThemeService],
})
export class ThemeModule {}
