import { IsOptional, IsUUID } from 'class-validator';
import { artworkFolderValidationMessage } from '../../../common/utils/artwork-folder-validation-message.util';

export class MoveArtworkFolderDto {
  @IsOptional()
  @IsUUID(undefined, { message: artworkFolderValidationMessage('uuid') })
  parentId?: string | null;
}
