import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notificationService';
import {
  connectNotificationSocket,
  disconnectNotificationSocket,
} from './socket/notification.socket';
import type { Notification } from './types/notification.types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationClick: (notif: Notification) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.items);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleNotificationClick = useCallback(
    async (notif: Notification) => {
      // 1. Mark as read
      if (!notif.isRead) {
        try {
          await markNotificationAsRead(notif.id);
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Failed to mark notification as read:', error);
        }
      }

      // 2. Navigate based on entityType
      if (notif.entityType === 'ARTWORK') {
        navigate(`/artworks/${notif.entityId}`);
      } else if (notif.entityType === 'USER') {
        navigate(`/artists/${notif.entityId}`);
      }
    },
    [navigate],
  );

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Socket Connection and Event Listeners
  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      setUnreadCount(0);
      disconnectNotificationSocket();
      return;
    }

    // Load initial notifications
    fetchNotifications();

    connectNotificationSocket((newNotif: Notification) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Render toast alert
      const actorName = newNotif.actor?.full_name || t('comments.item.unknownUser');
      let msg = newNotif.message;
      if (newNotif.type === 'ARTWORK_LIKE') {
        msg = t('notifications.types.artworkLike', { actor: actorName });
      } else if (newNotif.type === 'ARTWORK_COMMENT') {
        msg = t('notifications.types.artworkComment', { actor: actorName });
      } else if (newNotif.type === 'FOLLOW') {
        msg = t('notifications.types.follow', { actor: actorName });
      } else if (newNotif.type === 'MOMENT_LIKE') {
        msg = t('notifications.types.momentLike', { actor: actorName });
      } else if (newNotif.type === 'MOMENT_COMMENT') {
        msg = t('notifications.types.momentComment', { actor: actorName });
      }

      toast((tToast) => (
        <div
          onClick={() => {
            toast.dismiss(tToast.id);
            handleNotificationClick(newNotif);
          }}
          className="flex items-center gap-3 cursor-pointer py-1"
        >
          {newNotif.actor?.avatar_url ? (
            <img
              src={newNotif.actor.avatar_url}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0 text-sm">
              {actorName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-xs text-gray-900">
              {t('notifications.newNotification')}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{msg}</p>
          </div>
        </div>
      ), {
        duration: 5000,
      });
    });

    return () => {
      disconnectNotificationSocket();
    };
  }, [token, user, fetchNotifications, handleNotificationClick, t]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}
