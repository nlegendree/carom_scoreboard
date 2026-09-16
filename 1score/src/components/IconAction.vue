<script setup lang="ts">
import PictoIcon from './PictoIcon.vue'
import type { ItemState, PictoName } from '../types/ui'

// Commande secondaire en picto + libellé de la barre basse du scoreboard (UX-DR52,
// Story 10.4). Même grammaire que les items de `SideBar` — picto au-dessus, libellé court
// en dessous, badge BIENTÔT pour ce qui n'est pas encore livré — mais posée à plat dans une
// barre horizontale, avec le fond et le contour des conteneurs de l'Epic 10.
//
// La cible tactile de 90 px porte sur le BLOC ENTIER, libellé compris : le picto seul ne
// tient pas la cible, et c'est tout le bouton qui est tapé.
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la racine
// perdrait `classes()` comme ses attributs (piège payé en 10.1 sur `ModeTile`).
const props = withDefaults(
  defineProps<{
    picto: PictoName
    label: string
    state?: ItemState
    disabled?: boolean
  }>(),
  { state: 'normal', disabled: false },
)

const emit = defineEmits<{ press: [] }>()

// `disabled` porte le visuel, la garde porte le comportement : les navigateurs ne
// s'accordent pas sur l'envoi des pointer events aux contrôles désactivés (Chromium en a
// changé en 2023). Les deux, toujours — pour l'état BIENTÔT comme pour le grisé.
function press(): void {
  if (props.disabled || props.state === 'soon') return
  emit('press')
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled || state === 'soon'"
    class="flex min-h-(--size-touch-target) min-w-(--size-touch-target) flex-col items-center justify-center gap-1 border border-border bg-surface px-1 text-center text-white rounded-tappable active:bg-white/15 disabled:opacity-30"
    @pointerdown="press"
  >
    <PictoIcon :name="picto" class="size-4" />
    <span data-testid="icon-action-label" class="text-picto font-bold uppercase leading-tight">
      {{ label }}
    </span>
    <!-- Le badge REDOUBLE l'atténuation : grisé seul, un picto se lit comme « pas
         disponible maintenant » ; BIENTÔT dit « pas encore livré ». -->
    <span v-if="state === 'soon'" data-testid="soon-badge" class="bg-white/15 px-1 text-picto font-bold">
      BIENTÔT
    </span>
  </button>
</template>
