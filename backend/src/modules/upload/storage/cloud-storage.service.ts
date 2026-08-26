import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import {
  StorageService,
  UploadArtworkImageInput,
  UploadAvatarInput,
} from './storage.service';

@Injectable()
export class CloudStorageService implements StorageService {
  constructor() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
      process.env;
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
  }

  async uploadArtworkImage(input: UploadArtworkImageInput) {
    const result = await this.upload(
      input.file.buffer,
      `artwork-images/${this.segment(input.sellerId)}/${this.segment(input.artworkId)}`,
    );
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      size: input.file.size,
      bucket: 'cloudinary',
      altText: input.altText,
      order: input.order,
      isPrimary: input.isPrimary,
    };
  }

  async uploadAvatar(input: UploadAvatarInput): Promise<string> {
    const result = await this.upload(
      input.file.buffer,
      `avatars/${this.segment(input.userId)}`,
    );
    return result.secure_url;
  }

  private segment(value: string) {
    return value.replace(/[^a-zA-Z0-9._-]/g, '-');
  }

  private upload(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new InternalServerErrorException('Cloudinary upload failed'),
            );
            return;
          }
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }
}
