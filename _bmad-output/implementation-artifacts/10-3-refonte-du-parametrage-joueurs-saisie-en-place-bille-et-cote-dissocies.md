# Story 10.3: Refonte du paramétrage joueurs — saisie en place, bille et côté dissociés

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur qui prépare une partie,
I want régler mon nom et ma distance directement sur ma carte, changer de bille ou de côté d'un tap, puis démarrer,
so that la table est prête sans pop-up ni écran supplémentaire, et la répartition des billes correspond à la réalité de la table (FR1, FR41).

> **Cadrage (bmad-create-story, 2026-09-12).** Troisième story visuelle de l'Epic 10 (10.6, 10.1, 10.2 livrées). **Périmètre : l'étape `players` de `HomeScreen`** — dernier écran hors jeu à refondre, donc **dernier usage d'`ActionBar` hors scoreboard**. C'est aussi la **seule story de l'epic qui touche le store** : scission de `swapPlayers` (AR21), retrait d'`ÉCHANGER` du jeu (AR22), règle « la bille blanche ouvre, où qu'elle soit » (AR24), suppression de `Player.id` (DT5), plafond unique du pavé (DT1), clavier complété (DT4). **Aucune règle de calcul de score ne change** : moyenne, meilleure série, `POUR n`, égalisatrice, undo et fin de partie gardent leurs attentes de test à l'identique. Le scoreboard et le récap gardent leur rendu actuel (barre basse comprise) jusqu'aux Stories 10.4 et 10.5 — ils n'apprennent ici qu'à placer les joueurs du bon côté. Exigences : AR21, AR22, AR24, UX-DR31, UX-DR38 à UX-DR44, UX-DR54, DT1, DT4, DT5, DT7.

> **Décisions de Nathan à la création de la story (2026-09-12)** — elles priment sur les AC d'`epics.md` et la spec UX §10.3, à annoter en Task 9 :
> 1. **Référence visuelle : `explore/resources/billiboard_player_3.png`**, pour la **disposition** (deux cartes joueur pleine couleur de bille, médaillon rond portant le nom et la distance, pavé numérique **dans la colonne centrale à la place des CTA**, `DÉMARRER` juste dessous). Pour le **rendu**, rien de neuf : tokens, contours, angles vifs et palette des Stories 10.1/10.2.
> 2. **Conteneurs espacés sur le dégradé**, et non collés comme les tuiles : cet écran revient au « Bloc Plein contenu » d'origine — trois colonnes séparées par des gouttières, chacune à contour, marge autour de la zone principale. **Divergence assumée** avec l'accueil et la sélection JDS, où tout est jointif. La `SideBar`, elle, reste collée au bord comme partout.
> 3. **Aucun voile ne doit masquer les cartes pendant la saisie.** « Il faut qu'on puisse lire les champs de nom et score qui vont se remplir en arrière-plan » : pas d'assombrissement ni de flou sur les cartes — modèle Billiboard, où le pavé cohabite avec deux cartes pleinement lisibles. Le blur 4 px / noir 30 % d'UX-DR39 et le voile du bandeau de nom d'UX-DR40 sont **caducs** ; l'entrée « voile et flou à revoir avec le pavé » de `deferred-work.md` (10.2) est **close par cette décision**.

## Acceptance Criteria

1. **Coquille de l'étape `players`** — **Given** l'étape joueurs **When** elle s'affiche **Then** elle reprend le fond `--gradient-bg` sans image, la `SideBar` collée au bord gauche et une zone principale à droite **And** l'ancien en-tête (`<header>` + `h1`) et l'`ActionBar` n'y sont plus rendus — `HomeScreen` n'importe plus `ActionBar`, qui ne sert plus qu'au scoreboard **And** la zone principale est en trois colonnes **2/5 · 1/5 · 2/5**, en **conteneurs espacés** (gouttière entre colonnes, marge autour, contour `--color-border`, angles vifs) **And** rien ne défile ni ne déborde en 1133×744, 1194×834 et 1920×1080.

2. **`SideBar` du paramétrage (UX-DR31, UX-DR44)** — **Given** l'étape joueurs **When** elle s'affiche **Then** la barre porte son en-tête inerte, puis `RETOUR` (picto `arrow-left`, état `normal`) et `CONFIGURATION` (picto `gear`, état `soon`, inerte), et en bas un item de sortie `ANNULER` (picto `close`, état `normal`) **And** `RETOUR` ramène à l'étape `mode` pour un jeu de série et à l'accueil pour le 3 Bandes, **noms et distances conservés** **And** `ANNULER` ramène à l'accueil en effaçant noms et distances, **sans confirmation** **And** les pictos `gear` et `close` sont ajoutés à `PictoIcon`.

3. **Carte joueur** — **Given** une carte **When** elle s'affiche **Then** c'est un conteneur à contour, fond plein de la couleur de sa bille (`--color-player-white` / `--color-player-yellow`, encre noire), portant en haut une **pastille de bille** de 64 px (rond blanc ou jaune sur fond sombre, avec liseré — elle garde la bille lisible quand les cartes ont changé de côté) **And** au centre, un **grand médaillon rond sombre** (disposition Billiboard) contenant les deux champs empilés, chacun un conteneur à contour tapable : `NOM` (attente `JOUEUR`, atténuée) puis `DISTANCE` (attente `0`, atténuée) **And** le champ **visé** porte le liseré `--color-turn-active` (présence, jamais une teinte de fond seule) **And** les deux cartes sont adressables en test par côté (`player-card-left`, `player-card-right`) et portent leur bille en attribut (`data-ball="white|yellow"`).

4. **Dock de distance (UX-DR39, DT1)** — **Given** une carte **When** je tape son champ `DISTANCE` **Then** `NumericPadDock` s'ouvre **dans la colonne centrale**, à la place des CTA de réglage (croix en haut, `NumericPad` nu — sans carte ni en-tête —, `VALIDER` accent pleine largeur en pied) **And** **les deux cartes restent entièrement lisibles, sans voile ni flou**, et le champ `DISTANCE` visé s'actualise à chaque touche **And** `AC`/`C` et `⌫` se comportent comme aujourd'hui, la première frappe sur une valeur déjà réglée la remplace **And** le plafond est de 3 chiffres, la frappe au-delà est ignorée avec pulsation et haptique de refus, et ce plafond a **une seule source** : `MAX_TARGET_SCORE` exporté par le store (`MAX_DIGITS` disparaît avec `PlayerSetupModal`) **And** `VALIDER` applique la valeur, la croix abandonne et restaure la valeur précédente.

5. **Bandeau du nom (UX-DR40)** — **Given** une carte **When** je tape son champ `NOM` **Then** `AlphaKeyboardSheet` s'ouvre en **bandeau bas pleine largeur** (conteneur à contour, croix à gauche, `VALIDER` à droite) **And** les deux cartes restent **entièrement visibles au-dessus du bandeau** — la zone principale se réduit, le bandeau ne recouvre aucune carte — et le champ `NOM` visé s'actualise à chaque touche **And** la saisie est en majuscules, plafonnée à 20 caractères utiles, sans espace en tête ni espaces consécutifs **And** les touches font **≥ 57 px** et rien ne déborde au format le plus petit (1133×744) **And** `VALIDER` applique, la croix abandonne et restaure la valeur précédente.

6. **Passage d'un champ à l'autre** — *(réécrit à la revue de fin d'Epic 10, décision de Nathan du 2026-09-15 : les claviers sont des pop-ups à voile plein écran depuis la 2e passe de rendu)* **Given** une saisie ouverte (pavé ou clavier) **When** je tape hors de la pop-up — l'autre champ, l'autre carte, la colonne centrale **Then** la saisie en cours est **annulée** (l'ancienne valeur revient, comme par `ANNULER`) et la pop-up se ferme ; le champ suivant s'ouvre d'un second tap **And** une seule saisie est ouverte à la fois. Seul l'enchaînement du rattrapage (« DISTANCE MANQUANTE ») passe d'une saisie à l'autre en validant la première.

