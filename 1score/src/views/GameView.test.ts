import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import GameView from './GameView.vue'
import { useGameStore } from '../stores/useGameStore'
// ⚠️ La grâce du chrono est un réglage de rendu (3 s → 2 s → 1 s) : les attentes qui
// l'englobent la DÉRIVENT, elles ne la recopient pas. Sans ça, chaque ajustement de
// Nathan casse une dizaine de cas qui n'ont rien à voir avec ce qu'ils testent.
import { SHOT_CLOCK_GRACE_MS } from '../composables/useTimer'
import type { PlayerId } from '../types/game'

describe('GameView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Depuis la 1.10, DÉMARRER exige une distance par joueur (AC1) ; depuis la 10.3, elle se
  // saisit EN PLACE sur la carte, sans pop-up — `distance-field` existe donc en double, un
  // par carte, et se cherche depuis la carte visée.
  it('shows the home screen while idle, then the game once started', async () => {
    const wrapper = mount(GameView)
    const press = async (testid: string) =>
      wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)

    await press('category-series')
    await press('mode-libre')
    for (const side of ['left', 'right']) {
      await wrapper
        .find(`[data-testid="player-card-${side}"] [data-testid="distance-field"]`)
        .trigger('pointerdown')
      await press('digit-5')
      await press('digit-0')
      await press('dock-confirm')
    }
    await press('confirm-button')

    expect(wrapper.findAllComponents({ name: 'PlayerPanel' })).toHaveLength(2)
  })

  // --- Story 10.3 : la bille blanche ouvre, où qu'elle soit assise (AR24) ---

  it('seats the players on the side chosen at setup', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 }, 'right')
    await wrapper.vm.$nextTick()

    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[0]!.props('player').color).toBe('yellow')
    expect(panels[0]!.props('player').name).toBe('ANDRE')
    expect(panels[1]!.props('player').color).toBe('white')
    expect(panels[1]!.props('player').name).toBe('MICHEL')
  })

  // Le blanc ouvre même assis à droite : c'est lui qui a la main au premier tour.
  it('still gives the hand to the white ball when it sits on the right', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 }, 'right')
    await wrapper.vm.$nextTick()

    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[1]!.props('active')).toBe(true)
    expect(panels[0]!.props('active')).toBe(false)
  })

  // ⚠️ Le piège de la story : le CTA appartient au joueur ASSIS, donc il doit suivre la
  // COLONNE de l'assis. Avec le blanc à droite, `player1` joue à droite : le CTA revient à
  // `player2`, dans la colonne de GAUCHE. Un ordre de panneaux qui suit `whiteSide` sans
  // que la barre basse suive mettrait le CTA sous la carte de celui qui a la main.
  it('keeps the entry CTA in the column of the seated player', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 }, 'right')
    await wrapper.vm.$nextTick()

    const cta = wrapper.find('[data-testid="add-points-button"]')
    expect(cta.attributes('data-side')).toBe('player2')
    expect(wrapper.find('[data-testid="exit-button"]').attributes('data-side')).toBe('player1')
  })

  // Bout en bout depuis l'accueil : on change de côté, on démarre, et le blanc ouvre.
  it('goes from the setup to a game where the white ball opens from the right', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    const press = async (testid: string) =>
      wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')

    await press('category-series')
    await press('mode-libre')
    for (const side of ['left', 'right']) {
      await wrapper
        .find(`[data-testid="player-card-${side}"] [data-testid="distance-field"]`)
        .trigger('pointerdown')
      await press('digit-5')
      await press('digit-0')
      await press('dock-confirm')
    }
    // Seul CHANGER DE BILLE déplace la bille blanche d'un côté à l'autre de l'écran ;
    // CHANGER DE CÔTÉ, lui, n'intervertit que les noms et les distances (revue du
    // 2026-09-12).
    await press('change-ball-button')
    await press('confirm-button')
    await wrapper.vm.$nextTick()

    expect(store.whiteSide).toBe('right')
    const panels = wrapper.findAllComponents({ name: 'PlayerPanel' })
    expect(panels[0]!.props('player').color).toBe('yellow')
    expect(panels[1]!.props('player').color).toBe('white')
    expect(panels[1]!.props('active')).toBe(true)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe(
      'player2',
    )
  })

  // AC14 : `ÉCHANGER` n'existe plus nulle part.
  it('offers no swap button at all in game', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="swap-players-button"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('ÉCHANGER')
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

    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(false)
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
    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(false)
  })

  // AC12 : VALIDER sur une saisie vide ne fait RIEN — la pop-up reste ouverte, aucun
  // compteur ne bouge, le tour ne bascule pas.
  it('keeps the popup open and inert when VALIDER is tapped on an empty entry', async () => {
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await wrapper.find('[data-testid="entry-confirm-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(true)
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
  })

  // ⚠️ Tap fantôme : à l'auto-validation la pop-up disparaît sous le doigt et le tour a
  // basculé — un appui qui arrive juste après tombe désormais sur `PASSER LE TOUR`
  // (colonne centrale, sous la carte de pop-up qui vient de se fermer) ou sur `−`/`+`.
  // Deux actions annulables à portée immédiate : la grâce reste nécessaire (AC8).
  it('ignores the panels and PASSER LE TOUR right after the popup closed by itself', async () => {
    vi.useFakeTimers()
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 2])
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()
    expect(store.activePlayer).toBe('player2')

    await wrapper.find('[data-testid="pass-turn-button"]').trigger('pointerdown')
    await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    expect(store.reprises[0]!.player2).toBeNull()
    expect(store.player1.score).toBe(12)
    expect(store.activePlayer).toBe('player2')

    // Grâce écoulée : le même geste rend bien la main (série de 0 pour le jaune).
    vi.advanceTimersByTime(300)
    await wrapper.find('[data-testid="pass-turn-button"]').trigger('pointerdown')
    expect(store.reprises[0]!.player2).toBe(0)
    expect(store.activePlayer).toBe('player1')
  })

  // Fermer sans valider ne doit rien enregistrer, et surtout pas laisser un buffer
  // traîner : il se rouvrirait pré-rempli à la saisie suivante.
  it('discards the running entry when the popup is closed without validating', async () => {
    const { wrapper, store } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [9])
    await wrapper.find('[data-testid="entry-cancel-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.reprises).toEqual([])
    expect(store.currentInput.player1).toBe('')
    expect(store.activePlayer).toBe('player1')
    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(false)
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

  // Story 1.15 (AC1), Story 10.4 (AC12) : les quatre pictos tiennent la MÊME colonne, celle
  // opposée au CTA, et changent de côté avec lui. L'ordre est fixe du bord EXTÉRIEUR vers
  // l'intérieur — QUITTER · PARAMÈTRES · RECOMMENCER · ANNULER.
  // ⚠️ L'ordre du DOM est celui-là quel que soit le côté : c'est `flex-row-reverse` qui
  // retourne l'affichage (DT2). Lire un index de DOM pour juger de la position visuelle
  // serait faux — ce test vérifie le VOISINAGE et la colonne, pas la position à l'écran.
  it('keeps the four pictos together in the column opposite the CTA', async () => {
    const { wrapper, store } = await startedGame()
    const groupOf = (testid: string) =>
      wrapper.find(`[data-testid="${testid}"]`).element.parentElement

    expect(wrapper.find('[data-testid="restart-button"][data-side="player1"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="restart-button"][data-side="player2"]').exists()).toBe(false)
    for (const testid of ['settings-button', 'restart-button', 'undo-button']) {
      expect(groupOf(testid)).toBe(groupOf('exit-button'))
    }
    expect(wrapper.find('[data-testid="restart-button"]').attributes('aria-label')).toBeUndefined()

    store.switchTurn()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="restart-button"][data-side="player2"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="restart-button"][data-side="player1"]').exists()).toBe(false)
    expect(groupOf('restart-button')).toBe(groupOf('exit-button'))
  })

  // Story 10.4 (AC15) : le picto porte désormais son LIBELLÉ sous lui — c'est la cible
  // tactile entière, libellé compris, qui tient les 90 px. L'`aria-label` de secours de la
  // 1.10 n'a plus de raison d'être : le texte est là, visible et lu.
  it('leaves the game from the exit picto action', async () => {
    const { wrapper, store } = await startedGame()
    const exit = wrapper.find('[data-testid="exit-button"]')

    expect(exit.text()).toContain('QUITTER')

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
    await wrapper.find('[data-testid="score-entry-dock"]').trigger('pointerup')

    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(true)
  })

  // AC6 : rendre la main sans marquer se fait par `PASSER LE TOUR`. Une série de 0 est
  // enregistrée — la reprise compte, mais le total ne bouge pas. Seul LE GESTE a changé.
  it('hands over with a zero series on PASSER LE TOUR', async () => {
    const { wrapper, store } = await startedGame()

    await wrapper.find('[data-testid="pass-turn-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(store.player1.score).toBe(0)
    expect(store.reprises).toHaveLength(1)
    expect(store.reprises[0]!.player1).toBe(0)
    expect(panels(wrapper)[1]!.props('active')).toBe(true)
  })

  // AC4 : la carte est INERTE. Taper n'importe où dessus, hors `−`/`+`, ne fait plus rien
  // — ni sur celle qui a la main, ni sur l'autre. C'est la dette du `role="button"`
  // englobant (revue de la 1.5) qui se referme ici.
  it('ignores a tap on either card, with or without the hand', async () => {
    const { wrapper, store } = await startedGame()

    await panels(wrapper)[0]!.trigger('pointerdown')
    await panels(wrapper)[1]!.trigger('pointerdown')
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
    expect(panels(wrapper)[0]!.find('[data-testid="turn-ring"]').exists()).toBe(true)
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


  // AC3 : ouvrir la pop-up, taper, puis la refermer par la croix ou par un tap en dehors
  // ne modifie pas la partie — rien n'est empilé (revue de la 1.7 : une mutation
  // « `pushHistory` dans `clearScoreInput` » resterait verte sans ce test).
  it('leaves nothing to undo after an entry is typed then closed without validating', async () => {
    const { wrapper, store } = await startedGame()

    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="digit-9"]').trigger('pointerdown')
    await wrapper.find('[data-testid="entry-cancel-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(false)
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()

    await wrapper.find('[data-testid="add-points-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="digit-9"]').trigger('pointerdown')
    // Le voile ferme sur un geste complet : appui ET relâchement.
    await wrapper.find('[data-testid="score-entry-dock"]').trigger('pointerdown')
    await wrapper.find('[data-testid="score-entry-dock"]').trigger('pointerup')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(false)
    expect(store.canUndo).toBe(false)
    expect(undoButton(wrapper).attributes('disabled')).toBeDefined()
  })

  // ⚠️ Tap fantôme (revue de la 1.7) : la carte de la pop-up recouvre la colonne centrale.
  // À l'auto-validation, un doigt qui arrive sur l'emplacement d'une touche peut tomber sur
  // ANNULER et défaire la série qui vient d'être validée — ou sur ÉCHANGER. Même grâce
  // que les panneaux.
  it('ignores a tap on ANNULER right after the popup closed by itself', async () => {
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

    // Grâce écoulée : le même geste agit.
    vi.advanceTimersByTime(300)
    await undo(wrapper)
    expect(scoreOf(wrapper, 0)).toBe('0')
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

  function bannerPart(wrapper: VueWrapper, side: PlayerId, testid: string) {
    return wrapper
      .find(`[data-testid="summary-banner"] [data-testid="summary-${side}"]`)
      .find(`[data-testid="${testid}"]`)
      .text()
  }

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
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('MICHEL A FINI')
    // Revue de Nathan (2026-09-10) : pas de message, les deux CTA disent tout.
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('ANDRÉ JOUE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('FIN DE PARTIE')
    expect(wrapper.find('[data-testid="prompt-ball"]').classes()).toContain('bg-player-white')
    expect(panels(wrapper)[1]!.find('[data-testid="turn-ring"]').exists()).toBe(true)
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
    // Restreint au récap : depuis la Story 11.2 le ruban de victoire et le bandeau de la barre
    // latérale partagent LE rouge profond (`bg-brand-red`), et la barre est dans la vue.
    expect(wrapper.find('[data-testid="game-summary"]').findAll('.bg-brand-red')).toHaveLength(0)
  })

  // AC6 : le jaune atteint le premier → fin immédiate, sans offre ni croix, et le récap
  // le donne vainqueur.
  it('ends the game at once when the yellow player reaches first', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [5])

    await validateSeries(wrapper, [8])

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE TERMINÉE')
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
    // Depuis la 1re passe de rendu de la 10.5, l'aplat est porté par chaque CELLULE et
    // non plus par la colonne : les blocs sont séparés d'une marge qui laisse voir le fond.
    expect(
      wrapper.find('[data-testid="summary-column"][data-side="player1"] [data-testid="summary-points"]').classes(),
    ).toContain('bg-brand-red')
  })

  // AC8, UX-DR15 : l'auto-validation à 3 s aboutit au même état que le bouton.
  it('reaches the end prompt through the three-second path too', async () => {
    const { wrapper } = await startedGame()

    await openEntry(wrapper)
    await type(wrapper, [1, 0])
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="score-entry-dock"]').exists()).toBe(false)
    expect(prompt(wrapper).exists()).toBe(true)
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('MICHEL A FINI')
  })

  // Revue de fin d'Epic 10 (décision de Nathan) : une correction `+` qui ATTEINT la distance
  // déclenche la fin, et la pop-up offre `ANNULER` — le retour arrière si le point n'était
  // pas dû. Elle monte sous le doigt qui a pressé `+` : le relâchement de CE geste retombe
  // sur le voile et ne ferme rien, seul un tap complet dehors vaut `ANNULER`.
  it('ends the game on a correction that reaches the distance, with a way back', async () => {
    const { wrapper, store } = await startedGame()

    for (let i = 0; i < 10; i += 1) {
      await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    }
    await wrapper.vm.$nextTick()

    expect(scoreOf(wrapper, 0)).toBe('10')
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('MICHEL A FINI')
    expect(wrapper.find('[data-testid="prompt-action-play"]').text()).toBe('ANDRÉ JOUE')
    expect(wrapper.find('[data-testid="prompt-action-finish"]').text()).toBe('FIN DE PARTIE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')

    await prompt(wrapper).trigger('pointerup', { pointerId: 1 })
    expect(prompt(wrapper).exists()).toBe(true)

    await press(wrapper, 'prompt-secondary')
    await wrapper.vm.$nextTick()

    expect(prompt(wrapper).exists()).toBe(false)
    expect(scoreOf(wrapper, 0)).toBe('9')
    expect(store.status).toBe('playing')
  })

  // Règle de Nathan (2026-09-15) : un CTA `ANNULER` rend le voile refermable — sur cette
  // pop-up-ci, taper à côté défait donc le `+` comme `ANNULER` ; sur l'offre par SÉRIE
  // (`FIN DE PARTIE`), le voile reste inerte (cas « offers no way back… » ci-dessus).
  it('reverts the correction on a complete tap outside the revertible prompt', async () => {
    const { wrapper } = await startedGame()
    for (let i = 0; i < 10; i += 1) {
      await panels(wrapper)[0]!.find('[data-testid="score-plus"]').trigger('pointerdown')
    }
    await wrapper.vm.$nextTick()

    await prompt(wrapper).trigger('pointerdown', { pointerId: 2 })
    await prompt(wrapper).trigger('pointerup', { pointerId: 2 })
    await wrapper.vm.$nextTick()

    expect(prompt(wrapper).exists()).toBe(false)
    expect(scoreOf(wrapper, 0)).toBe('9')
  })

  it('keeps the three-way offer wired to the equalizing reprise and to the summary', async () => {
    const first = await startedGame()
    first.store.adjustScore('player1', 10)
    await first.wrapper.vm.$nextTick()
    await press(first.wrapper, 'prompt-action-play')
    expect(first.store.equalizingReprise).toBe(true)
    expect(prompt(first.wrapper).exists()).toBe(false)

    const second = await startedGame()
    second.store.adjustScore('player1', 10)
    await second.wrapper.vm.$nextTick()
    await press(second.wrapper, 'prompt-action-finish')
    expect(second.store.status).toBe('finished')
    expect(second.store.winner).toBe('player1')
  })

  it('adds ANNULER to PARTIE TERMINÉE only when a correction opened it', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [3])
    store.adjustScore('player2', 8)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE TERMINÉE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')

    await press(wrapper, 'prompt-secondary')
    await wrapper.vm.$nextTick()
    expect(prompt(wrapper).exists()).toBe(false)
    expect(scoreOf(wrapper, 1)).toBe('0')

    await validateSeries(wrapper, [8])
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE TERMINÉE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').exists()).toBe(false)
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

  // --- Story 1.15 : RECOMMENCER ---

  // AC2 : rien à recommencer sur un scoreboard intact — picto grisé (`disabled`) ET inerte
  // (garde `canUndo`), sans que la barre change de forme. `trigger()` de Vue Test Utils ne
  // dispatche RIEN sur un bouton `disabled` (il ne prouve donc que le `disabled`) : un
  // événement natif, lui, atteint le handler — comme Chromium depuis 2023 — et c'est la
  // garde `canUndo` d'`askRestart` qui doit l'ignorer (revue de code 1.15).
  it('keeps the restart control inert on an untouched board', async () => {
    const { wrapper, store } = await startedGame()
    expect(wrapper.find('[data-testid="restart-button"]').attributes('disabled')).toBeDefined()

    await press(wrapper, 'restart-button')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(store.status).toBe('playing')

    wrapper.find('[data-testid="restart-button"]').element.dispatchEvent(new Event('pointerdown'))
    await wrapper.vm.$nextTick()

    expect(prompt(wrapper).exists()).toBe(false)
    expect(store.status).toBe('playing')

    await press(wrapper, 'score-plus')

    expect(wrapper.find('[data-testid="restart-button"]').attributes('disabled')).toBeUndefined()
  })

  // AC3, AC4 : confirmation obligatoire — titre + deux CTA, ni message, ni croix, ni bille.
  // `ANNULER` rend le scoreboard intact, et la grâce anti-tap fantôme suit (le CTA est
  // au-dessus de la console) : un `undo` immédiat est ignoré, le suivant agit.
  it('asks before restarting and leaves the board untouched on ANNULER', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [4])
    await validateSeries(wrapper, [4])

    await press(wrapper, 'restart-button')

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('RECOMMENCER LA PARTIE ?')
    expect(wrapper.find('[data-testid="prompt-message"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-ball"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('RECOMMENCER')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')
    expect(store.status).toBe('playing')
    expect(scoreOf(wrapper, 0)).toBe('4')
    expect(scoreOf(wrapper, 1)).toBe('4')

    await press(wrapper, 'prompt-secondary')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(store.status).toBe('playing')
    expect(scoreOf(wrapper, 0)).toBe('4')
    expect(scoreOf(wrapper, 1)).toBe('4')
    expect(store.canUndo).toBe(true)
    await press(wrapper, 'undo-button')
    expect(scoreOf(wrapper, 1)).toBe('4')

    vi.advanceTimersByTime(300)
    await press(wrapper, 'undo-button')
    expect(scoreOf(wrapper, 1)).toBe('0')
  })

  // AC5 : la partie repart SUR PLACE — ni récap ni accueil — même mode, mêmes noms, mêmes
  // distances, chacun du côté où il est (après un ÉCHANGER), le blanc a la main, rien
  // d'annulable. La grâce s'applique : le scoreboard neuf revient sous le doigt.
  it('restarts the game in place on RECOMMENCER', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [4])
    await validateSeries(wrapper, [4])
    await press(wrapper, 'score-plus')
    expect(scoreOf(wrapper, 0)).toBe('5')

    await press(wrapper, 'restart-button')
    await press(wrapper, 'prompt-primary')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(summary(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(false)
    expect(store.status).toBe('playing')
    expect(panels(wrapper)).toHaveLength(2)
    expect(panels(wrapper)[0]!.props('player').name).toBe('MICHEL')
    expect(panels(wrapper)[0]!.find('[data-testid="target-score"]').text()).toBe('10')
    expect(panels(wrapper)[1]!.props('player').name).toBe('ANDRÉ')
    expect(panels(wrapper)[1]!.find('[data-testid="target-score"]').text()).toBe('8')
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(scoreOf(wrapper, 1)).toBe('0')
    for (const panel of panels(wrapper)) {
      expect(panel.find('[data-testid="average"]').text()).toBe('0.000')
      expect(panel.find('[data-testid="best-series"]').text()).toBe('0')
    }
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
    expect(panels(wrapper)[0]!.props('active')).toBe(true)
    expect(panels(wrapper)[1]!.props('active')).toBe(false)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe(
      'player2',
    )
    expect(wrapper.find('[data-testid="undo-button"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="restart-button"]').attributes('disabled')).toBeDefined()

    await press(wrapper, 'score-plus')
    expect(scoreOf(wrapper, 0)).toBe('0')

    vi.advanceTimersByTime(300)
    await press(wrapper, 'score-plus')
    expect(scoreOf(wrapper, 0)).toBe('1')
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
    // Depuis la 10.5, nom et distance sont deux éléments distincts (AC3, DT6) : le
    // bandeau ne rend plus `MICHEL / 10` d'une seule pièce.
    expect(bannerPart(wrapper, 'player1', 'summary-name')).toBe('MICHEL')
    expect(bannerPart(wrapper, 'player1', 'summary-distance')).toBe('10')
    expect(bannerPart(wrapper, 'player2', 'summary-name')).toBe('ANDRÉ')
    expect(bannerPart(wrapper, 'player2', 'summary-distance')).toBe('8')
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

    await press(wrapper, 'sidebar-item-restart')

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

  // AC2 : le récap passe à la coquille de l'epic — barre latérale à deux entrées, plus
  // aucune barre basse. La sortie est isolée en bas (décision 2 de Nathan).
  it('drives the summary from a sidebar, with no bottom bar left', async () => {
    const { wrapper } = await startedGame()
    await validateSeries(wrapper, [1, 0])
    await press(wrapper, 'prompt-secondary')

    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="sidebar-item-restart"]').text()).toContain('RECOMMENCER')
    expect(wrapper.find('[data-testid="sidebar-bottom"] [data-testid="sidebar-item-quit"]').text())
      .toContain('QUITTER')
    expect(wrapper.find('[data-testid="summary-bar"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="rematch-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="end-game-button"]').exists()).toBe(false)
  })

  it('returns home from QUITTER', async () => {
    const { wrapper, store } = await startedGame()
    await validateSeries(wrapper, [1, 0])
    await press(wrapper, 'prompt-secondary')

    await press(wrapper, 'sidebar-item-quit')

    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
  })
})

