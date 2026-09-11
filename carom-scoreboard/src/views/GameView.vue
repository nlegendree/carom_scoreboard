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
import ScoreEntryModal from '../components/ScoreEntryModal.vue'
import PromptModal from '../components/PromptModal.vue'
import GameSummary from '../components/GameSummary.vue'
import type { PlayerId } from '../types/game'

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
  repriseCounts,
  canUndo,
  endPrompt,
  winner,
  pendingRestore,
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
const ctaLabel = computed(() => (isThreeCushions.value ? '+1 POINT' : 'AJOUTER LES POINTS'))
// `canUndo` vient du store, pas d'un `computed` local sur `reprises` : celui-ci resterait
// actif après avoir tout annulé, et inactif après une simple correction (Story 1.7).

// L'ouverture de la pop-up de saisie vit dans le STORE depuis la 1.12 (`entryOpen`) :
// c'est le seul moyen de la rouvrir, buffer compris, à la reprise après une fermeture
// pendant la saisie (décision 3 de Nathan, 2026-09-10).

// La saisie porte toujours sur le joueur qui a la main.
const entryPlayer = computed(() => (activePlayer.value === 'player1' ? player1.value : player2.value))

// ⚠️ Le CTA se place du côté du joueur qui N'A PAS la main : au billard, c'est
// l'adversaire assis qui compte les points de celui qui joue. Le bouton est donc à
// l'opposé du liseré de tour actif, et la sortie occupe l'autre colonne.
const entrySide = computed(() => (activePlayer.value === 'player1' ? 'player2' : 'player1'))

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

