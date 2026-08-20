import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { MailModule } from '../../common/mail/mail.module';
import { User } from '../../user/entities/user.entity';
import { RedisModule } from '../../common/redis/redis.module';
@Module({
  imports: [
    ConfigModule,
    RedisModule,
    TypeOrmModule.forFeature([User]),

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

    MailModule,
  ],

  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
