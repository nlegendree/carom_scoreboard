import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas les
// types Node. ⚠️ `main.css?raw` ne rend le TEXTE que grâce à `test.css.include` dans
// `vitest.config.ts` (piège réglé en 10.7) ; les `.vue?raw` passent sans réglage.
import source from './main.css?raw'
// `server.fs.allow: ['..']` dans `vitest.config.ts` rend cet import possible : `DESIGN.md`
// vit à la RACINE DU DÉPÔT, hors de la racine Vite (Story 11.4, AC5).
import design from '../../../DESIGN.md?raw'
import { extractFrontmatter, roleNames, property, sizeAtWidth } from './designFrontmatter'

// Story 11.1 (AC1, AC3) : `DESIGN.md` nomme les rôles, `main.css` les déclare, aucun
// gabarit n'écrit une taille ni un interlettrage en valeur arbitraire. happy-dom ne calcule
// aucun CSS : ce fichier verrouille la SOURCE, jamais le rendu — le rendu se vérifie au
// navigateur (captures de la fiche).
//
// Story 11.4 (AC5) : les trois listes sont DÉRIVÉES du frontmatter de `DESIGN.md`, elles ne
// le recopient plus. Deux listes écrites par la même main ne faisaient pas un miroir :
// renommer un rôle dans `DESIGN.md` sans toucher `main.css` restait vert. Le miroir tient
// maintenant DANS LES DEUX SENS pour de bon — un rôle de `DESIGN.md` absent de `main.css`
// rougit, un token de `main.css` absent de `DESIGN.md` aussi.
const frontmatter = extractFrontmatter(design)

// Un rôle par entrée du frontmatter `typography`.
const TEXT_ROLES = roleNames(frontmatter, 'typography')

// Parmi eux, ceux dont la taille se RÉSOUT sur la largeur d'écran : un `clamp(px, vw, px)`
// et rien d'autre. L'exclusion SE DÉRIVE de la forme écrite dans `DESIGN.md` — un `cqw` /
// `cqmin` dépend d'un conteneur, un `min(42vw, 40vh, 520px)` dépend aussi de la HAUTEUR :
// ni l'un ni l'autre ne se vérifie depuis la source, et `sizeAtWidth` le dit en rendant
// `null`. C'est le parseur qui tranche, pas une liste tenue à la main à côté.
const VIEWPORT_CLAMPED_ROLES = TEXT_ROLES.filter(
  (role) => sizeAtWidth(property(frontmatter, 'typography', role, 'fontSize') ?? '', 1920) !== null,
)

// Les valeurs d'interlettrage du frontmatter `tracking`.
const TRACKING_ROLES = roleNames(frontmatter, 'tracking')

// Tailles de boîte dérivées de la grille (frontmatter `spacing`). Deux exclusions, qui ont
// chacune leur raison. ⚠️ Elles sont ÉCRITES À LA MAIN — contrairement à ce que cette note
// affirmait, rien ne les dérive : « pas de `--size-*` » n'est pas lisible dans le
// frontmatter. Retirer `spacing: md` de `DESIGN.md` laissait donc 238 tests verts (revue du
// 2026-09-18). Le contrôle « chaque nom exclu existe encore » ci-dessous referme ce trou
// sans prétendre dériver l'indérivable : si `DESIGN.md` perd une de ces entrées, on rougit.
// Les deux raisons :
//   — `base` et les pas `xs`…`2xl` sont les utilitaires numériques de Tailwind, pas des
//     tailles de boîte nommées : ils ne produisent aucun `--size-*` ;
//   — `column-gutter` est porté par `--game-column-gutter` (géométrie couplée du scoreboard,
//     `CLAUDE.md` §10), pas par le namespace `--size-*` : ce n'est pas une taille de boîte
//     qu'un gabarit lit en `w-(--size-…)`, mais une distance que DEUX fichiers doivent lire
//     identique. ⚠️ `clock-bleed` a rejoint cette liste en 11.5 puis en est sorti le jour
//     même : le débordement du chrono est ABANDONNÉ (Nathan, au rendu), le token est retiré
//     de `DESIGN.md` comme de `main.css`, et le garder ici exigerait de le ressusciter.
const SPACING_STEPS = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
const SPACING_EXCLUDED = [...SPACING_STEPS, 'column-gutter']
const SIZE_ROLES = roleNames(frontmatter, 'spacing').filter(
  (role) => !SPACING_EXCLUDED.includes(role),
)

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

  // ⚠️ L'exclusion elle-même est écrite à la main : sans ce contrôle, retirer `spacing: md`
  // de `DESIGN.md` ne rougissait nulle part (l'entrée ne produit aucun `--size-*`, donc le
  // miroir ne la voit pas non plus). On exige que chaque nom exclu EXISTE ENCORE : le trou
  // se referme sans prétendre dériver ce qui ne se dérive pas (revue du 2026-09-18).
  it.each(SPACING_EXCLUDED)('keeps the excluded spacing entry %s in DESIGN.md', (role) => {
    expect(
      roleNames(frontmatter, 'spacing'),
      `« ${role} » est exclu de SIZE_ROLES par ce test, mais DESIGN.md ne le déclare plus : ` +
        `retirer l'exclusion, ou restaurer l'entrée`,
    ).toContain(role)
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
