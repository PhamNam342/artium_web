import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworkLike } from './entities/artwork-like.entity';
import { ArtworkLikeService } from './artwork-like.service';
import { ArtworkLikeController } from './artwork-like.controller';
import { Artwork } from '../../../artworks/artwork.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ArtworkLike, Artwork])],
  controllers: [ArtworkLikeController],
  providers: [ArtworkLikeService],
  exports: [ArtworkLikeService],
})
export class ArtworkLikeModule {}
