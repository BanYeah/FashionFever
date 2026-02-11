import {
  Injectable,
  ForbiddenException, // 403
  NotFoundException, // 404
  GoneException, // 410
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
  ) {}

  private async validateReviewer(session: any, themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
      relations: ['reviewer'],
    });
    if (!schedule || !schedule.reviewer) throw new NotFoundException();

    const canReview =
      session.account === 'admin' ||
      schedule.reviewer.user_id === session.user_id;
    if (!canReview) throw new ForbiddenException();
  }

  async getReviews(
    session: any,
    themeId: string,
    page: number,
    status: 'approved' | 'rejected',
  ) {
    await this.validateReviewer(session, themeId);

    const take = 30;
    const skip = (page - 1) * take;

    const [sub, total] = await this.submissionRepo.findAndCount({
      order: { reviewed_at: 'DESC' as const },
      take: take,
      skip: skip,
      where: {
        theme_id: themeId,
        is_approved: status === 'approved',
      },
    });

    const data = sub.map((item) => ({
      submission_id: item.submission_id,
      content_url: item.content_url,
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

  async getReviewPending(session: any, themeId: string) {
    await this.validateReviewer(session, themeId);

    const sub = await this.submissionRepo.findOne({
      where: {
        theme_id: themeId,
        is_approved: IsNull(),
      },
    });

    const total = await this.submissionRepo.count({
      where: { theme_id: themeId },
    });

    const reviewed = await this.submissionRepo.count({
      where: {
        theme_id: themeId,
        is_approved: Not(IsNull()),
      },
    });

    const data = sub
      ? {
          submission_id: sub.submission_id,
          content_url: sub.content_url,
        }
      : null;

    return {
      data: data,
      meta: {
        total,
        reviewed,
      },
    };
  }

  async patchReviewStatus(
    session: any,
    subId: string,
    status: 'approved' | 'rejected',
  ) {
    const sub = await this.submissionRepo.findOne({
      where: { submission_id: subId },
      relations: ['schedule', 'schedule.reviewer'],
    });
    if (!sub) throw new NotFoundException();

    const schedule = sub.schedule;
    if (!schedule || !schedule.reviewer) throw new NotFoundException();

    const canReview =
      session.account === 'admin' ||
      schedule.reviewer.user_id === session.user_id;
    if (!canReview) throw new ForbiddenException();

    if (schedule.status !== 'REVIEWING') throw new GoneException();

    sub.is_approved = status === 'approved';
    sub.reviewed_at = new Date();

    await this.submissionRepo.save(sub);
  }

  async getReviewStatus(session: any, themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId },
      relations: ['reviewer'],
    });
    if (!schedule || !schedule.reviewer) throw new NotFoundException();

    const canReview =
      session.account === 'admin' ||
      schedule.reviewer.user_id === session.user_id;
    if (!canReview) return { data: { can_review: false } };

    const total = await this.submissionRepo.count({
      where: { theme_id: themeId },
    });

    const reviewed = await this.submissionRepo.count({
      where: {
        theme_id: themeId,
        is_approved: Not(IsNull()),
      },
    });

    const rejected = await this.submissionRepo.count({
      where: {
        theme_id: themeId,
        is_approved: false,
      },
    });

    return {
      data: { can_review: true },
      meta: {
        total,
        reviewed,
        rejected,
      },
    };
  }
}
