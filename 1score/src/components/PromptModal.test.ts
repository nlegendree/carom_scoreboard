import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './PromptModal.vue?raw'
import { mount } from '@vue/test-utils'
import PromptModal from './PromptModal.vue'

type Props = InstanceType<typeof PromptModal>['$props']

function mountPrompt(overrides: Partial<Props> = {}) {
  return mount(PromptModal, {
    props: { title: 'PARTIE TERMINÉE', primaryLabel: 'VOIR LE RÉCAP', ...overrides },
  })
}

const find = (wrapper: ReturnType<typeof mountPrompt>, testid: string) =>
  wrapper.find(`[data-testid="${testid}"]`)

// Ordre RÉEL des boutons du pied : c'est lui qui bascule entre les deux variantes, et il
// ne se lit pas dans la présence des testids. Les boutons SOUS le pied — les actions vivent
// dans leur propre rang — et pas un préfixe : `[data-testid^="prompt-"]` attraperait aussi
// le voile et le titre (piège de la 10.1).
const footerOrder = (wrapper: ReturnType<typeof mountPrompt>) =>
  wrapper.findAll('footer button').map((button) => button.attributes('data-testid'))

const CADRES = [
  { id: 'cadre-47-2', label: '47/2' },
  { id: 'cadre-47-1', label: '47/1' },
  { id: 'cadre-71-2', label: '71/2' },
] as const

