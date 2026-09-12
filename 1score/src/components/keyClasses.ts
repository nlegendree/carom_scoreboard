// Style de touche partagé par `NumericPad` et `AlphaKeyboard` : une seule définition, pour
// que les deux claviers soient rigoureusement identiques à l'œil quand ils se remplacent
// l'un l'autre au même emplacement. Le dimensionnement, lui, appartient à chaque clavier —
// 3 colonnes larges pour les chiffres, 10 colonnes serrées pour les lettres.
// Story 10.3, revue de rendu du 2026-09-12 (réf. Cueuny) : plaques sombres légèrement
// adoucies (`--radius-key`), relief donné par un filet clair en haut et une ombre portée
// en bas. À l'appui, la touche s'enfonce — l'ombre disparaît et elle descend d'un pixel :
// c'est le retour visuel exigé par la direction visuelle de l'epic, et il se voit
// beaucoup mieux qu'un simple changement de fond.
// C'est la seule exception aux angles vifs avec la carte de pop-up : une touche se lit
// comme un objet physique, pas comme un panneau.
export const KEY_CLASSES =
  'flex items-center justify-center rounded-key bg-key shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_2px_0_rgba(0,0,0,0.45)] transition duration-75 touch-manipulation select-none active:translate-y-px active:bg-key-active active:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] disabled:opacity-30'
