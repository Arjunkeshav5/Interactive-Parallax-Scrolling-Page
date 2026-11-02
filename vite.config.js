import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Interactive-Parallax-Scrolling-Page/',
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 600,
  },
})
