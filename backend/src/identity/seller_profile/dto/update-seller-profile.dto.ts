import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateSellerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;
}
