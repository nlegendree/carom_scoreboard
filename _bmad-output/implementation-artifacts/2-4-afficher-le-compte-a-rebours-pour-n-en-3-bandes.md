# Story 2.4: Afficher le compte à rebours `POUR n` en 3 Bandes

Status: done

> **Cadrage (2026-09-11)** — story courte demandée par Nathan au rendu de la 2.2 (« fais une story courte pour le POUR N »). Elle livre la note de périmètre reportée depuis la Story 1.6 dans la Story 2.2, telle que la spec UX la décrit : `POUR 3` / `POUR 2` / `POUR 1` sous le score, entre `−` et `+`, en 3 Bandes seulement. Deux décisions :
> 1. **Seuil à 3, rien au-delà.** L'epic laissait ouverte la question « afficher aussi au-dessus de 3 ? » : tranchée par défaut sur la convention d'annonce de l'arbitre (on annonce à l'approche), sans question à Nathan — à rouvrir s'il veut le restant en permanence.
> 2. **Le panneau calcule, la vue décide.** `PlayerPanel` reste présentationnel et ne connaît pas le mode : `GameView` pose `showRemaining` quand le mode est `3bandes`. Le calcul `distance − score` vit dans le panneau, sur `player` — il suit donc le joueur lors d'un ÉCHANGER, sans rien ajouter au store.

## Story

As a joueur en 3 Bandes,
I want lire « POUR 3 », « POUR 2 », « POUR 1 » sous mon score quand j'approche de ma distance,
So that l'annonce de l'arbitre est sous mes yeux sans calcul mental (FR15).

## Acceptance Criteria

1. **Given** une partie 3 Bandes, un joueur à 1, 2 ou 3 points de sa distance **When** son panneau s'affiche **Then** `POUR n` est affiché sous le score, entre `−` et `+`, et suit chaque mouvement du score (tap `+1`, correction, `ANNULER`).
2. **Given** un restant supérieur à 3, nul ou négatif, ou une distance libre **When** le panneau s'affiche **Then** rien n'est affiché.
3. **Given** une partie en jeux de série **When** un joueur approche de sa distance **Then** rien n'est affiché.

## Tasks / Subtasks

- [x] **Task 1 — `PlayerPanel.vue`** : prop `showRemaining` (défaut `false`) ; `remaining` computed (`null` hors 3 Bandes, en distance libre, ou hors `1 ≤ n ≤ 3`) ; `<span data-testid="remaining">POUR {{ remaining }}</span>` entre `score-minus` et `score-plus`, `text-[clamp(18px,7.5cqw,44px)] font-black tabular-nums whitespace-nowrap opacity-80` (largeur de panneau : le panneau est un `@container`). 5 tests.
- [x] **Task 2 — `GameView.vue`** : `:showRemaining="isThreeCushions"` sur les deux panneaux. 3 tests (décompte au tap 3 → 2 → 1, correction `−`, jamais en JDS).
- [x] **Task 3 — Specs** : `epics.md` (section Story 2.4, note de livraison), `ux-design-specification.md` (« livré en 2.4 »), `deferred-work.md` (entrée `POUR n` ✅), `sprint-status.yaml` (`2-4` → `review`).
- [x] **Task 4 — Passe visuelle** : commune au retrait du libellé CHRONO (2.1) — 1024×768, 768×1024, 1180×673 : `POUR 2` lisible entre `−` et `+`, sans débordement en portrait.
- [x] **Task 5 — Qualité** : `npm test`, `npx vue-tsc -b`, `npm run build` verts, aucune dépendance.

### Review Findings (code review, 2026-09-11)

- Aucun constat propre à cette story (revue commune 2.1 + 2.2 + 2.4 : les constats sont consignés dans les fiches 2.1 et 2.2).

## Dev Notes

- Aucun changement au store : `remaining` se déduit de `player.score`/`player.targetScore`, déjà à jour à chaque action (tap, correction, undo, égalisatrice).
- En égalisatrice, le jaune voit son `POUR n` comme en jeu normal ; le blanc, à sa distance, n'affiche rien (restant 0).
- Hors périmètre : annonce vocale (Story 1.16, reportée), affichage permanent du restant au-dessus de 3.

## Change Log

| Date | Changement |
|---|---|
| 2026-09-11 | Création et implémentation dans la foulée de la revue de la 2.2 ; statut `review`. |
| 2026-09-11 | Revue de code (bmad-code-review, commune 2.1+2.2+2.4) : aucun constat propre à la story. Statut `done`. |

## Dev Agent Record

### Agent Model Used

claude-fable-5-1 (Claude Fable 5.1)

### Completion Notes List

- Task 1/2 : 8 tests ajoutés (5 panneau, 3 vue).
- Task 4 : premier passage en portrait — « POUR 2 » en `4.5vw` (34,5 px) se repliait sur deux lignes dans les 105 px entre `−` et `+` ; corrigé en `7.5cqw` + `whitespace-nowrap` (≈ 14 px de marge de chaque côté en portrait), re-mesuré sur les trois formats (voir message de rendu).

### File List

- `carom-scoreboard/src/components/PlayerPanel.vue` (modifié)
- `carom-scoreboard/src/components/PlayerPanel.test.ts` (modifié)
- `carom-scoreboard/src/views/GameView.vue` (modifié)
- `carom-scoreboard/src/views/GameView.test.ts` (modifié)
- `_bmad-output/planning-artifacts/epics.md`, `ux-design-specification.md`, `_bmad-output/implementation-artifacts/deferred-work.md`, `sprint-status.yaml` (modifiés)
