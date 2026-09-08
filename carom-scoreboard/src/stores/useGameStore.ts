import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import type { GameMode, GameStatus, Player, Reprise } from '../types/game'

// Distance de jeu par défaut, rendue configurable par la Story 1.4.
const DEFAULT_TARGET_SCORE = 20
const DEFAULT_MODE: GameMode = 'libre'

function makePlayer(id: 'player1' | 'player2'): Player {
  return { id, name: '', score: 0, color: id === 'player1' ? 'white' : 'yellow' }
}

export const useGameStore = defineStore('game', () => {
  const mode = ref<GameMode>(DEFAULT_MODE)
  const status = ref<GameStatus>('idle')
  const player1 = ref<Player>(makePlayer('player1'))
  const player2 = ref<Player>(makePlayer('player2'))
  const activePlayer = ref<'player1' | 'player2'>('player1')
  // AR9 : `shallowRef` évite la réactivité profonde sur les sessions longues.
  // Conséquence à respecter impérativement : toute évolution de `reprises` doit REMPLACER
  // le tableau (`reprises.value = [...reprises.value, r]`), jamais le muter — un `push`
  // ne déclencherait aucun recalcul des `computed` qui en dépendent (Story 1.5/1.8).
  const reprises = shallowRef<Reprise[]>([])
  const currentInput = ref({ player1: '', player2: '' })
  const isNegative = ref({ player1: false, player2: false })
  const targetScore = ref(DEFAULT_TARGET_SCORE)
  const startedAt = ref<number | null>(null)
  const lastSaved = ref('')

  function startGame(newMode: GameMode, player1Name: string, player2Name: string): void {
    mode.value = newMode
    player1.value = { ...makePlayer('player1'), name: player1Name }
    player2.value = { ...makePlayer('player2'), name: player2Name }
    status.value = 'playing'
    activePlayer.value = 'player1'
    reprises.value = []
    startedAt.value = Date.now()
    currentInput.value = { player1: '', player2: '' }
    isNegative.value = { player1: false, player2: false }
    lastSaved.value = new Date().toISOString()
  }

  // La bille reste attachée au côté (gauche blanc, droite jaune) : intervertir les billes
  // consiste donc à échanger les joueurs de côté, pas à repeindre les panneaux.
  // Le tour reste lui aussi attaché au côté : `activePlayer` n'est volontairement pas
  // déplacé (règle produit arrêtée en revue de la Story 1.3 — le joueur de gauche commence).
  function swapPlayers(): void {
    if (status.value !== 'playing' || reprises.value.length > 0) return

    const previousPlayer1 = player1.value

    player1.value = { ...player2.value, id: 'player1', color: 'white' }
    player2.value = { ...previousPlayer1, id: 'player2', color: 'yellow' }
    currentInput.value = {
      player1: currentInput.value.player2,
      player2: currentInput.value.player1,
    }
    isNegative.value = {
      player1: isNegative.value.player2,
      player2: isNegative.value.player1,
    }
    lastSaved.value = new Date().toISOString()
  }

  // Retour à l'accueil : la Story 1.15 y ajoutera la confirmation avant abandon.
  // Restaure l'intégralité de l'état initial pour qu'aucune valeur de la partie précédente
  // (mode, distance de jeu) ne soit silencieusement reconduite au démarrage suivant.
  function resetGame(): void {
    mode.value = DEFAULT_MODE
    status.value = 'idle'
    player1.value = makePlayer('player1')
    player2.value = makePlayer('player2')
    activePlayer.value = 'player1'
    reprises.value = []
    currentInput.value = { player1: '', player2: '' }
    isNegative.value = { player1: false, player2: false }
    targetScore.value = DEFAULT_TARGET_SCORE
    startedAt.value = null
    lastSaved.value = ''
  }

  return {
    mode,
    status,
    player1,
    player2,
    activePlayer,
    reprises,
    currentInput,
    isNegative,
    targetScore,
    startedAt,
    lastSaved,
    startGame,
    swapPlayers,
    resetGame,
  }
})
