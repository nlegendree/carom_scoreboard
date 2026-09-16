import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SideBar from './SideBar.vue'
import PictoIcon from './PictoIcon.vue'
import type { SideBarItem } from '../types/ui'

function item(overrides: Partial<SideBarItem> = {}): SideBarItem {
  return { id: 'training', picto: 'training', label: 'ENTRAÎNEMENT', state: 'normal', ...overrides }
}

describe('SideBar', () => {
  it('shows the 1Score logo and word in its header', () => {
    const header = mount(SideBar, { props: { items: [] } }).find('[data-testid="sidebar-header"]')

    expect(header.find('img[alt="1Score"]').attributes('src')).toBe('/logo.png')
    expect(header.text()).toBe('1Score')
  })

  // UX-DR29 : l'en-tête est une marque, pas une commande — ni bouton, ni rôle, ni handler.
  it('keeps the header inert', async () => {
    const action = vi.fn()
    const wrapper = mount(SideBar, { props: { items: [item({ action })] } })
    const header = wrapper.find('[data-testid="sidebar-header"]')

    await header.trigger('pointerdown')

    expect(header.element.tagName).not.toBe('BUTTON')
    expect(header.attributes('role')).toBeUndefined()
    expect(header.find('button').exists()).toBe(false)
    expect(action).not.toHaveBeenCalled()
  })

  it('renders the items in the given order with their picto and label', () => {
    const wrapper = mount(SideBar, {
      props: {
        items: [item(), item({ id: 'signup', picto: 'signup', label: 'INSCRIPTION' })],
      },
    })
    const buttons = wrapper.findAll('[data-testid^="sidebar-item-"]')

    expect(buttons.map((b) => b.attributes('data-testid'))).toEqual([
      'sidebar-item-training',
      'sidebar-item-signup',
    ])
    expect(buttons[1]!.text()).toBe('INSCRIPTION')
    expect(buttons[1]!.findComponent(PictoIcon).props('name')).toBe('signup')
  })

  it('runs the action of a normal item on pointerdown', async () => {
    const action = vi.fn()
    const wrapper = mount(SideBar, { props: { items: [item({ action })] } })
    const button = wrapper.find('[data-testid="sidebar-item-training"]')

    await button.trigger('pointerdown')

    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.text()).not.toContain('BIENTÔT')
    expect(action).toHaveBeenCalledTimes(1)
  })

  // `disabled` porte le visuel, la garde porte le comportement : les navigateurs ne
  // s'accordent pas sur l'envoi des pointer events aux contrôles désactivés.
  it('shows a soon item as disabled and never runs its action', async () => {
    const action = vi.fn()
    const wrapper = mount(SideBar, { props: { items: [item({ state: 'soon', action })] } })
    const button = wrapper.find('[data-testid="sidebar-item-training"]')

    await button.trigger('pointerdown')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.find('[data-testid="soon-badge"]').text()).toBe('BIENTÔT')
    expect(button.findComponent(PictoIcon).classes()).toContain('opacity-45')
    expect(button.find('[data-testid="sidebar-label"]').classes()).toContain('opacity-45')
    expect(button.find('[data-testid="soon-badge"]').classes()).not.toContain('opacity-45')
    // Story 11.1 : le badge porte le rôle `picto` de DESIGN.md (jamais sous 11 px), plus
    // un `text-[10px]` écrit dans le gabarit.
    expect(button.find('[data-testid="soon-badge"]').classes()).toContain('text-picto')
    expect(action).not.toHaveBeenCalled()
  })

  it('renders the exit item at the bottom, after the items', () => {
    const wrapper = mount(SideBar, {
      props: {
        items: [item()],
        exitItem: item({ id: 'close-app', picto: 'power', label: "FERMER L'APPLICATION" }),
      },
    })
    const bottom = wrapper.find('[data-testid="sidebar-bottom"]')
    const ids = wrapper.findAll('[data-testid^="sidebar-item-"]').map((b) => b.attributes('data-testid'))

    expect(bottom.classes()).toContain('mt-auto')
    expect(bottom.find('[data-testid="sidebar-item-close-app"]').exists()).toBe(true)
    expect(bottom.find('[data-testid="sidebar-item-training"]').exists()).toBe(false)
    expect(ids).toEqual(['sidebar-item-training', 'sidebar-item-close-app'])
  })

  it('renders no bottom group without an exit item', () => {
    const wrapper = mount(SideBar, { props: { items: [item()] } })

    expect(wrapper.find('[data-testid="sidebar-bottom"]').exists()).toBe(false)
  })
})
