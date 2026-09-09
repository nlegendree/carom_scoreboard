<script setup lang="ts">
// Le mode de jeu n'est plus affiché ici (décision du 2026-09-09) : la colonne est
// réservée à ce qui change en cours de partie.
defineProps<{
  repriseNumber: number
  canUndo: boolean
}>()

// `undo` est émis mais volontairement non écouté jusqu'à la Story 1.8, qui branchera
// l'annulation (note de périmètre correspondante ajoutée dans epics.md).
const emit = defineEmits<{ undo: []; 'swap-players': [] }>()
</script>

<template>
  <div class="flex w-1/5 min-w-0 shrink-0 flex-col items-center justify-center gap-4 bg-bg p-2">
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

    <!-- Disponible pendant TOUTE la partie : il ne disparaît plus à la première série,
         pour permettre de corriger un côté à tout moment. -->
    <button
      data-testid="swap-players-button"
      class="flex min-h-[var(--size-touch-target)] w-full items-center justify-center gap-2 rounded-lg px-4 text-stat font-bold text-on-accent bg-accent touch-manipulation select-none"
      @pointerdown="emit('swap-players')"
    >
      ⇄ ÉCHANGER
    </button>
  </div>
</template>
