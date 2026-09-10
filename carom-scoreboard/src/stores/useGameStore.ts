import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type {
  EndPrompt,
  GameMode,
  GameSnapshot,
  GameStatus,
  Player,
  PlayerId,
  Reprise,
} from '../types/game'

const DEFAULT_MODE: GameMode = 'libre'
// Plafond de saisie repris de la contrainte de série (FR7) : une distance de 4 chiffres
// n'a pas de réalité en carambole. 0 signifie « distance libre » (aucun objectif).
const MAX_TARGET_SCORE = 999
// Plafond de la saisie d'une série, en NOMBRE DE CHIFFRES (FR7 : 999 points au plus).
// Définition unique, exportée : `ScoreEntryModal` l'importe pour décider localement de
// l'accusé de réception ou du refus, au lieu de réécrire la règle dans son template.
export const MAX_SCORE_DIGITS = 3
// Profondeur maximale de la pile d'annulation (Story 1.7) : hygiène mémoire pour les
// sessions de 8 h (NFR3). Un snapshot ne porte que des références (joueurs, reprises) et
// trois petits objets copiés : 1000 reste négligeable, et couvre toute partie réaliste
// même à une action par point (corrections `+`, 3 Bandes de l'Epic 2) — relevé de 200 à
// 1000 en revue du 2026-09-09. Le plus ancien snapshot est abandonné en silence.
const MAX_UNDO_DEPTH = 1000

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

function makePlayer(id: PlayerId): Player {
  return {
    id,
    name: '',
    score: 0,
    color: id === 'player1' ? 'white' : 'yellow',
    targetScore: 0,
  }
}

// Ré-exprime un snapshot dans des coordonnées de côtés inversées (Story 1.7, Décision 7).
// Sert à restaurer un snapshot pris AVANT un `ÉCHANGER` sans défaire l'échange : les
// joueurs restent où ils sont, seul l'état de jeu recule. Même permutation que
// `swapPlayers` (colonnes, joueurs restampés, buffers, corrections) — à une différence
// près, voulue : `activePlayer` est inversé lui aussi, car c'est le MÊME joueur qui
// retrouve la main, simplement de l'autre côté. Ne pas « harmoniser » les deux : l'échange
// en direct déplace des joueurs sous un tour attaché au côté ; le miroir traduit un état.
// Fonction pure, exportée pour être testée seule.
export function mirrorSnapshot(snapshot: GameSnapshot): GameSnapshot {
  return {
    player1: { ...snapshot.player2, id: 'player1', color: 'white' },
    player2: { ...snapshot.player1, id: 'player2', color: 'yellow' },
    activePlayer: snapshot.activePlayer === 'player1' ? 'player2' : 'player1',
    reprises: snapshot.reprises.map((reprise) => ({
      player1: reprise.player2,
      player2: reprise.player1,
      timestamp: reprise.timestamp,
    })),
    scoreAdjustments: {
      player1: snapshot.scoreAdjustments.player2,
      player2: snapshot.scoreAdjustments.player1,
    },
    currentInput: {
      player1: snapshot.currentInput.player2,
      player2: snapshot.currentInput.player1,
    },
    isNegative: {
      player1: snapshot.isNegative.player2,
      player2: snapshot.isNegative.player1,
    },
    sidesSwapped: !snapshot.sidesSwapped,
    // Fait de jeu attaché au côté droit, pas à une personne : recopié tel quel.
    equalizingReprise: snapshot.equalizingReprise,
  }
}

