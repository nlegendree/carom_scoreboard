import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PopupCard from './PopupCard.vue'

// happy-dom ne calcule aucun CSS : ce fichier verrouille les classes, les attributs ARIA et
// le style en ligne du placement — jamais leur effet. Le rendu se prouve par la comparaison
// de captures avant/après (AC7).

const mountCard = (props: Record<string, unknown> = {}) =>
  mount(PopupCard, {
    props: {
      testid: 'test-popup',
      cardTestid: 'test-card',
      label: 'Une pop-up',
      width: 'pad',
      gap: 'sm',
      ...props,
    },
    slots: { default: '<p data-testid="body">corps</p>', footer: '<span>CTA</span>' },
  })

const backdrop = (wrapper: ReturnType<typeof mountCard>) => wrapper
const card = (wrapper: ReturnType<typeof mountCard>) =>
  wrapper.find('[data-testid="test-card"]')

describe('PopupCard', () => {
  it('puts the testid the caller gives it on the rendered root', () => {
    // ⚠️ Des dizaines de cas de `GameView.test.ts` et `HomeScreen.test.ts` lisent ces
    // `data-testid` : la racine rendue DOIT porter celui que l'appelant transmet.
    const wrapper = mountCard()

    expect(wrapper.attributes('data-testid')).toBe('test-popup')
    expect(card(wrapper).exists()).toBe(true)
  })

  it('renders the full-screen backdrop of the shared pattern', () => {
    const classes = backdrop(mountCard()).classes()

    expect(classes).toContain('fixed')
    expect(classes).toContain('inset-0')
    expect(classes).toContain('z-50')
    expect(classes).toContain('bg-black/25')
  })

  it('renders the glass card of the shared pattern', () => {
    const classes = card(mountCard()).classes()

    expect(classes).toContain('rounded-popup')
    expect(classes).toContain('border')
    expect(classes).toContain('border-border')
    expect(classes).toContain('bg-bg-raised/88')
    expect(classes).toContain('p-3')
    expect(classes).toContain('shadow-popup')
    expect(classes).toContain('backdrop-blur-sm')
  })

  it('renders both slots', () => {
    const wrapper = mountCard()

    expect(wrapper.find('[data-testid="body"]').exists()).toBe(true)
    expect(wrapper.find('footer').text()).toBe('CTA')
  })

  // `width` et `gap` sont des NOMS, pas des valeurs : ils indexent une table de classes
  // écrites en toutes lettres. Une classe interpolée à partir d'un nom de token n'est pas
  // vue par le scanner JIT de Tailwind et n'émet rien, en silence (CLAUDE.md §12).
  it.each([
    ['decision', 'max-w-(--size-popup-decision)'],
    ['pad', 'max-w-(--size-popup-pad)'],
    ['alpha', 'max-w-(--size-popup-alpha)'],
  ] as const)('gives the %s width a literal class', (width, expected) => {
    expect(card(mountCard({ width })).classes()).toContain(expected)
  })

  it.each([
    ['sm', 'gap-2'],
    ['md', 'gap-3'],
  ] as const)('gives the %s gap a literal class', (gap, expected) => {
    expect(card(mountCard({ gap })).classes()).toContain(expected)
  })

  // ARIA : `role="dialog"`, `aria-modal`, et un nom accessible — et RIEN D'AUTRE (arbitrage
  // « borne fixe » : pas de piège à focus, pas de `tabindex`, pas d'écoute d'`Escape`).
  it('names itself by a static label when the caller has no visible title', () => {
    const wrapper = mountCard()

    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.attributes('aria-modal')).toBe('true')
    expect(wrapper.attributes('aria-label')).toBe('Une pop-up')
    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
  })

  it('names itself by its visible title when the caller gives one', () => {
    const wrapper = mountCard({ label: undefined, labelledBy: 'title-id' })

    expect(wrapper.attributes('aria-labelledby')).toBe('title-id')
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  // Exception assumée de `CLAUDE.md` §2 : le voile porte déjà `role="dialog"`, un élément
  // n'a qu'un rôle, et un voile sans texte n'est pas un bouton.
  it('never puts role=button on the backdrop', () => {
    const wrapper = mountCard()

    expect(wrapper.attributes('role')).not.toBe('button')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  // Le geste complet du voile vient de `useBackdropClose` : appui ET relâchement du même
  // pointeur. `PopupCard` en est l'unique consommateur direct.
  it('emits backdrop-close on a complete gesture on the backdrop', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('pointerdown', { pointerId: 1 })
    await wrapper.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('backdrop-close')).toHaveLength(1)
  })

  it('does not close on a pointerup that it never armed', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('backdrop-close')).toBeUndefined()
  })

  // Une pop-up SANS retour (« PARTIE TERMINÉE » par série, offre d'égalisatrice à
  // `FIN DE PARTIE`) garde un voile INERTE.
  it('keeps the backdrop inert when closeOnBackdrop is false', async () => {
    const wrapper = mountCard({ closeOnBackdrop: false })

    await wrapper.trigger('pointerdown', { pointerId: 1 })
    await wrapper.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('backdrop-close')).toBeUndefined()
  })

  it('closes on the backdrop by default', async () => {
    const wrapper = mountCard()

    await wrapper.trigger('pointerdown', { pointerId: 7 })
    await wrapper.trigger('pointerup', { pointerId: 7 })

    expect(wrapper.emitted('backdrop-close')).toHaveLength(1)
  })

  // La carte arrête les deux temps du geste : taper DANS la pop-up ne la referme pas.
  it('stops pointerdown and pointerup on the card', async () => {
    const wrapper = mountCard()

    await card(wrapper).trigger('pointerdown', { pointerId: 1 })
    await card(wrapper).trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('backdrop-close')).toBeUndefined()
  })

  // Placement (AC4). Sans `align`, la carte est centrée et le voile porte `p-4`.
  it('centers the card with a uniform gutter when no side is given', () => {
    const wrapper = mountCard()

    expect(wrapper.classes()).toContain('p-4')
    expect(wrapper.attributes('style')).toBeUndefined()
  })

  // Avec `align`, le padding horizontal est un STYLE EN LIGNE : c'est une position, calculée
  // par l'hôte à partir de SA mise en page — ni une classe (valeur dynamique, CLAUDE.md §12),
  // ni un token (un token décrit une intention, jamais une position).
  it('reserves the opposite side when the card is posed on the left', () => {
    const wrapper = mountCard({ align: 'left', reserve: 'calc(100vw * 0.4)' })

    expect(wrapper.classes()).toContain('py-4')
    expect(wrapper.classes()).not.toContain('p-4')
    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('padding-inline-start: calc(var(--spacing) * 4)')
    expect(style).toContain('padding-inline-end: calc(100vw * 0.4)')
  })

  it('reserves the opposite side when the card is posed on the right', () => {
    const wrapper = mountCard({ align: 'right', reserve: 'calc(100vw * 0.4)' })

    const style = wrapper.attributes('style') ?? ''
    expect(style).toContain('padding-inline-start: calc(100vw * 0.4)')
    expect(style).toContain('padding-inline-end: calc(var(--spacing) * 4)')
  })

  // L'asymétrie est réelle et doit le rester : le côté visé est réservé, le côté libre
  // retombe à la gouttière.
  it('places the two sides asymmetrically', () => {
    const left = mountCard({ align: 'left', reserve: 'calc(100vw * 0.4)' })
    const right = mountCard({ align: 'right', reserve: 'calc(100vw * 0.4)' })

    expect(left.attributes('style')).not.toBe(right.attributes('style'))
  })

  // `relative overflow-hidden` n'est PAS généralisé aux quatre cartes : sur une carte de
  // saisie, `overflow-hidden` pourrait rogner un retour d'animation, et la comparaison
  // pixel pour pixel ne le verrait pas (elle est prise au repos).
  it('contains its content only when the caller asks for it', () => {
    expect(card(mountCard()).classes()).not.toContain('overflow-hidden')
    expect(card(mountCard({ contain: true })).classes()).toContain('overflow-hidden')
    expect(card(mountCard({ contain: true })).classes()).toContain('relative')
  })

  // Le pied empile (pop-up de décision) ou aligne (pop-ups de saisie) ses CTA.
  it('lays the footer out in a row by default and in a column on demand', () => {
    expect(mountCard().find('footer').classes()).not.toContain('flex-col')
    expect(mountCard({ footerLayout: 'column' }).find('footer').classes()).toContain('flex-col')
  })

  it('always spaces the footer CTA by one gap', () => {
    expect(mountCard().find('footer').classes()).toContain('gap-2')
    expect(mountCard({ footerLayout: 'column' }).find('footer').classes()).toContain('gap-2')
  })
})
