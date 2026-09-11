import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed, defineComponent, h, nextTick, watchEffect } from 'vue'
import { mount } from '@vue/test-utils'
import { MAX_SCORE_DIGITS, mirrorSnapshot, useGameStore } from './useGameStore'
import { GAME_STORAGE_KEY } from '../services/storageService'
import type { GameState, PlayerId } from '../types/game'

describe('useGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Décision produit du 2026-09-08 : aucun mode ne porte de distance par défaut.
  // Les deux joueurs démarrent donc en distance libre (0 = aucun objectif).
  it('has an idle status and no target score on either player by default', () => {
    const store = useGameStore()
    expect(store.status).toBe('idle')
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
  })

  it('starts a game with the given mode and player names', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.mode).toBe('libre')
    expect(store.player1.name).toBe('MICHEL')
    expect(store.player2.name).toBe('ANDRE')
    expect(store.status).toBe('playing')
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([])
    expect(store.player1.score).toBe(0)
    expect(store.player2.score).toBe(0)
  })

  // Le 4e paramètre est optionnel : le parcours de démarrage de la Story 1.3 reste
  // strictement inchangé quand on ne touche pas au format (AC#8).
  it('leaves both target scores free when started without a format', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
  })

  // Handicap façon coréenne : chaque joueur peut jouer sa propre distance.
  it('assigns each target score to its own player', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })

    expect(store.player1.targetScore).toBe(100)
    expect(store.player2.targetScore).toBe(80)
  })

  // La garde vit dans l'action, pas dans le composant (AR17) : un appel direct au store
  // ne doit pas pouvoir installer une distance négative, décimale ou hors bornes.
  it('normalizes incoming target scores to integers within [0, 999]', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: -5, player2: 1200 })
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(999)

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 42.7, player2: 0.9 })
    expect(store.player1.targetScore).toBe(42)
    expect(store.player2.targetScore).toBe(0)
  })

  it('always assigns white to the left player and yellow to the right player', () => {
    const store = useGameStore()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.player1.color).toBe('white')
    expect(store.player2.color).toBe('yellow')
  })

  it('swaps players between sides while keeping colors bound to their side', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.swapPlayers()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player1.color).toBe('white')
    expect(store.player2.color).toBe('yellow')
    expect(store.player1.id).toBe('player1')
    expect(store.player2.id).toBe('player2')
  })

  // AC#7 : la distance suit le joueur — comme son nom et son score — tandis que la bille
  // reste attachée au côté. Distances dissociées pour que le test discrimine vraiment.
  it('carries each target score with its player when sides are swapped', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })

    store.swapPlayers()

    expect(store.player1.targetScore).toBe(80)
    expect(store.player2.targetScore).toBe(100)
    expect(store.player1.color).toBe('white')
    expect(store.player2.color).toBe('yellow')
  })

  // Règle produit arrêtée en revue de la Story 1.3 : le tour est attaché au CÔTÉ,
  // pas à la personne — le joueur de gauche commence, l'interversion n'y change rien.
  it('keeps the turn on the left side when players swap', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.swapPlayers()

    expect(store.activePlayer).toBe('player1')
  })

  // Règle changée le 2026-09-09 : l'interversion reste disponible TOUTE la partie, elle
  // n'est plus refusée dès la première série. Le comportement après séries enregistrées
  // est vérifié en détail plus bas (permutation des colonnes de reprises).
  it('no longer refuses to swap players once a reprise has been recorded', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.reprises = [{ player1: 3, player2: 2, timestamp: Date.now() }]

    store.swapPlayers()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player2.name).toBe('MICHEL')
  })

  it('refuses to swap players outside of a running game', () => {
    const store = useGameStore()

    store.swapPlayers()

    expect(store.player1.name).toBe('')
    expect(store.status).toBe('idle')
  })

  it('restores the full initial state on reset, carrying nothing over', () => {
    const store = useGameStore()
    store.startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })

    store.resetGame()

    expect(store.status).toBe('idle')
    expect(store.mode).toBe('libre')
    expect(store.player1.targetScore).toBe(0)
    expect(store.player2.targetScore).toBe(0)
    expect(store.player1.name).toBe('')
    expect(store.player2.name).toBe('')
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([])
    expect(store.startedAt).toBeNull()
    expect(store.lastSaved).toBe('')
  })

  // Story 1.10 : l'état de fin de partie ne survit ni à `resetGame` ni à `startGame`.
  it('carries no end-of-game state over on reset nor on a new game', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    for (const digit of '10') store.appendScoreDigit('player1', Number(digit))
    store.validateScoreInput('player1')
    store.acceptEqualizingReprise()
    store.finishGame()
    expect(store.status).toBe('finished')
    expect(store.winner).toBe('player1')

    store.resetGame()

    expect(store.status).toBe('idle')
    expect(store.winner).toBeNull()
    expect(store.finishedAt).toBeNull()
    expect(store.equalizingReprise).toBe(false)
    expect(store.endPrompt).toBeNull()

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    for (const digit of '10') store.appendScoreDigit('player1', Number(digit))
    store.validateScoreInput('player1')
    store.acceptEqualizingReprise()
    store.finishGame()

    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.status).toBe('playing')
    expect(store.winner).toBeNull()
    expect(store.finishedAt).toBeNull()
    expect(store.equalizingReprise).toBe(false)
    expect(store.endPrompt).toBeNull()
  })
})

// --- Story 1.5 : buffer de saisie, enregistrement de série et bascule de tour ---

