import { describe, it, expect, vi, beforeEach } from 'vitest'
import source from './AlphaKeyboardSheet.vue?raw'
import { mount } from '@vue/test-utils'
import AlphaKeyboardSheet from './AlphaKeyboardSheet.vue'

// `navigator.vibrate` est absent de happy-dom : on le pose pour observer les retours.
const vibrate = vi.fn()

beforeEach(() => {
  vibrate.mockClear()
  Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
})

function press(wrapper: ReturnType<typeof mount>, testid: string) {
  return wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
}

function sheet(props: { value: string; align?: 'left' | 'right' }) {
  return mount(AlphaKeyboardSheet, { props: { align: 'right', ...props } })
}

describe('AlphaKeyboardSheet', () => {
  // UX-DR54, CLAUDE.md §10 : l'hôte porte les retours — haptique à chaque frappe acceptée,
  // haptique distincte et pulsation au plafond. Manquaient à la livraison de la 10.3 (revue
  // de fin d'Epic 10) : un clavier qui refuse sans rien dire paraît en panne.
  it('answers an accepted key with a tap haptic', async () => {
    const wrapper = sheet({ value: 'JEA' })

    await press(wrapper, 'key-N')

    expect(vibrate).toHaveBeenCalledWith(40)
    expect(wrapper.find('[data-testid="sheet-reject"]').attributes('data-reject')).toBe('0')
  })

  it('answers a key refused at the cap with a reject haptic and a pulse', async () => {
    const wrapper = sheet({ value: 'A'.repeat(20) })

    await press(wrapper, 'key-B')

    expect(wrapper.emitted('update')).toBeUndefined()
    expect(vibrate).toHaveBeenCalledWith(15)
    expect(wrapper.find('[data-testid="sheet-reject"]').attributes('data-reject')).toBe('1')
  })

  // Le plafond se mesure sur ce que la frappe DONNERAIT : « 19 lettres + espace » puis une
  // lettre ferait 21 caractères utiles — refusé. L'espace de fin, lui, passe toujours.
  it('never lets a letter after a trailing space exceed the cap', async () => {
    const wrapper = sheet({ value: `${'A'.repeat(19)} `})

    await press(wrapper, 'key-B')

    expect(wrapper.emitted('update')).toBeUndefined()
    expect(vibrate).toHaveBeenCalledWith(15)
  })

  it('emits the complete new value on every key pressed', async () => {
    const wrapper = sheet({ value: 'JEA' })

    await press(wrapper, 'key-N')

    expect(wrapper.emitted('update')).toEqual([['JEAN']])
  })

  it('appends key after key as the parent feeds the value back', async () => {
    const wrapper = sheet({ value: '' })

    await press(wrapper, 'key-A')
    await wrapper.setProps({ value: 'A' })
    await press(wrapper, 'key-Z')

    expect(wrapper.emitted('update')).toEqual([['A'], ['AZ']])
  })

  // Espaces : ils ne se verraient pas, mangeraient le plafond, et `.trim()` les jetterait.
  it('refuses a leading space', async () => {
    const wrapper = sheet({ value: '' })

    await press(wrapper, 'key-space')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('refuses a second consecutive space', async () => {
    const wrapper = sheet({ value: 'JEAN ' })

    await press(wrapper, 'key-space')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('accepts a space between two words', async () => {
    const wrapper = sheet({ value: 'JEAN' })

    await press(wrapper, 'key-space')

    expect(wrapper.emitted('update')).toEqual([['JEAN ']])
  })

  // Le plafond porte sur le nom UTILE : un espace de fin ne doit pas bloquer la frappe.
  it('caps the useful name at twenty characters', async () => {
    const wrapper = sheet({ value: 'A'.repeat(20) })

    await press(wrapper, 'key-B')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('still accepts a keystroke at nineteen useful characters', async () => {
    const wrapper = sheet({ value: 'A'.repeat(19) })

    await press(wrapper, 'key-B')

    expect(wrapper.emitted('update')).toEqual([['A'.repeat(19) + 'B']])
  })

  it('drops the last character on backspace', async () => {
    const wrapper = sheet({ value: 'JEAN' })

    await press(wrapper, 'key-backspace')

    expect(wrapper.emitted('update')).toEqual([['JEA']])
  })

  it('emits an unchanged empty value on backspace over an empty name', async () => {
    const wrapper = sheet({ value: '' })

    await press(wrapper, 'key-backspace')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  it('clears the whole name from the reset key', async () => {
    const wrapper = sheet({ value: 'JEAN-PIERRE' })

    await press(wrapper, 'key-reset')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  it('validates from its right CTA and abandons from its cross', async () => {
    const wrapper = sheet({ value: 'JEAN' })

    await press(wrapper, 'sheet-confirm')
    await press(wrapper, 'sheet-close')

    expect(wrapper.emitted('validate')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Revue de rendu du 2026-09-12 : pop-up par-dessus l'écran, mais voile SANS FLOU et à
  // peine assombri — la carte qu'on remplit doit rester lisible en face, c'est elle qui
  // affiche la valeur depuis que la pop-up ne la rappelle plus.
  it('renders as a pop-up over the screen, without blurring what is behind', () => {
    const overlay = sheet({ value: '' })

    expect(overlay.classes()).toContain('fixed')
    expect(overlay.classes().join(' ')).not.toContain('backdrop-blur')
    expect(overlay.classes()).toContain('bg-black/25')
    expect(overlay.find('[data-testid="sheet-card"]').exists()).toBe(true)
  })

  // Revue de rendu du 2026-09-12 : la pop-up se range du côté demandé et ne rappelle PLUS
  // le nom — la carte qu'on remplit reste visible en face, c'est elle qui l'affiche.
  // Elle ne se colle pas au bord : elle se centre dans la zone que la carte visée laisse
  // libre, l'inset réservant la bande occupée par cette carte.
  it('centres itself in the space left free by the targeted card', () => {
    const right = sheet({ value: '', align: 'right' })
    const left = sheet({ value: '', align: 'left' })

    expect(right.classes()).toContain('justify-center')
    expect(right.classes()).toContain('pl-[var(--setup-popup-inset-left)]')
    expect(left.classes()).toContain('pr-[var(--setup-popup-inset-right)]')
  })

  it('carries no value readout of its own', () => {
    expect(sheet({ value: 'MICHEL' }).find('[data-testid="sheet-value"]').exists()).toBe(false)
  })

  it('cancels from an ANNULER button, not a cross, rounded like the keys', () => {
    const wrapper = sheet({ value: '' })

    expect(wrapper.find('[data-testid="sheet-close"]').text()).toBe('ANNULER')
    expect(wrapper.find('[data-testid="sheet-close"]').classes()).toContain('rounded-tappable')
    expect(wrapper.find('[data-testid="sheet-confirm"]').classes()).toContain('rounded-tappable')
  })

  it('closes on a complete gesture outside, and ignores a partial one', async () => {
    const wrapper = sheet({ value: 'MICHEL' })

    await wrapper.trigger('pointerup', { pointerId: 1 })
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await wrapper.trigger('pointerdown', { pointerId: 2 })
    await wrapper.trigger('pointerup', { pointerId: 2 })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('ignores a gesture that started on the card itself', async () => {
    const wrapper = sheet({ value: 'MICHEL' })

    await wrapper.find('[data-testid="sheet-card"]').trigger('pointerdown', { pointerId: 3 })
    await wrapper.trigger('pointerup', { pointerId: 3 })

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })

  // AC1 (Story 10.7) : le clavier s'annonce comme un dialogue, nommé par un `aria-label`
  // statique — il n'a aucun titre visible à viser.
  it('exposes the dialog semantics with a static label', () => {
    const backdrop = sheet({ value: '' }).find('[data-testid="alpha-keyboard-sheet"]')

    expect(backdrop.attributes('role')).toBe('dialog')
    expect(backdrop.attributes('aria-modal')).toBe('true')
    expect(backdrop.attributes('aria-label')).toBe('Saisie du nom')
  })

  // AC2 (Story 10.7) : pas de `role="button"` sur le voile, qui porte déjà `role="dialog"`.
  it('never gives the backdrop a button role', () => {
    const wrapper = sheet({ value: '' })

    expect(wrapper.find('[data-testid="alpha-keyboard-sheet"]').attributes('role')).not.toBe('button')
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })

})
