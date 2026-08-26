import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: {
    allowedHosts: [
      'artiumui-production.up.railway.app', // Domain Railway của bạn
      '.up.railway.app',                    // Cho phép tất cả subdomain của Railway
    ],
  },
});
