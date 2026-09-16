// Style de touche partagé par `NumericPad` et `AlphaKeyboard` : une seule définition, pour
// que les deux claviers soient rigoureusement identiques à l'œil quand ils se remplacent
// l'un l'autre au même emplacement. Le dimensionnement, lui, appartient à chaque clavier —
// 3 colonnes larges pour les chiffres, 10 colonnes serrées pour les lettres.
// Story 10.3, revue de rendu du 2026-09-12 (réf. Cueuny) : plaques sombres au rayon
// tapable (`--radius-tappable`, le rayon de tout ce qui se tape depuis la Story 11.2), relief
// donné par un filet clair en haut et une ombre portée en bas (`--shadow-key-relief`). À
// l'appui, la touche s'enfonce — l'ombre disparaît (`--shadow-key-relief-active`) et elle
// descend d'un pixel : c'est le retour visuel exigé par la direction visuelle de l'epic, et
// il se voit beaucoup mieux qu'un simple changement de fond. Les deux ombres sont des tokens
// de `main.css` (DESIGN.md › Elevation), jamais des valeurs écrites ici.
export const KEY_CLASSES =
  'flex items-center justify-center rounded-tappable bg-key shadow-key-relief transition duration-75 touch-manipulation select-none active:translate-y-px active:bg-key-active active:shadow-key-relief-active disabled:opacity-30'
