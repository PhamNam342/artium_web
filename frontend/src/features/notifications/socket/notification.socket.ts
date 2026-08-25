import { io, Socket } from 'socket.io-client';

import type { Notification } from '../types/notification.types';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:3000';

let socket: Socket | null = null;

export const connectNotificationSocket = (
  onNotification: (notification: Notification) => void,
) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.warn('No access token. Notification socket not connected.');
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(`${SOCKET_URL}/notifications`, {
    transports: ['websocket'],
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log(
      '[NotificationSocket] Connected:',
      socket?.id,
    );
  });

  socket.on('notification:new', (notification: Notification) => {
    console.log(
      '[NotificationSocket] New notification:',
      notification,
    );

    onNotification(notification);
  });

  socket.on('connect_error', (error) => {
    console.error(
      '[NotificationSocket] Connection error:',
      error.message,
    );
  });

  socket.on('disconnect', (reason) => {
    console.log(
      '[NotificationSocket] Disconnected:',
      reason,
    );
  });

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (!socket) {
    return;
  }

  socket.disconnect();
  socket = null;
};

export const getNotificationSocket = () => socket;
