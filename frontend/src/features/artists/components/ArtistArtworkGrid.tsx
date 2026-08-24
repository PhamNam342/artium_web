import { Loader2 } from 'lucide-react';

import ArtworkMiniCard from '../../artworks/components/ArtworkMiniCard';

import type { Artwork } from '../../artworks/types';

interface ArtistArtworkGridProps {
  artworks: Artwork[];
  isLoading: boolean;
  locale: string;
  priceOnRequest: string;
  limit?: number;
  masonry?: boolean;
}

export default function ArtistArtworkGrid({
  artworks,
  isLoading,
  locale,
  priceOnRequest,
  limit,
  masonry = false,
}: ArtistArtworkGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (artworks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-sm text-slate-500">
          No artworks yet
        </p>
      </div>
    );
  }

  const displayedArtworks = limit
    ? artworks.slice(0, limit)
    : artworks;

  return (
    <div
      className={
        masonry
          ? 'grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          : 'grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      }
    >
      {displayedArtworks.map((artwork) => (
        <ArtworkMiniCard
          key={artwork.id}
          artwork={artwork}
          locale={locale}
          priceOnRequest={priceOnRequest}
          variant="grid"
        />
      ))}
    </div>
  );
}
