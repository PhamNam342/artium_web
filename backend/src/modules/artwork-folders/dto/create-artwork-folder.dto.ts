import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateArtworkFolderDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
