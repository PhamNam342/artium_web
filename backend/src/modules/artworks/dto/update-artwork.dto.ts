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
import {
  ArtworkDimensionsDto,
  ArtworkImageDto,
  ArtworkWeightInput,
} from './create-artwork.dto';
import { artworkStatusValues } from './artwork-status-values';

export class UpdateArtworkDto {
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
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