describe('PromptModal', () => {
  it('renders the title, the message and the two labels', () => {
    const wrapper = mountPrompt({
      message: 'ANDRÉ joue-t-il la reprise égalisatrice ?',
      secondaryLabel: 'NON, FIN DE PARTIE',
    })

    expect(find(wrapper, 'prompt-title').text()).toBe('PARTIE TERMINÉE')
    expect(find(wrapper, 'prompt-message').text()).toBe('ANDRÉ joue-t-il la reprise égalisatrice ?')
    expect(find(wrapper, 'prompt-primary').text()).toBe('VOIR LE RÉCAP')
    expect(find(wrapper, 'prompt-secondary').text()).toBe('NON, FIN DE PARTIE')
  })

  it('emits primary and secondary on pointerdown', async () => {
    const wrapper = mountPrompt({ secondaryLabel: 'NON' })

    await find(wrapper, 'prompt-primary').trigger('pointerdown')
    await find(wrapper, 'prompt-secondary').trigger('pointerdown')

    expect(wrapper.emitted('primary')).toHaveLength(1)
    expect(wrapper.emitted('secondary')).toHaveLength(1)
  })

  // Une décision est attendue : par défaut, ni message ni second CTA. Et JAMAIS de croix
  // (revue de Nathan, 2026-09-10) : le retour, quand il existe, est un CTA `ANNULER`.
  it('shows no secondary button nor message unless asked to, and never a cross', () => {
    const wrapper = mountPrompt({ secondaryLabel: 'ANNULER' })

    expect(find(wrapper, 'prompt-secondary').exists()).toBe(true)
    expect(find(wrapper, 'prompt-close').exists()).toBe(false)
    expect(find(mountPrompt(), 'prompt-secondary').exists()).toBe(false)
    expect(find(mountPrompt(), 'prompt-message').exists()).toBe(false)
    expect(source).not.toContain('✕')
  })

  it('shows the ball of the player concerned, when there is one', () => {
    expect(find(mountPrompt(), 'prompt-ball').exists()).toBe(false)

    const ball = find(mountPrompt({ ball: 'yellow' }), 'prompt-ball')
    expect(ball.exists()).toBe(true)
    expect(ball.classes()).toContain('bg-player-yellow')
  })

  // AC18 : le voile est INERTE. La pop-up de fin monte sous le doigt qui vient de
  // valider une série ; le `pointerup` de ce geste retombe sur le voile et ne doit rien
  // faire — ni au contact, ni au relâchement, ni sur un geste complet.
  it('does nothing at all when the backdrop is tapped', async () => {
    const wrapper = mountPrompt({ secondaryLabel: 'NON' })
    const backdrop = find(wrapper, 'prompt-modal')

    await backdrop.trigger('pointerdown')
    await backdrop.trigger('pointerup')
    await backdrop.trigger('pointercancel')

    // `emitted()` enregistre aussi les événements DOM natifs déclenchés : ce sont les
    // émissions du COMPOSANT qui doivent rester absentes.
    expect(wrapper.emitted('primary')).toBeUndefined()
    expect(wrapper.emitted('secondary')).toBeUndefined()
  })

  // UX-DR8 : toute commande ≥ 90 px.
  it('gives every control a touch-sized target', () => {
    const wrapper = mountPrompt({ secondaryLabel: 'NON' })

    for (const testid of ['prompt-primary', 'prompt-secondary']) {
      expect(find(wrapper, testid).classes()).toContain('min-h-[var(--size-touch-target)]')
    }
  })

  // Chaque CTA porte SON dégradé, jamais un dégradé étalé sur une rangée (revue de rendu
  // de Nathan, 2026-09-12). L'accent est le bleu de la tuile JEUX DE SÉRIES / LIBRE.
  it('gives the primary control the accent gradient and the secondary a neutral one', () => {
    const wrapper = mountPrompt({ secondaryLabel: 'NON' })

    expect(find(wrapper, 'prompt-primary').classes()).toContain('bg-(image:--gradient-blue)')
    expect(find(wrapper, 'prompt-secondary').classes()).toContain(
      'bg-(image:--gradient-neutral)',
    )
  })

  // Flou léger (8 px, `sm`) : la page doit rester reconnaissable derrière — à 12 px elle
  // devenait une bouillie (revue de rendu de Nathan, 2026-09-12).
  it('blurs the page behind instead of hiding it', () => {
    expect(find(mountPrompt(), 'prompt-modal').classes()).toContain('backdrop-blur-sm')
  })

  // Story 10.2, variante liste : n actions empilées dans l'ordre reçu, la première en
  // accent — le choix Cadre (47/2, 47/1, 71/2) puis ANNULER.
  it('renders the action list in the order received, with its own testids', () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })
    const actions = wrapper.findAll('[data-testid^="prompt-action-"]')

    expect(actions.map((action) => action.attributes('data-testid'))).toEqual([
      'prompt-action-cadre-47-2',
      'prompt-action-cadre-47-1',
      'prompt-action-cadre-71-2',
    ])
    expect(actions.map((action) => action.text())).toEqual(['47/2', '47/1', '71/2'])
  })

  // Les choix sont des pairs : même bleu pour tous, aucun n'est « celui par défaut »
  // (revue de rendu de Nathan, 2026-09-12). Seul `ANNULER` reste neutre.
  it('gives every action the same accent and a touch-sized target', () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })
    const actions = wrapper.findAll('[data-testid^="prompt-action-"]')

    for (const action of actions) {
      expect(action.classes()).toContain('bg-(image:--gradient-blue)')
      // Blanc sur le bleu, jamais le noir de `--color-on-accent` (Nathan, 2026-09-12).
      expect(action.classes()).toContain('text-white')
      expect(action.classes()).not.toContain('text-on-accent')
      expect(action.classes()).toContain('min-h-[var(--size-touch-target)]')
    }
    expect(find(wrapper, 'prompt-secondary').classes()).toContain(
      'bg-(image:--gradient-neutral)',
    )
  })

  // Les choix tiennent sur UNE ligne, en colonnes égales quel qu'en soit le nombre —
  // `grid-flow-col` + `auto-cols-fr`, jamais un `grid-cols-n` construit à la volée, que le
  // scanner de Tailwind ne verrait pas.
  it('lays the actions out on a single row of equal columns', () => {
    const row = mountPrompt({ title: 'CADRE', actions: CADRES }).find(
      '[data-testid="prompt-actions"]',
    )

    expect(row.exists()).toBe(true)
    expect(row.classes()).toEqual(expect.arrayContaining(['grid', 'grid-flow-col', 'auto-cols-fr']))
    expect(row.findAll('[data-testid^="prompt-action-"]')).toHaveLength(3)
  })

  // `ANNULER` barre toute la largeur du rang de choix : il est hors du rang, en pleine
  // largeur, et non une quatrième colonne.
  it('spans the secondary across the whole action row', () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })

    expect(find(wrapper, 'prompt-secondary').classes()).toContain('w-full')
    expect(
      wrapper.find('[data-testid="prompt-actions"] [data-testid="prompt-secondary"]').exists(),
    ).toBe(false)
  })

  // Direction visuelle de l'Epic 10 : CTA à angles vifs (`--radius-cta`, 0), carte à peine
  // adoucie (`--radius-modal`) pour se détacher du fond flouté — jamais un `rounded-*` de
  // l'échelle Tailwind (revue de rendu de Nathan, 2026-09-12).
  it('takes its radii from the tokens, sharp controls and a barely softened card', () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })

    expect(find(wrapper, 'prompt-card').classes()).toContain('rounded-modal')
    for (const button of wrapper.findAll('footer button')) {
      expect(button.classes()).toContain('rounded-cta')
    }
    expect(source).not.toContain('rounded-2xl')
    expect(source).not.toContain('rounded-3xl')
  })

  // Le titre d'une liste de choix est centré au-dessus d'elle ; les pop-ups de décision
  // gardent leur titre aligné à gauche, avec la bille du joueur concerné.
  it('centres the title in the list variant only', () => {
    expect(find(mountPrompt({ actions: CADRES }), 'prompt-header').classes()).toContain(
      'justify-center',
    )
    expect(find(mountPrompt(), 'prompt-header').classes()).not.toContain('justify-center')
  })

  it('emits select once with the id of the action tapped', async () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES })

    await find(wrapper, 'prompt-action-cadre-47-1').trigger('pointerdown')

    expect(wrapper.emitted('select')).toEqual([['cadre-47-1']])
  })

  // Le CTA principal n'a pas de sens quand la décision EST la liste.
  it('drops the primary control in the list variant', () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })

    expect(find(wrapper, 'prompt-primary').exists()).toBe(false)
    expect(find(wrapper, 'prompt-secondary').exists()).toBe(true)
  })

  // P1 : ANNULER passe SOUS les choix en variante liste (au-dessus, il s'intercalerait
  // entre le titre et les cadres) mais reste AU-DESSUS du principal partout ailleurs. Les
  // deux ordres viennent du même markup linéaire : les verrouiller tous les deux.
  it('places the secondary after the actions, and before the primary without them', () => {
    expect(footerOrder(mountPrompt({ actions: CADRES, secondaryLabel: 'ANNULER' }))).toEqual([
      'prompt-action-cadre-47-2',
      'prompt-action-cadre-47-1',
      'prompt-action-cadre-71-2',
      'prompt-secondary',
    ])
    expect(footerOrder(mountPrompt({ secondaryLabel: 'ANNULER' }))).toEqual([
      'prompt-secondary',
      'prompt-primary',
    ])
  })

  // Un choix est annulable : taper à côté revient à `ANNULER` (revue de rendu de Nathan,
  // 2026-09-12). Un tap est un geste COMPLET — appui ET relâchement sur le voile — sinon
  // le `pointerup` du geste qui vient d'ouvrir la pop-up la referme aussitôt.
  it('closes the list variant on a complete tap outside', async () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })
    const backdrop = find(wrapper, 'prompt-modal')

    await backdrop.trigger('pointerdown', { pointerId: 1 })
    await backdrop.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('secondary')).toHaveLength(1)
  })

  it('ignores a release on the backdrop that did not start there', async () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })
    const backdrop = find(wrapper, 'prompt-modal')

    // Le relâchement du geste qui a ouvert la pop-up : aucun appui ne l'a précédé ici.
    await backdrop.trigger('pointerup', { pointerId: 1 })
    // Un autre doigt relâche alors qu'un premier tient le voile : pas le même `pointerId`.
    await backdrop.trigger('pointerdown', { pointerId: 1 })
    await backdrop.trigger('pointerup', { pointerId: 2 })
    // Un geste annulé (glissé hors de l'écran) ne ferme pas non plus.
    await backdrop.trigger('pointerdown', { pointerId: 3 })
    await backdrop.trigger('pointercancel', { pointerId: 3 })
    await backdrop.trigger('pointerup', { pointerId: 3 })

    expect(wrapper.emitted('secondary')).toBeUndefined()
  })

  // AR8 : `@pointerdown` partout. Le voile est la seule exception (geste complet), et il
  // reste INERTE hors variante liste — voir « does nothing at all… » plus haut.
  it('never binds a click handler', () => {
    expect(source).not.toContain('@click')
    expect(source).not.toContain('@touchstart')
  })
})
