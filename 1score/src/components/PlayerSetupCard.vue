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
// Pictos fournis par Nathan (2026-09-12), servis depuis `public/` : aucune ressource
// réseau, l'app doit tourner hors ligne (FR45, NFR13).
const BALL_PICTOS: Record<PlayerColor, string> = {
  white: '/bille_blanche.png',
  yellow: '/bille_jaune.png',
}
const BALL_LABELS: Record<PlayerColor, string> = {
  white: 'BILLE BLANCHE',
  yellow: 'BILLE JAUNE',
}

// Une box claire, teintée par transparence de la carte qui la porte : elle reste lisible
// sur le blanc comme sur le jaune, sans deux jeux de couleurs à maintenir.
// Les champs occupent la carte plutôt que d'y flotter : ils se partagent la hauteur
// disponible (`flex-1`) entre un plancher confortable et un plafond raisonnable, pour que
// la carte ne soit pas un grand vide avec deux petites boîtes au milieu.
const FIELD_CLASSES =
  'flex min-h-(--size-field-min) max-h-(--size-field-max) w-full flex-1 flex-col items-center justify-center gap-2 rounded-tappable border-2 bg-black/8 px-3 py-3 text-center shadow-light-edge-field touch-manipulation select-none'

// Le champ visé se signale par une PRÉSENCE (liseré), pas par une teinte de fond seule :
// même signal non chromatique que l'indicateur de tour (UX-DR22). Conservé tel quel à la
// revue de rendu du 2026-09-12 (« bonne idée […] on garde ça »).
function fieldClasses(field: 'name' | 'distance', focused: 'name' | 'distance' | null): string {
  return field === focused ? 'border-turn-active' : 'border-black/25'
}
</script>

<template>
  <div
    :data-testid="`player-card-${side}`"
    :data-ball="ball"
    class="flex min-h-0 min-w-0 flex-1 flex-col items-stretch gap-5 overflow-hidden border border-border p-6"
    :class="CARD_CLASSES[ball]"
  >
    <!-- En-tête de carte (revue de rendu du 2026-09-12) : la bille en picto et son nom,
         CALÉS À GAUCHE, sur un aplat très légèrement plus sombre que la carte, et un filet
         FIN qui court sur toute la largeur. Les marges négatives annulent le padding de la
         carte : sans elles le bandeau s'arrêterait avant les bords. -->
    <header
      data-testid="card-header"
      class="-mx-6 -mt-6 mb-1 flex shrink-0 items-center gap-3 border-b border-black/12 bg-black/6 px-6 py-4"
    >
      <img :src="BALL_PICTOS[ball]" alt="" aria-hidden="true" class="size-5 shrink-0 object-contain" />
      <span class="text-stat font-black tracking-stat opacity-75">{{ BALL_LABELS[ball] }}</span>
    </header>

    <button
      data-testid="name-field"
      :class="[FIELD_CLASSES, fieldClasses('name', focusedField)]"
      @pointerdown="emit('focus', 'name')"
    >
      <!-- L'intitulé ne double la valeur que lorsqu'il y en a une : un champ vide porte
           `NOM` seul, en gros, et ne fait pas croire à une valeur déjà saisie.
           ⚠️ `opacity-60` et non 55 depuis la passe contraste de la 10.7 : le placeholder
           est posé sur la BOX du champ (`bg-black/8`), pas sur la carte nue, et sur le
           jaune il n'y tenait que 4,20:1 — `text-stat` (14 → 23 px) n'est « grand texte »
           (≥ 18,66 px en graisse ≥ 700, seuil 3:1) qu'à partir de 1555 px de large, donc
           sur tablette le seuil est bien 4,5:1. À 60 % : 4,98:1 sur le jaune, 5,44:1 sur
           le blanc. Une seule classe pour les deux cartes. -->
      <span v-if="name" class="text-stat font-bold tracking-stat opacity-65">NOM</span>
      <span
        data-testid="name-value"
        class="w-full truncate font-black uppercase"
        :class="name ? 'text-field-value' : 'text-stat tracking-title opacity-60'"
        >{{ name || 'NOM' }}</span
      >
    </button>

    <button
      data-testid="distance-field"
      :class="[FIELD_CLASSES, fieldClasses('distance', focusedField)]"
      @pointerdown="emit('focus', 'distance')"
    >
      <span v-if="distance" class="text-stat font-bold tracking-stat opacity-65">DISTANCE</span>
      <span
        data-testid="distance-value"
        class="w-full truncate font-black tabular-nums"
        :class="distance ? 'text-field-value' : 'text-stat tracking-title opacity-60'"
        >{{ distance || 'DISTANCE' }}</span
      >
    </button>
  </div>
</template>
