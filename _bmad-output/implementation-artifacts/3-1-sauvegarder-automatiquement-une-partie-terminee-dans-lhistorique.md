# Story 3.1: Sauvegarder automatiquement une partie terminée dans l'historique

Status: backlog

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> ⚠️ **Recadrée le 2026-09-11, avant tout dev** (décision de Nathan, voir `sprint-change-proposal-2026-09-11.md`) : les parties se rattachent au **profil joueur**, pas à la tablette — un historique par appareil ne représente rien pour des joueurs qui changent de billard. Cette story **n'est pas développée en l'état** et repasse en `backlog`. Elle sera réécrite **après l'Epic 4** (profil joueur) : le contenu technique ci-dessous (Dexie, `GameRecord`, déclencheur `finishGame`, objets plain, `fake-indexeddb`) reste valable comme **file locale de synchronisation** (NFR7), à compléter par l'identité des joueurs (identifiant par côté, `null` = invité) et un statut de synchronisation. Ce qui ne survit pas : la sémantique « historique consultable sur la tablette », les décisions 2 et 3 dans leur formulation actuelle.

> **Cadrage (2026-09-11, création de la story)** — première story de l'Epic 3, **sans aucun pixel** : elle pose la fondation de l'historique (types, service Dexie, store) et le déclencheur d'écriture. Les routes `/history` et `/history/:id`, la liste, le détail, la rétention et les records viennent en 3.2 → 3.5. Cinq décisions, prises sans question à Nathan (périmètre minimal, mémoire « stories de robustesse courtes ») — à valider au rendu :
> 1. **Le déclencheur est `finishGame()`, pas la vue.** C'est l'**unique** transition `playing → finished` du store (Story 1.10, Décision 9 : une seule action de clôture pour les trois CTA). Y brancher l'écriture garantit qu'un pilotage déporté (V2+, UX-DR23) enregistre aussi, et qu'une partie `finished` **restaurée** au lancement (1.12, `resumeGame`) n'est **pas** réécrite — elle l'a été à sa clôture. `rematch`/`restartGame`/`resetGame`/`startGame` ne passent jamais par `finishGame` : rien n'est écrit, FR5 est vrai par construction.
> 2. **Toute partie qui atteint `finished` est enregistrée, fin manuelle comprise.** L'epic laissait ouvert « abandon = non sauvegardée ? défaite ? ». Tranché : la sortie confirmée (`TERMINER LA PARTIE ?` → `VOIR LE RÉCAP`) produit déjà un récap avec vainqueur au prorata (1.10, Décision 4) — ce récap est enregistré tel quel, marqué `ending: 'manual'` pour que la 3.2 puisse l'afficher et la 3.5 l'**exclure** des records (une partie de deux reprises à 10 de moyenne n'est pas un record). Les deux sorties **sans récap** qui existent restent sans enregistrement, et c'est voulu : un scoreboard intact (`canUndo` faux → accueil direct) n'a rien joué ; `PARTIE EN COURS › ANNULER` jette une sauvegarde, filet de sécurité qui ne prétend pas être une partie. **Aucun nouveau chemin « quitter sans récap » n'est créé** (report de la 1.15 clos ici : le chemin sortie → récap → `FIN DE PARTIE` reste le seul). RECOMMENCER n'enregistre rien (1.15, AC8).
> 3. **`GameRecord` est un modèle à part, par côté, plus riche que l'esquisse de l'architecture.** L'esquisse (`player1Name`, `player1Score`, `stats.player1`) n'a ni distance, ni vainqueur, ni corrections `−`/`+` — or le récap affiche `MICHEL / 100`, le détail (3.3) devra réconcilier reprises et total (`score = Σ reprises + scoreAdjustments`), et la 3.5 a besoin du vainqueur et du type de fin. Forme retenue ci-dessous (Task 1), consignée dans `architecture.md` par note datée. Les stats sont **dénormalisées** à l'écriture (`averages`, `bestSeries`, `repriseCounts` du store — jamais recalculées ailleurs) : la liste 3.2 et les records 3.5 les liront sans rejouer les reprises.
> 4. **`GameState` ne change pas** : rien n'est ajouté au format persisté en `localStorage`, `GAME_STORAGE_VERSION` reste à 1. Le type de fin (`ending`) se **déduit** dans `finishGame` (`endPrompt === null` ⇔ fin manuelle) au moment de construire l'enregistrement.
> 5. **Tests sous IndexedDB simulé.** happy-dom 20 n'expose **pas** `indexedDB` (sondé le 2026-09-11 : `typeof indexedDB === 'undefined'`). `fake-indexeddb` (devDependency) est chargé **globalement** par un `setupFiles` Vitest, avant tout import de Dexie — sans quoi les tests du store de partie, qui appellent `finishGame`, verraient l'écriture échouer en `console.error` à chaque fin de partie.

