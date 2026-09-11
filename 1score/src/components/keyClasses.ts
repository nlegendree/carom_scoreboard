// Style de touche partagé par `NumericPad` et `AlphaKeyboard` : une seule définition, pour
// que les deux claviers soient rigoureusement identiques à l'œil quand ils se remplacent
// l'un l'autre au même emplacement. Le dimensionnement, lui, appartient à chaque clavier —
// 3 colonnes larges pour les chiffres, 10 colonnes serrées pour les lettres.
// Story 10.3 (UX-DR54) : tokens de l'Epic 10 — contour `--color-border`, fond
// `--color-surface`, rayon `--radius-cta` (donc angles vifs). Le relief en creux disparaît
// avec les arrondis : le contour seul porte la touche.
export const KEY_CLASSES =
  'flex items-center justify-center rounded-cta border border-border bg-surface transition duration-75 touch-manipulation select-none active:border-border-strong active:bg-white/16 disabled:opacity-30'
