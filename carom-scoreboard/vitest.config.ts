import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // `VitePWA` est indispensable : sans lui, tout fichier qui importe
  // `virtual:pwa-register/vue` échoue à la transformation (« Failed to resolve import »),
  // AVANT que `vi.mock` ne puisse agir. Un alias vers le client du plugin ne suffit pas.
  plugins: [vue(), VitePWA({ registerType: 'prompt', injectRegister: false })],
  test: {
    environment: 'happy-dom',
  },
})
