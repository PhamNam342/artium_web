import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join, posix } from 'path';
import { UploadArtworkImagesDto } from './dto/upload-artwork-images.dto';
import { UploadedArtworkFile, UploadedArtworkImage } from './upload.types';

@Injectable()
export class UploadService {
  private readonly uploadRoot =
    process.env.UPLOAD_ROOT ?? join(process.cwd(), 'uploads');
  private readonly publicRoot = 'uploads';
  private readonly localBucket = 'local-artium-uploads';

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
    const sellerSegment = this.toPathSegment(sellerId);
    const artworkSegment = this.toPathSegment(artworkId);
    const uploadDirectory = join(
      this.uploadRoot,
      'artwork-images',
      sellerSegment,
      artworkSegment,
    );

    await mkdir(uploadDirectory, { recursive: true });

    return Promise.all(
      files.map(async (file, index) => {
        this.assertImageFile(file, index);

        const extension = this.resolveExtension(file);
        const fileName = `${randomUUID()}${extension}`;
        const publicId = posix.join(
          'artwork-images',
          sellerSegment,
          artworkSegment,
          fileName,
        );

        await writeFile(join(uploadDirectory, fileName), file.buffer);

        const url = this.buildPublicUrl(baseUrl, publicId);

        return {
          publicId,
          url,
          secureUrl: url,
          format: extension.slice(1),
          size: file.size,
          bucket: this.localBucket,
          altText: this.cleanOptionalString(dto.altText),
          order: index,
          isPrimary: index === 0,
        };
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

  private toPathSegment(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  private assertImageFile(file: UploadedArtworkFile, index: number) {
    if (!file?.buffer) {
      throw new BadRequestException(`files.${index} is empty`);
    }

    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException(`files.${index} must be an image`);
    }
  }

  private resolveExtension(file: UploadedArtworkFile) {
    const extensionFromName = extname(file.originalname).toLowerCase();

    if (this.isAllowedExtension(extensionFromName)) {
      return extensionFromName === '.jpeg' ? '.jpg' : extensionFromName;
    }

    const extensionByMimeType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    return extensionByMimeType[file.mimetype] ?? '.jpg';
  }

  private isAllowedExtension(extension: string) {
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension);
  }

  private buildPublicUrl(baseUrl: string, publicId: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
    return `${normalizedBaseUrl}/${this.publicRoot}/${publicId}`;
  }
}
