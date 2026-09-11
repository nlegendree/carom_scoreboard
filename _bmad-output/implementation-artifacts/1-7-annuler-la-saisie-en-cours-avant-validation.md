# Story 1.7: Annuler la saisie en cours avant validation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **Recadrée par Nathan le 2026-09-09, à la création.** Le titre reste celui de l'epic (clé de sprint), mais le sujet a changé :
> 1. **La pop-up de saisie ne bouge pas.** `C`, `⌫`, la croix et le tap en dehors couvrent FR8 ; un bouton `CORRIGER` supplémentaire n'apporterait rien. La première version de ce fichier (autour d'un bouton `CORRIGER`) est **caduque**.
> 2. **La story porte sur le bouton `ANNULER` de la console centrale**, qui existe depuis la 1.3 mais dont l'événement `undo` n'est écouté par personne. À chaque pression, il **revient d'une action en arrière** — un vrai *undo* multi-niveaux.
> 3. **`ÉCHANGER` n'est jamais annulé** : pour revenir, on rappuie dessus. Il n'entre pas dans la pile.
> 4. **Les pictos partent** : `ANNULER` et `ÉCHANGER` portent leur mot, rien d'autre. Et le libellé **`REPRISE` devient `REP`**.
> 5. **La Story 1.8 est absorbée** (validé par Nathan) : « annuler la dernière série validée » est le cas particulier « dernière action = une série ».

## Story

