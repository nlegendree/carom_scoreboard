// Scènes adressables par `?scene=<id>` — Story 11.4, décision de Nathan du 2026-09-17.
//
// POURQUOI. L'application n'a qu'une route (`/`) et enchaîne ses douze écrans par ÉTAT.
// Le détecteur Impeccable charge une URL et scanne à la fin du chargement : il n'a ni
// option d'attente ni sélecteur à guetter. Sans adressage, `design:check` mesurerait douze
// fois l'accueil en croyant mesurer le scoreboard, et rendrait « 0 constat » — un placebo.
//
// POURQUOI AVANT LE PREMIER RENDU. Une scène atteinte par des `pointerdown` différés serait
// scannée AVANT d'exister. La part store s'applique donc dans `main.ts` avant `app.mount()`,
// et la part écran se sème UNE FOIS au `setup` de son hôte — jamais dans un `watch`, jamais
// dans un `onMounted` asynchrone.
//
// INERTE EN PRODUCTION. Ce module ne se protège pas lui-même : la garde `import.meta.env.DEV`
// est posée par chaque APPELANT, au plus près du point d'entrée. `import.meta.env.DEV` est
// remplacé statiquement à la compilation : `if (false) { … }` disparaît, l'import devient
// inutilisé, et le module entier sort du bundle. Une garde posée ICI, derrière un appel de
// fonction, laisserait la table des scènes dans `dist/` (preuve : `grep` sur `dist/assets`
// après `npm run build`, vérifié par `scenes.test.ts`).
//
// `src/stores/` EST INTOUCHABLE sur toute l'Epic 11 : une scène n'appelle que des actions
// publiques existantes. Si une scène semble exiger une action nouvelle, c'est la scène qui
// est mal choisie.
import {
  GAME_CATEGORIES,
  type GameCategoryDescriptor,
  type GameMode,
  type PlayerColor,
  type TableSide,
} from '../types/game'

// Les douze identifiants sont EXACTEMENT les noms de capture du harnais
// (`scripts/render-static.cjs`) et les valeurs attendues par `scripts/design-check.sh` :
// un seul vocabulaire pour les scènes, les scans et les captures.
export const SCENE_IDS = [
  '01-accueil',
  '02-jds',
  '03-parametrage-vide',
  '04-popup-clavier-alpha',
  '05-popup-pave-numerique',
  '06-parametrage-rempli',
  '07-scoreboard-jds',
  '08-popup-saisie-serie',
  '09-scoreboard-jds-en-partie',
  '10-popup-decision',
  '11-recap',
  '12-scoreboard-3bandes',
] as const

export type SceneId = (typeof SCENE_IDS)[number]

// --- Part ÉCRAN D'ACCUEIL (scènes 01 à 06) ---------------------------------------------
// Décalque des refs locales de `HomeScreen` (`:105-134`). Champs OPTIONNELS : une scène ne
// dit que ce qu'elle change, l'hôte garde ses valeurs par défaut pour le reste.
export interface HomeSceneState {
  step?: 'category' | 'mode' | 'players'
  selectedCategory?: GameCategoryDescriptor | null
  selectedMode?: GameMode
  players?: Record<PlayerColor, { name: string; distance: string }>
  whiteSide?: TableSide
  entry?: { ball: PlayerColor; field: 'name' | 'distance' } | null
  draft?: string
  distanceError?: boolean
  cadrePromptOpen?: boolean
}

// --- Part VUE DE PARTIE (scène 10) ------------------------------------------------------
// `exitPromptOpen` est un état LOCAL de `GameView` (`:219`) : l'ouverture d'une confirmation
// n'est pas un état de partie et ne vit pas dans le store.
export interface GameSceneState {
  exitPromptOpen?: boolean
}

// Ce qu'une scène pose sur le store, exprimé en APPELS D'ACTIONS PUBLIQUES et non en
// mutations : `apply` reçoit le store et le pilote comme le ferait un composant (AR17).
interface SceneDefinition {
  home?: HomeSceneState
  game?: GameSceneState
  store?: (store: SceneStore) => void
}

