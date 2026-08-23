import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { t } from '../../common/utils/i18n.util';
import { Artwork } from '../artworks/artwork.entity';
import { UploadArtworkImagesDto } from './dto/upload-artwork-images.dto';
import { STORAGE_SERVICE } from './storage/storage.constants';
import type { StorageService } from './storage/storage.service';
import { UploadedArtworkFile, UploadedArtworkImage } from './upload.types';

@Injectable()
export class UploadService {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: StorageService,
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
  ) {}

  async uploadArtworkImages(
    files: UploadedArtworkFile[] | undefined,
    dto: UploadArtworkImagesDto,
    authenticatedSellerId: string,
    baseUrl: string,
  ): Promise<UploadedArtworkImage[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException(t('artwork.files_required'));
    }

    const sellerId = this.cleanRequiredString(
      authenticatedSellerId,
      'sellerId',
    );
    const artworkId = this.cleanRequiredString(dto.artworkId, 'artworkId');
    const altText = this.cleanOptionalString(dto.altText);

    const artwork = await this.artworkRepository.findOneBy({
      id: artworkId,
      sellerId,
    });
    if (!artwork) {
      throw new NotFoundException(t('artwork.not_found'));
    }

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
      throw new BadRequestException(
        t('artwork.validation.required', { args: { field: fieldName } }),
      );
    }

    if (cleanedValue === 'undefined' || cleanedValue === 'null') {
      throw new BadRequestException(
        t('artwork.validation.string_literal_not_allowed', {
          args: { field: fieldName, value: cleanedValue },
        }),
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
      throw new BadRequestException(
        t('artwork.validation.file_empty', { args: { index } }),
      );
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException(
        t('artwork.validation.file_must_be_image', { args: { index } }),
      );
    }
  }
  // upload avatar
  async uploadAvatar(
    file: UploadedArtworkFile | undefined,
    userId: string,
    baseUrl: string,
  ): Promise<string> {
    if (!file?.buffer) {
      throw new BadRequestException(t('avatar.validation.file_empty'));
    }

    this.assertImageFile(file, 0);

    return this.storageService.uploadAvatar({
      file,
      userId,
      baseUrl,
    });
  }
}
