<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import ActionBar from './ActionBar.vue'
import ModeTile from './ModeTile.vue'
import PlayerSetupModal from './PlayerSetupModal.vue'
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
  type PlayerId,
} from '../types/game'
import type { PromptAction, SideBarItem } from '../types/ui'

const DEFAULT_PLAYER1_NAME = 'JOUEUR 1'
const DEFAULT_PLAYER2_NAME = 'JOUEUR 2'

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

// Les trois cadres du catalogue, dans l'ordre d'affichage de la pop-up.
const CADRE_MODES = ['cadre-47-2', 'cadre-47-1', 'cadre-71-2'] as const satisfies readonly GameMode[]

const gameStore = useGameStore()

const step = ref<'category' | 'mode' | 'players'>('category')
const selectedCategory = ref<GameCategoryDescriptor | null>(null)
const selectedMode = ref<GameMode>('libre')
// Vide tant que le joueur ne s'est pas nommé : `JOUEUR 1` est un libellé d'attente, pas
// une valeur. Sans ça, la modale s'ouvrirait pré-remplie et la première frappe s'ajouterait
// derrière — on obtenait « JOUEUR 1MICHEL ».
const player1Name = ref('')
const player2Name = ref('')
// 0 = pas encore réglée. Aucun mode n'apporte de valeur par défaut : le joueur saisit sa
// distance (handicap). OBLIGATOIRE au démarrage depuis la 1.10 (décision de Nathan,
// 2026-09-10) — le store, lui, reste permissif (0 = libre) pour les tests et le pilotage
// déporté ; c'est l'accueil qui impose la règle.
const targetScores = ref({ player1: 0, player2: 0 })
// Joueur en cours de réglage : `null` = aucune modale ouverte.
const editing = ref<PlayerId | null>(null)
// Champ sur lequel la modale s'ouvre : la distance quand on vient de l'erreur de distance.
const editingField = ref<'name' | 'distance'>('name')
// Pop-up « DISTANCE MANQUANTE » ouverte.
const distanceError = ref(false)
// Pop-up de choix du cadre ouverte (Story 10.2).
const cadrePromptOpen = ref(false)
// Parcours de rattrapage en cours (revue de Nathan, 2026-09-10) : depuis le CTA de la
// pop-up d'erreur, les modales des joueurs sans distance s'enchaînent d'elles-mêmes —
// valider la distance du blanc ouvre directement celle du jaune s'il en manque encore.
const fixingDistances = ref(false)

const categoryModes = computed(() => selectedCategory.value?.modes ?? [])
const names = computed(() => ({ player1: player1Name.value, player2: player2Name.value }))
const displayedNames = computed(() => ({
  player1: player1Name.value || DEFAULT_PLAYER1_NAME,
  player2: player2Name.value || DEFAULT_PLAYER2_NAME,
}))
const missingDistance = computed(() =>
  (['player1', 'player2'] as const).filter((player) => targetScores.value[player] <= 0),
)
// Titre de l'ancienne coquille : depuis la 10.2, elle ne sert plus que l'étape joueurs,
// le titre de l'écran JDS étant rendu par sa propre coquille.
const headerTitle = computed(() =>
  step.value === 'players' ? GAME_MODE_LABELS[selectedMode.value] : undefined,
)

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

function back(): void {
  // Un handicap saisi pour un mode abandonné ne doit pas être silencieusement reconduit
  // sur le mode suivant (même défaut que celui corrigé sur `resetGame()` en revue 1.3).
  targetScores.value = { player1: 0, player2: 0 }
  player1Name.value = ''
  player2Name.value = ''
  // Sans ça la modale n'est que masquée par le garde `step` du `v-if` : elle se rouvrirait
  // toute seule au retour sur l'étape joueurs, sur un mode différent et des valeurs effacées.
  editing.value = null
  distanceError.value = false
  cadrePromptOpen.value = false
  fixingDistances.value = false

  if (step.value === 'players' && categoryModes.value.length > 1) {
    step.value = 'mode'
    return
  }
  goHome()
}

// Sélection JDS (UX-DR31) : la barre ne porte que le retour — pas de sortie, l'app ne se
// quitte que depuis l'accueil. Déclarée après `back()`, dont elle référence la fonction.
const JDS_SIDEBAR_ITEMS: SideBarItem[] = [
  { id: 'back', picto: 'arrow-left', label: 'RETOUR', state: 'normal', action: back },
]

// Le repliement des espaces multiples est assuré en amont, par le refus d'espaces
// consécutifs dans `PlayerSetupModal` : le buffer ne peut pas en contenir. On se contente
// donc ici de trimer — ajouter un `replace` serait une branche que rien ne peut atteindre.
function cleanName(raw: string): string {
  return raw.trim().toUpperCase()
}

function normalizeName(raw: string, fallback: string): string {
  return cleanName(raw) || fallback
}

