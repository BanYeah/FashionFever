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
import { CryptoUtil } from 'src/common/utils/crypto.util';

import { User } from './entities/user.entity';
import { Judge } from './entities/judge.entity';

import { CreateUserDto } from './dto/create-user.dto';
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

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const { minicode } = createUserDto;

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
    const isExist = await this.userRepo.exists({
      where: { minicode },
    });

    if (!isExist) throw new NotFoundException(); // 404
  }

  async checkJudgeExist(minicode: string): Promise<void> {
    const isExist = await this.judgeRepo.exists({
      where: { minicode },
    });

    if (!isExist) throw new NotFoundException(); // 404
  }

  private verifyEnterCode(rawCode: string, encryptedCode: string): void {
    try {
      const decrypted = CryptoUtil.decrypt(encryptedCode);
      if (decrypted !== rawCode) throw new UnauthorizedException(); // 401
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { minicode, enter_code } = loginDto;
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

    try {
      if (!user) throw new UnauthorizedException(); // 401
      this.verifyEnterCode(enter_code, user.enter_code);

      await this.redis.del(lockKey);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const current = await this.redis.incr(lockKey); // 1 증가
        if (current === 1) await this.redis.expire(lockKey, 900); // 첫 실패 시 15분(900초) 유효기간 설정
      }
      throw error;
    }
  }

  async validateJudge(loginDto: LoginDto): Promise<User> {
    const { minicode, enter_code } = loginDto;
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

    try {
      if (!user || !user.judge) throw new UnauthorizedException(); // 401
      this.verifyEnterCode(enter_code, user.enter_code);

      await this.redis.del(lockKey);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        const current = await this.redis.incr(lockKey); // 1 증가
        if (current === 1) await this.redis.expire(lockKey, 900); // 첫 실패 시 15분(900초) 유효기간 설정
      }
      throw error;
    }
  }

  async validateAdmin(loginAdminDto: LoginAdminDto, ip: string): Promise<void> {
    const { enter_code } = loginAdminDto;
    const ipKey = `admin_lock:${ip}`;

    const attempts = await this.redis.get(ipKey);
    if (attempts && parseInt(attempts, 10) >= 10)
      throw new HttpException(
        'Your IP is temporarily blocked.',
        HttpStatus.LOCKED,
      ); // 423

    const adminHash = process.env.ADMIN_KEY;
    if (!adminHash)
      throw new InternalServerErrorException('Admin configuration missing'); // 500

    const isMatch = await bcrypt.compare(enter_code, adminHash);
    if (!isMatch) {
      const current = await this.redis.incr(ipKey); // 1 증가
      if (current === 1) await this.redis.expire(ipKey, 3600); // 첫 실패 시 1시간 유효기간 설정

      throw new UnauthorizedException(); // 401
    }

    await this.redis.del(ipKey);
  }
}
