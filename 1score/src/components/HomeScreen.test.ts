import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeScreen from './HomeScreen.vue'
import ModeTile from './ModeTile.vue'
import PlayerSetupModal from './PlayerSetupModal.vue'
import PromptModal from './PromptModal.vue'
import { useGameStore } from '../stores/useGameStore'

// Depuis la 10.2, les trois cadres ne sont plus des tuiles mais les commandes de la
// pop-up ouverte par la tuile CADRE ; les autres modes gardent leur tuile.
async function goToPlayersStep(wrapper: ReturnType<typeof mount>, mode = 'libre') {
  await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
  if (mode.startsWith('cadre-')) {
    await wrapper.find('[data-testid="mode-cadre"]').trigger('pointerdown')
    await wrapper.find(`[data-testid="prompt-action-${mode}"]`).trigger('pointerdown')
    return
  }
  await wrapper.find(`[data-testid="mode-${mode}"]`).trigger('pointerdown')
}

// Les testids de la modale (`name-field`, `digit-*`, `key-*`) ne doivent être cherchés que
// dans la modale : les viser depuis le wrapper racine parcourrait aussi l'écran derrière.
function setupModal(wrapper: ReturnType<typeof mount>) {
  return wrapper.findComponent(PlayerSetupModal)
}

async function openSetup(wrapper: ReturnType<typeof mount>, player: 'player1' | 'player2') {
  await wrapper.find(`[data-testid="${player}-zone"]`).trigger('pointerdown')
}

async function pressInModal(wrapper: ReturnType<typeof mount>, testids: string[]) {
  for (const testid of testids) {
    await setupModal(wrapper).find(`[data-testid="${testid}"]`).trigger('pointerdown')
  }
}

// Le handicap vit derrière son propre champ : il faut le cibler avant de taper.
async function typeHandicap(wrapper: ReturnType<typeof mount>, digits: number[]) {
  await pressInModal(wrapper, ['distance-field', ...digits.map((d) => `digit-${d}`)])
}

async function typeName(wrapper: ReturnType<typeof mount>, name: string) {
  await pressInModal(wrapper, [
    'name-field',
    ...[...name.toUpperCase()].map((c) => (c === ' ' ? 'key-space' : `key-${c}`)),
  ])
}

async function validateModal(wrapper: ReturnType<typeof mount>) {
  await setupModal(wrapper).find('[data-testid="setup-confirm-button"]').trigger('pointerdown')
}

// Depuis la 1.10, DÉMARRER exige une distance par joueur : les parcours qui ne portent
// pas sur la distance la règlent par ce helper (100 / 80).
async function setDistances(wrapper: ReturnType<typeof mount>) {
  await openSetup(wrapper, 'player1')
  await typeHandicap(wrapper, [1, 0, 0])
  await validateModal(wrapper)
  await openSetup(wrapper, 'player2')
  await typeHandicap(wrapper, [8, 0])
  await validateModal(wrapper)
}

