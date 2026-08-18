import { Type } from 'class-transformer';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ArtworkStatus } from '../artwork.entity';

const artworkStatusValues = [
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

export type ArtworkWeightInput = {
  value?: number | string;
  unit?: string;
};

export class ArtworkImageDto {
  @IsOptional()
  @IsString()
  publicId?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  secureUrl?: string;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class ArtworkDimensionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  depth?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateArtworkDto {
  @IsUUID()
  sellerId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsIn(artworkStatusValues)
  status?: ArtworkStatus | string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtworkImageDto)
  images?: ArtworkImageDto[];

  @IsOptional()
  @IsUUID()
  folderId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  materials?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  material?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArtworkDimensionsDto)
  dimensions?: ArtworkDimensionsDto | null;

  @IsOptional()
  @Allow()
  weight?: string | number | ArtworkWeightInput | null;

  @IsOptional()
  @IsString()
  creatorName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  creationYear?: number;

  @IsOptional()
  @IsString()
  editionRun?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;
}
