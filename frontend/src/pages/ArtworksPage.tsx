import { useEffect, useState } from 'react';
import ArtworkFilters, { type ArtworkCategory } from '../features/artworks/components/ArtworkFilters';
import ArtworkGrid from '../features/artworks/components/ArtworkGrid';
import ArtistDirectory from '../features/artists/components/ArtistDirectory';
import { artworkService } from '../features/artworks/artworkService';
import type { Artwork, ArtworkFiltersValue, ArtworkListMeta } from '../features/artworks/types';
import { useI18n } from '../i18n/I18nContext';

const INITIAL_FILTERS: ArtworkFiltersValue = { search: '', minPrice: '', maxPrice: '' };
const PAGE_SIZE = 12;

export default function ArtworksPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<ArtworkFiltersValue>(INITIAL_FILTERS);
  const [activeCategory, setActiveCategory] = useState<ArtworkCategory>('top-picks');
  //const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [meta, setMeta] = useState<ArtworkListMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFiltersChange = (nextFilters: ArtworkFiltersValue) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleCategoryChange = (category: ArtworkCategory) => {
    setActiveCategory(category);
    setPage(1);
  };

  useEffect(() => {
    if (activeCategory === 'profiles') {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await artworkService.getArtworks({
          ...filters,
          page,
          limit: PAGE_SIZE,
        });
        setArtworks(response.data);
        setMeta(response.meta);
        console.log(response.meta);
      } catch {
        setArtworks([]);
        setMeta(null);
        setError(t('artworks.loadError'));
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeCategory, filters, page, t]);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-white">
      <ArtworkFilters
        value={filters}
        onChange={handleFiltersChange}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        resultCount={meta?.total}
      />
      {activeCategory === 'profiles' ? (
        <ArtistDirectory />
      ) : (
        <section className="mx-auto max-w-[1600px] px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          <ArtworkGrid
            artworks={artworks}
            meta={meta}
            isLoading={isLoading}
            error={error}
            onPageChange={setPage}
          />
        </section>
      )}
    </div>
  );
}
