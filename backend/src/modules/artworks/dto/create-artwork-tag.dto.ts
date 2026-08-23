import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { artworkValidationMessage } from '../../../common/utils/artwork-validation-message.util';

export class CreateArtworkTagDto {
  @IsString({ message: artworkValidationMessage('string') })
  @IsNotEmpty({ message: artworkValidationMessage('not_empty') })
  @MaxLength(40, { message: artworkValidationMessage('max_length') })
  name!: string;
}
