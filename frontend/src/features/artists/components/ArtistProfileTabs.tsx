import { useI18n } from '../../../i18n/I18nContext';

export type ProfileTab = 'overview' | 'artworks';

interface ArtistProfileTabsProps {
  activeTab: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export default function ArtistProfileTabs({
  activeTab,
  onChange,
}: ArtistProfileTabsProps) {
  const { t } = useI18n();

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-300 bg-slate-100">
      <div className="mx-auto flex max-w-[1200px] justify-center px-6 py-2">
        <div className="flex items-center gap-1 rounded-xl bg-slate-200 p-1">

          {/* Overview */}
          <button
            type="button"
            onClick={() => onChange('overview')}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:bg-slate-300 hover:text-slate-950'
            }`}
          >
            {t('artistProfile.overview') || 'Overview'}
          </button>

          {/* Artworks */}
          <button
            type="button"
            onClick={() => onChange('artworks')}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              activeTab === 'artworks'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:bg-slate-300 hover:text-slate-950'
            }`}
          >
            {t('artistProfile.artworksTab') || 'Artworks'}
          </button>

        </div>
      </div>
    </nav>
  );
}
