import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getPendingVerifications, approveVerification, rejectVerification } from '../services/userService';
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface VerifyRequest {
  id: string;
  bio: string | null;
  website_url: string | null;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface PaginatedRequests {
  data: VerifyRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function AdminVerifyRequestsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<PaginatedRequests | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPendingVerifications(page, limit);
      setData(result);
    } catch {
      toast.error(t('admin.verifyRequests.messages.fetchError') || 'Failed to load verify requests');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, t]);

  useEffect(() => {
    // The request updates state asynchronously after it resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    try {
      await approveVerification(id);
      toast.success(t('admin.verifyRequests.messages.approveSuccess') || 'Artist approved successfully');
      fetchRequests();
    } catch {
      toast.error(t('admin.verifyRequests.messages.approveError') || 'Failed to approve artist');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(`reject-${id}`);
    try {
      await rejectVerification(id);
      toast.success(t('admin.verifyRequests.messages.rejectSuccess') || 'Artist verification rejected');
      fetchRequests();
    } catch {
      toast.error(t('admin.verifyRequests.messages.rejectError') || 'Failed to reject artist');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.verifyRequests.title') || 'Artist Verify Requests'}</h1>
          <p className="mt-2 text-sm text-gray-700">
            {t('admin.verifyRequests.subtitle') || 'Manage pending verification requests from artists.'}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">{t('admin.verifyRequests.table.artist') || 'Artist'}</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.verifyRequests.table.email') || 'Email'}</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{t('admin.verifyRequests.table.bioWebsite') || 'Bio / Website'}</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                        <Loader2 className="animate-spin h-6 w-6 mx-auto" />
                      </td>
                    </tr>
                  ) : !data || data.data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                        {t('admin.verifyRequests.table.empty') || 'No pending requests found.'}
                      </td>
                    </tr>
                  ) : (
                    data.data.map((req) => (
                      <tr key={req.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {req.user.avatar_url ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={req.user.avatar_url} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                  {req.user.full_name?.charAt(0) || req.user.email.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{req.user.full_name || 'Unnamed Artist'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {req.user.email}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                          <div>{req.website_url ? <a href={req.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{req.website_url}</a> : '-'}</div>
                          <div className="text-xs text-gray-400 truncate mt-1">{req.bio || '-'}</div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={!!actionLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              {actionLoading === `approve-${req.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                              {t('admin.verifyRequests.actions.approve') || 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={!!actionLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {actionLoading === `reject-${req.id}` ? <Loader2 className="w-4 h-4 animate-spin"/> : <X className="w-4 h-4"/>}
                              {t('admin.verifyRequests.actions.reject') || 'Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('admin.verifyRequests.paginationLabel', {
                  start: (page - 1) * limit + 1,
                  end: Math.min(page * limit, data.meta.total),
                  total: data.meta.total
                }) || `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, data.meta.total)} of ${data.meta.total} results`}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  <span className="sr-only">{t('admin.verifyRequests.previous') || 'Previous'}</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20">
                  {t('admin.verifyRequests.pageInfo', { page, totalPages: data.meta.totalPages }) || `Page ${page} of ${data.meta.totalPages}`}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                >
                  <span className="sr-only">{t('admin.verifyRequests.next') || 'Next'}</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
