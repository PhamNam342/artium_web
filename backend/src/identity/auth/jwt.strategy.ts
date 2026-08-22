import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RedisService } from '../../common/redis/redis.service';
import { t } from '../../common/utils/i18n.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    jti: string;
  }) {
    console.log('🔥 JWT PAYLOAD:', payload);
    const revoked = await this.redisService.exists(
      `auth:revoked:${payload.jti}`,
    );

    if (revoked) {
      throw new UnauthorizedException(t('auth.token_revoked'));
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