// --- Story 1.12 : reprise après fermeture accidentelle ---

describe('GameView — reprise après fermeture', () => {
  // Fake timers : la pop-up de saisie rouverte relance son compte à rebours de 3 s, et la
  // grâce anti-tap fantôme (300 ms) suit chaque fermeture de la pop-up de SAISIE.
  // `REPRENDRE` n'en pose aucune (Task 4.2) : les panneaux répondent immédiatement.
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  type Store = ReturnType<typeof useGameStore>

  function validate(store: Store, playerId: PlayerId, value: number) {
    for (const digit of String(value)) store.appendScoreDigit(playerId, Number(digit))
    store.validateScoreInput(playerId)
  }

  // Joue sur un premier pinia, laisse le `watch` écrire, puis simule le lancement
  // suivant : nouveau pinia, `checkSavedGame()` comme `main.ts`, montage de la vue.
  async function relaunchAfter(play: (store: Store) => void) {
    play(useGameStore())
    await nextTick()
    setActivePinia(createPinia())
    const store = useGameStore()
    store.checkSavedGame()
    const wrapper = mount(GameView)
    await wrapper.vm.$nextTick()
    return { wrapper, store }
  }

  // MICHEL 7 + 2 de correction = 9, ANDRE 3, la main au blanc.
  function playedGame(store: Store) {
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })
    validate(store, 'player1', 7)
    validate(store, 'player2', 3)
    store.adjustScore('player1', 2)
  }

  const prompt = (wrapper: VueWrapper) => wrapper.find('[data-testid="prompt-modal"]')
  const panels = (wrapper: VueWrapper) => wrapper.findAllComponents({ name: 'PlayerPanel' })
  const scoreOf = (wrapper: VueWrapper, side: 0 | 1) =>
    panels(wrapper)[side]!.find('[data-testid="score"]').text()

  async function press(wrapper: VueWrapper, testid: string) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  // AC2 : l'accueil est rendu derrière la pop-up, sans croix.
  it('offers to resume over the home screen when a game was saved', async () => {
    const { wrapper } = await relaunchAfter(playedGame)

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
    expect(prompt(wrapper).exists()).toBe(true)
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('PARTIE EN COURS')
    expect(wrapper.find('[data-testid="prompt-primary"]').text()).toBe('REPRENDRE LA PARTIE')
    expect(wrapper.find('[data-testid="prompt-secondary"]').text()).toBe('ANNULER')
  })

  // AC3 : le scoreboard revient exactement où il en était.
  it('brings the scoreboard back as it was on REPRENDRE LA PARTIE', async () => {
    const { wrapper } = await relaunchAfter(playedGame)

    await press(wrapper, 'prompt-primary')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(panels(wrapper)).toHaveLength(2)
    expect(scoreOf(wrapper, 0)).toBe('9')
    expect(scoreOf(wrapper, 1)).toBe('3')
    expect(panels(wrapper)[0]!.props('player').name).toBe('MICHEL')
    expect(panels(wrapper)[0]!.find('[data-testid="target-score"]').text()).toBe('100')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('2')
    expect(panels(wrapper)[0]!.props('active')).toBe(true)
    expect(panels(wrapper)[1]!.props('active')).toBe(false)
    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe(
      'player2',
    )
  })

  it('lets ANNULER undo the actions taken before the reload', async () => {
    const { wrapper } = await relaunchAfter(playedGame)
    await press(wrapper, 'prompt-primary')
    // Pas d'avance de timer : aucune grâce après `REPRENDRE`, l'appui suivant agit.

    const undo = wrapper.find('[data-testid="undo-button"]')
    expect(undo.attributes('disabled')).toBeUndefined()

    await press(wrapper, 'undo-button')

    expect(scoreOf(wrapper, 0)).toBe('7')
  })

  // Story 1.15 (AC7) : la sauvegarde reflète la partie recommencée — au relancement,
  // `REPRENDRE LA PARTIE` ramène la partie neuve, sans trace de l'ancienne.
  it('resumes the restarted game, not the old one', async () => {
    const { wrapper, store } = await relaunchAfter((store) => {
      playedGame(store)
      store.restartGame()
    })

    await press(wrapper, 'prompt-primary')

    expect(store.status).toBe('playing')
    expect(store.reprises).toEqual([])
    expect(scoreOf(wrapper, 0)).toBe('0')
    expect(scoreOf(wrapper, 1)).toBe('0')
    expect(panels(wrapper)[0]!.props('player').name).toBe('MICHEL')
    expect(panels(wrapper)[0]!.find('[data-testid="target-score"]').text()).toBe('100')
    expect(wrapper.find('[data-testid="reprise-number"]').text()).toBe('1')
    expect(wrapper.find('[data-testid="undo-button"]').attributes('disabled')).toBeDefined()
  })

  // AC4 : la sauvegarde est jetée, l'accueil reste.
  it('drops the save and stays on the home screen on ANNULER', async () => {
    const { wrapper, store } = await relaunchAfter(playedGame)

    await press(wrapper, 'prompt-secondary')

    expect(prompt(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
    expect(store.status).toBe('idle')
    expect(localStorage.getItem('1score:game')).toBeNull()
  })

  // Décision 3 : fermeture pendant la saisie → la pop-up de saisie se rouvre, chiffres compris.
  it('reopens the score entry with its buffer when it was open', async () => {
    const { wrapper } = await relaunchAfter((store) => {
      playedGame(store)
      store.openScoreEntry('player1')
      store.appendScoreDigit('player1', 5)
    })

    expect(wrapper.findComponent({ name: 'ScoreEntryDock' }).exists()).toBe(false)

    await press(wrapper, 'prompt-primary')

    const entry = wrapper.findComponent({ name: 'ScoreEntryDock' })
    expect(entry.exists()).toBe(true)
    expect(wrapper.find('[data-testid="entry-value"]').text()).toBe('5')
    expect(wrapper.find('[data-testid="validate-countdown"]').exists()).toBe(true)
  })

  it('brings the equalizing offer back', async () => {
    const { wrapper } = await relaunchAfter((store) => {
      store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
      validate(store, 'player1', 10)
    })

    await press(wrapper, 'prompt-primary')

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe(
      'MICHEL A FINI',
    )
  })

  it('brings the summary back for a finished game', async () => {
    const { wrapper } = await relaunchAfter((store) => {
      store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
      validate(store, 'player1', 10)
      store.finishGame()
    })

    await press(wrapper, 'prompt-primary')

    expect(wrapper.find('[data-testid="game-summary"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="sidebar-item-restart"]').exists()).toBe(true)
  })

  // AC5 : rien à reprendre → accueil sans pop-up.
  it('shows no prompt on an empty storage', async () => {
    const store = useGameStore()
    store.checkSavedGame()
    const wrapper = mount(GameView)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
    expect(prompt(wrapper).exists()).toBe(false)
  })

  it('shows no prompt and drops a corrupted save', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem('1score:game', '{oops')
    const store = useGameStore()
    store.checkSavedGame()
    const wrapper = mount(GameView)
    await wrapper.vm.$nextTick()

    expect(prompt(wrapper).exists()).toBe(false)
    expect(localStorage.getItem('1score:game')).toBeNull()
  })

  // Le store porte désormais `entryOpen` : ouvrir et fermer la saisie passe par lui.
  it('drives entryOpen through the store when opening and closing the entry', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await wrapper.vm.$nextTick()

    await press(wrapper, 'add-points-button')
    expect(store.entryOpen).toBe(true)
    expect(wrapper.findComponent({ name: 'ScoreEntryDock' }).exists()).toBe(true)

    await press(wrapper, 'entry-cancel-button')
    expect(store.entryOpen).toBe(false)
    expect(wrapper.findComponent({ name: 'ScoreEntryDock' }).exists()).toBe(false)
  })
})

