import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
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
  @UseInterceptors(
    FilesInterceptor('files', maxArtworkImageCount, artworkImageUploadOptions),
  )
  uploadArtworkImages(
    @UploadedFiles() files: UploadedArtworkFile[],
    @Body() body: UploadArtworkImagesDto,
    @Req() request: Request,
  ) {
    return this.uploadService.uploadArtworkImages(
      files,
      body,
      this.getBaseUrl(request),
    );
  }

  private getBaseUrl(request: Request) {
    return `${request.protocol}://${request.get('host')}`;
  }
}
