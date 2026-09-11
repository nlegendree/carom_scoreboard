<script setup lang="ts">
import { computed } from 'vue'
import PictoIcon from './PictoIcon.vue'

// Une tuile DISPONIBLE n'a pas de couleur à choisir : toutes portent LE bleu du produit,
// à l'accueil comme en sélection JDS (décision de Nathan, 2026-09-12) — les modes sont des
// pairs, les hiérarchiser par la nuance n'apportait rien. `color` ne sert donc qu'aux deux
// tuiles encore fermées, dont le bleu sombre dit l'inactivité autant que le badge ; elles
// perdront leur `color` en s'ouvrant.
type TileColor = 'tile-quilles' | 'tile-casin'

// Tuile de mode de l'accueil (UX-DR34). Racine unique `<button>` : le `data-testid` posé
// par le parent retombe dessus. `tagline` fait partie du contrat mais l'accueil n'en passe
// pas (décision de Nathan, 2026-09-11).
const props = withDefaults(
  defineProps<{ title: string; color?: TileColor; soon?: boolean; tagline?: string }>(),
  { color: undefined, soon: false, tagline: undefined },
)

const emit = defineEmits<{ select: [] }>()

// Classes écrites en toutes lettres pour le scanner JIT de Tailwind v4.
const GRADIENT_CLASSES: Record<TileColor, string> = {
  'tile-quilles': 'bg-(image:--gradient-tile-quilles)',
  'tile-casin': 'bg-(image:--gradient-tile-casin)',
}

const gradientClass = computed(() =>
  props.color ? GRADIENT_CLASSES[props.color] : 'bg-(image:--gradient-blue)',
)

// `disabled` porte le visuel, la garde porte le comportement (voir `SideBar`).
function select(): void {
  if (props.soon) return
  emit('select')
}

// Rien ne bouge au repos : l'accueil est l'écran de veille (AC8). L'éclaircissement au
// survol et à l'appui n'est pas un mouvement, et reste instantané (aucune transition).
// Le fond vit sur un calque à part : une tuile BIENTÔT l'atténue à 45 % sans éteindre
// le titre ni le badge. Pas de commentaire à la racine du gabarit : il en ferait un
// fragment, et le `data-testid` du parent ne retomberait plus sur le bouton.
</script>

<template>
  <button
    type="button"
    :disabled="soon"
    class="relative isolate flex min-h-[180px] flex-col justify-between p-2 text-left text-white touch-manipulation select-none"
    :class="soon ? '' : 'hover:brightness-110 active:brightness-125'"
    @pointerdown="select"
  >
    <span
      data-testid="tile-background"
      aria-hidden="true"
      class="absolute inset-0 -z-10"
      :class="[gradientClass, soon ? 'opacity-45' : '']"
    />

    <span class="flex flex-col gap-1">
      <span data-testid="tile-title" class="text-tile-title font-black uppercase leading-none">
        {{ title }}
      </span>
      <span v-if="tagline" data-testid="tile-tagline" class="text-stat text-white/80">
        {{ tagline }}
      </span>
    </span>

    <!-- Tuile BIENTÔT : le badge porte l'information, sans dépendre de la couleur seule. -->
    <span v-if="soon" data-testid="soon-badge" class="self-end bg-white/15 px-1.5 py-0.5 text-stat font-bold">
      BIENTÔT
    </span>
    <PictoIcon v-else name="arrow-right" class="size-5 self-end" />
  </button>
</template>
