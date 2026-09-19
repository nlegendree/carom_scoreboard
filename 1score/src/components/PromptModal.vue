<script setup lang="ts">
import { computed, useId } from 'vue'
import CtaButton from './CtaButton.vue'
import PopupCard from './PopupCard.vue'
import { BALL_PICTOS } from './ballAssets'
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
// RÈGLE (Nathan, revue de fin d'Epic 10, 2026-09-15) : **toute pop-up qui porte un CTA
// `ANNULER` ou `FERMER` se referme au tap dehors, et ce tap VAUT ce CTA** (émet
// `secondary`). La règle est portée ICI, dérivée du libellé du secondaire, et non par une
// prop que chaque écran devrait penser à poser : le CADRE, « DISTANCE MANQUANTE », les
// confirmations de sortie et de RECOMMENCER, « PARTIE EN COURS » et les fins de partie
// ouvertes par une correction `+` (`ANNULER`) en héritent d'un coup. Une pop-up SANS retour
// — « PARTIE TERMINÉE » par série, ou l'offre d'égalisatrice dont le secondaire est
// `FIN DE PARTIE` — garde son voile inerte : taper à côté d'une décision sans « annuler »
// ne veut rien dire (AC18, Décision 12).
// La fermeture exige un geste COMPLET sur le voile : appui ET relâchement du même pointeur.
// Le mécanisme ne vit plus ici — il est dans `useBackdropClose`, que `PopupCard` consomme
// pour les quatre pop-ups (Story 11.3). C'est ce qui rend la règle
// sûre pour les pop-ups qui montent SOUS LE DOIGT (au `pointerdown` de `VALIDER` ou de `+`) —
// le `pointerup` de ce geste retombe sur le voile sans y avoir appuyé, et ne ferme rien.
// Purement présentationnel : aucun accès au store, la vue appelle les actions.
// Seule exception à `@pointerdown` (AR8) : la fermeture demande un geste complet. Pas de
// `role="button"` sur un voile plein écran, exception assumée à CLAUDE.md §2 (DT3).
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()`, `trigger()` et son `data-testid`.
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

// Les libellés de retour : un secondaire qui porte l'un d'eux ouvre le tap dehors (règle
// ci-dessus). Table littérale, à étendre si un nouveau libellé de retour apparaît.
const CANCEL_LABELS: readonly string[] = ['ANNULER', 'FERMER']
const closesOnBackdrop = computed(
  () => props.secondaryLabel !== undefined && CANCEL_LABELS.includes(props.secondaryLabel),
)

const emit = defineEmits<{ primary: []; secondary: []; select: [id: string] }>()

// Nom accessible de la pop-up (Story 10.7) : seule des quatre à porter un titre VISIBLE,
// elle se nomme par lui plutôt que par un `aria-label` statique. `useId()` (Vue 3.5) le
// rend unique par instance — un `id` écrit en dur collisionnerait dès que deux pop-ups
// coexistent, et les collisions d'`id` cassent silencieusement `aria-labelledby`.
const titleId = useId()

</script>

<template>
  <PopupCard
    testid="prompt-modal"
    cardTestid="prompt-card"
    :labelledBy="titleId"
    width="decision"
    gap="md"
    contain
    footerLayout="column"
    :closeOnBackdrop="closesOnBackdrop"
    @backdrop-close="emit('secondary')"
  >
      <!-- Titre TOUJOURS centré (revue du 2026-09-12) : la carte est resserrée, un titre
           collé à gauche y flottait. -->
      <header data-testid="prompt-header" class="flex shrink-0 items-center justify-center gap-4">
        <!-- L'IMAGE de la bille (Story 11.5, Nathan, 2026-09-19), la même que sur la carte de
             paramétrage et le récap : l'aplat de couleur qu'elle remplace se lisait comme un
             simple disque blanc. -->
        <img
          v-if="ball"
          data-testid="prompt-ball"
          :src="BALL_PICTOS[ball]"
          alt=""
          aria-hidden="true"
          class="size-5 shrink-0 object-contain"
        />
        <h2
          :id="titleId"
          data-testid="prompt-title"
          class="text-label font-black tracking-label text-white"
        >
          {{ title }}
        </h2>
      </header>

      <p v-if="message" data-testid="prompt-message" class="text-label text-white/70">
        {{ message }}
      </p>

      <!-- Pied en markup LINÉAIRE, sans branche d'ordre : le rang de choix, puis le
           principal (accent), puis le secondaire (neutre). Les deux ordres attendus en
           découlent d'eux-mêmes — sans `actions`, le principal passe AU-DESSUS d'`ANNULER`
           (ordre inversé le 2026-09-12 : l'action proposée se lit avant son refus) ; avec
           `actions`, `ANNULER` tombe SOUS les choix, où il serait sinon coincé entre le
           titre et la liste. Cibles ≥ 90 px. -->
      <template #footer>
        <!-- Les choix sur UNE ligne, en colonnes égales quel qu'en soit leur nombre : pas
             de `grid-cols-n` construit à la volée, que le scanner de Tailwind ne verrait
             pas. Tous portent le MÊME accent — aucun n'est le choix par défaut. -->
        <div
          v-if="actions?.length"
          data-testid="prompt-actions"
          class="grid grid-flow-col auto-cols-fr gap-2"
        >
          <CtaButton
            v-for="action in actions"
            :key="action.id"
            :data-testid="`prompt-action-${action.id}`"
            variant="accent"
            @press="emit('select', action.id)"
          >
            {{ action.label }}
          </CtaButton>
        </div>

        <CtaButton
          v-if="!actions?.length && primaryLabel"
          data-testid="prompt-primary"
          variant="accent"
          @press="emit('primary')"
        >
          {{ primaryLabel }}
        </CtaButton>

        <CtaButton
          v-if="secondaryLabel"
          data-testid="prompt-secondary"
          variant="neutral"
          class="w-full"
          @press="emit('secondary')"
        >
          {{ secondaryLabel }}
        </CtaButton>
      </template>
  </PopupCard>
</template>
