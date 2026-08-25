import { IsOptional, IsString, MaxLength } from 'class-validator';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';

export class AdminDeleteArtworkDto {
  @IsOptional()
  @IsString({ message: artworkValidationMessage('string') })
  @MaxLength(500, { message: artworkValidationMessage('max_length') })
  reason?: string;
}
