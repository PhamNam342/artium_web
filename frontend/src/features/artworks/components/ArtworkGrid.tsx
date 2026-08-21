import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import ArtworkCard from './ArtworkCard';
import type { Artwork, ArtworkListMeta } from '../types';

interface ArtworkGridProps {
  artworks: Artwork[];
  meta: ArtworkListMeta | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

export default function ArtworkGrid({ artworks, meta, isLoading, error, onPageChange }: ArtworkGridProps) {
  const { t } = useI18n();
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
