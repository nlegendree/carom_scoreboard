import { computed, ref, shallowRef, watch } from 'vue'
import { defineStore } from 'pinia'
import type {
  EndPrompt,
  GameMode,
  GameSnapshot,
  GameState,
  GameStatus,
  Player,
  PlayerColor,
  PlayerId,
  Reprise,
  TableSide,
} from '../types/game'
import { clearGameState, loadGameState, saveGameState } from '../services/storageService'

const DEFAULT_MODE: GameMode = 'libre'
// Plafond de saisie repris de la contrainte de série (FR7) : une distance de 4 chiffres
// n'a pas de réalité en carambole. 0 signifie « distance libre » (aucun objectif).
// Exporté depuis la Story 10.3 (DT1) : `NumericPadDock` en dérive son plafond de chiffres,
// au lieu de redéclarer un `MAX_DIGITS` qui pouvait diverger. Une seule source.
export const MAX_TARGET_SCORE = 999
// Plafond de la saisie d'une série, en NOMBRE DE CHIFFRES (FR7 : 999 points au plus).
// Définition unique, exportée : `ScoreEntryModal` l'importe pour décider localement de
// l'accusé de réception ou du refus, au lieu de réécrire la règle dans son template.
export const MAX_SCORE_DIGITS = 3
// Profondeur maximale de la pile d'annulation (Story 1.7) : hygiène mémoire pour les
// sessions de 8 h (NFR3). Un snapshot ne porte que des références (joueurs, reprises) et
// trois petits objets copiés : 1000 reste négligeable, et couvre toute partie réaliste
// même à une action par point (corrections `+`, 3 Bandes de l'Epic 2) — relevé de 200 à
// 1000 en revue du 2026-09-09. Le plus ancien snapshot est abandonné en silence.
// ⚠️ Depuis la 1.12, la pile est PERSISTÉE intégralement, et en JSON chaque snapshot
// recopie tout le tableau des reprises (≈ 52 octets par reprise) : 100 actions sur une
// partie de 60 reprises ≈ 350 Ko, très au-dessus du repère « < 50 Ko » d'AR4 mais loin
// des 5 Mo de quota. Le cas limite (1000 actions × 100 reprises ≈ 5 Mo) est théorique
// en JDS ; à revoir avec le `+1` par point du 3 Bandes (Epic 2) — un bornage à
// l'écriture (`history.slice(-N)` dans `persistedState`) est alors une ligne. Une
// écriture qui échoue est absorbée par le service (AR12), la partie continue.
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

// Prend une BILLE et non un identifiant de côté (Story 10.3) : `Player.id` a disparu, la
// couleur est désormais la seule identité du joueur dans la partie.
function makePlayer(color: PlayerColor): Player {
  return {
    name: '',
    score: 0,
    color,
    targetScore: 0,
  }
}

