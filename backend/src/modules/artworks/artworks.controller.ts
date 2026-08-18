import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';

@Controller('api/artwork')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  findAll(@Query() query: ListArtworksQueryDto) {
    return this.artworksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artworksService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateArtworkDto) {
    return this.artworksService.create(body);
  }
}
