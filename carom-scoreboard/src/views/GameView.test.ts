import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import GameView from './GameView.vue'
import { useGameStore } from '../stores/useGameStore'

describe('GameView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the home screen while idle, then the game once started', async () => {
    const wrapper = mount(GameView)

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)

    await wrapper.find('[data-testid="category-series"]').trigger('pointerdown')
    await wrapper.find('[data-testid="mode-libre"]').trigger('pointerdown')
    await wrapper.find('[data-testid="confirm-button"]').trigger('pointerdown')

    expect(wrapper.findAllComponents({ name: 'PlayerPanel' })).toHaveLength(2)
  })

  it('gives the left panel the white ball and the right panel the yellow one', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[0]!.props('player').color).toBe('white')
    expect(panels[1]!.props('player').color).toBe('yellow')
  })

  // Le retour texte de la barre a laissé place à un picto de sortie qui change de côté
  // avec le CTA de saisie (refonte du 2026-09-09).
  it('returns to the home screen from the exit control', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="exit-button"]').trigger('pointerdown')

    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  it('swaps players sides when the center panel asks for it', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')

    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[0]!.props('player').name).toBe('ANDRE')
    expect(panels[0]!.props('player').color).toBe('white')
    expect(panels[1]!.props('player').name).toBe('MICHEL')
  })

  // AC#7 : avec des distances dissociées, la distance affichée suit le joueur d'un côté
  // à l'autre — la bille, elle, reste attachée au côté.
  it('carries each displayed distance with its player when sides are swapped', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })
    await wrapper.vm.$nextTick()

    const shown = () =>
      wrapper.findAllComponents({ name: 'PlayerPanel' }).map((panel) =>
        panel.find('[data-testid="target-score"]').text(),
      )

    expect(shown()).toEqual(['100', '80'])

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')

    expect(shown()).toEqual(['80', '100'])
  })

  // Distance libre : aucun emplacement de distance sur les panneaux (NFR12).
  it('shows no distance at all when the game was started without a format', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-testid="target-score"]')).toHaveLength(0)
  })
})

// --- Story 1.5 (refonte du 2026-09-09) : saisie en popup, bascule au tap,
//     statistiques en pied de carte ---