## Story

As a joueur,
I want que chaque partie terminée soit automatiquement enregistrée dans l'historique,
So that je retrouve toutes mes parties passées, et que démarrer une nouvelle partie n'efface jamais les précédentes (FR5, AR4, AR7, AR12).

## Acceptance Criteria

1. **Given** une partie en cours, en jeu de série (Epic 1) ou en 3 Bandes (Epic 2) **When** elle passe en `finished` par `finishGame()` — `VOIR LE RÉCAP` après « PARTIE TERMINÉE », `FIN DE PARTIE` sur l'offre d'égalisatrice, ou sortie confirmée par `TERMINER LA PARTIE ?` **Then** un `GameRecord` complet est écrit dans IndexedDB (base `1score`, table `games`) via `useHistoryStore.recordGame()` et `databaseService.addGameRecord()` : mode, nom / distance / score final de chaque côté, moyenne, meilleure série et reprises jouées de chaque côté (valeurs **identiques** à celles du récap), vainqueur (`null` = égalité), type de fin, égalisatrice jouée ou non, tableau des reprises, corrections `−`/`+`, `startedAt`, `finishedAt`.
2. **Given** le déroulé de la partie **When** je lis l'enregistrement **Then** `ending` vaut `'distance'` pour toute fin détectée par le store (jaune à sa distance, blanc à sa distance avec égalisatrice refusée / perdue / égalisée) et `'manual'` pour la sortie confirmée ; `equalizingReprise` est `true` si et seulement si l'égalisatrice a été jouée ; `winner` est celui du récap.
3. **Given** une partie enregistrée **When** j'enchaîne — `UNE PARTIE DE PLUS` (`rematch`), `FIN DE PARTIE` (`resetGame`), nouvelle partie depuis l'accueil (`startGame`), RECOMMENCER (`restartGame`), `PARTIE EN COURS › ANNULER` (`discardSavedGame`) **Then** aucun enregistrement existant n'est modifié ni supprimé, et aucun nouveau n'est créé par ces actions (FR5). Deux parties terminées = deux enregistrements distincts, le premier inchangé.
4. **Given** une partie **recommencée** (1.15) ou un scoreboard intact quitté par le picto de sortie (retour direct à l'accueil, 1.10) **When** je consulte la table **Then** rien n'y a été écrit : ces parties n'ont jamais été `finished`.
5. **Given** une partie `finished` **restaurée** au lancement (1.12, `REPRENDRE LA PARTIE` → récap) **When** le récap s'affiche **Then** aucun second enregistrement n'est écrit — `finishGame` n'est pas rappelé.
6. **Given** une écriture IndexedDB qui échoue (quota, navigation privée, API absente, `DataCloneError`) **When** `addGameRecord` lève **Then** l'erreur est absorbée dans `databaseService.ts` (`try/catch` + `console.error('[database] addGameRecord failed:', e)`), la fonction renvoie `null`, le store n'a pas de `try/catch`, la vue ne sait rien : le récap s'affiche normalement, la partie continue (AR12, AR18).
7. **Given** le code **When** je lis `src/` **Then** `dexie` n'est importé et `indexedDB` n'est nommé (hors commentaires) que dans `services/databaseService.ts` — vérifié par un test `?raw` sur le même modèle que celui de `storageService.test.ts` ; `useHistoryStore` ne connaît que le service ; `useGameStore` ne connaît que `useHistoryStore`.
8. **Given** l'enregistrement construit par `finishGame` **When** il est confié à Dexie **Then** c'est un **objet plain** (aucun Proxy réactif Vue) : IndexedDB clone structurellement, un `ref` réactif lèverait `DataCloneError` (voir Dev Notes).
9. **Given** les specs **When** je lis `architecture.md`, `epics.md`, `deferred-work.md`, `CLAUDE.md` **Then** les décisions de l'encadré y sont consignées par notes datées (Task 6).

## Tasks / Subtasks

- [ ] **Task 1 — Types `src/types/history.ts` (AC: 1, 2)**
  - [ ] 1.1 Créer le fichier (il n'existe **pas**, malgré AR5 qui le disait scaffoldé). Exports nommés uniquement :
    ```ts
    import type { GameMode, PlayerId, Reprise } from './game'

    // Comment la partie s'est terminée : `distance` = fin détectée par le store
    // (`checkEndOfGame`, égalisatrice comprise, refusée ou jouée) ; `manual` = sortie
    // confirmée (`TERMINER LA PARTIE ?`), vainqueur au prorata (Story 1.10).
    export type GameEnding = 'distance' | 'manual'

    // Un côté de la table à la clôture. Par CÔTÉ (gauche = blanc, droite = jaune),
    // comme partout ailleurs — pas `id`/`color`, attachés au côté et donc redondants.
    export interface GameRecordPlayer {
      name: string
      score: number       // total final, corrections comprises (= récap POINTS)
      targetScore: number // distance (0 = libre, injoignable depuis l'accueil depuis la 1.10)
      average: number     // moyenne, non arrondie (le récap formate à 3 décimales)
      bestSeries: number
      reprises: number    // reprises jouées par ce joueur (= récap REPRISES)
    }

    export interface GameRecord {
      id: number // auto-incrément Dexie, absent à l'insertion (`GameRecordInput`)
      mode: GameMode
      player1: GameRecordPlayer
      player2: GameRecordPlayer
      winner: PlayerId | null // `null` = égalité
      ending: GameEnding
      equalizingReprise: boolean // l'égalisatrice a été jouée
      reprises: Reprise[]
      // Corrections −/+ (Story 1.7) : `score = Σ reprises + scoreAdjustments`. Sans
      // elles, le détail (3.3) ne réconcilierait pas les reprises avec le total.
      scoreAdjustments: { player1: number; player2: number }
      startedAt: number
      finishedAt: number
    }

    export type GameRecordInput = Omit<GameRecord, 'id'>
    ```
  - [ ] 1.2 Aucun test dédié (types purs) ; `vue-tsc -b` fait foi.

- [ ] **Task 2 — `src/services/databaseService.ts` + `fake-indexeddb` (AC: 6, 7)**
  - [ ] 2.1 `npm install -D fake-indexeddb` (6.2.5 au 2026-09-11 ; Node 24 OK). **Ne pas** monter Dexie (4.4.5 installé, 4.4.6 dispo : rien d'utile).
  - [ ] 2.2 Créer `1score/vitest.setup.ts` : `import 'fake-indexeddb/auto'` (une ligne, commentée : Dexie résout `indexedDB` **à l'import** du module, le polyfill doit précéder tout import de `dexie` — d'où un `setupFiles` global plutôt qu'un import par fichier de test). `vitest.config.ts` → `test.setupFiles: ['./vitest.setup.ts']`. Ajouter `vitest.setup.ts` à `include` de `tsconfig.node.json` (à côté de `vitest.config.ts`) pour qu'il soit typé.
  - [ ] 2.3 Le service, **seul** point de contact avec IndexedDB (même rôle que `storageService.ts` pour `localStorage`) :
    ```ts
    import Dexie, { type EntityTable } from 'dexie'
    import type { GameRecord, GameRecordInput } from '../types/history'

    export const DATABASE_NAME = '1score'

    // Index : `++id` (clé auto), `finishedAt` (tri de la liste 3.2, purge 30 jours 3.4).
    // Tout ajout d'index passe par `db.version(2).stores(...)` — Dexie migre les index
    // sans toucher aux lignes ; on n'édite JAMAIS la version 1 une fois livrée.
    export const db = new Dexie(DATABASE_NAME) as Dexie & {
      games: EntityTable<GameRecord, 'id'>
    }
    db.version(1).stores({ games: '++id, finishedAt' })

    // `null` = écriture échouée, absorbée ici (AR12) : le store ne gère rien, la vue non plus.
    export async function addGameRecord(record: GameRecordInput): Promise<number | null> {
      try {
        return await db.games.add(record)
      } catch (e) {
        console.error('[database] addGameRecord failed:', e)
        return null
      }
    }
    ```
    `export const db` est volontaire : la 3.2 (lecture) et les tests (lecture directe de la table) s'en servent ; le `?raw` garantit que personne d'autre que le service n'importe `dexie`.
  - [ ] 2.4 Tests `databaseService.test.ts` (`beforeEach: await db.games.clear(); vi.restoreAllMocks()` — `clear()` et non `new IDBFactory()` : Dexie a capturé l'`indexedDB` du polyfill à l'import) : `addGameRecord` renvoie un `id` numérique croissant et la ligne relue `toEqual` l'entrée (+ `id`) ; deux ajouts → deux lignes, la première inchangée ; `db.games.add` qui lève (`vi.spyOn(db.games, 'add').mockRejectedValue(new Error('QuotaExceededError'))`) → `null`, un `console.error` préfixé `[database]`, aucune exception ; garde `?raw` : sur tout `src/**/*.{ts,vue}` hors `services/` et hors tests, aucune occurrence de `from 'dexie'` ni d'un **appel** `indexedDB.` (reprendre le filtre `APP_SOURCES` de `storageService.test.ts`, en le partageant si c'est plus propre).

- [ ] **Task 3 — `src/stores/useHistoryStore.ts` (AC: 1, 6)**
  - [ ] 3.1 `defineStore('history', () => { … })`, exports nommés. Une seule action en 3.1 :
    ```ts
    // Écrit la partie close. Pas de try/catch : le service a déjà absorbé l'échec
    // (CLAUDE.md §5) — `null` remonte tel quel, personne n'affiche rien (borne fixe).
    async function recordGame(record: GameRecordInput): Promise<number | null> {
      return await addGameRecord(record)
    }
    ```
    Commentaire d'en-tête : `records`/`isLoading`/`loadHistory` arrivent en 3.2 — ne pas les scaffolder à vide.
  - [ ] 3.2 Tests `useHistoryStore.test.ts` (`setActivePinia(createPinia())`, `db.games.clear()`) : `recordGame` écrit une ligne relue `toEqual` ; renvoie `null` sans lever quand le service échoue (spy sur `db.games.add`).

- [ ] **Task 4 — `useGameStore.finishGame()` déclenche l'écriture (AC: 1, 2, 3, 4, 5, 8)**
  - [ ] 4.1 `import { useHistoryStore } from './useHistoryStore'` (store → store, motif Pinia « nested stores » ; **jamais** l'inverse — `useHistoryStore` ne doit pas importer `useGameStore`).
  - [ ] 4.2 Fonction **privée** `toGameRecord(ending: GameEnding): GameRecordInput`, appelée par `finishGame` **après** que `winner`/`finishedAt` sont posés. Construire un objet **plain à partir de primitives** — `player1.value` et `scoreAdjustments.value` sont des Proxy réactifs (`ref` d'objet) et un Proxy n'est pas clonable structurellement (`DataCloneError`, absorbé par le service = **enregistrement silencieusement perdu**). `reprises.value` (shallowRef) est un tableau brut de littéraux : le recopier quand même (`reprises.value.map((r) => ({ ...r }))`) pour ne jamais partager une référence avec l'état vivant. Stats depuis les computeds existants (`averages.value`, `bestSeries.value`, `repriseCounts.value`) — **aucun recalcul** ici. `startedAt: startedAt.value ?? finishedAt.value` (typage ; `startedAt` est toujours posé en `playing`).
  - [ ] 4.3 Dans `finishGame`, **avant** de vider `endPrompt` : `const ending: GameEnding = endPrompt.value === null ? 'manual' : 'distance'`. En fin d'action : `void useHistoryStore().recordGame(toGameRecord(ending))` — `finishGame` reste **synchrone** (la vue bascule sur le récap dans le même tick, comme aujourd'hui) ; l'enregistrement est construit **avant** que la main revienne à la vue, donc avant tout `rematch` qui écraserait l'état. `void` et non `.then().catch()` (AR18) : la promesse ne rejette jamais (Task 2.3). Mettre à jour le commentaire d'en-tête de `finishGame` (« une seule action de clôture… et le seul point d'écriture de l'historique »).
  - [ ] 4.4 Tests `useGameStore.test.ts`, `describe('useGameStore — historique (Story 3.1)')`, `beforeEach: setActivePinia(createPinia()); await db.games.clear()`. Après chaque `finishGame`, attendre l'écriture : `await vi.waitFor(async () => expect(await db.games.count()).toBe(1))` (Vitest 5) ; **timers réels** dans ce bloc (voir Dev Notes › fake timers).
    - fin détectée par le jaune (`{100, 80}`, jaune valide 80) → `VOIR LE RÉCAP` → une ligne : `mode`, `player1`/`player2` (`name`, `score`, `targetScore`, `average`, `bestSeries`, `reprises` **égaux** à `store.averages`/`bestSeries`/`repriseCounts`), `winner: 'player2'`, `ending: 'distance'`, `equalizingReprise: false`, `reprises` `toEqual(store.reprises)`, `scoreAdjustments`, `startedAt === store.startedAt`, `finishedAt === store.finishedAt` ;
    - blanc à sa distance → `FIN DE PARTIE` sur l'offre (`finishGame` avec `equalizing-offer`) → `winner: 'player1'`, `ending: 'distance'`, `equalizingReprise: false` ;
    - égalisatrice acceptée puis égalisée → `winner: null`, `equalizingReprise: true` ; perdue → `winner: 'player1'`, `equalizingReprise: true` ;
    - sortie confirmée (`finishGame()` sans `endPrompt`, après deux séries et un `+`) → `ending: 'manual'`, `winner` au prorata, `scoreAdjustments` reflétés, `score = Σ reprises + ajustement` ;
    - partie 3 Bandes au `+1` (`incrementSeries` jusqu'à la distance du jaune) → `mode: '3bandes'`, `reprises` cohérentes ;
    - FR5 : deux parties (`finishGame`, `rematch`, `finishGame`) → deux lignes, la première `toEqual` sa lecture d'avant la seconde ; `resetGame`, `startGame`, `restartGame`, `discardSavedGame` → `count()` inchangé, aucune nouvelle ligne ;
    - `restartGame` puis sortie d'un scoreboard intact (`resetGame`) → `count() === 0` ;
    - restauration d'une partie `finished` (`checkSavedGame` + `resumeGame` sur un pinia neuf, motif du bloc « persistance ») → `count()` inchangé ;
    - `finishGame` hors `playing` → rien d'écrit ;
    - enregistrement **plain** : `isProxy(record)`/`isProxy(record.player1)`/`isProxy(record.scoreAdjustments)`/`isProxy(record.reprises)` faux — capturés par un spy `vi.spyOn(useHistoryStore(), 'recordGame')` ; et aucun `console.error` pendant une clôture nominale (spy `console.error` + `not.toHaveBeenCalled`) — c'est ce test qui attrape un `DataCloneError` avalé par le service ;
    - échec d'écriture (spy `db.games.add` rejeté) → `status === 'finished'`, `winner` posé, un `console.error`, aucune exception.
  - [ ] 4.5 `GameView.test.ts` : **un** test d'intégration au geste — partie jouée au DOM jusqu'à « PARTIE TERMINÉE », `prompt-primary` → récap affiché **et** une ligne dans `db.games` (timers réels, `vi.waitFor`). Rien d'autre : la vue ne change pas.

- [ ] **Task 5 — Passe de validation en navigateur, réduite (CLAUDE.md §9)** : aucun rendu n'est modifié, une seule passe sur un seul format suffit (1024×768). Parcours : partie JDS → distance atteinte → `VOIR LE RÉCAP` → DevTools › Application › IndexedDB › `1score` › `games` : une ligne complète ; `UNE PARTIE DE PLUS` → sortie confirmée → deux lignes, `ending: 'manual'` sur la seconde ; `FIN DE PARTIE` → `⌘R` → les deux lignes sont toujours là ; RECOMMENCER sur une partie entamée → aucune ligne de plus ; partie 3 Bandes au `+1` → troisième ligne `mode: '3bandes'`. Console vierge. **Aucun harnais ni capture nécessaire.**

- [ ] **Task 6 — Specs (AC: 9)**
  - [ ] 6.1 `architecture.md` › « Architecture des Données › Historique » : remplacer l'esquisse `GameRecord` par la forme livrée (Task 1.1) avec note datée « *(révisé le 2026-09-11, Story 3.1 : par côté, + distance, vainqueur, type de fin, égalisatrice, corrections ; stats dénormalisées depuis les computeds du store)* » ; paragraphe « Historique (Story 3.1) » sous « Persistance (Story 1.12) » : base `1score`, table `games`, index `++id, finishedAt`, règle de version Dexie, déclencheur `finishGame`, `void recordGame`, fin manuelle enregistrée, deux sorties sans récap non enregistrées, `fake-indexeddb` en `setupFiles`. Arborescence : `history.ts`, `databaseService.ts`, `useHistoryStore.ts` (+ tests), `vitest.setup.ts` marqués livrés ; note « Patterns Gestion d'État & Erreurs » : le `error` ref de l'exemple `loadHistory` n'est **pas** adopté (le service renvoie `null`/`[]`, précédent `storageService` 1.12).
  - [ ] 6.2 `epics.md` › Story 3.1 : note datée « ✅ Tranché (2026-09-11) » reprenant la décision 2 de l'encadré (fin manuelle enregistrée `ending: 'manual'`, sorties sans récap non enregistrées, pas de nouveau chemin, RECOMMENCER n'écrit rien) ; › Story 3.5 : une ligne « exclure `ending: 'manual'` des records (3.1) » ; › AR5 : « `types/history.ts` créé en 3.1 (n'avait pas été scaffoldé) ».
  - [ ] 6.3 `deferred-work.md` : entrée « Deferred from: bmad-create-story 3-1 » avec les points de la section Dev Notes › « Hors périmètre, consigné » ; marquer la note 1.15 « quitter sans récap reporté à la 3.1 » comme **✅ close en 3.1** (aucun nouveau chemin).
  - [ ] 6.4 `CLAUDE.md` › Stack technique : une ligne « **Tests** : IndexedDB est fourni par `fake-indexeddb` via `vitest.setup.ts` (`setupFiles`) — Dexie résout `indexedDB` à l'import, ne jamais l'importer avant le polyfill ; les tests qui attendent une écriture IndexedDB utilisent des timers réels. » ; §3 : citer `databaseService.ts` comme désormais existant avec le motif `Promise<T | null>`.
  - [ ] 6.5 `sprint-status.yaml` : `3-1-…` → `review` ; `last_updated`.

- [ ] **Task 7 — Qualité** : `npm test` (501 tests / 17 fichiers au départ, HEAD `6cae5a0`), `npx vue-tsc -b`, `npm run build` verts ; **une seule** dépendance ajoutée (`fake-indexeddb`, dev) ; aucun harnais résiduel ; `git status` propre hors fichiers de la story.

## Dev Notes

### Ce qui existe déjà et qu'on ne réinvente pas

- **La clôture est déjà unique** : `finishGame()` (`useGameStore.ts`, section « Fin de partie ») déduit le vainqueur du contexte — `endPrompt.kind === 'over'` → `endPrompt.winner` ; `'equalizing-offer'` → `'player1'` (refus) ; `null` → `prorataWinner()` (fin manuelle). C'est exactement la distinction `ending` : **`null` ⇔ manuel**. Ne pas ajouter de paramètre à `finishGame` ni de champ à `GameState`.
- **Les stats sont déjà calculées** : `averages`, `bestSeries`, `repriseCounts` sont les computeds que `GameSummary` reçoit en props depuis `GameView`. L'enregistrement doit porter **les mêmes valeurs** — les lire, pas les recalculer (une divergence récap/historique serait un bug visible en 3.3).
- **Le motif service est déjà écrit** : `storageService.ts` (1.12) — un seul point de contact, `try/catch` + `console.error('[storage] …')`, échec absorbé, rien vers le joueur. `databaseService.ts` en est le jumeau async (`[database]`), avec le retour `null` de l'exemple CLAUDE.md §5 (`fetchRecentGames` renvoie `[]`).
- **`resumeGame` d'une partie `finished`** (1.12, AC3 : « une partie `finished` revient sur son récap ») ne rappelle pas `finishGame` : pas de doublon, rien à faire. Si l'écriture IndexedDB avait échoué à la clôture, l'enregistrement est perdu — accepté (filet de sécurité, AR12).
- **`toRaw`/copies** : `takeSnapshot` et `persistedState` documentent l'invariant « remplacer, jamais muter ». Ici on **copie** : l'enregistrement quitte le store et vit dans IndexedDB.

### Pièges connus

- **`DataCloneError` silencieux.** `player1.value` est un Proxy (`ref<Player>`), `scoreAdjustments.value` aussi. `structuredClone(proxy)` lève (vérifié sous Node 24 le 2026-09-11 : `structuredClone(ref({...}).value)` → `DataCloneError`, `structuredClone({ ...ref.value })` → OK, `isProxy` faux) ; Dexie propage ; le service **absorbe** ; la partie continue… sans historique, sans rien voir sauf un `console.error`. D'où l'AC8, la construction à partir de primitives, et le test « aucun `console.error` en clôture nominale ».
- **Fake timers et IndexedDB.** `fake-indexeddb` 6.2.5 planifie ses transactions sur `setImmediate` sous Node, `setTimeout(0)` sinon (vérifié dans `build/esm/lib/scheduling.js` le 2026-09-11 ; le paquet exclut explicitement `queueMicrotask`/`nextTick`, les sémantiques IndexedDB l'interdisent) ; `vi.useFakeTimers()` (huit blocs de `GameView.test.ts`, un de `useGameStore.test.ts` et `useTimer.test.ts`) **fake `setImmediate` par défaut** : une écriture lancée sous timers simulés reste en attente et n'est jamais commise. Sans conséquence pour les tests existants (rien n'attend cette promesse — vérifier qu'aucun `console.error` n'apparaît et que la suite reste verte), mais **tout test qui lit la table** doit tourner en timers réels ou faire `await vi.runAllTimersAsync()` avant `vi.waitFor`. Si un test existant devient bavard ou instable à cause d'écritures en suspens entre tests, isoler : `afterEach(() => vi.useRealTimers())` est déjà le motif du fichier.
- **`Dexie.dependencies` capturé à l'import.** Remplacer `globalThis.indexedDB` après coup (par ex. `new IDBFactory()` en `beforeEach`) ne touche pas Dexie. Isolation entre tests : `await db.games.clear()`. Chaque fichier de test a son propre environnement (happy-dom créé 17 fois) : l'état du polyfill ne fuit pas entre fichiers.
- **`vi.restoreAllMocks()` ne restaure pas certains `mockImplementation`** (Debug Log 2.2) : un spy `db.games.add` doit être `mockRestore()` en `afterEach`, pas en fin de corps de test.
- **`EntityTable<GameRecord, 'id'>`** : `GameRecord.id` est `number` (non optionnel) ; Dexie rend `id` optionnel à l'insertion via `InsertType`. `GameRecordInput = Omit<GameRecord, 'id'>` est le type que le store construit — `add()` l'accepte tel quel.
- **Import par défaut de `dexie`** : `import Dexie from 'dexie'` est l'API de la bibliothèque ; AR15 (« jamais de default export ») porte sur **nos** modules.
- **iOS Safari** : Dexie/IndexedDB fonctionne ; l'éviction après 7 jours sans usage (ITP) ne s'applique pas à une PWA installée sur l'écran d'accueil. À creuser en 3.4 (rétention), pas ici.
- **`noUncheckedSideEffectImports`** est actif : `import 'fake-indexeddb/auto'` doit résoudre — c'est le cas (export `./auto` du paquet).

### Hors périmètre, consigné

- Lecture, liste, tri, détail, état vide, routes `/history` et `/history/:id`, `HistoryView`/`GameDetailView`/`HistoryList` (3.2, 3.3) ; rétention 30 jours et purge (3.4) ; records (3.5).
- Pas de nouveau chemin « quitter sans récap » (report 1.15 clos, décision 2). Si Nathan veut à terme un vrai abandon (partie jetée sans récap), ce sera une story dédiée qui **n'appellera pas** `finishGame`.
- Pas de bornage de la pile d'annulation persistée (revue 1.12/2.2), pas de `navigator.storage.persist()`, pas de migration Dexie (version 1 seule), pas d'index sur les noms (la 3.5 ajoutera `player1.name`/`player2.name` en `version(2)` si elle en a besoin — Dexie indexe les chemins pointés).
- Le `error` ref du pattern architecture (`loadHistory`) n'est pas adopté ; consigné en 6.1.

### Project Structure Notes

Nouveaux : `src/types/history.ts`, `src/services/databaseService.ts` (+ `.test.ts`), `src/stores/useHistoryStore.ts` (+ `.test.ts`), `1score/vitest.setup.ts`. Modifiés : `src/stores/useGameStore.ts` (+ test), `src/views/GameView.test.ts`, `vitest.config.ts`, `tsconfig.node.json`, `package.json`/`package-lock.json` (`fake-indexeddb` dev), `architecture.md`, `epics.md`, `deferred-work.md`, `CLAUDE.md`, `sprint-status.yaml`. **Non touchés** : `GameView.vue`, `GameSummary.vue`, `router/index.ts`, `types/game.ts`, `storageService.ts`. Conventions : services `camelCase + Service`, stores `use…Store`, tests co-localisés, exports nommés, `async/await` seul, mutation par actions.

### References

- [Source: epics.md › Epic 3 (notes d'implémentation), Story 3.1 (3 AC + note 1.15 « à traiter ici »), Story 3.5 (dépendance sur 3.1), AR4, AR5, AR7, AR12, AR15-AR18, FR5, FR18-FR20, UX-DR23]
- [Source: architecture.md › « Architecture des Données › Historique » (esquisse `GameRecord`, `types/history.ts`), « Persistance (Story 1.12) », « Patterns Gestion d'État & Erreurs », « Analyse d'Impact » (séquence types → services → stores), « Arborescence Complète », « Points d'Intégration »]
- [Source: prd.md l. 65 (30 jours), 236, 379 (FR5), 398-403 (FR17-FR20)]
- [Source: ux-design-specification.md › Flow 3 (récap → historique), fiche GameSummary (état record 3.5), « HistoryList / GameDetailView », « États vides »]
- [Source: 1-10 story — Décision 4 (prorata, « abandon = défaite, etc. viendront plus tard »), Décision 9 (`finishGame` seule clôture), AC17 (`records` non déclenché)] ; [1-12 story — `resumeGame` d'une partie `finished`, motif `storageService`, Debug Log (spies happy-dom)] ; [1-15 story — cadrage 3 (« quitter sans récap » reporté à la 3.1), AC8 (RECOMMENCER n'enregistre rien)] ; [2-2 story — Debug Log (`mockRestore` explicite)]
- [Source: deferred-work.md — revue 1.12 « garde superficielle… à revoir si le format est lu par un autre écrivain (Epic 3) » (sans objet : l'historique ne relit pas `localStorage`) ; 1.15 « quitter sans récap » ; 2.2 pile persistée]
- [Source: 1score/src/stores/useGameStore.ts — `finishGame`, `prorataWinner`, `checkEndOfGame`, `rematch`, `restartGame`, `resetGame`, `resumeGame`, computeds `averages`/`bestSeries`/`repriseCounts` ; src/services/storageService.ts (motif AR12) ; src/services/storageService.test.ts (`APP_SOURCES` `?raw`) ; src/types/game.ts (`Reprise`, `PlayerId`, `GameMode`) ; vitest.config.ts ; tsconfig.node.json ; CLAUDE.md §1, §3, §5, §6, §9]
- [Source: sondes du 2026-09-11 — happy-dom 20.14.0 sans `indexedDB` (`structuredClone` présent) ; dexie 4.4.5 installé (4.4.6 dispo) ; fake-indexeddb 6.2.5 (engines `node >= 18`, export `./auto`, planification `setImmediate`/`setTimeout(0)`) ; Node 24.13 ; `structuredClone` d'un Proxy Vue → `DataCloneError` ; 501 tests / 17 fichiers verts à HEAD `6cae5a0`]
- [Source: mémoires « tablette-allumee-h24-resilience-filet-de-securite » (périmètre minimal, pas de questions fines), « questionner-la-raison-detre-dune-story », « nom-saisi-a-la-main-est-un-invite » (noms = invités : l'enregistrement porte des noms libres, la 3.5 comparera par nom)]

## Change Log

| Date | Changement |
|---|---|
| 2026-09-11 | Recadrage (bmad-correct-course) : parties rattachées au profil joueur, Epic 4 avant Epic 3 ; story non lancée, statut `backlog`. |
| 2026-09-11 | Création (bmad-create-story) : fondation historique — `types/history.ts`, `databaseService.ts` (Dexie 4, `fake-indexeddb` en tests), `useHistoryStore.recordGame`, déclencheur `finishGame` ; fin manuelle enregistrée `ending: 'manual'` ; `GameState` inchangé ; Epic 3 passé `in-progress`. Statut `ready-for-dev`. |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