describe('useGameStore — saisie au pavé numérique', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('exposes a single definition of the input digit ceiling', () => {
    expect(MAX_SCORE_DIGITS).toBe(3)
  })

  it('appends digits to the buffer of the addressed player only', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.appendScoreDigit('player1', 4)
    store.appendScoreDigit('player1', 2)

    expect(store.currentInput.player1).toBe('42')
    expect(store.currentInput.player2).toBe('')
  })

  // AC#3 : plafond FR7 (999). Le 4e chiffre est refusé, et le refus est SIGNALÉ
  // par la valeur de retour — c'est elle qui pilote l'haptique de rejet du panneau.
  it('refuses a fourth digit and reports the refusal to the caller', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.appendScoreDigit('player1', 1)).toBe(true)
    expect(store.appendScoreDigit('player1', 2)).toBe(true)
    expect(store.appendScoreDigit('player1', 3)).toBe(true)
    expect(store.appendScoreDigit('player1', 4)).toBe(false)

    expect(store.currentInput.player1).toBe('123')
  })

  // AC#7 : `0` puis `7` donne `7`, jamais `07`. À l'inverse de la DISTANCE (Story 1.4),
  // une SÉRIE de 0 est le cas le plus fréquent au carambole : le zéro est légitime.
  it('replaces a lone zero instead of prefixing it', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.appendScoreDigit('player1', 0)
    expect(store.currentInput.player1).toBe('0')

    store.appendScoreDigit('player1', 7)
    expect(store.currentInput.player1).toBe('7')
  })

  it('keeps zeroes that follow a non-zero digit', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.appendScoreDigit('player1', 1)
    store.appendScoreDigit('player1', 0)
    store.appendScoreDigit('player1', 0)

    expect(store.currentInput.player1).toBe('100')
  })

  // AC#4 : ni le total, ni les reprises, ni le tour ne bougent sur une correction.
  it('clears and backspaces the buffer without touching score, reprises or turn', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.appendScoreDigit('player1', 1)
    store.appendScoreDigit('player1', 2)

    store.backspaceScoreInput('player1')
    expect(store.currentInput.player1).toBe('1')

    store.clearScoreInput('player1')
    expect(store.currentInput.player1).toBe('')
    expect(store.player1.score).toBe(0)
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
  })

  it('leaves an already empty buffer untouched on backspace', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.backspaceScoreInput('player1')

    expect(store.currentInput.player1).toBe('')
  })

  // Task 1.4 : la dernière reprise est COMPLÉTÉE si elle attend encore ce joueur,
  // sinon une nouvelle reprise est ouverte.
  it('fills the pending reprise when the second player plays', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 5)
    store.addReprise('player2', 3)

    expect(store.reprises).toHaveLength(1)
    expect(store.reprises[0]!.player1).toBe(5)
    expect(store.reprises[0]!.player2).toBe(3)
  })

  it('opens a new reprise when the same player plays twice', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 5)
    store.addReprise('player1', 2)

    expect(store.reprises).toHaveLength(2)
    expect(store.reprises[0]).toMatchObject({ player1: 5, player2: null })
    expect(store.reprises[1]).toMatchObject({ player1: 2, player2: null })
  })

  it('opens a reprise with a null slot for the player who has not played yet', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player2', 4)

    expect(store.reprises[0]!.player1).toBeNull()
    expect(store.reprises[0]!.player2).toBe(4)
    expect(typeof store.reprises[0]!.timestamp).toBe('number')
  })

  // Décision 5 : `reprises` est la source de vérité unique — le score est une SOMME,
  // jamais un `score += value`. C'est ce qui rendra l'annulation (1.8) exacte.
  it('recomputes each score as the sum of that player series', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 5)
    store.addReprise('player2', 3)
    store.addReprise('player1', 12)
    store.addReprise('player2', 0)

    expect(store.player1.score).toBe(17)
    expect(store.player2.score).toBe(3)
  })

  // Préparation Story 1.9 : `addReprise` accepte une valeur négative sans cas particulier.
  it('accepts a negative series value as is', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 5)
    store.addReprise('player1', -2)

    expect(store.player1.score).toBe(3)
  })

  // AC#5/AC#6 : le chemin bouton et le chemin auto-validation appellent CETTE action.
  it('records the series, empties the buffer and hands the turn over on validation', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.appendScoreDigit('player1', 7)

    store.validateScoreInput('player1')

    expect(store.player1.score).toBe(7)
    expect(store.currentInput.player1).toBe('')
    expect(store.activePlayer).toBe('player2')
    expect(store.lastSaved).not.toBe('')
  })

  // AC#7 : une série de 0 est bien enregistrée — le buffer `'0'` n'est pas « vide ».
  it('records a zero series like any other', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.appendScoreDigit('player1', 0)

    store.validateScoreInput('player1')

    expect(store.reprises).toHaveLength(1)
    expect(store.reprises[0]!.player1).toBe(0)
    expect(store.activePlayer).toBe('player2')
  })

  // AC#8 : validation à vide strictement inerte — pas de série fantôme, PAS de bascule.
  it('does nothing at all when validating an empty buffer', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.validateScoreInput('player1')

    expect(store.reprises).toEqual([])
    expect(store.player1.score).toBe(0)
    expect(store.activePlayer).toBe('player1')
  })

  it('brings the turn back to the starting player after two validations', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.appendScoreDigit('player1', 3)
    store.validateScoreInput('player1')
    store.appendScoreDigit('player2', 2)
    store.validateScoreInput('player2')

    expect(store.activePlayer).toBe('player1')
  })

  // Action publique et nommée : l'Epic 2 (bascule manuelle au tap) s'y branchera.
  it('switches the turn from one side to the other', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.switchTurn()
    expect(store.activePlayer).toBe('player2')

    store.switchTurn()
    expect(store.activePlayer).toBe('player1')
  })

  it('puts the turn back on the left side on reset', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.switchTurn()

    store.resetGame()

    expect(store.activePlayer).toBe('player1')
  })

  it('puts the turn back on the left side when a new game starts', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.switchTurn()

    store.startGame('libre', 'PAUL', 'JACQUES')

    expect(store.activePlayer).toBe('player1')
  })

  // AC#9 : la reprise est ouverte par le joueur blanc — seules les reprises où LES DEUX
  // joueurs ont joué sont comptées comme terminées.
  it('counts only the reprises where both players have played', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    expect(store.completedReprises).toBe(0)

    store.addReprise('player1', 5)
    expect(store.completedReprises).toBe(0)

    store.addReprise('player2', 3)
    expect(store.completedReprises).toBe(1)

    store.addReprise('player1', 1)
    expect(store.completedReprises).toBe(1)
  })

  // Anti-régression `shallowRef` (AR9, défaut déféré de la revue 1.3) : un `push`
  // laisserait ce `computed` figé — le compteur REPRISE et `ANNULER` avec lui.
  it('notifies computeds derived from reprises (no push on the shallowRef)', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    const seen: number[] = []
    const probe = defineComponent({
      setup() {
        const count = computed(() => store.reprises.length)
        watchEffect(() => seen.push(count.value))
        return () => h('div', String(count.value))
      },
    })
    const wrapper = mount(probe)

    store.addReprise('player1', 5)
    await nextTick()

    expect(wrapper.text()).toBe('1')
    expect(seen).toEqual([0, 1])
  })
})

// --- Story 1.5 (refonte du 2026-09-09) : rendre la main sans marquer, moyenne,
//     meilleure série, interversion disponible toute la partie ---

describe('useGameStore — alternance sans score, statistiques et interversion', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // Décision produit : ne pas marquer n'est pas ne pas jouer. Le raccourci évite de
  // saisir `0` au pavé, mais la reprise DOIT être enregistrée, sinon la moyenne monte
  // artificiellement (5 puis 3 en 3 reprises donnerait 4.000 au lieu de 2.667).
  it('records a zero series when the active player hands over without scoring', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.passTurn()

    expect(store.reprises).toHaveLength(1)
    expect(store.reprises[0]!.player1).toBe(0)
    expect(store.player1.score).toBe(0)
    expect(store.activePlayer).toBe('player2')
  })

  it('always attributes the skipped series to the player who had the hand', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.switchTurn()

    store.passTurn()

    expect(store.reprises[0]!.player2).toBe(0)
    expect(store.reprises[0]!.player1).toBeNull()
    expect(store.activePlayer).toBe('player1')
  })

  it('counts a blanked reprise in the average', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 5)
    store.addReprise('player1', 0)
    store.addReprise('player1', 3)

    expect(store.player1.score).toBe(8)
    expect(store.averages.player1).toBeCloseTo(8 / 3, 6)
  })

  it('has no average before the first series', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.averages.player1).toBe(0)
    expect(store.averages.player2).toBe(0)
  })

  // La moyenne d'un joueur ne compte que SES reprises : une reprise ouverte par
  // l'adversaire et qu'il n'a pas encore jouée ne doit pas la diluer (Décision 7).
  it('divides each average by that player own reprises only', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 4)
    store.addReprise('player2', 2)
    store.addReprise('player1', 6)

    expect(store.averages.player1).toBeCloseTo(10 / 2, 6)
    expect(store.averages.player2).toBeCloseTo(2 / 1, 6)
  })

  it('tracks the best series of each player', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.addReprise('player1', 4)
    store.addReprise('player2', 9)
    store.addReprise('player1', 12)
    store.addReprise('player2', 1)

    expect(store.bestSeries.player1).toBe(12)
    expect(store.bestSeries.player2).toBe(9)
  })

  it('has no best series before the first one', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    expect(store.bestSeries.player1).toBe(0)
    expect(store.bestSeries.player2).toBe(0)
  })

  // Le bouton ÉCHANGER reste disponible toute la partie (décision du 2026-09-09) :
  // l'interversion ne doit donc plus être refusée dès la première série.
  it('still swaps players once series have been recorded', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 5)

    store.swapPlayers()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player2.name).toBe('MICHEL')
  })

  // ⚠️ Le score est RECALCULÉ depuis `reprises`, qui range les séries par côté.
  // Sans permutation des colonnes, chaque joueur récupérerait l'historique de l'autre
  // au premier recalcul — et son total avec.
  it('carries each played series with its player when sides are swapped', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 5)
    store.addReprise('player2', 2)
    store.addReprise('player1', 4)

    store.swapPlayers()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.score).toBe(2)
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.score).toBe(9)
    expect(store.averages.player1).toBeCloseTo(2 / 1, 6)
    expect(store.averages.player2).toBeCloseTo(9 / 2, 6)
    expect(store.bestSeries.player2).toBe(5)
  })

  // Un nouvel enregistrement après interversion doit repartir de l'historique permuté,
  // et non refabriquer un total à partir de l'ancien découpage.
  it('keeps totals correct when a series is recorded after a swap', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 5)
    store.addReprise('player2', 2)

    store.swapPlayers()
    store.addReprise('player1', 3)

    expect(store.player1.score).toBe(5)
    expect(store.player2.score).toBe(5)
  })
})

// --- Story 1.5 (ajout du 2026-09-09) : correction manuelle du score ---

