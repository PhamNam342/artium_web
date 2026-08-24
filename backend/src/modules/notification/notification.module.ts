import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { Notification } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    ConfigModule,

    TypeOrmModule.forFeature([Notification]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as StringValue,
        },
      }),
    }),
  ],

  controllers: [NotificationController],

  providers: [NotificationService, NotificationGateway],

  exports: [NotificationService],
})
export class NotificationModule {}
