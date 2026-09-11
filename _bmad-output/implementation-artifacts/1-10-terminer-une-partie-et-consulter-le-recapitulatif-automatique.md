# Story 1.10: Terminer une partie et consulter le récapitulatif automatique

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **Recadrée par Nathan le 2026-09-10, à la création.** Le titre reste celui de l'epic (clé de sprint), mais le périmètre est élargi et précisé :
> 1. **La Story 1.11 est absorbée** (détection automatique de fin). La fin d'une partie de carambole obéit à la **reprise égalisatrice**, règle jusqu'ici absente des specs — voir « Règles du jeu » ci-dessous. Récap et détection sont indissociables : une seule story, un seul rendu à valider.
> 2. **La distance devient obligatoire** au démarrage (les deux joueurs), avec une pop-up d'erreur si l'on tente de démarrer sans. Supersède l'AC « aucun réglage explicite → distance 0 » de la Story 1.4 et l'AC « aucun objectif configuré → fin manuelle » de la 1.11. Le store reste permissif (0 = libre, aucune fin automatique) pour les tests et le pilotage déporté ; c'est l'accueil qui impose la règle.
> 3. **Le picto de sortie ne jette plus la partie** : il ouvre une pop-up « Terminer la partie ? » dont le CTA mène au récap — « comme si le jaune gagnait », même coquille que la pop-up de fin automatique. Une partie sans aucune série jouée revient directement à l'accueil.
> 4. **Vainqueur en fin manuelle : au prorata** (`score / distance`, le plus avancé vers son handicap gagne ; égalité si égal). Les cas particuliers (abandon = défaite, etc.) viendront plus tard.
> 5. **L'écran de récap s'inspire de Billiboard** (`explore/resources/IMG_6632.JPG`) : bandeau haut `NOM / distance` **VS** `NOM / distance`, deux colonnes joueur autour d'une colonne de libellés, la colonne du vainqueur mise en couleur, deux boutons en bas : **FIN DE PARTIE** et **UNE PARTIE DE PLUS**.
> 6. **Prolongation en cas d'égalité : plus tard** (story à créer le jour venu). Ici, l'égalité est un résultat final.

> **Revue de Nathan au rendu (2026-09-10, après implémentation) — trois ajustements, ACs amendés :**
> 1. **Distance manquante (AC1)** : la pop-up se réduit au titre et au CTA `RÉGLER LA DISTANCE` (pas de message nommant la bille). Le CTA ouvre la modale du **blanc** sur le champ distance s'il lui en manque une, sinon celle du jaune ; **valider la distance du blanc ouvre directement celle du jaune** si elle manque encore (enchaînement dans un seul sens, jamais depuis une zone ouverte à la main). Après la chaîne, un dernier `DÉMARRER` lance la partie.
> 2. **Pop-ups du scoreboard sans croix ni message (AC3, AC5, AC6, AC9)** : « PARTIE TERMINÉE » ne porte que le titre et `VOIR LE RÉCAP` — ni « X GAGNE », ni bille, ni croix : le résultat se lit sur le récap, et on ne revient pas au scoreboard. La correction d'une série gagnante mal saisie n'est donc plus possible une fois la fin détectée (accepté). `dismissEndPrompt` reste une action du store, sans bouton. La pop-up de sortie « TERMINER LA PARTIE ? » n'a **pas de croix non plus** : le retour est un gros CTA secondaire `ANNULER` (les croix ne sont pas intuitives pour les joueurs, un CTA l'est — Nathan, 2026-09-10) ; son message est retiré lui aussi — titre et deux CTA. Même traitement pour « DISTANCE MANQUANTE » à l'accueil : `RÉGLER LA DISTANCE` / `ANNULER`, sans croix. `closable` de `PromptModal` n'a plus d'usage.
> 3. **Offre d'égalisatrice (AC3, AC4)** : plus de message ; les deux CTA suffisent — `<NOM DU JAUNE> JOUE` (accent) et `FIN DE PARTIE` (neutre).

## Règles du jeu (Nathan, 2026-09-10) — à consigner dans les specs

- **Le blanc ouvre toujours.** Chaque joueur a **sa** distance (handicap, Story 1.4). Quand un joueur atteint sa distance en cours de série, il s'arrête : la série entrée au pavé est celle qui l'y amène (`score ≥ distance`).
- **Le blanc atteint sa distance le premier** → il a joué **une reprise de plus** que le jaune. Le jaune a droit à la **reprise égalisatrice** : une seule série pour tenter d'atteindre **sa** distance. S'il y parvient → **égalité** ; sinon → **le blanc gagne**. Le jaune peut y **renoncer** → le blanc gagne.
- **Le jaune atteint sa distance le premier** → il **gagne immédiatement** : il n'a pas ouvert, les deux joueurs ont joué le même nombre de reprises.
- **Au 3 bandes, la reprise égalisatrice est optionnelle** (règlement variable) → réglage de partie à prévoir dans l'**Epic 2**, hors périmètre ici. En JDS elle s'applique toujours.
- **Référence terrain** : en Corée (3 bandes sans égalisatrice), une pop-up annonce la fin dès qu'un joueur atteint sa distance, avec un CTA vers le récap. On reprend le geste, adapté à l'égalisatrice.

## Story

As a joueur (Michel qui termine son match),
I want que la partie se termine seule quand une distance est atteinte, selon la règle de la reprise égalisatrice, et voir aussitôt un récapitulatif façon « battle »,
so that la fin de partie soit le moment le plus gratifiant de la session — « 8,75 de moyenne, c'est mon record » — sans aucun calcul ni action superflue (FR4, FR16, FR17, UX-DR13).

## Acceptance Criteria

### Distance obligatoire

1. **Given** l'étape joueurs de `HomeScreen` **When** je tape `DÉMARRER` alors qu'au moins une distance vaut 0 **Then** la partie **ne démarre pas** et une **pop-up d'erreur** s'ouvre (même coquille que les autres : voile flouté, carte centrée, croix) : titre « DISTANCE MANQUANTE », message nommant la ou les billes concernées (« La bille blanche n'a pas de distance. »), CTA `RÉGLER LA DISTANCE` qui referme la pop-up et ouvre la `PlayerSetupModal` du **premier** joueur sans distance ; la croix referme sans rien faire.
2. **Given** les deux distances réglées (> 0) **When** je tape `DÉMARRER` **Then** la partie démarre comme avant (Story 1.3/1.4). Les zones joueur affichent toujours la distance saisie.

### Détection automatique de fin (FR16)

3. **Given** une partie en cours **When** le joueur **blanc** (côté gauche, `player1`) valide une série qui porte son score à `≥` sa distance **Then** le tour a basculé sur le jaune comme d'habitude, et une **pop-up** s'ouvre par-dessus le scoreboard : titre « MICHEL A ATTEINT SA DISTANCE », bille blanche en en-tête, message « ANDRÉ joue-t-il la reprise égalisatrice ? », deux CTA : `OUI, IL JOUE` (accent) et `NON, FIN DE PARTIE` (neutre). **Pas de croix** : une décision est attendue. Le voile ne ferme pas.
4. **Given** la pop-up égalisatrice **When** je tape `OUI, IL JOUE` **Then** elle se referme, le scoreboard est de retour et **c'est au jaune de jouer** : liseré rouge sur le panneau jaune, et — règle de la 1.5 — `AJOUTER LES POINTS` sous le panneau **blanc**, puisque c'est l'adversaire assis qui rentre les points de celui qui joue. La partie est en **reprise égalisatrice** — **aucun signal visuel spécifique** (décision de Nathan, 2026-09-10 : la pop-up a suffi) ; **When** je tape `NON, FIN DE PARTIE` **Then** la partie se termine, **le blanc gagne**, le récap s'affiche.
5. **Given** la reprise égalisatrice acceptée **When** le jaune valide sa série (ou rend la main sans marquer : tap sur la zone adverse, série de 0) **Then** la partie se termine **quoi qu'il arrive** : s'il a atteint sa distance → **ÉGALITÉ**, sinon → **le blanc gagne** ; une pop-up « PARTIE TERMINÉE » l'annonce (« ÉGALITÉ » ou « MICHEL GAGNE », bille du vainqueur), CTA unique `VOIR LE RÉCAP`, et une **croix** qui ramène au scoreboard sans terminer — pour pouvoir corriger une série mal saisie par `ANNULER` (la détection rejouera à la prochaine validation).
6. **Given** une partie en cours, hors reprise égalisatrice **When** le joueur **jaune** valide une série qui porte son score à `≥` sa distance **Then** la partie se termine, **le jaune gagne** : pop-up « PARTIE TERMINÉE — ANDRÉ GAGNE », bille jaune, CTA `VOIR LE RÉCAP`, croix vers le scoreboard.
7. **Given** un joueur avec une distance (> 0) **When** il valide une série supérieure à ce qui lui reste (`distance − score`) **Then** la série enregistrée est **plafonnée au restant** : au billard on s'arrête à la distance, tout au-delà est une erreur de saisie. Le score final vaut exactement la distance, la moyenne et la meilleure série sont calculées sur la série plafonnée. Aucun plafonnement en distance 0.
8. **Given** la détection **When** j'observe ce qui la déclenche **Then** ce sont uniquement les **séries** (validation au pavé — bouton ou auto-validation à 3 s — et main rendue) ; les corrections `−`/`+` ne la déclenchent pas, `ÉCHANGER` non plus. Un joueur en distance 0 (partie démarrée hors accueil) n'induit jamais de fin automatique. Les deux chemins de validation aboutissent au même état (UX-DR15).
9. **Given** la pop-up égalisatrice acceptée, puis `ANNULER` sur la série gagnante du blanc **When** la partie revient en arrière **Then** l'état « reprise égalisatrice » est **défait avec elle** (il fait partie du snapshot) : la partie reprend son cours normal, et si le blanc revalide une série gagnante, la pop-up se représente.

### Fin manuelle

10. **Given** une partie en cours avec au moins une série jouée **When** je tape le picto de sortie **Then** une pop-up « TERMINER LA PARTIE ? » s'ouvre (message : « Le récapitulatif s'affiche et la partie est close. »), CTA `VOIR LE RÉCAP`, croix pour rester. Rien n'est perdu tant que je n'ai pas confirmé.
11. **Given** la pop-up de sortie **When** je confirme **Then** le vainqueur est déterminé **au prorata** : `score / distance` le plus élevé gagne ; égalité si les deux prorata sont égaux (0 ‑ 0 compris). Le récap s'affiche.
12. **Given** une partie où **aucune série** n'a été jouée **When** je tape le picto de sortie **Then** retour direct à l'accueil (`resetGame`), sans pop-up ni récap — il n'y a rien à récapituler.
    > *Revue de code (décision de Nathan, 2026-09-10)* : « aucune série » devient **« aucune action annulable »** (`canUndo`) — des points ajoutés par `+`/`−` sans série valent aussi confirmation ; seul un scoreboard intact revient directement à l'accueil.

