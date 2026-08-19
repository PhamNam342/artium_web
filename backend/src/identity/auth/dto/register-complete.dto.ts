import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterCompleteDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  otp!: string; // 6‑digit OTP

  @IsString()
  @IsOptional()
  name?: string;
}
