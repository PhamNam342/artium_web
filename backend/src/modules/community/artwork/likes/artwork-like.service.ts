import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtworkLike } from './entities/artwork-like.entity';

@Injectable()
export class ArtworkLikeService {
  constructor(
    @InjectRepository(ArtworkLike)
    private readonly artworkLikeRepository: Repository<ArtworkLike>,
  ) {}

  async like(userId: string, artworkId: string) {
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

  async getLikes(artworkId: string) {
    return this.artworkLikeRepository.find({
      where: {
        artworkId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async isLiked(userId: string, artworkId: string) {
    const like = await this.artworkLikeRepository.findOne({
      where: {
        userId,
        artworkId,
      },
    });

    return !!like;
  }

  async countLikes(artworkId: string) {
    return this.artworkLikeRepository.count({
      where: {
        artworkId,
      },
    });
  }
}
