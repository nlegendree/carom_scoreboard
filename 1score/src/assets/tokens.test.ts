import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas les
// types Node. `main.css?raw` ne rend le TEXTE que grâce à `test.css.include` dans
// `vitest.config.ts` ; les `.vue?raw` et `keyClasses.ts?raw` passent sans réglage.
import source from './main.css?raw'

// Story 11.2 (AC3) : DESIGN.md nomme les rayons et les ombres, `main.css` les déclare, aucun
// token de couleur, d'image, de rayon ou d'ombre n'est déclaré sans consommateur, et aucun
// gabarit n'écrit une ombre ou un rayon en valeur arbitraire. happy-dom ne calcule aucun
// CSS : ce fichier verrouille la SOURCE, jamais le rendu (le rendu se vérifie au navigateur).
//
// Les deux listes recopient le frontmatter de DESIGN.md (`rounded` hors `none` / `full`, qui
// sont Tailwind, et `shadows`) : miroir tenu DANS LES DEUX SENS, comme `typography.test.ts`.
const RADIUS_ROLES = ['tappable', 'popup']
const SHADOW_ROLES = [
  'key-relief', 'key-relief-active', 'light-edge-start', 'light-edge-field', 'popup', 'sidebar',
]

const templates = import.meta.glob<string>('../**/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})
// `keyClasses.ts` et `ballAssets.ts` sont les seules chaînes de classes hors gabarit : elles
// comptent comme des gabarits.
const shared = import.meta.glob<string>('../components/{keyClasses,ballAssets}.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const files = { ...templates, ...shared }

// Les commentaires citent volontiers un token retiré ou un ancien nom (« `--radius-container`
// vaut 0 ») : on les retire avant de chercher un consommateur, pour ne compter que le code.
const stripComments = (text: string): string =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^\s*\/\/.*$/gm, '')

const css = stripComments(source)
const code = Object.values(files).map(stripComments).join('\n')

const declared = (namespace: string): string[] =>
  [...css.matchAll(new RegExp(`^\\s*--${namespace}-([a-z0-9-]+):`, 'gm'))].map((m) => m[1] ?? '')

// `var(--x)` ailleurs que dans sa propre déclaration (un dégradé qui lit un stop, la règle
// de focus, `:root`).
const readByVar = (token: string): boolean =>
  new RegExp(`var\\(${token}\\)`).test(css.replace(new RegExp(`^\\s*${token}:.*$`, 'gm'), ''))

// Utilitaire Tailwind consommateur, avec ou sans variante (`active:`) ni modificateur (`/88`).
// `(?![\\w-])` et non `\\b` : `bg-bg` ne doit pas valoir consommateur de `--color-bg-raised`,
// ni `bg-bg-raised` de `--color-bg`.
const usedByUtility = (prefixes: string[], name: string): boolean =>
  new RegExp(`(?<![\\w-])(?:${prefixes.join('|')})-${name}(?![\\w-])`).test(code)

const COLOR_PREFIXES = ['bg', 'text', 'border', 'divide', 'ring', 'outline', 'from', 'via', 'to']

describe('main.css — miroir DESIGN.md pour les rayons et les ombres (Story 11.2)', () => {
  // `css` (commentaires retirés) et non `source` : un token cité dans un commentaire ne
  // compte pas comme déclaré.
  it.each(RADIUS_ROLES)('declares the --radius-%s token', (role) => {
    expect(css).toMatch(new RegExp(`^\\s*--radius-${role}:`, 'm'))
  })

  it.each(SHADOW_ROLES)('declares the --shadow-%s token', (role) => {
    expect(css).toMatch(new RegExp(`^\\s*--shadow-${role}:`, 'm'))
  })

  // Le miroir dans l'autre sens : un rayon ou une ombre que DESIGN.md ne nomme pas n'existe
  // pas — ni `--radius-cta` / `key` / `modal` / `container` (retirés). Le palier `lg` est
  // SUPPRIMÉ, pas seulement non déclaré : Tailwind v4 le fournirait sinon à 1024 px, et un
  // `lg:` s'appliquerait à 1180 (revue de la 11.2) — `initial` est la seule valeur admise.
  it('declares no --radius-*, --shadow-* or --breakpoint-* token that DESIGN.md does not name', () => {
    expect(declared('radius').sort()).toEqual([...RADIUS_ROLES].sort())
    expect(declared('shadow').sort()).toEqual([...SHADOW_ROLES].sort())
    expect(declared('breakpoint')).toEqual(['lg'])
    expect(css).toMatch(/^\s*--breakpoint-lg: initial;/m)
  })
})

describe('main.css — aucun token sans consommateur (Story 11.2)', () => {
  // `it.each` sur une liste vide ne génère aucun cas et passe au vert : si `main.css?raw`
  // rendait une chaîne vide (réglage `test.css.include` perdu), rien ne le dirait.
  it('reads main.css as text', () => {
    expect(declared('color').length).toBeGreaterThan(0)
    expect(declared('gradient').length).toBeGreaterThan(0)
  })

  // Chaque famille a sa forme de consommation : un utilitaire préfixé dans un gabarit, ou
  // un `var()` dans `main.css` hors de sa propre déclaration. Un token qui n'a ni l'un ni
  // l'autre est mort, et un token mort est un trou dans DESIGN.md, pas une réserve.
  it.each(declared('color'))('--color-%s has a consumer', (name) => {
    expect(usedByUtility(COLOR_PREFIXES, name) || readByVar(`--color-${name}`)).toBe(true)
  })

  it.each(declared('gradient'))('--gradient-%s has a consumer', (name) => {
    expect(code.includes(`bg-(image:--gradient-${name})`) || readByVar(`--gradient-${name}`)).toBe(true)
  })

  it.each(declared('radius'))('--radius-%s has a consumer', (name) => {
    expect(usedByUtility(['rounded', 'rounded-[trblse]{1,2}'], name)).toBe(true)
  })

  it.each(declared('shadow'))('--shadow-%s has a consumer', (name) => {
    expect(usedByUtility(['shadow'], name)).toBe(true)
  })
})

describe('gabarits — aucune ombre ni rayon hors DESIGN.md (Story 11.2)', () => {
  const names = Object.keys(files)

  it('covers every template of src/ and the shared class modules', () => {
    expect(names.length).toBeGreaterThanOrEqual(20)
    expect(names.some((f) => f.endsWith('keyClasses.ts'))).toBe(true)
    expect(names.some((f) => f.endsWith('ballAssets.ts'))).toBe(true)
  })

  // Ni `shadow-[…]` ni `rounded-[…]` : une ombre ou un rayon qui manque s'ajoute dans
  // DESIGN.md, puis dans `main.css`, jamais dans un gabarit (CLAUDE.md §7). `rounded-full`
  // (billes, disque du chrono) reste l'utilitaire standard que DESIGN.md nomme.
  it.each(names)('%s writes no shadow or radius value outside DESIGN.md', (file) => {
    const text = stripComments(files[file] ?? '')
    expect(text).not.toMatch(/\bshadow-\[/)
    expect(text).not.toMatch(/\brounded(-[trblse]{1,2})?-\[/)
    expect(text).not.toMatch(/\brounded(-[trblse]{1,2})?-(xs|sm|md|lg|[2-9]?xl)\b/)
  })

  // Le sens inverse : un `rounded-<x>` ou `shadow-<x>` qui n'est pas un token déclaré
  // n'émet RIEN — Tailwind ignore un utilitaire inconnu en silence, c'est ainsi qu'un
  // `rounded-cta` a survécu au retrait de `--radius-cta` (revue de la 11.2). `rounded` nu
  // (4 px), `shadow-<échelle>`, `inset-shadow-*` et `drop-shadow-*` tombent sous la même
  // règle : ils ne sont pas dans DESIGN.md.
  const radiusAllowed = new Set([...RADIUS_ROLES, 'none', 'full'])
  const shadowAllowed = new Set(SHADOW_ROLES.map((r) => `shadow-${r}`))
  it.each(names)('%s uses only the radius and shadow tokens DESIGN.md names', (file) => {
    const text = stripComments(files[file] ?? '')
    const radii = [...text.matchAll(/(?<![\w-])rounded(?:-[trblse]{1,2})?(?:-([a-z0-9-]+))?(?![\w-])/g)]
      .map((m) => m[1] ?? '')
    expect(radii.filter((r) => !radiusAllowed.has(r))).toEqual([])
    const shadows = [...text.matchAll(/(?<![\w-])(?:inset-shadow|drop-shadow|shadow)(?:-[a-z0-9-]+)?(?![\w-])/g)]
      .map((m) => m[0])
    expect(shadows.filter((s) => !shadowAllowed.has(s))).toEqual([])
  })
})

// ————————————————————————————————————————————————————————————————————————————————————————
// Story 11.3 — les règles de SOURCE de la bibliothèque de base. Elles vivent ici, avec les
// autres règles de source du design system, et non dans le test d'un composant : chacune
// porte sur l'ABSENCE d'une chose dans TOUS les gabarits, ce qu'aucun test de composant ne
// peut voir. happy-dom ne calcule aucun CSS : c'est la source qui est verrouillée.
// ————————————————————————————————————————————————————————————————————————————————————————

// Les chaînes littérales d'un fichier : `class="…"` comme `const X = '…'`. C'est la bonne
// granularité pour la règle d'AC2 — ce qui est interdit, c'est qu'UNE MÊME chaîne porte à la
// fois la hauteur d'une cible et un dégradé, pas que le fichier contienne les deux ailleurs.
const literals = (text: string): string[] =>
  [...text.matchAll(/(["'])((?:(?!\1)[\s\S])*)\1/g)].map((m) => m[2] ?? '')

const TOUCH_HEIGHT = /min-h-(?:\[var\(--size-|\(--size-)/
const GRADIENT = /bg-\(image:--gradient-/

describe('gabarits — un seul gabarit de CTA (Story 11.3, AC2)', () => {
  const names = Object.keys(files).filter((f) => !f.endsWith('CtaButton.vue'))

  it('finds CtaButton.vue among the scanned templates', () => {
    expect(Object.keys(files).some((f) => f.endsWith('CtaButton.vue'))).toBe(true)
  })

  // Une chaîne qui porte une hauteur de cible ET un dégradé EST un CTA : elle n'a plus le
  // droit d'exister ailleurs que dans la table de variantes de `CtaButton`.
  it.each(names)('%s copies no CTA class chain', (file) => {
    const offenders = literals(stripComments(files[file] ?? '')).filter(
      (s) => TOUCH_HEIGHT.test(s) && GRADIENT.test(s),
    )
    expect(offenders).toEqual([])
  })

  // Report de la revue de la 11.1 : la 11.1 a introduit la forme courte `min-h-(--size-…)`,
  // des usages antérieurs écrivaient encore `min-h-[var(--size-…)]`. Même CSS, deux
  // graphies — le balayage se fait ici, en une fois, et cette règle empêche le retour. Elle
  // couvre TOUTE lecture de token de taille (`min-w-` autant que `min-h-`) : la 11.3 a
  // trouvé les deux formes, il n'y a pas de raison d'en laisser survivre une.
  it.each(Object.keys(files))('%s writes size tokens in the short form only', (file) => {
    expect(stripComments(files[file] ?? '')).not.toMatch(/-\[var\(--size-/)
  })
})

describe('gabarits — insets rapatriés dans l\'hôte (Story 11.3, AC4)', () => {
  // « Un token décrit une INTENTION, jamais une POSITION » (integration-bmad-impeccable.md
  // §6). Ces quatre-là recopiaient la mise en page d'un écran : ils vivent désormais dans
  // l'écran qui les décrit, à côté du markup qu'ils mesurent.
  it('declares no popup inset token in main.css', () => {
    expect(css).not.toMatch(/--setup-popup-inset-/)
    expect(css).not.toMatch(/--game-popup-inset-/)
  })

  it.each(Object.keys(files))('%s names no popup inset token', (file) => {
    const text = stripComments(files[file] ?? '')
    expect(text).not.toMatch(/--setup-popup-inset-/)
    expect(text).not.toMatch(/--game-popup-inset-/)
  })
})

describe('gabarits — aucune redondance de classe (Story 11.3, AC6)', () => {
  // `main.css` pose déjà `button, [role="button"] { touch-action: manipulation; user-select:
  // none }` : le répéter sur un `<button>` ne fait rien. UNE occurrence reste, et doit
  // rester — la racine `<div>` de `PlayerPanel`, qui n'est ni l'un ni l'autre depuis la 10.4
  // (sans elle, un appui long sur le score sélectionne le texte : `PlayerPanel.test.ts`).
  it.each(Object.keys(files).filter((f) => !f.endsWith('PlayerPanel.vue')))(
    '%s repeats no touch-manipulation on a button',
    (file) => {
      expect(stripComments(files[file] ?? '')).not.toMatch(/touch-manipulation/)
    },
  )

  it('keeps the one occurrence that is not a button', () => {
    const panel = Object.entries(files).find(([f]) => f.endsWith('PlayerPanel.vue'))?.[1] ?? ''
    expect(stripComments(panel)).toMatch(/touch-manipulation/)
  })

  // Héritage du gabarit Vite, sans objet en paysage ≥ 1133 (le portrait et le téléphone
  // sont hors périmètre produit, décision de Nathan du 2026-09-11).
  it('drops the 320px floor inherited from the Vite template', () => {
    expect(css).not.toMatch(/min-width:\s*320px/)
  })
})
