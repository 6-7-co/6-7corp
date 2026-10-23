import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev server proxies API + uploads to the Fastify backend so the browser only
// ever talks to one origin (the Vite preview host).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Read .env from the repo root so VITE_* values (e.g. the hidden admin path)
  // can live in one place next to the server config.
  envDir: '..',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
