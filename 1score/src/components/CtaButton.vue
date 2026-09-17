<script lang="ts">
// LE gabarit de CTA du produit — strate 3 : aucune connaissance du jeu, aucun store, aucune
// règle de score. Avant la Story 11.3, sept chaînes de classes de CTA vivaient recopiées dans
// six fichiers, dont trois MOT POUR MOT (les `ANNULER` / `VALIDER` des trois hôtes de saisie) ;
// l'audit du design system le relève en P3 (« redondances de classes »).
//
// SIX variantes, et non cinq (écart assumé au texte de l'AC d'`epics.md`, consigné dans
// `DESIGN.md` › Components › Buttons) : `PASSER LE TOUR` y est une famille à part — picto
// AU-DESSUS du libellé, rôle typographique `stat`, état inactif —, et l'absorber dans
// `accent` aurait demandé trois dérogations dans un composant censé en supprimer.
//
// Ce qui reste à l'APPELANT, et pourquoi : la LARGEUR quand elle est contextuelle (`w-1/3`
// d'`ANNULER`, `flex-1` de `VALIDER`), `mt-auto`, `relative overflow-hidden` (la barre de
// rebours de `VALIDER` s'y clippe) et le `data-testid`. Tout cela se fusionne par `class`.
// Le neutre ne porte AUCUNE largeur pour la même raison : deux utilitaires `w-*` sur le même
// élément se disputeraient `width`, et c'est l'ordre de la feuille générée qui trancherait.
//
// ⚠️ Aucun commentaire HTML à la racine du gabarit : il en ferait un fragment, et la racine
// perdrait `classes()`, `attributes()` et son `data-testid` (CLAUDE.md §12).
// ⚠️ Aucune classe construite à la volée : la table est écrite en TOUTES LETTRES, y compris
// les six fonds — le scanner JIT de Tailwind v4 n'émettrait rien d'une interpolation.
// ⚠️ Aucune valeur visuelle ici : tout est token (`DESIGN.md` d'abord, CLAUDE.md §7).
export type CtaVariant = 'accent' | 'neutral' | 'setup' | 'start' | 'bar' | 'pass'
</script>

<script setup lang="ts">
withDefaults(defineProps<{ variant: CtaVariant; disabled?: boolean }>(), { disabled: false })

const emit = defineEmits<{ press: [] }>()

// Toutes les variantes partagent le rayon tapable (`--radius-tappable`, Story 11.2 : le rayon
// de tout ce qui se tape) et l'encre blanche : c'est ce qui les fait lire comme UNE famille.
// La hauteur vient d'un token de taille, jamais d'un multiple de grille recopié (CLAUDE.md §7).
// `touch-manipulation select-none` n'y figure PAS : la règle globale de `main.css` couvre
// déjà tout `<button>` (AC6 de la 11.3).
//
// L'ÉTAT INACTIF est universel et vit hors de la table (revue du 2026-09-17, décision de
// Nathan) : il ne portait que sur `pass`, si bien qu'un `variant="accent" :disabled` rendait
// un bouton au dégradé intact, pleine encre, sans retour d'appui (`active:` ne s'applique pas
// à un `disabled`) — un CTA mort impossible à distinguer d'un CTA vivant. L'écran
// d'identification joueur de l'Epic 4 a justement un `VALIDER` à griser : le critère de
// sortie de l'epic veut qu'il le fasse SANS RIEN CRÉER.
const DISABLED_CLASSES = 'disabled:opacity-30'

const VARIANT_CLASSES: Record<CtaVariant, string> = {
  // Pop-up de décision (principal, choix) et `VALIDER` des trois hôtes de saisie.
  // ⚠️ AUCUNE largeur, comme `neutral` : ses trois appelants de saisie posent `flex-1` et ses
  // deux emplacements de `PromptModal` sont étirés par leur conteneur (pied en `flex-col`,
  // grille en `auto-cols-fr`). Le `w-full` que la 11.3 avait ajouté ici empilait deux
  // utilitaires de largeur sur le même élément — l'ancien markup ne portait que `flex-1` —,
  // et c'est l'ordre de la feuille générée qui aurait tranché hors d'un conteneur flex
  // (revue du 2026-09-17).
  accent:
    'min-h-(--size-touch-target) rounded-tappable bg-(image:--gradient-blue) text-label font-black text-white active:brightness-90',
  // Le RETOUR. Un seul retour d'appui, celui que `DESIGN.md` › Elevation nomme : il
  // s'ÉCLAIRCIT. `PromptModal` le portait déjà ; les trois hôtes de saisie l'assombrissaient
  // (`brightness-90`) — c'est le seul changement visuel volontaire de la Story 11.3, et il ne
  // touche que l'état ENFONCÉ.
  neutral:
    'min-h-(--size-touch-target) rounded-tappable bg-(image:--gradient-neutral) text-label font-black text-white active:brightness-125',
  // Réglage de l'accueil : picto EN LIGNE devant le libellé, `font-bold` et non `font-black`.
  setup:
    'flex min-h-(--size-touch-target) w-full min-w-0 items-center justify-center gap-2 rounded-tappable bg-(image:--gradient-blue) px-2 text-center text-label font-bold text-white active:brightness-90',
  // `DÉMARRER` : l'action qui engage la partie, seule à être ROUGE et à porter son propre
  // filet clair. Sa hauteur est un token à elle (`--size-start-button`).
  start:
    'flex min-h-(--size-start-button) w-full items-center justify-center gap-2 rounded-tappable bg-(image:--gradient-red) px-2 text-start-button font-black tracking-label text-white shadow-light-edge-start active:brightness-90',
  // CTA de la barre basse, pleine largeur de la colonne du joueur assis.
  bar: 'flex w-full min-h-(--size-touch-target) items-center justify-center rounded-tappable bg-(image:--gradient-blue) px-4 text-label font-black tracking-label text-white active:brightness-90',
  // `PASSER LE TOUR` : picto AU-DESSUS du libellé, rôle `stat`. L'état inactif est désormais
  // commun aux six (`DISABLED_CLASSES`), il ne figure plus ici.
  pass: 'flex min-h-(--size-touch-target) w-full flex-col items-center justify-center gap-1 rounded-tappable bg-(image:--gradient-blue) px-2 text-center text-stat font-black leading-tight text-white active:brightness-90',
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[VARIANT_CLASSES[variant], DISABLED_CLASSES]"
    @pointerdown="emit('press')"
  >
    <slot />
  </button>
</template>
