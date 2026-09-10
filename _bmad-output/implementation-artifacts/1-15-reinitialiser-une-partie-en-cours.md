# Story 1.15: Réinitialiser une partie en cours

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **Recadrée par Nathan le 2026-09-10, à la création.** Le titre reste celui de l'epic (clé de sprint), mais le périmètre change :
> 1. **Le garde-fou initial est déjà livré.** La « confirmation avant abandon » qui faisait tout le périmètre de la 1.15 existe depuis la 1.10 : le picto de sortie ouvre « TERMINER LA PARTIE ? » (`VOIR LE RÉCAP` / `ANNULER`), et un scoreboard intact revient directement à l'accueil.
> 2. **Ce que la story livre : RECOMMENCER.** Un **second picto** dans la barre basse, **à côté du picto de sortie**, qui **remet la partie à zéro** — mêmes joueurs, mêmes distances, même mode, chacun du côté où il est — derrière une pop-up de confirmation, **sans récap** et **sans passer par l'accueil**. Cas de club : faux départ, échauffement qu'on ne compte pas, « on la refait ».
> 3. **Le « vraiment quitter sans récap » est reporté.** Revenir à l'accueil sans clore la partie ne sert qu'à corriger une configuration de départ, cas devenu rare (distance obligatoire depuis la 1.10, `ÉCHANGER`, nom = invité). Le chemin actuel — sortie → récap → `FIN DE PARTIE` — reste acceptable. Il ne posera problème qu'à l'**Epic 3** (Story 3.1, sauvegarde automatique des parties terminées) : à consigner là-bas, pas ici.
> 4. **Rien ne change sur la sortie.** Le picto de sortie, sa pop-up et ses libellés restent tels quels.

## Story

As a joueur,
I want remettre la partie en cours à zéro d'un geste, avec les mêmes joueurs et la même configuration,
so that un faux départ ou une partie d'échauffement se corrige sur place, sans récap fantôme ni retour à l'accueil (FR40).

## Acceptance Criteria

### Le picto dans la barre basse

1. **Given** une partie en cours **When** j'observe la barre basse **Then** un **picto RECOMMENCER** (flèche circulaire, sans libellé) se tient **à côté du picto de sortie**, dans la **même colonne** — celle qui n'a pas `AJOUTER LES POINTS` — et **change de côté avec lui** à chaque bascule de tour. Même style que la sortie (fond `bg-white/10`, `≥ 90×90 px`, `rounded-2xl`), la sortie **garde le bord extérieur** de la barre, RECOMMENCER se place vers l'intérieur, séparés de 16 px (`gap-2`). Il porte un `aria-label` (« Recommencer la partie »).
2. **Given** un scoreboard **intact** (aucune action annulable, `canUndo` faux — même critère que la sortie directe, revue 1.10) **When** j'observe le picto **Then** il est **inerte et grisé** (`disabled`, `disabled:opacity-30`, comme `ANNULER` de la console) : il n'y a rien à recommencer. Le picto reste en place — la barre ne bouge pas.

### La pop-up de confirmation

3. **Given** une partie avec au moins une action annulable **When** je tape le picto **Then** une pop-up « RECOMMENCER LA PARTIE ? » s'ouvre (`PromptModal`, voile inerte) avec deux CTA et **rien d'autre** — ni message, ni croix, ni bille : `RECOMMENCER` (accent) et `ANNULER` (neutre, au-dessus). Rien ne change tant que je n'ai pas confirmé ; `status` reste `playing`.
4. **Given** la pop-up **When** je tape `ANNULER` **Then** elle se referme, le scoreboard est **intact** (scores, reprises, tour, pile d'annulation), et les panneaux comme la console ignorent les appuis pendant la grâce anti-tap fantôme de 300 ms (le CTA est au-dessus des panneaux, même traitement que `ANNULER` de la pop-up de sortie).

### La remise à zéro

5. **Given** la pop-up **When** je tape `RECOMMENCER` **Then** la partie repart **immédiatement** sur le scoreboard, **sans récap et sans passer par l'accueil** : même mode, mêmes noms, mêmes distances, **chacun du côté où il est** (après un `ÉCHANGER`, les joueurs restent échangés — même règle que `UNE PARTIE DE PLUS`), scores à 0, moyenne et meilleure série à leur état initial, `REP 1`, **le blanc a la main** (liseré sur le panneau gauche, `AJOUTER LES POINTS` sous le jaune), `ANNULER` grisé (pile vide), aucune pop-up de fin, aucune reprise égalisatrice en cours, pop-up de saisie fermée et buffers vidés. La grâce de 300 ms s'applique (le scoreboard revient sous le doigt).
6. **Given** le store **When** j'observe l'action **Then** c'est une **action Pinia nommée `restartGame()`** (UX-DR23, AR15, AR17), gardée sur `status === 'playing'` : no-op en `idle` et en `finished`. Un pilotage déporté qui l'appelle produit exactement l'état de l'AC5. Elle passe par `startGame(...)` comme `rematch()`, sans dupliquer la remise à zéro.
7. **Given** la persistance (1.12) **When** je recommence **Then** la sauvegarde `localStorage` reflète la partie neuve dans le même tick (une écriture), sans trace de l'ancienne ; un rechargement suivi de `REPRENDRE LA PARTIE` ramène la partie neuve.
8. **Given** l'historique des parties (FR40, second AC de l'epic) **When** je recommence **Then** rien n'est enregistré nulle part : une partie recommencée n'est **jamais** passée par `finished`. *(Pas d'historique en V1a ; à rappeler dans la note pour la Story 3.1 : « recommencer » n'est pas « terminer ».)*

