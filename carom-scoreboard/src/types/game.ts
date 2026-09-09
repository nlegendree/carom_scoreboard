export type GameStatus = 'idle' | 'playing' | 'finished'

// La bille est attachée à la position : joueur de gauche blanc, joueur de droite jaune.
// Intervertir les billes revient donc à échanger les joueurs de côté (voir swapPlayers).
export type PlayerColor = 'white' | 'yellow'

// Catalogue déclaratif des modes, et source de vérité unique des unions `GameCategoryId`
// et `GameMode` : elles en sont dérivées plus bas, ce qui rend impossible l'ajout d'un mode
// à l'union sans entrée correspondante dans le catalogue (et donc sans libellé).
// `available` ne décrit que ce dont l'accueil a besoin : les règles de score propres à
// chaque mode arriveront avec leur story dédiée, pas ici.
const CATALOG = [
  {
    id: 'series',
    label: 'JEUX DE SÉRIES',
    hint: 'Libre · Cadre · 1 Bande · 4 Billes',
    modes: [
      { id: 'libre', label: 'LIBRE', available: true },
      { id: 'cadre-47-2', label: 'CADRE 47/2', available: true },
      { id: 'cadre-47-1', label: 'CADRE 47/1', available: true },
      { id: 'cadre-71-2', label: 'CADRE 71/2', available: true },
      { id: 'bande', label: '1 BANDE', available: true },
      { id: '4billes', label: '4 BILLES', available: true },
    ],
  },
  {
    id: '3bandes',
    label: '3 BANDES',
    hint: 'Partie au point · chronomètre',
    modes: [{ id: '3bandes', label: '3 BANDES', available: false }],
  },
  {
    id: 'quilles',
    label: 'QUILLES',
    hint: '5 Quilles · 9 Quilles',
    modes: [
      { id: 'quilles-5', label: '5 QUILLES', available: false },
      { id: 'quilles-9', label: '9 QUILLES', available: false },
    ],
  },
  {
    id: 'casin',
    label: 'CASIN',
    hint: 'Parties par catégories',
    modes: [{ id: 'casin', label: 'CASIN', available: false }],
  },
] as const

export type GameCategoryId = (typeof CATALOG)[number]['id']
export type GameMode = (typeof CATALOG)[number]['modes'][number]['id']

export interface GameModeDescriptor {
  id: GameMode
  label: string
  available: boolean
}

export interface GameCategoryDescriptor {
  id: GameCategoryId
  label: string
  hint: string
  modes: readonly GameModeDescriptor[]
}

export const GAME_CATEGORIES: readonly GameCategoryDescriptor[] = CATALOG

export interface Player {
  id: 'player1' | 'player2'
  name: string
  score: number
  color: PlayerColor
  // Distance de jeu du joueur (0 = aucun objectif / distance libre), configurable par la
  // Story 1.4. Portée par le joueur et non la partie pour supporter le handicap (deux
  // joueurs peuvent jouer des distances différentes, convention coréenne en 3 Bandes).
  targetScore: number
}

export interface Reprise {
  player1: number | null
  player2: number | null
  timestamp: number
}

export interface GameState {
  mode: GameMode
  status: GameStatus
  player1: Player
  player2: Player
  activePlayer: 'player1' | 'player2'
  reprises: Reprise[]
  currentInput: { player1: string; player2: string }
  isNegative: { player1: boolean; player2: boolean }
  startedAt: number | null
  lastSaved: string
}

// Photographie de l'état de partie prise AVANT chaque action annulable (Story 1.7) :
// tout ce que les trois actions (série, main rendue, correction) peuvent toucher, plus
// la parité des côtés (`sidesSwapped`) qui permet de restaurer un snapshot pris avant un
// `ÉCHANGER` sans défaire l'échange. Rien de plus : `mode`, `status`, `startedAt` ne
// bougent jamais en cours de partie. Volontairement absent de `GameState` tant que la
// Story 1.12 n'a pas tranché la persistance de la pile.
export interface GameSnapshot {
  player1: Player
  player2: Player
  activePlayer: 'player1' | 'player2'
  reprises: Reprise[]
  scoreAdjustments: { player1: number; player2: number }
  currentInput: { player1: string; player2: string }
  isNegative: { player1: boolean; player2: boolean }
  sidesSwapped: boolean
}

// Exhaustif par construction : les clés proviennent du même catalogue que l'union `GameMode`.
export const GAME_MODE_LABELS = Object.fromEntries(
  CATALOG.flatMap((category) => category.modes.map((mode) => [mode.id, mode.label])),
) as Record<GameMode, string>

export function isCategoryAvailable(category: GameCategoryDescriptor): boolean {
  return category.modes.some((mode) => mode.available)
}
