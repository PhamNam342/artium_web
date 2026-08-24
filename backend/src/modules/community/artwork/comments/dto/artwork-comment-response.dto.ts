export class ArtworkCommentUserDto {
  id!: string;
  full_name?: string;
  avatar_url?: string;
}

export class ArtworkCommentResponseDto {
  id!: string;
  userId!: string;
  artworkId!: string;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;
  user!: ArtworkCommentUserDto;
}
