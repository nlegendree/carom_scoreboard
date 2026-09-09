import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './NumericPad.vue?raw'
import { mount } from '@vue/test-utils'
import NumericPad from './NumericPad.vue'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

describe('NumericPad', () => {
  it('emits digit with its own value for every key', async () => {
    const wrapper = mount(NumericPad)

    for (const digit of DIGITS) {
      await wrapper.find(`[data-testid="digit-${digit}"]`).trigger('pointerdown')
    }

    expect(wrapper.emitted('digit')).toHaveLength(DIGITS.length)
    expect(wrapper.emitted('digit')).toEqual(DIGITS.map((digit) => [digit]))
  })

  it('emits clear when the clear key is pressed', async () => {
    const wrapper = mount(NumericPad)

    await wrapper.find('[data-testid="clear-button"]').trigger('pointerdown')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('digit')).toBeUndefined()
  })

  // Convention de la calculatrice iOS : AC tant que rien n'est saisi, C ensuite.
  it('reads AC while nothing is entered and C once something is', () => {
    expect(mount(NumericPad).find('[data-testid="clear-button"]').text()).toBe('AC')
    expect(
      mount(NumericPad, { props: { hasInput: true } }).find('[data-testid="clear-button"]').text(),
    ).toBe('C')
  })

  it('emits backspace without clearing everything', async () => {
    const wrapper = mount(NumericPad)

    await wrapper.find('[data-testid="backspace-button"]').trigger('pointerdown')

    expect(wrapper.emitted('backspace')).toHaveLength(1)
    expect(wrapper.emitted('clear')).toBeUndefined()
    expect(wrapper.emitted('digit')).toBeUndefined()
  })

  it('emits nothing at all while disabled', async () => {
    const wrapper = mount(NumericPad, { props: { disabled: true } })

    await wrapper.find('[data-testid="digit-7"]').trigger('pointerdown')
    await wrapper.find('[data-testid="clear-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="backspace-button"]').trigger('pointerdown')

    expect(wrapper.emitted('digit')).toBeUndefined()
    expect(wrapper.emitted('clear')).toBeUndefined()
    expect(wrapper.emitted('backspace')).toBeUndefined()
    expect(wrapper.find('[data-testid="digit-7"]').attributes('disabled')).toBeDefined()
  })

  it('sizes every key for touch', () => {
    const wrapper = mount(NumericPad)

    for (const testid of [...DIGITS.map((d) => `digit-${d}`), 'clear-button', 'backspace-button']) {
      const key = wrapper.find(`[data-testid="${testid}"]`)
      // Les touches remplissent la hauteur offerte par la modale ; seule la largeur est
      // garantie en dur, la hauteur ayant un plancher plus bas pour tenir en 768 px.
      expect(key.classes()).toContain('min-w-[var(--size-touch-target)]')
      expect(key.classes()).toContain('h-full')
    }
  })

  // AR8 : `@pointerdown` seul, jamais `@click` — un `@click` réintroduirait le délai
  // de 300 ms sur iPad. happy-dom ne peut pas le détecter, on lit donc la source.
  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