// Surface du store qu'une scène a le droit d'utiliser. Structurellement typée : elle est
// satisfaite par `useGameStore()` sans l'importer, ce qui garde ce module hors de la
// dépendance au store et rend le contrat lisible — cette liste EST la promesse
// « aucune action nouvelle ».
export interface SceneStore {
  discardSavedGame: () => void
  startGame: (
    mode: GameMode,
    player1Name: string,
    player2Name: string,
    // Les DEUX distances sont obligatoires : c'est la forme de `TargetScores`, qui vit
    // dans le store et qu'on ne peut donc pas importer ici sans rendre ce module dépendant
    // de lui. La recopier en optionnel ferait échouer le build (la contravariance des
    // paramètres refuse un `number | undefined` là où le store attend un `number`).
    targetScores?: { player1: number; player2: number },
    whiteSide?: TableSide,
  ) => void
  openScoreEntry: (playerId: 'player1' | 'player2') => void
  closeScoreEntry: () => void
  appendScoreDigit: (playerId: 'player1' | 'player2', digit: number) => boolean
  validateScoreInput: (playerId: 'player1' | 'player2') => void
  incrementSeries: () => boolean
  finishGame: () => void
}

const EMPTY_PLAYERS: Record<PlayerColor, { name: string; distance: string }> = {
  white: { name: '', distance: '' },
  yellow: { name: '', distance: '' },
}
const FILLED_PLAYERS: Record<PlayerColor, { name: string; distance: string }> = {
  white: { name: 'MICHEL', distance: '30' },
  yellow: { name: 'JEAN PIERRE', distance: '25' },
}
const SERIES_CATEGORY = GAME_CATEGORIES.find((category) => category.id === 'series') ?? null

// Partie JDS du harnais : MICHEL 30 contre JEAN PIERRE 25, puis les séries 12, 7 et 15.
// ⚠️ `JEAN PIERRE` déborde VOLONTAIREMENT au paramétrage et au récap à 1133 (ellipse
// assumée, relevée en 11.3) : c'est un débordement attendu, pas un constat à corriger.
function startJds(store: SceneStore): void {
  store.startGame('libre', 'MICHEL', 'JEAN PIERRE', { player1: 30, player2: 25 })
}

// ⚠️ `validateScoreInput` ne REFERME PAS la pop-up : c'est l'écran qui le fait
// (`GameView.validateEntry` → `closeScoreEntry`, `:198-203`), parce qu'une saisie ouverte
// n'est pas une fin de série. Sans ce `closeScoreEntry`, les scènes 09, 10 et 11 seraient
// scannées avec le dock de saisie posé par-dessus le scoreboard — exactement le genre de
// « mauvaise chose mesurée » que l'adressage existe pour éviter. Trouvé par le test.
function playSeries(store: SceneStore, playerId: 'player1' | 'player2', value: number): void {
  store.openScoreEntry(playerId)
  for (const digit of String(value)) store.appendScoreDigit(playerId, Number(digit))
  store.validateScoreInput(playerId)
  store.closeScoreEntry()
}

// Le parcours du harnais valide 12 (blanc), 7 (jaune) puis 15 (blanc) : les séries
// alternent parce que `validateScoreInput` rend la main.
function playThreeSeries(store: SceneStore): void {
  playSeries(store, 'player1', 12)
  playSeries(store, 'player2', 7)
  playSeries(store, 'player1', 15)
}

const SCENES: Record<SceneId, SceneDefinition> = {
  '01-accueil': {},
  '02-jds': { home: { step: 'mode', selectedCategory: SERIES_CATEGORY } },
  '03-parametrage-vide': {
    home: { step: 'players', selectedMode: 'libre', players: EMPTY_PLAYERS },
  },
  '04-popup-clavier-alpha': {
    home: {
      step: 'players',
      selectedMode: 'libre',
      players: EMPTY_PLAYERS,
      entry: { ball: 'white', field: 'name' },
      draft: 'MICHEL',
    },
  },
  '05-popup-pave-numerique': {
    home: {
      step: 'players',
      selectedMode: 'libre',
      players: { white: { name: 'MICHEL', distance: '' }, yellow: { name: '', distance: '' } },
      entry: { ball: 'white', field: 'distance' },
      draft: '30',
    },
  },
  '06-parametrage-rempli': {
    home: { step: 'players', selectedMode: 'libre', players: FILLED_PLAYERS },
  },
  '07-scoreboard-jds': { store: startJds },
  '08-popup-saisie-serie': {
    store: (store) => {
      startJds(store)
      store.openScoreEntry('player1')
      store.appendScoreDigit('player1', 1)
      store.appendScoreDigit('player1', 2)
    },
  },
  '09-scoreboard-jds-en-partie': {
    store: (store) => {
      startJds(store)
      playThreeSeries(store)
    },
  },
  // La pop-up de décision est l'état 09 plus l'ouverture locale de `GameView` : le store
  // n'en sait rien, et c'est voulu (une confirmation n'est pas un état de partie).
  '10-popup-decision': {
    store: (store) => {
      startJds(store)
      playThreeSeries(store)
    },
    game: { exitPromptOpen: true },
  },
  '11-recap': {
    store: (store) => {
      startJds(store)
      playThreeSeries(store)
      store.finishGame()
    },
  },
  '12-scoreboard-3bandes': {
    store: (store) => {
      store.startGame('3bandes', 'MICHEL', 'JEAN PIERRE', { player1: 15, player2: 15 })
      store.incrementSeries()
      store.incrementSeries()
      store.incrementSeries()
    },
  },
}

