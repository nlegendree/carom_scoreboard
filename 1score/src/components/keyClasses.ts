// Style de touche partagé par `NumericPad` et `AlphaKeyboard` : une seule définition, pour
// que les deux claviers de la modale soient rigoureusement identiques à l'œil quand ils se
// remplacent l'un l'autre au même emplacement. Le dimensionnement, lui, appartient à chaque
// clavier — 3 colonnes larges pour les chiffres, 10 colonnes serrées pour les lettres.
export const KEY_CLASSES =
  'flex items-center justify-center rounded-2xl border border-white/12 bg-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-75 touch-manipulation select-none active:border-white/25 active:bg-white/16 active:shadow-none disabled:opacity-30'
