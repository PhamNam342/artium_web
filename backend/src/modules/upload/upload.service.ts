import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UploadArtworkImagesDto } from './dto/upload-artwork-images.dto';
import { STORAGE_SERVICE } from './storage/storage.constants';
import type { StorageService } from './storage/storage.service';
import { UploadedArtworkFile, UploadedArtworkImage } from './upload.types';

@Injectable()
export class UploadService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
  ) {}

  async uploadArtworkImages(
    files: UploadedArtworkFile[] | undefined,
    dto: UploadArtworkImagesDto,
    baseUrl: string,
  ): Promise<UploadedArtworkImage[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const sellerId = this.cleanRequiredString(dto.sellerId, 'sellerId');
    const artworkId = this.cleanRequiredString(dto.artworkId, 'artworkId');
    const altText = this.cleanOptionalString(dto.altText);

    return Promise.all(
      files.map(async (file, index) => {
        this.assertImageFile(file, index);

        return this.storageService.uploadArtworkImage({
          file,
          sellerId,
          artworkId,
          baseUrl,
          altText,
          order: index,
          isPrimary: index === 0,
        });
      }),
    );
  }

  private cleanRequiredString(value: string | undefined, fieldName: string) {
    const cleanedValue = this.cleanOptionalString(value);

    if (!cleanedValue) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (cleanedValue === 'undefined' || cleanedValue === 'null') {
      throw new BadRequestException(
        `${fieldName} cannot be the string "${cleanedValue}"`,
      );
    }

    return cleanedValue;
  }

  private cleanOptionalString(value: string | undefined) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const cleanedValue = value.trim();
    return cleanedValue === '' ? undefined : cleanedValue;
  }

  private assertImageFile(file: UploadedArtworkFile, index: number) {
    if (!file?.buffer) {
      throw new BadRequestException(`files.${index} is empty`);
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException(`files.${index} must be an image`);
    }
  }
}
