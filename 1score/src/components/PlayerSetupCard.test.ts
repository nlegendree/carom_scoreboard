import { describe, it, expect } from 'vitest'
import source from './PlayerSetupCard.vue?raw'
import { mount } from '@vue/test-utils'
import PlayerSetupCard from './PlayerSetupCard.vue'

function card(props: Partial<InstanceType<typeof PlayerSetupCard>['$props']> = {}) {
  return mount(PlayerSetupCard, {
    props: {
      side: 'left',
      ball: 'white',
      name: '',
      distance: '',
      focusedField: null,
      ...props,
    } as InstanceType<typeof PlayerSetupCard>['$props'],
  })
}

describe('PlayerSetupCard', () => {
  // Adressable par CÔTÉ (le testid) et lisible par BILLE (l'attribut) : les deux se
  // dissocient dès qu'on tape CHANGER DE BILLE, et les tests d'écran ont besoin des deux.
  it('is addressable by side and states its ball', () => {
    const wrapper = card({ side: 'right', ball: 'yellow' })

    expect(wrapper.attributes('data-testid')).toBe('player-card-right')
    expect(wrapper.attributes('data-ball')).toBe('yellow')
  })

  // Classes écrites en toutes lettres : le scanner JIT de Tailwind 4 ne voit que celles-là.
  it('fills the card with the colour of its ball, in black ink', () => {
    expect(card({ ball: 'white' }).classes()).toContain('bg-player-white')
    expect(card({ ball: 'white' }).classes()).toContain('text-on-player-white')
    expect(card({ ball: 'yellow' }).classes()).toContain('bg-player-yellow')
    expect(card({ ball: 'yellow' }).classes()).toContain('text-on-player-yellow')
  })

  // Revue de rendu du 2026-09-12 : ni pastille de bille ni médaillon rond sombre — la
  // couleur pleine de la carte dit déjà la bille, le reste alourdissait.
  it('carries neither a ball pellet nor a dark medallion', () => {
    const wrapper = card()

    expect(wrapper.find('[data-testid="ball-pellet"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="player-medallion"]').exists()).toBe(false)
  })

  // Les deux champs sont CENTRÉS dans la carte, en box CLAIRE teintée de la carte
  // elle-même : lisible sur le blanc comme sur le jaune, et beaucoup moins lourde que les
  // pavés presque noirs de la passe précédente.
  it('centres both fields in the card, on a light tint of the card itself', () => {
    const wrapper = card()

    expect(wrapper.classes()).toContain('justify-center')
    expect(wrapper.classes()).toContain('items-center')
    for (const field of ['name-field', 'distance-field']) {
      expect(wrapper.find(`[data-testid="${field}"]`).classes()).toContain('bg-black/8')
    }
  })

  // Revue de rendu du 2026-09-12 : un champ vide porte SON PROPRE INTITULÉ et rien
  // d'autre — « JOUEUR » et « 0 » se lisaient comme de vraies valeurs déjà saisies.
  it('shows nothing but its own label while a field is empty', () => {
    const wrapper = card()

    expect(wrapper.find('[data-testid="name-value"]').text()).toBe('NOM')
    expect(wrapper.find('[data-testid="name-value"]').classes()).toContain('opacity-35')
    expect(wrapper.find('[data-testid="distance-value"]').text()).toBe('DISTANCE')
    expect(wrapper.find('[data-testid="distance-value"]').classes()).toContain('opacity-35')
    // Pas d'intitulé en double au-dessus tant qu'il n'y a pas de valeur.
    expect(wrapper.find('[data-testid="name-field"]').text()).toBe('NOM')
  })

  it('captions the value with its label once something is typed', () => {
    const wrapper = card({ name: 'MICHEL', distance: '47' })

    expect(wrapper.find('[data-testid="name-value"]').text()).toBe('MICHEL')
    expect(wrapper.find('[data-testid="name-value"]').classes()).not.toContain('opacity-35')
    expect(wrapper.find('[data-testid="name-field"]').text()).toContain('NOM')
    expect(wrapper.find('[data-testid="distance-value"]').text()).toBe('47')
    expect(wrapper.find('[data-testid="distance-field"]').text()).toContain('DISTANCE')
  })

  // Le champ visé se signale par une PRÉSENCE (le liseré), jamais par une teinte de fond
  // seule — même signal non chromatique que l'indicateur de tour (UX-DR22).
  it('outlines the focused field only', () => {
    const wrapper = card({ focusedField: 'distance' })

    expect(wrapper.find('[data-testid="distance-field"]').classes()).toContain('border-turn-active')
    expect(wrapper.find('[data-testid="name-field"]').classes()).not.toContain('border-turn-active')
  })

  it('outlines no field when none is focused', () => {
    const wrapper = card({ focusedField: null })

    expect(wrapper.find('[data-testid="name-field"]').classes()).not.toContain('border-turn-active')
    expect(wrapper.find('[data-testid="distance-field"]').classes()).not.toContain('border-turn-active')
  })

  it('asks for the focus of the field that is tapped', async () => {
    const wrapper = card()

    await wrapper.find('[data-testid="name-field"]').trigger('pointerdown')
    await wrapper.find('[data-testid="distance-field"]').trigger('pointerdown')

    expect(wrapper.emitted('focus')).toEqual([['name'], ['distance']])
  })

  // Purement présentationnelle : aucun accès au store, aucune règle de saisie.
  it('keeps no state and reaches no store', () => {
    expect(source).not.toContain('useGameStore')
    expect(source).not.toContain('ref(')
  })

  it('binds pointerdown only, never click', () => {
    expect(source).toContain('@pointerdown')
    expect(source).not.toContain('@click')
  })
})
