import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShotClock from './ShotClock.vue'

// Story 2.1 : anneau circulaire du chrono de tir (forme du « SHOT CLOCK » CUESCO, couleurs
// du projet — rouge LED sur fond noir, UX-DR4). L'arc est un cercle SVG dont le
// `stroke-dashoffset` grandit à mesure que le temps s'écoule : 0 = anneau plein.
describe('ShotClock', () => {
  const CIRCUMFERENCE = 2 * Math.PI * 42

  function arc(wrapper: ReturnType<typeof mount>) {
    return wrapper.find('[data-testid="shot-clock-arc"]')
  }

  function dashoffset(wrapper: ReturnType<typeof mount>) {
    return Number.parseFloat(arc(wrapper).attributes('style')!.match(/stroke-dashoffset:\s*([\d.]+)/)![1]!)
  }

  it('draws a full ring at the start of the countdown', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

    expect(dashoffset(wrapper)).toBe(0)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('40')
  })

  it('draws a half ring at mid-countdown', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 20, totalSeconds: 40 } })

    expect(dashoffset(wrapper)).toBeCloseTo(CIRCUMFERENCE / 2, 5)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('20')
  })

  // AC7 : à 0 l'anneau est entièrement vidé et le chiffre reste affiché tel quel.
  it('empties the ring completely at zero and still shows the digit', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 0, totalSeconds: 40 } })

    expect(dashoffset(wrapper)).toBeCloseTo(CIRCUMFERENCE, 5)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('0')
  })

  it('exposes the remaining time to assistive technologies', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 17, totalSeconds: 40 } })

    expect(wrapper.find('[role="img"]').attributes('aria-label')).toContain('17')
  })

  // UX-DR4 : rouge LED sur fond noir littéral — pas `bg-bg` (gris-bleu) ni `on-alert`.
  it('paints the arc and digit in alert red on a black ground', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

    expect(arc(wrapper).classes()).toContain('stroke-alert')
    expect(wrapper.find('[data-testid="shot-clock-value"]').classes()).toContain('text-alert')
    expect(wrapper.find('[role="img"]').classes()).toContain('bg-black')
    expect(wrapper.find('[data-testid="shot-clock-label"]').text()).toBe('CHRONO')
  })
})
