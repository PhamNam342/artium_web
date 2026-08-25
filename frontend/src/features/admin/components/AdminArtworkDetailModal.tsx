import { X, Trash2, ImageOff, Tag, MapPin, Ruler, Weight, Eye, Calendar, DollarSign, User } from 'lucide-react';
import type { AdminArtwork } from '../../../services/adminService';
import { useI18n } from '../../../i18n/I18nContext';
import { useState } from 'react';

interface Props {
  artwork: AdminArtwork | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick: (artwork: AdminArtwork) => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  SOLD: 'bg-blue-100 text-blue-700',
  RESERVED: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
  PENDING_REVIEW: 'bg-purple-100 text-purple-700',
};

export default function AdminArtworkDetailModal({ artwork, isOpen, onClose, onDeleteClick }: Props) {
  const { t } = useI18n();
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!isOpen || !artwork) return null;

  const images = artwork.images ?? [];
  const activeImage = images[activeImageIdx];

  // Seller display — data already comes from the API JOIN
  const sellerDisplayName = artwork.sellerName || artwork.sellerEmail || artwork.sellerId;
  const sellerEmail = artwork.sellerEmail;

  const handleDeleteClick = () => {
    onDeleteClick(artwork);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-4">
            {t('admin.artworks.detail.title')}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Image gallery */}
          <div className="relative bg-gray-100 aspect-square w-full">
            {activeImage ? (
              <img
                src={activeImage.url}
                alt={artwork.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageOff className="h-16 w-16 text-gray-300" />
              </div>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white">
                {activeImageIdx + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-gray-50 border-b border-gray-200">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex-shrink-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-colors ${
                    idx === activeImageIdx
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="px-6 py-5 space-y-5">
            {/* Title + Status */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {artwork.title}
                </h3>
                <span
                  className={`flex-shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    STATUS_COLORS[artwork.status] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {artwork.status}
                </span>
              </div>

              {/* Published badge */}
              <p className="mt-1 text-xs text-gray-400">
                {artwork.isPublished
                  ? t('admin.artworks.detail.published')
                  : t('admin.artworks.detail.unpublished')}
              </p>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Price */}
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    {t('admin.artworks.detail.price')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {artwork.price
                      ? `${Number(artwork.price).toLocaleString()} ${artwork.currency ?? ''}`
                      : <span className="text-gray-400 font-normal">—</span>}
                  </p>
                </div>
              </div>

              {/* Created */}
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    {t('admin.artworks.detail.createdAt')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(artwork.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Views */}
              {'viewCount' in artwork && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                  <Eye className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                      {t('admin.artworks.detail.views')}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {(artwork as AdminArtwork & { viewCount?: number }).viewCount ?? 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Seller */}
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2.5">
                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    {t('admin.artworks.detail.artist')}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {sellerDisplayName}
                  </p>
                  {sellerEmail && sellerEmail !== sellerDisplayName && (
                    <p className="text-xs text-gray-500 truncate">{sellerEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {'description' in artwork && (artwork as AdminArtwork & { description?: string | null }).description && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                  {t('admin.artworks.detail.description')}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {(artwork as AdminArtwork & { description?: string | null }).description}
                </p>
              </div>
            )}

            {/* Extra info */}
            <div className="space-y-2">
              {'materials' in artwork && (artwork as AdminArtwork & { materials?: string | null }).materials && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-500">{t('admin.artworks.detail.materials')}:</span>
                  <span>{(artwork as AdminArtwork & { materials?: string | null }).materials}</span>
                </div>
              )}

              {'location' in artwork && (artwork as AdminArtwork & { location?: string | null }).location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-500">{t('admin.artworks.detail.location')}:</span>
                  <span>{(artwork as AdminArtwork & { location?: string | null }).location}</span>
                </div>
              )}

              {'dimensions' in artwork && (artwork as AdminArtwork & { dimensions?: { width?: number; height?: number; depth?: number; unit?: string } | null }).dimensions && (() => {
                const dims = (artwork as AdminArtwork & { dimensions?: { width?: number; height?: number; depth?: number; unit?: string } | null }).dimensions!;
                const parts = [dims.width && `${dims.width}`, dims.height && `${dims.height}`, dims.depth && `${dims.depth}`].filter(Boolean);
                return parts.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Ruler className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-500">{t('admin.artworks.detail.dimensions')}:</span>
                    <span>{parts.join(' × ')} {dims.unit ?? 'cm'}</span>
                  </div>
                ) : null;
              })()}

              {'weight' in artwork && (artwork as AdminArtwork & { weight?: string | null }).weight && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Weight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-500">{t('admin.artworks.detail.weight')}:</span>
                  <span>{(artwork as AdminArtwork & { weight?: string | null }).weight} kg</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {'tags' in artwork && Array.isArray((artwork as AdminArtwork & { tags?: Array<{ name: string }> }).tags) && (artwork as AdminArtwork & { tags?: Array<{ name: string }> }).tags!.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  {t('admin.artworks.detail.tags')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(artwork as AdminArtwork & { tags?: Array<{ name: string }> }).tags!.map((tag) => (
                    <span
                      key={tag.name}
                      className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Artwork ID */}
            <div className="rounded-lg bg-gray-50 px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mb-0.5">
                {t('admin.artworks.detail.artworkId')}
              </p>
              <p className="text-xs font-mono text-gray-500 break-all">{artwork.id}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            {t('admin.artworks.detail.close')}
          </button>
          <button
            id={`admin-detail-delete-${artwork.id}`}
            onClick={handleDeleteClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Trash2 className="h-4 w-4" />
            {t('admin.artworks.actions.delete')}
          </button>
        </div>
      </div>
    </>
  );
}
