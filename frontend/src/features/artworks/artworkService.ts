import api from '../../services/api';
import type { Artwork, ArtworkImage, ArtworkListQuery, ArtworkListResponse } from './types';

const cleanQuery = (query: ArtworkListQuery) =>
  Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  );

export function getArtworkImage(images: ArtworkImage[] = []) {
  return [...images].sort((first, second) => {
    if (first.isPrimary !== second.isPrimary) return first.isPrimary ? -1 : 1;
    return (first.order ?? 0) - (second.order ?? 0);
  })[0];
}

export function formatArtworkPrice(price: string | null, currency: string | null) {
  if (price === null) return 'Liên hệ để biết giá';

  const value = Number(price);
  if (!Number.isFinite(value)) return price;

  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toLocaleString('vi-VN')} ${currency || ''}`.trim();
  }
}

export const artworkService = {
  async getArtworks(query: ArtworkListQuery = {}): Promise<ArtworkListResponse> {
    const response = await api.get<ArtworkListResponse>('/artwork', {
      params: cleanQuery(query),
    });

    return response.data;
  },

  async getArtwork(id: string): Promise<Artwork> {
    const response = await api.get<Artwork>(`/artwork/${id}`);
    return response.data;
  },
};
