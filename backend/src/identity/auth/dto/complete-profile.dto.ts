import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { UserRole } from '../../user/entities/user.entity';

export class CompleteProfileDto {
  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @MaxLength(100)
  full_name!: string;

  @IsString()
  @MaxLength(255)
  location!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;
}
