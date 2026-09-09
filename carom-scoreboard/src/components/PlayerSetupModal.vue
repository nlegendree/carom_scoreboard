<script setup lang="ts">
import { computed, ref } from 'vue'
import AlphaKeyboard from './AlphaKeyboard.vue'
import NumericPad from './NumericPad.vue'
import type { PlayerColor } from '../types/game'

// Reprise de la contrainte de saisie de série (FR7) : une distance de 4 chiffres n'a pas
// de réalité en carambole. Le store reborne de son côté (AR17) — ici c'est du confort.
const MAX_DIGITS = 3
const MAX_NAME_LENGTH = 20

const props = defineProps<{
  color: PlayerColor
  name: string
  targetScore: number
}>()

const emit = defineEmits<{
  confirm: [setup: { name: string; targetScore: number }]
  cancel: []
}>()

// Classes écrites en toutes lettres (et non construites dynamiquement) pour que le
// scanner JIT de Tailwind v4 les détecte — même contrainte que `PlayerPanel.vue`.
const BALL_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
}
const VALUE_CLASSES: Record<PlayerColor, string> = {
  white: 'text-player-white',
  yellow: 'text-player-yellow',
}
const BALL_LABELS: Record<PlayerColor, string> = {
  white: 'BILLE BLANCHE',
  yellow: 'BILLE JAUNE',
}

// Nommé `nameBuffer` et non `name` : un ref local homonyme de la prop masquerait
// `props.name` dans tout le composant, et les deux divergeraient dès la première frappe.
const nameBuffer = ref(props.name)
// Le buffer est une chaîne : `''` vaut LIBRE (aucun objectif), ce qu'aucun nombre ne
// distingue de 0. La conversion en entier n'a lieu qu'à la validation.
const distance = ref(props.targetScore > 0 ? String(props.targetScore) : '')
// Une distance ouverte sur une valeur déjà réglée attend d'être remplacée : la première
// frappe repart de zéro (convention calculatrice). Sans ça, un réglage à 3 chiffres serait
// inéditable — le plafond ignorerait toutes les touches, pavé apparemment en panne.
const distancePristine = ref(distance.value !== '')
// Champ alimenté par le clavier. Le nom d'abord : c'est l'ordre de remplissage naturel.
const focused = ref<'name' | 'distance'>('name')

const displayedDistance = computed(() => distance.value || '0')

function appendChar(char: string): void {
  // Pas d'espace en tête ni d'espaces consécutifs : ils ne se verraient pas, mangeraient
  // le plafond, et `.trim()` les jetterait à la validation.
  if (char === ' ' && (nameBuffer.value === '' || nameBuffer.value.endsWith(' '))) return
  // Le plafond porte sur le nom utile : un espace de fin ne doit pas bloquer la frappe.
  if (nameBuffer.value.trim().length >= MAX_NAME_LENGTH) return
  nameBuffer.value += char
}

function backspaceName(): void {
  nameBuffer.value = nameBuffer.value.slice(0, -1)
}

function appendDigit(digit: number): void {
  if (distancePristine.value) {
    // Le 0 en tête reste interdit : il repart d'un buffer vide plutôt que de s'empiler.
    distancePristine.value = false
    distance.value = digit === 0 ? '' : String(digit)
    return
  }
  // Un 0 sur un buffer vide ne fait rien : la distance vaut déjà 0, et l'empiler
  // produirait des zéros de tête.
  if (distance.value === '' && digit === 0) return
  // Au-delà de 3 chiffres la frappe est ignorée, sans message bloquant.
  if (distance.value.length >= MAX_DIGITS) return
  distance.value += digit
}

function clearDistance(): void {
  distancePristine.value = false
  distance.value = ''
}

function backspaceDistance(): void {
  distancePristine.value = false
  distance.value = distance.value.slice(0, -1)
}

function confirm(): void {
  emit('confirm', { name: nameBuffer.value, targetScore: Number(distance.value || 0) })
}
</script>

