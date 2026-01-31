import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from './entities/schedule.entity';
import { Banner } from './entities/banner.entity';
import { Header } from './entities/header.entity';

import { User } from 'src/auth/entities/user.entity';
import { Reviewer } from './entities/reviewer.entity';
import { ThemeJudge } from './entities/theme-judge.entity';

import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      Banner,
      Header,
      User,
      Reviewer,
      ThemeJudge,
    ]),
  ],
  controllers: [ThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
