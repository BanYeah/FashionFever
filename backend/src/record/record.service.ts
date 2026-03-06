import {
  Injectable,
  BadRequestException, // 400
  NotFoundException, // 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Not,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Like,
} from 'typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { GiftCollection } from 'src/gift/entities/gift-collection.entity';

import { Submission } from 'src/submission/entities/submission.entity';
import { VoteStat } from 'src/vote/entities/vote-stat.entity';
import { Record } from './entities/record.entity';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(GiftCollection)
    private giftRepo: Repository<GiftCollection>,
    @InjectRepository(Submission) private submRepo: Repository<Submission>,
    @InjectRepository(VoteStat) private vStatRepo: Repository<VoteStat>,
    @InjectRepository(Record) private recordRepo: Repository<Record>,
  ) {}

  async getRecords(userId: string, themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.status !== 'COMPLETE') throw new NotFoundException();

    const submissions = await this.submRepo.find({
      where: { theme_id: themeId, user_id: userId },
      order: { final_rank: 'ASC' as const },
    });

    if (submissions.length === 0) throw new NotFoundException();

    return {
      data: submissions.map((sub) => {
        return {
          content_url: sub.content_url,
          vote_score: Number(sub.vote_score),
          like_score: Number(sub.like_score),
          judge_score: Number(sub.judge_score),
          adj_score: Number(sub.adj_score),
          final_score: Number(sub.final_score),
          final_rank: sub.final_rank,
        };
      }),
    };
  }

  async getTop1Record(userId: string, themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.status !== 'COMPLETE') throw new NotFoundException();

    const sub = await this.submRepo.findOne({
      where: { theme_id: themeId, user_id: userId },
      order: { final_rank: 'ASC' as const },
    });
    if (!sub) throw new NotFoundException();

    const col = await this.giftRepo.findOne({
      where: {
        theme_id: themeId,
        heart_rate: LessThanOrEqual(sub.final_score),
      },
      relations: ['gifts'],
      order: {
        heart_rate: 'DESC',
        gifts: { collection_order: 'ASC' },
      },
    });

    return {
      data: {
        content_url: sub.content_url,
        vote_score: Number(sub.vote_score),
        like_score: Number(sub.like_score),
        judge_score: Number(sub.judge_score),
        adj_score: Number(sub.adj_score),
        final_score: Number(sub.final_score),
        final_rank: sub.final_rank,
        collection: col
          ? {
              heart_rate: Number(col.heart_rate),
              gift_total_num: col.gift_total_num,
              is_random: col.is_random,
              is_same_theme: col.is_same_theme,
              theme_type: col.theme_type,
              rarity: col.rarity,

              gifts: col.gifts.map((gift) => ({
                theme_name: gift.theme_name,
                gift_name: gift.gift_name,
                gift_url: gift.gift_url,
              })),
            }
          : null,
      },
    };
  }

  async getRecordRankings(themeId: string, page: number) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.status !== 'COMPLETE') throw new NotFoundException();

    const take = 30;
    const skip = (page - 1) * take;

    const [submissions, total] = await this.submRepo.findAndCount({
      where: { theme_id: themeId },
      order: { final_rank: 'ASC' as const },
      take: take,
      skip: skip,
    });

    const data = submissions.map((sub) => ({
      content_url: sub.content_url,
      final_score: Number(sub.final_score),
      final_rank: sub.final_rank,
    }));

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  async getRecordStat(userId: string, themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.status !== 'COMPLETE') throw new NotFoundException();

    const voteStat = await this.vStatRepo.findOne({
      where: { user_id: userId, theme_id: themeId },
    });

    const record = await this.recordRepo.findOne({
      where: { user_id: userId, theme_id: themeId },
    });

    return {
      data: {
        best_rank: record ? record.best_final_rank : null,
        vote_point: voteStat ? voteStat.vote_count : 0,
      },
    };
  }

  async getDelivery(
    themeId: string,
    status: 'all' | 'complete' | 'incomplete',
    page: number,
    minicode?: string,
  ) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.status !== 'COMPLETE') throw new NotFoundException();

    const gift = await this.giftRepo.findOne({
      where: { theme_id: themeId },
      order: { heart_rate: 'ASC' as const },
    });
    if (!gift) throw new NotFoundException();

    const take = 40;
    const skip = (page - 1) * take;
    const whereCondition: any = {
      theme_id: themeId,
      best_final_score: MoreThanOrEqual(gift.heart_rate),
    };

    switch (status) {
      case 'complete':
        whereCondition.delivered_at = Not(IsNull());
        break;
      case 'incomplete':
        whereCondition.delivered_at = IsNull();
        break;
    }

    if (minicode)
      whereCondition.user = {
        minicode: Like(`${minicode.trim()}%`),
      };
    else whereCondition.user = Not(IsNull());

    const [records, total] = await this.recordRepo.findAndCount({
      where: whereCondition,
      order: { best_final_score: 'DESC' as const },
      take: take,
      skip: skip,
      relations: ['user'],
    });

    const data = records.map((record) => ({
      record_id: record.record_id,
      minicode: record.user?.minicode,
      best_final_score: Number(record.best_final_score),
      delivered_at: record.delivered_at,
    }));

    return {
      data: data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  async patchDelivery(recordId: string, status: 'complete' | 'incomplete') {
    switch (status) {
      case 'complete':
        await this.recordRepo.update(
          { record_id: recordId },
          { delivered_at: new Date() },
        );
        break;
      case 'incomplete':
        await this.recordRepo.update(
          { record_id: recordId },
          { delivered_at: null },
        );
        break;
    }
  }
}
