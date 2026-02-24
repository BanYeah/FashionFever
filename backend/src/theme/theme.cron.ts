import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';

import Redis from 'ioredis';
import { R2Service } from 'src/common/r2/r2.service';

import { Schedule } from './entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Injectable()
export class ThemeCron {
  private readonly logger = new Logger(ThemeCron.name);

  constructor(
    private readonly r2Service: R2Service,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
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

  private async readyVote(updated: any[]) {
    const themeIds = updated
      .filter((row: any) => row.status === 'VOTE_READY') // updated to 'VOTE_READY'
      .map((row: any) => row.theme_id);

    if (themeIds.length === 0) return;

    /* 유저 탈퇴로 인해 이미지 경로가 NULL인 제출 제거 */
    await this.submissionRepo.delete({
      theme_id: In(themeIds),
      content_url: IsNull(),
    });

    /* 검수 과정에서 반려된 제출/사진 제거 */
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

    /* 테마 투표 준비 */
    for (const themeId of themeIds) {
      {
        const result = await this.submissionRepo
          .createQueryBuilder('submission')
          .where('submission.theme_id = :themeId', { themeId })
          .select('COUNT(DISTINCT(submission.user_id))', 'count')
          .getRawOne();

        const userCount = parseInt(result.count);

        // 테마에 참가한 유저 수가 10명 미만이면, 투표 진행 불가
        if (userCount < 10) {
          await this.scheduleRepo.update(
            { theme_id: themeId },
            { status: 'INCOMPLETE' },
          );

          const row = updated.find((r) => r.theme_id === themeId);
          if (row) row.status = 'INCOMPLETE';

          /* 제출/사진 제거 */
          const targets = await this.submissionRepo.find({
            where: { theme_id: themeId },
            select: ['content_url'],
          });

          if (targets.length > 0) {
            const deletedFiles = targets
              .map((t) => t.content_url)
              .filter((url): url is string => !!url);

            await this.submissionRepo.delete({ theme_id: themeId });

            this.r2Service.deleteImages(deletedFiles).catch(() => {
              console.log(
                `[R2_COMMIT_ERROR] Failed to delete orphaned files: ${JSON.stringify(deletedFiles)}`,
              );
            });
          }

          continue;
        }
      }

      // Redis 설정
      const exposureKey = `voting:exposure:${themeId}`;
      const rankingKey = `voting:ranking:${themeId}`;

      const TTL = 60 * 60 * 24 * 10; // 10일

      const submissions = await this.submissionRepo.find({
        where: { theme_id: themeId },
        select: ['submission_id'],
      });

      const pipeline = this.redis.pipeline();

      pipeline.del(exposureKey, rankingKey);

      for (const sub of submissions) {
        const subId = sub.submission_id;
        // 노출 횟수(exposure)는 0, 초기 점수(ranking)는 1200으로 설정
        pipeline.zadd(exposureKey, 0, subId);
        pipeline.zadd(rankingKey, 1200, subId);
      }

      pipeline.expire(exposureKey, TTL);
      pipeline.expire(rankingKey, TTL);

      await pipeline.exec();

      await this.scheduleRepo.update(
        { theme_id: themeId },
        { status: 'VOTING' },
      );

      const row = updated.find((r) => r.theme_id === themeId);
      if (row) row.status = 'VOTING';
    }

    const finalized = updated.filter(
      (row) => row.status === 'VOTING' || row.status === 'INCOMPLETE',
    );

    this.logger.log('테마 투표 준비 관련 /purge_cache API 호출 준비');
    await this.purgeCache(finalized);
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
      await this.readyVote(updated);
      this.logger.log('테마 투표 준비 완료');
    } catch (error) {
      this.logger.error('오류 발생', error.stack);
    }
  }
}
