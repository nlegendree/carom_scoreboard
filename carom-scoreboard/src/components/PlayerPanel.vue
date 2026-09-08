<script setup lang="ts">
import { computed } from 'vue'
import type { Player, PlayerColor } from '../types/game'

const props = defineProps<{
  player: Player
  active: boolean
  targetScore: number
}>()

// Classes écrites en toutes lettres (et non construites dynamiquement) pour que
// le scanner JIT de Tailwind v4 les détecte et génère bien le CSS correspondant.
const PLAYER_COLOR_CLASSES: Record<PlayerColor, string> = {
  white: 'bg-player-white text-on-player-white',
  yellow: 'bg-player-yellow text-on-player-yellow',
}

const colorClasses = computed(() => PLAYER_COLOR_CLASSES[props.player.color])
</script>

<template>
  <div
    class="flex h-full flex-1 flex-col p-4"
    :class="[colorClasses, { 'ring-8 ring-turn-active ring-inset': active }]"
  >
    <div class="flex shrink-0 items-start justify-between gap-4">
      <span class="text-label font-bold">{{ player.name }}</span>
      <span data-testid="target-score" class="text-label font-bold">{{ targetScore }}</span>
    </div>

    <div class="flex flex-1 items-center justify-center">
      <span class="text-score leading-none font-black">{{ player.score }}</span>
    </div>
  </div>
</template>
