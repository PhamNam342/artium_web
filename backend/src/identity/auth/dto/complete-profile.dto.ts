import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserRole } from '../../../user/entities/user.entity';

export class CompleteProfileDto {
  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
