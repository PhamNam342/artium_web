import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageService, UploadArtworkImageInput } from './storage.service';

@Injectable()
export class CloudStorageService implements StorageService {
  async uploadArtworkImage(_input: UploadArtworkImageInput): Promise<never> {
    throw new NotImplementedException(
      'STORAGE_DRIVER is set to a cloud driver, but cloud upload is not configured yet',
    );
  }
}