As a joueur (Michel qui se trompe de touche ou dont l'adversaire conteste un score),
I want revenir d'une action en arrière à chaque appui sur `ANNULER`,
so that aucune erreur — série mal saisie, main rendue par mégarde, correction de trop — ne reste jamais sans recours, sans recalcul ni stress.

## Acceptance Criteria

1. **Given** une partie en cours avec au moins une action enregistrée **When** j'appuie sur `ANNULER` **Then** la partie revient **exactement** à l'état d'avant la dernière action : reprises, totaux, corrections, joueur qui a la main — tout, et rien d'autre (FR9, UX-DR16 « après validation »).
2. **Given** plusieurs actions enregistrées **When** j'appuie sur `ANNULER` plusieurs fois **Then** chaque appui remonte d'**une** action de plus, dans l'ordre inverse, jusqu'au début de la partie ; une fois au début, le bouton est **désactivé** (grisé, inerte), jamais une action fantôme.
3. **Given** ce qui compte comme « une action » **When** j'observe ce qu'`ANNULER` défait **Then** ce sont exactement les **trois** gestes qui modifient le score ou le déroulé : une **série validée** (`VALIDER` ou auto-validation à 3 s), une **main rendue sans marquer** (tap sur la zone adverse, série de 0) et une **correction `−`/`+`** (un appui = une action). **`ÉCHANGER` n'est pas une action annulable** : on rappuie dessus pour revenir. Les frappes au pavé (`1`…`9`, `C`, `⌫`) et l'ouverture/fermeture de la pop-up ne modifient pas la partie et ne comptent pas.
4. **Given** une série annulée **When** je regarde l'écran **Then** le total du joueur est revenu à sa valeur d'avant, sa moyenne et sa meilleure série aussi, le **tour lui est rendu** (liseré rouge sur son panneau, `AJOUTER LES POINTS` de nouveau du côté adverse) et le compteur `REP` est recalculé — il peut redescendre. Il peut ressaisir immédiatement.
5. **Given** une série enregistrée, **puis** un `ÉCHANGER` **When** j'appuie sur `ANNULER` **Then** la série est défaite mais **les joueurs restent du côté où ils sont** : l'annulation ne ramène jamais un échange, et la main revient au joueur qui avait joué la série, **là où il se trouve maintenant**. Deux échanges entre-temps (retour à l'origine) : même règle, aucun effet de bord.
6. **Given** la console centrale **When** je lis ses boutons et son compteur **Then** `ANNULER` et `ÉCHANGER` n'affichent **que leur mot**, sans pictogramme (`↩` et `⇄` retirés), tous deux à ≥ 90×90 px (UX-DR8), `ANNULER` en style neutre et `ÉCHANGER` en accent système (UX-DR3, UX-DR11) ; le libellé au-dessus du numéro est **`REP`**, plus `REPRISE`.
7. **Given** une nouvelle partie ou un retour à l'accueil **When** elle démarre **Then** aucune action de la partie précédente n'est annulable — la pile repart vide. Hors partie (`status !== 'playing'`), `ANNULER` ne fait rien.
8. **Given** l'annulation exposée comme **action Pinia nommée** `undoLastAction()` **When** un pilotage déporté (V2+) ou un test l'appelle **Then** elle produit le même état que le bouton — jamais couplée au seul geste tactile (UX-DR23, AR17).
9. **Given** les specs (`epics.md`, `ux-design-specification.md`) **When** je lis les Stories 1.7 et 1.8, UX-DR16 et la fiche `CenterPanel` **Then** les décisions du 2026-09-09 y sont consignées : `CORRIGER` sans objet, `ANNULER` = retour d'une action, `ÉCHANGER` hors pile, pictos retirés, `REP`, 1.8 absorbée.

## Tasks / Subtasks

- [x] **Task 1 — Pile d'annulation dans `useGameStore.ts` (AC: 1, 2, 3, 5, 7, 8)**
  - [x] 1.1 Type `GameSnapshot` (dans `types/game.ts`, à côté de `GameState`) : `{ player1: Player; player2: Player; activePlayer; reprises: Reprise[]; scoreAdjustments: { player1: number; player2: number }; currentInput; isNegative; sidesSwapped: boolean }`. Tout ce que les trois actions peuvent toucher, plus la **parité des côtés** (voir 1.4). Rien de plus : `mode`, `status`, `startedAt` ne bougent jamais en partie.
  - [x] 1.2 `const history = shallowRef<GameSnapshot[]>([])` — même règle qu'AR9 pour `reprises` : tableau **remplacé** (`history.value = [...history.value, snap]`), jamais `push`. `takeSnapshot()` **copie** `scoreAdjustments`, `currentInput`, `isNegative` (objets mutés en place par `adjustScore` et `appendScoreDigit`) ; `player1`/`player2`/`reprises` peuvent être capturés par référence car ils sont **toujours remplacés**, jamais mutés (`recomputeScore`, `swapPlayers`, `addReprise`) — le noter en commentaire, c'est une invariante à maintenir.
  - [x] 1.3 `pushHistory()` appelé **en tête** de `validateScoreInput` (après la garde `buffer === ''`, sinon un `VALIDER` à vide empilerait une action fantôme — AC12 de la 1.5), de `passTurn` et d'`adjustScore`, après leurs gardes `status`. **Pas** dans `swapPlayers` (décision produit), **pas** dans `addReprise` (primitive bas niveau appelée par les deux premières), **pas** dans `switchTurn` (appelée par `validateScoreInput`/`passTurn` : une action, un snapshot).
  - [x] 1.4 `const sidesSwapped = ref(false)`, basculé par `swapPlayers`, remis à `false` par `startGame`/`resetGame`. ⚠️ **C'est ce qui empêche `ANNULER` de défaire un échange par effet de bord** : un snapshot pris avant un échange décrit les joueurs de leur ancien côté. `undoLastAction()` compare `snapshot.sidesSwapped` à la valeur courante ; si elles diffèrent, le snapshot est **mis en miroir** avant restauration — colonnes de `reprises` permutées, `player1`/`player2` échangés avec `id`/`color` restampés (comme `swapPlayers`), `scoreAdjustments`/`currentInput`/`isNegative` permutés, **et `activePlayer` inversé** (le joueur à qui la main revient est désormais de l'autre côté). Extraire le miroir en fonction pure `mirrorSnapshot(snapshot): GameSnapshot` testable seule. `sidesSwapped` lui-même n'est **pas** restauré par l'undo.
  - [x] 1.5 `undoLastAction()` : garde `status === 'playing'` ; dépile le dernier snapshot (no-op strict sur pile vide) ; miroir si parité différente (1.4) ; réassigne chaque champ (copies pour les objets mutables) ; `lastSaved` mis à jour. **Pas de recalcul** : le snapshot porte déjà des scores cohérents. Nom AR15 verbe+nom ; `undoLastSeries` de l'architecture était le nom du cas particulier — on livre le cas général.
  - [x] 1.6 `const canUndo = computed(() => history.value.length > 0)`, exposé par le store. `startGame` et `resetGame` remettent `history` à `[]`.
  - [x] 1.7 Plafond `MAX_UNDO_DEPTH = 200` (constante locale) : au-delà, le plus ancien snapshot est abandonné. Hygiène mémoire pour les sessions de 8 h (NFR3), aucune valeur d'usage au-delà.
  - [x] 1.8 Tests `useGameStore.test.ts` (nouveau `describe('undo')`, motif `startGame('libre', 'MICHEL', 'ANDRE')` des suites existantes) :
    - série validée → `undoLastAction()` → `reprises` vide, `player1.score` 0, `activePlayer` `'player1'`, `averages.player1` 0, `bestSeries.player1` 0, `canUndo` faux.
    - main rendue (`passTurn`) → undo → même chose.
    - `adjustScore('player1', 1)` **deux fois** → undo → `player1.score` **1** (et non 0 : prouve que le snapshot copie `scoreAdjustments` au lieu de l'aliaser).
    - **trois** actions (série, série, correction) → trois undos successifs remontent dans l'ordre inverse, chaque état intermédiaire vérifié ; le quatrième est un no-op.
    - `swapPlayers` **n'empile rien** : `startGame`, `swapPlayers` → `canUndo` faux.
    - **série puis échange puis undo** : MICHEL (gauche) valide 5 ; `swapPlayers` (ANDRE à gauche, MICHEL à droite) ; `undoLastAction()` → `reprises` vide, `player1.name` toujours `'ANDRE'`, `player2.name` `'MICHEL'`, `player2.score` 0, **`activePlayer === 'player2'`** (la main revient à MICHEL, là où il est), `sidesSwapped` toujours vrai.
    - **série, deux échanges, undo** : parité identique → aucun miroir, MICHEL à gauche avec la main.
    - correction sur MICHEL, échange, undo → la correction disparaît du **bon** joueur (MICHEL, maintenant `player2`), ANDRE intact.
    - `mirrorSnapshot` seul : entrée avec `reprises [{5, null}]`, `activePlayer 'player2'` → sortie `[{null, 5}]`, `'player1'`, `player1.id === 'player1'` et `color 'white'` après échange des objets.
    - `validateScoreInput` sur buffer vide **n'empile rien** (`canUndo` reste faux).
    - `startGame` et `resetGame` vident la pile et remettent `sidesSwapped` à faux ; `undoLastAction` en `idle` ne fait rien (étendre « ignores every game gesture while no game is playing »).
    - `computeds` notifiés après undo (motif « notifies computeds derived from reprises ») : `completedReprises` redescend.
    - plafond : 201 corrections → `history.length === 200`.
  - [x] 1.9 Contre-vérification par mutation (une à une) : `push` au lieu du remplacement de `history` (→ test computeds rouge) ; snapshot aliasé (→ « deux fois +1 » rouge) ; miroir omis (→ « série puis échange » rouge : MICHEL reviendrait à gauche) ; miroir sans inversion d'`activePlayer` (→ même test rouge sur le tour) ; `pushHistory` avant la garde `buffer === ''` (→ « n'empile rien » rouge) ; `pushHistory` ajouté dans `swapPlayers` (→ rouge) ; oubli de `history = []` dans `resetGame` (→ rouge).

- [x] **Task 2 — Console centrale : `ANNULER` branché, pictos retirés, `REP` (AC: 2, 4, 6)**
  - [x] 2.1 `CenterPanel.vue` : libellés `ANNULER` et `ÉCHANGER` **seuls** — retirer `↩` et `⇄`, et le `gap-2` devenu sans objet ; `REPRISE` → **`REP`**. Retirer le commentaire « volontairement non écouté jusqu'à la Story 1.8 ». Styles inchangés (`bg-white/10` neutre / `bg-accent`), `disabled:opacity-30` conservé.
  - [x] 2.2 `CenterPanel.test.ts` : « labels ANNULER and ÉCHANGER with their word only, and REP above the counter » — `text()` des boutons **strictement** égal à `'ANNULER'` et `'ÉCHANGER'` (un `toContain` laisserait passer le picto) ; le texte du panneau contient `REP` et **pas** `REPRISE`. Test existant « emits undo when there is something to undo » : retirer le commentaire « l'écoute arrive avec la 1.8 ».
  - [x] 2.3 `GameView.vue` : `canUndo` lu **depuis le store** (`storeToRefs`) à la place du `computed` local `reprises.length > 0` — sinon le bouton resterait actif après avoir tout annulé, ou inactif après une seule correction. `<CenterPanel … @undo="gameStore.undoLastAction()">`. Rien d'autre ne change dans la vue.
  - [x] 2.4 Tests `GameView.test.ts` (helpers `startedGame` / `openEntry` / `type` / `panels` du describe « saisie en popup et alternance ») :
    - « brings the game one action back on ANNULER » — saisie `1`,`2`, `VALIDER` ; `[data-testid="undo-button"]` `pointerdown` → score du panneau **gauche** `0` dans le DOM (`panels(wrapper)[0]`), liseré (`active`) de retour sur le panneau gauche, `add-points-button` avec `data-side="player2"`, `reprise-number` `1`, `undo-button` **désactivé**.
    - « steps back one action per press » — série du blanc, série du jaune (`REP 2`), correction `+` sur le gauche ; trois `ANNULER` : après le 1ᵉʳ le score gauche repasse à sa valeur sans correction, après le 2ᵉ `REP 1` et tour au jaune, après le 3ᵉ tout à zéro et tour au blanc.
    - « enables ANNULER after a mere correction, with no reprise recorded » — `+` seul → bouton actif (c'est ce que le `computed` local d'avant ratait).
    - « keeps the sides as they are when undoing a series recorded before a swap » — série, `ÉCHANGER`, `ANNULER` → panneau gauche `ANDRE` (inchangé), panneau droit `MICHEL` à `0` avec le liseré, `add-points-button` `data-side="player1"`, `undo-button` désactivé.
    - « leaves nothing to undo after a swap alone » — `ÉCHANGER` seul → `undo-button` désactivé.
  - [x] 2.5 Mutation : câbler `@undo` sur `gameStore.resetGame()` (→ tests rouges) ; laisser `canUndo` local (→ « mere correction » rouge).

- [x] **Task 3 — Passe de validation visuelle (CLAUDE.md §9)**
  - [x] 3.1 Une seule passe, en fin de story, **1024×768** et **768×1024**, via le harnais iframe `public/_viewport-harness.html` (à recréer puis **supprimer** ; `resize_window` ne redimensionne pas le viewport).
  - [x] 3.2 Vérifier : `ANNULER`/`ÉCHANGER` sans picto, ≥ 90×90 px (`getBoundingClientRect`), texte centré et non tronqué dans la colonne `w-1/5` (205 px en paysage, 154 px en portrait — `ÉCHANGER` à `text-stat` à mesurer) ; `REP` au-dessus du numéro ; grisage visible à pile vide ; parcours AC 1 → 5 au doigt, échange compris ; console sans erreur.

- [x] **Task 4 — Synchronisation des specs (AC: 9)**
  - [x] 4.1 `epics.md` Story 1.7 : note datée sous les AC d'origine — bouton `CORRIGER` **sans objet** (`C`/`⌫`/croix couvrent FR8), la story livre `ANNULER` = **retour d'une action en arrière** (série, main rendue, correction ; multi-niveaux ; `ÉCHANGER` hors pile, on rappuie), retrait des pictos, `REP`. **Ajouter** une note datée, ne pas réécrire l'historique.
  - [x] 4.2 `epics.md` Story 1.8 : note datée « **absorbée par la Story 1.7** (décision de Nathan, 2026-09-09) » — ses deux AC sont le cas particulier « dernière action = une série ». `sprint-status.yaml` : `1-8-…` → `done` en même temps que la 1.7 passe en `review`, avec un commentaire `# absorbée par 1-7` sur la ligne.
  - [x] 4.3 `epics.md` UX-DR16 : précision datée — « pendant la saisie » = `C`/`⌫`/croix dans `ScoreEntryModal` (jugé suffisant le 2026-09-09) ; « après validation » = `ANNULER` en console centrale, qui remonte d'**une action** à chaque appui (séries, mains rendues, corrections ; jamais l'échange).
  - [x] 4.4 `ux-design-specification.md` fiche `CenterPanel` : `ANNULER` décrit comme *undo* multi-niveaux, `ÉCHANGER` hors pile (son propre inverse), pictos retirés (« un mot, pas de glyphe »), grisé à pile vide, libellé `REP`. Flow 2 : note datée — « Dernière série annulée, repasse à null » devient « état d'avant la dernière action restauré », et le chemin vaut aussi pour une correction. Story 1.5 / AC15 d'`epics.md` et §2.5 de l'UX parlent de « REPRISE 1 » : une note datée « libellé `REP` depuis la 1.7 » suffit, sans réécrire.
  - [x] 4.5 `deferred-work.md` : l'entrée 1.5 « `ÉCHANGER` en pleine reprise… le rattrapage passera par `ANNULER` » — préciser : « l'échange lui-même n'est pas annulable (décision 1.7) ; le rattrapage consiste à annuler jusqu'avant la série orpheline, puis à la ressaisir du bon côté ».
  - [x] 4.6 `sprint-status.yaml` : `1-7-…` → `review` en fin de story.

