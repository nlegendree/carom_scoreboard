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
// `KEY_CLASSES` est la seule chaîne de classes hors gabarit : elle compte comme un gabarit.
const shared = import.meta.glob<string>('../components/keyClasses.ts', {
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

  it('covers every template of src/ and the shared key classes', () => {
    expect(names.length).toBeGreaterThanOrEqual(20)
    expect(names.some((f) => f.endsWith('keyClasses.ts'))).toBe(true)
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
