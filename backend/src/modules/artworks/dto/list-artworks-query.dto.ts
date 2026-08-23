import { IsOptional, IsString, IsUUID } from 'class-validator';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';

export class ListArtworksQueryDto {
  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  page?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  limit?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  search?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  minPrice?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  maxPrice?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  category?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  material?: string;

  @IsOptional()
  @IsUUID(undefined, { message: artworkValidationMessage('uuid') })
  sellerId?: string;
}
