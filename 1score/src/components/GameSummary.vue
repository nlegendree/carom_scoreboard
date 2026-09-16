<script setup lang="ts">
import { computed } from 'vue'
import { BALL_PICTOS, ballOf } from './ballAssets'
import {
  GAME_MODE_LABELS,
  type GameMode,
  type Player,
  type PlayerId,
  type TableSide,
} from '../types/game'

// Écran de récapitulatif façon « battle » (Story 1.10, UX-DR13), inspiré de Billiboard :
// bandeau `NOM | distance` VS `NOM | distance`, puis deux colonnes joueur autour d'une
// colonne de libellés, la colonne du vainqueur mise en couleur. Strictement
// PRÉSENTATIONNEL : aucun emit, aucun accès au store — `GameView` lui passe ce qu'il
// affiche, et porte la barre latérale. Sans aucune interaction : le récap est terminal,
// on n'y corrige rien (Story 10.5, AC6).
// Story 10.5 : le composant est le PANNEAU de contenu de la coquille de l'Epic 10 — il
// porte son conteneur à contour, la coquille (dégradé + `SideBar`) est dans `GameView`.
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

// ⚠️ Une seule pastille par joueur, dans la ligne `RÉSULTAT` : celle du bandeau a été
// retirée à la 1re passe de rendu (Nathan) — la bille y était dite deux fois, et le nom
// avait besoin de la place pour grossir.
// Le picto vient de `ballAssets` depuis la Story 11.3, traduit du `PlayerId` de l'écran vers
// la `PlayerColor` de la table : le récap ne redéclare plus les deux chemins.

// Colonne du vainqueur : ruban rouge (décision du 2026-09-10, fidèle au rose/rouge
// Billiboard, UX-DR5). L'autre reste neutre sur fond sombre. Égalité : les deux en neutre.
// Le signal ne repose pas sur la seule teinte — le mot `VICTOIRE` est là (UX-DR22).
// Le ruban est LE rouge profond du produit, `--color-brand-red` (DESIGN.md › Colors, Règle du
// rouge qui engage) : la Story 11.2 a fusionné `--color-victory-ribbon`, qui valait la même
// couleur — un second rouge repasserait par DESIGN.md. Blanc dessus : 4,95:1.
// Les cellules neutres sont la surface voilée que DESIGN.md nomme (`bg-surface`), la même
// que le conteneur : un voile, pas une couleur.
const VICTORY_COLUMN_CLASSES = 'bg-brand-red text-white'
const NEUTRAL_COLUMN_CLASSES = 'bg-surface text-white'