7. **Clavier complété (DT4)** — **Given** `AlphaKeyboard` **When** la story est livrée **Then** il porte en plus le **tiret**, l'**apostrophe** et `Ë Ï Î Ô Û`, `ESPACE` et `⌫` conservés **And** `JEAN-PIERRE`, `D'ARTAGNAN`, `JOËL`, `ANAÏS`, `BENOÎT` et `JÉRÔME` sont saisissables.

8. **Claviers muets en style contour (UX-DR54)** — **Given** `NumericPad` et `AlphaKeyboard` **When** ils sont rendus **Then** leurs touches prennent les tokens de l'epic (`--color-surface`, `--color-border`, rayon `--radius-cta`, donc angles vifs) via `keyClasses.ts` partagé **And** ils restent **muets** : ni buffer, ni plafond, ni timer, ni haptique — portés par leurs hôtes **And** `ScoreEntryModal`, qui embarque `NumericPad`, continue de fonctionner à l'identique (sa carte garde ses arrondis jusqu'à la 10.7).

9. **`PlayerSetupModal` supprimé (UX-DR41)** — **Given** la story livrée **When** on cherche le composant **Then** `PlayerSetupModal.vue` et `PlayerSetupModal.test.ts` sont **supprimés**, plus aucune pop-up de joueur n'existe, et aucun champ natif n'apparaît nulle part (règle « borne fixe », UX-DR19).

10. **Colonne centrale au repos (UX-DR42)** — **Given** l'étape joueurs, aucune saisie ouverte **When** la colonne centrale s'affiche **Then** elle porte le surtitre du mode (ex. `CADRE 47/2`, lu dans `GAME_MODE_LABELS`), une ligne de deux CTA neutres à contour de demi-largeur — `CHANGER DE BILLE` (picto `swap-balls`) et `CHANGER DE CÔTÉ` (picto `swap-sides`) — puis `DÉMARRER` accent, pleine largeur, ≥ 110 px de haut.

11. **`CHANGER DE BILLE` (UX-DR43)** — **Given** deux joueurs saisis, blanc à gauche **When** je tape `CHANGER DE BILLE` **Then** **les billes s'échangent, les joueurs restent en place** : la carte de gauche devient jaune (fond, médaillon), celle de droite blanche, **noms et distances ne bougent pas** **And** un second tap remet tout en place (l'action est son propre inverse).

12. **`CHANGER DE CÔTÉ` (UX-DR43)** — **Given** deux joueurs saisis **When** je tape `CHANGER DE CÔTÉ` **Then** **les cartes s'échangent de place, tout compris** (nom, distance, bille) **And** un second tap les remet en place.

13. **Démarrage (AR24)** — **Given** n'importe quelle combinaison des deux actions **When** je tape `DÉMARRER` **Then** le scoreboard affiche chaque joueur du côté et avec la bille choisis **And** **le joueur à la bille blanche ouvre la partie** — il a la main au premier tour et ouvre les reprises — **où qu'il soit à l'écran** ; la reprise égalisatrice appartient au joueur à la bille jaune **And** moyenne, meilleure série, `POUR n`, undo et fin de partie sont inchangés : **aucune attente de calcul des tests du store n'est modifiée**.

14. **`ÉCHANGER` retiré du jeu (AR22, DT7)** — **Given** une partie en cours **When** le scoreboard s'affiche **Then** `ÉCHANGER` n'existe plus : bouton et emit retirés de `CenterPanel`, `swapPlayers()` et `sidesSwapped` retirés du store, de `GameState` et de `GameSnapshot`, `mirrorSnapshot` supprimé avec eux, tests correspondants retirés **And** le reste du scoreboard rend exactement comme aujourd'hui.

15. **Format persisté (DT5)** — **Given** `GameState` **When** son format change (`whiteSide: 'left' | 'right'` ajouté, `sidesSwapped` et `Player.id` retirés) **Then** `GAME_STORAGE_VERSION` passe à **2**, la garde de lecture est mise à jour sur les champs réellement restaurés **And** une sauvegarde de l'ancien format est écartée proprement au lancement : aucune pop-up « PARTIE EN COURS » n'est proposée, l'entrée est supprimée, l'accueil s'affiche normalement.

16. **Rattrapage « DISTANCE MANQUANTE » (UX-DR41)** — **Given** `DÉMARRER` tapé alors qu'au moins une distance vaut 0 **When** la pop-up propose `RÉGLER LA DISTANCE` **Then** ce CTA ouvre **directement le dock sur le champ `DISTANCE`** du premier joueur sans distance **And** après validation, celui du second s'ouvre seul s'il en manque encore, puis l'enchaînement s'arrête (jamais de boucle sur la même carte) **And** `ANNULER` referme la pop-up sans rien changer.

17. **Tests et livraison** — **Given** la story livrée **When** les tests tournent **Then** `NumericPadDock`, `AlphaKeyboardSheet` et `PlayerSetupCard` ont leurs tests co-localisés (AR16), `PlayerSetupModal.test.ts` est supprimé, et `HomeScreen.test.ts`, `GameView.test.ts`, `useGameStore.test.ts`, `CenterPanel.test.ts`, `AlphaKeyboard.test.ts`, `GameSummary.test.ts` et `storageService.test.ts` sont adaptés **And** la suite complète et `npm run build` (dont `vue-tsc -b`) sont verts **And** le rendu est vérifié dans Chrome aux trois formats **paysage**, dock ouvert et bandeau ouvert.

## Tasks / Subtasks

- [x] **Task 1 — Pictos de l'écran** (AC: 2, 10)
  - [x] 1.1 Ajouter `gear`, `close`, `swap-balls` (deux ronds + double flèche) et `swap-sides` (double flèche horizontale) à `PictoName` (`types/ui.ts`) et à la table `PATHS` de `PictoIcon.vue` — tracés Lucide (ISC), viewBox 24, trait 2 px, sans remplissage, comme les cinq existants.
  - [x] 1.2 Étendre les cas d'`it.each` de `PictoIcon.test.ts` aux quatre noms.

- [x] **Task 2 — Claviers : style contour et complétion** (AC: 7, 8)
  - [x] 2.1 `keyClasses.ts` : passer aux tokens de l'epic (`bg-surface`, `border-border`, rayon `--radius-cta`). Ne pas toucher au dimensionnement, qui appartient à chaque clavier.
  - [x] 2.2 `AlphaKeyboard.vue` : ajouter le tiret, l'apostrophe et `Ë Ï Î Ô Û` (voir « Clavier » en Dev Notes pour la disposition et le calcul de hauteur), plancher de touche relevé à 57 px.
  - [x] 2.3 `AlphaKeyboard.test.ts` : cas pour les sept nouvelles touches, `ESPACE`/`⌫` conservés, composant toujours muet (aucun état interne).
  - [x] 2.4 Vérifier `NumericPad.test.ts` et `ScoreEntryModal.test.ts` toujours verts : seules les classes de touche changent.

- [x] **Task 3 — `NumericPadDock` et `AlphaKeyboardSheet`** (AC: 4, 5, 6)
  - [x] 3.1 `NumericPadDock.vue` : props `{ value: string }`, emits `update: [string]`, `validate: []`, `cancel: []`. Porte le plafond (`String(MAX_TARGET_SCORE).length`), l'haptique (`useHaptics`), la pulsation de refus, et la règle « première frappe sur une valeur déjà réglée la remplace ». Croix en haut (`dock-close`), `NumericPad` nu au centre, `VALIDER` accent en pied (`dock-confirm`).
  - [x] 3.2 `AlphaKeyboardSheet.vue` : props `{ value: string }`, mêmes emits. Porte le plafond de 20 caractères utiles et le refus des espaces en tête / consécutifs. Croix à gauche (`sheet-close`), `VALIDER` à droite (`sheet-confirm`), `AlphaKeyboard` dessous.
  - [x] 3.3 Tests co-localisés des deux : émission de la nouvelle valeur complète à chaque touche, plafonds, `AC`/`C`, `⌫`, validation, abandon. Déclenchement en `pointerdown` (AR8).

- [x] **Task 4 — Store : bille, côté et nettoyage** (AC: 13, 14, 15)
  - [x] 4.1 `types/game.ts` : retirer `Player.id`, retirer `sidesSwapped` de `GameState` **et** de `GameSnapshot`, ajouter `whiteSide: 'left' | 'right'` à `GameState` (pas au snapshot : il ne change jamais en cours de partie). Réécrire les commentaires de `PlayerId` et `PlayerColor` (le côté d'affichage n'est plus l'identité du joueur).
  - [x] 4.2 `useGameStore.ts` : exporter `MAX_TARGET_SCORE` ; `startGame(mode, whiteName, yellowName, targetScores, whiteSide = 'left')` ; `whiteSide` en `ref` persisté, restauré par `resumeGame`, remis à `'left'` par `resetGame`, reconduit par `rematch()` et `restartGame()` ; supprimer `swapPlayers`, `sidesSwapped`, `mirrorSnapshot` et la branche miroir d'`undoLastAction` ; `makePlayer(color)` au lieu de `makePlayer(id)`.
  - [x] 4.3 `storageService.ts` : `GAME_STORAGE_VERSION = 2`, garde de lecture sans `sidesSwapped` et avec `whiteSide` (`'left'` ou `'right'`).
  - [x] 4.4 `useGameStore.test.ts` : retirer les cas d'interversion (≈ 20, voir « Tests » en Dev Notes), ajouter `whiteSide` (défaut, transport par `startGame`, reconduction par `rematch`/`restartGame`, remise à zéro par `resetGame`, persistance et restauration), vérifier que **toutes les attentes de calcul restantes passent sans modification**.
  - [x] 4.5 `storageService.test.ts` : forme persistée mise à jour, sauvegarde en version 1 rejetée.

- [x] **Task 5 — Côté d'affichage en jeu et au récap** (AC: 13, 14)
  - [x] 5.1 `GameView.vue` : résoudre `leftPlayer`/`rightPlayer` depuis `whiteSide` et rendre les deux `PlayerPanel` dans cet ordre ; **faire suivre la colonne du CTA de la barre basse** (piège documenté en Dev Notes) ; supprimer la fonction `swapPlayers` et le binding `@swap-players`.
  - [x] 5.2 `CenterPanel.vue` : retirer le bouton `ÉCHANGER` et l'emit `swap-players` ; adapter `CenterPanel.test.ts`.
  - [x] 5.3 `GameSummary.vue` : ordre des colonnes et bandeau alignés sur le côté d'affichage (prop `whiteSide`, défaut `'left'`) ; adapter `GameSummary.test.ts`.

- [x] **Task 6 — Carte de paramétrage** (AC: 3)
  - [x] 6.1 `PlayerSetupCard.vue` : composant présentationnel (pastille de bille, médaillon rond portant les champs `NOM` et `DISTANCE`, liseré du champ visé), props `{ ball, name, distance, focusedField }`, emit `focus: ['name' | 'distance']`. Aucun accès au store.
  - [x] 6.2 Test co-localisé : couleurs par bille écrites en toutes lettres, libellés d'attente atténués, liseré sur le champ visé seulement, emit au `pointerdown`.

- [x] **Task 7 — Étape `players` réécrite** (AC: 1, 2, 6, 9, 10, 11, 12, 16)
  - [x] 7.1 Remplacer la branche `v-else` de `HomeScreen.vue` par la nouvelle coquille (`data-testid="step-players"` monté dessus), `SideBar` nourrie par `PLAYERS_SIDEBAR_ITEMS` + item de sortie, trois colonnes espacées.
  - [x] 7.2 État local : `players` clé par bille (`white`/`yellow`), `whiteSide`, `entry: { ball, field } | null`, `draft: string`. Implémenter `changeBall()` et `changeSide()` (table de vérité en Dev Notes).
  - [x] 7.3 Colonne centrale : surtitre, deux CTA, `DÉMARRER` (`confirm-button` conservé) ; le dock remplace les CTA quand une distance est en saisie.
  - [x] 7.4 Bandeau de nom monté sous la zone principale, en flux (pas en surimpression).
  - [x] 7.5 `confirm()` : appeler `startGame` avec les joueurs résolus (blanc, jaune) et `whiteSide` ; conserver la garde « distance manquante » et l'enchaînement du rattrapage (`fixingDistances`).
  - [x] 7.6 `back()` : conserver les saisies pour `RETOUR`, les effacer pour `ANNULER` ; refermer toute saisie ouverte dans les deux cas (piège du garde `step`, déjà payé en 1.4 et 10.2).
  - [x] 7.7 Supprimer `PlayerSetupModal.vue` et `PlayerSetupModal.test.ts`, retirer l'import et l'usage dans `HomeScreen.vue`, retirer l'import d'`ActionBar`.

- [x] **Task 8 — Tests d'écran et de parcours** (AC: 17)
  - [x] 8.1 `HomeScreen.test.ts` : réécrire les cas de la modale (≈ l. 390-796) en saisie en place ; ajouter sidebar du paramétrage, `CHANGER DE BILLE`, `CHANGER DE CÔTÉ`, combinaisons, commutation de champ, `RETOUR` qui conserve, `ANNULER` qui efface.
  - [x] 8.2 `GameView.test.ts` : adapter les deux helpers de parcours depuis l'accueil (l. 18-33 et l. 1356-1371), retirer les cas `swap-players-button`, ajouter un cas de bout en bout « blanc à droite → il ouvre quand même ».
  - [x] 8.3 Suite complète + `npm run build` verts.

- [x] **Task 9 — Passe navigateur et documents** (AC: 17)
  - [x] 9.1 Une seule passe Chrome en fin de story (CLAUDE.md §9), protocole et points de contrôle en Dev Notes.
  - [x] 9.2 Annoter `epics.md` (AC de la 10.3 : voile supprimé, conteneurs espacés), la spec UX §10.3 (UX-DR39/UX-DR40 : plus de voile) et `architecture.md` (section « Navigation & Shell » : forme retenue pour `whiteSide`, confirmation de la piste de la passe epics).
  - [x] 9.3 `deferred-work.md` : clore l'entrée « voile et flou des pop-ups à revoir avec le pavé » ; consigner les reports éventuels de cette story.
  - [x] 9.4 `sprint-status.yaml` : `10-3-…` → `review` (revue de code groupée en fin d'epic, ne pas proposer `bmad-code-review`).

### Review Findings

*(revue de code groupée de fin d'Epic 10, 2026-09-15 — Blind Hunter + Edge Case Hunter + Acceptance Auditor)*

- [x] [Review][Decision] **Résolu (Nathan, 2026-09-15) : option 2 — l'annulation est conservée, l'AC6 est réécrit ci-dessus, les quatre gardes mortes (`openEntry`, `confirm`, `changeBall`, `changeSide`) sont retirées.** Le tap en dehors des pop-ups de paramétrage vaut ANNULER et perd la frappe — le voile `fixed inset-0` de `NumericPadDock`/`AlphaKeyboardSheet` couvre les cartes ET la colonne centrale : taper l'autre champ (AC6 « une saisie ouverte est validée au passage »), CHANGER DE BILLE / DE CÔTÉ ou DÉMARRER pendant une saisie tombe sur le voile, qui appelle `abandonEntry()` et restaure l'ancienne valeur sans avertissement. Le chemin `openEntry() → applyEntry()` (et les gardes de `confirm()`, `changeBall()`, `changeSide()`) n'est atteignable que par les tests, qui déclenchent `pointerdown` directement sur le champ. Options : (1) au paramétrage, le tap dehors VALIDE (`@cancel` du voile → `applyEntry`, le CTA ANNULER reste le seul abandon) ; (2) garder l'annulation, réécrire l'AC6 et supprimer les gardes mortes ; (3) voile non couvrant (cartes tapables sous la pop-up).
- [x] [Review][Decision] **Résolu (Nathan, 2026-09-15) : option 1 — `goHome()` efface (`clearSetup`), le retour d'un cran vers la sélection JDS conserve ; test « forgets names and distances when RETOUR reaches the home screen ».** `RETOUR` jusqu'à l'accueil reconduit noms et distances sur une autre catégorie ou un autre mode — `back()` → `goHome()` ne vide ni `players` ni `whiteSide`, seul `ANNULER` appelle `clearSetup()`. Parcours : 3 BANDES, distance 30 → RETOUR → JEUX DE SÉRIES → LIBRE : la carte arrive à 30, DÉMARRER part sans pop-up. C'est le défaut que le commentaire de `cancelSetup()` (revue 1.3) dit éviter ; l'AC2 ne parle que du retour d'un cran vers la sélection JDS. Options : (1) `goHome()` efface, le retour d'un cran conserve ; (2) conserver partout et le documenter comme règle.
- [x] [Review][Patch] *(corrigé : `:key="entry.ball"` sur les deux pop-ups, test « remounts the distance pad when the entry moves to the other ball »)* `NumericPadDock` : `pristine` est figé à la création de l'instance, et le dock reste monté quand l'entrée change de bille (`v-if` seul — l'ancienne `PlayerSetupModal` était remontée par `:key="editing"`). Reproduit par test : distance du jaune réglée à 25, saisie du blanc ouverte puis bascule sur la distance du jaune, la frappe `4` donne `254` au lieu de `4` [1score/src/components/HomeScreen.vue:537]
- [x] [Review][Patch] *(corrigé : `tap()` sur frappe acceptée, `reject()` + `sheet-reject` pulsé au plafond, plafond mesuré sur `(value + char).trim()` ; trois tests)* `AlphaKeyboardSheet` sans haptique ni pulsation de refus, contrairement à CLAUDE.md §10, UX-DR54 et à la Task 3 de cette story : aucun `tap()` sur frappe acceptée, `return` silencieux au plafond de 20 caractères (le clavier paraît en panne) ; et le plafond, mesuré après `trim()`, laisse passer un 21e caractère après un espace final [1score/src/components/AlphaKeyboardSheet.vue:34-41]
- [x] [Review][Patch] *(corrigé)* `undoLastAction` : `const snapshot = previous` est un alias sans objet, vestige de `mirrorSnapshot`, avec son commentaire de trois lignes [1score/src/stores/useGameStore.ts:544-547]

## Dev Notes

### État du code à l'arrivée (commit `0f0eed5`, arbre propre, 562 tests verts, 20 fichiers)

- **`HomeScreen.vue` (445 l.)** : trois branches — `category` (coquille 10.1), `mode` (coquille 10.2), `v-else` = étape joueurs **d'avant l'Epic 10** (`bg-bg`, `<header>` + `h1`, deux `<button>` pleine hauteur `player1-zone`/`player2-zone`, `ActionBar` avec `DÉMARRER`). C'est cette dernière branche que la story remplace.
- **État local du paramétrage** : `player1Name`/`player2Name`, `targetScores`, `editing`, `editingField`, `distanceError`, `fixingDistances`. Il **reste local** (le store n'a pas de phase de paramétrage) — seule sa **clé** change : par bille et non par côté.
- **`PlayerSetupModal.vue` (240 l.)** : à supprimer, mais c'est la **mine** de la story — `appendChar` (espaces), `appendDigit` + `distancePristine` (première frappe qui remplace), `MAX_DIGITS`, `MAX_NAME_LENGTH`, liseré du champ visé, caret. Reprendre ces règles telles quelles dans le dock et le bandeau, ne pas les réinventer.
- **`SideBar.vue`** : API complète depuis la 10.1 (`items`, `exitItem`, item `soon` = `disabled` + garde, sortie calée en bas par `mt-auto`). **Aucun changement attendu** : la story la nourrit, c'est tout.
- **`NumericPad` / `AlphaKeyboard`** : déjà purement présentationnels (`disabled`, `hasInput`, emits). Ils ne gagnent **aucun** état dans cette story.
- **`useGameStore.ts` (803 l.)** : `startGame` à 4 paramètres, `swapPlayers()` gardé sur `playing`, `sidesSwapped` + `mirrorSnapshot` pour l'undo, `MAX_TARGET_SCORE = 999` **non exporté**, `makePlayer(id)` qui pose `id` et `color`.
- **`PromptModal`** : variante liste livrée en 10.2 ; « DISTANCE MANQUANTE » garde `primaryLabel`/`secondaryLabel` et son voile **inerte** — ne pas la basculer en variante liste.

### Décisions de rendu de l'epic, valables ici (passe 10.1, Nathan)

Paysage uniquement (1133×744, 1194×834, 1920×1080 ; aucune variante `portrait:`/`md:` d'orientation) · angles vifs (`--radius-container`/`--radius-cta` à 0) · palette bleus / noir-gris / rouge, **un seul bleu** `--gradient-blue` pour tout CTA bleu (`DÉMARRER` inclus, voir ci-dessous) · retour visuel à l'appui sur les éléments tapables · aucune animation d'ambiance.

`DÉMARRER` est le premier CTA accent hors pop-up depuis la simplification du 2026-09-12 : lui donner `bg-(image:--gradient-blue)` et l'encre blanche, comme les CTA de `PromptModal` — surtout pas `bg-accent`, qui est l'ancien bleu `#1E88E5` et jurerait à côté des pop-ups. Les deux CTA de réglage sont **neutres** : `--gradient-neutral`, contour `--color-border-strong`.

