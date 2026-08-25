import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { artworkFolderValidationMessage } from '../../../common/utils/artwork-folder-validation-message.util';

export class CreateArtworkFolderDto {
  @IsString({ message: artworkFolderValidationMessage('string') })
  @MaxLength(100, {
    message: artworkFolderValidationMessage('max_length', { maxLength: 100 }),
  })
  name!: string;

  @IsOptional()
  @IsUUID(undefined, { message: artworkFolderValidationMessage('uuid') })
  parentId?: string | null;
}
