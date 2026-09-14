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
    expect(wrapper.classes().join(' ')).toContain('disabled:opacity-30')
  })

  it('stays inert in the soon state and shows the BIENTÔT badge', async () => {
    const wrapper = mountAction({ picto: 'gear', label: 'PARAMÈTRES', state: 'soon' })

    await wrapper.trigger('pointerdown')

    expect(wrapper.emitted('press')).toBeUndefined()
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="soon-badge"]').exists()).toBe(true)
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

    expect(classes).toContain('min-h-[var(--size-touch-target)]')
    expect(classes).toContain('min-w-[var(--size-touch-target)]')
    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-border')
    expect(classes).toContain('rounded-cta')
    expect(classes).toContain('touch-manipulation')
  })
})
