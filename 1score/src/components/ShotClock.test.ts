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
  // fond gris-bleu. Depuis la Story 11.2 la colonne est la base NUE (`--color-bg`) et le
  // disque lit la même couleur (`bg-bg`) : plus de token propre, plus rien à recalculer, il
  // ne se distingue que là où il déborde sur les cartes claires.
  it('paints the ring on the column ground, blended, and without any label', () => {
    const wrapper = mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

    expect(wrapper.find('[role="timer"]').classes()).toContain('bg-bg')
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

// --- Story 11.5 : le liseré de tour n'est plus l'affaire du chrono ---

describe('ShotClock — plus de prolongement de liseré', () => {
  // ⚠️ Nathan, au rendu (2026-09-18) : « on va abandonner l'effet de débordement ». Le disque
  // ne mord plus les cartes, donc il ne coupe plus leur liseré, donc il n'a plus rien à en
  // prolonger. Les cinq cas qui décrivaient le demi-anneau (clip sur la bande débordante,
  // épaisseur accordée au `ring-8`, clip mesuré depuis la ZONE et non depuis le disque,
  // absence hors partie, jamais d'anneau complet) tombent avec lui — ils vérifiaient une
  // géométrie qui n'existe plus, et les garder verts aurait demandé de garder le code mort.
  // Ce qui les remplace est un GARDE-FOU : le chrono ne doit plus rien peindre de rouge, et
  // ne doit plus rien savoir du tour. Sans ce cas, un demi-anneau pourrait revenir en silence
  // à la prochaine passe de rendu, avec le raccord impossible qui l'accompagnait.
  const clock = () => mount(ShotClock, { props: { secondsRemaining: 40, totalSeconds: 40 } })

  it('paints no turn ring at all', () => {
    const wrapper = clock()

    expect(wrapper.find('[data-testid="shot-clock-turn-ring"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="shot-clock-turn-circle"]').exists()).toBe(false)
  })

  // Le chrono ne connaît plus le côté qui joue : `turnSide` a disparu de `GameView` jusqu'ici.
  // Un composant qui ignore le tour ne peut pas se remettre à le dessiner par accident.
  it('knows nothing about whose turn it is', () => {
    expect(Object.keys(clock().props())).toEqual(['secondsRemaining', 'totalSeconds'])
  })

  // ⚠️ Le débordement lui-même : plus aucune classe du chrono ne lit le token retiré.
  it('reads no clock bleed token anywhere', () => {
    expect(clock().html()).not.toContain('--game-clock-bleed')
  })
})
