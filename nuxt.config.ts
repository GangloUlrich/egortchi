import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: ['@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      vapidPublicKey: '',
    },
  },

  app: {
    head: {
      title: 'Courant',
      meta: [
        { name: 'description', content: "Signalement communautaire des coupures d'électricité à Cotonou et Abomey-Calavi." },
        { name: 'theme-color', content: '#16a34a' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Courant',
      short_name: 'Courant',
      description: "Signalement communautaire des coupures d'électricité à Cotonou et Abomey-Calavi.",
      lang: 'fr',
      theme_color: '#16a34a',
      background_color: '#f1f5f9',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
        { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        { src: '/icons/icon-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'osm-tiles',
            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
