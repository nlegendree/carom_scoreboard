<script setup lang="ts">
import { computed } from 'vue'
import type { Player, PlayerColor, TableSide } from '../types/game'

// Carte joueur du scoreboard (Story 10.4), en TROIS zones depuis la 1re passe de rendu
// (Nathan) — le bandeau suit désormais le modèle Billiboard de bout en bout :
//   1. bandeau — ligne 1 `NOM | DISTANCE`, ligne 2 `RESTANT | MOY · SÉRIE` ;
//   2. score géant, le plus gros élément de l'écran, sans exception ;
//   3. pied `−` / zone de série / `+`.
// Hiérarchie de lecture à 2 mètres : score ≫ RESTANT > NOM > DISTANCE > MOY/SÉRIE.
//
// ⚠️ La ligne `MOY · SÉRIE` posée sous le score en première livraison est SUPPRIMÉE : son
// aplat gris coupait la carte en deux pour trois valeurs secondaires. Elle remonte dans le
// bandeau, où la référence la place. Et `DISTANCE` comme `RESTANT` sont des nombres NUS —
// leurs libellés encombraient un bandeau qui doit se lire d'un coup d'œil.
//
// ⚠️ La carte N'EST PLUS TAPABLE (AC4) : le passage de tour est passé au CTA
// `PASSER LE TOUR` de la colonne centrale. Plus d'emit, plus de `role="button"` — mais
// `touch-manipulation select-none` restent en classes, sinon un appui long sur le score
// sélectionne le texte (le CSS global ne cible que `button, [role="button"]`).
//
// La distance appartient au joueur, pas à la partie : le panneau la lit sur `player`.
// Panneau strictement PRÉSENTATIONNEL : il n'accède pas au store, il émet.
const props = withDefaults(
  defineProps<{
    player: Player
    active: boolean
    average?: number
    bestSeries?: number
    // Story 2.4 : compte à rebours `POUR n` — propre au 3 Bandes, où le score avance
    // point par point. C'est la VUE qui dit s'il a lieu d'être (le panneau ne connaît
    // pas le mode) ; le calcul, lui, appartient au panneau : les deux termes sont sur
    // `player`.
    showRemaining?: boolean
    // Côté d'ÉCRAN de la carte (Story 10.4) : sert uniquement à réserver la marge
    // intérieure sous l'anneau du chrono, qui déborde de la colonne centrale (AC16).
    side?: TableSide
    // Série OUVERTE du joueur, comptée par les `+1` du 3 Bandes (`null` en JDS, où la
    // série est écrite d'un bloc à la validation).
    seriesValue?: number | null
    // Valeur en cours de frappe au pavé, quand la pop-up de saisie est ouverte POUR CE
    // joueur (JDS). La pop-up latérale ne la rappelle plus : elle se lit ici (décision 2).
    entryValue?: string | null
  }>(),
  {
    average: 0,
    bestSeries: 0,
    showRemaining: false,
    side: 'left',
    seriesValue: null,
    entryValue: null,
  },
)

const emit = defineEmits<{ 'adjust-score': [delta: number] }>()

// Classes écrites en toutes lettres (et non construites dynamiquement) pour que
// le scanner JIT de Tailwind v4 les détecte et génère bien le CSS correspondant.
const PLAYER_COLOR_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white text-on-player-white',
  yellow: 'bg-player-yellow text-on-player-yellow',
}

// Bandeau du haut : un aplat légèrement contrasté avec la carte (modèle Cueuny), pour que
// nom, distance et restant se lisent comme un cartouche et non comme du texte posé.
const BAND_COLOR_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-panel-white-band',
  yellow: 'bg-panel-yellow-band',
}

// L'anneau du chrono déborde de la colonne centrale sur les deux cartes (AC16) : chacune
// réserve une gouttière sur son bord INTÉRIEUR pour que ni le score, ni le bandeau, ni la
// ligne de statistiques ne passent dessous. Le FOND, lui, reste pleine largeur.
// Élargie de 24 à 32 px à la 2e passe de rendu : l'anneau ayant grossi, il déborde de
// 24 px de chaque côté au lieu de 15.
const INNER_GUTTER_CLASSES: Record<TableSide, string> = {
  left: 'pr-4',
  right: 'pl-4',
}

