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

  // Le médaillon rond sombre et la pastille flottante restent retirés ; c'est l'en-tête
  // de carte qui porte désormais la bille (revue de rendu du 2026-09-12).
  it('carries neither a floating pellet nor a dark medallion', () => {
    const wrapper = card()

    expect(wrapper.find('[data-testid="ball-pellet"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="player-medallion"]').exists()).toBe(false)
  })

  // Pictos servis depuis `public/` : aucune ressource réseau, l'app tourne hors ligne.
  it('names its ball in a card header, with the matching picto', () => {
    const white = card({ ball: 'white' })
    const yellow = card({ ball: 'yellow' })

    expect(white.find('[data-testid="card-header"]').text()).toBe('BILLE BLANCHE')
    expect(white.find('[data-testid="card-header"] img').attributes('src')).toBe(
      '/bille_blanche.png',
    )
    expect(yellow.find('[data-testid="card-header"]').text()).toBe('BILLE JAUNE')
    expect(yellow.find('[data-testid="card-header"] img').attributes('src')).toBe(
      '/bille_jaune.png',
    )
  })

  // Les deux champs sont CENTRÉS dans la carte, en box CLAIRE teintée de la carte
  // elle-même : lisible sur le blanc comme sur le jaune, et beaucoup moins lourde que les
  // pavés presque noirs de la passe précédente.
  it('lays both fields on a light tint of the card itself', () => {
    const wrapper = card()

    for (const field of ['name-field', 'distance-field']) {
      expect(wrapper.find(`[data-testid="${field}"]`).classes()).toContain('bg-black/8')
    }
  })

  // Revue de rendu du 2026-09-12 : un champ vide porte SON PROPRE INTITULÉ et rien
  // d'autre — « JOUEUR » et « 0 » se lisaient comme de vraies valeurs déjà saisies.
  it('shows nothing but its own label while a field is empty', () => {
    const wrapper = card()

    expect(wrapper.find('[data-testid="name-value"]').text()).toBe('NOM')
    expect(wrapper.find('[data-testid="name-value"]').classes()).toContain('opacity-60')
    expect(wrapper.find('[data-testid="distance-value"]').text()).toBe('DISTANCE')
    expect(wrapper.find('[data-testid="distance-value"]').classes()).toContain('opacity-60')
    // Pas d'intitulé en double au-dessus tant qu'il n'y a pas de valeur.
    expect(wrapper.find('[data-testid="name-field"]').text()).toBe('NOM')
  })

  it('captions the value with its label once something is typed', () => {
    const wrapper = card({ name: 'MICHEL', distance: '47' })

    expect(wrapper.find('[data-testid="name-value"]').text()).toBe('MICHEL')
    expect(wrapper.find('[data-testid="name-value"]').classes()).not.toContain('opacity-60')
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

  // AC5 (Story 10.7) : les intitulés en placeholder sont posés sur la BOX du champ
  // (`bg-black/8`), pas sur la carte nue — sur le jaune, `opacity-55` n'y donnait que
  // 4,20:1 pour un `text-stat` qui n'est jamais « grand texte ». `opacity-60` porte le
  // couple à 4,98:1 sur la carte jaune et 5,44:1 sur la blanche : une seule classe suffit
  // aux deux.
  it.each(['white', 'yellow'] as const)('dims the %s card placeholders to a legible level', (ball) => {
    const wrapper = card({ ball, name: '', distance: '' })

    for (const testid of ['name-value', 'distance-value']) {
      const classes = wrapper.find(`[data-testid="${testid}"]`).classes()
      expect(classes).toContain('opacity-60')
      expect(classes).not.toContain('opacity-55')
    }
  })

})
