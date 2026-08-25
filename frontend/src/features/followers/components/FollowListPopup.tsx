import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

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

export default function FollowListPopup({
  userId,
  type,
  onClose,
}: FollowListPopupProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      try {
        setLoading(true);

        const data =
          type === 'followers'
            ? await getFollowers(userId)
            : await getFollowing(userId);

        if (active) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to load follow list:', error);

        if (active) {
          setUsers([]);
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
    };
  }, [userId, type]);

  const title =
    type === 'followers'
      ? 'Followers'
      : 'Following';

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
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-5 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              {type === 'followers'
                ? 'No followers yet'
                : 'Not following anyone yet'}
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
                      alt={user.full_name ?? 'User'}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600">
                      {user.full_name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.full_name ?? 'Unknown user'}
                    </p>

                    <p className="text-xs text-slate-500">
                      {user.role ?? 'USER'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}