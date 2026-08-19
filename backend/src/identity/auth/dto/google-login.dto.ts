import { IsNotEmpty, IsString } from 'class-validator';
import { authValidationMessage } from '../../../common/utils/auth-validation-message.util';

export class GoogleLoginDto {
  @IsString({ message: authValidationMessage('string') })
  @IsNotEmpty({ message: authValidationMessage('not_empty') })
  idToken!: string;
}
