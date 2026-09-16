import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas les
// types Node. ⚠️ `main.css?raw` ne rend le TEXTE que grâce à `test.css.include` dans
// `vitest.config.ts` (piège réglé en 10.7) ; les `.vue?raw` passent sans réglage.
import source from './main.css?raw'

// Story 11.1 (AC1, AC3) : `DESIGN.md` nomme les rôles, `main.css` les déclare, aucun
// gabarit n'écrit une taille ni un interlettrage en valeur arbitraire. happy-dom ne calcule
// aucun CSS : ce fichier verrouille la SOURCE, jamais le rendu — le rendu se vérifie au
// navigateur (captures de la fiche).
//
// Les trois listes recopient le frontmatter de DESIGN.md (`typography`, `tracking`,
// `spacing`) : c'est le miroir que ce test tient à jour, DANS LES DEUX SENS — un rôle de
// DESIGN.md absent de `main.css` rougit, un token de `main.css` absent d'ici aussi.

// Un rôle par entrée du frontmatter `typography`.
const TEXT_ROLES = [
  'score-1', 'score-2', 'score-3', 'score-4', 'score-more',
  'reprise', 'clock', 'series', 'adjust',
  'hero', 'title', 'label', 'stat', 'picto',
  'key-numeric', 'key-alpha', 'field-value', 'start-button',
]
// Parmi eux, ceux dont le `clamp()` se lit sur la largeur d'ÉCRAN (`vw`) — les autres sont
// relatifs à leur conteneur (`cqw`, `cqmin`) ou bornés par `min()`.
const VIEWPORT_CLAMPED_ROLES = [
  'reprise', 'adjust', 'hero', 'title', 'label', 'stat', 'picto',
  'key-numeric', 'key-alpha', 'field-value', 'start-button',
]
// Trois valeurs d'interlettrage, pas sept (frontmatter `tracking`).
const TRACKING_ROLES = ['title', 'label', 'stat']
// Tailles de boîte dérivées de la grille (frontmatter `spacing`, hors `base` et les pas
// `xs`…`2xl` qui sont les utilitaires numériques de Tailwind, et hors `clock-bleed`, porté
// par `--game-clock-bleed`).
const SIZE_ROLES = [
  'touch-target', 'sidebar', 'start-button', 'key-numeric', 'key-alpha',
  'field-min', 'field-max', 'tile-min',
  'popup-decision', 'popup-pad', 'popup-alpha', 'pad-min', 'alpha-min',
]

const declared = (namespace: string): string[] =>
  [...source.matchAll(new RegExp(`^\\s*--${namespace}-([a-z0-9-]+):`, 'gm'))].map((m) => m[1] ?? '')

const templates = import.meta.glob<string>('../**/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('main.css — échelle typographique (Story 11.1)', () => {
  it.each(TEXT_ROLES)('declares the --text-%s token', (role) => {
    expect(source).toMatch(new RegExp(`^\\s*--text-${role}:`, 'm'))
  })

  it.each(TRACKING_ROLES)('declares the --tracking-%s token', (role) => {
    expect(source).toMatch(new RegExp(`^\\s*--tracking-${role}:`, 'm'))
  })

  it.each(SIZE_ROLES)('declares the --size-%s token', (role) => {
    expect(source).toMatch(new RegExp(`^\\s*--size-${role}:`, 'm'))
  })

  // Le miroir dans l'autre sens : un token qui n'est pas dans DESIGN.md n'existe pas
  // (règle 7 de CLAUDE.md), et le token historique `--text-score` ne doit pas revenir.
  it('declares no --text-*, --tracking-* or --size-* token that DESIGN.md does not name', () => {
    expect(declared('text').sort()).toEqual([...TEXT_ROLES].sort())
    expect(declared('tracking').sort()).toEqual([...TRACKING_ROLES].sort())
    expect(declared('size').sort()).toEqual([...SIZE_ROLES].sort())
  })

  // ⚠️ `text-start` est l'utilitaire `text-align: start` de Tailwind : un rôle nommé `start`
  // ferait émettre les deux règles pour la même classe (payé à la revue de la 11.1).
  it('names no --text-* role after a Tailwind text utility', () => {
    expect(declared('text')).not.toContain('start')
    expect(declared('text')).not.toContain('center')
    expect(declared('text')).not.toContain('nowrap')
  })

  // Le plafond de chaque `clamp()` en `vw` s'atteint à 1920 px de large, jamais avant
  // 1280 (AC1) : avec un coefficient c en vw et un plafond max, il s'atteint à
  // max / c × 100 px. Chaque déclaration doit avoir la forme exacte `clamp(Npx, Cvw, Npx)` :
  // une autre graphie ne « sort » pas du contrôle, elle le fait échouer.
  it('reaches every viewport clamp() ceiling between 1280 and 1920 px wide', () => {
    const roles: string[] = []
    for (const line of source.match(/^\s*--text-[a-z0-9-]+:.*\bclamp\(.*vw.*$/gm) ?? []) {
      const parsed = line.match(/--text-([a-z0-9-]+): clamp\((\d+)px, ([\d.]+)vw, (\d+)px\);/)
      expect(parsed, `forme inattendue : ${line.trim()}`).not.toBeNull()
      const [, role = '', min = '', coefficient = '', max = ''] = parsed ?? []
      roles.push(role)
      expect(Number(min), role).toBeLessThan(Number(max))
      const reachedAt = (Number(max) * 100) / Number(coefficient)
      expect(reachedAt, role).toBeGreaterThanOrEqual(1280)
      expect(reachedAt, role).toBeLessThanOrEqual(1920)
    }
    expect(roles.sort()).toEqual([...VIEWPORT_CLAMPED_ROLES].sort())
  })
})

describe('gabarits — aucune valeur typographique hors échelle (Story 11.1)', () => {
  const files = Object.keys(templates)

  it('covers every template of src/', () => {
    expect(files.length).toBeGreaterThanOrEqual(19)
  })

  // Ni valeur arbitraire (`text-[…]`, `tracking-[…]`, `text-(--x)`, `[font-size:…]`), ni
  // utilitaire standard de Tailwind (`text-3xl`, `text-sm`, `tracking-widest`…) : une taille
  // en rem ne suit ni l'écran ni la grille. Seul `tracking-tight` (chiffres du pavé) est
  // admis, DESIGN.md le nomme.
  it.each(files)('%s writes no typographic value outside DESIGN.md', (file) => {
    const template = templates[file]
    expect(template).not.toMatch(/\b(text|tracking)-[[(]/)
    expect(template).not.toMatch(/\[(font-size|letter-spacing):/)
    expect(template).not.toMatch(/\btext-(xs|sm|base|lg|[2-9]?xl)\b/)
    expect(template).not.toMatch(/\btracking-(tighter|normal|wide|wider|widest)\b/)
  })
})
