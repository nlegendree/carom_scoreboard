import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CenterPanel from './CenterPanel.vue'
import ShotClock from './ShotClock.vue'
import { SHOT_CLOCK_SECONDS } from '../composables/useTimer'

// `secondsRemaining: null` = partie JDS, sans chrono (Story 2.1).
const baseProps = {
  repriseNumber: 1,
  secondsRemaining: null,
} as const

describe('CenterPanel', () => {
  it('displays the reprise number', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, repriseNumber: 3 } })

    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('3')
  })

  // Le mode de jeu a quitté la colonne centrale le 2026-09-09 : il est choisi au
  // démarrage et n'évolue pas, la colonne est réservée à ce qui change en cours de partie.
  it('no longer displays the game mode', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.text()).not.toContain('LIBRE')
    expect(wrapper.text()).not.toContain('CADRE')
  })

  // Le compteur doit rester dans sa colonne : il utilise `text-reprise`, dimensionné pour
  // le cinquième de largeur, et non `text-score` dont le plancher de 120px déborde
  // dès deux chiffres sur tablette.
  it('renders a two-digit reprise number with the column-sized token', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, repriseNumber: 88 } })
    const counter = wrapper.find('[data-testid="reprise-number"]')

    expect(counter.text()).toBe('88')
    expect(counter.classes()).toContain('text-reprise')
    expect(counter.classes()).not.toContain('text-score')
  })



  // --- Story 10.4 : `ANNULER` est descendu en barre basse, `PASSER LE TOUR` le remplace ---

  // AC5 : la colonne est réduite à REP, le chrono et le CTA de passage de tour.
  it('no longer holds the undo button', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.find('[data-testid="undo-button"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('ANNULER')
  })

  // AC6/AC7 : le geste change, la règle non — c'est `passTurn()` du store que la vue
  // branche derrière, exactement comme le tap sur la carte avant elle (AR23).
  it('emits pass-turn on the CTA', async () => {
    const wrapper = mount(CenterPanel, { props: baseProps })
    const cta = wrapper.find('[data-testid="pass-turn-button"]')

    expect(cta.text()).toContain('PASSER LE TOUR')
    await cta.trigger('pointerdown')

    expect(wrapper.emitted('pass-turn')).toHaveLength(1)
  })

  // AC8 : le CTA est TOUJOURS disponible en partie — il n'a pas d'état grisé propre.
  it('offers the CTA whatever the state of the game', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 12 } })

    expect(wrapper.find('[data-testid="pass-turn-button"]').attributes('disabled')).toBeUndefined()
  })

  // AC8 : inerte sous une pop-up de fin — `disabled` pour le visuel, garde pour le
  // comportement (les navigateurs ne s'accordent pas sur les contrôles désactivés).
  it('stays inert while an end-of-game prompt is open', async () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, passTurnDisabled: true } })
    const cta = wrapper.find('[data-testid="pass-turn-button"]')

    await cta.trigger('pointerdown')

    expect(wrapper.emitted('pass-turn')).toBeUndefined()
    expect(cta.attributes('disabled')).toBeDefined()
  })

  // AC9 : la pop-up de saisie se pose du côté opposé à la carte active et laisse la
  // colonne centrale visible — le CTA s'efface pour ne pas se retrouver sous le voile.
  it('hides the CTA while the score entry popup is open', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, entryOpen: true } })

    expect(wrapper.find('[data-testid="pass-turn-button"]').exists()).toBe(false)
  })

  // AC5 : conteneur à contour sur `--color-surface`, comme les autres panneaux de l'epic
  // — la colonne ne doit plus se lire comme un trou noir entre deux cartes pleines.
  it('is a bordered container on the epic surface', () => {
    const classes = mount(CenterPanel, { props: baseProps }).classes()

    expect(classes).toContain('bg-surface')
    expect(classes).toContain('border-border')
  })

  // AC16 : l'anneau du chrono déborde sur les cartes voisines — la colonne doit donc
  // laisser SORTIR son contenu. Si un `overflow-hidden` revient ici, le débordement meurt.
  it('lets the shot clock ring overflow the column', () => {
    const classes = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 40 } }).classes()

    expect(classes).toContain('overflow-visible')
    expect(classes).not.toContain('overflow-hidden')
  })

  // ⚠️ Le débordement se calcule sur la CONTENT BOX : la colonne portant `p-2` (16 px),
  // `-mx-2` + `calc(100% + 32px)` ne reconstitue que sa border-box et l'anneau n'en sort
  // PAS d'un pixel (défaut mesuré à la passe navigateur de la 10.4). Il faut le double.
  // Aucun CSS n'étant calculé en test, seule la classe peut être verrouillée ici.
  it('bleeds by twice the column padding, not by the padding itself', () => {
    const bleed = mount(CenterPanel, {
      props: { ...baseProps, secondsRemaining: 40 },
    }).find('[data-testid="shot-clock-bleed"]')

    expect(bleed.classes()).toContain('-mx-5')
    expect(bleed.classes()).toContain('w-[calc(100%+80px)]')
    expect(bleed.classes()).toContain('z-10')
  })


  // --- Story 2.1 : chrono de tir du 3 Bandes ---

  it('shows no shot clock when no countdown is provided', () => {
    const wrapper = mount(CenterPanel, { props: baseProps })

    expect(wrapper.findComponent(ShotClock).exists()).toBe(false)
  })

  it('mounts the shot clock with the countdown and its 40s scale', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 40 } })
    const clock = wrapper.findComponent(ShotClock)

    expect(clock.exists()).toBe(true)
    expect(clock.props('secondsRemaining')).toBe(40)
    expect(clock.props('totalSeconds')).toBe(SHOT_CLOCK_SECONDS)
  })

  // AC7 : le chrono à 0 reste affiché, anneau vide — il ne disparaît pas.
  it('keeps the shot clock mounted at zero', () => {
    const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 0 } })

    expect(wrapper.findComponent(ShotClock).exists()).toBe(true)
    expect(wrapper.find('[data-testid="shot-clock-value"]').text()).toBe('0')
  })

})
