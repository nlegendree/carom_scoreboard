import type { GameState } from '../types/game'

// Persistance de la partie en cours (Story 1.12, FR6/NFR5/AR4). Filet de sécurité pour
// une tablette qui tourne 24 h/24 : ce que le rechargement de la PWA (mise à jour du
// Service Worker, `⌘R`, onglet tué par l'OS) ne doit jamais faire perdre.
// SEUL point de contact avec `localStorage` de toute l'application : le store y écrit
// via un watcher et y lit dans `checkSavedGame` (appelée par `main.ts` avant le montage),
// et personne d'autre (AR12 — `try/catch` + `console.error` ici, jamais dans le store ni
// un composant : la partie continue en mémoire, sans message au joueur).

// Changer la clé sans migration ferait perdre la partie sauvegardée à la mise à jour.
export const GAME_STORAGE_KEY = '1score:game'
// Clé d'avant le renommage (Story 10.6). Ce qu'elle contient est une sauvegarde en version
// 1, inexploitable depuis la 10.3 : elle n'est pas migrée, seulement PURGÉE au premier
// chargement, pour ne pas laisser une entrée orpheline sur chaque tablette (revue de fin
// d'Epic 10). À retirer avec ce commentaire une fois toutes les tablettes passées.
export const LEGACY_GAME_STORAGE_KEY = 'carom-scoreboard:game'
// Enveloppe versionnée : une autre version est jetée, pas migrée (rien à migrer pour un
// filet de sécurité — la partie perdue est celle du rechargement qui suit une mise à jour
// incompatible, et c'est acceptable). RÈGLE : tout changement de forme de `GameState`
// (champ ajouté, retiré, retypé) INCRÉMENTE cette version — la garde ci-dessous ne
// vérifie qu'un sous-ensemble de champs, une sauvegarde d'une forme antérieure passerait
// et `resumeGame` poserait `undefined` dans une ref typée (revue 1.12).
// Version 2 depuis la Story 10.3 : `GameState` gagne `whiteSide`, perd `sidesSwapped`, et
// `Player` perd son `id`. Une sauvegarde en version 1 est donc écartée au lancement —
// aucune pop-up « PARTIE EN COURS » n'est proposée, l'entrée est supprimée.
export const GAME_STORAGE_VERSION = 2

export interface PersistedGame {
  version: number
  savedAt: number
  state: GameState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Garde STRUCTURELLE minimale, sans Zod (décision de Nathan, 2026-09-10 : dev rapide) :
// version, statut restaurable et présence/forme des champs que `resumeGame` va assigner
// tels quels. Elle protège d'un JSON étranger ou d'une forme d'une version antérieure
// (`isNegative`, pile absente…), pas d'une valeur incohérente à l'intérieur d'un champ.
function isPersistedGame(value: unknown): value is PersistedGame {
  if (!isRecord(value) || value.version !== GAME_STORAGE_VERSION) return false
  const state = value.state
  if (!isRecord(state)) return false
  return (
    (state.status === 'playing' || state.status === 'finished') &&
    isRecord(state.player1) &&
    isRecord(state.player2) &&
    Array.isArray(state.reprises) &&
    Array.isArray(state.history) &&
    isRecord(state.scoreAdjustments) &&
    isRecord(state.currentInput) &&
    (state.whiteSide === 'left' || state.whiteSide === 'right') &&
    typeof state.equalizingReprise === 'boolean' &&
    typeof state.entryOpen === 'boolean'
  )
}

export function saveGameState(state: GameState): void {
  try {
    const persisted: PersistedGame = {
      version: GAME_STORAGE_VERSION,
      savedAt: Date.now(),
      state,
    }
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(persisted))
  } catch (e) {
    console.error('[storage] saveGameState failed:', e)
    // Une écriture qui échoue (quota) échouera aussi aux actions suivantes : l'entrée
    // précédente serait proposée au rechargement comme « PARTIE EN COURS » avec N actions
    // de retard, sans aucun signal. Rien de périmé n'est jamais proposé : on la supprime,
    // le filet disparaît pour cette partie seulement (décision de Nathan, revue 1.12).
    clearGameState()
  }
}

// Un JSON corrompu est une sauvegarde illisible parmi d'autres, pas une panne du
// stockage : il rejoint la garde structurelle au lieu du `catch` de `loadGameState`.
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

// `null` = rien à reprendre. Une sauvegarde ILLISIBLE (JSON corrompu, version inconnue,
// forme inattendue, `idle`) est supprimée au passage avec un `console.warn` : sinon
// chaque lancement réavertirait. Un stockage qui LÈVE (navigation privée, API absente)
// est une erreur, `console.error`.
export function loadGameState(): GameState | null {
  let raw: string | null
  try {
    localStorage.removeItem(LEGACY_GAME_STORAGE_KEY)
    raw = localStorage.getItem(GAME_STORAGE_KEY)
  } catch (e) {
    console.error('[storage] loadGameState failed:', e)
    return null
  }
  if (raw === null) return null

  const parsed = parseJson(raw)
  if (!isPersistedGame(parsed)) {
    console.warn('[storage] unreadable saved game dropped')
    clearGameState()
    return null
  }
  return parsed.state
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(GAME_STORAGE_KEY)
  } catch (e) {
    console.error('[storage] clearGameState failed:', e)
  }
}