// --- Story 2.1 : chronomètre 3 Bandes --- (latence de 2 s avant le premier tick : Story 2.2)

describe('GameView — chronomètre 3 Bandes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function press(wrapper: VueWrapper, testid: string) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  const clock = (wrapper: VueWrapper) => wrapper.find('[data-testid="shot-clock"]')
  const clockValue = (wrapper: VueWrapper) =>
    wrapper.find('[data-testid="shot-clock-value"]').text()

  async function elapse(wrapper: VueWrapper, ms: number) {
    vi.advanceTimersByTime(ms)
    await wrapper.vm.$nextTick()
  }

  // Parcours réel depuis l'accueil : la catégorie 3 BANDES (mode unique) mène droit à
  // l'étape joueurs, la distance est obligatoire comme en JDS (AC2, AC3, AC4).
  async function startThreeCushionsFromHome() {
    const wrapper = mount(GameView)

    await press(wrapper, 'category-3bandes')
    expect(wrapper.find('[data-testid="step-mode"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="step-players"]').exists()).toBe(true)

    await press(wrapper, 'confirm-button')
    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('DISTANCE MANQUANTE')
    await press(wrapper, 'prompt-secondary')

    for (const side of ['left', 'right']) {
      await wrapper
        .find(`[data-testid="player-card-${side}"] [data-testid="distance-field"]`)
        .trigger('pointerdown')
      await press(wrapper, 'digit-3')
      await press(wrapper, 'digit-0')
      await press(wrapper, 'dock-confirm')
    }
    await press(wrapper, 'confirm-button')

    return { wrapper, store: useGameStore() }
  }

  // AC5, AC6 : le chrono apparaît dans la console centrale et décompte tout seul.
  it('starts a 3 Bandes game from home with the shot clock counting down', async () => {
    const { wrapper, store } = await startThreeCushionsFromHome()

    expect(store.mode).toBe('3bandes')
    expect(store.status).toBe('playing')
    expect(wrapper.findAllComponents({ name: 'PlayerPanel' })).toHaveLength(2)
    expect(clock(wrapper).exists()).toBe(true)
    expect(clockValue(wrapper)).toBe('40')

    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 3000)

    expect(clockValue(wrapper)).toBe('37')
  })

  // AC6 : absent dans tous les autres modes.
  it('shows no shot clock during a series game', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRÉ', { player1: 100, player2: 80 })
    await wrapper.vm.$nextTick()

    expect(clock(wrapper).exists()).toBe(false)
    await elapse(wrapper, 5000)
    expect(clock(wrapper).exists()).toBe(false)
  })

  // AC8 : RECOMMENCER remet l'anneau plein.
  it('restarts the shot clock from 40 on RECOMMENCER', async () => {
    const { wrapper } = await startThreeCushionsFromHome()
    await press(wrapper, 'plus-one-button')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 9700)
    expect(clockValue(wrapper)).toBe('31')

    await press(wrapper, 'restart-button')
    await press(wrapper, 'prompt-primary')

    expect(clockValue(wrapper)).toBe('40')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 1000)
    expect(clockValue(wrapper)).toBe('39')
  })

  // AC9 : la sortie vers l'accueil fait disparaître le chrono, sans ré-apparition.
  it('drops the shot clock when leaving to the home screen', async () => {
    const { wrapper, store } = await startThreeCushionsFromHome()
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 2000)
    expect(clockValue(wrapper)).toBe('38')

    await press(wrapper, 'exit-button')

    expect(store.status).toBe('idle')
    expect(wrapper.find('[data-testid="step-category"]').exists()).toBe(true)
    expect(clock(wrapper).exists()).toBe(false)

    await elapse(wrapper, 5000)
    expect(clock(wrapper).exists()).toBe(false)
  })
})