export const useGameStore = defineStore('game', () => {
  const mode = ref<GameMode>(DEFAULT_MODE)
  const status = ref<GameStatus>('idle')
  const player1 = ref<Player>(makePlayer('white'))
  const player2 = ref<Player>(makePlayer('yellow'))
  const activePlayer = ref<PlayerId>('player1')
  // AR9 : `shallowRef` évite la réactivité profonde sur les sessions longues.
  // Conséquence à respecter impérativement : toute évolution de `reprises` doit REMPLACER
  // le tableau (`reprises.value = [...reprises.value, r]`), jamais le muter — un `push`
  // ne déclencherait aucun recalcul des `computed` qui en dépendent (Story 1.5/1.7).
  const reprises = shallowRef<Reprise[]>([])
  const currentInput = ref({ player1: '', player2: '' })
  // Pop-up de saisie ouverte (Story 1.12, décision 3) : montée de `GameView` dans le
  // store pour être persistée et ROUVERTE à la reprise, avec son buffer `currentInput`.
  // L'ouverture d'une confirmation de sortie, elle, reste locale à la vue.
  const entryOpen = ref(false)
  // Sauvegarde chargée au lancement et proposée à la reprise (Story 1.12) ; `null` = rien
  // à proposer. Porte l'état lui-même plutôt qu'un booléen : une seule lecture du storage,
  // `resumeGame` n'a rien à relire. `shallowRef` (AR9) : rien à observer en profondeur, et
  // les objets restent bruts jusqu'à leur adoption par les `ref` du store. Vidée par
  // `startGame` : une partie démarrée pendant une offre en attente écrase la sauvegarde,
  // l'offre ne doit pas resurgir au retour à l'accueil (revue 1.12).
  const pendingRestore = shallowRef<GameState | null>(null)
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
  // attaché à la bille (Décision 15 de la 1.5, relue en 10.3 : `player2` est le jaune).
  // Dans le snapshot (AC9) : annuler la série gagnante du blanc défait l'offre. Conservé tel quel en `finished` : il dit si la partie s'est
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
  // Côté d'affichage de la bille blanche (Story 10.3, AR24), choisi au paramétrage et fixe
  // pour toute la partie. Champ d'AFFICHAGE : `GameView` et `GameSummary` en tirent l'ordre
  // de leurs colonnes, aucune règle de score ne le lit. Hors snapshot, donc hors undo.
  const whiteSide = ref<TableSide>('left')

  // INVARIANTE à maintenir : `player1`, `player2` et `reprises` sont capturés PAR RÉFÉRENCE
  // parce qu'ils sont toujours REMPLACÉS, jamais mutés en place (`recomputeScore`,
  // `addReprise`, `startGame`). Toute action future qui muterait un joueur
  // ou une reprise en place (ex. renommage, Story 1.14) doit soit le remplacer, soit copier
  // ici. `scoreAdjustments` et `currentInput` sont mutés en place par `adjustScore` et
  // `appendScoreDigit` : ils sont COPIÉS, à la prise comme à la restauration.
  function takeSnapshot(): GameSnapshot {
    return {
      player1: player1.value,
      player2: player2.value,
      activePlayer: activePlayer.value,
      reprises: reprises.value,
      scoreAdjustments: { ...scoreAdjustments.value },
      currentInput: { ...currentInput.value },
      equalizingReprise: equalizingReprise.value,
    }
  }

  // Appelée en tête de chacune des TROIS actions annulables (série validée, main rendue,
  // correction), après leurs gardes — jamais dans `addReprise`/`switchTurn` (primitives :
  // une action = un snapshot).
  function pushHistory(): void {
    history.value = [...history.value, takeSnapshot()].slice(-MAX_UNDO_DEPTH)
  }

  const canUndo = computed(() => history.value.length > 0)

  // Les 4e et 5e paramètres restent optionnels : sans réglage de format ni choix de côté,
  // le parcours de démarrage de la Story 1.3 est strictement inchangé — les deux joueurs
  // jouent en distance libre, le blanc est assis à gauche. La distance appartient au joueur
  // (handicap), pas à la partie.
  // `player1Name` est le joueur à la bille BLANCHE et `player2Name` celui à la jaune
  // (Story 10.3) : c'est la bille qui nomme les paramètres, plus le côté.
  function startGame(
    newMode: GameMode,
    player1Name: string,
    player2Name: string,
    targetScores: TargetScores = NO_TARGET_SCORES,
    newWhiteSide: TableSide = 'left',
  ): void {
    mode.value = newMode
    player1.value = {
      ...makePlayer('white'),
      name: player1Name,
      targetScore: normalizeTargetScore(targetScores.player1),
    }
    player2.value = {
      ...makePlayer('yellow'),
      name: player2Name,
      targetScore: normalizeTargetScore(targetScores.player2),
    }
    status.value = 'playing'
    activePlayer.value = 'player1'
    reprises.value = []
    startedAt.value = Date.now()
    currentInput.value = { player1: '', player2: '' }
    entryOpen.value = false
    pendingRestore.value = null
    scoreAdjustments.value = { player1: 0, player2: 0 }
    history.value = []
    whiteSide.value = newWhiteSide
    winner.value = null
    finishedAt.value = null
    equalizingReprise.value = false
    endPrompt.value = null
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
  // Garde `playing` : hors partie, aucune action ne doit muter l'état
  // (revue de code du 2026-09-09, appliqué à toutes les actions de jeu ci-dessous).
  // Un appui = une action annulable (Story 1.7, Décision 8) : cinq `+` = cinq `ANNULER`.
  function adjustScore(playerId: PlayerId, delta: number): void {
    if (status.value !== 'playing') return
    pushHistory()
    const reachedBefore = hasReachedTarget(playerId)

    // ⚠️ Défaut relevé par Nathan à la 2e passe de rendu de la 10.4 : quand une SÉRIE EST
    // OUVERTE (3 Bandes, joueur qui a la main), la correction doit porter sur CE QUI VIENT
    // D'ÊTRE COMPTÉ, pas sur un ajustement à part. Sinon `−` baissait bien le total mais
    // laissait la série en cours, la meilleure série et la moyenne sur une valeur fausse —
    // la somme des reprises et le total divergeaient en silence. Le défaut existait depuis
    // la 2.2 ; il devient visible avec la série affichée en grand sur la carte (AC3c).
    // ⚠️ Borné au 3 BANDES, et au joueur qui a la main. C'est le seul mode où une série se
    // COMPTE point par point sous les yeux de l'arbitre, donc le seul où corriger revient à
    // corriger ce comptage. En JDS la série est saisie d'un bloc et se corrige par `ANNULER`
    // puis ressaisie : `−`/`+` y restent un ajustement séparé qui ne touche pas au déroulé
    // de la partie (Story 1.7), et le comportement n'y change pas d'un iota.
    const open =
      mode.value === '3bandes' && activePlayer.value === playerId
        ? openSeriesValue(playerId)
        : null

    // Une série ne peut pas devenir négative : sous zéro, on retombe sur l'ajustement, qui
    // n'est volontairement pas borné (un score peut descendre sous zéro, Story 1.9).
    // ⚠️ Et un `+` qui suit ce `−` REMBOURSE d'abord l'ajustement (revue de fin d'Epic 10) :
    // sinon la série passait à 1 avec un ajustement à −1 — total juste, mais série en
    // cours, meilleure série et moyenne faux, la divergence que la 2e passe venait de
    // corriger. `−` puis `+` doivent se compenser exactement.
    if (open !== null && delta > 0 && scoreAdjustments.value[playerId] < 0) {
      scoreAdjustments.value[playerId] += delta
    } else if (open !== null && open + delta >= 0) {
      writeLastReprise(playerId, open + delta)
    } else {
      scoreAdjustments.value[playerId] += delta
    }

    recomputeScore(playerId)

    // Distance ATTEINTE par la correction (décision de Nathan, revue de fin d'Epic 10) :
    // `+`/`−` corrigent, mais arriver au score final déclenche la mécanique de fin comme une
    // série — l'ancienne règle « ni `adjustScore` » (1.10, AC8) laissait un `+1` refusé
    // sans retour et une fin détectée seulement au `PASSER LE TOUR` suivant. Une série
    // ouverte est close au passage (même geste que `incrementSeries` à la distance). La
    // pop-up est `revertible` : `ANNULER` y défait ce `+` — c'est le filet demandé au cas
    // où le point n'aurait pas dû être compté. Seule la TRANSITION compte : un score déjà
    // à la distance (pilotage déporté, `dismissEndPrompt`) ne rouvre rien, et une pop-up
    // déjà ouverte n'est jamais écrasée.
    if (!reachedBefore && hasReachedTarget(playerId) && endPrompt.value === null) {
      if (open !== null) switchTurn()
      checkEndOfGame(playerId, true)
    }
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

  // Ouvre la pop-up de saisie sur un buffer PROPRE : une saisie abandonnée ne doit pas
  // réapparaître. Le buffer, lui, reste dans `currentInput` (déjà persisté).
  function openScoreEntry(playerId: PlayerId): void {
    if (status.value !== 'playing') return
    currentInput.value[playerId] = ''
    entryOpen.value = true
  }

  function closeScoreEntry(): void {
    entryOpen.value = false
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
      writeLastReprise(playerId, value)
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

  // Réécrit la case d'un joueur dans la DERNIÈRE reprise — toujours par remplacement du
  // tableau (invariante des snapshots, jamais de mutation en place).
  function writeLastReprise(playerId: PlayerId, value: number): void {
    reprises.value = reprises.value.map((reprise, index) =>
      index === reprises.value.length - 1 ? { ...reprise, [playerId]: value } : reprise,
    )
  }

  // Série OUVERTE du joueur qui a la main (Story 2.2) : la valeur de sa case dans la
  // dernière reprise si c'est bien LUI qui l'a écrite en dernier — c'est-à-dire si rien
  // n'a été inscrit après elle. Le blanc ouvre la reprise : sa série n'est ouverte que
  // tant que la case du jaune est vide ; celle du jaune, dès qu'elle est renseignée
  // (le tour repasse au blanc, qui ouvre alors une reprise neuve). En JDS, la case est
  // toujours écrite d'un bloc à la validation, qui rend aussitôt la main : il n'y a
  // jamais de série ouverte, et `passTurn` y enregistre un 0 comme avant.
  function openSeriesValue(playerId: PlayerId): number | null {
    const last = reprises.value[reprises.value.length - 1]
    if (last === undefined || last[playerId] === null) return null
    if (playerId === 'player1' && last.player2 !== null) return null
    return last[playerId]
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
  // Story 2.2 (3 Bandes) : si des points ont déjà été comptés au `+1` pendant ce tour, la
  // série est déjà inscrite — rendre la main la CLÔTURE, sans ajouter de 0 par-dessus.
  function passTurn(): void {
    if (status.value !== 'playing') return
    const playerId = activePlayer.value
    pushHistory()
    if (openSeriesValue(playerId) === null) addReprise(playerId, 0)
    switchTurn()
    checkEndOfGame(playerId)
    lastSaved.value = new Date().toISOString()
  }

  // `+1 POINT` (Story 2.2, FR14) : le joueur assis crédite UN point à celui qui joue, au
  // fil de la série. Le premier tap ouvre la série (case du joueur dans la reprise
  // courante), les suivants l'incrémentent — le total reste une somme de reprises
  // (Décision 5), le compteur `POUR n` et l'undo en découlent sans cas particulier. Un
  // appui = une action annulable, comme `adjustScore`. Le tour ne change PAS : c'est le
  // tap sur la carte (`passTurn`) qui rend la main. Exception : atteindre la distance
  // termine la série sur-le-champ (on ne joue pas au-delà) — même bascule et même
  // détection de fin que la validation d'une série au pavé. À la distance déjà atteinte
  // (état joignable par une correction `+`), le tap est un no-op : rien à créditer.
  // Retourne `false` quand rien n'a été crédité (revue de code du 2026-09-11) : la vue
  // n'accuse réception (haptique) et ne relance le chrono que sur `true` — même contrat
  // que `appendScoreDigit`.
  function incrementSeries(): boolean {
    if (status.value !== 'playing') return false
    const playerId = activePlayer.value
    if (hasReachedTarget(playerId)) return false
    pushHistory()
    const open = openSeriesValue(playerId)
    if (open === null) {
      addReprise(playerId, 1)
    } else {
      writeLastReprise(playerId, open + 1)
      recomputeScore(playerId)
    }
    if (hasReachedTarget(playerId)) {
      switchTurn()
      checkEndOfGame(playerId)
    }
    lastSaved.value = new Date().toISOString()
    return true
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
  // Appelée en FIN des deux actions de série (`validateScoreInput`, `passTurn`), de
  // `incrementSeries` à la distance, et — depuis la revue de fin d'Epic 10 — d'une
  // correction `+` qui ATTEINT la distance (`revertible`, voir `adjustScore`). Jamais
  // d'`addReprise` : c'est une primitive.
  // Le premier cas passe AVANT les autres : en égalisatrice, la série du jaune termine
  // la partie même s'il n'atteint pas sa distance.
  function checkEndOfGame(playerId: PlayerId, revertible = false): void {
    const reached = hasReachedTarget(playerId)
    const tag = revertible ? { revertible: true as const } : {}
    if (equalizingReprise.value && playerId === 'player2') {
      endPrompt.value = { kind: 'over', winner: reached ? null : 'player1', ...tag }
    } else if (reached && playerId === 'player1') {
      endPrompt.value = { kind: 'equalizing-offer', ...tag }
    } else if (reached && playerId === 'player2') {
      endPrompt.value = { kind: 'over', winner: 'player2', ...tag }
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

  // `ANNULER` d'une pop-up de fin ouverte par une correction (`revertible`) : le `+` qui a
  // atteint la distance est défait — c'est l'undo du snapshot pris par `adjustScore`, qui
  // rend aussi la main si une série ouverte avait été close au passage — et le scoreboard
  // revient. Rien à faire sur une fin par série : la pop-up n'est pas `revertible`, et la
  // règle de la 1.10 (une fin détectée par une série n'est pas rattrapable) tient toujours.
  function revertEndPrompt(): void {
    if (!endPrompt.value?.revertible) return
    endPrompt.value = null
    undoLastAction()
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
    entryOpen.value = false
    lastSaved.value = new Date().toISOString()
  }

  // `UNE PARTIE DE PLUS` : même mode, mêmes noms, mêmes distances, chacun du côté où il
  // est. Passe par `startGame`, qui réassigne tout (pile, côté d'affichage, état de fin).
  function rematch(): void {
    if (status.value !== 'finished') return
    startGame(
      mode.value,
      player1.value.name,
      player2.value.name,
      { player1: player1.value.targetScore, player2: player2.value.targetScore },
      whiteSide.value,
    )
  }

  // Picto RECOMMENCER (Story 1.15) : la partie repart de zéro SANS passer par
  // `finished` — ni récap, ni vainqueur, ni (Epic 3) ligne d'historique. Même
  // recette que `rematch()`, gardée sur `playing` : chacun repart du côté où il est.
  function restartGame(): void {
    if (status.value !== 'playing') return
    startGame(
      mode.value,
      player1.value.name,
      player2.value.name,
      { player1: player1.value.targetScore, player2: player2.value.targetScore },
      whiteSide.value,
    )
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
    // Restauration DIRECTE depuis la Story 10.3 : sans `ÉCHANGER` en cours de partie, la
    // parité des côtés ne varie plus, la mise en miroir d'un snapshot a disparu avec elle.
    player1.value = previous.player1
    player2.value = previous.player2
    activePlayer.value = previous.activePlayer
    reprises.value = previous.reprises
    // Copies défensives : l'état vivant ne doit jamais aliaser un objet de snapshot —
    // `adjustScore` et `appendScoreDigit` mutent ces deux objets en place.
    scoreAdjustments.value = { ...previous.scoreAdjustments }
    currentInput.value = { ...previous.currentInput }
    equalizingReprise.value = previous.equalizingReprise
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

  // Série OUVERTE de chaque joueur (Story 10.4), exposée en LECTURE pour la carte joueur,
  // qui l'affiche entre `−` et `+` (AC3c). Dérivé de `openSeriesValue`, écrite en 2.2 :
  // aucun état nouveau, aucune persistance, `GameState` inchangé — `GAME_STORAGE_VERSION`
  // ne bouge pas. Même famille que `averages`, `bestSeries` et `repriseCounts`.
  // ⚠️ Borné au joueur qui A LA MAIN. `openSeriesValue` répond « la case que ce joueur a
  // écrite dans la reprise que l'adversaire n'a pas encore close » : elle reste non nulle
  // APRÈS le passage de main, ce qui convient à ses deux appelants internes (`passTurn` et
  // `incrementSeries` l'interrogent toujours sur le joueur actif) mais ferait afficher une
  // série « en cours » sur la carte d'un joueur assis. Une série en cours est celle de
  // celui qui joue, par définition.
  const openSeries = computed(() => ({
    player1: activePlayer.value === 'player1' ? openSeriesValue('player1') : null,
    player2: activePlayer.value === 'player2' ? openSeriesValue('player2') : null,
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
  // La remise à zéro SANS retour à l'accueil (mêmes joueurs, même configuration) est
  // `restartGame` (1.15), pas ici.
  // Restaure l'intégralité de l'état initial pour qu'aucune valeur de la partie précédente
  // (mode, distances de jeu) ne soit silencieusement reconduite au démarrage suivant :
  // les distances repassent par `makePlayer()`, qui les remet à 0.
  function resetGame(): void {
    mode.value = DEFAULT_MODE
    status.value = 'idle'
    player1.value = makePlayer('white')
    player2.value = makePlayer('yellow')
    activePlayer.value = 'player1'
    reprises.value = []
    currentInput.value = { player1: '', player2: '' }
    entryOpen.value = false
    scoreAdjustments.value = { player1: 0, player2: 0 }
    history.value = []
    whiteSide.value = 'left'
    winner.value = null
    finishedAt.value = null
    equalizingReprise.value = false
    endPrompt.value = null
    startedAt.value = null
    lastSaved.value = ''
  }

  // --- Persistance et reprise après fermeture (Story 1.12) ---

  // La forme persistée, construite en `computed<GameState>` COMPLET : oublier un champ
  // ne compile pas. `currentInput`/`scoreAdjustments` sont mutés en place par les
  // actions — copiés pour que l'objet sérialisé ne soit jamais un alias de l'état vivant.
  // `player1`/`player2`/`reprises`/`history` ne sont suivis que par REMPLACEMENT de leur
  // `.value` (même invariant que `takeSnapshot`) : une mutation en place d'un joueur ou
  // d'une reprise ne déclencherait AUCUNE écriture — remplacer, jamais muter.
  // Pas de bornage de la pile à l'écriture : voir `MAX_UNDO_DEPTH`.
  const persistedState = computed<GameState>(() => ({
    mode: mode.value,
    status: status.value,
    player1: player1.value,
    player2: player2.value,
    activePlayer: activePlayer.value,
    reprises: reprises.value,
    currentInput: { ...currentInput.value },
    scoreAdjustments: { ...scoreAdjustments.value },
    whiteSide: whiteSide.value,
    history: history.value,
    startedAt: startedAt.value,
    lastSaved: lastSaved.value,
    winner: winner.value,
    finishedAt: finishedAt.value,
    equalizingReprise: equalizingReprise.value,
    endPrompt: endPrompt.value,
    entryOpen: entryOpen.value,
  }))

  // Une écriture par action, dans le même tick : le flush `pre` (défaut) regroupe toutes
  // les mutations d'une action avant de déclencher. Ni `immediate` (un store neuf n'a
  // rien à écrire), ni `sync` (une écriture par mutation), ni `$subscribe`. Aucun
  // `beforeunload`/`pagehide` : iPadOS tue une PWA sans les envoyer, et il ne reste rien
  // à écrire. Un état `idle` n'est jamais écrit : `resetGame` SUPPRIME l'entrée.
  watch(persistedState, (state) => {
    if (state.status === 'idle') clearGameState()
    else saveGameState(state)
  })

  // Appelée par `main.ts` avant le montage. Garde `idle` : un store en partie n'a rien
  // à se faire proposer.
  function checkSavedGame(): void {
    if (status.value !== 'idle') return
    pendingRestore.value = loadGameState()
  }

  // `REPRENDRE LA PARTIE` : le scoreboard revient exactement où il en était. Les joueurs
  // sont RESTAMPÉS (`color` appartient au rang `player1`/`player2`, pas à la sauvegarde) —
  // dans la pile aussi, sinon le premier `ANNULER` réinstallerait ceux de la sauvegarde. La
  // pile est REMPLACÉE (`shallowRef`, jamais `push`). `whiteSide` est restauré pour que les
  // joueurs retrouvent le côté où ils étaient assis.
  // `status` est posé EN DERNIER : c'est lui qui fait basculer `GameView`, tout le reste
  // doit être en place avant. Le `watch` réécrit ensuite le même état (nouvelle enveloppe).
  function resumeGame(): void {
    const saved = pendingRestore.value
    if (saved === null || status.value !== 'idle') return

    mode.value = saved.mode
    player1.value = { ...saved.player1, color: 'white' }
    player2.value = { ...saved.player2, color: 'yellow' }
    activePlayer.value = saved.activePlayer
    reprises.value = saved.reprises
    currentInput.value = { ...saved.currentInput }
    entryOpen.value = saved.entryOpen
    scoreAdjustments.value = { ...saved.scoreAdjustments }
    whiteSide.value = saved.whiteSide
    history.value = saved.history.map((snapshot) => ({
      ...snapshot,
      player1: { ...snapshot.player1, color: 'white' },
      player2: { ...snapshot.player2, color: 'yellow' },
    }))
    startedAt.value = saved.startedAt
    lastSaved.value = saved.lastSaved
    winner.value = saved.winner
    finishedAt.value = saved.finishedAt
    equalizingReprise.value = saved.equalizingReprise
    endPrompt.value = saved.endPrompt
    status.value = saved.status
    pendingRestore.value = null
  }

  // `ANNULER` de la pop-up de reprise : la sauvegarde est jetée, l'accueil reste. Garde
  // `idle` comme ses deux sœurs : en partie, la sauvegarde vivante n'est pas à jeter.
  function discardSavedGame(): void {
    if (status.value !== 'idle') return
    clearGameState()
    pendingRestore.value = null
  }

  return {
    mode,
    status,
    player1,
    player2,
    activePlayer,
    reprises,
    currentInput,
    entryOpen,
    startedAt,
    lastSaved,
    // Exposés en lecture (tests, pilotage déporté) — jamais à muter depuis un composant (AR17).
    history,
    whiteSide,
    scoreAdjustments,
    canUndo,
    completedReprises,
    averages,
    bestSeries,
    openSeries,
    repriseCounts,
    winner,
    finishedAt,
    equalizingReprise,
    endPrompt,
    pendingRestore,
    startGame,
    resetGame,
    appendScoreDigit,
    clearScoreInput,
    openScoreEntry,
    closeScoreEntry,
    backspaceScoreInput,
    addReprise,
    switchTurn,
    passTurn,
    incrementSeries,
    adjustScore,
    validateScoreInput,
    undoLastAction,
    finishGame,
    acceptEqualizingReprise,
    dismissEndPrompt,
    revertEndPrompt,
    rematch,
    restartGame,
    checkSavedGame,
    resumeGame,
    discardSavedGame,
  }
})
