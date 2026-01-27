import {
  Injectable,
  NotFoundException, // 404
  ConflictException, // 409
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CryptoUtil } from 'src/common/utils/crypto.util';
import { AuthService } from 'src/auth/auth.service';

import { User } from '../auth/entities/user.entity';
import { Judge } from '../auth/entities/judge.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Judge) private judgeRepository: Repository<Judge>,
    private authService: AuthService,
  ) {}

  async findAllUsers(page: number) {
    const take = 40;
    const skip = (page - 1) * take;

    const [users, total] = await this.userRepository.findAndCount({
      order: { created_at: 'DESC' },
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

  async findAllJudges(page: number) {
    const take = 40;
    const skip = (page - 1) * take;

    const [judges, total] = await this.judgeRepository.findAndCount({
      order: { appointed_at: 'DESC' },
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

  async findUserDetail(minicode: string) {
    const user = await this.userRepository.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    try {
      user.enter_code = CryptoUtil.decrypt(user.enter_code);
    } catch (e) {
      user.enter_code = 'DECRYPT_FAILED';
    }

    return user;
  }

  async findJudgeDetail(minicode: string) {
    const judge = await this.judgeRepository.findOne({
      where: { minicode },
    });

    if (!judge) throw new NotFoundException(); // 404
    return judge;
  }

  async resetUserEnterCode(minicode: string) {
    const user = await this.userRepository.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    const newRawEnterCode = this.authService.generateRandomEnterCode();

    user.enter_code = CryptoUtil.encrypt(newRawEnterCode);
    await this.userRepository.save(user);
  }

  async appointJudge(minicode: string) {
    const user = await this.userRepository.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    const isAlreadyJudge = await this.judgeRepository.exists({
      where: { minicode },
    });
    if (isAlreadyJudge) throw new ConflictException(); // 409

    const newJudge = this.judgeRepository.create({
      user_id: user.user_id,
      minicode: user.minicode,
    });

    await this.judgeRepository.save(newJudge);
  }

  async removeUser(minicode: string) {
    const user = await this.userRepository.findOne({
      where: { minicode },
    });

    if (!user) throw new NotFoundException(); // 404

    await this.userRepository.remove(user);
  }

  async expelJudge(minicode: string) {
    const judge = await this.judgeRepository.findOne({
      where: { minicode },
    });

    if (!judge) throw new NotFoundException(); // 404

    await this.judgeRepository.remove(judge);
  }
}
