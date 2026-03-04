import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  UnauthorizedException, // 401
  NotFoundException, // 404
  ConflictException, // 409
  InternalServerErrorException, // 500
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Redis from 'ioredis';
import bcrypt from 'bcrypt';
import { timingSafeEqual } from 'crypto';
import { CryptoUtil } from 'src/common/utils/crypto.util';

import { User } from './entities/user.entity';
import { Judge } from './entities/judge.entity';

import { LoginDto } from './dto/login.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Judge) private judgeRepo: Repository<Judge>,
  ) {}

  // 12자리 랜덤 입장 코드 생성기
  public generateRandomEnterCode(): string {
    const characters =
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'; // Base58

    let result = '';
    for (let i = 0; i < 12; i++)
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );

    return result;
  }

  async createUser(minicode: string): Promise<void> {
    const isExist = await this.userRepo.exists({ where: { minicode } });
    if (isExist) throw new ConflictException(); // 409

    const rawEnterCode = this.generateRandomEnterCode();
    const encryptedCode = CryptoUtil.encrypt(rawEnterCode);

    const newUser = this.userRepo.create({
      minicode,
      enter_code: encryptedCode,
    });

    await this.userRepo.save(newUser);
  }

  async checkUserExist(minicode: string): Promise<void> {
    const isExist = await this.userRepo.exists({ where: { minicode } });
    if (!isExist) throw new NotFoundException(); // 404
  }

  async checkJudgeExist(minicode: string): Promise<void> {
    const isExist = await this.judgeRepo.exists({ where: { minicode } });
    if (!isExist) throw new NotFoundException(); // 404
  }

  private verifyEnterCode(rawCode: string, encryptedCode: string): void {
    try {
      const decrypted = CryptoUtil.decrypt(encryptedCode);

      const bufRaw = Buffer.from(rawCode);
      const bufDecrypted = Buffer.from(decrypted);

      if (bufDecrypted.length !== bufRaw.length)
        throw new UnauthorizedException();

      if (!timingSafeEqual(bufDecrypted, bufRaw))
        throw new UnauthorizedException();
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new InternalServerErrorException(); // 500
    }
  }

  async validateUser(minicode: string, enterCode: string): Promise<User> {
    const lockKey = `lock:${minicode}`;

    const attempts = await this.redis.get(lockKey);
    if (attempts && parseInt(attempts, 10) >= 5) {
      const timeLeft = await this.redis.ttl(lockKey);
      const minutes = Math.ceil(timeLeft / 60);

      throw new HttpException(
        `과도한 로그인 시도로 접속이 제한되었습니다. 약 ${minutes}분 후 다시 시도해주세요.`,
        HttpStatus.LOCKED,
      ); // 423
    }

    const user = await this.userRepo.findOne({ where: { minicode } });
    if (!user) throw new UnauthorizedException(); // 401

    try {
      this.verifyEnterCode(enterCode, user.enter_code);
      await this.redis.del(lockKey);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        const current = await this.redis.incr(lockKey); // 1 증가
        if (current === 1) await this.redis.expire(lockKey, 900); // 첫 실패 시 15분(900초) 유효기간 설정
        throw e;
      }
      throw new InternalServerErrorException(); // 500
    }

    return user;
  }

  async validateJudge(minicode: string, enterCode: string): Promise<User> {
    const lockKey = `lock:${minicode}`;

    const attempts = await this.redis.get(lockKey);
    if (attempts && parseInt(attempts, 10) >= 5) {
      const timeLeft = await this.redis.ttl(lockKey);
      const minutes = Math.ceil(timeLeft / 60);

      throw new HttpException(
        `과도한 로그인 시도로 접속이 제한되었습니다. 약 ${minutes}분 후 다시 시도해주세요.`,
        HttpStatus.LOCKED,
      ); // 423
    }

    const user = await this.userRepo.findOne({
      where: { minicode },
      relations: { judge: true }, // Left Join
    });
    if (!user || !user.judge) throw new UnauthorizedException(); // 401

    try {
      this.verifyEnterCode(enterCode, user.enter_code);
      await this.redis.del(lockKey);
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        const current = await this.redis.incr(lockKey); // 1 증가
        if (current === 1) await this.redis.expire(lockKey, 900); // 첫 실패 시 15분(900초) 유효기간 설정
        throw e;
      }
      throw new InternalServerErrorException(); // 500
    }

    return user;
  }

  async validateAdmin(enterCode: string, ip: string): Promise<void> {
    const ipKey = `admin_lock:${ip}`;

    const attempts = await this.redis.get(ipKey);
    if (attempts && parseInt(attempts, 10) >= 10)
      throw new HttpException(
        'Your IP is temporarily blocked.',
        HttpStatus.LOCKED,
      ); // 423

    const isAuthorized = await bcrypt.compare(
      enterCode,
      process.env.ADMIN_KEY!,
    );

    if (!isAuthorized) {
      const current = await this.redis.incr(ipKey); // 1 증가
      if (current === 1) await this.redis.expire(ipKey, 3600); // 첫 실패 시 1시간 유효기간 설정
      throw new UnauthorizedException(); // 401
    }

    await this.redis.del(ipKey);
  }
}
