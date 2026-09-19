<script setup lang="ts">
import { computed } from 'vue'
import ShotClock from './ShotClock.vue'
import PictoIcon from './PictoIcon.vue'
import CtaButton from './CtaButton.vue'
import { SHOT_CLOCK_SECONDS } from '../composables/useTimer'

// Colonne centrale du scoreboard, réduite à l'essentiel par la Story 10.4 (AC5) : le
// compteur de reprises, le chrono (3 Bandes seulement) et `PASSER LE TOUR`. Le mode de jeu
// en est sorti le 2026-09-09, `ÉCHANGER` en Story 10.3 (AR22, DT7), et `ANNULER` descend
// en barre basse avec les trois autres pictos ici.
//
// ⚠️ La colonne est SANS CONTOUR, contrairement à la lettre de l'AC5 (3e passe de rendu,
// Nathan). Le filet clair (`border-border`, blanc à 18 %) courait verticalement au bord de
// la colonne et s'interrompait derrière le disque du chrono qui déborde : le raccord du
// liseré de tour y laissait voir un petit trait gris et une délimitation nette, juste là où
// le tracé doit être invisible. Les deux cartes en aplat plein la délimitent déjà par
// contraste — le contour n'apportait rien qu'un défaut. Ne pas le remettre sans revoir ce
// raccord.
// Et SANS VOILE depuis la Story 11.2 (Nathan, au rendu) : la colonne est la base nue,
// `--color-bg` par héritage, un creux entre les deux cartes ; le disque du chrono lit la même
// couleur et n'a plus de token propre.
//
// ⚠️ Et AUCUN commentaire HTML à la racine du gabarit : il en ferait un fragment, et la
// racine perdrait `classes()` comme ses attributs (piège payé en 10.1 sur `ModeTile`, et
// repayé ici même en voulant documenter la ligne ci-dessus au bon endroit).
//
// `secondsRemaining` (Story 2.1) : chrono de tir du 3 Bandes, `null` dans les autres
// modes — c'est la vue qui filtre par mode, la console reste générique. En JDS l'espace
// reste vide et `PASSER LE TOUR` remonte : rien à masquer, `flex-1` s'en charge.
const props = withDefaults(
  defineProps<{
    repriseNumber: number
    secondsRemaining: number | null
    // Pop-up de fin ouverte : le CTA reste visible mais inerte (AC8).
    passTurnDisabled?: boolean
    // Pop-up de saisie ouverte : le CTA est MASQUÉ — il se retrouverait sous le voile,
    // et le doigt qui vient de fermer la pop-up tomberait dessus (AC8).
    entryOpen?: boolean
    // ⚠️ `turnSide` est RETIRÉ par la Story 11.5 : il ne servait qu'à relayer au chrono le
    // côté de la carte qui a le tour, pour qu'il porte le prolongement du liseré. Sans
    // débordement, il n'y a plus de liseré à prolonger — la colonne n'a plus à savoir qui
    // joue, et redevient entièrement générique.
  }>(),
  { passTurnDisabled: false, entryOpen: false },
)

// `PASSER LE TOUR` (Story 10.4) remplace le tap sur la carte adverse comme seul geste de
// passage de main. La vue le branche sur `passTurn()` du store, REPRISE TELLE QUELLE
// (AR23) : la règle — série de 0 en JDS, clôture de la série comptée en 3 Bandes — n'a pas
// bougé d'une ligne, seul le geste change. Il est symétrique au sens d'UX-DR11 (il rend la
// main quel que soit le joueur actif), ce qui l'autorise dans la colonne centrale,
// contrairement à une saisie de score.
const emit = defineEmits<{ 'pass-turn': [] }>()

// ⚠️ `PASSER LE TOUR` tient LA MÊME PLACE dans les deux modes — en bas de la colonne
// (4e passe de rendu, Nathan : « pour que l'utilisateur soit habitué à sa position »).
// Avant, la colonne centrait sa pile : sans chrono, le CTA remontait au milieu et changeait
// d'endroit entre un JDS et un 3 Bandes. Le compteur de reprises prend alors la place que
// le chrono occupe en 3 Bandes, au lieu de laisser un vide.
// Un seul markup pour les deux cas : c'est la CLASSE du bloc de reprises qui change, pas
// sa position dans le gabarit — le dupliquer pour le déplacer rouvrirait DT2 en miniature.
//
// ⚠️ Sans chrono, le compteur est sorti du flux et centré sur la HAUTEUR ENTIÈRE de la
// colonne (5e passe de rendu, Nathan : « il faut centrer les reprises entre les 2 scores »).
// En `flex-1 justify-center`, il se centrait sur la place restant AU-DESSUS du CTA, donc
// une cinquantaine de pixels trop haut : les scores, eux, se centrent dans une carte dont
// le bandeau et le pied s'équilibrent à peu près, soit sur le milieu de la zone de jeu.
const REPRISE_BLOCK_CLASSES = {
  clock: 'shrink-0',
  noClock: 'absolute inset-x-0 top-1/2 -translate-y-1/2',
} as const

