import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterInitiateDto } from './dto/register-initiate.dto';
import { RegisterCompleteDto } from './dto/register-complete.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import type { RequestWithUser } from './interfaces/request-with-user.interface';
import { t } from '../../common/utils/i18n.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/initiate')
  @HttpCode(HttpStatus.OK)
  async registerInitiate(@Body() dto: RegisterInitiateDto) {
    await this.authService.initiateRegister(dto.email, dto.password);

    return {
      message: t('auth.otp_sent'),
    };
  }

  @Post('register/complete')
  @HttpCode(HttpStatus.CREATED)
  async registerComplete(@Body() dto: RegisterCompleteDto) {
    const token = await this.authService.completeRegister(
      dto.email,
      dto.otp,
      dto.name,
    );

    return {
      access_token: token,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const token = await this.authService.login(dto.email, dto.password);
    return {
      access_token: token,
    };
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(@Body() dto: GoogleLoginDto) {
    const token = await this.authService.loginWithGoogle(dto.idToken);

    return {
      access_token: token,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    const authorization = req.headers.authorization;

    const token = authorization?.startsWith('Bearer ')
      ? authorization.substring(7)
      : undefined;

    await this.authService.logout(token);

    return {
      message: t('auth.logout_success'),
    };
  }
  @Patch('profile/complete')
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @Req() req: RequestWithUser,
    @Body() dto: CompleteProfileDto,
  ) {
    const access_token = await this.authService.completeProfile(
      req.user.id,
      dto,
    );

    return {
      access_token,
    };
  }
}
