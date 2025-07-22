import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/pomoka/' : '/',
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pomoka - Pomodoro Timer',
        short_name: 'Pomoka',
        description: 'シンプルなポモドーロタイマー',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: process.env.NODE_ENV === 'production' ? '/pomoka/' : '/',
        scope: process.env.NODE_ENV === 'production' ? '/pomoka/' : '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
})