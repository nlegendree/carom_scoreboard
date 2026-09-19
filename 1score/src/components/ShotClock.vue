<script setup lang="ts">
import { computed } from 'vue'

// Story 2.1 : chrono de tir du 3 Bandes (FR13, UX-DR4). Anneau SVG classique (cercle +
// `stroke-dasharray`/`stroke-dashoffset`), inspiré du « SHOT CLOCK » circulaire du CUESCO
// — forme retenue, pas ses couleurs. Pas de librairie, comme les icônes SVG inline. La barre
// segmentée du Billiboard a été écartée (paliers visibles) : la transition CSS d'une
// seconde, calée sur le tick de `useTimer`, donne un mouvement continu.
//
// Revue de Nathan au rendu (2026-09-11) :
// - Couleur : un fondu VERT (40 s) → jaune → orange → ROUGE (0 s), sur l'arc ET le chiffre,
//   comme sur les chronos de tir traditionnels — le rouge permanent d'UX-DR4 ne reste que
//   comme point d'arrivée (rouge alerte de `DESIGN.md`, hsl(3 100% 59%), calculé ici sans
//   token). Teinte interpolée en HSL, la
//   transition CSS lisse aussi la couleur entre deux ticks.
// - Taille : l'anneau prend la place qui RESTE dans la colonne (`flex-1 min-h-0`) et se
//   dimensionne en unités de conteneur — `min(100cqw, 100cqh)` — au lieu d'un `w-full`
//   fixe qui, sur un iPad en paysage avec la barre Safari (~1180×673), poussait REP et
//   ÉCHANGER hors de l'écran. Le chiffre suit (`cqmin`), pour ne jamais déborder du disque.
// ⚠️ Story 11.5 (Nathan, au rendu, 2026-09-18) : le disque NE DÉBORDE PLUS sur les cartes,
// et la prop `turnRingSide` disparaît avec le demi-anneau qu'elle plaçait. Le débordement
// était la signature de colonnes SOUDÉES ; le scoreboard est passé en blocs séparés, et dès
// lors la gouttière s'arrêtait contre le disque au lieu d'en faire le tour. Le liseré de tour
// est redevenu l'affaire de la carte seule (`PlayerPanel` › `ring-8`), qui n'a plus rien à
// raccorder. Ne pas réintroduire un demi-anneau ici sans rouvrir la décision dans `DESIGN.md`.
const props = defineProps<{
  secondsRemaining: number
  totalSeconds: number
}>()

// Taille du disque : le plus petit des deux côtés de la zone (jamais plus large que la
// colonne, jamais plus haut que la place restante).
const DISC_SIZE_CLASSES = 'aspect-square w-[min(100cqw,100cqh)]'

// 1re passe de rendu de la 10.4 (Nathan, réf. `cueuny_scoreboard.png`) : l'arc est RENTRÉ
// dans le disque, qui lui fait une marge sombre tout autour. Collé au bord (rayon 42 sur un
// disque de 50), il se lisait comme un liseré ; à 36, le médaillon se détache des cartes sur
// lesquelles il déborde et l'arc « passe autour » du chiffre.
// 2e passe (2026-09-14) : trait AFFINÉ (10 → 7). Le disque ayant grossi en même temps, un
// trait épais redevenait lourd ; fin, il se lit comme un cadran et laisse respirer le
// chiffre. Le rayon ne bouge pas — c'est le disque entier qui grandit, porté par la colonne.
// Story 11.5 (Nathan, 2026-09-19, « agrandis-le un peu dans le cadre ») : rayon 36 → 43 et
// trait 7 → 6. Le rayon 36 détachait le médaillon des CARTES qu'il chevauchait ; le débordement
// abandonné, cette marge sombre ne sépare plus rien et l'arc vient presque au bord (bord
// extérieur à 46 sur 50). Le trait s'affine pour ne pas alourdir un anneau plus grand.
const RADIUS = 43
const STROKE_WIDTH = 6
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ratio = computed(() =>
  Math.max(0, Math.min(1, props.secondsRemaining / props.totalSeconds)),
)

