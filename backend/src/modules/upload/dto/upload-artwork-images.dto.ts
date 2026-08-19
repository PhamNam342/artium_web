import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';

export class UploadArtworkImagesDto {
  @IsString({ message: artworkValidationMessage('string') })
  @IsNotEmpty({ message: artworkValidationMessage('not_empty') })
  sellerId?: string;

  @IsString({ message: artworkValidationMessage('string') })
  @IsNotEmpty({ message: artworkValidationMessage('not_empty') })
  artworkId?: string;

  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  altText?: string;
}
