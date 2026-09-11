import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './AlphaKeyboard.vue?raw'
import { mount } from '@vue/test-utils'
import AlphaKeyboard from './AlphaKeyboard.vue'

describe('AlphaKeyboard', () => {
  it('emits the character of every letter key pressed', async () => {
    const wrapper = mount(AlphaKeyboard)

    for (const char of ['A', 'M', 'Z', 'Ç']) {
      await wrapper.find(`[data-testid="key-${char}"]`).trigger('pointerdown')
    }

    expect(wrapper.emitted('input')).toEqual([['A'], ['M'], ['Z'], ['Ç']])
  })

  // Les joueurs doivent pouvoir écrire « MICHEL 2 » sans changer de mode.
  it('offers the digits on the keyboard itself', async () => {
    const wrapper = mount(AlphaKeyboard)

    await wrapper.find('[data-testid="key-2"]').trigger('pointerdown')
    await wrapper.find('[data-testid="key-0"]').trigger('pointerdown')

    expect(wrapper.emitted('input')).toEqual([['2'], ['0']])
  })

  // Prénoms français : ANDRÉ, FRANÇOIS, HÉLÈNE.
  it('offers the accented letters used by French first names', () => {
    const wrapper = mount(AlphaKeyboard)

    for (const char of ['É', 'È', 'À', 'Ç']) {
      expect(wrapper.find(`[data-testid="key-${char}"]`).exists()).toBe(true)
    }
  })

  it('emits a space from the space bar', async () => {
    const wrapper = mount(AlphaKeyboard)

    await wrapper.find('[data-testid="key-space"]').trigger('pointerdown')

    expect(wrapper.emitted('input')).toEqual([[' ']])
  })

  it('emits backspace without any character', async () => {
    const wrapper = mount(AlphaKeyboard)

    await wrapper.find('[data-testid="key-backspace"]').trigger('pointerdown')

    expect(wrapper.emitted('backspace')).toHaveLength(1)
    expect(wrapper.emitted('input')).toBeUndefined()
  })

  it('emits nothing at all while disabled', async () => {
    const wrapper = mount(AlphaKeyboard, { props: { disabled: true } })

    await wrapper.find('[data-testid="key-A"]').trigger('pointerdown')
    await wrapper.find('[data-testid="key-backspace"]').trigger('pointerdown')

    expect(wrapper.emitted('input')).toBeUndefined()
    expect(wrapper.emitted('backspace')).toBeUndefined()
  })

  // AR8 : `@pointerdown` seul, jamais `@click`.
  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
