import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { UserRole } from '../../user/entities/user.entity';
const ALLOWED_ROLES = [UserRole.ARTIST, UserRole.COLLECTOR] as const;
export class CompleteProfileDto {
  @IsIn(ALLOWED_ROLES, {
    message: `role must be one of: ${[UserRole.ARTIST, UserRole.COLLECTOR].join(', ')}`,
  })
  role!: UserRole.ARTIST | UserRole.COLLECTOR;

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
