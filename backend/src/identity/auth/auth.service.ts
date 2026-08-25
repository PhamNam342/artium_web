import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import { User, UserRole } from '../user/entities/user.entity';
import { MailService } from '../../common/mail/mail.service';
import { RedisService } from '../../common/redis/redis.service';
import { randomUUID } from 'crypto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { t } from '../../common/utils/i18n.util';
import { SellerProfile } from '../seller_profile/entities/seller_profile.entity';
@Injectable()
export class AuthService {
  private readonly OTP_TTL = 5 * 60 * 1000;

  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(SellerProfile)
    private readonly sellerProfiles: Repository<SellerProfile>,
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
      throw new HttpException(
        t('auth.email_already_exists'),
        HttpStatus.CONFLICT,
      );
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
      throw new HttpException(
        t('auth.invalid_or_expired_otp'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.cacheManager.get<string>(`pwd:${email}`);

    if (!hashedPassword) {
      throw new HttpException(
        t('auth.registration_session_expired'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const exists = await this.users.findOneBy({ email });

    if (exists) {
      throw new HttpException(
        t('auth.email_already_exists'),
        HttpStatus.CONFLICT,
      );
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
      throw new HttpException(
        t('auth.invalid_credentials'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!user.is_active) {
      throw new HttpException(
        t('auth.account_disabled') || 'Tài khoản của bạn đã bị vô hiệu hóa',
        HttpStatus.FORBIDDEN,
      );
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new HttpException(
        t('auth.invalid_credentials'),
        HttpStatus.UNAUTHORIZED,
      );
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
      throw new HttpException(
        t('auth.invalid_google_token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const email = payload.email;
    const google_id = payload.sub;

    // ==========================================
    // 1. Find user by Google ID
    // ==========================================

    let user = await this.users.findOne({
      where: {
        google_id,
      },
    });

    if (user) {
      if (!user.is_active) {
        throw new HttpException(
          t('auth.account_inactive'),
          HttpStatus.UNAUTHORIZED,
        );
      }

      return this.generateToken(user);
    }
    // ==========================================
    // 2. Google ID not found → find by email
    // ==========================================

    user = await this.users.findOne({
      where: {
        email,
      },
    });

    if (user) {
      if (!user.is_active) {
        throw new HttpException(
          t('auth.account_inactive'),
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Link Google account to existing account
      user.google_id = google_id;

      await this.users.save(user);

      return this.generateToken(user);
    }

    // ==========================================
    // 3. User does not exist → create new user
    // ==========================================

    user = this.users.create({
      email,
      google_id,
      is_active: true,
    });

    await this.users.save(user);
    return this.generateToken(user);
  }

  // ---------- Logout ----------

  async logout(token?: string): Promise<void> {
    if (!token) {
      throw new HttpException(
        t('auth.authorization_token_required'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = this.jwt.decode<JwtPayload>(token);

    if (!payload || typeof payload === 'string') {
      throw new HttpException(t('auth.invalid_token'), HttpStatus.UNAUTHORIZED);
    }

    if (!payload.jti) {
      throw new HttpException(t('auth.invalid_token'), HttpStatus.UNAUTHORIZED);
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
      throw new HttpException(t('auth.user_not_found'), HttpStatus.NOT_FOUND);
    }

    if (user.role) {
      throw new HttpException(
        t('auth.profile_already_completed'),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Artist bắt buộc phải có bio
    if (dto.role === UserRole.ARTIST && !dto.bio?.trim()) {
      throw new HttpException('Artist bio is required', HttpStatus.BAD_REQUEST);
    }

    // =========================
    // Update User
    // =========================

    user.role = dto.role;
    user.full_name = dto.full_name;
    user.location = dto.location;

    await this.users.save(user);

    // =========================
    // Artist profile
    // =========================

    if (dto.role === UserRole.ARTIST) {
      const sellerProfile = this.sellerProfiles.create({
        userId: user.id,
        bio: dto.bio?.trim() || null,
      });

      await this.sellerProfiles.save(sellerProfile);
    }

    // =========================
    // Generate JWT
    // =========================

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
  // forgot password
  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findOne({
      where: { email },
    });

    if (!user) {
      return;
    }
    if (!user.is_active) {
      throw new HttpException(
        t('auth.account_inactive'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheManager.set(
      `forgot-password:otp:${email}`,
      otp,
      this.OTP_TTL,
    );

    await this.mailService.sendOtp(email, otp);
  }
  async verifyForgotPassword(email: string, otp: string): Promise<string> {
    const storedOtp = await this.cacheManager.get<string>(
      `forgot-password:otp:${email}`,
    );

    if (!storedOtp || storedOtp !== otp) {
      throw new HttpException(
        t('auth.invalid_or_expired_otp'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.users.findOne({
      where: { email },
    });

    if (!user) {
      throw new HttpException(t('auth.user_not_found'), HttpStatus.NOT_FOUND);
    }

    const resetToken = randomUUID();

    await this.cacheManager.set(
      `forgot-password:reset:${resetToken}`,
      user.id,
      this.OTP_TTL,
    );

    await this.cacheManager.del(`forgot-password:otp:${email}`);
    // dùng để lưu vào redis
    return resetToken;
  }
  async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const userId = await this.cacheManager.get<string>(
      `forgot-password:reset:${resetToken}`,
    );

    if (!userId) {
      throw new HttpException(
        t('auth.invalid_or_expired_reset_token'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(t('auth.user_not_found'), HttpStatus.NOT_FOUND);
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await this.users.save(user);

    await this.cacheManager.del(`forgot-password:reset:${resetToken}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.users.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(t('auth.user_not_found'), HttpStatus.NOT_FOUND);
    }

    if (!user.password) {
      throw new HttpException(
        t('auth.password_not_set'),
        HttpStatus.BAD_REQUEST,
      );
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);

    if (!validPassword) {
      throw new HttpException(
        t('auth.invalid_current_password'),
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.users.save(user);
  }
}
