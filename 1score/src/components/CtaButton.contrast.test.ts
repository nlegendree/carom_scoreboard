import { describe, it, expect } from 'vitest'
import cta from './CtaButton.vue?raw'
import css from '../assets/main.css?raw'
import design from '../../../DESIGN.md?raw'
import { extractFrontmatter, property, sizeAtWidth } from '../assets/designFrontmatter'

// ═══════════════════════════════════════════════════════════════════════════════════════
// Story 11.4 (AC4) — LE CONTRASTE DES SIX CTA, CALCULÉ SUR LEUR SURFACE RÉELLE.
//
// POURQUOI CE TEST EXISTE, alors que l'AC4 voulait confier la mesure au détecteur.
// La mutation exigée par l'AC4 a été jouée le 2026-09-17 : les deux P1 de
// `design-system-audit-2026-09-15.md` ont été réintroduits par surcharge CSS, et le
// détecteur N'A RIEN SIGNALÉ. La cause a été isolée par quatre essais successifs sur la
// même page (relevé complet dans la fiche 11.4, Dev Agent Record) :
//
//   A. dégradé d'origine, libellé 14 px/700 (3,68:1 réel)        → rien
//   B. FOND PLEIN posé sur le <button>, même libellé             → rien
//   C. fond plein posé sur le <span> qui PORTE le texte          → DÉTECTÉ, 3,5:1
//   D. dégradé posé sur le <span> qui PORTE le texte             → DÉTECTÉ, 3,5:1
//
// Ce n'est donc pas le dégradé : la règle `low-contrast` ne résout le fond que sur
// l'élément qui porte le texte, et NE REMONTE PAS aux ancêtres. Or `CtaButton` met le
// dégradé sur le `<button>` et le libellé dans le `<slot />` : le détecteur voit un fond
// transparent et passe son chemin. Il est, par construction, AVEUGLE AU LIBELLÉ DE CHACUN
// DES SIX CTA du produit — c'est-à-dire à tout ce que l'AC4 lui demandait de surveiller.
//
// Un garde-fou qui ne casse pas quand on casse le code ne prouve rien (règle instituée en
// 10.7). Le calcul est donc refait ICI, depuis la source, sans dépendance nouvelle : les
// stops de dégradé viennent de `main.css`, les tailles et graisses du frontmatter de
// `DESIGN.md` (AC5, même source unique), et le seuil WCAG s'applique aux trois formats du
// produit. Ce test attrape ce que le détecteur laisse passer ; il ne le remplace pas.
//
// ⚠️ happy-dom ne calcule aucun CSS : on ne lit pas un rendu, on évalue la SOURCE. C'est
// exactement pourquoi `sizeAtWidth` refuse les tailles en `cqw` — une taille qui dépend
// d'un conteneur ne se vérifie qu'au navigateur.
// ═══════════════════════════════════════════════════════════════════════════════════════

// Les trois formats du produit (`CLAUDE.md` §9), paysage uniquement.
const VIEWPORTS = [
  { name: '1920×1080 (écran 21,5″)', width: 1920 },
  { name: '1180×733 (iPad 11″)', width: 1180 },
  { name: '1133×744 (iPad mini)', width: 1133 },
]

// WCAG 2.1 §1.4.3 : « grand texte » = ≥ 24 px, ou ≥ 18,66 px en gras (≥ 700). Seuil 3:1
// pour le grand texte, 4,5:1 sinon. C'est le basculement de ce seuil — et non un changement
// de couleur — qui a fermé le P1 des CTA de réglage en 11.1, en montant leur libellé de
// `stat` à `label`.
const LARGE_PX = 24
const LARGE_BOLD_PX = 18.66
const BOLD = 700

const threshold = (px: number, weight: number): number =>
  px >= LARGE_PX || (px >= LARGE_BOLD_PX && weight >= BOLD) ? 3 : 4.5

const channel = (value: number): number => {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

const contrast = (a: [number, number, number], b: [number, number, number]): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const hex = (value: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value.trim())
  if (!m) throw new Error(`couleur illisible : ${value}`)
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)]
}

// --- Ce que la source déclare -----------------------------------------------------------

const frontmatter = extractFrontmatter(design)

