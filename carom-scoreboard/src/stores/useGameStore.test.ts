import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './useGameStore'

describe('useGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('has an idle status and the default target score by default', () => {
    const store = useGameStore()
    expect(store.status).toBe('idle')
    expect(store.targetScore).toBe(20)
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
    store.startGame('cadre-47-2', 'MICHEL', 'ANDRE')
    store.targetScore = 80

    store.resetGame()

    expect(store.status).toBe('idle')
    expect(store.mode).toBe('libre')
    expect(store.targetScore).toBe(20)
    expect(store.player1.name).toBe('')
    expect(store.player2.name).toBe('')
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([])
    expect(store.startedAt).toBeNull()
    expect(store.lastSaved).toBe('')
  })
})
