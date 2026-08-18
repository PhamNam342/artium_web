import { Expose, Type } from 'class-transformer';
import { ArtworkStatus } from '../artwork.entity';

export class ArtworkImageResponseDto {
  @Expose()
  publicId?: string;

  @Expose()
  url!: string;

  @Expose()
  secureUrl?: string;

  @Expose()
  format?: string;

  @Expose()
  width?: number;

  @Expose()
  height?: number;

  @Expose()
  size?: number;

  @Expose()
  bucket?: string;

  @Expose()
  alt?: string;

  @Expose()
  altText?: string;

  @Expose()
  order?: number;

  @Expose()
  isPrimary?: boolean;
}

export class ArtworkDimensionsResponseDto {
  @Expose()
  height?: number;

  @Expose()
  width?: number;

  @Expose()
  depth?: number;

  @Expose()
  unit?: string;
}

export class ArtworkTagResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;
}

export class ArtworkResponseDto {
  @Expose()
  id!: string;

  @Expose()
  sellerId!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  price!: string | null;

  @Expose()
  currency!: string | null;

  @Expose()
  status!: ArtworkStatus;

  @Expose()
  isPublished!: boolean;

  @Expose()
  @Type(() => ArtworkImageResponseDto)
  images!: ArtworkImageResponseDto[];

  @Expose()
  folderId!: string | null;

  @Expose()
  viewCount!: number;

  @Expose()
  @Type(() => ArtworkTagResponseDto)
  tags!: ArtworkTagResponseDto[];

  @Expose()
  createdAt!: string | null;

  @Expose()
  materials!: string | null;

  @Expose()
  @Type(() => ArtworkDimensionsResponseDto)
  dimensions!: ArtworkDimensionsResponseDto | null;

  @Expose()
  weight!: string | null;
}

export class ArtworkListMetaResponseDto {
  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  total!: number;

  @Expose()
  totalPages!: number;

  @Expose()
  hasNextPage!: boolean;

  @Expose()
  hasPreviousPage!: boolean;
}

export class ListArtworksResponseDto {
  @Expose()
  @Type(() => ArtworkResponseDto)
  data!: ArtworkResponseDto[];

  @Expose()
  @Type(() => ArtworkListMetaResponseDto)
  meta!: ArtworkListMetaResponseDto;
}

export class DeleteArtworkResponseDto {
  @Expose()
  success!: boolean;
}
