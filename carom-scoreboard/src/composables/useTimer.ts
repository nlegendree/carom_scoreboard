import { onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/useGameStore'

// Story 2.1 : chrono de tir du 3 Bandes (FR13, AR14). Durée sourcée de la spec UX
// (« reset du chrono de tir (40s) ») — aucune autre valeur n'existe dans les specs.
export const SHOT_CLOCK_SECONDS = 40

/**
 * Chronomètre de série, toujours actif en 3 Bandes et inexistant ailleurs.
 *
 * - Décompte de 40 à 0, une seconde par seconde, dès qu'une partie `3bandes` est en
 *   cours ; se fige à 0 sans autre effet (aucune règle de faute au temps ici).
 * - Repart de 40 à CHAQUE `startGame()` interne du store — démarrage, RECOMMENCER,
 *   UNE PARTIE DE PLUS, reprise après fermeture — parce que `startedAt` change à chacun,
 *   là où `status` reste sur `playing` pour un `restartGame()`. `status` couvre, lui,
 *   l'arrêt en fin de partie et au retour à l'accueil, que `startedAt` ne signale pas.
 * - Aucune pause/reprise (retirée du périmètre V1b, décision de Nathan du 2026-09-10) ;
 *   aucune persistance (AR14 isole le chrono de `GameState`) : un rechargement en pleine
 *   partie repart à 40.
 * - `resetTimer()` n'a pas d'appelant externe dans la 2.1 : c'est la primitive que la
 *   Story 2.2 branchera sur le tap +1 et la bascule de tour.
 */
export function useTimer() {
  const { status, mode, startedAt } = storeToRefs(useGameStore())

  const secondsRemaining = ref(SHOT_CLOCK_SECONDS)
  let intervalId: ReturnType<typeof setInterval> | undefined

  function stopInterval(): void {
    clearInterval(intervalId)
    intervalId = undefined
  }

  function tick(): void {
    if (secondsRemaining.value <= 0) {
      stopInterval()
      return
    }
    secondsRemaining.value -= 1
    if (secondsRemaining.value <= 0) stopInterval()
  }

  function startInterval(): void {
    stopInterval()
    intervalId = setInterval(tick, 1000)
  }

  function resetTimer(): void {
    secondsRemaining.value = SHOT_CLOCK_SECONDS
    startInterval()
  }

  // Déclaré de façon synchrone dans le corps du composable, jamais dans un callback.
  onScopeDispose(stopInterval)

  watch(
    [status, mode, startedAt],
    ([s, m]) => {
      if (s === 'playing' && m === '3bandes') {
        resetTimer()
      } else {
        stopInterval()
        secondsRemaining.value = SHOT_CLOCK_SECONDS
      }
    },
    { immediate: true },
  )

  return { secondsRemaining, resetTimer }
}