// --- Story 2.2 : `+1 POINT` du joueur assis, main rendue au tap, chrono relancé ---

describe('GameView — +1 POINT (3 Bandes)', () => {
  // `navigator.vibrate` est absent de happy-dom : installé pour observer l'haptique.
  const vibrate = vi.fn()

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vibrate.mockClear()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    delete (navigator as Partial<Navigator>).vibrate
  })

  async function press(wrapper: VueWrapper, testid: string) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  const clockValue = (wrapper: VueWrapper) =>
    wrapper.find('[data-testid="shot-clock-value"]').text()
  const panels = (wrapper: VueWrapper) => wrapper.findAllComponents({ name: 'PlayerPanel' })
  const score = (wrapper: VueWrapper, side: 0 | 1) =>
    panels(wrapper)[side]!.find('[data-testid="score"]').text()
  // La main se rend en tapant la carte du joueur ASSIS (le panneau inactif).
  // Story 10.4 (AC4) : la carte n'est plus tapable — on rend la main par le CTA
  // `PASSER LE TOUR` de la colonne centrale, quel que soit le joueur actif.
  async function passTurn(wrapper: VueWrapper) {
    await wrapper.find('[data-testid="pass-turn-button"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  async function elapse(wrapper: VueWrapper, ms: number) {
    vi.advanceTimersByTime(ms)
    await wrapper.vm.$nextTick()
  }

  async function startThreeCushions(targets = { player1: 30, player2: 25 }) {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', targets)
    await wrapper.vm.$nextTick()
    return { wrapper, store }
  }

  // AC1 : en 3 Bandes le CTA du joueur assis compte au point, il n'ouvre pas le pavé.
  // Story 10.4 : le libellé dit POUR QUI on compte (`data-testid` inchangé).
  it('replaces the series CTA with +1 ADVERSAIRE on the seated side', async () => {
    const { wrapper } = await startThreeCushions()

    const cta = wrapper.find('[data-testid="plus-one-button"]')
    expect(cta.exists()).toBe(true)
    expect(cta.text()).toBe('+1 ADVERSAIRE')
    expect(cta.attributes('data-side')).toBe('player2')
    expect(wrapper.find('[data-testid="add-points-button"]').exists()).toBe(false)
  })

  it('keeps the series-entry CTA in a series game', async () => {
    const wrapper = mount(GameView)
    useGameStore().startGame('libre', 'MICHEL', 'ANDRÉ', { player1: 100, player2: 80 })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="add-points-button"]').text()).toBe('+ POINTS ADVERSAIRE')
    expect(wrapper.find('[data-testid="plus-one-button"]').exists()).toBe(false)
  })

  // AC1, AC3 : chaque tap crédite un point à celui qui joue, le tour ne change pas,
  // le pavé ne s'ouvre pas, l'haptique accuse réception.
  it('credits one point per tap to the playing side, without opening the keypad', async () => {
    const { wrapper, store } = await startThreeCushions()

    await press(wrapper, 'plus-one-button')
    await press(wrapper, 'plus-one-button')

    expect(score(wrapper, 0)).toBe('2')
    expect(score(wrapper, 1)).toBe('0')
    expect(store.activePlayer).toBe('player1')
    expect(store.entryOpen).toBe(false)
    expect(wrapper.findComponent({ name: 'ScoreEntryDock' }).exists()).toBe(false)
    expect(vibrate).toHaveBeenCalledTimes(2)
  })

  // AC2 : le tap relance le chrono à 40, qui attend la grâce avant de reprendre.
  it('restarts the shot clock at 40 with its grace on each tap', async () => {
    const { wrapper } = await startThreeCushions()
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 10000)
    expect(clockValue(wrapper)).toBe('30')

    await press(wrapper, 'plus-one-button')

    expect(clockValue(wrapper)).toBe('40')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS)
    expect(clockValue(wrapper)).toBe('40')
    await elapse(wrapper, 1000)
    expect(clockValue(wrapper)).toBe('39')
  })

  // AC7 : la main rendue par `PASSER LE TOUR` CLÔTURE la série comptée aux `+1` — aucun 0
  // n'est ajouté par-dessus — et relance le chrono pour le joueur suivant.
  it('passes the turn from the CTA, closing the counted series and restarting the clock', async () => {
    const { wrapper, store } = await startThreeCushions()
    await press(wrapper, 'plus-one-button')
    await press(wrapper, 'plus-one-button')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 7000)
    expect(clockValue(wrapper)).toBe('33')

    await passTurn(wrapper)

    expect(store.activePlayer).toBe('player2')
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 2, player2: null })])
    expect(clockValue(wrapper)).toBe('40')
    // Le CTA suit l'assis : il est maintenant côté blanc.
    expect(wrapper.find('[data-testid="plus-one-button"]').attributes('data-side')).toBe('player1')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 1000)
    expect(clockValue(wrapper)).toBe('39')
  })

  // AC6 : sans aucun `+1`, rendre la main reste une série de 0 (comme en JDS), et relance.
  it('records a zero series on a pass without any tap', async () => {
    const { wrapper, store } = await startThreeCushions()
    await elapse(wrapper, 5000)

    await passTurn(wrapper)

    expect(store.reprises).toEqual([expect.objectContaining({ player1: 0, player2: null })])
    expect(clockValue(wrapper)).toBe('40')
  })

  // Un chrono figé à 0 repart au tap suivant.
  it('revives a clock frozen at zero on the next tap', async () => {
    const { wrapper } = await startThreeCushions()
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 48000)
    expect(clockValue(wrapper)).toBe('0')

    await press(wrapper, 'plus-one-button')

    expect(clockValue(wrapper)).toBe('40')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 1000)
    expect(clockValue(wrapper)).toBe('39')
  })

  // ANNULER défait un tap à la fois (chrono non touché : pas demandé).
  it('undoes one tap per ANNULER', async () => {
    const { wrapper, store } = await startThreeCushions()
    await press(wrapper, 'plus-one-button')
    await press(wrapper, 'plus-one-button')
    await press(wrapper, 'plus-one-button')

    await press(wrapper, 'undo-button')

    expect(score(wrapper, 0)).toBe('2')
    expect(store.canUndo).toBe(true)
  })

  // Atteindre la distance au tap ouvre l'offre d'égalisatrice sur-le-champ.
  it('offers the equalizing reprise when the white player reaches his distance by tap', async () => {
    const { wrapper } = await startThreeCushions({ player1: 2, player2: 25 })

    await press(wrapper, 'plus-one-button')
    await press(wrapper, 'plus-one-button')

    expect(wrapper.find('[data-testid="prompt-title"]').text()).toBe('MICHEL A FINI')
  })

  // Revue de code (2026-09-11) : à distance déjà atteinte (correction `+`), le tap est
  // SANS EFFET — ni haptique, ni relance du chrono (AC8).
  it('neither vibrates nor restarts the clock when the tap credits nothing', async () => {
    const { wrapper, store } = await startThreeCushions({ player1: 1, player2: 25 })
    store.adjustScore('player1', 1)
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 10000)
    expect(clockValue(wrapper)).toBe('30')

    await press(wrapper, 'plus-one-button')

    expect(store.player1.score).toBe(1)
    expect(vibrate).not.toHaveBeenCalled()
    expect(clockValue(wrapper)).toBe('30')
  })

  // Décision de Nathan (2026-09-11) : le jaune entame l'égalisatrice avec un chrono
  // plein — pas avec ce qui restait du décompte lancé sous la pop-up.
  it('restarts the clock at 40 when the equalizing reprise is accepted', async () => {
    const { wrapper, store } = await startThreeCushions({ player1: 1, player2: 25 })

    await press(wrapper, 'plus-one-button')
    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 8000)
    expect(clockValue(wrapper)).toBe('32')

    await press(wrapper, 'prompt-primary')

    expect(store.equalizingReprise).toBe(true)
    expect(clockValue(wrapper)).toBe('40')
    await elapse(wrapper, SHOT_CLOCK_GRACE_MS + 1000)
    expect(clockValue(wrapper)).toBe('39')
  })

  // En JDS, rendre la main n'appelle aucun chrono (il n'existe pas) et reste une série de 0.
  it('leaves the series game pass unchanged', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRÉ', { player1: 100, player2: 80 })
    await wrapper.vm.$nextTick()

    await passTurn(wrapper)

    expect(store.reprises).toEqual([expect.objectContaining({ player1: 0, player2: null })])
    expect(wrapper.find('[data-testid="shot-clock"]').exists()).toBe(false)
  })
})