const isSceneId = (value: string | null): value is SceneId =>
  value !== null && (SCENE_IDS as readonly string[]).includes(value)

// Lit `?scene=` dans l'URL courante. Rend `null` sur un identifiant inconnu comme sur une
// URL sans paramètre : une faute de frappe rend l'accueil ordinaire, jamais une erreur.
// ⚠️ NE PORTE PAS la garde `import.meta.env.DEV` — voir l'en-tête : elle appartient aux
// appelants, sinon le module survit au build.
export function readScene(): SceneId | null {
  if (typeof window === 'undefined') return null
  const value = new URLSearchParams(window.location.search).get('scene')
  return isSceneId(value) ? value : null
}

// Applique la part STORE d'une scène. Efface d'abord toute partie sauvegardée : le `watch`
// de persistance (`useGameStore.ts:709`) enregistre chaque scène jouée, et sans cet effacement
// la visite suivante poserait la pop-up `PARTIE EN COURS` PAR-DESSUS l'écran visé — le scan
// mesurerait la mauvaise chose, en silence.
export function applyStoreScene(store: SceneStore, scene: SceneId): void {
  store.discardSavedGame()
  SCENES[scene].store?.(store)
}

/**
 * Fait qu'une scène ne laisse RIEN derrière elle dans le stockage local.
 *
 * `applyStoreScene` efface la sauvegarde AVANT de poser la scène, ce qui protège la scène
 * elle-même de la pop-up `PARTIE EN COURS`. Mais le `watch` de persistance du store
 * (`useGameStore.ts:709`) enregistre chaque changement d'état au tick suivant : la scène qui
 * démarre une partie la persiste, et la visite SUIVANTE — même sans `?scene=` — rouvrait
 * `PARTIE EN COURS` par-dessus l'accueil. Autrement dit : lancer `npm run design:check`
 * polluait la session de travail d'après. Trouvé à la passe navigateur de la Story 11.4.
 *
 * ⚠️ `discardSavedGame()` NE PEUT PAS servir ici : c'est un no-op dès que `status !== 'idle'`
 * (`useGameStore.ts:759`), garde volontaire pour qu'on ne jette pas une partie en cours — et
 * une scène de scoreboard est précisément « en cours ». L'appelant passe donc l'effacement
 * qu'il veut : `clearGameState` de la couche service, jamais une action de store nouvelle
 * (`src/stores/` est intouchable sur toute l'Epic 11).
 *
 * ⚠️ `pagehide` et non `beforeunload` : Safari/iOS ne déclenche pas fiablement le second, et
 * `beforeunload` peut faire surgir une demande de confirmation. Le store, lui, n'écoute
 * volontairement NI l'un NI l'autre (`useGameStore.ts:706`) — c'est un besoin d'outillage,
 * pas de produit, et il vit ici. Rien n'entre en production : l'appelant garde tout par
 * `import.meta.env.DEV`.
 */
export function keepSceneOutOfStorage(clear: () => void): void {
  if (typeof window === 'undefined') return
  window.addEventListener('pagehide', clear)
}

// Part ÉCRAN, à semer une fois au `setup` de l'hôte concerné.
export function homeSceneState(scene: SceneId): HomeSceneState | null {
  return SCENES[scene].home ?? null
}

export function gameSceneState(scene: SceneId): GameSceneState | null {
  return SCENES[scene].game ?? null
}