// La modale rend le nom brut : on le nettoie ici pour que la zone affiche exactement ce
// qui partira dans le store. Un nom vide reste vide — c'est le libellé d'attente qui
// s'affiche, et le nom par défaut n'est posé qu'au démarrage de la partie.
function applySetup(setup: { name: string; targetScore: number }): void {
  const player = editing.value
  if (!player) return

  const target = player === 'player1' ? player1Name : player2Name
  target.value = cleanName(setup.name)
  targetScores.value = { ...targetScores.value, [player]: setup.targetScore }
  editing.value = null

  // Rattrapage enchaîné, dans UN seul sens (blanc puis jaune) : après le blanc, la
  // modale du jaune s'ouvre seule s'il lui manque encore sa distance. Après le jaune, on
  // s'arrête — même si une distance a été laissée à 0, sinon les deux modales
  // tourneraient en boucle.
  if (fixingDistances.value && player === 'player1' && missingDistance.value.includes('player2')) {
    openSetup('player2', 'distance')
    return
  }
  fixingDistances.value = false
}

function cancelSetup(): void {
  editing.value = null
  fixingDistances.value = false
}

function openSetup(player: PlayerId, field: 'name' | 'distance' = 'name'): void {
  editingField.value = field
  editing.value = player
}

// AC1 : sans distance, la partie ne démarre pas — une pop-up propose de la régler.
function confirm(): void {
  if (missingDistance.value.length > 0) {
    distanceError.value = true
    return
  }
  gameStore.startGame(
    selectedMode.value,
    normalizeName(player1Name.value, DEFAULT_PLAYER1_NAME),
    normalizeName(player2Name.value, DEFAULT_PLAYER2_NAME),
    targetScores.value,
  )
}

// `RÉGLER LA DISTANCE` : la modale du PREMIER joueur sans distance, ouverte sur ce champ ;
// les suivantes s'enchaînent depuis `applySetup`.
function fixDistance(): void {
  distanceError.value = false
  fixingDistances.value = true
  openSetup(missingDistance.value[0]!, 'distance')
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

    <!-- Étape joueurs : rendu d'avant l'Epic 10, refondu en 10.3. -->
    <div v-else class="flex h-full w-full flex-col bg-bg">
      <header class="flex shrink-0 items-center gap-4 p-4">
        <h1 v-if="headerTitle" class="text-label font-black tracking-widest text-white">
          {{ headerTitle }}
        </h1>
      </header>

      <main class="flex flex-1 flex-col justify-end overflow-hidden">
        <!-- Deux grands panneaux portant déjà la bille de leur côté,
             préfigurant la sélection depuis la base joueurs du club (Epic 4). Chaque panneau
             est la zone d'appel de son propre réglage (nom + handicap). -->
        <section
          data-testid="step-players"
          class="flex flex-1 flex-col gap-px bg-white/10 md:flex-row"
        >
          <button
            data-testid="player1-zone"
            class="flex flex-1 flex-col justify-between bg-player-white p-6 text-left text-on-player-white touch-manipulation select-none"
            @pointerdown="openSetup('player1')"
          >
            <span class="text-stat font-bold opacity-60">BILLE BLANCHE</span>
            <span class="flex items-end justify-between gap-4">
              <span
                data-testid="player1-name"
                class="text-label font-black uppercase"
                :class="player1Name ? '' : 'opacity-40'"
              >
                {{ displayedNames.player1 }}
              </span>
              <span
                v-if="targetScores.player1 > 0"
                data-testid="player1-target"
                class="text-label font-black"
              >
                {{ targetScores.player1 }}
              </span>
            </span>
          </button>

          <button
            data-testid="player2-zone"
            class="flex flex-1 flex-col justify-between bg-player-yellow p-6 text-left text-on-player-yellow touch-manipulation select-none"
            @pointerdown="openSetup('player2')"
          >
            <span class="text-stat font-bold opacity-60">BILLE JAUNE</span>
            <span class="flex items-end justify-between gap-4">
              <span
                data-testid="player2-name"
                class="text-label font-black uppercase"
                :class="player2Name ? '' : 'opacity-40'"
              >
                {{ displayedNames.player2 }}
              </span>
              <span
                v-if="targetScores.player2 > 0"
                data-testid="player2-target"
                class="text-label font-black"
              >
                {{ targetScores.player2 }}
              </span>
            </span>
          </button>
        </section>
      </main>

      <ActionBar @back="back">
        <template #actions>
          <button
            v-if="step === 'players'"
            data-testid="confirm-button"
            class="min-h-[var(--size-touch-target)] bg-accent px-10 text-label font-black text-on-accent touch-manipulation select-none"
            @pointerdown="confirm"
          >
            DÉMARRER
          </button>
        </template>
      </ActionBar>
    </div>

    <PlayerSetupModal
      v-if="editing && step === 'players'"
      :key="editing"
      :color="editing === 'player1' ? 'white' : 'yellow'"
      :name="names[editing]"
      :targetScore="targetScores[editing]"
      :initialField="editingField"
      @confirm="applySetup"
      @cancel="cancelSetup"
    />

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
