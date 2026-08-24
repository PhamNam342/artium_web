import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from '../artworks/artwork.entity';
import { ArtworkFolder } from './artwork-folder.entity';
import { ArtworkFoldersController } from './artwork-folders.controller';
import { ArtworkFoldersService } from './artwork-folders.service';

@Module({
  imports: [TypeOrmModule.forFeature([ArtworkFolder, Artwork])],
  controllers: [ArtworkFoldersController],
  providers: [ArtworkFoldersService],
  exports: [TypeOrmModule],
})
export class ArtworkFoldersModule {}