### Écran de récapitulatif (FR4, FR17, UX-DR13)

13. **Given** la partie terminée (`status = 'finished'`) **When** l'écran s'affiche **Then** il **remplace** le scoreboard en plein écran (pas une pop-up) : c'est un état de la partie. Structure Billiboard : **bandeau** haut « MICHEL / 100 » **VS** « ANDRÉ / 80 » (nom / distance de chaque joueur, côté conservé : gauche = blanc), avec le **mode de jeu** (`GAME_MODE_LABELS[mode]`, ex. `CADRE 47/2`) intégré **esthétiquement** au bandeau — en surtitre discret au-dessus du `VS`, `text-stat tracking-[0.3em] text-white/50`, jamais en concurrence avec les noms ; en dessous, **trois colonnes** — joueur gauche, libellés, joueur droit — avec les lignes **RÉSULTAT** (`VICTOIRE` / `DÉFAITE` / `ÉGALITÉ` + la bille du joueur), **POINTS** (total), **MOY** (moyenne à 3 décimales), **SÉRIE** (meilleure série), **REPRISES** (reprises jouées par ce joueur).
14. **Given** un vainqueur **When** je regarde le récap **Then** sa colonne entière est mise en couleur **victoire** — **ruban rouge `--color-victory-ribbon`** par défaut (fidèle au rose/rouge Billiboard ; Nathan tranchera au rendu, l'or `--color-victory-gold` est le repli, UX-DR5), l'autre reste neutre sur fond sombre ; en cas d'égalité, aucune colonne n'est mise en avant et les deux lignes RÉSULTAT lisent `ÉGALITÉ`. Le signal ne repose pas sur la seule teinte : le mot `VICTOIRE` est là.
15. **Given** le récap **When** je le lis **Then** aucune statistique n'exige de calcul : total, moyenne et meilleure série sont ceux du store (`averages`, `bestSeries`), identiques à ce qu'affichaient les panneaux ; contraste WCAG AA sur toutes les cellules (UX-DR22) ; lisible à 2 m (NFR10) — valeurs en `text-label`/`text-reprise`, jamais `text-stat` pour les chiffres.
16. **Given** le récap **When** j'observe la barre basse **Then** deux boutons : `FIN DE PARTIE` (neutre, gauche) → `resetGame()` → accueil ; `UNE PARTIE DE PLUS` (accent, droite) → nouvelle partie **même mode, mêmes noms, mêmes distances, chacun du côté où il est**, scoreboard directement (sans repasser par l'accueil). Pas de bouton retour. Aucun `ANNULER` : le récap est **terminal** (`undoLastAction` reste un no-op hors `playing`) — la correction se fait **avant**, par la croix des pop-ups de fin.
17. **Given** `GameSummary` **When** je lis son API **Then** il expose un état visuel « nouveau record » **par joueur** (prop, défaut `false`), **jamais déclenché** dans cette story — la Story 3.5 l'activera sans modifier le composant (note de périmètre de l'epic).

### Transverses

18. **Given** toute la story **When** j'interagis **Then** `@pointerdown` partout (AR8) ; le voile des nouvelles pop-ups est **inerte** (ce sont des décisions, pas des saisies abandonnables — le pattern « tap complet sur le voile » des pop-ups de saisie ne s'applique pas) ; commandes ≥ 90×90 px (UX-DR8) ; aucune action de score couplée au seul geste : `finishGame()`, `acceptEqualizingReprise()`, `dismissEndPrompt()`, `rematch()` sont des actions Pinia nommées (UX-DR23, AR15, AR17).
19. **Given** les specs (`epics.md`, `ux-design-specification.md`, `architecture.md`, `deferred-work.md`) **When** je lis les Stories 1.4, 1.10, 1.11, 1.15, UX-DR13, les fiches `GameSummary`/`ActionBar` et les différés « `finished` sans branche de rendu » et « undo depuis `finished` » **Then** les décisions du 2026-09-10 y sont consignées par notes datées, règles du jeu comprises.

## Tasks / Subtasks

