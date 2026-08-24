import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateArtworkCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