function addPoint(): void {
  tap()
  gameStore.incrementSeries()
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

function swapPlayers(): void {
  if (!panelsAcceptInput()) return
  gameStore.swapPlayers()
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

// Pictos de la barre basse — sortie (porte + flèche, signalétique d'évacuation) et, depuis
// la 1.15, RECOMMENCER (flèche circulaire) : ils ne doivent pas peser autant que le CTA
// de saisie, mais restent de vraies zones tactiles (`≥ 90×90 px`).
const PICTO_BUTTON_CLASSES =
  'flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] items-center justify-center rounded-2xl bg-white/10 text-white touch-manipulation select-none active:bg-white/20'

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

function leaveGame(): void {
  if (!canUndo.value) {
    gameStore.resetGame()
    return
  }
  exitPromptOpen.value = true
}

// `<NOM> JOUE` : le scoreboard revient sous le doigt, le CTA est au-dessus des panneaux
// — même grâce anti-tap fantôme que les autres fermetures de pop-up.
function acceptEqualizingReprise(): void {
  gameStore.acceptEqualizingReprise()
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
      <div class="flex min-h-0 flex-1">
        <!-- On rend la main en tapant la zone de l'ADVERSAIRE : le panneau inactif émet,
             celui qui a déjà la main reste inerte (garde dans `PlayerPanel`). -->
        <PlayerPanel
          :player="player1"
          :active="activePlayer === 'player1'"
          :average="averages.player1"
          :bestSeries="bestSeries.player1"
          @pass-turn="passTurn"
          @adjust-score="adjustScore('player1', $event)"
        />
        <CenterPanel
          :repriseNumber="repriseNumber"
          :canUndo="canUndo"
          :secondsRemaining="shotClockSeconds"
          @undo="undoLastAction"
          @swap-players="swapPlayers"
        />
        <PlayerPanel
          :player="player2"
          :active="activePlayer === 'player2'"
          :average="averages.player2"
          :bestSeries="bestSeries.player2"
          @pass-turn="passTurn"
          @adjust-score="adjustScore('player2', $event)"
        />
      </div>

      <!-- Le retour d'`ActionBar` est désactivé : en partie, la sortie change de côté
           avec le CTA, elle ne peut donc pas rester à la place fixe de la barre. -->
      <ActionBar :showBack="false">
        <template #actions>
          <!-- Deux colonnes calées sur les panneaux (2/5 · 1/5 · 2/5). Les marges
               négatives annulent le padding de la barre : sans elles, la colonne est plus
               étroite que le bloc joueur et le CTA ne s'aligne pas dessus.
               Le CTA occupe TOUTE la largeur de la colonne du joueur assis ; la sortie
               tient l'autre. Les deux échangent de place à chaque bascule. -->
          <div class="-mx-4 flex flex-1 items-center">
            <div class="flex w-2/5 justify-start gap-2">
              <button
                v-if="entrySide === 'player1'"
                :data-testid="ctaTestId"
                data-side="player1"
                class="flex w-full min-h-[var(--size-touch-target)] items-center justify-center rounded-2xl px-4 text-label font-black tracking-[0.1em] bg-accent text-on-accent touch-manipulation select-none active:brightness-90"
                @pointerdown="pressCta"
              >
                {{ ctaLabel }}
              </button>
              <!-- Deux pictos (1.15) : la sortie garde le bord extérieur, RECOMMENCER
                   vient vers l'intérieur — `gap-2` = 16 px (`--spacing: 8px`). Markup
                   dupliqué par colonne, dette connue (revue 1.5), pas de refactor ici. -->
              <template v-else>
                <button
                  data-testid="exit-button"
                  data-side="player1"
                  aria-label="Quitter la partie"
                  class="ml-4"
                  :class="PICTO_BUTTON_CLASSES"
                  @pointerdown="leaveGame"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    class="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
                <button
                  data-testid="restart-button"
                  data-side="player1"
                  aria-label="Recommencer la partie"
                  :disabled="!canUndo"
                  class="disabled:opacity-30"
                  :class="PICTO_BUTTON_CLASSES"
                  @pointerdown="askRestart"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    class="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
              </template>
            </div>

            <div class="w-1/5 shrink-0" />

            <div class="flex w-2/5 justify-end gap-2">
              <button
                v-if="entrySide === 'player2'"
                :data-testid="ctaTestId"
                data-side="player2"
                class="flex w-full min-h-[var(--size-touch-target)] items-center justify-center rounded-2xl px-4 text-label font-black tracking-[0.1em] bg-accent text-on-accent touch-manipulation select-none active:brightness-90"
                @pointerdown="pressCta"
              >
                {{ ctaLabel }}
              </button>
              <template v-else>
                <button
                  data-testid="restart-button"
                  data-side="player2"
                  aria-label="Recommencer la partie"
                  :disabled="!canUndo"
                  class="disabled:opacity-30"
                  :class="PICTO_BUTTON_CLASSES"
                  @pointerdown="askRestart"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    class="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                </button>
                <button
                  data-testid="exit-button"
                  data-side="player2"
                  aria-label="Quitter la partie"
                  class="mr-4"
                  :class="PICTO_BUTTON_CLASSES"
                  @pointerdown="leaveGame"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    class="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </template>
            </div>
          </div>
        </template>
      </ActionBar>

      <ScoreEntryModal
        v-if="entryOpen"
        :color="entryPlayer.color"
        :name="entryPlayer.name"
        :currentInput="currentInput[activePlayer]"
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
        v-if="endPrompt?.kind === 'equalizing-offer'"
        :title="`${player1.name} A ATTEINT SA DISTANCE`"
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
        @primary="gameStore.finishGame()"
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
      <GameSummary
        class="min-h-0 flex-1"
        :mode="mode"
        :player1="player1"
        :player2="player2"
        :averages="averages"
        :bestSeries="bestSeries"
        :repriseCounts="repriseCounts"
        :winner="winner"
      />

      <ActionBar :showBack="false">
        <template #actions>
          <div class="flex flex-1 items-center justify-between gap-4">
            <button
              data-testid="end-game-button"
              class="min-h-[var(--size-touch-target)] rounded-2xl bg-white/10 px-10 text-label font-black text-white touch-manipulation select-none active:bg-white/20"
              @pointerdown="gameStore.resetGame()"
            >
              FIN DE PARTIE
            </button>
            <button
              data-testid="rematch-button"
              class="min-h-[var(--size-touch-target)] rounded-2xl bg-accent px-10 text-label font-black text-on-accent touch-manipulation select-none active:brightness-90"
              @pointerdown="gameStore.rematch()"
            >
              UNE PARTIE DE PLUS
            </button>
          </div>
        </template>
      </ActionBar>
    </template>
  </div>
</template>
