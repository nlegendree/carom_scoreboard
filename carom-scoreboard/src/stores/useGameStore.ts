import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { GameMode, GameStatus, Player, Reprise } from '../types/game'

const DEFAULT_MODE: GameMode = 'libre'
// Plafond de saisie repris de la contrainte de série (FR7) : une distance de 4 chiffres
// n'a pas de réalité en carambole. 0 signifie « distance libre » (aucun objectif).
const MAX_TARGET_SCORE = 999
// Plafond de la saisie d'une série, en NOMBRE DE CHIFFRES (FR7 : 999 points au plus).
// Définition unique, exportée : `ScoreEntryModal` l'importe pour décider localement de
// l'accusé de réception ou du refus, au lieu de réécrire la règle dans son template.
export const MAX_SCORE_DIGITS = 3

export interface TargetScores {
  player1: number
  player2: number
}

const NO_TARGET_SCORES: TargetScores = { player1: 0, player2: 0 }

// Garde placée dans l'action et non dans le composant (AR17) : la modale n'est pas le
// seul appelant possible de `startGame`, la normalisation doit valoir pour tous.
function normalizeTargetScore(raw: number): number {
  if (!Number.isFinite(raw)) return 0
  return Math.min(Math.max(Math.trunc(raw), 0), MAX_TARGET_SCORE)
}

function makePlayer(id: 'player1' | 'player2'): Player {
  return {
    id,
    name: '',
    score: 0,
    color: id === 'player1' ? 'white' : 'yellow',
    targetScore: 0,
  }
}

