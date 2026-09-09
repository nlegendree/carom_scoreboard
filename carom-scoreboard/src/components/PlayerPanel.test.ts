import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
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
