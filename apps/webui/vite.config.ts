import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: { '~': path.resolve(__dirname, './src') },
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:2348',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../cli/dist/client',
    assetsDir: '.',
    emptyOutDir: true,
  },
});
