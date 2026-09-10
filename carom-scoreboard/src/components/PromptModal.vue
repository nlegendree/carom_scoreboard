<script setup lang="ts">
import type { PlayerColor } from '../types/game'

// Pop-up de DÉCISION (Story 1.10) : erreur de distance, offre d'égalisatrice, partie
// terminée, sortie confirmée. Même coquille que `ScoreEntryModal`/`PlayerSetupModal`
// (voile flouté, carte centrée, CTA en pied) pour que toutes les pop-ups du produit se
// ressemblent — mais composant NEUF, pas dérivé : ici le voile est INERTE, et il n'y a
// PAS de croix : les croix ne sont pas intuitives pour les joueurs, un gros CTA l'est —
// le retour, quand il existe, est le CTA secondaire `ANNULER` (revue de Nathan,
// 2026-09-10).
// Fermer par un tap en dehors n'a pas de sens pour une décision (que voudrait dire
// « annuler » une fin de partie ?), et surtout la pop-up de fin monte SOUS LE DOIGT qui
// vient de valider une série : le `pointerup` de ce geste retombe sur le voile, qui ne
// doit rien en faire (AC18, Décision 12). Ne pas recopier `armBackdropClose`.
// Purement présentationnel : aucun accès au store, la vue appelle les actions.
withDefaults(
  defineProps<{
    title: string
    message?: string
    primaryLabel: string
    secondaryLabel?: string
    // Bille en en-tête, comme les autres pop-ups, quand la décision concerne un joueur.
    ball?: PlayerColor
  }>(),
  { message: undefined, secondaryLabel: undefined, ball: undefined },
)

const emit = defineEmits<{ primary: []; secondary: [] }>()

// Classes écrites en toutes lettres pour le scanner JIT de Tailwind v4.
const BALL_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
}
</script>

<template>
  <!-- Voile volontairement sans handler : voir l'en-tête du script. -->
  <div
    data-testid="prompt-modal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
  >
    <div
      class="relative flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-hidden rounded-3xl border border-white/12 bg-bg/95 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
    >
      <header class="flex shrink-0 items-center gap-4">
        <span
          v-if="ball"
          data-testid="prompt-ball"
          aria-hidden="true"
          class="h-5 w-5 shrink-0 rounded-full"
          :class="BALL_CLASSES[ball]"
        />
        <h2 data-testid="prompt-title" class="text-label font-black tracking-[0.1em] text-white">
          {{ title }}
        </h2>
      </header>

      <p v-if="message" data-testid="prompt-message" class="text-label text-white/70">
        {{ message }}
      </p>

      <!-- Pied : le CTA secondaire (neutre) AU-DESSUS du principal (accent), pleine
           largeur chacun — deux cibles ≥ 90 px qui ne se disputent pas la ligne. -->
      <footer class="flex shrink-0 flex-col gap-3">
        <button
          v-if="secondaryLabel"
          data-testid="prompt-secondary"
          class="w-full min-h-[var(--size-touch-target)] rounded-2xl bg-white/10 text-label font-black text-white touch-manipulation select-none active:bg-white/20"
          @pointerdown="emit('secondary')"
        >
          {{ secondaryLabel }}
        </button>
        <button
          data-testid="prompt-primary"
          class="w-full min-h-[var(--size-touch-target)] rounded-2xl bg-accent text-label font-black text-on-accent touch-manipulation select-none active:brightness-90"
          @pointerdown="emit('primary')"
        >
          {{ primaryLabel }}
        </button>
      </footer>
    </div>
  </div>
</template>
