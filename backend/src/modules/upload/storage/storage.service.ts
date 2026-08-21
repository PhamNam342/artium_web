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
export type UploadAvatarInput = {
  file: UploadedArtworkFile;
  userId: string;
  baseUrl: string;
};

export interface StorageService {
  uploadArtworkImage(
    input: UploadArtworkImageInput,
  ): Promise<UploadedArtworkImage>;
  uploadAvatar(input: UploadAvatarInput): Promise<string>;
}
