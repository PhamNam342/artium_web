import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { authValidationMessage } from '../../../common/utils/auth-validation-message.util';

export class LoginDto {
  @IsEmail({}, { message: authValidationMessage('email') })
  email!: string;

  @IsString({ message: authValidationMessage('string') })
  @IsNotEmpty({ message: authValidationMessage('not_empty') })
  password!: string;
}
