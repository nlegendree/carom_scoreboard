<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import { useTimer } from '../composables/useTimer'
import { useHaptics } from '../composables/useHaptics'
import HomeScreen from '../components/HomeScreen.vue'
import ActionBar from '../components/ActionBar.vue'
import PlayerPanel from '../components/PlayerPanel.vue'
import CenterPanel from '../components/CenterPanel.vue'
import ScoreEntryDock from '../components/ScoreEntryDock.vue'
import PromptModal from '../components/PromptModal.vue'
import GameSummary from '../components/GameSummary.vue'
import SideBar from '../components/SideBar.vue'
import type { PlayerId, TableSide } from '../types/game'
import type { PromptAction, SideBarItem } from '../types/ui'
import { readScene, gameSceneState } from '../dev/scenes'

const gameStore = useGameStore()
const {
  mode,
  status,
  player1,
  player2,
  activePlayer,
  currentInput,
  entryOpen,
  completedReprises,
  averages,
  bestSeries,
  openSeries,
  repriseCounts,
  canUndo,
  endPrompt,
  winner,
  pendingRestore,
  whiteSide,
} = storeToRefs(gameStore)

// AC15 : la reprise est OUVERTE par le joueur blanc. Le numéro affiché compte donc les
// reprises terminées, pas les lignes du tableau : la série du seul joueur de gauche
// laisse l'affichage sur « REPRISE 1 », c'est la validation du jaune — qui rend la main
// au blanc — qui ouvre la suivante.
const repriseNumber = computed(() => completedReprises.value + 1)

// Chrono de tir du 3 Bandes (Story 2.1). Le composable ne décompte qu'en `3bandes` et
// vaut 40 (repos) ailleurs : la vue filtre une seconde fois par mode pour ne transmettre
// une valeur à la console QUE dans ce cas — double garde volontaire, `CenterPanel` reste
// générique. `resetTimer` (Story 2.2) est relancée au `+1 POINT` et à la main rendue ;
// elle est elle-même gardée par le mode, la vue l'appelle donc sans distinguer.
const { secondsRemaining, resetTimer } = useTimer()
const isThreeCushions = computed(() => mode.value === '3bandes')
const shotClockSeconds = computed(() => (isThreeCushions.value ? secondsRemaining.value : null))

// Story 2.2 : en 3 Bandes, le CTA du joueur assis n'ouvre plus le pavé — il crédite UN
// point à celui qui joue (`incrementSeries`), avec l'accusé haptique du pavé (UX-DR24,
// NFR1). Même emplacement, même gabarit que `AJOUTER LES POINTS` : c'est le même geste
// (l'assis compte pour celui qui joue), seule la granularité change. Le pavé de secours
// du 3 Bandes (Story 2.3) trouvera son propre point d'entrée.
const { tap } = useHaptics()
const ctaTestId = computed(() => (isThreeCushions.value ? 'plus-one-button' : 'add-points-button'))
// Story 10.4 : le libellé dit désormais POUR QUI on compte. C'est l'ASSIS qui appuie, et
// les points vont à l'adversaire — celui qui joue. Les `data-testid`, eux, ne changent pas.
const ctaLabel = computed(() => (isThreeCushions.value ? '+1 ADVERSAIRE' : '+ POINTS ADVERSAIRE'))
// `canUndo` vient du store, pas d'un `computed` local sur `reprises` : celui-ci resterait
// actif après avoir tout annulé, et inactif après une simple correction (Story 1.7).

// L'ouverture de la pop-up de saisie vit dans le STORE depuis la 1.12 (`entryOpen`) :
// c'est le seul moyen de la rouvrir, buffer compris, à la reprise après une fermeture
// pendant la saisie (décision 3 de Nathan, 2026-09-10).

