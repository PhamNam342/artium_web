import { IsBoolean } from 'class-validator';

export class UpdateSellerProfileVisibilityDto {
  @IsBoolean()
  isVisible!: boolean;
}
