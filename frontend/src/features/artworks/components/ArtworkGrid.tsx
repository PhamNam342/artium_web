import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';
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
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] animate-pulse bg-slate-200" />
            <div className="space-y-3 p-4"><div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" /><div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" /></div>
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
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Không tìm thấy tác phẩm</h2>
        <p className="mt-1 text-sm text-slate-500">Hãy thử thay đổi từ khóa hoặc khoảng giá của bạn.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
      </div>

      {meta && meta.totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Phân trang tác phẩm">
          <button
            type="button"
            disabled={!meta.hasPreviousPage}
            onClick={() => onPageChange(meta.page - 1)}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Trước
          </button>
          <span className="text-sm text-slate-600">Trang {meta.page} / {meta.totalPages}</span>
          <button
            type="button"
            disabled={!meta.hasNextPage}
            onClick={() => onPageChange(meta.page + 1)}
            className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sau <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  );
}