const dashoffset = computed(() => CIRCUMFERENCE * (1 - ratio.value))

// Cap PLAT en toutes circonstances (3e passe de rendu, Nathan) : les extrémités arrondies
// débordaient de la piste et bavaient sur elle. Le cap droit règle du même coup l'artefact
// qui imposait déjà `butt` à zéro — un dash de longueur nulle y laissait un point à midi
// (AC7 : l'anneau doit être VIDE à 0). Il n'y a donc plus de cas particulier à traiter.

// Vert → rouge par le jaune et l'orange : la teinte descend linéairement de 130° à 3°
// (le rouge d'alerte du projet). Saturation et luminosité glissent vers celles de
// rouge alerte de `DESIGN.md` (#FF3B30, hsl 3 100 % 59 %) pour que l'arrivée soit exactement la
// couleur d'UX-DR4. Calculé ici, sans token `--color-*` : exception connue au miroir
// couleurs ↔ tokens (Story 11.2).
const color = computed(() => {
  const hue = Math.round(3 + 127 * ratio.value)
  const saturation = Math.round(100 - 30 * ratio.value)
  const lightness = Math.round(59 - 9 * ratio.value)
  return `hsl(${hue} ${saturation}% ${lightness}%)`
})

// Racine = conteneur de taille (`container-type: size`) : elle prend la place laissée par
// REP et les commandes et y centre l'anneau, qui vaut le plus petit de ses deux côtés —
// jamais plus large que la colonne, jamais plus haut que la place restante. Pas de libellé
// (retiré au rendu par Nathan, 2026-09-11) : l'anneau se suffit.
// ⚠️ Aucun commentaire HTML à la racine du gabarit (CLAUDE.md §12) : il en ferait un
// fragment, et la racine perdrait `classes()` comme ses attributs.
</script>

<template>
  <div
    data-testid="shot-clock"
    class="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center [container-type:size]"
  >
    <div class="flex min-h-0 w-full items-center justify-center">
      <div
        data-testid="shot-clock-ring"
        class="relative flex items-center justify-center rounded-full bg-bg [container-type:size]"
        :class="DISC_SIZE_CLASSES"
        role="timer"
        aria-live="off"
        :aria-label="`Chrono de tir : ${secondsRemaining} secondes restantes`"
      >
        <!-- `-rotate-90` fait partir le tracé de midi : l'anneau se vide en tournant. -->
        <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full -rotate-90">
          <circle
            data-testid="shot-clock-track"
            cx="50"
            cy="50"
            :r="RADIUS"
            fill="none"
            :stroke-width="STROKE_WIDTH"
            class="opacity-20 transition-[stroke] duration-1000 ease-linear"
            :style="{ stroke: color }"
          />
          <circle
            data-testid="shot-clock-arc"
            cx="50"
            cy="50"
            :r="RADIUS"
            fill="none"
            :stroke-width="STROKE_WIDTH"
            stroke-linecap="butt"
            class="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear"
            :style="{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashoffset, stroke: color }"
          />
        </svg>
        <!-- Le disque est lui-même un conteneur de taille : `text-clock` (48cqmin) = 48 % de SON diamètre
             (pas de celui de la zone), pour que deux chiffres tabulaires tiennent dans le
             disque intérieur — 80 % du diamètre depuis que l'arc est ressorti à `RADIUS 43`
             (Story 11.5 ; 62 % à rayon 36) : le chiffre remonte d'autant, 40 → 48 cqmin. -->
        <span
          data-testid="shot-clock-value"
          class="relative text-clock leading-none font-black tabular-nums transition-colors duration-1000 ease-linear"
          :style="{ color }"
          >{{ secondsRemaining }}</span
        >
      </div>
    </div>

  </div>
</template>
