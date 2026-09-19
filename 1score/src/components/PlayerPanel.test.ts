import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
// `?raw` (typé par vite/client) plutôt que node:fs : tsconfig.app.json n'expose pas
// les types Node à `src/`, et on ne les y ajoute pas pour un seul test.
import source from './PlayerPanel.vue?raw'
import PlayerPanel from './PlayerPanel.vue'
import type { Player } from '../types/game'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return { name: 'MICHEL', score: 0, color: 'white', targetScore: 0, ...overrides }
}

function mountPanel(player: Player, active = false) {
  return mount(PlayerPanel, { props: { player, active } })
}

describe('PlayerPanel', () => {
  // La distance appartient au joueur (handicap) : le panneau lit celle de SON joueur.
  it('renders the player name, the score and the target score of its own player', () => {
    const wrapper = mountPanel(makePlayer({ name: 'MICHEL', score: 42, targetScore: 40 }))

    expect(wrapper.text()).toContain('MICHEL')
    expect(wrapper.text()).toContain('42')
    expect(wrapper.find('[data-testid="target-score"]').text()).toBe('40')
  })

  // Distance libre : rien à lire, pas même un tiret ou un zéro (NFR12).
  it('leaves the target score slot empty when the player has no distance', () => {
    const wrapper = mountPanel(makePlayer({ score: 42, targetScore: 0 }))

    expect(wrapper.find('[data-testid="target-score"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('42')
  })

  // Deux distances dissociées ne doivent pas s'afficher l'une à la place de l'autre.
  it('never shows the other player distance', () => {
    const white = mountPanel(makePlayer({ targetScore: 100 }))
    const yellow = mountPanel(makePlayer({ color: 'yellow', targetScore: 80 }))

    expect(white.find('[data-testid="target-score"]').text()).toBe('100')
    expect(yellow.find('[data-testid="target-score"]').text()).toBe('80')
  })

  it('renders each ball as a full colour block with readable text', () => {
    const white = mountPanel(makePlayer({ color: 'white' }))
    expect(white.classes()).toContain('bg-player-white')
    expect(white.classes()).toContain('text-on-player-white')

    const yellow = mountPanel(makePlayer({ color: 'yellow' }))
    expect(yellow.classes()).toContain('bg-player-yellow')
    expect(yellow.classes()).toContain('text-on-player-yellow')
  })

  // ⚠️ Le liseré est un OVERLAY, pas un `ring` sur la racine : une ombre interne se peint
  // sous les enfants, et le bandeau opaque du haut l'effaçait sur 22 % de la carte (défaut
  // relevé à la passe navigateur de la 10.4, invisible en test — happy-dom ne calcule aucun
  // CSS). Il doit encadrer la carte ENTIÈRE, bandeau compris.
  it('frames the active player with a turn ring drawn over every zone', () => {
    const active = mountPanel(makePlayer(), true)
    const ring = active.find('[data-testid="turn-ring"]')

    expect(ring.exists()).toBe(true)
    expect(ring.classes()).toContain('ring-8')
    expect(ring.classes()).toContain('ring-turn-active')
    expect(ring.classes()).toContain('absolute')
    expect(ring.classes()).toContain('inset-0')
    // Story 11.5 (Nathan, au rendu, 2026-09-19) : le liseré porte le MÊME rayon que la carte.
    // Sans lui, seul son bord extérieur s'arrondissait — rogné par l'`overflow-hidden` de la
    // carte — et son bord intérieur restait à angle vif. Un `ring` inset suit le rayon de
    // l'élément qui le porte : encore faut-il que cet élément en ait un.
    expect(ring.classes()).toContain('rounded-block')
    // Rendu APRÈS les zones : c'est ce qui le met au-dessus des aplats opaques.
    expect(ring.element.previousElementSibling).toBe(
      active.find('[data-testid="score-minus"]').element.parentElement,
    )
    // ⚠️ `z-10` et non `z-20` : le débordement du chrono (`z-20`) doit passer DEVANT lui
    // et le masquer, son demi-anneau prenant le relais autour du disque. L'ordre est forcé
    // par ces deux z-index explicites — le contexte d'empilement de `@container` ne
    // suffisait pas, le liseré droit restait visible en travers du disque.
    expect(ring.classes()).toContain('z-10')

    const inactive = mountPanel(makePlayer(), false)
    expect(inactive.find('[data-testid="turn-ring"]').exists()).toBe(false)
    expect(inactive.classes()).not.toContain('ring-8')
  })
})

// --- Story 10.4 : carte en QUATRE zones (bandeau / score géant / MOY · SÉRIE / pied) ---

describe('PlayerPanel — les quatre zones de la carte', () => {
  // Le score doit être le plus gros possible : plus aucun pavé dans la carte (Story 1.5).
  it('holds no numeric pad any more', () => {
    const wrapper = mountPanel(makePlayer())

    expect(wrapper.findComponent({ name: 'NumericPad' }).exists()).toBe(false)
    expect(wrapper.find('[data-testid="digit-5"]').exists()).toBe(false)
  })

  // Bandeau au modèle Billiboard (1re passe de rendu, Nathan) : ligne 1 nom | distance,
  // ligne 2 restant | MOY · SÉRIE. TOUT tient dans le bandeau, y compris les statistiques,
  // qui remontent de sous le score.
  it('puts the name, the distance, the remaining count AND the statistics in the top band', () => {
    const wrapper = mount(PlayerPanel, {
      props: {
        player: makePlayer({ name: 'MICHEL', score: 12, targetScore: 100 }),
        active: false,
        average: 8 / 3,
        bestSeries: 5,
      },
    })

    const band = wrapper.find('[data-testid="panel-header"]')
    expect(band.text()).toContain('MICHEL')
    expect(band.find('[data-testid="target-score"]').text()).toBe('100')
    expect(band.find('[data-testid="remaining-score"]').text()).toBe('88')
    expect(band.find('[data-testid="average"]').text()).toBe('2.667')
    expect(band.find('[data-testid="best-series"]').text()).toBe('5')
    expect(band.find('[data-testid="score"]').exists()).toBe(false)
  })

  // La barre de statistiques qui vivait sous le score est SUPPRIMÉE (1re passe de rendu) :
  // son aplat gris coupait la carte en deux pour trois valeurs secondaires.
  it('holds no statistics band under the score any more', () => {
    const wrapper = mountPanel(makePlayer({ score: 8 }))
    const stats = wrapper.find('[data-testid="panel-stats"]')

    expect(stats.exists()).toBe(true)
    expect(wrapper.find('[data-testid="panel-header"] [data-testid="panel-stats"]').exists()).toBe(
      true,
    )
    expect(stats.classes()).not.toContain('bg-black/8')
  })

  // Modèle Billiboard : la distance et le restant sont des NOMBRES NUS. Les mots
  // « DISTANCE » et « RESTANT » encombraient un bandeau qui doit se lire d'un coup d'œil.
  it('shows the distance and the remaining count as bare numbers, with no label', () => {
    const wrapper = mountPanel(makePlayer({ name: 'MICHEL', score: 12, targetScore: 100 }))
    const band = wrapper.find('[data-testid="panel-header"]')

    expect(band.text()).not.toContain('DISTANCE')
    expect(band.text()).not.toContain('RESTANT')
    // MOY et SÉRIE gardent le leur, comme `AVG` et `HR` sur la référence.
    expect(band.text()).toContain('MOY')
    expect(band.text()).toContain('SÉRIE')
  })

  // Convention des fédérations de billard : moyenne générale à 3 décimales.
  it('always shows three decimals on the average', () => {
    const wrapper = mount(PlayerPanel, {
      props: { player: makePlayer(), active: false, average: 2, bestSeries: 0 },
    })

    expect(wrapper.find('[data-testid="average"]').text()).toBe('2.000')
  })

  // Le nom est le SEUL élément élastique : quand la place manque, il passe sur deux lignes
  // puis s'ellipse — jamais une valeur chiffrée, qui deviendrait fausse à la lecture.
  it('lets the name wrap onto two lines then ellipse, never the figures', () => {
    const wrapper = mountPanel(makePlayer({ name: 'JEAN-CHRISTOPHE', targetScore: 100 }))

    const name = wrapper.find('[data-testid="panel-name"]')
    expect(name.classes()).toContain('line-clamp-2')
    expect(name.classes()).toContain('min-w-0')
    expect(wrapper.find('[data-testid="target-score"]').classes()).toContain('shrink-0')
  })

  // Le score occupe la carte : sa taille suit le nombre de chiffres, sinon un total à
  // trois chiffres déborderait de la largeur du panneau (40 % de l'écran).
  it('shrinks the score type as digits are added', () => {
    const oneDigit = mountPanel(makePlayer({ score: 7 }))
    const threeDigits = mountPanel(makePlayer({ score: 123 }))

    const sizeOf = (w: ReturnType<typeof mountPanel>) =>
      w
        .find('[data-testid="score"]')
        .classes()
        .find((c) => c.startsWith('text-score-'))

    expect(sizeOf(oneDigit)).toBeDefined()
    expect(sizeOf(threeDigits)).toBeDefined()
    expect(sizeOf(oneDigit)).not.toBe(sizeOf(threeDigits))
  })

  // Revue de la 11.5 (décision de Nathan, 2026-09-19) : la gouttière intérieure qui réservait
  // la place de l'anneau débordant (AC16 de la 10.4) est RETIRÉE avec le débordement. Le
  // bandeau et la zone de score ont le même retrait des deux côtés : une réserve qui
  // reviendrait décentrerait de nouveau nom et score vers l'extérieur.
  it('pads its band and score zone symmetrically, with no inner gutter', () => {
    const card = mount(PlayerPanel, { props: { player: makePlayer(), active: false } })

    for (const id of ['panel-header', 'score-zone']) {
      const classes = card.find(`[data-testid="${id}"]`).classes()
      expect(classes).toContain('px-3')
      expect(classes.filter((c) => /^p[lr]-/.test(c))).toEqual([])
    }
  })

  // Story 11.5 (AC3) : la carte est un BLOC dans le grand bloc — rayon de bloc (12 px),
  // plus petit que le rayon de zone (16 px) qui l'entoure. C'est l'écart entre les deux qui
  // fait lire l'emboîtement ; les égaliser l'aplatirait. Exception à « conteneurs à angles
  // vifs » datée dans `DESIGN.md` › Shapes.
  it('carries the block radius of the zone it sits in', () => {
    const card = mount(PlayerPanel, { props: { player: makePlayer(), active: false } })

    expect(card.classes()).toContain('rounded-block')
  })
})

// --- Story 10.4, AC2 : RESTANT permanent, tous modes ---

describe('PlayerPanel — RESTANT', () => {
  const restant = (wrapper: ReturnType<typeof mount>) =>
    wrapper.find('[data-testid="remaining-score"]')

  it('shows distance minus score in every mode', () => {
    expect(restant(mountPanel(makePlayer({ score: 37, targetScore: 100 }))).text()).toBe('63')
    expect(restant(mountPanel(makePlayer({ score: 0, targetScore: 40 }))).text()).toBe('40')
  })

  // Jamais de négatif : une correction `+` peut dépasser la distance.
  it('floors at zero once the distance is reached or passed', () => {
    expect(restant(mountPanel(makePlayer({ score: 30, targetScore: 30 }))).text()).toBe('0')
    expect(restant(mountPanel(makePlayer({ score: 33, targetScore: 30 }))).text()).toBe('0')
  })

  // Distance libre : rien à retrancher, l'emplacement disparaît (NFR12).
  it('disappears without a distance', () => {
    expect(restant(mountPanel(makePlayer({ score: 12, targetScore: 0 }))).exists()).toBe(false)
  })
})

// --- Story 10.4, AC3 : zone de série au pied de la carte, une seule chose à la fois ---

describe('PlayerPanel — zone de série', () => {
  function mountFooter(props: Record<string, unknown>) {
    return mount(PlayerPanel, { props: { player: makePlayer(), active: false, ...props } as never })
  }

  // Correction manuelle du total : ±1 par appui, sur SON joueur (inchangé).
  it('emits a signed correction on the minus and plus buttons', async () => {
    const wrapper = mountPanel(makePlayer())

    await wrapper.find('[data-testid="score-plus"]').trigger('pointerdown')
    await wrapper.find('[data-testid="score-minus"]').trigger('pointerdown')

    expect(wrapper.emitted('adjust-score')).toEqual([[1], [-1]])
  })

  // Les corrections restent disponibles des deux côtés, y compris sur le panneau actif.
  it('offers the correction buttons on both panels', () => {
    for (const wrapper of [mountPanel(makePlayer(), true), mountPanel(makePlayer(), false)]) {
      expect(wrapper.find('[data-testid="score-minus"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="score-plus"]').exists()).toBe(true)
    }
  })

  // (a) La valeur en cours de saisie prime : c'est ce que le joueur tape à cet instant, et
  // la pop-up de saisie ne la rappelle plus (modèle 10.3).
  it('shows the value being typed first', () => {
    const wrapper = mountFooter({ entryValue: '12', seriesValue: 4 })

    expect(wrapper.find('[data-testid="entry-value"]').text()).toBe('12')
    expect(wrapper.find('[data-testid="series-value"]').exists()).toBe(false)
  })

  // Un buffer vide affiche le `0` qu'on est en train de composer, comme dans la pop-up
  // centrée qu'elle remplace (Story 1.5).
  it('shows a zero while the buffer is still empty', () => {
    expect(mountFooter({ entryValue: '' }).find('[data-testid="entry-value"]').text()).toBe('0')
  })

  // ⚠️ `POUR n` n'est PLUS ici (4e passe de rendu) : il a rejoint le bandeau, à la place du
  // restant. La série en cours reste donc visible jusqu'au bout, y compris pendant les
  // trois derniers points — c'est précisément là qu'on la regarde le plus.
  it('keeps showing the open series through the POUR n announce', () => {
    const wrapper = mountFooter({
      showRemaining: true,
      seriesValue: 4,
      player: makePlayer({ score: 28, targetScore: 30 }),
    })

    expect(wrapper.find('[data-testid="series-value"]').text()).toBe('4')
    expect(wrapper.find('[data-testid="remaining"]').text()).toBe('POUR 2')
    expect(
      wrapper.find('[data-testid="panel-header"] [data-testid="remaining"]').exists(),
    ).toBe(true)
  })

  // (b) Puis la série en cours comptée par les `+1` (3 Bandes).
  it('falls back to the open series', () => {
    const wrapper = mountFooter({ seriesValue: 4 })

    expect(wrapper.find('[data-testid="series-value"]').text()).toBe('4')
  })

  // (c) Et sinon rien : aucun tiret, aucun zéro à interpréter.
  it('shows nothing when there is nothing to show', () => {
    const wrapper = mountFooter({})
    const footer = wrapper.find('[data-testid="score-minus"]').element.parentElement!

    for (const id of ['entry-value', 'series-value']) {
      expect(wrapper.find(`[data-testid="${id}"]`).exists()).toBe(false)
    }
    expect([...footer.children].map((el) => el.getAttribute('data-testid'))).toEqual([
      'score-minus',
      'score-plus',
    ])
  })

  // 1re passe de rendu (Nathan) : le nombre de la zone de série est ROUGE et plus gros —
  // c'est le seul repère de couleur d'une carte en aplat uni, et la référence Billiboard
  // le peint en rouge entre ses deux boutons de correction.
  it('paints the series slot red, whatever it is showing', () => {
    const cases = [
      ['entry-value', { entryValue: '12' }],
      ['series-value', { seriesValue: 4 }],
    ] as const

    for (const [testid, props] of cases) {
      const slot = mountFooter(props as Record<string, unknown>).find(`[data-testid="${testid}"]`)

      expect(slot.classes()).toContain('text-brand-red')
    }
  })

  // La zone vit ENTRE les deux boutons de correction (spec UX).
  it('sits between the minus and plus buttons', () => {
    const wrapper = mountFooter({ seriesValue: 4 })
    const footer = wrapper.find('[data-testid="series-value"]').element.parentElement!

    expect([...footer.children].map((el) => el.getAttribute('data-testid'))).toEqual([
      'score-minus',
      'series-value',
      'score-plus',
    ])
  })

  // UX-DR17 : l'accusé de frappe se joue LÀ OÙ LA VALEUR CHANGE — donc sur la carte depuis
  // que la pop-up ne rappelle plus la valeur. La `key` recrée l'élément, ce qui rejoue
  // l'animation CSS sans aucun timer JS.
  it('replays the keystroke flash on the card as the value changes', async () => {
    const wrapper = mountFooter({ entryValue: '1' })
    const before = wrapper.find('[data-testid="input-flash"]').attributes('data-flash')

    await wrapper.setProps({ entryValue: '12' })

    expect(wrapper.find('[data-testid="input-flash"]').attributes('data-flash')).not.toBe(before)
  })

  // Sur une FRAPPE seulement (revue de fin d'Epic 10) : le `0` d'attente à l'ouverture de la
  // pop-up, et après `C`, n'en est pas une — il s'affiche sans flasher.
  it('does not flash the waiting zero of an empty buffer', async () => {
    const wrapper = mountFooter({ entryValue: '' })

    expect(wrapper.find('[data-testid="entry-value"]').text()).toBe('0')
    expect(wrapper.find('[data-testid="input-flash"]').exists()).toBe(false)

    await wrapper.setProps({ entryValue: '7' })
    expect(wrapper.find('[data-testid="input-flash"]').exists()).toBe(true)

    await wrapper.setProps({ entryValue: '' })
    expect(wrapper.find('[data-testid="input-flash"]').exists()).toBe(false)
  })
})

// --- Story 10.4, AC4 : la carte n'est plus tapable ---

describe('PlayerPanel — carte inerte', () => {
  // Le passage de tour est passé au CTA `PASSER LE TOUR` de la colonne centrale : taper la
  // carte ne doit plus RIEN faire, sans quoi un geste malheureux rendrait la main.
  it('never emits anything when the card itself is tapped', async () => {
    for (const active of [true, false]) {
      const wrapper = mountPanel(makePlayer(), active)

      await wrapper.trigger('pointerdown')

      // ⚠️ `emitted()` enregistre aussi l'événement DOM natif déclenché sur la racine :
      // ce sont les emits de COMPOSANT qui doivent rester absents.
      expect(wrapper.emitted('pass-turn')).toBeUndefined()
      expect(wrapper.emitted('adjust-score')).toBeUndefined()
    }
  })

  it('is no longer declared as a button', () => {
    expect(mountPanel(makePlayer()).attributes('role')).toBeUndefined()
    expect(source).not.toContain("'pass-turn'")
  })

  // CLAUDE.md §2 : le CSS global `touch-action: manipulation` cible `button, [role=button]`.
  // Le rôle retiré, les classes Tailwind doivent tenir seules — sinon un appui long sur le
  // score sélectionne le texte.
  // ⚠️ Ce cas est le SEUL qui protège encore ces deux classes. La Story 11.3 a balayé les
  // dix-sept autres occurrences du produit, toutes posées sur un `<button>` que la règle
  // globale couvrait déjà ; celle-ci reste parce que cette racine est un `<div>` sans
  // `role="button"`, et qu'aucun test ne verrait sa disparition — happy-dom ne calcule
  // aucun CSS. `tokens.test.ts` verrouille l'autre bout de la règle : plus aucune occurrence
  // ailleurs, et celle-ci toujours là.
  it('keeps the tactile CSS in classes now that the role is gone', () => {
    const classes = mountPanel(makePlayer()).classes()

    expect(classes).toContain('touch-manipulation')
    expect(classes).toContain('select-none')
  })

  // AR8 : `@pointerdown` seul, jamais `@click` — sinon le délai tactile de 300 ms
  // revient sur iPad, ce qu'aucun test de comportement ne verrait.
  it('never binds a click handler', () => {
    expect(source).not.toContain('@click')
    expect(source).not.toContain('@touchstart')
  })
})

// --- Story 2.4 : compte à rebours `POUR n` (3 Bandes), règles inchangées ---

describe('PlayerPanel — POUR n', () => {
  const remaining = (wrapper: ReturnType<typeof mount>) => wrapper.find('[data-testid="remaining"]')

  function mountWithRemaining(player: Player, showRemaining = true) {
    return mount(PlayerPanel, { props: { player, active: false, showRemaining } })
  }

  // Annonce de l'arbitre à l'approche de la distance : POUR 3, POUR 2, POUR 1.
  it('announces the points left when 1 to 3 remain', () => {
    expect(remaining(mountWithRemaining(makePlayer({ score: 27, targetScore: 30 }))).text()).toBe('POUR 3')
    expect(remaining(mountWithRemaining(makePlayer({ score: 28, targetScore: 30 }))).text()).toBe('POUR 2')
    expect(remaining(mountWithRemaining(makePlayer({ score: 29, targetScore: 30 }))).text()).toBe('POUR 1')
  })

  // Au-delà de 3, l'annonce n'a pas cours ; à 0 (ou en dessous), la partie est finie.
  it('stays silent above 3 remaining and once the distance is reached', () => {
    expect(remaining(mountWithRemaining(makePlayer({ score: 26, targetScore: 30 }))).exists()).toBe(false)
    expect(remaining(mountWithRemaining(makePlayer({ score: 30, targetScore: 30 }))).exists()).toBe(false)
    expect(remaining(mountWithRemaining(makePlayer({ score: 31, targetScore: 30 }))).exists()).toBe(false)
  })

  // Distance libre : rien à annoncer (NFR12).
  it('stays silent without a distance', () => {
    expect(remaining(mountWithRemaining(makePlayer({ score: 0, targetScore: 0 }))).exists()).toBe(false)
  })

  // Hors 3 Bandes (la vue ne le demande pas) : jamais, même à 1 point de la distance.
  it('stays silent when the view does not ask for it', () => {
    expect(remaining(mountWithRemaining(makePlayer({ score: 29, targetScore: 30 }), false)).exists()).toBe(false)
    expect(remaining(mountPanel(makePlayer({ score: 29, targetScore: 30 }))).exists()).toBe(false)
  })

  // ⚠️ L'annonce REMPLACE le restant au lieu de le doubler (4e passe de rendu) : les deux
  // disaient la même chose à deux endroits pendant trois points. L'AC2 assumait cette
  // redondance — elle n'a plus lieu d'être, `POUR n` EST l'expression du restant.
  it('replaces the bare remaining count in the band instead of doubling it', () => {
    const wrapper = mountWithRemaining(makePlayer({ score: 28, targetScore: 30 }))

    expect(remaining(wrapper).text()).toBe('POUR 2')
    expect(wrapper.find('[data-testid="remaining-score"]').exists()).toBe(false)
    // Et il vit dans le bandeau, plus au pied de la carte.
    expect(
      wrapper.find('[data-testid="panel-header"] [data-testid="remaining"]').exists(),
    ).toBe(true)
  })

  // Au-delà de trois points, le bandeau reprend le nombre nu, sans libellé.
  it('gives the band back its bare number once the announce is over', () => {
    const wrapper = mountWithRemaining(makePlayer({ score: 20, targetScore: 30 }))

    expect(remaining(wrapper).exists()).toBe(false)
    expect(wrapper.find('[data-testid="remaining-score"]').text()).toBe('10')
  })
})
