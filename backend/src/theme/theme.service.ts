import {
  Injectable,
  BadRequestException, // 400
  NotFoundException, // 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Not, In } from 'typeorm';

import { R2Service } from 'src/common/r2/r2.service';
import { PurgeCacheUtil } from 'src/common/utils/purge-cache.util';

import { Schedule } from './entities/schedule.entity';
import { Banner } from './entities/banner.entity';
import { Header } from './entities/header.entity';

import { User } from 'src/auth/entities/user.entity';
import { Reviewer } from './entities/reviewer.entity';
import { ThemeJudge } from './entities/theme-judge.entity';

import { GiftCollection } from 'src/gift/entities/gift-collection.entity';
import { Gift } from 'src/gift/entities/gift.entity';

import { ThemeFormDto } from './dto/theme-form.dto';

@Injectable()
export class ThemeService {
  constructor(
    private dataSource: DataSource,
    private readonly r2Service: R2Service,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    @InjectRepository(GiftCollection)
    private giftRepo: Repository<GiftCollection>,
  ) {}

  async getThemes(page: number) {
    const take = 5;
    const skip = (page - 1) * take;

    const [schedule, total] = await this.scheduleRepo.findAndCount({
      where: { status: Not('PREPARING') },
      order: { enroll_start_at: 'DESC' as const },
      take: take,
      skip: skip,
      relations: ['banner'],
    });

    const data = schedule.map((item) => ({
      theme_id: item.theme_id,
      banner_url: item.banner.banner_url,

      enroll_start_at: item.enroll_start_at,
      review_start_at: item.review_start_at,
      vote_start_at: item.vote_start_at,
      complete_start_at: item.complete_start_at,
      status: item.status,
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

  async getThemeHeader(themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId, status: Not('PREPARING') },
      relations: ['header'],
    });
    if (!schedule || !schedule.header) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
        name: schedule.header.name,
        desc: schedule.header.desc,
        bg_limit: schedule.header.bg_limit,
      },
    };
  }

  async getThemeGifts(themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId, status: Not('PREPARING') },
    });
    if (!schedule) throw new NotFoundException();

    const collections = await this.giftRepo.find({
      where: { theme_id: themeId },
      relations: ['gifts'],
      order: {
        heart_rate: 'DESC',
        gifts: {
          collection_order: 'ASC',
        },
      },
    });
    if (!collections) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
        collections: collections.map((col) => ({
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
        })),
      },
    };
  }

  async getThemeStatus(themeId: string) {
    const schedule = await this.scheduleRepo.findOne({
      where: { theme_id: themeId, status: Not('PREPARING') },
    });
    if (!schedule) throw new NotFoundException();

    return {
      data: {
        theme_id: schedule.theme_id,
        status: schedule.status,
      },
    };
  }

  /* Theme Setting */
  private async validateSchedule(
    enrollStartAt: Date,
    reviewStartAt: Date,
    voteStartAt: Date,
    completeStartAt: Date,
    themeId?: string,
  ) {
    const now = new Date();
    const schedules = [
      enrollStartAt,
      reviewStartAt,
      voteStartAt,
      completeStartAt,
    ];

    if (!schedules.every((date) => date > now))
      throw new BadRequestException('과거 시점으로는 일정을 등록할 수 없어요!');

    if (
      enrollStartAt >= reviewStartAt ||
      reviewStartAt >= voteStartAt ||
      voteStartAt >= completeStartAt
    )
      throw new BadRequestException(
        '각 기간은 이전 기간이 끝난 후 시작되어야 하며, 시작 시간은 종료 시간보다 빨라야 해요!',
      );

    const MAX_DAYS = 7;
    const MAX_DIFF_MS = MAX_DAYS * 24 * 60 * 60 * 1000;

    const diffMs = completeStartAt.getTime() - voteStartAt.getTime();
    if (diffMs > MAX_DIFF_MS)
      throw new BadRequestException('투표 기간은 최대 7일을 넘길 수 없어요!');

    // 기존 테마와 투표 기간이 겹치는지 확인
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    });

    const query = this.scheduleRepo
      .createQueryBuilder('schedule')
      .where(
        '(:start_at < schedule.complete_start_at AND schedule.vote_start_at < :end_at)',
        { start_at: voteStartAt, end_at: completeStartAt },
      );
    if (themeId) query.andWhere('schedule.theme_id != :themeId', { themeId });
    const overlap = await query.getOne();

    if (overlap) {
      const otherStartAt =
        formatter.format(overlap.vote_start_at) + ' (00:00:00)';
      const otherEndAt =
        formatter.format(
          overlap.complete_start_at.setDate(
            overlap.complete_start_at.getDate() - 1,
          ),
        ) + ' (23:59:59)';

      throw new BadRequestException(
        `투표 기간이 ${otherStartAt} ~ ${otherEndAt}인 테마가 이미 존재해요.`,
      );
    }
  }

  async createThemeSetting(
    dto: ThemeFormDto,
    bannerFile: Express.Multer.File | null,
    giftFiles: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const uploadedFiles: string[] = [];

    try {
      // Schedule
      // await this.validateSchedule(
      //   dto.enroll_start_at,
      //   dto.review_start_at,
      //   dto.vote_start_at,
      //   dto.complete_start_at,
      // );

      const schedule = queryRunner.manager.create(Schedule, {
        ...dto,
        status: 'PREPARING',
      });
      const savedSchedule = await queryRunner.manager.save(schedule);
      const themeId = savedSchedule.theme_id;

      // Banner
      if (bannerFile !== null) {
        const bannerUrl = await this.r2Service.uploadImage(
          bannerFile,
          'theme-banner',
        );
        uploadedFiles.push(bannerUrl);

        await queryRunner.manager.save(Banner, {
          theme_id: themeId,
          banner_url: bannerUrl,
        });
      } else if (dto.banner_url) {
        await queryRunner.manager.save(Banner, {
          theme_id: themeId,
          banner_url: dto.banner_url,
        });
      } else throw new BadRequestException('배너 이미지는 필수예요!');

      // Header
      await queryRunner.manager.save(Header, { theme_id: themeId, ...dto });

      // Reviewer
      if (dto.reviewer_minicode) {
        const reviewerUser = await this.userRepo.findOneBy({
          minicode: dto.reviewer_minicode,
        });
        if (!reviewerUser)
          throw new BadRequestException(
            '입력하신 미니코드에 해당하는 심사위원을 찾을 수 없어요.',
          );

        await queryRunner.manager.save(Reviewer, {
          theme_id: themeId,
          user_id: reviewerUser.user_id,
        });
      } else {
        await queryRunner.manager.save(Reviewer, {
          theme_id: themeId,
          user_id: null,
        });
      }

      // ThemeJudge
      const judgeUsers = await this.userRepo.find({
        where: { minicode: In(dto.judge_minicodes) },
      });

      const judges = judgeUsers.map((user) => ({
        theme_id: themeId,
        user_id: user.user_id,
      }));

      if (judges.length > 0)
        await queryRunner.manager.insert(ThemeJudge, judges);

      // GiftCollection & Gift
      for (const colDto of dto.collections) {
        const { gifts, ...collectionData } = colDto;

        const collection = await queryRunner.manager.save(GiftCollection, {
          theme_id: themeId,
          ...collectionData,
        });

        for (const [index, giftDto] of gifts.entries()) {
          const { gift_url, gift_file_order, ...giftData } = giftDto;

          if (gift_file_order !== null) {
            const giftUrl = await this.r2Service.uploadImage(
              giftFiles[gift_file_order],
              'theme-gift',
            );
            uploadedFiles.push(giftUrl);

            await queryRunner.manager.save(Gift, {
              gift_collection_id: collection.gift_collection_id,
              ...giftData,
              gift_url: giftUrl,
              collection_order: index + 1,
            });
          } else if (gift_url) {
            await queryRunner.manager.save(Gift, {
              gift_collection_id: collection.gift_collection_id,
              ...giftData,
              gift_url: gift_url,
              collection_order: index + 1,
            });
          } else {
            throw new BadRequestException(
              '선물 이미지가 업로드되지 않은 선물이 있어요!',
            );
          }
        }
      }

      await queryRunner.commitTransaction();
      return { data: { theme_id: themeId } };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (uploadedFiles.length > 0)
        this.r2Service.deleteImages(uploadedFiles).catch(() => {
          console.log(
            `[R2_ROLLBACK_ERROR] Failed to delete orphaned files: ${JSON.stringify(uploadedFiles)}`,
          );
        });

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getThemeSettings(page: number) {
    const take = 5;
    const skip = (page - 1) * take;

    const [schedule, total] = await this.scheduleRepo.findAndCount({
      order: { enroll_start_at: 'DESC' as const },
      take: take,
      skip: skip,
      relations: ['banner'],
    });

    const data = schedule.map((item) => ({
      theme_id: item.theme_id,
      banner_url: item.banner.banner_url,

      enroll_start_at: item.enroll_start_at,
      review_start_at: item.review_start_at,
      vote_start_at: item.vote_start_at,
      complete_start_at: item.complete_start_at,
      status: item.status,
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

  async getThemeSetting(themeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      /* 일정, 배너, 해더, 검수자 */
      const theme = await queryRunner.manager.findOne(Schedule, {
        where: { theme_id: themeId },
        relations: ['banner', 'header', 'reviewer', 'reviewer.user'],
      });
      if (!theme) throw new NotFoundException('존재하지 않는 테마예요!');

      /* 심사위원 */
      const judges = await queryRunner.manager.find(ThemeJudge, {
        where: { theme_id: themeId },
        relations: ['user'],
      });
      if (!judges) throw new NotFoundException('존재하지 않는 테마예요!');

      /* 선물 목록 */
      const collections = await queryRunner.manager.find(GiftCollection, {
        where: { theme_id: themeId },
        relations: ['gifts'],
        order: {
          heart_rate: 'DESC',
          gifts: {
            collection_order: 'ASC',
          },
        },
      });
      if (!collections) throw new NotFoundException('존재하지 않는 테마예요!');

      return {
        data: {
          name: theme.header.name,
          desc: theme.header.desc,
          bg_limt: theme.header.bg_limit,

          banner_url: theme.banner.banner_url,

          enroll_start_at: theme.enroll_start_at,
          review_start_at: theme.review_start_at,
          vote_start_at: theme.vote_start_at,
          complete_start_at: theme.complete_start_at,
          status: theme.status,

          reviewer_minicode: theme.reviewer.user?.minicode || null,
          judge_minicodes: judges.map((j) => j.user.minicode),

          collections: collections.map((col) => ({
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
          })),
        },
      };
    } catch (err) {
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async patchThemeSetting(
    themeId: string,
    dto: ThemeFormDto,
    bannerFile: Express.Multer.File | null,
    giftFiles: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const deletedFiles: Set<string> = new Set<string>();
    const uploadedFiles: string[] = [];

    try {
      // Schedule
      // await this.validateSchedule(
      //   dto.enroll_start_at,
      //   dto.review_start_at,
      //   dto.vote_start_at,
      //   dto.complete_start_at,
      //   themeId,
      // );

      const schedule = await queryRunner.manager.findOne(Schedule, {
        where: { theme_id: themeId },
      });
      if (!schedule) throw new NotFoundException('존재하지 않는 테마예요!');

      // 이미 시작된 일정을 수정하지는 않는지 확인
      // {
      //   const now = new Date();
      //   const scheduleChecks = [
      //     [dto.enroll_start_at, schedule.enroll_start_at, '참가 시작'],
      //     [dto.review_start_at, schedule.review_start_at, '검수 시작'],
      //     [dto.vote_start_at, schedule.vote_start_at, '투표 시작'],
      //     [dto.complete_start_at, schedule.complete_start_at, '결과 집계 시작'],
      //   ];

      //   for (const [newDate, oldDate, label] of scheduleChecks) {
      //     const isChanged =
      //       new Date(newDate).getTime() !== new Date(oldDate).getTime();
      //     const isStarted = new Date(oldDate) < now;

      //     if (isChanged && isStarted)
      //       throw new BadRequestException(
      //         `이미 시작된 '${label}' 일정은 수정할 수 없어요!`,
      //       );
      //   }
      // }

      await queryRunner.manager.update(
        Schedule,
        { theme_id: themeId },
        {
          enroll_start_at: dto.enroll_start_at,
          review_start_at: dto.review_start_at,
          vote_start_at: dto.vote_start_at,
          complete_start_at: dto.complete_start_at,
        },
      );

      // Banner
      const banner = await queryRunner.manager.findOne(Banner, {
        where: { theme_id: themeId },
      });
      if (!banner) throw new NotFoundException('존재하지 않는 테마예요!');

      deletedFiles.add(banner.banner_url);

      if (bannerFile !== null) {
        const bannerUrl = await this.r2Service.uploadImage(
          bannerFile,
          'theme-banner',
        );
        uploadedFiles.push(bannerUrl);

        await queryRunner.manager.update(
          Banner,
          { theme_id: themeId },
          { banner_url: bannerUrl },
        );
      } else if (dto.banner_url) {
        if (banner.banner_url === dto.banner_url)
          deletedFiles.delete(banner.banner_url);
        else
          await queryRunner.manager.update(
            Banner,
            { theme_id: themeId },
            { banner_url: dto.banner_url },
          );
      } else throw new BadRequestException('배너 이미지는 필수예요!');

      // Header
      await queryRunner.manager.update(
        Header,
        { theme_id: themeId },
        { name: dto.name, desc: dto.desc, bg_limit: dto.bg_limit },
      );

      // Reviewer
      if (dto.reviewer_minicode) {
        const reviewerUser = await this.userRepo.findOneBy({
          minicode: dto.reviewer_minicode,
        });
        if (!reviewerUser)
          throw new BadRequestException(
            '입력하신 미니코드에 해당하는 심사위원을 찾을 수 없어요.',
          );

        await queryRunner.manager.update(
          Reviewer,
          { theme_id: themeId },
          { user_id: reviewerUser.user_id },
        );
      } else {
        await queryRunner.manager.update(
          Reviewer,
          { theme_id: themeId },
          { user_id: null },
        );
      }

      // ThemeJudge
      await queryRunner.manager.delete(ThemeJudge, { theme_id: themeId });

      const judgeUsers = await this.userRepo.find({
        where: { minicode: In(dto.judge_minicodes) },
      });

      const judges = judgeUsers.map((user) => ({
        theme_id: themeId,
        user_id: user.user_id,
      }));

      if (judges.length > 0)
        await queryRunner.manager.insert(ThemeJudge, judges);

      // GiftCollection & Gift
      const giftCollections = await queryRunner.manager.find(GiftCollection, {
        where: { theme_id: themeId },
        relations: ['gifts'],
      });

      for (const collection of giftCollections)
        collection.gifts.forEach((gift) => {
          deletedFiles.add(gift.gift_url);
        });

      await queryRunner.manager.delete(GiftCollection, { theme_id: themeId });

      for (const colDto of dto.collections) {
        const { gifts, ...collectionData } = colDto;

        const collection = await queryRunner.manager.save(GiftCollection, {
          theme_id: themeId,
          ...collectionData,
        });

        for (const [index, giftDto] of gifts.entries()) {
          const { gift_url, gift_file_order, ...giftData } = giftDto;

          if (gift_file_order !== null) {
            const giftUrl = await this.r2Service.uploadImage(
              giftFiles[gift_file_order],
              'theme-gift',
            );
            uploadedFiles.push(giftUrl);

            await queryRunner.manager.save(Gift, {
              gift_collection_id: collection.gift_collection_id,
              ...giftData,
              gift_url: giftUrl,
              collection_order: index + 1,
            });
          } else if (gift_url) {
            deletedFiles.delete(gift_url);

            await queryRunner.manager.save(Gift, {
              gift_collection_id: collection.gift_collection_id,
              ...giftData,
              gift_url: gift_url,
              collection_order: index + 1,
            });
          } else {
            throw new BadRequestException(
              '선물 이미지가 업로드되지 않은 선물이 있어요!',
            );
          }
        }
      }

      await queryRunner.commitTransaction();

      this.r2Service.deleteImages(Array.from(deletedFiles)).catch(() => {
        console.log(
          `[R2_COMMIT_ERROR] Failed to delete orphaned files: ${JSON.stringify(Array.from(deletedFiles))}`,
        );
      });

      return { data: { theme_id: themeId } };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      this.r2Service.deleteImages(uploadedFiles).catch(() => {
        console.log(
          `[R2_ROLLBACK_ERROR] Failed to delete orphaned files: ${JSON.stringify(uploadedFiles)}`,
        );
      });

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteThemeSetting(themeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const deletedFiles: string[] = [];

    try {
      // Banner (banner_url)
      const banner = await queryRunner.manager.findOne(Banner, {
        where: { theme_id: themeId },
      });
      if (!banner) throw new NotFoundException('존재하지 않는 테마예요!');

      deletedFiles.push(banner.banner_url);

      // GiftCollection & Gift (gift_url)
      const giftCollections = await queryRunner.manager.find(GiftCollection, {
        where: { theme_id: themeId },
        relations: ['gifts'],
      });

      for (const collection of giftCollections)
        collection.gifts.forEach((gift) => {
          deletedFiles.push(gift.gift_url);
        });

      // Schedule (ON DELETE CASCADE)
      await queryRunner.manager.delete(Schedule, { theme_id: themeId });
      await queryRunner.commitTransaction();

      this.r2Service.deleteImages(deletedFiles).catch(() => {
        console.log(
          `[R2_COMMIT_ERROR] Failed to delete orphaned files: ${JSON.stringify(deletedFiles)}`,
        );
      });

      await PurgeCacheUtil.imageTheme(themeId).catch((err) =>
        console.error('[CACHE_ERROR] Failed to purge cache: ', err),
      );

      await PurgeCacheUtil.apiTheme([
        { theme_id: themeId, status: 'DELETE' },
      ]).catch((err) =>
        console.error('[CACHE_ERROR] Failed to purge cache: ', err),
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
