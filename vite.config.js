import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'Mu.png', 'Mu.jpg'],
      manifest: false,

      // ⬇️ Ganti strategi jadi injectManifest supaya sw.js custom
      // (dengan push notification handler) dipakai, bukan digenerate otomatis.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg}']
      },

      // Wajib di-set false kalau pakai injectManifest,
      // supaya Vite tidak generate dev-sw otomatis yang bentrok.
      devOptions: {
        enabled: false
      }
    })
  ]
})