<script setup lang="ts">
import AlphaKeyboard from './AlphaKeyboard.vue'
import PictoIcon from './PictoIcon.vue'

// Hôte du clavier alphabétique pour la saisie d'un nom (UX-DR40). Bandeau bas pleine
// largeur, monté DANS LE FLUX sous la zone principale : les cartes joueur rapetissent mais
// restent entières au-dessus, aucune n'est recouverte ni assombrie (décision de Nathan,
// 2026-09-12). Le champ qu'on remplit reste sous les yeux.
//
// Même partage qu'avec `NumericPadDock` : la valeur vit dans l'écran, le bandeau reçoit
// `value` et émet la nouvelle valeur complète, mais porte les règles de saisie — le
// clavier, lui, reste muet (UX-DR54).
//
// La barre croix / VALIDER est au plancher des claviers intégrés (57 px) et non aux 90 px
// d'`--size-touch-target` : c'est l'exception UX-DR8, et les 33 px gagnés sont ceux qui
// manquaient aux cartes pour tenir leurs deux champs à 1133×744, bandeau ouvert.
const MAX_NAME_LENGTH = 20

const props = defineProps<{ value: string }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

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
    class="flex w-full shrink-0 flex-col gap-1 border border-border bg-surface p-1"
  >
    <div class="flex shrink-0 items-center justify-between gap-1">
      <button
        data-testid="sheet-close"
        aria-label="Abandonner la saisie"
        class="flex min-h-[57px] min-w-[var(--size-touch-target)] items-center justify-center rounded-cta text-white/55 touch-manipulation select-none active:bg-white/10 active:text-white"
        @pointerdown="emit('cancel')"
      >
        <PictoIcon name="close" class="size-4" />
      </button>

      <button
        data-testid="sheet-confirm"
        class="min-h-[57px] min-w-[220px] rounded-cta bg-(image:--gradient-blue) px-4 text-label font-black text-white touch-manipulation select-none active:brightness-90"
        @pointerdown="emit('validate')"
      >
        VALIDER
      </button>
    </div>

    <AlphaKeyboard @input="onInput" @backspace="onBackspace" />
  </div>
</template>
