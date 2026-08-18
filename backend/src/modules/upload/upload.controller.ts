import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { UploadArtworkImagesDto } from './dto/upload-artwork-images.dto';
import { UploadService } from './upload.service';
import { UploadedArtworkFile } from './upload.types';

const maxArtworkImageSize = 10 * 1024 * 1024;

const artworkImageUploadOptions = {
  limits: {
    fileSize: maxArtworkImageSize,
  },
  fileFilter: (
    _request: Request,
    file: UploadedArtworkFile,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype?.startsWith('image/')) {
      callback(new BadRequestException('Only image files are allowed'), false);
      return;
    }

    callback(null, true);
  },
};

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('artwork-images')
  @UseInterceptors(FilesInterceptor('files', 10, artworkImageUploadOptions))
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
