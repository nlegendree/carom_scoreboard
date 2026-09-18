import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../stores/useGameStore'
import { GAME_STORAGE_KEY, clearGameState } from '../services/storageService'
import {
  SCENE_IDS,
  readScene,
  applyStoreScene,
  keepSceneOutOfStorage,
  homeSceneState,
  gameSceneState,
  type SceneId,
} from './scenes'
// Sources relues en texte : la garde `import.meta.env.DEV` et l'absence de dépendance au
// store sont des propriétés de la SOURCE, qu'aucun rendu ne montre (Story 11.4, AC2).
import scenesSource from './scenes.ts?raw'
import mainSource from '../main.ts?raw'
import homeSource from '../components/HomeScreen.vue?raw'
import gameSource from '../views/GameView.vue?raw'

// Les douze noms de capture, LUS dans le harnais lui-même. ⚠️ Ils étaient recopiés ici à la
// main, sous un commentaire qui affirmait vérifier que le vocabulaire n'avait pas divergé :
// il ne vérifiait que deux des trois sources. `render-static.cjs` n'était lu par aucun test,
// et renommer `shot(page, f, '11-recap')` en `'11-recapitulatif'` ne faisait rien rougir
// (revue du 2026-09-18). Les trois vocabulaires — scènes, scans, captures — sont désormais
// confrontés à leur source, aucun n'est recopié.
const readScript = (glob: Record<string, string>): string => String(Object.values(glob)[0])

// Retire commentaires de ligne, commentaires de bloc et commentaires HTML, en gardant la
// LONGUEUR du texte (chaque caractère retiré devient une espace) pour que les index restent
// ceux de la source. Sans ça, un commentaire qui cite la garde se fait passer pour la garde.
const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length))
    .replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length))
    .replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length))

