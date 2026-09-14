# Story 10.4: Refonte du scoreboard — carte joueur, `PASSER LE TOUR`, dock de saisie, barre basse en pictos

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur en partie (JDS ou 3 Bandes),
I want une carte joueur qui montre mon nom, ma distance, mon restant, mon score, ma moyenne et ma série, une colonne centrale réduite à l'essentiel avec `PASSER LE TOUR`, et une barre basse en pictos,
so that je lis tout à 2 mètres et je passe la main par un geste explicite, sans jamais toucher une carte par erreur (FR2, FR3, FR7, FR8, FR9, FR13, FR14, NFR10).

> **Cadrage (bmad-create-story, 2026-09-12).** Quatrième story visuelle de l'Epic 10 (10.6, 10.1, 10.2, 10.3 livrées) et **la plus grosse**, gardée entière par décision de Nathan (2026-09-11) : elle refond l'écran le plus regardé du produit. **Périmètre : `GameView` en `status === 'playing'` et ses composants** — `PlayerPanel`, `CenterPanel`, `ShotClock`, `ActionBar`, `ScoreEntryModal` → `ScoreEntryDock`. Crée `IconAction`. Reprend DT2 (markup unique de la barre basse). **Aucune règle de calcul de score ne change** : moyenne, meilleure série, `POUR n`, plafonnement à la distance, égalisatrice, undo et fin de partie gardent leurs attentes de test **à l'identique** — c'est la preuve de non-régression de la story. Deux mécaniques d'interaction changent : le passage de tour (tap sur la carte → CTA `PASSER LE TOUR`) et la forme de la saisie de série (pop-up centrée → pop-up latérale). Le **récap** garde son rendu actuel jusqu'à la Story 10.5. Exigences : AR20, AR23, AR25, UX-DR28, UX-DR45 à UX-DR52, DT2.

> **Décisions de Nathan à la création de la story (2026-09-12)** — elles priment sur les AC d'`epics.md` et la spec UX §10.3, à annoter en Task 10 :
> 1. **Références visuelles : un mix de `explore/resources/billiboard_scoreboard*.JPG` (toutes) et de `explore/resources/cueuny_scoreboard.png` — cette capture-là uniquement** pour Cueuny (ni `_2.JPG` ni `_3.JPG`). À prendre de **Billiboard** : la carte pleine couleur de bille, le bandeau haut `NOM` (avec son carré de bille) à gauche / distance à droite, `AVG`/`HR` en petit, le score géant, le liseré rouge de la carte active, la colonne centrale `REP` · chrono · **CTA de passage de tour à flèche circulaire** (`턴넘기기`), et la barre basse pleine largeur du côté de l'assis (`상대선수 득점 +1`). À prendre de **Cueuny** : le **restant** en gros sur le bord extérieur de la carte, le **bandeau bas de statistiques** (`HR` · `Avg` sur un aplat plus sombre que la carte) et l'**anneau de chrono qui déborde franchement sur les deux cartes**.
> 2. **Saisie de série en JDS : modèle 10.3, pas la lettre de la spec.** `ScoreEntryDock` est une **pop-up alignée sur le côté OPPOSÉ à la carte du joueur qui a la main** — cette carte reste entièrement visible et la valeur s'y écrit à vue — voile `bg-black/25` **sans flou**, fermeture au tap dehors sur geste complet, `ANNULER` à la place de la croix. Le « dock dans la colonne centrale recouvrant `REP`/`PASSER LE TOUR` + voile flouté sauf la carte active » d'UX-DR50 est **caduc**.
> 3. **Bandeau de carte : celui de la spec, sans picto de bille.** `NOM` en haut à gauche, `DISTANCE` en haut à droite, `RESTANT` sous le nom. En jeu, la couleur pleine de la carte suffit à dire la bille — l'en-tête `picto + BILLE BLANCHE/JAUNE` de la 10.3 reste au paramétrage.
> 4. **Chrono : premier jet AVEC débordement** sur les cartes (12 à 20 px, `z-index`, marge intérieure réservée). Nathan ajuste au rendu. Le « seulement si la colonne offre moins de 160 px » d'UX-DR48 n'est donc pas la règle de départ : on déborde, on montre, on ajuste.

> **Caduc pour toute l'epic (passe de rendu 10.1, Nathan) :** le **portrait**. Les AC d'`epics.md` qui parlent de libellés masqués, de pictos à 72 px et de 307 px de colonne **ne s'appliquent pas** — aucune variante `portrait:` à écrire, aucune passe portrait à faire. Formats visés : **1133×744**, **1194×834**, **1920×1080**, tous en paysage.

## Acceptance Criteria

**AC1 — Carte joueur en quatre zones.** `PlayerPanel` est un conteneur à contour, fond plein couleur de bille, découpé de haut en bas en : (1) un **bandeau** (≈ 22 % de la hauteur de la carte, fond `--color-panel-white-band` ou `--color-panel-yellow-band`) portant `NOM` en haut à gauche (gras, **deux lignes max** puis ellipse), `DISTANCE` en haut à droite (petit libellé + valeur) et `RESTANT` sous le nom (petit libellé + valeur) ; (2) le **score géant** centré ; (3) la ligne **`MOY` · `SÉRIE`** sous le score (18 à 22 px, point médian de séparation) ; (4) le **pied** `−` / zone de série / `+`. Seul le nom se tronque — **jamais** une valeur chiffrée.

**AC2 — `RESTANT`, tous modes.** `RESTANT = max(distance − score, 0)`, **permanent et dans tous les modes**, masqué quand le joueur n'a pas de distance (`targetScore === 0`). Champ **dérivé, calculé dans le panneau** (AR25) : aucun nouvel état, `GameState` inchangé. Sa cohabitation avec `POUR n` en 3 Bandes pendant les trois derniers points est **assumée**, ce n'est pas un bug.

**AC3 — Zone de série (pied de carte).** Entre `−` et `+`, un seul contenu à la fois, dans cet ordre de priorité : (a) la **valeur en cours de saisie** quand le dock est ouvert pour ce joueur (JDS), à la taille de `POUR n` et dans la couleur d'encre de la carte ; (b) **`POUR n`** (3 Bandes, 1 à 3 restants, inchangé Story 2.4) ; (c) la **série en cours** comptée par les `+1` (3 Bandes) ; (d) rien. `−` et `+` restent ≥ 90×90 px et corrigent le total sans toucher au déroulé de la partie (inchangé).

**AC4 — La carte n'est plus tapable.** Taper une carte n'importe où hors `−`/`+` ne produit **rien** : l'emit `pass-turn`, le handler `@pointerdown` de racine, la garde `if (props.active) return` et le `role="button"` englobant disparaissent de `PlayerPanel`, qui n'a plus que deux états, *repos* et *actif*. Le tour actif se lit au **liseré rouge épais** du conteneur (présence, pas teinte).

