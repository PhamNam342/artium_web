import { IsBoolean, IsIn } from 'class-validator';
import { ArtworkStatus } from '../artwork.entity';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';
import { artworkStatusValues } from './artwork-status-values';

export class UpdateArtworkStatusDto {
  @IsIn(artworkStatusValues, { message: artworkValidationMessage('enum') })
  status!: ArtworkStatus | string;
}

export class UpdateArtworkPublishDto {
  @IsBoolean({ message: artworkValidationMessage('boolean') })
  isPublished!: boolean;
}