// 1re passe de rendu (Nathan, réf. `billiboard_recap_2`) : chaque statistique est un BLOC,
// pas une tranche de colonne pleine. Les blocs sont séparés d'une petite marge qui laisse
// voir le fond — c'est ce qui rend les lignes lisibles une à une. L'aplat de couleur passe
// donc de la COLONNE à la CELLULE ; la colonne victorieuse se lit toujours d'un bloc,
// rayée de fins traits de fond. Écart assumé à UX-DR13, qui demandait des colonnes
// entières « et pas une grille de lignes ».
const CELL_CLASSES = 'flex flex-1 items-center justify-center'
// La colonne de libellés prend le même aplat neutre que la colonne perdante : sur la
// référence les deux se lisent dans la même tonalité, seul le texte les distingue.
const LABEL_CELL_CLASSES = 'bg-surface text-white/50'

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
  <div
    data-testid="game-summary"
    class="flex h-full w-full flex-col border border-border bg-surface"
  >
    <!-- Bandeau au modèle Billiboard (2e passe de rendu, Nathan, réf. `billiboard_recap`) :
         une BANDE CLAIRE court d'un bord à l'autre et porte les deux couples
         `NOM | distance` en sombre. Elle est fendue au milieu par une échancrure en biais
         — deux `clip-path` symétriques, qui s'écartent vers le bas — où le `VS` se loge sur
         le fond sombre, avec le mode en surtitre discret au-dessus (AC13). C'est la même
         grammaire que l'en-tête de `SideBar` : une coupe en biais pour casser la symétrie.
         ⚠️ Nom et distance sont DEUX éléments (Story 10.5, AC3 — DT6) : le nom se tronque
         seul, la distance reste TOUJOURS lisible. Un nombre rogné deviendrait faux à la
         lecture, jamais un nom. `min-w-0` sur le span ET sur chaque ancêtre flex, sans
         quoi `truncate` laisse le conteneur grandir au lieu de couper — c'est exactement
         ce qui manquait en 1.10. Nombre NU, séparé par un filet : modèle de bandeau de
         carte validé par Nathan à la 1re passe de rendu de la 10.4.
         ⚠️ Le rembourrage intérieur des deux bandes est ASYMÉTRIQUE (`pr-10` / `pl-10`) :
         du côté de l'échancrure, le texte doit rester en deçà du biais, sans quoi la
         distance passerait sous la coupe.
         ⚠️ Le biais est en UNITÉS DE GRILLE (4 unités), pas en pixels fixes (Story 11.3,
         report de la revue de la 11.1) : à 32 px figés il valait 4 unités sur tablette mais
         2,5 à 1920, où la coupe s'aplatissait — la signature du design system s'y perdait.
         `--spacing` étant fluide (8 px sur tablette, 13 px à 1920), le biais garde désormais
         la même PENTE RELATIVE à tous les formats. C'est la seule différence de rendu voulue
         de la Story 11.3, et elle ne se voit qu'à 1920. -->
    <header
      data-testid="summary-banner"
      class="flex shrink-0 items-stretch border-b border-border"
    >
      <div
        :data-testid="`summary-${leftSide}`"
        class="flex min-w-0 flex-1 items-center gap-3 bg-banner py-3 pl-4 pr-10 text-title font-black text-bg [clip-path:polygon(0_0,100%_0,calc(100%_-_var(--spacing)_*_4)_100%,0_100%)]"
      >
        <span data-testid="summary-name" class="min-w-0 truncate">
          {{ players[leftSide].name }}
        </span>
        <span aria-hidden="true" class="h-6 w-px shrink-0 bg-bg/30" />
        <span data-testid="summary-distance" class="shrink-0 tabular-nums">
          {{ players[leftSide].targetScore }}
        </span>
      </div>

      <div class="flex shrink-0 flex-col items-center justify-center px-4 leading-none">
        <span data-testid="summary-mode" class="text-stat tracking-stat text-white/50">
          {{ modeLabel }}
        </span>
        <span class="text-hero font-black italic text-white/60">VS</span>
      </div>

      <div
        :data-testid="`summary-${rightSide}`"
        class="flex min-w-0 flex-1 items-center justify-end gap-3 bg-banner py-3 pl-10 pr-4 text-title font-black text-bg [clip-path:polygon(0_0,100%_0,100%_100%,calc(var(--spacing)_*_4)_100%)]"
      >
        <span data-testid="summary-distance" class="shrink-0 tabular-nums">
          {{ players[rightSide].targetScore }}
        </span>
        <span aria-hidden="true" class="h-6 w-px shrink-0 bg-bg/30" />
        <span data-testid="summary-name" class="min-w-0 truncate">
          {{ players[rightSide].name }}
        </span>
      </div>
    </header>

    <!-- Table : trois colonnes de hauteur égale, une CELLULE par statistique.
         1re passe de rendu de la 10.5 (Nathan, réf. `billiboard_recap_2`) : les cellules
         sont des blocs séparés d'une petite marge (`gap-1`) qui laisse voir le fond, et
         l'aplat de couleur est porté par la CELLULE et non plus par la colonne entière.
         Ordre des lignes revu : `RÉSULTAT` puis POINTS · REPRISES · MOY · SÉRIE — le
         score d'abord, la moyenne après le nombre de reprises dont elle se déduit.
         Angles vifs : un conteneur n'a aucun `rounded-*` (DESIGN.md › Shapes). -->
    <div class="flex min-h-0 flex-1 gap-2 p-4">
      <template v-for="(side, index) in SIDES" :key="side">
        <div
          v-if="index === 1"
          class="flex w-1/5 shrink-0 flex-col gap-1 text-center text-stat font-bold tracking-stat"
        >
          <span :class="[CELL_CLASSES, LABEL_CELL_CLASSES]">RÉSULTAT</span>
          <span :class="[CELL_CLASSES, LABEL_CELL_CLASSES]">POINTS</span>
          <span :class="[CELL_CLASSES, LABEL_CELL_CLASSES]">REPRISES</span>
          <span :class="[CELL_CLASSES, LABEL_CELL_CLASSES]">MOY</span>
          <span :class="[CELL_CLASSES, LABEL_CELL_CLASSES]">SÉRIE</span>
        </div>

        <div
          data-testid="summary-column"
          :data-side="side"
          class="flex min-w-0 flex-1 flex-col gap-1 text-center"
        >
          <div :class="[CELL_CLASSES, columnClasses(side)]">
            <div class="flex flex-col items-center gap-1">
              <span class="flex items-center gap-2">
                <img
                  :src="BALL_PICTOS[ballOf(side)]"
                  alt=""
                  aria-hidden="true"
                  class="size-5 shrink-0 object-contain"
                />
                <span data-testid="summary-result" class="text-label font-black tracking-label">
                  {{ resultOf(side) }}
                </span>
              </span>
              <span
                v-if="records[side]"
                data-testid="summary-record"
                class="bg-black/20 px-3 text-stat font-bold tracking-stat"
              >
                ★ RECORD
              </span>
            </div>
          </div>
          <!-- 2e passe de rendu (Nathan) : toutes les valeurs à la MÊME taille, `POINTS`
               compris — il tenait seul en `text-reprise` et écrasait les quatre autres. -->
          <span
            data-testid="summary-points"
            class="text-label font-black tabular-nums"
            :class="[CELL_CLASSES, columnClasses(side)]"
          >
            {{ players[side].score }}
          </span>
          <span
            data-testid="summary-reprises"
            class="text-label font-black tabular-nums"
            :class="[CELL_CLASSES, columnClasses(side)]"
          >
            {{ repriseCounts[side] }}
          </span>
          <span
            data-testid="summary-average"
            class="text-label font-black tabular-nums"
            :class="[CELL_CLASSES, columnClasses(side)]"
          >
            {{ averageOf(side) }}
          </span>
          <span
            data-testid="summary-best"
            class="text-label font-black tabular-nums"
            :class="[CELL_CLASSES, columnClasses(side)]"
          >
            {{ bestSeries[side] }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
