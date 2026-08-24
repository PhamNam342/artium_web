import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtworkComment } from './entities/artwork-comment.entity';
import { CreateArtworkCommentDto } from './dto/create-artwork-comment.dto';
import { UpdateArtworkCommentDto } from './dto/update-artwork-comment.dto';
import { ArtworkCommentResponseDto } from './dto/artwork-comment-response.dto';

import { Artwork, ArtworkStatus } from '../../../artworks/artwork.entity';

@Injectable()
export class ArtworkCommentService {
  constructor(
    @InjectRepository(ArtworkComment)
    private readonly commentRepository: Repository<ArtworkComment>,

    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

  // ============================================
  // CHECK PUBLIC ARTWORK
  // ============================================

  private async findPublicArtwork(artworkId: string): Promise<Artwork> {
    const artwork = await this.artworkRepository.findOne({
      where: {
        id: artworkId,
        isPublished: true,
        status: ArtworkStatus.ACTIVE,
      },
    });

    if (!artwork) {
      throw new NotFoundException('Artwork not found');
    }

    return artwork;
  }

  // ============================================
  // CREATE COMMENT
  // ============================================

  async create(
    userId: string,
    artworkId: string,
    dto: CreateArtworkCommentDto,
  ) {
    if (!dto.content.trim()) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    // Kiểm tra artwork tồn tại + public
    await this.findPublicArtwork(artworkId);

    const comment = this.commentRepository.create({
      userId,
      artworkId,
      content: dto.content.trim(),
    });

    const savedComment = await this.commentRepository.save(comment);

    return this.findOne(savedComment.id);
  }

  // ============================================
  // GET ALL COMMENTS
  // ============================================

  async findAll(artworkId: string): Promise<ArtworkCommentResponseDto[]> {
    // Chỉ cho đọc comment của artwork public
    await this.findPublicArtwork(artworkId);

    const comments = await this.commentRepository.find({
      where: {
        artworkId,
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return comments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      artworkId: comment.artworkId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,

      user: {
        id: comment.user.id,
        full_name: comment.user.full_name,
        avatar_url: comment.user.avatar_url,
      },
    }));
  }

  // ============================================
  // GET ONE COMMENT
  // ============================================

  async findOne(id: string): Promise<ArtworkCommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      id: comment.id,
      userId: comment.userId,
      artworkId: comment.artworkId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,

      user: {
        id: comment.user.id,
        full_name: comment.user.full_name,
        avatar_url: comment.user.avatar_url,
      },
    };
  }

  // ============================================
  // UPDATE COMMENT
  // ============================================

  async update(id: string, userId: string, dto: UpdateArtworkCommentDto) {
    if (!dto.content.trim()) {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only update your own comment');
    }

    comment.content = dto.content.trim();

    await this.commentRepository.save(comment);

    return this.findOne(comment.id);
  }

  // ============================================
  // DELETE COMMENT
  // ============================================

  async remove(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: {
        id,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new BadRequestException('You can only delete your own comment');
    }

    await this.commentRepository.remove(comment);

    return {
      message: 'Comment deleted successfully',
    };
  }

  // ============================================
  // COMMENT COUNT
  // ============================================

  async count(artworkId: string) {
    // Chỉ count comment của artwork public
    await this.findPublicArtwork(artworkId);

    return this.commentRepository.count({
      where: {
        artworkId,
      },
    });
  }
}
