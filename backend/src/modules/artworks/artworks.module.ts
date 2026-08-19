import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from './artwork.entity';
import { ArtworksController } from './artworks.controller';
import { ArtworksService } from './artworks.service';
import { Tag } from './tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, Tag])],
  controllers: [ArtworksController],
  providers: [ArtworksService],
})
export class ArtworksModule {}