describe('useGameStore — correction du score', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adjusts the score up and down', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 10)

    store.adjustScore('player1', 1)
    expect(store.player1.score).toBe(11)

    store.adjustScore('player1', -1)
    store.adjustScore('player1', -1)
    expect(store.player1.score).toBe(9)
  })

  // Le point essentiel : c'est une CORRECTION, pas une série. Elle ne doit toucher ni les
  // reprises, ni le tour, ni la meilleure série — seul le total bouge.
  it('leaves the run of play untouched', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 10)
    const repriseCount = store.reprises.length

    store.adjustScore('player1', 5)

    expect(store.reprises).toHaveLength(repriseCount)
    expect(store.completedReprises).toBe(0)
    expect(store.activePlayer).toBe('player1')
    expect(store.bestSeries.player1).toBe(10)
  })

  it('corrects only the addressed player', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.adjustScore('player2', 3)

    expect(store.player2.score).toBe(3)
    expect(store.player1.score).toBe(0)
  })

  // La moyenne se lit sur le score corrigé : c'est le total juste qui doit la produire.
  it('feeds the corrected total into the average', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 4)
    store.addReprise('player1', 4)

    store.adjustScore('player1', 2)

    expect(store.player1.score).toBe(10)
    expect(store.averages.player1).toBeCloseTo(5, 6)
  })

  // Une correction survit à l'enregistrement d'une série suivante : le total est recalculé
  // depuis `reprises`, il doit continuer d'y ajouter la correction.
  it('keeps the correction when a later series is recorded', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player1', 2)

    store.addReprise('player1', 5)

    expect(store.player1.score).toBe(7)
  })

  // Comme les reprises, la correction appartient au JOUEUR et le suit d'un côté à l'autre.
  // ⚠️ Prouvé non discriminant par mutation, puis corrigé : `swapPlayers` transporte le
  // score déjà calculé dans l'objet joueur, si bien qu'une correction restée du mauvais
  // côté ne se voit qu'au RECALCUL suivant. Il faut donc enregistrer une série après
  // l'échange — exactement le même piège que pour les colonnes de reprises.
  it('carries the correction with its player when sides are swapped', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 5)
    store.adjustScore('player1', 3)

    store.swapPlayers()

    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.score).toBe(8)
    expect(store.player1.score).toBe(0)

    // Le recalcul qui révèle une correction mal placée.
    store.addReprise('player2', 2)
    store.addReprise('player1', 6)

    expect(store.player2.score).toBe(10)
    expect(store.player1.score).toBe(6)
  })

  // ⚠️ Prouvé non discriminant par mutation, puis corrigé : `startGame` réécrit l'objet
  // joueur avec un score à 0, donc lire ce score ne dit RIEN de la correction résiduelle.
  // Il faut forcer un recalcul — la première série de la nouvelle partie — pour la voir.
  it('clears corrections when a new game starts', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player1', 7)

    store.startGame('libre', 'PAUL', 'JACQUES')
    store.addReprise('player1', 4)

    expect(store.player1.score).toBe(4)
  })

  // `resetGame` doit restaurer l'état initial COMPLET : aucune valeur de la partie
  // précédente ne doit être reconduite en silence. Le recalcul est observé directement
  // après le reset, et non après un `startGame` — celui-ci réinitialise lui aussi, il
  // masquerait donc un oubli côté `resetGame`.
  it('carries no correction over on reset', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player1', 7)

    store.resetGame()
    store.addReprise('player1', 4)

    expect(store.player1.score).toBe(4)
  })

  // Cohérence avec `swapPlayers` : hors partie, aucune action de jeu ne mute l'état.
  it('ignores every game gesture while no game is playing', () => {
    const store = useGameStore()

    expect(store.appendScoreDigit('player1', 4)).toBe(false)
    store.validateScoreInput('player1')
    store.passTurn()
    store.switchTurn()
    store.adjustScore('player1', 3)
    store.undoLastAction()
    store.swapPlayers()

    expect(store.currentInput.player1).toBe('')
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
    // Un `pushHistory` placé avant une garde `status` empilerait ici une action fantôme.
    expect(store.history).toEqual([])
    expect(store.canUndo).toBe(false)
    expect(store.player1.score).toBe(0)
  })

  // Story 1.10 : `finished` existe enfin — le récap est TERMINAL (décision du
  // 2026-09-10). C'est ce cas, et non `idle`, qui rend la garde d'`undoLastAction`
  // discriminante (revue de la 1.7) : la pile n'est pas vide, l'action doit la laisser.
  it('ignores every game gesture once the game is finished, undo included', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    for (const digit of '10') store.appendScoreDigit('player1', Number(digit))
    store.validateScoreInput('player1')
    store.finishGame()
    expect(store.status).toBe('finished')
    expect(store.history).toHaveLength(1)

    expect(store.appendScoreDigit('player1', 4)).toBe(false)
    store.validateScoreInput('player1')
    store.passTurn()
    store.switchTurn()
    store.adjustScore('player1', 3)
    store.undoLastAction()
    store.swapPlayers()

    expect(store.status).toBe('finished')
    expect(store.player1.score).toBe(10)
    expect(store.player2.score).toBe(0)
    expect(store.reprises).toHaveLength(1)
    expect(store.activePlayer).toBe('player2')
    expect(store.player1.name).toBe('MICHEL')
    expect(store.history).toHaveLength(1)
    expect(store.currentInput.player1).toBe('')
  })
})

// --- Story 1.7 : annulation multi-niveaux par snapshots ---

