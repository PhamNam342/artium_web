import api from './api';
import type {
  Notification,
  NotificationListResponse,
} from '../features/notifications/types/notification.types';

export const getNotifications =
  async (): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>(
      '/notifications',
    );

    return response.data;
  };

export const getNotification = async (
  id: string,
): Promise<Notification> => {
  const response = await api.get<Notification>(
    `/notifications/${id}`,
  );

  return response.data;
};

export const markNotificationAsRead = async (
  id: string,
): Promise<Notification> => {
  const response = await api.put<Notification>(
    `/notifications/${id}/read`,
  );

  return response.data;
};

export const markAllNotificationsAsRead = async (): Promise<{
  affected: number;
}> => {
  const response = await api.put<{ affected: number }>(
    '/notifications/read-all',
  );

  return response.data;
};
