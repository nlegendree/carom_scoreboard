import { describe, it, expect } from 'vitest'
import source from './AlphaKeyboardSheet.vue?raw'
import { mount } from '@vue/test-utils'
import AlphaKeyboardSheet from './AlphaKeyboardSheet.vue'

function press(wrapper: ReturnType<typeof mount>, testid: string) {
  return wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
}

describe('AlphaKeyboardSheet', () => {
  it('emits the complete new value on every key pressed', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'JEA' } })

    await press(wrapper, 'key-N')

    expect(wrapper.emitted('update')).toEqual([['JEAN']])
  })

  it('appends key after key as the parent feeds the value back', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: '' } })

    await press(wrapper, 'key-A')
    await wrapper.setProps({ value: 'A' })
    await press(wrapper, 'key-Z')

    expect(wrapper.emitted('update')).toEqual([['A'], ['AZ']])
  })

  // Espaces : ils ne se verraient pas, mangeraient le plafond, et `.trim()` les jetterait.
  it('refuses a leading space', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: '' } })

    await press(wrapper, 'key-space')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('refuses a second consecutive space', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'JEAN ' } })

    await press(wrapper, 'key-space')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('accepts a space between two words', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'JEAN' } })

    await press(wrapper, 'key-space')

    expect(wrapper.emitted('update')).toEqual([['JEAN ']])
  })

  // Le plafond porte sur le nom UTILE : un espace de fin ne doit pas bloquer la frappe.
  it('caps the useful name at twenty characters', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'A'.repeat(20) } })

    await press(wrapper, 'key-B')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('still accepts a keystroke at nineteen useful characters', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'A'.repeat(19) } })

    await press(wrapper, 'key-B')

    expect(wrapper.emitted('update')).toEqual([['A'.repeat(19) + 'B']])
  })

  it('drops the last character on backspace', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'JEAN' } })

    await press(wrapper, 'key-backspace')

    expect(wrapper.emitted('update')).toEqual([['JEA']])
  })

  it('emits an unchanged empty value on backspace over an empty name', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: '' } })

    await press(wrapper, 'key-backspace')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  it('validates from its right CTA and abandons from its cross', async () => {
    const wrapper = mount(AlphaKeyboardSheet, { props: { value: 'JEAN' } })

    await press(wrapper, 'sheet-confirm')
    await press(wrapper, 'sheet-close')

    expect(wrapper.emitted('validate')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Décision 3 de Nathan : les cartes restent entières au-dessus, rien n'est recouvert.
  it('renders in the flow, with no backdrop and no overlay positioning', () => {
    expect(source).not.toContain('backdrop')
    expect(source).not.toContain('blur')
    expect(source).not.toContain('fixed')
    expect(source).not.toContain('absolute')
  })

  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
