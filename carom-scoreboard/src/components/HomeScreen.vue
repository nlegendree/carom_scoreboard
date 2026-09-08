<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import ActionBar from './ActionBar.vue'
import {
  GAME_CATEGORIES,
  GAME_MODE_LABELS,
  isCategoryAvailable,
  type GameCategoryDescriptor,
  type GameMode,
  type GameModeDescriptor,
} from '../types/game'

const DEFAULT_PLAYER1_NAME = 'JOUEUR 1'
const DEFAULT_PLAYER2_NAME = 'JOUEUR 2'

const gameStore = useGameStore()

const step = ref<'category' | 'mode' | 'players'>('category')
const selectedCategory = ref<GameCategoryDescriptor | null>(null)
const selectedMode = ref<GameMode>('libre')
// Valeur brute de saisie : la mise en majuscule est purement visuelle (classe `uppercase`)
// pour ne pas réécrire l'input à chaque frappe, ce qui replacerait le caret en fin de champ.
// La normalisation réelle a lieu une seule fois, dans `confirm()`.
const player1Name = ref(DEFAULT_PLAYER1_NAME)
const player2Name = ref(DEFAULT_PLAYER2_NAME)

const categoryModes = computed(() => selectedCategory.value?.modes ?? [])
const headerTitle = computed(() => {
  if (step.value === 'mode') return selectedCategory.value?.label
  if (step.value === 'players') return GAME_MODE_LABELS[selectedMode.value]
  return undefined
})

function goHome(): void {
  step.value = 'category'
  selectedCategory.value = null
}

function selectCategory(category: GameCategoryDescriptor): void {
  if (!isCategoryAvailable(category)) return

  selectedCategory.value = category

  const onlyMode = category.modes.length === 1 ? category.modes[0] : null
  if (onlyMode) {
    selectedMode.value = onlyMode.id
    step.value = 'players'
    return
  }

  step.value = 'mode'
}

function selectMode(mode: GameModeDescriptor): void {
  if (!mode.available) return

  selectedMode.value = mode.id
  step.value = 'players'
}

function back(): void {
  if (step.value === 'players' && categoryModes.value.length > 1) {
    step.value = 'mode'
    return
  }
  goHome()
}

function normalizeName(raw: string, fallback: string): string {
  return raw.trim().toUpperCase() || fallback
}

function confirm(): void {
  gameStore.startGame(
    selectedMode.value,
    normalizeName(player1Name.value, DEFAULT_PLAYER1_NAME),
    normalizeName(player2Name.value, DEFAULT_PLAYER2_NAME),
  )
}
</script>

<template>
  <div class="flex h-full w-full flex-col bg-bg">
    <header class="flex shrink-0 items-center gap-4 p-4">
      <img
        v-if="step === 'category'"
        src="/logo.png"
        alt="Carom Scoreboard"
        class="h-16 w-16 rounded-xl md:h-20 md:w-20"
      />
      <h1 v-if="headerTitle" class="text-label font-black tracking-widest text-white">
        {{ headerTitle }}
      </h1>
    </header>

    <main class="flex flex-1 flex-col justify-end overflow-hidden">
      <section
        v-if="step === 'category'"
        data-testid="step-category"
        class="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4"
      >
        <button
          v-for="category in GAME_CATEGORIES"
          :key="category.id"
          :data-testid="`category-${category.id}`"
          :disabled="!isCategoryAvailable(category)"
          class="flex min-h-[var(--size-touch-target)] flex-col items-start justify-center gap-1 bg-bg p-6 text-left touch-manipulation select-none disabled:opacity-40"
          @pointerdown="selectCategory(category)"
        >
          <span class="text-label font-bold text-white">{{ category.label }}</span>
          <span class="text-stat text-white/60">{{ category.hint }}</span>
          <span v-if="!isCategoryAvailable(category)" class="text-stat text-white/40">BIENTÔT</span>
        </button>
      </section>

      <section
        v-else-if="step === 'mode'"
        data-testid="step-mode"
        class="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-3"
      >
        <button
          v-for="mode in categoryModes"
          :key="mode.id"
          :data-testid="`mode-${mode.id}`"
          :disabled="!mode.available"
          class="flex min-h-[var(--size-touch-target)] flex-col items-center justify-center gap-1 bg-bg p-6 text-label font-bold text-white touch-manipulation select-none disabled:opacity-40"
          @pointerdown="selectMode(mode)"
        >
          {{ mode.label }}
          <span v-if="!mode.available" class="text-stat font-normal text-white/40">BIENTÔT</span>
        </button>
      </section>

      <!-- Étape joueurs : deux grands panneaux portant déjà la bille de leur côté,
           préfigurant la sélection depuis la base joueurs du club (Epic 4). -->
      <section
        v-else
        data-testid="step-players"
        class="flex flex-1 flex-col gap-px bg-white/10 md:flex-row"
      >
        <label class="flex flex-1 flex-col justify-between bg-player-white p-6 text-on-player-white">
          <span class="text-stat font-bold opacity-60">BILLE BLANCHE</span>
          <input
            v-model="player1Name"
            data-testid="player1-name-input"
            maxlength="20"
            class="w-full bg-transparent text-label font-black uppercase outline-none"
          />
        </label>

        <label
          class="flex flex-1 flex-col justify-between bg-player-yellow p-6 text-on-player-yellow"
        >
          <span class="text-stat font-bold opacity-60">BILLE JAUNE</span>
          <input
            v-model="player2Name"
            data-testid="player2-name-input"
            maxlength="20"
            class="w-full bg-transparent text-label font-black uppercase outline-none"
          />
        </label>
      </section>
    </main>

    <ActionBar :showBack="step !== 'category'" @back="back">
      <template #actions>
        <button
          v-if="step === 'players'"
          data-testid="confirm-button"
          class="min-h-[var(--size-touch-target)] bg-accent px-10 text-label font-black text-on-accent touch-manipulation select-none"
          @pointerdown="confirm"
        >
          DÉMARRER
        </button>
      </template>
    </ActionBar>
  </div>
</template>
