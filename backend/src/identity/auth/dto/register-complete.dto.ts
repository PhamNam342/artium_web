import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterCompleteDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string; // 6‑digit OTP

  @IsString()
  name?: string;
}
