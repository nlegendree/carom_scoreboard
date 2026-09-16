<script setup lang="ts">
import { KEY_CLASSES } from './keyClasses'

// Clavier alphanumérique intégré : l'écran est une borne fixe, le clavier du système n'a
// donc pas à monter par-dessus l'interface. Purement présentationnel — il ne connaît ni le
// champ qu'il alimente, ni sa longueur maximale.
withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

// `clear` : tout effacer d'un coup (revue de rendu du 2026-09-12). Le clavier reste muet —
// il dit qu'on a tapé RESET, c'est son hôte qui vide le buffer.
const emit = defineEmits<{ input: [char: string]; backspace: []; clear: [] }>()

// Disposition AZERTY. La rangée de chiffres est en haut, comme sur un clavier de tablette :
// les joueurs doivent pouvoir écrire « MICHEL 2 » sans changer de mode.
// La 4e rangée complète WXCVBN par les accents courants des prénoms français.
// Aucune touche existante ne bouge (DT4) : la mémoire du geste compte plus que la symétrie,
// les ajouts de la Story 10.3 vont tous dans la 5e rangée.
const ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['W', 'X', 'C', 'V', 'B', 'N', 'É', 'È', 'À', 'Ç'],
] as const

// 5e rangée (DT4) : tréma et circonflexe des prénoms français (JOËL, ANAÏS, BENOÎT,
// JÉRÔME), puis le tiret de JEAN-PIERRE et l'apostrophe de D'ARTAGNAN. Sept touches, le ⌫
// occupe les trois colonnes restantes.
// Les signes portent un `data-testid` nommé : `key--` et `key-'` seraient illisibles en
// sélecteur, et l'apostrophe y ferme la chaîne du test.
const SIGN_ROW = [
  { char: 'Ë', testid: 'key-Ë' },
  { char: 'Ï', testid: 'key-Ï' },
  { char: 'Î', testid: 'key-Î' },
  { char: 'Ô', testid: 'key-Ô' },
  { char: 'Û', testid: 'key-Û' },
  { char: '-', testid: 'key-hyphen' },
  { char: "'", testid: 'key-apostrophe' },
] as const

// Les touches se partagent la hauteur laissée par l'hôte (`auto-rows-fr`) : elles
// grandissent sur un grand écran et se resserrent au format le plus petit, sans jamais
// pousser VALIDER hors du bandeau. Plancher `--size-key-alpha` (57 px sur tablette, relevé
// par la Story 10.3, fluide depuis la 11.1) : six rangées et cinq `gap-1` font
// `--size-alpha-min` (382 px sur tablette), ce que le bandeau de `AlphaKeyboardSheet`
// absorbe en laissant les deux cartes entières au-dessus.
const KEY_SIZE = 'h-full min-h-(--size-key-alpha) text-key-alpha font-semibold text-white'
</script>

<template>
  <div class="grid h-full min-h-(--size-alpha-min) auto-rows-fr grid-cols-10 gap-1">
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
      v-for="key in SIGN_ROW"
      :key="key.char"
      :data-testid="key.testid"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      @pointerdown="emit('input', key.char)"
    >
      {{ key.char }}
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

    <button
      data-testid="key-space"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      class="col-span-7 tracking-stat text-white/55"
      @pointerdown="emit('input', ' ')"
    >
      ESPACE
    </button>

    <button
      data-testid="key-reset"
      :disabled="disabled"
      :class="[KEY_CLASSES, KEY_SIZE]"
      class="col-span-3 tracking-title text-white/55"
      @pointerdown="emit('clear')"
    >
      RESET
    </button>
  </div>
</template>
