import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { artworkFolderValidationMessage } from '../../../common/utils/artwork-folder-validation-message.util';

export class UpdateArtworkFolderDto {
  @IsOptional()
  @IsString({ message: artworkFolderValidationMessage('string') })
  @MaxLength(100, {
    message: artworkFolderValidationMessage('max_length', { maxLength: 100 }),
  })
  name?: string;

  @IsOptional()
  @IsBoolean({ message: artworkFolderValidationMessage('boolean') })
  isVisible?: boolean;
}
