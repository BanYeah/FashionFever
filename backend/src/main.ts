import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api로 접속

  await app.listen(3000);
}
bootstrap();
