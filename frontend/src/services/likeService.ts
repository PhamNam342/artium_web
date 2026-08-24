import api from './api';
import type { ArtworkLike } from '../features/Likes/types';

interface LikeStatusResponse {
  isLiked: boolean;
}

interface LikeCountResponse {
  count: number;
}

export const artworkLikeService = {
  async like(artworkId: string): Promise<ArtworkLike> {
    const response = await api.post<ArtworkLike>(
      `/community/artworks/${artworkId}/like`,
    );

    return response.data;
  },

  async unlike(artworkId: string) {
    const response = await api.delete(
      `/community/artworks/${artworkId}/like`,
    );

    return response.data;
  },

  async getLikes(artworkId: string): Promise<ArtworkLike[]> {
    const response = await api.get<ArtworkLike[]>(
      `/community/artworks/${artworkId}/likes`,
    );

    return response.data;
  },

  async getLikeStatus(artworkId: string): Promise<boolean> {
    const response = await api.get<LikeStatusResponse>(
      `/community/artworks/${artworkId}/like/status`,
    );

    return response.data.isLiked;
  },

  async getLikeCount(artworkId: string): Promise<number> {
    const response = await api.get<LikeCountResponse>(
      `/community/artworks/${artworkId}/like/count`,
    );

    return response.data.count;
  },
};
