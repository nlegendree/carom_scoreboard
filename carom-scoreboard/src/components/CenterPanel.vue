<script setup lang="ts">
import { GAME_MODE_LABELS, type GameMode } from '../types/game'

defineProps<{
  mode: GameMode
  repriseNumber: number
  canUndo: boolean
  canSwapPlayers: boolean
}>()

// `undo` est émis mais volontairement non écouté jusqu'à la Story 1.8, qui branchera
// l'annulation (note de périmètre correspondante ajoutée dans epics.md).
const emit = defineEmits<{ undo: []; 'swap-players': [] }>()
</script>

<template>
  <div class="flex w-1/5 min-w-0 shrink-0 flex-col items-center justify-center gap-4 bg-bg p-2">
    <span class="text-stat font-bold text-white">{{ GAME_MODE_LABELS[mode] }}</span>

    <div class="flex w-full min-w-0 flex-col items-center">
      <span class="text-stat text-white/60">REPRISE</span>
      <!-- `text-reprise` est dimensionné pour la colonne (w-1/5) et non pour un panneau
           joueur : `text-score` (plancher 120px) déborde dès 2 chiffres sur tablette. -->
      <span
        data-testid="reprise-number"
        class="w-full text-center text-reprise leading-none font-black tabular-nums text-white"
        >{{ repriseNumber }}</span
      >
    </div>

    <button
      data-testid="undo-button"
      :disabled="!canUndo"
      class="flex min-h-[var(--size-touch-target)] w-full items-center justify-center gap-2 rounded-lg px-4 text-stat font-bold text-white bg-white/10 touch-manipulation select-none disabled:opacity-30"
      @pointerdown="emit('undo')"
    >
      ↩ ANNULER
    </button>

    <button
      v-if="canSwapPlayers"
      data-testid="swap-players-button"
      class="flex min-h-[var(--size-touch-target)] w-full items-center justify-center gap-2 rounded-lg px-4 text-stat font-bold text-on-accent bg-accent touch-manipulation select-none"
      @pointerdown="emit('swap-players')"
    >
      ⇄ BLANC / JAUNE
    </button>
  </div>
</template>
