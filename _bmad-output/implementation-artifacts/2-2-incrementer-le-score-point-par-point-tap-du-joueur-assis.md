# Story 2.2: Incrémenter le score point par point (tap du joueur assis)

Status: done

> **Cadrage (2026-09-11, retour de Nathan au rendu de la 2.1)** — la story est créée et implémentée dans la foulée de la 2.1, à partir des directives données par Nathan en revue de la 2.1, qui tranchent les deux questions laissées ouvertes par l'epic (« distinguer le geste *créditer +1* du geste *rendre la main*, qui visent la même zone » ; mécanisme du délai de grâce du chrono). Cinq décisions :
> 1. **Le `+1` est un BOUTON, pas un tap sur la carte.** Nathan : « au 3 bandes on va remplacer le bouton *Ajouter les points* par un bouton *+1 point* qui ajoute automatiquement à l'adversaire un point en plus ». Le CTA de la barre basse, déjà placé du côté du joueur ASSIS (règle de la 1.5 : c'est l'adversaire qui compte pour celui qui joue), garde son emplacement et son gabarit ; en 3 Bandes il devient `+1 POINT` et crédite un point à celui qui a la main, sans ouvrir le pavé. L'AC de l'epic (« le joueur assis tape sur sa propre zone ») est **supersédé** : la zone reste le geste de rendre la main.
> 2. **Rendre la main = tap sur la carte, geste inchangé.** Nathan : « qu'on appuie sur la card d'un joueur pour passer le tour ». C'est déjà `passTurn` (tap sur le panneau inactif, 1.5/1.7). Nouveauté : en 3 Bandes, la main rendue **clôture la série comptée au tap** au lieu d'ajouter une reprise à 0 par-dessus. Sans aucun tap, elle reste une série de 0 (qui compte dans la moyenne, règle du 2026-09-09).
> 3. **Le chrono repart à 40 au `+1` ET à la main rendue, avec 2 s de latence** (Nathan : « ça relance le chrono à 40s avec une petite latence de 2s » — la note de la 2.1 disait 3 s, la valeur de Nathan du jour prime). Mécanisme retenu : l'anneau s'affiche plein à 40 **immédiatement**, et le premier tick attend `SHOT_CLOCK_GRACE_MS = 2000`. La même grâce s'applique au démarrage de partie et à RECOMMENCER, par cohérence (un seul chemin, `resetTimer`). Un second tap pendant la grâce repart d'une grâce entière.
> 4. **Modèle de données inchangé.** Le `+1` écrit dans la case du joueur de la reprise courante (`reprises`, source de vérité unique, Décision 5 de la 1.5) : le premier tap ouvre la série, les suivants l'incrémentent. Rien n'est ajouté à `GameState` (pas de « série en cours » à part) : la série ouverte se **déduit** de la dernière reprise (`openSeriesValue`). `GAME_STORAGE_VERSION` inchangé. Un tap = une action annulable (comme `adjustScore`) : trois taps, trois `ANNULER`.
> 5. **Atteindre la distance au tap termine la série sur-le-champ** : même bascule et même détection de fin (`checkEndOfGame`) qu'une série validée au pavé — offre d'égalisatrice pour le blanc, victoire immédiate du jaune, égalisatrice point par point. On ne joue pas au-delà de la distance : à distance déjà atteinte (correction `+`), le tap est un no-op.
>
> **Hors périmètre, consigné (Task 5)** : le compteur `POUR n` (note de périmètre de l'epic, « à confirmer à la création de la story ») — Nathan ne l'a pas mentionné, non livré ; le **pavé de secours** du 3 Bandes (Story 2.3) n'a plus de point d'entrée maintenant que le CTA est le `+1` — à définir par la 2.3 (appui long sur `+1 POINT` ? picto dédié ?) ; l'undo ne touche pas au chrono (non demandé).

## Story

As a joueur assis (non-actif),
I want créditer d'un tap un point à l'adversaire en train de jouer, et lui rendre la main d'un tap sur sa carte,
So that son score progresse en temps réel sans qu'il touche lui-même l'écran, et que le chronomètre de série reparte à chaque action (FR14, UX-DR24, NFR1).

## Acceptance Criteria

1. **Given** une partie 3 Bandes en cours **When** j'observe la barre basse **Then** le CTA du côté du joueur assis affiche `+1 POINT` (plus de `AJOUTER LES POINTS`, qui reste le CTA des JDS) — même emplacement, même gabarit, il change de côté à chaque bascule comme avant.
2. **Given** le joueur blanc a la main **When** l'assis tape `+1 POINT` **Then** un point est ajouté au score du blanc, immédiatement visible sur son panneau, avec l'impulsion haptique du pavé (UX-DR24, NFR1) ; le tour ne change pas ; le pavé ne s'ouvre pas.
3. **Given** plusieurs taps au fil de la reprise **When** je lis le total **Then** il reflète exactement le cumul des taps de cette reprise, inscrit dans la case du joueur de la reprise courante (`reprises`) — moyenne et meilleure série en découlent.
4. **Given** une série comptée au tap **When** l'assis tape sur sa propre carte (panneau inactif) **Then** la main est rendue et la série est clôturée telle quelle — aucune reprise à 0 n'est ajoutée par-dessus ; sans aucun tap, la main rendue enregistre une série de 0 comme en JDS.
5. **Given** un tap `+1 POINT` ou une main rendue **When** l'action est prise **Then** le chronomètre revient à 40, anneau plein, et attend 2 s avant de reprendre son décompte (une seconde par seconde ensuite) ; un chrono figé à 0 repart de la même façon.
6. **Given** un tap pendant les 2 s de latence **When** il est pris **Then** la latence repart de zéro (le décompte ne démarre jamais moins de 2 s après le dernier geste).
7. **Given** trois taps `+1 POINT` **When** j'appuie sur `ANNULER` **Then** un seul point est retiré par appui (un tap = une action annulable) ; annuler une main rendue rouvre la série comptée.
8. **Given** le joueur qui a la main atteint sa distance au tap **When** le point est crédité **Then** la série se termine sur-le-champ : offre d'égalisatrice si c'est le blanc, victoire immédiate si c'est le jaune, fin de l'égalisatrice si le jaune y égalise ; à distance déjà atteinte, le tap est sans effet.
9. **Given** une partie JDS **When** je joue **Then** rien ne change : `AJOUTER LES POINTS`, pavé, main rendue à 0, aucun chrono.
10. **Given** le code livré **When** je lis les specs **Then** `epics.md` (Story 2.2), `ux-design-specification.md` et `deferred-work.md` portent des notes datées : geste tranché, latence 2 s, `POUR n` non livré, point d'entrée du pavé de secours à définir en 2.3.

## Tasks / Subtasks

- [x] **Task 1 — Store : `incrementSeries()` et main rendue qui clôture (AC: 2, 3, 4, 7, 8, 9)**
  - [x] 1.1 `useGameStore.ts` : `writeLastReprise(playerId, value)` extrait d'`addReprise` (réécriture par remplacement, invariante des snapshots) ; `openSeriesValue(playerId)` — valeur de la case du joueur actif dans la dernière reprise si c'est lui qui l'a écrite en dernier (blanc : tant que la case du jaune est vide ; jaune : dès que sa case est renseignée), `null` sinon — toujours `null` en JDS.
  - [x] 1.2 `incrementSeries()` : garde `playing`, no-op à distance atteinte ; `pushHistory()` ; premier tap → `addReprise(playerId, 1)`, suivants → `writeLastReprise(open + 1)` + `recomputeScore` ; si la distance est atteinte → `switchTurn()` + `checkEndOfGame(playerId)` ; `lastSaved`. Exportée.
  - [x] 1.3 `passTurn()` : n'ajoute la reprise à 0 que si `openSeriesValue(playerId) === null` (JDS inchangé).
  - [x] 1.4 Tests `useGameStore.test.ts` › « série au point (3 Bandes) » : 16 tests — cumul, clôture à la main rendue, 0 sans tap, alternance sur deux reprises (moyennes, meilleure série), undo tap par tap, undo d'une main rendue qui rouvre la série, corrections `−`/`+` à part, distance atteinte (blanc → offre, jaune → victoire, égalisatrice égalisée / perdue), no-op à distance atteinte et hors partie, distance libre, ÉCHANGER, sauvegarde.

- [x] **Task 2 — `useTimer.ts` : latence de 2 s et garde par mode (AC: 5, 6)**
  - [x] 2.1 `SHOT_CLOCK_GRACE_MS = 2000` exporté ; `resetTimer()` : no-op hors partie 3 Bandes, sinon coupe tout, remet 40, arme `setTimeout(startInterval, 2000)` ; `stopTimers` coupe l'intervalle ET la grâce ; `onScopeDispose(stopTimers)`.
  - [x] 2.2 `useTimer.test.ts` : avances de temps recalées (grâce comprise) ; nouveaux tests — 40 immédiat puis 39 à 3 s, grâce relancée par un second reset, relance d'un chrono figé à 0, no-op en JDS et hors partie.

- [x] **Task 3 — `GameView.vue` : CTA `+1 POINT`, relances du chrono, haptique (AC: 1, 2, 5, 9)**
  - [x] 3.1 `isThreeCushions` ; `ctaTestId` (`plus-one-button` / `add-points-button`), `ctaLabel` (`+1 POINT` / `AJOUTER LES POINTS`), `pressCta()` ; `addPoint()` = `tap()` (useHaptics) + `incrementSeries()` + `resetTimer()` ; `passTurn()` appelle `resetTimer()` après l'action (gardée par le mode).
  - [x] 3.2 Les deux copies du CTA (markup dupliqué par colonne, dette connue) passent par ces trois computed/fonctions.
  - [x] 3.3 `GameView.test.ts` : bloc 2.1 recalé sur la grâce (et RECOMMENCER armé par un `+1` au lieu du pavé) ; nouveau bloc « +1 POINT (3 Bandes) » — 10 tests : CTA remplacé (côté assis) / conservé en JDS, crédit sans pavé + haptique, relance à 40 avec 2 s, main rendue depuis la carte (série clôturée, CTA qui change de côté, chrono relancé), 0 sans tap, chrono à 0 ravivé, undo tap par tap, offre d'égalisatrice au tap, JDS inchangé.

- [x] **Task 4 — Correctifs 2.1 portés par la même revue** (tracés dans la story 2.1, section « Retour de Nathan au rendu ») : anneau fluide en unités de conteneur, fondu vert → rouge.

- [x] **Task 5 — Specs (AC: 10)** : `epics.md` › Story 2.2 (note datée : geste tranché, 2 s, `POUR n` non livré, pavé de secours à replacer en 2.3) ; `ux-design-specification.md` (fiche barre basse / CenterPanel) ; `deferred-work.md` (entrée 2.2) ; `sprint-status.yaml` → `review`.

- [x] **Task 6 — Passe visuelle unique (CLAUDE.md §9)**, commune aux correctifs 2.1 et à la 2.2 : 1180×673 (cas rogné signalé par Nathan), 1024×768, 768×1024.

- [x] **Task 7 — Qualité** : `npm test`, `npx vue-tsc -b`, `npm run build` verts, aucune dépendance ajoutée, harnais supprimé.

### Review Findings (code review, 2026-09-11)

- [x] [Review][Defer] **ÉCHANGER pendant une reprise entamée casse la déduction de la série ouverte** — deferred (décision de Nathan, 2026-09-11 : « je vais retravailler ce mécanisme d'échange plus tard, je ne suis pas très au clair sur les décisions à prendre » — backlog) — `openSeriesValue` (`useGameStore.ts:367-372`) suppose l'ordre d'écriture « le blanc ouvre », mais `swapPlayers` met les reprises en miroir en laissant le tour attaché au côté. Reproduit : en 3 Bandes, blanc `+1` ×2 → `[[2,null]]`, ÉCHANGER → `[[null,2]]` main à gauche, `+1` → `[[1,2]]`, main rendue → `[[1,2],[0,null]]` : une reprise fantôme à 0 s'ajoute par-dessus la série tapée (AC4). En JDS, blanc valide 5, ÉCHANGER → `[[null,5]]`, main rendue → **aucun 0 enregistré** alors que la 2.2 promet « rien ne change en JDS » (AC9). Aucun test ne couvre la main rendue après un échange. Options : (a) refuser ÉCHANGER tant que la dernière reprise est à moitié remplie (bouton grisé comme ANNULER, les deux modes — revient en partie sur « ÉCHANGER disponible toute la partie », 2026-09-09) ; (b) même règle en 3 Bandes seulement ; (c) stocker explicitement la série ouverte dans `GameState` (bump `GAME_STORAGE_VERSION`, miroir, snapshots).
- [x] [Review][Patch] **Le chrono repart et décompte sous la pop-up de fin ; le jaune entame l'égalisatrice avec un chrono entamé** — décision de Nathan (2026-09-11) : relancer le chrono à l'acceptation de l'égalisatrice [`GameView.vue`, handler de `OUI, IL JOUE`] — `GameView.addPoint`/`passTurn` appellent `resetTimer()` même quand l'action vient de poser `endPrompt` (`equalizing-offer` ou `over`, `status` encore `playing`). À `OUI, IL JOUE`, `acceptEqualizingReprise` ne touche pas au chrono : le jaune joue avec 40 − N s, voire 0. Aucune AC ne tranche. Options : (a) relancer le chrono à l'acceptation de l'égalisatrice (un `resetTimer()` dans le handler de la vue) ; (b) laisser tel quel (pas de faute au temps, le chrono est caché par la pop-up).
- [x] [Review][Patch] **`+1 POINT` vibre et relance le chrono même quand le store ne crédite rien** (distance déjà atteinte par une correction `+`, AC8 « sans effet ») — `incrementSeries` doit renvoyer un booléen (comme `appendScoreDigit`) et `addPoint` ne faire `tap()`/`resetTimer()` que sur `true` [`GameView.vue:106-110`, `useGameStore.ts:442`]
- [x] [Review][Patch] **Tests : assertions qui ne prouvent pas ce qu'elles nomment** — « ignores a tap once the distance is already reached » capture `canUndo` (déjà `true`) au lieu de vérifier qu'un seul `ANNULER` ramène à 0 ; `setItem.mockRestore()` en fin de corps de test empoisonne la suite si un `expect` précédent lève (à déplacer en `afterEach`) ; « restarts from 40 on restartGame » saisit au pavé en 3 Bandes (parcours annulé en 2.3) au lieu d'un `incrementSeries` [`useGameStore.test.ts:1025-1035,834-837`, `useTimer.test.ts:557-559`]
- [x] [Review][Defer] **`incrementSeries`/`passTurn` acceptés alors que `endPrompt` est posé** (pilotage déporté V2+) [`useGameStore.ts:442`] — deferred, pre-existing (même famille que `validateScoreInput`, UI bloquée par la pop-up)
- [x] [Review][Defer] **Un snapshot complet des reprises par tap : pile d'undo et sauvegarde localStorage plus lourdes en 3 Bandes** [`useGameStore.ts:172-174,680`] — deferred, pre-existing (coût de la pile déjà consigné, `MAX_UNDO_DEPTH = 1000`)

## Dev Notes

- **Pourquoi la série ouverte se déduit au lieu d'être stockée** : ajouter un champ « série en cours » à `GameState` aurait touché le format persisté, les snapshots d'undo, le miroir d'ÉCHANGER et `resumeGame`. La dernière reprise porte déjà l'information : la seule règle est « qui a écrit la dernière case ». Le prix : `openSeriesValue` dépend de l'ordre d'écriture (le blanc ouvre). Après un ÉCHANGER (reprises mises en miroir, tour attaché au côté), le tap continue de créditer le côté qui a la main — testé.
- **Pourquoi la vue appelle `resetTimer` (et pas un `watch` du store)** : un `watch` sur `reprises`/`activePlayer` se déclencherait aussi sur `ANNULER` et sur les corrections `−`/`+`, que Nathan n'a pas cités. Les deux gestes cités sont deux fonctions de la vue : `addPoint` et `passTurn`. `resetTimer` est gardée par le mode pour que `passTurn` reste unique entre JDS et 3 Bandes.
- **Haptique** : `useHaptics().tap()` — synchrone dans le handler `pointerdown` (NFR1), inerte sur iPad (API absente), comme au pavé.
- **Grâce et onglet caché** : en passe visuelle, un onglet Chrome en arrière-plan ralentit `setInterval` et fige les transitions CSS (captures trompeuses : chiffre à jour, anneau/couleur en retard). Vérifications faites sur les valeurs DOM/`getComputedStyle`, et captures prises transitions coupées. Sur la tablette, l'app est toujours au premier plan.
- **Ce que cette story NE fait PAS** : pas de `POUR n` ; pas de pavé de secours (2.3) ; pas de nombre de sets ; pas de reset du chrono à l'undo ; aucun changement à `PlayerPanel` (les `−`/`+` de correction restent).

### References

- [Source: retour de Nathan, 2026-09-11 (revue au rendu de la 2.1) — CTA `+1 point` qui crédite l'adversaire, main rendue au tap sur la carte, relance à 40 s avec 2 s de latence, fondu vert → rouge, débordement à corriger]
- [Source: epics.md › Story 2.2 (AC FR14/UX-DR24/NFR1, note de périmètre `POUR n`, note 2.1 sur la grâce) ; Story 1.5 décision 1 (geste à distinguer) ; Story 2.3 (pavé de secours)]
- [Source: 2-1 story — `resetTimer()` prévu comme point de branchement ; `useGameStore.ts` — `addReprise`, `passTurn`, `checkEndOfGame`, `pushHistory` (un geste = un snapshot)]

## Change Log

| Date | Changement |
|---|---|
| 2026-09-11 | Création et implémentation (bmad-dev-story, dans la foulée de la revue de la 2.1) : `incrementSeries` + main rendue qui clôture, `SHOT_CLOCK_GRACE_MS`, CTA `+1 POINT`, haptique ; 489 tests / 17 fichiers, `vue-tsc` et `build` verts ; passe visuelle 1180×673, 1024×768, 768×1024. Statut `review`. |
| 2026-09-11 | Revue de code (bmad-code-review) : `incrementSeries` renvoie un booléen, `+1 POINT` sans effet à distance atteinte (ni haptique ni relance), chrono relancé à l'acceptation de l'égalisatrice (décision de Nathan), tests renforcés (`afterEach`, undo, pavé remplacé). ÉCHANGER mi-reprise reporté au backlog (décision de Nathan). 501 tests, `vue-tsc` et `build` verts. Statut `done`. |

## Dev Agent Record

### Agent Model Used

claude-fable-5-1 (Claude Fable 5.1)

### Debug Log References

- `vi.restoreAllMocks()` ne restaure pas un `vi.spyOn(localStorage, 'setItem').mockImplementation(...)` dans cette version de Vitest (sondé) : le dernier test du bloc « persistance » laissait `setItem` lever pour tous les blocs suivants du fichier. Corrigé par `mockRestore()` explicite dans ce test.
- Les `data-testid="player1-zone"` sont ceux de l'étape joueurs, pas des panneaux de jeu : les tests de la vue tapent le composant `PlayerPanel` (comme les blocs 1.5/1.7).

### Completion Notes List

- **Task 1** : 16 tests store (150 au total dans le fichier).
- **Task 2** : 14 tests composable.
- **Task 3** : 10 tests vue (+ 4 recalés).
- **Task 5** : notes datées dans `epics.md`, `ux-design-specification.md`, `deferred-work.md` ; `sprint-status.yaml` → `review`.
- **Task 6 — Passe visuelle** (harnais iframe recréé puis supprimé, transitions coupées pour les captures d'un onglet caché) : 1180×673 — plus rien de rogné (REP y 16, anneau 104 px, ÉCHANGER bas 535 dans une colonne de 551, aucun défilement), CTA `+1 POINT` côté jaune ; 3 taps → blanc 3, tour inchangé, pavé fermé, chrono 40 puis 38 après 4,3 s ; main rendue au tap de la carte jaune → `[[3,null]]`, tour au jaune, CTA côté blanc, chrono 40 ; jaune 2 taps + main rendue → `[[3,2]]`, REP 2, moyennes 3.000 / 2.000 ; ANNULER → tap défait. 1024×768 — anneau 173 px, chiffre 76 px, aucun débordement ; vert à 31, jaune à 19, orange `rgb(248,138,42)` à 8, rouge à 0 anneau vide. 768×1024 — CTA `+1 POINT` 307×90 en bas à droite, deux taps → blanc 2, anneau 122 px avec son libellé centrés dans la zone, ANNULER/ÉCHANGER en bas de colonne, aucun défilement. Après le premier passage, la passe a révélé que le libellé CHRONO restait collé en haut de la zone `flex-1` en portrait : corrigé (libellé + anneau centrés ensemble, disque conteneur de sa propre taille) et re-mesuré sur les trois formats — consigné dans la story 2.1.
- **Task 7** : `npm test` 489/489 (17 fichiers), `vue-tsc -b` et `build` verts, aucune dépendance, harnais supprimé.

### File List

- `1score/src/stores/useGameStore.ts` (modifié — `writeLastReprise`, `openSeriesValue`, `incrementSeries`, `passTurn`)
- `1score/src/stores/useGameStore.test.ts` (modifié)
- `1score/src/composables/useTimer.ts` (modifié — `SHOT_CLOCK_GRACE_MS`, garde par mode)
- `1score/src/composables/useTimer.test.ts` (modifié)
- `1score/src/views/GameView.vue` (modifié — CTA `+1 POINT`, `addPoint`, relances)
- `1score/src/views/GameView.test.ts` (modifié)
- `_bmad-output/planning-artifacts/epics.md` (modifié)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (modifié)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modifié)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)
- Temporaire (créé puis supprimé) : `1score/public/_viewport-harness.html`
