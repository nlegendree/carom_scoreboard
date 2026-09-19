<script lang="ts">
// LE gabarit de CTA du produit — strate 3 : aucune connaissance du jeu, aucun store, aucune
// règle de score. Avant la Story 11.3, sept chaînes de classes de CTA vivaient recopiées dans
// six fichiers, dont trois MOT POUR MOT (les `ANNULER` / `VALIDER` des trois hôtes de saisie) ;
// l'audit du design system le relève en P3 (« redondances de classes »).
//
// SIX variantes, et non cinq (écart assumé au texte de l'AC d'`epics.md`, consigné dans
// `DESIGN.md` › Components › Buttons) : `PASSER LE TOUR` y est une famille à part — picto
// AU-DESSUS du libellé, rôle typographique `cta-narrow`, état inactif —, et l'absorber dans
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
// Un CTA inactif est PLAT (revue de la 11.5, décision de Nathan, 2026-09-19) : il perd sa
// tranche de relief, sans quoi il garderait l'air d'un objet qu'on peut enfoncer.
const DISABLED_CLASSES = 'disabled:opacity-30 disabled:shadow-none'

// Relief de CTA (Story 11.5, Nathan, au rendu, 2026-09-19, « K1 ») : chaque variante porte sa
// TRANCHE (`shadow-cta-relief-*`, teintée à sa couleur) ; l'ENFONCEMENT, lui, est commun aux
// six : la tranche disparaît et le bouton descend de `--size-relief-depth`, le token qui fait
// aussi l'épaisseur de la tranche dans `main.css` : le bouton s'enfonce exactement de son
// épaisseur, et une seule valeur les tient toutes les deux. Instantané, comme tous les retours d'appui des CTA (`DESIGN.md` › Elevation).
const PRESS_CLASSES = 'active:translate-y-(--size-relief-depth) active:shadow-cta-relief-active'

const VARIANT_CLASSES: Record<CtaVariant, string> = {
  // Pop-up de décision (principal, choix) et `VALIDER` des trois hôtes de saisie.
  // ⚠️ AUCUNE largeur, comme `neutral` : ses trois appelants de saisie posent `flex-1` et ses
  // deux emplacements de `PromptModal` sont étirés par leur conteneur (pied en `flex-col`,
  // grille en `auto-cols-fr`). Le `w-full` que la 11.3 avait ajouté ici empilait deux
  // utilitaires de largeur sur le même élément — l'ancien markup ne portait que `flex-1` —,
  // et c'est l'ordre de la feuille générée qui aurait tranché hors d'un conteneur flex
  // (revue du 2026-09-17).
  // Story 11.5 (Task 4, Nathan, au rendu, 2026-09-19, « A ») : LA LARGEUR DÉCIDE DU FORMAT.
  // Un CTA large porte `label` 900 interlettré `label` (le rôle le prévoit dans `DESIGN.md` —
  // `accent` et `neutral` l'oubliaient, et `VALIDER` se lisait plus serré que `+ POINTS
  // ADVERSAIRE`) ; un CTA de colonne étroite (`setup`, `pass`) porte le picto AU-DESSUS et le
  // libellé en `cta-narrow` (taille de `stat`, 900), sur une ligne. LES SIX sont interlettrés `label`, sans exception.
  accent:
    'min-h-(--size-touch-target) rounded-tappable bg-(image:--gradient-blue) text-label font-black tracking-label text-white shadow-cta-relief-blue active:brightness-90',
  // Le RETOUR. Un seul retour d'appui, celui que `DESIGN.md` › Elevation nomme : il
  // s'ÉCLAIRCIT. `PromptModal` le portait déjà ; les trois hôtes de saisie l'assombrissaient
  // (`brightness-90`) — c'est le seul changement visuel volontaire de la Story 11.3, et il ne
  // touche que l'état ENFONCÉ.
  neutral:
    'min-h-(--size-touch-target) rounded-tappable bg-(image:--gradient-neutral) text-label font-black tracking-label text-white shadow-cta-relief-neutral active:brightness-125',
  // Réglage du paramétrage : colonne étroite, donc le format de `PASSER LE TOUR` — picto
  // AU-DESSUS, libellé `cta-narrow` sur une ligne (Story 11.5, « A »). Il était picto en ligne et
  // `label` 700, et passait sur deux lignes. Contraste tenu par la POSITION du libellé, comme
  // `pass` : mesuré au navigateur, `CtaButton.contrast.test.ts` › MEASURED_ON_SURFACE.
  // « Sur une ligne » est TENU (`whitespace-nowrap`, revue du 2026-09-19) : un libellé qui passerait
  // sur deux lignes remonterait vers le stop clair (3,68:1) et invaliderait la mesure.
  setup:
    'flex min-h-(--size-touch-target) w-full min-w-0 flex-col items-center justify-center gap-1 rounded-tappable bg-(image:--gradient-blue) px-2 text-center text-cta-narrow font-black leading-tight tracking-label whitespace-nowrap text-white shadow-cta-relief-blue active:brightness-90',
  // `DÉMARRER` : l'action qui engage la partie, seule à être ROUGE — son relief l'est aussi
  // (`cta-relief-red`, qui absorbe le filet clair qu'elle était seule à porter avant la 11.5). Sa hauteur est un token à elle (`--size-start-button`).
  start:
    'flex min-h-(--size-start-button) w-full items-center justify-center gap-2 rounded-tappable bg-(image:--gradient-red) px-2 text-start-button font-black tracking-label text-white shadow-cta-relief-red active:brightness-90',
  // CTA de la barre basse, pleine largeur de la colonne du joueur assis.
  bar: 'flex w-full min-h-(--size-touch-target) items-center justify-center rounded-tappable bg-(image:--gradient-blue) px-4 text-label font-black tracking-label text-white shadow-cta-relief-blue active:brightness-90',
  // `PASSER LE TOUR` : picto AU-DESSUS du libellé, rôle `cta-narrow` (revue de la 11.5 : il était `stat`). L'état inactif est désormais
  // commun aux six (`DISABLED_CLASSES`), il ne figure plus ici.
  // Une seule ligne tenue, comme `setup` : son exception de contraste en dépend aussi.
  pass: 'flex min-h-(--size-touch-target) w-full flex-col items-center justify-center gap-1 rounded-tappable bg-(image:--gradient-blue) px-2 text-center text-cta-narrow font-black leading-tight tracking-label whitespace-nowrap text-white shadow-cta-relief-blue active:brightness-90',
}
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[VARIANT_CLASSES[variant], PRESS_CLASSES, DISABLED_CLASSES]"
    @pointerdown="emit('press')"
  >
    <slot />
  </button>
</template>
