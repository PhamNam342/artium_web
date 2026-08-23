export interface ArtworkImage {
  publicId?: string;
  url: string;
  secureUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  size?: number;
  bucket?: string;
  alt?: string;
  altText?: string;
  order?: number;
  isPrimary?: boolean;
}

export interface ArtworkTag {
  id: string;
  name: string;
}

export interface ArtworkDimensions {
  height?: number;
  width?: number;
  depth?: number;
  unit?: string;
}

export interface ArtworkWeight {
  value?: number;
  unit?: string;
}

export type ArtworkStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SOLD'
  | 'RESERVED'
  | 'INACTIVE'
  | 'DELETED'
  | 'PENDING_REVIEW';

export interface Artwork {
  id: string;
  sellerId: string;
  title: string;
  description: string | null;
  price: string | null;
  currency: string | null;
  status: ArtworkStatus;
  isPublished: boolean;
  images: ArtworkImage[];
  viewCount: number;
  tags: ArtworkTag[];
  customTags: string[];
  createdAt: string | null;
  materials: string | null;
  location: string | null;
  dimensions: ArtworkDimensions | null;
  weight: string | number | ArtworkWeight | null;
}

export interface ArtworkFiltersValue {
  search: string;
  minPrice: string;
  maxPrice: string;
}

export interface ArtworkListQuery extends Partial<ArtworkFiltersValue> {
  page?: number;
  limit?: number;
  sellerId?: string;
}

export interface ArtworkListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ArtworkListResponse {
  data: Artwork[];
  meta: ArtworkListMeta;
}

export interface ArtworkUpsertInput {
  title?: string;
  description?: string;
  price?: number | null;
  currency?: string | null;
  status?: ArtworkStatus;
  isPublished?: boolean;
  images?: ArtworkImage[];
  materials?: string;
  dimensions?: ArtworkDimensions | null;
  weight?: number | ArtworkWeight | null;
  creationYear?: number;
  editionRun?: string;
  location?: string;
  customTags?: string[];
}
