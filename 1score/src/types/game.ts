export type GameStatus = 'idle' | 'playing' | 'finished'

// BILLE, pas côté ni personne (Story 10.3) : `player1` est TOUJOURS le joueur à la bille
// BLANCHE, `player2` celui à la jaune — c'est le blanc qui ouvre la partie et les reprises
// (AR24), quel que soit le côté où sa carte est posée à l'écran. Le côté d'affichage est
// dit par `GameState.whiteSide` et par lui seul : aucune règle de calcul n'en dépend.
// Introduit en Story 1.10 pour remplacer l'union littérale répétée ; adopté dans le nouveau
// code et les signatures touchées, sans chasse exhaustive.
export type PlayerId = 'player1' | 'player2'

// Pop-up de décision attendue en fin de partie (Story 1.10). Portée par le store et non
// par la vue : un pilotage déporté (V2+) la voit, et la persistance (1.12) pourra la
// restaurer. `equalizing-offer` : le blanc a atteint sa distance, le jaune a droit à la
// reprise égalisatrice. `over` : la partie est jouée, `winner` à `null` signifie égalité.
// `revertible` (revue de fin d'Epic 10, décision de Nathan) : la fin a été atteinte par une
// CORRECTION `+`, pas par une série — la pop-up offre alors `ANNULER`, qui défait le `+` et
// rend le scoreboard. Absent (et non `false`) sur une fin par série : champ OPTIONNEL,
// donc sans incidence sur `GAME_STORAGE_VERSION` — une sauvegarde antérieure le lit
// `undefined`, ce que `resumeGame` pose sans casser aucun type.
export type EndPrompt =
  | { kind: 'equalizing-offer'; revertible?: true }
  | { kind: 'over'; winner: PlayerId | null; revertible?: true }

// La bille est l'identité du joueur dans la partie : `player1` est blanc, `player2` jaune,
// et ça ne bouge plus une fois la partie démarrée (Story 10.3 — `ÉCHANGER` a disparu du
// scoreboard). Le paramétrage, lui, laisse choisir qui prend quelle bille et de quel côté
// il s'assied, avant le démarrage.
export type PlayerColor = 'white' | 'yellow'

// Côté de l'écran où la carte de la bille blanche est posée (Story 10.3, AR24). Champ
// d'AFFICHAGE : il ordonne les colonnes du scoreboard et du récap, rien d'autre.
export type TableSide = 'left' | 'right'

// Catalogue déclaratif des modes, et source de vérité unique des unions `GameCategoryId`
// et `GameMode` : elles en sont dérivées plus bas, ce qui rend impossible l'ajout d'un mode
// à l'union sans entrée correspondante dans le catalogue (et donc sans libellé).
// `available` ne décrit que ce dont l'accueil a besoin : les règles de score propres à
// chaque mode arriveront avec leur story dédiée, pas ici.
const CATALOG = [
  {
    id: 'series',
    label: 'JEUX DE SÉRIES',
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
    modes: [{ id: '3bandes', label: '3 BANDES', available: true }],
  },
  {
    id: 'quilles',
    label: 'QUILLES',
    modes: [
      { id: 'quilles-5', label: '5 QUILLES', available: false },
      { id: 'quilles-9', label: '9 QUILLES', available: false },
    ],
  },
  {
    id: 'casin',
    label: 'CASIN',
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
  modes: readonly GameModeDescriptor[]
}

export const GAME_CATEGORIES: readonly GameCategoryDescriptor[] = CATALOG

export interface Player {
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
  // Côté d'affichage de la bille blanche, choisi au paramétrage (Story 10.3). Persisté
  // pour que la reprise après fermeture replace les joueurs là où ils étaient assis. Il ne
  // change JAMAIS en cours de partie : il n'entre donc pas dans le snapshot d'annulation.
  whiteSide: TableSide
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
// tout ce que les trois actions (série, main rendue, correction) peuvent toucher. Rien de
// plus : `mode`, `status`, `startedAt` ne bougent jamais en cours de partie, et depuis la
// Story 10.3 `whiteSide` non plus — l'undo redevient une restauration directe, sans mise
// en miroir. La pile de ces snapshots fait partie de `GameState`
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
  equalizingReprise: boolean
}

// Exhaustif par construction : les clés proviennent du même catalogue que l'union `GameMode`.
export const GAME_MODE_LABELS = Object.fromEntries(
  CATALOG.flatMap((category) => category.modes.map((mode) => [mode.id, mode.label])),
) as Record<GameMode, string>

export function isCategoryAvailable(category: GameCategoryDescriptor): boolean {
  return category.modes.some((mode) => mode.available)
}
