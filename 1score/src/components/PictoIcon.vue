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
  // Boucle de rafraîchissement : CHANGER DE BILLE (picto de la référence coréenne,
  // revue de rendu 10.3 — les deux ronds barrés d'une flèche étaient illisibles à 24 px).
  refresh: [
    'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
    'M8 16H3v5',
  ],
  // Deux flèches croisées : CHANGER DE CÔTÉ, les joueurs échangent leur place.
  'arrow-right-left': ['m16 3 4 4-4 4', 'M20 7H4', 'm8 21-4-4 4-4', 'M4 17h16'],
  // Chevron seul, sans hampe : la pointe du CTA de démarrage (revue de rendu 10.3).
  'chevron-right': ['m9 18 6-6-6-6'],
  // Barre basse du scoreboard (Story 10.4). `door` reprend le tracé « sortie » (porte +
  // flèche, signalétique d'évacuation) et `rotate-ccw` la flèche circulaire de RECOMMENCER
  // qui vivaient tous deux en SVG inline dans `GameView.vue` jusqu'à la refonte de la barre.
  // ⚠️ `rotate-ccw` n'est PAS `refresh` : celui-ci est la boucle DOUBLE de CHANGER DE BILLE.
  door: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5', 'M21 12H9'],
  'rotate-ccw': ['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'],
  // Flèche retour courbe : ANNULER (undo multi-niveaux).
  undo: ['M9 14 4 9l5-5', 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'],
  // PASSER LE TOUR : la BOUCLE CIRCULAIRE à deux flèches du CTA `턴넘기기` de Billiboard
  // (1re passe de rendu, Nathan : « prends le picto de billiboard »). Même tracé que
  // `refresh` — les deux disent « la main tourne » — mais nommé à part : `refresh` sert
  // CHANGER DE BILLE au paramétrage, et les deux écrans ne se croisent jamais. Ne pas les
  // fusionner : ils divergeront au premier ajustement de l'un des deux.
  'pass-turn': [
    'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
    'M8 16H3v5',
  ],
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
