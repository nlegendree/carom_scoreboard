import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CtaButton from './CtaButton.vue'
import type { CtaVariant } from './CtaButton.vue'

// happy-dom ne calcule aucun CSS : ce fichier verrouille les CLASSES rendues, jamais leur
// effet — comme `tokens.test.ts` et `typography.test.ts`. Le rendu se vérifie au navigateur
// (et, pour cette story, par la comparaison de captures avant/après).

// Les six variantes, en un seul endroit : une variante ajoutée à `CtaVariant` sans entrée ici
// est refusée par le compilateur.
const VARIANTS = ['accent', 'neutral', 'setup', 'start', 'bar', 'pass'] as const satisfies readonly CtaVariant[]

const mountCta = (variant: CtaVariant, props: Record<string, unknown> = {}) =>
  mount(CtaButton, { props: { variant, ...props }, slots: { default: 'LIBELLÉ' } })

describe('CtaButton', () => {
  // Story 11.5 (Nathan, au rendu, 2026-09-19, « K1 ») : chaque variante porte le relief de SA
  // couleur — une tranche teintée, jamais noire (elle se perdait sur les fonds sombres) — et les
  // six s'enfoncent de la même façon : tranche retirée, descente de `--size-relief-depth`, le token
  // qui fait aussi l'épaisseur de la tranche.
  const RELIEF: Record<CtaVariant, string> = {
    accent: 'shadow-cta-relief-blue',
    neutral: 'shadow-cta-relief-neutral',
    setup: 'shadow-cta-relief-blue',
    start: 'shadow-cta-relief-red',
    bar: 'shadow-cta-relief-blue',
    pass: 'shadow-cta-relief-blue',
  }
  it.each(VARIANTS)('gives the %s variant the relief of its colour, and sinks it on press', (variant) => {
    const classes = mountCta(variant).classes()

    expect(classes).toContain(RELIEF[variant])
    expect(classes).toEqual(expect.arrayContaining(['active:translate-y-(--size-relief-depth)', 'active:shadow-cta-relief-active']))
    expect(classes).not.toContain('shadow-light-edge-start')
  })

  it('renders a real button that never submits a form', () => {
    const wrapper = mountCta('accent')

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.text()).toBe('LIBELLÉ')
  })

  // AR8 : `@pointerdown`, jamais `@click` — un `@click` réintroduirait le délai de 300 ms sur
  // iPad, et aucun test unitaire ne le verrait à l'usage.
  it('emits press on pointerdown, not on click', async () => {
    const wrapper = mountCta('accent')

    await wrapper.trigger('pointerdown')
    expect(wrapper.emitted('press')).toHaveLength(1)

    await wrapper.trigger('click')
    expect(wrapper.emitted('press')).toHaveLength(1)
  })

  it('carries disabled and stays silent when disabled', async () => {
    const wrapper = mountCta('pass', { disabled: true })

    expect(wrapper.attributes('disabled')).toBeDefined()

    await wrapper.trigger('pointerdown')
    expect(wrapper.emitted('press')).toBeUndefined()
  })

  // Revue du 2026-09-17, décision de Nathan : l'état inactif est UNIVERSEL. Il ne portait que
  // sur `pass` — un `variant="accent" :disabled` rendait un bouton au dégradé intact, sans
  // retour d'appui, impossible à distinguer d'un CTA vivant. L'écran d'identification joueur
  // de l'Epic 4 doit pouvoir griser son `VALIDER` sans rien créer.
  it.each(VARIANTS)('renders an inactive state for the %s variant', (variant) => {
    expect(mountCta(variant, { disabled: true }).classes()).toEqual(
      // Plat quand il est mort (revue de la 11.5) : la tranche tombe avec l'opacité.
      expect.arrayContaining(['disabled:opacity-30', 'disabled:shadow-none']),
    )
  })

  it('is not disabled by default', () => {
    expect(mountCta('accent').attributes('disabled')).toBeUndefined()
  })

  // AC6 : la règle globale de `main.css` (`button { touch-action: manipulation; user-select:
  // none }`) couvre tout `<button>` — le CTA n'a pas à la répéter.
  it.each(VARIANTS)(
    'never repeats touch-manipulation / select-none (%s)',
    (variant) => {
      const classes = mountCta(variant).classes()

      expect(classes).not.toContain('touch-manipulation')
      expect(classes).not.toContain('select-none')
    },
  )

  // Chaque variante porte le rayon tapable et l'encre blanche : c'est ce qui fait qu'elles
  // se lisent comme une seule famille.
  it.each(VARIANTS)(
    'shares the tappable radius and white ink (%s)',
    (variant) => {
      const classes = mountCta(variant).classes()

      expect(classes).toContain('rounded-tappable')
      expect(classes).toContain('text-white')
    },
  )

  // Une assertion de classes par variante : fond, rôle typographique, géométrie, appui.
  it('renders the accent variant', () => {
    const classes = mountCta('accent').classes()

    expect(classes).toContain('bg-(image:--gradient-blue)')
    expect(classes).toContain('text-label')
    expect(classes).toContain('font-black')
    expect(classes).toContain('min-h-(--size-touch-target)')
    expect(classes).toContain('active:brightness-90')
  })

  // Revue du 2026-09-17 : `accent` laisse sa largeur à l'appelant, comme `neutral`. La 11.3 y
  // avait ajouté un `w-full` que l'ancien markup ne portait pas, empilé sur le `flex-1` de ses
  // trois appelants de saisie — deux utilitaires de largeur sur le même élément.
  it('leaves the width of the accent variant to its caller', () => {
    expect(mountCta('accent').classes()).not.toContain('w-full')
  })

  // AC2 : le CTA neutre a UN SEUL retour d'appui, celui que `DESIGN.md` nomme. Il
  // s'ÉCLAIRCIT (`brightness(1.25)`) — les trois hôtes de saisie l'assombrissaient.
  it('renders the neutral variant, brightened on press', () => {
    const classes = mountCta('neutral').classes()

    expect(classes).toContain('bg-(image:--gradient-neutral)')
    expect(classes).toContain('text-label')
    expect(classes).toContain('font-black')
    expect(classes).toContain('min-h-(--size-touch-target)')
    expect(classes).toContain('active:brightness-125')
    expect(classes).not.toContain('active:brightness-90')
  })

  // La largeur du neutre est CONTEXTUELLE (`w-full` en pop-up de décision, `w-1/3` en pop-up
  // de saisie) : la variante n'en porte aucune, sans quoi deux utilitaires `w-*` se
  // disputeraient la même propriété et l'ordre de la feuille générée trancherait.
  it('leaves the width of the neutral variant to its caller', () => {
    expect(mountCta('neutral').classes()).not.toContain('w-full')
  })

  it('renders the setup variant', () => {
    const classes = mountCta('setup').classes()

    expect(classes).toContain('bg-(image:--gradient-blue)')
    expect(classes).toContain('text-label')
    expect(classes).toContain('font-bold')
    expect(classes).toContain('gap-2')
    expect(classes).toContain('min-h-(--size-touch-target)')
    expect(classes).toContain('active:brightness-90')
  })

  it('renders the start variant', () => {
    const classes = mountCta('start').classes()

    expect(classes).toContain('bg-(image:--gradient-red)')
    expect(classes).toContain('text-start-button')
    expect(classes).toContain('tracking-label')
    // Le filet clair qu'elle était seule à porter vit désormais dans son relief (Story 11.5).
    expect(classes).toContain('shadow-cta-relief-red')
    expect(classes).toContain('min-h-(--size-start-button)')
    expect(classes).toContain('active:brightness-90')
  })

  it('renders the bar variant', () => {
    const classes = mountCta('bar').classes()

    expect(classes).toContain('bg-(image:--gradient-blue)')
    expect(classes).toContain('text-label')
    expect(classes).toContain('tracking-label')
    expect(classes).toContain('px-4')
    expect(classes).toContain('min-h-(--size-touch-target)')
    expect(classes).toContain('active:brightness-90')
  })

  // `PASSER LE TOUR` est une famille à part (`DESIGN.md` › Components › Buttons) : picto
  // AU-DESSUS du libellé, rôle `stat`, et un état inactif — trois dérogations qu'absorber
  // dans `accent` aurait coûtées.
  it('renders the pass variant', () => {
    const classes = mountCta('pass').classes()

    expect(classes).toContain('bg-(image:--gradient-blue)')
    expect(classes).toContain('text-stat')
    expect(classes).toContain('flex-col')
    expect(classes).toContain('disabled:opacity-30')
    expect(classes).toContain('min-h-(--size-touch-target)')
    expect(classes).toContain('active:brightness-90')
  })

  // Ce qui reste à l'appelant (largeur contextuelle, `mt-auto`, `relative overflow-hidden`)
  // passe par la fusion de `class` de Vue, sans remplacer les classes de la variante.
  it('merges the caller classes with the variant classes', () => {
    const wrapper = mount(CtaButton, {
      props: { variant: 'accent' },
      attrs: { class: 'flex-1 relative overflow-hidden' },
    })

    expect(wrapper.classes()).toContain('flex-1')
    expect(wrapper.classes()).toContain('overflow-hidden')
    expect(wrapper.classes()).toContain('bg-(image:--gradient-blue)')
  })

  // Le contenu est un slot : libellé seul, picto + libellé, ou libellé + barre de rebours.
  it('renders whatever the caller puts in its slot', () => {
    const wrapper = mount(CtaButton, {
      props: { variant: 'accent' },
      slots: { default: '<span data-testid="countdown" />VALIDER' },
    })

    expect(wrapper.find('[data-testid="countdown"]').exists()).toBe(true)
    expect(wrapper.text()).toBe('VALIDER')
  })

  // Aucune classe construite à la volée : le scanner JIT de Tailwind v4 ne voit que les
  // classes écrites en toutes lettres, et une interpolation n'émettrait rien, en silence.
  it('writes every variant class literally', async () => {
    const source = (await import('./CtaButton.vue?raw')).default

    expect(source).not.toMatch(/`[^`]*\$\{[^}]*\}[^`]*`/)
  })
})
