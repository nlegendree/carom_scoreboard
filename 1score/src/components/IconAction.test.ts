import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IconAction from './IconAction.vue'
import PictoIcon from './PictoIcon.vue'

function mountAction(props: Partial<InstanceType<typeof IconAction>['$props']> = {}) {
  return mount(IconAction, {
    props: { picto: 'door', label: 'QUITTER', ...props } as never,
  })
}

describe('IconAction', () => {
  it('renders the requested picto and its label', () => {
    const wrapper = mountAction({ picto: 'undo', label: 'ANNULER' })

    expect(wrapper.findComponent(PictoIcon).props('name')).toBe('undo')
    expect(wrapper.text()).toContain('ANNULER')
  })

  // AR8 : `pointerdown`, jamais `click` — le délai de 300 ms est rédhibitoire au doigt.
  it('emits press on pointerdown', async () => {
    const wrapper = mountAction()

    await wrapper.trigger('pointerdown')

    expect(wrapper.emitted('press')).toHaveLength(1)
  })

  // `disabled` porte le visuel, la GARDE porte le comportement : les navigateurs ne
  // s'accordent pas sur l'envoi des pointer events aux contrôles désactivés.
  it('stays inert when disabled, visually and in behaviour', async () => {
    const wrapper = mountAction({ disabled: true })

    await wrapper.trigger('pointerdown')

    expect(wrapper.emitted('press')).toBeUndefined()
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['disabled:opacity-30', 'disabled:shadow-none']))
  })

  it('stays inert in the soon state and shows the BIENTÔT badge', async () => {
    const wrapper = mountAction({ picto: 'gear', label: 'PARAMÈTRES', state: 'soon' })

    await wrapper.trigger('pointerdown')

    expect(wrapper.emitted('press')).toBeUndefined()
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="soon-badge"]').exists()).toBe(true)
    // Story 11.1 : le badge porte le rôle `picto` (jamais sous 11 px), plus un `text-[10px]`.
    expect(wrapper.find('[data-testid="soon-badge"]').classes()).toContain('text-picto')
  })

  it('has no badge and no disabled attribute in the normal state', () => {
    const wrapper = mountAction()

    expect(wrapper.find('[data-testid="soon-badge"]').exists()).toBe(false)
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  // UX-DR52 : zone tactile de 90 px au minimum, LIBELLÉ COMPRIS — le picto seul ne suffit
  // pas à tenir la cible, c'est le bloc entier qui doit la tenir.
  it('declares the touch target gabarit', () => {
    const classes = mountAction().classes().join(' ')

    expect(classes).toContain('min-h-(--size-touch-target)')
    expect(classes).toContain('min-w-(--size-touch-target)')
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-border')
    expect(classes).toContain('rounded-tappable')
    // ⚠️ Plus de `touch-manipulation` ici depuis la Story 11.3 : la règle globale de
    // `main.css` (`button, [role="button"] { touch-action: manipulation; user-select: none }`)
    // couvre déjà tout `<button>`, et cette racine EN EST un. Le répéter ne faisait rien.
  })
})