// Le score doit être le plus GROS possible dans sa carte. Une taille unique ne peut pas
// y suffire : le panneau fait 40 % de la largeur d'écran, et ce qui tient à un chiffre
// déborde à trois. La taille est donc choisie selon le nombre de caractères affichés.
// Deux bornes dans chaque valeur : `vw` protège de la largeur du panneau, `vh` de sa
// hauteur, et le plafond en pixels évite un chiffre démesuré sur un signage 22".
// Clés littérales, jamais construites par template : le scanner JIT ne verrait rien.
// ⚠️ Bornes `vh` redescendues de 46 à 40 par la Story 10.4 : le bandeau (22 %) et la ligne
// MOY · SÉRIE reprennent ~10 % de la hauteur de la carte, et à 1133×744 le chiffre
// touchait le pied. Les bornes `vw` n'ont pas bougé, la largeur non plus.
const SCORE_SIZE_CLASSES: Record<number, string> = {
  1: 'text-[min(42vw,40vh,320px)]',
  2: 'text-[min(24vw,40vh,320px)]',
  3: 'text-[min(16vw,40vh,320px)]',
  4: 'text-[min(12vw,40vh,320px)]',
}
const SCORE_SIZE_FALLBACK = 'text-[min(9vw,40vh,320px)]'

const colorClasses = computed(() => PLAYER_COLOR_CLASSES[props.player.color])
const bandClasses = computed(() => BAND_COLOR_CLASSES[props.player.color])
const gutterClass = computed(() => INNER_GUTTER_CLASSES[props.side])

const displayedScore = computed(() => String(props.player.score))
const scoreSizeClass = computed(
  () => SCORE_SIZE_CLASSES[displayedScore.value.length] ?? SCORE_SIZE_FALLBACK,
)

// Les deux blocs joueur portent un texte noir : un filigrane sombre convient donc au
// blanc comme au jaune, sans dupliquer le style par couleur.
const ADJUST_BUTTON_CLASSES =
  'flex min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)] items-center justify-center rounded-cta bg-black/8 text-3xl font-black leading-none opacity-60 touch-manipulation select-none active:bg-black/16 active:opacity-100'

// Convention des fédérations de billard : moyenne générale à 3 décimales.
const displayedAverage = computed(() => props.average.toFixed(3))

// AC2 : RESTANT permanent, dans TOUS les modes, champ DÉRIVÉ calculé ici (AR25) — aucun
// état nouveau dans le store. Plancher à 0 : une correction `+` peut dépasser la distance.
// Masqué en distance libre, comme la distance elle-même (NFR12).
const remainingScore = computed(() =>
  props.player.targetScore > 0 ? Math.max(props.player.targetScore - props.player.score, 0) : null,
)

// Annonce de l'arbitre : « POUR 3 », « POUR 2 », « POUR 1 » à mesure que le joueur
// approche de sa distance (FR15, idée Billizone). Seulement quand le restant vaut 1 à 3 —
// au-delà l'annonce n'a pas cours, à 0 la partie est finie — et jamais en distance libre.
// ⚠️ Elle DOUBLE le RESTANT du bandeau pendant trois points : c'est voulu (AC2).
const REMAINING_ANNOUNCE_MAX = 3
const remaining = computed(() => {
  if (!props.showRemaining || remainingScore.value === null) return null
  return remainingScore.value >= 1 && remainingScore.value <= REMAINING_ANNOUNCE_MAX
    ? remainingScore.value
    : null
})

// AC3 : la zone de série ne montre QU'UNE chose à la fois, dans cet ordre — valeur en
// cours de frappe, puis `POUR n`, puis la série ouverte, puis rien. Un seul `computed`
// porte la priorité, pour qu'aucun cas ne puisse en croiser deux.
type SeriesSlot = { kind: 'entry' | 'remaining' | 'series'; text: string }

const SLOT_TESTIDS: Record<SeriesSlot['kind'], string> = {
  entry: 'entry-value',
  remaining: 'remaining',
  series: 'series-value',
}

