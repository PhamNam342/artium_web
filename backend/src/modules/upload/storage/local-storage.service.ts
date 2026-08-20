import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join, posix } from 'path';
import { StorageService, UploadArtworkImageInput } from './storage.service';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadRoot =
    process.env.UPLOAD_ROOT ?? join(process.cwd(), 'uploads');
  private readonly publicRoot = 'uploads';
  private readonly localBucket = 'local-artium-uploads';

  async uploadArtworkImage(input: UploadArtworkImageInput) {
    const sellerSegment = this.toPathSegment(input.sellerId);
    const artworkSegment = this.toPathSegment(input.artworkId);
    const uploadDirectory = join(
      this.uploadRoot,
      'artwork-images',
      sellerSegment,
      artworkSegment,
    );

    await mkdir(uploadDirectory, { recursive: true });

    const extension = this.resolveExtension(input.file);
    const fileName = `${randomUUID()}${extension}`;
    const publicId = posix.join(
      'artwork-images',
      sellerSegment,
      artworkSegment,
      fileName,
    );

    await writeFile(join(uploadDirectory, fileName), input.file.buffer);

    const url = this.buildPublicUrl(input.baseUrl, publicId);

    return {
      publicId,
      url,
      secureUrl: url,
      format: extension.slice(1),
      size: input.file.size,
      bucket: this.localBucket,
      altText: input.altText,
      order: input.order,
      isPrimary: input.isPrimary,
    };
  }

  private toPathSegment(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  private resolveExtension(input: UploadArtworkImageInput['file']) {
    const extensionFromName = extname(input.originalname).toLowerCase();

    if (this.isAllowedExtension(extensionFromName)) {
      return extensionFromName === '.jpeg' ? '.jpg' : extensionFromName;
    }

    const extensionByMimeType: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };

    return extensionByMimeType[input.mimetype] ?? '.jpg';
  }

  private isAllowedExtension(extension: string) {
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension);
  }

  private buildPublicUrl(baseUrl: string, publicId: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
    return `${normalizedBaseUrl}/${this.publicRoot}/${publicId}`;
  }
}
