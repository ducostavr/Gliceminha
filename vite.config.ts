import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 1. Importamos o plugin do PWA
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 2. Adicionamos o plugin do PWA à lista
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gliceminha',
        short_name: 'Gliceminha',
        description: 'Seu assistente para monitoramento de glicose.',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  }
})