import api from '../../services/api';
import type { Artwork, ArtworkImage, ArtworkListQuery, ArtworkListResponse } from './types';

const cleanQuery = (query: ArtworkListQuery) =>
  Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  );

const USD_TO_VND_RATE = 26_000;

export function getArtworkImage(images: ArtworkImage[] = []) {
  return [...images].sort((first, second) => {
    if (first.isPrimary !== second.isPrimary) return first.isPrimary ? -1 : 1;
    return (first.order ?? 0) - (second.order ?? 0);
  })[0];
}

export function formatArtworkPrice(
  price: string | null,
  currency: string | null,
  locale: string,
  priceOnRequest: string,
) {
  if (price === null) return priceOnRequest;

  const value = Number(price);
  if (!Number.isFinite(value)) return price;

  const shouldConvertToVnd = locale === 'vi-VN' && currency === 'USD';
  const displayValue = shouldConvertToVnd ? value * USD_TO_VND_RATE : value;
  const displayCurrency = shouldConvertToVnd ? 'VND' : currency || 'VND';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: displayCurrency,
      maximumFractionDigits: displayCurrency === 'VND' ? 0 : 2,
    }).format(displayValue);
  } catch {
    return `${displayValue.toLocaleString(locale)} ${displayCurrency}`.trim();
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
