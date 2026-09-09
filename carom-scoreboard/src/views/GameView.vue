<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import HomeScreen from '../components/HomeScreen.vue'
import ActionBar from '../components/ActionBar.vue'
import PlayerPanel from '../components/PlayerPanel.vue'
import CenterPanel from '../components/CenterPanel.vue'
import ScoreEntryModal from '../components/ScoreEntryModal.vue'

const gameStore = useGameStore()
const {
  status,
  player1,
  player2,
  activePlayer,
  reprises,
  currentInput,
  completedReprises,
  averages,
  bestSeries,
} = storeToRefs(gameStore)

// AC15 : la reprise est OUVERTE par le joueur blanc. Le numéro affiché compte donc les
// reprises terminées, pas les lignes du tableau : la série du seul joueur de gauche
// laisse l'affichage sur « REPRISE 1 », c'est la validation du jaune — qui rend la main
// au blanc — qui ouvre la suivante.
const repriseNumber = computed(() => completedReprises.value + 1)
const canUndo = computed(() => reprises.value.length > 0)

// État purement d'interface : l'ouverture de la popup ne fait pas partie de l'état de la
// partie, elle n'a donc rien à faire dans le store.
const entryOpen = ref(false)

// La saisie porte toujours sur le joueur qui a la main.
const entryPlayer = computed(() => (activePlayer.value === 'player1' ? player1.value : player2.value))

// ⚠️ Le CTA se place du côté du joueur qui N'A PAS la main : au billard, c'est
// l'adversaire assis qui compte les points de celui qui joue. Le bouton est donc à
// l'opposé du liseré de tour actif, et la sortie occupe l'autre colonne.
const entrySide = computed(() => (activePlayer.value === 'player1' ? 'player2' : 'player1'))

// ⚠️ Tap fantôme (revue de code du 2026-09-09) : quand la pop-up se referme d'elle-même
// à l'auto-validation, le tour a basculé et un doigt qui arrive juste après sur
// l'emplacement d'une touche atterrit sur le panneau adverse, qui enregistrerait une
// série de 0 et rebasculerait le tour — irrattrapable tant qu'`ANNULER` (1.8) n'existe
// pas. Après TOUTE fermeture de la pop-up, les panneaux ignorent donc les appuis pendant
// une courte grâce, invisible pour l'utilisateur.
const PANEL_GRACE_MS = 300
let panelsLockedUntil = 0

function closeEntry(): void {
  entryOpen.value = false
  panelsLockedUntil = Date.now() + PANEL_GRACE_MS
}

function panelsAcceptInput(): boolean {
  return Date.now() >= panelsLockedUntil
}

function passTurn(): void {
  if (!panelsAcceptInput()) return
  gameStore.passTurn()
}

function adjustScore(playerId: 'player1' | 'player2', delta: number): void {
  if (!panelsAcceptInput()) return
  gameStore.adjustScore(playerId, delta)
}

function openEntry(): void {
  // Repartir d'un buffer propre : une saisie abandonnée ne doit pas réapparaître.
  gameStore.clearScoreInput(activePlayer.value)
  entryOpen.value = true
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

// Sortie réduite à un picto (porte + flèche, signalétique d'évacuation) : elle ne doit
// pas peser autant que le CTA de saisie, mais reste une vraie zone tactile.
const EXIT_BUTTON_CLASSES =
  'flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] items-center justify-center rounded-2xl bg-white/10 text-white touch-manipulation select-none active:bg-white/20'

function leaveGame(): void {
  gameStore.resetGame()
}
</script>

<template>
  <div class="flex h-dvh w-full flex-col">
    <HomeScreen v-if="status === 'idle'" />

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
          @swap-players="gameStore.swapPlayers()"
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
            <div class="flex w-2/5 justify-start">
              <button
                v-if="entrySide === 'player1'"
                data-testid="add-points-button"
                data-side="player1"
                class="flex w-full min-h-[var(--size-touch-target)] items-center justify-center rounded-2xl px-4 text-label font-black tracking-[0.1em] bg-accent text-on-accent touch-manipulation select-none active:brightness-90"
                @pointerdown="openEntry"
              >
                AJOUTER LES POINTS
              </button>
              <button
                v-else
                data-testid="exit-button"
                data-side="player1"
                aria-label="Quitter la partie"
                class="ml-4"
                :class="EXIT_BUTTON_CLASSES"
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
            </div>

            <div class="w-1/5 shrink-0" />

            <div class="flex w-2/5 justify-end">
              <button
                v-if="entrySide === 'player2'"
                data-testid="add-points-button"
                data-side="player2"
                class="flex w-full min-h-[var(--size-touch-target)] items-center justify-center rounded-2xl px-4 text-label font-black tracking-[0.1em] bg-accent text-on-accent touch-manipulation select-none active:brightness-90"
                @pointerdown="openEntry"
              >
                AJOUTER LES POINTS
              </button>
              <button
                v-else
                data-testid="exit-button"
                data-side="player2"
                aria-label="Quitter la partie"
                class="mr-4"
                :class="EXIT_BUTTON_CLASSES"
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
    </template>
  </div>
</template>
