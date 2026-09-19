<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../stores/useGameStore'
import AlphaKeyboardSheet from './AlphaKeyboardSheet.vue'
import ModeTile from './ModeTile.vue'
import NumericPadDock from './NumericPadDock.vue'
import PictoIcon from './PictoIcon.vue'
import CtaButton from './CtaButton.vue'
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
import { readScene, homeSceneState } from '../dev/scenes'

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

// Revue de rendu de Nathan (2026-09-12, réf. Cueuny) : les deux réglages sont BLEUS et
// côte à côte, picto en ligne devant le libellé ; `DÉMARRER` est ROUGE, pleine largeur
// dessous, avec un chevron. Le rouge marque l'action qui engage la partie, face à deux
// réglages qu'on peut retoucher — il ne remplace pas `--color-brand-red` dans son rôle de
// rouge de marque (bandeau de la barre latérale).
// Les deux réglages sont EMPILÉS et pleine largeur depuis la revue de rendu du 2026-09-12
// (Nathan teste sur un 14") : chacun tient son libellé sur une ligne, picto EN LIGNE devant
// comme la référence coréenne — ce que la disposition côte à côte, à 73 px par bouton,
// rendait impossible. La chaîne de classes est la variante `setup` de `CtaButton` depuis la
// Story 11.3 : elle ne vit plus ici.

// GÉOMÉTRIE DE L'ÉTAPE `players` — la bande qu'une pop-up de saisie doit RÉSERVER pour ne
// pas couvrir la carte qu'on remplit. Elle vivait en tokens `--setup-popup-inset-*` jusqu'à
// la Story 11.3 : c'était une POSITION dans le namespace des intentions
// (`integration-bmad-impeccable.md` §6). Sa place est ici, à côté du markup à trois colonnes
// qu'elle mesure — si cette mise en page bouge, ces deux valeurs se voient dans le même
// fichier, et non trois dossiers plus loin.
//
// Lecture (Story 11.5, grand bloc) : barre latérale (`--size-sidebar`) + marge du grand bloc
// (`m-1`) + son filet (1 px) + son retrait (`p-1`) + une carte + la gouttière (`gap-1`). La
// largeur utile C vaut `100vw - sidebar - 4 unités - 2 px` ; la colonne centrale en prend le
// quart et chaque carte `0,375·C - 1 unité`. D'où, jusqu'au bord de la colonne centrale :
// à gauche `sidebar + 2 unités + 1 px + 0,375·C`, à droite `0,375·C + 2 unités + 1 px`.
// ⚠️ Avant la 11.5 : `p-4` et gouttière de 4 unités, soit `+ 4 unités` et C = 100vw - sidebar
// - 8 unités. Si la mise en page du grand bloc bouge, ces deux valeurs bougent avec elle.
// ⚠️ L'ASYMÉTRIE est réelle — la barre latérale n'est que d'un côté : deux valeurs, pas une.
// `--size-sidebar` et `--spacing` restent des tokens et restent lus : ce sont des intentions
// (largeur de la barre, unité de grille). Ce qui part, c'est leur PRODUIT par une mise en page.
const SETUP_POPUP_RESERVE: Record<TableSide, string> = {
  left: 'calc(var(--size-sidebar) + var(--spacing) * 2 + 1px + (100vw - var(--size-sidebar) - var(--spacing) * 4 - 2px) * 0.375)',
  right: 'calc((100vw - var(--size-sidebar) - var(--spacing) * 4 - 2px) * 0.375 + var(--spacing) * 2 + 1px)',
}

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