describe('useGameStore — undo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  function validate(store: ReturnType<typeof useGameStore>, playerId: 'player1' | 'player2', value: number) {
    for (const digit of String(value)) store.appendScoreDigit(playerId, Number(digit))
    store.validateScoreInput(playerId)
  }

  // AC1, AC4 : une série annulée rend le total, la moyenne, la meilleure série ET le tour.
  // Le joueur peut ressaisir immédiatement : la seconde saisie prouve que les `computed`
  // repartent d'un état sain, pas d'une valeur simplement transportée.
  it('brings the game back to before a validated series', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 5)
    expect(store.canUndo).toBe(true)

    store.undoLastAction()

    expect(store.reprises).toEqual([])
    expect(store.player1.score).toBe(0)
    expect(store.activePlayer).toBe('player1')
    expect(store.averages.player1).toBe(0)
    expect(store.bestSeries.player1).toBe(0)
    expect(store.canUndo).toBe(false)

    validate(store, 'player1', 3)
    expect(store.player1.score).toBe(3)
    expect(store.reprises).toHaveLength(1)
    expect(store.averages.player1).toBe(3)
  })

  it('brings the game back to before a hand given without scoring', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.passTurn()
    expect(store.activePlayer).toBe('player2')

    store.undoLastAction()

    expect(store.reprises).toEqual([])
    expect(store.player1.score).toBe(0)
    expect(store.activePlayer).toBe('player1')
    expect(store.averages.player1).toBe(0)
    expect(store.canUndo).toBe(false)
  })

  // Un appui sur `+` = une action. Le score attendu est 1 et non 0, et la série ajoutée
  // ensuite recalcule 4 + 1 = 5 : un snapshot qui ALIASERAIT `scoreAdjustments` (muté en
  // place) laisserait la correction à 2 sous un total en apparence correct.
  it('undoes one correction at a time, restoring a copy of the adjustments', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player1', 1)
    store.adjustScore('player1', 1)
    expect(store.player1.score).toBe(2)

    store.undoLastAction()

    expect(store.player1.score).toBe(1)
    expect(store.canUndo).toBe(true)

    store.addReprise('player1', 4)
    expect(store.player1.score).toBe(5)
  })

  // AC2 : chaque appui remonte d'une action, dans l'ordre inverse, jusqu'au début ; le
  // quatrième appui est un no-op strict.
  it('steps back one action per call, in reverse order, then stops', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 5)
    validate(store, 'player2', 3)
    store.adjustScore('player1', 1)
    expect(store.player1.score).toBe(6)
    expect(store.completedReprises).toBe(1)

    store.undoLastAction()
    expect(store.player1.score).toBe(5)
    expect(store.player2.score).toBe(3)
    expect(store.completedReprises).toBe(1)
    expect(store.activePlayer).toBe('player1')

    store.undoLastAction()
    expect(store.player1.score).toBe(5)
    expect(store.player2.score).toBe(0)
    expect(store.completedReprises).toBe(0)
    expect(store.reprises).toEqual([{ player1: 5, player2: null, timestamp: expect.any(Number) }])
    expect(store.activePlayer).toBe('player2')

    store.undoLastAction()
    expect(store.player1.score).toBe(0)
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
    expect(store.canUndo).toBe(false)

    store.undoLastAction()
    expect(store.player1.score).toBe(0)
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
    expect(store.canUndo).toBe(false)
  })

  // AC3 : `ÉCHANGER` n'est pas une action annulable — on rappuie dessus pour revenir.
  it('pushes nothing on the history when players swap', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.swapPlayers()

    expect(store.canUndo).toBe(false)
  })

  // AC5 — le piège de la story : le snapshot a été pris quand MICHEL était à gauche ; le
  // restaurer tel quel ramènerait l'échange. Il est mis en miroir : les joueurs restent
  // où ils sont, la série disparaît et la main revient à MICHEL, désormais à droite.
  it('keeps the sides as they are when undoing a series recorded before a swap', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 5)
    store.swapPlayers()
    expect(store.player2.score).toBe(5)

    store.undoLastAction()

    expect(store.reprises).toEqual([])
    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.id).toBe('player1')
    expect(store.player1.color).toBe('white')
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.id).toBe('player2')
    expect(store.player2.color).toBe('yellow')
    expect(store.player2.score).toBe(0)
    expect(store.activePlayer).toBe('player2')
    expect(store.sidesSwapped).toBe(true)
    expect(store.canUndo).toBe(false)
  })

  // Deux échanges ramènent la parité d'origine : aucun miroir, aucun effet de bord.
  it('restores the snapshot as is after two swaps', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 5)
    store.swapPlayers()
    store.swapPlayers()

    store.undoLastAction()

    expect(store.reprises).toEqual([])
    expect(store.player1.name).toBe('MICHEL')
    expect(store.player1.score).toBe(0)
    expect(store.player2.name).toBe('ANDRE')
    expect(store.activePlayer).toBe('player1')
    expect(store.sidesSwapped).toBe(false)
  })

  // La correction doit disparaître du BON joueur : MICHEL, passé à droite entre-temps.
  it('removes an undone correction from the player who received it, wherever he sits', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.addReprise('player1', 5)
    store.addReprise('player2', 2)
    store.adjustScore('player1', 3)
    store.swapPlayers()
    expect(store.player2.score).toBe(8)

    store.undoLastAction()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.score).toBe(2)
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.score).toBe(5)

    // Le recalcul qui révélerait une correction résiduelle mal placée.
    store.addReprise('player2', 1)
    expect(store.player2.score).toBe(6)
    expect(store.player1.score).toBe(2)
  })

  it('mirrors a snapshot: columns, players (restamped), adjustments and turn', () => {
    const mirrored = mirrorSnapshot({
      player1: { id: 'player1', name: 'MICHEL', score: 5, color: 'white', targetScore: 100 },
      player2: { id: 'player2', name: 'ANDRE', score: 0, color: 'yellow', targetScore: 80 },
      activePlayer: 'player2',
      reprises: [{ player1: 5, player2: null, timestamp: 1 }],
      scoreAdjustments: { player1: 2, player2: 0 },
      currentInput: { player1: '7', player2: '' },
      sidesSwapped: false,
      equalizingReprise: true,
    })

    expect(mirrored.reprises).toEqual([{ player1: null, player2: 5, timestamp: 1 }])
    expect(mirrored.activePlayer).toBe('player1')
    expect(mirrored.player1).toEqual({
      id: 'player1',
      name: 'ANDRE',
      score: 0,
      color: 'white',
      targetScore: 80,
    })
    expect(mirrored.player2).toEqual({
      id: 'player2',
      name: 'MICHEL',
      score: 5,
      color: 'yellow',
      targetScore: 100,
    })
    expect(mirrored.scoreAdjustments).toEqual({ player1: 0, player2: 2 })
    expect(mirrored.currentInput).toEqual({ player1: '', player2: '7' })
    expect(mirrored.sidesSwapped).toBe(true)
    // Story 1.10 : la reprise égalisatrice est un fait de jeu attaché au côté droit,
    // recopié tel quel — la parité des côtés ne le change pas.
    expect(mirrored.equalizingReprise).toBe(true)
  })

  // AC12 de la 1.5 : un `VALIDER` à vide ne fait rien — il n'empile donc rien non plus.
  it('pushes nothing on the history when validating an empty buffer', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    store.validateScoreInput('player1')

    expect(store.canUndo).toBe(false)
  })

  // AC7 : la pile repart vide à chaque partie, la parité aussi.
  it('starts a new game with an empty history and sides in their original parity', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player1', 1)
    store.swapPlayers()

    store.startGame('libre', 'PAUL', 'JACQUES')

    expect(store.canUndo).toBe(false)
    expect(store.sidesSwapped).toBe(false)
  })

  it('carries no history nor swapped parity over on reset', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player1', 1)
    store.swapPlayers()

    store.resetGame()

    expect(store.history).toEqual([])
    expect(store.sidesSwapped).toBe(false)
  })

  // Anti-régression `shallowRef` (AR9) : un `push` sur `history` figerait `canUndo`, un
  // `push` sur `reprises` figerait le compteur — les deux sont observés depuis un composant.
  it('notifies computeds derived from reprises and history after an undo', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    const seen: string[] = []
    const probe = defineComponent({
      setup() {
        const state = computed(() => `${store.completedReprises}/${store.canUndo}`)
        watchEffect(() => seen.push(state.value))
        return () => h('div', state.value)
      },
    })
    const wrapper = mount(probe)

    validate(store, 'player1', 5)
    validate(store, 'player2', 3)
    await nextTick()
    expect(wrapper.text()).toBe('1/true')

    store.undoLastAction()
    await nextTick()
    expect(wrapper.text()).toBe('0/true')

    store.undoLastAction()
    await nextTick()
    expect(wrapper.text()).toBe('0/false')
    expect(seen).toEqual(['0/false', '1/true', '0/true', '0/false'])
  })

  // Hygiène mémoire pour les sessions de 8 h (NFR3) : au-delà de 1000 actions, la plus
  // ancienne est oubliée — et pas une autre : le sommet reste le dernier état d'avant,
  // l'undo continue de remonter exactement, et s'arrête sur l'état `1` (le `0` initial
  // est le seul abandonné).
  it('keeps at most 1000 snapshots, dropping the oldest', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    for (let i = 0; i < 1001; i++) store.adjustScore('player1', 1)

    expect(store.history).toHaveLength(1000)
    expect(store.history[0]!.scoreAdjustments.player1).toBe(1)
    expect(store.history[999]!.scoreAdjustments.player1).toBe(1000)

    store.undoLastAction()
    expect(store.player1.score).toBe(1000)

    for (let i = 0; i < 999; i++) store.undoLastAction()
    expect(store.player1.score).toBe(1)
    expect(store.canUndo).toBe(false)
  })
})

// --- Story 1.10 : fin de partie, reprise égalisatrice, vainqueur, revanche ---

