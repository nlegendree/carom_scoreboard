<script setup lang="ts">
import type { PlayerColor, TableSide } from '../types/game'

// Carte de paramétrage d'un joueur (Story 10.3, UX-DR38). Bloc plein à la couleur de la
// bille, portant en son CENTRE les deux champs `NOM` et `DISTANCE`. Strictement
// PRÉSENTATIONNELLE — aucun accès au store, aucune règle de saisie : elle affiche ce qu'on
// lui donne et dit quel champ a été tapé. Les règles (plafonds, espaces, première frappe
// qui remplace) vivent dans `NumericPadDock` et `AlphaKeyboardSheet`.
//
// Revue de rendu de Nathan (2026-09-12) :
// - pastille de bille et médaillon rond sombre RETIRÉS — la couleur pleine dit déjà la
//   bille ;
// - les champs ne sont plus des pavés presque noirs mais des box CLAIRES, teintées de la
//   carte elle-même et écrites à son encre (« c'est un peu sombre ») ;
// - de la marge autour, et un champ vide ne porte QUE son intitulé — ni « JOUEUR » ni
//   « 0 », qui se lisaient comme de vraies valeurs.
//
// `side` sert au seul `data-testid` : la carte ne se dessine pas différemment à gauche ou
// à droite. `ball` et `side` se dissocient dès qu'on tape CHANGER DE BILLE — d'où
// l'attribut `data-ball`, qui garde la bille lisible en test comme à l'œil.
defineProps<{
  side: TableSide
  ball: PlayerColor
  name: string
  // Chaîne et non nombre : `''` est « rien de réglé », ce qu'aucun nombre ne distingue
  // de 0 — c'est le même buffer que celui de la pop-up de saisie.
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

// Une box claire, teintée par transparence de la carte qui la porte : elle reste lisible
// sur le blanc comme sur le jaune, sans deux jeux de couleurs à maintenir.
// Les champs occupent la carte plutôt que d'y flotter : ils se partagent la hauteur
// disponible (`flex-1`) entre un plancher confortable et un plafond raisonnable, pour que
// la carte ne soit pas un grand vide avec deux petites boîtes au milieu.
const FIELD_CLASSES =
  'flex min-h-[130px] max-h-[220px] w-full flex-1 flex-col items-center justify-center gap-2 rounded-cta border-2 bg-black/8 px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] touch-manipulation select-none'

// Le champ visé se signale par une PRÉSENCE (liseré), pas par une teinte de fond seule :
// même signal non chromatique que l'indicateur de tour (UX-DR22). Conservé tel quel à la
// revue de rendu du 2026-09-12 (« bonne idée […] on garde ça »).
function fieldClasses(field: 'name' | 'distance', focused: 'name' | 'distance' | null): string {
  return field === focused ? 'border-turn-active' : 'border-black/15'
}
</script>

<template>
  <div
    :data-testid="`player-card-${side}`"
    :data-ball="ball"
    class="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-5 border border-border p-6"
    :class="CARD_CLASSES[ball]"
  >
    <button
      data-testid="name-field"
      :class="[FIELD_CLASSES, fieldClasses('name', focusedField)]"
      @pointerdown="emit('focus', 'name')"
    >
      <!-- L'intitulé ne double la valeur que lorsqu'il y en a une : un champ vide porte
           `NOM` seul, en gros, et ne fait pas croire à une valeur déjà saisie. -->
      <span v-if="name" class="text-stat font-bold tracking-[0.25em] opacity-45">NOM</span>
      <span
        data-testid="name-value"
        class="w-full truncate font-black uppercase"
        :class="name ? 'text-[clamp(24px,2.6vw,40px)]' : 'text-label tracking-[0.25em] opacity-35'"
        >{{ name || 'NOM' }}</span
      >
    </button>

    <button
      data-testid="distance-field"
      :class="[FIELD_CLASSES, fieldClasses('distance', focusedField)]"
      @pointerdown="emit('focus', 'distance')"
    >
      <span v-if="distance" class="text-stat font-bold tracking-[0.25em] opacity-45">DISTANCE</span>
      <span
        data-testid="distance-value"
        class="w-full truncate font-black tabular-nums"
        :class="distance ? 'text-[clamp(24px,2.6vw,40px)]' : 'text-label tracking-[0.25em] opacity-35'"
        >{{ distance || 'DISTANCE' }}</span
      >
    </button>
  </div>
</template>
