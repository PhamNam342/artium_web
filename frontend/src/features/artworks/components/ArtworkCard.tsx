import { ImageOff, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../../i18n/I18nContext';
import type { PublicUserProfile } from '../../../services/userService';
import { formatArtworkPrice, getArtworkImage } from '../artworkService';
import type { Artwork } from '../types';

interface ArtworkCardProps {
  artwork: Artwork;
  artist?: PublicUserProfile;
}

function getImageAspectRatio(artwork: Artwork, image?: ReturnType<typeof getArtworkImage>) {
  const width = image?.width ?? artwork.dimensions?.width;
  const height = image?.height ?? artwork.dimensions?.height;

  if (!width || !height) return undefined;
  return `${Math.max(0.65, Math.min(width / height, 1.55))}`;
}

export default function ArtworkCard({ artwork, artist }: ArtworkCardProps) {
  const image = getArtworkImage(artwork.images);
  const { language, t } = useI18n();
  const [hasImageError, setHasImageError] = useState(false);
  const imageAspectRatio = getImageAspectRatio(artwork, image);
  const artistName = artist?.full_name || t('artworks.artist');

  return (
    <Link
      to={`/artworks/${artwork.id}`}
      className="group mb-4 inline-block w-full break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white align-top transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div
        className="relative overflow-hidden bg-slate-100"
        style={{ aspectRatio: imageAspectRatio ?? '4 / 5' }}
      >
        {image && !hasImageError ? (
          <img
            src={image.secureUrl || image.url}
            alt={image.altText || image.alt || artwork.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex min-h-48 items-center justify-center text-slate-400">
            <ImageOff className="h-7 w-7" aria-hidden="true" />
            <span className="sr-only">{t('artworks.imageUnavailable')}</span>
          </div>
        )}

        {artwork.price !== null && (
          <span className="absolute bottom-2 right-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
            {formatArtworkPrice(
              artwork.price,
              artwork.currency,
              language === 'en' ? 'en-US' : 'vi-VN',
              t('artworks.priceOnRequest'),
            )}
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {artist?.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt=""
              className="h-5 w-5 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound className="h-3 w-3" aria-hidden="true" />
            </span>
          )}
          <span className="truncate" title={artistName}>{artistName}</span>
        </div>
        <h2 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-5 text-slate-950">{artwork.title}</h2>
        {artwork.tags.length > 0 && (
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{artwork.tags.map((tag) => tag.name).join(' · ')}</p>
        )}
      </div>
    </Link>
  );
}
