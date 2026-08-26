export type NotificationType =
  | 'ARTWORK_LIKE'
  | 'ARTWORK_COMMENT'
  | 'FOLLOW'
  | 'MOMENT_LIKE'
  | 'MOMENT_COMMENT'
  | 'ARTWORK_DELETED_BY_ADMIN'
  | 'VERIFICATION_APPROVED'
  | 'VERIFICATION_REJECTED';

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
  metadata: Record<string, string>;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unreadCount: number;
}
