import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Delete,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

import { UpdateProfileDto } from './dto/update-profile.dto';

import { UploadService } from '../../modules/upload/upload.service';
import type { UploadedAvatarFile } from '../../modules/upload/upload.types';

import { ConfigService } from '@nestjs/config';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
@Controller('identity/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  // =========================
  // Admin Endpoints
  // =========================

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminDashboardStats() {
    return this.userService.getAdminDashboardStats();
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    const pageNum =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limitNum =
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 10;
    const activeFilter =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.userService.findAllUsers(
      pageNum,
      limitNum,
      search,
      activeFilter,
    );
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminUserDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getAdminUserDetail(id);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('is_active') isActive: boolean,
    @Req() req: RequestWithUser,
  ) {
    return this.userService.toggleUserStatus(id, isActive, req.user.id);
  }

  // =========================
  // Public & User Endpoints
  // =========================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: RequestWithUser) {
    return this.userService.findById(req.user.id);
  }

  @Get('artists')
  async getArtists() {
    return this.userService.findPublicArtists();
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
  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteMyAccount(@Req() req: RequestWithUser) {
    const authorization = req.headers.authorization;
    const accessToken = authorization?.startsWith('Bearer ')
      ? authorization.substring(7)
      : undefined;

    return this.userService.deactivateAccount(req.user.id, accessToken);
  }
}
