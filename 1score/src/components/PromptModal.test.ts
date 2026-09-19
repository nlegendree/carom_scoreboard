import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node, et il ne faut pas les y ajouter pour du code navigateur.
import source from './PromptModal.vue?raw'
import { h } from 'vue'
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
    expect(find(mountPrompt(), 'prompt-secondary').exists()).toBe(false)
    expect(find(mountPrompt(), 'prompt-message').exists()).toBe(false)
    expect(source).not.toContain('✕')
  })

  it('shows the ball of the player concerned, when there is one', () => {
    expect(find(mountPrompt(), 'prompt-ball').exists()).toBe(false)

    // Story 11.5 (Nathan, au rendu, 2026-09-19) : l'IMAGE de la bille, celle de la carte de
    // paramétrage et du récap — plus un aplat de couleur, qui se lisait comme un disque blanc.
    const ball = find(mountPrompt({ ball: 'yellow' }), 'prompt-ball')
    expect(ball.exists()).toBe(true)
    expect(ball.element.tagName).toBe('IMG')
    expect(ball.attributes('src')).toBe('/bille_jaune.png')
    expect(find(mountPrompt({ ball: 'white' }), 'prompt-ball').attributes('src')).toBe('/bille_blanche.png')
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
      expect(find(wrapper, testid).classes()).toContain('min-h-(--size-touch-target)')
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
  // Voile aligné sur celui des pop-ups de saisie le 2026-09-12 : à peine assombri et
  // SANS flou. Un même voile pour toutes les pop-ups du produit.
  it('barely dims the page behind, without blurring it', () => {
    const overlay = find(mountPrompt(), 'prompt-modal')

    expect(overlay.classes()).toContain('bg-black/25')
    expect(overlay.classes().join(' ')).not.toContain('backdrop-blur')
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
      expect(action.classes()).toContain('min-h-(--size-touch-target)')
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

  // DESIGN.md › Shapes (Story 11.2) : deux rayons nommés par famille — `--radius-tappable`
  // sur tout ce qui se tape, `--radius-popup` sur la carte, qui se détache du fond — jamais
  // un `rounded-*` de l'échelle Tailwind (revue de rendu de Nathan, 2026-09-12).
  it('takes its radii from the tokens, tappable radius on controls and popup radius on the card', () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })

    expect(find(wrapper, 'prompt-card').classes()).toContain('rounded-popup')
    for (const button of wrapper.findAll('footer button')) {
      expect(button.classes()).toContain('rounded-tappable')
    }
    expect(source).not.toContain('rounded-2xl')
    expect(source).not.toContain('rounded-3xl')
  })

  // Titre centré dans TOUTES les variantes depuis le 2026-09-12 : la carte est resserrée,
  // un titre collé à gauche y flottait.
  it('centres the title in every variant', () => {
    expect(find(mountPrompt({ actions: CADRES }), 'prompt-header').classes()).toContain(
      'justify-center',
    )
    expect(find(mountPrompt(), 'prompt-header').classes()).toContain('justify-center')
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
  // Ordre inversé le 2026-09-12 : l'action proposée se lit AVANT son refus. Avec des
  // choix, `ANNULER` reste dessous — il serait sinon coincé entre le titre et la liste.
  it('places the secondary last, after the actions as after the primary', () => {
    expect(footerOrder(mountPrompt({ actions: CADRES, secondaryLabel: 'ANNULER' }))).toEqual([
      'prompt-action-cadre-47-2',
      'prompt-action-cadre-47-1',
      'prompt-action-cadre-71-2',
      'prompt-secondary',
    ])
    expect(footerOrder(mountPrompt({ secondaryLabel: 'ANNULER' }))).toEqual([
      'prompt-primary',
      'prompt-secondary',
    ])
  })

  // Règle de Nathan (2026-09-15) : toute pop-up à CTA `ANNULER` ou `FERMER` se referme au
  // tap dehors, qui vaut ce CTA. Dérivée du libellé, portée par le composant : aucun écran
  // n'a de prop à poser.
  it.each(['ANNULER', 'FERMER'])(
    'closes a two-CTA prompt carrying %s on a complete tap outside',
    async (secondaryLabel) => {
      const wrapper = mountPrompt({ secondaryLabel })
      const veil = find(wrapper, 'prompt-modal')

      await veil.trigger('pointerdown', { pointerId: 4 })
      await veil.trigger('pointerup', { pointerId: 4 })

      expect(wrapper.emitted('secondary')).toHaveLength(1)
    },
  )

  // Une décision SANS retour garde son voile inerte (AC18, Décision 12) : l'offre
  // d'égalisatrice (`FIN DE PARTIE` n'est pas un « annuler ») et « PARTIE TERMINÉE ».
  it('keeps the veil inert on a prompt whose secondary is not a way back', async () => {
    const wrapper = mountPrompt({ secondaryLabel: 'FIN DE PARTIE' })
    const veil = find(wrapper, 'prompt-modal')

    await veil.trigger('pointerdown', { pointerId: 5 })
    await veil.trigger('pointerup', { pointerId: 5 })

    expect(wrapper.emitted('secondary')).toBeUndefined()
  })

  it('keeps the veil inert on a prompt without any secondary', async () => {
    const wrapper = mountPrompt({ primaryLabel: 'VOIR LE RÉCAP' })
    const veil = find(wrapper, 'prompt-modal')

    await veil.trigger('pointerdown', { pointerId: 6 })
    await veil.trigger('pointerup', { pointerId: 6 })

    expect(wrapper.emitted('secondary')).toBeUndefined()
  })

  // Le choix du CADRE est annulable : taper à côté revient à `ANNULER` (revue de rendu de
  // Nathan, 2026-09-12) — par la même règle que les autres, son secondaire est `ANNULER`.
  // Un tap est un geste COMPLET — appui ET relâchement sur le voile — sinon le `pointerup`
  // du geste qui vient d'ouvrir la pop-up la referme aussitôt.
  it('closes the list variant on a complete tap outside', async () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES, secondaryLabel: 'ANNULER' })
    const backdrop = find(wrapper, 'prompt-modal')

    await backdrop.trigger('pointerdown', { pointerId: 1 })
    await backdrop.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('secondary')).toHaveLength(1)
  })

  it('keeps the veil inert on a list variant without ANNULER', async () => {
    const wrapper = mountPrompt({ title: 'CADRE', actions: CADRES })
    const backdrop = find(wrapper, 'prompt-modal')

    await backdrop.trigger('pointerdown', { pointerId: 1 })
    await backdrop.trigger('pointerup', { pointerId: 1 })

    expect(wrapper.emitted('secondary')).toBeUndefined()
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

  // AC1 (Story 10.7) : la pop-up s'annonce comme un dialogue. Seule des quatre à porter un
  // titre VISIBLE, elle se nomme par lui (`aria-labelledby`) plutôt que par un `aria-label`
  // statique — l'`id` vient de `useId()` (Vue 3.5), donc unique par instance et jamais en dur.
  it('exposes the dialog semantics, labelled by its visible title', () => {
    const wrapper = mountPrompt()
    const backdrop = find(wrapper, 'prompt-modal')
    const titleId = find(wrapper, 'prompt-title').attributes('id')

    expect(backdrop.attributes('role')).toBe('dialog')
    expect(backdrop.attributes('aria-modal')).toBe('true')
    expect(titleId).toBeTruthy()
    expect(backdrop.attributes('aria-labelledby')).toBe(titleId)
    // L'id est CALCULÉ, pas écrit : une chaîne littérale dans le gabarit collisionnerait
    // dès que deux pop-ups coexistent.
    expect(source).not.toContain('aria-labelledby="prompt')
  })

  it('gives each instance its own title id', () => {
    // Les deux pop-ups vivent dans la MÊME application : `useId()` compte par application,
    // donc deux `mount()` séparés repartiraient tous deux de zéro et ne prouveraient rien.
    // Rendu en `h()` plutôt qu'en `template` : le compilateur d'exécution n'est pas embarqué.
    const host = mount({
      render: () =>
        h('div', [
          h(PromptModal, { title: 'UNE', primaryLabel: 'OK' }),
          h(PromptModal, { title: 'DEUX', primaryLabel: 'OK' }),
        ]),
    })
    const ids = host.findAll('[data-testid="prompt-title"]').map((title) => title.attributes('id'))

    expect(ids).toHaveLength(2)
    expect(ids[0]).toBeTruthy()
    expect(ids[0]).not.toBe(ids[1])
  })

  // AC2 (Story 10.7) : le voile garde ses handlers pointer SANS `role="button"`. Il porte
  // déjà `role="dialog"`, et un élément n'a qu'un rôle ; l'annoncer comme un bouton serait
  // faux. Exception assumée à CLAUDE.md §2, consignée dans CLAUDE.md §2 lui-même.
  it('never gives the backdrop a button role', () => {
    const wrapper = mountPrompt()

    expect(find(wrapper, 'prompt-modal').attributes('role')).not.toBe('button')
    expect(wrapper.find('[role="button"]').exists()).toBe(false)
  })

})
