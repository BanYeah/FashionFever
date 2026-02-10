import {
  Injectable,
  NotFoundException, // 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { ThemeJudge } from 'src/theme/entities/theme-judge.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(ThemeJudge)
    private themeJudgeRepo: Repository<ThemeJudge>,
  ) {}

  async getTimeline() {
    const now = new Date();
    const timeline = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .select([
        'MIN(schedule.enroll_start_at) AS "min_enroll_start_at"',
        'MAX(schedule.complete_start_at) AS "max_complete_start_at"',
      ])
      .where('schedule.enroll_start_at <= :now', { now })
      .andWhere('schedule.complete_start_at > :now', { now })
      .getRawOne();

    return {
      data: {
        min_enroll_start_at: timeline ? timeline.min_enroll_start_at : null,
        max_complete_start_at: timeline ? timeline.max_complete_start_at : null,
      },
    };
  }

  async getVotingNow() {
    const now = new Date();
    const schedule = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.vote_start_at <= :now', { now })
      .andWhere('schedule.complete_start_at > :now', { now })
      .getOne();

    if (!schedule) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
      },
    };
  }

  async getJudgingNow(minicode: string) {
    const now = new Date();
    const schedule = await this.scheduleRepo
      .createQueryBuilder('schedule')
      .where('schedule.vote_start_at <= :now', { now })
      .andWhere('schedule.complete_start_at > :now', { now })
      .getOne();

    if (!schedule) throw new NotFoundException();

    const canJudge = await this.themeJudgeRepo.exists({
      where: {
        theme_id: schedule.theme_id,
        user: { minicode },
      },
      relations: ['user'],
    });

    if (!canJudge) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
      },
    };
  }
}
