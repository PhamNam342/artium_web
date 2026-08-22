import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  AlignJustify,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Grid2X2,
  ImageOff,
  List,
  LockKeyhole,
  MoreHorizontal,
  Folder,
  Pencil,
  Plus,
  Repeat2,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { artworkService, getArtworkImage } from '../features/artworks/artworkService';
import type { Artwork } from '../features/artworks/types';

type InventoryTab = 'artworks' | 'artists';
type ViewMode = 'list' | 'compact' | 'grid';

type InventoryFilters = {
  status: string;
  listingType: string;
  location: string;
  customTag: string;
  visibilityType: string;
  dateFrom: string;
  dateTo: string;
};

const EMPTY_FILTERS: InventoryFilters = {
  status: '',
  listingType: '',
  location: '',
  customTag: '',
  visibilityType: '',
  dateFrom: '',
  dateTo: '',
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<InventoryTab>('artworks');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<InventoryFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<InventoryFilters>(EMPTY_FILTERS);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [sortLabel, setSortLabel] = useState('Date Created (Newest)');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [artworkLoadError, setArtworkLoadError] = useState(false);
  const [changingPublicationArtworkId, setChangingPublicationArtworkId] = useState<string | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

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

  const changeArtworkPublication = async (artwork: Artwork) => {
    const shouldPublish = !artwork.isPublished;
    setChangingPublicationArtworkId(artwork.id);
    try {
      const updatedArtwork = await artworkService.updateArtwork(artwork.id, {
        status: shouldPublish ? 'ACTIVE' : 'DRAFT',
        isPublished: shouldPublish,
      });
      setArtworks((current) => current.map((artwork) => (
        artwork.id === updatedArtwork.id ? updatedArtwork : artwork
      )));
      toast.success(shouldPublish ? 'Artwork is now published.' : 'Artwork moved to drafts.');
    } catch (error) {
      console.error('Artwork publication update failed', error);
      toast.error(shouldPublish ? 'Unable to publish this artwork. Please try again.' : 'Unable to move this artwork to drafts. Please try again.');
    } finally {
      setChangingPublicationArtworkId(null);
    }
  };

  const deleteArtwork = async () => {
    if (!artworkToDelete) return;

    setIsDeletingArtwork(true);
    try {
      await artworkService.deleteArtwork(artworkToDelete.id);
      setArtworks((current) => current.filter((artwork) => artwork.id !== artworkToDelete.id));
      setArtworkToDelete(null);
      toast.success('Artwork deleted.');
    } catch (error) {
      console.error('Artwork deletion failed', error);
      toast.error('Unable to delete this artwork. Please try again.');
    } finally {
      setIsDeletingArtwork(false);
    }
  };

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    const searchFiltered = query
      ? artworks.filter((artwork) => artwork.title.toLowerCase().includes(query))
      : artworks;

    const filtered = searchFiltered.filter((artwork) => {
      if (appliedFilters.status && artwork.status !== appliedFilters.status) return false;
      if (appliedFilters.listingType === 'listed' && !artwork.isPublished) return false;
      if (appliedFilters.listingType === 'not-listed' && artwork.isPublished) return false;
      if (appliedFilters.visibilityType === 'public' && !artwork.isPublished) return false;
      if (appliedFilters.visibilityType === 'private' && artwork.isPublished) return false;
      if (appliedFilters.location && !(artwork.location || '').toLocaleLowerCase().includes(appliedFilters.location.toLocaleLowerCase())) return false;
      if (appliedFilters.customTag && !artwork.customTags.some((tag) => tag.toLocaleLowerCase() === appliedFilters.customTag.toLocaleLowerCase())) return false;

      const createdAt = artwork.createdAt ? new Date(artwork.createdAt).getTime() : null;
      if (appliedFilters.dateFrom && (!createdAt || createdAt < new Date(`${appliedFilters.dateFrom}T00:00:00`).getTime())) return false;
      if (appliedFilters.dateTo && (!createdAt || createdAt > new Date(`${appliedFilters.dateTo}T23:59:59`).getTime())) return false;
      return true;
    });

    return [...filtered].sort((first, second) => {
      if (sortLabel === 'Title (A–Z)') return first.title.localeCompare(second.title);
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return sortLabel === 'Date Created (Oldest)' ? firstDate - secondDate : secondDate - firstDate;
    });
  }, [appliedFilters, artworks, search, sortLabel]);

  const customTags = useMemo(
    () => [...new Set(artworks.flatMap((artwork) => artwork.customTags))].sort((first, second) => first.localeCompare(second)),
    [artworks],
  );

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
                  ['list', AlignJustify, 'List view'],
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

              <div>
                <button
                  ref={filterButtonRef}
                  type="button"
                  onClick={() => {
                    setFilterDraft(appliedFilters);
                    setIsFilterOpen(true);
                  }}
                  className={`inline-flex h-[46px] items-center gap-2.5 rounded-[12px] px-3 text-sm font-semibold transition-colors ${isFilterOpen ? 'bg-slate-200' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  <SlidersHorizontal size={22} strokeWidth={1.8} />
                  Filter
                </button>
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
              viewMode === 'compact' ? (
                <InventoryTable
                  artworks={items}
                  artistName={user?.email.split('@')[0] || 'Your account'}
                  onEdit={(item) => navigate(`/inventory/upload/${item.id}`)}
                  onChangePublication={(item) => void changeArtworkPublication(item)}
                  changingPublicationArtworkId={changingPublicationArtworkId}
                  onDelete={setArtworkToDelete}
                />
              ) : (
                <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-5'}>
                  {items.map((item) => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onEdit={() => navigate(`/inventory/upload/${item.id}`)}
                      onChangePublication={() => void changeArtworkPublication(item)}
                      isChangingPublication={changingPublicationArtworkId === item.id}
                      onDelete={() => setArtworkToDelete(item)}
                    />
                  ))}
                </div>
              )
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
      {artworkToDelete && (
        <DeleteArtworkDialog
          artworkTitle={artworkToDelete.title}
          isDeleting={isDeletingArtwork}
          onCancel={() => setArtworkToDelete(null)}
          onConfirm={() => void deleteArtwork()}
        />
      )}
      {isFilterOpen && (
        <FilterDialog
          filters={filterDraft}
          customTags={customTags}
          anchorRef={filterButtonRef}
          onChange={(field, value) => setFilterDraft((current) => ({ ...current, [field]: value }))}
          onCancel={() => setIsFilterOpen(false)}
          onApply={() => {
            setAppliedFilters(filterDraft);
            setIsFilterOpen(false);
          }}
        />
      )}
    </div>
  );
}

const INVENTORY_TABLE_COLUMNS = 'grid-cols-[minmax(220px,1.35fr)_minmax(120px,.8fr)_minmax(130px,.8fr)_minmax(85px,.55fr)_minmax(65px,.4fr)_minmax(150px,.9fr)_minmax(130px,.8fr)_minmax(150px,.9fr)_minmax(160px,1fr)_minmax(180px,1.1fr)_44px]';

function InventoryTable({ artworks, artistName, onEdit, onChangePublication, changingPublicationArtworkId, onDelete }: {
  artworks: Artwork[];
  artistName: string;
  onEdit: (artwork: Artwork) => void;
  onChangePublication: (artwork: Artwork) => void;
  changingPublicationArtworkId: string | null;
  onDelete: (artwork: Artwork) => void;
}) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[1520px]">
        <div className={`grid ${INVENTORY_TABLE_COLUMNS} items-center gap-4 rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-950`}>
          <div className="flex items-center gap-4"><input aria-label="Select all artworks" type="checkbox" className="h-5 w-5 appearance-none rounded border-2 border-slate-400 checked:bg-blue-600" /><span className="inline-flex items-center gap-2">Title <ArrowUpDown size={16} className="text-slate-400" /></span></div>
          <span>Artist name</span>
          <span>Listing status</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Dimensions</span>
          <span>Location</span>
          <span>Custom tags</span>
          <span>Profile Visibility</span>
          <span>Marketplace Visibility</span>
          <span className="sr-only">Actions</span>
        </div>

        <div className="mt-4 space-y-3">
          {artworks.map((artwork) => (
            <InventoryTableRow
              key={artwork.id}
              artwork={artwork}
              artistName={artistName}
              onEdit={() => onEdit(artwork)}
              onChangePublication={() => onChangePublication(artwork)}
              isChangingPublication={changingPublicationArtworkId === artwork.id}
              onDelete={() => onDelete(artwork)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryTableRow({ artwork, artistName, onEdit, onChangePublication, isChangingPublication, onDelete }: {
  artwork: Artwork;
  artistName: string;
  onEdit: () => void;
  onChangePublication: () => void;
  isChangingPublication: boolean;
  onDelete: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const image = getArtworkImage(artwork.images);
  const dimensions = artwork.dimensions
    ? `${[artwork.dimensions.height, artwork.dimensions.width, artwork.dimensions.depth].filter((value) => value !== undefined).join(' × ')} ${artwork.dimensions.unit ?? ''}`.trim()
    : '—';
  const profileVisibility = artwork.isPublished ? 'Shown on profile' : 'Hidden on profile';
  const marketplaceVisibility = artwork.isPublished ? 'Listed' : 'Unlisted';

  return (
    <article className={`grid ${INVENTORY_TABLE_COLUMNS} items-center gap-4 rounded-xl bg-slate-50 px-5 py-4 text-sm text-slate-800`}>
      <div className="flex min-w-0 items-center gap-4">
        <input aria-label={`Select ${artwork.title}`} type="checkbox" className="h-5 w-5 shrink-0 appearance-none rounded border-2 border-slate-400 checked:bg-blue-600" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-slate-400">{image ? <img src={image.secureUrl || image.url} alt={image.altText || artwork.title} className="h-full w-full object-cover" /> : <ImageOff size={15} />}</div>
        <h2 className="line-clamp-2 font-semibold text-slate-950">{artwork.title}</h2>
      </div>
      <span>{artistName}</span>
      <span className="font-bold tracking-wide text-slate-500">{artwork.status}</span>
      <span>{artwork.price || '—'}</span>
      <span>—</span>
      <span>{dimensions}</span>
      <span className="truncate">{artwork.location || '—'}</span>
      <span className="truncate">{artwork.customTags.length > 0 ? artwork.customTags.join(', ') : '—'}</span>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{profileVisibility}</span>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{marketplaceVisibility}</span>
      <div className="justify-self-end">
        {(artwork.status === 'DRAFT' || artwork.isPublished) && <DraftActionsMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen((open) => !open)} onClose={() => setIsMenuOpen(false)} onEdit={onEdit} onChangePublication={onChangePublication} isPublished={artwork.isPublished} isChangingPublication={isChangingPublication} onDelete={onDelete} />}
      </div>
    </article>
  );
}

function InventoryCard({ item, viewMode, onEdit, onChangePublication, isChangingPublication, onDelete }: {
  item: Artwork;
  viewMode: ViewMode;
  onEdit: () => void;
  onChangePublication: () => void;
  isChangingPublication: boolean;
  onDelete: () => void;
}) {
  const [isDraftMenuOpen, setIsDraftMenuOpen] = useState(false);
  const closeDraftMenu = () => setIsDraftMenuOpen(false);
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
          {(item.status === 'DRAFT' || item.isPublished) && <DraftActionsMenu isOpen={isDraftMenuOpen} onToggle={() => setIsDraftMenuOpen((open) => !open)} onClose={closeDraftMenu} onEdit={onEdit} onChangePublication={onChangePublication} isPublished={item.isPublished} isChangingPublication={isChangingPublication} onDelete={onDelete} />}
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
          {(item.status === 'DRAFT' || item.isPublished) && <DraftActionsMenu isOpen={isDraftMenuOpen} onToggle={() => setIsDraftMenuOpen((open) => !open)} onClose={closeDraftMenu} onEdit={onEdit} onChangePublication={onChangePublication} isPublished={item.isPublished} isChangingPublication={isChangingPublication} onDelete={onDelete} />}
        </div>
      </div>
      <div className="mt-5 grid gap-x-10 gap-y-2.5 text-[13px] sm:grid-cols-2">
        <InventoryField label="Material" value={material} />
        <InventoryField label="Location" value={item.location || '—'} />
        <InventoryField label="Dimensions" value={dimensions} />
        <InventoryField label="Listing status" value={listingStatus} />
      </div>
    </article>
  );
}

function DraftActionsMenu({ isOpen, onToggle, onClose, onEdit, onChangePublication, isPublished, isChangingPublication, onDelete }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onChangePublication: () => void;
  isPublished: boolean;
  isChangingPublication: boolean;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} className="relative">
      <button type="button" aria-label="Draft artwork actions" aria-expanded={isOpen} onClick={onToggle} className="text-slate-950"><MoreHorizontal size={19} strokeWidth={2.6} /></button>
      {isOpen && (
        <div role="menu" className="absolute right-0 top-8 z-20 w-[270px] rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
          <DraftAction icon={Pencil} label="Edit Artwork" onClick={() => { onEdit(); onClose(); }} />
          <DraftAction icon={Repeat2} label={isChangingPublication ? (isPublished ? 'Moving to draft…' : 'Publishing…') : (isPublished ? 'Change to Draft' : 'Change to Publish')} onClick={() => { onChangePublication(); onClose(); }} disabled={isChangingPublication} />
          <DraftAction icon={Folder} label="Move to folder" />
          <DraftAction icon={Trash2} label="Delete Artwork" destructive onClick={() => { onDelete(); onClose(); }} />
        </div>
      )}
    </div>
  );
}

function FilterDialog({ filters, customTags, anchorRef, onChange, onCancel, onApply }: {
  filters: InventoryFilters;
  customTags: string[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onChange: (field: keyof InventoryFilters, value: string) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const [position, setPosition] = useState({ top: 90, right: 24 });

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onCancel]);

  useEffect(() => {
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({
        top: rect.bottom + 12,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/15"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-filter-title"
        style={{
          top: position.top,
          right: position.right,
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: `calc(100vh - ${position.top + 16}px)`,
        }}
        className="absolute overflow-y-auto rounded-[24px] bg-white p-5 shadow-[0_12px_26px_rgba(15,23,42,0.24)] sm:p-7"
      >
        <h2 id="inventory-filter-title" className="text-base font-bold text-slate-500">Filters</h2>
        <div className="mt-4 space-y-3">
          <FilterSelect label="Status" value={filters.status} onChange={(value) => onChange('status', value)} options={[
            ['DRAFT', 'Draft'], ['ACTIVE', 'Active'], ['SOLD', 'Sold'], ['RESERVED', 'Reserved'], ['INACTIVE', 'Inactive'],
          ]} />
          <FilterSelect label="Listing Type" value={filters.listingType} onChange={(value) => onChange('listingType', value)} options={[
            ['listed', 'Listed on marketplace'], ['not-listed', 'Not listed'],
          ]} />
          <FilterTextInput label="Location" value={filters.location} onChange={(value) => onChange('location', value)} />
          <FilterSelect label="Custom tags" value={filters.customTag} onChange={(value) => onChange('customTag', value)} options={customTags.map((tag) => [tag, tag])} />
          <FilterSelect label="Visibility Type" value={filters.visibilityType} onChange={(value) => onChange('visibilityType', value)} options={[
            ['public', 'Public'], ['private', 'Private'],
          ]} />
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-slate-500">Date range</p>
          <div className="mt-2.5">
            <FilterSelect label="Date created" value="created" onChange={() => undefined} options={[["created", "Date created"]]} />
          </div>
          <div className="mt-2.5 flex min-h-[48px] flex-col gap-1.5 rounded-[14px] border-2 border-slate-200 px-4 py-2 sm:flex-row sm:items-center">
            <CalendarDays className="shrink-0 text-slate-500" size={18} strokeWidth={2} />
            <input aria-label="Start date" type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none" />
            <span className="hidden text-slate-400 sm:block">to</span>
            <input aria-label="End date" type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => onChange('dateTo', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button type="button" onClick={onCancel} className="min-w-[115px] rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={onApply} className="min-w-[115px] rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">Apply</button>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <div className="relative">
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-[48px] w-full appearance-none rounded-[14px] border-2 border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-blue-500">
        <option value="">{label}</option>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} strokeWidth={2.5} />
    </div>
  );
}

function FilterTextInput({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input aria-label={label} value={value} maxLength={120} onChange={(event) => onChange(event.target.value)} placeholder={label} className="h-[48px] w-full rounded-[14px] border-2 border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500" />
  );
}

function DeleteArtworkDialog({ artworkTitle, isDeleting, onCancel, onConfirm }: {
  artworkTitle: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-5" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="delete-artwork-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="delete-artwork-title" className="text-xl font-bold text-slate-950">Delete artwork?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">&ldquo;{artworkTitle}&rdquo; will be permanently deleted. This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300">{isDeleting ? 'Deleting…' : 'Delete artwork'}</button>
        </div>
      </section>
    </div>
  );
}

function DraftAction({ icon: Icon, label, destructive = false, onClick, disabled = false }: {
  icon: typeof Pencil;
  label: string;
  destructive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${destructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-950 hover:bg-slate-50'}`}>
      <Icon size={25} strokeWidth={2} />
      {label}
    </button>
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
