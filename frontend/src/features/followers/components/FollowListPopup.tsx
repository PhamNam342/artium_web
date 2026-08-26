import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext';

import {
  getFollowers,
  getFollowing,
  type FollowUser,
} from '../../../services/followService';

interface FollowListPopupProps {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}

const PAGE_SIZE = 20;

export default function FollowListPopup({
  userId,
  type,
  onClose,
}: FollowListPopupProps) {
  const { t } = useI18n();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const listRequestId = useRef(0);

  useEffect(() => {
    let active = true;
    const requestId = listRequestId.current + 1;

    listRequestId.current = requestId;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          type === 'followers'
            ? await getFollowers(userId, { take: PAGE_SIZE })
            : await getFollowing(userId, { take: PAGE_SIZE });

        if (active) {
          setUsers(response.data);
          setHasMore(response.meta.hasMore);
        }
      } catch (error) {
        console.error('Failed to load follow list:', error);

        if (active) {
          setUsers([]);
          setHasMore(false);
          setError(t('followList.loadError'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      active = false;

      if (listRequestId.current === requestId) {
        listRequestId.current += 1;
      }
    };
  }, [userId, type, retryCount, t]);

  const loadMoreUsers = async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);
    setError(null);

    const requestId = listRequestId.current;

    try {
      const response =
        type === 'followers'
          ? await getFollowers(userId, {
              skip: users.length,
              take: PAGE_SIZE,
            })
          : await getFollowing(userId, {
              skip: users.length,
              take: PAGE_SIZE,
            });

      if (listRequestId.current !== requestId) {
        return;
      }

      setUsers((currentUsers) => [
        ...currentUsers,
        ...response.data,
      ]);
      setHasMore(response.meta.hasMore);
    } catch (error) {
      console.error('Failed to load more users:', error);

      if (listRequestId.current === requestId) {
        setError(t('followList.loadMoreError'));
      }
    } finally {
      if (listRequestId.current === requestId) {
        setLoadingMore(false);
      }
    }
  };

  const title = t(`followList.${type}`);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('followList.close')}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-5 text-center text-sm text-slate-500">
              {t('followList.loading')}
            </div>
          ) : error && users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-3 font-medium text-blue-600 hover:underline"
              >
                {t('followList.tryAgain')}
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {t(`followList.empty.${type}`)}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name ?? t('followList.user')}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                      {user.full_name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.full_name ?? t('followList.unknownUser')}
                    </p>

                    <p className="text-xs text-slate-500">
                      {user.role ?? 'USER'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {users.length > 0 && (hasMore || error) && (
            <div className="border-t border-slate-100 p-4 text-center">
              {error && (
                <p className="mb-2 text-sm text-red-600">{error}</p>
              )}

              <button
                type="button"
                onClick={() => void loadMoreUsers()}
                disabled={loadingMore}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore
                  ? t('followList.loading')
                  : error
                    ? t('followList.tryAgain')
                    : t('followList.loadMore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
