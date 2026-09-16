<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import NumericPad from './NumericPad.vue'
import { useHaptics } from '../composables/useHaptics'
import { MAX_SCORE_DIGITS } from '../stores/useGameStore'
import type { TableSide } from '../types/game'

// Pop-up de saisie d'une série (JDS). Remplace `ScoreEntryModal` (pop-up CENTRÉE, voile
// flouté, croix, rappel bille + nom + valeur) par le modèle de pop-up LATÉRALE validé à la
// revue de rendu 10.3 : la pop-up s'aligne du côté OPPOSÉ à la carte du joueur qui a la
// main, cette carte reste entièrement VISIBLE ET NETTE, et la valeur tapée s'y écrit entre
// `−` et `+` (décision 2 de Nathan, 2026-09-12).
//
// Conséquences directes, toutes voulues :
// - voile `bg-black/25` SANS FLOU — flouter rendrait illisible la seule chose qu'on doit
//   lire pendant la frappe ;
// - plus de valeur ici, donc plus d'en-tête : ni croix, ni bille, ni nom. `ANNULER` prend
//   la place de la croix, comme dans toutes les pop-ups du produit ;
// - l'accusé de frappe (flash) se joue LÀ OÙ LA VALEUR CHANGE, donc sur la carte
//   (`PlayerPanel`), pas ici. Le refus, lui, reste sous le doigt : il pulse le pavé.
//
// ⚠️ Le buffer reste dans le STORE (`currentInput`), à l'inverse du paramétrage de la 10.3
// où il vit dans l'écran : il est persisté et restauré avec `entryOpen` par la Story 1.12.
// C'est une exigence, pas un choix de style — ne pas « harmoniser ».
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la racine
// perdrait `classes()` comme son `data-testid` (piège payé en 10.1 sur `ModeTile`).
const props = defineProps<{
  currentInput: string
  align: TableSide
}>()

// Emits IDENTIQUES à `ScoreEntryModal` : `GameView` ne change pas de branchement.
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

// La pop-up ne se colle pas au bord : elle se CENTRE dans la zone que la carte visée
// laisse libre. L'inset réserve la bande occupée par cette carte, `justify-center` fait le
// reste. ⚠️ Tokens PROPRES AU SCOREBOARD (colonnes 2/5 · 1/5 · 2/5, sans barre latérale) :
// `--setup-popup-inset-*` encode la géométrie de l'étape `players`, qui n'a rien à voir.
const ALIGN_CLASSES: Record<TableSide, string> = {
  left: 'pl-4 pr-[var(--game-popup-inset-right)]',
  right: 'pl-[var(--game-popup-inset-left)] pr-4',
}

const hasInput = computed(() => props.currentInput !== '')

// Compteurs de relance des animations CSS : changer la `key` d'un élément le recrée, ce
// qui rejoue son animation depuis le début. Aucun timer JS pour les retours visuels.
const countdownKey = ref(0)
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
// ⚠️ `MAX_SCORE_DIGITS` (série, 3 chiffres, FR7), PAS `MAX_TARGET_SCORE` (distance, 999) :
// ce sont deux constantes pour deux rôles, et les confondre ne casserait aucun type.
function onDigit(digit: number): void {
  if (props.currentInput.length >= MAX_SCORE_DIGITS) {
    // La frappe est ignorée, la valeur ne change pas. Le refus se signale par une haptique
    // distincte et une pulsation du pavé — la valeur, elle, est sur la carte.
    reject()
    rejectKey.value += 1
    return
  }

  emit('digit', digit)
  tap()
}

// Un seul observateur pilote les deux conséquences d'une variation de la saisie : compte à
// rebours visible et timer d'auto-validation. Une frappe REFUSÉE ne change pas la valeur,
// donc ne déclenche rien d'ici : c'est voulu.
watch(
  () => props.currentInput,
  (value) => {
    cancelAutoValidate()
    if (value === '') return

    countdownKey.value += 1
    autoValidateTimer = setTimeout(() => emit('validate'), AUTO_VALIDATE_DELAY_MS)
  },
  { immediate: true },
)

