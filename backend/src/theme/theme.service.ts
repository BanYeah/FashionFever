import {
  Injectable,
  BadRequestException, // 400
  NotFoundException, // 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner, In } from 'typeorm';

import { R2Service } from 'src/common/r2/r2.service';

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
  ) {}

  private async validateSchedule(
    queryRunner: QueryRunner,
    enrollStartDate: Date,
    enrollEndDate: Date,
    reviewStartDate: Date,
    reviewEndDate: Date,
    voteStartDate: Date,
    voteEndDate: Date,
  ) {
    const now = new Date();
    const schedules = [
      enrollStartDate,
      enrollEndDate,
      reviewStartDate,
      reviewEndDate,
      voteStartDate,
      voteEndDate,
    ];

    if (!schedules.every((date) => date > now))
      throw new BadRequestException('과거 시점으로는 일정을 등록할 수 없어요!');

    // 참가/검수/투표 기간이 연속인지 확인
    {
      // 밀리초 단위로 변환해서 차이 계산 (1초 = 1000ms)
      const diffER = reviewStartDate.getTime() - enrollEndDate.getTime();

      if (diffER < 0 || diffER > 1000)
        throw new BadRequestException(
          `참가 기간과 검수 기간 일정이 연속되지 않아요.`,
        );

      const diffRV = voteStartDate.getTime() - reviewEndDate.getTime();

      if (diffRV < 0 || diffRV > 1000)
        throw new BadRequestException(
          `검수 기간과 투표 기간 일정이 연속되지 않아요.`,
        );
    }

    // 기존 테마 일정과 참가/검수/투표 기간이 겹치는지 확인
    {
      const eol = await this.checkOverlap(
        queryRunner,
        'enroll',
        enrollStartDate,
        enrollEndDate,
      );
      if (eol)
        throw new BadRequestException(
          `참가 기간이 ${this.formatDate(eol.enroll_start_at)} ~ ${this.formatDate(eol.enroll_end_at)}인 일정이 이미 존재해요.`,
        );

      const rol = await this.checkOverlap(
        queryRunner,
        'review',
        reviewStartDate,
        reviewEndDate,
      );
      if (rol)
        throw new BadRequestException(
          `검수 기간이 ${this.formatDate(rol.review_start_at)} ~ ${this.formatDate(rol.review_end_at)}인 일정이 이미 존재합니다.`,
        );

      const vol = await this.checkOverlap(
        queryRunner,
        'vote',
        voteStartDate,
        voteEndDate,
      );
      if (vol)
        throw new BadRequestException(
          `투표 기간이 ${this.formatDate(vol.vote_start_at)} ~ ${this.formatDate(vol.vote_end_at)}인 일정이 이미 존재합니다.`,
        );
    }
  }

  private async checkOverlap(
    queryRunner: QueryRunner,
    type: 'enroll' | 'review' | 'vote',
    start: Date,
    end: Date,
    themeId?: string,
  ) {
    const query = queryRunner.manager
      .createQueryBuilder(Schedule, 'schedule')
      .where(
        `(schedule.${type}_start_at < :end AND schedule.${type}_end_at > :start)`,
        { start, end },
      );
    if (themeId) query.andWhere('schedule.theme_id != :themeId', { themeId });
    return await query.getOne();
  }

  private formatDate(date: Date) {
    return date.toISOString().split('T')[0].replaceAll('-', '.');
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
      // this.validateSchedule(
      //   queryRunner,
      //   dto.enroll_start_at,
      //   dto.enroll_end_at,
      //   dto.review_start_at,
      //   dto.review_end_at,
      //   dto.vote_start_at,
      //   dto.vote_end_at,
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

          try {
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
            } else throw new Error();
          } catch {
            throw new BadRequestException(
              '선물 이미지가 업로드되지 않은 선물이 있어요!',
            );
          }
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, data: { theme_id: themeId } };
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
    const take = 20;
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
      enroll_end_at: item.enroll_end_at,
      review_start_at: item.review_start_at,
      review_end_at: item.review_end_at,
      vote_start_at: item.vote_start_at,
      vote_end_at: item.vote_end_at,
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
          enroll_end_at: theme.enroll_end_at,
          review_start_at: theme.review_start_at,
          review_end_at: theme.review_end_at,
          vote_start_at: theme.vote_start_at,
          vote_end_at: theme.vote_end_at,
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
      // this.validateSchedule(
      //   queryRunner,
      //   dto.enroll_start_at,
      //   dto.enroll_end_at,
      //   dto.review_start_at,
      //   dto.review_end_at,
      //   dto.vote_start_at,
      //   dto.vote_end_at,
      // );

      const schedule = await queryRunner.manager.findOne(Schedule, {
        where: { theme_id: themeId },
      });
      if (!schedule) throw new NotFoundException('존재하지 않는 테마예요!');

      // const now = new Date();
      // // 이미 시작된 일정이거나 시작하기 1시간 전인 일정을 수정하지는 않는지 확인
      // {
      //   const ONE_HOUR_MS = 60 * 60 * 1000;
      //   const limitTime = new Date(now.getTime() + ONE_HOUR_MS);

      //   const scheduleChecks = [
      //     [dto.enroll_start_at, schedule.enroll_start_at, '참가 시작'],
      //     [dto.enroll_end_at, schedule.enroll_end_at, '참가 종료'],
      //     [dto.review_start_at, schedule.review_start_at, '검수 시작'],
      //     [dto.review_end_at, schedule.review_end_at, '검수 종료'],
      //     [dto.vote_start_at, schedule.vote_start_at, '투표 시작'],
      //     [dto.vote_end_at, schedule.vote_end_at, '투표 종료'],
      //   ];

      //   for (const [newDate, oldDate, label] of scheduleChecks) {
      //     const isChanged =
      //       new Date(newDate).getTime() !== new Date(oldDate).getTime();
      //     const isImminent = new Date(oldDate) < limitTime;

      //     if (isChanged && isImminent)
      //       throw new BadRequestException(
      //         `이미 시작되었거나 시작이 1시간 미만으로 남은 '${label}' 일정은 수정할 수 없어요!`,
      //       );
      //   }
      // }

      await queryRunner.manager.update(
        Schedule,
        { theme_id: themeId },
        {
          enroll_start_at: dto.enroll_start_at,
          enroll_end_at: dto.enroll_end_at,
          review_start_at: dto.review_start_at,
          review_end_at: dto.review_end_at,
          vote_start_at: dto.vote_start_at,
          vote_end_at: dto.vote_end_at,
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

          try {
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
            } else throw new Error();
          } catch {
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

      return { success: true, data: { theme_id: themeId } };
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

      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
