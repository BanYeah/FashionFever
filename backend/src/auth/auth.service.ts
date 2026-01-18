import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoUtil } from 'src/common/utils/crypto.util';
import { User } from './entities/user.entity';
import { Judge } from './entities/judge.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Judge) private judgeRepository: Repository<Judge>,
  ) { }

  // 12자리 랜덤 입장 코드 생성기
  private generateRandomEnterCode(): string {
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

    const isExist = await this.userRepository.exists({ where: { minicode } });
    if (isExist) throw new ConflictException(); // 409

    const rawEnterCode = this.generateRandomEnterCode();
    const encryptedCode = CryptoUtil.encrypt(rawEnterCode);

    const newUser = this.userRepository.create({
      minicode,
      enter_code: encryptedCode,
    });

    await this.userRepository.save(newUser);
  }

  async checkUserExist(minicode: string): Promise<void> {
    const isExist = await this.userRepository.exists({
      where: { minicode },
    });

    if (!isExist) throw new NotFoundException(); // 404
  }

  async checkJudgeExist(minicode: string): Promise<void> {
    const isExist = await this.judgeRepository.exists({
      where: { minicode },
    });

    if (!isExist) throw new NotFoundException(); // 404

    return true;
  }
}
