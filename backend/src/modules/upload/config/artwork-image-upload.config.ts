import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import type { Request } from 'express';
import { t } from '../../../common/utils/i18n.util';
import type { UploadedArtworkFile } from '../upload.types';

export const maxArtworkImageCount = 10;

export const maxArtworkImageSize = 10 * 1024 * 1024;

export const artworkImageUploadOptions: MulterOptions = {
  limits: {
    fileSize: maxArtworkImageSize,
  },
  fileFilter: (
    _request: Request,
    file: UploadedArtworkFile,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype?.startsWith('image/')) {
      callback(
        new BadRequestException(t('artwork.only_images_allowed')),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
