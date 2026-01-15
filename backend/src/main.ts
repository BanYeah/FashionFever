import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Logging
  app.use(morgan('dev'));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Pocket Mini: Fashion Fever Event API Service')
    .setDescription(
      'Web-based Re-implementation of the Pocket Mini: Fashion Fever Event를 위한 API 명세서입니다.',
    )
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:8000/api로 접속

  await app.listen(8000);
}
bootstrap();
