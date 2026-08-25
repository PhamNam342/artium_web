import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { AdminArtwork, PaginatedAdminArtworks } from '../services/adminService';
import { getAdminArtworks, adminDeleteArtwork } from '../services/adminService';
import ConfirmActionModal from '../features/admin/components/ConfirmActionModal';
import { ChevronLeft, ChevronRight, Trash2, ImageOff, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  SOLD: 'bg-blue-100 text-blue-700',
  RESERVED: 'bg-yellow-100 text-yellow-700',
  INACTIVE: 'bg-orange-100 text-orange-700',
  DELETED: 'bg-red-100 text-red-700',
  PENDING_REVIEW: 'bg-purple-100 text-purple-700',
};

export default function AdminArtworksPage() {
  const { t } = useI18n();
  const [data, setData] = useState<PaginatedAdminArtworks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchArtworks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminArtworks({ page, limit, search: debouncedSearch });
      setData(result);
    } catch {
      toast.error(t('admin.artworks.messages.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, t]);

  useEffect(() => {
    fetchArtworks();
  }, [fetchArtworks]);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<AdminArtwork | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (artwork: AdminArtwork) => {
    setSelectedArtwork(artwork);
    setDeleteReason('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedArtwork) return;
    setIsDeleting(true);
    try {
      await adminDeleteArtwork(selectedArtwork.id, deleteReason || undefined);
      toast.success(t('admin.artworks.messages.deleteSuccess'));
      setIsDeleteModalOpen(false);
      // Remove from local state
      if (data) {
        const updated = data.data.filter((a) => a.id !== selectedArtwork.id);
        setData({ ...data, data: updated, total: data.total - 1 });
      }
    } catch {
      toast.error(t('admin.artworks.messages.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getThumbnail = (artwork: AdminArtwork) => {
    const primary = artwork.images?.find((img) => img.isPrimary);
    return primary?.url ?? artwork.images?.[0]?.url ?? null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('admin.artworks.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-700">{t('admin.artworks.subtitle')}</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <input
          id="admin-artwork-search"
          type="text"
          placeholder={t('admin.artworks.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:pl-6">
                {t('admin.artworks.table.artwork')}
              </th>
              <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">
                {t('admin.artworks.table.status')}
              </th>
              <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell">
                {t('admin.artworks.table.price')}
              </th>
              <th className="hidden px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell">
                {t('admin.artworks.table.createdAt')}
              </th>
              <th className="relative py-3 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">{t('admin.artworks.table.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                  {t('admin.artworks.table.empty')}
                </td>
              </tr>
            ) : (
              data?.data.map((artwork) => {
                const thumb = getThumbnail(artwork);
                return (
                  <tr key={artwork.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={artwork.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ImageOff className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 max-w-[180px]">
                            {artwork.title}
                          </p>
                          <p className="truncate text-xs text-gray-500 max-w-[180px]">
                            {artwork.sellerId}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="hidden whitespace-nowrap px-3 py-4 sm:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[artwork.status] ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {artwork.status}
                      </span>
                    </td>

                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-700 lg:table-cell">
                      {artwork.price
                        ? `${artwork.price} ${artwork.currency ?? ''}`
                        : <span className="text-gray-400">—</span>}
                    </td>

                    <td className="hidden whitespace-nowrap px-3 py-4 text-sm text-gray-500 lg:table-cell">
                      {new Date(artwork.createdAt).toLocaleDateString()}
                    </td>

                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right sm:pr-6">
                      <button
                        id={`admin-delete-artwork-${artwork.id}`}
                        onClick={() => handleDeleteClick(artwork)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                        title={t('admin.artworks.actions.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('admin.artworks.actions.delete')}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700">
              {t('admin.artworks.paginationLabel')
                .replace('{{start}}', String((page - 1) * limit + 1))
                .replace('{{end}}', String(Math.min(page * limit, data.total)))
                .replace('{{total}}', String(data.total))}
            </p>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">{t('admin.artworks.previous')}</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300">
                {t('admin.artworks.pageInfo')
                  .replace('{{page}}', String(page))
                  .replace('{{totalPages}}', String(data.totalPages))}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">{t('admin.artworks.next')}</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with reason input */}
      {selectedArtwork && isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('admin.artworks.confirmModal.title')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('admin.artworks.confirmModal.desc').replace(
                    '{{title}}',
                    selectedArtwork.title,
                  )}
                </p>
              </div>
            </div>

            {/* Reason input */}
            <div className="mb-5">
              <label
                htmlFor="delete-reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('admin.artworks.confirmModal.reasonLabel')}
                <span className="text-gray-400 font-normal ml-1">
                  ({t('admin.artworks.confirmModal.reasonOptional')})
                </span>
              </label>
              <textarea
                id="delete-reason"
                rows={3}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder={t('admin.artworks.confirmModal.reasonPlaceholder')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {t('admin.artworks.confirmModal.cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('admin.artworks.confirmModal.confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
