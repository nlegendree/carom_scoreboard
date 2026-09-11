import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, nextTick, type EffectScope } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import { useTimer, SHOT_CLOCK_SECONDS, SHOT_CLOCK_GRACE_MS } from './useTimer'

// Story 2.1 : chronomètre de série du 3 Bandes (FR13, AR14). Le composable s'abonne au
// store en lecture seule et décompte via un `setInterval` natif — piloté ici aux fake
// timers, comme l'auto-validation de `ScoreEntryModal`. Exécuté dans un `effectScope`
// pour vérifier le désabonnement (`onScopeDispose`) en fin de test.
// Story 2.2 : chaque relance (démarrage compris) affiche 40 et attend 2 s avant le
// premier tick — les avances de temps ci-dessous incluent cette grâce.
describe('useTimer', () => {
  let scope: EffectScope

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    scope = effectScope()
  })

  afterEach(() => {
    scope.stop()
    vi.useRealTimers()
  })

  function timer() {
    return scope.run(() => useTimer())!
  }

  function startThreeCushions() {
    const store = useGameStore()
    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })
    return store
  }

  it('starts at 40 seconds with a 2 s grace', () => {
    expect(SHOT_CLOCK_SECONDS).toBe(40)
    expect(SHOT_CLOCK_GRACE_MS).toBe(2000)
  })

  it('stays at rest while no game is running', async () => {
    const { secondsRemaining } = timer()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)
  })

  // AC5 (2.1) : le décompte démarre de lui-même dès le début d'une partie 3 Bandes —
  // après la grâce de 2 s (2.2), puis une seconde par seconde.
  it('counts down one second per second once a 3 Bandes game starts, after the grace', async () => {
    const { secondsRemaining } = timer()
    startThreeCushions()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1999)
    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1001)
    expect(secondsRemaining.value).toBe(39)
    vi.advanceTimersByTime(4000)
    expect(secondsRemaining.value).toBe(35)
  })

  // Le chrono n'existe pas hors 3 Bandes : une partie JDS ne le fait pas décompter.
  it('never ticks during a series game', async () => {
    const { secondsRemaining } = timer()
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRÉ', { player1: 100, player2: 80 })

    await nextTick()
    vi.advanceTimersByTime(5000)

    expect(secondsRemaining.value).toBe(40)
  })

  // AC7 : se fige à 0, jamais négatif, sans autre effet.
  it('freezes at zero and never goes negative', async () => {
    const { secondsRemaining } = timer()
    const store = startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(42000)
    expect(secondsRemaining.value).toBe(0)

    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(0)
    expect(store.status).toBe('playing')
    expect(store.activePlayer).toBe('player1')
  })

  // AC8 : RECOMMENCER repart de 40, anneau plein — jamais la valeur laissée derrière.
  it('restarts from 40 on restartGame', async () => {
    const { secondsRemaining } = timer()
    const store = startThreeCushions()

    await nextTick()
    // Une action de jeu du 3 Bandes (le pavé n'y a pas de point d'entrée, Story 2.3
    // annulée) : le store seul ne relance pas le chrono, c'est la vue qui le fait.
    store.incrementSeries()
    vi.advanceTimersByTime(30000)
    expect(secondsRemaining.value).toBe(12)

    store.restartGame()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(3000)
    expect(secondsRemaining.value).toBe(39)
  })

  // AC8 : UNE PARTIE DE PLUS repart aussi de 40.
  it('restarts from 40 on rematch after the game is finished', async () => {
    const { secondsRemaining } = timer()
    const store = startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(30000)
    expect(secondsRemaining.value).toBe(12)
    store.finishGame()
    await nextTick()

    store.rematch()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(3000)
    expect(secondsRemaining.value).toBe(39)
  })

  // AC9 : fin de partie → le décompte s'arrête net, aucune fuite d'intervalle. Le récap
  // remplace le scoreboard : la valeur revient au repos (40), plus aucun tick.
  it('stops ticking once the game is finished', async () => {
    const { secondsRemaining } = timer()
    const store = startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(12000)
    expect(secondsRemaining.value).toBe(30)

    store.finishGame()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)
  })

  // AC9 : retour à l'accueil → repos à 40, aucun tick ensuite.
  it('returns to rest and stops ticking when the game is reset', async () => {
    const { secondsRemaining } = timer()
    const store = startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(12000)
    expect(secondsRemaining.value).toBe(30)

    store.resetGame()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)
  })

  // Story 2.2 : `resetTimer` (tap +1, main rendue) remet à 40 immédiatement, marque 2 s de
  // grâce, puis reprend le décompte.
  it('resetTimer shows 40 at once, waits the grace, then counts down again', async () => {
    const { secondsRemaining, resetTimer } = timer()
    startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(35000)
    expect(secondsRemaining.value).toBe(7)

    resetTimer()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1999)
    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1001)
    expect(secondsRemaining.value).toBe(39)
    vi.advanceTimersByTime(1000)
    expect(secondsRemaining.value).toBe(38)
  })

  // Une relance pendant la grâce repart d'une grâce entière : deux taps rapprochés ne
  // font pas démarrer le décompte plus tôt.
  it('a reset during the grace restarts a full grace', async () => {
    const { secondsRemaining, resetTimer } = timer()
    startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(10000)
    resetTimer()
    vi.advanceTimersByTime(1500)
    resetTimer()
    vi.advanceTimersByTime(1500)

    // Sans relance de la grâce, le premier tick serait tombé à 3 s après le 1er reset.
    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1500)
    expect(secondsRemaining.value).toBe(39)
  })

  // Relancer un chrono figé à 0 le fait repartir (le joueur a fini par tirer).
  it('resetTimer restarts a clock frozen at zero', async () => {
    const { secondsRemaining, resetTimer } = timer()
    startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(50000)
    expect(secondsRemaining.value).toBe(0)

    resetTimer()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(3000)
    expect(secondsRemaining.value).toBe(39)
  })

  // Gardée par le mode : la vue appelle `resetTimer` sans distinguer les modes, et rien
  // ne doit se mettre à décompter en JDS ni hors partie.
  it('resetTimer is a no-op outside a 3 Bandes game', async () => {
    const { secondsRemaining, resetTimer } = timer()
    const store = useGameStore()

    resetTimer()
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)

    store.startGame('libre', 'MICHEL', 'ANDRÉ', { player1: 100, player2: 80 })
    await nextTick()
    resetTimer()
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)
  })

  // Désabonnement propre : un scope arrêté ne réagit plus au store et ne tick plus.
  it('stops reacting and ticking once its scope is disposed', async () => {
    const { secondsRemaining } = timer()
    const store = startThreeCushions()

    await nextTick()
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(37)

    scope.stop()
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(37)

    store.restartGame()

    await nextTick()
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(37)
  })
})
