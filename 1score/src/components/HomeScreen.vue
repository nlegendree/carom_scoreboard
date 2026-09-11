<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import AlphaKeyboardSheet from './AlphaKeyboardSheet.vue'
import ModeTile from './ModeTile.vue'
import NumericPadDock from './NumericPadDock.vue'
import PictoIcon from './PictoIcon.vue'
import PlayerSetupCard from './PlayerSetupCard.vue'
import PromptModal from './PromptModal.vue'
import SideBar from './SideBar.vue'
import {
  GAME_CATEGORIES,
  GAME_MODE_LABELS,
  isCategoryAvailable,
  type GameCategoryDescriptor,
  type GameCategoryId,
  type GameMode,
  type GameModeDescriptor,
  type PlayerColor,
  type TableSide,
} from '../types/game'
import type { PromptAction, SideBarItem } from '../types/ui'

// Libellés d'attente, posés au démarrage seulement — la bille les nomme depuis la 10.3,
// le côté n'a plus rien à voir là-dedans.
const DEFAULT_WHITE_NAME = 'JOUEUR 1'
const DEFAULT_YELLOW_NAME = 'JOUEUR 2'

// Accueil (Story 10.1) : la barre latérale reçoit son contenu de l'écran (UX-DR31). Les
// trois items sont affichés mais pas encore livrés (AR26) : état BIENTÔT, aucune action —
// FERMER L'APPLICATION compris, sans pop-up ni fermeture.
const HOME_SIDEBAR_ITEMS: SideBarItem[] = [
  { id: 'training', picto: 'training', label: 'ENTRAÎNEMENT', state: 'soon' },
  { id: 'signup', picto: 'signup', label: 'INSCRIPTION', state: 'soon' },
]
const HOME_SIDEBAR_EXIT: SideBarItem = {
  id: 'close-app',
  picto: 'power',
  label: "FERMER L'APPLICATION",
  state: 'soon',
}

// Ordre et couleur des tuiles : une donnée de présentation, distincte de l'ordre du
// catalogue (`series` y vient en premier). Le catalogue est statique : pas de `computed`.
const HOME_TILES = (
  [
    { id: '3bandes' },
    { id: 'series' },
    { id: 'quilles', color: 'tile-quilles' },
    { id: 'casin', color: 'tile-casin' },
  ] as const satisfies readonly { id: GameCategoryId; color?: string }[]
).map((tile) => ({
  ...tile,
  category: GAME_CATEGORIES.find((category) => category.id === tile.id)!,
}))

// Sélection JDS (Story 10.2) : ordre et regroupement des tuiles. Donnée de présentation
// comme `HOME_TILES` — le catalogue, lui, liste les six modes dans son propre ordre.
// `CADRE` n'est PAS un mode : c'est un groupe qui ouvre le choix de cadre, et il ne doit
// pas entrer dans `GameMode`. Toutes portent LE bleu des tuiles, les modes étant des pairs
// (décision de Nathan, 2026-09-12).
// `group` est porté par les quatre entrées, y compris à `false` : sous `as const`, une clé
// absente d'une entrée disparaît de sa branche d'union et `tile.group` ne se lit plus.
const JDS_TILE_LAYOUT = [
  { id: 'libre', group: false },
  { id: 'bande', group: false },
  { id: 'cadre', group: true },
  { id: '4billes', group: false },
] as const

// Les deux CTA de réglage sont NEUTRES (`--gradient-neutral`, contour fort) : seul
// `DÉMARRER` porte le bleu du produit (décision de Nathan, 2026-09-12 — un seul bleu, et
// surtout pas `bg-accent`, l'ancien, qui jurerait à côté des pop-ups). Demi-largeur chacun.
// Ils se resserrent jusqu'au plancher des claviers intégrés (57 px) quand le bandeau de
// nom comprime la colonne : c'est `DÉMARRER` qui garde ses 110 px, pas eux.
const SETUP_CTA_CLASSES =
  'flex min-h-[57px] w-1/2 max-h-[var(--size-touch-target)] flex-1 flex-col items-center justify-center gap-1 rounded-cta border border-border-strong bg-(image:--gradient-neutral) px-1 text-center font-bold text-white touch-manipulation select-none active:brightness-90'

