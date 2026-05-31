import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // NOTE: allowedHosts: true is required for Cloudflare Tunnel dev access only.
    // No effect on the production Vercel build.
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('@tanstack')) return 'table'
          if (id.includes('html2canvas') || id.includes('jspdf')) return 'exports'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
