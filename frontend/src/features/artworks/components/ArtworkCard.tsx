import { ImageOff, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatArtworkPrice, getArtworkImage } from '../artworkService';
import type { Artwork } from '../types';

interface ArtworkCardProps {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const image = getArtworkImage(artwork.images);

  return (
    <Link
      to={`/artworks/${artwork.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image.secureUrl || image.url}
            alt={image.altText || image.alt || artwork.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <span className="sr-only">Tác phẩm chưa có hình ảnh</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-1 text-base font-semibold text-slate-900">{artwork.title}</h2>
          <span className="shrink-0 text-sm font-semibold text-slate-900">
            {formatArtworkPrice(artwork.price, artwork.currency)}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
          {artwork.materials || 'Tác phẩm nghệ thuật nguyên bản'}
        </p>

        {artwork.tags.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Tag className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="line-clamp-1">{artwork.tags.map((tag) => tag.name).join(' · ')}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
