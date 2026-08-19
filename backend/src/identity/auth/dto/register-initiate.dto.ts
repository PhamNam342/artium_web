import { IsEmail, IsString, Length } from 'class-validator';
import { authValidationMessage } from '../../../common/utils/auth-validation-message.util';

export class RegisterInitiateDto {
  @IsEmail({}, { message: authValidationMessage('email') })
  email!: string;

  @IsString({ message: authValidationMessage('string') })
  @Length(6, 32, { message: authValidationMessage('length') })
  password!: string;
}
