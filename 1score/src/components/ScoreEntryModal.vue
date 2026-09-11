<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import NumericPad from './NumericPad.vue'
import { useHaptics } from '../composables/useHaptics'
import { MAX_SCORE_DIGITS } from '../stores/useGameStore'
import type { PlayerColor } from '../types/game'

// Popup de saisie d'une série. Même coquille que `PlayerSetupModal` (voile flouté, carte
// centrée, croix de fermeture, CTA en pied) pour que les deux pop-ups du produit se
// ressemblent. Purement PRÉSENTATIONNELLE : le buffer vit dans le store, la modale le
// reçoit et émet — c'est `GameView` qui appelle les actions.
const props = defineProps<{
  color: PlayerColor
  name: string
  currentInput: string
}>()

const emit = defineEmits<{
  digit: [value: number]
  clear: []
  backspace: []
  validate: []
  cancel: []
}>()

// UX-DR15 : au-delà de ce délai sans frappe, la série est enregistrée d'office — ce qui
// emporte aussi la bascule de tour. C'est la SEULE définition de la durée : le compte à
// rebours visible (`--animate-input-countdown` de `main.css`) reçoit sa
// `animation-duration` depuis cette constante, les deux ne peuvent pas diverger.
const AUTO_VALIDATE_DELAY_MS = 3000

const { tap, reject } = useHaptics()

// Classes écrites en toutes lettres pour le scanner JIT de Tailwind v4.
const BALL_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
}
const VALUE_CLASSES: Record<PlayerColor, string> = {
  white: 'text-player-white',
  yellow: 'text-player-yellow',
}

const hasInput = computed(() => props.currentInput !== '')
// `0` en attente plutôt qu'un champ vide : c'est la valeur qu'on est en train de composer,
// et le plus souvent la série réelle au carambole.
const displayedValue = computed(() => props.currentInput || '0')

// Compteurs de relance des animations CSS : changer la `key` d'un élément le recrée, ce
// qui rejoue son animation depuis le début. Aucun timer JS pour les retours visuels.
const flashKey = ref(0)
const rejectKey = ref(0)

let autoValidateTimer: ReturnType<typeof setTimeout> | undefined

function cancelAutoValidate(): void {
  if (autoValidateTimer !== undefined) {
    clearTimeout(autoValidateTimer)
    autoValidateTimer = undefined
  }
}

// Le plafond est décidé ici, à partir de la constante partagée du store, pour que le
// retour haptique reste synchrone dans le handler `pointerdown` : la contrainte NFR1
// (< 100 ms) ne tolère pas un aller-retour par le store avant de savoir si la frappe est
// acceptée. La règle n'est pas réécrite, elle est importée.
function onDigit(digit: number): void {
  if (props.currentInput.length >= MAX_SCORE_DIGITS) {
    // La frappe est ignorée, la valeur ne change pas — donc pas de flash non plus. Le
    // refus se signale par une haptique distincte et une pulsation de la valeur.
    reject()
    rejectKey.value += 1
    return
  }

  emit('digit', digit)
  tap()
}

// Un seul observateur pilote les trois conséquences d'une variation de la saisie : flash
// de succès, compte à rebours visible et timer d'auto-validation. Une frappe REFUSÉE ne
// change pas la valeur, donc ne déclenche rien d'ici : c'est voulu.
watch(
  () => props.currentInput,
  (value) => {
    cancelAutoValidate()
    if (value === '') return

    flashKey.value += 1
    autoValidateTimer = setTimeout(() => emit('validate'), AUTO_VALIDATE_DELAY_MS)
  },
  { immediate: true },
)

// Refermer la popup en pleine saisie ne doit laisser aucun timer vivant, sans quoi la
// série s'enregistrerait toute seule après la fermeture.
onBeforeUnmount(cancelAutoValidate)

// AC12 : sur une saisie vide, `VALIDER` ne fait RIEN — pas même refermer la pop-up.
// Le store est déjà un no-op strict ; la garde est doublée ici pour que la pop-up ne
// se referme pas sur un tap à vide (revue de code du 2026-09-09).
function onValidate(): void {
  if (!hasInput.value) return
  emit('validate')
}