// Story 11.4 — semis de la part ÉCRAN d'une scène `?scene=` (01 à 06), pour que le
// garde-fou outillé mesure le paramétrage et ses deux pop-ups et non l'accueil.
// UNE SEULE FOIS, AU SETUP : le détecteur scanne à la fin du chargement sans rien attendre,
// et un semis dans un `watch` ou un `onMounted` asynchrone arriverait après la mesure.
// La garde est ici, au point d'appel : `import.meta.env.DEV` est remplacé statiquement, le
// bloc s'efface du build et l'import part avec lui (`src/dev/scenes.test.ts`).
if (import.meta.env.DEV) {
  const scene = readScene()
  const seed = scene ? homeSceneState(scene) : null
  if (seed) {
    if (seed.step !== undefined) step.value = seed.step
    if (seed.selectedCategory !== undefined) selectedCategory.value = seed.selectedCategory
    if (seed.selectedMode !== undefined) selectedMode.value = seed.selectedMode
    if (seed.players !== undefined) players.value = structuredClone(seed.players)
    if (seed.whiteSide !== undefined) whiteSide.value = seed.whiteSide
    if (seed.entry !== undefined) entry.value = seed.entry
    if (seed.draft !== undefined) draft.value = seed.draft
    if (seed.distanceError !== undefined) distanceError.value = seed.distanceError
    if (seed.cadrePromptOpen !== undefined) cadrePromptOpen.value = seed.cadrePromptOpen
  }
}

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

// La pop-up de saisie se range du côté OPPOSÉ à la carte visée : c'est ce qui laisse voir
// la carte pendant qu'on la remplit, et donc ce qui permet à la pop-up de ne porter aucun
// rappel de la valeur (revue de rendu du 2026-09-12).
const entryPopupSide = computed<TableSide>(() => {
  const current = entry.value
  if (!current) return 'right'
  const cardSide = leftBall.value === current.ball ? 'left' : 'right'
  return cardSide === 'left' ? 'right' : 'left'
})

// La bande que la pop-up doit réserver : celle de la carte visée, donc le côté OPPOSÉ à
// celui où la pop-up se pose.
const entryPopupReserve = computed(
  () => SETUP_POPUP_RESERVE[entryPopupSide.value === 'left' ? 'right' : 'left'],
)

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

