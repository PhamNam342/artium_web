import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsOptional, IsUUID } from 'class-validator';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';

export class BulkMoveArtworksInput {
  @IsArray({ message: artworkValidationMessage('array') })
  @ArrayNotEmpty({ message: artworkValidationMessage('not_empty') })
  @ArrayMaxSize(100, { message: artworkValidationMessage('max_length') })
  @IsUUID(undefined, {
    each: true,
    message: artworkValidationMessage('uuid'),
  })
  artworkIds!: string[];

  // A null value removes the artworks from their current folder.
  @IsOptional()
  @IsUUID(undefined, { message: artworkValidationMessage('uuid') })
  folderId!: string | null;
}

export class BulkMoveArtworksResponseDto {
  movedCount!: number;
}
