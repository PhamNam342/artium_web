import {
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';

import { FollowersService } from './followers.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../identity/auth/jwt-auth.guard';
import { PaginationDto } from './dto/pagination.dto';
@Controller('community/followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  follow(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.followersService.follow(currentUser.id, userId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.followersService.unfollow(currentUser.id, userId);
  }
  @Get('counts/:userId')
  getCounts(@Param('userId') userId: string) {
    return this.followersService.getCounts(userId);
  }

  @Get('followers/:userId')
  getFollowers(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.followersService.getFollowers(
      userId,
      pagination.skip,
      pagination.take,
    );
  }
  @Get('following/:userId')
  getFollowing(
    @Param('userId') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.followersService.getFollowing(
      userId,
      pagination.skip,
      pagination.take,
    );
  }
  @Get('status/:userId')
  @UseGuards(JwtAuthGuard)
  getStatus(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.followersService.getStatus(currentUser.id, userId);
  }
}
