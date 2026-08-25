import { NotificationEntityType } from '../enums/notification-entity-type.enum';
import { NotificationType } from '../enums/notification-type.enum';

export class CreateNotificationDto {
  recipientId!: string;

  actorId?: string | null;

  type!: NotificationType;

  entityType!: NotificationEntityType;

  entityId!: string;

  title!: string;

  message!: string;
}
