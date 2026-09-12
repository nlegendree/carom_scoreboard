<script setup lang="ts">
import AlphaKeyboard from './AlphaKeyboard.vue'
import PictoIcon from './PictoIcon.vue'
import type { PlayerColor } from '../types/game'

// Hôte du clavier alphabétique pour la saisie d'un nom (UX-DR40).
//
// Revue de rendu de Nathan (2026-09-12) : même traitement que `NumericPadDock` — une VRAIE
// POP-UP par-dessus l'écran, voile flouté, et le champ de saisie calé ENTRE la croix et
// `VALIDER`, avec le rappel de la bille du joueur concerné. Le clavier intégré est une
// solution temporaire : il ne vaut pas la peine de faire refluer toute la page autour de
// lui, comme le faisait le bandeau en flux de la première passe.
//
// Même partage qu'avec `NumericPadDock` : la valeur vit dans l'écran, la pop-up reçoit
// `value` et émet la nouvelle valeur complète, mais porte les règles de saisie — le
// clavier, lui, reste muet (UX-DR54).
//
// Voile inerte, comme la pop-up du pavé : croix et `VALIDER` sont les seules issues.
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme son `data-testid`.
const MAX_NAME_LENGTH = 20

const props = defineProps<{ value: string; ball: PlayerColor }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

const BALL_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
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
</script>

<template>
  <div
    data-testid="alpha-keyboard-sheet"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
  >
    <div
      data-testid="sheet-card"
      class="flex max-h-full w-full max-w-4xl flex-col gap-2 rounded-modal border border-border bg-bg/95 p-2 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
    >
      <header class="flex shrink-0 items-center gap-2">
        <button
          data-testid="sheet-close"
          aria-label="Abandonner la saisie"
          class="flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] shrink-0 items-center justify-center rounded-cta text-white/55 touch-manipulation select-none active:bg-white/10 active:text-white"
          @pointerdown="emit('cancel')"
        >
          <PictoIcon name="close" class="size-4" />
        </button>

        <div
          class="flex min-h-[var(--size-touch-target)] min-w-0 flex-1 items-center gap-2 rounded-cta border border-border bg-(image:--gradient-field) px-3"
        >
          <span aria-hidden="true" class="size-2 shrink-0 rounded-full" :class="BALL_CLASSES[ball]" />
          <span
            data-testid="sheet-value"
            class="truncate text-label font-black uppercase"
            :class="value ? 'text-white' : 'text-white/25'"
            >{{ value || 'JOUEUR' }}</span
          >
        </div>

        <button
          data-testid="sheet-confirm"
          class="min-h-[var(--size-touch-target)] shrink-0 rounded-cta bg-(image:--gradient-blue) px-3 text-label font-black text-white touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('validate')"
        >
          VALIDER
        </button>
      </header>

      <AlphaKeyboard @input="onInput" @backspace="onBackspace" />
    </div>
  </div>
</template>
