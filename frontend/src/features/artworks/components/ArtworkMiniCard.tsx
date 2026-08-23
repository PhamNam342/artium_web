import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  formatArtworkPrice,
  getArtworkImage,
} from '../artworkService';

import type { Artwork } from '../types';

interface ArtworkMiniCardProps {
  artwork: Artwork;
  locale: string;
  priceOnRequest: string;
  variant?: 'grid' | 'masonry';
}

export default function ArtworkMiniCard({
  artwork,
  locale,
  priceOnRequest,
  variant = 'grid',
}: ArtworkMiniCardProps) {
  const image = getArtworkImage(artwork.images);

  const [hasImageError, setHasImageError] = useState(false);

  const formattedPrice = formatArtworkPrice(
    artwork.price,
    artwork.currency,
    locale,
    priceOnRequest,
  );

  const dimensions = artwork.dimensions;

  const dimensionText = dimensions
    ? [dimensions.height, dimensions.width, dimensions.depth]
        .filter(Boolean)
        .map((value) => `${value}`)
        .join(' x ') +
      (dimensions.unit ? ` ${dimensions.unit}` : '')
    : null;

  return (
    <Link
      to={`/artworks/${artwork.id}`}
      className={`group overflow-hidden rounded-lg border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
        variant === 'masonry'
          ? 'mb-4 inline-block w-full break-inside-avoid'
          : 'block'
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {image && !hasImageError ? (
          <img
            src={image.secureUrl || image.url}
            alt={
              image.altText ||
              image.alt ||
              artwork.title
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageOff className="h-7 w-7" />
          </div>
        )}

        {artwork.price !== null && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
            {formattedPrice}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-950">
          {artwork.title}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
          {artwork.materials && (
            <span>{artwork.materials}</span>
          )}

          {artwork.materials && dimensionText && (
            <span> · </span>
          )}

          {dimensionText && (
            <span>{dimensionText}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