**AC5 — Colonne centrale réduite.** `CenterPanel` est un conteneur à contour sur `--color-surface`, réduit à trois éléments empilés : `REP` + compteur en haut, le **chrono** (3 Bandes seulement ; en JDS l'espace reste vide et `PASSER LE TOUR` remonte), et **`PASSER LE TOUR`** en bas (CTA neutre à contour fort, pleine largeur de colonne, ≥ 90 px de haut, libellé sur deux lignes si besoin). **`ANNULER` n'y est plus** (il descend en barre basse) et `ÉCHANGER` n'existe plus depuis la 10.3.

**AC6 — `PASSER LE TOUR` en JDS.** Le joueur actif n'ayant rien saisi, un appui enregistre une **série de 0** pour lui et fait passer la main. Règle d'alternance, numérotation des reprises, moyenne et détection de fin **inchangées** : seul le geste change.

**AC7 — `PASSER LE TOUR` en 3 Bandes.** Des `+1` ayant été comptés pour le joueur actif, un appui **clôture la série comptée** (aucun 0 ajouté par-dessus) et fait passer la main ; le chrono repart à 40 s avec ses 2 s de latence (Story 2.2).

**AC8 — Contrat de `PASSER LE TOUR`.** C'est une **action de la pile d'undo** (`ANNULER` la défait) ; l'action de store `passTurn()` est **réutilisée telle quelle** (AR23), jamais dupliquée. Le CTA est **toujours disponible** en partie, **masqué** sous la pop-up de saisie quand elle est ouverte, **inerte** pendant les pop-ups de fin, et respecte la grâce anti-tap-fantôme après toute fermeture de pop-up. Valider une série au pavé (`VALIDER`, auto-validation) **continue de basculer la main** sans passer par lui.

**AC9 — Saisie de série en JDS (`ScoreEntryDock`).** `+ POINTS ADVERSAIRE` en barre basse ouvre une **pop-up de saisie alignée sur le côté opposé à la carte du joueur qui a la main** : voile `bg-black/25` **sans flou**, carte de pop-up centrée dans la zone que la carte visée laisse libre, `NumericPad` nu, `ANNULER` et `VALIDER` en pied (`VALIDER` portant son compte à rebours de 3 s). La **carte du joueur actif reste entièrement visible et nette** ; la valeur tapée s'y affiche entre `−` et `+` (AC3a). La pop-up ne recouvre **jamais** cette carte.

**AC10 — Sémantiques de saisie conservées.** `VALIDER`, l'auto-validation à 3 s, `ANNULER` et le tap dehors (geste complet : appui **et** relâchement du même `pointerId`, `pointercancel` qui désarme) ont **exactement** les sémantiques de `ScoreEntryModal` (Story 1.5) : plafond `MAX_SCORE_DIGITS` avec haptique de refus et pulsation, flash d'accusé de frappe, `VALIDER` no-op sur buffer vide, fermeture qui tue le timer. `entryOpen` et `currentInput` restent portés par le store, persistés et restaurés (Story 1.12). `ScoreEntryModal.vue` et `ScoreEntryModal.test.ts` sont **supprimés**, leurs cas migrés vers `ScoreEntryDock.test.ts`. « Une seule saisie à la fois » reste entier.

**AC11 — 3 Bandes inchangé.** `+1 ADVERSAIRE` crédite un point à celui qui joue, avec haptique et relance du chrono, exactement comme `+1 POINT` aujourd'hui (Story 2.2) ; **aucun pavé ne s'ouvre** dans ce mode.

**AC12 — Barre basse.** Elle reste calée sur les colonnes des cartes et ses deux groupes **échangent de côté à chaque bascule de tour**. Du côté du **joueur assis** : le CTA de saisie, accent, large comme la carte (`+ POINTS ADVERSAIRE` en JDS, `+1 ADVERSAIRE` en 3 Bandes). Du côté opposé, **quatre `IconAction`** du bord **extérieur** vers l'intérieur : `QUITTER` (porte) · `PARAMÈTRES` (engrenage, **BIENTÔT**) · `RECOMMENCER` (flèche circulaire) · `ANNULER` (flèche retour courbe).

**AC13 — Comportements de la barre basse inchangés.** `QUITTER` ouvre « TERMINER LA PARTIE ? » ou ramène à l'accueil sans rien à récapituler (`canUndo` faux) ; `RECOMMENCER` ouvre « RECOMMENCER LA PARTIE ? » et est grisé sur un scoreboard intact ; `ANNULER` est l'undo multi-niveaux, grisé à pile vide ; `PARAMÈTRES` est affiché atténué et **inerte** (`disabled` **et** garde). Stories 1.7, 1.10, 1.15 : aucune de leurs attentes ne bouge.

**AC14 — Markup unique (DT2).** **Un seul markup** rend les deux côtés de la barre, l'ordre s'inversant par `flex-direction` — fin de la duplication CTA/SVG de `GameView.vue` et des marges négatives `-mx-4`/`ml-4`/`mr-4` qui calaient les colonnes sur le padding de la barre.

**AC15 — `IconAction`.** Composant picto + libellé, **≥ 90×90 px libellé compris**, fond `--color-surface`, contour, `--radius-cta`, séparés de 12 px, avec les états **normal / grisé / BIENTÔT**, testé isolément. Pictos en **SVG inline** ajoutés à `PictoIcon` (UX-DR28, trait 2 px, table §10.7 de la spec UX) — aucune ressource réseau.

**AC16 — Chrono débordant.** L'anneau du chrono **déborde** sur les cartes voisines de 12 à 20 px de chaque côté (`z-index` au-dessus des cartes ; les cartes réservent une marge intérieure sur ce bord pour que ni le score, ni le bandeau, ni la ligne `MOY · SÉRIE` ne passent dessous). Premier jet à ajuster avec Nathan au rendu (décision 4).

**AC17 — Tests et rendu.** `PlayerPanel`, `CenterPanel`, `ActionBar`, `IconAction`, `ScoreEntryDock`, `GameView`, `ShotClock` ont leurs tests à jour : **aucun test ne cible plus le tap de passage de tour, `ÉCHANGER`, ni un libellé texte devenu picto**. `useGameStore.test.ts` passe **sans retouche** (preuve qu'aucune règle n'a bougé). Le rendu est vérifié dans Chrome **en paysage** aux trois formats, en JDS et en 3 Bandes, pop-up de saisie ouverte et fermée, pendant une offre d'égalisatrice.

## Tasks / Subtasks

- [x] **Task 1 — Pictos et `IconAction`** (AC12, AC15)
  - [x] 1.1 Ajouter à `PictoName` et à la table `PATHS` de `PictoIcon.vue` : `door` (porte + flèche, `QUITTER`), `rotate-ccw` (flèche circulaire, `RECOMMENCER` — reprendre **exactement** les deux `path` du SVG inline actuel de `GameView.vue`), `undo` (flèche retour courbe), `pass-turn` (flèche passant au-dessus d'un rond). `gear` existe déjà (`PARAMÈTRES`).
  - [x] 1.2 Créer `IconAction.vue` + `IconAction.test.ts` : props `picto: PictoName`, `label: string`, `state?: ItemState`, `disabled?: boolean` ; emit `press`. `min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)]`, picto au-dessus du libellé (`text-picto`), fond `bg-surface`, `border-border`, `rounded-cta`. État `soon` → badge/atténuation + `disabled` **et** garde dans le handler ; état grisé → `disabled:opacity-30` + garde.
  - [x] 1.3 Tests : rendu du picto demandé, libellé, emit au `pointerdown`, **pas** d'emit quand `disabled`, **pas** d'emit en `soon`, présence des classes de gabarit.

- [x] **Task 2 — `PlayerPanel` réorganisé** (AC1, AC2, AC3, AC4, AC16)
  - [x] 2.1 Retirer l'emit `pass-turn`, la fonction `tap()`, le `@pointerdown` et le `role="button"` de la racine. Ne **pas** toucher aux `@pointerdown.stop` de `−`/`+` (le `.stop` devient inutile mais inoffensif — le retirer et vérifier qu'aucun test ne l'observe).
  - [x] 2.2 Bandeau : `NOM` (gras, `line-clamp-2`, ellipse), `DISTANCE` à droite (masquée si `targetScore === 0`, règle NFR12 inchangée), `RESTANT` sous le nom — `computed` local `max(targetScore − score, 0)`, masqué sans distance.
  - [x] 2.3 Score géant : garder la table littérale `SCORE_SIZE_CLASSES` et la logique par nombre de chiffres ; **réajuster les paliers** (le bandeau et la ligne `MOY · SÉRIE` reprennent ≈ 10 % de hauteur — baisser les bornes `vh`, pas la logique).
  - [x] 2.4 Ligne `MOY · SÉRIE` sous le score (elles quittent le bandeau du haut) ; `displayedAverage` à 3 décimales inchangé.
  - [x] 2.5 Pied : nouvelle prop `seriesValue?: number | null` (série ouverte 3 Bandes) et `entryValue?: string | null` (valeur en cours de saisie, JDS). Implémenter la priorité d'AC3 dans **un seul** `computed` du pied.
  - [x] 2.6 Marge intérieure réservée sur le bord **intérieur** de chaque carte pour le débordement de l'anneau (AC16).
  - [x] 2.7 Tests : réécrire `PlayerPanel.test.ts` — supprimer les cas de tap (l. 187-219), ajouter bandeau/`RESTANT`/`MOY · SÉRIE`/zone de série et sa priorité. Conserver tous les cas de `POUR n` (l. 221-260) et de correction `−`/`+`.

- [x] **Task 3 — `CenterPanel` et `PASSER LE TOUR`** (AC5, AC8, AC16)
  - [x] 3.1 Retirer le bouton `ANNULER` et l'emit `undo` ; ajouter le CTA `PASSER LE TOUR` (picto `pass-turn` + libellé, CTA neutre `--gradient-neutral` à contour `--color-border-strong`, pleine largeur, ≥ 90 px) et l'emit `pass-turn`. Nouvelles props : `passTurnDisabled?: boolean` (pop-up de fin ouverte), `entryOpen?: boolean` (masque le CTA).
  - [x] 3.2 Conteneur à contour sur `--color-surface` (aujourd'hui `bg-bg` nu).
  - [x] 3.3 Débordement de l'anneau : `ShotClock` autorisé à dépasser la colonne (largeur > 100 %, `z-index`, `overflow-visible` sur la colonne — vérifier qu'aucun parent ne porte `overflow-hidden`).
  - [x] 3.4 Tests : `CenterPanel.test.ts` — remplacer les cas `undo` (l. 44-62) par les cas `pass-turn` ; garder les cas `REP` et chrono.

- [x] **Task 4 — `ScoreEntryDock`** (AC9, AC10)
  - [x] 4.1 Créer `ScoreEntryDock.vue` : **coquille** de `NumericPadDock` (voile `bg-black/25` sans flou, `ALIGN_CLASSES` par `align: TableSide`, carte `rounded-modal` + contour + ombre, `armBackdropClose`/`closeFromBackdrop`/`disarmBackdropClose`, pied `ANNULER` / `VALIDER` au `rounded-key`) et **logique** de `ScoreEntryModal` (plafond `MAX_SCORE_DIGITS` + `reject()` + pulsation, `flashKey`, `watch(currentInput)` → timer `AUTO_VALIDATE_DELAY_MS = 3000`, `onBeforeUnmount(cancelAutoValidate)`, garde `VALIDER` sur buffer vide, compte à rebours visuel sur `VALIDER` avec `animationDuration` lié à la constante).
  - [x] 4.2 Props `currentInput: string`, `align: TableSide` ; emits `digit`, `clear`, `backspace`, `validate`, `cancel` — **identiques** à `ScoreEntryModal` pour que `GameView` ne change pas de branchement. **Pas** de prop `color`/`name` : la carte visée est visible, la pop-up ne rappelle plus la valeur ni la bille (modèle 10.3).
  - [x] 4.3 Ajouter à `main.css` les tokens de géométrie du **scoreboard** : `--game-popup-inset-left` / `--game-popup-inset-right`, calés sur les colonnes 2/5 · 1/5 · 2/5 **sans barre latérale** (le scoreboard n'en a pas). Ne **pas** réutiliser `--setup-popup-inset-*`, qui encode la géométrie de l'étape `players` (sidebar 120 px, colonne à 1/4).
  - [x] 4.4 Supprimer `ScoreEntryModal.vue` et `ScoreEntryModal.test.ts` ; migrer les 295 lignes de cas vers `ScoreEntryDock.test.ts` (plafond, flash, auto-validation avec `vi.useFakeTimers`, voile armé/désarmé, `VALIDER` à vide) et **ajouter** les cas propres à l'alignement (`align="left"`/`"right"` → classes d'inset attendues).

- [x] **Task 5 — `ActionBar` reconstruite** (AC12, AC13, AC14, AC15)
  - [x] 5.1 Réécrire `ActionBar.vue` en **barre basse de scoreboard** : props `ctaSide: TableSide`, `ctaLabel: string`, `ctaTestId: string`, `canUndo: boolean`, `canRestart: boolean` ; emits `cta`, `quit`, `restart`, `undo`. **Un seul markup**, l'ordre des deux groupes venant de `flex-row` / `flex-row-reverse` selon `ctaSide` (table `Record<TableSide, string>` littérale — jamais de classe construite).
  - [x] 5.2 Groupe CTA : bouton accent large comme la carte (2/5), `data-testid` = `ctaTestId`, `data-side` conservé (les tests le lisent). Groupe pictos : quatre `IconAction` dans l'ordre `QUITTER` · `PARAMÈTRES` (`soon`) · `RECOMMENCER` (`disabled: !canRestart`) · `ANNULER` (`disabled: !canUndo`), **du bord extérieur vers l'intérieur** — donc l'ordre du tableau s'inverse avec le groupe.
  - [x] 5.3 Conserver les `data-testid` existants : `action-bar`, `add-points-button`, `plus-one-button`, `exit-button`, `restart-button`, `undo-button`, et l'attribut `data-side` sur le CTA, `exit-button` et `restart-button`. Ajouter `settings-button`. **Ne pas renommer** : `GameView.test.ts` s'appuie dessus sur plusieurs dizaines de cas.
  - [x] 5.4 Réécrire `ActionBar.test.ts` (les cinq cas actuels portent sur `back-button`/slot, tous caducs) : ordre des pictos par côté, inversion à la bascule, états grisés, `soon` inerte, emits.
  - [x] 5.5 Barre du **récap** : `ActionBar` ne la sert plus. Rendre les deux boutons `FIN DE PARTIE` / `UNE PARTIE DE PLUS` **en `<nav>` inline dans `GameView`**, classes et `data-testid` (`end-game-button`, `rematch-button`) **inchangés**, avec un commentaire « provisoire, supprimé par la Story 10.5 ».

- [x] **Task 6 — `GameView` recâblée** (AC3, AC8, AC9, AC12, AC14)
  - [x] 6.1 Retirer `PICTO_BUTTON_CLASSES` et les deux colonnes dupliquées ; monter `<ActionBar>` avec ses props.
  - [x] 6.2 Changer les libellés du CTA : `ctaLabel` passe de `AJOUTER LES POINTS` à **`+ POINTS ADVERSAIRE`** (JDS) et de `+1 POINT` à **`+1 ADVERSAIRE`** (3 Bandes) — c'est l'assis qui compte pour celui qui joue, le libellé doit le dire. Les `data-testid` (`add-points-button`, `plus-one-button`) **ne changent pas**.
  - [x] 6.3 Brancher `pass-turn` de `CenterPanel` sur `passTurn()` (fonction existante, garde `panelsAcceptInput()` conservée) ; retirer le `@pass-turn` des deux `PlayerPanel`.
  - [x] 6.4 Alimenter les panneaux : `entryValue` = `entryOpen && activePlayer === <id de ce panneau> ? currentInput[activePlayer] : null` ; `seriesValue` = série ouverte du joueur (voir Task 7) ; `showRemaining` (`POUR n`) inchangé.
  - [x] 6.5 `align` de `ScoreEntryDock` = **côté opposé** à la carte du joueur actif : `activePlayer === leftId ? 'right' : 'left'`. Le faire dériver de `leftId`/`rightId`, jamais de `whiteSide` directement.
  - [x] 6.6 Étendre la grâce anti-tap-fantôme : `panelsAcceptInput()` garde déjà `passTurn`, `adjustScore` et `undoLastAction` — vérifier qu'elle couvre **aussi** le nouveau CTA `PASSER LE TOUR` (même chemin) et laisser `QUITTER`/`RECOMMENCER` tels quels (ils ouvrent une confirmation, rien de destructif au contact).

- [x] **Task 7 — Série ouverte exposée par le store** (AC3)
  - [x] 7.1 Ajouter un getter **dérivé** `openSeries` (`computed` `{ player1, player2 }` bâti sur la fonction privée `openSeriesValue` existante), exposé dans le `return` — même famille que `averages`, `bestSeries`, `repriseCounts`. **Aucun nouvel état, aucune persistance, `GameState` inchangé**, donc `GAME_STORAGE_VERSION` ne bouge pas.
  - [x] 7.2 Deux ou trois cas dans `useGameStore.test.ts` (**ajouts uniquement** — ne retoucher aucun cas existant) : série ouverte après un `+1`, `null` en JDS après validation, `null` pour le joueur qui n'a pas la main.

- [x] **Task 8 — Suite de tests verte** (AC17)
  - [x] 8.1 `GameView.test.ts` : convertir les cas de tap de passage (l. 439-460) en appui sur `PASSER LE TOUR` ; remplacer `modal-backdrop` par le testid du dock ; vérifier que les cas `data-side` de bascule (l. 317-324, 345-376, 559-593) passent sans changement de sémantique.
  - [x] 8.2 `npm test` (aucun cas de `useGameStore.test.ts` modifié hors ajouts de la Task 7.2), `npx vue-tsc --noEmit`, `npm run build`.

- [x] **Task 9 — Passe de validation visuelle** (AC1 à AC17) — **une seule**, en fin de story, CLAUDE.md §9
  - [x] 9.1 `npm run dev` + harnais `1score/public/_viewport-harness.html` (supprimé en fin de passe), formats **1133×744**, **1194×834**, **1920×1080**, **paysage uniquement**.
  - [x] 9.2 Parcours et mesures : voir « Validation visuelle » en Dev Notes.

- [x] **Task 10 — Documentation des écarts**
  - [x] 10.1 Annoter `epics.md` (Story 10.4, UX-DR48, UX-DR50, UX-DR51), `ux-design-specification.md` §10.3 « Scoreboard » et §10.6, et `architecture.md` (composants nouveaux) avec les décisions 1 à 4 et les écarts constatés à la livraison.
  - [x] 10.2 `deferred-work.md` : clore DT2 ; consigner les tokens `--game-popup-inset-*` (même dette de géométrie dupliquée que `--setup-popup-inset-*`) ; rappeler que `NumericPad` et le style des pop-ups restent à aligner en 10.7.
  - [x] 10.3 `CLAUDE.md` : rien à ajouter si aucune convention nouvelle n'apparaît — la mise à jour §7 (exceptions aux angles vifs) est déjà prévue en 10.7.

## Dev Notes

### État du code à l'arrivée (commit `686f50a`, arbre propre, 610 tests verts)

- **`GameView.vue` (519 l.)** — trois branches par `status` : `idle` (`HomeScreen` + pop-up de restauration), `playing` (deux `PlayerPanel` + `CenterPanel` + `ActionBar` + `ScoreEntryModal` + quatre `PromptModal`), `finished` (`GameSummary` + `ActionBar`). **Tout ce qui est refondu est dans la branche `playing`** ; `idle` et `finished` ne bougent pas (hors Task 5.5).
- **La résolution des côtés est déjà faite et correcte** (10.3) : `leftId`/`rightId`/`leftPlayer`/`rightPlayer` sont résolus **une seule fois** en tête de vue, et l'ordre des panneaux comme la colonne du CTA en dérivent. **Ne pas la refaire, ne pas la contourner** : `player1` est la bille **blanche**, pas le joueur de gauche.
- **`entrySide`** (`activePlayer === 'player1' ? 'player2' : 'player1'`) donne l'**identifiant** du joueur assis, comparé à `leftId`/`rightId` pour choisir la colonne. L'`align` du dock est le problème **inverse** (côté de la carte **active**) : le dériver explicitement, ne pas réutiliser `entrySide` sans réfléchir — les deux coïncident en pratique mais disent des choses différentes.
- **`PlayerPanel.vue` (185 l.)** — `@container` sur la racine, seuil `@min-[420px]` pour la densité des statistiques : le bandeau du haut réunit aujourd'hui nom, `MOY`, `SÉRIE` et distance sur **une seule ligne**. La refonte éclate cette ligne en trois zones ; le `@container` reste utile pour le bandeau (un nom long à 1133×744).
- **`CenterPanel.vue` (54 l.)** — `w-1/5`, `bg-bg`, `REP` + `text-reprise`, `ShotClock` conditionnel, bouton `ANNULER`. `ÉCHANGER` en est déjà sorti (10.3) ; `undo` est son seul emit.
- **`ActionBar.vue` (30 l.)** — coquille générique `showBack` + slot `actions`, survivante de l'avant-Epic 10. Depuis la 10.3, **seule `GameView` l'utilise** (scoreboard et récap) ; `HomeScreen` ne l'importe plus. Elle est donc libre d'être réécrite en barre de scoreboard.
- **`ScoreEntryModal.vue` (225 l.)** — pop-up centrée, voile `bg-black/60 backdrop-blur-md`, croix, rappel bille + nom, valeur en grand, `NumericPad`, `VALIDER` + compte à rebours. **C'est la mine de la story** : plafond, flash, refus, timer, voile armé. Reprendre ces règles **telles quelles**, ne rien réinventer.
- **`NumericPadDock.vue` (161 l.)** — la coquille de pop-up latérale validée en 10.3 : `ALIGN_CLASSES`, voile `bg-black/25` **sans flou**, `pointerId` mémorisé, `ANNULER`/`VALIDER` au `rounded-key`. **C'est le gabarit de `ScoreEntryDock`.** Attention : son plafond dérive de `MAX_TARGET_SCORE` (distance) — celui du scoreboard est `MAX_SCORE_DIGITS` (série, FR7). Deux constantes, deux rôles, toutes deux exportées par le store.
- **`PictoIcon.vue`** — dix pictos, tracés Lucide, `viewBox` 24, trait 2 px, taille posée par le parent, couleur `currentColor`. `gear` et `close` existent ; `refresh` est la **boucle double** de `CHANGER DE BILLE`, **ce n'est pas** la flèche circulaire de `RECOMMENCER` — ajouter `rotate-ccw` à part.
- **`useGameStore.ts` (741 l.)** — `passTurn()`, `incrementSeries()`, `validateScoreInput()`, `undoLastAction()`, `openScoreEntry()`/`closeScoreEntry()`, `MAX_TARGET_SCORE`, `MAX_SCORE_DIGITS` exportés. `openSeriesValue()` est **privée** : c'est le seul ajout d'API de la story.

### Décisions de rendu de l'epic, valables ici (passe 10.1 + passes 10.2/10.3)

Paysage uniquement · **angles vifs** (`--radius-container`/`--radius-cta` à 0), avec deux exceptions déjà tokenisées : `--radius-modal` (12 px, carte de pop-up) et `--radius-key` (8 px, touches et CTA de pied de pop-up) · palette **bleus / noir-gris / rouge**, **un seul bleu** `--gradient-blue` pour tout CTA bleu, **jamais `bg-accent`** (l'ancien `#1E88E5` jure à côté des pop-ups) · `--gradient-neutral` **opaque** (gris plein, sans contour clair) pour les CTA secondaires · `--gradient-red` pour l'action qui engage · retour visuel à l'appui sur tout élément tapable · aucune animation d'ambiance.

**Conséquence directe sur cette story** : le CTA de saisie de la barre basse (`bg-accent` aujourd'hui) passe à `--gradient-blue` ; le `VALIDER` du dock aussi ; `PASSER LE TOUR` prend `--gradient-neutral` + contour `--color-border-strong`.

**Tokens déjà en place pour la 10.4**, à utiliser tels quels : `--color-panel-white-band` `#ECECEC` et `--color-panel-yellow-band` `#E6CA00` (posés en 10.1, jamais employés). ⚠️ **`--color-panel-yellow-band` a été calculé pour l'ancien jaune `#FFC72C`** ; le jaune a changé trois fois depuis et vaut `#FFE000` (6e passe de la 10.3). Vérifier au rendu que le bandeau se distingue encore de la carte et, si besoin, redescendre la valeur — c'est un ajustement de token, pas un débat.

### Carte joueur — ce que disent les références

De **Billiboard** (`billiboard_scoreboard*.JPG`) : carte pleine couleur, bandeau haut discret avec le nom à gauche et la distance à droite, `AVG`/`HR` en très petit, score géant qui occupe tout le reste, **liseré rouge sur la carte du joueur actif**, `−`/`+` en filigrane dans le pied. De **Cueuny** (`cueuny_scoreboard.png`, cette capture seule) : le **restant** en gros sur le bord extérieur de la carte (`남은 점수` = points restants), et surtout le **bandeau bas de statistiques** (`HR` · `Avg` sur un aplat plus sombre que la carte). La spec place `MOY · SÉRIE` **sous le score** : c'est cette version qui fait foi, la référence Cueuny ne sert qu'à la manière de les poser (aplat légèrement contrasté, libellé petit + valeur grasse).

Hiérarchie à tenir, dans l'ordre de lecture à 2 mètres : **score** ≫ `RESTANT` > `NOM` > `DISTANCE` > `MOY`/`SÉRIE`. Le score reste le plus gros élément de l'écran, sans exception.

### `PASSER LE TOUR` — ce qui change et ce qui ne change pas

`passTurn()` est **déjà** la bonne action, écrite en Story 1.7 et complétée en 2.2 : elle empile un snapshot, enregistre une série de 0 **seulement si aucune série n'est ouverte** (`openSeriesValue(playerId) === null`), bascule le tour et vérifie la fin de partie. Les deux comportements d'AC6 et AC7 en découlent **sans une ligne de store nouvelle**. La story ne change donc que **le geste qui l'appelle** — c'est exactement ce qu'exige AR23 (« remplacée, pas dupliquée »).

Le chrono est relancé par la **vue** (`resetTimer()` dans `passTurn()` de `GameView`), pas par le store : ce branchement existe déjà et ne bouge pas.

`PASSER LE TOUR` est **symétrique** au sens d'UX-DR11 : il rend la main quel que soit le joueur actif, il ne favorise personne. C'est ce qui l'autorise dans la colonne centrale, contrairement à une saisie de score.

### `ScoreEntryDock` — le contrat exact

| Point | `ScoreEntryModal` (aujourd'hui) | `ScoreEntryDock` (cible) |
|---|---|---|
| Position | centrée | **alignée côté opposé à la carte active** |
| Voile | `bg-black/60` + `backdrop-blur-md` | `bg-black/25`, **sans flou** |
| Fermeture au voile | geste complet → `cancel` | **identique** |
| En-tête | croix + bille + nom | **supprimé** (la carte est visible) |
| Valeur en cours | en grand dans la pop-up | **sur la carte**, entre `−` et `+` |
| Plafond | `MAX_SCORE_DIGITS` + refus | **identique** |
| Flash / pulsation | oui | **identique** |
| Auto-validation | 3 s, relancée à chaque frappe | **identique** |
| Pied | `VALIDER` seul | `ANNULER` + `VALIDER` (modèle 10.3) |
| Buffer | store (`currentInput`) | **store, inchangé** |

⚠️ **Le buffer reste dans le store ici**, contrairement au paramétrage où il vit dans l'écran : `currentInput` est persisté et restauré par la Story 1.12 (avec `entryOpen`), c'est une exigence, pas un choix de style. Ne pas « harmoniser » avec la 10.3 sur ce point.

⚠️ **Le flash d'accusé de frappe suivait la valeur affichée dans la pop-up.** La valeur ayant déménagé sur la carte, décider où le flash se joue : soit sur la zone de série de la carte (cohérent avec UX-DR17, « l'accusé est là où la valeur change »), soit conservé dans la pop-up sur une zone devenue vide (absurde). **Retenir la carte** — ce qui veut dire que `PlayerPanel` porte la clé d'animation, alimentée par un compteur passé en prop, ou plus simplement que la zone de série se recrée par sa `key` quand `entryValue` change.

### Barre basse — le markup unique (DT2)

Aujourd'hui : deux blocs `<div class="w-2/5">` symétriques, chacun contenant soit le CTA, soit `<template v-else>` avec deux `<button>` + SVG inline **recopiés**, et des marges négatives (`-mx-4`, `ml-4`, `mr-4`) qui annulent le `px-4` d'`ActionBar` pour caler les colonnes sur les panneaux. Quatre pictos au lieu de deux **doubleraient** la dette.

Cible : **une** rangée, **un** CTA, **une** liste de quatre `IconAction` rendue par `v-for`, l'ordre visuel venant de `flex-row` / `flex-row-reverse` sur la rangée. La colonne centrale reste un espaceur `w-1/5 shrink-0`. Supprimer les marges négatives en alignant le padding de la barre sur celui de la zone de jeu plutôt qu'en le compensant.

⚠️ **`v-for` sur les `IconAction` + `flex-row-reverse`** : l'ordre du DOM ne suit plus l'ordre visuel. Les tests qui vérifient « `QUITTER` au bord extérieur » doivent lire la **classe de direction** de la rangée, pas l'index dans le DOM. Écrire le test dans ce sens dès le départ.

### Chrono débordant (décision 4)

`ShotClock` se dimensionne déjà en unités de conteneur (`min(100cqw, 100cqh)`) dans une racine `[container-type:size]` qui prend la place restante de la colonne. Pour déborder : élargir la **racine du chrono** au-delà de la colonne (par ex. largeur `calc(100% + 2 * 16px)` centrée par une marge négative symétrique), poser `z-10`, et vérifier qu'aucun ancêtre ne porte `overflow-hidden` — `PlayerPanel` en a un sur sa racine, mais c'est la **colonne centrale** qui doit laisser sortir, pas les cartes. Les cartes réservent en contrepartie une marge intérieure (`pr-*` / `pl-*` sur le bord intérieur) pour que le score ne passe pas dessous.

Mesurer au navigateur : à 1133×744 la colonne fait ≈ 195 px après padding — l'anneau est donc déjà proche du seuil de 160 px, et le débordement est surtout un effet de style. À 1920×1080 il est confortable : c'est là que l'effet Cueuny se voit le mieux. **Montrer les trois formats à Nathan avec et sans**, il tranche.

### Pièges

- **`role="button"` retiré ≠ CSS tactile perdu.** `touch-action: manipulation` et `user-select: none` du CSS global ciblent `button, [role="button"]`. En retirant le rôle de la racine de `PlayerPanel`, garder `touch-manipulation select-none` en classes Tailwind sur la carte (elles y sont déjà) — sinon un appui long sur le score sélectionne le texte.
- **Ne pas supprimer `panelsAcceptInput()`.** La grâce anti-tap-fantôme reste nécessaire : après l'auto-validation, le doigt retombe désormais sur `PASSER LE TOUR` (colonne centrale, sous la pop-up qui vient de se fermer) ou sur `ANNULER` en barre basse — **deux actions destructives à portée immédiate**, exactement le cas qui a motivé la garde en 1.7.
- **La pop-up s'ouvre du côté du doigt qui vient d'appuyer.** Le CTA de saisie est du côté de l'**assis**, c'est-à-dire du côté **opposé à l'actif** — donc là où la pop-up se pose. Le voile ne ferme que sur un geste **complet** (le `pointerup` du CTA retombe sur un voile non armé : rien ne se passe, mécanique déjà écrite), mais une touche du pavé se retrouve sous le doigt à l'ouverture. Le vérifier au navigateur : un appui maintenu puis relâché sur `+ POINTS ADVERSAIRE` ne doit **jamais** composer un chiffre.
- **La largeur minimale de 220 px du dock (UX-DR50) est sans objet** dans le modèle latéral : la pop-up dispose des 3/5 de la largeur libérés par la carte visée, soit ≥ 600 px à 1133 px de large. Ne pas recopier cette contrainte.
- **`ScoreEntryDock` ne doit jamais recouvrir la carte active.** C'est la raison d'être de la décision 2 : le mesurer au navigateur (`getBoundingClientRect()` de la pop-up vs celui de la carte), pas le supposer. Les insets sont des `calc()` sur `100vw` — une erreur de 40 px ne se voit pas en test.
- **`scrollWidth`/`scrollHeight` ne voient rien sous `overflow-hidden`** (piège payé en 10.2 et 10.3) : comparer les `getBoundingClientRect()` des enfants à ceux du parent.
- **Aucun commentaire HTML à la racine d'un gabarit** : il en ferait un fragment, et la racine perdrait `classes()`/`attributes()` et son `data-testid` (piège payé en 10.1 sur `ModeTile`, rappelé en 10.3).
- **Aucune classe construite à la volée** (`bg-(image:--gradient-${x})`) : le scanner JIT de Tailwind 4 ne voit que les classes écrites en toutes lettres — tables `Record<...>` littérales, comme partout.
- **`--spacing` vaut 8 px** : `gap-2` = 16 px, `p-4` = 32 px, `h-16` = 128 px. Les 12 px de séparation entre `IconAction` (UX-DR52) ne sont donc **pas** `gap-3` (= 24 px) : écrire `gap-[12px]` ou accepter 16 px et le dire.
- **`disabled` **et** garde**, les deux, pour `PARAMÈTRES` (BIENTÔT), `RECOMMENCER` grisé et `ANNULER` grisé : les navigateurs ne s'accordent pas sur l'envoi des pointer events aux contrôles désactivés (Chromium a changé en 2023). `disabled` porte le visuel, la garde porte le comportement.
- **Sélecteur à préfixe** : `[data-testid^="icon-action-"]` attraperait d'éventuels enfants — préférer les testids exacts (piège payé en 10.1 sur `SideBar`).
- **Le récap n'est pas dans le périmètre** : ses deux boutons doivent continuer à passer leurs tests (`end-game-button`, `rematch-button`) après le déménagement de la Task 5.5. C'est la seule raison pour laquelle ce déménagement est dans la story.
- **Deux paires de constantes de plafond** : `MAX_SCORE_DIGITS` (série, 3 chiffres, FR7) pour le dock du scoreboard, `MAX_TARGET_SCORE` (distance, 999) pour celui du paramétrage. Les confondre plafonnerait les séries à 999 ou les distances à 3 chiffres par accident.
- **`POUR n` et `RESTANT` disent la même chose** pendant trois points en 3 Bandes. C'est écrit dans les AC, testé, et **voulu** : ne pas « corriger » en masquant l'un des deux.

### Tests

- Vitest + Vue Test Utils + happy-dom : **aucun CSS n'est calculé**. Les tests vérifient classes, attributs, emits et comportements ; tailles, débordements, chevauchements et lisibilité relèvent de la passe navigateur — c'est pour ça qu'elle est obligatoire.
- Déclenchement en `trigger('pointerdown')`, jamais `click` (AR8). Cycle rouge-vert par composant, **pas de navigateur pendant l'implémentation** (CLAUDE.md §9).
- Timers : `vi.useFakeTimers()` pour l'auto-validation (motif déjà écrit dans `ScoreEntryModal.test.ts`, à migrer tel quel).
- **`useGameStore.test.ts` (2194 l.) doit passer sans une seule retouche**, hors les 2-3 cas ajoutés en Task 7.2. Si un cas casse, c'est qu'une règle a bougé — chercher la régression, ne pas adapter le test.
- **`GameView.test.ts` (1715 l.)** — points de contact connus : l. 36-134 (ordre des panneaux, couleurs, côtés), l. 76-78 et 317-324 et 559-593 (`data-side` du CTA à la bascule), l. 345-376 (`data-side` de `exit-button`/`restart-button`), l. 171-262 et 419-434 et 622-633 (saisie : `add-points-button`, `entry-confirm-button`, `modal-backdrop`), **l. 439-460 (tap de passage de tour → à convertir en `PASSER LE TOUR`)**, l. 519-541 (`undo-button`), l. 1356-1371 (helper de parcours, `confirm-button`).
- **`PlayerPanel.test.ts`** : supprimer les cas l. 187-219 (`emits pass-turn`, `stays inert`, `declares the tappable panel as a button`, `never binds a click handler` — ce dernier peut survivre, réécrit sur la racine non tapable). Réécrire les cas l. 99-130 (statistiques dans le bandeau) : elles descendent sous le score.
- **`CenterPanel.test.ts`** : cas l. 44-62 (`undo`) → `pass-turn` ; cas `REP` et chrono conservés.
- **`ActionBar.test.ts`** : les cinq cas actuels disparaissent avec `showBack`/slot.
- **`ShotClock.test.ts`** : ne doit pas bouger — le débordement est porté par la colonne, pas par le composant. Si un test casse, le débordement a été mis au mauvais endroit.

### Validation visuelle (fin de story, une seule passe)

- `npm run dev` — **pas `npm run preview`** : derrière le service worker, `navigateFallback` renvoie `index.html` pour toute navigation et le harnais n'est jamais chargé (piège payé en 10.2).
- `resize_window` ne redimensionne pas le viewport : harnais temporaire `1score/public/_viewport-harness.html` chargeant l'app dans une `<iframe>` dimensionnée par `?w=&h=`, **supprimé en fin de passe**. Formats **paysage** : 1133×744, 1194×834, 1920×1080. Demander à Nathan quel Chrome utiliser (« Browser 1 (macOS) » les dernières fois).
- **À mesurer, par format** : score géant non tronqué à 1, 2 et 3 chiffres ; bandeau à ≈ 22 % de la carte ; nom de 20 lettres larges sur deux lignes puis ellipse, **distance et restant jamais rognés** ; `MOY · SÉRIE` lisible sans écraser le score ; `−`/`+` ≥ 90×90 ; `PASSER LE TOUR` ≥ 90 px de haut et son libellé entier ; les quatre `IconAction` ≥ 90×90 libellé compris, aucun libellé tronqué ; **la pop-up de saisie ne touche jamais la carte active** (`getBoundingClientRect()` comparés) ; débordement de l'anneau mesuré à 12-20 px sans rien masquer ; aucun défilement, aucun débordement.
- **Parcours JDS** : accueil → `JEUX DE SÉRIES` → `LIBRE` → deux joueurs avec distances → `DÉMARRER` ; `PASSER LE TOUR` (série de 0 enregistrée, main passée) ; `+ POINTS ADVERSAIRE` → pop-up latérale, valeur qui s'écrit **sur la carte** entre `−` et `+`, `VALIDER` ; auto-validation à 3 s sans toucher à rien ; `ANNULER` (undo) plusieurs fois jusqu'au grisé ; `RECOMMENCER` → pop-up → scoreboard neuf, `ANNULER` grisé ; `QUITTER` → « TERMINER LA PARTIE ? » → récap (rendu actuel, normal) ; **démarrer blanc à droite** et vérifier que le CTA de saisie est bien du côté de l'**assis** et la pop-up du côté opposé à l'**actif**.
- **Parcours 3 Bandes** : `+1 ADVERSAIRE` ×3 (série en cours visible dans le pied de la carte, chrono relancé) ; `PASSER LE TOUR` (série clôturée, **aucun 0 ajouté**, chrono à 40) ; approche de la distance → `POUR 3` / `POUR 2` / `POUR 1` **et** `RESTANT` cohérents ; anneau du chrono débordant.
- **Fin de partie** : offre d'égalisatrice → vérifier que `PASSER LE TOUR` est **inerte** sous la pop-up et que le voile de fin reste **inerte** (AC18 de la 1.10) ; « PARTIE TERMINÉE ».
- **Reprise** : recharger en pleine saisie → la pop-up se rouvre avec le buffer (`entryOpen` + `currentInput`, Story 1.12), du bon côté.

### Intelligence de la story précédente (10.3, `686f50a`)

- **Le plan ne survit pas au premier rendu.** La 10.3 a livré ses AC puis enchaîné **six** passes de rendu avec Nathan — dont un refus complet en 2e passe (« archi moche ») qui a fait tomber toute la mise en page de hauteur de la 1re. Prévoir le même temps ici : livrer les AC, **montrer**, corriger. Ne pas retourner chercher dans `epics.md` ou la spec des valeurs déjà caduques (voiles floutés, rayons, portrait, `bg-accent`, dock central) : les documents sont annotés, les décisions 1 à 4 priment.
- **Ce qu'il faut montrer à Nathan en priorité** : la **carte joueur à 1133×744** (c'est là que la hiérarchie à quatre zones est la plus tendue : bandeau + score + stats + pied dans 744 px de haut moins la barre basse) et la **pop-up de saisie latérale sur le scoreboard** (la géométrie n'est pas celle du paramétrage : pas de sidebar, colonnes 2/5 · 1/5 · 2/5).
- **Deux défauts de la 10.3 étaient invisibles en test** (happy-dom ne calcule aucun CSS) : une pastille blanche sur fond blanc, et un médaillon plus haut que sa carte. Le pendant ici : un score géant qui déborde sous le bandeau, un libellé d'`IconAction` tronqué, une pop-up qui mord sur la carte active. **Mesurer, ne pas regarder.**
- **Revue de code groupée** : l'Epic 10 laisse chaque story en `review` sans relecture, revues et correctifs passés ensemble en fin d'epic (décision de Nathan, 2026-09-11). **Ne pas proposer `bmad-code-review` à la livraison** ; passer la story en `review` dans `sprint-status.yaml` et enchaîner.
- **Reporté, à ne pas traiter ici** (`deferred-work.md`) : sémantique de dialogue et garde `prefers-reduced-motion` des pop-ups (DT3), passe contraste AA, alignement complet du style des pop-ups, plafonds de `clamp()` trop bas pour le 21,5″, effet d'appui peu visible au doigt → **Story 10.7**. En revanche, le `role="button"` englobant de `PlayerPanel` (dette de la revue 1.5) est **clos ici**, de fait, par AC4.

### Project Structure Notes

- Composants à plat dans `src/components/`, tests co-localisés (AR16), named exports hors SFC. **Deux fichiers nouveaux** (`IconAction.vue`, `ScoreEntryDock.vue`) et **un supprimé** (`ScoreEntryModal.vue`), chacun avec son test.
- `types/ui.ts` accueille les nouveaux `PictoName` (`door`, `rotate-ccw`, `undo`, `pass-turn`) ; `ItemState` (`normal` | `soon`) sert `IconAction` sans changement. `types/game.ts` **ne bouge pas** : aucun état nouveau, `GameState` et `GameSnapshot` inchangés, `GAME_STORAGE_VERSION` reste à 2.
- `main.css` gagne `--game-popup-inset-left` / `--game-popup-inset-right` dans le bloc `@theme static`, à côté des `--setup-popup-inset-*`, avec le même avertissement « à faire bouger avec la mise en page ».
- `architecture.md` : consigner `IconAction` et `ScoreEntryDock` avec les autres composants de l'epic, et le getter dérivé `openSeries` du store.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.4] — AC d'origine et note de périmètre ; [#Epic 10] — décisions de la passe de rendu 10.1, valables pour toute l'epic ; [#Requirements Inventory] — AR20, AR23, AR25, UX-DR28, UX-DR45 à UX-DR52, DT2, DT7
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.3 Scoreboard, #10.4, #10.5, #10.6, #10.7] — quatre zones de la carte, colonne centrale, dock, barre basse, composants, règles conservées, table des pictos
- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation & Shell (Epic 10, V1.1)] — `ActionBar` scoreboard uniquement, `PASSER LE TOUR` unique déclencheur, `RESTANT` dérivé
- [Source: explore/resources/billiboard_scoreboard.JPG, _2, _3, _4, _pba, _teams ; explore/resources/cueuny_scoreboard.png] — références retenues par Nathan (décision 1) ; [Source: explore/basic-ui-brainstorming-2026-09-11.md] — brief d'origine écran par écran
- [Source: _bmad-output/implementation-artifacts/10-3-…md] — coquille de pop-up latérale, tokens, pièges de test, protocole de passe navigateur, six passes de rendu ; [#deferred-work.md] — DT2 à clore, reports 10.7
- [Source: 1score/CLAUDE.md §1, §2, §4, §6, §7, §8, §9]
- [Source: 1score/src/views/GameView.vue:60-120,200-380 ; components/PlayerPanel.vue ; CenterPanel.vue ; ActionBar.vue ; ScoreEntryModal.vue ; NumericPadDock.vue ; ShotClock.vue:60-100 ; PictoIcon.vue ; keyClasses.ts]
- [Source: 1score/src/stores/useGameStore.ts:299-400,540-600,693-741 ; types/game.ts ; types/ui.ts ; assets/main.css]
- [Source: 1score/src/views/GameView.test.ts:36-134,171-262,317-376,439-460,519-593,1356-1371 ; components/PlayerPanel.test.ts:99-130,187-219 ; CenterPanel.test.ts:44-62 ; ActionBar.test.ts ; ScoreEntryModal.test.ts]
- Mémoire projet « Validation visuelle Chrome », « Paysage uniquement », « Revues groupées en fin d'Epic 10 », « Direction visuelle anguleuse et bleue », « Références visuelles par story »

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`), workflow `bmad-dev-story`, 2026-09-14.

### Debug Log References

Aucun incident bloquant. Trois écarts entre le plan et le réel, résolus en cours de route :

1. **`openSeriesValue` n'est pas ce que la Task 7 supposait.** Le getter `openSeries` bâti tel quel (`{ player1: openSeriesValue('player1'), … }`) faisait échouer deux des trois cas ajoutés : la fonction privée reste non nulle **après** le passage de main, tant que l'adversaire n'a pas écrit sa case. C'est correct pour ses deux appelants internes (`passTurn`, `incrementSeries`, qui l'interrogent toujours sur le joueur actif) mais faux pour un affichage de carte. Le getter est donc **borné au joueur qui a la main**.
2. **`data-side` porte un `PlayerId`, pas un côté d'écran.** La Task 5.1 ne donnait à `ActionBar` qu'un `ctaSide: TableSide`, insuffisant pour reposer l'attribut que `GameView.test.ts` lit sur plusieurs dizaines de cas. Prop `sideOwners: Record<TableSide, PlayerId>` ajoutée : la vue passe la résolution qu'elle a déjà faite (10.3), la barre n'en refait aucune.
3. **`wrapper.emitted()` enregistre aussi les événements DOM natifs** déclenchés sur la racine : le cas « la carte n'émet plus rien » a dû viser les emits de composant nommés, pas un `emitted()` vide.

### Completion Notes List

**Livré** — les 17 AC sont satisfaits, 48 sous-tâches cochées, **646 tests verts** (23 fichiers), `vue-tsc --noEmit` et `npm run build` verts.

**Preuve de non-régression (AC17)** : `git diff --stat src/stores/useGameStore.test.ts` → **50 insertions, 0 suppression**. Aucune règle de score n'a bougé : moyenne, meilleure série, `POUR n`, plafonnement, égalisatrice, undo et fin de partie gardent leurs attentes à l'identique.

**Deux défauts trouvés par la passe navigateur, invisibles en test** (happy-dom ne calcule aucun CSS) — c'est exactement ce que la 10.3 annonçait :

- **Le liseré de tour était effacé sur les 22 % hauts de la carte.** Un `ring-inset` se peint au-dessus du fond de l'élément mais **sous ses enfants** : le bandeau opaque le masquait, bord haut et deux tiers des montants. Le signal qui se lit en premier à 2 mètres était cassé. Il devient un **overlay** (`absolute inset-0 z-20`) rendu après les quatre zones ; test réécrit pour verrouiller l'ordre de rendu.
- **L'anneau du chrono ne débordait d'aucun pixel.** Le débordement se calcule sur la **content box** : la colonne portant `p-2` (16 px), `-mx-2` + `w-[calc(100%+32px)]` ne faisait que reconstituer sa border-box. Corrigé en `-mx-4` + `w-[calc(100%+64px)]` → **15 px mesurés de chaque côté**, dans la fourchette 12–20 d'AC16. Les classes sont figées par un test, seule prise possible sans CSS calculé.

**Un défaut du harnais** : sans `flex: 0 0 auto`, une iframe plus large que la fenêtre est comprimée par le flex — le format 1920 mesurait 1456 sans rien signaler. Corrigé avant de relever les mesures de ce format.

**Mesures de la passe visuelle** (Chrome « Browser 1 », `npm run dev`, harnais iframe, **paysage uniquement**, formats 1133×744 · 1194×834 · 1920×1080, harnais supprimé en fin de passe) :

| Point | 1133×744 | 1194×834 | 1920×1080 |
|---|---|---|---|
| Bandeau / hauteur de carte | 22 % | 22 % | 22 % |
| Score à 3 chiffres (débordement de sa zone) | aucun (−43 px de marge) | aucun (−45) | aucun (−73) |
| Nom de 27 caractères | 2 lignes | 2 lignes | 1 ligne |
| Distance / restant rognés | non | non | non |
| `−` / `+` | 90×90 | 90×90 | 90×90 |
| `PASSER LE TOUR` | 193×90 | 205×90 | 350×90 |
| 4 `IconAction` (min, libellé tronqué) | 90×90, non | 90×90, non | 90×90, non |
| Écart pop-up ↔ carte active | 84 px | — | 320 px |
| Débordement de l'anneau | 15 px / côté | — | — |
| Défilement de page | aucun | aucun | aucun |

**Parcours vérifiés** : JDS complet (accueil → JDS → LIBRE → distances → DÉMARRER, `PASSER LE TOUR` → série de 0, `+ POINTS ADVERSAIRE` → pop-up latérale avec valeur écrite **sur la carte**, auto-validation à 3 s, bascule du CTA et des pictos) ; 3 Bandes (`+1 ADVERSAIRE` → série en cours dans le pied, chrono relancé, `PASSER LE TOUR` clôturant la série sans ajouter de 0, `POUR 2` **et** `RESTANT 2` cohabitant comme prévu) ; fin de partie (offre d'égalisatrice, `PASSER LE TOUR` `disabled` **et** inerte sous la pop-up) ; reprise après rechargement en pleine saisie (pop-up rouverte du bon côté, buffer restitué) ; **blanc à gauche et blanc à droite** (pop-up toujours du côté opposé à la carte active, CTA toujours du côté de l'assis).

**Reste à trancher avec Nathan, non corrigé** : l'anneau débordant **recouvre le liseré de tour** sur sa largeur (~15 px) — la carte porte `@container`, donc `contain: layout`, donc un contexte d'empilement qui confine le `z-20` du liseré. Le débordement étant un premier jet à ajuster au rendu (décision 4), le défaut est laissé tel quel. Consigné dans `deferred-work.md` avec les deux façons de le régler.

**Écart de picto assumé** : `pass-turn` suit la description de la table §10.7 de la spec UX (flèche enjambant un rond) et non la « flèche circulaire » de Billiboard évoquée par la décision 1 — une troisième boucle serait indiscernable de `refresh` (CHANGER DE BILLE) et de `rotate-ccw` (RECOMMENCER) à 24 px. À confirmer au rendu.

**Observation hors périmètre, consignée** : cinq assertions de `GameView.test.ts` visent `[data-testid="prompt-close"]`, un testid qu'aucun composant n'émet — elles ne peuvent pas échouer. Préexistantes à cette story ; une sixième, héritée de `modal-close-button` supprimé ici, a été alignée dessus par cohérence plutôt que réécrite seule. À reprendre à la revue de fin d'epic.

**Revue de code non proposée**, conformément à la décision de Nathan du 2026-09-11 : l'Epic 10 laisse chaque story en `review` sans relecture, revues et correctifs groupés en fin d'epic.

### File List

**Nouveaux**
- `1score/src/components/IconAction.vue`
- `1score/src/components/IconAction.test.ts`
- `1score/src/components/ScoreEntryDock.vue`
- `1score/src/components/ScoreEntryDock.test.ts`

**Supprimés**
- `1score/src/components/ScoreEntryModal.vue`
- `1score/src/components/ScoreEntryModal.test.ts`

**Modifiés**
- `1score/src/components/PlayerPanel.vue`
- `1score/src/components/PlayerPanel.test.ts`
- `1score/src/components/CenterPanel.vue`
- `1score/src/components/CenterPanel.test.ts`
- `1score/src/components/ActionBar.vue`
- `1score/src/components/ActionBar.test.ts`
- `1score/src/components/PictoIcon.vue`
- `1score/src/components/PictoIcon.test.ts`
- `1score/src/views/GameView.vue`
- `1score/src/views/GameView.test.ts`
- `1score/src/stores/useGameStore.ts`
- `1score/src/stores/useGameStore.test.ts`
- `1score/src/types/ui.ts`
- `1score/src/assets/main.css`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/10-4-refonte-du-scoreboard-carte-joueur-passer-le-tour-dock-de-saisie-barre-basse-en-pictos.md`

**Temporaire, supprimé en fin de passe**
- `1score/public/_viewport-harness.html`

## Change Log

| Date | Version | Description | Auteur |
|---|---|---|---|
| 2026-09-12 | 0.1 | Story créée (bmad-create-story) — décisions de Nathan : références Billiboard + `cueuny_scoreboard.png`, saisie au modèle de pop-up latérale 10.3, bandeau sans picto de bille, chrono débordant en premier jet | Nathan / Claude Opus 5 |
| 2026-09-14 | 1.7 | **5e passe de rendu (Nathan)** — en JDS, le compteur de reprises est **sorti du flux** et centré sur la hauteur ENTIÈRE de la colonne : en `flex-1`, il se centrait sur la place restant au-dessus du CTA, une cinquantaine de pixels trop haut. Mesuré après correction : centre des scores 309 px, centre du bloc de reprises 311 px. Le chrono reste 10 px plus bas en 3 Bandes (asymétrie REP/CTA) — non corrigé, consigné. 659 tests verts | Claude Opus 5 |
| 2026-09-14 | 1.6 | **4e passe de rendu (Nathan)** — **`POUR n` déménage dans le bandeau**, à la place du restant dont il est l'expression : les deux disaient la même chose à deux endroits (l'AC2, qui assumait la redondance, est **caduc**), et la **zone de série du pied reste occupée jusqu'au bout** au lieu de perdre la série trois points avant la fin. **`PASSER LE TOUR` tient la même place dans les deux modes** (en bas, à la pixel près : `top` identique mesuré en JDS et en 3 Bandes) — c'est un geste répété des dizaines de fois par partie —, et le **compteur de reprises prend la place du chrono** en JDS au lieu de laisser un vide ; un seul markup, seule la classe du bloc change. 659 tests verts | Claude Opus 5 |
| 2026-09-14 | 1.5 | **3e passe, 2e correctif** — le raccord laissait voir un petit trait gris et une délimitation : c'était le **contour de la colonne centrale**, dont le filet clair s'interrompait derrière le disque du chrono. Contour retiré (écart assumé à l'AC5 et à UX-DR48, annotés) ; le fond de la colonne et celui du disque rendent la même couleur, la jonction est invisible. Piège repayé au passage : le commentaire d'explication, écrit à la racine du gabarit, en a fait un fragment et lui a fait perdre `classes()`. 655 tests verts | Claude Opus 5 |
| 2026-09-14 | 1.4 | **3e passe, correctif** — le liseré droit restait visible **en travers** du disque, avec un raccord sale aux deux bouts de l'arc (« le détourage doit être clean »). Le contexte d'empilement de `@container` ne suffisait pas à le faire passer derrière : l'ordre est désormais forcé par des **z-index explicites des deux côtés** (liseré `z-10`, débordement du chrono `z-20`). Le disque masque le liseré sur sa hauteur, le demi-anneau reprend le tracé exactement là où il s'interrompt — vérifié au navigateur des deux côtés. 655 tests verts | Claude Opus 5 |
| 2026-09-14 | 1.3 | **3e passe de rendu (Nathan)** — le liseré de tour **CONTOURNE** le disque du chrono au lieu de passer par-dessus : demi-anneau rouge porté par `ShotClock` (`turnRingSide`, relayé par `CenterPanel.turnSide`), clippé sur la seule bande qui dépasse dans la carte et non sur la moitié du disque (un demi-anneau s'arrête en pleine colonne et dessine un crochet). Nouveau token `--game-clock-bleed`, source unique du débordement pour la largeur de la colonne ET le clip. Cap de l'arc **plat** en toutes circonstances (le `computed` qui ne le mettait à plat qu'à zéro disparaît). **Bandeau de carte à hauteur LIBRE** (l'AC1 le fixait à 22 %, la moitié de l'aplat restait vide) et un cran d'air de plus entre ses deux lignes : ~16 % avec un nom court, ~21 % sur deux lignes. 655 tests verts | Claude Opus 5 |
| 2026-09-14 | 1.2 | **2e passe de rendu (Nathan)** — le **liseré de tour passe devant l'anneau** du chrono (`@container` descendu de la racine de `PlayerPanel` sur un wrapper : il créait un contexte d'empilement qui enfermait le `z-20` du liseré) ; anneau **plus gros** (débordement 16 → 24 px, gouttière des cartes 24 → 32 px), **trait affiné** (10 → 7), **disque fondu** dans la colonne (`--color-shot-clock-face`, `--color-surface` composé sur `--color-bg`) au lieu de `bg-black`. **Bug signalé par Nathan et corrigé** : en 3 Bandes, `−`/`+` ne décrémentaient pas la série en cours — ils empilaient un ajustement séparé, et le total divergeait de la somme des reprises (meilleure série et moyenne fausses jusqu'à la fin de la partie). `adjustScore` corrige désormais la série ouverte, borné au 3 Bandes et au joueur qui a la main, avec repli sur l'ajustement sous zéro. 651 tests verts | Claude Opus 5 |
| 2026-09-14 | 1.1 | **1re passe de rendu (Nathan)** — bandeau de carte au modèle Billiboard de bout en bout (`NOM \| DISTANCE` puis `RESTANT \| MOY · SÉRIE`, les deux premiers en nombres NUS) ; ligne `MOY · SÉRIE` sous le score **supprimée** avec son aplat gris (la carte n'a plus que trois zones) ; zone de série en **rouge** (`--color-brand-red`) et plus grosse ; `PASSER LE TOUR` **sans contour** et avec le **picto de Billiboard** (boucle circulaire, même tracé que `refresh`) ; latence du chrono **2 s → 1 s** ; anneau du chrono **rentré** dans son disque (rayon 36, trait 10) avec sa marge sombre façon Cueuny. Dette de test remboursée au passage : une quinzaine de cas recopiaient `SHOT_CLOCK_GRACE_MS` en dur et cassaient tous au changement — ils la dérivent désormais, comme `ShotClock.test.ts` dérive le rayon de l'arc. 648 tests verts, `vue-tsc` et build verts, rendu vérifié à 1133×744 et 1194×834 | Claude Opus 5 |
| 2026-09-14 | 1.0 | Story implémentée (bmad-dev-story) — `IconAction` et quatre pictos, carte joueur en quatre zones avec `RESTANT` dérivé et zone de série à priorité unique, carte rendue inerte, `CenterPanel` réduit à `REP` · chrono · `PASSER LE TOUR`, `ScoreEntryDock` latéral remplaçant `ScoreEntryModal` (supprimé), `ActionBar` reconstruite en markup unique (DT2 close), getter dérivé `openSeries`, barre du récap déplacée en `<nav>` inline. 646 tests verts, `vue-tsc` et build verts, `useGameStore.test.ts` sans retouche (50 insertions seules). Passe navigateur aux trois formats paysage : deux défauts CSS corrigés (liseré de tour effacé par le bandeau, anneau ne débordant pas), un point laissé à l'arbitrage de Nathan (anneau recouvrant le liseré). Statut → `review` | Claude Opus 5 |
