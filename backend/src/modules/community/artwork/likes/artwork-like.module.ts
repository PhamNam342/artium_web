import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworkLike } from './entities/artwork-like.entity';
import { ArtworkLikeService } from './artwork-like.service';
import { ArtworkLikeController } from './artwork-like.controller';
import { Artwork } from '../../../artworks/artwork.entity';
import { NotificationModule } from './../../../notification/notification.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([ArtworkLike, Artwork]),
    NotificationModule,
  ],
  controllers: [ArtworkLikeController],
  providers: [ArtworkLikeService],
  exports: [ArtworkLikeService],
})
export class ArtworkLikeModule {}
