import {
  Injectable,
  Inject,
  NotFoundException, // 404
  ConflictException, // 409
  UnprocessableEntityException, // 422
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like, In } from 'typeorm';

import Redis from 'ioredis';
import { CryptoUtil } from 'src/common/utils/crypto.util';
import { R2Service } from 'src/common/r2/r2.service';

import { User } from '../auth/entities/user.entity';
import { Judge } from '../auth/entities/judge.entity';
import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';

import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AccountService {
  constructor(
    private dataSource: DataSource,
    private readonly r2Service: R2Service,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Judge) private judgeRepo: Repository<Judge>,
    @InjectRepository(Schedule) private scheduleRepo: Repository<Schedule>,
    private authService: AuthService,
  ) {}

  async findAllUsers(page: number, minicode: string | null) {
    const minicodeTrim = minicode?.trim();

    const whereCondition = minicodeTrim
      ? { minicode: Like(`${minicodeTrim}%`) }
      : {};
    const orderCondition = minicodeTrim
      ? { minicode: 'ASC' as const }
      : { created_at: 'DESC' as const };

    const take = 40;
    const skip = (page - 1) * take;

    const [users, total] = await this.userRepo.findAndCount({
      where: whereCondition,
      order: orderCondition,
      take: take,
      skip: skip,
    });

    const decryptedUsers = users.map((user) => {
      try {
        return {
          ...user,
          enter_code: CryptoUtil.decrypt(user.enter_code),
        };
      } catch (e) {
        return {
          ...user,
          enter_code: 'DECRYPT_FAILED',
        };
      }
    });

    return {
      data: decryptedUsers,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  async findAllJudges(page: number, minicode: string | null) {
    const minicodeTrim = minicode?.trim();

    const whereCondition = minicodeTrim
      ? { minicode: Like(`${minicodeTrim}%`) }
      : {};
    const orderCondition = minicodeTrim
      ? { minicode: 'ASC' as const }
      : { appointed_at: 'DESC' as const };

    const take = 40;
    const skip = (page - 1) * take;

    const [judges, total] = await this.judgeRepo.findAndCount({
      where: whereCondition,
      order: orderCondition,
      take: take,
      skip: skip,
    });

    return {
      data: judges,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / take),
      },
    };
  }

  async resetUserEnterCode(minicode: string) {
    const user = await this.userRepo.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    const newRawEnterCode = this.authService.generateRandomEnterCode();

    user.enter_code = CryptoUtil.encrypt(newRawEnterCode);
    await this.userRepo.save(user);
  }

  async appointJudge(minicode: string) {
    const user = await this.userRepo.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    const isAlreadyJudge = await this.judgeRepo.exists({
      where: { minicode },
    });
    if (isAlreadyJudge) throw new ConflictException(); // 409

    const newJudge = this.judgeRepo.create({
      user_id: user.user_id,
      minicode: user.minicode,
    });

    await this.judgeRepo.save(newJudge);
  }

  private async purgeCache(userId: string) {
    const prefixes = [
      `${process.env.R2_PUBLIC_ENDPOINT}/submission/${userId}/`,
    ];

    const url = `https://api.cloudflare.com/client/v4/zones/${process.env.CACHE_ZONE_ID}/purge_cache`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CACHE_SECRET_ACCESS_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefixes: prefixes,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('[CACHE_ERROR]', errorData);
    }
  }

  async removeUser(minicode: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 투표가 진행 중인 테마가 있을 때는 유저 삭제 불가
      const schedules = await queryRunner.manager.count(Schedule, {
        where: { status: In(['VOTE_READY', 'VOTING', 'COMPLETE_READY']) },
      });
      if (schedules > 0) throw new UnprocessableEntityException();

      const user = await queryRunner.manager.findOne(User, {
        where: { minicode },
      });
      if (!user) throw new NotFoundException(); // 404

      const targets = await queryRunner.manager.find(Submission, {
        where: { user_id: user.user_id },
        select: ['content_url'],
      });

      if (targets.length > 0) {
        await queryRunner.manager.update(
          Submission,
          { user_id: user.user_id },
          { content_url: null },
        );
      }

      await queryRunner.manager.remove(user);
      await queryRunner.commitTransaction();

      if (targets.length > 0) {
        const deletedFiles = targets
          .map((t) => t.content_url)
          .filter((url): url is string => !!url);

        await this.r2Service.deleteImages(deletedFiles).catch(() => {
          console.log(
            `[R2_COMMIT_ERROR] Failed to delete orphaned files: ${JSON.stringify(deletedFiles)}`,
          );
        });

        await this.purgeCache(user.user_id).catch((err) =>
          console.error('[CACHE_ERROR]', err),
        );
      }
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async expelJudge(minicode: string) {
    const judge = await this.judgeRepo.findOne({
      where: { minicode },
    });

    if (!judge) throw new NotFoundException(); // 404

    await this.judgeRepo.remove(judge);
  }
}
