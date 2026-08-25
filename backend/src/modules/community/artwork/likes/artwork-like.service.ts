import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArtworkLike } from './entities/artwork-like.entity';
import { Artwork, ArtworkStatus } from '../../../artworks/artwork.entity';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationType } from '../../../notification/enums/notification-type.enum';
import { NotificationEntityType } from '../../../notification/enums/notification-entity-type.enum';
import { t } from '../../../../common/utils/i18n.util';
@Injectable()
export class ArtworkLikeService {
  constructor(
    @InjectRepository(ArtworkLike)
    private readonly artworkLikeRepository: Repository<ArtworkLike>,

    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    private readonly notificationService: NotificationService,
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
    // 1. Lấy artwork và kiểm tra public
    const artwork = await this.findPublicArtwork(artworkId);

    // 2. Kiểm tra user đã like chưa
    const existingLike = await this.artworkLikeRepository.findOne({
      where: {
        userId,
        artworkId,
      },
    });

    if (existingLike) {
      throw new ConflictException('Artwork already liked');
    }

    // 3. Tạo like
    const like = this.artworkLikeRepository.create({
      userId,
      artworkId,
    });

    // 4. Lưu like trước
    const savedLike = await this.artworkLikeRepository.save(like);

    // 5. Không gửi notification nếu tự like artwork của mình
    if (artwork.sellerId !== userId) {
      await this.notificationService.create({
        recipientId: artwork.sellerId,
        actorId: userId,
        type: NotificationType.ARTWORK_LIKE,
        entityType: NotificationEntityType.ARTWORK,
        entityId: artwork.id,
        title: t('notification.like_title'),
        message: t('notification.like_message'),
      });
    }

    return savedLike;
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
