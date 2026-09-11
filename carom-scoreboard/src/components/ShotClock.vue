<script setup lang="ts">
import { computed } from 'vue'

// Story 2.1 : chrono de tir du 3 Bandes (FR13, UX-DR4). Anneau SVG classique (cercle +
// `stroke-dasharray`/`stroke-dashoffset`), inspiré du « SHOT CLOCK » circulaire du CUESCO
// — forme retenue, pas ses couleurs. Fond NOIR littéral (`bg-black`, pas `bg-bg` qui est
// un gris-bleu). Pas de librairie, comme les icônes SVG inline de `GameView.vue`. La barre
// segmentée du Billiboard a été écartée (paliers visibles) : la transition CSS d'une
// seconde, calée sur le tick de `useTimer`, donne un mouvement continu.
//
// Revue de Nathan au rendu (2026-09-11) :
// - Couleur : un fondu VERT (40 s) → jaune → orange → ROUGE (0 s), sur l'arc ET le chiffre,
//   comme sur les chronos de tir traditionnels — le rouge permanent d'UX-DR4 ne reste que
//   comme point d'arrivée (`--color-alert`, hsl(3 100% 59%)). Teinte interpolée en HSL, la
//   transition CSS lisse aussi la couleur entre deux ticks.
// - Taille : l'anneau prend la place qui RESTE dans la colonne (`flex-1 min-h-0`) et se
//   dimensionne en unités de conteneur — `min(100cqw, 100cqh)` — au lieu d'un `w-full`
//   fixe qui, sur un iPad en paysage avec la barre Safari (~1180×673), poussait REP et
//   ÉCHANGER hors de l'écran. Le chiffre suit (`cqmin`), pour ne jamais déborder du disque.
const props = defineProps<{ secondsRemaining: number; totalSeconds: number }>()

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ratio = computed(() =>
  Math.max(0, Math.min(1, props.secondsRemaining / props.totalSeconds)),
)

const dashoffset = computed(() => CIRCUMFERENCE * (1 - ratio.value))

// Vert → rouge par le jaune et l'orange : la teinte descend linéairement de 130° à 3°
// (le rouge d'alerte du projet). Saturation et luminosité glissent vers celles de
// `--color-alert` pour que l'arrivée soit exactement la couleur d'UX-DR4.
const color = computed(() => {
  const hue = Math.round(3 + 127 * ratio.value)
  const saturation = Math.round(100 - 30 * ratio.value)
  const lightness = Math.round(59 - 9 * ratio.value)
  return `hsl(${hue} ${saturation}% ${lightness}%)`
})
</script>

<template>
  <!-- Racine = conteneur de taille (`container-type: size`) : elle prend la place laissée
       par REP et les commandes et y centre l'anneau, qui vaut le plus petit de ses deux
       côtés — jamais plus large que la colonne, jamais plus haut que la place restante.
       Pas de libellé (retiré au rendu par Nathan, 2026-09-11) : l'anneau se suffit. -->
  <div
    data-testid="shot-clock"
    class="flex min-h-0 w-full flex-1 flex-col items-center justify-center [container-type:size]"
  >
    <div class="flex min-h-0 w-full items-center justify-center">
      <div
        data-testid="shot-clock-ring"
        class="relative flex aspect-square w-[min(100cqw,100cqh)] items-center justify-center rounded-full bg-black [container-type:size]"
        role="img"
        :aria-label="`Chronomètre de série : ${secondsRemaining} secondes restantes`"
      >
        <!-- `-rotate-90` fait partir le tracé de midi : l'anneau se vide en tournant. -->
        <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full -rotate-90">
          <circle
            data-testid="shot-clock-track"
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke-width="8"
            class="opacity-20 transition-[stroke] duration-1000 ease-linear"
            :style="{ stroke: color }"
          />
          <circle
            data-testid="shot-clock-arc"
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke-width="8"
            stroke-linecap="round"
            class="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear"
            :style="{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashoffset, stroke: color }"
          />
        </svg>
        <!-- Le disque est lui-même un conteneur de taille : `44cqmin` = 44 % de SON diamètre
             (pas de celui de la zone), pour que deux chiffres tabulaires tiennent dans le
             disque intérieur (76 % du diamètre) à toute taille. -->
        <span
          data-testid="shot-clock-value"
          class="relative text-[44cqmin] leading-none font-black tabular-nums transition-colors duration-1000 ease-linear"
          :style="{ color }"
          >{{ secondsRemaining }}</span
        >
      </div>
    </div>
  </div>
</template>
