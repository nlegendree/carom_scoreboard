<script setup lang="ts">
import type { PlayerColor, TableSide } from '../types/game'

// Carte de paramétrage d'un joueur (Story 10.3, UX-DR38). Bloc plein à la couleur de la
// bille, portant en son CENTRE les deux champs `NOM` et `DISTANCE`, chacun en box à fondu
// grisé. Strictement PRÉSENTATIONNELLE — aucun accès au store, aucune règle de saisie :
// elle affiche ce qu'on lui donne et dit quel champ a été tapé. Les règles (plafonds,
// espaces, première frappe qui remplace) vivent dans `NumericPadDock` et
// `AlphaKeyboardSheet`.
//
// Revue de rendu de Nathan (2026-09-12) : la pastille de bille et le grand médaillon rond
// sombre de la première passe sont RETIRÉS — la couleur pleine de la carte dit déjà la
// bille, le reste alourdissait. Les champs sont simplement centrés.
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

// Le champ visé se signale par une PRÉSENCE (liseré), pas par une teinte de fond seule :
// même signal non chromatique que l'indicateur de tour (UX-DR22). Conservé tel quel à la
// revue de rendu du 2026-09-12 (« bonne idée […] on garde ça »).
function fieldClasses(field: 'name' | 'distance', focused: 'name' | 'distance' | null): string {
  return field === focused ? 'border-turn-active' : 'border-white/20'
}
</script>

<template>
  <div
    :data-testid="`player-card-${side}`"
    :data-ball="ball"
    class="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 border border-border p-4"
    :class="CARD_CLASSES[ball]"
  >
    <button
      data-testid="name-field"
      class="flex min-h-[var(--size-touch-target)] w-full max-w-md flex-col items-center justify-center gap-1 rounded-cta border-2 bg-(image:--gradient-field) px-3 py-2 text-center touch-manipulation select-none"
      :class="fieldClasses('name', focusedField)"
      @pointerdown="emit('focus', 'name')"
    >
      <span class="text-stat font-bold tracking-[0.2em] text-white/45">NOM</span>
      <span
        data-testid="name-value"
        class="w-full truncate text-label font-black uppercase"
        :class="name ? 'text-white' : 'text-white/25'"
        >{{ name || 'JOUEUR' }}</span
      >
    </button>

    <button
      data-testid="distance-field"
      class="flex min-h-[var(--size-touch-target)] w-full max-w-md flex-col items-center justify-center gap-1 rounded-cta border-2 bg-(image:--gradient-field) px-3 py-2 text-center touch-manipulation select-none"
      :class="fieldClasses('distance', focusedField)"
      @pointerdown="emit('focus', 'distance')"
    >
      <span class="text-stat font-bold tracking-[0.2em] text-white/45">DISTANCE</span>
      <span
        data-testid="distance-value"
        class="w-full truncate text-label font-black tabular-nums"
        :class="distance ? 'text-white' : 'text-white/25'"
        >{{ distance || '0' }}</span
      >
    </button>
  </div>
</template>
