import { io } from 'socket.io-client';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjNWM3NmZjNy1iOWJkLTQxNjItOGJhYi0yODJlOGNlNGU0NWUiLCJlbWFpbCI6Im5hbTEyMzRrYW5AZ21haWwuY29tIiwicm9sZSI6IkFSVElTVCIsImp0aSI6ImNmNjgyYzYyLTZiYTAtNDc0Ni1hNGVkLTNhMTg4YTQ2YmVjZSIsImlhdCI6MTc4NzU4MTA1OCwiZXhwIjoxNzg4MTg1ODU4fQ.BZVwAWCVJB16Jb-sGmnZRoJuHXfgpELRI0Hm3yGZyr4';

const socket = io('http://localhost:3000/notifications', {
  auth: {
    token,
  },
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