export const useGameStore = defineStore('game', () => {
  const mode = ref<GameMode>(DEFAULT_MODE)
  const status = ref<GameStatus>('idle')
  const player1 = ref<Player>(makePlayer('player1'))
  const player2 = ref<Player>(makePlayer('player2'))
  const activePlayer = ref<'player1' | 'player2'>('player1')
  // AR9 : `shallowRef` évite la réactivité profonde sur les sessions longues.
  // Conséquence à respecter impérativement : toute évolution de `reprises` doit REMPLACER
  // le tableau (`reprises.value = [...reprises.value, r]`), jamais le muter — un `push`
  // ne déclencherait aucun recalcul des `computed` qui en dépendent (Story 1.5/1.8).
  const reprises = shallowRef<Reprise[]>([])
  const currentInput = ref({ player1: '', player2: '' })
  const isNegative = ref({ player1: false, player2: false })
  // Corrections manuelles du total, tenues À PART des reprises : ce sont des rattrapages
  // d'arbitrage, pas des séries. Les garder séparées est ce qui permet de corriger un
  // score sans toucher au déroulé de la partie — ni reprise, ni tour, ni meilleure série.
  const scoreAdjustments = ref({ player1: 0, player2: 0 })
  const startedAt = ref<number | null>(null)
  const lastSaved = ref('')

  // Le 4e paramètre reste optionnel : sans réglage de format, le parcours de démarrage
  // de la Story 1.3 est strictement inchangé et les deux joueurs jouent en distance
  // libre. La distance appartient au joueur (handicap), pas à la partie.
  function startGame(
    newMode: GameMode,
    player1Name: string,
    player2Name: string,
    targetScores: TargetScores = NO_TARGET_SCORES,
  ): void {
    mode.value = newMode
    player1.value = {
      ...makePlayer('player1'),
      name: player1Name,
      targetScore: normalizeTargetScore(targetScores.player1),
    }
    player2.value = {
      ...makePlayer('player2'),
      name: player2Name,
      targetScore: normalizeTargetScore(targetScores.player2),
    }
    status.value = 'playing'
    activePlayer.value = 'player1'
    reprises.value = []
    startedAt.value = Date.now()
    currentInput.value = { player1: '', player2: '' }
    isNegative.value = { player1: false, player2: false }
    scoreAdjustments.value = { player1: 0, player2: 0 }
    lastSaved.value = new Date().toISOString()
  }

  // La bille reste attachée au côté (gauche blanc, droite jaune) : intervertir les billes
  // consiste donc à échanger les joueurs de côté, pas à repeindre les panneaux.
  // Le spread transporte tout ce qui appartient au joueur — nom, score et distance —
  // et seuls `id`/`color`, attachés au côté, sont réécrits.
  // Le tour reste lui aussi attaché au côté : `activePlayer` n'est volontairement pas
  // déplacé (règle produit arrêtée en revue de la Story 1.3 — le joueur de gauche commence).
  // Disponible pendant TOUTE la partie depuis le 2026-09-09 (le bouton ÉCHANGER ne
  // disparaît plus à la première série). Conséquence directe : `reprises` range les séries
  // par CÔTÉ et le score en est recalculé — sans permuter aussi les colonnes, chaque joueur
  // hériterait de l'historique de l'autre, et donc de son total, de sa moyenne et de sa
  // meilleure série.
  function swapPlayers(): void {
    if (status.value !== 'playing') return

    reprises.value = reprises.value.map((reprise) => ({
      player1: reprise.player2,
      player2: reprise.player1,
      timestamp: reprise.timestamp,
    }))

    const previousPlayer1 = player1.value

    player1.value = { ...player2.value, id: 'player1', color: 'white' }
    player2.value = { ...previousPlayer1, id: 'player2', color: 'yellow' }
    currentInput.value = {
      player1: currentInput.value.player2,
      player2: currentInput.value.player1,
    }
    isNegative.value = {
      player1: isNegative.value.player2,
      player2: isNegative.value.player1,
    }
    scoreAdjustments.value = {
      player1: scoreAdjustments.value.player2,
      player2: scoreAdjustments.value.player1,
    }
    lastSaved.value = new Date().toISOString()
  }

  // --- Saisie d'une série au pavé numérique (Story 1.5) ---

  function playerRef(playerId: 'player1' | 'player2') {
    return playerId === 'player1' ? player1 : player2
  }

  // Décision 5 : `reprises` est la source de vérité unique du score. Le total est une
  // SOMME recalculée, jamais un `score += value` — c'est ce qui rendra l'annulation
  // (Story 1.8) exacte sans arithmétique inverse, et la saisie négative (1.9) sans cas
  // particulier.
  function recomputeScore(playerId: 'player1' | 'player2'): void {
    const total = reprises.value.reduce((sum, reprise) => sum + (reprise[playerId] ?? 0), 0)
    playerRef(playerId).value = {
      ...playerRef(playerId).value,
      score: total + scoreAdjustments.value[playerId],
    }
  }

  // Correction manuelle du total (boutons − / + du panneau). Volontairement NON bornée :
  // un score peut légitimement descendre sous zéro au carambole (pénalités, Story 1.9).
  // Garde `playing` comme `swapPlayers` : hors partie, aucune action ne doit muter l'état
  // (revue de code du 2026-09-09, appliqué à toutes les actions de jeu ci-dessous).
  function adjustScore(playerId: 'player1' | 'player2', delta: number): void {
    if (status.value !== 'playing') return
    scoreAdjustments.value[playerId] += delta
    recomputeScore(playerId)
    lastSaved.value = new Date().toISOString()
  }

  // Retourne `false` quand la frappe est REFUSÉE (plafond atteint). La garde vit ici,
  // dans l'action (AR17), et non dans le template. Note : l'UI ne lit pas ce retour —
  // `ScoreEntryModal` décide du refus localement à partir de `MAX_SCORE_DIGITS` pour que
  // l'haptique reste synchrone (NFR1) ; le booléen reste le contrat de l'action pour tout
  // autre appelant (pilotage déporté V2+).
  function appendScoreDigit(playerId: 'player1' | 'player2', digit: number): boolean {
    if (status.value !== 'playing') return false
    const buffer = currentInput.value[playerId]
    if (buffer.length >= MAX_SCORE_DIGITS) return false

    // AC11 : `0` puis `7` donne `7`, jamais `07`. À l'inverse de la DISTANCE (Story 1.4),
    // une SÉRIE de 0 est le cas le plus fréquent au carambole : le buffer `'0'` est une
    // valeur légitime, simplement remplacée par le chiffre suivant.
    currentInput.value[playerId] = buffer === '0' ? String(digit) : buffer + String(digit)
    return true
  }

  function clearScoreInput(playerId: 'player1' | 'player2'): void {
    currentInput.value[playerId] = ''
  }

  function backspaceScoreInput(playerId: 'player1' | 'player2'): void {
    currentInput.value[playerId] = currentInput.value[playerId].slice(0, -1)
  }

  // Seule action qui modifie le score (UX-DR23) : elle reste pilotable à distance en V2+.
  // Remplissage : la dernière reprise est COMPLÉTÉE si elle attend encore ce joueur,
  // sinon une nouvelle reprise est ouverte — l'ordre de saisie n'a donc pas d'importance
  // (Décision 3 : valider depuis le panneau qui n'a pas la main reste cohérent).
  // AR9 : le tableau est REMPLACÉ, jamais muté — un `push` sur ce `shallowRef` figerait
  // le compteur REPRISE et `ANNULER`.
  // Primitive volontairement NON gardée par `status` : c'est le point d'entrée bas niveau
  // (tests, pilotage déporté V2+). Les gardes vivent sur les actions de GESTE qui
  // l'appellent (`validateScoreInput`, `passTurn`) et sur les autres mutations de jeu.
  function addReprise(playerId: 'player1' | 'player2', value: number): void {
    const last = reprises.value[reprises.value.length - 1]

    if (last !== undefined && last[playerId] === null) {
      reprises.value = reprises.value.map((reprise, index) =>
        index === reprises.value.length - 1 ? { ...reprise, [playerId]: value } : reprise,
      )
    } else {
      reprises.value = [
        ...reprises.value,
        {
          player1: playerId === 'player1' ? value : null,
          player2: playerId === 'player2' ? value : null,
          timestamp: Date.now(),
        },
      ]
    }

    recomputeScore(playerId)
  }

  // Action publique et nommée (UX-DR23, AR15) : la bascule manuelle au tap du mode
  // 3 Bandes (Epic 2) et un pilotage déporté (V2+) s'y brancheront. Rien de spécifique
  // au JDS ici.
  function switchTurn(): void {
    if (status.value !== 'playing') return
    activePlayer.value = activePlayer.value === 'player1' ? 'player2' : 'player1'
  }

  // Chemin unique de validation : le bouton `VALIDER` et l'auto-validation à 3 s appellent
  // tous deux CETTE action, ce qui garantit qu'ils aboutissent au même état (AC9, AC13).
  // Décision 6 : rentrer sa série EST l'acte de rendre la main.
  function validateScoreInput(playerId: 'player1' | 'player2'): void {
    if (status.value !== 'playing') return
    const buffer = currentInput.value[playerId]
    // AC12 : no-op strict sur un buffer vide — ni série fantôme, ni bascule de tour.
    if (buffer === '') return

    addReprise(playerId, Number(buffer))
    currentInput.value[playerId] = ''
    switchTurn()
    lastSaved.value = new Date().toISOString()
  }

  // Rendre la main SANS marquer (décision produit du 2026-09-09) : le joueur tape la zone
  // de l'adversaire au lieu de saisir `0` au pavé. Le raccourci porte sur le geste, pas sur
  // le modèle — une reprise blanchie reste une reprise jouée, et doit compter dans la
  // moyenne. Ne rien enregistrer ferait monter artificiellement la moyenne du joueur.
  function passTurn(): void {
    if (status.value !== 'playing') return
    addReprise(activePlayer.value, 0)
    switchTurn()
    lastSaved.value = new Date().toISOString()
  }

  // Nombre de reprises effectivement jouées par un joueur : celles où sa case est
  // renseignée. Une reprise ouverte par l'adversaire et qu'il n'a pas encore jouée n'entre
  // pas dans son compte (Décision 7 — la moyenne se fige quand le joueur rend la main).
  function playedReprises(playerId: 'player1' | 'player2'): number {
    return reprises.value.filter((reprise) => reprise[playerId] !== null).length
  }

  // Moyenne de la partie en cours : points marqués ÷ reprises jouées.
  const averages = computed(() => ({
    player1: playedReprises('player1') === 0 ? 0 : player1.value.score / playedReprises('player1'),
    player2: playedReprises('player2') === 0 ? 0 : player2.value.score / playedReprises('player2'),
  }))

  // Meilleure série de la partie en cours, 0 tant qu'aucune n'a été jouée.
  function bestSeriesOf(playerId: 'player1' | 'player2'): number {
    const played = reprises.value
      .map((reprise) => reprise[playerId])
      .filter((value): value is number => value !== null)
    return played.length === 0 ? 0 : Math.max(...played)
  }

  const bestSeries = computed(() => ({
    player1: bestSeriesOf('player1'),
    player2: bestSeriesOf('player2'),
  }))

  // AC15 : la reprise est ouverte par le joueur BLANC. Seules les reprises où les deux
  // joueurs ont joué sont terminées — le numéro affiché s'en déduit (`GameView`).
  const completedReprises = computed(
    () =>
      reprises.value.filter((reprise) => reprise.player1 !== null && reprise.player2 !== null)
        .length,
  )

  // Retour à l'accueil : la Story 1.15 y ajoutera la confirmation avant abandon.
  // Restaure l'intégralité de l'état initial pour qu'aucune valeur de la partie précédente
  // (mode, distances de jeu) ne soit silencieusement reconduite au démarrage suivant :
  // les distances repassent par `makePlayer()`, qui les remet à 0.
  function resetGame(): void {
    mode.value = DEFAULT_MODE
    status.value = 'idle'
    player1.value = makePlayer('player1')
    player2.value = makePlayer('player2')
    activePlayer.value = 'player1'
    reprises.value = []
    currentInput.value = { player1: '', player2: '' }
    isNegative.value = { player1: false, player2: false }
    scoreAdjustments.value = { player1: 0, player2: 0 }
    startedAt.value = null
    lastSaved.value = ''
  }

  return {
    mode,
    status,
    player1,
    player2,
    activePlayer,
    reprises,
    currentInput,
    isNegative,
    startedAt,
    lastSaved,
    completedReprises,
    averages,
    bestSeries,
    startGame,
    swapPlayers,
    resetGame,
    appendScoreDigit,
    clearScoreInput,
    backspaceScoreInput,
    addReprise,
    switchTurn,
    passTurn,
    adjustScore,
    validateScoreInput,
  }
})
