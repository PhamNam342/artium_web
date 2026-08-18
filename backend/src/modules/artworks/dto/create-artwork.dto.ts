import {
  ArtworkDimensions,
  ArtworkImage,
  ArtworkStatus,
} from '../artwork.entity';

export type ArtworkWeightInput = {
  value?: number | string;
  unit?: string;
};

export class CreateArtworkDto {
  sellerId?: string;
  title?: string;
  description?: string;
  price?: string | number;
  currency?: string;
  status?: ArtworkStatus;
  isPublished?: boolean;
  images?: ArtworkImage[];
  folderId?: string | null;
  tagIds?: string[];
  materials?: string;
  material?: string;
  dimensions?: ArtworkDimensions | null;
  weight?: string | number | ArtworkWeightInput | null;

  creatorName?: string;
  creationYear?: number;
  editionRun?: string;
  location?: string;
  quantity?: number;
}
