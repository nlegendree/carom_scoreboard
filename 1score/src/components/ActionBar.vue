<script setup lang="ts">
import { computed } from 'vue'
import IconAction from './IconAction.vue'
import type { PlayerId, TableSide } from '../types/game'
import type { ItemState, PictoName } from '../types/ui'

// Barre basse du SCOREBOARD (Story 10.4). L'ancienne coquille générique `showBack` + slot
// `actions`, survivante de l'avant-Epic 10, a disparu avec la 10.3 : seule `GameView`
// l'utilisait encore, et l'accueil ne l'importe plus.
//
// Deux groupes calés sur les colonnes des cartes (2/5 · 1/5 · 2/5), qui ÉCHANGENT DE CÔTÉ
// à chaque bascule de tour : le CTA de saisie du côté du joueur ASSIS (c'est lui qui compte
// pour celui qui joue), les quatre pictos de l'autre, du bord EXTÉRIEUR vers l'intérieur.
//
// ⚠️ AC14 / DT2 — UN SEUL MARKUP. Avant la refonte, chaque colonne portait sa copie du CTA
// et des SVG inline, plus des marges négatives (`-mx-4`, `ml-4`, `mr-4`) qui annulaient le
// padding de la barre pour recaler les colonnes sur les panneaux. Passer à quatre pictos
// aurait doublé la dette. Ici, l'ordre vient de la DIRECTION DE LA RANGÉE, et la barre n'a
// plus de padding horizontal à compenser : elle s'aligne d'elle-même sur la zone de jeu,
// qui n'en a pas non plus.
const props = defineProps<{
  ctaSide: TableSide
  // Joueur PROPRIÉTAIRE de chaque colonne d'écran, tel que `GameView` l'a résolu une fois
  // pour toutes (`whiteSide`). Sert uniquement à poser `data-side`, qui dit « dans la
  // colonne de QUEL JOUEUR » se trouve un contrôle — et non de quel côté de l'écran : les
  // deux ne coïncident qu'à travers cette résolution, et les tests de bascule lisent le
  // joueur. La barre ne s'en sert pour rien d'autre : elle reste présentationnelle.
  sideOwners: Record<TableSide, PlayerId>
  ctaLabel: string
  ctaTestId: string
  canUndo: boolean
  canRestart: boolean
}>()

const emit = defineEmits<{ cta: []; quit: []; restart: []; undo: [] }>()

// Classes écrites en toutes lettres, jamais construites à la volée : le scanner JIT de
// Tailwind 4 ne voit que ce qui est écrit littéralement.
const ROW_CLASSES: Record<TableSide, string> = {
  left: 'flex-row',
  right: 'flex-row-reverse',
}

// Le groupe de pictos est retourné DANS L'AUTRE SENS que la rangée : QUITTER doit tomber
// sur le bord extérieur de l'écran, donc à droite quand le groupe est à droite.
// ⚠️ L'ordre du DOM ne suit alors plus l'ordre visuel. Un test qui vérifie « QUITTER au
// bord extérieur » doit lire cette classe de direction, pas un index dans le DOM.
const PICTO_ROW_CLASSES: Record<TableSide, string> = {
  left: 'flex-row-reverse',
  right: 'flex-row',
}

const OPPOSITE_SIDE: Record<TableSide, TableSide> = { left: 'right', right: 'left' }

// `data-side` est lu par les tests de `GameView` sur plusieurs dizaines de cas — il ne
// change pas de sémantique : c'est le joueur dont le contrôle occupe la colonne.
const ctaOwner = computed(() => props.sideOwners[props.ctaSide])
const pictoOwner = computed(() => props.sideOwners[OPPOSITE_SIDE[props.ctaSide]])

// Une seule liste, rendue par `v-for` : quatre pictos au lieu des deux SVG recopiés.
// `disabled` porte le visuel, la garde vit dans `IconAction` — les deux, toujours.
interface BarAction {
  testid: string
  picto: PictoName
  label: string
  state: ItemState
  disabled: boolean
  press: () => void
}

const pictoActions = computed<BarAction[]>(() => [
  // QUITTER n'est jamais grisé : sans rien à récapituler il ramène à l'accueil, sinon il
  // ouvre « TERMINER LA PARTIE ? » — rien de destructif au contact (Story 1.10).
  {
    testid: 'exit-button',
    picto: 'door',
    label: 'QUITTER',
    state: 'normal',
    disabled: false,
    press: () => emit('quit'),
  },
  // Affiché pour dire qu'il existera, inerte tant qu'il n'existe pas (état BIENTÔT).
  {
    testid: 'settings-button',
    picto: 'gear',
    label: 'PARAMÈTRES',
    state: 'soon',
    disabled: false,
    press: () => {},
  },
  {
    testid: 'restart-button',
    picto: 'rotate-ccw',
    label: 'RECOMMENCER',
    state: 'normal',
    disabled: !props.canRestart,
    press: () => emit('restart'),
  },
  {
    testid: 'undo-button',
    picto: 'undo',
    label: 'ANNULER',
    state: 'normal',
    disabled: !props.canUndo,
    press: () => emit('undo'),
  },
])
</script>

<template>
  <nav data-testid="action-bar" class="flex shrink-0 items-center bg-bg py-2">
    <div
      data-testid="action-bar-row"
      class="flex flex-1 items-center"
      :class="ROW_CLASSES[ctaSide]"
    >
      <!-- Le CTA occupe TOUTE la largeur de la colonne du joueur assis, comme la barre
           pleine largeur du Billiboard (`상대선수 득점 +1`). -->
      <div class="flex w-2/5 px-2">
        <button
          :data-testid="ctaTestId"
          :data-side="ctaOwner"
          class="flex w-full min-h-[var(--size-touch-target)] items-center justify-center bg-(image:--gradient-blue) px-4 text-label font-black tracking-[0.1em] text-white rounded-cta touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('cta')"
        >
          {{ ctaLabel }}
        </button>
      </div>

      <!-- Espaceur calé sur la colonne centrale : la barre reproduit la grille de la zone
           de jeu, elle ne la compense plus. -->
      <div class="w-1/5 shrink-0" />

      <!-- ⚠️ 12 px (UX-DR52) et non `gap-3`, qui vaudrait 24 px : `--spacing` est à 8 px. -->
      <div class="flex w-2/5 items-center gap-[12px] px-2" :class="PICTO_ROW_CLASSES[ctaSide]">
        <IconAction
          v-for="action in pictoActions"
          :key="action.testid"
          :data-testid="action.testid"
          :data-side="pictoOwner"
          :picto="action.picto"
          :label="action.label"
          :state="action.state"
          :disabled="action.disabled"
          @press="action.press()"
        />
      </div>
    </div>
  </nav>
</template>