describe('GameView — saisie en popup et alternance', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function startedGame() {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()
    return { wrapper, store }
  }

  function panels(wrapper: VueWrapper) {
    return wrapper.findAllComponents({ name: 'PlayerPanel' })
  }

  async function openEntry(wrapper: VueWrapper) {
    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
  }

  async function type(wrapper: VueWrapper, digits: number[]) {
    for (const digit of digits) {
      await wrapper.find(`[data-testid="digit-${digit}"]`).trigger('pointerdown')
    }
  }

  // Le score doit être le plus gros possible : aucun pavé n'est visible tant que la
  // popup n'est pas ouverte.
  it('shows no numeric pad until the entry popup is opened', async () => {
    const { wrapper } = await startedGame()

    expect(wrapper.find('[data-testid="digit-5"]').exists()).toBe(false)

    await openEntry(wrapper)

    expect(wrapper.find('[data-testid="digit-5"]').exists()).toBe(true)
  })

  it('records the series of the active player and hands the turn over', async () => {
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 2])
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.player1.score).toBe(12)
    expect(store.player2.score).toBe(0)
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
  })

  // Story 1.6 (AC1) : le total doit être VISIBLE, pas seulement juste dans le store.
  // Les autres tests lisent `store.player1.score` ou les props ; celui-ci lit le texte
  // rendu du panneau GAUCHE — `wrapper.find` renverrait le premier `score` trouvé et
  // deviendrait faux dès qu'on cible le panneau droit.
  it('shows the updated total on the panel once a series is validated', async () => {
    const { wrapper } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 2])
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(panels(wrapper)[0]!.find('[data-testid="score"]').text()).toBe('12')
    expect(panels(wrapper)[1]!.find('[data-testid="score"]').text()).toBe('0')
  })

  // La popup se referme d'elle-même à la validation, sinon elle masquerait le score
  // qu'elle vient de mettre à jour.
  it('closes the popup once the series is validated', async () => {
    const { wrapper } = await startedGame()

    await openEntry(wrapper)
    await wrapper.find('[data-testid="digit-4"]').trigger('pointerdown')
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
  })

  it('reaches the same state through the three-second path, popup closed included', async () => {
    vi.useFakeTimers()
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 2])
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(store.player1.score).toBe(12)
    expect(store.currentInput.player1).toBe('')
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
  })

  // AC12 : VALIDER sur une saisie vide ne fait RIEN — la pop-up reste ouverte, aucun
  // compteur ne bouge, le tour ne bascule pas.
  it('keeps the popup open and inert when VALIDER is tapped on an empty entry', async () => {
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(true)
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
  })

  // ⚠️ Tap fantôme : à l'auto-validation la pop-up disparaît sous le doigt et le tour a
  // basculé — un appui qui arrive juste après tomberait sur le panneau devenu inactif et
  // enregistrerait une série de 0. Les panneaux ignorent les appuis pendant une courte
  // grâce après toute fermeture de la pop-up.
  it('ignores a tap on the panels right after the popup closed by itself', async () => {
    vi.useFakeTimers()
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 2])
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    expect(store.activePlayer).toBe('player2')

    await panels(wrapper)[0]!.trigger('pointerdown')
    await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    expect(store.reprises[0]!.player2).toBeNull()
    expect(store.player1.score).toBe(12)
    expect(store.activePlayer).toBe('player2')

    // Grâce écoulée : le même geste rend bien la main (série de 0 pour le jaune).
    vi.advanceTimersByTime(300)
    await panels(wrapper)[0]!.trigger('pointerdown')
    expect(store.reprises[0]!.player2).toBe(0)
    expect(store.activePlayer).toBe('player1')
  })

  // Fermer sans valider ne doit rien enregistrer, et surtout pas laisser un buffer
  // traîner : il se rouvrirait pré-rempli à la saisie suivante.
  it('discards the running entry when the popup is closed without validating', async () => {
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [9])
    await wrapper.find('[data-testid="modal-close-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.reprises).toEqual([])
    expect(store.currentInput.player1).toBe('')
    expect(store.activePlayer).toBe('player1')
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
  })

  // ⚠️ Le CTA se place du côté du joueur qui N'A PAS la main : au billard, c'est
  // l'adversaire assis qui compte les points de celui qui joue. Il change donc de côté à
  // chaque bascule, toujours à l'opposé du liseré de tour actif.
  it('puts the add-points button on the side of the seated opponent', async () => {
    const { wrapper, store } = await startedGame()

    expect(store.activePlayer).toBe('player1')
    expect(wrapper.find('[data-testid="add-points-button"][data-side="player2"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-points-button"][data-side="player1"]').exists()).toBe(false)

    store.switchTurn()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="add-points-button"][data-side="player1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="add-points-button"][data-side="player2"]').exists()).toBe(false)
  })

  // Le bouton est côté adversaire, mais il saisit bien la série du joueur EN TRAIN DE
  // JOUER. C'est le cœur du geste : l'adversaire compte pour l'autre.
  it('credits the player who has the hand, not the side the button sits on', async () => {
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [8])
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.player1.score).toBe(8)
    expect(store.player2.score).toBe(0)
  })

  // La sortie occupe l'autre colonne, à l'opposé du CTA, et se déplace avec lui.
  it('keeps the exit control opposite the add-points button', async () => {
    const { wrapper, store } = await startedGame()

    expect(wrapper.find('[data-testid="exit-button"][data-side="player1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="exit-button"][data-side="player2"]').exists()).toBe(false)

    store.switchTurn()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="exit-button"][data-side="player2"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="exit-button"][data-side="player1"]').exists()).toBe(false)
  })

  // Picto seul : il ne porte plus de libellé, donc l'intention passe par `aria-label`.
  it('leaves the game from the exit pictogram', async () => {
    const { wrapper, store } = await startedGame()
    const exit = wrapper.find('[data-testid="exit-button"]')

    expect(exit.text()).toBe('')
    expect(exit.attributes('aria-label')).toBeTruthy()

    await exit.trigger('pointerdown')

    expect(store.status).toBe('idle')
  })

  // Correction manuelle : le total bouge, le déroulé de la partie ne bouge pas.
  it('corrects the score of the panel that asked, without touching the run of play', async () => {
    const { wrapper, store } = await startedGame()
    store.addReprise('player1', 10)
    await wrapper.vm.$nextTick()

    await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    await panels(wrapper)[1]!.find('[data-testid="score-minus"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.player1.score).toBe(12)
    expect(store.player2.score).toBe(-1)
    expect(store.reprises).toHaveLength(1)
    expect(store.activePlayer).toBe('player1')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
  })

  it('opens the popup on the active player, whichever side has the hand', async () => {
    const { wrapper, store } = await startedGame()
    store.switchTurn()
    await wrapper.vm.$nextTick()

    await openEntry(wrapper)
    await wrapper.find('[data-testid="digit-6"]').trigger('pointerdown')
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.player2.score).toBe(6)
    expect(store.player1.score).toBe(0)
  })

  // Régression : la popup s'ouvre au `pointerdown` du CTA ; le `pointerup` du même geste
  // ne doit pas la refermer aussitôt en retombant sur le voile.
  it('keeps the popup open after the finger is lifted off the CTA', async () => {
    const { wrapper } = await startedGame()

    await openEntry(wrapper)
    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerup')

    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(true)
  })

  // Rendre la main sans marquer : on tape la zone de l'adversaire. Une série de 0 est
  // enregistrée — la reprise compte, mais le total ne bouge pas.
  it('hands over with a zero series when the opponent panel is tapped', async () => {
    const { wrapper, store } = await startedGame()

    await panels(wrapper)[1]!.trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.player1.score).toBe(0)
    expect(store.reprises).toHaveLength(1)
    expect(store.reprises[0]!.player1).toBe(0)
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
  })

  it('ignores a tap on the panel that already has the hand', async () => {
    const { wrapper, store } = await startedGame()

    await panels(wrapper)[0]!.trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.reprises).toEqual([])
    expect(panels(wrapper)[0]!.props('active')).toBe(true)
  })

  it('feeds each panel the average and best series of its own player', async () => {
    const { wrapper, store } = await startedGame()
    store.addReprise('player1', 5)
    store.addReprise('player2', 2)
    store.addReprise('player1', 3)
    await wrapper.vm.$nextTick()

    expect(panels(wrapper)[0]!.find('[data-testid="average"]').text()).toBe('4.000')
    expect(panels(wrapper)[0]!.find('[data-testid="best-series"]').text()).toBe('5')
    expect(panels(wrapper)[1]!.find('[data-testid="average"]').text()).toBe('2.000')
    expect(panels(wrapper)[1]!.find('[data-testid="best-series"]').text()).toBe('2')
  })

  it('keeps the reprise counter on 1 until the left player takes the hand back', async () => {
    const { wrapper } = await startedGame()
    const shown = () => wrapper.find('[data-testid="reprise-number"]').text()

    expect(shown()).toBe('1')

    await openEntry(wrapper)
    await wrapper.find('[data-testid="digit-5"]').trigger('pointerdown')
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(shown()).toBe('1')

    await openEntry(wrapper)
    await wrapper.find('[data-testid="digit-3"]').trigger('pointerdown')
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(shown()).toBe('2')
  })

  // Le bouton d'interversion reste disponible toute la partie, et chaque joueur emporte
  // ses séries passées — sinon le total, recalculé depuis `reprises`, changerait de camp.
  it('keeps the swap button all game long and carries each history along', async () => {
    const { wrapper, store } = await startedGame()
    store.addReprise('player1', 5)
    store.addReprise('player2', 2)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="swap-players-button"]').exists()).toBe(true)

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(panels(wrapper)[0]!.props('player').name).toBe('ANDRE')
    expect(panels(wrapper)[0]!.props('player').score).toBe(2)
    expect(panels(wrapper)[1]!.props('player').name).toBe('MICHEL')
    expect(panels(wrapper)[1]!.props('player').score).toBe(5)
  })
})
