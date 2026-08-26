import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../NotificationContext';
import { useI18n } from '../../../i18n/I18nContext';
import type { Notification } from '../types/notification.types';

function formatRelativeTime(dateString: string, lang: 'vi' | 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'vi') {
    if (diffSecs < 60) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  } else {
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US');
  }
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAllAsRead, handleNotificationClick } =
    useNotifications();
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = async (notif: Notification) => {
    setIsOpen(false);
    await handleNotificationClick(notif);
  };

  const getLocalizedMessage = (notif: Notification) => {
    const actorName = notif.actor?.full_name || t('comments.item.unknownUser');
    switch (notif.type) {
      case 'ARTWORK_LIKE':
        return t('notifications.types.artworkLike', { actor: actorName });
      case 'ARTWORK_COMMENT':
        return t('notifications.types.artworkComment', { actor: actorName });
      case 'FOLLOW':
        return t('notifications.types.follow', { actor: actorName });
      case 'MOMENT_LIKE':
        return t('notifications.types.momentLike', { actor: actorName });
      case 'MOMENT_COMMENT':
        return t('notifications.types.momentComment', { actor: actorName });
      case 'ARTWORK_DELETED_BY_ADMIN':
        return notif.metadata?.reason
          ? t('notifications.types.artworkDeletedWithReason', {
              title: notif.metadata.artworkTitle || t('notifications.untitledArtwork'),
              reason: notif.metadata.reason,
            })
          : t('notifications.types.artworkDeleted', {
              title: notif.metadata?.artworkTitle || t('notifications.untitledArtwork'),
            });
      case 'VERIFICATION_APPROVED':
        return t('notifications.types.verificationApproved');
      case 'VERIFICATION_REJECTED':
        return t('notifications.types.verificationRejected');
      default:
        return notif.message;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-black focus:outline-none"
        aria-label={t('notifications.toggle')}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900">
              {t('notifications.title')}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              >
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">
                  {t('notifications.noNotifications')}
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const message = getLocalizedMessage(notif);
                return (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleItemClick(notif)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start cursor-pointer ${
                      !notif.isRead ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    {/* Actor Avatar */}
                    <div className="flex-shrink-0">
                      {notif.actor?.avatar_url ? (
                        <img
                          src={notif.actor.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                          {(notif.actor?.full_name || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-normal break-words">
                        {message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formatRelativeTime(notif.createdAt, language)}
                      </span>
                    </div>

                    {/* Unread indicator */}
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
