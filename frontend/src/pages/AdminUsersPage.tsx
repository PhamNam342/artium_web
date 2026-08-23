import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { AdminUser, PaginatedAdminUsers } from '../services/adminService';
import { getAdminUsers, updateUserStatus } from '../services/adminService';
import UserTable from '../features/admin/components/UserTable';
import UserFilters from '../features/admin/components/UserFilters';
import ConfirmActionModal from '../features/admin/components/ConfirmActionModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export default function AdminUsersPage() {
  const { t } = useI18n();
  const [data, setData] = useState<PaginatedAdminUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getAdminUsers({
        page,
        limit,
        search: debouncedSearch,
        isActive: status,
      });
      setData(result);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 403) {
          toast.error(t('common.unexpectedError'));
          setIsLoading(false);
          return;
        }
      }
      toast.error(t('admin.users.messages.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1); // Reset page on filter change
  };

  // Action Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleActionClick = (user: AdminUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    
    setIsActionLoading(true);
    const newStatus = !selectedUser.is_active;

    try {
      await updateUserStatus(selectedUser.id, newStatus);
      toast.success(t('admin.users.messages.updateSuccess'));
      
      // Update local state
      if (data) {
        setData({
          ...data,
          data: data.data.map(u => u.id === selectedUser.id ? { ...u, is_active: newStatus } : u)
        });
      }
      setIsModalOpen(false);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 403) {
          toast.error(t('common.unexpectedError'));
          setIsActionLoading(false);
          return;
        }
      }
      toast.error(t('admin.users.messages.updateError'));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.users.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('admin.users.subtitle')}
          </p>
        </div>
      </div>

      <UserFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <UserTable
        users={data?.data || []}
        isLoading={isLoading}
        onActionClick={handleActionClick}
      />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(page * limit, data.total)}</span> of{' '}
                <span className="font-medium">{data.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Simple page numbers */}
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                  Page {page} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <ConfirmActionModal
          isOpen={isModalOpen}
          title={selectedUser.is_active ? t('admin.users.confirmModal.titleDisable') : t('admin.users.confirmModal.titleEnable')}
          message={selectedUser.is_active ? t('admin.users.confirmModal.descDisable') : t('admin.users.confirmModal.descEnable')}
          confirmText={selectedUser.is_active ? t('admin.users.actions.disable') : t('admin.users.actions.enable')}
          cancelText={t('admin.users.confirmModal.cancel')}
          isDanger={selectedUser.is_active}
          isLoading={isActionLoading}
          onConfirm={handleConfirmAction}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