// Les trois cadres du catalogue, dans l'ordre d'affichage de la pop-up.
const CADRE_MODES = ['cadre-47-2', 'cadre-47-1', 'cadre-71-2'] as const satisfies readonly GameMode[]

const gameStore = useGameStore()

const step = ref<'category' | 'mode' | 'players'>('category')
const selectedCategory = ref<GameCategoryDescriptor | null>(null)
const selectedMode = ref<GameMode>('libre')
// ⚠️ L'état du paramétrage est clé par BILLE, jamais par côté (Story 10.3) : c'est ce qui
// rend `CHANGER DE BILLE` et `CHANGER DE CÔTÉ` distincts sans état supplémentaire, chacun
// restant son propre inverse. Le côté, lui, est dit par `whiteSide` seul.
// Les valeurs sont des CHAÎNES : `''` est « rien de réglé », ce qu'aucun nombre ne
// distingue de 0, et c'est le buffer même que le dock et le bandeau font évoluer.
// Le nom reste vide tant que le joueur ne s'est pas nommé : `JOUEUR 1` est un libellé
// d'attente, pas une valeur — sans ça la première frappe s'ajouterait derrière, on
// obtenait « JOUEUR 1MICHEL ».
const players = ref<Record<PlayerColor, { name: string; distance: string }>>({
  white: { name: '', distance: '' },
  yellow: { name: '', distance: '' },
})
const whiteSide = ref<TableSide>('left')
// Saisie ouverte : la bille visée et son champ. `null` = aucune saisie, les CTA de réglage
// occupent la colonne centrale. Une seule saisie à la fois, par construction.
const entry = ref<{ ball: PlayerColor; field: 'name' | 'distance' } | null>(null)
// Valeur en cours de frappe. Elle vit ICI et non dans le dock ou le bandeau : c'est la
// carte qui doit l'afficher en direct, et deux buffers divergeraient à la première frappe.
const draft = ref('')
// Pop-up « DISTANCE MANQUANTE » ouverte.
const distanceError = ref(false)
// Pop-up de choix du cadre ouverte (Story 10.2).
const cadrePromptOpen = ref(false)
// Parcours de rattrapage en cours (revue de Nathan, 2026-09-10) : depuis le CTA de la
// pop-up d'erreur, les saisies des joueurs sans distance s'enchaînent d'elles-mêmes —
// valider la distance du blanc ouvre directement celle du jaune s'il en manque encore.
const fixingDistances = ref(false)

const categoryModes = computed(() => selectedCategory.value?.modes ?? [])

// Billes de gauche et de droite : la seule traduction côté ↔ bille de l'écran.
const leftBall = computed<PlayerColor>(() => (whiteSide.value === 'left' ? 'white' : 'yellow'))
const rightBall = computed<PlayerColor>(() => (whiteSide.value === 'left' ? 'yellow' : 'white'))

// Ordre de rattrapage : le blanc d'abord, le jaune ensuite. Il suit la BILLE et non le
// côté — c'est `player1` (le blanc) que la pop-up désigne en premier, où qu'il soit assis.
const missingDistance = computed(() =>
  (['white', 'yellow'] as const).filter((ball) => distanceOf(ball) <= 0),
)

const modeLabel = computed(() => GAME_MODE_LABELS[selectedMode.value])

// Valeur affichée par une carte : le buffer en cours pour le champ en saisie, la valeur
// réglée pour tout le reste. C'est ce qui fait « se remplir à vue » la carte pendant la
// frappe, sans voile ni flou par-dessus (décision de Nathan, 2026-09-12).
function shownValue(ball: PlayerColor, field: 'name' | 'distance'): string {
  const current = entry.value
  if (current && current.ball === ball && current.field === field) return draft.value
  return players.value[ball][field]
}

function focusedFieldOf(ball: PlayerColor): 'name' | 'distance' | null {
  return entry.value?.ball === ball ? entry.value.field : null
}

