import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
