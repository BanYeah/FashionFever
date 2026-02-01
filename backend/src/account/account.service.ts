import {
  Injectable,
  NotFoundException, // 404
  ConflictException, // 409
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { CryptoUtil } from 'src/common/utils/crypto.util';
import { AuthService } from 'src/auth/auth.service';

import { User } from '../auth/entities/user.entity';
import { Judge } from '../auth/entities/judge.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Judge) private judgeRepo: Repository<Judge>,
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

  async removeUser(minicode: string) {
    const user = await this.userRepo.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    await this.userRepo.remove(user);
  }

  async expelJudge(minicode: string) {
    const judge = await this.judgeRepo.findOne({
      where: { minicode },
    });

    if (!judge) throw new NotFoundException(); // 404

    await this.judgeRepo.remove(judge);
  }
}
