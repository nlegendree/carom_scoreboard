<script setup lang="ts">
import { KEY_CLASSES } from './keyClasses'

// Clavier alphanumérique intégré : l'écran est une borne fixe, le clavier du système n'a
// donc pas à monter par-dessus l'interface. Purement présentationnel — il ne connaît ni le
// champ qu'il alimente, ni sa longueur maximale.
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

const emit = defineEmits<{ input: [char: string]; backspace: [] }>()

// Disposition AZERTY. La rangée de chiffres est en haut, comme sur un clavier de tablette :
// les joueurs doivent pouvoir écrire « MICHEL 2 » sans changer de mode.
// La 4e rangée complète WXCVBN par les accents courants des prénoms français.
const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['W', 'X', 'C', 'V', 'B', 'N', 'É', 'È', 'À', 'Ç'],
] as const

// Les touches se partagent la hauteur laissée par la modale (`auto-rows-fr`) : elles
// grandissent sur un grand écran et se resserrent sur 768 px, sans jamais pousser VALIDER
// hors de la carte. Le plancher garde une cible atteignable au format le plus petit.
const KEY_SIZE = 'h-full min-h-[44px] text-[clamp(16px,2vw,26px)] font-semibold text-white'
</script>

<template>
  <div class="grid h-full min-h-[288px] auto-rows-fr grid-cols-10 gap-2">
    <template v-for="(row, rowIndex) in ROWS" :key="rowIndex">
      <button
        v-for="char in row"
        :key="char"
        :data-testid="`key-${char}`"
        :disabled="disabled"
        :class="[KEY_CLASSES, KEY_SIZE]"
        @pointerdown="emit('input', char)"
      >
        {{ char }}
      </button>
    </template>

    <button
      data-testid="key-space"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      class="col-span-7 tracking-[0.3em] text-white/55"
      @pointerdown="emit('input', ' ')"
    >
      ESPACE
    </button>

    <button
      data-testid="key-backspace"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      class="col-span-3 text-white/55"
      @pointerdown="emit('backspace')"
    >
      ⌫
    </button>
  </div>
</template>
