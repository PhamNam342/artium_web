import { ArrowLeft, ChevronLeft, ChevronRight, SearchX, UserRound } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import ArtworkCard from './ArtworkCard';
import { getArtworkImage } from '../artworkService';
import type { Artwork, ArtworkListMeta } from '../types';
import { useNavigate } from 'react-router-dom';
interface ArtworkGridProps {
  artworks: Artwork[];
  meta: ArtworkListMeta | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  variant?: 'artworks' | 'profiles';
  selectedProfileId?: string | null;
  onProfileSelect?: (sellerId: string) => void;
  onProfileBack?: () => void;
}

function ProfileCard({
  sellerId,
  artworks,
  onSelect,
}: {
  sellerId: string;
  artworks: Artwork[];
  onSelect: () => void;
}) {
  const { t } = useI18n();
  const featuredArtwork = artworks.find((artwork) => getArtworkImage(artwork.images)) || artworks[0];
  const image = featuredArtwork ? getArtworkImage(featuredArtwork.images) : undefined;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {image ? (
          <img
            src={image.secureUrl || image.url}
            alt={t('artworks.artistArtworkAlt', { artist: sellerId.slice(0, 8) })}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <UserRound className="h-9 w-9" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </div>
        <h2 className="mt-2 truncate text-base font-semibold text-slate-950">@{sellerId.slice(0, 8)}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('artworks.artistWorks', { count: artworks.length })}</p>
      </div>
    </button>
  );
}

export default function ArtworkGrid({
  artworks,
  meta,
  isLoading,
  error,
  onPageChange,
  variant = 'artworks',
  selectedProfileId,
  //onProfileSelect,
  onProfileBack,
}: ArtworkGridProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="columns-1 gap-4 min-[480px]:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="mb-4 break-inside-avoid overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className={`animate-pulse bg-slate-200 ${index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-square'}`} />
            <div className="space-y-2 p-3"><div className="h-3 w-2/5 animate-pulse rounded bg-slate-100" /><div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  if (artworks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <SearchX className="mx-auto h-9 w-9 text-slate-400" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900">{t('artworks.emptyTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('artworks.emptyDescription')}</p>
      </div>
    );
  }

  if (variant === 'profiles') {
    const profiles = Array.from(
      artworks.reduce((grouped, artwork) => {
        const profileArtworks = grouped.get(artwork.sellerId) || [];
        profileArtworks.push(artwork);
        grouped.set(artwork.sellerId, profileArtworks);
        return grouped;
      }, new Map<string, Artwork[]>()),
    );

    const selectedProfile = selectedProfileId
      ? profiles.find(([sellerId]) => sellerId === selectedProfileId)
      : undefined;

    if (selectedProfile) {
      const [sellerId, profileArtworks] = selectedProfile;

      return (
        <div>
          <button
            type="button"
            onClick={onProfileBack}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('artworks.backToProfiles')}
          </button>
          <div className="mb-7 flex items-center gap-4 border-b border-slate-200 pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-950">@{sellerId.slice(0, 8)}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('artworks.artistWorks', { count: profileArtworks.length })}</p>
            </div>
          </div>
          <div className="columns-1 gap-4 min-[480px]:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
            {profileArtworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
          </div>
        </div>
      );
    }

    return (
      <div className="columns-1 gap-4 min-[480px]:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
        {profiles.map(([sellerId, profileArtworks]) => (
          <ProfileCard
            key={sellerId}
            sellerId={sellerId}
            artworks={profileArtworks}
            onSelect={() => navigate(`/artists/${sellerId}`)}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 min-[480px]:columns-2 md:columns-3 lg:columns-4 xl:columns-5">
        {artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
      </div>

      {meta && meta.totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label={t('artworks.paginationLabel')}>
          <button
            type="button"
            disabled={!meta.hasPreviousPage}
            onClick={() => onPageChange(meta.page - 1)}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {t('artworks.previous')}
          </button>
          <span className="text-sm text-slate-600">{t('artworks.pageInfo', { page: meta.page, totalPages: meta.totalPages })}</span>
          <button
            type="button"
            disabled={!meta.hasNextPage}
            onClick={() => onPageChange(meta.page + 1)}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('artworks.next')} <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  );
}
