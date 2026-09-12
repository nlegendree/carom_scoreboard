<script setup lang="ts">
import { computed, ref } from 'vue'
import NumericPad from './NumericPad.vue'
import PictoIcon from './PictoIcon.vue'
import { useHaptics } from '../composables/useHaptics'
import { MAX_TARGET_SCORE } from '../stores/useGameStore'
import type { PlayerColor } from '../types/game'

// Hôte du pavé numérique pour le réglage d'une distance (UX-DR39).
//
// Revue de rendu de Nathan (2026-09-12) : c'est une VRAIE POP-UP, posée par-dessus l'écran
// avec voile flouté — et non plus un dock logé dans la colonne centrale, qui rétrécissait
// les cartes et compliquait toute la mise en page pour rien. La distance en cours reste
// visible parce qu'elle est rappelée DANS la pop-up, calée entre la croix et `VALIDER`,
// avec la bille du joueur concerné : on voit toujours ce qu'on tape, sans dépendre de ce
// qu'on aperçoit derrière le voile. (Cette décision remplace celle du 2026-09-12 matin,
// « aucun voile », qui valait pour un dock en flux.)
//
// La valeur en cours vit dans l'ÉCRAN, pas ici : deux buffers divergeraient à la première
// frappe. La pop-up reçoit `value` et émet la nouvelle valeur COMPLÈTE. Elle garde en
// revanche les règles (plafond, première frappe qui remplace) et les retours (haptique,
// pulsation) : le pavé, lui, reste muet (UX-DR54).
//
// Voile INERTE : les issues sont la croix et `VALIDER`. Un tap dans le vide ne jette pas
// une saisie en cours, et la pop-up monte sous le doigt qui vient de taper le champ —
// même raison que pour les pop-ups de décision.
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme son `data-testid` (piège payé en 10.1 sur `ModeTile`).
const props = defineProps<{ value: string; ball: PlayerColor }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

const { tap, reject } = useHaptics()

// DT1 : le plafond est dérivé de la constante du store, jamais recopié. `MAX_DIGITS`
// disparaît avec `PlayerSetupModal`.
const MAX_DIGITS = String(MAX_TARGET_SCORE).length

// Classes écrites en toutes lettres pour le scanner JIT de Tailwind 4.
const BALL_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
}

// Une distance ouverte sur une valeur déjà réglée attend d'être remplacée : la première
// frappe repart de zéro (convention calculatrice). Sans ça, un réglage à 3 chiffres serait
// inéditable — le plafond ignorerait toutes les touches, pavé apparemment en panne.
const pristine = ref(props.value !== '')

// Compteur de relance de l'animation CSS : changer la `key` de l'élément le recrée, ce qui
// rejoue la pulsation depuis le début. Aucun timer JS pour les retours visuels.
const rejectKey = ref(0)

const hasInput = computed(() => props.value !== '')
// `0` en attente plutôt qu'un champ vide : c'est la valeur qu'on est en train de composer.
const displayedValue = computed(() => props.value || '0')

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
    // distincte et une pulsation de la valeur, jamais par un message bloquant (UX-DR10).
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
  <div
    data-testid="numeric-pad-dock"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
  >
    <div
      data-testid="dock-card"
      class="flex max-h-full w-full max-w-lg flex-col gap-2 rounded-modal border border-border bg-bg/95 p-2 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
    >
      <!-- La valeur en cours, calée ENTRE la croix et VALIDER, avec le rappel de bille :
           c'est elle qui garantit qu'on voit toujours la distance qu'on est en train de
           taper (revue de rendu de Nathan, 2026-09-12). -->
      <header class="flex shrink-0 items-center gap-2">
        <button
          data-testid="dock-close"
          aria-label="Abandonner la saisie"
          class="flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] shrink-0 items-center justify-center rounded-cta text-white/55 touch-manipulation select-none active:bg-white/10 active:text-white"
          @pointerdown="emit('cancel')"
        >
          <PictoIcon name="close" class="size-4" />
        </button>

        <div
          :key="rejectKey"
          data-testid="dock-reject"
          :data-reject="rejectKey"
          class="flex min-h-[var(--size-touch-target)] min-w-0 flex-1 items-center justify-center gap-2 rounded-cta border border-border bg-(image:--gradient-field) px-3"
          :class="rejectKey > 0 && 'animate-input-reject'"
        >
          <span aria-hidden="true" class="size-2 shrink-0 rounded-full" :class="BALL_CLASSES[ball]" />
          <span
            data-testid="dock-value"
            class="truncate text-[clamp(28px,3vw,40px)] leading-none font-black tabular-nums"
            :class="hasInput ? 'text-white' : 'text-white/25'"
            >{{ displayedValue }}</span
          >
        </div>

        <button
          data-testid="dock-confirm"
          class="min-h-[var(--size-touch-target)] shrink-0 rounded-cta bg-(image:--gradient-blue) px-3 text-label font-black text-white touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('validate')"
        >
          VALIDER
        </button>
      </header>

      <div class="min-h-0 flex-1">
        <NumericPad
          :hasInput="hasInput"
          @digit="onDigit"
          @clear="onClear"
          @backspace="onBackspace"
        />
      </div>
    </div>
  </div>
</template>
