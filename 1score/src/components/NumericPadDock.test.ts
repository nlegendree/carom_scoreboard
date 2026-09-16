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

// La bande que l'hôte demande de réserver (Story 11.3) : une valeur d'écran quelconque
// suffit ici — ce que les cas vérifient, c'est qu'elle atterrit du BON CÔTÉ, pas ce qu'elle
// vaut. Sa vraie valeur est déclarée par l'écran, à côté de la mise en page qu'elle mesure.
const RESERVE = 'calc(100vw * 0.4)'

function pad(props: { value: string; align?: 'left' | 'right' }) {
  return mount(NumericPadDock, { props: { align: 'right', reserve: RESERVE, ...props } })
}

describe('NumericPadDock', () => {
  // Le buffer vit dans l'écran, pas dans le dock : c'est la carte qui doit afficher la
  // valeur en direct, et deux buffers divergeraient à la première frappe. Le dock émet
  // donc la nouvelle valeur COMPLÈTE, jamais le seul chiffre frappé.
  it('emits the complete new value, appending as the parent feeds it back', async () => {
    const wrapper = pad({ value: '' })

    await press(wrapper, 'digit-4')
    await wrapper.setProps({ value: '4' })
    await press(wrapper, 'digit-7')

    expect(wrapper.emitted('update')).toEqual([['4'], ['47']])
  })

  // Une distance ouverte sur une valeur déjà réglée attend d'être remplacée : sans cette
  // règle, un réglage à 3 chiffres serait inéditable (le plafond ignorerait tout).
  it('replaces an already-set value on the first keystroke', async () => {
    const wrapper = pad({ value: '150' })

    await press(wrapper, 'digit-8')

    expect(wrapper.emitted('update')).toEqual([['8']])
  })

  it('keeps appending after that first replacing keystroke', async () => {
    const wrapper = pad({ value: '150' })

    await press(wrapper, 'digit-8')
    await wrapper.setProps({ value: '8' })
    await press(wrapper, 'digit-0')

    expect(wrapper.emitted('update')).toEqual([['8'], ['80']])
  })

  // Le 0 en tête reste interdit : il repart d'un buffer vide plutôt que de s'empiler.
  it('never stacks a leading zero', async () => {
    const wrapper = pad({ value: '' })

    await press(wrapper, 'digit-0')

    expect(wrapper.emitted('update')).toBeUndefined()
  })

  it('starts empty when the first replacing keystroke is a zero', async () => {
    const wrapper = pad({ value: '150' })

    await press(wrapper, 'digit-0')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  // DT1 : le plafond a une seule source, `MAX_TARGET_SCORE` (999 → 3 chiffres).
  it('ignores a keystroke beyond the three-digit cap', async () => {
    const wrapper = pad({ value: '123' })
    // La valeur a déjà été touchée : on consomme d'abord la frappe de remplacement.
    await press(wrapper, 'digit-9')
    await wrapper.setProps({ value: '999' })

    await press(wrapper, 'digit-9')

    expect(wrapper.emitted('update')).toEqual([['9']])
  })

  it('answers a refused keystroke with a reject haptic and a pulse', async () => {
    const wrapper = pad({ value: '123' })
    await press(wrapper, 'digit-9')
    await wrapper.setProps({ value: '999' })
    vibrate.mockClear()

    await press(wrapper, 'digit-9')

    expect(vibrate).toHaveBeenCalledWith(15)
    expect(wrapper.find('[data-testid="dock-reject"]').attributes('data-reject')).toBe('1')
  })

  it('leaves the reject pulse at rest while keystrokes are accepted', async () => {
    const wrapper = pad({ value: '' })

    await press(wrapper, 'digit-5')

    expect(wrapper.find('[data-testid="dock-reject"]').attributes('data-reject')).toBe('0')
  })

  it('answers an accepted keystroke with a tap haptic', async () => {
    const wrapper = pad({ value: '' })

    await press(wrapper, 'digit-5')

    expect(vibrate).toHaveBeenCalledWith(40)
  })

  it('clears the whole value from AC/C', async () => {
    const wrapper = pad({ value: '47' })

    await press(wrapper, 'clear-button')

    expect(wrapper.emitted('update')).toEqual([['']])
  })

  it('drops the last digit on backspace', async () => {
    const wrapper = pad({ value: '47' })

    await press(wrapper, 'backspace-button')

    expect(wrapper.emitted('update')).toEqual([['4']])
  })

  // Après un effacement la valeur n'est plus « vierge » : la frappe suivante s'empile.
  it('appends normally after a clear', async () => {
    const wrapper = pad({ value: '150' })

    await press(wrapper, 'clear-button')
    await wrapper.setProps({ value: '' })
    await press(wrapper, 'digit-2')

    expect(wrapper.emitted('update')).toEqual([[''], ['2']])
  })

  it('labels the clear key AC on an empty value and C otherwise', async () => {
    const empty = pad({ value: '' })
    const filled = pad({ value: '47' })

    expect(empty.find('[data-testid="clear-button"]').text()).toBe('AC')
    expect(filled.find('[data-testid="clear-button"]').text()).toBe('C')
  })

  it('validates from its footer CTA and abandons from its cross', async () => {
    const wrapper = pad({ value: '47' })

    await press(wrapper, 'dock-confirm')
    await press(wrapper, 'dock-close')

    expect(wrapper.emitted('validate')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  // Revue de rendu du 2026-09-12 : pop-up par-dessus l'écran, mais voile SANS FLOU et à
  // peine assombri — la carte qu'on remplit doit rester lisible en face, c'est elle qui
  // affiche la valeur depuis que la pop-up ne la rappelle plus.
  it('renders as a pop-up over the screen, without blurring what is behind', () => {
    const overlay = pad({ value: '' })

    expect(overlay.classes()).toContain('fixed')
    expect(overlay.classes().join(' ')).not.toContain('backdrop-blur')
    expect(overlay.classes()).toContain('bg-black/25')
    expect(overlay.find('[data-testid="dock-card"]').exists()).toBe(true)
  })

  // Revue de rendu du 2026-09-12 : la pop-up se range du côté demandé et ne rappelle PLUS
  // la valeur — la carte qu'on remplit reste visible en face, c'est elle qui l'affiche.
  // Elle ne se colle pas au bord : elle se centre dans la zone que la carte visée laisse
  // libre, l'inset réservant la bande occupée par cette carte.
  // Story 11.3 : la bande à réserver n'est plus un token, c'est `HomeScreen` qui la transmet
  // (`reserve`) et `PopupCard` qui la pose en style en ligne — une position n'a pas sa place
  // dans le namespace des intentions. MÊME INTENTION, nouvelle cible : ce qui compte reste
  // l'ASYMÉTRIE — le côté visé est réservé, le côté libre retombe à la gouttière.
  it('centres itself in the space left free by the targeted card', () => {
    const right = pad({ value: '', align: 'right' })
    const left = pad({ value: '', align: 'left' })

    expect(right.classes()).toContain('justify-center')
    expect(right.attributes('style')).toContain(`padding-inline-start: ${RESERVE}`)
    expect(right.attributes('style')).not.toContain(`padding-inline-end: ${RESERVE}`)
    expect(left.attributes('style')).toContain(`padding-inline-end: ${RESERVE}`)
    expect(left.attributes('style')).not.toContain(`padding-inline-start: ${RESERVE}`)
  })

  it('carries no value readout of its own', () => {
    expect(pad({ value: '47' }).find('[data-testid="dock-value"]').exists()).toBe(false)
  })

  // La croix cède la place à un `ANNULER`, comme dans toutes les pop-ups du produit.
  // La croix cède la place à un `ANNULER`, arrondi comme les touches : un rectangle net
  // à côté de touches en relief jurait (revue de rendu du 2026-09-12).
  it('cancels from an ANNULER button, not a cross, rounded like the keys', () => {
    const wrapper = pad({ value: '47' })

    expect(wrapper.find('[data-testid="dock-close"]').text()).toBe('ANNULER')
    expect(wrapper.find('[data-testid="dock-close"]').classes()).toContain('rounded-tappable')
    expect(wrapper.find('[data-testid="dock-confirm"]').classes()).toContain('rounded-tappable')
  })

  // Un tap en dehors ferme, mais sur un geste COMPLET : appui ET relâchement sur le voile.
  it('closes on a complete gesture outside, and ignores a partial one', async () => {
    const wrapper = pad({ value: '47' })

    await wrapper.trigger('pointerup', { pointerId: 1 })
    expect(wrapper.emitted('cancel')).toBeUndefined()

    await wrapper.trigger('pointerdown', { pointerId: 2 })
    await wrapper.trigger('pointerup', { pointerId: 2 })

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('ignores a gesture that started on the card itself', async () => {
    const wrapper = pad({ value: '47' })

    await wrapper.find('[data-testid="dock-card"]').trigger('pointerdown', { pointerId: 3 })
    await wrapper.trigger('pointerup', { pointerId: 3 })

    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  // AR8 : `@pointerdown` seul, jamais `@click`.
  // AR8. Story 11.3 : l'hôte n'écoute plus lui-même le pointeur — `CtaButton` remonte
  // `@pointerdown` en `press`, `PopupCard` porte le geste complet du voile, et chacun a son
  // test. Ce qui reste vérifiable ICI, et qui compte, c'est qu'aucun `@click` ne se glisse
  // dans l'hôte : il réintroduirait le délai de 300 ms sur iPad, et rien ne le verrait.
  it('binds no click of its own', () => {
    expect(source).not.toContain('@click')
    expect(source).toContain('@press')
  })

  // AC1 (Story 10.7) : le dock s'annonce comme un dialogue. Aucun titre visible ici — la
  // carte visée reste lisible à côté —, donc un `aria-label` statique plutôt qu'un
  // `aria-labelledby` qui n'aurait rien à viser.
  it('exposes the dialog semantics with a static label', () => {
    const backdrop = pad({ value: '' }).find('[data-testid="numeric-pad-dock"]')

    expect(backdrop.attributes('role')).toBe('dialog')
    expect(backdrop.attributes('aria-modal')).toBe('true')
    expect(backdrop.attributes('aria-label')).toBe('Réglage de la distance')
  })

  // AC2 (Story 10.7) : le voile garde ses handlers pointer SANS `role="button"` — il porte
  // déjà `role="dialog"`. Exception assumée à CLAUDE.md §2, consignée là-bas.
  it('never gives the backdrop a button role', () => {
    const wrapper = pad({ value: '' })

    expect(wrapper.find('[data-testid="numeric-pad-dock"]').attributes('role')).not.toBe('button')
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })

})
