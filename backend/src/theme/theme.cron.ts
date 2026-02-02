import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Schedule } from './entities/schedule.entity';

@Injectable()
export class ThemeCron {
  private readonly logger = new Logger(ThemeCron.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  // 매일 자정(00:00) 한국 시간 기준으로 실행
  @Cron('0 0 0 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleScheduleStatusUpdate() {
    this.logger.log('테마 일정 상태 업데이트 배치 시작');

    await this.scheduleRepository.query(`
      UPDATE "Schedule"
      SET "status" = CASE 
        WHEN CURRENT_TIMESTAMP < "enroll_start_at" THEN 'PREPARING'
        WHEN CURRENT_TIMESTAMP >= "enroll_start_at" AND CURRENT_TIMESTAMP < "enroll_end_at" THEN 'ENROLLING'
        WHEN CURRENT_TIMESTAMP >= "review_start_at" AND CURRENT_TIMESTAMP < "review_end_at" THEN 'REVIEWING'
        WHEN CURRENT_TIMESTAMP >= "vote_start_at" AND CURRENT_TIMESTAMP < "vote_end_at" THEN 'VOTING'
        WHEN CURRENT_TIMESTAMP >= "vote_end_at" THEN 'COMPLETE'
        ELSE "status"
      END
      WHERE "status" != 'COMPLETE';
    `);

    this.logger.log('테마 일정 상태 업데이트 완료');
  }
}