function distanceOf(ball: PlayerColor): number {
  return Number(players.value[ball].distance || 0)
}

// `computed` et non constante (à la différence de `HOME_TILES`) : la mise en page se
// résout contre les modes de la catégorie ouverte. Le libellé des trois modes directs
// vient du catalogue ; `CADRE` est un groupe, dont le titre est littéral et qui n'est
// BIENTÔT que si aucun de ses trois cadres n'est disponible.
const jdsTiles = computed(() =>
  JDS_TILE_LAYOUT.map((tile) => {
    if (tile.group) {
      const cadres = categoryModes.value.filter((mode) => isCadre(mode.id))
      return { ...tile, title: 'CADRE', soon: !cadres.some((mode) => mode.available), mode: null }
    }
    const mode = categoryModes.value.find((candidate) => candidate.id === tile.id) ?? null
    return { ...tile, title: mode?.label ?? '', soon: !mode?.available, mode }
  }),
)

// Le titre de la pop-up porte déjà le mot CADRE : ses commandes ne portent que la variante.
const cadreActions = computed<PromptAction[]>(() =>
  CADRE_MODES.flatMap((id) => {
    const mode = categoryModes.value.find((candidate) => candidate.id === id)
    return mode ? [{ id: mode.id, label: mode.label.replace('CADRE ', '') }] : []
  }),
)

function goHome(): void {
  step.value = 'category'
  selectedCategory.value = null
}

function selectCategory(category: GameCategoryDescriptor): void {
  if (!isCategoryAvailable(category)) return

  selectedCategory.value = category

  const onlyMode = category.modes.length === 1 ? category.modes[0] : null
  if (onlyMode) {
    selectedMode.value = onlyMode.id
    step.value = 'players'
    return
  }

  step.value = 'mode'
}

function selectMode(mode: GameModeDescriptor | null): void {
  if (!mode?.available) return

  selectedMode.value = mode.id
  step.value = 'players'
}

function isCadre(mode: GameMode): boolean {
  return (CADRE_MODES as readonly string[]).includes(mode)
}

// Un cadre choisi dans la pop-up emprunte le MÊME chemin qu'une tuile : `selectMode` garde
// la disponibilité, il n'y a pas de second chemin vers l'étape joueurs.
function selectCadre(id: string): void {
  selectMode(categoryModes.value.find((mode) => mode.id === id) ?? null)
  cadrePromptOpen.value = false
}

// `RETOUR` : on remonte d'un écran en CONSERVANT les saisies — revenir choisir un autre
// cadre ne doit pas coûter les deux noms déjà tapés (Story 10.3, AC2).
function back(): void {
  closeSetupEntry()

  if (step.value === 'players' && categoryModes.value.length > 1) {
    step.value = 'mode'
    return
  }
  goHome()
}

// `ANNULER` : retour à l'accueil en EFFAÇANT tout, sans confirmation. Un handicap saisi
// pour un mode abandonné ne doit pas être silencieusement reconduit sur le mode suivant
// (même défaut que celui corrigé sur `resetGame()` en revue 1.3).
function cancelSetup(): void {
  clearSetup()
  closeSetupEntry()
  goHome()
}

function clearSetup(): void {
  players.value = { white: { name: '', distance: '' }, yellow: { name: '', distance: '' } }
  whiteSide.value = 'left'
}

// Une saisie seulement MASQUÉE par le garde `step` du `v-if` se rouvrirait toute seule au
// retour sur l'étape joueurs — piège déjà payé en 1.4 et en 10.2.
function closeSetupEntry(): void {
  entry.value = null
  draft.value = ''
  distanceError.value = false
  cadrePromptOpen.value = false
  fixingDistances.value = false
}

// Sélection JDS (UX-DR31) : la barre ne porte que le retour — pas de sortie, l'app ne se
// quitte que depuis l'accueil. Déclarée après `back()`, dont elle référence la fonction.
const JDS_SIDEBAR_ITEMS: SideBarItem[] = [
  { id: 'back', picto: 'arrow-left', label: 'RETOUR', state: 'normal', action: back },
]

