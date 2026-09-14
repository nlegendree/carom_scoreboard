import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node à `src/`, et on ne les y ajoute pas pour un seul test.
import source from './ScoreEntryDock.vue?raw'
import ScoreEntryDock from './ScoreEntryDock.vue'
import { MAX_SCORE_DIGITS } from '../stores/useGameStore'
import type { TableSide } from '../types/game'

function mountDock(currentInput = '', align: TableSide = 'left') {
  return mount(ScoreEntryDock, { props: { currentInput, align } })
}

// Cas migrés de `ScoreEntryModal.test.ts` (Story 1.5), supprimé avec sa pop-up centrée par
// la Story 10.4 : les SÉMANTIQUES de saisie ne changent pas, seule la forme de la pop-up
// change. Ceux qui portaient sur l'en-tête (croix, bille, nom) et sur la valeur affichée
// DANS la pop-up ont disparu avec eux — la valeur se lit désormais sur la carte du joueur,
// et ses cas vivent dans `PlayerPanel.test.ts`.
describe('ScoreEntryDock', () => {
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
    const wrapper = mountDock()

    await wrapper.find('[data-testid="digit-7"]').trigger('pointerdown')

    expect(wrapper.emitted('digit')).toEqual([[7]])
  })

  // Le plafond vient de la constante partagée du store, il n'est pas réécrit ici.
  // ⚠️ C'est `MAX_SCORE_DIGITS` (série, 3 chiffres, FR7) et non `MAX_TARGET_SCORE`
  // (distance, 999) : confondre les deux plafonnerait les séries à 999.
  // Timers simulés : un buffer plein arme le compte à rebours dès le montage, et un timer
  // réel survivrait au test.
  it('swallows a keystroke once the ceiling is reached', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('1'.repeat(MAX_SCORE_DIGITS))

    await wrapper.find('[data-testid="digit-4"]').trigger('pointerdown')

    expect(wrapper.emitted('digit')).toBeUndefined()
  })

  // AC6 / AC7 de la 1.5 : deux haptiques DISTINCTES — c'est leur différence qui porte le sens.
  it('gives a tap haptic on an accepted keystroke', async () => {
    const wrapper = mountDock()

    await wrapper.find('[data-testid="digit-7"]').trigger('pointerdown')

    expect(vibrate).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenCalledWith(40)
  })

  it('gives a shorter, distinct haptic and a visual pulse on a refused keystroke', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('1'.repeat(MAX_SCORE_DIGITS))
    const pad = () => wrapper.find('[data-testid="entry-reject"]')
    expect(pad().attributes('data-reject')).toBe('0')

    await wrapper.find('[data-testid="digit-4"]').trigger('pointerdown')

    expect(vibrate).toHaveBeenCalledTimes(1)
    expect(vibrate).toHaveBeenCalledWith(15)
    expect(pad().attributes('data-reject')).toBe('1')
    expect(pad().classes()).toContain('animate-input-reject')
  })

  // La pulsation est réservée au refus : elle ne doit pas jouer à l'ouverture, sinon
  // chaque apparition de la pop-up ressemble à une frappe refusée.
  it('does not play the refusal pulse when it opens', () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')

    expect(wrapper.find('[data-testid="entry-reject"]').classes()).not.toContain(
      'animate-input-reject',
    )
  })

  it('relays the clear and backspace keys of its pad', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')

    await wrapper.find('[data-testid="clear-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="backspace-button"]').trigger('pointerdown')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('backspace')).toHaveLength(1)
  })

  it('tells its pad whether an entry is in progress', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('')
    expect(wrapper.find('[data-testid="clear-button"]').text()).toBe('AC')

    await wrapper.setProps({ currentInput: '4' })
    expect(wrapper.find('[data-testid="clear-button"]').text()).toBe('C')
  })

  it('emits validate on pointerdown of the validate button', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('7')

    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')

    expect(wrapper.emitted('validate')).toHaveLength(1)
  })

  // AC12 de la 1.5 : sur une saisie vide, VALIDER ne fait rien — pas même refermer.
  it('emits nothing when the validate button is tapped on an empty entry', async () => {
    const wrapper = mountDock('')

    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')

    expect(wrapper.emitted('validate')).toBeUndefined()
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // Modèle 10.3 : `ANNULER` a remplacé la croix dans toutes les pop-ups du produit.
  it('closes on the ANNULER button', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')
    const cancel = wrapper.find('[data-testid="entry-cancel-button"]')

    expect(cancel.text()).toBe('ANNULER')
    await cancel.trigger('pointerdown')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('has no close cross and no ball reminder any more', () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')

    expect(wrapper.find('[data-testid="modal-close-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="entry-value"]').exists()).toBe(false)
  })

  // --- Auto-validation (UX-DR15), reprise à l'identique de la pop-up centrée ---

  it('auto-validates after three seconds without a keystroke', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('')

    await wrapper.setProps({ currentInput: '7' })
    vi.advanceTimersByTime(2900)
    expect(wrapper.emitted('validate')).toBeUndefined()

    vi.advanceTimersByTime(100)
    expect(wrapper.emitted('validate')).toHaveLength(1)
  })

  it('restarts the countdown on every new keystroke', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('')

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
    const wrapper = mountDock('')

    await wrapper.setProps({ currentInput: '7' })
    await wrapper.setProps({ currentInput: '' })
    vi.advanceTimersByTime(5000)

    expect(wrapper.emitted('validate')).toBeUndefined()
  })

  // Fermer la pop-up en pleine saisie ne doit laisser aucun timer vivant : sinon la série
  // s'enregistrerait toute seule après la fermeture.
  it('leaves no timer behind when unmounted mid-entry', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('')

    await wrapper.setProps({ currentInput: '7' })
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  // Le compte à rebours visible est relancé en même temps que le timer, et sa durée vient
  // de la MÊME constante : les deux ne peuvent pas diverger.
  it('replays the visible countdown on every keystroke, and hides it on an empty entry', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('')
    expect(wrapper.find('[data-testid="validate-countdown"]').exists()).toBe(false)

    await wrapper.setProps({ currentInput: '4' })
    const first = wrapper.find('[data-testid="validate-countdown"]')
    expect(first.attributes('style')).toContain('3000ms')

    await wrapper.setProps({ currentInput: '45' })
    expect(wrapper.find('[data-testid="validate-countdown"]').attributes('data-countdown')).not.toBe(
      first.attributes('data-countdown'),
    )
  })

  // --- Voile (modèle `NumericPadDock`, 10.3) ---

  // Un « tap en dehors » suppose un geste COMPLET sur le voile : appui ET relâchement.
  it('closes on a full tap outside the card', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')
    const backdrop = wrapper.find('[data-testid="score-entry-dock"]')

    await backdrop.trigger('pointerdown')
    await backdrop.trigger('pointerup')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // ⚠️ Régression payée en 1.5 : la pop-up s'ouvre au `pointerdown` du CTA, et le
  // `pointerup` du MÊME geste retombe sur le voile qui vient d'apparaître sous le doigt.
  it('survives the release of the gesture that opened it', async () => {
    const wrapper = mountDock('')

    await wrapper.find('[data-testid="score-entry-dock"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('does not close when the gesture started inside the card', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')

    await wrapper.find('[data-testid="score-entry-card"]').trigger('pointerdown')
    await wrapper.find('[data-testid="score-entry-dock"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('disarms the backdrop on pointercancel', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')
    const backdrop = wrapper.find('[data-testid="score-entry-dock"]')

    await backdrop.trigger('pointerdown')
    await backdrop.trigger('pointercancel')
    await backdrop.trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // Multi-touch : une paume posée sur le voile n'arme pas la fermeture au profit d'un
  // autre doigt qui glisserait hors de la carte.
  it('only closes on the release of the pointer that armed it', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')
    const backdrop = wrapper.find('[data-testid="score-entry-dock"]')

    await backdrop.trigger('pointerdown', { pointerId: 1 })
    await backdrop.trigger('pointerup', { pointerId: 2 })
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await backdrop.trigger('pointerup', { pointerId: 1 })
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('does not close when the card itself is tapped', async () => {
    vi.useFakeTimers()
    const wrapper = mountDock('12')

    await wrapper.find('[data-testid="score-entry-card"]').trigger('pointerup')

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // --- Alignement latéral (décision 2 de Nathan, modèle 10.3) ---

  // La pop-up se pose du côté OPPOSÉ à la carte du joueur qui a la main : cette carte
  // reste entièrement visible et nette, et la valeur s'y écrit à vue.
  it('centres itself in the zone left free by the targeted card', () => {
    const left = mountDock('', 'left').find('[data-testid="score-entry-dock"]')
    const right = mountDock('', 'right').find('[data-testid="score-entry-dock"]')

    expect(left.classes()).toContain('pr-[var(--game-popup-inset-right)]')
    expect(right.classes()).toContain('pl-[var(--game-popup-inset-left)]')
    expect(left.classes()).not.toContain('pl-[var(--game-popup-inset-left)]')
    expect(right.classes()).not.toContain('pr-[var(--game-popup-inset-right)]')
  })

  // ⚠️ Voile SANS FLOU : la carte visée doit rester lisible pendant la frappe, puisque la
  // pop-up ne rappelle plus la valeur. Un `backdrop-blur` la rendrait illisible.
  it('dims the background without blurring it', () => {
    const classes = mountDock().find('[data-testid="score-entry-dock"]').classes()

    expect(classes).toContain('bg-black/25')
    expect(classes.join(' ')).not.toContain('backdrop-blur')
  })

  // AR8 : `@pointerdown` partout, à la seule exception documentée du voile, qui ferme au
  // relâchement pour ne pas jeter la saisie dès qu'une paume touche le fond.
  it('never binds a click handler', () => {
    expect(source).not.toContain('@click')
    expect(source).not.toContain('@touchstart')
  })
})
