import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { GiftCollection } from 'src/gift/entities/gift-collection.entity';

import { Submission } from 'src/submission/entities/submission.entity';
import { VoteStat } from 'src/vote/entities/vote-stat.entity';
import { Record } from './entities/record.entity';

import { RecordController } from './record.controller';
import { RecordService } from './record.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      GiftCollection,
      Submission,
      VoteStat,
      Record,
    ]),
  ],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}