// Refermer la pop-up en pleine saisie ne doit laisser aucun timer vivant, sans quoi la
// série s'enregistrerait toute seule après la fermeture.
onBeforeUnmount(cancelAutoValidate)

// AC12 de la 1.5 : sur une saisie vide, `VALIDER` ne fait RIEN — pas même refermer la
// pop-up. Le store est déjà un no-op strict ; la garde est doublée ici pour que la pop-up
// ne se referme pas sur un tap à vide (revue de code du 2026-09-09).
function onValidate(): void {
  if (!hasInput.value) return
  emit('validate')
}

// Un « tap en dehors » est un geste COMPLET sur le voile : appui ET relâchement du MÊME
// pointeur. Se contenter du relâchement refermait la pop-up dès l'ouverture — le
// `pointerup` du geste qui a pressé le CTA retombe sur le voile qui vient d'apparaître
// sous le doigt. Le `pointerId` est mémorisé (et non un simple booléen) pour qu'une paume
// posée sur le voile n'arme pas la fermeture au profit d'un autre doigt, et `pointercancel`
// désarme. Seule exception assumée à `@pointerdown` seul (AR8).
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
    data-testid="score-entry-dock"
    role="dialog"
    aria-modal="true"
    aria-label="Saisie du score"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/25 py-4"
    :class="ALIGN_CLASSES[align]"
    @pointerdown="armBackdropClose"
    @pointerup="closeFromBackdrop"
    @pointercancel="disarmBackdropClose"
  >
    <div
      data-testid="score-entry-card"
      class="flex max-h-full w-full max-w-(--size-popup-pad) flex-col gap-2 rounded-modal border border-border bg-bg/95 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
      @pointerdown.stop
      @pointerup.stop
    >
      <div
        :key="rejectKey"
        data-testid="entry-reject"
        :data-reject="rejectKey"
        class="min-h-0 flex-1"
        :class="rejectKey > 0 && 'animate-input-reject'"
      >
        <NumericPad
          :hasInput="hasInput"
          @digit="onDigit"
          @clear="emit('clear')"
          @backspace="emit('backspace')"
        />
      </div>

      <footer class="flex shrink-0 gap-2">
        <button
          data-testid="entry-cancel-button"
          class="min-h-[var(--size-touch-target)] w-1/3 rounded-key bg-(image:--gradient-neutral) text-label font-black text-white touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('cancel')"
        >
          ANNULER
        </button>
        <button
          data-testid="entry-confirm-button"
          class="relative min-h-[var(--size-touch-target)] flex-1 overflow-hidden rounded-key bg-(image:--gradient-blue) text-label font-black text-white touch-manipulation select-none active:brightness-90"
          @pointerdown="onValidate"
        >
          VALIDER

          <!-- Compte à rebours de l'auto-validation : purement visuel, aucune logique de
               score. Relancé à chaque frappe par sa `key`, en même temps que le timer.
               Blanc PLEIN depuis la passe contraste de la 10.7 : c'est un objet graphique
               porteur d'information (WCAG 1.4.11, seuil 3:1), et `bg-white/70` ne donnait
               que 2,45:1 sur le stop clair de `--gradient-blue` — 3,46:1 en blanc plein.
               Elle survit à `prefers-reduced-motion` (décision de Nathan) : elle dit que le
               score va se valider seul et changer le tour, ce qu'aucun autre élément ne dit. -->
          <span
            v-if="hasInput"
            :key="countdownKey"
            data-testid="validate-countdown"
            :data-countdown="countdownKey"
            class="absolute inset-x-0 bottom-0 h-2 origin-left bg-white animate-input-countdown"
            :style="{ animationDuration: `${AUTO_VALIDATE_DELAY_MS}ms` }"
          />
        </button>
      </footer>
    </div>
  </div>
</template>
