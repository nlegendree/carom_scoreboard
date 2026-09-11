<script setup lang="ts">
withDefaults(defineProps<{ backLabel?: string; showBack?: boolean }>(), {
  backLabel: 'RETOUR',
  showBack: true,
})

const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <!-- Barre d'action présente sur tous les écrans : le retour garde toujours la même place.
       `showBack` permet de la conserver sans afficher un retour inerte à l'étape racine. -->
  <nav data-testid="action-bar" class="flex shrink-0 items-center gap-4 bg-bg px-4 py-2">
    <!-- Retour compact et `shrink-0` : il garde sa place à gauche sans prendre de largeur
         inutile, laissant l'emplacement des actions occuper tout le reste de la barre. -->
    <button
      v-if="showBack"
      data-testid="back-button"
      class="flex min-h-[var(--size-touch-target)] shrink-0 items-center gap-2 px-2 text-white touch-manipulation select-none"
      @pointerdown="emit('back')"
    >
      <span aria-hidden="true" class="text-xl">←</span>
      <span class="text-stat">{{ backLabel }}</span>
    </button>

    <div class="flex flex-1 items-center justify-end gap-4">
      <slot name="actions" />
    </div>
  </nav>
</template>