### Transverses

9. **Given** toute la story **When** j'interagis **Then** `@pointerdown` partout (AR8), commandes `≥ 90×90 px` (UX-DR8), aucune mutation directe du store depuis la vue (AR17), `storeToRefs` pour tout ce que la vue lit, tests co-localisés (AR16), `npm test`, `npx vue-tsc -b` et `npm run build` verts, **une** passe visuelle finale en 1024×768 et 768×1024 (CLAUDE.md §9).
10. **Given** les specs (`epics.md`, `ux-design-specification.md`, `architecture.md`, `deferred-work.md`) **When** je lis la Story 1.15, la fiche `ActionBar`, la fiche `PromptModal`, §2.5 et la revue 1.3 « QUITTER destructif » **Then** le recadrage du 2026-09-10 y est consigné par notes datées (lignes existantes conservées), y compris la note « report du quitter sans récap à la 3.1 » dans l'Epic 3.

## Tasks / Subtasks

- [x] **Task 1 — Store : `restartGame()` (AC: 5–8)**
  - [x] 1.1 Dans `useGameStore.ts`, juste après `rematch()` :
    ```ts
    // Picto RECOMMENCER (Story 1.15) : la partie repart de zéro SANS passer par
    // `finished` — ni récap, ni vainqueur, ni (Epic 3) ligne d'historique. Même
    // recette que `rematch()`, gardée sur `playing` : chacun repart du côté où il est.
    function restartGame(): void {
      if (status.value !== 'playing') return
      startGame(mode.value, player1.value.name, player2.value.name, {
        player1: player1.value.targetScore,
        player2: player2.value.targetScore,
      })
    }
    ```
    `startGame` remet déjà tout à zéro (`reprises`, `history`, `scoreAdjustments`, `sidesSwapped`, `endPrompt`, `equalizingReprise`, `entryOpen`, `currentInput`, `activePlayer = 'player1'`, `startedAt = Date.now()`, `lastSaved`). **Ne rien réinitialiser à la main**, ne pas toucher à `resetGame` ni à `rematch`. Exposer `restartGame` dans le `return` (à côté de `rematch`).
  - [x] 1.2 Mettre à jour le commentaire de `resetGame` (« Retour à l'accueil … La confirmation avant abandon est portée par la pop-up de sortie ») : ajouter que la remise à zéro **sans** retour à l'accueil est `restartGame` (1.15).
  - [x] 1.3 Tests `useGameStore.test.ts`, à la suite des tests de `rematch` (motif `startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })`, helpers `startedGame`/`validate` existants) :
    - `restarts the running game with the same players, distances and sides` : `validate(store, 'player1', 4)`, `validate(store, 'player2', 3)`, `store.adjustScore('player1', 1)` → `restartGame()` → `status 'playing'`, `mode` conservé, `reprises []`, `history []`, `canUndo` faux, `player1` `{ name 'MICHEL', targetScore 10, score 0 }`, `player2` `{ 'ANDRE', 8, 0 }`, `activePlayer 'player1'`, `scoreAdjustments {0,0}`, `startedAt` renouvelé (fake timers ou `toBeGreaterThanOrEqual`), `winner null`, `finishedAt null`, `endPrompt null`, `equalizingReprise false`, `entryOpen false`, `currentInput` vide.
    - `keeps swapped players on their current side when restarting` : `swapPlayers()`, `validate(store, 'player1', 2)` → `restartGame()` → `player1.name 'ANDRE'`, `player1.targetScore 8`, `player2.name 'MICHEL'`, `sidesSwapped false`.
    - `clears an accepted equalizing reprise and a pending end prompt when restarting` : blanc valide `10` (offre), `acceptEqualizingReprise()` → `restartGame()` → `equalizingReprise false`, `endPrompt null`, `status 'playing'`. *(Injoignable au doigt — le voile recouvre la barre — mais c'est le contrat de l'action pour le pilotage déporté.)*
    - `refuses to restart while idle or finished` : store neuf → `restartGame()` → `status 'idle'`, `startedAt null` ; partie `finishGame()`d → `restartGame()` → `status 'finished'`, `winner` inchangé, `reprises` intactes.
    - Persistance (`describe` de la 1.12, helper `saved()`) : `saves after restart` — `validate(store, 'player1', 7)`, `restartGame()`, `await nextTick()` → `saved().status 'playing'`, `saved().reprises []`, `saved().history []`, `saved().player1.name 'MICHEL'`, `saved().player1.score 0`. Une seule écriture pour l'action (même vérification par compteur que « une action = une écriture », si le helper existe).

- [x] **Task 2 — `GameView.vue` : picto, pop-up, grâce (AC: 1–5)**
  - [x] 2.1 État local, à côté de `exitPromptOpen` (même raison : l'ouverture d'une confirmation n'est pas un état de partie, elle n'a pas à survivre à un rechargement) :
    ```ts
    const restartPromptOpen = ref(false)
    function askRestart(): void { if (!canUndo.value) return; restartPromptOpen.value = true }
    function closeRestartPrompt(): void { restartPromptOpen.value = false; lockPanels() }
    function confirmRestart(): void { restartPromptOpen.value = false; gameStore.restartGame(); lockPanels() }
    ```
    **Garde `canUndo` dans `askRestart` en plus du `disabled`** : le `disabled` porte le visuel grisé (AC2), la garde porte le comportement — les navigateurs ne s'accordent pas sur l'envoi des `pointer events` aux contrôles désactivés (Chromium en a changé en 2023), et happy-dom non plus. Le test AC2 vérifie l'un et l'autre.
  - [x] 2.2 Picto : dans **chacune** des deux colonnes (le markup de la barre est dupliqué par colonne — dette connue, revue 1.5, **ne pas refactorer ici**), à côté du bouton `exit-button`, un `<button data-testid="restart-button" :data-side="…" aria-label="Recommencer la partie" :disabled="!canUndo" :class="EXIT_BUTTON_CLASSES" class="disabled:opacity-30" @pointerdown="askRestart">`. Ordre et marges : **colonne gauche** (`justify-start`) → sortie avec `ml-4` puis RECOMMENCER ; **colonne droite** (`justify-end`) → RECOMMENCER puis sortie avec `mr-4` — la sortie garde le bord extérieur, comme aujourd'hui. Poser `gap-2` (16 px, `--spacing: 8px`) sur le conteneur de colonne plutôt que des marges sur le picto. Vérifier que `EXIT_BUTTON_CLASSES` (constante) reste partagée telle quelle ; renommer en `PICTO_BUTTON_CLASSES` si on veut, en un seul endroit.
  - [x] 2.3 Glyphe : SVG inline **sur le même modèle que la sortie** (`viewBox="0 0 24 24"`, `h-8 w-8`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap/linejoin="round"`, `aria-hidden="true"`). Flèche circulaire de reprise, tracé Lucide `rotate-ccw` :
    ```html
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    ```
    Nathan valide le glyphe à la passe visuelle (Task 4) — il a évoqué « une flèche recyclage avec une croix dedans » ; le tracé ci-dessus est la proposition de base, une petite croix centrale (`M9 9l6 6M15 9l-6 6` en `stroke-width="1.5"`) est l'alternative si la flèche seule ne dit pas « remise à zéro ».
  - [x] 2.4 Pop-up, **après** celle de sortie dans le template (même voile inerte, même absence de croix et de message) :
    ```html
    <PromptModal v-if="restartPromptOpen" title="RECOMMENCER LA PARTIE ?" primaryLabel="RECOMMENCER" secondaryLabel="ANNULER" @primary="confirmRestart" @secondary="closeRestartPrompt" />
    ```
    Commentaire au-dessus : recommencer ≠ terminer — pas de `finished`, pas de récap, pas d'historique (Epic 3).
  - [x] 2.5 Mettre à jour le commentaire de bloc « Sortie : plus rien de destructif au contact … » pour mentionner le second picto et sa confirmation.

- [x] **Task 3 — Tests `GameView.test.ts` (AC: 1–5, 7)**
  - [x] 3.1 Dans `describe('GameView — saisie en popup et alternance')`, à côté de `keeps the exit control opposite the add-points button` : `keeps the restart control next to the exit control` — `restart-button[data-side="player1"]` existe et `[data-side="player2"]` non ; après `store.switchTurn()` l'inverse ; les deux pictos sont dans le **même** conteneur (`exit.element.parentElement === restart.element.parentElement`) ; `aria-label` présent, `text()` vide.
  - [x] 3.2 Dans `describe('GameView — fin de partie')` (fake timers, helpers `startedGame`, `validateSeries`, `press`, `prompt`, `scoreOf`, `panels`) :
    - `keeps the restart control inert on an untouched board` : `restart-button` a l'attribut `disabled` ; `press('restart-button')` → aucune `prompt-modal`, `status 'playing'` ; après `press('score-plus')` → plus de `disabled`.
    - `asks before restarting and leaves the board untouched on ANNULER` : deux séries (`[4]`, `[4]`), `press('restart-button')` → `prompt-title` « RECOMMENCER LA PARTIE ? », `prompt-primary` « RECOMMENCER », `prompt-secondary` « ANNULER », pas de `prompt-message`, `status 'playing'`, scores inchangés ; `press('prompt-secondary')` → pop-up fermée, `scoreOf(0) '4'`, `scoreOf(1) '4'`, `store.canUndo` vrai ; grâce : `press('undo-button')` immédiat → score toujours `'4'` ; `advanceTimersByTime(300)` puis `press('undo-button')` → `'0'` côté jaune (la grâce est bien levée). *Vérifier par mutation* : retirer `lockPanels()` de `closeRestartPrompt` doit casser ce test.
    - `restarts the game in place on RECOMMENCER` : `press('swap-players-button')`, séries `[4]`, `[4]`, `press('score-plus')` → `press('restart-button')`, `press('prompt-primary')` → pas de `prompt-modal`, pas de `game-summary`, pas de `step-category`, `status 'playing'`, `panels` ×2, panneau gauche `name 'ANDRÉ'` / `target-score '8'`, droit `'MICHEL'` / `'10'`, `scoreOf` `'0'` / `'0'`, `reprise-number '1'`, liseré sur le panneau gauche (`props('active')` vrai), `add-points-button[data-side="player2"]`, `undo-button` `disabled`, `restart-button` `disabled` ; grâce : `press('score-plus')` immédiat sur un panneau → score reste `'0'`.
    - `reopens no end prompt after a restart from an accepted equalizing reprise` — optionnel, uniquement si testable au doigt ; sinon couvert par le test du store (1.3).
  - [x] 3.3 Dans `describe('GameView — reprise après fermeture')` : `resumes the restarted game, not the old one` — série, `restartGame()` (via le store, ou via les pictos), remonter un `GameView` neuf après `checkSavedGame()` → `REPRENDRE LA PARTIE` → scores `'0'`, `reprises []`. Suivre le motif des tests existants de la 1.12 (storage réel de happy-dom ou helper `saved()`).
  - [x] 3.4 Le test existant `leaves the game from the exit pictogram` cherche `[data-testid="exit-button"]` : il reste valide (le picto RECOMMENCER a son propre `data-testid`). Si un test lisait « le seul `<button>` de la colonne », le corriger.

- [x] **Task 4 — Passe visuelle unique (AC: 1, 3, 5, 9)** — CLAUDE.md §9 : après tests/`vue-tsc`/`build` verts, un seul parcours Chrome en **1024×768 et 768×1024** : deux pictos côte à côte, alignés sur le bord du bloc joueur, sortie à l'extérieur, `≥ 90 px` chacun, aucun débordement de la colonne 2/5 en portrait ; bascule de côté à chaque tour ; picto grisé sur scoreboard intact ; pop-up centrée, CTA pleine largeur ; RECOMMENCER → scoreboard neuf sous le doigt, pas de flash d'accueil ; console vierge. **Nathan tranche le glyphe à ce moment** (flèche seule vs flèche + croix). *✅ Tranché en revue de code (2026-09-10) : flèche circulaire seule.*

- [x] **Task 5 — Specs (AC: 10)** — notes **datées**, lignes existantes conservées :
  - [x] 5.1 `epics.md` › Story 1.15 : note « ✅ Recadrée (décision de Nathan, 2026-09-10) » reprenant l'encadré de tête de ce fichier (RECOMMENCER à côté de la sortie, confirmation, sans récap, côté conservé ; quitter sans récap reporté à la 3.1). `epics.md` › Story 3.1 : note « à traiter : une partie **recommencée** (1.15) n'a jamais été `finished` et n'entre pas dans l'historique ; le « quitter sans récap » (abandon) reste à définir ici — abandon = non sauvegardée ? défaite ? ».
  - [x] 5.2 `ux-design-specification.md` : §2.5 « Règles de fin de partie » → puce « **Recommencer** (picto à côté de la sortie, confirmation « RECOMMENCER LA PARTIE ? » `RECOMMENCER` / `ANNULER`) : la partie repart de zéro sur place, mêmes joueurs, distances et côtés, sans récap » ; fiche `ActionBar` → note 1.15 (deux pictos dans la colonne opposée au CTA, sortie au bord) ; fiche `PromptModal` › *Usages* → « RECOMMENCER LA PARTIE ? » ; §2.5 point 1 (« Le picto de sortie occupe la colonne opposée ») → « les pictos de sortie et de recommencement ».
  - [x] 5.3 `architecture.md` : note store (ligne « `finishGame()`, seule action de clôture ») → `restartGame()` = `startGame` gardé sur `playing`, jamais `finished` ; fiche `PromptModal.vue` → ajouter l'usage.
  - [x] 5.4 `deferred-work.md` › revue 1.3 « **QUITTER destructif sans confirmation** … Story 1.15 » → « ✅ Traité en 1.10 (confirmation de sortie) ; la 1.15 livre RECOMMENCER (2026-09-10) ». Revue 1.5 « Markup dupliqué dans la barre basse » → ajouter « aggravé en 1.15 (second picto dupliqué), toujours à nettoyer ».
  - [x] 5.5 `sprint-status.yaml` : `1-15` → `review` en fin de dev.

### Review Findings

*Revue de code adversariale du 2026-09-10 (Blind Hunter, Edge Case Hunter, Acceptance Auditor) — 28 findings bruts, 9 écartés comme bruit après vérification (mocks restaurés par `beforeEach`, compte à rebours d'auto-validation annulé au démontage, `MAX_UNDO_DEPTH` = 1000 théorique, largeur < 530 px hors périmètre tablette, tests/`vue-tsc`/build revérifiés au vert, références de lignes historiques de `deferred-work.md`, motif `advanceTimersByTime(300)` établi depuis la 1.5, test de reprise via le store autorisé par la Task 3.3, duplication des handlers couverte par la dette « markup dupliqué »).*

- [x] [Review][Decision] Task 4 cochée alors que le glyphe n'est pas tranché — **résolu (Nathan, 2026-09-10) : flèche seule, picto grisé et libellé conservés ; consigné dans la Task 4, les Completion Notes et les questions ouvertes.** Détail initial : — la tâche dit « Nathan tranche le glyphe à ce moment » et les Completion Notes le laissent « à trancher » ; les questions ouvertes 2 (grisé vs masqué) et 3 (libellé « RECOMMENCER LA PARTIE ? » vs « REPARTIR DE ZÉRO ? ») restent aussi sans réponse consignée. Choix à prendre : flèche seule (livrée) ou flèche + croix centrale (`M9 9l6 6M15 9l-6 6`, `stroke-width="1.5"`).
- [x] [Review][Patch] La garde `canUndo` d'`askRestart` n'est prouvée par aucun test : `trigger('pointerdown')` de Vue Test Utils ne dispatch rien sur un bouton `disabled`, donc le test AC2 passe avec ou sans la garde, contrairement à la note « le test AC2 vérifie l'un et l'autre » ; happy-dom délivre bien un `dispatchEvent(new Event('pointerdown'))` natif au bouton désactivé (vérifié), c'est ce qu'il faut dispatcher pour prouver la garde [carom-scoreboard/src/views/GameView.test.ts:941]
- [x] [Review][Patch] Test store principal en partie tautologique : `entryOpen`, `currentInput`, `endPrompt`, `winner`, `finishedAt` ne sont jamais sortis de leur valeur par défaut avant `restartGame()` ; seule l'offre `equalizing-offer` est couverte, jamais la pop-up `over` ; la branche `finished` de « refuses to restart » ne vérifie ni `startedAt`, ni `finishedAt`, ni les scores ; aucun test n'est annoté AC8 [carom-scoreboard/src/stores/useGameStore.test.ts:1483-1583]
- [x] [Review][Patch] `saves after restart` démarre sans distances et ne vérifie pas `targetScore` dans la sauvegarde — le seul champ que `restartGame` doit réinjecter à la main [carom-scoreboard/src/stores/useGameStore.test.ts:1798]
- [x] [Review][Patch] `aria-label` non épinglé (`toBeTruthy()` seulement) alors que la spec fixe « Recommencer la partie » ; un copier-coller de « Quitter la partie » passerait [carom-scoreboard/src/views/GameView.test.ts:311]
- [x] [Review][Patch] AC5 « moyenne et meilleure série à leur état initial » non vérifié par le test de vue après RECOMMENCER (`data-testid="average"` / `"best-series"` disponibles dans `PlayerPanel`) [carom-scoreboard/src/views/GameView.test.ts:993]
- [x] [Review][Patch] Indentation cassée dans les deux `<template v-else>` : `<button` au niveau du `<template>`, attributs et enfants quatre espaces plus loin (pas de formateur dans le projet, à réindenter à la main) [carom-scoreboard/src/views/GameView.vue:266-384]
- [x] [Review][Patch] Note Story 3.1 d'`epics.md` inexacte : « le seul chemin de sortie d'une partie entamée passe par le récap » — deux sorties sans récap existent (picto de sortie sur scoreboard intact → accueil direct ; « PARTIE EN COURS » › `ANNULER` jette une sauvegarde avec séries) ; l'Epic 3 serait planifié sur une prémisse fausse [_bmad-output/planning-artifacts/epics.md:853]
- [x] [Review][Defer] État local des pop-ups (`restartPromptOpen`, `exitPromptOpen`) non réconcilié avec le store en pilotage déporté : rien ne les referme quand `status` quitte `playing` ou qu'une partie neuve démarre, pas d'exclusion mutuelle entre les deux pop-ups, `confirmRestart` ne revérifie pas `canUndo`, et un `restartGame()` reçu pendant `entryOpen` referme le pavé sans grâce anti-tap fantôme [carom-scoreboard/src/views/GameView.vue:137-193] — deferred, pre-existing (famille « store non durci pendant une pop-up », différée en 1.7/1.10 ; injoignable au doigt : le voile recouvre la barre ; explicitement hors périmètre de la story)

## Dev Notes

### Décisions produit (Nathan, 2026-09-10)

1. **Un picto, pas un CTA dans la pop-up de sortie.** Nathan a écarté « troisième CTA sur TERMINER LA PARTIE ? » : le geste doit être **visible dans la barre**, à côté de la sortie — « une flèche recyclage avec une croix dedans ou un truc du style qui remet la partie à 0 ».
2. **Remise à zéro = même partie, mêmes réglages.** Pas un retour à l'accueil. C'est `UNE PARTIE DE PLUS` sans passer par le récap.
3. **Confirmation obligatoire** — plus rien de destructif au contact depuis la revue 1.5/1.10. Pop-up de décision standard : titre + deux gros CTA, sans croix ni message (revue de Nathan du 2026-09-10 sur toutes les pop-ups de décision).
4. **La sortie ne bouge pas.** Titre, CTA, comportement « scoreboard intact → accueil direct » inchangés.
5. **Quitter sans récap : à l'Epic 3.** Ne pas l'ajouter « tant qu'on y est ».

### Décisions d'implémentation prises à la création

- **`restartGame()` = `rematch()` gardé sur `playing`.** Deux actions distinctes plutôt qu'une seule à double garde : leurs sémantiques diffèrent (revanche après un résultat vs. remise à zéro sans résultat) et un pilotage déporté doit pouvoir les distinguer. Les deux délèguent à `startGame`, qui est la seule fonction qui sait tout remettre à zéro — **ne pas** réécrire une remise à zéro partielle (piège : oublier `equalizingReprise`, `endPrompt`, `entryOpen`, `scoreAdjustments`).
- **Côtés conservés.** `startGame` repose `sidesSwapped = false` mais reçoit les noms/distances **dans l'ordre courant** : après un `ÉCHANGER`, le joueur passé à droite y reste. C'est exactement le comportement de `rematch` (« chacun du côté où il est », testé en 1.10).
- **`disabled` sur scoreboard intact** plutôt que masquer le picto : la barre ne doit pas changer de forme selon l'état, et le motif existe (`ANNULER` grisé à pile vide). Critère `canUndo`, identique à la sortie directe (revue 1.10 : des points ajoutés par `+` sans série comptent).
- **État de la pop-up local à la vue** (`ref`), comme `exitPromptOpen` — pas dans le store, pas persisté. Une confirmation interrompue par un rechargement disparaît, c'est voulu (1.12 : « l'ouverture d'une confirmation n'est pas un état de partie »).
- **Grâce anti-tap fantôme sur les deux CTA** : `ANNULER` et `RECOMMENCER` sont tous deux au-dessus des panneaux et de la console. Après `RECOMMENCER`, le scoreboard neuf revient sous le doigt : un `pointerup` tardif ou un second tap ne doit pas rendre la main ni corriger un score. Motif `lockPanels()` existant, vérifié par mutation en 1.10.
- **Ordre dans la colonne** : la sortie garde le **bord** (elle y est depuis la 1.5 et c'est ce que montre la capture de Nathan), RECOMMENCER vient vers l'intérieur. `gap-2` = 16 px réels (`--spacing: 8px`, CLAUDE.md §7 — ne pas écrire `gap-4`, ce serait 32 px).
- **Pas de refactor de la barre.** Le markup CTA/pictos est dupliqué par colonne (dette différée en revue 1.5). On duplique le picto de la même façon ; le nettoyage reste différé et sa note est mise à jour (Task 5.4).

### Ce que cette story NE fait PAS

- Pas de « quitter sans récap » ni d'« abandon = défaite » (Epic 3 / Story 3.1).
- Pas de changement de la pop-up de sortie ni de son titre.
- Pas de réglage « recommencer avec d'autres distances » : pour changer la configuration, on passe par l'accueil (sortie → récap → `FIN DE PARTIE`).
- Pas de compteur de « parties recommencées », pas de trace, pas d'historique.
- Pas de composant nouveau : `PromptModal` existe, le SVG est inline comme celui de la sortie.
- Pas de durcissement du store contre les actions reçues pendant une pop-up ouverte (différé 1.10, famille « pilotage déporté »).

### État du code au démarrage

| Fichier | Aujourd'hui | Ce que la story y fait |
|---|---|---|
| `src/stores/useGameStore.ts` (~740 l.) | `startGame` remet tout à zéro ; `rematch()` = `startGame` gardé sur `finished` ; `resetGame()` = retour `idle` ; `watch(persistedState)` écrit une fois par action | `+ restartGame()` (gardé sur `playing`), exposé |
| `src/views/GameView.vue` (~390 l.) | barre basse à deux colonnes 2/5, CTA d'un côté, picto `exit-button` de l'autre, markup dupliqué ; `exitPromptOpen` local ; `lockPanels()` / `PANEL_GRACE_MS = 300` ; `EXIT_BUTTON_CLASSES` | `+ restart-button` ×2, `restartPromptOpen`, `PromptModal` « RECOMMENCER LA PARTIE ? » |
| `src/components/PromptModal.vue` | props `title`, `message?`, `primaryLabel`, `secondaryLabel?`, `ball?` ; emits `primary`/`secondary` ; voile inerte, sans croix | inchangé |
| `src/components/CenterPanel.vue` | `ANNULER` `:disabled="!canUndo"` + `disabled:opacity-30` | inchangé — **modèle** du picto grisé |
| `src/views/GameView.test.ts` (~1170 l.) | helpers `startedGame`, `validateSeries`, `press`, `prompt`, `summary`, `scoreOf`, `panels` ; fake timers dans « fin de partie » | + tests Task 3 |
| `src/stores/useGameStore.test.ts` (~1900 l.) | tests `rematch` l. ~1433-1475, `saves after rematch` l. ~1685 | + tests Task 1.3 |

### Pièges à ne pas rejouer (revues 1.3 → 1.12)

- **`reprises` et `history` sont des `shallowRef`** : toujours **remplacer** `.value`, jamais `push`. `startGame` le fait déjà — c'est une raison de plus pour déléguer.
- **`@pointerdown` déclenche au contact** : tout ce qui est destructif passe par une pop-up (revues 1.5, 1.10). Le picto n'appelle **jamais** `restartGame` directement.
- **Grâce de 300 ms** après toute fermeture de pop-up dont un CTA recouvre les panneaux — et la vérifier par mutation dans le test (retirer `lockPanels()` doit casser le test).
- **`gap-4` = 32 px, `gap-2` = 16 px** (`--spacing: 8px`).
- **Tailwind v4 JIT** : classes écrites en toutes lettres (`disabled:opacity-30` dans l'attribut `class`, pas construite).
- **Test de persistance** : `await nextTick()` après l'action avant de lire `saved()` (le `watch` est en flush `pre`).
- **`happy-dom` et `<button disabled>`** : `trigger('pointerdown')` sur un bouton désactivé ne déclenche pas le handler — c'est ce que le test AC2 vérifie ; si la version de happy-dom en décidait autrement, ajouter la garde `if (!canUndo.value) return` dans `askRestart` **et** garder le `disabled` (le visuel grisé est l'AC).
- **Ne pas « nettoyer » les specs au-delà du sujet** : notes datées, historique conservé.

### Project Structure Notes

- Aucun fichier nouveau. Modifiés : `carom-scoreboard/src/stores/useGameStore.ts`, `useGameStore.test.ts`, `src/views/GameView.vue`, `GameView.test.ts` ; specs `_bmad-output/planning-artifacts/{epics,ux-design-specification,architecture}.md`, `_bmad-output/implementation-artifacts/{deferred-work.md,sprint-status.yaml}`.
- Nommage (AR15) : action `restartGame` (verbe + nom, cohérent avec `resetGame`/`finishGame`/`rematch`), `data-testid="restart-button"`, `restartPromptOpen`.
- Stack inchangée : Vue 3.5 `<script setup>`, Pinia 4, Tailwind 4 (`--spacing: 8px`), Vitest 5 + happy-dom 20. Aucune dépendance ajoutée, aucune ressource réseau (garde de test 1.13 : le SVG est inline).

### Questions ouvertes pour Nathan (à trancher au rendu, pas bloquantes)

1. **Glyphe** : flèche circulaire seule (`rotate-ccw`) ou flèche + petite croix au centre ? Proposition de base : flèche seule ; à voir à la passe visuelle. **→ Tranché (Nathan, revue de code du 2026-09-10) : flèche seule, telle que livrée.**
2. **Picto grisé vs. masqué** sur scoreboard intact : la story choisit **grisé** (barre stable, motif `ANNULER`). Dire si masqué est préféré. **→ Tranché (2026-09-10) : grisé, conservé.**
3. **Libellé** : « RECOMMENCER LA PARTIE ? » / `RECOMMENCER`. Alternative « REPARTIR DE ZÉRO ? » si « recommencer » prête à confusion avec « une partie de plus ». **→ Tranché (2026-09-10) : « RECOMMENCER LA PARTIE ? » conservé.**

### References

- [Source: décisions de Nathan, 2026-09-10 (conversation de création)] — picto à côté de la sortie, remise à zéro, confirmation, quitter sans récap reporté à l'Epic 3
- [Source: epics.md#Story 1.15 (AC FR40, note de périmètre, mise à jour 1.10) ; #Story 1.10 (sortie → récap, `UNE PARTIE DE PLUS`, prorata) ; #Story 3.1 (historique)]
- [Source: prd.md FR40 « réinitialiser une partie en cours et en démarrer une nouvelle » ; FR5]
- [Source: ux-design-specification.md §2.5 « Règles de fin de partie » (fin manuelle) ; fiche `ActionBar` (note 1.5 : pictos et CTA alternent) ; fiche `PromptModal` (pop-ups de décision sans croix, retour = `ANNULER`) ; « Button Hierarchy »]
- [Source: architecture.md note store 1.10 (`finishGame` seule clôture, récap terminal) ; note 1.12 (persistance, `resetGame` supprime l'entrée) ; fiche `PromptModal.vue` ; AR8, AR15, AR16, AR17 ; UX-DR8, UX-DR23]
- [Source: 1-10 story — Décisions 3, 9, 11 ; Review Findings « sortie sur `!canUndo` », « grâce sur `<NOM> JOUE` » ; Completion Notes Task 5]
- [Source: 1-12 story — cadrage (pop-up de reprise, pile persistée, `entryOpen` dans le store, confirmation locale à la vue)]
- [Source: deferred-work.md — revue 1.3 « QUITTER destructif » ; revue 1.5 « sortie destructive » (traité 1.10), « markup dupliqué dans la barre basse » ; revue 1.10 « store non durci pendant une pop-up »]
- [Source: carom-scoreboard/CLAUDE.md §2 (pointer), §4 (Pinia), §6 (tests), §7 (`--spacing: 8px`), §9 (validation)]
- [Source: code — `useGameStore.ts` (`startGame`, `rematch`, `resetGame`, `persistedState`), `GameView.vue` (barre basse, `exitPromptOpen`, `lockPanels`), `CenterPanel.vue` (`disabled:opacity-30`), `PromptModal.vue`, `GameView.test.ts` (helpers « fin de partie »), `useGameStore.test.ts` (tests `rematch`, `saves after rematch`)]

## Change Log

| Date | Changement |
|---|---|
| 2026-09-10 | Création de la story (bmad-create-story) après cadrage avec Nathan : périmètre recadré de « confirmation avant abandon » (livrée en 1.10) à « picto RECOMMENCER à côté de la sortie, remise à zéro confirmée, sans récap » ; quitter sans récap reporté à la Story 3.1. |
| 2026-09-10 | Implémentation (bmad-dev-story) : `restartGame()` dans le store, picto RECOMMENCER ×2 + pop-up « RECOMMENCER LA PARTIE ? » + grâce dans `GameView`, 10 tests (5 store, 5 vue), notes datées dans les quatre specs, passe visuelle 1024×768 et 768×1024. 428 tests, `vue-tsc` et build verts. Statut → review. |
| 2026-09-10 | Revue de code (bmad-code-review, 3 relecteurs parallèles) : 1 décision (glyphe flèche seule, grisé et libellé conservés), 7 patchs appliqués — garde `canUndo` prouvée par `dispatchEvent` natif (vérifiée par mutation), tests store renforcés (saisie ouverte, pop-up `over`, `finished` intact, AC8), `targetScore` vérifié dans la sauvegarde, `aria-label` épinglé, moyenne/série vérifiées après RECOMMENCER, indentation du template, note Story 3.1 d'`epics.md` corrigée ; 1 report (pop-ups locales vs pilotage déporté) en `deferred-work.md` ; 9 findings écartés. 428 tests, `vue-tsc` et build verts. Statut → done. |

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (claude-fable-5-1), session bmad-dev-story du 2026-09-10.

### Debug Log References

- Cycle red-green respecté : 5 tests store écrits d'abord (échec `restartGame is not a function`), puis l'action ; 5 tests vue écrits d'abord (4 en échec, le test de reprise passait déjà car il passe par le store), puis le picto.
- Vérification par mutation de la grâce anti-tap fantôme : retirer `lockPanels()` de `closeRestartPrompt` casse « asks before restarting… on ANNULER » ; le retirer de `confirmRestart` casse « restarts the game in place on RECOMMENCER ». Fichier restauré à l'identique (diff vide).
- `npm test` : 428 tests / 15 fichiers verts. `npx vue-tsc -b` : exit 0. `npm run build` : OK.

### Completion Notes List

- **Task 1** — `restartGame()` ajoutée juste après `rematch()`, gardée sur `status === 'playing'`, délègue à `startGame(mode, noms, distances courants)` : rien n'est remis à zéro à la main. Exposée dans le `return` à côté de `rematch`. Commentaire de `resetGame` complété. Tests : remise à zéro complète (`startedAt` renouvelé sous fake timers), côtés conservés après `ÉCHANGER`, offre égalisatrice en attente et égalisatrice acceptée effacées, no-op en `idle` et `finished`, persistance en **une** écriture (`setItem` compté).
- **Task 2** — `restartPromptOpen` local, `askRestart` (garde `canUndo` doublant le `disabled`), `closeRestartPrompt` et `confirmRestart` avec `lockPanels()`. Picto `restart-button` dupliqué dans chaque colonne dans un `<template v-else>` avec la sortie : colonne gauche sortie (`ml-4`) puis RECOMMENCER, colonne droite RECOMMENCER puis sortie (`mr-4`) ; `gap-2` (16 px) sur les deux conteneurs de colonne. Glyphe Lucide `rotate-ccw` (flèche seule — tranché par Nathan en revue de code, 2026-09-10). `EXIT_BUTTON_CLASSES` renommée `PICTO_BUTTON_CLASSES` (constante partagée, un seul endroit). `PromptModal` « RECOMMENCER LA PARTIE ? » après celle de sortie, commentaire « recommencer ≠ terminer ». Commentaire de bloc de la sortie mis à jour.
- **Task 3** — Tests vue : voisinage et ordre des deux pictos (même parent, sortie au bord — `nextElementSibling` vérifié dans les deux sens), bascule de côté au `switchTurn` ; picto `disabled` et inerte sur scoreboard intact, réactivé après `+` ; pop-up sans message/bille/croix, `ANNULER` laisse tout intact + grâce vérifiée (undo immédiat ignoré, undo après 300 ms agit) ; `RECOMMENCER` après `ÉCHANGER` + deux séries + correction → scoreboard neuf (noms/distances échangés conservés, scores 0, REP 1, liseré gauche, CTA sous le jaune, `ANNULER` et RECOMMENCER grisés) + grâce vérifiée dans les deux sens ; reprise après fermeture ramène la partie recommencée. Le test existant `leaves the game from the exit pictogram` reste valide sans modification (Task 3.4 : aucun test ne lisait « le seul bouton de la colonne »).
- **Task 4** — Passe visuelle unique dans Chrome (harnais iframe `_viewport-harness.html`, supprimé en fin de passe), **1024×768** puis **768×1024**, partie pilotée par le store de l'iframe (`[data-v-app].__vue_app__.config.globalProperties.$pinia._s.get('game')`). Mesures DOM : chaque picto **90×90 px**, écart **16 px**, tous deux dans la colonne 2/5 (paysage : colonne 0–410, sortie 32–122, RECOMMENCER 138–228 ; portrait, côté droit : colonne 461–768, RECOMMENCER 540–630, sortie 646–736), `scrollWidth` = `innerWidth` en portrait. Scoreboard intact → `disabled` + opacité 0,3 ; après `+` → actif ; main rendue → les deux pictos basculent, sortie toujours au bord extérieur. Tap RECOMMENCER → pop-up centrée « RECOMMENCER LA PARTIE ? », CTA pleine largeur (606 px dans une carte de 672), sans message/bille/croix, état inchangé. `ANNULER` → scoreboard intact (score 1, main au jaune, pile de 2). RECOMMENCER → scoreboard neuf sous le doigt sans passer par l'accueil (`status` reste `playing`, aucun `step-category`, aucun `game-summary`), scores 0, REP 1, blanc à la main, CTA sous le jaune, `ANNULER` et RECOMMENCER grisés, sauvegarde `localStorage` neuve (0 reprise, pile vide). Console vierge (aucun message après rechargement en portrait). **Glyphe** : flèche circulaire seule (Lucide `rotate-ccw`) livrée comme proposition de base — **tranchée par Nathan en revue de code (2026-09-10) : flèche seule**, l'alternative flèche + croix (Task 2.3) est abandonnée.
- **Task 5 (5.1–5.4)** — Notes datées ajoutées, lignes existantes conservées : `epics.md` (Story 1.15 « ✅ Recadrée », Story 3.1 « à traiter ici »), `ux-design-specification.md` (§2.5 point 1, puce « Recommencer » des règles de fin, fiche `ActionBar`, fiche `PromptModal` › Usages), `architecture.md` (note store 1.10 + fiche `PromptModal.vue`), `deferred-work.md` (revue 1.3 ✅ traité 1.10 / RECOMMENCER 1.15 ; revue 1.5 markup dupliqué « aggravé »).

### File List

- `carom-scoreboard/src/stores/useGameStore.ts` — action `restartGame()`, commentaire `resetGame`, export
- `carom-scoreboard/src/stores/useGameStore.test.ts` — 4 tests `restartGame` (fin de partie) + `saves after restart` (persistance)
- `carom-scoreboard/src/views/GameView.vue` — picto RECOMMENCER ×2, `restartPromptOpen`/`askRestart`/`closeRestartPrompt`/`confirmRestart`, `PromptModal` « RECOMMENCER LA PARTIE ? », `PICTO_BUTTON_CLASSES`, commentaires
- `carom-scoreboard/src/views/GameView.test.ts` — 5 tests (voisinage des pictos, picto inerte, ANNULER + grâce, RECOMMENCER + grâce, reprise après fermeture)
- `_bmad-output/planning-artifacts/epics.md` — notes Story 1.15 et Story 3.1
- `_bmad-output/planning-artifacts/ux-design-specification.md` — §2.5, fiches `ActionBar` et `PromptModal`
- `_bmad-output/planning-artifacts/architecture.md` — note store, fiche `PromptModal.vue`
- `_bmad-output/implementation-artifacts/deferred-work.md` — revues 1.3 et 1.5
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — `1-15` → `in-progress` puis `review`
- `_bmad-output/implementation-artifacts/1-15-reinitialiser-une-partie-en-cours.md` — ce fichier
