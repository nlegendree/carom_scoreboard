import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { computed, defineComponent, h, nextTick, watchEffect } from 'vue'
import { mount } from '@vue/test-utils'
import { MAX_SCORE_DIGITS, useGameStore } from './useGameStore'

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

    expect(store.currentInput.player1).toBe('')
    expect(store.reprises).toEqual([])
    expect(store.activePlayer).toBe('player1')
    expect(store.player1.score).toBe(0)
  })
})
