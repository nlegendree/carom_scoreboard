import { describe, it, expect } from 'vitest'
import source from './AlphaKeyboardSheet.vue?raw'
import { mount } from '@vue/test-utils'
import AlphaKeyboardSheet from './AlphaKeyboardSheet.vue'

function press(wrapper: ReturnType<typeof mount>, testid: string) {
  return wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
}

function sheet(props: { value: string; ball?: 'white' | 'yellow' }) {
  return mount(AlphaKeyboardSheet, { props: { ball: 'white', ...props } })
}

describe('AlphaKeyboardSheet', () => {
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

  it('validates from its right CTA and abandons from its cross', async () => {
    const wrapper = sheet({ value: 'JEAN' })

    await press(wrapper, 'sheet-confirm')
    await press(wrapper, 'sheet-close')

    expect(wrapper.emitted('validate')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Revue de rendu du 2026-09-12 : même traitement que la pop-up du pavé — le clavier
  // intégré est temporaire, il ne vaut pas la peine de faire refluer la page autour.
  it('renders as a pop-up over the screen, with a blurred backdrop', () => {
    const overlay = sheet({ value: '' })

    expect(overlay.classes()).toContain('fixed')
    expect(overlay.classes()).toContain('backdrop-blur-md')
    expect(overlay.find('[data-testid="sheet-card"]').exists()).toBe(true)
  })

  // Le champ de saisie est calé ENTRE la croix et VALIDER, avec le rappel de bille.
  it('shows the name being typed between the cross and VALIDER, with its ball', () => {
    const wrapper = sheet({ value: 'MICHEL', ball: 'yellow' })

    expect(wrapper.find('[data-testid="sheet-value"]').text()).toBe('MICHEL')
    expect(wrapper.find('header span[aria-hidden="true"]').classes()).toContain(
      'bg-player-yellow',
    )
  })

  it('shows a dimmed placeholder while nothing has been typed', () => {
    const value = sheet({ value: '' }).find('[data-testid="sheet-value"]')

    expect(value.text()).toBe('JOUEUR')
    expect(value.classes().join(' ')).toContain('/25')
  })

  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