// ⚠️ Sert à la CLASSE seulement : le `v-if` du chrono garde sa comparaison littérale
// `secondsRemaining !== null`, qui est ce qui affine `number | null` en `number` pour
// `ShotClock`. Un `v-if` sur ce computed perd ce narrowing — `vue-tsc --noEmit` le laisse
// passer, `npm run build` (`vue-tsc -b`) le refuse.
const repriseBlockClass = computed(() =>
  props.secondsRemaining !== null ? REPRISE_BLOCK_CLASSES.clock : REPRISE_BLOCK_CLASSES.noClock,
)

// `disabled` porte le visuel, la garde porte le comportement : les navigateurs ne
// s'accordent pas sur l'envoi des pointer events aux contrôles désactivés.
function passTurn(): void {
  if (props.passTurnDisabled) return
  emit('pass-turn')
}
</script>

<template>
  <div
    class="relative flex w-1/5 min-w-0 shrink-0 flex-col items-center gap-3 overflow-visible rounded-block bg-bg p-1"
  >
    <div class="flex w-full min-w-0 flex-col items-center" :class="repriseBlockClass">
      <span data-testid="reprise-label" class="text-stat text-white/60">REP</span>
      <!-- `text-reprise` est dimensionné pour la colonne (w-1/5) et non pour un panneau
           joueur : la rampe `text-score-*` y déborderait dès 2 chiffres sur tablette. -->
      <span
        data-testid="reprise-number"
        class="w-full text-center text-reprise leading-none font-black tabular-nums text-white"
        >{{ repriseNumber }}</span
      >
    </div>

    <!-- Story 2.1 : anneau du chrono de tir, uniquement en 3 Bandes (UX-DR4).
         ⚠️ Story 11.5 (Nathan, au rendu, 2026-09-18) : le disque NE DÉBORDE PLUS sur les
         cartes — l'AC16 de la 10.4 est renversée. Le débordement était la signature de
         colonnes SOUDÉES ; depuis que le scoreboard est en blocs séparés, la gouttière
         s'arrêtait contre le disque au lieu d'en faire le tour, et le blanc de la carte, le
         liseré rouge et la bande grise finissaient tous les trois sur une diagonale. Quatre
         passes de rendu ont cherché un raccord propre avant l'abandon.
         Ce qu'il en reste ici : la zone ne s'élargit plus d'un débordement, mais elle ANNULE
         le retrait de la colonne (`p-1`) pour que l'anneau aille d'un bord à l'autre —
         « contente-toi de mettre le chrono le plus gros possible dans le container, tu peux
         retirer la padding autour de l'anneau ». Le calcul reste sur la CONTENT BOX : `100%`
         vaut la colonne moins ses deux `p-1`, d'où les 2 unités rendues.
         Story 11.5 (Nathan, 2026-09-19) : le retrait de la colonne passe de 2 unités à 1 —
         « le même padding que là », celui du CTA de la barre basse dans sa barre. `PASSER LE
         TOUR` se pose donc à la même distance de son bloc que `+1 ADVERSAIRE` de la sienne.
         ⚠️ `z-20` conservé : il n'y a plus de liseré à masquer, mais l'ordre de peinture
         reste explicite de part et d'autre (`PlayerPanel` › `ring-8` est à `z-10`), et s'en
         remettre au contexte d'empilement de `@container` n'avait pas suffi en 10.4.
         ⚠️ Aucun `overflow-hidden` sur cette colonne ni sur ses ancêtres.
         ⚠️ Le `gap-3` de la colonne est CONSERVÉ, et c'est mesuré, pas subi : sans
         débordement, c'est la LARGEUR de la colonne qui gouverne la taille du disque aux
         trois formats (373 px à 1920, 229 à 1180, 220 à 1133 — exactement la colonne). Rendre
         de la hauteur en resserrant les trois éléments ne grossit donc plus le disque d'un
         seul pixel : vérifié au navigateur, `gap-1` et `gap-3` donnent la même taille. Ne pas
         resserrer en croyant agrandir le chrono. -->
    <div
      v-if="secondsRemaining !== null"
      data-testid="shot-clock-bleed"
      class="relative z-20 flex min-h-0 w-[calc(100%_+_var(--spacing)_*_2)] flex-1 -mx-1"
    >
      <ShotClock :secondsRemaining="secondsRemaining" :totalSeconds="SHOT_CLOCK_SECONDS" />
    </div>

    <!-- AC5 : CTA pleine largeur de colonne, ≥ 90 px de haut. Il n'engage rien
         d'irréversible (`ANNULER` le défait, AC8), donc pas de rouge. BLEU depuis la
         Story 11.2 (Nathan, au rendu) : une action de jeu, comme `+1`, pas un retour — le
         neutre opaque de l'epic ne reste qu'à `ANNULER` et au secondaire de pop-up. Son
         libellé `stat` se pose au milieu du dégradé (blanc 4,95:1).
         ⚠️ SANS contour (1re passe de rendu, Nathan) : un filet clair dessinait un cadre
         dans un cadre au milieu de la colonne. Le dégradé se détache seul du fond de la
         colonne. Rayon tapable comme tout ce qui se tape (Story 11.2). -->
    <CtaButton
      v-if="!entryOpen"
      data-testid="pass-turn-button"
      variant="pass"
      :disabled="passTurnDisabled"
      class="mt-auto shrink-0"
      @press="passTurn"
    >
      <PictoIcon name="pass-turn" class="size-4 shrink-0" />
      <span>PASSER LE TOUR</span>
    </CtaButton>
  </div>
</template>
