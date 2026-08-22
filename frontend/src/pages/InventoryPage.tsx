import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Grid2X2,
  ImageOff,
  List,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { artworkService, getArtworkImage } from '../features/artworks/artworkService';
import type { Artwork } from '../features/artworks/types';

type InventoryTab = 'artworks' | 'artists';
type ViewMode = 'list' | 'compact' | 'grid';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<InventoryTab>('artworks');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Date Created (Newest)');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [artworkLoadError, setArtworkLoadError] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeUploadMenu = (event: MouseEvent) => {
      if (!uploadMenuRef.current?.contains(event.target as Node)) {
        setIsUploadMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUploadMenuOpen(false);
    };

    document.addEventListener('mousedown', closeUploadMenu);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeUploadMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadArtworks = async () => {
      if (!token) {
        if (isCurrent) {
          setArtworks([]);
          setIsLoadingArtworks(false);
        }
        return;
      }

      setIsLoadingArtworks(true);
      setArtworkLoadError(false);

      try {
        const response = await artworkService.getMyArtworks({ limit: 100 });
        if (isCurrent) setArtworks(response.data);
      } catch {
        if (isCurrent) setArtworkLoadError(true);
      } finally {
        if (isCurrent) setIsLoadingArtworks(false);
      }
    };

    void loadArtworks();
    return () => { isCurrent = false; };
  }, [token]);

  const selectArtworkFiles = () => {
    setIsUploadMenuOpen(false);
    navigate('/inventory/upload');
  };

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? artworks.filter((artwork) => artwork.title.toLowerCase().includes(query))
      : artworks;

    return [...filtered].sort((first, second) => {
      if (sortLabel === 'Title (A–Z)') return first.title.localeCompare(second.title);
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return sortLabel === 'Date Created (Oldest)' ? firstDate - secondDate : secondDate - firstDate;
    });
  }, [artworks, search, sortLabel]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1920px]">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[26px]">Inventory</h1>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Uploads stay private until you&apos;re ready. List on the marketplace to get discovered.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-[#a8c4ff] px-4 text-xs font-semibold text-[#9bbaff] disabled:cursor-not-allowed disabled:opacity-90"
            >
              <LockKeyhole size={19} strokeWidth={1.8} />
              <Plus size={19} strokeWidth={1.8} />
              New folder
            </button>
            <div ref={uploadMenuRef} className="relative">
              <button
                type="button"
                aria-expanded={isUploadMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsUploadMenuOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-[#2f6df6] px-4 text-xs font-semibold text-[#1764ed] transition-colors hover:bg-blue-50"
              >
                <CirclePlus size={19} strokeWidth={1.9} />
                Upload Artwork
              </button>
              {isUploadMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[46px] z-30 w-[220px] overflow-hidden rounded-[18px] border border-slate-200 bg-white py-1 shadow-[0_5px_13px_rgba(15,23,42,0.2)]"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={selectArtworkFiles}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-950 transition-colors hover:bg-slate-50"
                  >
                    <Plus size={24} strokeWidth={1.7} />
                    Upload an artwork
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-400"
                  >
                    <LockKeyhole size={24} strokeWidth={1.45} />
                    Bulk upload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="flex items-center gap-5 sm:gap-7">
              <button
                type="button"
                onClick={() => setActiveTab('artworks')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'artworks' ? 'bg-slate-100 text-slate-950' : 'text-slate-800 hover:bg-slate-50'}`}
              >
                Artworks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('artists')}
                className={`rounded-full px-2 py-2 text-sm font-semibold transition-colors ${activeTab === 'artists' ? 'bg-slate-100 px-4 text-slate-950' : 'text-slate-800 hover:text-slate-950'}`}
              >
                Artists
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <label className="relative block sm:w-[280px]">
                <span className="sr-only">Search by artwork title</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-950" size={21} strokeWidth={2} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by artwork title"
                  className="h-[46px] w-full rounded-full border-2 border-slate-300 bg-white pl-[48px] pr-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
                />
              </label>

              <div className="inline-flex h-[46px] overflow-hidden rounded-[16px] bg-slate-100 p-1">
                {([
                  ['list', List, 'List view'],
                  ['compact', List, 'Compact view'],
                  ['grid', Grid2X2, 'Grid view'],
                ] as const).map(([mode, Icon, label]) => (
                  <button
                    type="button"
                    key={mode}
                    aria-label={label}
                    aria-pressed={viewMode === mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex w-[44px] items-center justify-center rounded-[12px] transition-colors ${viewMode === mode ? 'bg-white shadow-sm' : 'text-slate-900 hover:bg-white/60'}`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortOpen((open) => !open)}
                  className="inline-flex h-[46px] items-center gap-2 rounded-[12px] bg-slate-100 px-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
                >
                  <ArrowUpDown size={21} strokeWidth={1.8} />
                  <span>Sort by</span>
                  <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium">{sortLabel}</span>
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-[70px] z-10 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {['Date Created (Newest)', 'Date Created (Oldest)', 'Title (A–Z)'].map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => {
                          setSortLabel(option);
                          setIsSortOpen(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((open) => !open)}
                  className={`inline-flex h-[46px] items-center gap-2.5 rounded-[12px] px-3 text-sm font-semibold transition-colors ${isFilterOpen ? 'bg-slate-200' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <SlidersHorizontal size={22} strokeWidth={1.8} />
                  Filter
                </button>
                {isFilterOpen && (
                  <div className="absolute right-0 top-[70px] z-10 w-64 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-lg">
                    <p className="font-semibold text-slate-900">Filter artworks</p>
                    <label className="mt-3 flex items-center gap-2 text-slate-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                      Drafts only
                    </label>
                    <label className="mt-2 flex items-center gap-2 text-slate-600">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                      Listed on marketplace
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-h-[440px] px-4 py-5 sm:px-5 lg:px-6">
            {activeTab === 'artists' ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <div>
                  <p className="text-lg font-semibold text-slate-700">No artists yet</p>
                  <p className="mt-1 text-sm">Artists associated with your inventory will appear here.</p>
                </div>
              </div>
            ) : isLoadingArtworks ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <p className="text-sm font-medium">Loading your artworks…</p>
              </div>
            ) : artworkLoadError ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <div>
                  <p className="text-lg font-semibold text-slate-700">We couldn&apos;t load your inventory</p>
                  <p className="mt-1 text-sm">Please refresh and try again.</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <div>
                  <Search className="mx-auto mb-3" size={32} />
                  <p className="text-lg font-semibold text-slate-700">No artworks found</p>
                  <p className="mt-1 text-sm">Try a different title.</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-5'}>
                {items.map((item) => (
                  <InventoryCard key={item.id} item={item} viewMode={viewMode} />
                ))}
              </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-10 text-slate-900">
              <button type="button" aria-label="Previous page" disabled className="cursor-not-allowed text-slate-400">
                <ChevronLeft size={30} strokeWidth={1.5} />
              </button>
              <span className="text-[22px] font-semibold">1</span>
              <button type="button" aria-label="Next page" disabled className="cursor-not-allowed text-slate-400">
                <ChevronRight size={30} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InventoryCard({ item, viewMode }: { item: Artwork; viewMode: ViewMode }) {
  const image = getArtworkImage(item.images);
  const dimensions = item.dimensions
    ? `${[item.dimensions.height, item.dimensions.width, item.dimensions.depth].filter((value) => value !== undefined).join(' × ')} ${item.dimensions.unit ?? ''}`.trim()
    : '—';
  const material = item.materials || '—';
  const listingStatus = item.isPublished ? 'Listed' : 'Not listed';

  if (viewMode === 'grid') {
    return (
      <article className="rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">{image ? <img src={image.secureUrl || image.url} alt={image.altText || item.title} className="h-full w-full object-cover" /> : <ImageOff size={16} />}</div>
          <MoreHorizontal size={22} />
        </div>
        <h2 className="mt-3 text-lg font-medium text-slate-700">{item.title}</h2>
        <p className="mt-3 text-sm font-semibold tracking-wide text-slate-500">{item.status}</p>
      </article>
    );
  }

  return (
    <article className={`rounded-2xl border border-slate-200 px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)] ${viewMode === 'compact' ? 'min-h-[126px]' : 'min-h-[168px]'}`}>
      <div className="flex items-start gap-4">
        <input aria-label={`Select ${item.title}`} type="checkbox" className="mt-1 h-4.5 w-4.5 appearance-none rounded border-2 border-slate-400 checked:bg-blue-600" />
        <div className="flex h-[48px] w-[45px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-slate-400">{image ? <img src={image.secureUrl || image.url} alt={image.altText || item.title} className="h-full w-full object-cover" /> : <ImageOff size={12} />}</div>
        <h2 className="pt-1 text-[17px] font-medium text-slate-700">{item.title}</h2>
        <div className="ml-auto flex items-center gap-3 pt-1">
          <span className="text-xs font-bold tracking-wide text-slate-500">{item.status}</span>
          <button type="button" aria-label={`More options for ${item.title}`} className="text-slate-950"><MoreHorizontal size={19} strokeWidth={2.6} /></button>
        </div>
      </div>
      <div className="mt-5 grid gap-x-10 gap-y-2.5 text-[13px] sm:grid-cols-2">
        <InventoryField label="Material" value={material} />
        <InventoryField label="Location" value="—" />
        <InventoryField label="Dimensions" value={dimensions} />
        <InventoryField label="Listing status" value={listingStatus} />
      </div>
    </article>
  );
}

function InventoryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(100px,1fr)_1fr] gap-2">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
