import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtworkLike } from './entities/artwork-like.entity';
import { Artwork, ArtworkStatus } from '../../../artworks/artwork.entity';

@Injectable()
export class ArtworkLikeService {
  constructor(
    @InjectRepository(ArtworkLike)
    private readonly artworkLikeRepository: Repository<ArtworkLike>,

    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

  // ============================================
  // CHECK PUBLIC ARTWORK
  // ============================================

  private async findPublicArtwork(artworkId: string) {
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
  // LIKE
  // ============================================

  async like(userId: string, artworkId: string) {
    // Kiểm tra artwork tồn tại + public
    await this.findPublicArtwork(artworkId);

    const existingLike = await this.artworkLikeRepository.findOne({
      where: {
        userId,
        artworkId,
      },
    });

    if (existingLike) {
      throw new ConflictException('Artwork already liked');
    }

    const like = this.artworkLikeRepository.create({
      userId,
      artworkId,
    });

    return this.artworkLikeRepository.save(like);
  }

  // ============================================
  // UNLIKE
  // ============================================

  async unlike(userId: string, artworkId: string) {
    const like = await this.artworkLikeRepository.findOne({
      where: {
        userId,
        artworkId,
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.artworkLikeRepository.remove(like);

    return {
      message: 'Artwork unliked successfully',
    };
  }

  // ============================================
  // GET LIKES
  // ============================================

  async getLikes(artworkId: string) {
    await this.findPublicArtwork(artworkId);

    return this.artworkLikeRepository.find({
      where: {
        artworkId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ============================================
  // LIKE STATUS
  // ============================================

  async isLiked(userId: string, artworkId: string) {
    await this.findPublicArtwork(artworkId);

    const like = await this.artworkLikeRepository.findOne({
      where: {
        userId,
        artworkId,
      },
    });

    return !!like;
  }

  // ============================================
  // LIKE COUNT
  // ============================================

  async countLikes(artworkId: string) {
    await this.findPublicArtwork(artworkId);

    return this.artworkLikeRepository.count({
      where: {
        artworkId,
      },
    });
  }
}
