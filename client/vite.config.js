import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config for CareerConnect client.
 *
 * Development:
 *   - Frontend (Vite dev server) runs on port 3000  → http://localhost:3000
 *   - Backend (Express) runs on port 3001           → http://localhost:3001
 *   - All /api/* requests are proxied from 3000 → 3001 (no CORS issues)
 *   - Access the app at: http://localhost:3000
 *
 * Production (after `npm run build`):
 *   - Run `npm start` in the server folder.
 *   - Express serves the built dist/ on port 3001.
 *   - Access everything at: http://localhost:3001
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,         // Frontend dev server port
    strictPort: false,  // Auto-increment if port is busy
    proxy: {
      // Proxy all API calls to the Express backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