// ⚠️ Résolution UNIQUE des côtés d'écran (Story 10.3). `player1` est la bille BLANCHE, pas
// le joueur de gauche : avec `whiteSide === 'right'`, il est assis à DROITE. L'ordre des
// panneaux ET la colonne du CTA de la barre basse dérivent tous deux d'ici — les faire
// dériver séparément mettrait le CTA sous la carte du joueur qui a la main, l'inverse
// exact de la règle (c'est l'ASSIS qui compte pour celui qui joue).
const leftId = computed<PlayerId>(() => (whiteSide.value === 'left' ? 'player1' : 'player2'))
const rightId = computed<PlayerId>(() => (whiteSide.value === 'left' ? 'player2' : 'player1'))
const leftPlayer = computed(() => (leftId.value === 'player1' ? player1.value : player2.value))
const rightPlayer = computed(() => (rightId.value === 'player1' ? player1.value : player2.value))

// ⚠️ Le CTA se place du côté du joueur qui N'A PAS la main : au billard, c'est
// l'adversaire assis qui compte les points de celui qui joue. Le bouton est donc à
// l'opposé du liseré de tour actif, et la sortie occupe l'autre colonne.
const entrySide = computed(() => (activePlayer.value === 'player1' ? 'player2' : 'player1'))

// Colonne d'écran du CTA, et joueur propriétaire de chaque colonne : la barre basse reçoit
// les deux de la résolution ci-dessus, elle n'en refait aucune (AC14).
const ctaSide = computed<TableSide>(() => (entrySide.value === leftId.value ? 'left' : 'right'))
const sideOwners = computed<Record<TableSide, PlayerId>>(() => ({
  left: leftId.value,
  right: rightId.value,
}))

// ⚠️ L'alignement de la pop-up de saisie est le problème INVERSE de celui du CTA : elle se
// pose du côté OPPOSÉ à la carte du joueur ACTIF, pour que cette carte reste visible et
// que la valeur s'y écrive à vue (décision 2 de Nathan). Les deux coïncident en pratique —
// l'assis est toujours en face de l'actif — mais ils ne disent pas la même chose : celui-ci
// se dérive de la carte active, jamais de `entrySide`.
const entryAlign = computed<TableSide>(() =>
  activePlayer.value === leftId.value ? 'right' : 'left',
)

// GÉOMÉTRIE DU SCOREBOARD — la bande qu'une pop-up de saisie doit RÉSERVER pour ne pas
// couvrir la carte du joueur actif. Elle vivait en tokens `--game-popup-inset-*` jusqu'à la
// Story 11.3 : c'était une POSITION dans le namespace des intentions
// (`integration-bmad-impeccable.md` §6). Sa place est ici, à côté de la mise en page qu'elle
// mesure.
//
// Lecture : le scoreboard n'a PAS de barre latérale, ses trois colonnes valent 2/5 · 1/5 ·
// 2/5 à fleur de bord. L'inset réserve donc la carte visée (40vw) plus une gouttière de
// 4 unités, pour que la pop-up ne la TOUCHE jamais. Symétrique, à la différence du
// paramétrage : les deux cartes sont à égale distance des bords.
// ⚠️ `--spacing` reste un token et reste lu : c'est l'unité de grille, une intention.
const GAME_POPUP_RESERVE = 'calc(100vw * 0.4 + var(--spacing) * 4)'

// Valeur en cours de frappe, portée par la carte du joueur qui a la main et par elle seule
// (AC3a) ; `null` partout ailleurs, y compris sur la carte d'en face.
function entryValueOf(playerId: PlayerId): string | null {
  if (!entryOpen.value || activePlayer.value !== playerId) return null
  return currentInput.value[playerId]
}

// Une pop-up de fin ouverte rend `PASSER LE TOUR` inerte (AC8) : la partie est finie, on
// ne rend plus la main. Le voile de fin, lui, reste inerte de son côté (AC18 de la 1.10).
const endPromptOpen = computed(() => endPrompt.value !== null)

