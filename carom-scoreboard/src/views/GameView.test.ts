import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import GameView from './GameView.vue'
import { useGameStore } from '../stores/useGameStore'

describe('GameView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the home screen while idle, then the game once started', async () => {
    const wrapper = mount(GameView)

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(wrapper.findAllComponents({ name: 'PlayerPanel' })).toHaveLength(2)
  })

  it('gives the left panel the white ball and the right panel the yellow one', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[0]!.props('player').color).toBe('white')
    expect(panels[1]!.props('player').color).toBe('yellow')
  })

  it('returns to the home screen from the game action bar', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="back-button"]').trigger('pointerdown')

    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  it('swaps players sides when the center panel asks for it', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')

    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[0]!.props('player').name).toBe('ANDRE')
    expect(panels[0]!.props('player').color).toBe('white')
    expect(panels[1]!.props('player').name).toBe('MICHEL')
  })

  // AC#7 : avec des distances dissociées, la distance affichée suit le joueur d'un côté
  // à l'autre — la bille, elle, reste attachée au côté.
  it('carries each displayed distance with its player when sides are swapped', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })
    await wrapper.vm.$nextTick()

    const shown = () =>
      wrapper.findAllComponents({ name: 'PlayerPanel' }).map((panel) =>
        panel.find('[data-testid="target-score"]').text(),
      )

    expect(shown()).toEqual(['100', '80'])

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')

    expect(shown()).toEqual(['80', '100'])
  })

  // Distance libre : aucun emplacement de distance sur les panneaux (NFR12).
  it('shows no distance at all when the game was started without a format', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-testid="target-score"]')).toHaveLength(0)
  })
})
