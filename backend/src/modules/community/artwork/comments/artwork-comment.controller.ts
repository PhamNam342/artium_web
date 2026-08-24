import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ArtworkCommentService } from './artwork-comment.service';
import { CreateArtworkCommentDto } from './dto/create-artwork-comment.dto';
import { UpdateArtworkCommentDto } from './dto/update-artwork-comment.dto';

import { JwtAuthGuard } from '../../../../identity/auth/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../common/decorators/current-user.decorator';

@Controller('community/artworks')
export class ArtworkCommentController {
  constructor(private readonly artworkCommentService: ArtworkCommentService) {}

  /**
   * Create comment
   * POST /community/artworks/:artworkId/comments
   */
  @Post(':artworkId/comments')
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('artworkId') artworkId: string,
    @Body() dto: CreateArtworkCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artworkCommentService.create(user.id, artworkId, dto);
  }

  /**
   * Get all comments of an artwork
   * GET /community/artworks/:artworkId/comments
   */
  @Get(':artworkId/comments')
  async getComments(@Param('artworkId') artworkId: string) {
    return this.artworkCommentService.findAll(artworkId);
  }

  /**
   * Get comment count
   * GET /community/artworks/:artworkId/comments/count
   */
  @Get(':artworkId/comments/count')
  async countComments(@Param('artworkId') artworkId: string) {
    return {
      count: await this.artworkCommentService.count(artworkId),
    };
  }

  /**
   * Update own comment
   * PATCH /community/artworks/:artworkId/comments/:commentId
   */
  @Patch(':artworkId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateArtworkCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artworkCommentService.update(commentId, user.id, dto);
  }

  /**
   * Delete own comment
   * DELETE /community/artworks/:artworkId/comments/:commentId
   */
  @Delete(':artworkId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.artworkCommentService.remove(commentId, user.id);
  }
}
