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
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';
import { artworkStatusValues } from './artwork-status-values';

export type ArtworkWeightInput = {
  value?: number | string;
  unit?: string;
};

export class ArtworkImageDto {
  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  publicId?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  url?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  secureUrl?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  format?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  size?: number;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  bucket?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  alt?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  altText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  order?: number;

  @IsOptional()
  @IsBoolean({ message: artworkValidationMessage('boolean') })
  isPrimary?: boolean;
}

export class ArtworkDimensionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  height?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  width?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  depth?: number;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  unit?: string;
}

export class CreateArtworkDto {
  @IsNotEmpty({ message: artworkValidationMessage('not_empty') })
  @IsOptional()
  @IsUUID(undefined, { message: artworkValidationMessage('uuid') })
  sellerId?: string;

  @IsString({ message: artworkValidationMessage('string') })
  @IsNotEmpty({ message: artworkValidationMessage('not_empty') })
  @MaxLength(100, { message: artworkValidationMessage('max_length') })
  title?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(0, { message: artworkValidationMessage('min') })
  price?: number;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  @MaxLength(10, { message: artworkValidationMessage('max_length') })
  currency?: string;

  @IsOptional()
  @IsIn(artworkStatusValues, { message: artworkValidationMessage('enum') })
  status?: ArtworkStatus | string;

  @IsOptional()
  @IsBoolean({ message: artworkValidationMessage('boolean') })
  isPublished?: boolean;

  @IsOptional()
  @IsArray({ message: artworkValidationMessage('array') })
  @ValidateNested({ each: true })
  @Type(() => ArtworkImageDto)
  images?: ArtworkImageDto[];

  @IsOptional()
  @IsUUID(undefined, { message: artworkValidationMessage('uuid') })
  folderId?: string | null;

  @IsOptional()
  @IsArray({ message: artworkValidationMessage('array') })
  @IsUUID(undefined, {
    each: true,
    message: artworkValidationMessage('uuid'),
  })
  tagIds?: string[];

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  @MaxLength(80, { message: artworkValidationMessage('max_length') })
  materials?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  @MaxLength(80, { message: artworkValidationMessage('max_length') })
  material?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ArtworkDimensionsDto)
  dimensions?: ArtworkDimensionsDto | null;

  @IsOptional()
  @Allow()
  weight?: string | number | ArtworkWeightInput | null;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  creatorName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  creationYear?: number;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  editionRun?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: artworkValidationMessage('number') })
  @Min(1, { message: artworkValidationMessage('min') })
  quantity?: number;
}
