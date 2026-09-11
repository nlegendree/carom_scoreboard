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

  it('gives the primary control the system accent and the secondary a neutral tone', () => {
    const wrapper = mountPrompt({ secondaryLabel: 'NON' })

    expect(find(wrapper, 'prompt-primary').classes()).toContain('bg-accent')
    expect(find(wrapper, 'prompt-secondary').classes()).toContain('bg-white/10')
  })

  it('blurs the page behind instead of hiding it', () => {
    expect(find(mountPrompt(), 'prompt-modal').classes()).toContain('backdrop-blur-md')
  })

  // AR8 : `@pointerdown` partout, et AUCUN handler sur le voile (AC18).
  it('never binds a click handler, nor any handler on the backdrop', () => {
    expect(source).not.toContain('@click')
    expect(source).not.toContain('@touchstart')
    expect(source).not.toContain('@pointerup')
    expect(source).not.toContain('@pointercancel')
  })
})
