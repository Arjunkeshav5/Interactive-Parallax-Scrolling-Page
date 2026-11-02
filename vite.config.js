import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    // avoids native realpath calls (some locked-down Windows environments forbid them)
    preserveSymlinks: true,
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 600,
  },
});
