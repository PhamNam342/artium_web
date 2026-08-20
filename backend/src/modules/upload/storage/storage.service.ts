import { UploadedArtworkFile, UploadedArtworkImage } from '../upload.types';

export type UploadArtworkImageInput = {
  file: UploadedArtworkFile;
  sellerId: string;
  artworkId: string;
  baseUrl: string;
  altText?: string;
  order: number;
  isPrimary: boolean;
};

export interface StorageService {
  uploadArtworkImage(
    input: UploadArtworkImageInput,
  ): Promise<UploadedArtworkImage>;
}
