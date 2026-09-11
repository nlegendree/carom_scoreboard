<script setup lang="ts">
import type { PlayerColor } from '../types/game'
import type { PromptAction } from '../types/ui'

// Pop-up de DÉCISION (Story 1.10) : erreur de distance, offre d'égalisatrice, partie
// terminée, sortie confirmée. Même coquille que `ScoreEntryModal`/`PlayerSetupModal`
// (voile flouté, carte centrée, CTA en pied) pour que toutes les pop-ups du produit se
// ressemblent — mais composant NEUF, pas dérivé : ici le voile est INERTE, et il n'y a
// PAS de croix : les croix ne sont pas intuitives pour les joueurs, un gros CTA l'est —
// le retour, quand il existe, est le CTA secondaire `ANNULER` (revue de Nathan,
// 2026-09-10).
// Fermer par un tap en dehors n'a pas de sens pour une DÉCISION (que voudrait dire
// « annuler » une fin de partie ?), et surtout la pop-up de fin monte SOUS LE DOIGT qui
// vient de valider une série : le `pointerup` de ce geste retombe sur le voile, qui ne
// doit rien en faire (AC18, Décision 12). Le voile reste donc inerte pour ces pop-ups.
// EXCEPTION, variante LISTE (revue de rendu de Nathan, 2026-09-12) : un choix, lui, est
// annulable — taper à côté y vaut `ANNULER`, et émet donc `secondary`. La fermeture exige
// un geste COMPLET sur le voile (`armBackdropClose`, repris de `PlayerSetupModal`), sans
// quoi le `pointerup` du geste qui vient d'ouvrir la pop-up la refermerait aussitôt.
// Purement présentationnel : aucun accès au store, la vue appelle les actions.
const props = withDefaults(
  defineProps<{
    title: string
    message?: string
    // Optionnel depuis la 10.2 : la variante liste n'a pas de CTA principal. Les six
    // appels d'origine le passent toujours.
    primaryLabel?: string
    secondaryLabel?: string
    // Variante LISTE (Story 10.2) : n choix empilés à la place du principal — le choix
    // Cadre. Un ajout, pas un remplacement : les pop-ups à un ou deux CTA n'y touchent pas.
    actions?: readonly PromptAction[]
    // Bille en en-tête, comme les autres pop-ups, quand la décision concerne un joueur.
    ball?: PlayerColor
  }>(),
  {
    message: undefined,
    primaryLabel: undefined,
    secondaryLabel: undefined,
    actions: undefined,
    ball: undefined,
  },
)

const emit = defineEmits<{ primary: []; secondary: []; select: [id: string] }>()

// Classes écrites en toutes lettres pour le scanner JIT de Tailwind v4.
const BALL_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white',
  yellow: 'bg-player-yellow',
}

// Un seul gabarit de bouton pour les trois familles du pied (choix, secondaire, principal) :
// c'est ce qui fait que toutes les pop-ups du produit se ressemblent. Rayon pris au token
// `--radius-cta` (0 depuis la passe de rendu 10.1) plutôt qu'à l'échelle de Tailwind : les
// angles vifs de l'Epic 10 valent pour les pop-ups aussi (revue de Nathan, 2026-09-12).
// Chaque CTA porte SON dégradé, jamais un dégradé étalé sur la rangée. L'accent est LE
// bleu du produit, celui des tuiles de mode (décision de Nathan, 2026-09-12).
const BUTTON_CLASSES =
  'w-full min-h-[var(--size-touch-target)] rounded-cta text-label font-black touch-manipulation select-none'
const ACCENT_CLASSES = `${BUTTON_CLASSES} bg-(image:--gradient-blue) text-white active:brightness-90`
const NEUTRAL_CLASSES = `${BUTTON_CLASSES} bg-(image:--gradient-neutral) text-white active:brightness-125`

// Tap en dehors, variante liste seulement. `pointerId` mémorisé et non un booléen, pour
// qu'une paume posée sur le voile n'arme pas la fermeture au profit d'un autre doigt ;
// `pointercancel` désarme (même mécanique que `PlayerSetupModal`, revue du 2026-09-09).
let backdropPointerId: number | null = null

function armBackdropClose(event: PointerEvent): void {
  if (!props.actions?.length) return
  backdropPointerId = event.pointerId
}

function disarmBackdropClose(): void {
  backdropPointerId = null
}

function closeFromBackdrop(event: PointerEvent): void {
  if (backdropPointerId === null || backdropPointerId !== event.pointerId) return
  backdropPointerId = null
  emit('secondary')
}
</script>

<template>
  <!-- Voile INERTE pour les pop-ups de décision : les gardes vivent dans les handlers, qui
       ne font rien hors variante liste (voir l'en-tête du script). Seule exception à
       `@pointerdown` (AR8) : la fermeture demande un geste complet. Pas de `role="button"`
       sur un voile plein écran, exception assumée à CLAUDE.md §2 (DT3). -->
  <div
    data-testid="prompt-modal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    @pointerdown="armBackdropClose"
    @pointerup="closeFromBackdrop"
    @pointercancel="disarmBackdropClose"
  >
    <!-- Carte resserrée (revue de Nathan, 2026-09-12) : la pop-up ne doit pas manger
         l'écran. En variante liste, le titre se centre au-dessus du rang de choix. -->
    <div
      data-testid="prompt-card"
      class="relative flex max-h-full w-full max-w-xl flex-col gap-3 overflow-hidden rounded-modal border border-white/12 bg-bg/95 p-3 shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
      @pointerdown.stop
      @pointerup.stop
    >
      <header
        data-testid="prompt-header"
        class="flex shrink-0 items-center gap-4"
        :class="actions?.length ? 'justify-center' : ''"
      >
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

      <!-- Pied en markup LINÉAIRE, sans branche d'ordre : le rang de choix, puis le
           secondaire (neutre), puis le principal (accent). Les deux ordres attendus en
           découlent d'eux-mêmes — sans `actions`, le secondaire reste AU-DESSUS du
           principal, comme depuis la 1.10 ; avec `actions`, `ANNULER` tombe SOUS les choix,
           où il serait sinon coincé entre le titre et la liste. Cibles ≥ 90 px. -->
      <footer class="flex shrink-0 flex-col gap-2">
        <!-- Les choix sur UNE ligne, en colonnes égales quel qu'en soit leur nombre : pas
             de `grid-cols-n` construit à la volée, que le scanner de Tailwind ne verrait
             pas. Tous portent le MÊME accent — aucun n'est le choix par défaut. -->
        <div
          v-if="actions?.length"
          data-testid="prompt-actions"
          class="grid grid-flow-col auto-cols-fr gap-2"
        >
          <button
            v-for="action in actions"
            :key="action.id"
            :data-testid="`prompt-action-${action.id}`"
            :class="ACCENT_CLASSES"
            @pointerdown="emit('select', action.id)"
          >
            {{ action.label }}
          </button>
        </div>

        <button
          v-if="secondaryLabel"
          data-testid="prompt-secondary"
          :class="NEUTRAL_CLASSES"
          @pointerdown="emit('secondary')"
        >
          {{ secondaryLabel }}
        </button>

        <button
          v-if="!actions?.length && primaryLabel"
          data-testid="prompt-primary"
          :class="ACCENT_CLASSES"
          @pointerdown="emit('primary')"
        >
          {{ primaryLabel }}
        </button>
      </footer>
    </div>
  </div>
</template>
