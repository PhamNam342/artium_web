export interface ArtworkCommentUser {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

export interface ArtworkComment {
  id: string;
  userId: string;
  artworkId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: ArtworkCommentUser;
}

export interface CreateArtworkCommentPayload {
  content: string;
}
export interface UpdateArtworkCommentPayload {
  content: string;
}
