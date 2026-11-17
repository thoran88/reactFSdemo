import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev /api calls go to the local backend (backend/server.js) that creates Checkout Component sessions
export default defineConfig({
  plugins: [react()],
  server: {
    // 3000 is already on the Component Checkout allowed domains list
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
