<script setup lang="ts">
import { computed } from 'vue'
import { useBackdropClose } from '../composables/useBackdropClose'
import type { TableSide } from '../types/game'

// LE patron des quatre pop-ups du produit — strate 3. Avant la Story 11.3, `PromptModal`,
// `ScoreEntryDock`, `NumericPadDock` et `AlphaKeyboardSheet` le recopiaient chacune : même
// voile, même carte en verre, même `role="dialog"`, même mécanisme de fermeture. L'audit du
// design system le relève en P2 (« les quatre pop-ups sont un patron, pas un composant »).
//
// Ce que `PopupCard` porte : le voile plein écran, le dialogue et son nom accessible, la
// carte en verre, le pied de CTA en slot, et la fermeture au tap dehors — dont elle est
// l'unique consommateur direct (`useBackdropClose`).
// Ce qu'elle ne porte PAS, et ne portera pas : aucun piège à focus, aucun `tabindex`, aucune
// écoute d'`Escape`. L'app tourne sur une tablette de club sans clavier — arbitrage
// « borne fixe », durable (CLAUDE.md §10).
//
// ⚠️ Le voile n'a PAS de `role="button"` : exception assumée à CLAUDE.md §2, conservée telle
// quelle. Il porte déjà `role="dialog"` et un élément n'a qu'un rôle ; et il ne porte aucun
// texte, donc le CSS que la règle veut faire hériter (`touch-action`, `user-select`) est sans
// objet. La fermeture porte déjà un nom : le CTA `ANNULER` de la carte.
// ⚠️ Le `data-testid` de la racine rendue est celui que l'APPELANT transmet : des dizaines de
// cas de `GameView.test.ts` et `HomeScreen.test.ts` les lisent, et le harnais de rendu pilote
// le parcours réel par eux.
// ⚠️ Aucun commentaire HTML à la racine du gabarit (CLAUDE.md §12).

// Nom accessible : `labelledBy` pointe le titre VISIBLE (`PromptModal` est la seule des
// quatre à en avoir un, et son `id` vient de `useId()`) ; `label` est l'`aria-label` statique
// des trois hôtes de saisie, qui n'ont pas de titre.
//
// ⚠️ Les deux sont EXCLUSIFS, et c'est le TYPE qui le tient depuis la revue du 2026-09-17 —
// le commentaire annonçait une garde qui n'existait pas. Deux props optionnelles
// indépendantes laissaient passer les deux fautes en silence : n'en poser AUCUNE rendait un
// `role="dialog" aria-modal="true"` sans nom accessible (VoiceOver annonce « dialogue », et
// rien d'autre — échec WCAG 4.1.2) ; poser les DEUX laissait `aria-labelledby` gagner en
// silence, l'`aria-label` mort restant dans le DOM à diverger du titre affiché.
type NameProps =
  | { labelledBy: string; label?: undefined }
  | { label: string; labelledBy?: undefined }

// Placement (AC4 de la 11.3) : le côté où la carte se pose, et la bande à réserver du côté
// OPPOSÉ. L'hôte les calcule à partir de SA mise en page — `PopupCard` ne sait rien de la
// géométrie d'un écran.
//
// ⚠️ Les deux vont par PAIRE, et c'est le type qui le tient depuis la revue du 2026-09-17.
// Deux optionnelles indépendantes dégradaient en SILENCE : `align` sans `reserve` retombait
// sur la gouttière uniforme et la pop-up recouvrait la carte qu'on est en train de remplir —
// exactement le défaut que la décision 2 de Nathan (2026-09-12) et l'AC9 de la 10.4 veulent
// empêcher ; `reserve` sans `align` était ignoré sans le moindre signal.
type PlacementProps =
  | { align: TableSide; reserve: string }
  | { align?: undefined; reserve?: undefined }

const props = withDefaults(
  defineProps<{
    // Racine rendue et carte : deux `data-testid` distincts, transmis tels quels.
    testid: string
    cardTestid: string
    // ⚠️ `width` et `gap` sont des NOMS, pas des valeurs : ils indexent une table de classes
    // écrites en toutes lettres. Une classe construite à partir d'un nom de token ne serait
    // pas vue par le scanner JIT de Tailwind et n'émettrait rien, en silence.
    width: 'decision' | 'pad' | 'alpha'
    gap: 'sm' | 'md'
    // `relative overflow-hidden`, et seulement sur demande : généraliser `overflow-hidden`
    // aux quatre cartes « pour faire propre » rognerait un retour d'animation sur une carte
    // de saisie, et la comparaison pixel pour pixel ne le verrait pas — elle est au repos.
    contain?: boolean
    // Le pied de la pop-up de décision EMPILE ses CTA (le principal se lit au-dessus de son
    // refus) ; celui des pop-ups de saisie les aligne (`ANNULER` à un tiers, `VALIDER` au
    // reste).
    footerLayout?: 'row' | 'column'
    // Règle du voile (CLAUDE.md §10) : une pop-up SANS retour garde un voile inerte.
    closeOnBackdrop?: boolean
  } & NameProps &
    PlacementProps>(),
  {
    labelledBy: undefined,
    label: undefined,
    contain: false,
    footerLayout: 'row',
    closeOnBackdrop: true,
    align: undefined,
    reserve: undefined,
  },
)

const emit = defineEmits<{ 'backdrop-close': [] }>()

const { onPointerdown, onPointerup, onPointercancel } = useBackdropClose(
  () => emit('backdrop-close'),
  { enabled: () => props.closeOnBackdrop },
)

const WIDTH_CLASSES: Record<'decision' | 'pad' | 'alpha', string> = {
  decision: 'max-w-(--size-popup-decision)',
  pad: 'max-w-(--size-popup-pad)',
  alpha: 'max-w-(--size-popup-alpha)',
}

const GAP_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'gap-2',
  md: 'gap-3',
}

// Sans `align`, la carte se centre dans une gouttière uniforme. Avec `align`, la gouttière
// verticale reste une classe et l'horizontale devient un STYLE EN LIGNE : c'est une valeur
// dynamique, donc impossible en classe Tailwind (CLAUDE.md §12) — et c'est une POSITION,
// donc sa place n'est pas dans le namespace des tokens.
const GUTTER = 'calc(var(--spacing) * 4)'

// `reserve` est garanti par le type dès qu'`align` est posé : plus de repli silencieux sur
// la gouttière (revue du 2026-09-17).
const placement = computed(() => {
  if (props.align === undefined) return undefined
  return props.align === 'left'
    ? { paddingInlineStart: GUTTER, paddingInlineEnd: props.reserve }
    : { paddingInlineStart: props.reserve, paddingInlineEnd: GUTTER }
})
</script>

<template>
  <div
    :data-testid="testid"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="labelledBy"
    :aria-label="label"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
    :class="align === undefined ? 'p-4' : 'py-4'"
    :style="placement"
    @pointerdown="onPointerdown"
    @pointerup="onPointerup"
    @pointercancel="onPointercancel"
  >
    <div
      :data-testid="cardTestid"
      class="flex max-h-full w-full flex-col rounded-popup border border-border bg-bg-raised/88 p-3 shadow-popup backdrop-blur-sm"
      :class="[WIDTH_CLASSES[width], GAP_CLASSES[gap], contain && 'relative overflow-hidden']"
    >
      <slot />

      <footer
        class="flex shrink-0 gap-2"
        :class="footerLayout === 'column' && 'flex-col'"
      >
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>
