import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import { router } from './router'
import { useGameStore } from './stores/useGameStore'
import { readScene, applyStoreScene, keepSceneOutOfStorage } from './dev/scenes'
import { clearGameState } from './services/storageService'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Story 1.12 : une partie sauvegardée est lue AVANT le montage, pour que `GameView`
// affiche la pop-up de reprise dès son premier rendu. Le store porte l'état chargé ; la
// vue ne fait que le proposer.
useGameStore(pinia).checkSavedGame()

// Story 11.4 — scènes adressables par `?scene=`, pour que le garde-fou outillé
// (`npm run design:check`) puisse scanner les douze écrans et pas seulement l'accueil.
// ICI et pas ailleurs : le détecteur scanne à la fin du chargement sans rien attendre, donc
// la scène doit être posée AVANT `app.mount()` — un état atteint par un geste différé
// serait mesuré avant d'exister. `applyStoreScene` commence par `discardSavedGame()`, sinon
// la partie que la scène précédente a persistée poserait `PARTIE EN COURS` par-dessus.
// La garde est ICI, au point d'entrée : `import.meta.env.DEV` est remplacé statiquement,
// le bloc s'efface du build et l'import devenu inutile part avec lui (`scenes.test.ts`).
if (import.meta.env.DEV) {
  const scene = readScene()
  if (scene) {
    const store = useGameStore(pinia)
    applyStoreScene(store, scene)
    // Une scène ne laisse RIEN derrière elle : sans ça, la partie qu'elle vient de jouer est
    // persistée par le `watch` du store, et la visite suivante — même sans `?scene=` — rouvre
    // `PARTIE EN COURS` par-dessus l'accueil. Un scan polluerait la session d'après.
    // L'effacement passe par la COUCHE SERVICE et non par `discardSavedGame()`, qui est un
    // no-op sur une partie en cours — donc précisément sur les scènes 07 à 12.
    keepSceneOutOfStorage(clearGameState)
  }
}

app.mount('#app')
