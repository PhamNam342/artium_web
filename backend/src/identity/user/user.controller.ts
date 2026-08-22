import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

import { UpdateProfileDto } from './dto/update-profile.dto';

import { UploadService } from '../../modules/upload/upload.service';
import type { UploadedAvatarFile } from '../../modules/upload/upload.types';

import { ConfigService } from '@nestjs/config';

@Controller('identity/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: RequestWithUser) {
    return this.userService.findById(req.user.id);
  }

  @Get(':userId')
  async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.userService.findPublicProfile(userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: UploadedAvatarFile,
  ) {
    const baseUrl = this.configService.getOrThrow<string>('APP_URL');

    const avatarUrl = await this.uploadService.uploadAvatar(
      file,
      req.user.id,
      baseUrl,
    );

    return this.userService.updateAvatar(req.user.id, avatarUrl);
  }
}
