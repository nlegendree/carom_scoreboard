<script setup lang="ts">
import ShotClock from './ShotClock.vue'
import { SHOT_CLOCK_SECONDS } from '../composables/useTimer'

// Le mode de jeu n'est plus affiché ici (décision du 2026-09-09) : la colonne est
// réservée à ce qui change en cours de partie.
// `secondsRemaining` (Story 2.1) : chrono de tir du 3 Bandes, `null` dans les autres
// modes — c'est la vue qui filtre par mode, la console reste générique.
defineProps<{
  repriseNumber: number
  canUndo: boolean
  secondsRemaining: number | null
}>()

// `undo` : `ANNULER` revient d'UNE action en arrière à chaque appui (Story 1.7) ; la vue
// le branche sur `undoLastAction()`. Grisé (`disabled`) à pile vide, jamais inerte en
// silence.
const emit = defineEmits<{ undo: []; 'swap-players': [] }>()
</script>

<template>
  <div class="flex w-1/5 min-w-0 shrink-0 flex-col items-center justify-center gap-4 bg-bg p-2">
    <div class="flex w-full min-w-0 flex-col items-center">
      <span data-testid="reprise-label" class="text-stat text-white/60">REP</span>
      <!-- `text-reprise` est dimensionné pour la colonne (w-1/5) et non pour un panneau
           joueur : `text-score` (plancher 120px) déborde dès 2 chiffres sur tablette. -->
      <span
        data-testid="reprise-number"
        class="w-full text-center text-reprise leading-none font-black tabular-nums text-white"
        >{{ repriseNumber }}</span
      >
    </div>

    <!-- Story 2.1 : anneau du chrono de tir, uniquement en 3 Bandes (UX-DR4). Empilé
         sous REP, au-dessus des commandes — reste monté à 0 (anneau vide, AC7). -->
    <ShotClock
      v-if="secondsRemaining !== null"
      :secondsRemaining="secondsRemaining"
      :totalSeconds="SHOT_CLOCK_SECONDS"
    />

    <button
      data-testid="undo-button"
      :disabled="!canUndo"
      class="flex min-h-[var(--size-touch-target)] w-full items-center justify-center rounded-lg px-4 text-stat font-bold text-white bg-white/10 touch-manipulation select-none disabled:opacity-30"
      @pointerdown="emit('undo')"
    >
      ANNULER
    </button>

    <!-- Disponible pendant TOUTE la partie : il ne disparaît plus à la première série,
         pour permettre de corriger un côté à tout moment. Hors pile d'annulation : il est
         son propre inverse, on rappuie dessus pour revenir (décision du 2026-09-09).
         Un mot, pas de glyphe — comme ANNULER. -->
    <button
      data-testid="swap-players-button"
      class="flex min-h-[var(--size-touch-target)] w-full items-center justify-center rounded-lg px-4 text-stat font-bold text-on-accent bg-accent touch-manipulation select-none"
      @pointerdown="emit('swap-players')"
    >
      ÉCHANGER
    </button>
  </div>
</template>
