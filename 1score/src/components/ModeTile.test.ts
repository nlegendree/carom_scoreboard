import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeTile from './ModeTile.vue'
import PictoIcon from './PictoIcon.vue'

function background(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('[data-testid="tile-background"]')
}

describe('ModeTile', () => {
  it('shows its title and an arrow, without soon badge', () => {
    const wrapper = mount(ModeTile, { props: { title: '3 BANDES', color: 'tile-3b' } })

    expect(wrapper.find('[data-testid="tile-title"]').text()).toBe('3 BANDES')
    expect(wrapper.findComponent(PictoIcon).props('name')).toBe('arrow-right')
    expect(wrapper.find('[data-testid="soon-badge"]').exists()).toBe(false)
  })

  it('emits select once on pointerdown, with its full gradient and a press effect', async () => {
    const wrapper = mount(ModeTile, { props: { title: 'JEUX DE SÉRIES', color: 'tile-jds' } })

    await wrapper.trigger('pointerdown')

    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(background(wrapper).classes()).toContain('bg-(image:--gradient-tile-jds)')
    expect(background(wrapper).classes()).not.toContain('opacity-45')
    expect(wrapper.classes()).toContain('active:brightness-125')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  // `disabled` porte le visuel, la garde porte le comportement (voir SideBar).
  it('shows a soon tile dimmed with a badge instead of the arrow, and never selects', async () => {
    const wrapper = mount(ModeTile, { props: { title: 'QUILLES', color: 'tile-quilles', soon: true } })

    await wrapper.trigger('pointerdown')

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="soon-badge"]').text()).toBe('BIENTÔT')
    expect(wrapper.findComponent(PictoIcon).exists()).toBe(false)
    expect(background(wrapper).classes()).toContain('opacity-45')
    expect(wrapper.find('[data-testid="tile-title"]').classes()).not.toContain('opacity-45')
    expect(wrapper.classes()).not.toContain('active:brightness-125')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it.each([
    ['tile-3b', 'bg-(image:--gradient-tile-3b)'],
    ['tile-jds', 'bg-(image:--gradient-tile-jds)'],
    ['tile-quilles', 'bg-(image:--gradient-tile-quilles)'],
    ['tile-casin', 'bg-(image:--gradient-tile-casin)'],
  ] as const)('maps %s to %s', (color, expected) => {
    expect(background(mount(ModeTile, { props: { title: 'X', color } })).classes()).toContain(expected)
  })

  it('renders the tagline only when given', () => {
    const bare = mount(ModeTile, { props: { title: 'CASIN', color: 'tile-casin' } })
    const withTagline = mount(ModeTile, {
      props: { title: 'CASIN', color: 'tile-casin', tagline: 'Parties par catégories' },
    })

    expect(bare.find('[data-testid="tile-tagline"]').exists()).toBe(false)
    expect(withTagline.find('[data-testid="tile-tagline"]').text()).toBe('Parties par catégories')
  })

  // AC8 : l'accueil est l'écran de veille, rien n'y bouge au repos.
  it('carries no transition or animation', () => {
    const html = mount(ModeTile, { props: { title: 'X', color: 'tile-3b' } }).html()

    expect(html).not.toMatch(/transition|animate-|scale-/)
  })
})
