import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository, IsNull } from 'typeorm';

import Redis from 'ioredis';
import { R2Service } from 'src/common/r2/r2.service';
import { PurgeCacheUtil } from 'src/common/utils/purge-cache.util';

import { Schedule } from './entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Injectable()
export class ThemeCron {
  private readonly logger = new Logger(ThemeCron.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly r2Service: R2Service,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  private async readyVote(themeId: string) {
    /* 유저 탈퇴로 인해 이미지 경로가 NULL인 제출 제거 */
    await this.submissionRepo.delete({
      theme_id: themeId,
      content_url: IsNull(),
    });

    /* 검수 과정에서 반려된 제출/사진 제거 */
    const targets = await this.submissionRepo.find({
      where: {
        theme_id: themeId,
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
    // 테마에 참가한 유저 수가 10명 미만이면, 투표 진행 불가
    {
      const result = await this.submissionRepo
        .createQueryBuilder('submission')
        .where('submission.theme_id = :themeId', { themeId })
        .select('COUNT(DISTINCT(submission.user_id))', 'count')
        .getRawOne();

      const userCount = parseInt(result.count);

      if (userCount < 10) {
        await this.scheduleRepo.update(
          { theme_id: themeId },
          { status: 'INCOMPLETE' },
        );

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

        await PurgeCacheUtil.apiTheme([
          { theme_id: themeId, status: 'INCOMPLETE' },
        ]).catch((err) =>
          console.error('[CACHE_ERROR] Failed to purge cache: ', err),
        );
        return;
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

    await this.scheduleRepo.update({ theme_id: themeId }, { status: 'VOTING' });

    await PurgeCacheUtil.apiTheme([
      { theme_id: themeId, status: 'VOTING' },
    ]).catch((err) =>
      console.error('[CACHE_ERROR] Failed to purge cache: ', err),
    );
  }

  private async completeVote(themeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    /* 테마 결과 집계 */
    try {
      const rankingKey = `voting:ranking:${themeId}`;
      const rankings = await this.redis.zrevrange(rankingKey, 0, -1);
      const total = await this.redis.zcard(rankingKey);
      if (total === 0) throw new Error('Total submissions for this theme is 0');

      const users = await queryRunner.query(
        `
        SELECT submission_id, user_id 
        FROM "Submission" 
        WHERE theme_id = $1
        `,
        [themeId],
      );
      const userMap = new Map<string, string>(
        users.map((s: any) => [s.submission_id.toString(), s.user_id]),
      );

      const counts = await queryRunner.query(
        `
        SELECT user_id, COUNT(*)::INTEGER AS vote_count 
        FROM "Vote" 
        WHERE theme_id = $1 AND voted_at IS NOT NULL 
        GROUP BY user_id
        `,
        [themeId],
      );
      const countMap = new Map<string, number>(
        counts.map((c: any) => [c.user_id, c.vote_count]),
      );

      await queryRunner.query(`DELETE FROM "VoteStat" WHERE theme_id = $1`, [
        themeId,
      ]);

      const voteStatData = Array.from(countMap.entries());
      const chunkSize = 100;
      for (let i = 0; i < voteStatData.length; i += chunkSize) {
        const chunk = voteStatData.slice(i, i + chunkSize);
        const values = chunk
          .map(
            ([userId, count]) =>
              `('${userId}'::UUID, '${themeId}'::UUID, ${count}::INTEGER)`,
          )
          .join(',');

        await queryRunner.query(`
          INSERT INTO "VoteStat" (user_id, theme_id, vote_count)
          VALUES ${values};
        `);
      }

      /* 투표/심사/공감/합계 점수 계산 */
      const scores = rankings.map((subId, index) => {
        const rank = index + 1;
        const userId = userMap.get(subId);
        const voteCount = countMap.get(userId!) || 0;

        /* 투표 순위 + 투표 점수 반영 (4.00 만점) */
        const voteScore =
          Math.round(4.0 * ((total + 1 - rank) / total) * 100) / 100;

        /* 심사 점수 반영 (0.50 만점) */
        const judgeScore = 0.5;

        /* 공감 점수 반영 (0.50 만점) */
        const rawLikeScore = Math.min(0.5 * (voteCount / 100), 0.5);
        const roundedLikeScore = Math.round(rawLikeScore * 100) / 100;

        const likeScore = voteCount < 30 ? 0 : roundedLikeScore;

        /* 합계 점수 계산 (5.00 만점) */
        const sum = voteScore + judgeScore + likeScore;
        const totalScore = Math.round(sum * 100) / 100;

        return {
          sub_id: subId,
          vote_rank: rank,
          vote_score: voteScore,
          judge_score: judgeScore,
          like_score: likeScore,
          total_score: totalScore,
        };
      });

      const sortedScores = scores.sort((a, b) => {
        const totalA = a.total_score;
        const totalB = b.total_score;

        if (totalB !== totalA) return totalB - totalA; // 점수 높은 순 (내림차순)
        return a.vote_rank - b.vote_rank; // 점수 같으면 투표 순위 높은 순 (오름차순)
      });

      /* 최종 랭킹 계산 */
      const updateData = sortedScores.map((item, index) => ({
        ...item,
        final_rank: index + 1,
      }));

      /* 투표/심사/공감/합계 점수, 투표/최종 랭킹 업데이트 */
      for (let i = 0; i < updateData.length; i += chunkSize) {
        const chunk = updateData.slice(i, i + chunkSize);
        const values = chunk
          .map(
            (d) =>
              `(${d.sub_id}::BIGINT, ${d.vote_rank}::INTEGER, ${d.vote_score}::NUMERIC, ${d.judge_score}::NUMERIC, ${d.like_score}::NUMERIC, ${d.total_score}::NUMERIC, ${d.final_rank}::INTEGER)`,
          )
          .join(',');

        await queryRunner.query(
          `
          UPDATE "Submission" AS s 
          SET 
            vote_rank = v.v_rank, vote_score = v.v_score, judge_score = v.j_score, like_score = v.l_score, 
            total_score = v.t_score, final_rank = v.rank
          FROM (VALUES ${values}) AS v(sub_id, v_rank, v_score, j_score, l_score, t_score, rank)
          WHERE s.submission_id = v.sub_id AND s.theme_id = $1;
          `,
          [themeId],
        );
      }

      await queryRunner.query(`DELETE FROM "Record" WHERE theme_id = $1`, [
        themeId,
      ]);

      /* 유저별 최고 기록, 랭킹 집계 */
      await queryRunner.query(
        `
        INSERT INTO "Record" (theme_id, user_id, best_sub_id, best_final_rank, best_total_score, user_rank)
        SELECT theme_id, user_id, submission_id, final_rank, total_score, 
              ROW_NUMBER() OVER (ORDER BY final_rank ASC) as user_rank
        FROM (
          SELECT DISTINCT ON (user_id) 
            theme_id, user_id, submission_id, final_rank, total_score
          FROM "Submission" 
          WHERE theme_id = $1 AND user_id IS NOT NULL
          ORDER BY user_id, final_rank ASC
        ) AS best_submissions;
        `,
        [themeId],
      );

      /* 랭킹에 따라 최종 점수 보정 */
      await this.adjustScore(themeId, queryRunner);

      await queryRunner.query(
        `UPDATE "Schedule" SET status = 'COMPLETE' WHERE theme_id = $1`,
        [themeId],
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(
        '[THEME_COMPLETE_ERROR] Failed to aggregate theme vote results: ',
        err,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }

    await PurgeCacheUtil.apiTheme([
      { theme_id: themeId, status: 'COMPLETE' },
    ]).catch((err) =>
      console.error('[CACHE_ERROR] Failed to purge cache: ', err),
    );
  }

  private async adjustScore(themeId: string, queryRunner: QueryRunner) {
    const records = await queryRunner.query(
      `SELECT * FROM "Record" WHERE theme_id = $1 ORDER BY user_rank ASC`,
      [themeId],
    );

    const collections = await queryRunner.query(
      `SELECT * FROM "GiftCollection" WHERE theme_id = $1 ORDER BY heart_rate DESC`,
      [themeId],
    );

    const updateData: any[] = [];

    let processedRank = 0;
    let prevTMin = 5.0;
    let prevOMin = 0.0;

    for (let i = 0; i < collections.length; i++) {
      const col = collections[i];
      const tMin = Number(col.heart_rate); // numeric -> string

      // 해당 선물 컬렉션의 cut_off_rank (final_rank) 결정
      const cutOffUserRank = processedRank + col.gift_total_num;
      const cutOffUser = records.find(
        (r: any) => r.user_rank === cutOffUserRank,
      );

      let cutOffRank: number;
      if (cutOffUser) cutOffRank = cutOffUser.best_final_rank!;
      else {
        const lastUser = records[records.length - 1];
        if (lastUser.user_rank! <= processedRank) break;

        cutOffRank = lastUser.best_final_rank!;
      }

      const section: Submission[] = await queryRunner.query(
        `
        SELECT * FROM "Submission" 
        WHERE theme_id = $1 
          AND final_rank > $2 AND final_rank <= $3
        ORDER BY final_rank ASC
        `,
        [themeId, processedRank, cutOffRank],
      );

      if (section.length > 0) {
        let oMax = section[0].total_score;
        const oMin = section[section.length - 1].total_score;

        let tMax = prevTMin;
        if (i !== 0) {
          if (oMax === prevOMin) tMax -= 0.01;
          oMax = prevOMin;
        }

        section.forEach((sec: Submission) => {
          const o = sec.total_score;
          let finalScore = tMin + (tMax - tMin) * ((o - oMin) / (oMax - oMin));

          if (!Number.isFinite(finalScore)) finalScore = tMin;

          updateData.push({
            submission_id: sec.submission_id,
            adj_score: Math.round(finalScore * 100) / 100 - sec.total_score,
            final_score: Math.round(finalScore * 100) / 100,
          });
        });

        processedRank = cutOffRank;
        prevTMin = tMin;
        prevOMin = oMin;
      }

      if (!cutOffUser) break;
    }

    const remaining: Submission[] = await queryRunner.query(
      `
      SELECT * FROM "Submission" 
      WHERE theme_id = $1 
        AND final_rank > $2
      ORDER BY final_rank ASC
      `,
      [themeId, processedRank],
    );

    if (remaining.length > 0) {
      let oMax = remaining[0].total_score;
      const oMin = remaining[remaining.length - 1].total_score;

      const tMin = 0.0;
      let tMax = prevTMin;
      if (oMax === prevOMin) tMax -= 0.01;
      oMax = prevOMin;

      remaining.forEach((sec: Submission) => {
        const o = sec.total_score;
        let finalScore = tMin + (tMax - tMin) * ((o - oMin) / (oMax - oMin));

        if (!Number.isFinite(finalScore)) finalScore = tMin;

        updateData.push({
          submission_id: sec.submission_id,
          adj_score: Math.round(finalScore * 100) / 100 - sec.total_score,
          final_score: Math.round(finalScore * 100) / 100,
        });
      });
    }

    if (updateData.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < updateData.length; i += chunkSize) {
        const chunk = updateData.slice(i, i + chunkSize);
        const values = chunk
          .map(
            (d) =>
              `(${d.submission_id}::BIGINT, ${d.adj_score}::NUMERIC, ${d.final_score}::NUMERIC)`,
          )
          .join(',');

        await queryRunner.query(`
          UPDATE "Submission" AS s
          SET 
            adj_score = v.a_score,
            final_score = v.f_score
          FROM (VALUES ${values}) AS v(sub_id, a_score, f_score)
          WHERE s.submission_id = v.sub_id;
        `);
      }
    }

    await queryRunner.query(`
      UPDATE "Record" AS r
      SET best_final_score = s.final_score
      FROM "Submission" AS s
      WHERE r.best_sub_id = s.submission_id;
    `);
  }

  // 매 10초마다 실행
  // @Cron('0/10 * * * * *'

  // 한국 시간 기준으로 1시간마다 실행
  @Cron('0 0 * * * *', {
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
        WHERE "status" NOT IN ('COMPLETE')
          AND "status" IS DISTINCT FROM (${statusLogic})
        RETURNING "theme_id", "status";
      `);

      this.logger.log('테마 일정 상태 업데이트 완료');

      await PurgeCacheUtil.apiTheme(updated).catch((err) =>
        console.error('[CACHE_ERROR] Failed to purge cache: ', err),
      );

      /* 테마 투표 준비 */
      const voteReady = updated
        .filter((item: any) => item.status === 'VOTE_READY')
        .map((item: any) => item.theme_id);

      if (voteReady.length > 0) {
        this.logger.log('테마 투표 준비 시작');
        await this.readyVote(voteReady[0]);
        this.logger.log('테마 투표 준비 완료');
      }

      /* 테마 결과 집계 */
      const completeReady = updated
        .filter((item: any) => item.status === 'COMPLETE_READY')
        .map((item: any) => item.theme_id);

      if (completeReady.length > 0) {
        this.logger.log('테마 결과 집계 시작');
        await this.completeVote(completeReady[0]);
        this.logger.log('테마 결과 집계 완료');
      }
    } catch (error) {
      this.logger.error('[ERROR] ', error.stack);
    }
  }
}