// Paramétrage (UX-DR31, UX-DR44) : retour, une entrée CONFIGURATION encore à venir, et une
// sortie calée en bas qui abandonne le réglage. `RETOUR` conserve les saisies, `ANNULER`
// les efface — deux gestes distincts, d'où deux items.
const PLAYERS_SIDEBAR_ITEMS: SideBarItem[] = [
  { id: 'back', picto: 'arrow-left', label: 'RETOUR', state: 'normal', action: back },
  { id: 'settings', picto: 'gear', label: 'CONFIGURATION', state: 'soon' },
]
const PLAYERS_SIDEBAR_EXIT: SideBarItem = {
  id: 'cancel',
  picto: 'close',
  label: 'ANNULER',
  state: 'normal',
  action: cancelSetup,
}

// Le repliement des espaces multiples est assuré en amont, par le refus d'espaces
// consécutifs dans `AlphaKeyboardSheet` : le buffer ne peut pas en contenir. On se contente
// donc ici de trimer — ajouter un `replace` serait une branche que rien ne peut atteindre.
function cleanName(raw: string): string {
  return raw.trim().toUpperCase()
}

function normalizeName(raw: string, fallback: string): string {
  return cleanName(raw) || fallback
}

// Ouvre une saisie. Une saisie déjà ouverte est VALIDÉE au passage (AC6) : taper un autre
// champ est un seul geste, jamais un tap mort suivi d'un second.
function openEntry(ball: PlayerColor, field: 'name' | 'distance'): void {
  if (entry.value) applyEntry()
  draft.value = players.value[ball][field]
  entry.value = { ball, field }
}

// Le clavier rend le nom brut : on le nettoie ici pour que la carte affiche exactement ce
// qui partira dans le store. Un nom vide reste vide — c'est le libellé d'attente qui
// s'affiche, et le nom par défaut n'est posé qu'au démarrage de la partie.
function applyEntry(): void {
  const current = entry.value
  if (!current) return

  const value = current.field === 'name' ? cleanName(draft.value) : draft.value
  players.value[current.ball] = { ...players.value[current.ball], [current.field]: value }
  entry.value = null
  draft.value = ''

  // Rattrapage enchaîné, dans UN seul sens (blanc puis jaune) : après le blanc, la saisie
  // du jaune s'ouvre seule s'il lui manque encore sa distance. Après le jaune, on s'arrête
  // — même si une distance a été laissée à 0, sinon les deux saisies tourneraient en
  // boucle (règle posée en revue 1.10).
  if (fixingDistances.value && current.ball === 'white' && distanceOf('yellow') <= 0) {
    openEntry('yellow', 'distance')
    return
  }
  fixingDistances.value = false
}

// La croix du dock ou du bandeau : la valeur précédente est restaurée telle quelle.
function abandonEntry(): void {
  entry.value = null
  draft.value = ''
  fixingDistances.value = false
}

// UX-DR43. Les deux actions sont leur propre inverse par construction : `CHANGER DE BILLE`
// permute les entrées ET bascule le côté (les cartes ne bougent pas, leurs billes
// s'échangent) ; `CHANGER DE CÔTÉ` ne bascule que le côté (les cartes s'échangent, tout
// compris). Une saisie en cours est validée d'abord : sa carte va changer sous le doigt.
function changeBall(): void {
  if (entry.value) applyEntry()
  players.value = { white: players.value.yellow, yellow: players.value.white }
  whiteSide.value = whiteSide.value === 'left' ? 'right' : 'left'
}

function changeSide(): void {
  if (entry.value) applyEntry()
  whiteSide.value = whiteSide.value === 'left' ? 'right' : 'left'
}

// AC1 : sans distance, la partie ne démarre pas — une pop-up propose de la régler.
// `player1` est la bille BLANCHE et reste celui qui ouvre (AR24) : le côté part à part,
// en 5e paramètre, et ne touche à aucune règle de jeu.
function confirm(): void {
  if (entry.value) applyEntry()
  if (missingDistance.value.length > 0) {
    distanceError.value = true
    return
  }
  gameStore.startGame(
    selectedMode.value,
    normalizeName(players.value.white.name, DEFAULT_WHITE_NAME),
    normalizeName(players.value.yellow.name, DEFAULT_YELLOW_NAME),
    { player1: distanceOf('white'), player2: distanceOf('yellow') },
    whiteSide.value,
  )
}

