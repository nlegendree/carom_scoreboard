# Story 1.6: Calcul et affichage du score total en temps réel

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur,
I want voir mon score total se mettre à jour automatiquement après chaque série validée,
so that je n'ai jamais besoin de calculer quoi que ce soit moi-même.

## Acceptance Criteria

> **Périmètre réduit deux fois, le 2026-09-09.** (1) Le total en temps réel, la moyenne et la meilleure série sont **déjà livrés** par la Story 1.5. (2) Le **score restant vers l'objectif** (AC3 d'origine) est **retiré des jeux de série** par décision de Nathan et reporté au **3 Bandes (Epic 2)** — voir Décision 1. Cette story ne contient donc que de la **vérification** et de la **synchronisation de specs** : aucun code de production.

1. **Given** une série validée pour un joueur **When** elle est enregistrée **Then** le total affiché sur son `PlayerPanel` est recalculé et mis à jour immédiatement (FR3). *Livré en 1.5 : `recomputeScore` dans `useGameStore.ts`, `player.score` = somme des séries + corrections, rendu par `[data-testid="score"]`.* Un test d'intégration doit le prouver **dans le DOM du panneau**, pas seulement dans le store.
2. **Given** plusieurs reprises jouées par les deux joueurs **When** j'observe les deux `PlayerPanel` **Then** chaque total reflète exactement la somme des séries validées de ce joueur, sans divergence. *Livré et testé : « recomputes each score as the sum of that player series » (`useGameStore.test.ts`).*
3. **Given** un joueur en jeux de série (les six modes JDS) avec une distance configurée **When** j'observe son panneau **Then** **aucun** score restant n'est affiché — seule la distance brute reste en en-tête (Story 1.4). *Aucun code : c'est l'état actuel, à verrouiller par un test.*
4. **Given** les specs (`epics.md`, `ux-design-specification.md`) **When** je lis la Story 1.6 et l'Epic 2 **Then** la règle produit du compte à rebours 3 Bandes (Décision 1) y est consignée, et la Story 1.6 ne promet plus de score restant.

## Tasks / Subtasks

- [x] **Task 1 — Vérifier l'existant (AC: 1, 2, 3)**
  - [x] 1.1 `npm test` : 204 tests verts au démarrage. Toute régression est un échec.
  - [x] 1.2 `GameView.test.ts` : ajouter « shows the updated total on the panel once a series is validated » — partie démarrée, saisie `1`,`2` puis `VALIDER`, le `[data-testid="score"]` du panneau **gauche** (`panels(wrapper)[0]`) porte `12` dans le DOM. Les tests actuels lisent `store.player1.score` ou les props, jamais le texte rendu.
  - [x] 1.3 `PlayerPanel.test.ts` : ajouter « shows the distance but never a remaining count in series games » — `score: 37, targetScore: 100` → `target-score` vaut `100`, et le texte du panneau ne contient ni `63` ni `RESTE`/`POUR`. Ce test verrouille la Décision 1 pour qu'un futur dev ne réintroduise pas le restant en JDS par réflexe.
  - [x] 1.4 Contre-vérifier 1.2 par mutation (forcer le panneau à afficher `0`) : le test doit rougir.

- [x] **Task 2 — Synchronisation des specs (AC: 4)**
  - [x] 2.1 `epics.md` Story 1.6 : remplacer l'AC3 et la note d'impact par la note « score restant retiré des JDS, reporté au 3 Bandes » avec la règle de la Décision 1.
  - [x] 2.2 `epics.md` Epic 2, Story 2.2 (tap incrémental) : ajouter une **note de périmètre** — affichage `POUR 3` / `POUR 2` / `POUR 1` sous le score, entre `−` et `+`, uniquement en mode `3bandes`, dès que le restant vaut 3 ou moins. Ce point rejoint la question déjà ouverte sur 2.2 (geste de bascule vs geste `+1`).
  - [x] 2.3 `ux-design-specification.md` : §UX Pattern Analysis (idée Billizone « score restant ») et fiche `PlayerPanel` — préciser que le restant est **propre au 3 Bandes** et absent des JDS, avec la convention d'annonce.
  - [x] 2.4 `sprint-status.yaml` : `1-6-…` → `review` en fin de tâche.

- [x] **Task 3 — Vérification qualité**
  - [x] 3.1 `npm test`, `npx vue-tsc -b` : verts. Aucun fichier de production modifié, aucune dépendance ajoutée. Pas de passe visuelle : rien ne change à l'écran (CLAUDE.md §9 ne s'applique qu'à un changement d'UI).

## Dev Notes

### Décisions produit (Nathan, 2026-09-09)

