import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import {
  ArtworkResponseDto,
  DeleteArtworkResponseDto,
  ListArtworksResponseDto,
} from './dto/artwork-response.dto';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@Controller('api/artwork')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  findAll(
    @Query() query: ListArtworksQueryDto,
  ): Promise<ListArtworksResponseDto> {
    return this.artworksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ArtworkResponseDto> {
    return this.artworksService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateArtworkDto): Promise<ArtworkResponseDto> {
    return this.artworksService.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateArtworkDto,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteArtworkResponseDto> {
    return this.artworksService.remove(id);
  }
}