### Modèle d'état du paramétrage — la clé est la BILLE

```ts
const players = ref({ white: { name: '', distance: 0 }, yellow: { name: '', distance: 0 } })
const whiteSide = ref<'left' | 'right'>('left')
// Carte affichée à gauche = players[whiteSide === 'left' ? 'white' : 'yellow']
```

| Action | Effet sur `players` | Effet sur `whiteSide` | Résultat à l'écran |
|---|---|---|---|
| `CHANGER DE BILLE` | **permute** les deux entrées | **bascule** | les cartes ne bougent pas, leurs billes s'échangent |
| `CHANGER DE CÔTÉ` | inchangé | **bascule** | les cartes s'échangent, tout compris |

Les deux sont leur propre inverse par construction. C'est la seule combinaison qui donne les deux comportements d'UX-DR43 sans état supplémentaire — la vérifier par test avant d'écrire l'écran.

`DÉMARRER` : `startGame(selectedMode, players.white.name, players.yellow.name, { player1: players.white.distance, player2: players.yellow.distance }, whiteSide)`. **`player1` reste la bille blanche et reste celui qui ouvre** : aucune règle de jeu ne bouge.

### Store — le diff exact

- **`whiteSide` est un champ d'affichage**, pas un fait de jeu : il entre dans `GameState` (persisté, restauré) mais **pas** dans `GameSnapshot` — il ne change jamais en cours de partie, l'undo n'a rien à en faire.
- **Effet en cascade voulu** : sans interversion en jeu, la parité de côtés ne varie plus → `mirrorSnapshot`, le champ `sidesSwapped` du snapshot et la branche `previous.sidesSwapped === sidesSwapped.value` d'`undoLastAction` deviennent **du code mort**. Les supprimer, ne pas les « garder au cas où » : `undoLastAction` redevient une restauration directe.
- `makePlayer` prend désormais une **couleur** (`'white' | 'yellow'`) et ne pose plus d'`id` ; `resumeGame` restampe `color` seule (`player1` → blanc, `player2` → jaune) — le restampage de la pile reste nécessaire pour la même raison qu'en 1.12.
- `startGame` gagne un 5e paramètre **optionnel** (`whiteSide = 'left'`) : tous les appels de test existants continuent de compiler et de décrire le même cas.
- `rematch()` et `restartGame()` passent `whiteSide.value` : « chacun repart du côté où il est » reste vrai, c'est déjà ce que disent leurs tests.
- `MAX_TARGET_SCORE` devient un export nommé, le dock en dérive son plafond de chiffres (`String(MAX_TARGET_SCORE).length`). **Une seule source** (DT1) ; `normalizeTargetScore` reste la garde finale côté store (AR17).

