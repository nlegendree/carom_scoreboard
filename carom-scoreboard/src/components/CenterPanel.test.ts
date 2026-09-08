import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CenterPanel from './CenterPanel.vue'

const baseProps = {
  mode: 'libre',
  repriseNumber: 1,
  canUndo: false,
  canSwapPlayers: true,
} as const

describe('CenterPanel', () => {
  it('displays the mode label and the reprise number', () => {
    const wrapper = mount(CenterPanel, {
      props: { ...baseProps, mode: 'cadre-47-2', repriseNumber: 3 },
    })

    expect(wrapper.text()).toContain('CADRE 47/2')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('3')
  })

  // Le compteur doit rester dans sa colonne : il utilise `text-reprise`, dimensionné pour
  // le cinquième de largeur, et non `text-score` dont le plancher de 120px déborde
  // dès deux chiffres sur tablette.
  it('renders a two-digit reprise number with the column-sized token', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, repriseNumber: 88 } })
    const counter = wrapper.find('[data-testid="reprise-number"]')

    expect(counter.text()).toBe('88')
    expect(counter.classes()).toContain('text-reprise')
    expect(counter.classes()).not.toContain('text-score')
  })

  it('emits swap-players when the swap button is pressed', async () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')

    expect(wrapper.emitted('swap-players')).toHaveLength(1)
  })

  it('hides the swap button once swapping is no longer allowed', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, canSwapPlayers: false } })

    expect(wrapper.find('[data-testid="swap-players-button"]').exists()).toBe(false)
  })

  it('disables the undo button while there is nothing to undo', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.find('[data-testid="undo-button"]').attributes('disabled')).toBeDefined()
  })

  // L'écoute de cet événement arrive avec la Story 1.8 ; l'émission, elle, est déjà contractuelle.
  it('emits undo when there is something to undo', async () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, canUndo: true } })
    const undo = wrapper.find('[data-testid="undo-button"]')

    expect(undo.attributes('disabled')).toBeUndefined()
    await undo.trigger('pointerdown')

    expect(wrapper.emitted('undo')).toHaveLength(1)
  })
})
