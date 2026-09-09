import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CenterPanel from './CenterPanel.vue'

const baseProps = {
  repriseNumber: 1,
  canUndo: false,
} as const

describe('CenterPanel', () => {
  it('displays the reprise number', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, repriseNumber: 3 } })

    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('3')
  })

  // Le mode de jeu a quitté la colonne centrale le 2026-09-09 : il est choisi au
  // démarrage et n'évolue pas, la colonne est réservée à ce qui change en cours de partie.
  it('no longer displays the game mode', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.text()).not.toContain('LIBRE')
    expect(wrapper.text()).not.toContain('CADRE')
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

  // Règle changée le 2026-09-09 : le bouton reste disponible TOUTE la partie, y compris
  // une fois des séries enregistrées, pour pouvoir corriger un côté à tout moment.
  it('keeps the swap button available once series have been recorded', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, repriseNumber: 4, canUndo: true } })

    expect(wrapper.find('[data-testid="swap-players-button"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="swap-players-button"]').text()).toContain('ÉCHANGER')
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
