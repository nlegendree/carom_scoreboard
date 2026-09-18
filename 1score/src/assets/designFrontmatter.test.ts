import { describe, it, expect } from 'vitest'
// `server.fs.allow: ['..']` dans `vitest.config.ts` rend cet import possible : `DESIGN.md`
// vit à la RACINE DU DÉPÔT, hors de la racine Vite. Sans lui : `Error: Denied ID`.
import design from '../../../DESIGN.md?raw'
import {
  extractFrontmatter,
  readSection,
  roleNames,
  property,
  sizeAtWidth,
} from './designFrontmatter'

// Story 11.4 (AC5) : ce fichier verrouille les HYPOTHÈSES du parseur, pour que le jour où
// `DESIGN.md` cesse d'y répondre se voie en rouge et non en liste silencieusement vide —
// un miroir qui ne reflète plus rien est pire qu'un miroir absent.
const frontmatter = extractFrontmatter(design)

describe('lecture du frontmatter de DESIGN.md', () => {
  it('isole le bloc entre les deux premiers ---', () => {
    expect(frontmatter).toMatch(/^name: 1Score/)
    expect(frontmatter).not.toContain('# Design System: 1Score')
  })

  it('porte les sept sections que les tests de tokens consomment', () => {
    for (const section of [
      'colors',
      'typography',
      'tracking',
      'rounded',
      'shadows',
      'spacing',
      'components',
    ]) {
      expect(Object.keys(readSection(frontmatter, section)).length, section).toBeGreaterThan(0)
    }
  })

  it('jette sur une section absente plutôt que de rendre une liste vide', () => {
    expect(() => readSection(frontmatter, 'inexistante')).toThrow(/absente/)
  })

  it('lit les scalaires comme les objets', () => {
    // `colors` est plat, `typography` est un objet par rôle.
    expect(readSection(frontmatter, 'colors')['blanc-pur']).toBe('#FFFFFF')
    expect(property(frontmatter, 'typography', 'label', 'fontSize')).toBe('clamp(20px, 2vw, 38px)')
    expect(property(frontmatter, 'typography', 'label', 'fontWeight')).toBe('900')
  })

  it('rend les rôles dans l’ordre du document', () => {
    const roles = roleNames(frontmatter, 'typography')
    expect(roles.indexOf('score-1')).toBeLessThan(roles.indexOf('label'))
  })

  it('refuse un frontmatter à trois niveaux plutôt que de le tronquer', () => {
    const tordu = 'typography:\n  label:\n    fontSize: "10px"\n      trop: "profond"\n'
    expect(() => readSection(tordu, 'typography')).toThrow(/non lisible/)
  })

  describe('sizeAtWidth', () => {
    it('résout un clamp() en vw aux trois formats', () => {
      // `--text-stat` : clamp(14px, 1.2vw, 23px)
      expect(sizeAtWidth('clamp(14px, 1.2vw, 23px)', 1920)).toBeCloseTo(23, 2) // plafonné
      expect(sizeAtWidth('clamp(14px, 1.2vw, 23px)', 1180)).toBeCloseTo(14.16, 2)
      expect(sizeAtWidth('clamp(14px, 1.2vw, 23px)', 1133)).toBeCloseTo(14, 2) // plancher
    })

    it('lit une valeur en pixels nus', () => {
      expect(sizeAtWidth('12px', 1920)).toBe(12)
    })

    it('rend null sur une taille qui dépend du rendu (cqw, vh, min())', () => {
      expect(sizeAtWidth('clamp(24px, 10cqw, 80px)', 1920)).toBeNull()
      expect(sizeAtWidth('min(42vw, 40vh, 520px)', 1920)).toBeNull()
    })
  })
})
