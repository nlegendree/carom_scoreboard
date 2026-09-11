import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShotClock from './ShotClock.vue'

// Story 2.1 : anneau circulaire du chrono de tir (forme du « SHOT CLOCK » CUESCO, fond
// noir, UX-DR4). L'arc est un cercle SVG dont le `stroke-dashoffset` grandit à mesure que
// le temps s'écoule : 0 = anneau plein. Revue au rendu (Nathan, 2026-09-11) : la couleur
// n'est plus un rouge fixe mais un fondu vert → jaune → orange → rouge, arc et chiffre.
describe('ShotClock', () => {
  const CIRCUMFERENCE = 2 * Math.PI * 42

  function arc(wrapper: ReturnType<typeof mount>) {
    return wrapper.find('[data-testid="shot-clock-arc"]')
  }

  function styleValue(el: { attributes: (name: string) => string | undefined }, prop: string) {
    return el.attributes('style')!.match(new RegExp(`${prop}:\\s*([^;]+)`))![1]!.trim()
  }

  function dashoffset(wrapper: ReturnType<typeof mount>) {
    return Number.parseFloat(styleValue(arc(wrapper), 'stroke-dashoffset'))
  }

  function hue(value: string) {
    return Number(value.match(/hsl\((\d+)/)![1])
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

  // Fond noir littéral (UX-DR4), libellé CHRONO au-dessus, comme REP.
  it('paints the ring on a black ground under a CHRONO label', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

    expect(wrapper.find('[role="img"]').classes()).toContain('bg-black')
    expect(wrapper.find('[data-testid="shot-clock-label"]').text()).toBe('CHRONO')
  })

  // Fondu (revue de Nathan) : vert à 40 s, rouge d'alerte à 0 s — la même couleur sur
  // l'arc, sa piste et le chiffre.
  it('starts green and ends on the alert red, arc and digit alike', () => {
    const full = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })
    const empty = mount(ShotClock, { props: { secondsRemaining: 0, totalSeconds: 40 } })

    const fullColor = styleValue(arc(full), 'stroke')
    const emptyColor = styleValue(arc(empty), 'stroke')

    expect(hue(fullColor)).toBe(130)
    expect(emptyColor).toBe('hsl(3 100% 59%)')
    expect(styleValue(full.find('[data-testid="shot-clock-value"]'), 'color')).toBe(fullColor)
    expect(styleValue(empty.find('[data-testid="shot-clock-value"]'), 'color')).toBe(emptyColor)
    expect(styleValue(full.find('[data-testid="shot-clock-track"]'), 'stroke')).toBe(fullColor)
  })

  // Le fondu passe par le jaune puis l'orange : la teinte descend avec le temps.
  it('goes through yellow then orange on the way down', () => {
    const at = (seconds: number) =>
      hue(styleValue(arc(mount(ShotClock, { props: { secondsRemaining: seconds, totalSeconds: 40 } })), 'stroke'))

    expect(at(20)).toBeGreaterThan(at(10))
    expect(at(10)).toBeGreaterThan(at(3))
    // ~ jaune à mi-course, ~ orange dans le dernier quart.
    expect(at(20)).toBeGreaterThanOrEqual(55)
    expect(at(20)).toBeLessThanOrEqual(75)
    expect(at(8)).toBeGreaterThanOrEqual(20)
    expect(at(8)).toBeLessThanOrEqual(40)
  })

  // Revue de Nathan (iPad paysage avec la barre Safari) : l'anneau doit prendre la place
  // qui RESTE dans la colonne, pas une largeur fixe — sinon REP et ÉCHANGER sont rognés.
  it('sizes the ring from its container instead of a fixed width', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

    const root = wrapper.find('[data-testid="shot-clock"]')
    expect(root.classes()).toEqual(
      expect.arrayContaining(['flex-1', 'min-h-0', 'justify-center', '[container-type:size]']),
    )
    const ring = wrapper.find('[data-testid="shot-clock-ring"]')
    expect(ring.classes()).toContain('w-[min(100cqw,calc(100cqh_-_32px))]')
    expect(ring.classes()).not.toContain('w-full')
    expect(ring.classes()).toContain('[container-type:size]')
    expect(wrapper.find('[data-testid="shot-clock-value"]').classes()).toContain('text-[44cqmin]')
  })
})