// ⚠️ Tap fantôme (revue de code du 2026-09-09) : quand la pop-up se referme d'elle-même
// à l'auto-validation, le tour a basculé et un doigt qui arrive juste après sur
// l'emplacement d'une touche atterrit sur le panneau adverse, qui enregistrerait une
// série de 0 et rebasculerait le tour — rattrapable par `ANNULER` depuis la 1.7, mais
// autant l'éviter. La carte de la pop-up recouvre aussi la colonne centrale : le même
// doigt peut tomber sur `ANNULER` et défaire la série qui vient d'être validée (revue de
// la 1.7). Après TOUTE fermeture de la pop-up, panneaux ET console centrale ignorent
// donc les appuis pendant une courte grâce, invisible pour l'utilisateur.
const PANEL_GRACE_MS = 300
let panelsLockedUntil = 0

function lockPanels(): void {
  panelsLockedUntil = Date.now() + PANEL_GRACE_MS
}

function closeEntry(): void {
  gameStore.closeScoreEntry()
  lockPanels()
}

function panelsAcceptInput(): boolean {
  return Date.now() >= panelsLockedUntil
}

// Rendre la main relance aussi le chrono (Story 2.2) : le joueur suivant repart de 40.
function passTurn(): void {
  if (!panelsAcceptInput()) return
  gameStore.passTurn()
  resetTimer()
}

// Haptique et relance du chrono SEULEMENT si un point a été crédité (revue de code du
// 2026-09-11) : à distance déjà atteinte (correction `+`), le tap est sans effet — AC8.
function addPoint(): void {
  if (!gameStore.incrementSeries()) return
  tap()
  resetTimer()
}

function pressCta(): void {
  if (isThreeCushions.value) addPoint()
  else openEntry()
}

function adjustScore(playerId: PlayerId, delta: number): void {
  if (!panelsAcceptInput()) return
  gameStore.adjustScore(playerId, delta)
}

function undoLastAction(): void {
  if (!panelsAcceptInput()) return
  gameStore.undoLastAction()
}

function openEntry(): void {
  // Le buffer est vidé par l'action : une saisie abandonnée ne doit pas réapparaître.
  gameStore.openScoreEntry(activePlayer.value)
}

function cancelEntry(): void {
  gameStore.clearScoreInput(activePlayer.value)
  closeEntry()
}

// La popup se referme à la validation, sinon elle masquerait le score qu'elle vient de
// mettre à jour. Le joueur est lu AVANT l'action : `validateScoreInput` bascule le tour.
// La modale n'émet `validate` que sur une saisie non vide (AC12) : on ne referme donc
// jamais sur un tap à vide.
function validateEntry(): void {
  gameStore.validateScoreInput(activePlayer.value)
  closeEntry()
}

// --- Fin de partie (Story 1.10) ---
// La détection vit dans le store : `endPrompt` dit quelle pop-up montrer, la vue ne
// fait qu'afficher et appeler `finishGame()` — qui déduit seul le vainqueur (Décision 9).
// Revue de Nathan (2026-09-10, au rendu) : les pop-ups de fin n'annoncent rien et n'ont
// pas de croix — le vainqueur se lit sur le récap, et on ne revient pas au scoreboard.
// `dismissEndPrompt` reste une action du store (pilotage déporté), sans bouton ici.

// Sortie : plus rien de destructif au contact (revue 1.5). Dès qu'une action annulable
// a été jouée (série, main rendue, correction `+`/`−`), une confirmation mène au récap ;
// sans rien à récapituler, retour direct à l'accueil (AC12). Le critère est `canUndo`,
// pas « aucune série » : des points ajoutés par `+` sans série ne doivent pas être jetés
// au contact (revue 1.10, décision de Nathan du 2026-09-10). État LOCAL, à l'inverse de
// `entryOpen` : l'ouverture d'une confirmation n'est pas un état de partie, et n'a pas à
// survivre à un rechargement. Le second picto de la colonne, RECOMMENCER (1.15), suit la
// même règle : confirmation obligatoire, état local (`restartPromptOpen`, plus bas).
const exitPromptOpen = ref(false)

