import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../auth/entities/user.entity';
import { Judge } from '../auth/entities/judge.entity';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { AuthModule } from 'src/auth/auth.module';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Judge, Schedule, Submission]),
    AuthModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