<template>
  <!-- Vraie pop-up : la page reste visible derrière, floutée. Un tap en dehors de la carte
       referme, comme la croix. Aucun champ natif dans cette modale — l'écran est une borne
       fixe et toute la saisie passe par nos claviers, donc le clavier du système ne peut
       structurellement pas monter par-dessus l'interface.
       Seule exception à `@pointerdown` (AR8) : le voile ferme au RELÂCHEMENT. Fermer au
       contact jetait toute la saisie dès qu'une paume d'appui touchait le fond. -->
  <div
    data-testid="modal-backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
    @pointerup="emit('cancel')"
  >
    <div
      data-testid="modal-card"
      class="relative flex max-h-full w-full max-w-4xl flex-col gap-3 overflow-hidden rounded-3xl border border-white/12 bg-bg/95 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
      @pointerdown.stop
      @pointerup.stop
    >
      <header class="flex shrink-0 items-center gap-4">
        <button
          data-testid="modal-close-button"
          aria-label="Fermer"
          class="-m-2 flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] shrink-0 items-center justify-center rounded-2xl text-3xl text-white/55 touch-manipulation select-none active:bg-white/10 active:text-white"
          @pointerdown="emit('cancel')"
        >
          ✕
        </button>
        <span aria-hidden="true" class="h-5 w-5 shrink-0 rounded-full" :class="BALL_CLASSES[color]" />
        <span class="text-stat font-bold tracking-[0.2em] text-white/55">{{ BALL_LABELS[color] }}</span>
      </header>

      <!-- Les deux champs. Taper l'un ou l'autre bascule le clavier du bas ; le liseré dit
           lequel reçoit la frappe (même signal non-chromatique que l'indicateur de tour). -->
      <div class="flex shrink-0 flex-col gap-3 md:flex-row">
        <button
          data-testid="name-field"
          class="flex min-h-[var(--size-touch-target)] flex-1 flex-col justify-center gap-1 rounded-2xl border-2 px-5 py-3 text-left touch-manipulation select-none"
          :class="focused === 'name' ? 'border-turn-active bg-white/6' : 'border-white/12'"
          @pointerdown="focused = 'name'"
        >
          <span class="text-stat font-bold tracking-[0.2em] text-white/40">NOM</span>
          <span class="flex items-baseline text-label font-black uppercase">
            <span
              data-testid="name-value"
              :class="nameBuffer ? 'text-white' : 'text-white/25'"
              >{{ nameBuffer || 'JOUEUR' }}</span
            >
            <!-- Caret toujours APRÈS la valeur, rempli ou non : le poser avant quand le
                 champ est vide décalait le libellé d'attente à la première frappe. -->
            <span
              v-if="focused === 'name'"
              data-testid="name-caret"
              aria-hidden="true"
              class="ml-0.5 animate-pulse text-white"
              >|</span
            >
          </span>
        </button>

        <button
          data-testid="distance-field"
          class="flex min-h-[var(--size-touch-target)] flex-1 flex-col justify-center gap-1 rounded-2xl border-2 px-5 py-3 text-left touch-manipulation select-none"
          :class="focused === 'distance' ? 'border-turn-active bg-white/6' : 'border-white/12'"
          @pointerdown="focused = 'distance'"
        >
          <span class="text-stat font-bold tracking-[0.2em] text-white/40">DISTANCE</span>
          <span class="flex items-baseline text-label font-black">
            <span
              data-testid="distance-value"
              :class="distance ? VALUE_CLASSES[color] : 'text-white/25'"
              >{{ displayedDistance }}</span
            >
            <span
              v-if="focused === 'distance'"
              data-testid="distance-caret"
              aria-hidden="true"
              class="ml-0.5 animate-pulse text-white"
              >|</span
            >
          </span>
        </button>
      </div>

      <!-- Un seul emplacement pour les deux claviers : rien ne se déplace quand on passe
           d'un champ à l'autre, seules les touches changent. -->
      <div class="min-h-0 flex-1 overflow-hidden">
        <AlphaKeyboard v-if="focused === 'name'" @input="appendChar" @backspace="backspaceName" />
        <NumericPad
          v-else
          :hasInput="distance !== ''"
          @digit="appendDigit"
          @clear="clearDistance"
          @backspace="backspaceDistance"
        />
      </div>

      <footer class="shrink-0">
        <button
          data-testid="setup-confirm-button"
          class="w-full min-h-[var(--size-touch-target)] rounded-2xl bg-accent text-label font-black text-on-accent touch-manipulation select-none active:brightness-90"
          @pointerdown="confirm"
        >
          VALIDER
        </button>
      </footer>
    </div>
  </div>
</template>
