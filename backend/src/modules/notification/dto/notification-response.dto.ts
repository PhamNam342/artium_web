import { Notification } from '../entities/notification.entity';

export class NotificationResponseDto {
  id: string;
  actorId: string | null;
  actor: { id: string; full_name: string; avatar_url: string | null } | null;
  type: Notification['type'];
  entityType: Notification['entityType'];
  entityId: string;
  title: string;
  message: string;
  metadata: Record<string, string>;
  isRead: boolean;
  createdAt: Date;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.actorId = notification.actorId;
    this.actor = notification.actor
      ? {
          id: notification.actor.id,
          full_name: notification.actor.full_name ?? '',
          avatar_url: notification.actor.avatar_url ?? null,
        }
      : null;
    this.type = notification.type;
    this.entityType = notification.entityType;
    this.entityId = notification.entityId;
    this.title = notification.title;
    this.message = notification.message;
    this.metadata = notification.metadata ?? {};
    this.isRead = notification.isRead;
    this.createdAt = notification.createdAt;
  }
}
