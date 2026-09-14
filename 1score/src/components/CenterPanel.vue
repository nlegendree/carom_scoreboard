<script setup lang="ts">
import ShotClock from './ShotClock.vue'
import PictoIcon from './PictoIcon.vue'
import { SHOT_CLOCK_SECONDS } from '../composables/useTimer'

// Colonne centrale du scoreboard, réduite à l'essentiel par la Story 10.4 (AC5) : le
// compteur de reprises, le chrono (3 Bandes seulement) et `PASSER LE TOUR`. Le mode de jeu
// en est sorti le 2026-09-09, `ÉCHANGER` en Story 10.3 (AR22, DT7), et `ANNULER` descend
// en barre basse avec les trois autres pictos ici.
//
// `secondsRemaining` (Story 2.1) : chrono de tir du 3 Bandes, `null` dans les autres
// modes — c'est la vue qui filtre par mode, la console reste générique. En JDS l'espace
// reste vide et `PASSER LE TOUR` remonte : rien à masquer, `flex-1` s'en charge.
const props = withDefaults(
  defineProps<{
    repriseNumber: number
    secondsRemaining: number | null
    // Pop-up de fin ouverte : le CTA reste visible mais inerte (AC8).
    passTurnDisabled?: boolean
    // Pop-up de saisie ouverte : le CTA est MASQUÉ — il se retrouverait sous le voile,
    // et le doigt qui vient de fermer la pop-up tomberait dessus (AC8).
    entryOpen?: boolean
  }>(),
  { passTurnDisabled: false, entryOpen: false },
)

// `PASSER LE TOUR` (Story 10.4) remplace le tap sur la carte adverse comme seul geste de
// passage de main. La vue le branche sur `passTurn()` du store, REPRISE TELLE QUELLE
// (AR23) : la règle — série de 0 en JDS, clôture de la série comptée en 3 Bandes — n'a pas
// bougé d'une ligne, seul le geste change. Il est symétrique au sens d'UX-DR11 (il rend la
// main quel que soit le joueur actif), ce qui l'autorise dans la colonne centrale,
// contrairement à une saisie de score.
const emit = defineEmits<{ 'pass-turn': [] }>()

// `disabled` porte le visuel, la garde porte le comportement : les navigateurs ne
// s'accordent pas sur l'envoi des pointer events aux contrôles désactivés.
function passTurn(): void {
  if (props.passTurnDisabled) return
  emit('pass-turn')
}
</script>

<template>
  <div
    class="flex w-1/5 min-w-0 shrink-0 flex-col items-center justify-center gap-3 overflow-visible border border-border bg-surface p-2"
  >
    <div class="flex w-full min-w-0 flex-col items-center">
      <span data-testid="reprise-label" class="text-stat text-white/60">REP</span>
      <!-- `text-reprise` est dimensionné pour la colonne (w-1/5) et non pour un panneau
           joueur : `text-score` (plancher 120px) déborde dès 2 chiffres sur tablette. -->
      <span
        data-testid="reprise-number"
        class="w-full text-center text-reprise leading-none font-black tabular-nums text-white"
        >{{ repriseNumber }}</span
      >
    </div>

    <!-- Story 2.1 : anneau du chrono de tir, uniquement en 3 Bandes (UX-DR4).
         Story 10.4 (AC16) : il DÉBORDE franchement sur les deux cartes (modèle Cueuny) —
         16 px de chaque côté, au-dessus d'elles (`z-10`). Le débordement est porté ICI, par
         la colonne, et non par `ShotClock`, qui reste dimensionné par son conteneur.
         ⚠️ Le calcul se fait sur la CONTENT BOX, padding déduit : la colonne porte `p-2`
         (16 px), donc `-mx-2` + `calc(100% + 32px)` ne fait que reconstituer sa border-box —
         l'anneau remplit alors la colonne sans en sortir d'un pixel (mesuré à la passe
         navigateur). Il faut le double : `-mx-4` (32 px) pour 16 px de débordement réel de
         chaque côté. Les cartes réservent 24 px (`INNER_GUTTER_CLASSES`), de quoi l'absorber.
         ⚠️ Aucun `overflow-hidden` sur cette colonne ni sur ses ancêtres, sans quoi
         l'anneau serait rogné au bord sans le moindre message d'erreur. Les cartes
         réservent en contrepartie une gouttière intérieure (`INNER_GUTTER_CLASSES`). -->
    <div
      v-if="secondsRemaining !== null"
      data-testid="shot-clock-bleed"
      class="relative z-10 -mx-5 flex min-h-0 w-[calc(100%+80px)] flex-1"
    >
      <ShotClock :secondsRemaining="secondsRemaining" :totalSeconds="SHOT_CLOCK_SECONDS" />
    </div>

    <!-- AC5 : CTA neutre, pleine largeur de colonne, ≥ 90 px de haut. Il n'engage rien
         d'irréversible (`ANNULER` le défait, AC8) : ni bleu de réglage, ni rouge
         d'engagement — le neutre opaque de l'epic.
         ⚠️ SANS contour (1re passe de rendu, Nathan) : le filet clair de
         `--color-border-strong` dessinait un cadre dans un cadre au milieu de la colonne.
         Le neutre opaque se détache seul du fond de la colonne. -->
    <button
      v-if="!entryOpen"
      data-testid="pass-turn-button"
      :disabled="passTurnDisabled"
      class="flex min-h-[var(--size-touch-target)] w-full flex-col items-center justify-center gap-1 bg-(image:--gradient-neutral) px-2 text-center text-stat font-black leading-tight text-white rounded-cta touch-manipulation select-none active:brightness-90 disabled:opacity-30"
      @pointerdown="passTurn"
    >
      <PictoIcon name="pass-turn" class="size-4 shrink-0" />
      <span>PASSER LE TOUR</span>
    </button>
  </div>
</template>