- [x] **Task 5 — Vérification qualité**
  - [x] 5.1 `npm test`, `npx vue-tsc -b`, `npm run build` : verts, aucune régression sur les 206 tests de départ, aucune dépendance ajoutée.

### Review Findings

_Revue de code du 2026-09-09 (bmad-code-review : Blind Hunter, Edge Case Hunter, Acceptance Auditor). Base : `git diff HEAD`, 11 fichiers, +637/−25. Vérifié par le reviewer : 226 tests verts, `vue-tsc -b` et `npm run build` verts, harnais absent de `public/`, `package*.json` intacts._

- [x] [Review][Patch] Plafond `MAX_UNDO_DEPTH` relevé de 200 à 1000 [1score/src/stores/useGameStore.ts:13] — décision de Nathan (revue du 2026-09-09) : 200 contredisait la promesse « jusqu'au début de la partie » des notes de spec (un `+` = une action, 3 Bandes à venir) ; un snapshot ne porte que des références, le coût est négligeable. Adapter le commentaire, le test « keeps at most 200 snapshots » et la Décision 11.
- [x] [Review][Patch] Tap fantôme sur `ANNULER`/`ÉCHANGER` après l'auto-validation : la grâce de 300 ms ne couvre pas la console centrale [1score/src/views/GameView.vue:121] — la carte de la pop-up (`max-w-2xl`, centrée) recouvre la colonne centrale ; à la fermeture automatique, un doigt qui arrive sur l'emplacement d'une touche peut atterrir sur `ANNULER` et défaire la série qui vient d'être validée (ou sur `ÉCHANGER`). Passer `@undo` et `@swap-players` par `panelsAcceptInput()` comme `passTurn`/`adjustScore`, et le verrouiller par un test `GameView` (fake timers : auto-validation puis `pointerdown` immédiat sur `undo-button` → série conservée ; après 300 ms → annulée).
- [x] [Review][Patch] Expression du plafond fragile : `slice(-(MAX_UNDO_DEPTH - 1))` [1score/src/stores/useGameStore.ts:130] — `slice(-0)` renvoie le tableau entier si la constante vaut 1. Écrire `history.value = [...history.value, takeSnapshot()].slice(-MAX_UNDO_DEPTH)`, plus lisible et robuste.
- [x] [Review][Patch] Test du plafond non discriminant [1score/src/stores/useGameStore.test.ts:393-401] — seuls `toHaveLength(200)` et `history[0]` sont vérifiés. Ajouter : `history[199].scoreAdjustments.player1 === 200`, un `undoLastAction()` → `player1.score === 200`, puis 200 appuis au total → `canUndo` faux et `player1.score === 1` (le plus ancien état, `0`, a bien été abandonné).
- [x] [Review][Patch] Extension du test hors partie sans assertion propre à la pile [1score/src/stores/useGameStore.test.ts:705-712] — `undoLastAction()` en `idle` est appelé mais rien ne vérifie `history`/`canUndo`. Ajouter `expect(store.history).toEqual([])` : verrouille un `pushHistory` placé avant la garde `status` dans `adjustScore`/`passTurn`/`validateScoreInput`. (La garde d'`undoLastAction` elle-même reste indiscriminable tant qu'aucun état `finished` n'existe — 1.11.)
- [x] [Review][Patch] AC3 : la fermeture de la pop-up sans valider n'est couverte par aucun test [1score/src/views/GameView.test.ts:686] — ouvrir la saisie, taper un chiffre, fermer par `modal-close-button` puis (second cas) par un tap sur `modal-backdrop` → `undo-button` `disabled` et `store.canUndo` faux. Une mutation « `pushHistory` dans `clearScoreInput` » resterait verte aujourd'hui.
- [x] [Review][Patch] `toContain('REP')` non discriminant [1score/src/components/CenterPanel.test.ts:26] — passe avec `REPRISE`, `PREP`… ; seul le `not.toContain('REPRISE')` fait le travail, et rien ne vérifie l'élément. Poser `data-testid="reprise-label"` sur le `<span>` (`CenterPanel.vue:18`) et asserter `toBe('REP')`.
- [x] [Review][Patch] Commentaire de restauration erroné [1score/src/stores/useGameStore.ts:352-353] — « le snapshot restant dans la pile ne doit pas être corrompu » : le snapshot vient d'être dépilé (`:346`), il n'est plus dans la pile. La copie reste utile (ne pas aliaser l'état vivant avec l'objet du snapshot, miroir ou non), mais la justification doit être exacte.
- [x] [Review][Patch] Renvoi périmé « ANNULER (Story 1.8) » sans note datée [_bmad-output/planning-artifacts/ux-design-specification.md:199] — §2.5 « Une seule saisie à la fois » pointe encore vers la 1.8 ; le paragraphe voisin (l. 202) et l'équivalent d'`epics.md` (l. 489) ont reçu leur note, celui-ci non (AC9, Task 4.4). Ajouter *(absorbée par la Story 1.7, 2026-09-09)*.
- [x] [Review][Patch] Décision 9 et Task 1.3 non alignées sur le code [_bmad-output/implementation-artifacts/1-7-annuler-la-saisie-en-cours-avant-validation.md — Dev Notes, Décision 9] — « ils valent `''`/`false` au moment d'une action » n'est vrai pour `validateScoreInput` que parce que le buffer est vidé AVANT `pushHistory()` (Debug Log). Amender la Décision 9 pour le dire.
- [x] [Review][Patch] Ligne de commentaire de 103 caractères, rewrap cassé par la réécriture [1score/src/views/GameView.vue:48] — les voisines font ~90.
- [x] [Review][Defer] `undoLastAction()` appelé par pilotage déporté pendant la pop-up ouverte écrase le buffer en cours de frappe [1score/src/stores/useGameStore.ts:340-357] — deferred, injoignable depuis l'UI (voile plein écran) ; à traiter avec le pilotage V2+ (fermer la pop-up avant l'undo dans `GameView`).
- [x] [Review][Defer] `isNegative` n'est pas remis à zéro avant le snapshot, contrairement à `currentInput` [1score/src/stores/useGameStore.ts:317-318] — deferred, sans effet tant que rien ne pose le drapeau ; à traiter en Story 1.9 (même piège `53` pour le signe).
- [x] [Review][Defer] Undo refusé hors `playing` : une série gagnante mal saisie qui ferait passer `status` à `finished` serait irrattrapable [1score/src/stores/useGameStore.ts:341] — deferred, `finished` n'existe pas encore (AC7 voulu aujourd'hui) ; à trancher en Story 1.11.
- [x] [Review][Defer] Le snapshot porte `name`/`targetScore` : un renommage ou changement de distance en partie serait défait par l'undo [1score/src/stores/useGameStore.ts:118-127,349-350] — deferred, aucune édition en partie n'existe ; à traiter en Story 1.14 (ne restaurer que le score, ou ré-appliquer l'édition).
- [x] [Review][Defer] Deux pointeurs simultanés (paume + doigt) sur `ANNULER` déclenchent deux `pointerdown`, donc deux annulations [1score/src/components/CenterPanel.vue:32] — deferred, cas rare, pas de `usePointerEvents.ts` encore ; garde `isPrimary` à prévoir avec ce composable.

## Dev Notes

### Décisions produit (Nathan, 2026-09-09)

1. **Pas de bouton `CORRIGER` dans la pop-up.** `C` fait déjà le travail ; on ne rajoute rien.
2. **`ANNULER` revient d'une action en arrière à chaque pression.** Un *undo* général : série, main rendue, correction — chacun est une action, chacun se défait dans l'ordre inverse.
3. **`ÉCHANGER` ne s'annule jamais.** Pour revenir, on rappuie dessus. Il n'empile rien.
4. **Plus de pictos sur `ANNULER` ni `ÉCHANGER`**, et `REPRISE` devient `REP`.
5. **La Story 1.8 est absorbée.**

### Décisions d'implémentation prises à la création

6. **Undo par *snapshots*, pas par inverses.** Chaque action empile l'état d'avant ; `ANNULER` le restaure. Exact par construction, aucun cas particulier par type d'action — et le modèle s'y prête : `reprises`, `player1`, `player2` sont **déjà** remplacés immutablement à chaque action (Décision 5 de la 1.5). Le seul état muté en place est `scoreAdjustments` (et les buffers) : **à copier**, sous peine d'un undo qui « annule » une correction sans changer le total.
7. **L'échange est absorbé par une parité de côtés, pas par la pile.** Puisque `swapPlayers` n'empile rien, un snapshot pris avant un échange décrit les joueurs de leur *ancien* côté ; le restaurer tel quel **ramènerait l'échange** — exactement ce que Nathan exclut. D'où `sidesSwapped` (booléen basculé à chaque échange) dans le snapshot : si la parité a changé entre la prise et la restauration, le snapshot est **mis en miroir** d'abord. Le miroir inverse aussi `activePlayer` — contrairement à `swapPlayers` en direct, qui laisse le tour attaché au côté (Décision 15 de la 1.5) — parce qu'ici on ré-exprime *le même état* dans des coordonnées inversées : le joueur à qui la main revient est le même joueur, simplement de l'autre côté. Ne pas « harmoniser » les deux : ce sont deux opérations différentes.
8. **Une correction `−`/`+` = une action.** Cinq appuis sur `+` = cinq `ANNULER`. Grouper les appuis rapprochés serait une règle en plus, à ne pas inventer.
9. **Les frappes au pavé ne sont pas des actions.** Elles n'existent que dans la pop-up, qui recouvre `ANNULER` (voile plein écran). Le snapshot capture tout de même `currentInput`/`isNegative` (copies) par complétude — ils valent `''`/`false` au moment d'une action. *Précision (implémentation, revue du 2026-09-09)* : ce n'est vrai pour `validateScoreInput` que parce que le buffer du joueur validant est vidé **avant** `pushHistory()` (Task 1.3 : « après la garde » signifie après la garde **et** après la remise à vide — Debug Log). `isNegative` n'est pas remis à zéro : sans effet tant que rien ne le pose, à traiter en 1.9 (différé).
10. **`canUndo` vient du store.** Le `computed` local de `GameView` (`reprises.length > 0`) est faux dès qu'on annule (bouton actif sans rien à annuler) ou qu'on corrige sans série (bouton inactif). Le supprimer, ne pas le « corriger ».
11. **Plafond 200 → 1000 (revue du 2026-09-09).** Hygiène mémoire pour les sessions de 8 h (NFR3) ; une partie de 100 reprises fait ~200 actions, mais un `+` = une action et le 3 Bandes (Epic 2) peut faire une action par point : 200 contredisait la promesse « jusqu'au début de la partie » des specs. Un snapshot ne porte que des références, 1000 reste négligeable.

### Sort de la Story 1.8 (validé par Nathan)

`1-8-annuler-la-derniere-serie-validee` demandait : « la dernière série validée repasse à `null`, le total revient à son état précédent ; aucune série antérieure n'est affectée ». C'est le comportement d'`undoLastAction` quand la dernière action est une série — à ceci près que le snapshot restaure la **ligne d'avant** plutôt que de poser un `null` : si la série a **ouvert** une reprise, la ligne disparaît (le compteur redescend) ; si elle a **complété** une reprise, la case repasse à `null`. Plus juste que l'énoncé de la 1.8, qui ne distinguait pas les deux cas. Pas de story 1.8 séparée, pas d'action `undoLastSeries` séparée (deux annulations aux sémantiques différentes sur un seul bouton seraient un piège) ; `1-8` passe `done` avec la 1.7 (Task 4.2).

### Ce que cette story NE fait PAS

- **N'annule jamais un `ÉCHANGER`**, ni directement (hors pile) ni par effet de bord (miroir, Décision 7).
- **Aucune modification de `ScoreEntryModal.vue`, `NumericPad.vue`, `PlayerPanel.vue`, `ActionBar.vue`, `main.css`.** La pop-up et ses trois issues sont hors sujet.
- **Pas de *redo*.** Une action annulée par erreur se refait à la main. Ne pas ajouter de bouton.
- **Pas de confirmation** avant annulation : le geste est réversible par nature. La confirmation destructive concerne la sortie (Story 1.15).
- **Pas de persistance de la pile** — Story 1.12. ⚠️ À noter pour la 1.12 : `history` et `sidesSwapped` font partie de l'état à sauvegarder si l'on veut qu'`ANNULER` survive à une fermeture ; sinon la pile repart vide au rechargement (acceptable, à trancher là-bas). `GameState` de `types/game.ts` ne les porte pas aujourd'hui ; ne les y ajouter que quand la 1.12 tranchera.
- Pas de bascule de signe (1.9), pas de `status = 'finished'` (1.11 — rappel : `GameView` n'a toujours pas de branche de rendu pour cet état).

### État du code au démarrage

| Fichier | Ce qui existe | Ce que cette story en fait |
|---|---|---|
| `src/stores/useGameStore.ts` (323 l.) | `reprises` en `shallowRef` remplacé immutablement ; `player1`/`player2` réassignés par `recomputeScore`/`swapPlayers`/`startGame` ; `scoreAdjustments` **muté en place** (`+= delta`) ; `currentInput` muté en place ; gardes `status === 'playing'` sur `swapPlayers`, `adjustScore`, `switchTurn`, `validateScoreInput`, `passTurn` (pas sur `addReprise`, primitive) ; `swapPlayers` permute colonnes de `reprises`, joueurs (restampés), `currentInput`, `isNegative`, `scoreAdjustments`, **pas** `activePlayer` | + `history`, `sidesSwapped`, `pushHistory`/`takeSnapshot`, `mirrorSnapshot`, `undoLastAction`, `canUndo`, `MAX_UNDO_DEPTH` ; 3 actions instrumentées ; `swapPlayers` bascule la parité ; `startGame`/`resetGame` vident |
| `src/stores/useGameStore.test.ts` (714 l., ~50 tests) | `beforeEach(setActivePinia(createPinia()))` ; motif `startGame('libre', 'MICHEL', 'ANDRE')` ; « notifies computeds derived from reprises » (motif anti-`push`) ; « ignores every game gesture while no game is playing » (à étendre) ; « carries each played series with its player when sides are swapped » (motif d'assertion après échange) | + `describe('undo')`, ~13 tests |
| `src/types/game.ts` | `Player`, `Reprise`, `GameState` (sans `history`) | + `GameSnapshot` |
| `src/components/CenterPanel.vue` (46 l.) | Props `repriseNumber`/`canUndo` ; emits `undo`/`swap-players` ; `<span class="text-stat text-white/60">REPRISE</span>` ; `↩ ANNULER` (`bg-white/10`, `disabled:opacity-30`), `⇄ ÉCHANGER` (`bg-accent`) ; `gap-2` pour l'espace picto/mot | `REP`, pictos et `gap-2` retirés, commentaire « non écouté » retiré |
| `src/components/CenterPanel.test.ts` (7 tests) | « emits undo when there is something to undo », « disables the undo button while there is nothing to undo », `toContain('ÉCHANGER')` | + test des libellés exacts et de `REP` ; commentaires réalignés |
| `src/views/GameView.vue` (232 l.) | `canUndo = computed(() => reprises.value.length > 0)` **local** ; `<CenterPanel :repriseNumber :canUndo @swap-players>` — **pas de `@undo`** | `canUndo` depuis `storeToRefs`, `@undo="gameStore.undoLastAction()"` |
| `src/views/GameView.test.ts` | Aucun test sur `undo-button` ; helpers `startedGame`/`panels`/`openEntry`/`type` ; « swaps players sides when the center panel asks for it » (motif d'assertion des noms par panneau) ; `data-testid` : `undo-button`, `swap-players-button`, `reprise-number`, `add-points-button` (`data-side`), `score`, `score-plus`/`score-minus`, `entry-confirm-button`, `digit-n` | + 5 tests d'intégration |

Suite au démarrage : **206 tests, 11 fichiers, verts** ; `vue-tsc -b` et `build` verts ; `git status` propre.

### Pièges à ne pas rejouer (revues 1.3 → 1.6)

- **`shallowRef` : remplacer, jamais `push`.** Vaut pour `history` comme pour `reprises`. Un `history.value.push()` laisserait `canUndo` figé — invisible à un test naïf. D'où le test « computeds notifiés » et la mutation 1.9.
- **Snapshot aliasé = undo qui ne défait rien.** `scoreAdjustments` est muté en place : `{ ...scoreAdjustments.value }` obligatoire à la prise **et** à la restauration (réassigner une copie, sinon le snapshot restant dans la pile est corrompu par la prochaine correction).
- **Undo après échange sans miroir = échange défait en douce.** C'est le piège spécifique de cette story ; le test « série puis échange puis undo » le verrouille, avec l'assertion sur `activePlayer` (le miroir doit inverser le tour, pas seulement les colonnes).
- **Tests non discriminants** (neuf démasqués par mutation sur 1.3–1.5). Lire le **DOM** (`panels(wrapper)[0]!.find('[data-testid="score"]').text()`, `data-side` du CTA, `reprise-number`), pas seulement le store. Vérifier des **états intermédiaires** sur la séquence à trois undos.
- **Valeurs transportées vs recalculées** (Debug Log 1.5) : après un échange, une assertion sur `player.score` peut lire une valeur simplement transportée. Ici l'undo *restaure* sans recalcul, c'est voulu — mais un test qui enregistre une série **après** l'undo prouve que les `computed` (`averages`, `completedReprises`) repartent d'un état sain.
- **`validateScoreInput` à vide ne doit pas empiler** : la garde AC12 précède le `pushHistory`.
- **Classes Tailwind littérales**, ordre CLAUDE.md §8, `min-h-[var(--size-touch-target)]` avec `var(...)` ; `@pointerdown` seul (AR8).
- **Commentaire HTML hors racine du template** = fragment ; les commentaires vont dans la racine.
- **Ne pas « nettoyer » les specs au-delà du sujet** : notes datées **ajoutées**, historique conservé.
- **Passe visuelle** : harnais iframe (à supprimer), `getBoundingClientRect` et non `scrollWidth`, scripts CDP en 3–4 actions.

### Project Structure Notes

Aucun fichier nouveau. Modifiés :

```
1score/src/types/game.ts                  (GameSnapshot)
1score/src/stores/useGameStore.ts         (history, sidesSwapped, mirrorSnapshot, undoLastAction, canUndo)
1score/src/stores/useGameStore.test.ts
1score/src/components/CenterPanel.vue     (REP, libellés sans picto)
1score/src/components/CenterPanel.test.ts
1score/src/views/GameView.vue             (canUndo du store, @undo)
1score/src/views/GameView.test.ts
_bmad-output/planning-artifacts/epics.md            (1.7, 1.8, UX-DR16)
_bmad-output/planning-artifacts/ux-design-specification.md (CenterPanel, Flow 2)
_bmad-output/implementation-artifacts/deferred-work.md
_bmad-output/implementation-artifacts/sprint-status.yaml (1-7 → review, 1-8 → done)
```

Ne pas créer `services/`, ne pas toucher au routeur ni à `main.css`. Aucune dépendance, aucune API navigateur nouvelle — pas de recherche web nécessaire (Vue 3.5 / Pinia 4 / Vitest 5 inchangés depuis la 1.5).

### Questions ouvertes (non bloquantes)

1. **Persistance de la pile (1.12)** : sauvegarder `history` et `sidesSwapped`, ou accepter qu'`ANNULER` reparte vide après rechargement ? À trancher en 1.12.
2. **Retour haptique sur `ANNULER`/`ÉCHANGER`** : aujourd'hui aucun (seuls les chiffres vibrent). UX-DR17 demande un retour sur chaque tap ; hors périmètre sauf demande.

### References

- [Source: décisions de Nathan, 2026-09-09 (conversation)] — `C` suffit ; `ANNULER` = une action en arrière par pression ; `ÉCHANGER` jamais annulé, on rappuie ; pictos retirés ; `REPRISE` → `REP` ; 1.8 absorbée
- [Source: epics.md#Story 1.7] — AC d'origine (pop-up) et note d'impact « story à réexaminer »
- [Source: epics.md#Story 1.8] — AC absorbés ; « le terrain est prêt » (`reprises` source de vérité, `shallowRef` à remplacer, `scoreAdjustments` tenu à part)
- [Source: epics.md#Story 1.5 — AC15 « REPRISE 1 »] — libellé à annoter
- [Source: epics.md#Functional Requirements — FR8, FR9, FR11] ; [#NonFunctional — NFR1, NFR3, NFR9, NFR12]
- [Source: epics.md#UX Design Requirements — UX-DR3, UX-DR8, UX-DR11, UX-DR16, UX-DR23]
- [Source: epics.md#Additional Requirements — AR8, AR9, AR15, AR16, AR17]
- [Source: architecture.md#Pinia — Actions] — `undoLastSeries` cité comme exemple de nommage verbe+nom
- [Source: ux-design-specification.md#Key Design Challenges — « Correction anxiety-free »]
- [Source: ux-design-specification.md#UX Pattern Analysis — Billizone, « bouton d'annulation nommé et visible »]
- [Source: ux-design-specification.md#Flow 2 — Saisir & Corriger un score]
- [Source: ux-design-specification.md#Custom Components — CenterPanel] ; [#Button Hierarchy — neutre / secondaire]
- [Source: 1-5-saisir-le-score-dune-serie-au-pave-numerique.md#Dev Notes — Décisions 5, 12, 13, 15 ; Review Findings ; Debug Log « valeurs transportées »]
- [Source: deferred-work.md#Deferred from code review of 1-5] — échange en pleine reprise
- [Source: deferred-work.md#Deferred from code review of 1-3] — `shallowRef` : « toujours réassigner, jamais muter »
- [Source: 1score/src/stores/useGameStore.ts:99-125] — `swapPlayers`, modèle du miroir
- [Source: 1score/src/components/CenterPanel.vue:17,27-44] — libellé `REPRISE`, boutons avec pictos
- [Source: 1score/src/views/GameView.vue:29,117-121] — `canUndo` local, `CenterPanel` sans `@undo`
- [Source: 1score/CLAUDE.md §1, §2, §4, §6, §7, §8, §9]

## Change Log

| Date | Change |
|---|---|
| 2026-09-09 | **Revue de code (bmad-code-review).** 3 couches (Blind Hunter, Edge Case Hunter, Acceptance Auditor) : 2 décisions tranchées par Nathan (plafond 200 → **1000** ; duplication `swapPlayers`/`mirrorSnapshot` conservée), **11 patches appliqués** — grâce anti-tap fantôme étendue à `ANNULER`/`ÉCHANGER` dans `GameView` (+ test, vérifié par mutation), `slice(-MAX_UNDO_DEPTH)`, tests renforcés (plafond, garde hors partie, AC3 fermeture sans valider, `reprise-label`), commentaire de restauration corrigé, note UX §2.5, Décision 9 précisée, rewrap. 5 items différés dans `deferred-work.md` (pilotage déporté pendant la pop-up, `isNegative` → 1.9, undo depuis `finished` → 1.11, snapshot et édition de joueur → 1.14, pointeurs multiples). 226 → **228 tests** verts, `vue-tsc` et `build` verts. Statut → `done`. |
| 2026-09-09 | **Implémentation (dev-story).** Pile d'annulation par snapshots dans `useGameStore` (`history`, `sidesSwapped`, `mirrorSnapshot`, `undoLastAction`, `canUndo`, plafond 200) ; `ANNULER` branché dans `GameView` avec `canUndo` du store ; pictos retirés et `REP` dans `CenterPanel` ; 20 tests ajoutés (206 → 226), 9 mutations démasquées ; passe visuelle 1024×768 et 768×1024 ; specs annotées ; `1-8` → `done` (absorbée). Statut → `review`. |
| 2026-09-09 | **Trois précisions de Nathan.** 1.8 absorbée (validé, `1-8` → `done` avec la 1.7). `ÉCHANGER` **jamais annulé** : retiré de la pile ; pour qu'un undo postérieur à un échange ne le défasse pas par effet de bord, le snapshot porte une parité `sidesSwapped` et est mis en miroir à la restauration (tour inversé compris). `REPRISE` → `REP` dans la console centrale. |
| 2026-09-09 | **Recadrage par Nathan.** Le bouton `CORRIGER` en pop-up est sans objet (`C` suffit). La story porte sur `ANNULER` en console centrale : *undo* multi-niveaux par snapshots, `undoLastAction()` + `canUndo` dans le store, `canUndo` local de `GameView` remplacé, pictos retirés. |
| 2026-09-09 | Création de la story (première version, autour d'un bouton `CORRIGER` dans la pop-up — remplacée le même jour). |

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (`claude-fable-5-1`), workflow `bmad-dev-story`, 2026-09-09.

### Debug Log References

- **Buffer restauré par l'undo (démasqué par le test « brings the game back to before a validated series »).** Première implémentation : `pushHistory()` placé juste après la garde `buffer === ''`, donc AVANT la remise à vide du buffer. Le snapshot portait `currentInput.player1 = '5'` ; après l'undo, la ressaisie de `3` donnait `53`. La Décision 9 (« ils valent `''`/`false` au moment d'une action ») n'était donc pas vraie par construction pour `validateScoreInput`. Correction : vider le buffer **avant** `pushHistory()` — la saisie en cours n'est pas un état de partie. Invisible depuis l'UI (`openEntry` vide le buffer), mais faux pour le contrat du store et le pilotage déporté (AC8).
- **Mutations 1.9 (store)** — chacune fait rougir au moins un test : `push` sur `history` → « notifies computeds… » et « keeps at most 200 » ; snapshot aliasé → « undoes one correction at a time » et « removes an undone correction… » ; miroir omis → « keeps the sides… » ; miroir sans inversion d'`activePlayer` → « keeps the sides… » et « mirrors a snapshot » ; `pushHistory` avant la garde → 5 tests dont « pushes nothing… empty buffer » ; `pushHistory` dans `swapPlayers` → 4 tests ; `history = []` oublié dans `resetGame` → « carries no history… on reset ».
- **Mutations 2.5 (vue)** — `@undo` → `resetGame()` : 4 tests rouges ; `canUndo` local rétabli : « enables ANNULER after a mere correction » rouge, seul — c'est bien ce test qui verrouille la Décision 10.
- **Passe visuelle** : un serveur Vite d'une session précédente tournait déjà sur `:5173` depuis `1score/` (servi à chaud, réutilisé). Paysage 1024×768 : colonne 205 px, boutons 173×90 px. Portrait 768×1024 : colonne 154 px, boutons 122×90 px, `ÉCHANGER` 79 px de large (14 px, `text-stat`) centré et entièrement dans le bouton (mesuré par `Range.getBoundingClientRect()`, pas `scrollWidth`) — plus large que la zone de contenu après `px-4` (58 px), sans effet visible ; c'était déjà le cas avant la story (le picto élargissait encore le texte). Parcours AC1 → AC5 déroulé au `pointerdown` dans l'iframe : série 12 / undo, série-série-correction / 3 undos + 4ᵉ inerte, main rendue / undo, série-échange-undo (joueurs en place, main rendue à droite). Console vierge dans les deux formats. Harnais supprimé.

### Completion Notes List

- **Task 1** — `GameSnapshot` dans `types/game.ts` ; dans `useGameStore.ts` : `history` (`shallowRef` remplacé, jamais `push`), `sidesSwapped` basculé par `swapPlayers`, `takeSnapshot` (copies de `scoreAdjustments`/`currentInput`/`isNegative`, références pour `player1`/`player2`/`reprises` avec l'invariante en commentaire), `pushHistory` en tête de `validateScoreInput` (après la garde et après la remise à vide du buffer), `passTurn`, `adjustScore` ; `mirrorSnapshot` pure et exportée ; `undoLastAction` (garde `playing`, no-op strict à vide, miroir si parité différente, copies à la restauration, `lastSaved`) ; `canUndo` ; `MAX_UNDO_DEPTH = 200` ; `startGame`/`resetGame` vident pile et parité. `history`, `sidesSwapped`, `canUndo` exposés en lecture. 14 tests dans `describe('useGameStore — undo')` + extension du test hors partie.
- **Task 2** — `CenterPanel.vue` : `ANNULER`/`ÉCHANGER` seuls (pictos et `gap-2` retirés), `REP`, commentaires réalignés. `GameView.vue` : `canUndo` via `storeToRefs`, `@undo="gameStore.undoLastAction()"`, `reprises` n'est plus déstructuré (plus utilisé). 1 test `CenterPanel` (égalité stricte des libellés, `REP` sans `REPRISE`), 5 tests d'intégration `GameView` lus dans le DOM (score, liseré `ring-turn-active`, `data-side` du CTA, compteur, `disabled`).
- **Task 3** — passe visuelle, voir Debug Log.
- **Task 4** — notes datées **ajoutées** (historique conservé) : `epics.md` Story 1.7 (recadrage, `CORRIGER` sans objet, `ANNULER` = une action en arrière, `ÉCHANGER` hors pile, pictos, `REP`), Story 1.8 (absorbée), UX-DR16 (précision pendant/après), AC15 de la 1.5 et risque résiduel (`REP`, levé) ; `ux-design-specification.md` fiche `CenterPanel`, Flow 2, §2.5 ; `deferred-work.md` entrée 1.5 ; `sprint-status.yaml` `1-8` → `done # absorbée par 1-7`, `1-7` → `review`.
- **Task 5** — `npm test` 226/226 (206 au départ, +20), `vue-tsc -b` et `npm run build` verts, `package.json`/`package-lock.json` intacts.
- **Hors périmètre, non fait (volontairement)** : aucun *redo*, aucune confirmation, aucune persistance de la pile (1.12 — `history` et `sidesSwapped` restent hors `GameState`), aucun changement dans `ScoreEntryModal`, `NumericPad`, `PlayerPanel`, `ActionBar`, `main.css`, aucun retour haptique sur `ANNULER`/`ÉCHANGER`.

### File List

- `1score/src/types/game.ts` — `GameSnapshot`
- `1score/src/stores/useGameStore.ts` — pile d'annulation, `mirrorSnapshot`, `undoLastAction`, `canUndo`, `sidesSwapped`, `MAX_UNDO_DEPTH`
- `1score/src/stores/useGameStore.test.ts` — `describe('useGameStore — undo')` (14 tests), test hors partie étendu
- `1score/src/components/CenterPanel.vue` — `REP`, libellés sans picto
- `1score/src/components/CenterPanel.test.ts` — test des libellés stricts, commentaire retiré
- `1score/src/views/GameView.vue` — `canUndo` du store, `@undo`
- `1score/src/views/GameView.test.ts` — `describe('GameView — annulation')` (5 tests)
- `_bmad-output/planning-artifacts/epics.md` — notes 1.7, 1.8, UX-DR16, AC15 de la 1.5
- `_bmad-output/planning-artifacts/ux-design-specification.md` — `CenterPanel`, Flow 2, §2.5
- `_bmad-output/implementation-artifacts/deferred-work.md` — entrée 1.5 précisée
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — `1-7` → `review`, `1-8` → `done`
- `_bmad-output/implementation-artifacts/1-7-annuler-la-saisie-en-cours-avant-validation.md` — ce fichier
- `1score/public/_viewport-harness.html` — créé puis **supprimé** (passe visuelle)
