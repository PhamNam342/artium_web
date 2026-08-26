import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

import { SellerProfilesService } from './seller_profile.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Controller('admin/verify-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSellerProfilesController {
  constructor(private readonly sellerProfilesService: SellerProfilesService) {}

  @Get()
  async getPendingRequests(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.sellerProfilesService.getPendingRequests(page, limit);
  }

  @Post(':profileId/approve')
  async approveRequest(@Param('profileId') profileId: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.sellerProfilesService.approveVerification(profileId, admin.id);
  }

  @Post(':profileId/reject')
  async rejectRequest(@Param('profileId') profileId: string, @CurrentUser() admin: AuthenticatedUser) {
    return this.sellerProfilesService.rejectVerification(profileId, admin.id);
  }
}
