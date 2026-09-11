<script setup lang="ts">
import { computed } from 'vue'
import {
  GAME_MODE_LABELS,
  type GameMode,
  type Player,
  type PlayerId,
  type TableSide,
} from '../types/game'

// Écran de récapitulatif façon « battle » (Story 1.10, UX-DR13), inspiré de Billiboard :
// bandeau `NOM / distance` VS `NOM / distance`, puis deux colonnes joueur autour d'une
// colonne de libellés, la colonne du vainqueur mise en couleur. Strictement
// PRÉSENTATIONNEL : aucun emit, aucun accès au store — `GameView` lui passe ce qu'il
// affiche, et porte les deux boutons de la barre basse. Sans aucune interaction : le
// récap est terminal, on n'y corrige rien.
type PerSide<T> = { player1: T; player2: T }

const props = withDefaults(
  defineProps<{
    mode: GameMode
    player1: Player
    player2: Player
    averages: PerSide<number>
    bestSeries: PerSide<number>
    repriseCounts: PerSide<number>
    // `null` = égalité.
    winner: PlayerId | null
    // État visuel « nouveau record » par joueur (AC17) : JAMAIS déclenché ici, la
    // Story 3.5 l'activera sans modifier ce composant.
    records?: PerSide<boolean>
    // Côté d'affichage de la bille blanche (Story 10.3, AR24) : le récap CONSERVE les
    // côtés du scoreboard, sans quoi les deux se contrediraient d'un écran à l'autre.
    whiteSide?: TableSide
  }>(),
  { records: () => ({ player1: false, player2: false }), whiteSide: 'left' },
)

// Ordre des colonnes, gauche puis droite. `player1` est la bille BLANCHE et non le joueur
// de gauche : c'est `whiteSide` qui dit où sa carte est posée.
const SIDES = computed<readonly PlayerId[]>(() =>
  props.whiteSide === 'left' ? ['player1', 'player2'] : ['player2', 'player1'],
)
const leftSide = computed<PlayerId>(() => SIDES.value[0]!)
const rightSide = computed<PlayerId>(() => SIDES.value[1]!)

// Classes écrites en toutes lettres pour le scanner JIT de Tailwind v4.
const BALL_CLASSES: Record<PlayerId, string> = {
  player1: 'bg-player-white',
  player2: 'bg-player-yellow',
}

// Colonne du vainqueur : ruban rouge (décision du 2026-09-10, fidèle au rose/rouge
// Billiboard ; l'or `victory-gold` reste le repli si le rendu ne convainc pas, UX-DR5).
// L'autre reste neutre sur fond sombre. Égalité : les deux en neutre. Le signal ne
// repose pas sur la seule teinte — le mot `VICTOIRE` est là (UX-DR22).
const VICTORY_COLUMN_CLASSES = 'bg-victory-ribbon text-on-victory-ribbon'
const NEUTRAL_COLUMN_CLASSES = 'bg-white/6 text-white'

const modeLabel = computed(() => GAME_MODE_LABELS[props.mode])

function resultOf(side: PlayerId): 'VICTOIRE' | 'DÉFAITE' | 'ÉGALITÉ' {
  if (props.winner === null) return 'ÉGALITÉ'
  return props.winner === side ? 'VICTOIRE' : 'DÉFAITE'
}

function columnClasses(side: PlayerId): string {
  return props.winner === side ? VICTORY_COLUMN_CLASSES : NEUTRAL_COLUMN_CLASSES
}

// Convention des fédérations de billard : moyenne générale à 3 décimales.
function averageOf(side: PlayerId): string {
  return props.averages[side].toFixed(3)
}

const players = computed<Record<PlayerId, Player>>(() => ({
  player1: props.player1,
  player2: props.player2,
}))
</script>

<template>
  <div data-testid="game-summary" class="flex h-full w-full flex-col bg-bg">
    <!-- Bandeau : NOM / distance — VS — NOM / distance, dans l'ordre des côtés du
         scoreboard. Le mode de jeu en surtitre discret au-dessus du VS, jamais en
         concurrence avec les noms (AC13). -->
    <header
      data-testid="summary-banner"
      class="flex shrink-0 items-center justify-between gap-4 px-4 py-3"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <span aria-hidden="true" class="h-5 w-5 shrink-0 rounded-full" :class="BALL_CLASSES[leftSide]" />
        <span
          :data-testid="`summary-${leftSide}`"
          class="truncate text-label font-black text-white"
        >
          {{ players[leftSide].name }} / {{ players[leftSide].targetScore }}
        </span>
      </div>

      <div class="flex shrink-0 flex-col items-center leading-none">
        <span data-testid="summary-mode" class="text-stat tracking-[0.3em] text-white/50">
          {{ modeLabel }}
        </span>
        <span class="text-reprise font-black italic text-white/50">VS</span>
      </div>

      <div class="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span
          :data-testid="`summary-${rightSide}`"
          class="truncate text-label font-black text-white"
        >
          {{ players[rightSide].name }} / {{ players[rightSide].targetScore }}
        </span>
        <span aria-hidden="true" class="h-5 w-5 shrink-0 rounded-full" :class="BALL_CLASSES[rightSide]" />
      </div>
    </header>

    <!-- Table : trois colonnes de hauteur égale, une cellule par statistique. Les
         colonnes joueur sont colorées ENTIÈRES (d'où des colonnes, pas une grille de
         lignes) ; les cellules `flex-1` gardent les lignes alignées entre elles. -->
    <div class="flex min-h-0 flex-1 gap-2 px-4 pb-4">
      <template v-for="(side, index) in SIDES" :key="side">
        <div
          v-if="index === 1"
          class="flex w-1/5 shrink-0 flex-col text-center text-stat font-bold tracking-[0.2em] text-white/50"
        >
          <span class="flex flex-1 items-center justify-center">RÉSULTAT</span>
          <span class="flex flex-1 items-center justify-center">POINTS</span>
          <span class="flex flex-1 items-center justify-center">MOY</span>
          <span class="flex flex-1 items-center justify-center">SÉRIE</span>
          <span class="flex flex-1 items-center justify-center">REPRISES</span>
        </div>

        <div
          data-testid="summary-column"
          :data-side="side"
          class="flex min-w-0 flex-1 flex-col rounded-3xl text-center"
          :class="columnClasses(side)"
        >
          <div class="flex flex-1 flex-col items-center justify-center gap-1">
            <span class="flex items-center gap-2">
              <span aria-hidden="true" class="h-5 w-5 rounded-full" :class="BALL_CLASSES[side]" />
              <span data-testid="summary-result" class="text-label font-black tracking-[0.1em]">
                {{ resultOf(side) }}
              </span>
            </span>
            <span
              v-if="records[side]"
              data-testid="summary-record"
              class="rounded-full bg-black/20 px-3 text-stat font-bold tracking-[0.2em]"
            >
              ★ RECORD
            </span>
          </div>
          <span
            data-testid="summary-points"
            class="flex flex-1 items-center justify-center text-reprise leading-none font-black tabular-nums"
          >
            {{ players[side].score }}
          </span>
          <span
            data-testid="summary-average"
            class="flex flex-1 items-center justify-center text-label font-black tabular-nums"
          >
            {{ averageOf(side) }}
          </span>
          <span
            data-testid="summary-best"
            class="flex flex-1 items-center justify-center text-label font-black tabular-nums"
          >
            {{ bestSeries[side] }}
          </span>
          <span
            data-testid="summary-reprises"
            class="flex flex-1 items-center justify-center text-label font-black tabular-nums"
          >
            {{ repriseCounts[side] }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
