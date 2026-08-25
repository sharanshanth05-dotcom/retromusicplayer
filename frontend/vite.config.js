import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In the Base44 dev container the backend runs as a separate service; in plain
// local dev it lives on localhost:3000. BACKEND_URL lets compose point the proxy
// at the backend service without touching this file.
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // bind 0.0.0.0 so the preview proxy can reach us
    allowedHosts: true, // accept the preview's external hostname
    port: 5173,
    proxy: {
      '/api':  { target: backendUrl, changeOrigin: true, credentials: true },
      '/auth': { target: backendUrl, changeOrigin: true, credentials: true },
    },
  },
});