export const useGameStore = defineStore('game', () => {
  const mode = ref<GameMode>(DEFAULT_MODE)
  const status = ref<GameStatus>('idle')
  const player1 = ref<Player>(makePlayer('player1'))
  const player2 = ref<Player>(makePlayer('player2'))
  const activePlayer = ref<PlayerId>('player1')
  // AR9 : `shallowRef` évite la réactivité profonde sur les sessions longues.
  // Conséquence à respecter impérativement : toute évolution de `reprises` doit REMPLACER
  // le tableau (`reprises.value = [...reprises.value, r]`), jamais le muter — un `push`
  // ne déclencherait aucun recalcul des `computed` qui en dépendent (Story 1.5/1.7).
  const reprises = shallowRef<Reprise[]>([])
  const currentInput = ref({ player1: '', player2: '' })
  const isNegative = ref({ player1: false, player2: false })
  // Corrections manuelles du total, tenues À PART des reprises : ce sont des rattrapages
  // d'arbitrage, pas des séries. Les garder séparées est ce qui permet de corriger un
  // score sans toucher au déroulé de la partie — ni reprise, ni tour, ni meilleure série.
  const scoreAdjustments = ref({ player1: 0, player2: 0 })
  const startedAt = ref<number | null>(null)
  const lastSaved = ref('')

  // --- Fin de partie (Story 1.10) ---
  const winner = ref<PlayerId | null>(null)
  const finishedAt = ref<number | null>(null)
  // ⚠️ Porte sur le CÔTÉ DROIT (`player2`), pas sur une personne — cohérent avec le tour
  // attaché au côté (Décision 15 de la 1.5). `swapPlayers` est donc BLOQUÉ tant qu'elle
  // dure (revue 1.10, décision de Nathan du 2026-09-10) : sinon le joueur déjà à sa
  // distance passerait à droite, sa série serait plafonnée à 0 et `checkEndOfGame`
  // déclarerait une égalité fantôme. Dans le snapshot (AC9) : annuler la série gagnante
  // du blanc défait l'offre. Conservé tel quel en `finished` : il dit si la partie s'est
  // jouée jusqu'à l'égalisatrice (historique 3.1, persistance 1.12).
  const equalizingReprise = ref(false)
  // Pop-up de décision attendue ; `null` = aucune. Vit ici et non dans la vue pour qu'un
  // pilotage déporté (V2+) la voie et que la 1.12 puisse la persister (Décision 8).
  // Hors snapshot : toujours fermée quand on peut appuyer sur `ANNULER`.
  const endPrompt = ref<EndPrompt | null>(null)

  // --- Annulation multi-niveaux (Story 1.7) ---
  // Pile des états d'AVANT chaque action annulable ; `undoLastAction` en restaure le
  // sommet. Décision 6 : undo par snapshots, pas par inverses — exact par construction.
  // AR9 : `shallowRef` REMPLACÉ à chaque évolution, jamais `push` — un `push` figerait
  // `canUndo` sans qu'aucun test naïf ne le voie.
  const history = shallowRef<GameSnapshot[]>([])
  // Parité des côtés, basculée par `swapPlayers`. C'est ce qui empêche `ANNULER` de défaire
  // un échange par effet de bord (Décision 7) : un snapshot dont la parité diffère de la
  // parité courante est mis en miroir avant restauration. Jamais restaurée par l'undo.
  const sidesSwapped = ref(false)

  // INVARIANTE à maintenir : `player1`, `player2` et `reprises` sont capturés PAR RÉFÉRENCE
  // parce qu'ils sont toujours REMPLACÉS, jamais mutés en place (`recomputeScore`,
  // `swapPlayers`, `addReprise`, `startGame`). Toute action future qui muterait un joueur
  // ou une reprise en place (ex. renommage, Story 1.14) doit soit le remplacer, soit copier
  // ici. `scoreAdjustments`, `currentInput`, `isNegative` sont mutés en place par
  // `adjustScore` et `appendScoreDigit` : ils sont COPIÉS, à la prise comme à la restauration.
  function takeSnapshot(): GameSnapshot {
    return {
      player1: player1.value,
      player2: player2.value,
      activePlayer: activePlayer.value,
      reprises: reprises.value,
      scoreAdjustments: { ...scoreAdjustments.value },
      currentInput: { ...currentInput.value },
      isNegative: { ...isNegative.value },
      sidesSwapped: sidesSwapped.value,
      equalizingReprise: equalizingReprise.value,
    }
  }

  // Appelée en tête de chacune des TROIS actions annulables (série validée, main rendue,
  // correction), après leurs gardes — jamais dans `swapPlayers` (décision produit), ni
  // dans `addReprise`/`switchTurn` (primitives : une action = un snapshot).
  function pushHistory(): void {
    history.value = [...history.value, takeSnapshot()].slice(-MAX_UNDO_DEPTH)
  }

  const canUndo = computed(() => history.value.length > 0)

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
    history.value = []
    sidesSwapped.value = false
    winner.value = null
    finishedAt.value = null
    equalizingReprise.value = false
    endPrompt.value = null
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
  // Hors pile d'annulation (Story 1.7, décision produit) : pour revenir, on rappuie. Seule
  // la parité `sidesSwapped` est basculée, pour que les snapshots antérieurs restent
  // restaurables sans défaire l'échange.
  // Bloqué pendant la reprise égalisatrice : le drapeau est attaché au côté droit, un
  // échange ferait jouer l'égalisatrice au joueur qui vient d'atteindre sa distance.
  function swapPlayers(): void {
    if (status.value !== 'playing' || equalizingReprise.value) return

    sidesSwapped.value = !sidesSwapped.value
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

  function playerRef(playerId: PlayerId) {
    return playerId === 'player1' ? player1 : player2
  }

  // Décision 5 : `reprises` est la source de vérité unique du score. Le total est une
  // SOMME recalculée, jamais un `score += value` — c'est ce qui rend l'annulation
  // (Story 1.7) exacte sans arithmétique inverse, et la saisie négative (1.9) sans cas
  // particulier.
  function recomputeScore(playerId: PlayerId): void {
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
  // Un appui = une action annulable (Story 1.7, Décision 8) : cinq `+` = cinq `ANNULER`.
  function adjustScore(playerId: PlayerId, delta: number): void {
    if (status.value !== 'playing') return
    pushHistory()
    scoreAdjustments.value[playerId] += delta
    recomputeScore(playerId)
    lastSaved.value = new Date().toISOString()
  }

  // Retourne `false` quand la frappe est REFUSÉE (plafond atteint). La garde vit ici,
  // dans l'action (AR17), et non dans le template. Note : l'UI ne lit pas ce retour —
  // `ScoreEntryModal` décide du refus localement à partir de `MAX_SCORE_DIGITS` pour que
  // l'haptique reste synchrone (NFR1) ; le booléen reste le contrat de l'action pour tout
  // autre appelant (pilotage déporté V2+).
  function appendScoreDigit(playerId: PlayerId, digit: number): boolean {
    if (status.value !== 'playing') return false
    const buffer = currentInput.value[playerId]
    if (buffer.length >= MAX_SCORE_DIGITS) return false

    // AC11 : `0` puis `7` donne `7`, jamais `07`. À l'inverse de la DISTANCE (Story 1.4),
    // une SÉRIE de 0 est le cas le plus fréquent au carambole : le buffer `'0'` est une
    // valeur légitime, simplement remplacée par le chiffre suivant.
    currentInput.value[playerId] = buffer === '0' ? String(digit) : buffer + String(digit)
    return true
  }

  function clearScoreInput(playerId: PlayerId): void {
    currentInput.value[playerId] = ''
  }

  function backspaceScoreInput(playerId: PlayerId): void {
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
  function addReprise(playerId: PlayerId, value: number): void {
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
  function validateScoreInput(playerId: PlayerId): void {
    if (status.value !== 'playing') return
    const buffer = currentInput.value[playerId]
    // AC12 : no-op strict sur un buffer vide — ni série fantôme, ni bascule de tour.
    if (buffer === '') return

    // Le buffer est vidé AVANT la prise du snapshot : la saisie en cours n'est pas un
    // état de partie, et un undo qui la restaurerait ferait réapparaître `5` sous le
    // prochain chiffre tapé (`53`). Après la garde : un `VALIDER` à vide n'empile pas
    // d'action fantôme (Story 1.7).
    currentInput.value[playerId] = ''
    pushHistory()
    addReprise(playerId, capToRemainingDistance(playerId, Number(buffer)))
    switchTurn()
    checkEndOfGame(playerId)
    lastSaved.value = new Date().toISOString()
  }

  // Plafonnement à la distance restante (Story 1.10, AC7, Décision 14) : au billard on
  // s'arrête à la distance, tout au-delà est une erreur de saisie — la série enregistrée
  // est celle qui y amène, jamais plus. Le `Math.max(…, 0)` couvre un score déjà à la
  // distance (état atteignable par `dismissEndPrompt` en pilotage déporté, ou par une
  // correction `+`) : la série vaut 0.
  // Aucun plafonnement en distance libre. Dans l'action (AR17), APRÈS le snapshot :
  // l'undo restaure l'état d'avant la série plafonnée. `passTurn` (série de 0) n'a rien
  // à plafonner.
  function capToRemainingDistance(playerId: PlayerId, value: number): number {
    const { targetScore, score } = playerRef(playerId).value
    if (targetScore <= 0) return value
    return Math.min(value, Math.max(targetScore - score, 0))
  }

  // Rendre la main SANS marquer (décision produit du 2026-09-09) : le joueur tape la zone
  // de l'adversaire au lieu de saisir `0` au pavé. Le raccourci porte sur le geste, pas sur
  // le modèle — une reprise blanchie reste une reprise jouée, et doit compter dans la
  // moyenne. Ne rien enregistrer ferait monter artificiellement la moyenne du joueur.
  function passTurn(): void {
    if (status.value !== 'playing') return
    const playerId = activePlayer.value
    pushHistory()
    addReprise(playerId, 0)
    switchTurn()
    checkEndOfGame(playerId)
    lastSaved.value = new Date().toISOString()
  }

  // --- Fin de partie (Story 1.10) ---

  // `>=` et non `===` par robustesse : avec le plafonnement, `===` suffirait en pratique,
  // mais `adjustScore` n'est pas borné. Distance libre (0) : jamais atteinte.
  function hasReachedTarget(playerId: PlayerId): boolean {
    const { targetScore, score } = playerRef(playerId).value
    return targetScore > 0 && score >= targetScore
  }

  // Règle de la reprise égalisatrice (Nathan, 2026-09-10). Le blanc ouvre toujours ;
  // s'il atteint sa distance le premier, il a joué une reprise de plus et le jaune a
  // droit à UNE série pour égaliser. Le jaune, lui, gagne immédiatement s'il atteint le
  // premier : les deux ont alors joué le même nombre de reprises.
  // Appelée en FIN des deux actions de série (`validateScoreInput`, `passTurn`) et
  // d'elles seules (AC8) : ni `adjustScore`, ni `addReprise`, ni `swapPlayers`.
  // Le premier cas passe AVANT les autres : en égalisatrice, la série du jaune termine
  // la partie même s'il n'atteint pas sa distance.
  function checkEndOfGame(playerId: PlayerId): void {
    const reached = hasReachedTarget(playerId)
    if (equalizingReprise.value && playerId === 'player2') {
      endPrompt.value = { kind: 'over', winner: reached ? null : 'player1' }
    } else if (reached && playerId === 'player1') {
      endPrompt.value = { kind: 'equalizing-offer' }
    } else if (reached && playerId === 'player2') {
      endPrompt.value = { kind: 'over', winner: 'player2' }
    }
  }

  // `OUI, IL JOUE` : la partie reprend, le jaune joue sa reprise égalisatrice. N'empile
  // RIEN : ce n'est pas une action de score, et le snapshot de la série gagnante du blanc
  // porte déjà `equalizingReprise: false` — l'annuler défait l'offre acceptée (AC9).
  function acceptEqualizingReprise(): void {
    if (endPrompt.value?.kind !== 'equalizing-offer') return
    equalizingReprise.value = true
    endPrompt.value = null
  }

  // Referme « PARTIE TERMINÉE » sans terminer : retour au scoreboard, la détection
  // rejouera à la prochaine validation. Aucun bouton ne l'appelle depuis la 1.10 (revue
  // de Nathan, 2026-09-10 : on ne revient pas au scoreboard une fois la fin détectée) ;
  // l'action reste exposée pour le pilotage déporté (V2+). L'offre égalisatrice, elle,
  // ne se ferme jamais : une décision est attendue.
  function dismissEndPrompt(): void {
    if (endPrompt.value?.kind !== 'over') return
    endPrompt.value = null
  }

  // Fin manuelle (AC11) : le plus avancé vers SA distance gagne, égalité si égal — 0‑0
  // compris. Distance libre : score brut (mélange ratio/brut seulement si une seule
  // distance vaut 0, injoignable depuis l'accueil, acceptable pour le store).
  function prorataWinner(): PlayerId | null {
    const progress = (player: Player) =>
      player.targetScore > 0 ? player.score / player.targetScore : player.score
    const left = progress(player1.value)
    const right = progress(player2.value)
    if (left > right) return 'player1'
    if (right > left) return 'player2'
    return null
  }

  // UNE SEULE action de clôture pour les trois CTA (`VOIR LE RÉCAP`, `NON, FIN DE
  // PARTIE`, sortie confirmée) : le vainqueur se déduit du contexte, `GameView` n'a
  // rien à décider (Décision 9). `history` et `equalizingReprise` sont conservés :
  // inoffensifs, et le second dit comment la partie s'est terminée ; `startGame` et
  // `resetGame` remettent tout à zéro.
  function finishGame(): void {
    if (status.value !== 'playing') return
    const prompt = endPrompt.value
    winner.value =
      prompt?.kind === 'over'
        ? prompt.winner
        : prompt?.kind === 'equalizing-offer'
          ? // Refus de l'égalisatrice : le blanc gagne.
            'player1'
          : prorataWinner()
    status.value = 'finished'
    finishedAt.value = Date.now()
    endPrompt.value = null
    currentInput.value = { player1: '', player2: '' }
    lastSaved.value = new Date().toISOString()
  }

  // `UNE PARTIE DE PLUS` : même mode, mêmes noms, mêmes distances, chacun du côté où il
  // est. Passe par `startGame`, qui réassigne tout (pile, parité, état de fin).
  function rematch(): void {
    if (status.value !== 'finished') return
    startGame(mode.value, player1.value.name, player2.value.name, {
      player1: player1.value.targetScore,
      player2: player2.value.targetScore,
    })
  }

  // `ANNULER` : revient d'UNE action en arrière à chaque appel (FR9, UX-DR16). Action
  // nommée (AR15, UX-DR23) : un pilotage déporté produit le même état que le bouton.
  // Pas de recalcul — le snapshot porte déjà des scores cohérents. Cas général de
  // l'`undoLastSeries` cité par l'architecture (la Story 1.8 est absorbée ici).
  // Hors `playing` : no-op. Le récap est TERMINAL (décision du 2026-09-10, Story 1.10) —
  // et depuis la revue au rendu, une fin détectée n'est plus rattrapable non plus ; la
  // correction se fait avant la série gagnante, ou par `ANNULER` de la pop-up de sortie.
  function undoLastAction(): void {
    if (status.value !== 'playing') return
    const previous = history.value[history.value.length - 1]
    if (previous === undefined) return

    history.value = history.value.slice(0, -1)
    const snapshot =
      previous.sidesSwapped === sidesSwapped.value ? previous : mirrorSnapshot(previous)

    player1.value = snapshot.player1
    player2.value = snapshot.player2
    activePlayer.value = snapshot.activePlayer
    reprises.value = snapshot.reprises
    // Copies défensives : l'état vivant ne doit jamais aliaser un objet de snapshot —
    // `adjustScore` et `appendScoreDigit` mutent ces trois objets en place, et un miroir
    // partage les siens avec le snapshot dépilé.
    scoreAdjustments.value = { ...snapshot.scoreAdjustments }
    currentInput.value = { ...snapshot.currentInput }
    isNegative.value = { ...snapshot.isNegative }
    equalizingReprise.value = snapshot.equalizingReprise
    lastSaved.value = new Date().toISOString()
  }

  // Nombre de reprises effectivement jouées par un joueur : celles où sa case est
  // renseignée. Une reprise ouverte par l'adversaire et qu'il n'a pas encore jouée n'entre
  // pas dans son compte (Décision 7 — la moyenne se fige quand le joueur rend la main).
  function playedReprises(playerId: PlayerId): number {
    return reprises.value.filter((reprise) => reprise[playerId] !== null).length
  }

  // Moyenne de la partie en cours : points marqués ÷ reprises jouées.
  const averages = computed(() => ({
    player1: playedReprises('player1') === 0 ? 0 : player1.value.score / playedReprises('player1'),
    player2: playedReprises('player2') === 0 ? 0 : player2.value.score / playedReprises('player2'),
  }))

  // Meilleure série de la partie en cours, 0 tant qu'aucune n'a été jouée.
  function bestSeriesOf(playerId: PlayerId): number {
    const played = reprises.value
      .map((reprise) => reprise[playerId])
      .filter((value): value is number => value !== null)
    return played.length === 0 ? 0 : Math.max(...played)
  }

  const bestSeries = computed(() => ({
    player1: bestSeriesOf('player1'),
    player2: bestSeriesOf('player2'),
  }))

  // Ligne REPRISES du récap (Story 1.10) : le même compte que celui de la moyenne.
  const repriseCounts = computed(() => ({
    player1: playedReprises('player1'),
    player2: playedReprises('player2'),
  }))

  // AC15 : la reprise est ouverte par le joueur BLANC. Seules les reprises où les deux
  // joueurs ont joué sont terminées — le numéro affiché s'en déduit (`GameView`).
  const completedReprises = computed(
    () =>
      reprises.value.filter((reprise) => reprise.player1 !== null && reprise.player2 !== null)
        .length,
  )

  // Retour à l'accueil (`FIN DE PARTIE` du récap, sortie d'une partie sans série). La
  // confirmation avant abandon est portée par la pop-up de sortie de `GameView` (1.10).
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
    history.value = []
    sidesSwapped.value = false
    winner.value = null
    finishedAt.value = null
    equalizingReprise.value = false
    endPrompt.value = null
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
    // Exposés en lecture (tests, pilotage déporté) — jamais à muter depuis un composant (AR17).
    history,
    sidesSwapped,
    canUndo,
    completedReprises,
    averages,
    bestSeries,
    repriseCounts,
    winner,
    finishedAt,
    equalizingReprise,
    endPrompt,
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
    undoLastAction,
    finishGame,
    acceptEqualizingReprise,
    dismissEndPrompt,
    rematch,
  }
})
