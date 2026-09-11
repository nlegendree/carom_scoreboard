import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), VitePWA({
    // `prompt` + `injectRegister: false` : l'enregistrement et l'application d'une nouvelle
    // version sont pilotés par `src/composables/usePwaUpdate.ts` (jamais pendant une partie).
    registerType: 'prompt',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    // `orientation: 'landscape'` : l'app ne tourne qu'en paysage (décision de Nathan,
    // 2026-09-11, CLAUDE.md §9). Sans effet sur `id`/`start_url`/`scope` : la PWA
    // installée reste la même.
    // Les `icons` sont injectées par `pwaAssets` (pwa-assets.config.ts), pas listées ici.
    manifest: {
      name: '1Score',
      short_name: '1Score',
      description: 'Scoreboard tactile pour billard carambole',
      lang: 'fr',
      orientation: 'landscape',
      id: '/',
      theme_color: '#0D1117',
      background_color: '#0D1117',
      display: 'standalone',
      start_url: '/',
      scope: '/',
    },

    // Tout le build est précaché et servi cache-first, index.html compris (AR10 précisé
    // en Story 1.13) : le HTML référence des assets hachés, un HTML servi « stale »
    // (StaleWhileRevalidate) pointerait vers des fichiers que `cleanupOutdatedCaches`
    // a supprimés → page cassée hors ligne. Le précache révisionné garde HTML et assets cohérents.
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: false,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})