describe('useGameStore — fin de partie', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  type Store = ReturnType<typeof useGameStore>

  function validate(store: Store, playerId: PlayerId, value: number) {
    for (const digit of String(value)) store.appendScoreDigit(playerId, Number(digit))
    store.validateScoreInput(playerId)
  }

  // Distances courtes pour des scénarios lisibles : blanc 10, jaune 8.
  function startedGame() {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    return store
  }

  // AC3 : le blanc atteint sa distance → offre d'égalisatrice, partie toujours en cours,
  // tour basculé sur le jaune comme d'habitude.
  it('offers the equalizing reprise when the white player reaches his distance', () => {
    const store = startedGame()

    validate(store, 'player1', 10)

    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
    expect(store.status).toBe('playing')
    expect(store.activePlayer).toBe('player2')
  })

  it('offers nothing while the distance is not reached', () => {
    const store = startedGame()

    validate(store, 'player1', 9)

    expect(store.endPrompt).toBeNull()
  })

  // AC7 : la série est plafonnée au restant — au billard on s'arrête à la distance.
  it('caps a series at the remaining distance and still detects the end', () => {
    const store = startedGame()

    validate(store, 'player1', 12)

    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
    expect(store.player1.score).toBe(10)
    expect(store.reprises[0]!.player1).toBe(10)
    expect(store.bestSeries.player1).toBe(10)
    expect(store.averages.player1).toBe(10)
  })

  it('caps the series that closes the distance, not the earlier ones', () => {
    const store = startedGame()

    validate(store, 'player1', 4)
    validate(store, 'player2', 0)
    validate(store, 'player1', 9)

    expect(store.player1.score).toBe(10)
    expect(store.reprises[1]!.player1).toBe(6)
  })

  it('never caps a series when the distance is free', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    validate(store, 'player1', 12)

    expect(store.player1.score).toBe(12)
    expect(store.reprises[0]!.player1).toBe(12)
  })

  // Le snapshot est pris avant le plafonnement : l'undo restaure l'état d'avant.
  it('undoes a capped series back to the previous score', () => {
    const store = startedGame()

    validate(store, 'player1', 12)
    expect(store.player1.score).toBe(10)
    store.undoLastAction()
    expect(store.player1.score).toBe(0)

    validate(store, 'player1', 3)
    expect(store.player1.score).toBe(3)
    expect(store.reprises[0]!.player1).toBe(3)
  })

  // AC4, AC5 : l'égalisatrice acceptée, la série du jaune termine la partie quoi qu'il
  // arrive — égalité s'il atteint, victoire du blanc sinon.
  it('ends in a tie when the yellow player equalizes', () => {
    const store = startedGame()
    validate(store, 'player1', 10)

    store.acceptEqualizingReprise()
    expect(store.equalizingReprise).toBe(true)
    expect(store.endPrompt).toBeNull()
    expect(store.status).toBe('playing')

    validate(store, 'player2', 8)

    expect(store.endPrompt).toEqual({ kind: 'over', winner: null })
    expect(store.status).toBe('playing')
  })

  it('gives the white player the win when the yellow player falls short', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()

    validate(store, 'player2', 3)

    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player1' })
  })

  it('gives the white player the win when the yellow player hands over without scoring', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()

    store.passTurn()

    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player1' })
    expect(store.reprises[0]!.player2).toBe(0)
  })

  // AC4 : refuser l'égalisatrice = le blanc gagne.
  it('finishes with the white player as winner when the equalizing reprise is declined', () => {
    const store = startedGame()
    validate(store, 'player1', 10)

    store.finishGame()

    expect(store.status).toBe('finished')
    expect(store.winner).toBe('player1')
    expect(store.finishedAt).not.toBeNull()
    expect(store.endPrompt).toBeNull()
  })

  // Revue 1.10 : le drapeau survit à `finishGame` — en `finished`, il dit si la partie
  // s'est jouée jusqu'à l'égalisatrice (historique 3.1, persistance 1.12).
  it('keeps the equalizing reprise flag once the game is finished', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()
    validate(store, 'player2', 3)

    store.finishGame()

    expect(store.status).toBe('finished')
    expect(store.equalizingReprise).toBe(true)
  })

  // Revue 1.10 (décision de Nathan, 2026-09-10) : `ÉCHANGER` est bloqué pendant la
  // reprise égalisatrice — le drapeau est attaché au côté droit, un échange ferait jouer
  // l'égalisatrice au joueur qui vient d'atteindre sa distance et fabriquerait une
  // égalité fantôme.
  it('refuses to swap the players during the equalizing reprise', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()

    store.swapPlayers()

    expect(store.player1.name).toBe('MICHEL')
    expect(store.player1.score).toBe(10)
    expect(store.sidesSwapped).toBe(false)

    validate(store, 'player2', 3)

    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player1' })
  })

  // Discriminant vis-à-vis du prorata : le total du jaune, corrigé par `+` jusqu'à sa
  // distance (aucune détection, AC8), lui donnerait l'égalité au prorata. Le refus de
  // l'égalisatrice, lui, donne TOUJOURS la victoire au blanc.
  it('gives the white player the win on a declined offer, whatever the pro rata says', () => {
    const store = startedGame()
    for (let i = 0; i < 8; i += 1) store.adjustScore('player2', 1)
    expect(store.player2.score).toBe(8)
    validate(store, 'player1', 10)
    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })

    store.finishGame()

    expect(store.winner).toBe('player1')
  })

  // AC6 : le jaune atteint le premier → il gagne immédiatement.
  it('ends the game at once when the yellow player reaches his distance first', () => {
    const store = startedGame()
    validate(store, 'player1', 5)

    validate(store, 'player2', 8)

    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player2' })
    store.finishGame()
    expect(store.winner).toBe('player2')
    expect(store.status).toBe('finished')
  })

  it('finishes with the winner announced by the end prompt', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()
    validate(store, 'player2', 8)

    store.finishGame()

    expect(store.winner).toBeNull()
    expect(store.status).toBe('finished')
  })

  // `dismissEndPrompt` (sans bouton depuis la revue de Nathan du 2026-09-10, gardée pour
  // le pilotage déporté) referme « PARTIE TERMINÉE » ; l'offre, elle, ne se ferme pas —
  // une décision est attendue.
  it('dismisses an end prompt but never the equalizing offer', () => {
    const store = startedGame()
    validate(store, 'player1', 5)
    validate(store, 'player2', 8)
    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player2' })

    store.dismissEndPrompt()

    expect(store.endPrompt).toBeNull()
    expect(store.status).toBe('playing')

    store.undoLastAction()
    validate(store, 'player2', 2)
    validate(store, 'player1', 5)
    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })

    store.dismissEndPrompt()

    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
  })

  // Après `dismissEndPrompt`, le score est déjà à la distance : la série suivante est
  // plafonnée à 0.
  it('caps to zero a series played once the distance is already reached', () => {
    const store = startedGame()
    validate(store, 'player1', 5)
    validate(store, 'player2', 8)
    store.dismissEndPrompt()
    validate(store, 'player1', 2)

    validate(store, 'player2', 4)

    expect(store.player2.score).toBe(8)
    expect(store.reprises[1]!.player2).toBe(0)
    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player2' })
  })

  // AC8 : seules les séries déclenchent la détection.
  it('never ends the game on a correction nor on a swap', () => {
    const store = startedGame()

    store.adjustScore('player1', 10)
    expect(store.player1.score).toBe(10)
    expect(store.endPrompt).toBeNull()

    store.swapPlayers()
    expect(store.endPrompt).toBeNull()
  })

  it('never ends the game automatically when the distance is free', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    validate(store, 'player1', 50)
    validate(store, 'player2', 50)

    expect(store.endPrompt).toBeNull()
  })

  // AC11 : fin manuelle au prorata (score / distance).
  it('picks the winner pro rata on a manual finish', () => {
    const store = startedGame()
    validate(store, 'player1', 4)
    validate(store, 'player2', 4)

    store.finishGame()

    expect(store.status).toBe('finished')
    expect(store.winner).toBe('player2')
  })

  it('declares a tie when both pro rata are equal', () => {
    const store = startedGame()
    validate(store, 'player1', 5)
    validate(store, 'player2', 4)

    store.finishGame()

    expect(store.winner).toBeNull()
  })

  it('declares a tie on a manual finish with no score at all', () => {
    const store = startedGame()

    store.finishGame()

    expect(store.status).toBe('finished')
    expect(store.winner).toBeNull()
  })

  it('compares raw scores on a manual finish when distances are free', () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 7)
    validate(store, 'player2', 3)

    store.finishGame()

    expect(store.winner).toBe('player1')
  })

  it('finishes only a running game', () => {
    const store = useGameStore()

    store.finishGame()

    expect(store.status).toBe('idle')
    expect(store.finishedAt).toBeNull()
  })

  it('empties a running entry when the game is finished', () => {
    const store = startedGame()
    validate(store, 'player1', 4)
    store.appendScoreDigit('player2', 3)

    store.finishGame()

    expect(store.currentInput.player2).toBe('')
  })

  // AC16 : `UNE PARTIE DE PLUS` — même mode, mêmes noms, mêmes distances, mêmes côtés.
  it('starts a rematch with the same players, distances and sides', () => {
    const store = useGameStore()
    store.startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(store, 'player1', 10)
    store.finishGame()

    store.rematch()

    expect(store.status).toBe('playing')
    expect(store.mode).toBe('cadre-47-2')
    expect(store.reprises).toEqual([])
    expect(store.player1.name).toBe('MICHEL')
    expect(store.player1.targetScore).toBe(10)
    expect(store.player1.score).toBe(0)
    expect(store.player2.name).toBe('ANDRE')
    expect(store.player2.targetScore).toBe(8)
    expect(store.player2.score).toBe(0)
    expect(store.winner).toBeNull()
    expect(store.finishedAt).toBeNull()
    expect(store.history).toEqual([])
    expect(store.activePlayer).toBe('player1')
  })

  it('keeps swapped players on their current side for the rematch', () => {
    const store = startedGame()
    store.swapPlayers()
    store.finishGame()

    store.rematch()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.targetScore).toBe(8)
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.targetScore).toBe(10)
  })

  it('refuses a rematch while a game is still running', () => {
    const store = startedGame()
    validate(store, 'player1', 4)

    store.rematch()

    expect(store.status).toBe('playing')
    expect(store.reprises).toHaveLength(1)
  })

  // --- Story 1.15 : RECOMMENCER — la partie repart de zéro SANS passer par `finished`. ---

  // AC5, AC6, AC8 : même recette que `rematch`, gardée sur `playing` : mode, noms,
  // distances et côtés conservés, tout le reste (scores, pile, corrections, saisie, fin)
  // remis à zéro — et jamais de `finished` ni de vainqueur au passage. La saisie est
  // OUVERTE avec un chiffre tapé avant l'action, sinon `entryOpen`/`currentInput` ne
  // seraient vérifiés qu'à leur valeur par défaut (revue de code 1.15).
  it('restarts the running game with the same players, distances and sides', () => {
    vi.useFakeTimers()
    try {
      const store = useGameStore()
      store.startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
      const firstStart = store.startedAt!
      validate(store, 'player1', 4)
      validate(store, 'player2', 3)
      store.adjustScore('player1', 1)
      store.openScoreEntry('player1')
      store.appendScoreDigit('player1', 5)
      expect(store.entryOpen).toBe(true)
      expect(store.currentInput.player1).toBe('5')
      vi.advanceTimersByTime(1000)

      store.restartGame()

      expect(store.status).toBe('playing')
      expect(store.mode).toBe('cadre-47-2')
      expect(store.reprises).toEqual([])
      expect(store.history).toEqual([])
      expect(store.canUndo).toBe(false)
      expect(store.player1).toMatchObject({ name: 'MICHEL', targetScore: 10, score: 0 })
      expect(store.player2).toMatchObject({ name: 'ANDRE', targetScore: 8, score: 0 })
      expect(store.activePlayer).toBe('player1')
      expect(store.scoreAdjustments).toEqual({ player1: 0, player2: 0 })
      expect(store.startedAt).toBeGreaterThan(firstStart)
      expect(store.winner).toBeNull()
      expect(store.finishedAt).toBeNull()
      expect(store.endPrompt).toBeNull()
      expect(store.equalizingReprise).toBe(false)
      expect(store.entryOpen).toBe(false)
      expect(store.currentInput).toEqual({ player1: '', player2: '' })
    } finally {
      vi.useRealTimers()
    }
  })

  // AC5 : après un `ÉCHANGER`, chacun repart du côté où il est — même règle que `rematch`.
  it('keeps swapped players on their current side when restarting', () => {
    const store = startedGame()
    store.swapPlayers()
    validate(store, 'player1', 2)

    store.restartGame()

    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.targetScore).toBe(8)
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.targetScore).toBe(10)
    expect(store.sidesSwapped).toBe(false)
  })

  // AC5, AC6 : injoignable au doigt (le voile de la pop-up recouvre la barre), mais c'est
  // le contrat de l'action pour un pilotage déporté — aucune fin en cours ne survit.
  it('clears an accepted equalizing reprise and a pending end prompt when restarting', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })

    store.restartGame()

    expect(store.endPrompt).toBeNull()
    expect(store.equalizingReprise).toBe(false)
    expect(store.status).toBe('playing')

    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()
    expect(store.equalizingReprise).toBe(true)

    store.restartGame()

    expect(store.equalizingReprise).toBe(false)
    expect(store.endPrompt).toBeNull()
    expect(store.status).toBe('playing')

    // « PARTIE TERMINÉE » en attente (le jaune atteint sa distance) : effacée de même,
    // sans vainqueur ni `finished`.
    validate(store, 'player1', 3)
    validate(store, 'player2', 8)
    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player2' })

    store.restartGame()

    expect(store.endPrompt).toBeNull()
    expect(store.winner).toBeNull()
    expect(store.status).toBe('playing')
    expect(store.reprises).toEqual([])
  })

  // AC6 : gardée sur `playing` — no-op à l'accueil comme sur le récap : rien ne bouge,
  // ni les scores, ni les horodatages, ni la pile.
  it('refuses to restart while idle or finished', () => {
    const store = useGameStore()

    store.restartGame()

    expect(store.status).toBe('idle')
    expect(store.startedAt).toBeNull()

    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(store, 'player1', 10)
    store.finishGame()
    expect(store.winner).toBe('player1')
    const startedAt = store.startedAt
    const finishedAt = store.finishedAt
    const historyDepth = store.history.length

    store.restartGame()

    expect(store.status).toBe('finished')
    expect(store.winner).toBe('player1')
    expect(store.reprises).toHaveLength(1)
    expect(store.player1.score).toBe(10)
    expect(store.startedAt).toBe(startedAt)
    expect(store.finishedAt).toBe(finishedAt)
    expect(store.history).toHaveLength(historyDepth)
  })

  // AC9 : l'égalisatrice acceptée est défaite avec la série gagnante du blanc.
  it('undoes the accepted equalizing reprise along with the winning series', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    store.acceptEqualizingReprise()
    expect(store.equalizingReprise).toBe(true)

    store.undoLastAction()

    expect(store.equalizingReprise).toBe(false)
    expect(store.player1.score).toBe(0)
    expect(store.activePlayer).toBe('player1')
    expect(store.endPrompt).toBeNull()

    validate(store, 'player1', 10)

    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
  })

  // Accepter l'offre n'est pas une action de score : rien n'est empilé.
  it('pushes nothing on the history when the equalizing reprise is accepted', () => {
    const store = startedGame()
    validate(store, 'player1', 10)
    expect(store.history).toHaveLength(1)

    store.acceptEqualizingReprise()

    expect(store.history).toHaveLength(1)
  })

  it('accepts the equalizing reprise only while it is offered', () => {
    const store = startedGame()
    validate(store, 'player1', 4)

    store.acceptEqualizingReprise()

    expect(store.equalizingReprise).toBe(false)
  })

  // La ligne REPRISES du récap : reprises effectivement jouées par chaque joueur.
  it('exposes the reprise count of each player', () => {
    const store = startedGame()
    validate(store, 'player1', 2)
    validate(store, 'player2', 3)
    validate(store, 'player1', 1)

    expect(store.repriseCounts).toEqual({ player1: 2, player2: 1 })
  })
})

