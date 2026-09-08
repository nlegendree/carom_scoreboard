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
  <nav class="flex shrink-0 items-center justify-between gap-4 bg-bg px-4 py-2">
    <button
      v-if="showBack"
      data-testid="back-button"
      class="flex min-h-[var(--size-touch-target)] items-center gap-3 px-4 text-label text-white touch-manipulation select-none"
      @pointerdown="emit('back')"
    >
      <span aria-hidden="true" class="text-2xl">←</span>
      <span class="text-stat">{{ backLabel }}</span>
    </button>
    <span v-else />

    <div class="flex items-center gap-4">
      <slot name="actions" />
    </div>
  </nav>
</template>
