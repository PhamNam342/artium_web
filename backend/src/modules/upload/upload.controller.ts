import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../identity/auth/jwt-auth.guard';
import { ArtistRoleGuard } from '../../identity/auth/artist-role.guard';
import type { RequestWithUser } from '../../identity/auth/interfaces/request-with-user.interface';
import {
  artworkImageUploadOptions,
  maxArtworkImageCount,
} from './config/artwork-image-upload.config';
import { UploadArtworkImagesDto } from './dto/upload-artwork-images.dto';
import { UploadService } from './upload.service';
import type { UploadedArtworkFile } from './upload.types';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('artwork-images')
  @UseGuards(JwtAuthGuard, ArtistRoleGuard)
  @UseInterceptors(
    FilesInterceptor('files', maxArtworkImageCount, artworkImageUploadOptions),
  )
  uploadArtworkImages(
    @UploadedFiles() files: UploadedArtworkFile[],
    @Body() body: UploadArtworkImagesDto,
    @Req() request: RequestWithUser,
  ) {
    return this.uploadService.uploadArtworkImages(
      files,
      body,
      request.user.id,
      this.getBaseUrl(request),
    );
  }

  private getBaseUrl(request: Request) {
    return `${request.protocol}://${request.get('host')}`;
  }
}
