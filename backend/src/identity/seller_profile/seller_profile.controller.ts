import { Body, Controller, Param, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { SellerProfilesService } from './seller_profile.service';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { UpdateSellerProfileVisibilityDto } from './dto/update-seller-profile-visibility.dto';

@Controller('identity/seller-profiles')
@UseGuards(JwtAuthGuard)
export class SellerProfilesController {
  constructor(private readonly sellerProfilesService: SellerProfilesService) {}

  @Put(':profileId')
  async updateProfile(
    @Param('profileId') profileId: string,
    @Body() dto: UpdateSellerProfileDto,
    @CurrentUser()
    user: {
      id: string;
      email: string;
      role: string;
    },
  ) {
    return this.sellerProfilesService.update(profileId, user.id, dto);
  }

  @Put(':profileId/visibility')
  async updateVisibility(
    @Param('profileId') profileId: string,
    @Body() dto: UpdateSellerProfileVisibilityDto,
    @CurrentUser()
    user: {
      id: string;
      email: string;
      role: string;
    },
  ) {
    return this.sellerProfilesService.updateVisibility(
      profileId,
      user.id,
      dto.isVisible,
    );
  }
}
