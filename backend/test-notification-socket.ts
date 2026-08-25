import { io } from 'socket.io-client';

const token = process.env.TEST_NOTIFICATION_TOKEN;
const socketUrl =
  process.env.NOTIFICATION_SOCKET_URL ??
  'http://localhost:3000/notifications';

if (!token) {
  throw new Error(
    'TEST_NOTIFICATION_TOKEN is required. Do not commit a real token to this file.',
  );
}

const socket = io(socketUrl, {
  auth: { token },
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
