import type { Artwork, ArtworkListMeta } from '../artworks/types';

export interface ArtworkFolder {
  id: string;
  sellerId: string;
  name: string;
  parentId: string | null;
  isVisible: boolean;
  artworkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArtworkFolderTree extends ArtworkFolder {
  children: ArtworkFolderTree[];
}

export interface ArtworkFolderInput {
  name: string;
  parentId?: string | null;
}

export interface ArtworkFolderUpdate {
  name?: string;
  isVisible?: boolean;
}

export interface FolderArtworkListResponse {
  data: Artwork[];
  meta: ArtworkListMeta;
}