// Un « tap en dehors » est un geste COMPLET sur le voile : appui ET relâchement du MÊME
// pointeur. Se contenter du relâchement refermait la popup dès l'ouverture — le
// `pointerup` du geste qui a pressé « AJOUTER LES POINTS » retombe sur le voile qui vient
// d'apparaître sous le doigt. Il fallait littéralement garder le doigt appuyé pour voir
// la popup. Cette condition règle du même coup le doigt qui glisse de la carte vers le
// voile. Le `pointerId` est mémorisé (et non un simple booléen) pour qu'une paume posée
// sur le voile n'arme pas la fermeture au profit d'un autre doigt, et `pointercancel`
// désarme : sans lui, un appui annulé par le navigateur laissait le voile armé jusqu'au
// prochain relâchement venu d'ailleurs (revue de code du 2026-09-09).
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
  <!-- Vraie pop-up, comme la modale de configuration : la partie reste visible derrière,
       floutée. Un tap en dehors de la carte referme, comme la croix.
       Seule exception à `@pointerdown` (AR8) : le voile ferme sur un geste COMPLET
       (appui ET relâchement sur le voile). Fermer au seul contact jetterait la saisie dès
       qu'une paume d'appui touche le fond ; fermer au seul relâchement refermait la popup
       à son ouverture même. -->
  <div
    data-testid="modal-backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
    @pointerdown="armBackdropClose"
    @pointerup="closeFromBackdrop"
    @pointercancel="disarmBackdropClose"
  >
    <div
      data-testid="modal-card"
      class="relative flex max-h-full w-full max-w-2xl flex-col gap-3 overflow-hidden rounded-3xl border border-white/12 bg-bg/95 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
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
        <span class="text-stat font-bold tracking-[0.2em] text-white/55">{{ name }}</span>
      </header>

      <!-- La valeur en cours, en grand : elle remplace l'overlay que le panneau joueur
           portait avant que la saisie ne passe en popup. -->
      <div
        class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/12 py-2"
      >
        <span
          :key="rejectKey"
          data-testid="entry-value"
          :data-reject="rejectKey"
          class="text-reprise leading-none font-black tabular-nums"
          :class="[
            hasInput ? VALUE_CLASSES[color] : 'text-white/25',
            // Pulsation réservée au REFUS : sans cette condition, elle jouait aussi au
            // montage, donc à chaque ouverture de la pop-up, et le signal AC7 était dilué.
            rejectKey > 0 && 'animate-input-reject',
          ]"
          >{{ displayedValue }}</span
        >

        <!-- Accusé de réception visuel d'une frappe prise en compte (UX-DR17). -->
        <div
          v-if="hasInput"
          :key="flashKey"
          data-testid="input-flash"
          :data-flash="flashKey"
          class="pointer-events-none absolute inset-0 bg-white/25 animate-input-flash"
        />
      </div>

      <div class="min-h-0 flex-1 overflow-hidden">
        <NumericPad
          :hasInput="hasInput"
          @digit="onDigit"
          @clear="emit('clear')"
          @backspace="emit('backspace')"
        />
      </div>

      <footer class="shrink-0">
        <button
          data-testid="entry-confirm-button"
          class="relative w-full min-h-[var(--size-touch-target)] overflow-hidden rounded-2xl bg-accent text-label font-black text-on-accent touch-manipulation select-none active:brightness-90"
          @pointerdown="onValidate"
        >
          VALIDER

          <!-- Compte à rebours de l'auto-validation : purement visuel, aucune logique de
               score. Relancé à chaque frappe par sa `key`, en même temps que le timer. -->
          <span
            v-if="hasInput"
            :key="flashKey"
            data-testid="validate-countdown"
            class="absolute inset-x-0 bottom-0 h-2 origin-left bg-on-accent/70 animate-input-countdown"
            :style="{ animationDuration: `${AUTO_VALIDATE_DELAY_MS}ms` }"
          />
        </button>
      </footer>
    </div>
  </div>
</template>
