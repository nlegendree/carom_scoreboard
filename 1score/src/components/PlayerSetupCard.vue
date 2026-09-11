<script setup lang="ts">
import type { PlayerColor, TableSide } from '../types/game'

// Carte de paramétrage d'un joueur (Story 10.3, UX-DR38). Disposition d'après
// `billiboard_player_3.png` : bloc plein à la couleur de la bille, pastille de bille en
// haut, grand médaillon rond sombre au centre portant les deux champs empilés.
// Strictement PRÉSENTATIONNELLE — aucun accès au store, aucune règle de saisie : elle
// affiche ce qu'on lui donne et dit quel champ a été tapé. Les règles (plafonds, espaces,
// première frappe qui remplace) vivent dans `NumericPadDock` et `AlphaKeyboardSheet`.
//
// `side` sert au seul `data-testid` : la carte ne se dessine pas différemment à gauche ou
// à droite. `ball` et `side` se dissocient dès qu'on tape CHANGER DE BILLE — d'où
// l'attribut `data-ball`, qui garde la bille lisible en test comme à l'œil.
defineProps<{
  side: TableSide
  ball: PlayerColor
  name: string
  // Chaîne et non nombre : `''` est « rien de réglé », ce qu'aucun nombre ne distingue
  // de 0 — c'est le même buffer que celui du dock.
  distance: string
  focusedField: 'name' | 'distance' | null
}>()

const emit = defineEmits<{ focus: [field: 'name' | 'distance'] }>()

// Classes écrites en toutes lettres, jamais construites à la volée : le scanner JIT de
// Tailwind 4 ne voit que ce qui est écrit tel quel dans le source.
const CARD_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white text-on-player-white',
  yellow: 'bg-player-yellow text-on-player-yellow',
}
// La bille elle-même, posée sur une platine sombre : un disque blanc à même la carte
// blanche serait invisible, et c'est précisément quand les cartes ont changé de côté que
// la pastille doit rester lisible.
const PELLET_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
}

// Le champ visé se signale par une PRÉSENCE (liseré), pas par une teinte de fond seule :
// même signal non chromatique que l'indicateur de tour (UX-DR22).
function fieldClasses(field: 'name' | 'distance', focused: 'name' | 'distance' | null): string {
  return field === focused ? 'border-turn-active' : 'border-white/20'
}
</script>

<template>
  <div
    :data-testid="`player-card-${side}`"
    :data-ball="ball"
    class="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-2 border border-border p-2"
    :class="CARD_CLASSES[ball]"
  >
    <!-- Platine sombre de 64 px portant la bille : `data-testid` sur la platine, la bille
         est son unique enfant. -->
    <span
      data-testid="ball-pellet"
      aria-hidden="true"
      class="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-bg"
    >
      <span class="size-6 rounded-full" :class="PELLET_CLASSES[ball]" />
    </span>

    <!-- Médaillon sombre (disposition Billiboard) : les deux champs y sont empilés,
         encadrés par le disque. `aspect-square` le garde ROND quand la carte a de la
         hauteur ; `max-h-full` le fait s'aplatir en ellipse plutôt que DÉBORDER quand le
         bandeau de nom réduit les cartes — les champs restent alors dans la carte. -->
    <div
      data-testid="player-medallion"
      class="flex aspect-square min-h-0 w-full max-h-full shrink flex-col items-center justify-center gap-2 rounded-full bg-bg/90 p-2"
    >
      <button
        data-testid="name-field"
        class="flex min-h-[57px] w-4/5 max-h-[var(--size-touch-target)] flex-1 flex-col items-center justify-center gap-0.5 rounded-cta border-2 px-2 text-center touch-manipulation select-none"
        :class="fieldClasses('name', focusedField)"
        @pointerdown="emit('focus', 'name')"
      >
        <span class="text-stat font-bold tracking-[0.2em] text-white/40">NOM</span>
        <span
          data-testid="name-value"
          class="w-full truncate text-label font-black uppercase"
          :class="name ? 'text-white' : 'text-white/25'"
          >{{ name || 'JOUEUR' }}</span
        >
      </button>

      <button
        data-testid="distance-field"
        class="flex min-h-[57px] w-4/5 max-h-[var(--size-touch-target)] flex-1 flex-col items-center justify-center gap-0.5 rounded-cta border-2 px-2 text-center touch-manipulation select-none"
        :class="fieldClasses('distance', focusedField)"
        @pointerdown="emit('focus', 'distance')"
      >
        <span class="text-stat font-bold tracking-[0.2em] text-white/40">DISTANCE</span>
        <span
          data-testid="distance-value"
          class="w-full truncate text-label font-black tabular-nums"
          :class="distance ? 'text-white' : 'text-white/25'"
          >{{ distance || '0' }}</span
        >
      </button>
    </div>
  </div>
</template>
