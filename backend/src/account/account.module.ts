import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Judge } from '../auth/entities/judge.entity';
import { AuthModule } from 'src/auth/auth.module';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Judge]),
    AuthModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule { }
