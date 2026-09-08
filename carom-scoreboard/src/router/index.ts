import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/GameView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'game', component: GameView },
    // Sans catch-all, toute autre URL (favori obsolète, deep link, restauration PWA)
    // rendrait un <router-view /> vide, donc une page blanche sans issue.
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
