<script setup lang="ts">
import AlphaKeyboard from './AlphaKeyboard.vue'
import type { TableSide } from '../types/game'

// Hôte du clavier alphabétique pour la saisie d'un nom (UX-DR40).
//
// Revue de rendu du 2026-09-12 (Nathan) : même traitement que `NumericPadDock` — pop-up
// ALIGNÉE SUR LE CÔTÉ OPPOSÉ à la carte qu'on remplit, pour que celle-ci reste visible et
// se remplisse à vue. Le rappel du nom dans l'en-tête disparaît donc avec le besoin. Le
// voile ferme au tap dehors, et `ANNULER` remplace la croix.
// ⚠️ Voile SANS FLOU, et à peine assombri : voir `NumericPadDock`, même raison — la carte
// qu'on remplit doit rester lisible.
//
// Même partage qu'avec `NumericPadDock` : la valeur vit dans l'écran, la pop-up reçoit
// `value` et émet la nouvelle valeur complète, mais porte les règles de saisie — le
// clavier, lui, reste muet (UX-DR54).
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme son `data-testid`.
const MAX_NAME_LENGTH = 20

const props = defineProps<{ value: string; align: TableSide }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

// La pop-up ne se colle pas au bord : elle se CENTRE dans la zone que la carte visée
// laisse libre (revue de rendu du 2026-09-12). L'inset réserve la bande occupée par cette
// carte, `justify-center` fait le reste.
const ALIGN_CLASSES: Record<TableSide, string> = {
  left: 'pl-4 pr-[var(--setup-popup-inset-right)]',
  right: 'pl-[var(--setup-popup-inset-left)] pr-4',
}

function onInput(char: string): void {
  // Pas d'espace en tête ni d'espaces consécutifs : ils ne se verraient pas, mangeraient
  // le plafond, et `.trim()` les jetterait à la validation.
  if (char === ' ' && (props.value === '' || props.value.endsWith(' '))) return
  // Le plafond porte sur le nom utile : un espace de fin ne doit pas bloquer la frappe.
  if (props.value.trim().length >= MAX_NAME_LENGTH) return
  emit('update', props.value + char)
}

function onBackspace(): void {
  emit('update', props.value.slice(0, -1))
}

function onClear(): void {
  emit('update', '')
}

// Geste COMPLET sur le voile (appui ET relâchement) : voir le commentaire détaillé de
// `NumericPadDock`, même mécanique et mêmes raisons.
let backdropPointerId: number | null = null

function armBackdropClose(event: PointerEvent): void {
  backdropPointerId = event.pointerId
}

function disarmBackdropClose(): void {
  backdropPointerId = null
}

function closeFromBackdrop(event: PointerEvent): void {
  if (backdropPointerId === null || backdropPointerId !== event.pointerId) return
  backdropPointerId = null
  emit('cancel')
}
</script>

<template>
  <div
    data-testid="alpha-keyboard-sheet"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 py-4"
    :class="ALIGN_CLASSES[align]"
    @pointerdown="armBackdropClose"
    @pointerup="closeFromBackdrop"
    @pointercancel="disarmBackdropClose"
  >
    <div
      data-testid="sheet-card"
      class="flex max-h-full w-full max-w-3xl flex-col gap-2 rounded-modal border border-border bg-bg/95 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
      @pointerdown.stop
      @pointerup.stop
    >
      <AlphaKeyboard @input="onInput" @backspace="onBackspace" @clear="onClear" />

      <footer class="flex shrink-0 gap-2">
        <button
          data-testid="sheet-close"
          class="min-h-[var(--size-touch-target)] w-1/3 rounded-key border border-border-strong bg-(image:--gradient-neutral) text-label font-black text-white touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('cancel')"
        >
          ANNULER
        </button>
        <button
          data-testid="sheet-confirm"
          class="min-h-[var(--size-touch-target)] flex-1 rounded-key bg-(image:--gradient-blue) text-label font-black text-white touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('validate')"
        >
          VALIDER
        </button>
      </footer>
    </div>
  </div>
</template>
