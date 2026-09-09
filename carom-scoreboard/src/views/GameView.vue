<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import HomeScreen from '../components/HomeScreen.vue'
import ActionBar from '../components/ActionBar.vue'
import PlayerPanel from '../components/PlayerPanel.vue'
import CenterPanel from '../components/CenterPanel.vue'

const gameStore = useGameStore()
const { status, player1, player2, activePlayer, mode, reprises } = storeToRefs(gameStore)

const repriseNumber = computed(() => reprises.value.length + 1)
const canSwapPlayers = computed(() => reprises.value.length === 0)
const canUndo = computed(() => reprises.value.length > 0)

function leaveGame(): void {
  gameStore.resetGame()
}
</script>

<template>
  <div class="flex h-dvh w-full flex-col">
    <HomeScreen v-if="status === 'idle'" />

    <template v-else-if="status === 'playing'">
      <div class="flex min-h-0 flex-1">
        <PlayerPanel :player="player1" :active="activePlayer === 'player1'" />
        <CenterPanel
          :mode="mode"
          :repriseNumber="repriseNumber"
          :canUndo="canUndo"
          :canSwapPlayers="canSwapPlayers"
          @swap-players="gameStore.swapPlayers()"
        />
        <PlayerPanel :player="player2" :active="activePlayer === 'player2'" />
      </div>

      <ActionBar backLabel="QUITTER" @back="leaveGame" />
    </template>
  </div>
</template>
