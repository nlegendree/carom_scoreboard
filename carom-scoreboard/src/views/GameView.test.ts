import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import GameView from './GameView.vue'
import { useGameStore } from '../stores/useGameStore'
import type { PlayerId } from '../types/game'

describe('GameView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Depuis la 1.10, DÉMARRER exige une distance par joueur (AC1) : le parcours complet
  // passe par la modale de réglage de chacun.
  it('shows the home screen while idle, then the game once started', async () => {
    const wrapper = mount(GameView)
    const press = async (testid: string) =>
      wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)

    await press('category-series')
    await press('mode-libre')
    for (const player of ['player1', 'player2']) {
      await press(`${player}-zone`)
      await press('distance-field')
      await press('digit-5')
      await press('digit-0')
      await press('setup-confirm-button')
    }
    await press('confirm-button')

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

// --- Story 1.7 : `ANNULER` revient d'une action en arrière ---

describe('GameView — annulation', () => {
  // Fake timers pour tout le describe : la console centrale partage la grâce anti-tap
  // fantôme des panneaux (300 ms après toute fermeture de la pop-up), les helpers la
  // font s'écouler explicitement.
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
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

  function scoreOf(wrapper: VueWrapper, side: 0 | 1) {
    return panels(wrapper)[side]!.find('[data-testid="score"]').text()
  }

  function undoButton(wrapper: VueWrapper) {
    return wrapper.find('[data-testid="undo-button"]')
  }

  async function undo(wrapper: VueWrapper) {
    await undoButton(wrapper).trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  // Une série saisie au pavé et validée, comme au doigt — grâce écoulée ensuite.
  async function validateSeries(wrapper: VueWrapper, digits: number[]) {
    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
    for (const digit of digits) {
      await wrapper.find(`[data-testid="digit-${digit}"]`).trigger('pointerdown')
    }
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()
  }

  // AC1, AC4 : lu dans le DOM — total, liseré, côté du CTA, compteur et grisage.
  it('brings the game one action back on ANNULER', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [1, 2])
    expect(scoreOf(wrapper, 0)).toBe('12')
    expect(undoButton(wrapper).attributes('disabled')).toBeUndefined()

    await undo(wrapper)

    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(panels(wrapper)[0]!.props('active')).toBe(true)
    expect(panels(wrapper)[0]!.classes()).toContain('ring-turn-active')
    expect(panels(wrapper)[1]!.props('active')).toBe(false)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player2')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })

  // AC2 : série du blanc, série du jaune (REP 2), correction `+` — trois appuis, trois
  // états intermédiaires distincts.
  it('steps back one action per press', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [5])
    await validateSeries(wrapper, [3])
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('2')
    await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(scoreOf(wrapper, 0)).toBe('6')

    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('5')
    expect(scoreOf(wrapper, 1)).toBe('3')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('2')
    expect(panels(wrapper)[0]!.props('active')).toBe(true)

    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('5')
    expect(scoreOf(wrapper, 1)).toBe('0')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player1')

    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(scoreOf(wrapper, 1)).toBe('0')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
    expect(panels(wrapper)[0]!.props('active')).toBe(true)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player2')
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })

  // Ce que le `computed` local `reprises.length > 0` de la vue ratait : une correction
  // seule doit rendre `ANNULER` actif, sans qu'aucune reprise n'existe.
  it('enables ANNULER after a mere correction, with no reprise recorded', async () => {
    const { wrapper, store } = await startedGame()
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()

    await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.reprises).toHaveLength(0)
    expect(scoreOf(wrapper, 0)).toBe('1')
    expect(undoButton(wrapper).attributes('disabled')).toBeUndefined()

    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })

  // AC5 : l'annulation ne ramène jamais un échange ; la main revient à MICHEL, là où il est.
  it('keeps the sides as they are when undoing a series recorded before a swap', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [5])
    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(scoreOf(wrapper, 1)).toBe('5')

    await undo(wrapper)

    expect(panels(wrapper)[0]!.props('player').name).toBe('ANDRE')
    expect(panels(wrapper)[0]!.props('player').color).toBe('white')
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(panels(wrapper)[1]!.props('player').name).toBe('MICHEL')
    expect(scoreOf(wrapper, 1)).toBe('0')
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
    expect(panels(wrapper)[0]!.props('active')).toBe(false)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player1')
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })

  // AC3 : ouvrir la pop-up, taper, puis la refermer par la croix ou par un tap en dehors
  // ne modifie pas la partie — rien n'est empilé (revue de la 1.7 : une mutation
  // « `pushHistory` dans `clearScoreInput` » resterait verte sans ce test).
  it('leaves nothing to undo after an entry is typed then closed without validating', async () => {
    const { wrapper, store } = await startedGame()

    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="digit-9"]').trigger('pointerdown')
    await wrapper.find('[data-testid="modal-close-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="digit-9"]').trigger('pointerdown')
    // Le voile ferme sur un geste complet : appui ET relâchement.
    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerdown')
    await wrapper.find('[data-testid="modal-backdrop"]').trigger('pointerup')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
    expect(store.canUndo).toBe(false)
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })

  // ⚠️ Tap fantôme (revue de la 1.7) : la carte de la pop-up recouvre la colonne centrale.
  // À l'auto-validation, un doigt qui arrive sur l'emplacement d'une touche peut tomber sur
  // ANNULER et défaire la série qui vient d'être validée — ou sur ÉCHANGER. Même grâce
  // que les panneaux.
  it('ignores a tap on ANNULER or ÉCHANGER right after the popup closed by itself', async () => {
    const { wrapper, store } = await startedGame()

    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="digit-1"]').trigger('pointerdown')
    await wrapper.find('[data-testid="digit-2"]').trigger('pointerdown')
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    expect(scoreOf(wrapper, 0)).toBe('12')
    expect(undoButton(wrapper).attributes('disabled')).toBeUndefined()

    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('12')
    expect(store.canUndo).toBe(true)

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(panels(wrapper)[0]!.props('player').name).toBe('MICHEL')

    // Grâce écoulée : les mêmes gestes agissent.
    vi.advanceTimersByTime(300)
    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(panels(wrapper)[0]!.props('player').name).toBe('ANDRE')
  })

  // AC3 : `ÉCHANGER` n'entre pas dans la pile.
  it('leaves nothing to undo after a swap alone', async () => {
    const { wrapper } = await startedGame()

    await wrapper.find('[data-testid="swap-players-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(panels(wrapper)[0]!.props('player').name).toBe('ANDRE')
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })
})

