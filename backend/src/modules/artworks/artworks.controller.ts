import { Controller, Get, Query } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';

@Controller('api/artwork')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  findAll(@Query() query: ListArtworksQueryDto) {
    return this.artworksService.findAll(query);
  }
}
