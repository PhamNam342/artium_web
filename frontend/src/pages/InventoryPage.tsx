import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
  FolderOpen,
  Pencil,
  Plus,
  Repeat2,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../features/auth/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { artworkService, formatArtworkPrice, getArtworkImage } from '../features/artworks/artworkService';
import type { Artwork } from '../features/artworks/types';
import { artworkFolderService } from '../features/artwork-folders/artworkFolderService';
import type { ArtworkFolderTree } from '../features/artwork-folders/types';

type ViewMode = 'list' | 'compact' | 'grid';
type SortOption = 'newest' | 'oldest' | 'title';

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
  const { t } = useI18n();
  const sellerId = user?.id;
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<InventoryFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<InventoryFilters>(EMPTY_FILTERS);
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState(true);
  const [artworkLoadError, setArtworkLoadError] = useState(false);
  const [changingPublicationArtworkId, setChangingPublicationArtworkId] = useState<string | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [isDeletingArtwork, setIsDeletingArtwork] = useState(false);
  const [folders, setFolders] = useState<ArtworkFolderTree[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folderDialog, setFolderDialog] = useState<{ mode: 'create' | 'rename'; folder: ArtworkFolderTree | null } | null>(null);
  const [folderToMove, setFolderToMove] = useState<ArtworkFolderTree | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<ArtworkFolderTree | null>(null);
  const [artworkToMove, setArtworkToMove] = useState<Artwork | null>(null);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<string>>(new Set());
  const [isBulkMoveDialogOpen, setIsBulkMoveDialogOpen] = useState(false);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const refreshFolders = useCallback(async () => {
    if (!token || !sellerId) return;
    setFolders(await artworkFolderService.getTree(sellerId));
  }, [sellerId, token]);

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

  useEffect(() => {
    let isCurrent = true;

    const loadFolders = async () => {
      if (!token || !sellerId) return;
      setIsLoadingFolders(true);
      try {
        const folderTree = await artworkFolderService.getTree(sellerId);
        if (isCurrent) setFolders(folderTree);
      } catch (error) {
        console.error('Artwork folders failed to load', error);
        if (isCurrent) toast.error(t('inventory.loadErrorTitle'));
      } finally {
        if (isCurrent) setIsLoadingFolders(false);
      }
    };

    void loadFolders();
    return () => { isCurrent = false; };
  }, [sellerId, t, token]);

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
      toast.success(shouldPublish ? t('inventory.changeToPublish') : t('inventory.changeToDraft'));
    } catch (error) {
      console.error('Artwork publication update failed', error);
      toast.error(t('common.unexpectedError'));
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
      setSelectedArtworkIds((current) => {
        const next = new Set(current);
        next.delete(artworkToDelete.id);
        return next;
      });
      setArtworkToDelete(null);
      toast.success(t('inventory.deleteArtwork'));
    } catch (error) {
      console.error('Artwork deletion failed', error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsDeletingArtwork(false);
    }
  };

  const saveFolder = async (name: string) => {
    if (!user?.id || !folderDialog) return;

    setIsSavingFolder(true);
    try {
      if (folderDialog.mode === 'create') {
        await artworkFolderService.create(user.id, {
          name,
          parentId: folderDialog.folder?.id ?? null,
        });
        toast.success(t('inventory.createFolder'));
      } else if (folderDialog.folder) {
        await artworkFolderService.update(folderDialog.folder.id, { name });
        toast.success(t('inventory.renameFolder'));
      }
      setFolderDialog(null);
      await refreshFolders();
    } catch (error) {
      console.error('Artwork folder save failed', error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSavingFolder(false);
    }
  };

  const moveFolder = async (parentId: string | null) => {
    if (!folderToMove) return;
    setIsSavingFolder(true);
    try {
      await artworkFolderService.move(folderToMove.id, parentId);
      setFolderToMove(null);
      await refreshFolders();
      toast.success(t('inventory.moveFolder'));
    } catch (error) {
      console.error('Artwork folder move failed', error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSavingFolder(false);
    }
  };

  const deleteFolder = async () => {
    if (!folderToDelete) return;
    setIsSavingFolder(true);
    try {
      await artworkFolderService.remove(folderToDelete.id);
      if (activeFolderId === folderToDelete.id) setActiveFolderId(null);
      setFolderToDelete(null);
      await refreshFolders();
      toast.success(t('inventory.deleteFolder'));
    } catch (error) {
      console.error('Artwork folder delete failed', error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSavingFolder(false);
    }
  };

  const moveArtwork = async (folderId: string | null) => {
    if (!artworkToMove) return;
    setIsSavingFolder(true);
    try {
      const updatedArtwork = await artworkService.updateArtwork(artworkToMove.id, { folderId });
      setArtworks((current) => current.map((artwork) => (
        artwork.id === updatedArtwork.id ? updatedArtwork : artwork
      )));
      setArtworkToMove(null);
      await refreshFolders();
      toast.success(t('inventory.moveArtwork'));
    } catch (error) {
      console.error('Artwork folder move failed', error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSavingFolder(false);
    }
  };

  const bulkMoveArtworks = async (folderId: string | null) => {
    const artworkIds = [...selectedArtworkIds];
    if (artworkIds.length === 0) return;

    setIsSavingFolder(true);
    try {
      await artworkService.bulkMoveArtworks({ artworkIds, folderId });
      const movedIds = new Set(artworkIds);
      setArtworks((current) => current.map((artwork) => (
        movedIds.has(artwork.id) ? { ...artwork, folderId } : artwork
      )));
      setSelectedArtworkIds(new Set());
      setIsBulkMoveDialogOpen(false);
      await refreshFolders();
      toast.success(t('inventory.moveArtworksPlural', { count: artworkIds.length }));
    } catch (error) {
      console.error('Bulk artwork folder move failed', error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSavingFolder(false);
    }
  };

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();
    const folderFiltered = activeFolderId
      ? artworks.filter((artwork) => artwork.folderId === activeFolderId)
      : artworks;
    const searchFiltered = query
      ? folderFiltered.filter((artwork) => artwork.title.toLowerCase().includes(query))
      : folderFiltered;

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
      if (sortOption === 'title') return first.title.localeCompare(second.title);
      const firstDate = first.createdAt ? new Date(first.createdAt).getTime() : 0;
      const secondDate = second.createdAt ? new Date(second.createdAt).getTime() : 0;
      return sortOption === 'oldest' ? firstDate - secondDate : secondDate - firstDate;
    });
  }, [activeFolderId, appliedFilters, artworks, search, sortOption]);

  const customTags = useMemo(
    () => [...new Set(artworks.flatMap((artwork) => artwork.customTags))].sort((first, second) => first.localeCompare(second)),
    [artworks],
  );

  const selectedArtworkCount = selectedArtworkIds.size;
  const allVisibleArtworksSelected = items.length > 0 && items.every((artwork) => selectedArtworkIds.has(artwork.id));

  const toggleArtworkSelection = (artworkId: string) => {
    setSelectedArtworkIds((current) => {
      const next = new Set(current);
      if (next.has(artworkId)) next.delete(artworkId);
      else next.add(artworkId);
      return next;
    });
  };

  const toggleAllVisibleArtworkSelection = () => {
    setSelectedArtworkIds((current) => {
      const next = new Set(current);
      if (allVisibleArtworksSelected) items.forEach((artwork) => next.delete(artwork.id));
      else items.forEach((artwork) => next.add(artwork.id));
      return next;
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1920px]">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-[26px]">{t('inventory.title')}</h1>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              {t('inventory.description')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFolderDialog({ mode: 'create', folder: null })}
              className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-[#2f6df6] px-4 text-xs font-semibold text-[#1764ed] transition-colors hover:bg-blue-50"
            >
              <Folder size={19} strokeWidth={1.8} />
              <Plus size={19} strokeWidth={1.8} />
              {t('inventory.newFolder')}
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
                {t('inventory.uploadArtwork')}
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
                    {t('inventory.uploadAnArtwork')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-400"
                  >
                    <LockKeyhole size={24} strokeWidth={1.45} />
                    {t('inventory.bulkUpload')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <FolderPanel
          folders={folders}
          activeFolderId={activeFolderId}
          isLoading={isLoadingFolders}
          onSelect={setActiveFolderId}
          onCreate={(folder) => setFolderDialog({ mode: 'create', folder })}
          onRename={(folder) => setFolderDialog({ mode: 'rename', folder })}
          onMove={setFolderToMove}
          onDelete={setFolderToDelete}
        />

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_2px_5px_rgba(15,23,42,0.04)]">
          {selectedArtworkCount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-4 py-3 text-sm sm:px-5 lg:px-6">
              <span className="font-semibold text-blue-950">{t(selectedArtworkCount === 1 ? 'inventory.selected' : 'inventory.selectedPlural', { count: selectedArtworkCount })}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setSelectedArtworkIds(new Set())} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-semibold text-slate-600 hover:bg-blue-100">
                  <X size={16} /> {t('inventory.clear')}
                </button>
                <button type="button" onClick={() => setIsBulkMoveDialogOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700">
                  <Folder size={16} /> {t('inventory.moveToFolder')}
                </button>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div className="text-sm font-semibold text-slate-950">{t('inventory.artworks')}</div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <label className="relative block sm:w-[280px]">
                <span className="sr-only">{t('inventory.searchByTitle')}</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-950" size={21} strokeWidth={2} />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('inventory.searchByTitle')}
                  className="h-[46px] w-full rounded-full border-2 border-slate-300 bg-white pl-[48px] pr-4 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
                />
              </label>

              <div className="inline-flex h-[46px] overflow-hidden rounded-[16px] bg-slate-100 p-1">
                {([
                  ['list', AlignJustify, t('inventory.listView')],
                  ['compact', List, t('inventory.compactView')],
                  ['grid', Grid2X2, t('inventory.gridView')],
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
                  <span>{t('inventory.sortBy')}</span>
                  <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium">{t(`inventory.sort${sortOption.charAt(0).toUpperCase()}${sortOption.slice(1)}`)}</span>
                </button>
                {isSortOpen && (
                  <div className="absolute right-0 top-[70px] z-10 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {(['newest', 'oldest', 'title'] as const).map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => {
                          setSortOption(option);
                          setIsSortOpen(false);
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                      >
                        {t(`inventory.sort${option.charAt(0).toUpperCase()}${option.slice(1)}`)}
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
                  {t('inventory.filter')}
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-[440px] px-4 py-5 sm:px-5 lg:px-6">
            {isLoadingArtworks ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <p className="text-sm font-medium">{t('inventory.loadingArtworks')}</p>
              </div>
            ) : artworkLoadError ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <div>
                  <p className="text-lg font-semibold text-slate-700">{t('inventory.loadErrorTitle')}</p>
                  <p className="mt-1 text-sm">{t('inventory.refreshAndTryAgain')}</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[560px] items-center justify-center text-center text-slate-500">
                <div>
                  <Search className="mx-auto mb-3" size={32} />
                  <p className="text-lg font-semibold text-slate-700">{t('inventory.noArtworksTitle')}</p>
                  <p className="mt-1 text-sm">{t('inventory.tryDifferentTitle')}</p>
                </div>
              </div>
            ) : (
              viewMode === 'compact' ? (
                <InventoryTable
                  artworks={items}
                  artistName={user?.email.split('@')[0] || t('inventory.yourAccount')}
                  onEdit={(item) => navigate(`/inventory/upload/${item.id}`)}
                  onChangePublication={(item) => void changeArtworkPublication(item)}
                  changingPublicationArtworkId={changingPublicationArtworkId}
                  onMoveToFolder={setArtworkToMove}
                  onDelete={setArtworkToDelete}
                  selectedArtworkIds={selectedArtworkIds}
                  allArtworksSelected={allVisibleArtworksSelected}
                  onToggleArtwork={toggleArtworkSelection}
                  onToggleAllArtworks={toggleAllVisibleArtworkSelection}
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
                      onMoveToFolder={() => setArtworkToMove(item)}
                      onDelete={() => setArtworkToDelete(item)}
                      isSelected={selectedArtworkIds.has(item.id)}
                      onToggleSelection={() => toggleArtworkSelection(item.id)}
                    />
                  ))}
                </div>
              )
            )}

            <div className="mt-8 flex items-center justify-center gap-10 text-slate-900">
              <button type="button" aria-label={t('inventory.previousPage')} disabled className="cursor-not-allowed text-slate-400">
                <ChevronLeft size={30} strokeWidth={1.5} />
              </button>
              <span className="text-[22px] font-semibold">1</span>
              <button type="button" aria-label={t('inventory.nextPage')} disabled className="cursor-not-allowed text-slate-400">
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
      {folderDialog && (
        <FolderNameDialog
          mode={folderDialog.mode}
          folder={folderDialog.folder}
          isSaving={isSavingFolder}
          onCancel={() => setFolderDialog(null)}
          onSubmit={(name) => void saveFolder(name)}
        />
      )}
      {folderToMove && (
        <MoveFolderDialog
          folder={folderToMove}
          folders={folders}
          isSaving={isSavingFolder}
          onCancel={() => setFolderToMove(null)}
          onSubmit={(parentId) => void moveFolder(parentId)}
        />
      )}
      {folderToDelete && (
        <DeleteFolderDialog
          folder={folderToDelete}
          isDeleting={isSavingFolder}
          onCancel={() => setFolderToDelete(null)}
          onConfirm={() => void deleteFolder()}
        />
      )}
      {artworkToMove && (
        <MoveArtworkDialog
          artwork={artworkToMove}
          folders={folders}
          isSaving={isSavingFolder}
          onCancel={() => setArtworkToMove(null)}
          onSubmit={(folderId) => void moveArtwork(folderId)}
        />
      )}
      {isBulkMoveDialogOpen && (
        <BulkMoveArtworksDialog
          artworkCount={selectedArtworkCount}
          folders={folders}
          isSaving={isSavingFolder}
          onCancel={() => setIsBulkMoveDialogOpen(false)}
          onSubmit={(folderId) => void bulkMoveArtworks(folderId)}
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

function getArtworkStatusLabel(status: Artwork['status'], t: ReturnType<typeof useI18n>['t']) {
  const labels: Record<Artwork['status'], string> = {
    DRAFT: t('inventory.draft'),
    ACTIVE: t('inventory.active'),
    SOLD: t('inventory.sold'),
    RESERVED: t('inventory.reserved'),
    INACTIVE: t('inventory.inactive'),
    DELETED: t('inventory.deleted'),
    PENDING_REVIEW: t('inventory.pendingReview'),
  };

  return labels[status];
}

function InventoryTable({ artworks, artistName, onEdit, onChangePublication, changingPublicationArtworkId, onMoveToFolder, onDelete, selectedArtworkIds, allArtworksSelected, onToggleArtwork, onToggleAllArtworks }: {
  artworks: Artwork[];
  artistName: string;
  onEdit: (artwork: Artwork) => void;
  onChangePublication: (artwork: Artwork) => void;
  changingPublicationArtworkId: string | null;
  onMoveToFolder: (artwork: Artwork) => void;
  onDelete: (artwork: Artwork) => void;
  selectedArtworkIds: Set<string>;
  allArtworksSelected: boolean;
  onToggleArtwork: (artworkId: string) => void;
  onToggleAllArtworks: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[1520px]">
        <div className={`grid ${INVENTORY_TABLE_COLUMNS} items-center gap-4 rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-950`}>
          <div className="flex items-center gap-4"><input aria-label={t('inventory.artworks')} type="checkbox" checked={allArtworksSelected} onChange={onToggleAllArtworks} className="h-5 w-5 appearance-none rounded border-2 border-slate-400 checked:bg-blue-600" /><span className="inline-flex items-center gap-2">{t('inventory.artworkTitle')} <ArrowUpDown size={16} className="text-slate-400" /></span></div>
          <span>{t('inventory.artistName')}</span>
          <span>{t('inventory.listingStatus')}</span>
          <span>{t('inventory.price')}</span>
          <span>{t('inventory.quantity')}</span>
          <span>{t('inventory.dimensions')}</span>
          <span>{t('inventory.location')}</span>
          <span>{t('inventory.customTags')}</span>
          <span>{t('inventory.profileVisibility')}</span>
          <span>{t('inventory.marketplaceVisibility')}</span>
          <span className="sr-only">{t('inventory.actions')}</span>
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
              onMoveToFolder={() => onMoveToFolder(artwork)}
              onDelete={() => onDelete(artwork)}
              isSelected={selectedArtworkIds.has(artwork.id)}
              onToggleSelection={() => onToggleArtwork(artwork.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function InventoryTableRow({ artwork, artistName, onEdit, onChangePublication, isChangingPublication, onMoveToFolder, onDelete, isSelected, onToggleSelection }: {
  artwork: Artwork;
  artistName: string;
  onEdit: () => void;
  onChangePublication: () => void;
  isChangingPublication: boolean;
  onMoveToFolder: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
}) {
  const { language, t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const image = getArtworkImage(artwork.images);
  const dimensions = artwork.dimensions
    ? `${[artwork.dimensions.height, artwork.dimensions.width, artwork.dimensions.depth].filter((value) => value !== undefined).join(' × ')} ${artwork.dimensions.unit ?? ''}`.trim()
    : '—';
  const profileVisibility = artwork.isPublished ? t('inventory.public') : t('inventory.private');
  const marketplaceVisibility = artwork.isPublished ? t('inventory.listed') : t('inventory.notListed');

  return (
    <article className={`grid ${INVENTORY_TABLE_COLUMNS} items-center gap-4 rounded-xl bg-slate-50 px-5 py-4 text-sm text-slate-800`}>
      <div className="flex min-w-0 items-center gap-4">
        <input aria-label={t('inventory.selectArtwork', { title: artwork.title })} type="checkbox" checked={isSelected} onChange={onToggleSelection} className="h-5 w-5 shrink-0 appearance-none rounded border-2 border-slate-400 checked:bg-blue-600" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-slate-400">{image ? <img src={image.secureUrl || image.url} alt={image.altText || artwork.title} className="h-full w-full object-cover" /> : <ImageOff size={15} />}</div>
        <h2 className="line-clamp-2 font-semibold text-slate-950">{artwork.title}</h2>
      </div>
      <span>{artistName}</span>
      <span className="font-bold tracking-wide text-slate-500">{getArtworkStatusLabel(artwork.status, t)}</span>
      <span>{formatArtworkPrice(artwork.price, artwork.currency, language === 'vi' ? 'vi-VN' : 'en-US', t('artworks.priceOnRequest'))}</span>
      <span>—</span>
      <span>{dimensions}</span>
      <span className="truncate">{artwork.location || '—'}</span>
      <span className="truncate">{artwork.customTags.length > 0 ? artwork.customTags.join(', ') : '—'}</span>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{profileVisibility}</span>
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{marketplaceVisibility}</span>
      <div className="justify-self-end">
        {(artwork.status === 'DRAFT' || artwork.isPublished) && <DraftActionsMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen((open) => !open)} onClose={() => setIsMenuOpen(false)} onEdit={onEdit} onChangePublication={onChangePublication} isPublished={artwork.isPublished} isChangingPublication={isChangingPublication} onMoveToFolder={onMoveToFolder} onDelete={onDelete} />}
      </div>
    </article>
  );
}

function InventoryCard({ item, viewMode, onEdit, onChangePublication, isChangingPublication, onMoveToFolder, onDelete, isSelected, onToggleSelection }: {
  item: Artwork;
  viewMode: ViewMode;
  onEdit: () => void;
  onChangePublication: () => void;
  isChangingPublication: boolean;
  onMoveToFolder: () => void;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelection: () => void;
}) {
  const { t } = useI18n();
  const [isDraftMenuOpen, setIsDraftMenuOpen] = useState(false);
  const closeDraftMenu = () => setIsDraftMenuOpen(false);
  const image = getArtworkImage(item.images);
  const dimensions = item.dimensions
    ? `${[item.dimensions.height, item.dimensions.width, item.dimensions.depth].filter((value) => value !== undefined).join(' × ')} ${item.dimensions.unit ?? ''}`.trim()
    : '—';
  const material = item.materials || '—';
  const listingStatus = item.isPublished ? t('inventory.listed') : t('inventory.notListed');

  if (viewMode === 'grid') {
    return (
      <article className="rounded-2xl border border-slate-200 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-slate-400">{image ? <img src={image.secureUrl || image.url} alt={image.altText || item.title} className="h-full w-full object-cover" /> : <ImageOff size={16} />}</div>
          {(item.status === 'DRAFT' || item.isPublished) && <DraftActionsMenu isOpen={isDraftMenuOpen} onToggle={() => setIsDraftMenuOpen((open) => !open)} onClose={closeDraftMenu} onEdit={onEdit} onChangePublication={onChangePublication} isPublished={item.isPublished} isChangingPublication={isChangingPublication} onMoveToFolder={onMoveToFolder} onDelete={onDelete} />}
        </div>
        <h2 className="mt-3 text-lg font-medium text-slate-700">{item.title}</h2>
        <p className="mt-3 text-sm font-semibold tracking-wide text-slate-500">{getArtworkStatusLabel(item.status, t)}</p>
      </article>
    );
  }

  return (
    <article className={`rounded-2xl border border-slate-200 px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.08)] ${viewMode === 'compact' ? 'min-h-[126px]' : 'min-h-[168px]'}`}>
      <div className="flex items-start gap-4">
        <input aria-label={t('inventory.selectArtwork', { title: item.title })} type="checkbox" checked={isSelected} onChange={onToggleSelection} className="mt-1 h-4.5 w-4.5 appearance-none rounded border-2 border-slate-400 checked:bg-blue-600" />
        <div className="flex h-[48px] w-[45px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-slate-400">{image ? <img src={image.secureUrl || image.url} alt={image.altText || item.title} className="h-full w-full object-cover" /> : <ImageOff size={12} />}</div>
        <h2 className="pt-1 text-[17px] font-medium text-slate-700">{item.title}</h2>
        <div className="ml-auto flex items-center gap-3 pt-1">
          <span className="text-xs font-bold tracking-wide text-slate-500">{getArtworkStatusLabel(item.status, t)}</span>
          {(item.status === 'DRAFT' || item.isPublished) && <DraftActionsMenu isOpen={isDraftMenuOpen} onToggle={() => setIsDraftMenuOpen((open) => !open)} onClose={closeDraftMenu} onEdit={onEdit} onChangePublication={onChangePublication} isPublished={item.isPublished} isChangingPublication={isChangingPublication} onMoveToFolder={onMoveToFolder} onDelete={onDelete} />}
        </div>
      </div>
      <div className="mt-5 grid gap-x-10 gap-y-2.5 text-[13px] sm:grid-cols-2">
        <InventoryField label={t('inventory.material')} value={material} />
        <InventoryField label={t('inventory.location')} value={item.location || '—'} />
        <InventoryField label={t('inventory.dimensions')} value={dimensions} />
        <InventoryField label={t('inventory.listingStatus')} value={listingStatus} />
      </div>
    </article>
  );
}

function DraftActionsMenu({ isOpen, onToggle, onClose, onEdit, onChangePublication, isPublished, isChangingPublication, onMoveToFolder, onDelete }: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onChangePublication: () => void;
  isPublished: boolean;
  isChangingPublication: boolean;
  onMoveToFolder: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
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
      <button type="button" aria-label={t('inventory.artworkActions')} aria-expanded={isOpen} onClick={onToggle} className="text-slate-950"><MoreHorizontal size={19} strokeWidth={2.6} /></button>
      {isOpen && (
        <div role="menu" className="absolute right-0 top-8 z-20 w-[270px] rounded-[16px] border border-slate-200 bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.18)]">
          <DraftAction icon={Pencil} label={t('inventory.editArtwork')} onClick={() => { onEdit(); onClose(); }} />
          <DraftAction icon={Repeat2} label={isChangingPublication ? (isPublished ? t('inventory.movingToDraft') : t('inventory.publishing')) : (isPublished ? t('inventory.changeToDraft') : t('inventory.changeToPublish'))} onClick={() => { onChangePublication(); onClose(); }} disabled={isChangingPublication} />
          <DraftAction icon={Folder} label={t('inventory.moveToFolder')} onClick={() => { onMoveToFolder(); onClose(); }} />
          <DraftAction icon={Trash2} label={t('inventory.deleteArtwork')} destructive onClick={() => { onDelete(); onClose(); }} />
        </div>
      )}
    </div>
  );
}

function FolderPanel({ folders, activeFolderId, isLoading, onSelect, onCreate, onRename, onMove, onDelete }: {
  folders: ArtworkFolderTree[];
  activeFolderId: string | null;
  isLoading: boolean;
  onSelect: (folderId: string | null) => void;
  onCreate: (parent: ArtworkFolderTree | null) => void;
  onRename: (folder: ArtworkFolderTree) => void;
  onMove: (folder: ArtworkFolderTree) => void;
  onDelete: (folder: ArtworkFolderTree) => void;
}) {
  const { t } = useI18n();

  return (
    <section aria-label={t('inventory.artworks')} className="mb-5 rounded-[20px] border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
      <div className="flex flex-wrap items-start gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors ${activeFolderId === null ? 'bg-slate-950 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'}`}
        >
          <FolderOpen size={17} />
          {t('inventory.allArtworks')}
        </button>
        {isLoading ? (
          <span className="h-9 px-2 text-sm leading-9 text-slate-500">{t('inventory.loadingFolders')}</span>
        ) : folders.length === 0 ? (
          <span className="h-9 px-2 text-sm leading-9 text-slate-500">{t('inventory.noFolders')}</span>
        ) : (
          folders.map((folder) => (
            <FolderTreeNode
              key={folder.id}
              folder={folder}
              activeFolderId={activeFolderId}
              onSelect={onSelect}
              onCreate={onCreate}
              onRename={onRename}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}

function FolderTreeNode({ folder, activeFolderId, onSelect, onCreate, onRename, onMove, onDelete }: {
  folder: ArtworkFolderTree;
  activeFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  onCreate: (parent: ArtworkFolderTree | null) => void;
  onRename: (folder: ArtworkFolderTree) => void;
  onMove: (folder: ArtworkFolderTree) => void;
  onDelete: (folder: ArtworkFolderTree) => void;
}) {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasChildren = folder.children.length > 0;

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {hasChildren && (
          <button type="button" aria-label={t(isExpanded ? 'inventory.collapseFolder' : 'inventory.expandFolder', { name: folder.name })} aria-expanded={isExpanded} onClick={() => setIsExpanded((expanded) => !expanded)} className="flex h-8 w-5 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-200">
            <ChevronRight size={17} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}
        {!hasChildren && <span className="w-5 shrink-0" />}
        <div className={`inline-flex h-9 items-center rounded-full pr-1 transition-colors ${activeFolderId === folder.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'}`}>
          <button type="button" onClick={() => onSelect(folder.id)} className="inline-flex h-full items-center gap-2 rounded-l-full px-3 text-sm font-semibold">
            <Folder size={16} />
            <span className="max-w-52 truncate">{folder.name}</span>
            <span className="text-xs opacity-70">{folder.artworkCount}</span>
          </button>
          <div ref={menuRef} className="relative">
            <button type="button" aria-label={t('inventory.folderActions', { name: folder.name })} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((open) => !open)} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/10">
              <MoreHorizontal size={17} />
            </button>
            {isMenuOpen && (
              <div role="menu" className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl">
                <FolderMenuButton label={t('inventory.newSubfolder')} onClick={() => { onCreate(folder); setIsMenuOpen(false); }} />
                <FolderMenuButton label={t('inventory.rename')} onClick={() => { onRename(folder); setIsMenuOpen(false); }} />
                <FolderMenuButton label={t('inventory.moveFolder')} onClick={() => { onMove(folder); setIsMenuOpen(false); }} />
                <FolderMenuButton label={t('inventory.delete')} destructive onClick={() => { onDelete(folder); setIsMenuOpen(false); }} />
              </div>
            )}
          </div>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-2 border-l-2 border-slate-200 pl-3">
          <div className="space-y-2">
            {folder.children.map((child) => (
              <FolderTreeNode
                key={child.id}
                folder={child}
                activeFolderId={activeFolderId}
                onSelect={onSelect}
                onCreate={onCreate}
                onRename={onRename}
                onMove={onMove}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FolderMenuButton({ label, destructive = false, onClick }: { label: string; destructive?: boolean; onClick: () => void }) {
  return <button type="button" role="menuitem" onClick={onClick} className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 ${destructive ? 'text-red-600 hover:bg-red-50' : ''}`}>{label}</button>;
}

function FolderNameDialog({ mode, folder, isSaving, onCancel, onSubmit }: {
  mode: 'create' | 'rename';
  folder: ArtworkFolderTree | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(mode === 'rename' ? folder?.name ?? '' : '');
  const isCreatingChild = mode === 'create' && folder !== null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (value) onSubmit(value);
  };

  return (
    <Dialog title={mode === 'rename' ? t('inventory.renameFolder') : isCreatingChild ? t('inventory.newFolderIn', { name: folder.name }) : t('inventory.newFolder')} onCancel={onCancel}>
      <form onSubmit={submit}>
        <label className="block text-sm font-semibold text-slate-700" htmlFor="folder-name">{t('inventory.folderName')}</label>
        <input id="folder-name" autoFocus maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder={t('inventory.folderNameExample')} className="mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        <DialogActions onCancel={onCancel} isSaving={isSaving} submitLabel={mode === 'rename' ? t('inventory.save') : t('inventory.createFolder')} disabled={!name.trim()} />
      </form>
    </Dialog>
  );
}

function MoveFolderDialog({ folder, folders, isSaving, onCancel, onSubmit }: {
  folder: ArtworkFolderTree;
  folders: ArtworkFolderTree[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (parentId: string | null) => void;
}) {
  const { t } = useI18n();
  const [parentId, setParentId] = useState(folder.parentId ?? '');
  const blockedIds = new Set(flattenFolders([folder]).map(({ folder: item }) => item.id));
  const options = flattenFolders(folders).filter((item) => !blockedIds.has(item.folder.id));

  return (
    <Dialog title={t('inventory.moveFolder')} onCancel={onCancel}>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="folder-parent">{t('inventory.parentFolder')}</label>
      <select id="folder-parent" value={parentId} onChange={(event) => setParentId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500">
        <option value="">{t('inventory.noParentFolder')}</option>
        {options.map(({ folder: option, depth }) => <option key={option.id} value={option.id}>{`${'— '.repeat(depth)}${option.name}`}</option>)}
      </select>
      <DialogActions onCancel={onCancel} isSaving={isSaving} submitLabel={t('inventory.moveFolder')} onSubmit={() => onSubmit(parentId || null)} />
    </Dialog>
  );
}

function MoveArtworkDialog({ artwork, folders, isSaving, onCancel, onSubmit }: {
  artwork: Artwork;
  folders: ArtworkFolderTree[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (folderId: string | null) => void;
}) {
  const { t } = useI18n();
  const [folderId, setFolderId] = useState(artwork.folderId ?? '');
  const options = flattenFolders(folders);

  return (
    <Dialog title={t('inventory.moveArtwork')} onCancel={onCancel}>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="artwork-folder">{t('inventory.folder')}</label>
      <select id="artwork-folder" value={folderId} onChange={(event) => setFolderId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500">
        <option value="">{t('inventory.noFolder')}</option>
        {options.map(({ folder, depth }) => <option key={folder.id} value={folder.id}>{`${'— '.repeat(depth)}${folder.name}`}</option>)}
      </select>
      <DialogActions onCancel={onCancel} isSaving={isSaving} submitLabel={t('inventory.moveArtwork')} onSubmit={() => onSubmit(folderId || null)} />
    </Dialog>
  );
}

function BulkMoveArtworksDialog({ artworkCount, folders, isSaving, onCancel, onSubmit }: {
  artworkCount: number;
  folders: ArtworkFolderTree[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (folderId: string | null) => void;
}) {
  const { t } = useI18n();
  const [folderId, setFolderId] = useState('');
  const options = flattenFolders(folders);

  return (
    <Dialog title={t(artworkCount === 1 ? 'inventory.moveArtworks' : 'inventory.moveArtworksPlural', { count: artworkCount })} onCancel={onCancel}>
      <p className="mb-4 text-sm leading-6 text-slate-600">{t('inventory.chooseFolder')}</p>
      <label className="block text-sm font-semibold text-slate-700" htmlFor="bulk-artwork-folder">{t('inventory.folder')}</label>
      <select id="bulk-artwork-folder" autoFocus value={folderId} onChange={(event) => setFolderId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500">
        <option value="">{t('inventory.noFolder')}</option>
        {options.map(({ folder, depth }) => <option key={folder.id} value={folder.id}>{`${'— '.repeat(depth)}${folder.name}`}</option>)}
      </select>
      <DialogActions onCancel={onCancel} isSaving={isSaving} submitLabel={t('inventory.moveArtworksPlural', { count: artworkCount })} onSubmit={() => onSubmit(folderId || null)} />
    </Dialog>
  );
}

function DeleteFolderDialog({ folder, isDeleting, onCancel, onConfirm }: {
  folder: ArtworkFolderTree;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();

  return (
    <Dialog title={t('inventory.deleteFolder')} onCancel={onCancel}>
      <p className="text-sm leading-6 text-slate-600">{t('inventory.deleteFolderDescription', { name: folder.name })}</p>
      <DialogActions onCancel={onCancel} isSaving={isDeleting} submitLabel={t('inventory.deleteFolder')} destructive onSubmit={onConfirm} />
    </Dialog>
  );
}

function Dialog({ title, children, onCancel }: { title: string; children: React.ReactNode; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}

function DialogActions({ onCancel, isSaving, submitLabel, onSubmit, disabled = false, destructive = false }: {
  onCancel: () => void;
  isSaving: boolean;
  submitLabel: string;
  onSubmit?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" onClick={onCancel} disabled={isSaving} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:opacity-50">{t('inventory.cancel')}</button>
      <button type={onSubmit ? 'button' : 'submit'} onClick={onSubmit} disabled={isSaving || disabled} className={`rounded-full px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{isSaving ? t('inventory.saving') : submitLabel}</button>
    </div>
  );
}

function flattenFolders(folders: ArtworkFolderTree[], depth = 0): Array<{ folder: ArtworkFolderTree; depth: number }> {
  return folders.flatMap((folder) => [
    { folder, depth },
    ...flattenFolders(folder.children, depth + 1),
  ]);
}

function FilterDialog({ filters, customTags, anchorRef, onChange, onCancel, onApply }: {
  filters: InventoryFilters;
  customTags: string[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onChange: (field: keyof InventoryFilters, value: string) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  const { t } = useI18n();
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
        <h2 id="inventory-filter-title" className="text-base font-bold text-slate-500">{t('inventory.filters')}</h2>
        <div className="mt-4 space-y-3">
          <FilterSelect label={t('inventory.status')} value={filters.status} onChange={(value) => onChange('status', value)} options={[
            ['DRAFT', t('inventory.draft')], ['ACTIVE', t('inventory.active')], ['SOLD', t('inventory.sold')], ['RESERVED', t('inventory.reserved')], ['INACTIVE', t('inventory.inactive')],
          ]} />
          <FilterSelect label={t('inventory.listingType')} value={filters.listingType} onChange={(value) => onChange('listingType', value)} options={[
            ['listed', t('inventory.listedOnMarketplace')], ['not-listed', t('inventory.notListed')],
          ]} />
          <FilterTextInput label={t('inventory.location')} value={filters.location} onChange={(value) => onChange('location', value)} />
          <FilterSelect label={t('inventory.customTags')} value={filters.customTag} onChange={(value) => onChange('customTag', value)} options={customTags.map((tag) => [tag, tag])} />
          <FilterSelect label={t('inventory.visibilityType')} value={filters.visibilityType} onChange={(value) => onChange('visibilityType', value)} options={[
            ['public', t('inventory.public')], ['private', t('inventory.private')],
          ]} />
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-slate-500">{t('inventory.dateRange')}</p>
          <div className="mt-2.5">
            <FilterSelect label={t('inventory.dateCreated')} value="created" onChange={() => undefined} options={[["created", t('inventory.dateCreated')]]} />
          </div>
          <div className="mt-2.5 flex min-h-[48px] flex-col gap-1.5 rounded-[14px] border-2 border-slate-200 px-4 py-2 sm:flex-row sm:items-center">
            <CalendarDays className="shrink-0 text-slate-500" size={18} strokeWidth={2} />
            <input aria-label={t('inventory.startDate')} type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none" />
            <span className="hidden text-slate-400 sm:block">{t('inventory.to')}</span>
            <input aria-label={t('inventory.endDate')} type="date" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(event) => onChange('dateTo', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button type="button" onClick={onCancel} className="min-w-[115px] rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-slate-50">{t('inventory.cancel')}</button>
          <button type="button" onClick={onApply} className="min-w-[115px] rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">{t('inventory.apply')}</button>
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
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-5" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="delete-artwork-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="delete-artwork-title" className="text-xl font-bold text-slate-950">{t('inventory.deleteArtworkTitle')}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t('inventory.deleteArtworkDescription', { title: artworkTitle })}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">{t('inventory.cancel')}</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300">{isDeleting ? t('inventory.deleting') : t('inventory.deleteArtwork')}</button>
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
