import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, nextTick, type EffectScope } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import { useTimer, SHOT_CLOCK_SECONDS } from './useTimer'

// Story 2.1 : chronomètre de série du 3 Bandes (FR13, AR14). Le composable s'abonne au
// store en lecture seule et décompte via un `setInterval` natif — piloté ici aux fake
// timers, comme l'auto-validation de `ScoreEntryModal`. Exécuté dans un `effectScope`
// pour vérifier le désabonnement (`onScopeDispose`) en fin de test.
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

  it('starts at 40 seconds', () => {
    expect(SHOT_CLOCK_SECONDS).toBe(40)
  })

  it('stays at rest while no game is running', async () => {
    const { secondsRemaining } = timer()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)
  })

  // AC5 : le décompte démarre de lui-même dès le début d'une partie 3 Bandes.
  it('counts down one second per second once a 3 Bandes game starts', async () => {
    const { secondsRemaining } = timer()
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1000)
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
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    vi.advanceTimersByTime(40000)
    expect(secondsRemaining.value).toBe(0)

    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(0)
    expect(store.status).toBe('playing')
    expect(store.activePlayer).toBe('player1')
  })

  // AC8 : RECOMMENCER repart de 40, anneau plein — jamais la valeur laissée derrière.
  it('restarts from 40 on restartGame', async () => {
    const { secondsRemaining } = timer()
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    store.openScoreEntry('player1')
    store.appendScoreDigit('player1', 3)
    store.validateScoreInput('player1')
    vi.advanceTimersByTime(28000)
    expect(secondsRemaining.value).toBe(12)

    store.restartGame()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1000)
    expect(secondsRemaining.value).toBe(39)
  })

  // AC8 : UNE PARTIE DE PLUS repart aussi de 40.
  it('restarts from 40 on rematch after the game is finished', async () => {
    const { secondsRemaining } = timer()
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    vi.advanceTimersByTime(28000)
    expect(secondsRemaining.value).toBe(12)
    store.finishGame()
    await nextTick()

    store.rematch()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(1000)
    expect(secondsRemaining.value).toBe(39)
  })

  // AC9 : fin de partie → le décompte s'arrête net, aucune fuite d'intervalle. Le récap
  // remplace le scoreboard : la valeur revient au repos (40), plus aucun tick.
  it('stops ticking once the game is finished', async () => {
    const { secondsRemaining } = timer()
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    vi.advanceTimersByTime(10000)
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
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    vi.advanceTimersByTime(10000)
    expect(secondsRemaining.value).toBe(30)

    store.resetGame()

    await nextTick()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(5000)
    expect(secondsRemaining.value).toBe(40)
  })

  // Point d'extension pour la Story 2.2 (tap +1, bascule de tour) : rien ne l'appelle
  // dans la 2.1, mais la primitive doit remettre à 40 et continuer de décompter.
  it('resetTimer restarts the countdown from 40', async () => {
    const { secondsRemaining, resetTimer } = timer()
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    vi.advanceTimersByTime(33000)
    expect(secondsRemaining.value).toBe(7)

    resetTimer()

    expect(secondsRemaining.value).toBe(40)
    vi.advanceTimersByTime(2000)
    expect(secondsRemaining.value).toBe(38)
  })

  // Désabonnement propre : un scope arrêté ne réagit plus au store et ne tick plus.
  it('stops reacting and ticking once its scope is disposed', async () => {
    const { secondsRemaining } = timer()
    const store = useGameStore()

    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 30, player2: 25 })

    await nextTick()
    vi.advanceTimersByTime(3000)
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
