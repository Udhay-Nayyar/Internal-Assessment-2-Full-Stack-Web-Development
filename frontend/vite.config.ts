import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api/* to the Express backend, so the browser sees a
// single origin and no CORS configuration is needed on the backend.
// If your backend PORT is not 5000, change the target below.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
