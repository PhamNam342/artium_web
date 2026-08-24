import { IsOptional, IsString } from 'class-validator';
import { artworkFolderValidationMessage } from '../../../common/utils/artwork-folder-validation-message.util';

export class ListFolderArtworksQueryDto {
  @IsOptional()
  @IsString({ message: artworkFolderValidationMessage('string') })
  page?: string;

  @IsOptional()
  @IsString({ message: artworkFolderValidationMessage('string') })
  limit?: string;
}
