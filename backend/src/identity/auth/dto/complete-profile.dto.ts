import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { authValidationMessage } from '../../../common/utils/auth-validation-message.util';
import { UserRole } from '../../../user/entities/user.entity';

export class CompleteProfileDto {
  @IsEnum(UserRole, { message: authValidationMessage('enum') })
  role!: UserRole;

  @IsOptional()
  @IsString({ message: authValidationMessage('string') })
  @MaxLength(255, { message: authValidationMessage('max_length') })
  full_name?: string;

  @IsOptional()
  @IsString({ message: authValidationMessage('string') })
  location?: string;
}
