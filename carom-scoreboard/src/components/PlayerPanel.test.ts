import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerPanel from './PlayerPanel.vue'
import type { Player } from '../types/game'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return { id: 'player1', name: 'MICHEL', score: 0, color: 'white', ...overrides }
}

function mountPanel(player: Player, active = false) {
  return mount(PlayerPanel, { props: { player, active, targetScore: 40 } })
}

describe('PlayerPanel', () => {
  it('renders the player name, the score and the target score', () => {
    const wrapper = mountPanel(makePlayer({ name: 'MICHEL', score: 42 }))

    expect(wrapper.text()).toContain('MICHEL')
    expect(wrapper.text()).toContain('42')
    expect(wrapper.find('[data-testid="target-score"]').text()).toBe('40')
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
