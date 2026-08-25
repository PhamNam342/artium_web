import { Expose, Type } from 'class-transformer';
import { ArtworkResponseDto } from '../../artworks/dto/artwork-response.dto';

export class ArtworkFolderResponseDto {
  @Expose()
  id!: string;

  @Expose()
  sellerId!: string;

  @Expose()
  name!: string;

  @Expose()
  parentId!: string | null;

  @Expose()
  isVisible!: boolean;

  @Expose()
  artworkCount!: number;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}

export class ArtworkFolderTreeResponseDto extends ArtworkFolderResponseDto {
  @Expose()
  @Type(() => ArtworkFolderTreeResponseDto)
  children!: ArtworkFolderTreeResponseDto[];
}

export class FolderArtworkListMetaResponseDto {
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

export class ListFolderArtworksResponseDto {
  @Expose()
  @Type(() => ArtworkResponseDto)
  data!: ArtworkResponseDto[];

  @Expose()
  @Type(() => FolderArtworkListMetaResponseDto)
  meta!: FolderArtworkListMetaResponseDto;
}
