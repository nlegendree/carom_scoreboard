<script setup lang="ts">
import { computed } from 'vue'
import type { Player, PlayerColor } from '../types/game'

// La distance appartient au joueur, pas à la partie : le panneau la lit sur `player`
// et la transporte donc automatiquement lors d'une interversion des billes.
// Panneau strictement PRÉSENTATIONNEL : il n'accède pas au store, il émet.
const props = withDefaults(
  defineProps<{
    player: Player
    active: boolean
    average?: number
    bestSeries?: number
  }>(),
  { average: 0, bestSeries: 0 },
)

const emit = defineEmits<{ 'pass-turn': []; 'adjust-score': [delta: number] }>()

// Classes écrites en toutes lettres (et non construites dynamiquement) pour que
// le scanner JIT de Tailwind v4 les détecte et génère bien le CSS correspondant.
const PLAYER_COLOR_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white text-on-player-white',
  yellow: 'bg-player-yellow text-on-player-yellow',
}

// Le score doit être le plus GROS possible dans sa carte. Une taille unique ne peut pas
// y suffire : le panneau fait 40 % de la largeur d'écran, et ce qui tient à un chiffre
// déborde à trois. La taille est donc choisie selon le nombre de caractères affichés.
// Deux bornes dans chaque valeur : `vw` protège de la largeur du panneau, `vh` de sa
// hauteur, et le plafond en pixels évite un chiffre démesuré sur un signage 22".
// Clés littérales, jamais construites par template : le scanner JIT ne verrait rien.
// Valeurs calées au navigateur : un chiffre en `tabular-nums` occupe ~0,68 em de large,
// et le panneau fait 40vw moins ses marges. Les paliers laissent volontairement ~10 % de
// marge de chaque côté — sans cette réserve, un total à trois chiffres frôle les bords.
const SCORE_SIZE_CLASSES: Record<number, string> = {
  1: 'text-[min(42vw,46vh,320px)]',
  2: 'text-[min(24vw,46vh,320px)]',
  3: 'text-[min(16vw,46vh,320px)]',
  4: 'text-[min(12vw,46vh,320px)]',
}
const SCORE_SIZE_FALLBACK = 'text-[min(9vw,46vh,320px)]'

const colorClasses = computed(() => PLAYER_COLOR_CLASSES[props.player.color])

const displayedScore = computed(() => String(props.player.score))
const scoreSizeClass = computed(
  () => SCORE_SIZE_CLASSES[displayedScore.value.length] ?? SCORE_SIZE_FALLBACK,
)

// Les deux blocs joueur portent un texte noir : un filigrane sombre convient donc au
// blanc comme au jaune, sans dupliquer le style par couleur.
const ADJUST_BUTTON_CLASSES =
  'flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] items-center justify-center rounded-2xl bg-black/8 text-3xl font-black leading-none opacity-60 touch-manipulation select-none active:bg-black/16 active:opacity-100'

// Convention des fédérations de billard : moyenne générale à 3 décimales.
const displayedAverage = computed(() => props.average.toFixed(3))

// On rend la main en tapant la zone de l'ADVERSAIRE : un panneau qui a déjà la main
// n'a rien à faire d'un tap. Sans cette garde, le joueur actif se retirerait le tour.
function tap(): void {
  if (props.active) return
  emit('pass-turn')
}

// Correction manuelle du total, ±1 par appui. Les boutons vivent DANS la carte, qui rend
// la main au tap : la propagation est arrêtée au niveau du template, sans quoi corriger
// le score de l'adversaire lui donnerait la main du même geste.
function adjust(delta: number): void {
  emit('adjust-score', delta)
}
</script>

<template>
  <div
    class="@container relative flex h-full min-w-0 flex-1 flex-col overflow-hidden px-2 py-2 touch-manipulation select-none"
    :class="[colorClasses, { 'ring-8 ring-turn-active ring-inset': active }]"
    role="button"
    @pointerdown="tap"
  >
    <!-- Nom, statistiques et distance sur UNE SEULE ligne.
         La densité des statistiques est réglée par `@container`, donc par la largeur du
         PANNEAU et non par celle de l'écran : un breakpoint classique ne verrait pas la
         différence, alors que le panneau passe de 410px en paysage à 307px en portrait.
         Au format serré, la ligne complète réclamait 219px et écrasait le nom à 8px.
         ⚠️ Le seuil porte sur la CONTENT BOX du conteneur, padding déduit : 378px en
         paysage tablette pour un panneau de 410. `@sm` (384px) ne s'y déclenchait donc
         jamais. 420px agrandit les statistiques sur un signage large et les laisse
         discrètes sur tablette — où elles doivent de toute façon rester secondaires
         devant le nom, comme sur la borne de référence.
         Le nom reste le seul élément élastique (`min-w-0 truncate`) — une valeur chiffrée
         rognée deviendrait fausse à la lecture, jamais elle.
         Pas de `px-2` ici : le panneau en porte déjà un, et le doubler coûtait 32px de
         largeur au nom, soit trois caractères de plus tronqués en portrait. -->
    <div
      data-testid="panel-header"
      class="flex shrink-0 items-baseline justify-between gap-1 @min-[420px]:gap-3"
    >
      <span class="min-w-0 truncate text-label font-bold">{{ player.name }}</span>

      <div
        data-testid="panel-stats"
        class="flex shrink-0 items-baseline gap-2 text-[11px] @min-[420px]:gap-3 @min-[420px]:text-stat"
      >
        <span class="flex items-baseline gap-1 opacity-70">
          <span class="font-bold">MOY</span>
          <span data-testid="average" class="font-black tabular-nums">{{
            displayedAverage
          }}</span>
        </span>
        <span class="flex items-baseline gap-1 opacity-70">
          <span class="font-bold">SÉRIE</span>
          <span data-testid="best-series" class="font-black tabular-nums">{{
            bestSeries
          }}</span>
        </span>
        <!-- Distance libre (0) : l'emplacement disparaît entièrement, pas de tiret ni de
             zéro à interpréter (NFR12). -->
        <span
          v-if="player.targetScore > 0"
          data-testid="target-score"
          class="font-black tabular-nums"
          >{{ player.targetScore }}</span
        >
      </div>
    </div>

    <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
      <span
        data-testid="score"
        class="leading-none font-black tabular-nums"
        :class="scoreSizeClass"
        >{{ displayedScore }}</span
      >
    </div>

    <!-- Correction du total sans toucher au déroulé de la partie : ni reprise, ni bascule
         de tour. Posés aux deux coins bas et en filigrane — ce sont des rattrapages
         d'arbitrage, ils ne doivent pas attirer l'œil autant que le score.
         `.stop` obligatoire : la carte rend la main au tap. -->
    <div class="flex shrink-0 items-center justify-between">
      <button
        data-testid="score-minus"
        aria-label="Retirer un point"
        :class="ADJUST_BUTTON_CLASSES"
        @pointerdown.stop="adjust(-1)"
      >
        −
      </button>
      <button
        data-testid="score-plus"
        aria-label="Ajouter un point"
        :class="ADJUST_BUTTON_CLASSES"
        @pointerdown.stop="adjust(1)"
      >
        +
      </button>
    </div>
  </div>
</template>
