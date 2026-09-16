<script setup lang="ts">
import { computed, ref } from 'vue'
import NumericPad from './NumericPad.vue'
import CtaButton from './CtaButton.vue'
import PopupCard from './PopupCard.vue'
import { useHaptics } from '../composables/useHaptics'
import { MAX_TARGET_SCORE } from '../stores/useGameStore'
import type { TableSide } from '../types/game'

// Hôte du pavé numérique pour le réglage d'une distance (UX-DR39).
//
// Revue de rendu du 2026-09-12 (Nathan) : pop-up ALIGNÉE SUR UN CÔTÉ, celui OPPOSÉ à la
// carte qu'on remplit — la carte visée reste donc entièrement visible et se remplit à vue.
// C'est ce qui permet de retirer le rappel de la valeur qui vivait dans l'en-tête : elle
// se lit là où elle doit se lire, sur la carte. Le voile FERME au tap dehors, et la croix
// cède la place à un `ANNULER` comme dans toutes les pop-ups du produit.
// ⚠️ Voile SANS FLOU, et à peine assombri : flouter l'arrière-plan rendrait la carte
// illisible, or c'est précisément elle qu'on doit lire pendant la frappe depuis que la
// pop-up ne rappelle plus la valeur. Le relief de la carte de pop-up (contour + ombre
// portée) suffit à la détacher.
//
// La valeur en cours vit dans l'ÉCRAN, pas ici : deux buffers divergeraient à la première
// frappe. La pop-up reçoit `value` et émet la nouvelle valeur COMPLÈTE. Elle garde en
// revanche les règles (plafond, première frappe qui remplace) et les retours (haptique,
// pulsation) : le pavé, lui, reste muet (UX-DR54).
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme son `data-testid` (piège payé en 10.1 sur `ModeTile`).
const props = defineProps<{ value: string; align: TableSide; reserve: string }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

const { tap, reject } = useHaptics()

// DT1 : le plafond est dérivé de la constante du store, jamais recopié.
const MAX_DIGITS = String(MAX_TARGET_SCORE).length

// La pop-up ne se colle pas au bord : elle se CENTRE dans la zone que la carte visée
// laisse libre (revue de rendu du 2026-09-12). L'hôte transmet la bande à RÉSERVER du côté
// opposé (`reserve`) — il est le seul à connaître la géométrie de son écran. Story 11.3 :
// elle vivait avant en token `--*-popup-inset-*`, c'est-à-dire une position dans le
// namespace des intentions.

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
    // distincte et une pulsation du pavé, jamais par un message bloquant (UX-DR10).
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
  <PopupCard
    testid="numeric-pad-dock"
    cardTestid="dock-card"
    label="Réglage de la distance"
    width="pad"
    gap="sm"
    :align="align"
    :reserve="reserve"
    @backdrop-close="emit('cancel')"
  >
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

      <template #footer>
        <CtaButton
          data-testid="dock-close"
          variant="neutral"
          class="w-1/3"
          @press="emit('cancel')"
        >
          ANNULER
        </CtaButton>
        <CtaButton
          data-testid="dock-confirm"
          variant="accent"
          class="flex-1"
          @press="emit('validate')"
        >
          VALIDER
        </CtaButton>
      </template>
  </PopupCard>
</template>
