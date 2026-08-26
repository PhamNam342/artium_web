import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArtworkFilters, { type ArtworkCategory } from '../features/artworks/components/ArtworkFilters';
import ArtworkGrid from '../features/artworks/components/ArtworkGrid';
import ArtistDirectory from '../features/artists/components/ArtistDirectory';
import type { ArtistFiltersValue } from '../features/artists/types';
import { artworkService } from '../features/artworks/artworkService';
import type { Artwork, ArtworkFiltersValue, ArtworkListMeta } from '../features/artworks/types';
import { useI18n } from '../i18n/I18nContext';

const INITIAL_ARTIST_FILTERS: ArtistFiltersValue = {
  search: '',
  verifiedOnly: false,
  followingOnly: false,
};
const PAGE_SIZE = 12;
const ARTWORK_CACHE_TTL_MS = 60_000;
const ARTWORK_CACHE_MAX_ENTRIES = 50;

type ArtworkPageCache = {
  data: Artwork[];
  meta: ArtworkListMeta;
  cachedAt: number;
};

const artworkPageCache = new Map<string, ArtworkPageCache>();

const getArtworkCacheKey = (
  category: ArtworkCategory,
  filters: ArtworkFiltersValue,
  page: number,
) => JSON.stringify({ category, filters, page });

export default function ArtworksPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ArtworkFiltersValue>(() => ({
    search: searchParams.get('search') ?? '',
    minPrice: searchParams.get('minPrice') ?? '',
    maxPrice: searchParams.get('maxPrice') ?? '',
  }));
  const [artistFilters, setArtistFilters] = useState<ArtistFiltersValue>(
    INITIAL_ARTIST_FILTERS,
  );
  const [activeCategory, setActiveCategory] = useState<ArtworkCategory>(() => {
    const category = searchParams.get('category');
    return category === 'artworks' || category === 'profiles' ? category : 'top-picks';
  });
  //const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const initialCacheEntry = artworkPageCache.get(getArtworkCacheKey(activeCategory, filters, page));
  const initialCache = initialCacheEntry && Date.now() - initialCacheEntry.cachedAt < ARTWORK_CACHE_TTL_MS
    ? initialCacheEntry
    : undefined;
  const [artworks, setArtworks] = useState<Artwork[]>(initialCache?.data ?? []);
  const [meta, setMeta] = useState<ArtworkListMeta | null>(initialCache?.meta ?? null);
  const [isLoading, setIsLoading] = useState(!initialCache);
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
    const nextParams = new URLSearchParams();
    if (activeCategory !== 'top-picks') nextParams.set('category', activeCategory);
    if (page > 1) nextParams.set('page', String(page));
    if (filters.search) nextParams.set('search', filters.search);
    if (filters.minPrice) nextParams.set('minPrice', filters.minPrice);
    if (filters.maxPrice) nextParams.set('maxPrice', filters.maxPrice);
    setSearchParams(nextParams, { replace: true });
  }, [activeCategory, filters, page, setSearchParams]);

  useEffect(() => {
    if (activeCategory === 'profiles') {
      return;
    }

    const cacheKey = getArtworkCacheKey(activeCategory, filters, page);
    const cachedEntry = artworkPageCache.get(cacheKey);
    const cached = cachedEntry && Date.now() - cachedEntry.cachedAt < ARTWORK_CACHE_TTL_MS
      ? cachedEntry
      : undefined;
    if (cached) {
      setArtworks(cached.data);
      setMeta(cached.meta);
      setIsLoading(false);
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
          sort: activeCategory === 'top-picks' ? 'top-picks' : undefined,
        });
        setArtworks(response.data);
        setMeta(response.meta);
        artworkPageCache.set(cacheKey, { ...response, cachedAt: Date.now() });
        while (artworkPageCache.size > ARTWORK_CACHE_MAX_ENTRIES) {
          const oldestKey = artworkPageCache.keys().next().value;
          if (!oldestKey) break;
          artworkPageCache.delete(oldestKey);
        }
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
        artistValue={artistFilters}
        onArtistChange={setArtistFilters}
      />
      {activeCategory === 'profiles' ? (
        <ArtistDirectory filters={artistFilters} />
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
