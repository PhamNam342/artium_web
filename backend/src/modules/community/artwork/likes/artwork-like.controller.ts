import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ArtworkLikeService } from './artwork-like.service';
import { JwtAuthGuard } from '../../../../identity/auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../common/decorators/current-user.decorator';

@Controller('community/artworks')
export class ArtworkLikeController {
  constructor(private readonly artworkLikeService: ArtworkLikeService) {}

  @Post(':artworkId/like')
  @UseGuards(JwtAuthGuard)
  async like(
    @Param('artworkId') artworkId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artworkLikeService.like(user.id, artworkId);
  }

  @Delete(':artworkId/like')
  @UseGuards(JwtAuthGuard)
  async unlike(
    @Param('artworkId') artworkId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artworkLikeService.unlike(user.id, artworkId);
  }

  @Get(':artworkId/likes')
  async getLikes(@Param('artworkId') artworkId: string) {
    return this.artworkLikeService.getLikes(artworkId);
  }

  @Get(':artworkId/like/status')
  @UseGuards(JwtAuthGuard)
  async getLikeStatus(
    @Param('artworkId') artworkId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return {
      isLiked: await this.artworkLikeService.isLiked(user.id, artworkId),
    };
  }

  @Get(':artworkId/like/count')
  async getLikeCount(@Param('artworkId') artworkId: string) {
    return {
      count: await this.artworkLikeService.countLikes(artworkId),
    };
  }
}
