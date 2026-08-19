import { IsEmail, IsString, Length } from 'class-validator';

export class RegisterInitiateDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 32)
  password!: string;
}
