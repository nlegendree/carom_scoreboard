<script setup lang="ts">
import { ref } from 'vue'
import AlphaKeyboard from './AlphaKeyboard.vue'
import { useHaptics } from '../composables/useHaptics'
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
// `value` et émet la nouvelle valeur complète, mais porte les règles de saisie ET les
// retours — haptique à chaque frappe acceptée, haptique distincte et pulsation au plafond
// (UX-DR54, CLAUDE.md §10) ; le clavier, lui, reste muet. Les retours manquaient à la
// livraison de la 10.3 (revue de fin d'Epic 10) : un clavier qui refuse sans rien dire
// paraît en panne.
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme son `data-testid`.
const MAX_NAME_LENGTH = 20

const props = defineProps<{ value: string; align: TableSide }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

const { tap, reject } = useHaptics()

// Compteur de relance de l'animation CSS : changer la `key` de l'élément le recrée, ce qui
// rejoue la pulsation depuis le début. Aucun timer JS pour les retours visuels.
const rejectKey = ref(0)

// La pop-up ne se colle pas au bord : elle se CENTRE dans la zone que la carte visée
// laisse libre (revue de rendu du 2026-09-12). L'inset réserve la bande occupée par cette
// carte, `justify-center` fait le reste.
const ALIGN_CLASSES: Record<TableSide, string> = {
  left: 'pl-4 pr-[var(--setup-popup-inset-right)]',
  right: 'pl-[var(--setup-popup-inset-left)] pr-4',
}

function onInput(char: string): void {
  // Pas d'espace en tête ni d'espaces consécutifs : ils ne se verraient pas, mangeraient
  // le plafond, et `.trim()` les jetterait à la validation. Geste sans effet, pas un refus.
  if (char === ' ' && (props.value === '' || props.value.endsWith(' '))) return
  // Le plafond porte sur le nom UTILE, mesuré sur ce que la frappe donnerait : un espace
  // de fin ne bloque pas la frappe, mais la lettre qui le suit ne peut pas faire un 21e
  // caractère (`props.value.trim().length >= MAX` laissait passer ce cas).
  if ((props.value + char).trim().length > MAX_NAME_LENGTH) {
    reject()
    rejectKey.value += 1
    return
  }
  emit('update', props.value + char)
  tap()
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
    role="dialog"
    aria-modal="true"
    aria-label="Saisie du nom"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 py-4"
    :class="ALIGN_CLASSES[align]"
    @pointerdown="armBackdropClose"
    @pointerup="closeFromBackdrop"
    @pointercancel="disarmBackdropClose"
  >
    <div
      data-testid="sheet-card"
      class="flex max-h-full w-full max-w-(--size-popup-alpha) flex-col gap-2 rounded-modal border border-border bg-bg/95 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
      @pointerdown.stop
      @pointerup.stop
    >
      <div
        :key="rejectKey"
        data-testid="sheet-reject"
        :data-reject="rejectKey"
        :class="rejectKey > 0 && 'animate-input-reject'"
      >
        <AlphaKeyboard @input="onInput" @backspace="onBackspace" @clear="onClear" />
      </div>

      <footer class="flex shrink-0 gap-2">
        <button
          data-testid="sheet-close"
          class="min-h-[var(--size-touch-target)] w-1/3 rounded-key bg-(image:--gradient-neutral) text-label font-black text-white touch-manipulation select-none active:brightness-90"
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
