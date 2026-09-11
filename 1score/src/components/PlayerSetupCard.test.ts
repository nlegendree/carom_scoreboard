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

  // La pastille garde la bille lisible quand les cartes ont changé de côté — d'où la
  // platine sombre : une bille blanche à même la carte blanche serait invisible.
  it('shows the ball on a dark pellet, in the colour of its ball', () => {
    const pellet = card({ ball: 'yellow' }).find('[data-testid="ball-pellet"]')

    expect(pellet.classes()).toContain('bg-bg')
    expect(pellet.find('span').classes()).toContain('bg-player-yellow')
    expect(card({ ball: 'white' }).find('[data-testid="ball-pellet"] span').classes()).toContain(
      'bg-player-white',
    )
  })

  it('shows both fields with their dimmed placeholders while empty', () => {
    const wrapper = card()

    expect(wrapper.find('[data-testid="name-value"]').text()).toBe('JOUEUR')
    expect(wrapper.find('[data-testid="name-value"]').classes().join(' ')).toContain('/25')
    expect(wrapper.find('[data-testid="distance-value"]').text()).toBe('0')
    expect(wrapper.find('[data-testid="distance-value"]').classes().join(' ')).toContain('/25')
  })

  it('shows the typed values in full ink', () => {
    const wrapper = card({ name: 'MICHEL', distance: '47' })

    expect(wrapper.find('[data-testid="name-value"]').text()).toBe('MICHEL')
    expect(wrapper.find('[data-testid="name-value"]').classes().join(' ')).not.toContain('/25')
    expect(wrapper.find('[data-testid="distance-value"]').text()).toBe('47')
    expect(wrapper.find('[data-testid="distance-value"]').classes().join(' ')).not.toContain('/25')
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