// Story 11.4 — semis de la part ÉCRAN d'une scène `?scene=`. `10-popup-decision` est la
// seule concernée : le store ne connaît pas cette pop-up, et c'est voulu (une confirmation
// n'est pas un état de partie). UNE SEULE FOIS, AU SETUP, garde au point d'appel — mêmes
// raisons que dans `main.ts` et `HomeScreen` (`src/dev/scenes.ts`, en-tête).
if (import.meta.env.DEV) {
  const scene = readScene()
  const seed = scene ? gameSceneState(scene) : null
  if (seed?.exitPromptOpen !== undefined) exitPromptOpen.value = seed.exitPromptOpen
}

function leaveGame(): void {
  if (!canUndo.value) {
    gameStore.resetGame()
    return
  }
  exitPromptOpen.value = true
}

// `<NOM> JOUE` : le scoreboard revient sous le doigt, le CTA est au-dessus des panneaux
// — même grâce anti-tap fantôme que les autres fermetures de pop-up.
// Le chrono repart pour le jaune (décision de Nathan, 2026-09-11) : il avait été relancé
// au tap gagnant du blanc et tournait sous la pop-up — l'égalisatrice part de 40.
function acceptEqualizingReprise(): void {
  gameStore.acceptEqualizingReprise()
  resetTimer()
  lockPanels()
}

// Fin atteinte par une correction `+` (revue de fin d'Epic 10, décision de Nathan) : la
// pop-up est `revertible` et offre `ANNULER`, qui défait le `+` et rend le scoreboard sous
// le doigt — même grâce anti-tap fantôme que les autres fermetures. L'offre d'égalisatrice
// a alors TROIS issues : les deux choix passent en rang (variante liste, même accent), et
// `ANNULER` prend la place du secondaire — et comme sur toute pop-up à `ANNULER`, le tap
// dehors le vaut (règle de `PromptModal`). Sans risque pour la pop-up qui monte au
// `pointerdown` du `+` : la fermeture exige un geste complet, le `pointerup` de ce geste
// retombe sur le voile sans y avoir appuyé. Titre « A FINI » (Nathan, 2026-09-15), plus
// court que « a atteint sa distance » pour un nom qui peut être long.
const equalizingActions = computed<PromptAction[]>(() => [
  { id: 'play', label: `${player2.value.name} JOUE` },
  { id: 'finish', label: 'FIN DE PARTIE' },
])

function chooseEqualizingAction(id: string): void {
  if (id === 'play') acceptEqualizingReprise()
  else gameStore.finishGame()
}

function revertEnd(): void {
  gameStore.revertEndPrompt()
  lockPanels()
}

// `ANNULER` : le CTA est au-dessus des panneaux — même grâce anti-tap fantôme.
function closeExitPrompt(): void {
  exitPromptOpen.value = false
  lockPanels()
}

function confirmExit(): void {
  exitPromptOpen.value = false
  gameStore.finishGame()
}

// --- Recommencer (Story 1.15) ---
// Second picto de la barre, à côté de la sortie : la partie repart de zéro SUR PLACE —
// mêmes joueurs, mêmes distances, chacun du côté où il est — sans récap et sans passer par
// l'accueil (faux départ, échauffement, « on la refait »). Ce n'est PAS une fin de partie :
// `restartGame` ne passe jamais par `finished`. Sur un scoreboard intact (`canUndo` faux,
// même critère que la sortie directe), le picto est grisé par `disabled` — mais la garde
// est doublée ici, parce que les navigateurs ne s'accordent pas sur l'envoi des pointer
// events aux contrôles désactivés (Chromium en a changé en 2023) : `disabled` porte le
// visuel, la garde porte le comportement.
const restartPromptOpen = ref(false)

