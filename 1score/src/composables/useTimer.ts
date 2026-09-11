import { onScopeDispose, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/useGameStore'

// Story 2.1 : chrono de tir du 3 Bandes (FR13, AR14). Durée sourcée de la spec UX
// (« reset du chrono de tir (40s) ») — aucune autre valeur n'existe dans les specs.
export const SHOT_CLOCK_SECONDS = 40

// Story 2.2 : latence avant le premier tick après CHAQUE relance (décision de Nathan,
// 2026-09-11 — « une petite latence de 2 s », révisée de 3 s à la création de la 2.1).
// L'anneau s'affiche plein à 40 et attend ce délai avant de commencer à se vider : le
// temps que le joueur assis retire son doigt et que celui qui joue se replace.
export const SHOT_CLOCK_GRACE_MS = 2000

/**
 * Chronomètre de série, toujours actif en 3 Bandes et inexistant ailleurs.
 *
 * - Décompte de 40 à 0, une seconde par seconde, dès qu'une partie `3bandes` est en
 *   cours ; se fige à 0 sans autre effet (aucune règle de faute au temps ici).
 * - Repart de 40 à CHAQUE `startGame()` interne du store — démarrage, RECOMMENCER,
 *   UNE PARTIE DE PLUS, reprise après fermeture — parce que `startedAt` change à chacun,
 *   là où `status` reste sur `playing` pour un `restartGame()`. `status` couvre, lui,
 *   l'arrêt en fin de partie et au retour à l'accueil, que `startedAt` ne signale pas.
 * - Toute relance (démarrage compris) affiche 40 puis attend `SHOT_CLOCK_GRACE_MS` avant
 *   le premier tick (Story 2.2).
 * - Aucune pause/reprise (retirée du périmètre V1b, décision de Nathan du 2026-09-10) ;
 *   aucune persistance (AR14 isole le chrono de `GameState`) : un rechargement en pleine
 *   partie repart à 40.
 * - `resetTimer()` est appelée par `GameView` au `+1 POINT` et à la main rendue (Story
 *   2.2). Elle est gardée par le mode : hors 3 Bandes, elle ne fait rien — la vue peut
 *   donc l'appeler sans distinguer les modes.
 */
export function useTimer() {
  const { status, mode, startedAt } = storeToRefs(useGameStore())

  const secondsRemaining = ref(SHOT_CLOCK_SECONDS)
  let intervalId: ReturnType<typeof setInterval> | undefined
  let graceId: ReturnType<typeof setTimeout> | undefined

  function stopTimers(): void {
    clearInterval(intervalId)
    clearTimeout(graceId)
    intervalId = undefined
    graceId = undefined
  }

  function tick(): void {
    if (secondsRemaining.value <= 0) {
      stopTimers()
      return
    }
    secondsRemaining.value -= 1
    if (secondsRemaining.value <= 0) stopTimers()
  }

  function startInterval(): void {
    stopTimers()
    intervalId = setInterval(tick, 1000)
  }

  function isShotClockGame(): boolean {
    return status.value === 'playing' && mode.value === '3bandes'
  }

  function resetTimer(): void {
    if (!isShotClockGame()) return
    stopTimers()
    secondsRemaining.value = SHOT_CLOCK_SECONDS
    graceId = setTimeout(startInterval, SHOT_CLOCK_GRACE_MS)
  }

  // Déclaré de façon synchrone dans le corps du composable, jamais dans un callback.
  onScopeDispose(stopTimers)

  watch(
    [status, mode, startedAt],
    () => {
      if (isShotClockGame()) {
        resetTimer()
      } else {
        stopTimers()
        secondsRemaining.value = SHOT_CLOCK_SECONDS
      }
    },
    { immediate: true },
  )

  return { secondsRemaining, resetTimer }
}
