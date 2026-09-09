import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node à `src/`, et on ne les y ajoute pas pour un seul test.
import source from './PlayerPanel.vue?raw'
import PlayerPanel from './PlayerPanel.vue'
import type { Player } from '../types/game'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return { id: 'player1', name: 'MICHEL', score: 0, color: 'white', targetScore: 0, ...overrides }
}

function mountPanel(player: Player, active = false) {
  return mount(PlayerPanel, { props: { player, active } })
}

describe('PlayerPanel', () => {
  // La distance appartient au joueur (handicap) : le panneau lit celle de SON joueur.
  it('renders the player name, the score and the target score of its own player', () => {
    const wrapper = mountPanel(makePlayer({ name: 'MICHEL', score: 42, targetScore: 40 }))

    expect(wrapper.text()).toContain('MICHEL')
    expect(wrapper.text()).toContain('42')
    expect(wrapper.find('[data-testid="target-score"]').text()).toBe('40')
  })

  // Distance libre : rien à lire, pas même un tiret ou un zéro (NFR12).
  it('leaves the target score slot empty when the player has no distance', () => {
    const wrapper = mountPanel(makePlayer({ score: 42, targetScore: 0 }))

    expect(wrapper.find('[data-testid="target-score"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('42')
  })

  // Deux distances dissociées ne doivent pas s'afficher l'une à la place de l'autre.
  it('never shows the other player distance', () => {
    const white = mountPanel(makePlayer({ targetScore: 100 }))
    const yellow = mountPanel(makePlayer({ id: 'player2', color: 'yellow', targetScore: 80 }))

    expect(white.find('[data-testid="target-score"]').text()).toBe('100')
    expect(yellow.find('[data-testid="target-score"]').text()).toBe('80')
  })

  // Story 1.6, décision produit (2026-09-09) : PAS de score restant en jeux de série.
  // L'annonce « Pour n » suppose un score qui avance point par point ; elle est réservée
  // au 3 Bandes (Epic 2, Story 2.2). Ce test verrouille la règle pour qu'un futur dev ne
  // réintroduise pas le restant en JDS par réflexe.
  it('shows the distance but never a remaining count in series games', () => {
    const wrapper = mountPanel(makePlayer({ score: 37, targetScore: 100 }))

    expect(wrapper.find('[data-testid="target-score"]').text()).toBe('100')
    expect(wrapper.text()).not.toContain('63')
    expect(wrapper.text()).not.toMatch(/RESTE|POUR/)
  })

  it('renders each ball as a full colour block with readable text', () => {
    const white = mountPanel(makePlayer({ color: 'white' }))
    expect(white.classes()).toContain('bg-player-white')
    expect(white.classes()).toContain('text-on-player-white')

    const yellow = mountPanel(makePlayer({ id: 'player2', color: 'yellow' }))
    expect(yellow.classes()).toContain('bg-player-yellow')
    expect(yellow.classes()).toContain('text-on-player-yellow')
  })

  it('frames the active player with the turn ring', () => {
    const active = mountPanel(makePlayer(), true)
    expect(active.classes()).toContain('ring-8')
    expect(active.classes()).toContain('ring-turn-active')

    const inactive = mountPanel(makePlayer(), false)
    expect(inactive.classes()).not.toContain('ring-8')
  })
})

// --- Story 1.5 (refonte du 2026-09-09) : score maximal, statistiques, tap pour
//     rendre la main. La saisie a quitté le panneau pour `ScoreEntryModal`. ---

describe('PlayerPanel — score, statistiques et bascule au tap', () => {
  // Le score doit être le plus gros possible : plus aucun pavé dans la carte.
  it('holds no numeric pad any more', () => {
    const wrapper = mountPanel(makePlayer())

    expect(wrapper.findComponent({ name: 'NumericPad' }).exists()).toBe(false)
    expect(wrapper.find('[data-testid="digit-5"]').exists()).toBe(false)
  })

  it('shows the average and the best series of its own player', () => {
    const wrapper = mount(PlayerPanel, {
      props: { player: makePlayer({ score: 8 }), active: false, average: 8 / 3, bestSeries: 5 },
    })

    expect(wrapper.find('[data-testid="average"]').text()).toBe('2.667')
    expect(wrapper.find('[data-testid="best-series"]').text()).toBe('5')
  })

  // Statistiques en tête de carte, avec le nom et la distance : le bas est réservé aux
  // boutons de correction, et le score garde toute la hauteur centrale.
  it('puts the statistics in the card header, above the score', () => {
    const wrapper = mountPanel(makePlayer({ score: 42 }))

    const header = wrapper.find('[data-testid="panel-header"]')
    expect(header.find('[data-testid="average"]').exists()).toBe(true)
    expect(header.find('[data-testid="best-series"]').exists()).toBe(true)
    expect(header.find('[data-testid="score"]').exists()).toBe(false)
  })

  // Nom, statistiques et distance tiennent sur UNE SEULE ligne d'en-tête.
  it('lines up the name, the statistics and the distance in a single header row', () => {
    const wrapper = mountPanel(makePlayer({ name: 'MICHEL', targetScore: 100 }))

    const header = wrapper.find('[data-testid="panel-header"]')
    expect(header.text()).toContain('MICHEL')
    expect(header.find('[data-testid="average"]').exists()).toBe(true)
    expect(header.find('[data-testid="best-series"]').exists()).toBe(true)
    expect(header.find('[data-testid="target-score"]').text()).toBe('100')
  })

  // Le nom est le SEUL élément élastique de la ligne : quand la place manque, c'est lui
  // qui se tronque — jamais une valeur chiffrée, qui deviendrait fausse à la lecture.
  it('lets the name shrink but never the figures', () => {
    const wrapper = mountPanel(makePlayer({ name: 'MICHEL' }))

    const name = wrapper.find('[data-testid="panel-header"] span')
    expect(name.classes()).toContain('truncate')
    expect(name.classes()).toContain('min-w-0')
    expect(wrapper.find('[data-testid="panel-stats"]').classes()).toContain('shrink-0')
  })

  // Correction manuelle du total : ±1 par appui, sur SON joueur.
  it('emits a signed correction on the minus and plus buttons', async () => {
    const wrapper = mountPanel(makePlayer())

    await wrapper.find('[data-testid="score-plus"]').trigger('pointerdown')
    await wrapper.find('[data-testid="score-minus"]').trigger('pointerdown')

    expect(wrapper.emitted('adjust-score')).toEqual([[1], [-1]])
  })

  // ⚠️ La carte entière rend la main au tap. Sans arrêt de propagation, corriger le score
  // du joueur adverse lui donnerait la main du même geste.
  it('never hands the turn over when a correction button is pressed', async () => {
    const wrapper = mountPanel(makePlayer(), false)

    await wrapper.find('[data-testid="score-plus"]').trigger('pointerdown')
    await wrapper.find('[data-testid="score-minus"]').trigger('pointerdown')

    expect(wrapper.emitted('pass-turn')).toBeUndefined()
  })

  // Les corrections restent disponibles des deux côtés, y compris sur le panneau actif.
  it('offers the correction buttons on both panels', () => {
    const active = mountPanel(makePlayer(), true)
    const inactive = mountPanel(makePlayer(), false)

    for (const wrapper of [active, inactive]) {
      expect(wrapper.find('[data-testid="score-minus"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="score-plus"]').exists()).toBe(true)
    }
  })

  // Convention des fédérations de billard : moyenne générale à 3 décimales.
  it('always shows three decimals on the average', () => {
    const wrapper = mount(PlayerPanel, {
      props: { player: makePlayer(), active: false, average: 2, bestSeries: 0 },
    })

    expect(wrapper.find('[data-testid="average"]').text()).toBe('2.000')
  })

  // Le score occupe la carte : sa taille suit le nombre de chiffres, sinon un total à
  // trois chiffres déborderait de la largeur du panneau (40 % de l'écran).
  it('shrinks the score type as digits are added', () => {
    const oneDigit = mountPanel(makePlayer({ score: 7 }))
    const threeDigits = mountPanel(makePlayer({ score: 123 }))

    const sizeOf = (w: ReturnType<typeof mountPanel>) =>
      w.find('[data-testid="score"]').classes().find((c) => c.startsWith('text-['))

    expect(sizeOf(oneDigit)).toBeDefined()
    expect(sizeOf(threeDigits)).toBeDefined()
    expect(sizeOf(oneDigit)).not.toBe(sizeOf(threeDigits))
  })

  // On tape la zone de l'ADVERSAIRE pour lui rendre la main : le panneau qui a déjà
  // la main ne doit donc rien émettre.
  it('emits pass-turn when the panel without the hand is tapped', async () => {
    const wrapper = mountPanel(makePlayer(), false)

    await wrapper.trigger('pointerdown')

    expect(wrapper.emitted('pass-turn')).toHaveLength(1)
  })

  it('stays inert when the panel that already has the hand is tapped', async () => {
    const wrapper = mountPanel(makePlayer(), true)

    await wrapper.trigger('pointerdown')

    expect(wrapper.emitted('pass-turn')).toBeUndefined()
  })

  // CLAUDE.md §2 : une zone tactile qui n'est pas un `<button>` doit porter
  // `role="button"` pour hériter du CSS global `touch-action: manipulation`.
  it('declares the tappable panel as a button for the global touch CSS', () => {
    const wrapper = mountPanel(makePlayer(), false)

    expect(wrapper.attributes('role')).toBe('button')
  })

  // AR8 : `@pointerdown` seul, jamais `@click` — sinon le délai tactile de 300 ms
  // revient sur iPad, ce qu'aucun test de comportement ne verrait.
  it('never binds a click handler', () => {
    expect(source).not.toContain('@click')
    expect(source).not.toContain('@touchstart')
  })
})
