import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RequestWithUser } from '../../identity/auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import { ArtworksService } from './artworks.service';
import {
  ArtworkResponseDto,
  DeleteArtworkResponseDto,
  ListArtworksResponseDto,
} from './dto/artwork-response.dto';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';

@Controller('artwork')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Get()
  findAll(
    @Query() query: ListArtworksQueryDto,
  ): Promise<ListArtworksResponseDto> {
    return this.artworksService.findAll(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(
    @Req() req: RequestWithUser,
    @Query() query: ListArtworksQueryDto,
  ): Promise<ListArtworksResponseDto> {
    return this.artworksService.findMine(req.user.id, query);
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