1. **Pas de score restant en jeux de série ; compte à rebours réservé au 3 Bandes.** Au billard, on annonce « Pour 5 », « Pour 4 »… à mesure que le joueur approche de sa distance — ce qui suppose un score qui avance **point par point**. En JDS, la série se rentre en bloc au pavé : l'annonce n'a pas de sens, on n'affiche rien. Au **3 Bandes** (Epic 2, saisie au tap +1), l'annonce commence à **3 points** de la distance : `POUR 3`, `POUR 2`, `POUR 1`. Emplacement retenu : **sous le score, entre les boutons `−` et `+`** du pied de carte. Non implémentable ni testable tant que le mode `3bandes` n'existe pas (`available: false` dans le catalogue) — reporté à l'Epic 2.
2. **Le total temps réel reste tel que livré en 1.5.** `player.score` est recalculé comme somme des séries + corrections (`recomputeScore`), jamais incrémenté. Ne rien réécrire.

### Ce que cette story NE fait PAS

- **Aucun composant, store ou style modifié.** Diff attendu : deux fichiers de test, trois fichiers de specs, `sprint-status.yaml`.
- Pas de `remainingScore`, pas de `v-if` sur le mode dans `PlayerPanel`, pas de prop nouvelle. La Story 2.2 ajoutera l'affichage 3 Bandes avec le mode en main.
- Pas de `status = 'finished'` (Story 1.11 ; rappel : `GameView` n'a pas de branche de rendu pour cet état).

### État du code au démarrage

| Fichier | Ce qui existe | Ce que cette story en fait |
|---|---|---|
| `src/components/PlayerPanel.vue` | En-tête nom / `MOY` / `SÉRIE` / distance (`target-score`, masquée à 0) ; score géant `[data-testid="score"]` ; `−`/`+` en pied avec `.stop` | **Inchangé** |
| `src/components/PlayerPanel.test.ts` | 19 tests, helpers `makePlayer(overrides)` / `mountPanel(player, active)` | +1 test (Task 1.3) |
| `src/views/GameView.test.ts` | Helpers locaux d'un `describe` : `startedGame()` (sans paramètre, démarre sans distances), `panels(wrapper)`, `openEntry(wrapper)`, `type(wrapper, digits)` ; `data-testid` : `add-points-button`, `digit-n`, `entry-confirm-button`, `modal-backdrop` | +1 test (Task 1.2) |
| `src/stores/useGameStore.ts` | `recomputeScore`, `targetScore` sur `Player`, `swapPlayers` transporte score et distance | **Inchangé** |

Suite au démarrage : **204 tests, 12 fichiers, verts** ; `vue-tsc -b` et `build` verts.

### Pièges à ne pas rejouer

- **Tests non discriminants** (neuf démasqués sur 1.3 à 1.5) : le test 1.2 doit lire le **DOM** du panneau gauche via `panels(wrapper)[0]!.find('[data-testid="score"]').text()`, pas `wrapper.find` (qui renvoie le premier `score`, ce qui passe ici mais devient faux dès qu'on cible le droit) ni le store.
- **Grâce de 300 ms** après fermeture de la pop-up (`GameView`, Décision 16 de la 1.5) : sans effet sur 1.2 (on lit, on ne tape pas), mais à connaître si un tap suit la validation.
- Ne pas « nettoyer » les specs au-delà du sujet : `epics.md` et l'UX portent des notes datées, on **ajoute** une note datée, on ne réécrit pas l'historique.

### Pour la création de la Story 2.2 (à reprendre tel quel)

- Affichage `POUR n` : sous le score, entre `−` et `+`, `n = targetScore − score`, visible seulement en mode `3bandes` **et** quand `1 ≤ n ≤ 3` (à confirmer : afficher aussi au-dessus de 3 ?), masqué en distance libre. Se met à jour au tap `+1` comme à la saisie de secours au pavé (Story 2.3). Le calcul appartient au panneau (les deux termes sont sur `player`, transportés par `swapPlayers`) ; la détection de fin (`score >= targetScore`) reste dans le store (Story 1.11).

### References

- [Source: décision produit de Nathan, 2026-09-09 (conversation)] — pas de restant en JDS ; `POUR 3/2/1` au 3 Bandes, sous le score entre `−` et `+`
- [Source: epics.md#Story 1.6] — AC d'origine et note d'impact « périmètre à réduire avant développement »
- [Source: epics.md#Story 2.2: Incrémenter le score point par point (tap du joueur assis)] — cible du report
- [Source: epics.md#Functional Requirements — FR3, FR14, FR15, FR16]
- [Source: ux-design-specification.md#UX Pattern Analysis — Billizone, « score restant vers l'objectif »]
- [Source: ux-design-specification.md#Custom Components — PlayerPanel]
- [Source: 1-5-saisir-le-score-dune-serie-au-pave-numerique.md#Dev Notes — Décisions 5, 12, 16 ; Pièges]
- [Source: carom-scoreboard/CLAUDE.md §6, §9]

## Change Log

| Date | Change |
|---|---|
| 2026-09-09 | Implémentation : deux tests de verrouillage ajoutés (total lu dans le DOM du panneau gauche ; distance affichée sans aucun restant en JDS), mutation contrôlée validée, specs synchronisées (`epics.md` Stories 1.6 et 2.2, `ux-design-specification.md` ×4 emplacements). Aucun fichier de production touché. 206 tests verts, `vue-tsc -b` vert. Statut → review. |
| 2026-09-09 | **Second recadrage, sur décision produit de Nathan** : le score restant est **retiré des jeux de série** (l'annonce « Pour n » suppose un score point par point) et reporté au **3 Bandes** (Epic 2, `POUR 3/2/1` sous le score entre `−` et `+`). La story ne contient plus que la vérification du total temps réel (deux tests) et la synchronisation des specs. La version précédente de ce fichier (restant `RESTE n` sous le score, en JDS) est caduque. |
| 2026-09-09 | Création de la story, périmètre réduit au score restant conformément à la note d'impact de la Story 1.5. |

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (claude-fable-5-1)

### Debug Log References

- Suite au démarrage : 204 tests, 12 fichiers, verts (Task 1.1). Note : Vitest annonce 11 fichiers en fin de story, la suite compte bien 206 tests — le « 12 » de la story venait d'un décompte antérieur, aucun fichier de test n'a disparu (`git status` ne montre que des modifications).
- Task 1.4, mutation : `displayedScore` forcé à `'0'` dans `PlayerPanel.vue` → « shows the updated total on the panel once a series is validated » échoue avec `Expected: "12" / Received: "0"`. Fichier restauré par `git checkout`, diff vide vérifié.
- Fin de story : `npx vitest run` → 206 tests verts ; `npx vue-tsc -b` → vert.

### Completion Notes List

- **AC1** : test d'intégration `GameView.test.ts` « shows the updated total on the panel once a series is validated » — partie démarrée, saisie `1`,`2`, `VALIDER`, lecture du **texte rendu** de `[data-testid="score"]` sur `panels(wrapper)[0]` (`12`) et sur le panneau droit (`0`, contrôle négatif). Discriminant prouvé par mutation.
- **AC2** : déjà couvert par « recomputes each score as the sum of that player series » (`useGameStore.test.ts`), inchangé, toujours vert.
- **AC3** : test unitaire `PlayerPanel.test.ts` « shows the distance but never a remaining count in series games » — `score: 37, targetScore: 100` → `target-score` vaut `100`, le texte ne contient ni `63` ni `RESTE`/`POUR`. Verrouille la Décision 1.
- **AC4** : `epics.md` Story 1.6 — AC3 d'origine remplacé par « aucun score restant en JDS », note d'impact remplacée par la note datée du 2026-09-09 (règle de la Décision 1, renvoi vers 2.2). `epics.md` Story 2.2 — note de périmètre `POUR 3/2/1` (mode `3bandes` seul, `1 ≤ n ≤ 3` à confirmer, sous le score entre `−` et `+`, mise à jour au tap comme au pavé et à la correction, calcul dans le panneau / fin de partie dans le store), rattachée à la question déjà ouverte geste `+1` vs bascule. `ux-design-specification.md` — précisions datées sur Billizone, le pattern transférable, la stratégie d'inspiration et la fiche `PlayerPanel`. Notes **ajoutées**, historique non réécrit.
- **Aucun code de production modifié**, aucune dépendance ajoutée. Pas de passe visuelle : rien ne change à l'écran (CLAUDE.md §9 ne s'applique qu'à un changement d'UI).
- Décision d'implémentation : le test 1.2 vérifie aussi le panneau droit à `0` — sans ce contrôle, un panneau qui afficherait le total de l'autre joueur passerait encore.

### File List

- `carom-scoreboard/src/views/GameView.test.ts` (modifié, +1 test)
- `carom-scoreboard/src/components/PlayerPanel.test.ts` (modifié, +1 test)
- `_bmad-output/planning-artifacts/epics.md` (modifié, Stories 1.6 et 2.2)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (modifié, §UX Pattern Analysis ×3, fiche `PlayerPanel`)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié, `1-6` → review)
- `_bmad-output/implementation-artifacts/1-6-calcul-et-affichage-du-score-total-en-temps-reel.md` (ce fichier)
