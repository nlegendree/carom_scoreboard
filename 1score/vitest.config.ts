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
    // Vitest remplace par défaut TOUT import CSS par une chaîne vide — y compris en
    // `?raw`, qui rend donc `''` au lieu du fichier. `main.css` est le seul dont un test
    // lit le TEXTE (garde `prefers-reduced-motion`, Story 10.7) : on le laisse passer, lui
    // seul. Aucun composant n'importe de CSS, la portée est donc sans effet ailleurs.
    css: { include: [/main\.css/] },
  },
})
