import { IsOptional, IsString } from 'class-validator';

export class ListFolderArtworksQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
