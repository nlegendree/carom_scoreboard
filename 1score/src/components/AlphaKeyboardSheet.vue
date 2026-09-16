<script setup lang="ts">
import { ref } from 'vue'
import AlphaKeyboard from './AlphaKeyboard.vue'
import CtaButton from './CtaButton.vue'
import PopupCard from './PopupCard.vue'
import { useHaptics } from '../composables/useHaptics'
import type { TableSide } from '../types/game'

// Hôte du clavier alphabétique pour la saisie d'un nom (UX-DR40).
//
// Revue de rendu du 2026-09-12 (Nathan) : même traitement que `NumericPadDock` — pop-up
// ALIGNÉE SUR LE CÔTÉ OPPOSÉ à la carte qu'on remplit, pour que celle-ci reste visible et
// se remplisse à vue. Le rappel du nom dans l'en-tête disparaît donc avec le besoin. Le
// voile ferme au tap dehors, et `ANNULER` remplace la croix.
// ⚠️ Voile SANS FLOU, et à peine assombri : voir `NumericPadDock`, même raison — la carte
// qu'on remplit doit rester lisible.
//
// Même partage qu'avec `NumericPadDock` : la valeur vit dans l'écran, la pop-up reçoit
// `value` et émet la nouvelle valeur complète, mais porte les règles de saisie ET les
// retours — haptique à chaque frappe acceptée, haptique distincte et pulsation au plafond
// (UX-DR54, CLAUDE.md §10) ; le clavier, lui, reste muet. Les retours manquaient à la
// livraison de la 10.3 (revue de fin d'Epic 10) : un clavier qui refuse sans rien dire
// paraît en panne.
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme son `data-testid`.
const MAX_NAME_LENGTH = 20

const props = defineProps<{ value: string; align: TableSide; reserve: string }>()

const emit = defineEmits<{ update: [value: string]; validate: []; cancel: [] }>()

const { tap, reject } = useHaptics()

// Compteur de relance de l'animation CSS : changer la `key` de l'élément le recrée, ce qui
// rejoue la pulsation depuis le début. Aucun timer JS pour les retours visuels.
const rejectKey = ref(0)

// La pop-up ne se colle pas au bord : elle se CENTRE dans la zone que la carte visée
// laisse libre (revue de rendu du 2026-09-12). L'hôte transmet la bande à RÉSERVER du côté
// opposé (`reserve`) — il est le seul à connaître la géométrie de son écran. Story 11.3 :
// elle vivait avant en token `--*-popup-inset-*`, c'est-à-dire une position dans le
// namespace des intentions.

function onInput(char: string): void {
  // Pas d'espace en tête ni d'espaces consécutifs : ils ne se verraient pas, mangeraient
  // le plafond, et `.trim()` les jetterait à la validation. Geste sans effet, pas un refus.
  if (char === ' ' && (props.value === '' || props.value.endsWith(' '))) return
  // Le plafond porte sur le nom UTILE, mesuré sur ce que la frappe donnerait : un espace
  // de fin ne bloque pas la frappe, mais la lettre qui le suit ne peut pas faire un 21e
  // caractère (`props.value.trim().length >= MAX` laissait passer ce cas).
  if ((props.value + char).trim().length > MAX_NAME_LENGTH) {
    reject()
    rejectKey.value += 1
    return
  }
  emit('update', props.value + char)
  tap()
}

function onBackspace(): void {
  emit('update', props.value.slice(0, -1))
}

function onClear(): void {
  emit('update', '')
}
</script>

<template>
  <PopupCard
    testid="alpha-keyboard-sheet"
    cardTestid="sheet-card"
    label="Saisie du nom"
    width="alpha"
    gap="sm"
    :align="align"
    :reserve="reserve"
    @backdrop-close="emit('cancel')"
  >
      <div
        :key="rejectKey"
        data-testid="sheet-reject"
        :data-reject="rejectKey"
        :class="rejectKey > 0 && 'animate-input-reject'"
      >
        <AlphaKeyboard @input="onInput" @backspace="onBackspace" @clear="onClear" />
      </div>

      <template #footer>
        <CtaButton
          data-testid="sheet-close"
          variant="neutral"
          class="w-1/3"
          @press="emit('cancel')"
        >
          ANNULER
        </CtaButton>
        <CtaButton
          data-testid="sheet-confirm"
          variant="accent"
          class="flex-1"
          @press="emit('validate')"
        >
          VALIDER
        </CtaButton>
      </template>
  </PopupCard>
</template>
