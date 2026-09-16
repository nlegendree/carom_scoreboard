import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ShotClock from './ShotClock.vue'

// Story 2.1 : anneau circulaire du chrono de tir (forme du « SHOT CLOCK » CUESCO, fond
// noir, UX-DR4). L'arc est un cercle SVG dont le `stroke-dashoffset` grandit à mesure que
// le temps s'écoule : 0 = anneau plein. Revue au rendu (Nathan, 2026-09-11) : la couleur
// n'est plus un rouge fixe mais un fondu vert → jaune → orange → rouge, arc et chiffre.
describe('ShotClock', () => {
  // ⚠️ Le rayon de l'arc est un choix de RENDU (42 → 36 à la 1re passe de la 10.4, pour
  // rentrer l'arc dans le disque façon Cueuny). Le lire sur l'élément plutôt que le recopier :
  // ce qui doit être verrouillé ici, c'est la RELATION `dashoffset = C × (1 − ratio)`, pas
  // la valeur du jour.
  const circumference = (wrapper: ReturnType<typeof mount>) =>
    2 * Math.PI * Number(arc(wrapper).attributes('r'))

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

    expect(dashoffset(wrapper)).toBeCloseTo(circumference(wrapper) / 2, 5)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('20')
  })

  // AC7 : à 0 l'anneau est entièrement vidé et le chiffre reste affiché tel quel.
  it('empties the ring completely at zero and still shows the digit', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 0, totalSeconds: 40 } })

    expect(dashoffset(wrapper)).toBeCloseTo(circumference(wrapper), 5)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('0')
  })

  // Rôle `timer` (un compteur, pas une image) ; `aria-live="off"` : 40 annonces par
  // série seraient du bruit, la valeur se lit à la demande.
  it('exposes the remaining time to assistive technologies as a timer', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 17, totalSeconds: 40 } })
    const timer = wrapper.find('[role="timer"]')

    expect(timer.exists()).toBe(true)
    expect(timer.attributes('aria-live')).toBe('off')
    expect(timer.attributes('aria-label')).toBe('Chrono de tir : 17 secondes restantes')
    expect(wrapper.find('[role="img"]').exists()).toBe(false)
  })

  // Revue de code (2026-09-11) : un cap arrondi sur un dash de longueur nulle laisse un
  // point à midi — à 0 le cap redevient droit, l'anneau est réellement vide (AC7).
  // 3e passe de rendu de la 10.4 (Nathan) : cap PLAT en toutes circonstances — les
  // extrémités arrondies débordaient de la piste. Ce qui n'était qu'un cas particulier à
  // zéro (un dash de longueur nulle laissait un point à midi, AC7) devient la règle.
  it('keeps a flat cap at every value, so no dot remains at zero', () => {
    const full = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })
    const last = mount(ShotClock, { props: { secondsRemaining: 1, totalSeconds: 40 } })
    const empty = mount(ShotClock, { props: { secondsRemaining: 0, totalSeconds: 40 } })

    expect(arc(full).attributes('stroke-linecap')).toBe('butt')
    expect(arc(last).attributes('stroke-linecap')).toBe('butt')
    expect(arc(empty).attributes('stroke-linecap')).toBe('butt')
  })

  // Fond noir littéral (UX-DR4), sans libellé (retiré au rendu par Nathan, 2026-09-11).
  // 2e passe de rendu de la 10.4 (Nathan) : le disque se FOND dans la colonne au lieu de
  // trancher dessus. `bg-black` littéral le faisait lire comme une pastille posée sur un
  // fond gris-bleu ; le token vaut `--color-surface` composé sur `--color-bg`, soit
  // exactement ce que rend la colonne — mais opaque, le disque débordant sur les cartes.
  it('paints the ring on the column ground, blended, and without any label', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

    expect(wrapper.find('[role="timer"]').classes()).toContain('bg-shot-clock-face')
    expect(wrapper.find('[role="timer"]').classes()).not.toContain('bg-black')
    expect(wrapper.find('[data-testid="shot-clock-label"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('CHRONO')
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
    expect(ring.classes()).toContain('w-[min(100cqw,100cqh)]')
    expect(ring.classes()).not.toContain('w-full')
    expect(ring.classes()).toContain('[container-type:size]')
    // Le chiffre se dimensionne sur le DISQUE (`cqmin`), pas sur la zone : il a suivi l'arc
    // quand celui-ci est rentré (44 → 40 cqmin), le disque intérieur ayant rétréci. La
    // valeur vit dans le token `--text-clock` (DESIGN.md, Story 11.1), plus dans le gabarit.
    expect(wrapper.find('[data-testid="shot-clock-value"]').classes()).toContain('text-clock')
  })
})

