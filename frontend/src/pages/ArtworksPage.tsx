import { useEffect, useState } from 'react';
import ArtworkFilters from '../features/artworks/components/ArtworkFilters';
import ArtworkGrid from '../features/artworks/components/ArtworkGrid';
import { artworkService } from '../features/artworks/artworkService';
import type { Artwork, ArtworkFiltersValue, ArtworkListMeta } from '../features/artworks/types';

const INITIAL_FILTERS: ArtworkFiltersValue = { search: '', minPrice: '', maxPrice: '' };
const PAGE_SIZE = 12;

export default function ArtworksPage() {
  const [filters, setFilters] = useState<ArtworkFiltersValue>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [meta, setMeta] = useState<ArtworkListMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFiltersChange = (nextFilters: ArtworkFiltersValue) => {
    setFilters(nextFilters);
    setPage(1);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await artworkService.getArtworks({ ...filters, page, limit: PAGE_SIZE });
        setArtworks(response.data);
        setMeta(response.meta);
      } catch {
        setArtworks([]);
        setMeta(null);
        setError('Không thể tải danh sách tác phẩm. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters, page]);

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Khám phá</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Tác phẩm nghệ thuật</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">Khám phá các tác phẩm nguyên bản được nghệ sĩ chia sẻ trên Artium.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <ArtworkFilters value={filters} onChange={handleFiltersChange} resultCount={meta?.total} />
        <div className="mt-7">
          <ArtworkGrid artworks={artworks} meta={meta} isLoading={isLoading} error={error} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}