const seriesSlot = computed<SeriesSlot | null>(() => {
  // `0` en attente plutôt qu'un champ vide : c'est la valeur qu'on est en train de
  // composer, et le plus souvent la série réelle au carambole (repris de la 1.5).
  if (props.entryValue !== null) return { kind: 'entry', text: props.entryValue || '0' }
  if (remaining.value !== null) return { kind: 'remaining', text: `POUR ${remaining.value}` }
  if (props.seriesValue !== null) return { kind: 'series', text: String(props.seriesValue) }
  return null
})

// Correction manuelle du total, ±1 par appui. La carte n'étant plus tapable, le `.stop`
// des deux boutons a disparu avec le handler de racine qu'il arrêtait.
function adjust(delta: number): void {
  emit('adjust-score', delta)
}
</script>

<template>
  <div
    class="@container relative flex h-full min-w-0 flex-1 flex-col overflow-hidden touch-manipulation select-none"
    :class="colorClasses"
  >
    <!-- 1. BANDEAU, au modèle Billiboard (1re passe de rendu, Nathan) :
         ligne 1 **NOM | DISTANCE**, ligne 2 **RESTANT | MOY · SÉRIE**. Les statistiques
         sont remontées ici — leur bandeau gris sous le score coupait la carte en deux pour
         trois valeurs secondaires.
         ⚠️ DISTANCE et RESTANT sont des **nombres nus** : leurs libellés encombraient un
         bandeau qui doit se lire d'un coup d'œil. MOY et SÉRIE gardent le leur, comme
         `AVG` et `HR` sur la référence — sans quoi trois nombres nus se confondraient.
         ⚠️ Hauteur LIBRE, à la mesure de son contenu (3e passe de rendu) : fixée à 22 % de
         la carte, elle laissait la moitié de l'aplat vide sous les deux lignes. L'AC1 parle
         de 22 %, la référence ne montre qu'un cartouche serré autour de son texte.
         Fond pleine largeur — l'aplat ne s'interrompt pas sur la gouttière de l'anneau —,
         contenu décalé par la gouttière intérieure.
         Le nom est le SEUL élément élastique : deux lignes puis ellipse. Une valeur
         chiffrée rognée deviendrait fausse à la lecture, jamais elle. -->
    <div
      data-testid="panel-header"
      class="flex shrink-0 flex-col gap-1 overflow-hidden px-3 py-2.5"
      :class="[bandClasses, gutterClass]"
    >
      <div class="flex items-baseline justify-between gap-2">
        <span
          data-testid="panel-name"
          class="min-w-0 text-label font-black uppercase leading-tight line-clamp-2"
          >{{ player.name }}</span
        >
        <!-- Distance libre (0) : l'emplacement disparaît entièrement, pas de tiret ni de
             zéro à interpréter (NFR12). -->
        <span
          v-if="player.targetScore > 0"
          data-testid="target-score"
          class="shrink-0 text-label font-black tabular-nums leading-none"
          >{{ player.targetScore }}</span
        >
      </div>

      <div class="flex items-baseline gap-2">
        <!-- RESTANT : deuxième information de la carte après le score (réf. Cueuny,
             `남은 점수`). Champ dérivé, aucun état nouveau (AR25). -->
        <span
          v-if="remainingScore !== null"
          data-testid="remaining-score"
          class="shrink-0 text-label font-black tabular-nums leading-none"
          >{{ remainingScore }}</span
        >
        <!-- `ml-auto` et non `justify-between` : sans distance, le restant disparaît et les
             statistiques doivent rester calées à droite, pas glisser à gauche. -->
        <div
          data-testid="panel-stats"
          class="ml-auto flex shrink-0 items-baseline gap-2 text-stat @min-[420px]:gap-3"
        >
          <span class="flex items-baseline gap-1">
            <span class="font-bold opacity-60">MOY</span>
            <span data-testid="average" class="font-black tabular-nums">{{ displayedAverage }}</span>
          </span>
          <span class="flex items-baseline gap-1">
            <span class="font-bold opacity-60">SÉRIE</span>
            <span data-testid="best-series" class="font-black tabular-nums">{{ bestSeries }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 2. SCORE GÉANT — le plus gros élément de l'écran, sans exception. -->
    <div
      data-testid="score-zone"
      class="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3"
      :class="gutterClass"
    >
      <span
        data-testid="score"
        class="leading-none font-black tabular-nums"
        :class="scoreSizeClass"
        >{{ displayedScore }}</span
      >
    </div>

    <!-- 3. PIED — correction du total sans toucher au déroulé de la partie : ni reprise,
         ni bascule de tour. Posés aux deux coins bas et en filigrane : ce sont des
         rattrapages d'arbitrage, ils ne doivent pas attirer l'œil autant que le score.
         Entre les deux, la zone de série (AC3) : un seul contenu à la fois. -->
    <div class="flex shrink-0 items-center justify-between px-2 pb-2">
      <button
        data-testid="score-minus"
        aria-label="Retirer un point"
        :class="ADJUST_BUTTON_CLASSES"
        @pointerdown="adjust(-1)"
      >
        −
      </button>
      <!-- La `key` recrée l'élément à chaque changement de valeur, ce qui rejoue le flash
           d'accusé de frappe (UX-DR17) LÀ OÙ LA VALEUR CHANGE, sans aucun timer JS. -->
      <!-- ROUGE et plus gros que le reste du pied (1re passe de rendu, Nathan, réf.
           Billiboard, qui peint ce nombre en rouge entre ses deux boutons de correction) :
           c'est le seul repère de couleur d'une carte en aplat uni. `--color-brand-red`
           plutôt que `--color-turn-active` : plus sombre, il tient le contraste du texte
           large sur le jaune comme sur le blanc — à revalider à la passe AA de la 10.7. -->
      <span
        v-if="seriesSlot"
        :key="seriesSlot.text"
        :data-testid="SLOT_TESTIDS[seriesSlot.kind]"
        class="relative text-[clamp(24px,10cqw,64px)] leading-none font-black tabular-nums whitespace-nowrap text-brand-red"
        >{{ seriesSlot.text }}
        <!-- Voile SOMBRE et non blanc : la carte est un aplat clair à encre noire, un
             flash blanc y serait invisible (le voile clair de la pop-up centrée jouait sur
             fond sombre). -->
        <span
          v-if="seriesSlot.kind === 'entry'"
          data-testid="input-flash"
          :data-flash="seriesSlot.text"
          class="pointer-events-none absolute -inset-x-2 -inset-y-1 bg-black/25 animate-input-flash"
        />
      </span>
      <button
        data-testid="score-plus"
        aria-label="Ajouter un point"
        :class="ADJUST_BUTTON_CLASSES"
        @pointerdown="adjust(1)"
      >
        +
      </button>
    </div>

    <!-- Liseré de tour, en OVERLAY posé après les zones (passe navigateur 10.4).
         ⚠️ Il vivait sur la racine en `ring-inset` : une ombre interne se peint au-dessus du
         fond de l'élément mais SOUS ses enfants, et le bandeau opaque du haut l'effaçait
         donc sur les 22 % supérieurs de la carte — bord haut et deux tiers des montants.
         Aucun test ne pouvait le voir : happy-dom ne calcule pas le CSS. Le signal de tour
         actif est ce qui se lit en premier à 2 mètres, il doit encadrer la carte ENTIÈRE.
         ⚠️ Il s'arrête au bord du disque du chrono qui déborde de la colonne voisine, et
         c'est VOULU (3e passe de rendu, Nathan : « je veux que le liseré passe AUTOUR du
         cercle, pas par-dessus »). Le relais est pris par un demi-anneau rouge dessiné
         autour du disque, dans `ShotClock`, qui prolonge le liseré en le contournant.
         Le `@container` de la racine (`contain: layout`) crée le contexte d'empilement qui
         confine ce `z-20` dans la carte : c'est lui qui laisse le disque passer devant. -->
    <span
      v-if="active"
      data-testid="turn-ring"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 z-20 ring-8 ring-turn-active ring-inset"
    />
  </div>
</template>
