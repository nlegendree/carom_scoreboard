import { describe, it, expect, vi, beforeEach } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './NumericPadDock.vue?raw'
import { mount } from '@vue/test-utils'
import NumericPadDock from './NumericPadDock.vue'

// `navigator.vibrate` est absent de happy-dom : on le pose pour observer les retours.
const vibrate = vi.fn()

beforeEach(() => {
  vibrate.mockClear()
  Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
})

function press(wrapper: ReturnType<typeof mount>, testid: string) {
  return wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
}

describe('NumericPadDock', () => {
  // Le buffer vit dans l'écran, pas dans le dock : c'est la carte qui doit afficher la
  // valeur en direct, et deux buffers divergeraient à la première frappe. Le dock émet
  // donc la nouvelle valeur COMPLÈTE, jamais le seul chiffre frappé.
  it('emits the complete new value, appending as the parent feeds it back', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '' } })

    await press(wrapper, 'digit-4')
    await wrapper.setProps({ value: '4' })
    await press(wrapper, 'digit-7')

    expect(wrapper.emitted('update')).toEqual([['4'], ['47']])
  })

  // Une distance ouverte sur une valeur déjà réglée attend d'être remplacée : sans cette
  // règle, un réglage à 3 chiffres serait inéditable (le plafond ignorerait tout).
  it('replaces an already-set value on the first keystroke', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '150' } })

    await press(wrapper, 'digit-8')

    expect(wrapper.emitted('update')).toEqual([['8']])
  })

  it('keeps appending after that first replacing keystroke', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '150' } })

    await press(wrapper, 'digit-8')
    await wrapper.setProps({ value: '8' })
    await press(wrapper, 'digit-0')

    expect(wrapper.emitted('update')).toEqual([['8'], ['80']])
  })

  // Le 0 en tête reste interdit : il repart d'un buffer vide plutôt que de s'empiler.
  it('never stacks a leading zero', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '' } })

    await press(wrapper, 'digit-0')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('starts empty when the first replacing keystroke is a zero', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '150' } })

    await press(wrapper, 'digit-0')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  // DT1 : le plafond a une seule source, `MAX_TARGET_SCORE` (999 → 3 chiffres).
  it('ignores a keystroke beyond the three-digit cap', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '123' } })
    // La valeur a déjà été touchée : on consomme d'abord la frappe de remplacement.
    await press(wrapper, 'digit-9')
    await wrapper.setProps({ value: '999' })

    await press(wrapper, 'digit-9')

    expect(wrapper.emitted('update')).toEqual([['9']])
  })

  it('answers a refused keystroke with a reject haptic and a pulse', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '123' } })
    await press(wrapper, 'digit-9')
    await wrapper.setProps({ value: '999' })
    vibrate.mockClear()

    await press(wrapper, 'digit-9')

    expect(vibrate).toHaveBeenCalledWith(15)
    expect(wrapper.find('[data-testid="dock-reject"]').attributes('data-reject')).toBe('1')
  })

  it('leaves the reject pulse at rest while keystrokes are accepted', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '' } })

    await press(wrapper, 'digit-5')

    expect(wrapper.find('[data-testid="dock-reject"]').attributes('data-reject')).toBe('0')
  })

  it('answers an accepted keystroke with a tap haptic', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '' } })

    await press(wrapper, 'digit-5')

    expect(vibrate).toHaveBeenCalledWith(40)
  })

  it('clears the whole value from AC/C', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '47' } })

    await press(wrapper, 'clear-button')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  it('drops the last digit on backspace', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '47' } })

    await press(wrapper, 'backspace-button')

    expect(wrapper.emitted('update')).toEqual([['4']])
  })

  // Après un effacement la valeur n'est plus « vierge » : la frappe suivante s'empile.
  it('appends normally after a clear', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '150' } })

    await press(wrapper, 'clear-button')
    await wrapper.setProps({ value: '' })
    await press(wrapper, 'digit-2')

    expect(wrapper.emitted('update')).toEqual([[''], ['2']])
  })

  it('labels the clear key AC on an empty value and C otherwise', async () => {
    const empty = mount(NumericPadDock, { props: { value: '' } })
    const filled = mount(NumericPadDock, { props: { value: '47' } })

    expect(empty.find('[data-testid="clear-button"]').text()).toBe('AC')
    expect(filled.find('[data-testid="clear-button"]').text()).toBe('C')
  })

  it('validates from its footer CTA and abandons from its cross', async () => {
    const wrapper = mount(NumericPadDock, { props: { value: '47' } })

    await press(wrapper, 'dock-confirm')
    await press(wrapper, 'dock-close')

    expect(wrapper.emitted('validate')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Décision 3 de Nathan : les deux cartes restent lisibles, le dock ne pose aucun voile.
  it('renders no backdrop and no blur', () => {
    expect(source).not.toContain('backdrop')
    expect(source).not.toContain('blur')
    expect(source).not.toContain('fixed')
  })

  // AR8 : `@pointerdown` seul, jamais `@click`.
  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
