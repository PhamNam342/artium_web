import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';

export class UploadArtworkImagesDto {
  @IsString({ message: artworkValidationMessage('string') })
  @IsNotEmpty({ message: artworkValidationMessage('not_empty') })
  @IsUUID(undefined, { message: artworkValidationMessage('uuid') })
  artworkId?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  altText?: string;
}
