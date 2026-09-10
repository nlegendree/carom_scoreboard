# Story 1.15: Réinitialiser une partie en cours

Status: ready-for-dev

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

- [ ] **Task 1 — Store : `restartGame()` (AC: 5–8)**
  - [ ] 1.1 Dans `useGameStore.ts`, juste après `rematch()` :
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
  - [ ] 1.2 Mettre à jour le commentaire de `resetGame` (« Retour à l'accueil … La confirmation avant abandon est portée par la pop-up de sortie ») : ajouter que la remise à zéro **sans** retour à l'accueil est `restartGame` (1.15).
  - [ ] 1.3 Tests `useGameStore.test.ts`, à la suite des tests de `rematch` (motif `startGame('cadre-47-2', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })`, helpers `startedGame`/`validate` existants) :
    - `restarts the running game with the same players, distances and sides` : `validate(store, 'player1', 4)`, `validate(store, 'player2', 3)`, `store.adjustScore('player1', 1)` → `restartGame()` → `status 'playing'`, `mode` conservé, `reprises []`, `history []`, `canUndo` faux, `player1` `{ name 'MICHEL', targetScore 10, score 0 }`, `player2` `{ 'ANDRE', 8, 0 }`, `activePlayer 'player1'`, `scoreAdjustments {0,0}`, `startedAt` renouvelé (fake timers ou `toBeGreaterThanOrEqual`), `winner null`, `finishedAt null`, `endPrompt null`, `equalizingReprise false`, `entryOpen false`, `currentInput` vide.
    - `keeps swapped players on their current side when restarting` : `swapPlayers()`, `validate(store, 'player1', 2)` → `restartGame()` → `player1.name 'ANDRE'`, `player1.targetScore 8`, `player2.name 'MICHEL'`, `sidesSwapped false`.
    - `clears an accepted equalizing reprise and a pending end prompt when restarting` : blanc valide `10` (offre), `acceptEqualizingReprise()` → `restartGame()` → `equalizingReprise false`, `endPrompt null`, `status 'playing'`. *(Injoignable au doigt — le voile recouvre la barre — mais c'est le contrat de l'action pour le pilotage déporté.)*
    - `refuses to restart while idle or finished` : store neuf → `restartGame()` → `status 'idle'`, `startedAt null` ; partie `finishGame()`d → `restartGame()` → `status 'finished'`, `winner` inchangé, `reprises` intactes.
    - Persistance (`describe` de la 1.12, helper `saved()`) : `saves after restart` — `validate(store, 'player1', 7)`, `restartGame()`, `await nextTick()` → `saved().status 'playing'`, `saved().reprises []`, `saved().history []`, `saved().player1.name 'MICHEL'`, `saved().player1.score 0`. Une seule écriture pour l'action (même vérification par compteur que « une action = une écriture », si le helper existe).

- [ ] **Task 2 — `GameView.vue` : picto, pop-up, grâce (AC: 1–5)**
  - [ ] 2.1 État local, à côté de `exitPromptOpen` (même raison : l'ouverture d'une confirmation n'est pas un état de partie, elle n'a pas à survivre à un rechargement) :
    ```ts
    const restartPromptOpen = ref(false)
    function askRestart(): void { if (!canUndo.value) return; restartPromptOpen.value = true }
    function closeRestartPrompt(): void { restartPromptOpen.value = false; lockPanels() }
    function confirmRestart(): void { restartPromptOpen.value = false; gameStore.restartGame(); lockPanels() }
    ```
    **Garde `canUndo` dans `askRestart` en plus du `disabled`** : le `disabled` porte le visuel grisé (AC2), la garde porte le comportement — les navigateurs ne s'accordent pas sur l'envoi des `pointer events` aux contrôles désactivés (Chromium en a changé en 2023), et happy-dom non plus. Le test AC2 vérifie l'un et l'autre.
  - [ ] 2.2 Picto : dans **chacune** des deux colonnes (le markup de la barre est dupliqué par colonne — dette connue, revue 1.5, **ne pas refactorer ici**), à côté du bouton `exit-button`, un `<button data-testid="restart-button" :data-side="…" aria-label="Recommencer la partie" :disabled="!canUndo" :class="EXIT_BUTTON_CLASSES" class="disabled:opacity-30" @pointerdown="askRestart">`. Ordre et marges : **colonne gauche** (`justify-start`) → sortie avec `ml-4` puis RECOMMENCER ; **colonne droite** (`justify-end`) → RECOMMENCER puis sortie avec `mr-4` — la sortie garde le bord extérieur, comme aujourd'hui. Poser `gap-2` (16 px, `--spacing: 8px`) sur le conteneur de colonne plutôt que des marges sur le picto. Vérifier que `EXIT_BUTTON_CLASSES` (constante) reste partagée telle quelle ; renommer en `PICTO_BUTTON_CLASSES` si on veut, en un seul endroit.
  - [ ] 2.3 Glyphe : SVG inline **sur le même modèle que la sortie** (`viewBox="0 0 24 24"`, `h-8 w-8`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap/linejoin="round"`, `aria-hidden="true"`). Flèche circulaire de reprise, tracé Lucide `rotate-ccw` :
    ```html
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    ```
    Nathan valide le glyphe à la passe visuelle (Task 4) — il a évoqué « une flèche recyclage avec une croix dedans » ; le tracé ci-dessus est la proposition de base, une petite croix centrale (`M9 9l6 6M15 9l-6 6` en `stroke-width="1.5"`) est l'alternative si la flèche seule ne dit pas « remise à zéro ».
  - [ ] 2.4 Pop-up, **après** celle de sortie dans le template (même voile inerte, même absence de croix et de message) :
    ```html
    <PromptModal v-if="restartPromptOpen" title="RECOMMENCER LA PARTIE ?" primaryLabel="RECOMMENCER" secondaryLabel="ANNULER" @primary="confirmRestart" @secondary="closeRestartPrompt" />
    ```
    Commentaire au-dessus : recommencer ≠ terminer — pas de `finished`, pas de récap, pas d'historique (Epic 3).
  - [ ] 2.5 Mettre à jour le commentaire de bloc « Sortie : plus rien de destructif au contact … » pour mentionner le second picto et sa confirmation.

- [ ] **Task 3 — Tests `GameView.test.ts` (AC: 1–5, 7)**
  - [ ] 3.1 Dans `describe('GameView — saisie en popup et alternance')`, à côté de `keeps the exit control opposite the add-points button` : `keeps the restart control next to the exit control` — `restart-button[data-side="player1"]` existe et `[data-side="player2"]` non ; après `store.switchTurn()` l'inverse ; les deux pictos sont dans le **même** conteneur (`exit.element.parentElement === restart.element.parentElement`) ; `aria-label` présent, `text()` vide.
  - [ ] 3.2 Dans `describe('GameView — fin de partie')` (fake timers, helpers `startedGame`, `validateSeries`, `press`, `prompt`, `scoreOf`, `panels`) :
    - `keeps the restart control inert on an untouched board` : `restart-button` a l'attribut `disabled` ; `press('restart-button')` → aucune `prompt-modal`, `status 'playing'` ; après `press('score-plus')` → plus de `disabled`.
    - `asks before restarting and leaves the board untouched on ANNULER` : deux séries (`[4]`, `[4]`), `press('restart-button')` → `prompt-title` « RECOMMENCER LA PARTIE ? », `prompt-primary` « RECOMMENCER », `prompt-secondary` « ANNULER », pas de `prompt-message`, `status 'playing'`, scores inchangés ; `press('prompt-secondary')` → pop-up fermée, `scoreOf(0) '4'`, `scoreOf(1) '4'`, `store.canUndo` vrai ; grâce : `press('undo-button')` immédiat → score toujours `'4'` ; `advanceTimersByTime(300)` puis `press('undo-button')` → `'0'` côté jaune (la grâce est bien levée). *Vérifier par mutation* : retirer `lockPanels()` de `closeRestartPrompt` doit casser ce test.
    - `restarts the game in place on RECOMMENCER` : `press('swap-players-button')`, séries `[4]`, `[4]`, `press('score-plus')` → `press('restart-button')`, `press('prompt-primary')` → pas de `prompt-modal`, pas de `game-summary`, pas de `step-category`, `status 'playing'`, `panels` ×2, panneau gauche `name 'ANDRÉ'` / `target-score '8'`, droit `'MICHEL'` / `'10'`, `scoreOf` `'0'` / `'0'`, `reprise-number '1'`, liseré sur le panneau gauche (`props('active')` vrai), `add-points-button[data-side="player2"]`, `undo-button` `disabled`, `restart-button` `disabled` ; grâce : `press('score-plus')` immédiat sur un panneau → score reste `'0'`.
    - `reopens no end prompt after a restart from an accepted equalizing reprise` — optionnel, uniquement si testable au doigt ; sinon couvert par le test du store (1.3).
  - [ ] 3.3 Dans `describe('GameView — reprise après fermeture')` : `resumes the restarted game, not the old one` — série, `restartGame()` (via le store, ou via les pictos), remonter un `GameView` neuf après `checkSavedGame()` → `REPRENDRE LA PARTIE` → scores `'0'`, `reprises []`. Suivre le motif des tests existants de la 1.12 (storage réel de happy-dom ou helper `saved()`).
  - [ ] 3.4 Le test existant `leaves the game from the exit pictogram` cherche `[data-testid="exit-button"]` : il reste valide (le picto RECOMMENCER a son propre `data-testid`). Si un test lisait « le seul `<button>` de la colonne », le corriger.

- [ ] **Task 4 — Passe visuelle unique (AC: 1, 3, 5, 9)** — CLAUDE.md §9 : après tests/`vue-tsc`/`build` verts, un seul parcours Chrome en **1024×768 et 768×1024** : deux pictos côte à côte, alignés sur le bord du bloc joueur, sortie à l'extérieur, `≥ 90 px` chacun, aucun débordement de la colonne 2/5 en portrait ; bascule de côté à chaque tour ; picto grisé sur scoreboard intact ; pop-up centrée, CTA pleine largeur ; RECOMMENCER → scoreboard neuf sous le doigt, pas de flash d'accueil ; console vierge. **Nathan tranche le glyphe à ce moment** (flèche seule vs flèche + croix).

- [ ] **Task 5 — Specs (AC: 10)** — notes **datées**, lignes existantes conservées :
  - [ ] 5.1 `epics.md` › Story 1.15 : note « ✅ Recadrée (décision de Nathan, 2026-09-10) » reprenant l'encadré de tête de ce fichier (RECOMMENCER à côté de la sortie, confirmation, sans récap, côté conservé ; quitter sans récap reporté à la 3.1). `epics.md` › Story 3.1 : note « à traiter : une partie **recommencée** (1.15) n'a jamais été `finished` et n'entre pas dans l'historique ; le « quitter sans récap » (abandon) reste à définir ici — abandon = non sauvegardée ? défaite ? ».
  - [ ] 5.2 `ux-design-specification.md` : §2.5 « Règles de fin de partie » → puce « **Recommencer** (picto à côté de la sortie, confirmation « RECOMMENCER LA PARTIE ? » `RECOMMENCER` / `ANNULER`) : la partie repart de zéro sur place, mêmes joueurs, distances et côtés, sans récap » ; fiche `ActionBar` → note 1.15 (deux pictos dans la colonne opposée au CTA, sortie au bord) ; fiche `PromptModal` › *Usages* → « RECOMMENCER LA PARTIE ? » ; §2.5 point 1 (« Le picto de sortie occupe la colonne opposée ») → « les pictos de sortie et de recommencement ».
  - [ ] 5.3 `architecture.md` : note store (ligne « `finishGame()`, seule action de clôture ») → `restartGame()` = `startGame` gardé sur `playing`, jamais `finished` ; fiche `PromptModal.vue` → ajouter l'usage.
  - [ ] 5.4 `deferred-work.md` › revue 1.3 « **QUITTER destructif sans confirmation** … Story 1.15 » → « ✅ Traité en 1.10 (confirmation de sortie) ; la 1.15 livre RECOMMENCER (2026-09-10) ». Revue 1.5 « Markup dupliqué dans la barre basse » → ajouter « aggravé en 1.15 (second picto dupliqué), toujours à nettoyer ».
  - [ ] 5.5 `sprint-status.yaml` : `1-15` → `review` en fin de dev.

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

1. **Glyphe** : flèche circulaire seule (`rotate-ccw`) ou flèche + petite croix au centre ? Proposition de base : flèche seule ; à voir à la passe visuelle.
2. **Picto grisé vs. masqué** sur scoreboard intact : la story choisit **grisé** (barre stable, motif `ANNULER`). Dire si masqué est préféré.
3. **Libellé** : « RECOMMENCER LA PARTIE ? » / `RECOMMENCER`. Alternative « REPARTIR DE ZÉRO ? » si « recommencer » prête à confusion avec « une partie de plus ».

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

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
