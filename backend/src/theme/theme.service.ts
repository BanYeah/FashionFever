import {
  Injectable,
  BadRequestException, // 400
  NotFoundException, // 404
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

import { R2Service } from 'src/common/r2/r2.service';

import { Schedule } from './entities/schedule.entity';
import { Banner } from './entities/banner.entity';
import { Header } from './entities/header.entity';

import { User } from 'src/auth/entities/user.entity';
import { Reviewer } from './entities/reviewer.entity';
import { ThemeJudge } from './entities/theme-judge.entity';

import { GiftCollection } from 'src/gift/entities/gift-collection.entity';
import { Gift } from 'src/gift/entities/gift.entity';

import { CreateThemeSettingDto } from './dto/create-theme.dto';

@Injectable()
export class ThemeService {
  constructor(
    private dataSource: DataSource,
    private readonly r2Service: R2Service,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createThemeSetting(
    dto: CreateThemeSettingDto,
    bannerFile: Express.Multer.File,
    giftFiles: Express.Multer.File[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Schedule
      const now = new Date();
      const schedules = [
        dto.enroll_start_at,
        dto.enroll_end_at,
        dto.review_start_at,
        dto.review_end_at,
        dto.vote_start_at,
        dto.vote_end_at,
      ];
      if (!schedules.every((date) => new Date(date) > now)) {
        throw new BadRequestException(
          '과거 시점으로는 일정을 등록할 수 없어요!',
        );
      }

      const schedule = queryRunner.manager.create(Schedule, {
        ...dto,
        status: 'PREPARING',
      });
      const savedSchedule = await queryRunner.manager.save(schedule);
      const themeId = savedSchedule.theme_id;

      // Banner
      const bannerUrl = await this.r2Service.uploadImage(
        bannerFile,
        'theme-banner',
      );
      await queryRunner.manager.save(Banner, {
        theme_id: themeId,
        banner_url: bannerUrl,
      });

      // Header
      await queryRunner.manager.save(Header, { theme_id: themeId, ...dto });

      // Reviewer
      if (dto.reviewer_minicode === null) {
        await queryRunner.manager.save(Reviewer, {
          theme_id: themeId,
          user_id: null,
        });
      } else {
        const reviewerUser = await this.userRepo.findOneBy({
          minicode: dto.reviewer_minicode,
        });
        if (reviewerUser === null) {
          throw new BadRequestException(
            '입력하신 미니코드에 해당하는 심사위원을 찾을 수 없어요.',
          );
        }

        await queryRunner.manager.save(Reviewer, {
          theme_id: themeId,
          user_id: reviewerUser.user_id,
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
      let giftFileIdx = 0;
      for (const colDto of dto.collections) {
        const collection = await queryRunner.manager.save(GiftCollection, {
          theme_id: themeId,
          ...colDto,
        });

        for (const giftDto of colDto.gifts) {
          const giftUrl = await this.r2Service.uploadImage(
            giftFiles[giftFileIdx++],
            'theme-gift',
          );
          await queryRunner.manager.save(Gift, {
            gift_collection_id: collection.gift_collection_id,
            gift_url: giftUrl,
            ...giftDto,
          });
        }
      }

      await queryRunner.commitTransaction();
      return { success: true, data: { theme_id: themeId } };
    } catch (err) {
      await queryRunner.rollbackTransaction();
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
          ...theme,
          reviewer: theme.reviewer
            ? {
                theme_id: theme.reviewer.theme_id,
                user_id: theme.reviewer.user_id,
                minicode: theme.reviewer.user?.minicode || null,
              }
            : null,
          judges: judges.map((j) => ({
            theme_id: j.theme_id,
            user_id: j.user_id,
            minicode: j.user?.minicode || null,
          })),
          collections,
        },
      };
    } catch (err) {
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
