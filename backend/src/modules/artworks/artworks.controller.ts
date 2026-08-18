import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

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

  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateArtworkDto) {
    return this.artworksService.update(id, body);
  }
}
