import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import session from 'express-session';

import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cloudflare 등을 통해 들어오는 실제 IP를 인식하기 위해
  app.set('trust proxy', true);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const apiPrefix = process.env.API_PREFIX!;
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성 제거
      forbidNonWhitelisted: true, // DTO에 없는 속성이 있으면 에러
      transform: true, // 네트워크로 넘어온 데이터를 DTO 타입으로 자동 변환
    }),
  );

  const redisClient = createClient({ url: 'redis://localhost:6379' });
  if (!redisClient.isOpen) await redisClient.connect().catch(console.error);

  const redisStore = new RedisStore({ client: redisClient });
  app.use(
    session({
      name: 'ff_session_id',
      store: redisStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // 배포 환경(HTTPS)에서는 true로
        maxAge: 1000 * 60 * 60 * 6, // 6시간
      },
    }),
  );

  // Logging
  app.use(morgan('dev'));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Pocket Mini: Fashion Fever Event API Service')
    .setDescription(
      'Web-based Re-implementation of the Pocket Mini: Fashion Fever Event를 위한 API 명세서입니다.',
    )
    .setVersion('1.0')
    .addCookieAuth('ff_session_id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:8080/api로 접속

  await app.listen(8080);
}
bootstrap();
