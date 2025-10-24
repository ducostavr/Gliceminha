import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // ✅ ADICIONADO: Garante que seus ícones principais sejam cacheados
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      
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
            src: 'pwa-192x192.png', // Já existe no seu /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Já existe no seu /public
            sizes: '512x512',
            type: 'image/png'
          },
          
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000, // <--- Aumenta o limite para 1000 kB
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