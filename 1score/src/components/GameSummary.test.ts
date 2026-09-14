import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './GameSummary.vue?raw'
import { mount } from '@vue/test-utils'
import GameSummary from './GameSummary.vue'
import type { Player, PlayerId } from '../types/game'

type Props = InstanceType<typeof GameSummary>['$props']

const michel: Player = { name: 'MICHEL', score: 42, color: 'white', targetScore: 100 }
const andre: Player = { name: 'ANDRÉ', score: 15, color: 'yellow', targetScore: 80 }

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

function banner(wrapper: Wrapper, side: PlayerId) {
  return wrapper.find(`[data-testid="summary-banner"] [data-testid="summary-${side}"]`)
}

function bannerPart(wrapper: Wrapper, side: PlayerId, testid: string) {
  return banner(wrapper, side).find(`[data-testid="${testid}"]`)
}

describe('GameSummary', () => {
  // AC3 (DT6) : nom et distance sont DEUX éléments, au modèle de bandeau de la 10.4 —
  // `NOM` puis le nombre nu, séparés d'un filet, sans `/`.
  it('shows each player with his distance in the banner, around a VS', () => {
    const wrapper = mountSummary()

    expect(bannerPart(wrapper, 'player1', 'summary-name').text()).toBe('MICHEL')
    expect(bannerPart(wrapper, 'player1', 'summary-distance').text()).toBe('100')
    expect(bannerPart(wrapper, 'player2', 'summary-name').text()).toBe('ANDRÉ')
    expect(bannerPart(wrapper, 'player2', 'summary-distance').text()).toBe('80')
    expect(wrapper.find('[data-testid="summary-banner"]').text()).toContain('VS')
    // Le couple est séparé d'un filet, plus d'une barre oblique — le `/` restant dans le
    // bandeau est celui de `CADRE 47/2`, d'où l'assertion visée sur le seul joueur.
    expect(banner(wrapper, 'player1').text()).not.toContain('/')
  })

  // DT6 : un nom long ne doit JAMAIS manger la distance. Le test verrouille les trois
  // classes dont dépend la troncature ; seule la passe navigateur dit si elle opère —
  // happy-dom ne calcule aucun CSS.
  it('truncates a long name alone, never the distance', () => {
    const wrapper = mountSummary({ player1: { ...michel, name: 'W'.repeat(20) } })
    const name = bannerPart(wrapper, 'player1', 'summary-name')
    const distance = bannerPart(wrapper, 'player1', 'summary-distance')

    expect(name.classes()).toContain('truncate')
    expect(name.classes()).toContain('min-w-0')
    expect(banner(wrapper, 'player1').classes()).toContain('min-w-0')
    // 1re passe de rendu : le couple monte de `text-label` à `text-tile-title`.
    expect(banner(wrapper, 'player1').classes()).toContain('text-tile-title')
    expect(distance.classes()).toContain('shrink-0')
    expect(distance.text()).toBe('100')
  })

  // Décision 3 de Nathan (2026-09-14) : les pastilles rendent les PNG du paramétrage,
  // servis depuis `public/` — aucune ressource réseau, l'app tourne hors ligne.
  // 1re passe de rendu : UNE seule pastille par joueur, dans la ligne `RÉSULTAT` — celle
  // du bandeau disait la bille une deuxième fois et volait la place au nom.
  it('renders one ball pellet per player with the setup pictos, never a coloured disc', () => {
    const wrapper = mountSummary()
    const sources = wrapper.findAll('img').map((img) => img.attributes('src'))

    expect(sources).toEqual(['/bille_blanche.png', '/bille_jaune.png'])
    expect(wrapper.find('[data-testid="summary-banner"] img').exists()).toBe(false)
    expect(column(wrapper, 'player1').find('img').attributes('src')).toBe('/bille_blanche.png')
    expect(wrapper.findAll('img').every((img) => img.attributes('aria-hidden') === 'true')).toBe(
      true,
    )
    expect(source).not.toContain('bg-player-white')
    expect(source).not.toContain('bg-player-yellow')
    expect(source).not.toContain('rounded-full')
  })

  // AC1 : la coquille de l'Epic 10 — conteneur à contour, aucun arrondi, plus de `bg-bg`
  // (le dégradé de l'écran est posé par `GameView`, le panneau n'est plus opaque).
  it('wears the outlined container of the epic, with no rounding left', () => {
    const root = mountSummary().find('[data-testid="game-summary"]')

    expect(root.classes()).toContain('border')
    expect(root.classes()).toContain('border-border')
    expect(root.classes()).not.toContain('bg-bg')
    expect(source).not.toContain('rounded-3xl')
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

// 1re passe de rendu : l'aplat est porté par chaque CELLULE, plus par la colonne — les
// blocs sont séparés d'une marge qui laisse voir le fond. La colonne victorieuse se lit
// donc à ses cinq cellules, toutes en ruban.
function ribbonCells(wrapper: Wrapper, side: PlayerId) {
  const cells = column(wrapper, side).element.children
  return [...cells].map((c) => c.classList.contains('bg-victory-ribbon'))
}

  // AC14 : la colonne du vainqueur entière en ruban rouge, l'autre neutre — et le mot.
  it('paints the whole winner column in the victory ribbon and reads VICTOIRE', () => {
    const wrapper = mountSummary({ winner: 'player1' })

    expect(ribbonCells(wrapper, 'player1')).toEqual([true, true, true, true, true])
    expect(cell(wrapper, 'player1', 'summary-result')).toBe('VICTOIRE')
    expect(ribbonCells(wrapper, 'player2')).toEqual([false, false, false, false, false])
    expect(cell(wrapper, 'player2', 'summary-result')).toBe('DÉFAITE')
  })

  it('paints the right column when the yellow player wins', () => {
    const wrapper = mountSummary({ winner: 'player2' })

    expect(ribbonCells(wrapper, 'player2')).toEqual([true, true, true, true, true])
    expect(cell(wrapper, 'player2', 'summary-result')).toBe('VICTOIRE')
    expect(cell(wrapper, 'player1', 'summary-result')).toBe('DÉFAITE')
  })

  it('highlights nobody on a tie and reads ÉGALITÉ twice', () => {
    const wrapper = mountSummary({ winner: null })

    expect(cell(wrapper, 'player1', 'summary-result')).toBe('ÉGALITÉ')
    expect(cell(wrapper, 'player2', 'summary-result')).toBe('ÉGALITÉ')
    expect(wrapper.findAll('.bg-victory-ribbon')).toHaveLength(0)
  })

  // Ordre revu à la 1re passe de rendu (Nathan) : le score d'abord, puis la moyenne APRÈS
  // le nombre de reprises dont elle se déduit.
  it('labels the five statistic rows, in the order Nathan settled on', () => {
    const wrapper = mountSummary()
    const labels = wrapper.findAll('.w-1\\/5 > span').map((s) => s.text())

    expect(labels).toEqual(['RÉSULTAT', 'POINTS', 'REPRISES', 'MOY', 'SÉRIE'])

    const rows = [...column(wrapper, 'player1').element.children].map(
      (c) => c.getAttribute('data-testid') ?? c.querySelector('[data-testid]')?.getAttribute('data-testid'),
    )
    expect(rows).toEqual([
      'summary-result',
      'summary-points',
      'summary-reprises',
      'summary-average',
      'summary-best',
    ])
  })

  // AC17 : l'état « nouveau record » existe par joueur, mais rien ne le déclenche ici.
  it('shows no record badge by default, and one per player when asked to', () => {
    expect(mountSummary().find('[data-testid="summary-record"]').exists()).toBe(false)

    const wrapper = mountSummary({ records: { player1: true, player2: false } })

    expect(column(wrapper, 'player1').find('[data-testid="summary-record"]').exists()).toBe(true)
    expect(column(wrapper, 'player2').find('[data-testid="summary-record"]').exists()).toBe(false)
  })

  // NFR10 : lisible à 2 m — les chiffres en `text-label`, jamais `text-stat`.
  // 2e passe de rendu (Nathan) : TOUTES les valeurs à la même taille, `POINTS` compris —
  // il tenait seul en `text-reprise` et écrasait les quatre autres lignes.
  it('sizes every figure the same, for reading at a distance', () => {
    const wrapper = mountSummary()
    const sizes = ['summary-points', 'summary-reprises', 'summary-average', 'summary-best'].map(
      (t) => column(wrapper, 'player1').find(`[data-testid="${t}"]`).classes(),
    )

    for (const classes of sizes) {
      expect(classes).toContain('text-label')
      expect(classes).not.toContain('text-reprise')
    }
  })

  // 2e passe de rendu : le bandeau est une BANDE CLAIRE fendue par une échancrure en
  // biais où se loge le VS. Les deux couples nom/distance s'y posent en sombre.
  it('seats both players on the light banner band, split by the VS notch', () => {
    const wrapper = mountSummary()

    for (const side of ['player1', 'player2'] as const) {
      const band = banner(wrapper, side)
      expect(band.classes()).toContain('bg-banner')
      expect(band.classes()).toContain('text-bg')
      expect(band.classes().some((c) => c.startsWith('[clip-path:polygon('))).toBe(true)
    }
  })

  // Le récap est terminal : le composant n'a aucune interaction.
  it('binds no pointer nor click handler at all', () => {
    expect(source).not.toContain('@pointerdown')
    expect(source).not.toContain('@click')
    expect(source).not.toContain('defineEmits')
  })

  // AR24 : le récap CONSERVE les côtés du scoreboard, sans quoi les deux se contrediraient
  // d'un écran à l'autre. `player1` est la bille BLANCHE, pas le joueur de gauche.
  it('keeps the white ball on the left by default', () => {
    const wrapper = mountSummary()
    const columns = wrapper.findAll('[data-testid="summary-column"]')

    expect(columns.map((c) => c.attributes('data-side'))).toEqual(['player1', 'player2'])
    expect(wrapper.find('[data-testid="summary-player1"]').text()).toContain('MICHEL')
  })

  it('seats the white ball on the right when the scoreboard did', () => {
    const wrapper = mountSummary({ whiteSide: 'right' })
    const columns = wrapper.findAll('[data-testid="summary-column"]')

    expect(columns.map((c) => c.attributes('data-side'))).toEqual(['player2', 'player1'])
  })

  // Le bandeau suit les colonnes : le premier nom lu est celui de la carte de gauche.
  it('orders the banner like the columns', () => {
    const banner = mountSummary({ whiteSide: 'right' }).find('[data-testid="summary-banner"]')

    expect(banner.text().indexOf('ANDRÉ')).toBeLessThan(banner.text().indexOf('MICHEL'))
  })
})
