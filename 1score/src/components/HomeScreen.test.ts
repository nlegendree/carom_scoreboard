import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeScreen from './HomeScreen.vue'
import ModeTile from './ModeTile.vue'
import PromptModal from './PromptModal.vue'
import NumericPadDock from './NumericPadDock.vue'
import AlphaKeyboardSheet from './AlphaKeyboardSheet.vue'
import { useGameStore } from '../stores/useGameStore'

type Wrapper = ReturnType<typeof mount>

// Depuis la 10.2, les trois cadres ne sont plus des tuiles mais les commandes de la
// pop-up ouverte par la tuile CADRE ; les autres modes gardent leur tuile.
async function goToPlayersStep(wrapper: Wrapper, mode = 'libre') {
  await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
  if (mode.startsWith('cadre-')) {
    await wrapper.find('[data-testid="mode-cadre"]').trigger('pointerdown')
    await wrapper.find(`[data-testid="prompt-action-${mode}"]`).trigger('pointerdown')
    return
  }
  await wrapper.find(`[data-testid="mode-${mode}"]`).trigger('pointerdown')
}

// ⚠️ Depuis la 10.3, `name-field` et `distance-field` existent EN DOUBLE — une paire par
// carte. Un `wrapper.find` non scopé attraperait toujours celle de GAUCHE, et un cas censé
// viser le jaune passerait au vert en testant le blanc. Tout passe donc par la carte.
function card(wrapper: Wrapper, side: 'left' | 'right') {
  return wrapper.find(`[data-testid="player-card-${side}"]`)
}

function ballOn(wrapper: Wrapper, side: 'left' | 'right') {
  return card(wrapper, side).attributes('data-ball')
}

function nameOn(wrapper: Wrapper, side: 'left' | 'right') {
  return card(wrapper, side).find('[data-testid="name-value"]')
}

function distanceOn(wrapper: Wrapper, side: 'left' | 'right') {
  return card(wrapper, side).find('[data-testid="distance-value"]')
}

// Le côté de la BILLE demandée, qui se déplace au gré des deux CTA de réglage.
function sideOfBall(wrapper: Wrapper, ball: 'white' | 'yellow'): 'left' | 'right' {
  return ballOn(wrapper, 'left') === ball ? 'left' : 'right'
}

async function focusField(wrapper: Wrapper, ball: 'white' | 'yellow', field: 'name' | 'distance') {
  await card(wrapper, sideOfBall(wrapper, ball))
    .find(`[data-testid="${field}-field"]`)
    .trigger('pointerdown')
}

// Le dock et le bandeau vivent dans l'écran, hors des cartes : ils se cherchent à la racine.
async function press(wrapper: Wrapper, testids: string[]) {
  for (const testid of testids) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
  }
}

async function typeDistance(wrapper: Wrapper, ball: 'white' | 'yellow', digits: number[]) {
  await focusField(wrapper, ball, 'distance')
  await press(wrapper, digits.map((d) => `digit-${d}`))
}

async function typeName(wrapper: Wrapper, ball: 'white' | 'yellow', name: string) {
  await focusField(wrapper, ball, 'name')
  await press(
    wrapper,
    [...name.toUpperCase()].map((c) => (c === ' ' ? 'key-space' : `key-${c}`)),
  )
}

// Depuis la 1.10, DÉMARRER exige une distance par joueur : les parcours qui ne portent
// pas sur la distance la règlent par ce helper (100 / 80).
async function setDistances(wrapper: Wrapper) {
  await typeDistance(wrapper, 'white', [1, 0, 0])
  await press(wrapper, ['dock-confirm'])
  await typeDistance(wrapper, 'yellow', [8, 0])
  await press(wrapper, ['dock-confirm'])
}

function errorPrompt(wrapper: Wrapper) {
  return wrapper.find('[data-testid="prompt-modal"]')
}

// `RETOUR` de la barre latérale : il a remplacé la barre basse en 10.3.
async function goBack(wrapper: Wrapper) {
  await wrapper.find('[data-testid="sidebar-item-back"]').trigger('pointerdown')
}

