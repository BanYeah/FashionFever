import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule as CronModule } from '@nestjs/schedule';
import { RedisModule } from './common/redis/redis.module';
import { R2Module } from './common/r2/r2.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ThemeModule } from './theme/theme.module';
import { SubmissionModule } from './submission/submission.module';
import { ReviewModule } from './review/review.module';
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE_NAME'),

        // 각 모듈에서 TypeOrmModule.forFeature([User])와 같이 등록된 엔티티들 자동 수집
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    CronModule.forRoot(),
    RedisModule,
    R2Module,
    AuthModule,
    AccountModule,
    ScheduleModule,
    ThemeModule,
    SubmissionModule,
    ReviewModule,
    VoteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
