import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from './artwork.entity';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';
import { Tag } from './tag.entity';
import { ArtworkFolder } from '../artwork-folders/artwork-folder.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Artwork, Tag, ArtworkFolder]),
    NotificationModule,
  ],
  controllers: [ArtworksController],
  providers: [ArtworksService],
})
export class ArtworksModule {}