### Côté d'affichage en jeu — le piège du CTA

`GameView` place aujourd'hui les panneaux dans l'ordre `player1`, `player2`, et la barre basse choisit sa colonne avec `entrySide === 'player1' ? gauche : droite`. Avec `whiteSide === 'right'`, `player1` est **à droite** : si seul l'ordre des panneaux suit `whiteSide`, le CTA de saisie se retrouve du mauvais côté, sous la carte du joueur qui a la main — exactement l'inverse de la règle (c'est l'**assis** qui compte pour celui qui joue). Résoudre **une fois** `leftPlayer`/`rightPlayer` (et `leftId`/`rightId`) en tête de la vue, et faire dériver de là l'ordre des panneaux **et** la colonne du CTA. Même vigilance pour `GameSummary`, dont `SIDES` est une constante `['player1','player2']` : elle devient un `computed` ordonné par `whiteSide`, sans quoi le récap contredit le scoreboard (AR24 : « le récap conserve les côtés du scoreboard »).

### Dock et bandeau — contrat et cohabitation

- **La valeur en cours vit dans l'écran** (`draft`), pas dans le dock : c'est la carte qui doit l'afficher en direct, et deux buffers divergeraient à la première frappe. Le dock et le bandeau reçoivent `value` et émettent `update` avec **la nouvelle valeur complète** ; ils gardent les **règles** (plafonds, espaces, première frappe qui remplace) et les **retours** (haptique, pulsation). C'est le partage déjà en place entre `ScoreEntryModal` et le store, et il honore UX-DR39/UX-DR54 : les claviers restent muets, l'hôte porte la règle. Écart assumé avec la lettre d'UX-DR39 (« le dock est l'hôte du buffer ») — à consigner en Task 9.2.
- **Aucun voile** (décision 3 de Nathan) : pas de `backdrop`, donc **pas de fermeture par geste sur le voile** et pas de mécanique `armBackdropClose` à recopier ici. Les issues sont la croix, `VALIDER`, et le tap sur un autre champ (AC6). Un tap ailleurs sur l'écran ne ferme rien.
- **Le dock ne recouvre rien** : il **remplace** les CTA dans la colonne centrale. Celle-ci fait 1/5 de la zone principale, soit ≈ 195 px à 1133×744 — sous le minimum utile du pavé (trois colonnes de 60 px + gouttières + padding). Élargir la colonne centrale pendant la saisie (ex. `min-w-[240px]` porté par la colonne quand une distance est en cours) et laisser les cartes se resserrer : en flex, personne ne se recouvre et tout reste lisible. Ne pas positionner le dock en absolu par-dessus les cartes.
- **Le bandeau ne recouvre rien non plus** : le monter **dans le flux** sous la zone principale (`main` en `flex-1 min-h-0`, bandeau `shrink-0`), pas en `fixed`/`absolute`. Les cartes rapetissent, restent entières, et le champ qu'on remplit reste sous les yeux — c'est précisément ce que demande Nathan.

### Clavier — la hauteur est un résultat, pas une valeur à recopier

`--spacing` vaut 8 px : **`gap-2` = 16 px**, pas 8. Avec six rangées de touches à 57 px et `gap-1` (8 px), le clavier seul fait 6×57 + 5×8 = **382 px**, plus la barre croix/`VALIDER` et le padding du bandeau ≈ **460 px** — soit 62 % des 744 px de l'iPad mini, bien au-delà des « ≈ 45 % » de la spec. Les 45 % sont une **intention**, la contrainte dure est : touches ≥ 57 px, rien qui déborde, **les deux cartes entières au-dessus**. Dimensionner le bandeau en conséquence (hauteur fluide, gouttières serrées) et vérifier au navigateur aux trois formats ; si les cartes deviennent illisibles à 1133×744, réduire d'abord les gouttières, puis signaler l'arbitrage à Nathan plutôt que de descendre sous 57 px.

Disposition proposée (à confirmer au rendu) : rangée de chiffres, trois rangées AZERTY inchangées, une rangée d'accents et signes `Ë Ï Î Ô Û - '` complétée par `⌫`, puis `ESPACE` pleine largeur. Ne pas déplacer les touches existantes : la mémoire du geste compte plus que la symétrie.

### Pièges

- **`distance-field` et `name-field` existent maintenant en double** (une paire par carte). Tout `wrapper.find('[data-testid="distance-field"]')` attrape la carte de **gauche** : scoper par `player-card-left`/`player-card-right` dans les tests, sinon un cas censé viser le jaune passe au vert en testant le blanc.
- **`step-players` monte sur la coquille de l'étape** (comme `step-category` en 10.1 et `step-mode` en 10.2) : `HomeScreen.test.ts` et `GameView.test.ts` n'en vérifient que la présence ou l'absence.
- **`confirm-button` est lu par `GameView.test.ts`** (l. 1359, 1370) : garder ce `data-testid` sur `DÉMARRER` malgré son déménagement en colonne centrale.
- **Saisie masquée ≠ saisie fermée** : `entry` doit être remis à `null` par `back()` comme `editing` l'est aujourd'hui (`HomeScreen.vue:126`), sinon la saisie rouvre d'elle-même au retour sur l'étape.
- **L'enchaînement du rattrapage ne va que dans un sens** (blanc puis jaune) et s'arrête après le second, même si une distance reste à 0 : sans cette garde, les deux saisies s'ouvriraient en boucle (règle posée en revue 1.10, à conserver telle quelle).
- **Le libellé d'attente doit rester distinguable d'une vraie valeur** : `JOUEUR` et `0` atténués, la valeur saisie pleine encre. Un test de la 1.4 le vérifie déjà pour le nom.
- **`disabled` + garde, les deux**, pour `CONFIGURATION` en BIENTÔT comme pour tout le reste (motif de la 10.1) : les navigateurs ne s'accordent pas sur les pointer events des contrôles désactivés.
- **Commentaire HTML à la racine d'un gabarit** = fragment, donc `classes()`/`attributes()` et le `data-testid` du parent perdus (piège payé en 10.1 sur `ModeTile`). Idem pour `PlayerSetupCard`.
- **Sélecteur à préfixe** : `[data-testid^="player-card-"]` attraperait aussi d'éventuels enfants — préférer les testids exacts (piège payé en 10.1 sur `SideBar`).
- **Ne pas toucher** au scoreboard au-delà du côté d'affichage et du retrait d'`ÉCHANGER` : `PlayerPanel`, `ActionBar`, `ShotClock` et `ScoreEntryModal` gardent leur rendu jusqu'à la 10.4.
- **Aucune classe construite à la volée** (`bg-(image:--gradient-${x})`) : le scanner JIT de Tailwind 4 ne voit que les classes écrites en toutes lettres — tables `Record<...>` comme partout ailleurs.

### Tests

- Vitest + Vue Test Utils + happy-dom : **aucun CSS n'est calculé**. Les tests vérifient classes, attributs et comportements ; tailles, débordements et lisibilité relèvent de la passe navigateur.
- Déclenchement en `trigger('pointerdown')`, jamais `click` (AR8). Cycle rouge-vert par composant, pas de navigateur pendant l'implémentation (CLAUDE.md §9).
- **`useGameStore.test.ts`** : les cas à retirer sont ceux qui appellent `store.swapPlayers()` ou lisent `store.sidesSwapped` — l. 82-145, 560-610, 682-700, 735-780, 894-960, 971-1000 (`mirrorSnapshot`), 1017-1040, 1253-1265, 1350-1360, 1456-1470, 1525-1540, 1741-1750, 1890-1930, 1955-1980, 2383-2400. Les **supprimer**, pas les adapter : le mécanisme n'existe plus. Tout le reste du fichier doit passer **sans retouche** — c'est la preuve qu'aucune règle de calcul n'a bougé (AC13).
- **`HomeScreen.test.ts`** : les helpers `openSetup`, `pressInModal`, `setupModal`, `setDistance` (l. 22-67) sont à réécrire en saisie en place ; les cas l. 390-796 suivent. Conserver la valeur de chacun (espaces refusés, nom par défaut, réouverture sur les valeurs réglées, oubli des saisies à l'abandon du mode…) — ils décrivent des règles produit, pas la modale.
- **`GameView.test.ts`** : deux helpers de parcours à adapter (l. 18-33, l. 1356-1371) ; les cas `swap-players-button` (l. 625-660, 1002) disparaissent ou perdent leur étape d'échange.

### Validation visuelle (fin de story, une seule passe)

- `npm run dev` — **pas `npm run preview`** : derrière le service worker, `navigateFallback` renvoie `index.html` pour toute navigation et le harnais n'est jamais chargé (piège payé en 10.2).
- `resize_window` ne redimensionne pas le viewport : harnais temporaire `1score/public/_viewport-harness.html` chargeant l'app dans une `<iframe>` dimensionnée par `?w=&h=`, **supprimé en fin de passe**. Formats paysage : **1133×744**, **1194×834**, **1920×1080**. Demander à Nathan quel Chrome utiliser (« Browser 1 (macOS) » les dernières fois).
- **`scrollWidth`/`scrollHeight` ne voient rien sous `overflow-hidden`** : comparer les `getBoundingClientRect()` des cartes, des champs et du bandeau à ceux de leur parent.
- À relever par format : trois colonnes à 2/5 · 1/5 · 2/5 avec gouttières visibles et dégradé autour ; pastille de bille à 64 px, médaillon rond entier (jamais rogné) ; champs entiers ; **dock ouvert** → colonne centrale élargie, deux cartes lisibles et non floutées, valeur qui s'incrémente à l'œil ; **bandeau ouvert** → touches ≥ 57 px mesurées, deux cartes entières au-dessus, aucun recouvrement ; aucun arrondi hors carte de pop-up ; aucun défilement.
- Parcours : accueil → `JEUX DE SÉRIES` → `LIBRE` → paramétrage ; nom au bandeau (`JEAN-PIERRE`, puis `JOËL`), distance au dock ; `CHANGER DE BILLE`, `CHANGER DE CÔTÉ`, les deux enchaînés ; `RETOUR` (saisies conservées) → `LIBRE` → retour ; `ANNULER` (tout effacé) ; `DÉMARRER` sans distance → pop-up → `RÉGLER LA DISTANCE` → enchaînement des deux cartes ; démarrer **blanc à droite** et vérifier que c'est bien lui qui a la main et que le CTA de saisie est du côté de l'assis ; une série, `ANNULER`, fin de partie, récap (côtés conformes) ; recharger en cours de partie → « PARTIE EN COURS » → reprise aux bons côtés. Avant la passe, **jeter toute sauvegarde `1score:game`** (elle est en version 1, elle sera de toute façon écartée — le vérifier une fois, AC15).

### Intelligence de la story précédente (10.2, `0f0eed5`)

- **Le plan ne survit pas au premier rendu.** La 10.2 a livré ses AC puis enchaîné **quatre** passes de rendu avec Nathan (angles vifs et gabarit resserré des pop-ups, dégradé interne aux CTA, fermeture au tap dehors en variante liste, puis **un seul bleu** pour tout le produit). Prévoir le même temps ici : livrer les AC, puis montrer et corriger. Ne pas retourner chercher les valeurs d'`epics.md` ou de la spec (rayons, marge de 16 px, `--color-tile-*` colorés, voiles) : elles sont caduques et les documents sont annotés.
- **Ce qu'il faut montrer à Nathan en priorité** : la cohabitation dock/cartes et bandeau/cartes aux trois formats — c'est le seul vrai point de design neuf de la story, et celui sur lequel sa décision 3 sera jugée.
- **`@theme static`** est accepté par Tailwind 4.3.3 ; aucun repli `:root` n'est nécessaire.
- **Reporté, à ne pas re-traiter ici** (`deferred-work.md`) : effet d'appui peu visible au doigt ; plafonds de `clamp()` trop bas pour le 21,5″ ; fond d'accueil à retravailler ; alignement de `ScoreEntryModal` sur le nouveau style de pop-up et passe contraste AA → **Story 10.7**. En revanche, l'entrée « voile et flou à revoir avec le pavé » est **close ici** (décision 3).
- **Revue de code groupée** : l'Epic 10 laisse chaque story en `review` sans relecture, revues et correctifs passés ensemble en fin d'epic (décision de Nathan, 2026-09-11). Ne pas proposer `bmad-code-review` à la livraison.

### Project Structure Notes

- Composants à plat dans `src/components/`, tests co-localisés (AR16), named exports hors SFC. Trois fichiers nouveaux (`NumericPadDock.vue`, `AlphaKeyboardSheet.vue`, `PlayerSetupCard.vue`) et un supprimé (`PlayerSetupModal.vue`), chacun avec son test.
- `PlayerSetupCard` n'est pas listé dans la spec §10.4 : il sort de la réécriture de l'étape joueurs, comme `PictoIcon` était sorti de la 10.1 — une carte rendue deux fois, purement présentationnelle, qu'il serait absurde de dupliquer dans un `HomeScreen` déjà à 445 lignes. À consigner dans `architecture.md` avec les autres.
- `types/ui.ts` porte les types d'interface de l'epic (`PictoName`, `ItemState`, `SideBarItem`, `PromptAction`) ; `types/game.ts` reste le modèle de partie — c'est lui qui accueille `whiteSide` et perd `Player.id`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.3] — AC d'origine et **piste d'implémentation recommandée** (invariant `player1` = blanc = celui qui ouvre, champ `whiteSide`) ; [#Epic 10] — décisions de la passe de rendu 10.1, valables pour toute l'epic ; [#Requirements Inventory] — AR21, AR22, AR24, UX-DR31, UX-DR38 à UX-DR44, UX-DR54, DT1, DT4, DT5, DT7
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.2, #10.3 Paramétrage joueurs, #10.4, #10.6, #10.7] — sidebar par écran, carte et champs, dock et bandeau, composants, règles conservées, pictos
- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation & Shell (Epic 10, V1.1)] — scission de `swapPlayers`, retrait d'`ÉCHANGER`, piste `whiteSide` à confirmer et consigner ici ; [#Architecture des Données] — forme exacte de `GameState`, règle « tout changement de forme incrémente `GAME_STORAGE_VERSION` »
- [Source: explore/resources/billiboard_player_3.png] — référence de disposition retenue par Nathan ; [Source: explore/basic-ui-brainstorming-2026-09-11.md#Paramétrage joueurs] — brief d'origine (« le pavé numérique est trop fat », score visible en arrière-plan)
- [Source: _bmad-output/implementation-artifacts/10-2-…md] — coquille, tokens, pièges de test, protocole de passe navigateur ; [#deferred-work.md] — reports en cours
- [Source: 1score/CLAUDE.md §1, §2, §4, §6, §7, §8, §9]
- [Source: 1score/src/components/HomeScreen.vue:69-140,168-250,300-445 ; PlayerSetupModal.vue ; SideBar.vue ; NumericPad.vue ; AlphaKeyboard.vue ; keyClasses.ts ; ScoreEntryModal.vue:60-120 ; CenterPanel.vue:50-62 ; GameSummary.vue:55-120]
- [Source: 1score/src/stores/useGameStore.ts:15-92,140-255,540-600,640-760 ; services/storageService.ts:10-50 ; types/game.ts:1-160]
- [Source: 1score/src/components/HomeScreen.test.ts:12-67,390-796 ; views/GameView.test.ts:18-33,615-665,1356-1371 ; stores/useGameStore.test.ts (cas d'interversion listés en Dev Notes)]
- Mémoire projet « Validation visuelle Chrome », « Paysage uniquement », « Revues groupées en fin d'Epic 10 », « Direction visuelle anguleuse et bleue »

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`), workflow `bmad-dev-story`, 2026-09-12.

