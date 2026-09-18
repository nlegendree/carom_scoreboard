// Lecture du frontmatter normatif de `DESIGN.md` — Story 11.4 (AC5).
//
// POURQUOI. `tokens.test.ts` et `typography.test.ts` RECOPIAIENT à la main les listes de
// rôles que `DESIGN.md` déclare, puis les comparaient à `main.css`. Deux listes écrites par
// la même main ne font pas un miroir : renommer un rôle dans `DESIGN.md` sans toucher
// `main.css` restait vert. En les LISANT, le miroir devient vrai dans les deux sens.
//
// AUCUNE DÉPENDANCE YAML (contrainte de la story) : le frontmatter est plat — deux niveaux
// d'indentation, pas de liste, pas d'ancre, pas de bloc multiligne — et se lit en quelques
// lignes. Ce parseur ne prétend PAS lire du YAML : il lit CE frontmatter-là, et
// `designFrontmatter.test.ts` verrouille ses hypothèses pour qu'un jour où elles cessent
// d'être vraies se voie en rouge plutôt qu'en silence.
//
// Ce module n'est importé que par des tests. Aucune ligne d'application ne le référence,
// il ne peut donc pas entrer dans le bundle.

// Une entrée de second niveau : `rounded.tappable`, `typography.label`…
// La valeur est soit un scalaire (`rounded: { tappable: "8px" }`), soit un objet de
// propriétés (`typography: { label: { fontSize: "clamp(…)", fontWeight: 900 } }`).
export type FrontmatterEntry = string | Record<string, string>

export type FrontmatterSection = Record<string, FrontmatterEntry>

/** Isole le bloc entre les deux premiers `---` d'un document Markdown. */
export function extractFrontmatter(markdown: string): string {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)
  if (!match?.[1]) throw new Error('DESIGN.md : frontmatter introuvable entre deux `---`')
  return match[1]
}

// Retire les guillemets d'une valeur scalaire. Le frontmatter en pose sur les chaînes qui
// contiennent une virgule ou un `#` (`"clamp(20px, 2vw, 38px)"`, `"#FFFFFF"`) et pas sur
// les nombres (`fontWeight: 900`) : les deux formes se lisent ici.
const unquote = (value: string): string => value.replace(/^["'](.*)["']$/, '$1').trim()

/**
 * Lit une section de premier niveau (`colors`, `typography`, `tracking`, `rounded`,
 * `shadows`, `spacing`, `components`) et rend ses entrées de second niveau.
 *
 * Les clés sont rendues DANS L'ORDRE DU DOCUMENT : c'est celui que `DESIGN.md` donne à
 * lire, et le conserver rend les messages d'échec comparables d'un test à l'autre.
 */
export function readSection(frontmatter: string, section: string): FrontmatterSection {
  const lines = frontmatter.split(/\r?\n/)
  const start = lines.findIndex((line) => line === `${section}:`)
  if (start === -1) throw new Error(`DESIGN.md : section « ${section} » absente du frontmatter`)

  const out: FrontmatterSection = {}
  let current: string | null = null

  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '') continue
    // Une ligne non indentée termine la section : c'est la suivante.
    if (!line.startsWith(' ')) break

    const entry = /^ {2}([\w-]+):\s*(.*)$/.exec(line)
    if (entry) {
      const [, key = '', value = ''] = entry
      // `label:` sans valeur ouvre un objet ; `tappable: "8px"` est un scalaire.
      if (value === '') {
        current = key
        out[key] = {}
      } else {
        current = null
        out[key] = unquote(value)
      }
      continue
    }

    const property = /^ {4}([\w-]+):\s*(.*)$/.exec(line)
    if (property && current !== null) {
      const [, key = '', value = ''] = property
      ;(out[current] as Record<string, string>)[key] = unquote(value)
      continue
    }

    // Un troisième niveau d'indentation, une liste, un bloc `|` : le frontmatter a changé
    // de forme et ce parseur ne le lit plus. Mieux vaut le dire que rendre une liste
    // silencieusement incomplète — c'est exactement ce que l'AC5 cherche à empêcher.
    throw new Error(
      `DESIGN.md : ligne non lisible dans la section « ${section} » ` +
        `(le parseur n'accepte que deux niveaux d'indentation) : ${JSON.stringify(line)}`,
    )
  }

  return out
}

/** Noms des entrées d'une section, dans l'ordre du document. */
export function roleNames(frontmatter: string, section: string): string[] {
  return Object.keys(readSection(frontmatter, section))
}

/** Une propriété d'une entrée d'objet (`typography.label.fontSize`). */
export function property(
  frontmatter: string,
  section: string,
  role: string,
  name: string,
): string | undefined {
  const entry = readSection(frontmatter, section)[role]
  return typeof entry === 'object' ? entry[name] : undefined
}

/**
 * Évalue une taille de `DESIGN.md` à une largeur de fenêtre donnée, en pixels.
 *
 * Ne gère QUE `clamp(<min>px, <n>vw, <max>px)` et les valeurs en pixels nus — les seules
 * formes qu'un test peut résoudre depuis la source. Une taille en `cqw` / `cqmin` dépend
 * d'un conteneur dont la largeur n'existe qu'au rendu, une taille en `vh` de la hauteur :
 * elles rendent `null`, et l'appelant décide (en général : sortir du périmètre du test,
 * la mesure appartient alors à la passe navigateur).
 */
export function sizeAtWidth(size: string, viewportWidth: number): number | null {
  const plain = /^(\d+(?:\.\d+)?)px$/.exec(size.trim())
  if (plain) return Number(plain[1])

  const clamp = /^clamp\(\s*(\d+(?:\.\d+)?)px\s*,\s*(\d+(?:\.\d+)?)vw\s*,\s*(\d+(?:\.\d+)?)px\s*\)$/.exec(
    size.trim(),
  )
  if (!clamp) return null
  const [, min = '0', vw = '0', max = '0'] = clamp
  const preferred = (Number(vw) / 100) * viewportWidth
  return Math.min(Math.max(preferred, Number(min)), Number(max))
}