// `RÉGLER LA DISTANCE` : le dock du PREMIER joueur sans distance, ouvert sur ce champ ;
// les suivants s'enchaînent depuis `applyEntry`.
function fixDistance(): void {
  distanceError.value = false
  fixingDistances.value = true
  openEntry(missingDistance.value[0]!, 'distance')
}
</script>

<template>
  <div class="h-full w-full">
    <!-- Accueil refondu (Story 10.1) : fond dégradé gris/noir, barre latérale collée au
         bord, accroche et tuiles de mode, sans barre basse. Rien n'y bouge au repos : c'est
         l'écran de veille. -->
    <div
      v-if="step === 'category'"
      data-testid="step-category"
      class="flex h-full w-full bg-(image:--gradient-bg)"
    >
      <SideBar :items="HOME_SIDEBAR_ITEMS" :exitItem="HOME_SIDEBAR_EXIT" />

      <main class="flex min-w-0 flex-1 flex-col">
        <p
          data-testid="home-tagline"
          class="px-4 pt-5 text-hero font-black leading-tight text-white"
        >
          À vous de jouer.
        </p>

        <!-- Une rangée de quatre tuiles à 34 % de la hauteur, collées à la barre latérale et
             aux bords de l'écran, séparées d'un filet (modèle Billiboard). Paysage
             uniquement : l'app ne tourne jamais en portrait. -->
        <section class="mt-auto grid h-[34%] grid-cols-4 divide-x divide-border">
          <ModeTile
            v-for="tile in HOME_TILES"
            :key="tile.id"
            :data-testid="`category-${tile.id}`"
            :title="tile.category.label"
            :color="'color' in tile ? tile.color : undefined"
            :soon="!isCategoryAvailable(tile.category)"
            @select="selectCategory(tile.category)"
          />
        </section>
      </main>
    </div>

    <!-- Sélection JDS (Story 10.2) : la coquille de l'accueil, au pixel près — seuls le
         titre et les tuiles changent d'un écran à l'autre. Le retour passe en barre
         latérale, la barre basse disparaît. -->
    <div
      v-else-if="step === 'mode'"
      data-testid="step-mode"
      class="flex h-full w-full bg-(image:--gradient-bg)"
    >
      <SideBar :items="JDS_SIDEBAR_ITEMS" />

      <main class="flex min-w-0 flex-1 flex-col">
        <p data-testid="jds-title" class="px-4 pt-5 text-hero font-black leading-tight text-white">
          {{ selectedCategory?.label }}
        </p>

        <section class="mt-auto grid h-[34%] grid-cols-4 divide-x divide-border">
          <ModeTile
            v-for="tile in jdsTiles"
            :key="tile.id"
            :data-testid="`mode-${tile.id}`"
            :title="tile.title"
            :soon="tile.soon"
            @select="tile.group ? (cadrePromptOpen = true) : selectMode(tile.mode)"
          />
        </section>
      </main>
    </div>

    <!-- Étape joueurs (Story 10.3) : même coquille que l'accueil et la sélection JDS —
         dégradé gris/noir, barre latérale collée au bord — mais la zone principale revient
         au « Bloc Plein contenu » d'origine : trois colonnes ESPACÉES, chacune à contour,
         avec une marge autour. Divergence assumée avec les tuiles jointives des deux
         écrans précédents (décision de Nathan, 2026-09-12).
         Le bandeau de nom est monté DANS LE FLUX sous la zone principale : les cartes
         rapetissent, restent entières, et le champ qu'on remplit reste sous les yeux. -->
    <div v-else data-testid="step-players" class="flex h-full w-full bg-(image:--gradient-bg)">
      <SideBar :items="PLAYERS_SIDEBAR_ITEMS" :exitItem="PLAYERS_SIDEBAR_EXIT" />

      <div class="flex min-w-0 flex-1 flex-col">
        <main class="flex min-h-0 min-w-0 flex-1 gap-2 p-2">
          <PlayerSetupCard
            side="left"
            :ball="leftBall"
            :name="shownValue(leftBall, 'name')"
            :distance="shownValue(leftBall, 'distance')"
            :focusedField="focusedFieldOf(leftBall)"
            @focus="openEntry(leftBall, $event)"
          />

          <!-- Colonne centrale, 1/5 de la zone : surtitre du mode, les deux CTA de réglage
               et DÉMARRER au repos ; le dock de distance prend la place des CTA pendant la
               saisie. Il ne recouvre RIEN — la colonne s'élargit et les cartes se
               resserrent, les deux restent lisibles (décision de Nathan, 2026-09-12). -->
          <section
            data-testid="setup-center"
            class="flex min-h-0 w-1/5 shrink-0 flex-col gap-2 border border-border p-2"
            :class="entry?.field === 'distance' && 'min-w-[240px]'"
          >
            <p
              data-testid="setup-mode-label"
              class="shrink-0 text-center text-stat font-bold tracking-[0.2em] text-white/50"
            >
              {{ modeLabel }}
            </p>

            <NumericPadDock
              v-if="entry?.field === 'distance'"
              :value="draft"
              @update="draft = $event"
              @validate="applyEntry"
              @cancel="abandonEntry"
            />

            <template v-else>
              <div class="flex min-h-0 shrink gap-2">
                <button
                  data-testid="change-ball-button"
                  :class="SETUP_CTA_CLASSES"
                  @pointerdown="changeBall"
                >
                  <PictoIcon name="swap-balls" class="size-4 shrink-0" />
                  <span class="text-picto leading-tight">CHANGER DE BILLE</span>
                </button>
                <button
                  data-testid="change-side-button"
                  :class="SETUP_CTA_CLASSES"
                  @pointerdown="changeSide"
                >
                  <PictoIcon name="swap-sides" class="size-4 shrink-0" />
                  <span class="text-picto leading-tight">CHANGER DE CÔTÉ</span>
                </button>
              </div>

              <!-- `confirm-button` conservé malgré le déménagement en colonne centrale :
                   `GameView.test.ts` le lit pour traverser l'accueil. -->
              <button
                data-testid="confirm-button"
                class="mt-auto min-h-[110px] w-full shrink-0 rounded-cta bg-(image:--gradient-blue) text-label font-black text-white touch-manipulation select-none active:brightness-90"
                @pointerdown="confirm"
              >
                DÉMARRER
              </button>
            </template>
          </section>

          <PlayerSetupCard
            side="right"
            :ball="rightBall"
            :name="shownValue(rightBall, 'name')"
            :distance="shownValue(rightBall, 'distance')"
            :focusedField="focusedFieldOf(rightBall)"
            @focus="openEntry(rightBall, $event)"
          />
        </main>

        <AlphaKeyboardSheet
          v-if="entry?.field === 'name'"
          :value="draft"
          @update="draft = $event"
          @validate="applyEntry"
          @cancel="abandonEntry"
        />
      </div>
    </div>

    <!-- Titre et deux CTA, sans message ni croix (revue de Nathan, 2026-09-10) : la modale
         qui suit dit d'elle-même de quel joueur il s'agit, et `ANNULER` est le retour de
         toutes les pop-ups de décision. -->
    <!-- Choix du cadre (Story 10.2), en variante liste : le titre porte le mot, les
         commandes la variante, `ANNULER` ferme sans rien choisir. -->
    <PromptModal
      v-if="cadrePromptOpen && step === 'mode'"
      title="CADRE"
      :actions="cadreActions"
      secondaryLabel="ANNULER"
      @select="selectCadre"
      @secondary="cadrePromptOpen = false"
    />

    <PromptModal
      v-if="distanceError"
      title="DISTANCE MANQUANTE"
      primaryLabel="RÉGLER LA DISTANCE"
      secondaryLabel="ANNULER"
      @primary="fixDistance"
      @secondary="distanceError = false"
    />
  </div>
</template>
