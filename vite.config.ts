import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.png'],
      manifest: {
        name: 'SoundScape',
        short_name: 'SoundScape',
        description: 'Programmatic white noise generator with Web Audio API',
        theme_color: '#0F0F1A',
        background_color: '#0F0F1A',
        display: 'standalone',
        icons: [
          {
            src: 'og-image.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
