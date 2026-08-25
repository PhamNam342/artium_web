import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworkComment } from './entities/artwork-comment.entity';
import { ArtworkCommentController } from './artwork-comment.controller';
import { ArtworkCommentService } from './artwork-comment.service';
import { Artwork } from '../../../artworks/artwork.entity';
import { NotificationModule } from './../../../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtworkComment, Artwork]),
    NotificationModule,
  ],
  controllers: [ArtworkCommentController],
  providers: [ArtworkCommentService],
  exports: [ArtworkCommentService],
})
export class ArtworkCommentModule {}