describe('HomeScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('opens the sub-mode step for a category holding several modes', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="mode-cadre"]').exists()).toBe(true)
  })

  it('goes back from the sub-mode step to the category step', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="sidebar-item-back"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  it('goes back from the players step to the sub-mode step', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await goBack(wrapper)

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(true)
  })

  // Story 10.1, 10.2 puis 10.3 : la barre latérale et son logo tiennent désormais les
  // TROIS écrans hors jeu. Le retour y vit, il n'a plus de barre basse où se poser.
  it('shows the sidebar and its logo on every step', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="1Score"]').exists()).toBe(true)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)

    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="1Score"]').exists()).toBe(true)
  })

  // AC1 : `ActionBar` ne sert plus qu'au scoreboard — l'accueil ne l'importe même plus.
  it('never renders a bottom action bar, on any step', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('[data-testid="action-bar"]').exists()).toBe(false)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    expect(wrapper.find('[data-testid="action-bar"]').exists()).toBe(false)

    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="action-bar"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(false)
  })

  it('greets the player with the home tagline', () => {
    const wrapper = mount(HomeScreen)

    expect(wrapper.find('[data-testid="home-tagline"]').text()).toBe('À vous de jouer.')
  })

  // L'ordre des tuiles est une donnée de présentation, distincte de l'ordre du catalogue.
  it('lays out the mode tiles as 3 BANDES, JEUX DE SÉRIES, QUILLES, CASIN', () => {
    const wrapper = mount(HomeScreen)
    const tiles = wrapper.findAll('[data-testid^="category-"]')

    expect(tiles.map((tile) => tile.attributes('data-testid'))).toEqual([
      'category-3bandes',
      'category-series',
      'category-quilles',
      'category-casin',
    ])
    expect(tiles.map((tile) => tile.find('[data-testid="tile-title"]').text())).toEqual([
      '3 BANDES',
      'JEUX DE SÉRIES',
      'QUILLES',
      'CASIN',
    ])
  })

  // AR26 : les trois items sont affichés mais pas encore livrés — aucun effet au tap,
  // FERMER L'APPLICATION compris (ni pop-up, ni fermeture).
  it('shows the three sidebar items as soon, with the exit at the bottom, all inert', async () => {
    const wrapper = mount(HomeScreen)
    const ids = ['training', 'signup', 'close-app']

    expect(
      wrapper.find('[data-testid="sidebar-bottom"] [data-testid="sidebar-item-close-app"]').exists(),
    ).toBe(true)

    for (const id of ids) {
      const item = wrapper.find(`[data-testid="sidebar-item-${id}"]`)
      expect(item.attributes('disabled')).toBeDefined()
      expect(item.text()).toContain('BIENTÔT')

      await item.trigger('pointerdown')

      expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="prompt-modal"]').exists()).toBe(false)
    }
  })

  // ——— Sélection JDS (Story 10.2) ———

  // Le titre vient du catalogue : c'est le libellé de la catégorie ouverte, pas une
  // chaîne écrite en dur dans l'écran.
  it('titles the JDS step with the label of the category opened', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="jds-title"]').text()).toBe('JEUX DE SÉRIES')
  })

  // Ordre de présentation, distinct de celui du catalogue (où les cadres suivent LIBRE).
  // Aucune accroche : titre et flèche seulement, comme à l'accueil (décision de Nathan).
  it('lays out the JDS tiles as LIBRE, 1 BANDE, CADRE, 4 BILLES, without taglines', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    const tiles = wrapper.findAll('[data-testid^="mode-"]')

    expect(tiles.map((tile) => tile.attributes('data-testid'))).toEqual([
      'mode-libre',
      'mode-bande',
      'mode-cadre',
      'mode-4billes',
    ])
    expect(tiles.map((tile) => tile.find('[data-testid="tile-title"]').text())).toEqual([
      'LIBRE',
      '1 BANDE',
      'CADRE',
      '4 BILLES',
    ])
    expect(wrapper.find('[data-testid="tile-tagline"]').exists()).toBe(false)
  })

  // Un seul bleu pour toutes les tuiles ouvertes (décision de Nathan, 2026-09-12) :
  // l'écran ne porte plus de couleur, la tuile la connaît.
  it('leaves the JDS tiles on the single product blue', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    for (const tile of wrapper.findAll('[data-testid^="mode-"]')) {
      expect(tile.findComponent(ModeTile).props('color')).toBeUndefined()
      expect(tile.find('[data-testid="tile-background"]').classes()).toContain(
        'bg-(image:--gradient-blue)',
      )
    }
  })

  // Seules les catégories BIENTÔT gardent une nuance propre.
  it('keeps a dark shade on the soon categories only', () => {
    const wrapper = mount(HomeScreen)
    const colors = wrapper
      .findAll('[data-testid^="category-"]')
      .map((tile) => tile.findComponent(ModeTile).props('color'))

    expect(colors).toEqual([undefined, undefined, 'tile-quilles', 'tile-casin'])
  })

  // UX-DR31 : la barre porte le contenu de SON écran. Ici, un seul item et pas de sortie.
  it('gives the JDS step a sidebar holding RETOUR alone, with no exit item', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    const items = wrapper.findAll('[data-testid^="sidebar-item-"]')

    expect(items.map((item) => item.attributes('data-testid'))).toEqual(['sidebar-item-back'])
    expect(items[0]!.text()).toContain('RETOUR')
    expect(items[0]!.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-testid="sidebar-bottom"]').exists()).toBe(false)
  })

  it('forgets the category when RETOUR is pressed on the JDS step', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="sidebar-item-back"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(false)
  })

  it.each([
    ['libre', 'libre'],
    ['bande', 'bande'],
    ['4billes', '4billes'],
  ] as const)('starts a %s game straight from its tile', async (testid, mode) => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find(`[data-testid="mode-${testid}"]`).trigger('pointerdown')
    expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(true)

    await setDistances(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.mode).toBe(mode)
  })

  // La tuile CADRE n'est pas un mode : c'est un groupe de présentation qui ouvre le choix.
  // Le titre porte déjà le mot, les commandes ne portent que la variante.
  it('opens the frame choice as a list prompt holding 47/2, 47/1, 71/2 then ANNULER', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-cadre"]').trigger('pointerdown')
    const prompt = wrapper.findComponent(PromptModal)

    expect(prompt.find('[data-testid="prompt-title"]').text()).toBe('CADRE')
    expect(
      prompt.findAll('[data-testid^="prompt-action-"]').map((action) => action.text()),
    ).toEqual(['47/2', '47/1', '71/2'])
    expect(prompt.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')
    expect(prompt.find('[data-testid="prompt-primary"]').exists()).toBe(false)
  })

  it.each(['cadre-47-2', 'cadre-47-1', 'cadre-71-2'] as const)(
    'starts a %s game from the frame prompt',
    async (mode) => {
      const wrapper = mount(HomeScreen)
      const store = useGameStore()

      await goToPlayersStep(wrapper, mode)
      expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(true)

      await setDistances(wrapper)
      await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

      expect(store.mode).toBe(mode)
    },
  )

  it('leaves the JDS step untouched when the frame choice is cancelled', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-cadre"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-secondary"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="prompt-modal"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(false)
  })

  // P2 : une pop-up seulement masquée par le garde `step` se rouvrirait d'elle-même au
  // retour sur l'étape — c'est le défaut déjà corrigé sur `distanceError` en 1.4.
  it('closes the frame prompt when the JDS step is abandoned', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-cadre"]').trigger('pointerdown')
    await wrapper.find('[data-testid="sidebar-item-back"]').trigger('pointerdown')
    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="prompt-modal"]').exists()).toBe(false)
  })

  it('marks categories whose modes are all unavailable as disabled and does not open them', async () => {
    const wrapper = mount(HomeScreen)
    const quilles = wrapper.find('[data-testid="category-quilles"]')

    expect(quilles.attributes('disabled')).toBeDefined()
    expect(quilles.text()).toContain('BIENTÔT')

    await quilles.trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  // Story 2.1 : la catégorie 3 BANDES est déverrouillée par `available: true` dans le
  // catalogue. À mode unique, elle mène directement à l'étape joueurs — sans étape mode.
  it('opens the players step straight from the 3 BANDES category', async () => {
    const wrapper = mount(HomeScreen)
    const troisBandes = wrapper.find('[data-testid="category-3bandes"]')

    expect(troisBandes.attributes('disabled')).toBeUndefined()
    expect(troisBandes.text()).not.toContain('BIENTÔT')

    await troisBandes.trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(true)
  })

  // --- Story 10.3 : paramétrage refondu, saisie en place ---

  // AC2, UX-DR44 : RETOUR, CONFIGURATION en BIENTÔT, et une sortie ANNULER calée en bas.
  it('gives the players step a sidebar holding RETOUR, CONFIGURATION and an ANNULER exit', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    const items = wrapper.findAll('[data-testid^="sidebar-item-"]')

    expect(items.map((item) => item.attributes('data-testid'))).toEqual([
      'sidebar-item-back',
      'sidebar-item-settings',
      'sidebar-item-cancel',
    ])
    expect(items[1]!.text()).toContain('CONFIGURATION')
    expect(items[1]!.attributes('disabled')).toBe('')
    expect(items[2]!.text()).toContain('ANNULER')
    expect(items[2]!.attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[data-testid="sidebar-bottom"]').exists()).toBe(true)
  })

  // Le 3 Bandes n'a pas d'étape mode : son RETOUR remonte donc à l'accueil.
  it('goes back from the players step to the home screen in three cushions', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-3bandes"]').trigger('pointerdown')
    await goBack(wrapper)

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  // AC2 : RETOUR est un pas en arrière, pas un abandon — revenir choisir un autre cadre
  // ne doit pas coûter les deux noms déjà tapés.
  it('keeps the names and distances typed when RETOUR is pressed', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])
    await goBack(wrapper)
    await wrapper.find('[data-testid="mode-bande"]').trigger('pointerdown')

    expect(nameOn(wrapper, 'left').text()).toBe('MICHEL')
    expect(distanceOn(wrapper, 'left').text()).toBe('100')
  })

  // AC2 : ANNULER, lui, efface tout et ramène à l'accueil, sans confirmation.
  it('clears everything and goes home on ANNULER', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await wrapper.find('[data-testid="sidebar-item-cancel"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)

    await goToPlayersStep(wrapper)

    expect(nameOn(wrapper, 'left').text()).toBe('NOM')
    expect(distanceOn(wrapper, 'left').text()).toBe('DISTANCE')
  })

  // AC3 : deux cartes, blanc à gauche au départ, chacune adressable par son côté.
  it('lays out two cards with the white ball on the left', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)

    expect(ballOn(wrapper, 'left')).toBe('white')
    expect(ballOn(wrapper, 'right')).toBe('yellow')
  })

  // AC10, revu le 2026-09-12 : le mode se lit en GRAND dans un bandeau de titre en haut
  // de l'écran (réf. Cueuny), plus en surtitre discret de la colonne centrale.
  it('titles the screen with the mode, and shows the two setting CTAs', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper, 'cadre-47-2')

    const title = wrapper.find('[data-testid="setup-header"] [data-testid="setup-mode-label"]')
    expect(title.text()).toBe('CADRE 47/2')
    expect(title.classes()).toContain('text-tile-title')
    expect(wrapper.find('[data-testid="change-ball-button"]').text()).toContain('CHANGER DE BILLE')
    expect(wrapper.find('[data-testid="change-side-button"]').text()).toContain('CHANGER DE CÔTÉ')
    expect(wrapper.find('[data-testid="confirm-button"]').text()).toBe('DÉMARRER')
  })

  it('starts a game with the chosen sub-mode and default names', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper, 'cadre-47-2')
    await setDistances(wrapper)
    await press(wrapper, ['confirm-button'])

    expect(store.mode).toBe('cadre-47-2')
    expect(store.status).toBe('playing')
    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player2.name).toBe('JOUEUR 2')
  })

  // Ce qui mérite d'être verrouillé de bout en bout, c'est qu'aucune suite d'espaces ne
  // parvienne au store — la garde vit dans le bandeau, l'écran n'en sait rien.
  it('never lets a run of spaces reach the store', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await focusField(wrapper, 'white', 'name')
    await press(wrapper, ['key-M', 'key-space', 'key-space', 'key-A', 'sheet-confirm'])
    await press(wrapper, ['confirm-button'])

    expect(store.player1.name).toBe('M A')
  })

  it('falls back to the default name when nothing is typed', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await focusField(wrapper, 'yellow', 'name')
    await press(wrapper, ['sheet-confirm'])
    await press(wrapper, ['confirm-button'])

    expect(store.player2.name).toBe('JOUEUR 2')
  })

  it('trims a trailing space from the typed name', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await typeName(wrapper, 'white', 'MICHEL ')
    await press(wrapper, ['sheet-confirm'])
    await press(wrapper, ['confirm-button'])

    expect(store.player1.name).toBe('MICHEL')
  })

  // AC5 : taper le NOM ouvre le bandeau, et lui seul. Aucune pop-up de joueur n'existe
  // plus (AC9) — plus rien ne recouvre les cartes.
  it('opens the name sheet from the name field, and nothing else', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').exists()).toBe(false)

    await focusField(wrapper, 'white', 'name')

    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
  })

  // AC4, revu le 2026-09-12 : taper la DISTANCE ouvre le pavé en POP-UP par-dessus
  // l'écran, et non plus dans la colonne centrale — les commandes de réglage restent donc
  // en place, simplement recouvertes par le voile.
  it('opens the distance pad as a pop-up over the screen', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await focusField(wrapper, 'yellow', 'distance')

    const pad = wrapper.find('[data-testid="numeric-pad-dock"]')
    expect(pad.exists()).toBe(true)
    expect(pad.classes()).toContain('fixed')
    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').exists()).toBe(false)
  })

  // La pop-up reçoit la bille du joueur visé : c'est le rappel de son en-tête.
  it('hands the targeted ball to the entry pop-up', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await focusField(wrapper, 'yellow', 'distance')
    expect(wrapper.findComponent(NumericPadDock).props('ball')).toBe('yellow')

    await press(wrapper, ['dock-close'])
    await focusField(wrapper, 'white', 'name')

    expect(wrapper.findComponent(AlphaKeyboardSheet).props('ball')).toBe('white')
  })

  // AC3 : le liseré dit quel champ reçoit la frappe, et il n'y en a qu'un.
  it('outlines the focused field of the targeted card only', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await focusField(wrapper, 'yellow', 'distance')

    expect(card(wrapper, 'right').find('[data-testid="distance-field"]').classes()).toContain(
      'border-turn-active',
    )
    expect(card(wrapper, 'right').find('[data-testid="name-field"]').classes()).not.toContain(
      'border-turn-active',
    )
    expect(card(wrapper, 'left').find('[data-testid="distance-field"]').classes()).not.toContain(
      'border-turn-active',
    )
  })

  // AC4, AC5 : la carte se remplit À VUE, frappe après frappe — c'est tout l'intérêt de
  // l'écran, et la raison pour laquelle rien ne la recouvre.
  it('fills the targeted card as each key is pressed', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeDistance(wrapper, 'white', [4])

    expect(distanceOn(wrapper, 'left').text()).toBe('4')

    await press(wrapper, ['digit-7'])

    expect(distanceOn(wrapper, 'left').text()).toBe('47')
  })

  it('fills the name of the targeted card as each key is pressed', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'yellow', 'AN')

    expect(nameOn(wrapper, 'right').text()).toBe('AN')
  })

  it('keeps the value applied once it is validated', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeDistance(wrapper, 'white', [4, 0])
    await press(wrapper, ['dock-confirm'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
    expect(distanceOn(wrapper, 'left').text()).toBe('40')
  })

  // AC4, AC5 : la croix abandonne et restaure la valeur précédente.
  it('restores the previous value when the entry is abandoned by its cross', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeDistance(wrapper, 'white', [4, 0])
    await press(wrapper, ['dock-confirm'])
    await typeDistance(wrapper, 'white', [9])
    await press(wrapper, ['dock-close'])

    expect(distanceOn(wrapper, 'left').text()).toBe('40')
  })

  it('restores the previous name when the sheet is abandoned by its cross', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeName(wrapper, 'white', 'X')
    await press(wrapper, ['sheet-close'])

    expect(nameOn(wrapper, 'left').text()).toBe('MICHEL')
  })

  // AC6 relu le 2026-09-12 : depuis que les claviers sont des POP-UPS à voile plein écran,
  // un joueur ne peut plus taper l'autre champ pendant une saisie — les issues sont la
  // croix et VALIDER. La garde « ouvrir une saisie valide celle en cours » reste néanmoins
  // dans `openEntry`, et elle est bel et bien atteinte par l'enchaînement du rattrapage
  // (« DISTANCE MANQUANTE ») : une valeur en cours n'y est jamais perdue en silence.
  it('never loses a running entry when another one is opened', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-primary'])
    await press(wrapper, ['digit-4', 'digit-0'])
    // La validation du blanc enchaîne d'elle-même sur le jaune : c'est le chemin réel.
    await press(wrapper, ['dock-confirm'])

    expect(distanceOn(wrapper, sideOfBall(wrapper, 'white')).text()).toBe('40')
    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(true)
    expect(
      card(wrapper, sideOfBall(wrapper, 'yellow'))
        .find('[data-testid="distance-field"]')
        .classes(),
    ).toContain('border-turn-active')
  })

  // Une seule saisie ouverte à la fois, quoi qu'il arrive.
  it('never opens two entries at once', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await focusField(wrapper, 'white', 'name')

    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
  })

  // AC11 : les billes s'échangent, les joueurs restent en place.
  it('swaps the balls and leaves the players in place on CHANGER DE BILLE', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])

    await press(wrapper, ['change-ball-button'])

    expect(ballOn(wrapper, 'left')).toBe('yellow')
    expect(ballOn(wrapper, 'right')).toBe('white')
    expect(nameOn(wrapper, 'left').text()).toBe('MICHEL')
    expect(distanceOn(wrapper, 'left').text()).toBe('100')
  })

  it('is its own inverse on a second CHANGER DE BILLE', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm', 'change-ball-button', 'change-ball-button'])

    expect(ballOn(wrapper, 'left')).toBe('white')
    expect(nameOn(wrapper, 'left').text()).toBe('MICHEL')
  })

  // AC12 corrigé le 2026-09-12 (Nathan) : CHANGER DE CÔTÉ intervertit les NOMS et les
  // DISTANCES, et RIEN D'AUTRE. Les billes ne bougent pas — la gauche reste blanche.
  // C'est le pendant exact de CHANGER DE BILLE, qui laisse les joueurs en place.
  it('swaps only names and distances on CHANGER DE CÔTÉ, leaving the balls put', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])
    await typeName(wrapper, 'yellow', 'ANDRE')
    await press(wrapper, ['sheet-confirm'])

    await press(wrapper, ['change-side-button'])

    expect(ballOn(wrapper, 'left')).toBe('white')
    expect(ballOn(wrapper, 'right')).toBe('yellow')
    expect(nameOn(wrapper, 'left').text()).toBe('ANDRE')
    expect(nameOn(wrapper, 'right').text()).toBe('MICHEL')
    expect(distanceOn(wrapper, 'right').text()).toBe('100')
  })

  it('is its own inverse on a second CHANGER DE CÔTÉ', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm', 'change-side-button', 'change-side-button'])

    expect(ballOn(wrapper, 'left')).toBe('white')
    expect(nameOn(wrapper, 'left').text()).toBe('MICHEL')
  })

  // Les deux enchaînés : chaque joueur a changé de place ET de bille — c'est la seule
  // combinaison que ni l'une ni l'autre des deux actions ne donne seule.
  it('combines both settings without losing anyone', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeName(wrapper, 'yellow', 'ANDRE')
    await press(wrapper, ['sheet-confirm', 'change-ball-button', 'change-side-button'])

    expect(ballOn(wrapper, 'left')).toBe('yellow')
    expect(nameOn(wrapper, 'left').text()).toBe('ANDRE')
    expect(ballOn(wrapper, 'right')).toBe('white')
    expect(nameOn(wrapper, 'right').text()).toBe('MICHEL')
  })

  // AC13 : le côté part au store à part ; `player1` reste la bille blanche, donc celui qui
  // ouvre — aucune règle de jeu ne bouge.
  // Seul CHANGER DE BILLE déplace la bille blanche d'un côté à l'autre de l'écran.
  it('starts the game with the white ball seated where it was left', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeName(wrapper, 'yellow', 'ANDRE')
    await press(wrapper, ['sheet-confirm'])
    await setDistances(wrapper)
    await press(wrapper, ['change-ball-button', 'confirm-button'])

    expect(store.whiteSide).toBe('right')
    // MICHEL est resté à gauche mais a pris la jaune : c'est ANDRE qui ouvre.
    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.color).toBe('white')
    expect(store.activePlayer).toBe('player1')
  })

  // CHANGER DE CÔTÉ ne touche pas au côté d'affichage de la bille blanche.
  it('leaves the white ball on its side when the players swap seats', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeName(wrapper, 'yellow', 'ANDRE')
    await press(wrapper, ['sheet-confirm'])
    await setDistances(wrapper)
    await press(wrapper, ['change-side-button', 'confirm-button'])

    expect(store.whiteSide).toBe('left')
    expect(store.player1.name).toBe('ANDRE')
    expect(store.player2.name).toBe('MICHEL')
  })

  // Story 1.10 (AC1) : la distance est obligatoire — sans elle, DÉMARRER n'ouvre qu'une
  // pop-up d'erreur réduite au titre et au CTA (revue de Nathan, 2026-09-10 : pas de
  // message, la saisie qui suit dit d'elle-même de quel joueur il s'agit).
  it('refuses to start while a distance is missing', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button'])

    expect(store.status).toBe('idle')
    expect(errorPrompt(wrapper).exists()).toBe(true)
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('DISTANCE MANQUANTE')
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('RÉGLER LA DISTANCE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')
    expect(wrapper.find('[data-testid="prompt-close"]').exists()).toBe(false)

    await press(wrapper, ['prompt-secondary'])
    await typeDistance(wrapper, 'yellow', [8, 0])
    await press(wrapper, ['dock-confirm', 'confirm-button'])

    expect(store.status).toBe('idle')
    expect(errorPrompt(wrapper).exists()).toBe(true)
  })

  // AC16 : le CTA ouvre DIRECTEMENT le dock sur le champ DISTANCE du premier joueur sans
  // distance — le blanc d'abord, où qu'il soit assis.
  it('opens the dock straight on the distance of the first player without one', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-primary'])

    expect(errorPrompt(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(true)
    expect(
      card(wrapper, sideOfBall(wrapper, 'white'))
        .find('[data-testid="distance-field"]')
        .classes(),
    ).toContain('border-turn-active')
  })

  it('opens the yellow distance straight away when only its own is missing', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm', 'confirm-button', 'prompt-primary'])

    expect(
      card(wrapper, sideOfBall(wrapper, 'yellow'))
        .find('[data-testid="distance-field"]')
        .classes(),
    ).toContain('border-turn-active')
  })

  // AC16 : valider la distance du blanc ouvre directement celle du jaune, sans repasser
  // par DÉMARRER.
  it('chains the yellow distance right after the white one from the error prompt', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-primary'])
    await press(wrapper, ['digit-1', 'digit-0', 'digit-0', 'dock-confirm'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(true)
    expect(
      card(wrapper, sideOfBall(wrapper, 'yellow'))
        .find('[data-testid="distance-field"]')
        .classes(),
    ).toContain('border-turn-active')
    expect(distanceOn(wrapper, sideOfBall(wrapper, 'white')).text()).toBe('100')

    await press(wrapper, ['digit-8', 'digit-0', 'dock-confirm'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
    expect(distanceOn(wrapper, sideOfBall(wrapper, 'yellow')).text()).toBe('80')
    expect(store.status).toBe('idle')

    await press(wrapper, ['confirm-button'])

    expect(store.status).toBe('playing')
    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  // L'enchaînement ne vaut que pour le rattrapage : un champ ouvert à la main ne fait
  // jamais surgir la saisie de l'autre joueur.
  it('does not chain the entries when a field is tapped directly', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
  })

  it('stops chaining when the entry is closed by its cross', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-primary', 'dock-close'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)

    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
  })

  // AC16 : une distance laissée à 0 ne relance pas la même saisie en boucle —
  // l'enchaînement ne passe qu'au joueur SUIVANT, puis s'arrête.
  it('never reopens the same entry in a loop when the distance is left empty', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-primary', 'dock-confirm'])

    expect(
      card(wrapper, sideOfBall(wrapper, 'yellow'))
        .find('[data-testid="distance-field"]')
        .classes(),
    ).toContain('border-turn-active')

    await press(wrapper, ['dock-confirm'])

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
  })

  it('starts once both distances are set', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-primary'])
    await press(wrapper, ['digit-1', 'digit-0', 'digit-0', 'dock-confirm'])
    await press(wrapper, ['digit-8', 'digit-0', 'dock-confirm', 'confirm-button'])

    expect(store.status).toBe('playing')
    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player2.name).toBe('JOUEUR 2')
    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  it('closes the error prompt on ANNULER without doing anything', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button', 'prompt-secondary'])

    expect(errorPrompt(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="numeric-pad-dock"]').exists()).toBe(false)
    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(true)
  })

  it('forgets the error prompt when the step is abandoned', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await press(wrapper, ['confirm-button'])
    expect(errorPrompt(wrapper).exists()).toBe(true)

    await goBack(wrapper)
    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(errorPrompt(wrapper).exists()).toBe(false)
  })

  // Handicap : chaque joueur saisit le sien, séparément.
  it('carries each handicap to its own player when the game starts', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await press(wrapper, ['confirm-button'])

    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  // AC4 : une distance déjà réglée est REMPLACÉE à la première frappe, pas complétée —
  // sinon un réglage à 3 chiffres serait inéditable.
  it('replaces an already set distance on the first keystroke', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])
    await typeDistance(wrapper, 'white', [4, 0])
    await press(wrapper, ['dock-confirm'])

    expect(distanceOn(wrapper, 'left').text()).toBe('40')
  })

  // Rouvrir un champ déjà réglé doit y retrouver sa valeur, pas repartir de zéro.
  it('reopens a field on the value already set for it', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await focusField(wrapper, 'white', 'name')
    await press(wrapper, ['key-backspace'])

    expect(nameOn(wrapper, 'left').text()).toBe('MICHE')
  })

  // P8 : `back()` doit REFERMER la saisie, pas seulement la masquer par le garde `step` —
  // sinon elle se rouvre d'elle-même au retour sur l'étape.
  it('closes the running entry when the step is abandoned', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await focusField(wrapper, 'white', 'name')
    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').exists()).toBe(true)

    await goBack(wrapper)
    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').exists()).toBe(false)
  })

  // P9 : le libellé d'attente doit se distinguer d'un nom réellement saisi.
  it('dims the placeholder name until the player has named themselves', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    expect(nameOn(wrapper, 'left').classes()).toContain('opacity-35')

    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])

    expect(nameOn(wrapper, 'left').classes()).not.toContain('opacity-35')
  })

  // Même défaut que celui corrigé sur `resetGame()` en revue de la Story 1.3 : un réglage
  // saisi pour un mode abandonné ne doit pas être silencieusement reconduit. Depuis la
  // 10.3, c'est ANNULER qui efface — RETOUR, lui, conserve (AC2).
  it('forgets names and handicaps when the setup is cancelled', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await typeName(wrapper, 'white', 'MICHEL')
    await press(wrapper, ['sheet-confirm'])
    await typeDistance(wrapper, 'white', [1, 0, 0])
    await press(wrapper, ['dock-confirm'])
    await wrapper.find('[data-testid="sidebar-item-cancel"]').trigger('pointerdown')
    await goToPlayersStep(wrapper, 'cadre-47-2')

    expect(nameOn(wrapper, 'left').text()).toBe('NOM')
    expect(distanceOn(wrapper, 'left').text()).toBe('DISTANCE')

    // Distance obligatoire (1.10) : d'autres valeurs, pour prouver que 100 est oublié.
    await typeDistance(wrapper, 'white', [5, 0])
    await press(wrapper, ['dock-confirm'])
    await typeDistance(wrapper, 'yellow', [5, 0])
    await press(wrapper, ['dock-confirm', 'confirm-button'])

    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player1.targetScore).toBe(50)
  })

  // ANNULER remet aussi les billes et les côtés d'aplomb : rien ne doit survivre.
  it('seats the white ball back on the left after a cancel', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await press(wrapper, ['change-ball-button'])
    expect(ballOn(wrapper, 'left')).toBe('yellow')

    await wrapper.find('[data-testid="sidebar-item-cancel"]').trigger('pointerdown')
    await goToPlayersStep(wrapper)

    expect(ballOn(wrapper, 'left')).toBe('white')
  })
})