function errorPrompt(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('[data-testid="prompt-modal"]')
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
    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(true)
  })

  // Un retour visible mais inerte sur le tout premier écran est un piège pour la cible
  // « pas de formation ». Depuis la 10.2, les DEUX premiers écrans sont sous la coquille
  // de l'accueil : plus de barre basse, le retour vit dans la barre latérale.
  it('hides the bottom back button until the players step', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(false)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(false)

    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(true)
  })

  // Story 10.1 puis 10.2 : la barre latérale et son logo tiennent l'accueil ET la
  // sélection JDS ; l'étape joueurs garde l'ancienne coquille jusqu'à la 10.3.
  it('shows the sidebar and its logo until the players step', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="1Score"]').exists()).toBe(true)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('img[alt="1Score"]').exists()).toBe(true)

    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(false)
    expect(wrapper.find('img[alt="1Score"]').exists()).toBe(false)
  })

  it('does not render the bottom action bar before the players step', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('[data-testid="action-bar"]').exists()).toBe(false)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    expect(wrapper.find('[data-testid="action-bar"]').exists()).toBe(false)

    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="action-bar"]').exists()).toBe(true)
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

  it('starts a game with the chosen sub-mode and default names', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper, 'cadre-47-2')
    await setDistances(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.mode).toBe('cadre-47-2')
    expect(store.status).toBe('playing')
    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player2.name).toBe('JOUEUR 2')
  })

  // L'ancien test « uppercases the name » ne pouvait pas échouer : le clavier n'émet que des
  // majuscules. Ce qui mérite d'être verrouillé de bout en bout, c'est qu'aucune suite
  // d'espaces ne parvienne au store — la garde vit dans la modale.
  it('never lets a run of spaces reach the store', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await openSetup(wrapper, 'player1')
    await pressInModal(wrapper, ['name-field', 'key-M', 'key-space', 'key-space', 'key-A'])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('M A')
  })

  it('falls back to the default name when nothing is typed', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await openSetup(wrapper, 'player2')
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player2.name).toBe('JOUEUR 2')
  })

  it('trims a trailing space from the typed name', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await setDistances(wrapper)
    await openSetup(wrapper, 'player1')
    await typeName(wrapper, 'MICHEL ')
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('MICHEL')
  })

  // Chaque zone joueur est la porte d'entrée de son propre réglage.
  it('opens the setup modal for the ball whose zone is pressed', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    expect(setupModal(wrapper).exists()).toBe(false)

    await openSetup(wrapper, 'player2')

    expect(setupModal(wrapper).exists()).toBe(true)
    expect(setupModal(wrapper).props('color')).toBe('yellow')
  })

  it('opens the white ball modal from the left zone', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')

    expect(setupModal(wrapper).props('color')).toBe('white')
  })

  it('shows the confirmed name and handicap on the zone', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    expect(wrapper.find('[data-testid="player1-target"]').exists()).toBe(false)

    await openSetup(wrapper, 'player1')
    await typeName(wrapper, 'MICHEL')
    await typeHandicap(wrapper, [1, 0, 0])
    await validateModal(wrapper)

    expect(setupModal(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="player1-name"]').text()).toBe('MICHEL')
    expect(wrapper.find('[data-testid="player1-target"]').text()).toBe('100')
  })

  it('discards the modal input when it is closed by the cross', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [1, 0, 0])
    await setupModal(wrapper).find('[data-testid="modal-close-button"]').trigger('pointerdown')

    expect(setupModal(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="player1-target"]').exists()).toBe(false)
  })

  // Story 1.10 (AC1) : la distance est obligatoire — sans elle, DÉMARRER n'ouvre qu'une
  // pop-up d'erreur réduite au titre et au CTA (revue de Nathan, 2026-09-10 : pas de
  // message, la modale qui suit dit d'elle-même de quel joueur il s'agit). Remplace
  // « starts with default names and no handicap when no zone is ever pressed » (1.4).
  it('refuses to start while a distance is missing', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.status).toBe('idle')
    expect(errorPrompt(wrapper).exists()).toBe(true)
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('DISTANCE MANQUANTE')
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('RÉGLER LA DISTANCE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')
    expect(wrapper.find('[data-testid="prompt-close"]').exists()).toBe(false)

    await wrapper.find('[data-testid="prompt-secondary"]').trigger('pointerdown')
    await openSetup(wrapper, 'player2')
    await typeHandicap(wrapper, [8, 0])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.status).toBe('idle')
    expect(errorPrompt(wrapper).exists()).toBe(true)
  })

  it('opens the setup of the first player without distance from the error prompt', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')

    expect(errorPrompt(wrapper).exists()).toBe(false)
    expect(setupModal(wrapper).exists()).toBe(true)
    expect(setupModal(wrapper).props('color')).toBe('white')
    expect(setupModal(wrapper).find('[data-testid="distance-field"]').classes()).toContain(
      'border-turn-active',
    )
    expect(setupModal(wrapper).find('[data-testid="digit-5"]').exists()).toBe(true)
  })

  it('opens the yellow setup straight from the error prompt when only its distance is missing', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [1, 0, 0])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')

    expect(setupModal(wrapper).props('color')).toBe('yellow')
    expect(setupModal(wrapper).find('[data-testid="distance-field"]').classes()).toContain(
      'border-turn-active',
    )
  })

  // Revue de Nathan (2026-09-10) : depuis le CTA, les modales s'enchaînent — valider la
  // distance du blanc ouvre directement celle du jaune, sans repasser par DÉMARRER.
  it('chains the yellow distance right after the white one from the error prompt', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')
    await pressInModal(wrapper, ['digit-1', 'digit-0', 'digit-0'])
    await validateModal(wrapper)

    expect(setupModal(wrapper).exists()).toBe(true)
    expect(setupModal(wrapper).props('color')).toBe('yellow')
    expect(setupModal(wrapper).find('[data-testid="distance-field"]').classes()).toContain(
      'border-turn-active',
    )
    expect(wrapper.find('[data-testid="player1-target"]').text()).toBe('100')

    await pressInModal(wrapper, ['digit-8', 'digit-0'])
    await validateModal(wrapper)

    expect(setupModal(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="player2-target"]').text()).toBe('80')
    expect(store.status).toBe('idle')

    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.status).toBe('playing')
    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  // L'enchaînement ne vaut que pour le rattrapage : une zone ouverte à la main ne fait
  // jamais surgir la modale de l'autre joueur.
  it('does not chain the modals when a zone is opened directly', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [1, 0, 0])
    await validateModal(wrapper)

    expect(setupModal(wrapper).exists()).toBe(false)
  })

  it('stops chaining when the setup is closed by its cross', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')
    await setupModal(wrapper).find('[data-testid="modal-close-button"]').trigger('pointerdown')

    expect(setupModal(wrapper).exists()).toBe(false)

    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [1, 0, 0])
    await validateModal(wrapper)

    expect(setupModal(wrapper).exists()).toBe(false)
  })

  // Une distance laissée à 0 dans la modale enchaînée ne relance pas la même modale en
  // boucle : l'enchaînement ne passe qu'au joueur SUIVANT.
  it('never reopens the same modal in a loop when the distance is left empty', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')
    await validateModal(wrapper)

    expect(setupModal(wrapper).props('color')).toBe('yellow')

    await validateModal(wrapper)

    expect(setupModal(wrapper).exists()).toBe(false)
  })

  // Une zone touchée directement s'ouvre toujours sur le nom, comme avant.
  it('still opens a zone on the name field when pressed directly', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')
    await setupModal(wrapper).find('[data-testid="modal-close-button"]').trigger('pointerdown')

    await openSetup(wrapper, 'player2')

    expect(setupModal(wrapper).find('[data-testid="name-field"]').classes()).toContain(
      'border-turn-active',
    )
  })

  it('starts once both distances are set', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-primary"]').trigger('pointerdown')
    await pressInModal(wrapper, ['digit-1', 'digit-0', 'digit-0'])
    await validateModal(wrapper)
    await pressInModal(wrapper, ['digit-8', 'digit-0'])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

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
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-secondary"]').trigger('pointerdown')

    expect(errorPrompt(wrapper).exists()).toBe(false)
    expect(setupModal(wrapper).exists()).toBe(false)
    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(true)
  })

  it('forgets the error prompt when the step is abandoned', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')
    expect(errorPrompt(wrapper).exists()).toBe(true)

    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(errorPrompt(wrapper).exists()).toBe(false)
  })

  // Handicap : chaque joueur saisit le sien, séparément.
  it('carries each handicap to its own player when the game starts', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [1, 0, 0])
    await validateModal(wrapper)
    await openSetup(wrapper, 'player2')
    await typeHandicap(wrapper, [8, 0])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  // Réouvrir une zone déjà réglée doit y retrouver ses valeurs, pas repartir de zéro.
  it('reopens a zone on the values already set for it', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [4, 0])
    await validateModal(wrapper)
    await openSetup(wrapper, 'player1')

    expect(setupModal(wrapper).props('targetScore')).toBe(40)
    expect(setupModal(wrapper).find('[data-testid="distance-value"]').text()).toBe('40')
  })

  // AC#8 porte sur le nom autant que sur la distance : débrancher `:name` laissait
  // auparavant la suite entièrement verte.
  it('reopens a zone on the name already set for it', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeName(wrapper, 'MICHEL')
    await validateModal(wrapper)
    await openSetup(wrapper, 'player1')

    expect(setupModal(wrapper).props('name')).toBe('MICHEL')
    expect(setupModal(wrapper).find('[data-testid="name-value"]').text()).toBe('MICHEL')
  })

  // P8 : `back()` doit refermer la modale, pas seulement la masquer par le garde `step`.
  it('closes the setup modal when the step is abandoned', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    expect(setupModal(wrapper).exists()).toBe(true)

    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')

    expect(setupModal(wrapper).exists()).toBe(false)
  })

  // P9 : le libellé d'attente doit se distinguer d'un nom réellement saisi.
  it('dims the placeholder name until the player has named themselves', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    expect(wrapper.find('[data-testid="player1-name"]').classes()).toContain('opacity-40')

    await openSetup(wrapper, 'player1')
    await typeName(wrapper, 'MICHEL')
    await validateModal(wrapper)

    expect(wrapper.find('[data-testid="player1-name"]').classes()).not.toContain('opacity-40')
  })

  // Même défaut que celui corrigé sur `resetGame()` en revue de la Story 1.3 : un réglage
  // saisi pour un mode abandonné ne doit pas être silencieusement reconduit.
  it('forgets names and handicaps when the mode is abandoned', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await openSetup(wrapper, 'player1')
    await typeName(wrapper, 'MICHEL')
    await typeHandicap(wrapper, [1, 0, 0])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-cadre"]').trigger('pointerdown')
    await wrapper.find('[data-testid="prompt-action-cadre-47-2"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="player1-name"]').text()).toBe('JOUEUR 1')
    expect(wrapper.find('[data-testid="player1-target"]').exists()).toBe(false)

    // Distance obligatoire (1.10) : d'autres valeurs, pour prouver que 100 est oublié.
    await openSetup(wrapper, 'player1')
    await typeHandicap(wrapper, [5, 0])
    await validateModal(wrapper)
    await openSetup(wrapper, 'player2')
    await typeHandicap(wrapper, [5, 0])
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player1.targetScore).toBe(50)
  })
})