- [x] **Task 1 — Types (AC: 3–9, 11, 13)**
  - [x] 1.1 `types/game.ts` : `export type PlayerId = 'player1' | 'player2'` (l'union est écrite en toutes lettres à ~15 endroits ; l'introduire ici, migrer **au passage** les signatures du store, sans chasse exhaustive). `export type EndPrompt = { kind: 'equalizing-offer' } | { kind: 'over'; winner: PlayerId | null }`. `GameState` : + `winner: PlayerId | null`, `finishedAt: number | null`, `equalizingReprise: boolean`. `GameSnapshot` : + `equalizingReprise: boolean` (**pas** `endPrompt`, `winner`, `finishedAt` : la pop-up est toujours fermée quand on annule, et l'undo est impossible hors `playing`).
  - [x] 1.2 Rien dans `GAME_CATEGORIES`. `GAME_MODE_LABELS` (existant) fournit le libellé du mode au bandeau du récap (AC13).

- [x] **Task 2 — Store : fin de partie, égalisatrice, vainqueur, revanche (AC: 3–12, 16, 18)**
  - [x] 2.1 État : `const winner = ref<PlayerId | null>(null)`, `finishedAt = ref<number | null>(null)`, `equalizingReprise = ref(false)`, `endPrompt = ref<EndPrompt | null>(null)`. `startGame`/`resetGame` remettent les quatre à zéro. `takeSnapshot` capture `equalizingReprise` ; `undoLastAction` le restaure ; `mirrorSnapshot` le **recopie tel quel** (la parité de côté ne change pas ce fait de jeu). ⚠️ `equalizingReprise` porte sur le **côté droit** (`player2`), pas sur une personne : après `ÉCHANGER` en pleine égalisatrice, c'est toujours le joueur de droite qui joue la reprise — cohérent avec le tour attaché au côté (Décision 15 de la 1.5). Le noter en commentaire.
  - [x] 2.2 **Plafonnement** (AC7) dans `validateScoreInput`, entre la lecture du buffer et `addReprise` : `const target = playerRef(playerId).value.targetScore; const remaining = target - playerRef(playerId).value.score; const value = target > 0 ? Math.min(Number(buffer), Math.max(remaining, 0)) : Number(buffer)`. Le `Math.max(…, 0)` couvre un score déjà ≥ distance (série plafonnée à 0 — état atteignable après la croix d'une pop-up de fin). Le snapshot (`pushHistory`) est pris **avant**, donc l'undo restaure l'état d'avant la série plafonnée. `passTurn` (série de 0) n'a rien à plafonner. `function hasReachedTarget(playerId): boolean` — `target > 0 && score >= target` (avec le plafonnement, `>=` devient `===` en pratique ; garder `>=` par robustesse — `adjustScore` n'est pas borné). `function prorataWinner(): PlayerId | null` — `progress = target > 0 ? score / target : score` pour chacun ; `>` → gagnant, `===` → `null`. (Mélange ratio/brut seulement si une seule distance vaut 0 : injoignable depuis l'accueil, acceptable pour le store.)
  - [x] 2.3 `function checkEndOfGame(playerId): void`, appelée en **fin** de `validateScoreInput` et de `passTurn` (après `switchTurn`, avant `lastSaved`) — **pas** dans `adjustScore`, `addReprise`, `swapPlayers` (AC8) :
    ```
    if (equalizingReprise && playerId === 'player2') endPrompt = { kind: 'over', winner: reached ? null : 'player1' }
    else if (reached && playerId === 'player1') endPrompt = { kind: 'equalizing-offer' }
    else if (reached && playerId === 'player2') endPrompt = { kind: 'over', winner: 'player2' }
    ```
    où `reached = hasReachedTarget(playerId)`. Le premier cas passe **avant** les autres : en égalisatrice, la série du jaune termine la partie même s'il n'atteint pas.
  - [x] 2.4 `acceptEqualizingReprise()` : garde `endPrompt?.kind === 'equalizing-offer'` ; `equalizingReprise = true` ; `endPrompt = null`. **N'empile rien** : ce n'est pas une action de score, et le snapshot de la série gagnante du blanc porte déjà `equalizingReprise: false` (AC9).
  - [x] 2.5 `dismissEndPrompt()` : garde `endPrompt?.kind === 'over'` (l'offre égalisatrice ne se ferme pas par la croix) ; `endPrompt = null`.
  - [x] 2.6 `finishGame()` : garde `status === 'playing'`. Vainqueur : `endPrompt.kind === 'over'` → `endPrompt.winner` ; `endPrompt.kind === 'equalizing-offer'` → `'player1'` (c'est le **refus** de l'égalisatrice) ; sinon → `prorataWinner()` (fin manuelle). Puis `status = 'finished'`, `finishedAt = Date.now()`, `endPrompt = null`, `currentInput` vidé, `lastSaved`. **Une seule action** pour les trois CTA « VOIR LE RÉCAP » / « NON, FIN DE PARTIE » / sortie confirmée : `GameView` n'a rien à décider. `history` est **conservé** (inutile mais inoffensif ; `resetGame` le vide).
  - [x] 2.7 `rematch()` : garde `status === 'finished'` ; `startGame(mode.value, player1.value.name, player2.value.name, { player1: player1.value.targetScore, player2: player2.value.targetScore })`. Chacun repart du côté où il est.
  - [x] 2.8 Exposer `repriseCounts = computed(() => ({ player1: playedReprises('player1'), player2: playedReprises('player2') }))` (le récap affiche REPRISES) ; exposer `winner`, `finishedAt`, `equalizingReprise`, `endPrompt`, `repriseCounts`, `finishGame`, `acceptEqualizingReprise`, `dismissEndPrompt`, `rematch`. Mettre à jour le commentaire d'`undoLastAction` (« hors `playing` : le récap est terminal, décision du 2026-09-10 »).
  - [x] 2.9 Tests `useGameStore.test.ts` — nouveau `describe('useGameStore — fin de partie')`, motif `startGame('libre', 'MICHEL', 'ANDRE', { player1: 10, player2: 8 })` :
    - blanc valide `10` → `endPrompt` `{ kind: 'equalizing-offer' }`, `status` toujours `playing`, `activePlayer` `player2`.
    - blanc valide `9` → `endPrompt` `null` (pas atteint) ; blanc `12` → offre **et** `player1.score === 10`, `reprises[0]!.player1 === 10`, `bestSeries.player1 === 10` (série plafonnée au restant, AC7) ; blanc `4` puis `9` → score `10`, seconde série `6`.
    - sans distance (`startGame` sans format) : blanc `12` → score `12` (aucun plafonnement).
    - plafonnement + undo : blanc `12` (→ `10`), `undoLastAction()` → score `0` ; revalide `3` → `3`.
    - offre + `acceptEqualizingReprise()` → `equalizingReprise` vrai, `endPrompt` null ; jaune valide `8` → `{ over, winner: null }` ; jaune valide `3` → `{ over, winner: 'player1' }` ; jaune `passTurn()` → `{ over, winner: 'player1' }`.
    - offre + `finishGame()` → `status finished`, `winner 'player1'`, `finishedAt` posé, `endPrompt` null.
    - jaune atteint le premier (blanc `5`, jaune `8`) → `{ over, winner: 'player2' }` ; `finishGame()` → `winner 'player2'`.
    - `dismissEndPrompt()` sur `over` → null, `status playing` ; sur `equalizing-offer` → **inchangé**.
    - `adjustScore('player1', 10)` depuis 0 → `endPrompt` null (AC8) ; `swapPlayers` → null.
    - distances 0 (`startGame` sans format) : blanc `50` → null.
    - fin manuelle : `startGame(… {10, 8})`, blanc `4` (0,4), jaune `4` (0,5) → `finishGame()` → `winner 'player2'` ; `5`/`4` (0,5/0,5) → null ; sans format, `7`/`3` → `'player1'`.
    - `rematch()` : après `finishGame`, `swapPlayers` non — simple : `rematch()` → `status playing`, `reprises []`, noms et distances conservés, `winner null`, `history []` ; `rematch()` en `playing` → rien.
    - undo (AC9) : offre, `acceptEqualizingReprise()`, `undoLastAction()` → `equalizingReprise` **faux**, `player1.score 0`, `activePlayer player1` ; le blanc revalide `10` → offre à nouveau.
    - `mirrorSnapshot` recopie `equalizingReprise` (étendre « mirrors a snapshot »).
    - `startGame`/`resetGame` remettent `winner`, `finishedAt`, `equalizingReprise`, `endPrompt` (étendre « restores the full initial state on reset »).
    - `undoLastAction`, `validateScoreInput`, `passTurn`, `adjustScore`, `swapPlayers` en `finished` → no-op (étendre « ignores every game gesture while no game is playing » avec un état `finished` réel — ce qui rend enfin **discriminante** la garde d'`undoLastAction`, cf. revue 1.7).
  - [x] 2.10 Mutations : premier cas du `checkEndOfGame` déplacé en dernier (→ « jaune valide 3 en égalisatrice » rouge) ; `checkEndOfGame` ajouté dans `adjustScore` (→ rouge) ; `equalizingReprise` hors snapshot (→ AC9 rouge) ; `finishGame` sans le cas `equalizing-offer` → `'player1'` (→ rouge) ; `>` au lieu de `>=` (→ « blanc valide 10 » rouge) ; plafonnement retiré (→ « blanc 12 → score 10 » rouge) ; plafonnement appliqué aussi en distance 0 (→ « sans distance, 12 » rouge).

- [x] **Task 3 — `PromptModal.vue` : pop-up de décision réutilisable (AC: 1, 3, 5, 6, 10, 18)**
  - [x] 3.1 Nouveau composant présentationnel `src/components/PromptModal.vue` (+ test). Props : `title: string`, `message?: string`, `primaryLabel: string`, `secondaryLabel?: string`, `closable?: boolean` (défaut `false`), `ball?: PlayerColor` (bille en en-tête, comme les autres pop-ups). Emits : `primary`, `secondary`, `close`. Coquille **identique** à `ScoreEntryModal`/`PlayerSetupModal` : `fixed inset-0 z-50 … bg-black/60 p-4 backdrop-blur-md`, carte `max-w-2xl rounded-3xl border border-white/12 bg-bg/95 p-4 shadow-[…]`, en-tête (croix `-m-2 min-h/min-w touch-target` **si `closable`**, bille, titre en `text-label font-black tracking-[0.1em]`), message en `text-label text-white/70`, pied : `primary` pleine largeur `bg-accent text-on-accent` ; `secondary` (si fourni) au-dessus, `bg-white/10 text-white`. **Voile inerte** : aucun handler sur le backdrop (AC18) — ne pas recopier `armBackdropClose`. Tout en `@pointerdown`.
  - [x] 3.2 `data-testid` : `prompt-modal`, `prompt-title`, `prompt-message`, `prompt-primary`, `prompt-secondary`, `prompt-close`.
  - [x] 3.3 Tests `PromptModal.test.ts` : rend titre/message/libellés ; émet `primary`/`secondary`/`close` au `pointerdown` ; pas de croix ni de `secondary` quand absents ; **le voile n'émet rien** (`pointerdown` + `pointerup` sur `prompt-modal` → aucun emit) ; boutons `min-h-[var(--size-touch-target)]` ; « never binds a click handler » (`?raw`).

- [x] **Task 4 — `GameSummary.vue` : écran de récap Billiboard (AC: 13–15, 17)**
  - [x] 4.1 Nouveau composant présentationnel `src/components/GameSummary.vue` (+ test). Props : `mode: GameMode` (surtitre du bandeau via `GAME_MODE_LABELS`), `player1: Player`, `player2: Player`, `averages: { player1: number; player2: number }`, `bestSeries: {…}`, `repriseCounts: {…}`, `winner: PlayerId | null`, `records?: { player1: boolean; player2: boolean }` (défaut `false`/`false`, AC17). Aucun emit, aucun accès au store.
  - [x] 4.2 Layout (paysage **et** portrait) : `flex h-full flex-col bg-bg`. **Bandeau** `data-testid="summary-banner"` : trois zones — gauche `MICHEL / 100` (`text-label font-black`, bille blanche), centre **`VS`** en `text-reprise font-black italic text-white/50`, droite `ANDRÉ / 80` (bille jaune). **Table** : `grid grid-cols-[1fr_auto_1fr]` (ou `2fr 1fr 2fr`), une ligne par stat, libellés centraux en `text-stat font-bold tracking-[0.2em] text-white/50` (`RÉSULTAT`, `POINTS`, `MOY`, `SÉRIE`, `REPRISES`), valeurs en `text-label font-black tabular-nums` (POINTS en `text-reprise`). Ligne RÉSULTAT : `VICTOIRE` / `DÉFAITE` / `ÉGALITÉ` + pastille de bille (`h-5 w-5 rounded-full bg-player-*`). Colonne vainqueur : `bg-victory-ribbon text-on-victory-ribbon` (ruban rouge, décision du 2026-09-10 — l'or reste le repli si Nathan n'aime pas au rendu) sur **toute la colonne**, arrondie ; autre colonne `bg-white/6 text-white`. Égalité : les deux en neutre.
  - [x] 4.3 `data-testid` : `summary-column` ×2 avec `data-side`, `summary-result`, `summary-points`, `summary-average`, `summary-best`, `summary-reprises` (préfixés par colonne via `findAll` dans les tests), `summary-record` (rendu seulement si `records[side]`, AC17).
  - [x] 4.4 Tests `GameSummary.test.ts` : noms et distances dans le bandeau (`'MICHEL / 100'`) ; `VS` présent ; valeurs de chaque colonne lues dans le DOM (`'42'`, `'8.400'`, `'15'`, `'5'`) ; vainqueur → colonne gauche porte la classe victoire et `VICTOIRE`, droite `DÉFAITE` ; égalité → `ÉGALITÉ` ×2, aucune classe victoire ; `summary-record` absent par défaut, présent avec `records.player1: true` ; moyenne à 3 décimales ; aucun `@pointerdown`/`@click` dans la source (composant sans interaction).

- [x] **Task 5 — `GameView.vue` : branche `finished`, pop-ups, sortie (AC: 3–7, 10–12, 16)**
  - [x] 5.1 `storeToRefs` : + `endPrompt`, `winner`, `repriseCounts`. Nouvelle branche `<template v-else-if="status === 'finished'">` : `<GameSummary …>` + `<ActionBar :showBack="false">` avec deux boutons dans `#actions` : `data-testid="end-game-button"` `FIN DE PARTIE` (`bg-white/10 text-white`, `@pointerdown="gameStore.resetGame()"`) et `data-testid="rematch-button"` `UNE PARTIE DE PLUS` (`bg-accent text-on-accent`, `@pointerdown="gameStore.rematch()"`), tous deux `min-h-[var(--size-touch-target)] px-10 text-label font-black`. Le différé « `finished` sans branche de rendu » (revue 1.3) est clos.
  - [x] 5.2 Pop-ups de fin dans la branche `playing`, **après** `ScoreEntryModal` dans le template : `<PromptModal v-if="endPrompt?.kind === 'equalizing-offer'" :title="`${player1.name} A ATTEINT SA DISTANCE`" ball="white" :message="`${player2.name} joue-t-il la reprise égalisatrice ?`" primaryLabel="OUI, IL JOUE" secondaryLabel="NON, FIN DE PARTIE" @primary="gameStore.acceptEqualizingReprise()" @secondary="gameStore.finishGame()" />` et `<PromptModal v-else-if="endPrompt?.kind === 'over'" title="PARTIE TERMINÉE" :ball="…couleur du vainqueur ou undefined" :message="overMessage" primaryLabel="VOIR LE RÉCAP" closable @primary="gameStore.finishGame()" @close="dismissEndPrompt" />` avec `overMessage = winner ? `${name} GAGNE` : 'ÉGALITÉ'`. ⚠️ `ScoreEntryModal` se ferme au `pointerdown` de `VALIDER` et la pop-up de fin monte **sous le doigt** : son voile est inerte, donc le `pointerup` qui retombe dessus est sans effet — c'est la raison d'être de l'AC18. Ne pas mettre de handler sur ce voile.
  - [x] 5.3 `dismissEndPrompt()` local : `gameStore.dismissEndPrompt()` + `panelsLockedUntil = Date.now() + PANEL_GRACE_MS` (la croix est au coin de la carte, au-dessus des panneaux — même grâce anti-tap fantôme que `closeEntry`). Renommer `closeEntry` → factoriser `lockPanels()` si ça reste lisible.
  - [x] 5.4 Sortie : `leaveGame()` devient `if (reprises.value.length === 0) { gameStore.resetGame(); return } exitPromptOpen.value = true` (AC12 — `reprises` revient dans `storeToRefs`). `<PromptModal v-if="exitPromptOpen" title="TERMINER LA PARTIE ?" message="Le récapitulatif s'affiche et la partie est close." primaryLabel="VOIR LE RÉCAP" closable @primary="confirmExit" @close="exitPromptOpen = false" />` ; `confirmExit()` : `exitPromptOpen = false; gameStore.finishGame()`. État local (`ref`) : l'ouverture d'une confirmation n'est pas un état de partie, comme `entryOpen`.
  - [x] 5.5 Tests `GameView.test.ts` — nouveau `describe('GameView — fin de partie')`, fake timers (grâce), helpers `startedGame(targets)`, `validateSeries`, `panels`, plus `prompt = () => wrapper.find('[data-testid="prompt-modal"]')` :
    - « offers the equalizing reprise when the white player reaches his distance » — `{10, 8}`, série `1`,`0` → `prompt` visible, titre contient `MICHEL`, `prompt-secondary` `NON, FIN DE PARTIE`, **pas** de `prompt-close` ; le liseré est sur le panneau droit.
    - « returns to the board on OUI and ends the game after the yellow series » — `prompt-primary` → prompt absent, `PlayerPanel` ×2 toujours là ; jaune `3` → prompt `PARTIE TERMINÉE`, message `MICHEL GAGNE` ; `prompt-primary` → `GameSummary` monté, `summary-result` gauche `VICTOIRE`.
    - « declares a tie when the yellow player equalizes » — … jaune `8` → message `ÉGALITÉ` ; récap : `ÉGALITÉ` ×2.
    - « ends the game at once when the yellow player reaches first » — blanc `5`, jaune `8` → `ANDRÉ GAGNE` ; `prompt-close` présent.
    - « lets the winning series be undone from the end prompt » — jaune atteint, `prompt-close`, avance 300 ms, `undo-button` → score droit `0`, prompt absent ; jaune revalide `8` → prompt de retour.
    - « finishes from NON with the white player as winner » — offre, `prompt-secondary` → récap, `VICTOIRE` à gauche.
    - « reaches the end prompt through the three-second path too » — `{10, 8}`, `openEntry`, `type [1, 0]`, `advanceTimersByTime(3000)` → prompt.
    - « never ends the game on a correction » — `{10, 8}`, dix `score-plus` sur le gauche → aucun prompt, score `10`.
    - « asks before leaving a game with series, and computes the winner pro rata » — `{10, 8}`, blanc `4`, jaune `4`, `exit-button` → prompt `TERMINER LA PARTIE ?`, `store.status` toujours `playing` ; `prompt-close` → scoreboard ; `exit-button`, `prompt-primary` → récap, `VICTOIRE` **à droite** (0,5 > 0,4).
    - « leaves straight to the home screen when nothing was played » — `exit-button` sans série → `step-category` visible, aucun prompt. *(Remplace le test existant « returns to the home screen from the exit control » — le réécrire, il devient ce cas.)*
    - « shows the Billiboard banner and stats on the summary » — récap : `summary-banner` contient `MICHEL / 10`, `ANDRÉ / 8`, `VS` ; `summary-points`, `summary-average` (`'x.xxx'`), `summary-best`, `summary-reprises` lus par colonne ; aucun `undo-button`, aucun `add-points-button`, aucun `PlayerPanel`.
    - « starts a rematch with the same players, distances and sides » — récap, `swap` impossible ici ; `rematch-button` → `PlayerPanel` ×2, noms/distances identiques (`target-score` `'10'`/`'8'`), scores `0`, `reprise-number` `1`.
    - « returns home from FIN DE PARTIE » — `end-game-button` → `step-category`.
  - [x] 5.6 Mutations : `@secondary` de l'offre câblé sur `acceptEqualizingReprise` (→ rouge) ; grâce omise sur `dismissEndPrompt` (→ « lets the winning series be undone » : ajouter un `undo` **immédiat** après la croix qui doit être ignoré) ; `leaveGame` sans le cas zéro série (→ rouge).

- [x] **Task 6 — `HomeScreen.vue` : distance obligatoire (AC: 1, 2)**
  - [x] 6.1 `const missingDistance = computed(() => (['player1', 'player2'] as const).filter((p) => targetScores.value[p] <= 0))`. `confirm()` : `if (missingDistance.value.length > 0) { distanceError.value = true; return }` puis `startGame(…)` inchangé. `distanceError = ref(false)`.
  - [x] 6.2 `<PromptModal v-if="distanceError" title="DISTANCE MANQUANTE" :message="distanceErrorMessage" primaryLabel="RÉGLER LA DISTANCE" closable @primary="fixDistance" @close="distanceError = false" />` ; `distanceErrorMessage` : « La bille blanche n'a pas de distance. » / « La bille jaune n'a pas de distance. » / « Aucun joueur n'a de distance. » ; `fixDistance()` : `distanceError = false; editing = missingDistance.value[0]!` (ouvre la `PlayerSetupModal` du premier manquant — `focused` y démarre sur `name` : passer une prop optionnelle `initialField?: 'name' | 'distance'` à `PlayerSetupModal` pour ouvrir directement sur la distance, défaut `'name'`, deux lignes).
  - [x] 6.3 `back()` remet `distanceError = false` (même hygiène qu'`editing`).
  - [x] 6.4 Tests `HomeScreen.test.ts` : « refuses to start while a distance is missing and names the ball » (aucun `startGame`, prompt visible, message contient `blanche` ; les deux manquantes → `Aucun joueur`) ; « opens the setup of the first player without distance from the error prompt » (`prompt-primary` → `PlayerSetupModal` montée, `distance-field` avec le liseré) ; « starts once both distances are set » ; « closes the error prompt on the cross ». ⚠️ Les tests existants « starts a game with the chosen sub-mode and default names », « starts with default names and no handicap when no zone is ever pressed », « falls back to the default name… », « trims… », « never lets a run of spaces… » démarrent **sans distance** : les faire passer par un helper `setDistances(wrapper)` qui règle les deux joueurs via la modale (motif de « carries each handicap to its own player »), et réécrire « no handicap when no zone is ever pressed » en « refuses to start … ». Les noms par défaut `JOUEUR 1`/`JOUEUR 2` restent valables.
  - [x] 6.5 `PlayerSetupModal.test.ts` : « opens on the requested field » (`initialField: 'distance'` → `NumericPad` visible, liseré sur `distance-field`).

- [x] **Task 7 — Passe de validation visuelle (CLAUDE.md §9)**
  - [x] 7.1 Une seule passe, en fin de story, **1024×768** et **768×1024**, harnais iframe `public/_viewport-harness.html` (à recréer puis **supprimer**).
  - [x] 7.2 Vérifier : les quatre pop-ups (erreur distance, offre égalisatrice, partie terminée, sortie) — carte centrée, boutons ≥ 90 px, texte non tronqué, croix présente/absente selon le cas ; le récap dans les deux formats — bandeau lisible, colonnes alignées, colonne vainqueur en couleur, contraste (`getComputedStyle`) ; la barre basse à deux boutons ; parcours complet au doigt : accueil → erreur distance → réglage → partie → blanc atteint → OUI → jaune → récap → UNE PARTIE DE PLUS → nouvelle partie ; console vierge.

- [x] **Task 8 — Synchronisation des specs (AC: 19)**
  - [x] 8.1 `epics.md` Story 1.10 : note datée — 1.11 absorbée, règles du jeu (reprise égalisatrice), pop-ups, écran Billiboard (`IMG_6632`), `FIN DE PARTIE`/`UNE PARTIE DE PLUS`, prorata, distance obligatoire, sortie → récap, égalité = résultat final (prolongation plus tard), récap terminal. Story 1.11 : « **absorbée par la Story 1.10** (décision de Nathan, 2026-09-10) » ; son AC « aucun objectif → fin manuelle » est **caduc** (distance obligatoire). Story 1.4 : note — l'AC « aucun réglage explicite → distance 0 » est **supersédé** (distance obligatoire, pop-up d'erreur). Story 1.15 : note — la « confirmation avant abandon » est **livrée** par la pop-up de sortie de la 1.10 (le picto mène au récap, plus à l'abandon) ; la 1.15 reste pour un éventuel abandon/réinitialisation **sans** récap, à réexaminer. UX-DR13 : préciser « format Billiboard : bandeau VS nom/distance, colonnes joueur autour des libellés, colonne du vainqueur en couleur, deux boutons » — la « médaille » devient la colonne mise en couleur + `VICTOIRE`. FR16 : reste « fin de set » hors V1a.
  - [x] 8.2 `ux-design-specification.md` : nouvelle section « Règles de fin de partie » (égalisatrice, cas jaune, égalité, prorata) sous §2.5 ; fiche `GameSummary` réécrite (Billiboard, états : vainqueur gauche/droit, égalité, record par joueur non déclenché) ; **nouvelle fiche `PromptModal`** (décision, voile inerte, croix optionnelle, quatre usages) ; fiche `ActionBar` : état « récap » à deux CTA ; « Réglage par joueur, optionnel » → **nom optionnel, distance obligatoire** (note datée) ; Flow 3 : note datée (pop-up avant récap, égalisatrice) ; Flow 1 : « ou garder défaut » → « distance requise ».
  - [x] 8.3 `architecture.md` : `GameState` + `winner`/`finishedAt`/`equalizingReprise` ; `PromptModal.vue` dans l'arborescence et la liste des composants V1a ; note datée.
  - [x] 8.4 `deferred-work.md` : revue 1.3 « `finished` sans branche de rendu » → **traité en 1.10** ; revue 1.7 « undo refusé hors `playing` » → **tranché en 1.10** : le récap est terminal, la correction passe par la croix des pop-ups de fin ; revue 1.5 « sortie destructive sur `pointerdown` » → **traité en 1.10** (pop-up de confirmation, plus rien de destructif au contact). Notes datées, lignes conservées.
  - [x] 8.5 `sprint-status.yaml` : `1-11-…` → `done # absorbée par 1-10 (décision de Nathan, 2026-09-10)` ; `1-10-…` → `review` en fin de story.

- [x] **Task 9 — Vérification qualité**
  - [x] 9.1 `npm test`, `npx vue-tsc -b`, `npm run build` verts depuis `1score/` ; aucune régression sur les **228 tests** de départ (hors réécritures explicitement listées : « returns to the home screen from the exit control », tests `HomeScreen` démarrant sans distance) ; aucune dépendance ajoutée.

### Review Findings

*Revue de code adversariale (bmad-code-review, 2026-09-10) — trois relecteurs (Blind Hunter, Edge Case Hunter, Acceptance Auditor), 24 remarques brutes, 10 écartées comme bruit.*

- [x] [Review][Patch] (décision de Nathan, 2026-09-10 : **bloquer** `swapPlayers` pendant `equalizingReprise`) `ÉCHANGER` pendant la reprise égalisatrice fabrique une égalité fantôme — `equalizingReprise` est attaché au côté droit ; après un échange, le joueur qui a déjà atteint sa distance se retrouve à droite, sa série est plafonnée à 0, `hasReachedTarget` est vrai et `checkEndOfGame` déclare `{ over, winner: null }` alors que l'adversaire n'a jamais joué son égalisatrice. La Décision 13 dit « cas absurde, non bloqué » ; le coût du blocage est une garde d'une ligne dans `swapPlayers` (`useGameStore.ts:211-238`, `399-408`).
- [x] [Review][Patch] (décision de Nathan, 2026-09-10 : critère **`!canUndo`**) Sortie sans confirmation alors que des points ont été ajoutés par `+`/`−` sans aucune série — `leaveGame` juge « rien à récapituler » sur `reprises.length === 0`, mais `adjustScore` fait monter le score sans créer de reprise : un 15-0 corrigé est jeté par `resetGame()` au contact. Alternative : `!canUndo` (aucune action annulable) comme critère (`GameView.vue:133-139`).
- [x] [Review][Patch] (décision de Nathan, 2026-09-10 : **supprimer**) `closable` / croix / `close` de `PromptModal` : code mort qui contredit la règle « pas de croix » — l'amendement dit « `closable` n'a plus d'usage », la fiche UX dit « la croix n'est utilisée nulle part », mais la prop, le bouton `✕`, trois tests et la mention « croix optionnelle » d'`architecture.md:273` restent. Supprimer (recommandé) ou garder comme option (`PromptModal.vue:14-27,42-50`, `PromptModal.test.ts`).
- [x] [Review][Dismissed] (décision de Nathan, 2026-09-10 : **garder les deux libellés**) Même libellé `FIN DE PARTIE` pour deux actions opposées — sur l'offre d'égalisatrice il signifie « le blanc gagne, récap » (`GameView.vue:295`), sur le récap « retour à l'accueil, partie jetée » (`GameView.vue:343`), sans confirmation. Les deux libellés viennent de Nathan ; la collision mérite un arbitrage.
- [x] [Review][Patch] (décision de Nathan, 2026-09-10 : **conserver le drapeau** en `finished`) `finishGame()` remet `equalizingReprise` à `false`, hors Task 2.6 et non documenté — en `finished`, `GameState` ne dit plus si la partie s'est jouée jusqu'à l'égalisatrice (info utile à l'historique 3.1 et à la persistance 1.12). Retirer la ligne et le test qui l'exige (recommandé), ou documenter l'écart (`useGameStore.ts:456`).
- [x] [Review][Patch] Grâce anti-tap fantôme : absente après `<NOM> JOUE` (`acceptEqualizingReprise` sans `lockPanels()`, le CTA est au-dessus des panneaux comme `ANNULER` de sortie) et non prouvée sur `ANNULER` de sortie (le test avance de 300 ms avant tout geste : retirer `lockPanels()` de `closeExitPrompt` laisse la suite verte, la mutation 5.6 survit) [1score/src/views/GameView.vue:288-296 ; 1score/src/views/GameView.test.ts:876-883]
- [x] [Review][Patch] Commentaires de code et specs qui décrivent encore la croix supprimée comme filet de correction [1score/src/stores/useGameStore.ts:358,419-421,477 ; 1score/src/views/GameView.vue:317 ; 1score/src/components/PromptModal.vue:6 ; 1score/src/stores/useGameStore.test.ts:1276,1299 ; _bmad-output/planning-artifacts/epics.md:606 ; _bmad-output/planning-artifacts/ux-design-specification.md:332,416 ; _bmad-output/planning-artifacts/architecture.md:273 ; Dev Agent Record de cette story (« Écart mineur » Task 5, note Task 7 « croix 90×90 »)]
- [x] [Review][Patch] Passe visuelle (CLAUDE.md §9, Task 7) non refaite après les amendements alors que des éléments ont été ajoutés : CTA secondaire `ANNULER` (+ 90 px et `gap-3`) sur « TERMINER LA PARTIE ? » et « DISTANCE MANQUANTE », libellé `<NOM> JOUE` avec un nom jusqu'à 20 caractères sans `truncate` — à revérifier en 1024×768 et 768×1024 [1score/src/views/GameView.vue:288-311 ; 1score/src/components/HomeScreen.vue:311-318]
- [x] [Review][Patch] Test dupliqué sous le même nom « leaves straight to the home screen when nothing was played », mêmes assertions dans les deux `describe` [1score/src/views/GameView.test.ts:49,894]
- [x] [Review][Patch] Story : la Décision 14 dit « plafonnement dans l'action, **avant** le snapshot », le code et la Task 2.2 font l'inverse (`pushHistory()` puis `capToRemainingDistance`) — corriger le texte de la Décision 14 [_bmad-output/implementation-artifacts/1-10-…md, Dev Notes, Décision 14]
- [x] [Review][Patch] `PlayerId` non adopté dans le nouveau code de test (Décision 16) [1score/src/stores/useGameStore.test.ts:1104 ; 1score/src/views/GameView.test.ts:689]
- [x] [Review][Patch] Passe visuelle refaite après les correctifs (1024×768 et 768×1024, harnais iframe recréé puis supprimé) : « DISTANCE MANQUANTE », offre d'égalisatrice avec un nom de 20 caractères (`WWWWWWWWWWWWWWWWWWWW JOUE` tient sur une ligne dans les deux formats), « PARTIE TERMINÉE », « TERMINER LA PARTIE ? » — cartes centrées, CTA 606×90, aucun débordement ; `ÉCHANGER` inerte pendant l'égalisatrice ; sortie après un seul `+` → confirmation ; récap ruban rouge, barre basse à deux CTA de 90 px ; console vierge. *Observation, non bloquante* : dans le bandeau du récap, un nom de 20 lettres larges est tronqué par l'ellipse et masque « / distance » — cas extrême, consigné dans `deferred-work.md`.
- [x] [Review][Defer] Store non durci contre les actions reçues pendant une pop-up ouverte (pilotage déporté V2+) : `checkEndOfGame` écrase un `endPrompt` existant ; `undoLastAction`/`adjustScore`/`swapPlayers` ne ferment pas la pop-up ; après `dismissEndPrompt` en égalisatrice, le blanc peut revalider et déclencher une seconde offre ; `finishGame` par la sortie pendant une offre vaut refus de l'égalisatrice. Injoignable au doigt (voile plein écran, aucun bouton pour `dismissEndPrompt`) [1score/src/stores/useGameStore.ts:399-408,444-461] — deferred, pre-existing (même famille que le différé « undo par pilotage déporté » de la 1.7)
- [x] [Review][Defer] `endPrompt` absent de `GameState` alors que le commentaire du store promet sa persistance en 1.12 ; une restauration en pleine offre d'égalisatrice retomberait sur un scoreboard sans pop-up [1score/src/types/game.ts:98-113 ; 1score/src/stores/useGameStore.ts:115-118] — deferred, à fixer avec le format persisté (1.12)
- [x] [Review][Defer] `PromptModal` sans sémantique de dialogue (`role="dialog"`, `aria-modal`, `aria-labelledby`, focus) [1score/src/components/PromptModal.vue:38-46] — deferred, pre-existing (même arbitrage « borne fixe » que `ScoreEntryModal`/`PlayerSetupModal`, deferred-work.md revue 1.5)

## Dev Notes

### Décisions produit (Nathan, 2026-09-10)

1. **1.11 absorbée.** Récap et détection sont une seule fonctionnalité.
2. **Distance obligatoire au démarrage**, pop-up d'erreur sinon. Le nom reste optionnel (`JOUEUR 1`/`JOUEUR 2`).
3. **Le picto de sortie demande confirmation et mène au récap**, jamais à une perte silencieuse. Zéro série → accueil direct (décision d'implémentation, à confirmer au rendu).
4. **Vainqueur au prorata en fin manuelle.** Cas particuliers (abandon = défaite…) plus tard.
5. **Récap façon Billiboard** (`IMG_6632.JPG`) avec `FIN DE PARTIE` / `UNE PARTIE DE PLUS`.
6. **Égalité = résultat final** pour l'instant ; prolongation plus tard.
7. **Égalisatrice optionnelle au 3 bandes** → réglage Epic 2, hors périmètre.

### Décisions d'implémentation prises à la création

8. **La détection vit dans le store, pas dans la vue.** `endPrompt` est un état exposé ; `GameView` ne fait qu'afficher la pop-up correspondante et appeler `finishGame()`. Un pilotage déporté (V2+) voit la même chose (UX-DR23) et la 1.12 pourra persister une pop-up ouverte.
9. **Une seule action de clôture, `finishGame()`, qui déduit le vainqueur du contexte** (`endPrompt` ou prorata). Trois CTA différents, zéro logique dans la vue.
10. **`equalizingReprise` est dans le snapshot** : annuler la série gagnante du blanc annule aussi l'offre acceptée (AC9). `endPrompt`, lui, n'y est pas — il est toujours fermé quand on peut appuyer sur `ANNULER`.
11. **Le récap est terminal.** Pas de `REPRENDRE`, `undoLastAction` reste no-op hors `playing`. Le filet de sécurité, c'est la **croix** des pop-ups « PARTIE TERMINÉE » et « TERMINER LA PARTIE ? » : on revient au scoreboard, on corrige par `ANNULER`, la détection rejoue. L'offre égalisatrice, elle, n'a pas de croix : `OUI` ramène au scoreboard et remplit ce rôle. *Amendé en revue au rendu (2026-09-10)* : plus aucune croix ; une fin détectée n'est pas rattrapable (accepté), seule la pop-up de sortie a un retour, `ANNULER`.
12. **Les pop-ups de décision ont un voile inerte.** Contrairement aux pop-ups de saisie, fermer par un tap en dehors n'a pas de sens (que voudrait dire « annuler » une fin de partie ?) et créerait le bug du `pointerup` retombant sur le voile fraîchement monté sous le doigt qui vient de valider. `PromptModal` est un **nouveau** composant : ne pas dériver de `ScoreEntryModal`.
13. **La reprise égalisatrice est attachée au côté droit**, comme le tour (Décision 15 de la 1.5). ~~Un `ÉCHANGER` en pleine égalisatrice est un cas absurde qu'on ne bloque pas~~ *Revue de code (décision de Nathan, 2026-09-10)* : `swapPlayers` est **bloqué** pendant la reprise égalisatrice — sinon le joueur déjà à sa distance passe à droite, sa série est plafonnée à 0 et la détection déclare une égalité fantôme. Testé (« refuses to swap the players during the equalizing reprise »).
14. **La série est plafonnée à la distance restante** (décision de Nathan, 2026-09-10). Si le marqueur entre 30 alors qu'il restait 25, la série enregistrée vaut 25 : au billard on s'arrête à la distance, le dépassement est toujours une erreur de saisie. Plafonnement dans l'action (AR17), **après** le snapshot (`pushHistory()` puis `capToRemainingDistance`, comme la Task 2.2 : l'undo restaure l'état d'avant la série plafonnée — corrigé en revue de code, 2026-09-10) ; aucun en distance 0.
15. **`repriseCounts` exposé** pour la ligne REPRISES : c'est le `playedReprises()` interne — reprises où la case du joueur est renseignée, cohérent avec la moyenne.
16. **`PlayerId`** introduit dans `types/game.ts` — l'union littérale est répétée partout ; on l'adopte dans le nouveau code et les signatures qu'on touche, sans refactor global.

### Ce que cette story NE fait PAS

- **Pas de prolongation** en cas d'égalité, pas de réglage « égalisatrice on/off » (Epic 2), pas de fin de **set** (Epic 2).
- **Pas de persistance** (`finished`, `endPrompt`, `winner` — 1.12), **pas d'écriture dans l'historique** (3.1 se branchera sur `finishGame`/le récap), **pas de détection de record** (3.5 — seule la prop existe).
- **Pas de signal visuel de reprise égalisatrice en cours** sur le scoreboard (décision de Nathan : la pop-up suffit). `CenterPanel` n'est pas touché.
- **Aucune modification** de `ScoreEntryModal`, `NumericPad`, `AlphaKeyboard`, `CenterPanel`, `PlayerPanel`, `main.css` (les tokens victoire existent déjà : `--color-victory-gold`, `--color-victory-ribbon` et leurs `on-`).
- **Pas de route** : le récap est un état de `GameView` (AR6).
- `isNegative` reste inerte (1.9 annulée).

### État du code au démarrage

| Fichier | Ce qui existe | Ce que cette story en fait |
|---|---|---|
| `src/types/game.ts` | `GameStatus` avec `'finished'` jamais posé ; `GameState`, `GameSnapshot` | + `PlayerId`, `EndPrompt`, champs `winner`/`finishedAt`/`equalizingReprise` |
| `src/stores/useGameStore.ts` (449 l.) | `status` `idle`/`playing` seulement ; `validateScoreInput`/`passTurn` finissent par `switchTurn()` + `lastSaved` ; gardes `status === 'playing'` partout sauf `addReprise` ; `playedReprises()` privée ; `startGame(mode, n1, n2, targets)` ; `resetGame` | + état de fin, `checkEndOfGame` en fin des deux actions de série, `acceptEqualizingReprise`, `dismissEndPrompt`, `finishGame`, `rematch`, `repriseCounts` |
| `src/stores/useGameStore.test.ts` (1024 l.) | motifs `startGame('libre', 'MICHEL', 'ANDRE', { player1: 100, player2: 80 })` ; « ignores every game gesture while no game is playing » (à étendre avec `finished`) ; « restores the full initial state on reset » ; « mirrors a snapshot » | + `describe('useGameStore — fin de partie')`, ~18 tests |
| `src/views/GameView.vue` (246 l.) | branches `idle`/`playing`, **rien pour `finished`** (écran noir) ; `leaveGame()` → `resetGame()` au contact ; `ScoreEntryModal` monté en fin de branche `playing` ; grâce `PANEL_GRACE_MS` | + branche `finished` (`GameSummary` + barre à deux CTA), deux `PromptModal` de fin, pop-up de sortie, `leaveGame` conditionnel |
| `src/views/GameView.test.ts` (639 l.) | « returns to the home screen from the exit control » (à réécrire), helpers `startedGame`/`panels`/`openEntry`/`type`/`validateSeries`/`scoreOf`/`undo` | + `describe('GameView — fin de partie')`, ~13 tests |
| `src/components/HomeScreen.vue` (257 l.) | `confirm()` démarre sans condition ; `targetScores` défaut `{0, 0}` ; `editing` ouvre `PlayerSetupModal` | + `missingDistance`, `distanceError`, `PromptModal` d'erreur, `fixDistance` |
| `src/components/HomeScreen.test.ts` (326 l.) | 5 tests démarrent **sans distance** (à faire passer par un helper) ; « carries each handicap to its own player » (motif de réglage via modale) | tests réécrits + 4 nouveaux |
| `src/components/PlayerSetupModal.vue` (233 l.) | `focused = ref('name')` | + prop `initialField?` |
| `src/components/ActionBar.vue` | slot `#actions` `justify-end` ; `showBack` | inchangé — deux CTA dans le slot (`FIN DE PARTIE` avec `mr-auto` pour le caler à gauche, ou wrapper `flex flex-1 justify-between`) |
| `src/components/ScoreEntryModal.vue` / `PlayerSetupModal.vue` | coquille de pop-up (classes du voile et de la carte) | **modèle** pour `PromptModal`, copie des classes, sans les handlers de voile |
| `src/assets/main.css` | `--color-victory-gold #FFD54A`, `--color-on-victory-gold #000`, `--color-victory-ribbon #E63946`, `--color-on-victory-ribbon #000` | inchangé |
| `explore/resources/IMG_6632.JPG` | écran de fin Billiboard : bandeau `Sand K / 28` **VS** `Nathan / 28`, colonnes avec 승패 (résultat : 패 défaite ● / 승 victoire ●), 득점 (points 9 / 28), AVG (0.474 / 1.474), HR (3 / 7), 배틀포인트 (ignoré) ; colonne vainqueur en rose/rouge ; boutons 경기종료 « fin de partie » (beige) et 한게임 더하기 « une partie de plus » (rose) | référence visuelle du récap |

Suite au démarrage : **228 tests, 11 fichiers, verts** ; `vue-tsc -b` et `build` verts ; `git status` propre (HEAD `3790070` + spec de la 1.9 annulée non commitée).

### Pièges à ne pas rejouer (revues 1.3 → 1.7)

- **`pointerup` sur un voile monté sous le doigt** (1.4, 1.5) : la pop-up de fin apparaît au `pointerdown` de `VALIDER`. Voile inerte = pas de bug. Ne pas « harmoniser » avec les pop-ups de saisie.
- **Tap fantôme après fermeture** (1.5, 1.7) : la croix des pop-ups de fin est au-dessus des panneaux → grâce de 300 ms, test avec `undo` immédiat ignoré.
- **`shallowRef` remplacé, jamais `push`** ; `rematch` passe par `startGame`, qui réassigne tout.
- **Snapshot** : `equalizingReprise` est un booléen, capturé par valeur — rien à copier ; mais **l'ajouter à `mirrorSnapshot`** sinon TypeScript refuse l'objet incomplet (et c'est le test « mirrors a snapshot » qui le verrouille).
- **Tests non discriminants** : lire le DOM du récap (`summary-result`, classe victoire), pas seulement `store.winner` ; un `toContain('MICHEL')` sur tout le wrapper ne prouve rien — cibler `prompt-title`, `summary-banner`.
- **Gardes `status`** : `finished` existe enfin ; tout test « hors partie » doit couvrir `idle` **et** `finished`.
- **Classes Tailwind littérales**, ordre §8, `--spacing` = 8 px (§7 : `px-10` = 80 px, `p-4` = 32 px).
- **Ne pas « nettoyer » les specs au-delà du sujet** : notes datées ajoutées, historique conservé. Ici les notes sont nombreuses (1.4, 1.10, 1.11, 1.15, UX-DR13, quatre fiches UX, architecture, trois différés) — les faire **toutes**, c'est l'AC19.
- **Passe visuelle** : harnais iframe (à supprimer), deux formats, `getBoundingClientRect`.

### Project Structure Notes

Nouveaux fichiers (architecture : composants flat, tests co-localisés — AR16) :

```
1score/src/components/PromptModal.vue
1score/src/components/PromptModal.test.ts
1score/src/components/GameSummary.vue          (prévu par l'architecture)
1score/src/components/GameSummary.test.ts
```

Modifiés :

```
1score/src/types/game.ts
1score/src/stores/useGameStore.ts
1score/src/stores/useGameStore.test.ts
1score/src/views/GameView.vue
1score/src/views/GameView.test.ts
1score/src/components/HomeScreen.vue
1score/src/components/HomeScreen.test.ts
1score/src/components/PlayerSetupModal.vue     (prop initialField)
1score/src/components/PlayerSetupModal.test.ts
_bmad-output/planning-artifacts/epics.md                 (1.4, 1.10, 1.11, 1.15, UX-DR13)
_bmad-output/planning-artifacts/ux-design-specification.md
_bmad-output/planning-artifacts/architecture.md
_bmad-output/implementation-artifacts/deferred-work.md
_bmad-output/implementation-artifacts/sprint-status.yaml
```

Ne pas créer `services/` (1.12), ne pas toucher au routeur (AR6), ni à `main.css`. Aucune dépendance, aucune API navigateur nouvelle — pas de recherche web nécessaire.

### Questions tranchées par Nathan (2026-09-10)

1. **Signaler la reprise égalisatrice en cours sur le scoreboard ?** → **Non, rien.** La pop-up suffit ; `CenterPanel` n'est pas touché.
2. **Plafonner la série à la distance restante ?** → **Oui** (Décision 14, AC7, Task 2.2).
3. **Zéro série + sortie → accueil direct** → **Oui** (Décision 3, AC12).
4. **Mode de jeu dans le bandeau du récap ?** → **Oui, de manière esthétique** : surtitre discret au-dessus du `VS` (AC13). `GameSummary` reçoit une prop `mode: GameMode` et lit `GAME_MODE_LABELS`.
5. **Or ou ruban pour la colonne vainqueur ?** → **Ruban rouge par défaut**, à confirmer au rendu ; si Nathan aime, on garde (AC14).

Aucune question ouverte ne reste à la création.

### References

- [Source: décisions de Nathan, 2026-09-10 (conversation)] — règles de la reprise égalisatrice ; 1.11 absorbée ; distance obligatoire + pop-up d'erreur ; sortie → pop-up → récap « comme si le jaune gagnait » ; prorata ; écran Billiboard `IMG_6632` ; prolongation plus tard
- [Source: explore/resources/IMG_6632.JPG] — écran de fin Billiboard
- [Source: epics.md#Story 1.10, #Story 1.11 (AC et notes de périmètre), #Story 1.4 (AC « aucun réglage explicite »), #Story 1.15 (note « QUITTER sans confirmation »)]
- [Source: epics.md#Functional Requirements — FR4, FR15, FR16, FR17] ; [#NonFunctional — NFR1, NFR9, NFR10, NFR12]
- [Source: epics.md#UX Design Requirements — UX-DR5, UX-DR8, UX-DR13, UX-DR15, UX-DR22, UX-DR23]
- [Source: epics.md#Additional Requirements — AR6, AR8, AR15, AR16, AR17]
- [Source: prd.md — parcours Michel « 8,75 de moyenne, c'est mon record » (l. 162) ; FR4, FR16, FR17]
- [Source: architecture.md#Architecture des Données — `GameStatus`, `GameState`] ; [#Composants principaux V1a — `GameSummary.vue`] ; [#Routing — réglages en modales inline]
- [Source: ux-design-specification.md#Critical Success Moments — « Fin de partie »] ; [#Flow 3] ; [#Custom Components — GameSummary, ActionBar] ; [#UX Pattern Analysis — « Fin de partie façon battle »] ; [#Design Direction — Battle Permanent écarté du jeu, réservé au récap]
- [Source: 1-7-annuler-la-saisie-en-cours-avant-validation.md#Review Findings — undo hors `playing` différé « à trancher en 1.11 »]
- [Source: 1-5-saisir-le-score-dune-serie-au-pave-numerique.md#Dev Notes — Décisions 6, 7, 15, 16]
- [Source: 1-4-configurer-les-parametres-du-match-avant-de-demarrer.md — distance optionnelle, `PlayerSetupModal`]
- [Source: deferred-work.md — revue 1.3 « `finished` sans branche de rendu » ; revue 1.5 « sortie destructive » ; revue 1.7 « undo refusé hors `playing` »]
- [Source: 1score/src/stores/useGameStore.ts:309-336,342-362,367-369,402-416] — `validateScoreInput`, `passTurn`, `undoLastAction`, `playedReprises`, `resetGame`
- [Source: 1score/src/views/GameView.vue:109-111,116-118,233-243] — `leaveGame`, branches de statut, montage de la modale
- [Source: 1score/src/components/HomeScreen.vue:30,114-121,247-255] — `targetScores`, `confirm`, `PlayerSetupModal`
- [Source: 1score/src/components/ScoreEntryModal.vue:140-152] — coquille de pop-up à reprendre
- [Source: 1score/src/assets/main.css:22-25] — tokens victoire
- [Source: 1score/CLAUDE.md §1, §2, §4, §6, §7, §8, §9]
- [Source: mémoire projet « raisonner-en-tactile-tablette »]

## Change Log

| Date | Change |
|---|---|
| 2026-09-10 | Revue de code (bmad-code-review) : 24 remarques, 10 correctifs appliqués — `swapPlayers` bloqué en égalisatrice, sortie sur `!canUndo`, croix retirée de `PromptModal`, `equalizingReprise` conservé en `finished`, grâce sur `<NOM> JOUE` + tests discriminants, commentaires/specs « croix » purgés, test dupliqué supprimé, Décision 14 corrigée, `PlayerId` dans les tests, passe visuelle refaite ; 3 différés ; 306 tests, `vue-tsc`, `build` verts. Statut → done. |
| 2026-09-10 | Revue de Nathan (suite) : plus aucune croix ni message sur les pop-ups de décision — le retour est partout un CTA secondaire `ANNULER` (« TERMINER LA PARTIE ? » et « DISTANCE MANQUANTE »). |
| 2026-09-10 | Revue de Nathan au rendu : enchaînement automatique des modales de distance (blanc → jaune) et pop-up d'erreur sans message ; pop-up « PARTIE TERMINÉE » sans croix, message ni bille ; offre d'égalisatrice sans message, CTA `<NOM> JOUE` / `FIN DE PARTIE`. 305 tests verts. |
| 2026-09-10 | Implémentation complète (bmad-dev-story) : types, store (détection, égalisatrice, plafonnement, prorata, revanche), `PromptModal`, `GameSummary`, `GameView` (branche `finished`, trois pop-ups, sortie confirmée), `HomeScreen` (distance obligatoire), specs synchronisées. 228 → 301 tests, `vue-tsc` et `build` verts, passe visuelle 1024×768 et 768×1024 conforme. Statut → review. |
| 2026-09-10 | Cinq questions tranchées par Nathan : pas de signal d'égalisatrice sur le scoreboard ; **série plafonnée à la distance restante** (nouvel AC7, Décision 14 inversée, tests ajoutés) ; sortie à zéro série → accueil ; mode de jeu dans le bandeau du récap (prop `mode`) ; ruban rouge par défaut pour le vainqueur. AC renumérotés (8–19). |
| 2026-09-10 | Création de la story (bmad-create-story) après cadrage avec Nathan : 1.11 absorbée, règles de la reprise égalisatrice consignées, distance obligatoire, sortie confirmée vers le récap, prorata, écran Billiboard, `PromptModal` réutilisable. |

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (claude-fable-5-1) — session bmad-dev-story du 2026-09-10.

### Debug Log References

- **Mutation 4 de la Task 2.10 survivait** (`finishGame` sans le cas `equalizing-offer` → prorata) : dans le scénario testé, le blanc à sa distance a toujours le meilleur prorata, les deux règles coïncident. Ajout d'un test discriminant : le jaune corrigé par `+` jusqu'à sa distance (aucune détection, AC8) donnerait l'égalité au prorata, le refus de l'égalisatrice donne quand même la victoire au blanc. Les six autres mutations du store et les trois de `GameView` (5.6) sont toutes tuées.
- **Tests `?raw`** : `wrapper.emitted()` de Vue Test Utils enregistre aussi les événements DOM natifs déclenchés (`pointerdown` sur le voile) — l'assertion « le voile n'émet rien » cible les émissions du composant (`primary`/`secondary`/`close` `undefined`). Deux assertions `not.toContain` butaient sur des mots présents dans les commentaires (`armBackdropClose`, `emit`) — remplacées par `@pointerup`/`@pointercancel` et `defineEmits`.
- **Test `GameView` « shows the home screen while idle, then the game once started »** démarrait la partie depuis l'accueil sans distance : conséquence directe de l'AC1, réécrit pour régler les deux distances via la modale (seule réécriture hors de la liste explicite de la story, même nature que les tests `HomeScreen`).
- **Passe visuelle** : harnais iframe `public/_viewport-harness.html` (recréé puis supprimé), interactions dispatchées en `pointerdown` dans l'iframe, mesures `getBoundingClientRect` et contraste calculé sur `getComputedStyle`. Portrait affiché en `transform: scale(0.78)` pour tenir dans la fenêtre — viewport interne vérifié à 768×1024.

### Completion Notes List

- **Task 1 — Types** : `PlayerId`, `EndPrompt`, `GameState` + `winner`/`finishedAt`/`equalizingReprise`, `GameSnapshot` + `equalizingReprise`. Signatures du store migrées sur `PlayerId` au passage.
- **Task 2 — Store** : plafonnement de la série au restant (`capToRemainingDistance`, après le snapshot), `hasReachedTarget`, `checkEndOfGame` en fin de `validateScoreInput` et `passTurn` seulement, `acceptEqualizingReprise` (n'empile rien), `dismissEndPrompt` (jamais l'offre), `finishGame` (vainqueur déduit : `over` → son `winner`, offre → blanc, sinon prorata), `rematch` via `startGame`, `repriseCounts`. `equalizingReprise` dans `takeSnapshot`/`undoLastAction`/`mirrorSnapshot`. 30 nouveaux tests store + 3 tests existants étendus (`finished` réel dans « ignores every game gesture », reset/startGame, miroir).
- **Task 3 — `PromptModal`** : composant neuf, coquille identique aux pop-ups de saisie, **voile sans aucun handler**, croix/bille/secondaire optionnels, tout en `@pointerdown`. 10 tests.
- **Task 4 — `GameSummary`** : bandeau `NOM / distance` VS `NOM / distance` avec le mode en surtitre, trois colonnes de cellules `flex-1` alignées, colonne vainqueur en `bg-victory-ribbon`, `ÉGALITÉ` ×2 sans couleur, `summary-record` par joueur non déclenché. Aucune interaction. 11 tests.
- **Task 5 — `GameView`** : branche `finished` (`GameSummary` + `FIN DE PARTIE` / `UNE PARTIE DE PLUS`), pop-ups offre / partie terminée / sortie, `dismissEndPrompt` et fermeture de la pop-up de sortie avec la grâce anti-tap fantôme (`lockPanels()` factorisé), `leaveGame` conditionnel (rien à récapituler → accueil). 14 tests dans « GameView — fin de partie » + test de sortie réécrit. **Écart mineur documenté** : `ANNULER` de « TERMINER LA PARTIE ? » applique aussi la grâce de 300 ms (le CTA est au-dessus des panneaux) — la story ne la prévoyait que pour `dismissEndPrompt`, qui n'a finalement plus de bouton. *Revue de code (2026-09-10)* : la grâce est aussi appliquée après `<NOM> JOUE`, et les deux sont désormais verrouillées par un `undo` immédiat ignoré.
- **Task 6 — `HomeScreen`** : `missingDistance`, pop-up « DISTANCE MANQUANTE » (message par bille / « Aucun joueur »), `fixDistance` ouvrant la `PlayerSetupModal` du premier joueur manquant sur le champ distance (prop `initialField`), `back()` referme l'erreur. 7 nouveaux tests, 5 tests existants passent par `setDistances()`, « no handicap when no zone is ever pressed » réécrit en « refuses to start… », « forgets names and handicaps… » adapté (50 ≠ 100).
- **Task 7 — Passe visuelle** (1024×768 et 768×1024) : quatre pop-ups centrées, ~~croix 90×90 présente/absente selon le cas~~ (croix retirées ensuite, voir revue), CTA 606×90, texte complet ; récap sans débordement, lignes alignées, ruban rouge à **5,04:1** de contraste (AA), colonne neutre à 20,97:1 ; barre basse à deux CTA de 90 px ; parcours complet accueil → erreur distance → réglage → partie → blanc atteint → OUI → jaune → récap → UNE PARTIE DE PLUS → nouvelle partie ; sortie confirmée → récap au prorata ; console vierge. Aucun défaut relevé.
- **Task 8 — Specs** : `epics.md` (UX-DR13 Billiboard, FR16, Story 1.4 supersédée, Story 1.10 recadrée avec règles du jeu, Story 1.11 absorbée, Story 1.15 mise à jour), `ux-design-specification.md` (« Règles de fin de partie » §2.5, réglage nom optionnel / distance obligatoire, Flow 1, Flow 3, fiches `ActionBar` état récap, `GameSummary` réécrite, `PromptModal` nouvelle), `architecture.md` (`GameState`, note store/`endPrompt`, `PromptModal` dans composants et arborescence), `deferred-work.md` (trois différés traités/tranchés), `sprint-status.yaml` (1-11 déjà `done`, 1-10 → `review`).
- **Task 9** : 301 tests / 13 fichiers verts (228 de départ, aucune régression hors réécritures listées), `vue-tsc -b` et `npm run build` verts, aucune dépendance ajoutée, harnais supprimé.
- **Hors périmètre, non fait (conformément à la story)** : prolongation, réglage égalisatrice 3 Bandes, fin de set, persistance, historique, détection de record, signal visuel d'égalisatrice sur le scoreboard, route dédiée, `main.css`.
- **Point à valider par Nathan au rendu** : la couleur de la colonne vainqueur (ruban rouge par défaut, or en repli).
- **Après revue de Nathan (2026-09-10)** : `HomeScreen` enchaîne les modales de distance depuis le CTA d'erreur (`fixingDistances`, un seul sens blanc → jaune, sans boucle si une distance est laissée à 0 ; test dédié), pop-up d'erreur sans message ; `GameView` : « PARTIE TERMINÉE » réduite au titre et à `VOIR LE RÉCAP` (plus de `overMessage`/`overBall`/`dismissEndPrompt` local), offre relibellée `<NOM> JOUE` / `FIN DE PARTIE` sans message. Test « lets the winning series be undone from the end prompt » remplacé par « offers no way back to the board from the end prompt ». Les croix des pop-ups de sortie et de distance manquante sont ensuite remplacées par un CTA `ANNULER` (remarques suivantes de Nathan) ; plus aucune croix sur les pop-ups de décision. Pas de seconde passe navigateur : les coquilles sont inchangées, seuls des éléments ont été retirés ou relibellés.

- **Revue de code (2026-09-10)** : voir « Review Findings ». Décisions de Nathan : `ÉCHANGER` bloqué pendant la reprise égalisatrice ; sortie directe seulement si aucune action annulable (`canUndo`) ; plus de `closable`/croix dans `PromptModal` ; `equalizingReprise` conservé en `finished` ; les deux `FIN DE PARTIE` gardent leur libellé. Grâce anti-tap fantôme appliquée aussi après `<NOM> JOUE`, verrouillée par un `undo` immédiat ignoré (mutations tuées). 306 tests, `vue-tsc -b`, `npm run build` verts ; seconde passe visuelle 1024×768 / 768×1024 conforme.

### File List

Nouveaux :
- `1score/src/components/PromptModal.vue`
- `1score/src/components/PromptModal.test.ts`
- `1score/src/components/GameSummary.vue`
- `1score/src/components/GameSummary.test.ts`

Modifiés :
- `1score/src/types/game.ts`
- `1score/src/stores/useGameStore.ts`
- `1score/src/stores/useGameStore.test.ts`
- `1score/src/views/GameView.vue`
- `1score/src/views/GameView.test.ts`
- `1score/src/components/HomeScreen.vue`
- `1score/src/components/HomeScreen.test.ts`
- `1score/src/components/PlayerSetupModal.vue`
- `1score/src/components/PlayerSetupModal.test.ts`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-10-terminer-une-partie-et-consulter-le-recapitulatif-automatique.md`

Temporaire (créé puis supprimé) : `1score/public/_viewport-harness.html`.
