import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // `VitePWA` est indispensable : sans lui, tout fichier qui importe
  // `virtual:pwa-register/vue` échoue à la transformation (« Failed to resolve import »),
  // AVANT que `vi.mock` ne puisse agir. Un alias vers le client du plugin ne suffit pas.
  plugins: [vue(), VitePWA({ registerType: 'prompt', injectRegister: false })],
  // `DESIGN.md` vit à la RACINE DU DÉPÔT, un cran au-dessus de la racine Vite (`1score/`),
  // et Vite refuse par défaut tout fichier hors de celle-ci : sans cette ligne, l'import
  // `../../../DESIGN.md?raw` échoue sur `Error: Denied ID …/DESIGN.md?raw` (vérifié dans
  // les deux sens). Story 11.4 : les tests de tokens LISENT le frontmatter au lieu de le
  // recopier — c'est ce qui fait du miroir un vrai miroir.
  // ⚠️ À ne pas confondre avec le piège `test.css.include` juste dessous : celui-ci ne vaut
  // que pour le CSS, celui-là pour l'emplacement du fichier. Les deux sont nécessaires.
  server: { fs: { allow: ['..'] } },
  test: {
    environment: 'happy-dom',
    // Vitest remplace par défaut TOUT import CSS par une chaîne vide — y compris en
    // `?raw`, qui rend donc `''` au lieu du fichier. `main.css` est le seul dont un test
    // lit le TEXTE (garde `prefers-reduced-motion`, Story 10.7) : on le laisse passer, lui
    // seul. Aucun composant n'importe de CSS, la portée est donc sans effet ailleurs.
    css: { include: [/main\.css/] },
  },
})
