import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node à `src/`, et on ne les y ajoute pas pour un seul test.
import source from './ScoreEntryModal.vue?raw'
import ScoreEntryModal from './ScoreEntryModal.vue'
import { MAX_SCORE_DIGITS } from '../stores/useGameStore'

function mountModal(currentInput = '') {
  return mount(ScoreEntryModal, { props: { color: 'white' as const, name: 'MICHEL', currentInput } })
}

describe('ScoreEntryModal', () => {
  // `navigator.vibrate` est absent de happy-dom : on l'installe pour observer l'haptique,
  // et on le retire après chaque test pour ne pas contaminer les autres fichiers.
  const vibrate = vi.fn()

  beforeEach(() => {
    vibrate.mockClear()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    delete (navigator as Partial<Navigator>).vibrate
  })

  it('emits the pressed digit on pointerdown', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-testid="digit-7"]').trigger('pointerdown')

    expect(wrapper.emitted('digit')).toEqual([[7]])
  })

  // Le plafond vient de la constante partagée du store, il n'est pas réécrit ici.
  // Timers simulés : un buffer plein arme le compte à rebours dès le montage, et un timer
  // réel survivrait au test.
  it('swallows a keystroke once the ceiling is reached', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('1'.repeat(MAX_SCORE_DIGITS))

    await wrapper.find('[data-testid="digit-4"]').trigger('pointerdown')

    expect(wrapper.emitted('digit')).toBeUndefined()
  })

  // AC6 / AC7 : deux haptiques DISTINCTES — c'est leur différence qui porte le sens.
  it('gives a tap haptic on an accepted keystroke', async () => {
    const wrapper = mountModal()

    await wrapper.find('[data-testid="digit-7"]').trigger('pointerdown')

    expect(vibrate).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenCalledWith(40)
  })

  it('gives a shorter, distinct haptic and a visual pulse on a refused keystroke', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('1'.repeat(MAX_SCORE_DIGITS))
    const value = () => wrapper.find('[data-testid="entry-value"]')
    expect(value().attributes('data-reject')).toBe('0')

    await wrapper.find('[data-testid="digit-4"]').trigger('pointerdown')

    expect(vibrate).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenCalledWith(15)
    expect(value().attributes('data-reject')).toBe('1')
    expect(value().classes()).toContain('animate-input-reject')
  })

  // La pulsation est réservée au refus : elle ne doit pas jouer à l'ouverture, sinon
  // chaque apparition de la pop-up ressemble à une frappe refusée.
  it('does not play the refusal pulse when it opens', () => {
    const wrapper = mountModal('12')

    expect(wrapper.find('[data-testid="entry-value"]').classes()).not.toContain(
      'animate-input-reject',
    )
  })

  // AC6 : accusé de réception visuel, relancé à chaque frappe prise en compte.
  it('flashes on every accepted keystroke and never on an empty entry', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('')
    expect(wrapper.find('[data-testid="input-flash"]').exists()).toBe(false)

    await wrapper.setProps({ currentInput: '4' })
    expect(wrapper.find('[data-testid="input-flash"]').attributes('data-flash')).toBe('1')

    await wrapper.setProps({ currentInput: '45' })
    expect(wrapper.find('[data-testid="input-flash"]').attributes('data-flash')).toBe('2')
  })

  it('paints the running value in the colour of the player being credited', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ScoreEntryModal, {
      props: { color: 'yellow' as const, name: 'ANDRE', currentInput: '' },
    })
    expect(wrapper.find('[data-testid="entry-value"]').classes()).toContain('text-white/25')

    await wrapper.setProps({ currentInput: '3' })

    expect(wrapper.find('[data-testid="entry-value"]').classes()).toContain('text-player-yellow')
  })

  // AC12 : sur une saisie vide, VALIDER ne fait rien — pas même refermer la pop-up.
  it('emits nothing when the validate button is tapped on an empty entry', async () => {
    const wrapper = mountModal('')

    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')

    expect(wrapper.emitted('validate')).toBeUndefined()
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('relays the clear and backspace keys of its pad', async () => {
    const wrapper = mountModal('12')

    await wrapper.find('[data-testid="clear-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="backspace-button"]').trigger('pointerdown')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('backspace')).toHaveLength(1)
  })

  it('tells its pad whether an entry is in progress', async () => {
    const wrapper = mountModal('')
    expect(wrapper.find('[data-testid="clear-button"]').text()).toBe('AC')

    await wrapper.setProps({ currentInput: '4' })
    expect(wrapper.find('[data-testid="clear-button"]').text()).toBe('C')
  })

  // La valeur en cours se lit en grand dans la popup : c'est elle qui remplace l'overlay
  // que le panneau joueur portait avant la refonte.
  it('shows the running value, and a zero placeholder before the first keystroke', async () => {
    const wrapper = mountModal('')
    expect(wrapper.find('[data-testid="entry-value"]').text()).toBe('0')

    await wrapper.setProps({ currentInput: '42' })
    expect(wrapper.find('[data-testid="entry-value"]').text()).toBe('42')
  })

  it('names the player whose series is being entered', () => {
    const wrapper = mountModal()

    expect(wrapper.text()).toContain('MICHEL')
  })

  it('emits validate on pointerdown of the validate button', async () => {
    const wrapper = mountModal('7')

    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')

    expect(wrapper.emitted('validate')).toHaveLength(1)
  })

  // Auto-validation conservée à l'identique après le passage en popup (UX-DR15).
  it('auto-validates after three seconds without a keystroke', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('')

    await wrapper.setProps({ currentInput: '7' })
    vi.advanceTimersByTime(2900)
    expect(wrapper.emitted('validate')).toBeUndefined()

    vi.advanceTimersByTime(100)
    expect(wrapper.emitted('validate')).toHaveLength(1)
  })

  it('restarts the countdown on every new keystroke', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('')

    await wrapper.setProps({ currentInput: '7' })
    vi.advanceTimersByTime(2000)
    await wrapper.setProps({ currentInput: '75' })
    vi.advanceTimersByTime(2000)
    expect(wrapper.emitted('validate')).toBeUndefined()

    vi.advanceTimersByTime(1000)
    expect(wrapper.emitted('validate')).toHaveLength(1)
  })

  it('cancels the countdown when the entry is emptied', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('')

    await wrapper.setProps({ currentInput: '7' })
    await wrapper.setProps({ currentInput: '' })
    vi.advanceTimersByTime(5000)

    expect(wrapper.emitted('validate')).toBeUndefined()
  })

  // Fermer la popup en pleine saisie ne doit laisser aucun timer vivant : sinon la série
  // s'enregistrerait toute seule après la fermeture.
  it('leaves no timer behind when unmounted mid-entry', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal('')

    await wrapper.setProps({ currentInput: '7' })
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('closes on the close button', async () => {
    const wrapper = mountModal('12')

    await wrapper.find('[data-testid="modal-close-button"]').trigger('pointerdown')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Un « tap en dehors » suppose un geste COMPLET sur le voile : appui ET relâchement.
  it('closes on a full tap outside the card', async () => {
    const wrapper = mountModal('12')
    const backdrop = wrapper.find('[data-testid="modal-backdrop"]')

    await backdrop.trigger('pointerdown')
    await backdrop.trigger('pointerup')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // ⚠️ Régression : la popup s'ouvre au `pointerdown` du bouton, et le `pointerup` du
  // MÊME geste retombe sur le voile qui vient d'apparaître sous le doigt. Sans exiger un
  // appui préalable sur le voile, la popup se refermait dès qu'on relâchait le bouton —
  // il fallait garder le doigt appuyé pour la voir.
  it('survives the release of the gesture that opened it', async () => {
    const wrapper = mountModal('')

    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // Un appui commencé DANS la carte et relâché sur le voile (doigt qui glisse) ne doit
  // pas refermer non plus.
  it('does not close when the gesture started inside the card', async () => {
    const wrapper = mountModal('12')

    await wrapper.find('[data-testid="modal-card"]').trigger('pointerdown')
    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // Un appui annulé par le navigateur (paume rejetée) ne doit pas laisser le voile armé :
  // sinon le prochain relâchement venu d'ailleurs jetterait la saisie.
  it('disarms the backdrop on pointercancel', async () => {
    const wrapper = mountModal('12')
    const backdrop = wrapper.find('[data-testid="modal-backdrop"]')

    await backdrop.trigger('pointerdown')
    await backdrop.trigger('pointercancel')
    await backdrop.trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // Multi-touch : une paume posée sur le voile n'arme pas la fermeture au profit d'un
  // autre doigt qui glisserait hors de la carte.
  it('only closes on the release of the pointer that armed it', async () => {
    const wrapper = mountModal('12')
    const backdrop = wrapper.find('[data-testid="modal-backdrop"]')

    await backdrop.trigger('pointerdown', { pointerId: 1 })
    await backdrop.trigger('pointerup', { pointerId: 2 })
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await backdrop.trigger('pointerup', { pointerId: 1 })
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Un tap sur la carte ne doit surtout pas refermer la popup par propagation.
  it('does not close when the card itself is tapped', async () => {
    const wrapper = mountModal('12')

    await wrapper.find('[data-testid="modal-card"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // AR8 : `@pointerdown` partout, à la seule exception documentée du voile, qui ferme au
  // relâchement pour ne pas jeter la saisie dès qu'une paume touche le fond.
  it('never binds a click handler', () => {
    expect(source).not.toContain('@click')
    expect(source).not.toContain('@touchstart')
  })
})
