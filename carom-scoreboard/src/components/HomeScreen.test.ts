import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeScreen from './HomeScreen.vue'
import PlayerSetupModal from './PlayerSetupModal.vue'
import { useGameStore } from '../stores/useGameStore'

async function goToPlayersStep(wrapper: ReturnType<typeof mount>, mode = 'libre') {
  await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
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

describe('HomeScreen', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('opens the sub-mode step for a category holding several modes', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="mode-cadre-47-2"]').exists()).toBe(true)
  })

  it('goes back from the sub-mode step to the category step', async () => {
    const wrapper = mount(HomeScreen)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  it('goes back from the players step to the sub-mode step', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(true)
  })

  // Un retour visible mais inerte sur le tout premier écran est un piège pour la cible
  // « pas de formation » : la barre reste, le bouton disparaît.
  it('hides the back button on the root step only', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(false)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(true)
  })

  it('shows the logo on the home step only', async () => {
    const wrapper = mount(HomeScreen)
    expect(wrapper.find('img[alt="Carom Scoreboard"]').exists()).toBe(true)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')

    expect(wrapper.find('img[alt="Carom Scoreboard"]').exists()).toBe(false)
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

  it('starts a game with the chosen sub-mode and default names', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper, 'cadre-47-2')
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
    await openSetup(wrapper, 'player2')
    await validateModal(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player2.name).toBe('JOUEUR 2')
  })

  it('trims a trailing space from the typed name', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
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

  // Le parcours de la Story 1.3 reste strictement identique quand on ignore les réglages.
  it('starts with default names and no handicap when no zone is ever pressed', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.status).toBe('playing')
    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player2.name).toBe('JOUEUR 2')
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
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
    await wrapper.find('[data-testid="mode-cadre-47-2"]').trigger('pointerdown')

    expect(wrapper.find('[data-testid="player1-name"]').text()).toBe('JOUEUR 1')
    expect(wrapper.find('[data-testid="player1-target"]').exists()).toBe(false)

    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player1.targetScore).toBe(0)
  })
})
