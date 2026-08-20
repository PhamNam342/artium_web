import { RotateCcw, Search } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';
import type { ArtworkFiltersValue } from '../types';

interface ArtworkFiltersProps {
  value: ArtworkFiltersValue;
  onChange: (value: ArtworkFiltersValue) => void;
  resultCount?: number;
}

export default function ArtworkFilters({ value, onChange, resultCount }: ArtworkFiltersProps) {
  const { t } = useI18n();
  const updateValue = (field: keyof ArtworkFiltersValue, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const resetFilters = () => onChange({ search: '', minPrice: '', maxPrice: '' });
  const hasFilters = Boolean(value.search || value.minPrice || value.maxPrice);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-sm font-medium text-slate-700">{t('artworks.searchLabel')}</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              value={value.search}
              onChange={(event) => updateValue('search', event.target.value)}
              placeholder={t('artworks.searchPlaceholder')}
              className="w-full rounded-xl border border-slate-300 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3 lg:w-[300px]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t('artworks.minPrice')}</span>
            <input
              type="number"
              min="0"
              value={value.minPrice}
              onChange={(event) => updateValue('minPrice', event.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">{t('artworks.maxPrice')}</span>
            <input
              type="number"
              min="0"
              value={value.maxPrice}
              onChange={(event) => updateValue('maxPrice', event.target.value)}
              placeholder={t('artworks.noLimit')}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-3 lg:pb-0.5">
          {resultCount !== undefined && <span className="text-sm text-slate-500">{t('artworks.resultCount', { count: resultCount })}</span>}
          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t('artworks.clearFilters')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
