import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './GameSummary.vue?raw'
import { mount } from '@vue/test-utils'
import GameSummary from './GameSummary.vue'
import type { Player, PlayerId } from '../types/game'

type Props = InstanceType<typeof GameSummary>['$props']

const michel: Player = { id: 'player1', name: 'MICHEL', score: 42, color: 'white', targetScore: 100 }
const andre: Player = { id: 'player2', name: 'ANDRÉ', score: 15, color: 'yellow', targetScore: 80 }

function mountSummary(overrides: Partial<Props> = {}) {
  return mount(GameSummary, {
    props: {
      mode: 'cadre-47-2',
      player1: michel,
      player2: andre,
      averages: { player1: 8.4, player2: 3 },
      bestSeries: { player1: 15, player2: 6 },
      repriseCounts: { player1: 5, player2: 5 },
      winner: 'player1',
      ...overrides,
    },
  })
}

type Wrapper = ReturnType<typeof mountSummary>

function column(wrapper: Wrapper, side: PlayerId) {
  return wrapper.find(`[data-testid="summary-column"][data-side="${side}"]`)
}

function cell(wrapper: Wrapper, side: PlayerId, testid: string) {
  return column(wrapper, side).find(`[data-testid="${testid}"]`).text()
}

describe('GameSummary', () => {
  it('shows each player with his distance in the banner, around a VS', () => {
    const banner = mountSummary().find('[data-testid="summary-banner"]')

    expect(banner.find('[data-testid="summary-player1"]').text()).toBe('MICHEL / 100')
    expect(banner.find('[data-testid="summary-player2"]').text()).toBe('ANDRÉ / 80')
    expect(banner.text()).toContain('VS')
  })

  // AC13 : le mode en surtitre discret, jamais en concurrence avec les noms.
  it('names the game mode discreetly in the banner', () => {
    const mode = mountSummary().find('[data-testid="summary-mode"]')

    expect(mode.text()).toBe('CADRE 47/2')
    expect(mode.classes()).toContain('text-stat')
  })

  it('reads every statistic of each player in his own column', () => {
    const wrapper = mountSummary()

    expect(cell(wrapper, 'player1', 'summary-points')).toBe('42')
    expect(cell(wrapper, 'player1', 'summary-average')).toBe('8.400')
    expect(cell(wrapper, 'player1', 'summary-best')).toBe('15')
    expect(cell(wrapper, 'player1', 'summary-reprises')).toBe('5')
    expect(cell(wrapper, 'player2', 'summary-points')).toBe('15')
    expect(cell(wrapper, 'player2', 'summary-average')).toBe('3.000')
    expect(cell(wrapper, 'player2', 'summary-best')).toBe('6')
  })

  it('shows the average with three decimals, whatever the value', () => {
    const wrapper = mountSummary({ averages: { player1: 1.23456, player2: 0 } })

    expect(cell(wrapper, 'player1', 'summary-average')).toBe('1.235')
    expect(cell(wrapper, 'player2', 'summary-average')).toBe('0.000')
  })

  // AC14 : la colonne du vainqueur entière en ruban rouge, l'autre neutre — et le mot.
  it('paints the whole winner column in the victory ribbon and reads VICTOIRE', () => {
    const wrapper = mountSummary({ winner: 'player1' })

    expect(column(wrapper, 'player1').classes()).toContain('bg-victory-ribbon')
    expect(cell(wrapper, 'player1', 'summary-result')).toBe('VICTOIRE')
    expect(column(wrapper, 'player2').classes()).not.toContain('bg-victory-ribbon')
    expect(cell(wrapper, 'player2', 'summary-result')).toBe('DÉFAITE')
  })

  it('paints the right column when the yellow player wins', () => {
    const wrapper = mountSummary({ winner: 'player2' })

    expect(column(wrapper, 'player2').classes()).toContain('bg-victory-ribbon')
    expect(cell(wrapper, 'player2', 'summary-result')).toBe('VICTOIRE')
    expect(cell(wrapper, 'player1', 'summary-result')).toBe('DÉFAITE')
  })

  it('highlights nobody on a tie and reads ÉGALITÉ twice', () => {
    const wrapper = mountSummary({ winner: null })

    expect(cell(wrapper, 'player1', 'summary-result')).toBe('ÉGALITÉ')
    expect(cell(wrapper, 'player2', 'summary-result')).toBe('ÉGALITÉ')
    expect(wrapper.findAll('.bg-victory-ribbon')).toHaveLength(0)
  })

  it('labels the five statistic rows', () => {
    const text = mountSummary().text()

    for (const label of ['RÉSULTAT', 'POINTS', 'MOY', 'SÉRIE', 'REPRISES']) {
      expect(text).toContain(label)
    }
  })

  // AC17 : l'état « nouveau record » existe par joueur, mais rien ne le déclenche ici.
  it('shows no record badge by default, and one per player when asked to', () => {
    expect(mountSummary().find('[data-testid="summary-record"]').exists()).toBe(false)

    const wrapper = mountSummary({ records: { player1: true, player2: false } })

    expect(column(wrapper, 'player1').find('[data-testid="summary-record"]').exists()).toBe(true)
    expect(column(wrapper, 'player2').find('[data-testid="summary-record"]').exists()).toBe(false)
  })

  // NFR10 : lisible à 2 m — les chiffres en `text-label`/`text-reprise`, jamais `text-stat`.
  it('sizes the figures for reading at a distance', () => {
    const wrapper = mountSummary()

    expect(column(wrapper, 'player1').find('[data-testid="summary-points"]').classes()).toContain(
      'text-reprise',
    )
    expect(column(wrapper, 'player1').find('[data-testid="summary-average"]').classes()).toContain(
      'text-label',
    )
  })

  // Le récap est terminal : le composant n'a aucune interaction.
  it('binds no pointer nor click handler at all', () => {
    expect(source).not.toContain('@pointerdown')
    expect(source).not.toContain('@click')
    expect(source).not.toContain('defineEmits')
  })
})