function askRestart(): void {
  if (!canUndo.value) return
  restartPromptOpen.value = true
}

// Les deux CTA de la pop-up sont au-dessus des panneaux et de la console — même grâce
// anti-tap fantôme. Après `RECOMMENCER`, le scoreboard NEUF revient sous le doigt : un
// `pointerup` tardif ou un second tap ne doit ni rendre la main ni corriger un score.
function closeRestartPrompt(): void {
  restartPromptOpen.value = false
  lockPanels()
}

function confirmRestart(): void {
  restartPromptOpen.value = false
  gameStore.restartGame()
  lockPanels()
}

// --- Barre latérale du récap (Story 10.5) ---
// Le contenu est fourni par l'ÉCRAN, jamais codé dans la barre (UX-DR31) : deux closures
// d'une ligne sur des actions de store qui existent déjà — rien à ajouter côté `useGameStore`.
// ⚠️ La barre vit ici et non dans `GameSummary`, qui est strictement présentationnel (AC6,
// verrouillé par un test lisant son source) : y mettre des items actionnables obligerait
// à des emits. C'est le même partage que sur les trois étapes de `HomeScreen`.
// `QUITTER` est dans le SLOT DE SORTIE, `RECOMMENCER` en item (décision 2 de Nathan,
// 2026-09-14) : écart assumé à la lettre d'UX-DR31, qui les liste dans l'ordre inverse —
// la convention de l'epic isole l'action la plus irréversible en bas, et la revanche est
// l'action fréquente. Aucune confirmation sur l'une ni sur l'autre (décision 4) : la
// partie est finie, il n'y a rien à perdre.
const SUMMARY_SIDEBAR_ITEMS: SideBarItem[] = [
  {
    id: 'restart',
    picto: 'rotate-ccw',
    label: 'RECOMMENCER',
    state: 'normal',
    action: () => gameStore.rematch(),
  },
]
const SUMMARY_SIDEBAR_EXIT: SideBarItem = {
  id: 'quit',
  picto: 'door',
  label: 'QUITTER',
  state: 'normal',
  action: () => gameStore.resetGame(),
}
</script>

