<script setup lang="ts">
import { computed } from 'vue'

// Story 2.1 : chrono de tir du 3 Bandes (FR13, UX-DR4). Anneau SVG classique (cercle +
// `stroke-dasharray`/`stroke-dashoffset`), inspiré du « SHOT CLOCK » circulaire du CUESCO
// — forme retenue, pas ses couleurs : rouge LED sur fond NOIR littéral (`bg-black`, pas
// `bg-bg` qui est un gris-bleu). Pas de librairie, comme les icônes SVG inline de
// `GameView.vue`. La barre segmentée du Billiboard a été écartée (paliers visibles) : la
// transition CSS d'une seconde, calée sur le tick de `useTimer`, donne un mouvement continu.
const props = defineProps<{ secondsRemaining: number; totalSeconds: number }>()

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const dashoffset = computed(() => {
  const ratio = Math.max(0, Math.min(1, props.secondsRemaining / props.totalSeconds))
  return CIRCUMFERENCE * (1 - ratio)
})
</script>

<template>
  <div data-testid="shot-clock" class="flex w-full flex-col items-center gap-1">
    <span data-testid="shot-clock-label" class="text-stat text-alert/70">CHRONO</span>
    <div
      class="relative flex aspect-square w-full items-center justify-center rounded-full bg-black"
      role="img"
      :aria-label="`Chronomètre de série : ${secondsRemaining} secondes restantes`"
    >
      <!-- `-rotate-90` fait partir le tracé de midi : l'anneau se vide en tournant. -->
      <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke-width="8" class="stroke-alert/20" />
        <circle
          data-testid="shot-clock-arc"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke-width="8"
          stroke-linecap="round"
          class="stroke-alert transition-[stroke-dashoffset] duration-1000 ease-linear"
          :style="{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashoffset }"
        />
      </svg>
      <!-- `text-reprise` : dimensionné pour la colonne `w-1/5`, comme le compteur REP. -->
      <span
        data-testid="shot-clock-value"
        class="relative text-reprise leading-none font-black tabular-nums text-alert"
        >{{ secondsRemaining }}</span
      >
    </div>
  </div>
</template>
