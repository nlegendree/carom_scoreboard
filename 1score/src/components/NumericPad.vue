<script setup lang="ts">
import { computed } from 'vue'
import { KEY_CLASSES } from './keyClasses'

// Pavé purement présentationnel : il ne connaît ni le buffer de saisie, ni son plafond, ni
// ce qu'on fait des chiffres. `hasInput` sert uniquement à choisir le libellé d'effacement,
// sur le modèle de la calculatrice iOS : `AC` tant que rien n'est saisi, `C` ensuite.
const props = withDefaults(defineProps<{ disabled?: boolean; hasInput?: boolean }>(), {
  disabled: false,
  hasInput: false,
})

const emit = defineEmits<{ digit: [value: number]; clear: []; backspace: [] }>()

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const clearLabel = computed(() => (props.hasInput ? 'C' : 'AC'))

// 3 colonnes seulement : les touches restent très larges. En hauteur comme en largeur elles
// se partagent l'espace laissé par le parent (`auto-rows-fr`, `grid-cols-3`), donc elles
// grandissent sur un grand écran.
// Plancher `--size-key-numeric` (60 px sur tablette, fluide depuis la 11.1) sur LES DEUX
// axes, et non `--size-touch-target` (90 px) : c'est l'exception UX-DR8 des claviers
// intégrés. Un plancher de 90 px en largeur exige 302 px pour trois colonnes, ce qu'un
// panneau joueur en portrait 768x1024 (227 px utiles) ne peut pas donner — la 3e colonne
// se retrouvait rognée. Dans la modale, où la place ne manque pas, les colonnes restent
// bien plus larges que ce plancher : rien n'y change. La grille elle-même a pour plancher
// `--size-pad-min` (quatre rangées et trois `gap-2`, 288 px sur tablette).
const KEY_SIZE =
  'h-full min-h-(--size-key-numeric) min-w-(--size-key-numeric) text-key-numeric leading-none font-semibold tracking-tight text-white'
// Effacement et retour arrière encadrent le `0` : le rang du bas est plein et le zéro reste
// sous le 8, là où le doigt le cherche.
const ACTION_SIZE = 'h-full min-h-(--size-key-numeric) min-w-(--size-key-numeric) text-label font-bold text-white/55'
</script>

<template>
  <div class="grid h-full min-h-(--size-pad-min) auto-rows-fr grid-cols-3 gap-2">
    <button
      v-for="digit in DIGITS"
      :key="digit"
      :data-testid="`digit-${digit}`"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      @pointerdown="emit('digit', digit)"
    >
      {{ digit }}
    </button>

    <button
      data-testid="clear-button"
      :disabled="disabled"
      :class="[KEY_CLASSES, ACTION_SIZE]"
      class="tracking-title"
      @pointerdown="emit('clear')"
    >
      {{ clearLabel }}
    </button>

    <button
      data-testid="digit-0"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      @pointerdown="emit('digit', 0)"
    >
      0
    </button>

    <button
      data-testid="backspace-button"
      aria-label="Effacer le dernier chiffre"
      :disabled="disabled"
      :class="[KEY_CLASSES, ACTION_SIZE]"
      @pointerdown="emit('backspace')"
    >
      ⌫
    </button>
  </div>
</template>
