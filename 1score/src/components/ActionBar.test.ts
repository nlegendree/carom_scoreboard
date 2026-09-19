import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionBar from './ActionBar.vue'
import IconAction from './IconAction.vue'
import type { TableSide } from '../types/game'

// Story 10.4 : `ActionBar` n'est plus la coquille générique `showBack` + slot de
// l'avant-Epic 10 (ses cinq cas ont disparu avec elle). C'est la BARRE BASSE DU
// SCOREBOARD : un CTA de saisie du côté du joueur assis, quatre pictos de l'autre.
function mountBar(props: Partial<Record<string, unknown>> = {}) {
  return mount(ActionBar, {
    props: {
      ctaSide: 'left' as TableSide,
      sideOwners: { left: 'player1', right: 'player2' },
      ctaLabel: '+ POINTS ADVERSAIRE',
      ctaTestId: 'add-points-button',
      canUndo: true,
      canRestart: true,
      ...props,
    } as never,
  })
}

const pictoIds = (wrapper: ReturnType<typeof mountBar>) =>
  wrapper.findAllComponents(IconAction).map((c) => c.props('label'))

describe('ActionBar', () => {
  it('renders the CTA with the label and testid the view asks for', async () => {
    const wrapper = mountBar()
    const cta = wrapper.find('[data-testid="add-points-button"]')

    expect(cta.text()).toBe('+ POINTS ADVERSAIRE')
    await cta.trigger('pointerdown')

    expect(wrapper.emitted('cta')).toHaveLength(1)
  })

  // Le mode 3 Bandes réutilise la même barre avec un autre libellé et un autre testid :
  // c'est le même geste (l'assis compte pour celui qui joue), seule la granularité change.
  it('takes the three-cushions CTA identity without any other change', () => {
    const wrapper = mountBar({ ctaLabel: '+1 ADVERSAIRE', ctaTestId: 'plus-one-button' })

    expect(wrapper.find('[data-testid="plus-one-button"]').text()).toBe('+1 ADVERSAIRE')
    expect(wrapper.find('[data-testid="add-points-button"]').exists()).toBe(false)
  })

  // AC12 : les deux groupes échangent de côté à chaque bascule de tour. `data-side` dit
  // dans la colonne de QUEL JOUEUR se trouve un contrôle — il est lu par `GameView.test.ts`
  // sur plusieurs dizaines de cas et ne change pas de sémantique.
  it('marks the owning player of the CTA column and of the picto column', () => {
    const left = mountBar({ ctaSide: 'left' })
    const right = mountBar({ ctaSide: 'right' })

    expect(left.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player1')
    expect(left.find('[data-testid="exit-button"]').attributes('data-side')).toBe('player2')
    expect(right.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player2')
    expect(right.find('[data-testid="exit-button"]').attributes('data-side')).toBe('player1')
    expect(right.find('[data-testid="restart-button"]').attributes('data-side')).toBe('player1')
  })

  // La résolution des côtés est faite UNE FOIS par la vue (`whiteSide`, Story 10.3) : la
  // barre la reçoit, elle ne la refait pas. Bille blanche à droite, le même côté d'écran
  // appartient donc à l'autre joueur.
  it('takes the column owners from the view, never from a rule of its own', () => {
    const wrapper = mountBar({ sideOwners: { left: 'player2', right: 'player1' } })

    expect(wrapper.find('[data-testid="add-points-button"]').attributes('data-side')).toBe('player2')
    expect(wrapper.find('[data-testid="exit-button"]').attributes('data-side')).toBe('player1')
  })

  // AC14 (DT2) : UN SEUL markup rend les deux côtés — l'ordre vient de la direction de la
  // rangée, pas d'un bloc dupliqué. Un seul CTA et quatre pictos, quel que soit le côté.
  it('renders one CTA and four pictos from a single markup', () => {
    for (const side of ['left', 'right'] as const) {
      const wrapper = mountBar({ ctaSide: side })

      expect(wrapper.findAll('[data-side]').filter((el) => el.text().includes('ADVERSAIRE'))).toHaveLength(1)
      expect(wrapper.findAllComponents(IconAction)).toHaveLength(4)
    }
  })

  // ⚠️ Avec `flex-row-reverse`, l'ordre du DOM ne suit plus l'ordre visuel : un test qui
  // lirait l'index dans le DOM se tromperait. On lit la CLASSE DE DIRECTION de la rangée,
  // et on vérifie que l'ordre du DOM, lui, ne bouge JAMAIS.
  it('inverts the visual order by the row direction, never by the DOM order', () => {
    const left = mountBar({ ctaSide: 'left' })
    const right = mountBar({ ctaSide: 'right' })
    const row = (w: ReturnType<typeof mountBar>) => w.find('[data-testid="action-bar-row"]').classes()

    expect(row(left)).toContain('flex-row')
    expect(row(right)).toContain('flex-row-reverse')
    expect(pictoIds(left)).toEqual(pictoIds(right))
  })

  // Story 11.5 (AC3), demande de Nathan au rendu (2026-09-18) : « que les boutons aient les
  // mêmes marges que les blocs du dessus et qu'ils prennent tout l'espace sous les cards
  // blanche et jaune ». La barre cesse donc d'avoir SA PROPRE grille : elle reprend celle des
  // colonnes, terme à terme — groupes latéraux en `flex-1` comme les cartes, espaceur central
  // à `w-1/5` comme la colonne centrale, même gouttière, même retrait. Trois recopies de
  // largeur (`w-2/5` + `px-2`) ne pouvaient PAS coïncider avec des colonnes que la gouttière
  // rétrécit : mesuré à 0,0 px d'écart aux trois formats une fois la grille partagée.
  // happy-dom ne calcule aucun CSS — seule la classe peut être verrouillée ici.
  it('reproduces the column grid instead of carrying its own', () => {
    const bar = mountBar()
    const row = bar.find('[data-testid="action-bar-row"]')
    const groups = row.findAll(':scope > div')

    expect(row.classes()).toEqual(
      expect.arrayContaining(['gap-(--game-column-gutter)', 'rounded-zone', 'bg-surface', 'border', 'border-border']),
    )
    // La marge d'une unité au pourtour est portée par le `<nav>` : c'est elle qui fait
    // coïncider la barre avec le `m-1` du grand bloc des colonnes (`GameView`).
    expect(bar.find('[data-testid="action-bar"]').classes()).toContain('p-1')
    expect(row.classes()).toContain('p-1')
    // Story 11.5 (Task 5, « O2 ») : la barre porte son ombre, projetée sur le grand bloc.
    expect(row.classes()).toContain('shadow-bottom-bar')
    // Les deux groupes latéraux s'étirent comme les cartes, et rétrécissent comme elles
    // (`min-w-0`) ; aucune largeur recopiée.
    for (const g of [groups[0]!, groups[2]!]) {
      expect(g.classes()).toEqual(expect.arrayContaining(['flex-1', 'min-w-0']))
      expect(g.classes()).not.toContain('w-2/5')
    }
    // L'espaceur central garde le cinquième de la colonne centrale.
    expect(groups[1]!.classes()).toContain('w-1/5')
  })

  // Même demande, deuxième moitié : « qu'ils prennent tout l'espace sous les cards ». Les
  // quatre pictos s'étirent au lieu de rester calés sur leur cible tactile minimale.
  it('stretches the four pictos across the width of their card', () => {
    const bar = mountBar()

    for (const id of ['exit-button', 'settings-button', 'restart-button', 'undo-button']) {
      expect(bar.find(`[data-testid="${id}"]`).classes()).toContain('flex-1')
    }
  })

  // AC12 : du bord EXTÉRIEUR vers l'intérieur — QUITTER, PARAMÈTRES, RECOMMENCER, ANNULER.
  // L'ordre du DOM est toujours celui-là, extérieur → intérieur ; c'est la direction de la
  // rangée du groupe qui le pose à droite ou à gauche de l'écran.
  it('orders the pictos from the outer edge inwards', () => {
    expect(pictoIds(mountBar())).toEqual(['QUITTER', 'PARAMÈTRES', 'RECOMMENCER', 'ANNULER'])
  })

  // AC13 : comportements inchangés (Stories 1.7, 1.10, 1.15).
  it('emits quit, restart and undo on their pictos', async () => {
    const wrapper = mountBar()

    await wrapper.find('[data-testid="exit-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="restart-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="undo-button"]').trigger('pointerdown')

    expect(wrapper.emitted('quit')).toHaveLength(1)
    expect(wrapper.emitted('restart')).toHaveLength(1)
    expect(wrapper.emitted('undo')).toHaveLength(1)
  })

  it('greys out undo on an empty stack and restart on an untouched scoreboard', async () => {
    const wrapper = mountBar({ canUndo: false, canRestart: false })

    await wrapper.find('[data-testid="undo-button"]').trigger('pointerdown')
    await wrapper.find('[data-testid="restart-button"]').trigger('pointerdown')

    expect(wrapper.emitted('undo')).toBeUndefined()
    expect(wrapper.emitted('restart')).toBeUndefined()
    expect(wrapper.find('[data-testid="undo-button"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-testid="restart-button"]').attributes('disabled')).toBeDefined()
  })

  // QUITTER n'est jamais grisé : sans rien à récapituler il ramène à l'accueil, sinon il
  // ouvre une confirmation — rien de destructif au contact dans les deux cas.
  it('never greys out quit', () => {
    const wrapper = mountBar({ canUndo: false, canRestart: false })

    expect(wrapper.find('[data-testid="exit-button"]').attributes('disabled')).toBeUndefined()
  })

  // AC13 : PARAMÈTRES est affiché atténué et INERTE (`disabled` ET garde).
  it('shows settings as a soon item that emits nothing', async () => {
    const wrapper = mountBar()
    const settings = wrapper.find('[data-testid="settings-button"]')

    await settings.trigger('pointerdown')

    expect(settings.attributes('disabled')).toBeDefined()
    expect(settings.find('[data-testid="soon-badge"]').exists()).toBe(true)
    expect(wrapper.emitted()).not.toHaveProperty('settings')
  })

  it('keeps the action-bar testid the view and its tests rely on', () => {
    expect(mountBar().attributes('data-testid')).toBe('action-bar')
  })
})