// Revenir à l'accueil EFFACE les saisies (revue de fin d'Epic 10, décision de Nathan) : un
// handicap ou un nom réglés pour un mode abandonné ne se reconduisent pas sur une autre
// catégorie — même règle que `resetGame()` en revue 1.3. Seul le retour d'UN cran, vers la
// sélection JDS, conserve (AC2 : revenir choisir un autre cadre ne coûte pas les noms).
function goHome(): void {
  clearSetup()
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

// `RETOUR` : on remonte d'un écran. Vers la sélection JDS, les saisies sont CONSERVÉES —
// revenir choisir un autre cadre ne doit pas coûter les deux noms déjà tapés (Story 10.3,
// AC2) ; jusqu'à l'accueil, `goHome()` les efface.
function back(): void {
  closeSetupEntry()

  if (step.value === 'players' && categoryModes.value.length > 1) {
    step.value = 'mode'
    return
  }
  goHome()
}

// `ANNULER` : retour à l'accueil, sans confirmation — `goHome()` efface tout.
function cancelSetup(): void {
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

// Ouvre une saisie. ⚠️ Jamais par-dessus une autre (revue de fin d'Epic 10, décision de
// Nathan) : les deux claviers sont des pop-ups à voile PLEIN ÉCRAN, donc pendant une saisie
// les cartes et la colonne centrale ne sont pas tapables — taper à côté tombe sur le voile
// et vaut `ANNULER` (`abandonEntry`). L'AC6 d'origine (« taper un autre champ valide au
// passage ») a été réécrite en conséquence, et la garde `if (entry) applyEntry()` qui
// vivait ici — comme dans `confirm`, `changeBall`, `changeSide` — est partie avec elle :
// aucun geste réel ne l'atteignait. Les seuls appelants sont la carte (aucune saisie
// ouverte, par construction) et l'enchaînement du rattrapage, qui a déjà refermé la sienne.
function openEntry(ball: PlayerColor, field: 'name' | 'distance'): void {
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

// UX-DR43, corrigé à la revue de rendu du 2026-09-12 (Nathan). Les deux actions sont
// exactement duales, et chacune est son propre inverse :
// - `CHANGER DE BILLE` : les JOUEURS restent en place, leurs billes s'échangent. Permuter
//   les entrées ET basculer le côté se compensent à l'écran, seule la couleur change.
// - `CHANGER DE CÔTÉ` : les BILLES restent en place (gauche blanche, droite jaune), les
//   noms et les distances s'échangent. Une simple permutation des entrées suffit — c'était
//   le bug : basculer aussi `whiteSide` faisait voyager la bille avec le joueur.
// Aucune saisie ne peut être ouverte ici : les deux CTA sont sous le voile des claviers.
function swapPlayerEntries(): void {
  players.value = { white: players.value.yellow, yellow: players.value.white }
}

function changeBall(): void {
  swapPlayerEntries()
  whiteSide.value = whiteSide.value === 'left' ? 'right' : 'left'
}

function changeSide(): void {
  swapPlayerEntries()
}

// AC1 : sans distance, la partie ne démarre pas — une pop-up propose de la régler.
// `player1` est la bille BLANCHE et reste celui qui ouvre (AR24) : le côté part à part,
// en 5e paramètre, et ne touche à aucune règle de jeu.
function confirm(): void {
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
      class="flex h-full w-full"
    >
      <SideBar :items="HOME_SIDEBAR_ITEMS" :exitItem="HOME_SIDEBAR_EXIT" />

      <main class="flex min-w-0 flex-1 flex-col bg-bg-raised">
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
      class="flex h-full w-full"
    >
      <SideBar :items="JDS_SIDEBAR_ITEMS" />

      <main class="flex min-w-0 flex-1 flex-col bg-bg-raised">
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
         Les deux claviers sont des pop-ups à voile (2e passe de rendu) : rien n'est monté
         dans le flux, la carte visée reste visible sous le voile et se remplit à vue. -->
    <div v-else data-testid="step-players" class="flex h-full w-full">
      <SideBar :items="PLAYERS_SIDEBAR_ITEMS" :exitItem="PLAYERS_SIDEBAR_EXIT" />

      <div class="flex min-w-0 flex-1 flex-col bg-bg-raised">
        <!-- Story 11.5 (Nathan, au rendu, 2026-09-19, propositions « M » puis « T1 ») : le
             MÊME format que le scoreboard — un grand bloc voilé contient trois blocs séparés
             d'une unité, la colonne centrale en creux. Plus de bandeau de titre au-dessus : il
             faisait une double ligne avec le filet du grand bloc, et le mode se lit désormais en
             tête de la colonne centrale. Les cartes gagnent toute la hauteur du bandeau.
             Exception aux angles vifs : `DESIGN.md` › Shapes, étendue à la mise en page carte ·
             colonne · carte. ⚠️ `SETUP_POPUP_RESERVE` mesure CETTE géométrie. La gouttière
             LIT `--game-column-gutter`, le token du scoreboard, au lieu d'un `gap-1` recopié :
             même format, même valeur (revue de la 11.5). -->
        <main
          class="m-1 flex min-h-0 min-w-0 flex-1 gap-(--game-column-gutter) rounded-zone border border-border bg-surface p-1"
        >
          <PlayerSetupCard
            side="left"
            :ball="leftBall"
            :name="shownValue(leftBall, 'name')"
            :distance="shownValue(leftBall, 'distance')"
            :focusedField="focusedFieldOf(leftBall)"
            @focus="openEntry(leftBall, $event)"
          />

          <!-- Colonne centrale, 1/4 de la zone (3e passe de rendu) : le MODE en tête, puis les
               deux CTA de réglage et DÉMARRER en bloc calé en bas. Les claviers sont des pop-ups :
               la colonne ne change jamais de largeur. En creux depuis la 11.5 : base nue,
               rayon de bloc, retrait d'une unité — celui de `PASSER LE TOUR` dans la sienne. -->
          <section
            data-testid="setup-center"
            class="flex min-h-0 w-1/4 shrink-0 flex-col gap-2 rounded-block bg-bg p-1"
          >
            <!-- Le mode en grand, en tête de la colonne (Nathan, 2026-09-19, « T1 ») : il tenait
                 un bandeau à lui au-dessus de l'écran, il occupe maintenant le haut du creux,
                 vide jusque-là. Il passe à la ligne plutôt que d'être tronqué : un quart de
                 largeur, et « CADRE 47/2 » est le plus long des modes jouables. -->
            <h1
              data-testid="setup-mode-label"
              class="pt-4 text-center text-title font-black tracking-title text-balance text-white"
            >
              {{ modeLabel }}
            </h1>
            <!-- Les trois commandes forment un BLOC, calé en bas de la colonne (modèle
                 Cueuny) : deux réglages bleus côte à côte, puis l'action qui engage. -->
            <div class="mt-auto flex shrink-0 flex-col gap-2">
              <CtaButton
                data-testid="change-ball-button"
                variant="setup"
                @press="changeBall"
              >
                <PictoIcon name="refresh" class="size-3 shrink-0" />
                <span>CHANGER DE BILLE</span>
              </CtaButton>
              <CtaButton
                data-testid="change-side-button"
                variant="setup"
                @press="changeSide"
              >
                <PictoIcon name="arrow-right-left" class="size-3 shrink-0" />
                <span>CHANGER DE CÔTÉ</span>
              </CtaButton>

              <!-- `confirm-button` conservé malgré le déménagement en colonne centrale :
                   `GameView.test.ts` le lit pour traverser l'accueil.
                   Le chevron est à GAUCHE du mot, NU et large : sa plaque translucide,
                   essayée d'abord, se lisait comme un bouton dans le bouton (revue de rendu
                   du 2026-09-12). -->
              <CtaButton
                data-testid="confirm-button"
                variant="start"
                @press="confirm"
              >
                <PictoIcon name="chevron-right" class="size-5 shrink-0" />
                <span>DÉMARRER</span>
              </CtaButton>
            </div>
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

      </div>

      <!-- Les deux claviers sont des POP-UPS alignées sur le côté OPPOSÉ à la carte qu'on
           remplit (revue de rendu du 2026-09-12) : celle-ci reste entièrement visible et se
           remplit à vue, ce qui rend inutile tout rappel de la valeur dans la pop-up.
           ⚠️ `key` par bille (revue de fin d'Epic 10) : l'enchaînement du rattrapage passe
           du blanc au jaune SANS démonter la pop-up, et `NumericPadDock` fige à sa création
           sa règle « la première frappe remplace » — sans `key`, un 4 tapé sur une
           distance déjà à 25 donnait 254. L'ancienne modale avait `:key="editing"`. -->
      <NumericPadDock
        v-if="entry?.field === 'distance'"
        :key="entry.ball"
        :value="draft"
        :align="entryPopupSide"
        :reserve="entryPopupReserve"
        @update="draft = $event"
        @validate="applyEntry"
        @cancel="abandonEntry"
      />

      <AlphaKeyboardSheet
        v-if="entry?.field === 'name'"
        :key="entry.ball"
        :value="draft"
        :align="entryPopupSide"
        :reserve="entryPopupReserve"
        @update="draft = $event"
        @validate="applyEntry"
        @cancel="abandonEntry"
      />
    </div>

    <!-- Choix du cadre (Story 10.2), en variante liste : le titre porte le mot, les
         commandes la variante, `ANNULER` ferme sans rien choisir — et le tap dehors aussi,
         comme sur toute pop-up à `ANNULER` (règle portée par `PromptModal`). -->
    <PromptModal
      v-if="cadrePromptOpen && step === 'mode'"
      title="CADRE"
      :actions="cadreActions"
      secondaryLabel="ANNULER"
      @select="selectCadre"
      @secondary="cadrePromptOpen = false"
    />

    <!-- Titre et deux CTA, sans message ni croix (revue de Nathan, 2026-09-10) : la saisie
         qui suit dit d'elle-même de quel joueur il s'agit, et `ANNULER` est le retour de
         toutes les pop-ups de décision — et le tap dehors le vaut aussi (règle portée par
         `PromptModal` : tout `ANNULER` ouvre le voile). -->
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
