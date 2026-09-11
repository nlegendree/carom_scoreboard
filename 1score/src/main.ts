import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import App from './App.vue'
import { router } from './router'
import { useGameStore } from './stores/useGameStore'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Story 1.12 : une partie sauvegardée est lue AVANT le montage, pour que `GameView`
// affiche la pop-up de reprise dès son premier rendu. Le store porte l'état chargé ; la
// vue ne fait que le proposer.
useGameStore(pinia).checkSavedGame()

app.mount('#app')