// --- Story 1.10 : fin de partie, reprise égalisatrice, récap ---

describe('GameView — fin de partie', () => {
  // Fake timers pour tout le describe : la grâce anti-tap fantôme (300 ms) suit chaque
  // fermeture de pop-up, les helpers la font s'écouler explicitement.
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Distances courtes pour des scénarios lisibles : blanc 10, jaune 8.
  async function startedGame(targets = { player1: 10, player2: 8 }) {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRÉ', targets)
    await wrapper.vm.$nextTick()
    return { wrapper, store }
  }

  function panels(wrapper: VueWrapper) {
    return wrapper.findAllComponents({ name: 'PlayerPanel' })
  }

  function scoreOf(wrapper: VueWrapper, side: 0 | 1) {
    return panels(wrapper)[side]!.find('[data-testid="score"]').text()
  }

  const prompt = (wrapper: VueWrapper) => wrapper.find('[data-testid="prompt-modal"]')
  const summary = (wrapper: VueWrapper) => wrapper.find('[data-testid="game-summary"]')

  function summaryCell(wrapper: VueWrapper, side: PlayerId, testid: string) {
    return wrapper
      .find(`[data-testid="summary-column"][data-side="${side}"]`)
      .find(`[data-testid="${testid}"]`)
      .text()
  }

  async function press(wrapper: VueWrapper, testid: string) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  async function openEntry(wrapper: VueWrapper) {
    await press(wrapper, 'add-points-button')
  }

  async function type(wrapper: VueWrapper, digits: number[]) {
    for (const digit of digits) {
      await wrapper.find(`[data-testid="digit-${digit}"]`).trigger('pointerdown')
    }
  }

  // Une série saisie au pavé et validée, comme au doigt — grâce écoulée ensuite.
  async function validateSeries(wrapper: VueWrapper, digits: number[]) {
    await openEntry(wrapper)
    await type(wrapper, digits)
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()
  }

  // AC3 : le blanc atteint sa distance → offre d'égalisatrice, sans croix, le tour a
  // basculé sur le jaune comme d'habitude.
  it('offers the equalizing reprise when the white player reaches his distance', async () => {
    const { wrapper } = await startedGame()

    await validateSeries(wrapper, [1, 0])

    expect(prompt(wrapper).exists()).toBe(true)
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('MICHEL A ATTEINT SA DISTANCE')
    // Revue de Nathan (2026-09-10) : pas de message, les deux CTA disent tout.
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('ANDRÉ JOUE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('FIN DE PARTIE')
    expect(wrapper.find('[data-testid="prompt-close"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-ball"]').classes()).toContain('bg-player-white')
    expect(panels(wrapper)[1]!.classes()).toContain('ring-turn-active')
  })

  // AC4, AC5 : OUI ramène au scoreboard, le jaune joue, sa série termine la partie.
  it('returns to the board on OUI and ends the game after the yellow series', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [1, 0])

    await press(wrapper, 'prompt-primary')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(panels(wrapper)).toHaveLength(2)
    // Grâce anti-tap fantôme : le CTA était au-dessus des panneaux, un `ANNULER` qui
    // suit immédiatement est ignoré — la série gagnante reste.
    await press(wrapper, 'undo-button')
    expect(scoreOf(wrapper, 0)).toBe('10')
    vi.advanceTimersByTime(300)
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
    // Règle de la 1.5 : le CTA est sous le panneau de l'adversaire ASSIS, le blanc.
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player1')

    await validateSeries(wrapper, [3])

    // Revue de Nathan (2026-09-10) : la pop-up n'annonce rien — ni vainqueur, ni bille,
    // ni croix. Le résultat se lit sur le récap.
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE TERMINÉE')
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-ball"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-close"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('VOIR LE RÉCAP')

    await press(wrapper, 'prompt-primary')

    expect(summary(wrapper).exists()).toBe(true)
    expect(summaryCell(wrapper, 'player1', 'summary-result')).toBe('VICTOIRE')
    expect(summaryCell(wrapper, 'player2', 'summary-result')).toBe('DÉFAITE')
  })

  it('declares a tie when the yellow player equalizes', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [1, 0])
    await press(wrapper, 'prompt-primary')

    await validateSeries(wrapper, [8])

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE TERMINÉE')

    await press(wrapper, 'prompt-primary')

    expect(summaryCell(wrapper, 'player1', 'summary-result')).toBe('ÉGALITÉ')
    expect(summaryCell(wrapper, 'player2', 'summary-result')).toBe('ÉGALITÉ')
    expect(wrapper.findAll('.bg-victory-ribbon')).toHaveLength(0)
  })

  // AC6 : le jaune atteint le premier → fin immédiate, sans offre ni croix, et le récap
  // le donne vainqueur.
  it('ends the game at once when the yellow player reaches first', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [5])

    await validateSeries(wrapper, [8])

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE TERMINÉE')
    expect(wrapper.find('[data-testid="prompt-close"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-secondary"]').exists()).toBe(false)

    await press(wrapper, 'prompt-primary')

    expect(summaryCell(wrapper, 'player2', 'summary-result')).toBe('VICTOIRE')
    expect(summaryCell(wrapper, 'player1', 'summary-result')).toBe('DÉFAITE')
  })

  // Revue de Nathan (2026-09-10) : une fois la fin détectée, on ne revient pas au
  // scoreboard — la pop-up n'a qu'une issue, le récap. Le voile reste inerte.
  it('offers no way back to the board from the end prompt', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [5])
    await validateSeries(wrapper, [8])

    await prompt(wrapper).trigger('pointerdown')
    await prompt(wrapper).trigger('pointerup')
    await wrapper.vm.$nextTick()

    expect(prompt(wrapper).exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="prompt-close"]')).toHaveLength(0)
    expect(store.status).toBe('playing')
  })

  // AC4 : `FIN DE PARTIE` sur l'offre = le blanc gagne, récap direct.
  it('finishes from FIN DE PARTIE with the white player as winner', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [1, 0])

    await press(wrapper, 'prompt-secondary')

    expect(store.status).toBe('finished')
    expect(summary(wrapper).exists()).toBe(true)
    expect(summaryCell(wrapper, 'player1', 'summary-result')).toBe('VICTOIRE')
    expect(
      wrapper.find('[data-testid="summary-column"][data-side="player1"]').classes(),
    ).toContain('bg-victory-ribbon')
  })

  // AC8, UX-DR15 : l'auto-validation à 3 s aboutit au même état que le bouton.
  it('reaches the end prompt through the three-second path too', async () => {
    const { wrapper } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 0])
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="modal-backdrop"]').exists()).toBe(false)
    expect(prompt(wrapper).exists()).toBe(true)
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('MICHEL A ATTEINT SA DISTANCE')
  })

  // AC8 : les corrections ne déclenchent jamais la détection.
  it('never ends the game on a correction', async () => {
    const { wrapper } = await startedGame()

    for (let i = 0; i < 10; i += 1) {
      await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    }
    await wrapper.vm.$nextTick()

    expect(scoreOf(wrapper, 0)).toBe('10')
    expect(prompt(wrapper).exists()).toBe(false)
  })

  // AC10, AC11 : la sortie demande confirmation ; confirmée, le vainqueur est au prorata.
  it('asks before leaving a game with series, and computes the winner pro rata', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [4])
    await validateSeries(wrapper, [4])

    await press(wrapper, 'exit-button')

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('TERMINER LA PARTIE ?')
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('VOIR LE RÉCAP')
    // Revue de Nathan (2026-09-10) : un gros CTA `ANNULER` plutôt qu'une croix.
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')
    expect(wrapper.find('[data-testid="prompt-close"]').exists()).toBe(false)
    expect(store.status).toBe('playing')

    await press(wrapper, 'prompt-secondary')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(panels(wrapper)).toHaveLength(2)
    expect(store.status).toBe('playing')
    // Grâce anti-tap fantôme : `ANNULER` de la pop-up est au-dessus des panneaux, un
    // `undo` qui suit immédiatement est ignoré — la dernière série reste.
    await press(wrapper, 'undo-button')
    expect(scoreOf(wrapper, 1)).toBe('4')

    vi.advanceTimersByTime(300)
    await press(wrapper, 'exit-button')
    await press(wrapper, 'prompt-primary')

    expect(store.status).toBe('finished')
    expect(summary(wrapper).exists()).toBe(true)
    // 4/8 = 0,5 > 4/10 = 0,4 : le jaune gagne.
    expect(summaryCell(wrapper, 'player2', 'summary-result')).toBe('VICTOIRE')
    expect(summaryCell(wrapper, 'player1', 'summary-result')).toBe('DÉFAITE')
  })

  // AC12 : rien à récapituler → accueil direct, sans pop-up.
  it('leaves straight to the home screen when nothing was played', async () => {
    const { wrapper, store } = await startedGame()

    await press(wrapper, 'exit-button')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })

  // Revue 1.10 (décision de Nathan, 2026-09-10) : des points ajoutés par `+` sans aucune
  // série sont quand même quelque chose à récapituler — la sortie demande confirmation.
  it('asks before leaving when points were only added by a correction', async () => {
    const { wrapper, store } = await startedGame()
    await press(wrapper, 'score-plus')
    expect(scoreOf(wrapper, 0)).toBe('1')

    await press(wrapper, 'exit-button')

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('TERMINER LA PARTIE ?')
    expect(store.status).toBe('playing')
  })

  // AC13, AC15, AC16 : le récap remplace le scoreboard — bandeau, stats, aucune commande
  // de jeu.
  it('shows the Billiboard banner and stats on the summary', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [4])
    await validateSeries(wrapper, [2])
    await validateSeries(wrapper, [6])
    await press(wrapper, 'prompt-secondary')

    const banner = wrapper.find('[data-testid="summary-banner"]')
    expect(banner.text()).toContain('MICHEL / 10')
    expect(banner.text()).toContain('ANDRÉ / 8')
    expect(banner.text()).toContain('VS')
    expect(banner.text()).toContain('LIBRE')
    expect(summaryCell(wrapper, 'player1', 'summary-points')).toBe('10')
    expect(summaryCell(wrapper, 'player1', 'summary-average')).toBe('5.000')
    expect(summaryCell(wrapper, 'player1', 'summary-best')).toBe('6')
    expect(summaryCell(wrapper, 'player1', 'summary-reprises')).toBe('2')
    expect(summaryCell(wrapper, 'player2', 'summary-points')).toBe('2')
    expect(summaryCell(wrapper, 'player2', 'summary-average')).toBe('2.000')
    expect(summaryCell(wrapper, 'player2', 'summary-best')).toBe('2')
    expect(summaryCell(wrapper, 'player2', 'summary-reprises')).toBe('1')
    expect(wrapper.find('[data-testid="undo-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="add-points-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="back-button"]').exists()).toBe(false)
    expect(panels(wrapper)).toHaveLength(0)
  })

  // AC16 : UNE PARTIE DE PLUS — mêmes joueurs, mêmes distances, mêmes côtés, scoreboard
  // direct.
  it('starts a rematch with the same players, distances and sides', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [1, 0])
    await press(wrapper, 'prompt-secondary')
    expect(summary(wrapper).exists()).toBe(true)

    await press(wrapper, 'rematch-button')

    expect(store.status).toBe('playing')
    expect(summary(wrapper).exists()).toBe(false)
    expect(panels(wrapper)).toHaveLength(2)
    expect(panels(wrapper)[0]!.props('player').name).toBe('MICHEL')
    expect(panels(wrapper)[0]!.find('[data-testid="target-score"]').text()).toBe('10')
    expect(panels(wrapper)[1]!.props('player').name).toBe('ANDRÉ')
    expect(panels(wrapper)[1]!.find('[data-testid="target-score"]').text()).toBe('8')
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(scoreOf(wrapper, 1)).toBe('0')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(false)
  })

  it('returns home from FIN DE PARTIE', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [1, 0])
    await press(wrapper, 'prompt-secondary')

    await press(wrapper, 'end-game-button')

    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })
})