<template>
  <div class="flex h-dvh w-full flex-col">
    <template v-if="status === 'idle'">
      <HomeScreen />
      <!-- Reprise après fermeture accidentelle (Story 1.12) : une sauvegarde lisible est
           proposée par-dessus l'accueil, sans croix — `ANNULER` est le retour, comme sur
           toutes les pop-ups de décision. Pas de grâce anti-tap fantôme : `REPRENDRE`
           remplace l'accueil par le scoreboard sous le doigt, et rien de destructif n'y
           est au contact. -->
      <PromptModal
        v-if="pendingRestore"
        title="PARTIE EN COURS"
        primaryLabel="REPRENDRE LA PARTIE"
        secondaryLabel="ANNULER"
        @primary="gameStore.resumeGame()"
        @secondary="gameStore.discardSavedGame()"
      />
    </template>

    <template v-else-if="status === 'playing'">
      <!-- Story 11.5 (AC2/AC3) : la gouttière entre les trois colonnes est UNE SEULE VALEUR
           (`--game-column-gutter`), et c'est ici qu'elle produit l'écart réel. `CenterPanel`
           la relit pour que la zone du chrono la TRAVERSE ; `PlayerPanel` ne la lit pas (la
           part qui tombe dans la gouttière tombe hors de la carte).
           LE GRAND BLOC (Nathan, au rendu, 2026-09-18, quatre passes de comparaison) : la
           partie du haut est une FORME, pas trois colonnes à fleur de bord — « les blocs
           michel, rep et j-pierre doivent aussi être dans un grand bloc en commun ». Rayon de
           ZONE dehors, rayon de BLOC sur ce qu'il contient : c'est l'écart entre les deux qui
           fait lire l'emboîtement. Exception à « conteneurs à angles vifs », datée et motivée
           dans `DESIGN.md` › Shapes — elle ne vaut QUE pour le scoreboard.
           La marge (`m-1`) et le retrait intérieur (`p-1`) s'écrivent en utilitaires de
           grille, PAS en token : une seule lecture chacune, rien à faire coïncider. Seule la
           gouttière est un token, parce qu'elle a trois lectures (`DESIGN.md` › Layout).
           ⚠️ AUCUN `overflow-hidden` ici : le rayon est porté par les blocs eux-mêmes, et un
           `overflow-hidden` sur cette rangée rognerait l'anneau du chrono SANS ERREUR. -->
      <div
        data-testid="game-columns"
        class="m-1 mb-0 flex min-h-0 flex-1 gap-(--game-column-gutter) rounded-zone border border-border bg-surface p-1"
      >
        <!-- Story 10.4 (AC4) : les cartes ne sont PLUS TAPABLES. Le passage de main est
             passé au CTA `PASSER LE TOUR` de la colonne centrale, seul geste possible —
             plus rien de destructif ne se déclenche au contact d'une carte.
             `side` ne sert qu'à la gouttière réservée au débordement de l'anneau (AC16). -->
        <PlayerPanel
          :player="leftPlayer"
          :active="activePlayer === leftId"
          :average="averages[leftId]"
          :bestSeries="bestSeries[leftId]"
          :showRemaining="isThreeCushions"
          side="left"
          :seriesValue="openSeries[leftId]"
          :entryValue="entryValueOf(leftId)"
          @adjust-score="adjustScore(leftId, $event)"
        />
        <CenterPanel
          :repriseNumber="repriseNumber"
          :secondsRemaining="shotClockSeconds"
          :passTurnDisabled="endPromptOpen"
          :entryOpen="entryOpen"
          @pass-turn="passTurn"
        />
        <PlayerPanel
          :player="rightPlayer"
          :active="activePlayer === rightId"
          :average="averages[rightId]"
          :bestSeries="bestSeries[rightId]"
          :showRemaining="isThreeCushions"
          side="right"
          :seriesValue="openSeries[rightId]"
          :entryValue="entryValueOf(rightId)"
          @adjust-score="adjustScore(rightId, $event)"
        />
      </div>

      <!-- Barre basse en pictos (AC12 à AC15) : un seul markup pour les deux côtés, la
           barre porte elle-même sa grille et ses quatre `IconAction`. La duplication CTA/SVG
           et les marges négatives qui recalaient les colonnes ont disparu avec elle (DT2). -->
      <ActionBar
        :ctaSide="ctaSide"
        :sideOwners="sideOwners"
        :ctaLabel="ctaLabel"
        :ctaTestId="ctaTestId"
        :canUndo="canUndo"
        :canRestart="canUndo"
        @cta="pressCta"
        @quit="leaveGame"
        @restart="askRestart"
        @undo="undoLastAction"
      />

      <!-- Pop-up de saisie LATÉRALE (AC9), posée du côté opposé à la carte du joueur qui a
           la main : cette carte reste entièrement visible et nette, et la valeur tapée s'y
           écrit entre `−` et `+`. Emits inchangés depuis `ScoreEntryModal` : le branchement
           ci-dessous n'a pas bougé d'une ligne. -->
      <ScoreEntryDock
        v-if="entryOpen"
        :currentInput="currentInput[activePlayer]"
        :align="entryAlign"
        :reserve="GAME_POPUP_RESERVE"
        @digit="gameStore.appendScoreDigit(activePlayer, $event)"
        @clear="gameStore.clearScoreInput(activePlayer)"
        @backspace="gameStore.backspaceScoreInput(activePlayer)"
        @validate="validateEntry"
        @cancel="cancelEntry"
      />

      <!-- Pop-ups de fin, APRÈS la saisie dans le template : elles montent au `pointerdown`
           de `VALIDER`, sous le doigt. Leur voile est inerte (AC18) — le `pointerup` qui
           retombe dessus est sans effet. Aucun handler sur ce voile. -->
      <PromptModal
        v-if="endPrompt?.kind === 'equalizing-offer' && endPrompt.revertible"
        :title="`${player1.name} A FINI`"
        ball="white"
        :actions="equalizingActions"
        secondaryLabel="ANNULER"
        @select="chooseEqualizingAction"
        @secondary="revertEnd"
      />
      <PromptModal
        v-else-if="endPrompt?.kind === 'equalizing-offer'"
        :title="`${player1.name} A FINI`"
        ball="white"
        :primaryLabel="`${player2.name} JOUE`"
        secondaryLabel="FIN DE PARTIE"
        @primary="acceptEqualizingReprise"
        @secondary="gameStore.finishGame()"
      />
      <PromptModal
        v-else-if="endPrompt?.kind === 'over'"
        title="PARTIE TERMINÉE"
        primaryLabel="VOIR LE RÉCAP"
        :secondaryLabel="endPrompt.revertible ? 'ANNULER' : undefined"
        @primary="gameStore.finishGame()"
        @secondary="revertEnd"
      />
      <!-- Pas de croix (revue de Nathan, 2026-09-10 : les croix ne sont pas intuitives pour
           les joueurs, un gros CTA l'est) : `ANNULER` est le retour, comme sur toutes les
           pop-ups de décision. -->
      <PromptModal
        v-if="exitPromptOpen"
        title="TERMINER LA PARTIE ?"
        primaryLabel="VOIR LE RÉCAP"
        secondaryLabel="ANNULER"
        @primary="confirmExit"
        @secondary="closeExitPrompt"
      />
      <!-- Recommencer ≠ terminer (Story 1.15) : la partie repart de zéro sur place, sans
           passer par `finished` — pas de récap, pas de vainqueur, pas de ligne d'historique
           (Epic 3). Même pop-up de décision : titre + deux CTA, ni message ni croix. -->
      <PromptModal
        v-if="restartPromptOpen"
        title="RECOMMENCER LA PARTIE ?"
        primaryLabel="RECOMMENCER"
        secondaryLabel="ANNULER"
        @primary="confirmRestart"
        @secondary="closeRestartPrompt"
      />
    </template>

    <!-- Récap : un ÉTAT de la partie qui remplace le scoreboard, pas une pop-up (AC13).
         Terminal : ni retour, ni `ANNULER` — une fin détectée n'est pas rattrapable
         (revue de Nathan, 2026-09-10), la correction se fait avant la série gagnante. -->
    <template v-else-if="status === 'finished'">
      <!-- Story 10.5 : le récap rejoint la coquille des écrans hors jeu — barre latérale
           collée au bord, panneau de contenu à contour. Le marine clair (niveau 1, Story 11.2)
           est porté par `<main>` et non par la coquille : la barre est le niveau 0, et un
           conteneur coloré sans marge intérieure est un constat du détecteur. La barre basse
           provisoire de la 10.4 a disparu avec ses deux boutons.
           Story 11.5 (Nathan, au rendu, 2026-09-19, « R1 ») : marge d'UNE unité autour du
           grand bloc, comme au scoreboard et au paramétrage (`p-4` → `p-1`). -->
      <div class="flex min-h-0 flex-1">
        <SideBar :items="SUMMARY_SIDEBAR_ITEMS" :exitItem="SUMMARY_SIDEBAR_EXIT" />

        <main class="flex min-w-0 flex-1 flex-col bg-bg-raised p-1">
          <GameSummary
            class="min-h-0 flex-1"
            :mode="mode"
            :player1="player1"
            :player2="player2"
            :averages="averages"
            :bestSeries="bestSeries"
            :repriseCounts="repriseCounts"
            :winner="winner"
            :whiteSide="whiteSide"
          />
        </main>
      </div>
    </template>
  </div>
</template>
