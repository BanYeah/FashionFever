import {
  Injectable,
  NotFoundException, // 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
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
    const schedule = await this.scheduleRepo.findOne({
      where: { status: 'VOTING' },
    });
    if (!schedule) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
      },
    };
  }

  async getJudgingNow(minicode: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: {
        status: 'VOTING',
        theme_judges: {
          user: { minicode: minicode },
        },
      },
      relations: ['theme_judges', 'theme_judges.user'],
    });
    if (!schedule) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
      },
    };
  }
}
