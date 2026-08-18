import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { User } from '../../user/entities/user.entity';
import { MailService } from '../../common/mail/mail.service';
import { RedisService } from '../../common/redis/redis.service';
import { randomUUID } from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CompleteProfileDto } from './dto/complete-profile.dto';
@Injectable()
export class AuthService {
  private readonly OTP_TTL = 5 * 60 * 1000;

  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    private readonly jwt: JwtService,

    private readonly config: ConfigService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly mailService: MailService,

    private readonly redisService: RedisService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    );
  }

  // ---------- Register Initiate ----------

  async initiateRegister(email: string, password: string): Promise<void> {
    const exists = await this.users.findOneBy({ email });

    if (exists) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.cacheManager.set(`otp:${email}`, otp, this.OTP_TTL);

    await this.cacheManager.set(`pwd:${email}`, hashedPassword, this.OTP_TTL);

    await this.mailService.sendOtp(email, otp);
  }

  // ---------- Register Complete ----------

  async completeRegister(
    email: string,
    otp: string,
    full_name?: string,
  ): Promise<string> {
    const storedOtp = await this.cacheManager.get<string>(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new HttpException('Invalid or expired OTP', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await this.cacheManager.get<string>(`pwd:${email}`);

    if (!hashedPassword) {
      throw new HttpException(
        'Registration session expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    const exists = await this.users.findOneBy({ email });

    if (exists) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    const user = this.users.create({
      email,
      password: hashedPassword,
      full_name,
    });

    await this.users.save(user);

    await this.cacheManager.del(`otp:${email}`);
    await this.cacheManager.del(`pwd:${email}`);

    return this.generateToken(user);
  }

  // ---------- Email / Password Login ----------

  async login(email: string, password: string): Promise<string> {
    const user = await this.users.findOneBy({ email });

    if (!user || !user.password) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return this.generateToken(user);
  }

  // ---------- Google Login ----------

  async loginWithGoogle(idToken: string): Promise<string> {
    const googleClientId = this.config.getOrThrow<string>('GOOGLE_CLIENT_ID');

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      throw new HttpException('Invalid Google token', HttpStatus.UNAUTHORIZED);
    }

    const email = payload.email;
    const google_id = payload.sub;

    let user = await this.users.findOne({
      where: { google_id },
    });

    if (!user) {
      user = await this.users.findOne({
        where: { email },
      });

      if (user) {
        user.google_id = google_id;

        await this.users.save(user);
      } else {
        user = this.users.create({
          email,
          google_id,
        });

        await this.users.save(user);
      }
    }

    return this.generateToken(user);
  }

  // ---------- Logout ----------

  async logout(token?: string): Promise<void> {
    if (!token) {
      throw new HttpException(
        'Authorization token is required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = this.jwt.decode<JwtPayload>(token);

    if (!payload || typeof payload === 'string') {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    if (!payload.jti) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const remainingTtl = payload.exp
      ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 0)
      : 0;

    if (remainingTtl > 0) {
      await this.redisService.set(
        `auth:revoked:${payload.jti}`,
        '1',
        remainingTtl,
      );
    }
  }
  // Complete profile
  async completeProfile(
    userId: string,
    dto: CompleteProfileDto,
  ): Promise<string> {
    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.role) {
      throw new HttpException(
        'Profile has already been completed',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.role = dto.role;

    if (dto.full_name !== undefined) {
      user.full_name = dto.full_name;
    }

    if (dto.location !== undefined) {
      user.location = dto.location;
    }

    await this.users.save(user);

    return this.generateToken(user);
  }

  // ---------- Generate JWT ----------

  private generateToken(user: User): string {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: randomUUID(),
    });
  }
}
