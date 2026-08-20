import { ArtworkStatus } from '../artwork.entity';

export const artworkStatusValues = [
  ...Object.values(ArtworkStatus),
  'AVAILABLE',
  'available',
  'active',
  'sold',
  'reserved',
  'draft',
  'inactive',
  'deleted',
  'pending_review',
] as const;
