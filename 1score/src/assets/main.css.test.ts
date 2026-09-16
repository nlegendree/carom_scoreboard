import { describe, it, expect } from 'vitest'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas les
// types Node, et il ne faut pas les y ajouter pour du code navigateur. Même motif que
// `GameSummary.test.ts`, qui lit son propre composant pour prouver une absence.
import source from './main.css?raw'

// ⚠️ happy-dom ne compile ni ne calcule aucun CSS : ce fichier verrouille le TEXTE de la
// règle, pas son effet. L'effet réel se vérifie au navigateur, `prefers-reduced-motion`
// émulé (Story 10.7, Task 7).
describe('main.css — garde prefers-reduced-motion', () => {
  const guard = (() => {
    const start = source.indexOf('@media (prefers-reduced-motion: reduce)')
    if (start === -1) return ''
    // Le bloc s'arrête à sa propre accolade fermante, colonne 0 — les règles qu'il
    // contient sont toutes indentées.
    const end = source.indexOf('\n}', start)
    return end === -1 ? source.slice(start) : source.slice(start, end + 2)
  })()

  it('declares the guard block', () => {
    expect(guard).not.toBe('')
  })

  // Le piège central de la story : les keyframes du flash vont de `opacity: 1` à `0` en
  // `forwards`. Sans animation, son état au repos est donc `opacity: 1` — un voile noir
  // PERMANENT peint sur la valeur de série, pour exactement les utilisateurs qu'on sert.
  it('neutralises the input flash by opacity, not by animation alone', () => {
    expect(guard).toContain('animate-input-flash')
    expect(guard).toContain('opacity: 0')
  })

  it('cuts the cap rejection pulse', () => {
    expect(guard).toContain('animate-input-reject')
  })

  // Décision 3 de Nathan : ces deux-là portent une INFORMATION qu'aucun autre élément ne
  // donne — le temps restant, et le fait que le score va se valider seul et changer le
  // tour. Elles survivent à `reduce`.
  it('leaves the shot clock and the auto-validation countdown alone', () => {
    expect(guard).not.toContain('animate-input-countdown')
    expect(guard).not.toContain('stroke-dashoffset')
  })

  // Une garde attrape-tout (`*, *::before, *::after { animation-duration: 0.01ms }`)
  // emporterait précisément les deux animations conservées.
  it('never uses a catch-all guard', () => {
    expect(guard).not.toContain('*,')
    expect(guard).not.toContain('animation-duration')
    expect(guard).not.toContain('transition-duration')
  })
})

describe('main.css — palette arbitrée (Story 11.2)', () => {
  // Un seul rouge profond (décision de Nathan au rendu, 2026-09-16) : le ruban de victoire lit
  // `--color-brand-red`, à #D0343F depuis la passe contraste de la 10.7 (blanc 4,95:1). Le
  // second token de même valeur est supprimé ; un rouge nouveau repasse par DESIGN.md.
  it('keeps one deep red only, AA-compliant under white', () => {
    expect(source).toContain('--color-brand-red: #D0343F;')
    expect(source).not.toMatch(/^\s*--color-victory-ribbon:/m)
    expect(source).not.toMatch(/^\s*--color-on-victory-ribbon:/m)
  })

  // Modèle Cueuny : deux niveaux de marine et rien d'autre en fond — ni dégradé, ni noir pur,
  // ni token à part pour la barre latérale ou le disque du chrono (ils SONT le niveau 0).
  it('paints two levels of navy and nothing else behind the screens', () => {
    expect(source).toContain('--color-bg: #1E2438;')
    expect(source).toContain('--color-bg-raised: #272E49;')
    for (const gone of ['--gradient-bg', '--gradient-panel', '--color-sidebar', '--color-shot-clock-face']) {
      expect(source).not.toMatch(new RegExp(`^\\s*${gone}:`, 'm'))
    }
  })

  // Bleu roi sur tous les CTA bleus et les tuiles, rouge saturé sur DÉMARRER (Nathan, passe
  // de fin de la 11.2, six candidats chacun). Le bleu drap #0573BB de l'Epic 10 et son token
  // `--color-cloth` sont partis avec lui.
  it('paints the CTAs in royal blue and DÉMARRER in a saturated red of its own', () => {
    expect(source).toContain('--gradient-blue: linear-gradient(160deg, #3B82F6 0%, #1D4ED8 100%);')
    expect(source).toContain('--gradient-red: linear-gradient(160deg, #F04553 0%, #C41F2C 100%);')
    expect(source).not.toMatch(/^\s*--color-cloth:/m)
  })

  // Saira, auto-hébergée (FR45, NFR13) : deux @font-face variables (latin, latin-ext), la
  // pile en token `--font-sans` que `:root` lit, et TOUTE `url(` du fichier sous `./fonts/`
  // (ni `http(s):`, ni `//` relatif au protocole, ni `@import url(…)`).
  it('self-hosts Saira as the product typeface, with no network resource', () => {
    expect(source.match(/@font-face \{[^}]*font-family: 'Saira'/g)).toHaveLength(2)
    expect(source).toContain("src: url('./fonts/Saira-latin.woff2') format('woff2');")
    expect(source).toContain("src: url('./fonts/Saira-latin-ext.woff2') format('woff2');")
    expect(source).toContain("--font-sans: 'Saira', system-ui, Avenir, Helvetica, Arial, sans-serif;")
    expect(source).toMatch(/^:root \{\n  font-family: var\(--font-sans\);/m)
    const urls = [...source.matchAll(/url\(\s*['"]?([^'")]+)/g)].map((m) => m[1] ?? '')
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.filter((u) => !u.startsWith('./fonts/'))).toEqual([])
    expect(source).not.toMatch(/@import\s+url\(/)
  })

  // Le bleu accent est retiré : l'anneau de focus est le rouge vif, déjà le signal « visé »
  // du produit (tour actif, champ ciblé).
  it('focuses in the vivid red, the accent blue being gone', () => {
    expect(source).toMatch(/button:focus-visible \{\s*outline: 4px solid var\(--color-turn-active\);/)
    expect(source).not.toMatch(/^\s*--color-accent:/m)
  })
})
