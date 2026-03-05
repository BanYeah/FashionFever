import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { Vote } from './entities/vote.entity';

import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Submission, Vote])],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
