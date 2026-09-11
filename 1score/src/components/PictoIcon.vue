<script setup lang="ts">
import type { PictoName } from '../types/ui'

// Jeu de pictos de l'Epic 10, en SVG inline : aucune ressource réseau (offline). La taille
// vient de la classe posée par le parent (`size-4` = 32px), la couleur de `currentColor`.
defineProps<{ name: PictoName }>()

// Tracés de Lucide (licence ISC), viewBox 24, trait 2px, sans remplissage.
const PATHS: Record<PictoName, readonly string[]> = {
  training: [
    'M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
    'M6 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0',
    'M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  ],
  signup: [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
    'M19 8v6',
    'M22 11h-6',
  ],
  power: ['M12 2v10', 'M18.4 6.6a9 9 0 1 1-12.77.04'],
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7'],
}
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="d in PATHS[name]" :key="d" :d="d" />
  </svg>
</template>
