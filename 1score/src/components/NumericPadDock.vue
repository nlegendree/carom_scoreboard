<script setup lang="ts">
import { computed, ref } from 'vue'
import NumericPad from './NumericPad.vue'
import PictoIcon from './PictoIcon.vue'
import { useHaptics } from '../composables/useHaptics'
import { MAX_TARGET_SCORE } from '../stores/useGameStore'

// Hôte du pavé numérique pour le réglage d'une distance (UX-DR39). Il prend la place des
// CTA dans la colonne centrale du paramétrage : il ne recouvre rien, ne pose aucun voile,
// et les deux cartes joueur restent pleinement lisibles pendant la frappe (décision de
// Nathan, 2026-09-12) — c'est le sens même de l'écran, on remplit ce qu'on regarde.
//
// La valeur en cours vit dans l'ÉCRAN, pas ici : c'est la carte qui doit l'afficher en
// direct, et deux buffers divergeraient à la première frappe. Le dock reçoit `value` et
// émet la nouvelle valeur COMPLÈTE. Il garde en revanche les règles (plafond, première
// frappe qui remplace) et les retours (haptique, pulsation) : le pavé, lui, reste muet
// (UX-DR54).
const props = defineProps<{ value: string }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

const { tap, reject } = useHaptics()

// DT1 : le plafond est dérivé de la constante du store, jamais recopié. `MAX_DIGITS`
// disparaît avec `PlayerSetupModal`.
const MAX_DIGITS = String(MAX_TARGET_SCORE).length

// Une distance ouverte sur une valeur déjà réglée attend d'être remplacée : la première
// frappe repart de zéro (convention calculatrice). Sans ça, un réglage à 3 chiffres serait
// inéditable — le plafond ignorerait toutes les touches, pavé apparemment en panne.
const pristine = ref(props.value !== '')

// Compteur de relance de l'animation CSS : changer la `key` de l'élément le recrée, ce qui
// rejoue la pulsation depuis le début. Aucun timer JS pour les retours visuels.
const rejectKey = ref(0)

const hasInput = computed(() => props.value !== '')

function onDigit(digit: number): void {
  if (pristine.value) {
    pristine.value = false
    // Le 0 en tête reste interdit : il repart d'un buffer vide plutôt que de s'empiler.
    emit('update', digit === 0 ? '' : String(digit))
    tap()
    return
  }

  // Un 0 sur un buffer vide ne fait rien : la distance vaut déjà 0, et l'empiler
  // produirait des zéros de tête. Ce n'est pas un refus, juste un geste sans effet.
  if (props.value === '' && digit === 0) return

  if (props.value.length >= MAX_DIGITS) {
    // La frappe est ignorée, la valeur ne change pas. Le refus se signale par une haptique
    // distincte et une pulsation, jamais par un message bloquant (UX-DR10).
    reject()
    rejectKey.value += 1
    return
  }

  emit('update', props.value + digit)
  tap()
}

function onClear(): void {
  pristine.value = false
  emit('update', '')
}

function onBackspace(): void {
  pristine.value = false
  emit('update', props.value.slice(0, -1))
}
</script>

<template>
  <div data-testid="numeric-pad-dock" class="flex h-full min-h-0 flex-col gap-1">
    <div class="flex shrink-0 justify-start">
      <button
        data-testid="dock-close"
        aria-label="Abandonner la saisie"
        class="flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] items-center justify-center rounded-cta text-white/55 touch-manipulation select-none active:bg-white/10 active:text-white"
        @pointerdown="emit('cancel')"
      >
        <PictoIcon name="close" class="size-4" />
      </button>
    </div>

    <div
      :key="rejectKey"
      data-testid="dock-reject"
      :data-reject="rejectKey"
      class="min-h-0 flex-1"
      :class="rejectKey > 0 && 'animate-input-reject'"
    >
      <NumericPad
        :hasInput="hasInput"
        @digit="onDigit"
        @clear="onClear"
        @backspace="onBackspace"
      />
    </div>

    <button
      data-testid="dock-confirm"
      class="w-full shrink-0 min-h-[var(--size-touch-target)] rounded-cta bg-(image:--gradient-blue) text-label font-black text-white touch-manipulation select-none active:brightness-90"
      @pointerdown="emit('validate')"
    >
      VALIDER
    </button>
  </div>
</template>
