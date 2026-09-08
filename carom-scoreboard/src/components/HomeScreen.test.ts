import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomeScreen from './HomeScreen.vue'
import { useGameStore } from '../stores/useGameStore'

async function goToPlayersStep(wrapper: ReturnType<typeof mount>, mode = 'libre') {
  await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
  await wrapper.find(`[data-testid="mode-${mode}"]`).trigger('pointerdown')
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

  it('uppercases the typed names when starting the game', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="player1-name-input"]').setValue('michel')
    await wrapper.find('[data-testid="player2-name-input"]').setValue('andré')
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('MICHEL')
    expect(store.player2.name).toBe('ANDRÉ')
  })

  // La mise en majuscule est visuelle (classe CSS) pour ne pas réécrire l'input à chaque
  // frappe, ce qui replacerait le caret en fin de champ.
  it('renders the name fields in uppercase without rewriting the input value', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)
    const input = wrapper.find('[data-testid="player1-name-input"]')
    await input.setValue('michel')

    expect(input.classes()).toContain('uppercase')
    expect((input.element as HTMLInputElement).value).toBe('michel')
  })

  it('caps the name fields at 20 characters', async () => {
    const wrapper = mount(HomeScreen)

    await goToPlayersStep(wrapper)

    expect(wrapper.find('[data-testid="player1-name-input"]').attributes('maxlength')).toBe('20')
    expect(wrapper.find('[data-testid="player2-name-input"]').attributes('maxlength')).toBe('20')
  })

  it('falls back to the default names when a field is emptied or blank', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="player1-name-input"]').setValue('')
    await wrapper.find('[data-testid="player2-name-input"]').setValue('   ')
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('JOUEUR 1')
    expect(store.player2.name).toBe('JOUEUR 2')
  })

  it('trims surrounding whitespace from the typed names', async () => {
    const wrapper = mount(HomeScreen)
    const store = useGameStore()

    await goToPlayersStep(wrapper)
    await wrapper.find('[data-testid="player1-name-input"]').setValue('  michel  ')
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(store.player1.name).toBe('MICHEL')
  })
})
