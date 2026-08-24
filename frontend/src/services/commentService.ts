import api from './api';
import type {
  ArtworkComment,
  CreateArtworkCommentPayload,
} from '../features/comments/types';

export const artworkCommentService = {
  async getComments(artworkId: string): Promise<ArtworkComment[]> {
    const response = await api.get(
      `/community/artworks/${artworkId}/comments`,
    );
    console.log('===== DATA ======');
    console.log(response.data);
    return response.data;
  },

  async createComment(
    artworkId: string,
    payload: CreateArtworkCommentPayload,
  ): Promise<ArtworkComment> {
    const response = await api.post(
      `/community/artworks/${artworkId}/comments`,
      payload,
    );

    console.log('CREATE COMMENT RESPONSE:', response.data);

    return response.data;
  },

  async updateComment(
    artworkId: string,
    commentId: string,
    payload: CreateArtworkCommentPayload,
  ): Promise<ArtworkComment> {
    const response = await api.patch(
      `/community/artworks/${artworkId}/comments/${commentId}`,
      payload,
    );

    return response.data;
  },

  async deleteComment(
    artworkId: string,
    commentId: string,
  ): Promise<void> {
    await api.delete(
      `/community/artworks/${artworkId}/comments/${commentId}`,
    );
  },

  async countComments(artworkId: string): Promise<number> {
    const response = await api.get(
      `/community/artworks/${artworkId}/comments/count`,
    );

    return response.data.count;
  },
};
