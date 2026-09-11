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
  gear: [
    'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
    'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6',
  ],
  close: ['M18 6 6 18', 'm6 6 12 12'],
  // Deux billes sous une double flèche : les billes s'échangent, les joueurs ne bougent pas.
  'swap-balls': [
    'M3 16a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
    'M13 16a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
    'M4 6h16',
    'm7 3-3 3 3 3',
    'm17 3 3 3-3 3',
  ],
  // Double flèche horizontale : les cartes changent de place.
  'swap-sides': ['m18 8 4 4-4 4', 'M2 12h20', 'm6 8-4 4 4 4'],
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
