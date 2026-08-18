import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadArtworkImagesDto {
  @IsString()
  @IsNotEmpty()
  sellerId?: string;

  @IsString()
  @IsNotEmpty()
  artworkId?: string;

  @IsOptional()
  @IsString()
  altText?: string;
}
