import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { authValidationMessage } from '../../../common/utils/auth-validation-message.util';

export class RegisterCompleteDto {
  @IsEmail({}, { message: authValidationMessage('email') })
  email!: string;

  @IsString({ message: authValidationMessage('string') })
  @Length(6, 6, { message: authValidationMessage('length') })
  otp!: string; // 6‑digit OTP

  @IsOptional()
  @IsString({ message: authValidationMessage('string') })
  name?: string;
}
