<script setup lang="ts">
import { computed } from 'vue'
import PictoIcon from './PictoIcon.vue'
import type { SideBarItem } from '../types/ui'

// Colonne gauche de l'Epic 10 (UX-DR28 à UX-DR31), aplat sombre collé au bord de l'écran
// (modèle Cueuny, passe de rendu 10.1). Purement présentationnelle : l'écran fournit ses
// items et leurs actions, la barre ne connaît aucun contenu d'écran.
const props = defineProps<{ items: SideBarItem[]; exitItem?: SideBarItem }>()

// Deux groupes, un seul gabarit d'item : la sortie est calée en bas (`mt-auto`), isolée
// du reste de la colonne.
const groups = computed(() => [
  { key: 'items', testid: undefined, class: '', entries: props.items },
  ...(props.exitItem
    ? [{ key: 'bottom', testid: 'sidebar-bottom', class: 'mt-auto', entries: [props.exitItem] }]
    : []),
])

// `disabled` porte le visuel, la garde porte le comportement : les navigateurs ne
// s'accordent pas sur l'envoi des pointer events aux contrôles désactivés.
function press(item: SideBarItem): void {
  if (item.state === 'soon') return
  item.action?.()
}
</script>

<template>
  <!-- Largeur fixe : l'app ne tourne qu'en paysage (décision de Nathan, 2026-09-11). -->
  <aside
    data-testid="sidebar"
    class="flex h-full w-15 shrink-0 flex-col gap-1.5 border-r border-border bg-sidebar pb-3"
  >
    <!-- En-tête : une marque, pas une commande (UX-DR29) — ni bouton, ni handler. Bandeau
         rouge coupé en biais puis pli translucide (modèle Cueuny, passe de rendu 10.1) : le
         logo sombre se détache du fond, et la diagonale casse la symétrie de la colonne.
         Contenu calé en haut : le mot reste au-dessus de la coupe, plus haute à gauche. -->
    <div
      data-testid="sidebar-header"
      class="relative isolate flex h-15 shrink-0 flex-col items-center gap-0.5 pt-2"
    >
      <span
        aria-hidden="true"
        class="absolute inset-0 -z-10 bg-brand-red [clip-path:polygon(0_0,100%_0,100%_92%,0_72%)]"
      />
      <span
        aria-hidden="true"
        class="absolute inset-0 -z-10 bg-brand-red/35 [clip-path:polygon(0_72%,100%_92%,100%_100%,0_84%)]"
      />
      <img src="/logo.png" alt="1Score" class="size-6" />
      <span class="text-picto font-black tracking-[0.04em] text-white">1Score</span>
    </div>

    <div
      v-for="group in groups"
      :key="group.key"
      :data-testid="group.testid"
      class="flex flex-col gap-1.5"
      :class="group.class"
    >
      <!-- Libellés sans interlettrage : ENTRAÎNEMENT dépassait de 3 px dès que `text-picto`
           atteint son plafond de 12 px (iPad mini, iPad 11″). -->
      <button
        v-for="item in group.entries"
        :key="item.id"
        type="button"
        :data-testid="`sidebar-item-${item.id}`"
        :disabled="item.state === 'soon'"
        class="flex min-h-[var(--size-touch-target)] w-full flex-col items-center justify-center gap-0.5 px-0.5 text-center text-white touch-manipulation select-none"
        @pointerdown="press(item)"
      >
        <PictoIcon
          :name="item.picto"
          class="size-4"
          :class="item.state === 'soon' ? 'opacity-45' : ''"
        />
        <span
          data-testid="sidebar-label"
          class="text-picto font-bold uppercase leading-tight"
          :class="item.state === 'soon' ? 'opacity-45' : ''"
        >
          {{ item.label }}
        </span>
        <span
          v-if="item.state === 'soon'"
          data-testid="soon-badge"
          class="bg-white/15 px-1 text-[10px] font-bold"
        >
          BIENTÔT
        </span>
      </button>
    </div>
  </aside>
</template>
