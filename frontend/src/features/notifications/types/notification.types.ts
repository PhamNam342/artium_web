export type NotificationType =
  | 'ARTWORK_LIKE'
  | 'ARTWORK_COMMENT'
  | 'FOLLOW'
  | 'MOMENT_LIKE'
  | 'MOMENT_COMMENT';

export type NotificationEntityType =
  | 'ARTWORK'
  | 'COMMENT'
  | 'USER'
  | 'MOMENT';

export interface NotificationActor {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Notification {
  id: string;
  actorId: string | null;
  actor: NotificationActor | null;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
}
