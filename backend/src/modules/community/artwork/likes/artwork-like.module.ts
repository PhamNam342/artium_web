import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworkLike } from './entities/artwork-like.entity';
import { ArtworkLikeService } from './artwork-like.service';
import { ArtworkLikeController } from './artwork-like.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkLike])],
  controllers: [ArtworkLikeController],
  providers: [ArtworkLikeService],
  exports: [ArtworkLikeService],
})
export class ArtworkLikeModule {}