### Debug Log References

- Suite complète : **591 tests verts**, 22 fichiers. `npm run build` (dont `vue-tsc -b`) vert.
- Passe navigateur unique en fin de story (CLAUDE.md §9), Chrome « Browser 1 (macOS) », harnais `public/_viewport-harness.html` **supprimé en fin de passe**. Trois formats paysage : 1133×744, 1194×834, 1920×1080.

### Completion Notes List

**Ce qui a été livré**

- **Pictos** (Task 1) : `gear`, `close`, `swap-balls` (deux billes sous une double flèche), `swap-sides` (double flèche horizontale) ajoutés à `PictoName` et à `PATHS`, tracés Lucide.
- **Claviers** (Task 2) : `keyClasses.ts` passe aux tokens de l'epic (`bg-surface`, `border-border`, `rounded-cta` — angles vifs, relief en creux retiré avec les arrondis). `AlphaKeyboard` gagne une **5e rangée** `Ë Ï Î Ô Û - '` + `⌫`, `ESPACE` passant sur toute la largeur en 6e ; plancher de touche relevé à **57 px**. Aucune touche existante déplacée. `JEAN-PIERRE`, `D'ARTAGNAN`, `JOËL`, `ANAÏS`, `BENOÎT`, `JÉRÔME` saisissables.
- **Hôtes de saisie** (Task 3) : `NumericPadDock` (croix, pavé nu, `VALIDER` en pied) et `AlphaKeyboardSheet` (bandeau bas, croix à gauche, `VALIDER` à droite). Ils portent les **règles** (plafond dérivé de `MAX_TARGET_SCORE`, 20 caractères utiles, espaces refusés, première frappe qui remplace) et les **retours** (haptique, pulsation de refus) ; les claviers restent muets.
- **Store** (Task 4) : `whiteSide` remplace `sidesSwapped` dans `GameState` (pas dans `GameSnapshot`), `Player.id` supprimé, `swapPlayers` et `mirrorSnapshot` supprimés avec la branche miroir d'`undoLastAction`, `MAX_TARGET_SCORE` exporté, `startGame` à 5 paramètres, `GAME_STORAGE_VERSION = 2`.
- **Côtés en jeu et au récap** (Task 5) : `GameView` résout `leftPlayer`/`rightPlayer`/`leftId`/`rightId` **une seule fois** et en fait dériver l'ordre des panneaux **et** la colonne du CTA ; `ÉCHANGER` retiré de `CenterPanel` ; `GameSummary` reçoit `whiteSide` et ordonne colonnes **et** bandeau.
- **Écran** (Tasks 6, 7) : `PlayerSetupCard` (présentationnelle) et l'étape `players` réécrite sous la coquille de l'accueil — sidebar `RETOUR` / `CONFIGURATION` (BIENTÔT) / `ANNULER`, trois colonnes espacées, `CHANGER DE BILLE` / `CHANGER DE CÔTÉ`, `DÉMARRER`. `PlayerSetupModal.vue` et son test **supprimés** ; `HomeScreen` n'importe plus `ActionBar`.

