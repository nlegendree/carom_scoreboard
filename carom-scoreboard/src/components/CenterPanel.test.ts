import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CenterPanel from './CenterPanel.vue'
import ShotClock from './ShotClock.vue'
import { SHOT_CLOCK_SECONDS } from '../composables/useTimer'

// `secondsRemaining: null` = partie JDS, sans chrono (Story 2.1).
const baseProps = {
  repriseNumber: 1,
  canUndo: false,
  secondsRemaining: null,
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

  it('emits undo when there is something to undo', async () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, canUndo: true } })
    const undo = wrapper.find('[data-testid="undo-button"]')

    expect(undo.attributes('disabled')).toBeUndefined()
    await undo.trigger('pointerdown')

    expect(wrapper.emitted('undo')).toHaveLength(1)
  })

  // Décision du 2026-09-09 (Story 1.7) : un mot, pas de glyphe — `↩` et `⇄` retirés —
  // et `REPRISE` abrégé en `REP`. L'égalité STRICTE est voulue : un `toContain`
  // laisserait passer un pictogramme résiduel.
  it('labels ANNULER and ÉCHANGER with their word only, and REP above the counter', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.find('[data-testid="undo-button"]').text()).toBe('ANNULER')
    expect(wrapper.find('[data-testid="swap-players-button"]').text()).toBe('ÉCHANGER')
    expect(wrapper.find('[data-testid="reprise-label"]').text()).toBe('REP')
    expect(wrapper.text()).not.toContain('REPRISE')
  })

  // --- Story 2.1 : chrono de tir du 3 Bandes ---

  it('shows no shot clock when no countdown is provided', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.findComponent(ShotClock).exists()).toBe(false)
  })

  it('mounts the shot clock with the countdown and its 40s scale', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 40 } })
    const clock = wrapper.findComponent(ShotClock)

    expect(clock.exists()).toBe(true)
    expect(clock.props('secondsRemaining')).toBe(40)
    expect(clock.props('totalSeconds')).toBe(SHOT_CLOCK_SECONDS)
  })

  // AC7 : le chrono à 0 reste affiché, anneau vide — il ne disparaît pas.
  it('keeps the shot clock mounted at zero', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 0 } })

    expect(wrapper.findComponent(ShotClock).exists()).toBe(true)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('0')
  })

  it('stacks the shot clock under REP and above ANNULER', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 40 } })
    const order = ['reprise-number', 'shot-clock', 'undo-button', 'swap-players-button'].map(
      (testid) => wrapper.find(`[data-testid="${testid}"]`).element,
    )

    for (let i = 1; i < order.length; i += 1) {
      expect(
        order[i - 1]!.compareDocumentPosition(order[i]!) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    }
  })
})
