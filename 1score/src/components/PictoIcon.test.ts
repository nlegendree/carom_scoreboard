import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PictoIcon from './PictoIcon.vue'
import type { PictoName } from '../types/ui'

const EXPECTED_PATH_COUNTS: Record<PictoName, number> = {
  training: 3,
  signup: 4,
  power: 2,
  'arrow-right': 2,
  'arrow-left': 2,
  gear: 2,
  close: 2,
  refresh: 4,
  'arrow-right-left': 4,
  'chevron-right': 1,
}

describe('PictoIcon', () => {
  it.each(Object.entries(EXPECTED_PATH_COUNTS) as [PictoName, number][])(
    'draws one path per stroke for %s',
    (name, count) => {
      const wrapper = mount(PictoIcon, { props: { name } })

      expect(wrapper.findAll('path')).toHaveLength(count)
    },
  )

  // Décoratif : le libellé voisin porte le sens, le lecteur d'écran ne doit pas lire le SVG.
  it('renders a decorative stroked svg', () => {
    const svg = mount(PictoIcon, { props: { name: 'power' } }).find('svg')

    expect(svg.attributes('aria-hidden')).toBe('true')
    expect(svg.attributes('stroke-width')).toBe('2')
    expect(svg.attributes('fill')).toBe('none')
    expect(svg.attributes('stroke')).toBe('currentColor')
    expect(svg.attributes('viewBox')).toBe('0 0 24 24')
  })

  it('draws a different shape for each name', () => {
    const shapes = (Object.keys(EXPECTED_PATH_COUNTS) as PictoName[]).map((name) =>
      mount(PictoIcon, { props: { name } })
        .findAll('path')
        .map((path) => path.attributes('d'))
        .join('|'),
    )

    expect(new Set(shapes).size).toBe(shapes.length)
  })
})
