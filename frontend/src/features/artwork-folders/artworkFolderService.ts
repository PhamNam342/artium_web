import api from '../../services/api';
import type {
  ArtworkFolder,
  ArtworkFolderInput,
  ArtworkFolderTree,
  ArtworkFolderUpdate,
  FolderArtworkListResponse,
} from './types';

export const artworkFolderService = {
  async getTree(sellerId: string): Promise<ArtworkFolderTree[]> {
    const response = await api.get<ArtworkFolderTree[]>(
      `/sellers/${sellerId}/artwork-folders/tree`,
    );
    return response.data;
  },

  async create(sellerId: string, input: ArtworkFolderInput): Promise<ArtworkFolder> {
    const response = await api.post<ArtworkFolder>(
      `/sellers/${sellerId}/artwork-folders`,
      input,
    );
    return response.data;
  },

  async update(folderId: string, input: ArtworkFolderUpdate): Promise<ArtworkFolder> {
    const response = await api.patch<ArtworkFolder>(`/artwork-folders/${folderId}`, input);
    return response.data;
  },

  async move(folderId: string, parentId: string | null): Promise<ArtworkFolder> {
    const response = await api.patch<ArtworkFolder>(`/artwork-folders/${folderId}/move`, {
      parentId,
    });
    return response.data;
  },

  async remove(folderId: string): Promise<void> {
    await api.delete(`/artwork-folders/${folderId}`);
  },

  async getArtworks(folderId: string, page = 1, limit = 100): Promise<FolderArtworkListResponse> {
    const response = await api.get<FolderArtworkListResponse>(
      `/artwork-folders/${folderId}/artworks`,
      { params: { page, limit } },
    );
    return response.data;
  },
};
