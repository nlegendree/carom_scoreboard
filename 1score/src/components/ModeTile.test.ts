import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModeTile from './ModeTile.vue'
import PictoIcon from './PictoIcon.vue'

function background(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('[data-testid="tile-background"]')
}

describe('ModeTile', () => {
  it('shows its title and an arrow, without soon badge', () => {
    const wrapper = mount(ModeTile, { props: { title: '3 BANDES' } })

    expect(wrapper.find('[data-testid="tile-title"]').text()).toBe('3 BANDES')
    expect(wrapper.findComponent(PictoIcon).props('name')).toBe('arrow-right')
    expect(wrapper.find('[data-testid="soon-badge"]').exists()).toBe(false)
  })

  it('emits select once on pointerdown, with its full gradient and a press effect', async () => {
    const wrapper = mount(ModeTile, { props: { title: 'JEUX DE SÉRIES' } })

    await wrapper.trigger('pointerdown')

    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(background(wrapper).classes()).toContain('bg-(image:--gradient-blue)')
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

  // Un seul bleu pour toutes les tuiles ouvertes, à l'accueil comme en sélection JDS
  // (décision de Nathan, 2026-09-12) : l'écran n'a plus de couleur à choisir.
  it('paints every open tile with the single product blue', () => {
    for (const props of [{ title: '3 BANDES' }, { title: 'LIBRE' }, { title: 'CADRE' }]) {
      expect(background(mount(ModeTile, { props })).classes()).toContain(
        'bg-(image:--gradient-blue)',
      )
    }
  })

  // Les tuiles BIENTÔT gardent la nuance sombre de leur famille : elle dit l'inactivité
  // autant que le badge.
  it.each([
    ['tile-quilles', 'bg-(image:--gradient-tile-quilles)'],
    ['tile-casin', 'bg-(image:--gradient-tile-casin)'],
  ] as const)('keeps %s on a soon tile', (color, expected) => {
    const wrapper = mount(ModeTile, { props: { title: 'X', color, soon: true } })

    expect(background(wrapper).classes()).toContain(expected)
    expect(background(wrapper).classes()).not.toContain('bg-(image:--gradient-blue)')
  })

  it('renders the tagline only when given', () => {
    const bare = mount(ModeTile, { props: { title: 'CASIN' } })
    const withTagline = mount(ModeTile, {
      props: { title: 'CASIN', tagline: 'Parties par catégories' },
    })

    expect(bare.find('[data-testid="tile-tagline"]').exists()).toBe(false)
    expect(withTagline.find('[data-testid="tile-tagline"]').text()).toBe('Parties par catégories')
  })

  // AC8 : l'accueil est l'écran de veille, rien n'y bouge au repos.
  it('carries no transition or animation', () => {
    const html = mount(ModeTile, { props: { title: 'X' } }).html()

    expect(html).not.toMatch(/transition|animate-|scale-/)
  })

  // AC5 (Story 10.7) : `text-white/80` donnait 2,78:1 sur le stop clair de `--gradient-blue`,
  // échec net au seuil 4,5:1 — `text-stat` n'est jamais « grand texte » (14 → 18 px). Passé
  // en blanc plein (3,46:1). ⚠️ Toujours sous 4,5:1 : le chemin n'est aujourd'hui affiché
  // par AUCUNE tuile (décision de Nathan en 10.1), et la prop reste au contrat — la dette
  // « accroche rouverte = taille à remonter » est consignée dans `deferred-work.md`.
  it('renders the tagline at full opacity', () => {
    const wrapper = mount(ModeTile, { props: { title: 'CASIN', tagline: 'Parties par catégories' } })
    const classes = wrapper.find('[data-testid="tile-tagline"]').classes()

    expect(classes).toContain('text-white')
    expect(classes).not.toContain('text-white/80')
  })

})
