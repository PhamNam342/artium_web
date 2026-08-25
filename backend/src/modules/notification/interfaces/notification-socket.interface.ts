import type { Socket } from 'socket.io';

import type { NotificationSocketData } from './notification-socket-data.interface';

export type NotificationSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  NotificationSocketData
>;
