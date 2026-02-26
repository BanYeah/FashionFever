import {
  Injectable,
  Inject,
  BadRequestException, // 400
  NotFoundException, // 404
  GoneException, // 410
  UnprocessableEntityException, // 422
  InternalServerErrorException, // 500
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';

import Redis from 'ioredis';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';
import { Vote } from './entities/vote.entity';

import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VoteService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
    @InjectRepository(Vote)
    private voteRepo: Repository<Vote>,
  ) {}

  /*
   * Elo K-Factor 산출 함수
   * 200회 초과 투표 시 영향력을 빠르게 희석시켜 매크로 및 과도한 어뷰징 방어
   */
  private getDynamicK(voteCount: number) {
    const DEFAULT_K = 32;
    const THRESHOLD = 200;

    if (voteCount < 30) return 24;
    if (voteCount <= THRESHOLD) return DEFAULT_K;
    return Math.max(0.5, (DEFAULT_K * THRESHOLD) / voteCount);
  }

  /*
   * 투표 결과를 처리하고 변경된 점수 정보를 반환
   * winnerSide: 1 (subId1 승), 2 (subId2 승), null (무승부)
   */
  private async handleVote(
    themeId: string,
    subId1: string,
    subId2: string,
    winnerSide: number | null,
    k: number,
  ) {
    const rankingKey = `voting:ranking:${themeId}`;

    const [score1, score2, total] = await Promise.all([
      this.redis
        .zscore(rankingKey, subId1)
        .then((s) => (s ? parseFloat(s) : null)),
      this.redis
        .zscore(rankingKey, subId2)
        .then((s) => (s ? parseFloat(s) : null)),
      this.redis.zcard(rankingKey),
    ]);

    if (score1 === null || score2 === null || total === 0)
      throw new InternalServerErrorException();

    // 승률 기대값 계산 (Expected Score)
    const expected1 = 1 / (1 + Math.pow(10, (score2 - score1) / 400));
    const expected2 = 1 - expected1;

    // 점수 변화량(Delta) 계산
    const actual1 = winnerSide === 1 ? 1 : winnerSide === 2 ? 0 : 0.5;
    const delta1 = parseFloat((k * (actual1 - expected1)).toFixed(2));
    const delta2 = -delta1; // 제로섬 게임

    // Redis 업데이트 (점수 변경)
    const pipeline = this.redis.pipeline();
    pipeline.zincrby(rankingKey, delta1, subId1);
    pipeline.zincrby(rankingKey, delta2, subId2);
    await pipeline.exec();

    // 현재 순위 (상위 %) 계산
    const [rank1, rank2] = await Promise.all([
      this.redis.zrevrank(rankingKey, subId1),
      this.redis.zrevrank(rankingKey, subId2),
    ]);

    if (rank1 === null || rank2 === null)
      throw new InternalServerErrorException();

    const getPercentile = (rank: number): number => {
      return Math.ceil(((rank + 1) / total) * 100);
    };

    return {
      sub1: {
        prevScore: score1,
        winP: expected1,
        topP: getPercentile(rank1),
      },
      sub2: {
        prevScore: score2,
        winP: expected2,
        topP: getPercentile(rank2),
      },
      delta: Math.abs(delta1),
    };
  }

  /*
   * 노출 횟수가 적은 하위 20%의 submission_id 중 두 개를 랜덤으로 반환
   */
  private async getRandomSubIds(themeId: string, excludeIds: string[]) {
    const exposureKey = `voting:exposure:${themeId}`;

    const total = await this.redis.zcard(exposureKey);
    if (total === 0 || total - excludeIds.length < 2)
      throw new UnprocessableEntityException();

    // 하위 20% 구간 설정 (최소 10개)
    const limit = Math.max(Math.floor(total * 0.2), 10);
    const candidates = await this.redis.zrange(exposureKey, 0, limit);

    // 필터링
    const filtCand = candidates.filter((id) => !excludeIds.includes(id));
    const getRandomPair = (candidates: string[]) => {
      const temp = [...candidates];

      const idx1 = Math.floor(Math.random() * temp.length);
      const subId1 = temp.splice(idx1, 1)[0];

      const idx2 = Math.floor(Math.random() * temp.length);
      const subId2 = temp[idx2];

      return [subId1, subId2];
    };

    // 만약 후보가 너무 적다면 전체에서 랜덤하게 선택
    if (filtCand.length < 2) {
      const allIds = await this.redis.zrange(exposureKey, 0, -1);
      const filtAll = allIds.filter((id) => !excludeIds.includes(id));
      return getRandomPair(filtAll);
    }

    return getRandomPair(filtCand);
  }

  private async createEmptyVote(userId: string, themeId: string) {
    const vote = await this.voteRepo.findOne({
      where: { user_id: userId, theme_id: themeId, voted_at: IsNull() },
    });

    if (vote) {
      return {
        vote_id: vote.vote_id,
        sub_id1: vote.sub_id1,
        sub_id2: vote.sub_id2,
      };
    }

    const mySubs = await this.submissionRepo.find({
      where: { user_id: userId, theme_id: themeId },
      select: ['submission_id'],
    });
    const mySubIds = mySubs.map((s) => s.submission_id);

    const [subId1, subId2] = await this.getRandomSubIds(themeId, [...mySubIds]);
    const newVote = await this.voteRepo.save({
      theme_id: themeId,
      user_id: userId,
      sub_id1: subId1,
      sub_id2: subId2,
    });

    const exposureKey = `voting:exposure:${themeId}`;

    const pipeline = this.redis.pipeline();
    pipeline.zincrby(exposureKey, 1, subId1);
    pipeline.zincrby(exposureKey, 1, subId2);
    await pipeline.exec();

    return {
      vote_id: newVote.vote_id,
      sub_id1: subId1,
      sub_id2: subId2,
    };
  }

  async createVote(userId: string, themeId: string, dto: CreateVoteDto) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.status !== 'VOTING') throw new GoneException();

    const voteCount = await this.voteRepo.count({
      where: { user_id: userId, theme_id: themeId, voted_at: Not(IsNull()) },
    });

    if (dto.vote_id === null) {
      const newVote = await this.createEmptyVote(userId, themeId);
      return {
        data: {
          ...newVote,
          vote_point: voteCount,
        },
      };
    }

    const vote = await this.voteRepo.findOne({
      where: { vote_id: dto.vote_id },
    });

    if (!vote || vote.user_id !== userId || vote.theme_id !== themeId)
      throw new BadRequestException('투표 정보가 올바르지 않아요!');

    if (dto.sub_id1 !== vote.sub_id1 || dto.sub_id2 !== vote.sub_id2)
      throw new BadRequestException('후보 정보가 올바르지 않아요!');

    // DB 레벨에서 voted_at이 null인 경우에만 업데이트를 수행하여 중복 투표를 차단
    const voteUpdated = await this.voteRepo.update(
      {
        vote_id: dto.vote_id,
        voted_at: IsNull(),
      },
      { voted_at: new Date() },
    );

    if (voteUpdated.affected === 0)
      throw new BadRequestException('이미 투표가 처리되었어요!');

    const result = await this.handleVote(
      themeId,
      dto.sub_id1,
      dto.sub_id2,
      dto.winner_side,
      this.getDynamicK(voteCount),
    );

    await this.voteRepo.update(
      { vote_id: dto.vote_id },
      {
        sub_id1_score: result.sub1.prevScore,
        sub_id2_score: result.sub2.prevScore,
        delta: result.delta,
        win_sub_id:
          dto.winner_side === 1
            ? dto.sub_id1
            : dto.winner_side === 2
              ? dto.sub_id2
              : null,
        lose_sub_id:
          dto.winner_side === 1
            ? dto.sub_id2
            : dto.winner_side === 2
              ? dto.sub_id1
              : null,
      },
    );

    const getTopStat = (topP: number) => {
      if (topP <= 10) return 'Top 10%';
      if (topP <= 30) return 'Top 30%';
      if (topP <= 50) return 'Top 50%';
      return 'Novice';
    };

    const newVote = await this.createEmptyVote(userId, themeId);
    return {
      data: {
        ...newVote,
        winP1: result.sub1.winP,
        winP2: result.sub2.winP,
        topP1: getTopStat(result.sub1.topP),
        topP2: getTopStat(result.sub2.topP),
        vote_point: voteCount + 1,
      },
    };
  }

  async getVoteStatus(userId: string, themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (!(schedule.status === 'VOTING' || schedule.status === 'COMPLETE_READY'))
      throw new NotFoundException();

    const voteCount = await this.voteRepo.count({
      where: { user_id: userId, theme_id: themeId, voted_at: Not(IsNull()) },
    });

    const mySubs = await this.submissionRepo.find({
      where: { user_id: userId, theme_id: themeId },
      select: ['submission_id'],
    });
    const mySubIds = mySubs.map((s) => s.submission_id);

    if (mySubIds.length === 0) {
      return {
        data: {
          best_rank: null,
          vote_point: voteCount,
        },
      };
    }

    const rankingKey = `voting:ranking:${themeId}`;

    const pipeline = this.redis.pipeline();
    mySubIds.forEach((id) => pipeline.zrevrank(rankingKey, id));

    const results = await pipeline.exec();
    // results 형식: [[null, rank0], [null, rank1], ...]

    if (!results) {
      return {
        data: {
          best_rank: null, // 조회 실패
          vote_point: voteCount,
        },
      };
    }

    let bestRank: number | null = null;
    results.forEach((res) => {
      const rank = res[1] as number | null;
      if (rank !== null && (bestRank === null || rank < bestRank))
        bestRank = rank;
    });

    return {
      data: {
        best_rank: bestRank !== null ? bestRank + 1 : null,
        vote_point: voteCount,
      },
    };
  }
}