// --- Story 2.4 : `POUR n` en 3 Bandes ---

describe('GameView — POUR n (3 Bandes)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const panels = (wrapper: VueWrapper) => wrapper.findAllComponents({ name: 'PlayerPanel' })
  const remaining = (wrapper: VueWrapper, side: 0 | 1) =>
    panels(wrapper)[side]!.find('[data-testid="remaining"]')

  async function press(wrapper: VueWrapper, testid: string) {
    await wrapper.find(`[data-testid="${testid}"]`).trigger('pointerdown')
    await wrapper.vm.$nextTick()
  }

  // L'annonce suit les taps : POUR 3 → POUR 2 → POUR 1, puis la distance.
  it('counts down POUR 3, 2, 1 as the playing side taps toward his distance', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 5, player2: 25 })
    await wrapper.vm.$nextTick()

    await press(wrapper, 'plus-one-button')
    expect(remaining(wrapper, 0).exists()).toBe(false)
    await press(wrapper, 'plus-one-button')
    expect(remaining(wrapper, 0).text()).toBe('POUR 3')
    await press(wrapper, 'plus-one-button')
    expect(remaining(wrapper, 0).text()).toBe('POUR 2')
    await press(wrapper, 'plus-one-button')
    expect(remaining(wrapper, 0).text()).toBe('POUR 1')
    expect(remaining(wrapper, 1).exists()).toBe(false)
  })

  // Une correction `−` le fait remonter, comme n'importe quel mouvement du score.
  it('follows manual corrections too', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', { player1: 5, player2: 25 })
    await wrapper.vm.$nextTick()
    store.adjustScore('player1', 3)
    await wrapper.vm.$nextTick()
    expect(remaining(wrapper, 0).text()).toBe('POUR 2')

    await panels(wrapper)[0]!.find('[data-testid="score-minus"]').trigger('pointerdown')
    await wrapper.vm.$nextTick()

    expect(remaining(wrapper, 0).text()).toBe('POUR 3')
  })

  // Jamais en jeux de série : la distance brute de l'en-tête suffit (décision 1.6).
  it('never shows in a series game', async () => {
    const wrapper = mount(GameView)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRÉ', { player1: 5, player2: 25 })
    await wrapper.vm.$nextTick()
    store.adjustScore('player1', 4)
    await wrapper.vm.$nextTick()

    expect(remaining(wrapper, 0).exists()).toBe(false)
    expect(remaining(wrapper, 1).exists()).toBe(false)
  })
})