// --- Story 10.4, 3e passe de rendu : le liseré de tour contourne le disque ---

describe('ShotClock — prolongement du liseré de tour', () => {
  const turnRing = (wrapper: ReturnType<typeof mount>) =>
    wrapper.find('[data-testid="shot-clock-turn-ring"]')
  // Le cercle rouge lui-même : enfant de la couche clippée (Story 11.1, 5e passe de rendu).
  const turnCircle = (wrapper: ReturnType<typeof mount>) =>
    wrapper.find('[data-testid="shot-clock-turn-circle"]')

  function mountClock(turnRingSide: 'left' | 'right' | null = null) {
    return mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40, turnRingSide } })
  }

  // Le disque déborde sur les cartes et coupe leur liseré : ce demi-anneau, collé à son
  // bord, en prend le relais et le contourne au lieu de le laisser interrompu.
  it('draws a half ring on the side of the card that has the turn', () => {
    const leftClock = mountClock('left')
    const left = turnRing(leftClock)
    const right = turnRing(mountClock('right'))

    expect(turnCircle(leftClock).classes()).toContain('border-turn-active')
    expect(turnCircle(leftClock).classes()).toContain('rounded-full')
    // ⚠️ La bande qui DÉPASSE (`--game-clock-bleed`), pas la moitié du disque : sinon
    // l'arc s'arrête au centre du disque, en pleine colonne, et ne raccorde pas au liseré.
    expect(left.classes()).toContain('[clip-path:inset(0_calc(100%_-_var(--game-clock-bleed))_0_0)]')
    expect(right.classes()).toContain('[clip-path:inset(0_0_0_calc(100%_-_var(--game-clock-bleed)))]')
  })

  // Même épaisseur que le `ring-8` de la carte : le raccord doit être invisible.
  it('matches the thickness of the card ring it continues', () => {
    expect(turnCircle(mountClock('left')).classes()).toContain('border-8')
  })

  // ⚠️ Le clip porte sur une COUCHE qui couvre la ZONE (`inset-0` de la racine), pas sur le
  // disque : la zone déborde de la colonne d'exactement `--game-clock-bleed`, le disque pas
  // forcément — quand la hauteur gouverne sa taille (1920×1080), il est plus étroit que la
  // zone, et un clip mesuré depuis son bord laissait un croissant rouge flotter dans la
  // colonne (bug relevé par Nathan, Story 11.1). Le cercle a la taille EXACTE du disque.
  it('clips the half ring at the zone edge, not at the disc edge', () => {
    const wrapper = mountClock('left')
    const layer = turnRing(wrapper)

    expect(layer.element.parentElement).toBe(wrapper.find('[data-testid="shot-clock"]').element)
    expect(layer.classes()).toEqual(expect.arrayContaining(['absolute', 'inset-0']))
    expect(wrapper.find('[data-testid="shot-clock"]').classes()).toContain('relative')
    expect(turnCircle(wrapper).classes()).toContain('w-[min(100cqw,100cqh)]')
    expect(wrapper.find('[data-testid="shot-clock-ring"]').classes()).toContain('w-[min(100cqw,100cqh)]')
    // Sans `aspect-square`, un cercle vide n'a pour hauteur que ses deux bordures : le
    // demi-anneau disparaîtrait sans qu'aucun autre cas ne rougisse.
    expect(turnCircle(wrapper).classes()).toContain('aspect-square')
    expect(wrapper.find('[data-testid="shot-clock-ring"]').classes()).toContain('aspect-square')
  })

  // Sans côté — hors partie, ou avant qu'un tour soit attribué — rien n'est dessiné.
  it('draws nothing without a side', () => {
    expect(turnRing(mountClock(null)).exists()).toBe(false)
  })

  // ⚠️ Un anneau COMPLET se lirait comme une alerte du chrono, pas comme un signal de tour :
  // la moitié tournée vers la carte inactive ne doit jamais être peinte.
  it('never paints a full ring', () => {
    for (const side of ['left', 'right'] as const) {
      expect(turnRing(mountClock(side)).classes().join(' ')).toContain('clip-path')
    }
  })
})
