import { IsOptional, IsUUID } from 'class-validator';

export class MoveArtworkFolderDto {
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
