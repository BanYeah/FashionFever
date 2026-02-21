import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { R2Service } from 'src/common/r2/r2.service';

import { Schedule } from './entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Injectable()
export class ThemeCron {
  private readonly logger = new Logger(ThemeCron.name);

  constructor(
    private readonly r2Service: R2Service,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  private async purgeCache(updated: any[]) {
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

    /* GET /themes/:theme_id/status */
    const updatedThemeIds = updated.map((row: any) => row.theme_id);
    for (const themeId of updatedThemeIds)
      files.push(`${process.env.API_PREFIX}/themes/${themeId}/status`);

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

    if (!res.ok) throw new Error('/purge_cache API 호출 오류');
  }

  private async cleanupSubmissions(updated: any[]) {
    const themeIds = updated
      .filter((row: any) => row.status === 'VOTE_READY') // updated to 'VOTE_READY'
      .map((row: any) => row.theme_id);

    if (themeIds.length === 0) return;

    const targets = await this.submissionRepo.find({
      where: {
        theme_id: In(themeIds),
        is_approved: false,
      },
      select: ['submission_id', 'content_url'],
    });

    if (targets.length > 0) {
      const deletedFiles = targets
        .map((t) => t.content_url)
        .filter((url): url is string => !!url);

      await this.submissionRepo.delete(targets.map((t) => t.submission_id));

      this.r2Service.deleteImages(deletedFiles).catch(() => {
        console.log(
          `[R2_COMMIT_ERROR] Failed to delete orphaned files: ${JSON.stringify(deletedFiles)}`,
        );
      });
    }

    await this.scheduleRepo.update(
      { theme_id: In(themeIds) },
      { status: 'VOTING' },
    );

    updated.forEach((row) => {
      if (row.status === 'VOTE_READY') row.status = 'VOTING';
    });

    const votingNow = updated.filter((row) => row.status === 'VOTING');

    this.logger.log('테마 투표 준비 관련 /purge_cache API 호출 준비');
    await this.purgeCache(votingNow);
    this.logger.log('테마 투표 준비 관련 /purge_cache API 호출 성공');
  }

  // 매 10초마다 실행
  // @Cron('0/10 * * * * *'

  // 매일 자정(00:00) 한국 시간 기준으로 실행
  @Cron('0 0 0 * * *', {
    timeZone: 'Asia/Seoul',
  })
  async handleScheduleStatusUpdate() {
    try {
      this.logger.log('테마 일정 상태 업데이트 배치 시작');

      const statusLogic = `
      CASE 
        WHEN CURRENT_TIMESTAMP < "enroll_start_at" THEN 'PREPARING'
        WHEN CURRENT_TIMESTAMP >= "enroll_start_at" AND CURRENT_TIMESTAMP < "review_start_at" THEN 'ENROLLING'
        WHEN CURRENT_TIMESTAMP >= "review_start_at" AND CURRENT_TIMESTAMP < "vote_start_at" THEN 'REVIEWING'
        WHEN CURRENT_TIMESTAMP >= "vote_start_at" AND CURRENT_TIMESTAMP < "complete_start_at" THEN 'VOTE_READY'
        WHEN CURRENT_TIMESTAMP >= "complete_start_at" THEN 'COMPLETE_READY'
        ELSE "status"
      END
    `;

      const [updated, count] = await this.scheduleRepo.query(`
      UPDATE "Schedule"
      SET "status" = ${statusLogic}
      WHERE "status" NOT IN ('COMPLETE_READY', 'COMPLETE')
        AND "status" IS DISTINCT FROM (${statusLogic})
      RETURNING "theme_id", "status";
    `);

      this.logger.log('테마 일정 상태 업데이트 완료');

      this.logger.log('/purge_cache API 호출 준비');
      await this.purgeCache(updated);
      this.logger.log('/purge_cache API 호출 성공');

      this.logger.log('테마 투표 준비 시작');
      await this.cleanupSubmissions(updated);
      this.logger.log('테마 투표 준비 완료');
    } catch (error) {
      this.logger.error('오류 발생', error.stack);
    }
  }
}
