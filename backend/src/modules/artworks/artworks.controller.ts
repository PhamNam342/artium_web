import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RequestWithUser } from '../../identity/auth/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../identity/auth/optional-jwt-auth.guard';
import { ArtworksService } from './artworks.service';
import {
  ArtworkResponseDto,
  ArtworkTagResponseDto,
  DeleteArtworkResponseDto,
  ListArtworksResponseDto,
} from './dto/artwork-response.dto';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { ListArtworksQueryDto } from './dto/list-artworks-query.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { CreateArtworkTagDto } from './dto/create-artwork-tag.dto';
import {
  UpdateArtworkPublishDto,
  UpdateArtworkStatusDto,
} from './dto/update-artwork-status.dto';

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

  @Get('tags')
  findTags(): Promise<ArtworkTagResponseDto[]> {
    return this.artworksService.findTags();
  }

  @Post('tags')
  @UseGuards(JwtAuthGuard)
  createTag(
    @Body() body: CreateArtworkTagDto,
  ): Promise<ArtworkTagResponseDto> {
    return this.artworksService.createTag(body);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.findOne(id, req.user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: RequestWithUser,
    @Body() body: CreateArtworkDto,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.create(body, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateArtworkDto,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.update(id, body, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<DeleteArtworkResponseDto> {
    return this.artworksService.remove(id, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateArtworkStatusDto,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.updateStatus(id, body.status, req.user.id);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  updatePublish(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: UpdateArtworkPublishDto,
  ): Promise<ArtworkResponseDto> {
    return this.artworksService.updatePublish(
      id,
      body.isPublished,
      req.user.id,
    );
  }
}
