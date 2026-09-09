import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './useGameStore'

describe('useGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Décision produit du 2026-09-08 : aucun mode ne porte de distance par défaut.
  // Les deux joueurs démarrent donc en distance libre (0 = aucun objectif).
  it('has an idle status and no target score on either player by default', () => {
    const store = useGameStore()
    expect(store.status).toBe('idle')
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
  })

  it('starts a game with the given mode and player names', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.mode).toBe('libre')
    expect(store.player1.name).toBe('MICHEL')
    expect(store.player2.name).toBe('ANDRE')
    expect(store.status).toBe('playing')
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([])
    expect(store.player1.score).toBe(0)
    expect(store.player2.score).toBe(0)
  })

  // Le 4e paramètre est optionnel : le parcours de démarrage de la Story 1.3 reste
  // strictement inchangé quand on ne touche pas au format (AC#8).
  it('leaves both target scores free when started without a format', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
  })

  // Handicap façon coréenne : chaque joueur peut jouer sa propre distance.
  it('assigns each target score to its own player', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })

    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  // La garde vit dans l'action, pas dans le composant (AR17) : un appel direct au store
  // ne doit pas pouvoir installer une distance négative, décimale ou hors bornes.
  it('normalizes incoming target scores to integers within [0, 999]', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: -5, player2: 1200 })
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(999)

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 42.7, player2: 0.9 })
    expect(store.player1.targetScore).toBe(42)
    expect(store.player2.targetScore).toBe(0)
  })

  it('always assigns white to the left player and yellow to the right player', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.player1.color).toBe('white')
    expect(store.player2.color).toBe('yellow')
  })

  it('swaps players between sides while keeping colors bound to their side', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.swapPlayers()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player1.color).toBe('white')
    expect(store.player2.color).toBe('yellow')
    expect(store.player1.id).toBe('player1')
    expect(store.player2.id).toBe('player2')
  })

  // AC#7 : la distance suit le joueur — comme son nom et son score — tandis que la bille
  // reste attachée au côté. Distances dissociées pour que le test discrimine vraiment.
  it('carries each target score with its player when sides are swapped', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })

    store.swapPlayers()

    expect(store.player1.targetScore).toBe(80)
    expect(store.player2.targetScore).toBe(100)
    expect(store.player1.color).toBe('white')
    expect(store.player2.color).toBe('yellow')
  })

  // Règle produit arrêtée en revue de la Story 1.3 : le tour est attaché au CÔTÉ,
  // pas à la personne — le joueur de gauche commence, l'interversion n'y change rien.
  it('keeps the turn on the left side when players swap', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.swapPlayers()

    expect(store.activePlayer).toBe('player1')
  })

  it('refuses to swap players once a reprise has been recorded', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.reprises = [{ player1: 3, player2: 2, timestamp: Date.now() }]

    store.swapPlayers()

    expect(store.player1.name).toBe('MICHEL')
    expect(store.player2.name).toBe('ANDRE')
  })

  it('refuses to swap players outside of a running game', () => {
    const store = useGameStore()

    store.swapPlayers()

    expect(store.player1.name).toBe('')
    expect(store.status).toBe('idle')
  })

  it('restores the full initial state on reset, carrying nothing over', () => {
    const store = useGameStore()
    store.startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })

    store.resetGame()

    expect(store.status).toBe('idle')
    expect(store.mode).toBe('libre')
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
    expect(store.player1.name).toBe('')
    expect(store.player2.name).toBe('')
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([])
    expect(store.startedAt).toBeNull()
    expect(store.lastSaved).toBe('')
  })
})
