export type GameStatus = 'idle' | 'playing' | 'finished'

// Côté de la table, pas personne : `player1` est TOUJOURS le joueur de gauche (bille
// blanche), `player2` celui de droite (jaune). Introduit en Story 1.10 pour remplacer
// l'union littérale répétée ; adopté dans le nouveau code et les signatures touchées,
// sans chasse exhaustive.
export type PlayerId = 'player1' | 'player2'

// Pop-up de décision attendue en fin de partie (Story 1.10). Portée par le store et non
// par la vue : un pilotage déporté (V2+) la voit, et la persistance (1.12) pourra la
// restaurer. `equalizing-offer` : le blanc a atteint sa distance, le jaune a droit à la
// reprise égalisatrice. `over` : la partie est jouée, `winner` à `null` signifie égalité.
export type EndPrompt = { kind: 'equalizing-offer' } | { kind: 'over'; winner: PlayerId | null }

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
    modes: [{ id: '3bandes', label: '3 BANDES', available: true }],
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
  id: PlayerId
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

// Forme EXACTE de ce que la Story 1.12 écrit en `localStorage` après chaque action et
// restaure au lancement suivant : tout ce que le store expose en lecture, pile
// d'annulation comprise. Le store construit un `computed<GameState>` complet — ajouter
// un champ ici sans l'y renseigner ne compile pas, c'est la garantie contre l'oubli.
// Tout changement de forme ici INCRÉMENTE `GAME_STORAGE_VERSION` (`storageService.ts`) :
// la garde de lecture ne couvre qu'un sous-ensemble de champs.
// `isNegative` (Story 1.9, annulée) a été retiré ici même : il n'a jamais rien porté.
export interface GameState {
  mode: GameMode
  status: GameStatus
  player1: Player
  player2: Player
  activePlayer: PlayerId
  reprises: Reprise[]
  currentInput: { player1: string; player2: string }
  // Corrections `−`/`+` tenues à part des reprises (Story 1.7). Persistées : sans elles,
  // la série suivante recalculerait le total depuis les seules reprises et les effacerait.
  scoreAdjustments: { player1: number; player2: number }
  // Parité des côtés (Story 1.7). Persistée : les snapshots pris avant un `ÉCHANGER`
  // doivent être restaurés dans les bonnes coordonnées après une reprise.
  sidesSwapped: boolean
  // Pile d'annulation complète (décision de Nathan, 2026-09-10) : après une reprise,
  // `ANNULER` remonte les actions d'avant la fermeture comme si rien ne s'était passé.
  history: GameSnapshot[]
  startedAt: number | null
  lastSaved: string
  // --- Fin de partie (Story 1.10) ---
  // `null` tant que la partie n'est pas `finished`, ou en cas d'égalité une fois finie.
  winner: PlayerId | null
  finishedAt: number | null
  // Reprise égalisatrice en cours : le blanc a atteint sa distance, le jaune joue SA
  // dernière série. Attachée au côté droit, comme le tour (Décision 15 de la 1.5).
  equalizingReprise: boolean
  // Pop-up de décision ouverte, restaurée telle quelle à la reprise (1.12).
  endPrompt: EndPrompt | null
  // Pop-up de saisie ouverte (1.12, décision 3) : monte de la vue dans le store pour être
  // rouverte à la reprise, avec le buffer `currentInput` déjà tapé.
  entryOpen: boolean
}

// Photographie de l'état de partie prise AVANT chaque action annulable (Story 1.7) :
// tout ce que les trois actions (série, main rendue, correction) peuvent toucher, plus
// la parité des côtés (`sidesSwapped`) qui permet de restaurer un snapshot pris avant un
// `ÉCHANGER` sans défaire l'échange. Rien de plus : `mode`, `status`, `startedAt` ne
// bougent jamais en cours de partie. La pile de ces snapshots fait partie de `GameState`
// et EST persistée intégralement (Story 1.12, décision de Nathan du 2026-09-10).
// `equalizingReprise` en fait partie (Story 1.10, AC9) : annuler la série gagnante du
// blanc défait aussi l'offre acceptée. `endPrompt`, `winner`, `finishedAt` n'y sont PAS :
// la pop-up est toujours fermée quand on peut annuler, et l'undo est impossible hors
// `playing` — le récap est terminal.
export interface GameSnapshot {
  player1: Player
  player2: Player
  activePlayer: PlayerId
  reprises: Reprise[]
  scoreAdjustments: { player1: number; player2: number }
  currentInput: { player1: string; player2: string }
  sidesSwapped: boolean
  equalizingReprise: boolean
}

// Exhaustif par construction : les clés proviennent du même catalogue que l'union `GameMode`.
export const GAME_MODE_LABELS = Object.fromEntries(
  CATALOG.flatMap((category) => category.modes.map((mode) => [mode.id, mode.label])),
) as Record<GameMode, string>

export function isCategoryAvailable(category: GameCategoryDescriptor): boolean {
  return category.modes.some((mode) => mode.available)
}