**Écarts assumés par rapport à la spec, annotés en Task 9.2**

1. **Aucun voile ni flou** pendant la saisie (décision 3 de Nathan) : le blur 4 px / noir 30 % d'UX-DR39 et le voile d'UX-DR40 sont caducs, et avec eux la fermeture par geste sur le voile. Les issues sont la croix, `VALIDER`, ou le tap sur un autre champ — qui **valide** la saisie en cours.
2. **Le buffer vit dans l'écran** (`draft`), pas dans le dock (écart à la lettre d'UX-DR39) : c'est la carte qui l'affiche en direct, deux buffers divergeraient à la première frappe.
3. **Bandeau à ≈ 56 %** de la hauteur, pas « ≈ 45 % » : plancher incompressible à six rangées de 57 px. Sa barre croix / `VALIDER` est passée de 90 px à **57 px** (exception UX-DR8) — ce sont ces 33 px qui manquaient aux cartes à 1133×744.
4. **Conteneurs espacés** sur le dégradé, et non jointifs comme les tuiles des 10.1/10.2 (décision 2 de Nathan).

**Deux défauts trouvés et corrigés à la passe navigateur** (invisibles en test : happy-dom ne calcule aucun CSS)

- **Pastille de bille invisible** : `bg-player-white` écrasait le fond sombre, donnant un disque blanc sur une carte blanche. Corrigé — la pastille est désormais une **platine sombre de 64 px** portant la bille, à liseré.
- **Médaillon débordant de la carte** : `aspect-square` sans plafond de hauteur le rendait plus haut que la carte dès que le bandeau de nom réduisait celle-ci, et les deux champs sortaient de la carte. Corrigé par `max-h-full` (il s'aplatit en ellipse plutôt que déborder) ; les champs se resserrent jusqu'au plancher de 57 px. Même correctif sur les deux CTA de réglage, dont `DÉMARRER` sortait de sa colonne.

**Vérifié au navigateur, aux trois formats** : aucun défilement ni débordement ; `DÉMARRER` à 110 px et dans sa colonne ; pastille à 64 px ; touches du pavé ≥ 99 px et du clavier = 57 px ; dock ouvert → colonne élargie, **deux cartes nettes et lisibles**, valeur qui s'incrémente à l'œil ; bandeau ouvert → **deux cartes entières au-dessus**, aucun recouvrement.

**Parcours vérifié de bout en bout** : `CHANGER DE BILLE` (billes échangées, joueurs en place) · `CHANGER DE CÔTÉ` (cartes échangées, tout compris) · les deux enchaînés · `RETOUR` conserve les saisies · `ANNULER` efface tout · `DÉMARRER` sans distance → « DISTANCE MANQUANTE » → `RÉGLER LA DISTANCE` ouvre le dock sur le **blanc**, puis enchaîne sur le jaune, puis s'arrête · démarrage **blanc à droite** → MICHEL a bien la main et le CTA de saisie est dans la colonne de l'**assis** · série, `ANNULER`, fin de partie, **récap aux mêmes côtés** · rechargement en cours de partie → « PARTIE EN COURS » → reprise aux bons côtés (`version: 2`, `whiteSide: "right"` persisté).

**AC15 vérifié explicitement** : une sauvegarde semée en **version 1** (avec `sidesSwapped` et `Player.id`) est écartée au lancement — aucune pop-up « PARTIE EN COURS », entrée supprimée, accueil affiché normalement.

---

**2e passe de rendu (Nathan, 2026-09-12, après livraison)** — rendu refusé (« archi moche »), repris intégralement :

- **Bandeau de titre** en haut de la zone principale, le mode en grand et centré (réf. Cueuny). Le surtitre quitte la colonne centrale.
- **Pastille de bille et médaillon rond sombre supprimés** — la couleur pleine de la carte dit déjà la bille.
- **Champs centrés** dans leur carte, chacun en box à fondu grisé (`--gradient-field`, token ajouté).
- **Commandes façon Cueuny** : les deux réglages passent en **bleu**, côte à côte ; `DÉMARRER` passe en **rouge** (`--gradient-red`, token ajouté) avec un **chevron** (picto `chevron-right`). Le liseré rouge du champ visé est conservé.
- **Les deux claviers deviennent de vraies POP-UPS** par-dessus l'écran, voile flouté compris : le dock en colonne centrale et le bandeau en flux sont abandonnés. La valeur en cours est **rappelée dans l'en-tête de la pop-up, calée entre la croix et `VALIDER`**, avec un **rappel de bille** — c'est ce qui garantit qu'on voit toujours ce qu'on tape.

Conséquences assumées : **AC6** (passer d'un champ à l'autre d'un seul tap) n'est plus atteignable au doigt, un voile plein écran recouvrant les cartes — la garde reste dans `openEntry` et sert l'enchaînement du rattrapage ; **AC10** perd son surtitre, monté en bandeau. Deux débordements trouvés à la passe navigateur et corrigés : picto des réglages remis **au-dessus** du libellé (73 px par bouton à 1133×744, un picto en ligne débordait) et libellé de `DÉMARRER` légèrement réduit. **598 tests verts**, build vert, aucun débordement aux trois formats.

Toute la mise en page de hauteur de la 1re passe disparaît avec les pop-ups : plus de colonne qui s'élargit, plus de cartes qui se resserrent, plus de planchers à 57 px sur les champs.

---

---

**3e passe de rendu (Nathan, 2026-09-12)** — un bug et une série de correctifs :

- **BUG corrigé : `CHANGER DE CÔTÉ` n'intervertit que les noms et les distances.** Les billes restent attachées à leur côté (gauche blanche). C'est le dual exact de `CHANGER DE BILLE`, qui laisse les joueurs en place ; l'implémentation basculait `whiteSide` en plus de permuter les entrées, ce qui faisait voyager la bille avec le joueur. **Seul `CHANGER DE BILLE` déplace donc `whiteSide`.** AC12 corrigée en conséquence.
- **Réglages empilés**, pleine largeur, picto **en ligne** (Nathan teste sur un 14″).
- **Pictos de la référence coréenne** : `refresh` (boucle) pour la bille, `arrow-right-left` (flèches croisées) pour le côté. `swap-balls` et `swap-sides` supprimés du jeu de pictos.
- **`DÉMARRER`** : chevron **à gauche** du mot, dans une plaque translucide.
- **Cartes allégées** : marge portée à 48 px, champs en **box claires** teintées de la carte (`bg-black/8`, encre de la carte) au lieu des pavés presque noirs, et champs plus hauts pour occuper la carte. Un champ vide porte **son seul intitulé** — ni « JOUEUR » ni « 0 ».
- **Colonne centrale élargie** de 1/5 à **1/4**, sur `--gradient-panel`, nettement plus clair que le fond d'écran (« globalement c'est un peu sombre »).

598 tests verts, build vert, aucun débordement aux trois formats. Le bug de `CHANGER DE CÔTÉ` a été revérifié au navigateur, pas seulement en test.

---

---

**4e passe de rendu (Nathan, 2026-09-12)** :

- **En-tête de carte** : picto de bille + `BILLE BLANCHE` / `BILLE JAUNE`. Le picto est un **disque CSS placeholder** — Nathan fournit les vrais (consigné dans `deferred-work.md`). L'espace sous les champs reste volontairement vide.
- **Jaune éclairci** : `--color-player-yellow` de `#FFC72C` à `#FFD60A` (« trop or/orange »). Touche aussi le scoreboard, ce qui est voulu.
- **Pop-ups alignées sur le côté OPPOSÉ à la carte visée** : celle-ci reste entièrement visible et se remplit à vue. Le rappel de la valeur **disparaît** des pop-ups, et leur voile **n'est plus flouté** — un flou plein écran rendait justement illisible la carte qu'on remplit, ce qui annulait tout l'intérêt de l'alignement. Voile à `bg-black/25`, sans `backdrop-blur`.
- **Fermeture au tap dehors** sur geste complet (appui ET relâchement, `pointerId` mémorisé, `pointercancel` qui désarme — la mécanique de `ScoreEntryModal`), et **`ANNULER` à la place de la croix**.
- **Touches façon Cueuny** : `--radius-key` (8 px), `--color-key`, filet clair en haut, ombre portée en bas, enfoncement à l'appui. `keyClasses.ts` étant partagé, `ScoreEntryModal` en hérite — noté pour la 10.7.

Vérifié au navigateur aux trois formats : la pop-up ne recouvre **jamais** la carte visée (mesuré), aucun débordement, touches à 57 px, placeholders non tronqués, fermeture au tap dehors effective et insensible à un relâchement seul. **606 tests verts**, build vert.

---

---

**5e passe de rendu (Nathan, 2026-09-12)** :

- **Pop-ups centrées dans la zone libre** et non collées au bord, gouttière de 32 px comprise. Géométrie portée par `--setup-popup-inset-left`/`-right`, qui dupliquent la mise en page de l'étape — dette consignée.
- **`ANNULER`/`VALIDER` au rayon des touches** (`--radius-key`), `PromptModal` compris.
- **Touche `RESET`** au clavier alphabétique : `AlphaKeyboard` émet `clear`, l'hôte vide le buffer — le clavier reste muet.
- **`PromptModal`** : titre centré partout, **principal au-dessus du secondaire**, voile `bg-black/25` sans flou, et **`dismissible`** (opt-in) pour le tap dehors — activé sur « DISTANCE MANQUANTE », refusé aux pop-ups de fin de partie dont le voile doit rester inerte (AC18).
- **En-tête de carte** aligné à gauche, bandeau pleine largeur sur un aplat plus sombre, filet affiné, **vrais pictos de bille** de Nathan (`public/bille_*.png`).
- **Contraste corrigé** : ~2:1 sur la carte jaune, désormais au-delà de 9:1. Opacités relevées (placeholder 55 %, intitulé 65 %, en-tête 75 %).

Vérifié au navigateur aux trois formats : pop-ups jamais sur la carte visée (gouttière mesurée), aucun débordement, touches à 57 px, `RESET` présent, tap dehors effectif sur les deux claviers et sur « DISTANCE MANQUANTE ». **610 tests verts**, build vert.

---

---

**6e passe de rendu (Nathan, 2026-09-12)** :

- **`ANNULER` opaque, sans contour clair.** `--gradient-neutral` passe du blanc voilé à un gris sombre plein, de la famille de `--color-key` ; `border-border-strong` retiré des deux pop-ups de saisie. Un seul token, donc la correction vaut aussi pour `PromptModal`. Les **arrondis sont validés** — Nathan évoque de les généraliser plus tard.
- **Jaune arrêté à `#FFE000`** (4e valeur, validée par Nathan) : `#FFC72C` et `#FFD60A` tiraient vers le doré, `#FFE81A` vers le jaune lavé. Le point clé n'est pas la teinte mais le **bleu à zéro** : c'est lui qui donne la saturation pleine.
- **Chevron de `DÉMARRER` nu et plus large**, à gauche du mot : sa plaque translucide se lisait comme un bouton dans le bouton.

610 tests verts, build vert, aucun débordement aux trois formats.

---

**À montrer à Nathan en priorité** : la cohabitation dock/cartes et bandeau/cartes à 1133×744 — c'est le point de design neuf de la story, celui sur lequel sa décision 3 se juge, et le seul endroit où la contrainte de hauteur est tendue (cartes à 247 px, champs à leur plancher de 57 px).

### File List

**Nouveaux**

- `1score/src/components/NumericPadDock.vue`
- `1score/src/components/NumericPadDock.test.ts`
- `1score/src/components/AlphaKeyboardSheet.vue`
- `1score/src/components/AlphaKeyboardSheet.test.ts`
- `1score/src/components/PlayerSetupCard.vue`
- `1score/src/components/PlayerSetupCard.test.ts`

**Supprimés**

- `1score/src/components/PlayerSetupModal.vue`
- `1score/src/components/PlayerSetupModal.test.ts`

**Modifiés**

- `1score/src/types/ui.ts`
- `1score/src/types/game.ts`
- `1score/src/components/PictoIcon.vue`
- `1score/src/components/PictoIcon.test.ts`
- `1score/src/components/keyClasses.ts`
- `1score/src/components/AlphaKeyboard.vue`
- `1score/src/components/AlphaKeyboard.test.ts`
- `1score/src/components/HomeScreen.vue`
- `1score/src/components/HomeScreen.test.ts`
- `1score/src/components/CenterPanel.vue`
- `1score/src/components/CenterPanel.test.ts`
- `1score/src/components/GameSummary.vue`
- `1score/src/components/GameSummary.test.ts`
- `1score/src/components/PlayerPanel.test.ts`
- `1score/src/assets/main.css`
- `1score/src/views/GameView.vue`
- `1score/src/views/GameView.test.ts`
- `1score/src/stores/useGameStore.ts`
- `1score/src/stores/useGameStore.test.ts`
- `1score/src/services/storageService.ts`
- `1score/src/services/storageService.test.ts`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- **2026-09-12** — Story 10.3 implémentée (`bmad-dev-story`). Paramétrage joueurs refondu en saisie en place : `NumericPadDock`, `AlphaKeyboardSheet`, `PlayerSetupCard`, `PlayerSetupModal` supprimé, `ActionBar` réservée au scoreboard. Store : `whiteSide` remplace `sidesSwapped`, `Player.id` retiré, `swapPlayers`/`mirrorSnapshot` supprimés, `GAME_STORAGE_VERSION → 2`. `ÉCHANGER` retiré du jeu. Clavier complété (DT4), plafond unifié (DT1). 591 tests verts, build vert, passe navigateur aux trois formats paysage. Statut → `review` (revue de code groupée en fin d'Epic 10).

- 2026-09-12 — Création de la fiche (bmad-create-story). Décisions de Nathan : référence de disposition `billiboard_player_3.png` (rendu repris des 10.1/10.2), trois colonnes en **conteneurs espacés** sur le dégradé, **aucun voile** pendant la saisie — les deux cartes restent lisibles et se remplissent à vue. `epics.md`, spec UX et `architecture.md` à annoter en Task 9.2.
- **2026-09-12** — 2e passe de rendu (Nathan) : bandeau de titre, pastille et médaillon supprimés, champs centrés en box à fondu grisé, commandes façon Cueuny (réglages bleus, `DÉMARRER` rouge à chevron), et les deux claviers passent en **pop-ups** à voile flouté avec rappel de la valeur entre la croix et `VALIDER`. Tokens `--gradient-red` et `--gradient-field`, picto `chevron-right`. 598 tests verts, build vert, trois formats vérifiés.
- **2026-09-12** — 3e passe de rendu (Nathan) : correction du bug de `CHANGER DE CÔTÉ` (n'intervertit que noms et distances, les billes ne bougent pas), réglages empilés à picto en ligne, pictos de la référence coréenne (`refresh`, `arrow-right-left`), chevron de `DÉMARRER` à gauche en plaque translucide, cartes allégées (marge, box claires, intitulé seul en placeholder), colonne centrale élargie à 1/4 sur `--gradient-panel`. 598 tests verts, build vert.
- **2026-09-12** — 4e passe de rendu (Nathan) : en-tête de carte à picto de bille (placeholder), jaune éclairci `#FFD60A`, pop-ups alignées sur le côté opposé à la carte visée (rappel de valeur retiré, voile sans flou), fermeture au tap dehors et `ANNULER` à la place de la croix, touches façon Cueuny (`--radius-key`). 606 tests verts, build vert.
- **2026-09-12** — 5e passe de rendu (Nathan) : pop-ups centrées dans la zone libre, CTA au rayon des touches, touche `RESET`, `PromptModal` repris (titre centré, principal au-dessus, voile aligné, `dismissible`), en-tête de carte à gauche avec les vrais pictos de bille, contraste corrigé sur la carte jaune. 610 tests verts, build vert.
- **2026-09-12** — 6e passe de rendu (Nathan) : `ANNULER` opaque et sans contour clair (`--gradient-neutral` en gris plein, valable aussi pour `PromptModal`), jaune éclairci à `#FFE81A`, chevron de `DÉMARRER` nu et élargi. 610 tests verts, build vert.
- **2026-09-12** — jaune arrêté à `#FFE000` (`#FFE81A` faisait « jaune pipi »). Rendu **validé par Nathan** sur l'ensemble de l'écran.
