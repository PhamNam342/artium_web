import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateArtworkFolderDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}