// --- Story 1.12 : persistance de la partie et reprise après fermeture ---

describe('useGameStore — persistance', () => {
  type Store = ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.restoreAllMocks()
  })

  function validate(store: Store, playerId: PlayerId, value: number) {
    for (const digit of String(value)) store.appendScoreDigit(playerId, Number(digit))
    store.validateScoreInput(playerId)
  }

  // Le CONTENU réel du storage, pas un mock : c'est ce qui serait relu au lancement.
  const saved = () => JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)!).state as GameState
  const hasSave = () => localStorage.getItem(GAME_STORAGE_KEY) !== null

  // Deux pinias : l'un joue et sauvegarde, l'autre simule le lancement suivant.
  async function relaunch(): Promise<Store> {
    await nextTick()
    setActivePinia(createPinia())
    const store = useGameStore()
    store.checkSavedGame()
    return store
  }

  // Ni `immediate` (qui appellerait `clearGameState` sur un store neuf) ni écriture :
  // le storage n'est pas touché du tout, pas seulement laissé vide.
  it('writes nothing while idle', async () => {
    const setItem = vi.spyOn(localStorage, 'setItem')
    const removeItem = vi.spyOn(localStorage, 'removeItem')
    useGameStore()
    await nextTick()

    expect(hasSave()).toBe(false)
    expect(setItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
  })

  // AC1 : une écriture par action, dans le tick — un champ discriminant par action.
  it('saves after startGame', async () => {
    const store = useGameStore()
    store.startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })
    await nextTick()

    expect(saved().status).toBe('playing')
    expect(saved().mode).toBe('cadre-47-2')
    expect(saved().player1.name).toBe('MICHEL')
    expect(saved().player2.targetScore).toBe(80)
  })

  it('saves after a validated series', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 7)
    await nextTick()

    expect(saved().reprises).toEqual([{ player1: 7, player2: null, timestamp: expect.any(Number) }])
    expect(saved().player1.score).toBe(7)
    expect(saved().activePlayer).toBe('player2')
    expect(saved().history).toHaveLength(1)
  })

  it('saves after passTurn', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.passTurn()
    await nextTick()

    expect(saved().reprises).toEqual([{ player1: 0, player2: null, timestamp: expect.any(Number) }])
    expect(saved().activePlayer).toBe('player2')
  })

  it('saves after adjustScore', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.adjustScore('player2', 2)
    await nextTick()

    expect(saved().scoreAdjustments).toEqual({ player1: 0, player2: 2 })
    expect(saved().player2.score).toBe(2)
  })

  it('saves after swapPlayers', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.swapPlayers()
    await nextTick()

    expect(saved().sidesSwapped).toBe(true)
    expect(saved().player1.name).toBe('ANDRE')
  })

  it('saves after undoLastAction', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 7)
    store.undoLastAction()
    await nextTick()

    expect(saved().reprises).toEqual([])
    expect(saved().history).toEqual([])
  })

  it('saves the buffer after appendScoreDigit', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.appendScoreDigit('player1', 7)
    await nextTick()

    expect(saved().currentInput).toEqual({ player1: '7', player2: '' })
  })

  it('saves the open entry after openScoreEntry, and its closing', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    store.openScoreEntry('player1')
    await nextTick()

    expect(saved().entryOpen).toBe(true)

    store.closeScoreEntry()
    await nextTick()

    expect(saved().entryOpen).toBe(false)
  })

  it('saves after acceptEqualizingReprise', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(store, 'player1', 10)
    await nextTick()
    expect(saved().endPrompt).toEqual({ kind: 'equalizing-offer' })

    store.acceptEqualizingReprise()
    await nextTick()

    expect(saved().equalizingReprise).toBe(true)
    expect(saved().endPrompt).toBeNull()
  })

  it('saves after finishGame', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 7)
    store.finishGame()
    await nextTick()

    expect(saved().status).toBe('finished')
    expect(saved().winner).toBe('player1')
    expect(saved().finishedAt).toEqual(expect.any(Number))
  })

  it('saves after rematch', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    validate(store, 'player1', 7)
    store.finishGame()
    store.rematch()
    await nextTick()

    expect(saved().status).toBe('playing')
    expect(saved().reprises).toEqual([])
    expect(saved().player1.name).toBe('MICHEL')
  })

  // AC7 (Story 1.15) : la partie neuve remplace l'ancienne dans le même tick, en UNE
  // écriture — rien de l'ancienne ne subsiste dans le storage.
  it('saves after restart', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(store, 'player1', 7)
    await nextTick()
    const setItem = vi.spyOn(localStorage, 'setItem')

    store.restartGame()
    await nextTick()

    expect(setItem).toHaveBeenCalledTimes(1)
    expect(saved().status).toBe('playing')
    expect(saved().reprises).toEqual([])
    expect(saved().history).toEqual([])
    expect(saved().player1.name).toBe('MICHEL')
    expect(saved().player1.score).toBe(0)
    // Les distances sont le seul champ que `restartGame` réinjecte à la main.
    expect(saved().player1.targetScore).toBe(10)
    expect(saved().player2.targetScore).toBe(8)
  })

  // Une action = un tick au doigt : chaque frappe et la validation écrivent UNE fois
  // chacune (trois actions, trois écritures), et les mutations d'une même action
  // (`validateScoreInput` en touche plusieurs) n'en font qu'une.
  it('writes exactly once per action', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await nextTick()
    const setItem = vi.spyOn(localStorage, 'setItem')

    store.appendScoreDigit('player1', 1)
    await nextTick()
    expect(setItem).toHaveBeenCalledTimes(1)

    store.appendScoreDigit('player1', 2)
    await nextTick()
    expect(setItem).toHaveBeenCalledTimes(2)

    store.validateScoreInput('player1')
    await nextTick()
    expect(setItem).toHaveBeenCalledTimes(3)
    expect(saved().player1.score).toBe(12)
  })

  it('removes the save on resetGame', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await nextTick()
    expect(hasSave()).toBe(true)

    store.resetGame()
    await nextTick()

    expect(hasSave()).toBe(false)
  })

  // AC3 : le scoreboard revient EXACTEMENT où il en était — et `ANNULER` remonte les
  // actions d'avant la fermeture, parité des côtés comprise.
  async function playedGame(): Promise<Store> {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })
    validate(store, 'player1', 7)
    validate(store, 'player2', 3)
    store.adjustScore('player1', 2)
    store.swapPlayers()
    validate(store, 'player1', 4)
    store.openScoreEntry('player2')
    store.appendScoreDigit('player2', 5)
    return store
  }

  it('offers the saved game without touching the idle store', async () => {
    await playedGame()

    const store = await relaunch()

    expect(store.pendingRestore).not.toBeNull()
    expect(store.status).toBe('idle')
    expect(store.player1.name).toBe('')
  })

  it('resumes the game exactly where it was', async () => {
    const before = await playedGame()
    const fields = [
      'mode',
      'status',
      'player1',
      'player2',
      'activePlayer',
      'reprises',
      'scoreAdjustments',
      'sidesSwapped',
      'history',
      'startedAt',
      'equalizingReprise',
      'winner',
      'finishedAt',
      'endPrompt',
      'entryOpen',
      'currentInput',
    ] as const
    const snapshotOf = (store: Store) => Object.fromEntries(fields.map((f) => [f, store[f]]))
    const expected = JSON.parse(JSON.stringify(snapshotOf(before)))

    const store = await relaunch()
    store.resumeGame()

    expect(JSON.parse(JSON.stringify(snapshotOf(store)))).toEqual(expected)
    expect(store.player1.name).toBe('ANDRE')
    expect(store.player2.score).toBe(9)
    expect(store.activePlayer).toBe('player2')
    expect(store.entryOpen).toBe(true)
    expect(store.currentInput.player2).toBe('5')
    expect(store.canUndo).toBe(true)
    expect(store.pendingRestore).toBeNull()
  })

  it('keeps counting on top of the restored adjustments', async () => {
    await playedGame()
    const store = await relaunch()
    store.resumeGame()

    store.validateScoreInput('player2')

    // 7 (série) + 2 (correction `+`) + 5 : sans `scoreAdjustments`, on lirait 12.
    expect(store.player2.score).toBe(14)
    expect(store.activePlayer).toBe('player1')
  })

  it('undoes actions taken before the closing, sides parity included', async () => {
    await playedGame()
    const store = await relaunch()
    store.resumeGame()
    store.validateScoreInput('player2')

    store.undoLastAction()
    expect(store.player2.score).toBe(9)
    expect(store.activePlayer).toBe('player2')

    store.undoLastAction()
    expect(store.player1.score).toBe(3)
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toHaveLength(1)

    // Snapshot pris AVANT l'échange : mis en miroir, les joueurs restent où ils sont.
    store.undoLastAction()
    expect(store.player1.name).toBe('ANDRE')
    expect(store.player1.score).toBe(3)
    expect(store.player2.name).toBe('MICHEL')
    expect(store.player2.score).toBe(7)
    expect(store.activePlayer).toBe('player2')
    expect(store.sidesSwapped).toBe(true)
    expect(store.reprises).toEqual([{ player1: 3, player2: 7, timestamp: expect.any(Number) }])
    expect(store.canUndo).toBe(true)
  })

  it('restores an open equalizing offer that can still be accepted', async () => {
    const before = useGameStore()
    before.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(before, 'player1', 10)

    const store = await relaunch()
    store.resumeGame()

    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
    store.acceptEqualizingReprise()
    expect(store.equalizingReprise).toBe(true)
    expect(store.endPrompt).toBeNull()
  })

  it('restores an equalizing reprise in progress', async () => {
    const before = useGameStore()
    before.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(before, 'player1', 10)
    before.acceptEqualizingReprise()

    const store = await relaunch()
    store.resumeGame()

    expect(store.equalizingReprise).toBe(true)
    validate(store, 'player2', 8)
    expect(store.endPrompt).toEqual({ kind: 'over', winner: null })
  })

  it('restores a finished game on which a rematch still works', async () => {
    const before = useGameStore()
    before.startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })
    validate(before, 'player1', 10)
    before.finishGame()

    const store = await relaunch()
    store.resumeGame()

    expect(store.status).toBe('finished')
    expect(store.winner).toBe('player1')
    store.rematch()
    expect(store.status).toBe('playing')
    expect(store.player1.targetScore).toBe(10)
  })

  it('discards the saved game and stays idle', async () => {
    await playedGame()
    const store = await relaunch()

    store.discardSavedGame()

    expect(hasSave()).toBe(false)
    expect(store.status).toBe('idle')
    expect(store.pendingRestore).toBeNull()
  })

  it('finds nothing to resume on an empty storage', () => {
    const store = useGameStore()
    store.checkSavedGame()

    expect(store.pendingRestore).toBeNull()
  })

  it('ignores checkSavedGame while a game is on', async () => {
    await playedGame()
    await nextTick()
    setActivePinia(createPinia())
    const store = useGameStore()
    store.startGame('libre', 'PAUL', 'JEAN')

    store.checkSavedGame()
    expect(store.pendingRestore).toBeNull()
  })

  // La garde `status` de `resumeGame` est exercée avec une offre RÉELLEMENT en attente :
  // sans elle, la partie en cours serait écrasée par la sauvegarde.
  it('ignores resumeGame while a game is on', async () => {
    await playedGame()
    const store = await relaunch()
    const offered = store.pendingRestore
    expect(offered).not.toBeNull()
    store.startGame('libre', 'PAUL', 'JEAN')
    store.pendingRestore = offered

    store.resumeGame()

    expect(store.player1.name).toBe('PAUL')
    expect(store.pendingRestore).toBe(offered)
  })

  // Une partie démarrée pendant une offre en attente écrase la sauvegarde : l'offre ne
  // doit pas resurgir au retour à l'accueil avec un état dont l'entrée n'existe plus.
  it('clears a pending offer on startGame', async () => {
    await playedGame()
    const store = await relaunch()
    expect(store.pendingRestore).not.toBeNull()

    store.startGame('libre', 'PAUL', 'JEAN')
    await nextTick()

    expect(store.pendingRestore).toBeNull()
    expect(saved().player1.name).toBe('PAUL')
  })

  // Même garde `idle` que ses deux sœurs : en partie, la sauvegarde vivante reste.
  it('ignores discardSavedGame while a game is on', async () => {
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')
    await nextTick()

    store.discardSavedGame()

    expect(hasSave()).toBe(true)
    expect(store.status).toBe('playing')
  })

  // `id`/`color` appartiennent au côté, pas à la sauvegarde — dans la pile aussi, sinon
  // le premier `ANNULER` après reprise réinstallerait ceux de la sauvegarde.
  it('restamps the players ids and colors on resume, in the undo stack too', async () => {
    await playedGame()
    await nextTick()
    const raw = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)!)
    raw.state.player1.color = 'yellow'
    raw.state.player1.id = 'player2'
    for (const snapshot of raw.state.history) {
      snapshot.player1.color = 'yellow'
      snapshot.player1.id = 'player2'
      snapshot.player2.color = 'white'
      snapshot.player2.id = 'player1'
    }
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(raw))

    const store = await relaunch()
    store.resumeGame()

    expect(store.player1.id).toBe('player1')
    expect(store.player1.color).toBe('white')
    expect(store.player2.id).toBe('player2')
    expect(store.player2.color).toBe('yellow')

    store.undoLastAction()

    expect(store.player1.id).toBe('player1')
    expect(store.player1.color).toBe('white')
    expect(store.player2.id).toBe('player2')
    expect(store.player2.color).toBe('yellow')
  })

  // `vi.restoreAllMocks()` ne restaure pas un espion posé sur `localStorage` (vérifié,
  // Vitest 5) : sans cette restauration explicite, tout `setItem` des blocs suivants
  // continuerait de lever. En `afterEach`, pour tenir même si une assertion échoue.
  const spies: Array<{ mockRestore: () => void }> = []
  afterEach(() => {
    for (const spy of spies.splice(0)) spy.mockRestore()
  })

  // AR12 : le store ne voit pas l'erreur, la partie continue.
  it('keeps playing in memory when the storage fails', async () => {
    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    spies.push(setItem, error)
    const store = useGameStore()
    store.startGame('libre', 'MICHEL', 'ANDRE')

    validate(store, 'player1', 7)
    await nextTick()

    expect(store.player1.score).toBe(7)
    expect(error).toHaveBeenCalled()
  })
})

