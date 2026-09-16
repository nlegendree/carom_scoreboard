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
      // Les touches remplissent l'espace offert par leur parent, avec un plancher
      // `--size-key-numeric` (60 px sur tablette, suit la grille fluide — Story 11.1) sur
      // les deux axes — l'exception UX-DR8 des claviers intégrés, et non
      // `--size-touch-target`. Vérifié à la passe visuelle de la Story 1.5 : un plancher
      // de 90px en largeur exige 302px pour trois colonnes, et rognait la 3e colonne dans
      // un panneau joueur en portrait 768x1024.
      expect(key.classes()).toContain('min-w-(--size-key-numeric)')
      expect(key.classes()).toContain('min-h-(--size-key-numeric)')
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
