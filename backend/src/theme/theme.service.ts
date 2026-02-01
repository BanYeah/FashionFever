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
  ) {}

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
      const now = new Date();
      const schedulesDto = [
        dto.enroll_start_at,
        dto.enroll_end_at,
        dto.review_start_at,
        dto.review_end_at,
        dto.vote_start_at,
        dto.vote_end_at,
      ];

      if (!schedulesDto.every((date) => new Date(date) > now))
        throw new BadRequestException(
          '과거 시점으로는 일정을 등록할 수 없어요!',
        );

      // 기존 테마 일정과 참가/검수/투표 기간과 겹치는지 확인
      {
        const eol = await this.checkOverlap(
          queryRunner,
          'enroll',
          dto.enroll_start_at,
          dto.enroll_end_at,
        );
        if (eol) {
          throw new BadRequestException(
            `참가 기간이 ${this.formatDate(eol.enroll_start_at)} ~ ${this.formatDate(eol.enroll_end_at)}인 일정이 이미 존재해요.`,
          );
        }

        const rol = await this.checkOverlap(
          queryRunner,
          'review',
          dto.review_start_at,
          dto.review_end_at,
        );
        if (rol) {
          throw new BadRequestException(
            `검수 기간이 ${this.formatDate(rol.review_start_at)} ~ ${this.formatDate(rol.review_end_at)}인 일정이 이미 존재합니다.`,
          );
        }

        const vol = await this.checkOverlap(
          queryRunner,
          'vote',
          dto.vote_start_at,
          dto.vote_end_at,
        );
        if (vol) {
          throw new BadRequestException(
            `투표 기간이 ${this.formatDate(vol.vote_start_at)} ~ ${this.formatDate(vol.vote_end_at)}인 일정이 이미 존재합니다.`,
          );
        }
      }

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

  async getThemeSetting(themeId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      /* 일정, 배너, 해더, 검수자 */
      const theme = await queryRunner.manager.findOne(Schedule, {
        where: { theme_id: themeId },
        relations: ['banner', 'header', 'reviewer', 'reviewer.user'],
      });
      if (!theme) throw new NotFoundException();

      /* 심사위원 */
      const judges = await queryRunner.manager.find(ThemeJudge, {
        where: { theme_id: themeId },
        relations: ['user'],
      });
      if (!judges) throw new NotFoundException();

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
      if (!collections) throw new NotFoundException();

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
}
