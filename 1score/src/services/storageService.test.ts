import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  GAME_STORAGE_KEY,
  GAME_STORAGE_VERSION,
  clearGameState,
  loadGameState,
  saveGameState,
} from './storageService'
import type { GameState } from '../types/game'

// `?raw` : le SOURCE de tous les fichiers de `src/`, pas leur module — pour vérifier
// qu'aucun d'eux n'appelle `localStorage` en dehors du service (AR12). Hors périmètre :
// le dossier `services/` lui-même et les tests (qui le pilotent). On cherche un APPEL
// (`localStorage.` / `localStorage[`), pas le mot : un commentaire a le droit de le citer.
const APP_SOURCES = Object.entries(
  import.meta.glob('/src/**/*.{ts,vue}', { query: '?raw', import: 'default', eager: true }),
).filter(([path]) => !path.includes('/services/') && !path.endsWith('.test.ts')) as [
  string,
  string,
][]

// Un état de partie complet et discriminant : chaque champ porte une valeur qui ne
// serait pas celle d'un store neuf, pour qu'un aller-retour tronqué se voie.
function playingState(): GameState {
  return {
    mode: 'cadre-47-2',
    status: 'playing',
    player1: { id: 'player1', name: 'MICHEL', score: 9, color: 'white', targetScore: 100 },
    player2: { id: 'player2', name: 'ANDRE', score: 3, color: 'yellow', targetScore: 80 },
    activePlayer: 'player2',
    reprises: [
      { player1: 7, player2: 3, timestamp: 1 },
      { player1: 0, player2: null, timestamp: 2 },
    ],
    currentInput: { player1: '', player2: '5' },
    scoreAdjustments: { player1: 2, player2: 0 },
    sidesSwapped: true,
    history: [
      {
        player1: { id: 'player1', name: 'MICHEL', score: 7, color: 'white', targetScore: 100 },
        player2: { id: 'player2', name: 'ANDRE', score: 3, color: 'yellow', targetScore: 80 },
        activePlayer: 'player1',
        reprises: [{ player1: 7, player2: 3, timestamp: 1 }],
        scoreAdjustments: { player1: 0, player2: 0 },
        currentInput: { player1: '', player2: '' },
        sidesSwapped: false,
        equalizingReprise: false,
      },
    ],
    startedAt: 1_700_000_000_000,
    lastSaved: '2026-09-10T10:00:00.000Z',
    winner: null,
    finishedAt: null,
    equalizingReprise: false,
    endPrompt: { kind: 'equalizing-offer' },
    entryOpen: true,
  }
}

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('pins the storage key', () => {
    expect(GAME_STORAGE_KEY).toBe('1score:game')
  })

  it('round-trips a full game state', () => {
    const state = playingState()

    saveGameState(state)

    expect(loadGameState()).toEqual(state)
  })

  it('wraps the state in a versioned, timestamped envelope', () => {
    saveGameState(playingState())

    const raw = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)!)
    expect(raw.version).toBe(GAME_STORAGE_VERSION)
    expect(typeof raw.savedAt).toBe('number')
    expect(raw.state.status).toBe('playing')
  })

  it('returns null when nothing is saved, without warning', () => {
    expect(loadGameState()).toBeNull()
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('removes the entry on clear', () => {
    saveGameState(playingState())

    clearGameState()

    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
    expect(loadGameState()).toBeNull()
  })

  // Une sauvegarde illisible est jetée : sinon chaque lancement réavertirait.
  it.each([
    ['corrupted JSON', '{not json'],
    ['an unknown version', JSON.stringify({ version: 0, savedAt: 1, state: playingState() })],
    [
      'an idle status',
      JSON.stringify({ version: 1, savedAt: 1, state: { ...playingState(), status: 'idle' } }),
    ],
    [
      'an unexpected shape',
      JSON.stringify({ version: 1, savedAt: 1, state: { ...playingState(), reprises: 'x' } }),
    ],
    ['a missing history', JSON.stringify({ version: 1, savedAt: 1, state: { ...playingState(), history: undefined } })],
    ['a non-object envelope', JSON.stringify('hello')],
  ])('returns null and drops the entry on %s', (_label, raw) => {
    localStorage.setItem(GAME_STORAGE_KEY, raw)

    expect(loadGameState()).toBeNull()

    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('accepts a finished game', () => {
    const state: GameState = {
      ...playingState(),
      status: 'finished',
      winner: 'player1',
      finishedAt: 2,
      endPrompt: null,
      entryOpen: false,
    }

    saveGameState(state)

    expect(loadGameState()).toEqual(state)
  })

  // AR12 : l'erreur est absorbée ICI, jamais dans le store ni un composant. Et rien de
  // PÉRIMÉ ne survit : la sauvegarde précédente est supprimée, sinon elle serait proposée
  // au rechargement comme « PARTIE EN COURS » avec N actions de retard (revue 1.12).
  it('swallows a failing setItem, reports it and drops the stale save', () => {
    saveGameState(playingState())
    expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toBeNull()
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => saveGameState(playingState())).not.toThrow()
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(String(vi.mocked(console.error).mock.calls[0]![0])).toContain('[storage]')
    expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
  })

  it('returns null when getItem throws', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    expect(loadGameState()).toBeNull()
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('does not throw when removeItem throws', () => {
    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    expect(() => clearGameState()).not.toThrow()
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  // AC1 : `localStorage` n'est appelé QUE par le service — sur TOUT `src/`, pas trois
  // fichiers choisis. Le glob doit trouver quelque chose, sinon le test ne prouve rien.
  it('scans every application source for localStorage calls', () => {
    expect(APP_SOURCES.length).toBeGreaterThan(5)
    expect(APP_SOURCES.map(([path]) => path)).toContain('/src/stores/useGameStore.ts')
  })

  it.each(APP_SOURCES)('keeps localStorage calls out of %s', (_path, source) => {
    expect(source).not.toMatch(/\blocalStorage\s*[.[]/)
  })
})
