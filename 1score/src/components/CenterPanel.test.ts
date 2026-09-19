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

  // AC5 demandait un conteneur sur `--color-surface` ; la Story 11.2 (Nathan, au rendu) fait
  // de la colonne la BASE NUE, `--color-bg` par héritage : un creux entre les deux cartes,
  // dans lequel le disque du chrono se fond sans aucun recalcul (il lit la même couleur).
  // ⚠️ SANS contour, contrairement à la lettre de l'AC (3e passe de rendu, Nathan) : le
  // filet clair s'interrompait derrière le disque du chrono qui déborde, et le raccord du
  // liseré de tour y laissait voir un trait gris. Ne pas le remettre sans revoir ce raccord.
  // ⚠️ Story 11.5 : « aucun fond DU TOUT » n'est plus tenable et n'est plus ce qu'on veut
  // dire. La colonne vit désormais DANS un bloc voilé (`GameView` › `game-columns`) : sans
  // fond, elle hériterait visuellement du voile et le creux arbitré par Nathan disparaîtrait.
  // L'intention est inchangée — la colonne EST LA BASE —, c'est le moyen qui change : elle la
  // déclare (`bg-bg`) au lieu de la laisser transparaître. Le filet, lui, reste interdit.
  // Story 11.5 (AC3), arbitrage de Nathan : le CREUX, pas le relief — le grand bloc est voilé,
  // la colonne centrale garde la base NUE et se creuse dedans, avec le rayon de BLOC des deux
  // cartes. ⚠️ Ce cas avait disparu par accident en réécrivant le test du débordement : il
  // est rétabli, et verrouille aussi le retrait arbitré le 2026-09-19 — le même que celui du
  // CTA de la barre basse dans sa barre (`ActionBar` › `p-1`).
  it('stays a rounded recess, inset like the bottom bar', () => {
    const classes = mount(CenterPanel, { props: baseProps }).classes()

    expect(classes).toEqual(expect.arrayContaining(['rounded-block', 'bg-bg', 'p-1']))
    expect(classes).not.toContain('p-2')
  })

  it('is a bare, borderless column that declares the base as its ground', () => {
    const classes = mount(CenterPanel, { props: baseProps }).classes()

    expect(classes).not.toContain('bg-surface')
    expect(classes).not.toContain('border-border')
    expect(classes).not.toContain('border')
    // La base, et RIEN d'autre : un seul fond, et c'est celui de la page.
    expect(classes.filter((c) => c.startsWith('bg-'))).toEqual(['bg-bg'])
  })

  // AC16 : l'anneau du chrono déborde sur les cartes voisines — la colonne doit donc
  // laisser SORTIR son contenu. Si un `overflow-hidden` revient ici, le débordement meurt.
  it('lets the shot clock ring overflow the column', () => {
    const classes = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 40 } }).classes()

    expect(classes).toContain('overflow-visible')
    expect(classes).not.toContain('overflow-hidden')
  })

  // ⚠️ Story 11.5 (Nathan, au rendu, 2026-09-18) : la zone ne DÉBORDE plus sur les cartes,
  // elle ANNULE le retrait de la colonne pour que l'anneau aille d'un bord à l'autre — « le
  // chrono le plus gros possible dans le container, tu peux retirer la padding autour de
  // l'anneau ». Le calcul reste sur la CONTENT BOX : `100%` vaut la colonne moins ses deux
  // `p-1`, d'où les 2 unités rendues et le `-mx-1` qui les recale. ⚠️ Les deux bougent
  // ENSEMBLE : si le retrait de la colonne change, ce calcul doit changer avec lui. En unités de grille, jamais
  // en pixels (la grille est fluide). Aucun CSS n'étant calculé en test, seule la classe peut
  // être verrouillée ici — c'est la passe navigateur qui prouve que le disque est d'aplomb.
  it('gives the clock the full width of its column, padding cancelled', () => {
    const bleed = mount(CenterPanel, {
      props: { ...baseProps, secondsRemaining: 40 },
    }).find('[data-testid="shot-clock-bleed"]')

    expect(bleed.classes()).toContain('w-[calc(100%_+_var(--spacing)_*_2)]')
    expect(bleed.classes()).toContain('-mx-1')
    // Le débordement est RETIRÉ : plus aucune classe ne lit le token disparu.
    expect(bleed.classes().join(' ')).not.toContain('--game-clock-bleed')
    // ⚠️ `z-20` conservé : il n'y a plus de liseré à masquer, mais l'ordre de peinture reste
    // explicite de part et d'autre (`PlayerPanel` › `ring-8` est à `z-10`).
    expect(bleed.classes()).toContain('z-20')
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

// --- Story 10.4, 4e passe de rendu : `PASSER LE TOUR` à place fixe ---

describe('CenterPanel — une place fixe pour PASSER LE TOUR', () => {
  // Le CTA doit tomber sous le même doigt en JDS et en 3 Bandes : c'est un geste qu'on
  // répète des dizaines de fois par partie. La colonne centrait sa pile, donc sans chrono
  // le CTA remontait au milieu — il changeait d'endroit d'un mode à l'autre.
  it('pins the CTA to the bottom in both modes', () => {
    for (const secondsRemaining of [null, 40]) {
      const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining } })
      const column = wrapper.find('[data-testid="pass-turn-button"]').element.parentElement!

      // `mt-auto` et non `justify-between` : sans chrono, le compteur est hors du flux et
      // il ne reste plus rien pour pousser le CTA vers le bas.
      expect(wrapper.find('[data-testid="pass-turn-button"]').classes()).toContain('mt-auto')
      expect(column.lastElementChild).toBe(wrapper.find('[data-testid="pass-turn-button"]').element)
    }
  })

  // Sans chrono, le compteur prend SA place au lieu de laisser un vide.
  it('lets the reprise counter take the clock slot when there is no clock', () => {
    const withClock = mount(CenterPanel, { props: { ...baseProps, secondsRemaining: 40 } })
    const without = mount(CenterPanel, { props: baseProps })
    const block = (w: ReturnType<typeof mount>) =>
      w.find('[data-testid="reprise-number"]').element.parentElement!.className

    // ⚠️ Sorti du flux et centré sur la HAUTEUR ENTIÈRE de la colonne : en `flex-1`, il se
    // centrait sur la place restant au-dessus du CTA, soit une cinquantaine de pixels plus
    // haut que les scores, qui se centrent eux dans une carte à bandeau et pied équilibrés.
    expect(block(withClock)).toContain('shrink-0')
    expect(block(without)).toContain('absolute')
    expect(block(without)).toContain('top-1/2')
    expect(block(without)).toContain('-translate-y-1/2')
    // La colonne doit être le référent de ce positionnement absolu.
    expect(without.classes()).toContain('relative')
  })

  // ⚠️ Un seul markup : le compteur n'est pas dupliqué pour changer de place, seule sa
  // classe change. Le dupliquer rouvrirait DT2 en miniature.
  it('renders the reprise counter exactly once, whatever the mode', () => {
    for (const secondsRemaining of [null, 40]) {
      const wrapper = mount(CenterPanel, { props: { ...baseProps, secondsRemaining } })

      expect(wrapper.findAll('[data-testid="reprise-number"]')).toHaveLength(1)
      expect(wrapper.findAll('[data-testid="reprise-label"]')).toHaveLength(1)
    }
  })
})
