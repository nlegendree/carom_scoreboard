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

  // DT4 : les accents restants des prénoms français, plus le tiret et l'apostrophe.
  it('emits the character of every added accent and sign key', async () => {
    const wrapper = mount(AlphaKeyboard)

    for (const testid of ['key-Ë', 'key-Ï', 'key-Î', 'key-Ô', 'key-Û', 'key-hyphen', 'key-apostrophe']) {
      await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
    }

    expect(wrapper.emitted('input')).toEqual([['Ë'], ['Ï'], ['Î'], ['Ô'], ['Û'], ['-'], ["'"]])
  })

  // AC7 : chaque caractère de ces prénoms a sa touche, espace mis à part.
  it.each(['JEAN-PIERRE', "D'ARTAGNAN", 'JOËL', 'ANAÏS', 'BENOÎT', 'JÉRÔME'])(
    'can spell %s',
    (name) => {
      const wrapper = mount(AlphaKeyboard)
      const TESTIDS: Record<string, string> = { '-': 'key-hyphen', "'": 'key-apostrophe', ' ': 'key-space' }

      for (const char of name) {
        expect(wrapper.find(`[data-testid="${TESTIDS[char] ?? `key-${char}`}"]`).exists()).toBe(true)
      }
    },
  )

  // UX-DR54 : le clavier reste muet — ni buffer, ni plafond, ni timer. L'hôte porte la règle.
  it('keeps no internal state at all', () => {
    expect(source).not.toContain('ref(')
    expect(source).not.toContain('computed(')
    expect(source).not.toContain('watch(')
  })

  it('emits a space from the space bar', async () => {
    const wrapper = mount(AlphaKeyboard)

    await wrapper.find('[data-testid="key-space"]').trigger('pointerdown')

    expect(wrapper.emitted('input')).toEqual([[' ']])
  })

  // RESET : tout effacer d'un coup, sans passer par N retours arrière.
  it('emits clear from the reset key, without any character', async () => {
    const wrapper = mount(AlphaKeyboard)

    await wrapper.find('[data-testid="key-reset"]').trigger('pointerdown')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('input')).toBeUndefined()
    expect(wrapper.emitted('backspace')).toBeUndefined()
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
