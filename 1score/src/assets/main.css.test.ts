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

describe('main.css — contraste (Story 10.7)', () => {
  // Le ruban a été assombri pour que le texte BLANC qu'il porte tienne 4,95:1 (il était à
  // 4,17:1 en #E63946, sous le seuil 4,5:1 du texte courant). La valeur est verrouillée
  // ici : la reprendre en arrière rouvrirait la dette close par la 10.7.
  it('darkens the victory ribbon to a AA-compliant red', () => {
    expect(source).toContain('--color-victory-ribbon: #D0343F;')
    expect(source).toContain('--color-on-victory-ribbon: #FFFFFF;')
  })

  // ⚠️ `--color-victory-ribbon` et `--color-brand-red` valent désormais la MÊME couleur,
  // et restent DEUX tokens : deux rôles qui peuvent rediverger, et Nathan a demandé un
  // design system des couleurs plus tard, hors Epic 10. Ni fusion, ni `var()` de l'un
  // dans l'autre.
  it('keeps the two reds as two independent declarations', () => {
    expect(source).toContain('--color-brand-red: #D0343F;')
    expect(source).not.toContain('--color-victory-ribbon: var(--color-brand-red)')
    expect(source).not.toContain('--color-brand-red: var(--color-victory-ribbon)')
  })
})