// Les stops d'un `--gradient-*` de `main.css`. On prend TOUS les arrêts colorés : le texte
// court sur toute la hauteur du bouton, et c'est le stop le plus clair qui décide — un
// dégradé qui traverse le seuil en son milieu échoue (constat §6 de l'audit).
function gradientStops(token: string): [number, number, number][] {
  const line = new RegExp(`^\\s*--gradient-${token}:\\s*([^;]+);`, 'm').exec(css)
  if (!line?.[1]) throw new Error(`--gradient-${token} absent de main.css`)
  const stops = line[1].match(/#[0-9a-fA-F]{6}/g)
  if (!stops?.length) throw new Error(`--gradient-${token} : aucun arrêt hexadécimal lisible`)
  return stops.map(hex)
}

// Encres possibles d'un CTA. Le produit n'en utilise qu'une (`text-white`) ; la table
// existe pour qu'une encre nouvelle soit un ajout VISIBLE et non un silence.
const INK: Record<string, [number, number, number]> = { white: [255, 255, 255] }

interface Variant {
  name: string
  gradient: string
  ink: string
  role: string
  weight: number
}

// ── L'EXCEPTION MESURÉE ────────────────────────────────────────────────────────────────
// La règle par défaut de ce test est CONSERVATRICE : le libellé doit tenir le seuil contre
// l'arrêt LE PLUS CLAIR de son dégradé, donc où qu'il se pose sur le bouton. La tenir
// dispense de savoir où le texte tombe, et c'est ce qui la rend robuste : une ligne de plus
// dans un libellé déplace le texte sans prévenir.
//
// Une variante peut y déroger si — et seulement si — le fond sous son libellé a été MESURÉ
// au navigateur, aux trois formats, et que la mesure est écrite ici avec sa date. C'est la
// même discipline que les `ignores --reason` de l'AC3 : un écart sans sa raison est une
// dette silencieuse.
//
// ⚠️ L'exception est à RETRAIT AUTOMATIQUE : le test vérifie qu'elle est encore NÉCESSAIRE
// (c'est-à-dire que la variante échoue bien la règle conservatrice). Le jour où quelqu'un
// monte `pass` en `label`, l'exception devient inutile et le test le DIT, au lieu de la
// laisser dormir là pour toujours.
interface MeasuredException {
  ratio: number
  where: string
  measuredOn: string
  why: string
}

const MEASURED_ON_SURFACE: Record<string, MeasuredException> = {
  pass: {
    // Fond échantillonné au pixel sous le libellé, `?scene=07-scoreboard-jds`, DPR 1.
    // Médian `#2a64e5` : 5,18:1 à 1133 et 1180, 5,25:1 à 1920. On retient le pire des trois.
    ratio: 5.18,
    where: '72,2 % de la hauteur du bouton (et non en son milieu)',
    measuredOn: '2026-09-17',
    why:
      "`PASSER LE TOUR` est en rôle `stat` (14 px sur tablette) : il n'est pas « grand texte » " +
      'et doit donc tenir 4,5:1, que le stop clair du dégradé bleu (#3B82F6, 3,68:1) ne tient ' +
      'pas. Report de la revue de code de la 11.2, tranché ici par la MESURE : le picto se ' +
      'pose au-dessus du libellé, ce qui repousse le texte à 72,2 % de la hauteur, soit dans ' +
      'la partie sombre du dégradé à 160° — 5,18:1, au-dessus du seuil aux trois formats. ' +
      "Aucune montée en `label` n'est due : la condition de l'AC4 (« s'il ne tient pas le " +
      'seuil ») n\'est pas remplie. La valeur annoncée par `DESIGN.md` › Buttons ' +
      '(« 4,95:1 au milieu du dégradé ») est corrigée par cette mesure.',
  },
}

// Lecture de la table `VARIANT_CLASSES` de `CtaButton.vue`. On lit la SOURCE et non un
// rendu : c'est elle qui porte la décision, et un rendu happy-dom ne calculerait rien.
function readVariants(): Variant[] {
  const table = /const VARIANT_CLASSES[^{]*\{([\s\S]*?)\n\}/.exec(cta)
  if (!table?.[1]) throw new Error('VARIANT_CLASSES introuvable dans CtaButton.vue')

  const out: Variant[] = []
  // Une entrée = `nom:` puis sa chaîne de classes, éventuellement sur la ligne suivante.
  for (const entry of table[1].matchAll(/^ {2}([a-z]+):\s*\n?\s*'([^']+)'/gm)) {
    const [, name = '', classes = ''] = entry
    const gradient = /bg-\(image:--gradient-([a-z]+)\)/.exec(classes)?.[1]
    const ink = /\btext-(white)\b/.exec(classes)?.[1]
    // Le rôle typographique est le `text-<x>` qui n'est ni une encre ni un utilitaire
    // d'alignement : on le reconnaît à sa présence dans le frontmatter de `DESIGN.md`.
    const role = [...classes.matchAll(/\btext-([a-z][a-z0-9-]*)\b/g)]
      .map((m) => m[1]!)
      .find((candidate) => property(frontmatter, 'typography', candidate, 'fontSize') !== undefined)
    const weight = /\bfont-black\b/.test(classes) ? 900 : /\bfont-bold\b/.test(classes) ? 700 : 400

    if (!gradient || !ink || !role) continue
    out.push({ name, gradient, ink, role, weight })
  }
  return out
}

const VARIANTS = readVariants()

describe('CtaButton — contraste du libellé sur le fond réel (Story 11.4, AC4)', () => {
  it('lit les six variantes de la table, aucune de moins', () => {
    // Si une variante cesse d'être lue, ce test la couvre silencieusement : le compte est
    // donc verrouillé, et `DESIGN.md` › Components › Buttons parle bien de six.
    expect(VARIANTS.map((v) => v.name).sort()).toEqual(
      ['accent', 'bar', 'neutral', 'pass', 'setup', 'start'].sort(),
    )
  })

  it('résout la taille de chaque rôle aux trois formats', () => {
    for (const variant of VARIANTS) {
      const size = property(frontmatter, 'typography', variant.role, 'fontSize') ?? ''
      for (const { width, name } of VIEWPORTS) {
        expect(sizeAtWidth(size, width), `${variant.name} @ ${name}`).not.toBeNull()
      }
    }
  })

  it('ne garde aucune exception mesurée devenue inutile', () => {
    // Une exception qui n'est plus nécessaire est une dette : elle dispense d'une règle que
    // le code respecte désormais, et masquerait une régression future.
    for (const [name, exception] of Object.entries(MEASURED_ON_SURFACE)) {
      const variant = VARIANTS.find((v) => v.name === name)
      expect(variant, `exception « ${name} » : cette variante n'existe plus`).toBeDefined()

      const size = property(frontmatter, 'typography', variant!.role, 'fontSize') ?? ''
      const worst = Math.min(...gradientStops(variant!.gradient).map((s) => contrast(INK[variant!.ink]!, s)))
      const failsSomewhere = VIEWPORTS.some(
        ({ width }) => worst < threshold(sizeAtWidth(size, width)!, variant!.weight),
      )
      expect(
        failsSomewhere,
        `exception « ${name} » (${exception.measuredOn}) : la variante tient maintenant la ` +
          `règle conservatrice à tous les formats — retirer l'exception de MEASURED_ON_SURFACE`,
      ).toBe(true)
    }
  })

  // Le cœur : chaque variante, à chaque format, contre le pire arrêt de son dégradé —
  // sauf exception mesurée, qui est alors confrontée à SA mesure.
  for (const variant of VARIANTS) {
    const exception = MEASURED_ON_SURFACE[variant.name]
    const label = exception
      ? `variante « ${variant.name} » (${variant.role}, ${variant.weight}) — mesurée sur surface`
      : `variante « ${variant.name} » (${variant.role}, ${variant.weight})`

    describe(label, () => {
      const size = property(frontmatter, 'typography', variant.role, 'fontSize') ?? ''
      const stops = gradientStops(variant.gradient)
      const ink = INK[variant.ink]!

      for (const { name, width } of VIEWPORTS) {
        it(`tient le seuil WCAG AA en ${name}`, () => {
          const px = sizeAtWidth(size, width)!
          const need = threshold(px, variant.weight)

          if (exception) {
            expect(
              exception.ratio,
              `${variant.name} : ${px.toFixed(1)}px/${variant.weight}, fond mesuré à ` +
                `${exception.where} = ${exception.ratio}:1, seuil ${need}:1 — ${exception.why}`,
            ).toBeGreaterThanOrEqual(need)
            return
          }

          for (const stop of stops) {
            const ratio = contrast(ink, stop)
            const stopHex = `#${stop.map((c) => c.toString(16).padStart(2, '0')).join('')}`
            expect(
              ratio,
              `${variant.name} : ${px.toFixed(1)}px/${variant.weight} sur ${stopHex} ` +
                `= ${ratio.toFixed(2)}:1, seuil ${need}:1`,
            ).toBeGreaterThanOrEqual(need)
          }
        })
      }
    })
  }
})