const HARNESS_NAMES = [
  ...readScript(
    // `scripts/` est hors `src/` : le glob le rapatrie sans chemin relatif fragile.
    import.meta.glob<string>('../../scripts/render-static.cjs', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).matchAll(/\bshot\(\s*page\s*,\s*\w+\s*,\s*'([^']+)'/g),
].map((m) => m[1]!)

describe('scènes de développement (?scene=)', () => {
  describe('vocabulaire', () => {
    // Le harnais doit rendre douze noms : si la lecture cassait (renommage de `shot`,
    // réécriture du parcours), `HARNESS_NAMES` serait vide et les deux contrôles suivants
    // passeraient contre une liste vide. On le dit avant de s'en servir.
    it('lit bien douze noms de capture dans le harnais', () => {
      expect(HARNESS_NAMES).toHaveLength(12)
    })

    it('reprend exactement les douze noms de capture du harnais', () => {
      expect([...SCENE_IDS]).toEqual(HARNESS_NAMES)
    })

    it('donne les mêmes identifiants au lanceur de scans', () => {
      const script = readScript(
        // `scripts/` est hors `src/` : le glob le rapatrie sans chemin relatif fragile.
        import.meta.glob<string>('../../scripts/design-check.sh', {
          query: '?raw',
          import: 'default',
          eager: true,
        }),
      )
      const declared = /^SCENES="([^"]+)"$/m.exec(script)?.[1]?.split(' ') ?? []
      expect(declared).toEqual(HARNESS_NAMES)
    })
  })

  describe('readScene', () => {
    const original = window.location.search

    const setSearch = (search: string): void => {
      // happy-dom refuse l'écriture directe de `location.search` : on remplace l'objet.
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search },
        writable: true,
        configurable: true,
      })
    }

    afterEach(() => setSearch(original))

    it('lit un identifiant connu', () => {
      setSearch('?scene=07-scoreboard-jds')
      expect(readScene()).toBe('07-scoreboard-jds')
    })

    it('rend null sans paramètre', () => {
      setSearch('')
      expect(readScene()).toBeNull()
    })

    it('rend null sur un identifiant inconnu, sans jeter', () => {
      setSearch('?scene=42-inexistante')
      expect(readScene()).toBeNull()
    })
  })

  describe('garde de production', () => {
    // `import.meta.env.DEV` est remplacé statiquement : `if (false) { … }` disparaît du
    // bundle, et avec lui l'import devenu inutilisé. La garde doit donc être chez
    // l'APPELANT — derrière un appel de fonction, elle laisserait la table dans `dist/`.
    it.each([
      ['main.ts', mainSource],
      ['HomeScreen.vue', homeSource],
      ['GameView.vue', gameSource],
    ])('%s garde son appel aux scènes par import.meta.env.DEV', (_name, source) => {
      // ⚠️ On cherche le `if (import.meta.env.DEV)` RÉEL, et dans une source DÉCOMMENTÉE.
      // La première version cherchait la chaîne `import.meta.env.DEV` par `indexOf` : dans
      // `main.ts` et `HomeScreen.vue`, sa première occurrence est le COMMENTAIRE qui explique
      // la garde, deux lignes au-dessus de la garde elle-même. Supprimer le `if` en laissant
      // le commentaire laissait donc le test VERT — vérifié par mutation — pendant que la
      // table des douze scènes partait dans `dist/`. C'est le garde-fou le plus important de
      // la story, et il ne gardait rien (revue du 2026-09-18).
      const code = stripComments(source)
      const call = /(applyStoreScene|homeSceneState|gameSceneState|readScene)\s*\(/.exec(code)
      expect(call, 'le fichier doit consommer les scènes').not.toBeNull()
      const guard = code.indexOf('if (import.meta.env.DEV)')
      expect(guard, 'garde `if (import.meta.env.DEV)` absente').toBeGreaterThanOrEqual(0)
      expect(guard, 'la garde doit précéder le premier appel aux scènes').toBeLessThan(
        call!.index,
      )
    })

    it('scenes.ts ne porte pas la garde lui-même', () => {
      // La garde appartient aux APPELANTS : posée ici, derrière un appel de fonction, elle
      // laisserait la table des scènes dans le bundle (voir l'en-tête de `scenes.ts`).
      // ⚠️ Sur la source DÉCOMMENTÉE : la version précédente s'appuyait sur un lookahead
      // `(?!.*⚠️)` censé exempter les lignes de commentaire, mais aucune ligne du fichier ne
      // le déclenchait — la garde était morte et n'aurait rien vu (revue du 2026-09-18).
      expect(stripComments(scenesSource)).not.toMatch(/if\s*\(\s*import\.meta\.env\.DEV/)
    })
  })

  describe('indépendance vis-à-vis du store', () => {
    it("n'importe ni le store ni un service", () => {
      const imports = [...scenesSource.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])
      expect(imports).toEqual(['../types/game'])
    })

    it('ne pilote le store que par des actions publiques existantes', () => {
      setActivePinia(createPinia())
      const store = useGameStore()
      const surface = [
        'discardSavedGame',
        'startGame',
        'openScoreEntry',
        'closeScoreEntry',
        'appendScoreDigit',
        'validateScoreInput',
        'incrementSeries',
        'finishGame',
      ]
      for (const action of surface) {
        expect(store, `${action} doit exister sur le store`).toHaveProperty(action)
        expect(typeof (store as unknown as Record<string, unknown>)[action]).toBe('function')
      }
    })
  })

  describe('application des scènes', () => {
    beforeEach(() => {
      setActivePinia(createPinia())
      localStorage.clear()
    })

    it('efface la sauvegarde au départ de la page, et pas avant', async () => {
      // Le `watch` de persistance est en flush `pre` : il écrit au tick SUIVANT. Une scène
      // de scoreboard laisse donc bien une partie sauvegardée, qu'il faut reprendre au
      // départ de la page — `discardSavedGame()` n'y peut rien, il est no-op hors `idle`.
      const store = useGameStore()
      applyStoreScene(store, '09-scoreboard-jds-en-partie')
      await nextTick()
      expect(
        localStorage.getItem(GAME_STORAGE_KEY),
        'le watch de persistance a bien écrit : c’est ce qu’on doit nettoyer',
      ).not.toBeNull()

      keepSceneOutOfStorage(clearGameState)
      expect(store.status, 'la scène reste jouée à l’écran').toBe('playing')
      window.dispatchEvent(new Event('pagehide'))
      expect(localStorage.getItem(GAME_STORAGE_KEY)).toBeNull()
    })

    it('ne touche à rien tant que la page ne part pas', async () => {
      const store = useGameStore()
      applyStoreScene(store, '07-scoreboard-jds')
      keepSceneOutOfStorage(clearGameState)
      await nextTick()
      // Sans départ de page, la scène reste persistée : un rechargement pendant qu'on la
      // regarde ne doit pas la faire disparaître sous les yeux.
      expect(localStorage.getItem(GAME_STORAGE_KEY)).not.toBeNull()
    })

    it('efface la partie sauvegardée avant toute scène', () => {
      const store = useGameStore()
      const spy = vi.spyOn(store, 'discardSavedGame')
      applyStoreScene(store, '01-accueil')
      expect(spy).toHaveBeenCalledOnce()
    })

    it.each(SCENE_IDS)('%s s’applique sans jeter', (scene) => {
      const store = useGameStore()
      expect(() => applyStoreScene(store, scene)).not.toThrow()
    })

    it('07 démarre une partie JDS nommée', () => {
      const store = useGameStore()
      applyStoreScene(store, '07-scoreboard-jds')
      expect(store.status).toBe('playing')
      expect(store.mode).toBe('libre')
      expect(store.player1.name).toBe('MICHEL')
      expect(store.player2.name).toBe('JEAN PIERRE')
      expect(store.player1.targetScore).toBe(30)
      expect(store.player2.targetScore).toBe(25)
    })

    it('08 ouvre la saisie sur le buffer « 12 »', () => {
      const store = useGameStore()
      applyStoreScene(store, '08-popup-saisie-serie')
      expect(store.entryOpen).toBe(true)
      expect(store.currentInput.player1).toBe('12')
    })

    it('09 pose les trois séries du harnais (12, 7, 15)', () => {
      const store = useGameStore()
      applyStoreScene(store, '09-scoreboard-jds-en-partie')
      expect(store.player1.score).toBe(27)
      expect(store.player2.score).toBe(7)
      expect(store.entryOpen).toBe(false)
    })

    it('11 termine la partie', () => {
      const store = useGameStore()
      applyStoreScene(store, '11-recap')
      expect(store.status).toBe('finished')
    })

    it('12 démarre le 3 bandes à trois points', () => {
      const store = useGameStore()
      applyStoreScene(store, '12-scoreboard-3bandes')
      expect(store.mode).toBe('3bandes')
      expect(store.status).toBe('playing')
      expect(store.player1.score).toBe(3)
    })
  })

  describe('parts d’écran', () => {
    it('02 pose la catégorie JDS à l’étape des modes', () => {
      const home = homeSceneState('02-jds')
      expect(home?.step).toBe('mode')
      expect(home?.selectedCategory?.id).toBe('series')
    })

    it('04 et 05 ouvrent la saisie avec leur brouillon', () => {
      expect(homeSceneState('04-popup-clavier-alpha')).toMatchObject({
        entry: { ball: 'white', field: 'name' },
        draft: 'MICHEL',
      })
      expect(homeSceneState('05-popup-pave-numerique')).toMatchObject({
        entry: { ball: 'white', field: 'distance' },
        draft: '30',
      })
    })

    it('10 est la seule scène à ouvrir une pop-up de GameView', () => {
      expect(gameSceneState('10-popup-decision')).toEqual({ exitPromptOpen: true })
      const others = SCENE_IDS.filter((id): id is SceneId => id !== '10-popup-decision')
      for (const id of others) expect(gameSceneState(id)).toBeNull()
    })

    it('aucune scène de scoreboard ne sème d’état d’accueil', () => {
      for (const id of ['07-scoreboard-jds', '11-recap', '12-scoreboard-3bandes'] as const) {
        expect(homeSceneState(id)).toBeNull()
      }
    })
  })
})
