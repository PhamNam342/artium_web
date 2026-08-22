import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artwork } from '../artworks/artwork.entity';
import { CloudStorageService } from './storage/cloud-storage.service';
import { STORAGE_SERVICE } from './storage/storage.constants';
import type { StorageDriver } from './storage/storage.constants';
import { LocalStorageService } from './storage/local-storage.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

const storageServiceProvider = {
  provide: STORAGE_SERVICE,
  useFactory: (
    localStorageService: LocalStorageService,
    cloudStorageService: CloudStorageService,
  ) => {
    const driver = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase();

    switch (driver as StorageDriver) {
      case 'local':
        return localStorageService;
      case 'gcs':
      case 's3':
      case 'cloudinary':
        return cloudStorageService;
      default:
        throw new Error(`Unsupported STORAGE_DRIVER: ${driver}`);
    }
  },
  inject: [LocalStorageService, CloudStorageService],
};

@Module({
  imports: [TypeOrmModule.forFeature([Artwork])],
  controllers: [UploadController],
  providers: [
    UploadService,
    LocalStorageService,
    CloudStorageService,
    storageServiceProvider,
  ],
  exports: [UploadService],
})
export class UploadModule {}
