import { Injectable, NotImplementedException } from '@nestjs/common';
import { StorageService, UploadArtworkImageInput } from './storage.service';

@Injectable()
export class CloudStorageService implements StorageService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadArtworkImage(_input: UploadArtworkImageInput): Promise<never> {
    return Promise.reject(
      new NotImplementedException(
        'STORAGE_DRIVER is set to a cloud driver, but cloud upload is not configured yet',
      ),
    );
  }
}
