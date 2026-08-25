import { Camera, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nContext';
import { useAuth } from '../../auth/AuthContext';
import type { ArtistFiltersValue } from '../../artists/types';
import type { ArtworkFiltersValue } from '../types';

interface ArtworkFiltersProps {
  value: ArtworkFiltersValue;
  onChange: (value: ArtworkFiltersValue) => void;
  activeCategory: ArtworkCategory;
  onCategoryChange: (category: ArtworkCategory) => void;
  resultCount?: number;
  artistValue: ArtistFiltersValue;
  onArtistChange: (value: ArtistFiltersValue) => void;
  artistResultCount?: number;
}

export type ArtworkCategory = 'top-picks' | 'artworks' | 'profiles';

const categories: { id: ArtworkCategory; label: string }[] = [
  { id: 'top-picks', label: 'TOP PICKS' },
  { id: 'artworks', label: 'ARTWORKS' },
  { id: 'profiles', label: 'PROFILES' },
];

export default function ArtworkFilters({
  value,
  onChange,
  activeCategory,
  onCategoryChange,
  resultCount,
  artistValue,
  onArtistChange,
  artistResultCount,
}: ArtworkFiltersProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isFiltersOpen, setIsFiltersOpen] = useState(
    Boolean(value.minPrice || value.maxPrice),
  );
  const isProfiles = activeCategory === 'profiles';
  const updateValue = (field: keyof ArtworkFiltersValue, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };
  const updateArtistValue = (
    field: keyof ArtistFiltersValue,
    fieldValue: string | boolean,
  ) => {
    onArtistChange({ ...artistValue, [field]: fieldValue });
  };
  const resetFilters = () => onChange({ search: '', minPrice: '', maxPrice: '' });
  const resetArtistFilters = () =>
    onArtistChange({
      search: '',
      verifiedOnly: false,
      followingOnly: false,
    });
  const hasArtworkFilters = Boolean(value.search || value.minPrice || value.maxPrice);
  const hasArtistFilters = Boolean(
    artistValue.search || artistValue.verifiedOnly || artistValue.followingOnly,
  );
  const hasFilters = isProfiles ? hasArtistFilters : hasArtworkFilters;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 lg:pb-0" aria-label={t('artworks.categoryLabel')}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-wide transition ${
                activeCategory === category.id
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950'
              }`}
              aria-pressed={activeCategory === category.id}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:w-[470px]">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              value={isProfiles ? artistValue.search : value.search}
              onChange={(event) => {
                if (isProfiles) {
                  updateArtistValue('search', event.target.value);
                } else {
                  updateValue('search', event.target.value);
                }
              }}
              placeholder={t(
                isProfiles
                  ? 'artists.searchPlaceholder'
                  : 'artworks.discoverSearchPlaceholder',
              )}
              aria-label={t(
                isProfiles ? 'artists.searchLabel' : 'artworks.searchLabel',
              )}
              className="h-10 w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
            <Camera className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          </label>
          <button
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
            className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
              isFiltersOpen || hasFilters
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-expanded={isFiltersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {t('artworks.filters')}
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-end gap-3 px-5 py-3 sm:px-6 lg:px-8">
            {isProfiles ? (
              <>
                <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={artistValue.verifiedOnly}
                    onChange={(event) =>
                      updateArtistValue('verifiedOnly', event.target.checked)
                    }
                    className="h-4 w-4 accent-slate-950"
                  />
                  {t('artists.verifiedOnly')}
                </label>
                <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
                  <input
                    type="checkbox"
                    checked={artistValue.followingOnly}
                    disabled={!user}
                    onChange={(event) =>
                      updateArtistValue('followingOnly', event.target.checked)
                    }
                    className="h-4 w-4 accent-slate-950"
                  />
                  {t('artists.followingOnly')}
                </label>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">{t('artworks.minPrice')}</span>
                  <input
                    type="number"
                    min="0"
                    value={value.minPrice}
                    onChange={(event) => updateValue('minPrice', event.target.value)}
                    placeholder="0"
                    className="h-9 w-36 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-slate-600">{t('artworks.maxPrice')}</span>
                  <input
                    type="number"
                    min="0"
                    value={value.maxPrice}
                    onChange={(event) => updateValue('maxPrice', event.target.value)}
                    placeholder={t('artworks.noLimit')}
                    className="h-9 w-36 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </label>
              </>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={isProfiles ? resetArtistFilters : resetFilters}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t(isProfiles ? 'artists.clearFilters' : 'artworks.clearFilters')}
              </button>
            )}
            {(isProfiles ? artistResultCount : resultCount) !== undefined && (
              <span className="ml-auto pb-2 text-xs text-slate-500">
                {t(
                  isProfiles ? 'artists.resultCount' : 'artworks.resultCount',
                  { count: isProfiles ? artistResultCount ?? 0 : resultCount ?? 0 },
                )}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
