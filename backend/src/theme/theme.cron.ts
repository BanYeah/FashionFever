import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';

import { Schedule } from './entities/schedule.entity';

@Injectable()
export class ThemeCron {
  private readonly logger = new Logger(ThemeCron.name);

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
  ) {}

  async purgeCache(updated: any[]) {
    if (updated.length === 0) return;

    /* GET /schedules/timeline
       GET /schedules/voting-now
       GET /themes */
    const files = [
      `${process.env.API_PREFIX}/schedules/timeline`,
      `${process.env.API_PREFIX}/schedules/voting-now`,
      `${process.env.API_PREFIX}/themes?page=1`,
      `${process.env.API_PREFIX}/themes?page=2`,
    ];

    /* GET /themes/:theme_id/header
       GET /themes/:theme_id/gift */
    const enrollingThemeIds = updated
      .filter((row: any) => row.status === 'ENROLLING') // updated to 'ENROLLING'
      .map((row: any) => row.theme_id);
    for (const themeId of enrollingThemeIds) {
      files.push(`${process.env.API_PREFIX}/themes/${themeId}/header`);
      files.push(`${process.env.API_PREFIX}/themes/${themeId}/gift`);
    }

    const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CACHE_ZONE_ID}/purge_cache`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CACHE_SECRET_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: files,
      }),
    });

    if (!res.ok) throw new Error();
  }

  // 매 10초마다 실행
  // @Cron('0/10 * * * * *'

  // 매일 자정(00:00) 한국 시간 기준으로 실행
  @Cron('0 0 0 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleScheduleStatusUpdate() {
    this.logger.log('테마 일정 상태 업데이트 배치 시작');

    const statusLogic = `
      CASE 
        WHEN CURRENT_TIMESTAMP < "enroll_start_at" THEN 'PREPARING'
        WHEN CURRENT_TIMESTAMP >= "enroll_start_at" AND CURRENT_TIMESTAMP < "review_start_at" THEN 'ENROLLING'
        WHEN CURRENT_TIMESTAMP >= "review_start_at" AND CURRENT_TIMESTAMP < "vote_start_at" THEN 'REVIEWING'
        WHEN CURRENT_TIMESTAMP >= "vote_start_at" AND CURRENT_TIMESTAMP < "result_start_at" THEN 'VOTING'
        WHEN CURRENT_TIMESTAMP >= "result_start_at" THEN 'RESULTING'
        ELSE "status"
      END
    `;

    const [updated, count] = await this.scheduleRepo.query(`
      UPDATE "Schedule"
      SET "status" = ${statusLogic}
      WHERE "status" NOT IN ('RESULTING', 'COMPLETE')
        AND "status" IS DISTINCT FROM (${statusLogic})
      RETURNING "theme_id", "status";
    `);

    this.logger.log('테마 일정 상태 업데이트 완료');

    // this.logger.log('CDN Purge 준비');
    // try {
    //   await this.purgeCache(updated);
    //   this.logger.log('CDN Purge 성공');
    // } catch {
    //   this.logger.log('CDN Purge 실패');
    // }
  }
}
