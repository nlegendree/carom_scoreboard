# Story 1.12: Préserver l'état de la partie en cas de fermeture accidentelle

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **Cadrage avec Nathan (2026-09-10) — feature de filet de sécurité, à développer vite.** La cible est une tablette de club qui tourne quasiment 24 h/24 : la fermeture accidentelle est rare. La persistance sert surtout au **rechargement** (mise à jour de la PWA par le Service Worker, `⌘R`, onglet tué par l'OS) et ne mérite pas plus d'une demi-journée. Décisions :
> 1. **Au lancement, si une partie est sauvegardée, une pop-up** `PromptModal` « PARTIE EN COURS » propose `REPRENDRE LA PARTIE` (→ scoreboard tel qu'il était) ou `ANNULER` (→ accueil, sauvegarde effacée).
> 2. **Tout l'historique des actions de la partie est sauvegardé** — la pile d'annulation complète (`history`) est persistée et restaurée : après une reprise, `ANNULER` remonte les actions d'avant la fermeture, comme si rien ne s'était passé. *(Précisé par Nathan après une première lecture « partie seule ».)*
> 3. **Fermeture pendant la saisie** → à la reprise, **la pop-up de saisie se rouvre** avec les chiffres déjà tapés. `entryOpen` monte donc de `GameView` dans le store pour être persisté.
> 4. Aucune limite d'âge : une sauvegarde de la veille est proposée telle quelle.
>
> Au passage, cette story **fixe le format persisté** reporté ici par les Stories 1.7, 1.9 et 1.10 : `GameState` reçoit `scoreAdjustments`, `sidesSwapped`, `history`, `endPrompt`, `entryOpen` ; `isNegative` (inerte, 1.9 annulée) est retiré.

## Story

As a joueur,
I want que l'état de ma partie soit sauvegardé après chaque action et proposé à la reprise au lancement suivant,
so that fermer ou recharger l'application ne fasse jamais perdre ma progression (FR6, NFR5, AR4).

## Acceptance Criteria

1. **Given** une partie en cours ou terminée **When** j'effectue n'importe quelle action de jeu — série validée, main rendue, correction `−`/`+`, `ANNULER`, `ÉCHANGER`, acceptation de l'égalisatrice, fin de partie, revanche, ouverture/fermeture de la pop-up de saisie, frappe au pavé — **Then** l'état complet est écrit en `localStorage` dans le même tick, en **une seule écriture par action**, via `storageService.ts` et lui seul (aucun `localStorage` hors du service). Un état `idle` n'est jamais écrit : `resetGame()` **supprime** l'entrée.
2. **Given** l'application lancée avec une sauvegarde lisible **When** `GameView` s'affiche **Then** l'accueil est rendu derrière une pop-up `PromptModal` — titre « PARTIE EN COURS », CTA principal `REPRENDRE LA PARTIE`, CTA secondaire `ANNULER`, sans croix, voile inerte (règle des pop-ups de décision).
3. **Given** la pop-up **When** je tape `REPRENDRE LA PARTIE` **Then** le scoreboard revient **exactement où il en était** : mode, noms, distances, scores (corrections `−`/`+` comprises — sans `scoreAdjustments`, la série suivante les effacerait), reprises et numéro de `REP`, joueur qui a la main (liseré et `AJOUTER LES POINTS` du bon côté), côtés échangés, reprise égalisatrice en cours, pop-up de fin (`endPrompt`) si elle était ouverte, **pop-up de saisie rouverte avec son buffer** si elle l'était (son compte à rebours de 3 s repart, comme à toute réouverture avec un buffer non vide). Une partie `finished` revient sur son récap. `ANNULER` de la console **remonte les actions d'avant la fermeture** (pile persistée intégralement), parité des côtés respectée après un `ÉCHANGER` antérieur.
4. **Given** la pop-up **When** je tape `ANNULER` **Then** la sauvegarde est supprimée et l'accueil reste affiché, prêt pour une nouvelle partie.
5. **Given** aucune sauvegarde, ou une sauvegarde illisible (JSON corrompu, version inconnue, forme inattendue, `status: 'idle'`) **When** l'application démarre **Then** l'accueil s'affiche sans pop-up ; une sauvegarde illisible est supprimée avec un `console.warn`.
6. **Given** un `localStorage` défaillant (quota, navigation privée, API qui lève) **When** une écriture ou une lecture échoue **Then** l'erreur est absorbée dans `storageService.ts` (`try/catch` + `console.error('[storage] …')`), jamais dans le store ni un composant ; la partie continue normalement en mémoire, sans message au joueur (AR12).
7. **Given** `types/game.ts` **When** je lis `GameState` **Then** c'est exactement la forme persistée : + `scoreAdjustments`, `sidesSwapped`, `history: GameSnapshot[]`, `endPrompt`, `entryOpen` ; − `isNegative` (retiré aussi de `GameSnapshot`, `mirrorSnapshot`, du store et des tests).
8. **Given** les specs **When** je lis `architecture.md`, `epics.md`, `ux-design-specification.md`, `deferred-work.md` **Then** les décisions ci-dessus y sont consignées par notes datées (voir Task 6).

## Tasks / Subtasks

- [x] **Task 1 — Types (AC: 7)**
  - [x] 1.1 `types/game.ts` : `GameState` + `scoreAdjustments: { player1: number; player2: number }`, `sidesSwapped: boolean`, `history: GameSnapshot[]`, `endPrompt: EndPrompt | null`, `entryOpen: boolean` ; − `isNegative`. `GameSnapshot` − `isNegative` ; mettre à jour son commentaire (« absent de `GameState` tant que la 1.12 n'a pas tranché » → la pile **est** persistée intégralement, décision de Nathan, 2026-09-10).
  - [x] 1.2 `useGameStore.ts` : retirer `isNegative` (l. 78-81 `mirrorSnapshot`, 100, 139, 149, 189, 234-237, 505, 563, 583). `useGameStore.test.ts` « mirrors a snapshot… » (l. 977, 1000) sans `isNegative`.

- [x] **Task 2 — `storageService.ts` (AC: 1, 5, 6)**
  - [x] 2.1 Créer `src/services/storageService.ts` (supprimer `.gitkeep`). Exports nommés : `GAME_STORAGE_KEY = 'carom-scoreboard:game'`, `GAME_STORAGE_VERSION = 1`, `interface PersistedGame { version: number; savedAt: number; state: GameState }`, `saveGameState(state)` (pattern exact de CLAUDE.md §3), `loadGameState(): GameState | null` (`getItem` → `JSON.parse` → garde `isPersistedGame` ; illisible → `console.warn` + `clearGameState()` + `null` ; exception → `console.error` + `clearGameState()` + `null`), `clearGameState()` (`removeItem` sous `try/catch`). Garde structurelle minimale, pas de Zod : `version === 1`, `state.status ∈ {'playing','finished'}`, `player1`/`player2` objets, `Array.isArray(reprises)`, `Array.isArray(history)`, `scoreAdjustments` objet, `typeof sidesSwapped/equalizingReprise/entryOpen === 'boolean'`.
  - [x] 2.2 Tests `storageService.test.ts` (`beforeEach: localStorage.clear(); vi.restoreAllMocks()`, spies `console.*` avec `mockImplementation(() => {})`) : aller-retour `toEqual` ; enveloppe `version`/`savedAt` ; `null` si vide ; JSON corrompu, version 0, `status: 'idle'`, `reprises: 'x'` → `null` + clé supprimée ; `setItem` qui lève (`QuotaExceededError`) → pas d'exception, `console.error` ; `getItem` qui lève → `null` ; `?raw` sur `GameView.vue`, `HomeScreen.vue`, `useGameStore.ts` : `not.toContain('localStorage')`.

- [x] **Task 3 — Store (AC: 1, 3, 4, 5, 7)**
  - [x] 3.1 `entryOpen = ref(false)` + actions `openScoreEntry(playerId)` (garde `playing` ; vide le buffer, `entryOpen = true`) et `closeScoreEntry()` (`entryOpen = false`). `startGame`/`resetGame`/`finishGame` le remettent à `false`. Le buffer reste dans `currentInput` (déjà persisté).
  - [x] 3.2 `persistedState = computed<GameState>(() => ({ …tous les champs, `history: history.value` compris… }))` — TypeScript refuse l'objet incomplet, c'est la garantie. `currentInput`/`scoreAdjustments` en copie `{ ...x.value }`. Pas de bornage de la pile à l'écriture : `MAX_UNDO_DEPTH = 1000` suffit (voir Dev Notes, taille).
  - [x] 3.3 `watch(persistedState, (state) => state.status === 'idle' ? clearGameState() : saveGameState(state))` — flush `pre` (défaut) : une écriture par action, dans le même tick. **Pas** `immediate`, **pas** `sync`, pas de `$subscribe`. Aucun `beforeunload`/`pagehide` (iPadOS tue une PWA sans les envoyer ; rien ne reste à écrire).
  - [x] 3.4 Reprise en trois actions, état `pendingRestore = ref<GameState | null>(null)` exposé :
    - `checkSavedGame()` : garde `idle` ; `pendingRestore = loadGameState()`. Appelée par `main.ts`.
    - `resumeGame()` : garde `pendingRestore !== null && status === 'idle'` ; assigne tous les champs (joueurs **restampés** `{ ...saved.player1, id: 'player1', color: 'white' }` — id/couleur appartiennent au côté), `history = saved.history` (remplacement du `shallowRef`, jamais `push`), `sidesSwapped = saved.sidesSwapped` (sans lui, les snapshots pris avant un `ÉCHANGER` seraient restaurés du mauvais côté), `status` **en dernier**, `pendingRestore = null`.
    - `discardSavedGame()` : `clearGameState()`, `pendingRestore = null`.
  - [x] 3.5 Tests `useGameStore.test.ts`, `describe('useGameStore — persistance')`, `beforeEach: setActivePinia(createPinia()); localStorage.clear(); vi.restoreAllMocks()`, `saved = () => JSON.parse(localStorage.getItem(GAME_STORAGE_KEY)!).state`, **`await nextTick()` après chaque action** (flush `pre`) :
    - sauvegarde après `startGame`, série validée, `passTurn`, `adjustScore`, `swapPlayers`, `undoLastAction`, `appendScoreDigit` (buffer `'7'`), `openScoreEntry` (`entryOpen` vrai), `acceptEqualizingReprise`, `finishGame`, `rematch` — un champ discriminant par action ;
    - une seule écriture par action (spy `Storage.prototype.setItem`, `toHaveBeenCalledTimes(1)` sur une série validée) ; store neuf → aucune clé ; `resetGame` → clé supprimée ;
    - reprise exacte : scénario `{100, 80}` blanc `7`, jaune `3`, `+2` blanc, `swapPlayers`, blanc `4`, `openScoreEntry` + `appendScoreDigit(5)` ; nouveau pinia, `checkSavedGame()` → `pendingRestore` non nul, `status` toujours `idle` ; `resumeGame()` → `toEqual` champ à champ (`mode`, `status`, joueurs, `activePlayer`, `reprises`, `scoreAdjustments`, `sidesSwapped`, `history`, `startedAt`, `equalizingReprise`, `winner`, `finishedAt`, `endPrompt`, `entryOpen`, `currentInput`), `canUndo` **vrai** ; puis `validateScoreInput` → total = précédent + valeur (corrections comprises) ; `undoLastAction()` ×3 → l'état d'avant les actions **d'avant la fermeture** (score, `activePlayer`, `reprises`), et l'annulation d'un snapshot pris avant le `swapPlayers` laisse les joueurs où ils sont (parité, motif de « keeps the sides as they are when undoing a series recorded before a swap ») ;
    - `endPrompt` restauré (offre d'égalisatrice, puis `acceptEqualizingReprise` fonctionne) ; égalisatrice en cours restaurée ; partie `finished` restaurée (`rematch` fonctionne) ;
    - `discardSavedGame()` → clé supprimée, `idle`, `pendingRestore` nul ; `checkSavedGame()` sur storage vide → nul ; `checkSavedGame()`/`resumeGame()` sur un store en partie → no-op ;
    - joueurs restampés (sauvegarde manipulée `player1.color = 'yellow'`) ;
    - `setItem` qui lève → la partie continue, `console.error`, pas d'exception.

- [x] **Task 4 — `main.ts` et `GameView` (AC: 2, 3, 4)**
  - [x] 4.1 `main.ts` : `const pinia = createPinia(); app.use(pinia); app.use(router); useGameStore(pinia).checkSavedGame(); app.mount('#app')`.
  - [x] 4.2 `GameView.vue` : `entryOpen` local → `storeToRefs` ; `openEntry()` → `gameStore.openScoreEntry(activePlayer.value)` ; `closeEntry()` → `gameStore.closeScoreEntry(); lockPanels()` ; `cancelEntry`/`validateEntry` inchangés dans l'esprit. Dans la branche `idle`, sous `HomeScreen` : `<PromptModal v-if="pendingRestore" title="PARTIE EN COURS" primaryLabel="REPRENDRE LA PARTIE" secondaryLabel="ANNULER" @primary="gameStore.resumeGame()" @secondary="gameStore.discardSavedGame()" />`. Pas de grâce anti-tap fantôme nécessaire : `REPRENDRE` remplace l'accueil par le scoreboard sous le doigt — **si** un test montre qu'un `pointerup` retombe sur un panneau, ajouter `lockPanels()` ; sinon rien.
  - [x] 4.3 Tests `GameView.test.ts`, `describe('GameView — reprise après fermeture')` (helper : jouer sur un premier pinia, `nextTick`, `setActivePinia(createPinia())`, `checkSavedGame()`, `mount`) : pop-up « PARTIE EN COURS » par-dessus `step-category` ; `prompt-primary` → `PlayerPanel` ×2, `score` `'9'`/`'3'`, `reprise-number`, liseré et `add-points-button[data-side]` corrects, `undo-button` **actif** et un appui remonte bien l'action d'avant rechargement ; `prompt-secondary` → accueil, clé supprimée ; saisie ouverte avant fermeture → `ScoreEntryModal` monté avec la valeur `'5'` après `REPRENDRE` ; offre d'égalisatrice de retour ; récap de retour ; storage vide → pas de pop-up ; sauvegarde corrompue → pas de pop-up, clé supprimée. Les tests existants qui lisent `entryOpen` (s'il y en a) passent par le store.

- [x] **Task 5 — Passe visuelle (CLAUDE.md §9)** : une seule, 1024×768 et 768×1024. Parcours : partie, 3 séries + `+` + `ÉCHANGER` → `⌘R` → pop-up → `REPRENDRE` → scoreboard identique, `ANNULER` ×2 remonte les actions d'avant rechargement ; saisie ouverte avec `7` → `⌘R` → `REPRENDRE` → pop-up de saisie avec `7` ; offre d'égalisatrice → `⌘R` → offre de retour ; récap → `⌘R` → récap ; `FIN DE PARTIE` → `⌘R` → accueil sans pop-up ; `⌘R` en partie → `ANNULER` → accueil, clé absente (DevTools › Application › Local Storage). Console vierge.

- [x] **Task 6 — Specs (AC: 8)** : `architecture.md` (bloc `GameState`, note store/`endPrompt` « restaurée en 1.12 », paragraphe « Persistance (Story 1.12) » : clé, enveloppe versionnée, `watch`, pile persistée intégralement, pop-up de reprise) ; `epics.md` (Story 1.12 : note datée des quatre décisions ; Story 1.9 : « retiré en 1.12 ») ; `ux-design-specification.md` (Flow 1 : nœud « Reprendre la partie » = pop-up `REPRENDRE LA PARTIE` / `ANNULER` ; fiche `PromptModal` : cinquième usage) ; `deferred-work.md` (revue 1.10 « `endPrompt` absent de `GameState` » → traité ; revue 1.7 « `isNegative` » → supprimé ; revue 1.3 « paires de substitution … persistance » → inoffensif, `JSON.stringify` échappe les surrogates orphelins depuis ES2019) ; `sprint-status.yaml` → `review`.

- [x] **Task 7 — Qualité** : `npm test`, `npx vue-tsc -b`, `npm run build` verts ; aucune régression sur les **306 tests / 13 fichiers** ; aucune dépendance ; `.gitkeep` et harnais supprimés.

### Review Findings

- [x] [Review][Patch] Une écriture échouée (quota) laisse une sauvegarde PÉRIMÉE, proposée ensuite comme « PARTIE EN COURS » — `saveGameState` absorbe `QuotaExceededError` sans toucher à l'entrée précédente ; une fois le quota atteint, chaque écriture suivante échoue aussi et le joueur se voit proposer un état vieux de N actions. **Décision de Nathan (2026-09-10)** : supprimer l'entrée dans le `catch` de `saveGameState` (rien de périmé n'est jamais proposé ; le filet disparaît pour cette partie seulement), avec un test. [`storageService.ts:49-60`]
- [x] [Review][Patch] `pendingRestore` n'est vidé ni par `startGame` (donc `rematch`) ni par `resetGame`, et `discardSavedGame` n'a pas la garde `idle` de ses deux sœurs — une partie démarrée pendant une offre en attente (pilotage déporté, flux futur) écrase la sauvegarde puis, au retour en `idle`, re-propose un état dont l'entrée storage a déjà été remplacée ; `discardSavedGame` en partie supprime la sauvegarde vivante jusqu'à l'action suivante. Une ligne dans `startGame`, une garde dans `discardSavedGame`, un test. [`useGameStore.ts:174`, `useGameStore.ts:670`]
- [x] [Review][Patch] Les snapshots de `history` ne sont pas restampés à la reprise, contrairement aux joueurs vivants — un `ANNULER` après reprise réinstalle le `id`/`color` de la sauvegarde ; le test « restamps the players ids and colors » ne le voit pas car il ne fait pas d'undo. Soit restamper la pile (`map`) et étendre le test, soit assumer que le restampage des joueurs vivants est purement défensif. [`useGameStore.ts:658`]
- [x] [Review][Patch] Tests qui ne prouvent pas ce que leur titre affirme : « writes exactly once per action » regroupe deux `appendScoreDigit` et un `validateScoreInput` dans le même tick (batching par tick, pas par action — un `nextTick` entre chaque et un compte à 3) ; « ignores checkSavedGame and resumeGame while a game is on » n'exerce jamais la garde `status` de `resumeGame` (`pendingRestore` est déjà nul) ; « writes nothing while idle » ne détecterait pas un `immediate` (spy `removeItem`) ; « lets ANNULER undo… » avance 300 ms de façon inerte (aucune grâce après `REPRENDRE`) et le commentaire du `beforeEach` affirme le contraire ; le test `?raw` ne couvre que trois fichiers (un `import.meta.glob` sur `src/**` hors `services/` et tests le rendrait exhaustif). [`useGameStore.test.ts:1558,1692,1878`, `GameView.test.ts:978,1063`, `storageService.test.ts:12-14`]
- [x] [Review][Patch] Commentaires à rectifier ou compléter : l'en-tête de `storageService.ts` dit que « `main.ts` y lit au lancement » alors que `main.ts` ne l'importe pas (c'est `checkSavedGame` du store) ; `persistedState` ne suit `player1`/`player2`/`reprises`/`history` que par REMPLACEMENT de `.value` (l'invariant « remplacer, jamais muter » de `takeSnapshot` vaut aussi ici, une mutation en place ne déclencherait aucune écriture — à écrire une ligne) ; rien ne dit que tout changement de forme de `GameState` impose d'incrémenter `GAME_STORAGE_VERSION` (la garde ne liste qu'un sous-ensemble de champs : une v1 ancienne passerait et `resumeGame` poserait `undefined` dans une ref typée). [`storageService.ts:7`, `storageService.ts:14`, `useGameStore.ts:596`]
- [x] [Review][Defer] Garde structurelle superficielle : `mode`, `activePlayer`, `name`/`score`/`targetScore`, les cellules de `reprises`, les éléments de `history`, les chaînes de `currentInput`, les nombres de `scoreAdjustments`, `endPrompt`/`winner` ne sont pas vérifiés — une valeur incohérente à l'intérieur d'un champ passe et fait planter la vue au premier rendu ou au premier undo, hors du service (AR12). Injoignable sans manipuler le storage à la main ; garde minimale sans Zod = décision de cadrage de la story. [`storageService.ts:31-47`] — deferred, décision de story (filet de sécurité, dev rapide)
- [x] [Review][Defer] Chaque frappe au pavé resérialise toute la pile d'annulation (≈ 350 Ko pour 100 actions × 60 reprises) sur le thread principal, et `checkSavedGame` la reparse avant le premier rendu — risque déjà consigné en commentaire sur `MAX_UNDO_DEPTH`, bornage à l'écriture prévu avec le `+1` par point du 3 Bandes (Epic 2). [`useGameStore.ts:35`, `useGameStore.ts:621`] — deferred, pre-existing (noté dans le code)

## Dev Notes

- **Pourquoi un `watch` sur un `computed<GameState>`** : l'architecture dit « `storageService` dans watchers store » ; le type complet rend l'oubli d'un champ impossible, le flush `pre` regroupe les mutations d'une action en une écriture. Le prototype `explore/` faisait un debounce de 500 ms (`MECHANICS.md` §Persistance) : non repris, une écriture de quelques Ko est sans coût.
- **Taille de la pile persistée** : un snapshot sérialisé recopie tout le tableau des reprises (≈ 52 octets par reprise en JSON) : une partie de 60 reprises après 100 actions pèse ≈ 350 Ko, très au-dessus du repère « < 50 Ko » d'AR4 mais très en dessous des 5 Mo de quota. Le cas limite (1000 actions × 100 reprises ≈ 5 Mo) est théorique en JDS ; **noter le risque en commentaire** sur `MAX_UNDO_DEPTH` (à revoir avec le `+1` par point du 3 Bandes, Epic 2 — un bornage à l'écriture, `history.slice(-N)`, est alors une ligne). Si une écriture échoue, AR12 l'absorbe et la partie continue.
- **Pourquoi `entryOpen` monte dans le store** : c'est le seul moyen de rouvrir la pop-up de saisie à la reprise (décision 3). Le buffer y était déjà. `ScoreEntryModal` a un `watch` `immediate` sur `currentInput` : un buffer non vide au montage relance le compte à rebours de 3 s — comportement existant, cohérent.
- **`pendingRestore` porte l'état chargé** plutôt qu'un booléen : une seule lecture du storage, et `resumeGame()` n'a rien à relire. Le `watch` se déclenche après `resumeGame` et réécrit à l'identique : idempotent.
- **`status` posé en dernier** dans `resumeGame` : c'est lui qui fait basculer `GameView` ; tout le reste doit être en place avant.
- **Erreurs** : AR12, silence côté joueur (borne fixe). Une sauvegarde illisible est supprimée, sinon chaque lancement réavertirait.
- **Pièges connus** : `shallowRef` remplacé, jamais `push` ; copies défensives sur `scoreAdjustments`/`currentInput` ; `nextTick` avant de lire le storage ; `vi.restoreAllMocks()` en `beforeEach` (un spy `setItem` qui survit casse la suite) ; deux pinias par test de reprise ; tests discriminants sur le contenu réel de `localStorage` et sur le DOM.
- **Ce que la story ne fait pas** : pas d'historique (Epic 3, pas de `databaseService.ts`), pas de plugin Pinia, pas d'événement `storage` multi-onglets, pas de migration de version (une autre version est jetée), pas de limite d'âge, pas de `main.css`, pas de routeur.
- **Environnement** : happy-dom expose un `localStorage` fonctionnel (vérifié) qui persiste entre les tests d'un même fichier → `localStorage.clear()` en `beforeEach`. Node 24.13, Vue 3.5.42, Pinia 4.0.3, Vitest 5.0.0. Départ : 306 tests verts, `vue-tsc` vert, HEAD `83b9acf`. Aucune recherche web nécessaire.

### Project Structure Notes

Nouveaux : `src/services/storageService.ts`, `src/services/storageService.test.ts`. Modifiés : `src/types/game.ts`, `src/stores/useGameStore.ts` (+ test), `src/main.ts`, `src/views/GameView.vue` (+ test), `architecture.md`, `epics.md`, `ux-design-specification.md`, `deferred-work.md`, `sprint-status.yaml`. Supprimé : `src/services/.gitkeep`.

### References

- [Source: décisions de Nathan, 2026-09-10 (conversation) — pop-up de reprise, pile d'annulation persistée intégralement, pop-up de saisie rouverte, pas de limite d'âge, dev rapide]
- [Source: epics.md#Story 1.12 ; #Story 1.9 (`isNegative`) ; #Story 1.10 (`endPrompt` « pour que la 1.12 puisse la persister ») ; FR6, NFR5, AR4, AR12, AR15-17, UX-DR23]
- [Source: prd.md l. 66, 281, 380, 456] ; [architecture.md#Architecture des Données, #Patterns Gestion d'État & Erreurs, #Résultats de Validation « watchers store »]
- [Source: ux-design-specification.md#Flow 1, #Journey Patterns « Reprise après interruption », #PromptModal]
- [Source: deferred-work.md — revues 1.3 (surrogates, `Player.id`), 1.7 (`isNegative`), 1.10 (`endPrompt`)]
- [Source: carom-scoreboard/src/stores/useGameStore.ts:88-133, 141-162, 167-198, 555-573 ; src/types/game.ts:98-135 ; src/views/GameView.vue:39-113 (`entryOpen`, `openEntry`, `closeEntry`) ; src/main.ts]
- [Source: explore/resources/MECHANICS.md#Persistance] ; [CLAUDE.md §1, §3, §4, §6, §9] ; [mémoires « gros-cta-plutot-que-croix », « raisonner-en-tactile-tablette »]

## Change Log

| Date | Change |
|---|---|
| 2026-09-10 | Revue de code (bmad-code-review) : 1 décision (écriture échouée → entrée supprimée), 5 patches appliqués (clear à l'échec d'écriture, `pendingRestore` vidé par `startGame` + garde `idle` sur `discardSavedGame`, pile restampée à la reprise, tests renforcés — une écriture par action tick par tick, gardes exercées, `?raw` sur tout `src/` —, commentaires rectifiés + règle de version), 2 différés (garde structurelle superficielle, coût de la pile par action), 10 écartés. 380 tests verts, `vue-tsc` et `build` propres. Statut → done. |
| 2026-09-10 | Implémentation (bmad-dev-story) : `storageService.ts` + tests, `GameState` fixé (`isNegative` retiré), `watch` de persistance et reprise en trois actions dans le store, `entryOpen` monté dans le store, pop-up « PARTIE EN COURS » dans `GameView`, `main.ts` lit la sauvegarde avant le montage. 53 tests ajoutés (359 au total). Specs annotées. Passe visuelle 1024×768 et 768×1024. Statut → review. |
| 2026-09-10 | Précision de Nathan : la pile d'annulation complète est persistée et restaurée (`ANNULER` fonctionne après une reprise). |
| 2026-09-10 | Recadrage par Nathan : feature de filet de sécurité à développer vite ; pop-up `REPRENDRE LA PARTIE` / `ANNULER` au lancement ; pop-up de saisie rouverte avec son buffer (`entryOpen` dans le store) ; pas de limite d'âge. Story réécrite en version courte. |
| 2026-09-10 | Création de la story (bmad-create-story). |

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (claude-fable-5-1), session bmad-dev-story du 2026-09-10.

### Debug Log References

- **Spy `localStorage` dans happy-dom** : `vi.spyOn(Storage.prototype, 'setItem')` (prévu par la story) est inerte — le `localStorage` de happy-dom est un proxy dont les méthodes ne passent pas par le prototype (vérifié par sonde : spy instance → appelé, spy prototype → 0 appel). Les tests espionnent l'**instance** `localStorage` ; commentaire posé dans `storageService.test.ts`.
- **JSON corrompu = `console.warn`, pas `console.error`** : AC5 classe le JSON corrompu parmi les sauvegardes illisibles (warn + suppression). `loadGameState` sépare donc la lecture (`getItem` qui lève → `console.error`) du parsing (`parseJson` renvoie `undefined` → garde structurelle → warn). Léger écart avec la formulation « exception → console.error » de la Task 2.1, conforme à l'AC.
- **`scoreAdjustments` exposé en lecture** par le store : le test de reprise « champ à champ » de la Task 3.5 le lit ; il rejoint `history`/`sidesSwapped` dans le bloc « exposés en lecture, jamais à muter ».
- **`pendingRestore` en `shallowRef`** plutôt que `ref` (AR9) : rien à observer en profondeur, et les objets restent bruts jusqu'à leur adoption par les `ref` du store.
- **Passe visuelle** : la fenêtre Chrome (maximisée) refusait le redimensionnement ; la tablette a été émulée par une iframe **même origine** de 1024×768 puis 768×1024 (unités `dvh`/`vw` fidèles), pilotée par `pointerdown` sur les `data-testid`, rechargement par `location.reload()` de l'iframe. Tous les parcours de la Task 5 vérifiés dans les deux formats ; console vierge ; sauvegarde ≈ 2,3 Ko après 5 actions.

### Completion Notes List

- **Task 1** — `GameState` reçoit `scoreAdjustments`, `sidesSwapped`, `history`, `endPrompt`, `entryOpen` ; `isNegative` retiré de `GameState`, `GameSnapshot`, `mirrorSnapshot`, du store et des tests. Commentaire de `GameSnapshot` mis à jour (pile persistée intégralement).
- **Task 2** — `src/services/storageService.ts` : `GAME_STORAGE_KEY`, `GAME_STORAGE_VERSION = 1`, `PersistedGame`, `saveGameState`/`loadGameState`/`clearGameState`, garde structurelle minimale sans Zod. 17 tests : aller-retour, enveloppe, six formes illisibles (corrompu, version 0, `idle`, `reprises: 'x'`, pile absente, enveloppe non-objet) → `null` + clé supprimée + un `warn`, `setItem`/`getItem`/`removeItem` qui lèvent absorbés, `?raw` : aucun `localStorage` dans `GameView`, `HomeScreen`, `useGameStore`.
- **Task 3** — Store : `entryOpen` + `openScoreEntry`/`closeScoreEntry` (remis à `false` par `startGame`/`finishGame`/`resetGame`) ; `persistedState = computed<GameState>` complet ; `watch` flush `pre` (une écriture par action, `clearGameState` en `idle`) ; `pendingRestore` + `checkSavedGame`/`resumeGame`/`discardSavedGame` (joueurs restampés, pile remplacée, `status` en dernier). Commentaire de risque taille sur `MAX_UNDO_DEPTH`. 26 tests : une sauvegarde par action (11 actions), écriture unique par action, `resetGame` supprime, reprise exacte champ à champ avec `canUndo`, corrections conservées (7+2+5 = 14), `ANNULER` ×3 remonte les actions d'avant fermeture parité comprise, offre d'égalisatrice / égalisatrice en cours / partie `finished` restaurées, `discard`, no-op en partie, restampage, storage qui lève.
- **Task 4** — `main.ts` appelle `checkSavedGame()` avant `mount`. `GameView` : `entryOpen`/`pendingRestore` via `storeToRefs`, `openEntry`/`closeEntry` passent par les actions, `PromptModal` « PARTIE EN COURS » sous `HomeScreen` en `idle`. Aucune grâce anti-tap fantôme ajoutée (aucun test ne l'a réclamée). 10 tests : pop-up par-dessus l'accueil sans croix, scoreboard identique (scores, distance, `REP`, liseré, côté du CTA), `ANNULER` actif et efficace, `ANNULER` de la pop-up → accueil + clé supprimée, saisie rouverte avec `5` et compte à rebours, offre d'égalisatrice et récap de retour, storage vide / corrompu → pas de pop-up, `entryOpen` piloté par le store.
- **Task 5** — Passe visuelle en paysage et portrait (voir Debug Log) : partie 3 séries + `+` + `ÉCHANGER` → rechargement → pop-up → reprise identique, deux `ANNULER` remontent `+1` puis la série d'avant rechargement ; saisie ouverte avec `7` → rechargement → pop-up de saisie avec `7` ; offre d'égalisatrice, égalisatrice en cours, « PARTIE TERMINÉE » et récap tous de retour ; `FIN DE PARTIE` → rechargement → accueil sans pop-up, clé absente ; rechargement en partie → `ANNULER` → accueil, clé absente et plus de pop-up au rechargement suivant. Console vierge.
- **Task 6** — `architecture.md` (bloc `GameState`, note 1.12, paragraphe « Persistance (Story 1.12) », ligne NFR5), `epics.md` (Story 1.12 : cadrage et quatre décisions ; Story 1.9 : « retiré en 1.12 »), `ux-design-specification.md` (Flow 1, fiche `PromptModal` cinquième usage), `deferred-work.md` (surrogates inoffensifs, `isNegative` supprimé, `endPrompt` traité), `sprint-status.yaml` → `review`.
- **Task 7** — `npm test` : 14 fichiers, 359 tests verts (306 + 53) ; `npx vue-tsc -b` et `npm run build` verts ; aucune dépendance ajoutée ; `.gitkeep` supprimé, aucun harnais résiduel.

### File List

Nouveaux :
- `carom-scoreboard/src/services/storageService.ts`
- `carom-scoreboard/src/services/storageService.test.ts`

Modifiés :
- `carom-scoreboard/src/types/game.ts`
- `carom-scoreboard/src/stores/useGameStore.ts`
- `carom-scoreboard/src/stores/useGameStore.test.ts`
- `carom-scoreboard/src/main.ts`
- `carom-scoreboard/src/views/GameView.vue`
- `carom-scoreboard/src/views/GameView.test.ts`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-12-preserver-letat-de-la-partie-en-cas-de-fermeture-accidentelle.md`

Supprimé :
- `carom-scoreboard/src/services/.gitkeep`