// --- Story 2.2 : série au point du 3 Bandes (`+1 POINT` du joueur assis) ---

describe('useGameStore — série au point (3 Bandes)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  function startThreeCushions(targets = { player1: 30, player2: 25 }) {
    const store = useGameStore()
    store.startGame('3bandes', 'MICHEL', 'ANDRÉ', targets)
    return store
  }

  // AC1, AC3 : chaque tap crédite un point au joueur qui a la main, le total suit.
  it('credits one point per tap to the active player without changing the turn', () => {
    const store = startThreeCushions()

    store.incrementSeries()
    store.incrementSeries()
    store.incrementSeries()

    expect(store.player1.score).toBe(3)
    expect(store.player2.score).toBe(0)
    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 3, player2: null })])
  })

  // La main rendue CLÔTURE la série comptée au tap : pas de 0 ajouté par-dessus.
  it('passing the turn closes the tapped series instead of recording a zero', () => {
    const store = startThreeCushions()

    store.incrementSeries()
    store.incrementSeries()
    store.passTurn()

    expect(store.activePlayer).toBe('player2')
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 2, player2: null })])
    expect(store.player1.score).toBe(2)
    expect(store.completedReprises).toBe(0)
  })

  // Sans aucun tap, rendre la main reste une série de 0 (elle compte dans la moyenne).
  it('passing the turn without any tap still records a zero series', () => {
    const store = startThreeCushions()

    store.passTurn()

    expect(store.reprises).toEqual([expect.objectContaining({ player1: 0, player2: null })])
    expect(store.activePlayer).toBe('player2')
  })

  // Alternance complète : le jaune tape dans la case libre de la reprise ouverte par le
  // blanc, puis le blanc ouvre une reprise neuve — jamais d'incrément sur une série
  // d'un tour précédent.
  it('keeps each series in its own reprise cell across turns', () => {
    const store = startThreeCushions()

    store.incrementSeries() // blanc 1
    store.passTurn()
    store.incrementSeries() // jaune 1
    store.incrementSeries() // jaune 2
    store.passTurn()
    store.incrementSeries() // blanc, reprise 2 : 1
    store.passTurn()
    store.passTurn() // jaune : 0

    expect(store.reprises).toEqual([
      expect.objectContaining({ player1: 1, player2: 2 }),
      expect.objectContaining({ player1: 1, player2: 0 }),
    ])
    expect(store.player1.score).toBe(2)
    expect(store.player2.score).toBe(2)
    expect(store.completedReprises).toBe(2)
    expect(store.activePlayer).toBe('player1')
    expect(store.averages).toEqual({ player1: 1, player2: 1 })
    expect(store.bestSeries).toEqual({ player1: 1, player2: 2 })
  })

  // Un appui = une action annulable : trois taps, trois ANNULER.
  it('undoes taps one at a time', () => {
    const store = startThreeCushions()

    store.incrementSeries()
    store.incrementSeries()
    store.incrementSeries()
    store.undoLastAction()

    expect(store.player1.score).toBe(2)
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 2, player2: null })])

    store.undoLastAction()
    store.undoLastAction()

    expect(store.player1.score).toBe(0)
    expect(store.reprises).toEqual([])
    expect(store.canUndo).toBe(false)
  })

  // Annuler une main rendue rouvre la série comptée : le tap suivant la prolonge.
  it('undoing a pass reopens the tapped series', () => {
    const store = startThreeCushions()

    store.incrementSeries()
    store.incrementSeries()
    store.passTurn()
    store.undoLastAction()
    store.incrementSeries()

    expect(store.activePlayer).toBe('player1')
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 3, player2: null })])
    expect(store.player1.score).toBe(3)
  })

  // Les corrections `−`/`+` restent hors des reprises : elles ne rouvrent ni ne
  // prolongent la série au tap.
  it('keeps manual corrections apart from the tapped series', () => {
    const store = startThreeCushions()

    store.incrementSeries()
    store.adjustScore('player1', 1)
    store.incrementSeries()

    expect(store.player1.score).toBe(3)
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 2, player2: null })])
  })

  // Atteindre la distance au tap termine la série sur-le-champ : le blanc reçoit l'offre
  // d'égalisatrice, comme après une série validée au pavé (Story 1.10).
  it('ends the series at once when the white player reaches his distance by tap', () => {
    const store = startThreeCushions({ player1: 3, player2: 25 })

    store.incrementSeries()
    store.incrementSeries()
    expect(store.endPrompt).toBeNull()
    store.incrementSeries()

    expect(store.player1.score).toBe(3)
    expect(store.activePlayer).toBe('player2')
    expect(store.endPrompt).toEqual({ kind: 'equalizing-offer' })
    expect(store.reprises).toEqual([expect.objectContaining({ player1: 3, player2: null })])
  })

  // Le jaune qui atteint sa distance au tap gagne immédiatement.
  it('ends the game at once when the yellow player reaches his distance by tap', () => {
    const store = startThreeCushions({ player1: 30, player2: 2 })

    store.passTurn()
    store.incrementSeries()
    store.incrementSeries()

    expect(store.player2.score).toBe(2)
    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player2' })
  })

  // Égalisatrice au tap : le jaune égalise point par point, puis rend la main → fin.
  it('lets the yellow player equalize by taps during the equalizing reprise', () => {
    const store = startThreeCushions({ player1: 2, player2: 2 })

    store.incrementSeries()
    store.incrementSeries()
    store.acceptEqualizingReprise()
    expect(store.equalizingReprise).toBe(true)

    store.incrementSeries()
    expect(store.endPrompt).toBeNull()
    store.incrementSeries()

    expect(store.endPrompt).toEqual({ kind: 'over', winner: null })
  })

  it('lets the yellow player fall short in the equalizing reprise and lose on the pass', () => {
    const store = startThreeCushions({ player1: 2, player2: 2 })

    store.incrementSeries()
    store.incrementSeries()
    store.acceptEqualizingReprise()
    store.incrementSeries()
    store.passTurn()

    expect(store.endPrompt).toEqual({ kind: 'over', winner: 'player1' })
  })

  // Distance déjà atteinte (correction `+`) : rien à créditer, aucune action empilée —
  // un seul ANNULER défait la correction, la pile est vide ensuite. Le tap renvoie
  // `false` : la vue n'accuse pas réception et ne relance pas le chrono.
  it('ignores a tap once the distance is already reached', () => {
    const store = startThreeCushions({ player1: 1, player2: 25 })

    store.adjustScore('player1', 1)

    expect(store.incrementSeries()).toBe(false)
    expect(store.player1.score).toBe(1)
    expect(store.reprises).toEqual([])

    store.undoLastAction()

    expect(store.player1.score).toBe(0)
    expect(store.canUndo).toBe(false)
  })

  it('reports a credited tap with true', () => {
    const store = startThreeCushions()

    expect(store.incrementSeries()).toBe(true)
  })

  it('is a no-op outside a running game', () => {
    const store = useGameStore()

    expect(store.incrementSeries()).toBe(false)
    expect(store.reprises).toEqual([])
    expect(store.canUndo).toBe(false)
  })

  // Distance libre : les taps ne terminent jamais la partie.
  it('never ends a free-distance game by tap', () => {
    const store = startThreeCushions({ player1: 0, player2: 0 })

    for (let i = 0; i < 12; i += 1) store.incrementSeries()

    expect(store.player1.score).toBe(12)
    expect(store.endPrompt).toBeNull()
    expect(store.activePlayer).toBe('player1')
  })

  // Après un ÉCHANGER, la série ouverte suit son côté (les reprises sont rangées par
  // côté et mises en miroir) : le tap continue de créditer le côté qui a la main.
  it('keeps crediting the active side after the sides are swapped', () => {
    const store = startThreeCushions()

    store.incrementSeries()
    store.passTurn()
    store.incrementSeries() // jaune : 1
    store.swapPlayers()

    expect(store.activePlayer).toBe('player2')
    store.incrementSeries()

    expect(store.player2.score).toBe(2)
    expect(store.player1.score).toBe(1)
  })

  it('saves after a tap', async () => {
    const store = startThreeCushions()

    store.incrementSeries()
    await nextTick()

    const saved = JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)!).state as GameState
    expect(saved.reprises).toEqual([expect.objectContaining({ player1: 1, player2: null })])
  })
})
