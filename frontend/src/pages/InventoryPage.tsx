import { useMemo, useState } from 'react';
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
import toast from 'react-hot-toast';

type InventoryTab = 'artworks' | 'artists';
type ViewMode = 'list' | 'compact' | 'grid';

interface InventoryItem {
  id: number;
  title: string;
  status: 'DRAFT';
  material: string;
  dimensions: string;
  location: string;
  listingStatus: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 1,
    title: 'Vy Hồ',
    status: 'DRAFT',
    material: '-',
    dimensions: '-',
    location: '-',
    listingStatus: '-',
  },
  {
    id: 2,
    title: 'Vy Hồ',
    status: 'DRAFT',
    material: '-',
    dimensions: '-',
    location: '-',
    listingStatus: '-',
  },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('artworks');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Date Created (Newest)');

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return INVENTORY_ITEMS;
    return INVENTORY_ITEMS.filter((item) => item.title.toLowerCase().includes(query));
  }, [search]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-8 text-slate-900 sm:px-8 sm:py-10 lg:px-12 lg:py-11">
      <div className="mx-auto max-w-[1920px]">
        <div className="mb-9 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[36px]">Inventory</h1>
            <p className="mt-2 text-base leading-6 text-slate-500 sm:text-[18px]">
              Uploads stay private until you&apos;re ready. List on the marketplace to get discovered.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled
              className="inline-flex h-[54px] items-center gap-3 rounded-full border-2 border-[#a8c4ff] px-6 text-base font-semibold text-[#9bbaff] disabled:cursor-not-allowed disabled:opacity-90"
            >
              <LockKeyhole size={19} strokeWidth={1.8} />
              <Plus size={21} strokeWidth={1.8} />
              New folder
            </button>
            <button
              type="button"
              className="inline-flex h-[54px] items-center gap-3 rounded-full border-2 border-[#2f6df6] px-6 text-base font-semibold text-[#1764ed] transition-colors hover:bg-blue-50"
              onClick={() => toast('Artwork upload is coming soon.')}
            >
              <CirclePlus size={21} strokeWidth={1.9} />
              Upload Artwork
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div className="flex items-center gap-8 sm:gap-11">
              <button
                type="button"
                onClick={() => setActiveTab('artworks')}
                className={`rounded-full px-6 py-3 text-[17px] font-semibold transition-colors ${activeTab === 'artworks' ? 'bg-slate-100 text-slate-950' : 'text-slate-800 hover:bg-slate-50'}`}
              >
                Artworks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('artists')}
                className={`rounded-full px-2 py-3 text-[17px] font-semibold transition-colors ${activeTab === 'artists' ? 'bg-slate-100 px-6 text-slate-950' : 'text-slate-800 hover:text-slate-950'}`}
              >
                Artists
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <label className="relative block sm:w-[382px]">
                <span className="sr-only">Search by artwork title</span>
                <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-950" size={25} strokeWidth={2} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by artwork title"
                  className="h-[64px] w-full rounded-full border-2 border-slate-300 bg-white pl-[66px] pr-5 text-[20px] text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
                />
              </label>

              <div className="inline-flex h-[64px] overflow-hidden rounded-[22px] bg-slate-100 p-1.5">
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
                    className={`flex w-[62px] items-center justify-center rounded-[17px] transition-colors ${viewMode === mode ? 'bg-white shadow-sm' : 'text-slate-900 hover:bg-white/60'}`}
                  >
                    <Icon size={29} strokeWidth={2} />
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSortOpen((open) => !open)}
                  className="inline-flex h-[64px] items-center gap-3 rounded-[16px] bg-slate-100 px-5 text-[17px] font-semibold text-slate-900 hover:bg-slate-200"
                >
                  <ArrowUpDown size={21} strokeWidth={1.8} />
                  <span>Sort by</span>
                  <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium">{sortLabel}</span>
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
                  className={`inline-flex h-[64px] items-center gap-4 rounded-[16px] px-5 text-[17px] font-semibold transition-colors ${isFilterOpen ? 'bg-slate-200' : 'bg-slate-100 hover:bg-slate-200'}`}
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

          <div className="min-h-[690px] px-5 py-8 sm:px-8 lg:px-10">
            {activeTab === 'artists' ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <div>
                  <p className="text-lg font-semibold text-slate-700">No artists yet</p>
                  <p className="mt-1 text-sm">Artists associated with your inventory will appear here.</p>
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
              <div className={viewMode === 'grid' ? 'grid gap-5 sm:grid-cols-2' : 'space-y-6'}>
                {items.map((item) => (
                  <InventoryCard key={item.id} item={item} viewMode={viewMode} />
                ))}
              </div>
            )}

            <div className="mt-10 flex items-center justify-center gap-12 text-slate-900">
              <button type="button" aria-label="Previous page" disabled className="cursor-not-allowed text-slate-400">
                <ChevronLeft size={38} strokeWidth={1.5} />
              </button>
              <span className="text-[28px] font-semibold">1</span>
              <button type="button" aria-label="Next page" disabled className="cursor-not-allowed text-slate-400">
                <ChevronRight size={38} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InventoryCard({ item, viewMode }: { item: InventoryItem; viewMode: ViewMode }) {
  if (viewMode === 'grid') {
    return (
      <article className="rounded-2xl border border-slate-200 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400"><ImageOff size={18} /></div>
          <MoreHorizontal size={22} />
        </div>
        <h2 className="mt-4 text-xl font-medium text-slate-500">{item.title}</h2>
        <p className="mt-3 text-sm font-semibold tracking-wide text-slate-500">{item.status}</p>
      </article>
    );
  }

  return (
    <article className={`rounded-2xl border border-slate-200 px-10 py-8 shadow-[0_1px_3px_rgba(15,23,42,0.08)] ${viewMode === 'compact' ? 'min-h-[190px]' : 'min-h-[260px]'}`}>
      <div className="flex items-start gap-6">
        <input aria-label={`Select ${item.title}`} type="checkbox" className="mt-1 h-6 w-6 appearance-none rounded-md border-2 border-slate-400 checked:bg-blue-600" />
        <div className="flex h-[72px] w-[66px] shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-400"><ImageOff size={14} /></div>
        <h2 className="pt-1 text-[24px] font-medium text-slate-500">{item.title}</h2>
        <div className="ml-auto flex items-center gap-5 pt-2">
          <span className="text-[16px] font-bold tracking-wide text-slate-500">{item.status}</span>
          <button type="button" aria-label={`More options for ${item.title}`} className="text-slate-950"><MoreHorizontal size={24} strokeWidth={2.6} /></button>
        </div>
      </div>
      <div className="mt-8 grid gap-x-16 gap-y-5 text-[18px] sm:grid-cols-2">
        <InventoryField label="Material" value={item.material} />
        <InventoryField label="Location" value={item.location} />
        <InventoryField label="Dimensions" value={item.dimensions} />
        <InventoryField label="Listing status" value={item.listingStatus} />
      </div>
    </article>
  );
}

function InventoryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(150px,1fr)_1fr] gap-3">
      <span className="font-semibold text-slate-400">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
