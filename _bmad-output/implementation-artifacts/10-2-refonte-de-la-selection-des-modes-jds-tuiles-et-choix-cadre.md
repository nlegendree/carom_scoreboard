# Story 10.2: Refonte de la sélection des modes JDS — tuiles et choix Cadre

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur de jeux de séries,
I want choisir Libre, 1 Bande, Cadre (47/2, 47/1 ou 71/2) ou 4 Billes sur des tuiles du même style que l'accueil,
so that le parcours reste « catégorie → mode → joueurs » en moins de 30 secondes, avec la même lisibilité que l'accueil (FR12, NFR12).

> **Cadrage (bmad-create-story, 2026-09-12).** Deuxième story visuelle de l'Epic 10 (10.6 et 10.1 livrées). **Périmètre : l'étape `mode` de `HomeScreen` seulement.** L'étape `players` garde son rendu actuel — en-tête `h1`, panneaux joueurs, `ActionBar` avec `RETOUR` et `DÉMARRER` — jusqu'à la 10.3 ; le scoreboard et le récap ne bougent pas. Aucun mode nouveau (FR12 inchangée), aucune règle de jeu, aucun état du store, aucune persistance ne changent. Exigences : UX-DR31 (contenu sidebar), UX-DR36, UX-DR37.

> **Décisions de Nathan à la création de la story (2026-09-12)** — elles priment sur les AC d'`epics.md` et la spec UX §10.3, tous deux annotés :
> 1. **Aucune nouvelle référence visuelle.** La 10.2 reprend strictement le rendu validé à la 10.1 (`cueuny_home.png` reste la référence d'origine) : sidebar en aplat collée au bord avec en-tête rouge en biais, tuiles jointives séparées de filets, fond gris/noir, angles vifs, paysage uniquement. Rien de neuf n'est à inventer côté rendu.
> 2. **Aucune accroche sur les tuiles JDS.** `LIBRE`, `1 BANDE`, `CADRE`, `4 BILLES` portent titre + flèche, comme `3 BANDES` et `JEUX DE SÉRIES` à l'accueil. Les quatre accroches de la spec (« Sans contrainte », « Une bande avant le second point », « 47/2 · 47/1 · 71/2 », « Deux billes rouges ») sont **abandonnées**. La prop `tagline` de `ModeTile` reste au contrat, non utilisée.
> 3. **Couleurs : un dégradé à partir de la couleur de `JEUX DE SÉRIES`.** Les quatre tuiles forment une famille dérivée de `--gradient-tile-jds`, de la plus claire à la plus sombre — et non quatre teintes distinctes ni quatre fois la même. `LIBRE` reprend **exactement** `--gradient-tile-jds` (la tuile enfant hérite de la couleur de sa tuile parente à l'accueil), les trois suivantes descendent d'un cran chacune. Remplace « toutes en `--color-tile-jds` » (UX-DR36).
> 4. **Même gabarit que l'accueil** : titre en haut à la place de l'accroche, rangée de quatre tuiles collée en bas à 34 % de la hauteur. D'un écran à l'autre, seuls le titre et les tuiles changent — la barre ne bouge pas d'un pixel.

## Acceptance Criteria

> ***AC1 et AC5 caducs sur les couleurs (Nathan, 2026-09-12, après livraison) :*** l'échelle d'une nuance par tuile est abandonnée au profit d'**un seul bleu**, `--gradient-blue`. Les trois tokens `--gradient-tile-jds-2|3|4` livrés par cette story sont **supprimés**, `--gradient-tile-jds` et `--gradient-tile-3b` avec eux. Voir la note de passe de rendu dans les Completion Notes.

1. **Tokens** — **Given** `1score/src/assets/main.css` **When** la story est livrée **Then** le bloc `@theme static` de l'Epic 10 porte trois tokens de plus, `--gradient-tile-jds-2`, `--gradient-tile-jds-3` et `--gradient-tile-jds-4`, déclinaisons de plus en plus sombres de `--gradient-tile-jds` (même angle `160deg`, même écart de luminosité que l'échelle de l'accueil) **And** les trois figurent dans `dist/assets/*.css` après `npm run build` **And** aucun token existant n'est modifié ni retiré — l'accueil rend exactement comme avant.
2. **Coquille de l'étape `mode`** — **Given** l'étape `mode` **When** elle s'affiche **Then** elle reprend la coquille de l'accueil : fond `--gradient-bg` sans image, sans marge d'écran, `SideBar` collée au bord gauche, zone principale à droite **And** la barre d'action basse n'y est plus rendue **And** rien ne défile ni ne déborde en 1133×744, 1194×834 et 1920×1080.
3. **`SideBar` de la sélection JDS** — **Given** l'étape `mode` **When** elle s'affiche **Then** la barre porte son en-tête (logo + `1Score`, inerte) et **un seul item, `RETOUR`** (picto flèche gauche), en état `normal` **And** aucun item de sortie n'est rendu (`sidebar-bottom` absent) **And** taper `RETOUR` ramène à l'accueil, catégorie oubliée, exactement comme l'ancien `RETOUR` de la barre basse (UX-DR31).
4. **Titre** — **Given** l'étape `mode` **When** elle s'affiche **Then** la zone principale montre en haut `JEUX DE SÉRIES`, au même emplacement et dans le même style que l'accroche de l'accueil (`text-hero`, `font-black`, blanc, aligné à gauche) **And** ce libellé vient du catalogue (`selectedCategory.label`), pas d'une chaîne écrite en dur **And** l'en-tête `h1` de l'ancienne coquille n'est plus rendu sur cette étape.
5. **Tuiles** — **Given** l'étape `mode` **When** elle s'affiche **Then** la bande basse porte quatre `ModeTile` jointives, de hauteur égale (34 % de la hauteur utile, ≥ 180 px), séparées d'un filet `--color-border`, collées à la barre latérale et aux bords, dans l'ordre `LIBRE` · `1 BANDE` · `CADRE` · `4 BILLES` **And** chacune porte titre et flèche, **sans accroche** **And** leurs fonds sont, dans l'ordre, `--gradient-tile-jds`, `--gradient-tile-jds-2`, `--gradient-tile-jds-3`, `--gradient-tile-jds-4` **And** les libellés des trois tuiles de mode direct viennent du catalogue (`LIBRE`, `1 BANDE`, `4 BILLES`), `CADRE` étant un groupe de présentation.
6. **Modes directs** — **Given** l'étape `mode` **When** je tape `LIBRE`, `1 BANDE` ou `4 BILLES` **Then** j'arrive à l'étape joueurs avec le mode `libre`, `bande` ou `4billes`, rendu actuel inchangé (en-tête `h1`, panneaux, `ActionBar`).
7. **Choix Cadre** — **Given** l'étape `mode` **When** je tape `CADRE` **Then** un `PromptModal` en **variante liste** s'ouvre, titre `CADRE`, avec quatre commandes empilées dans l'ordre `47/2`, `47/1`, `71/2` puis `ANNULER` en dernier — la première en accent, les autres neutres, chacune ≥ 90 px de haut **And** il n'y a aucune croix (règle `PromptModal` inchangée) ; le voile, lui, **referme** la pop-up sur un geste complet (revue de rendu du 2026-09-12 — voir la note ci-dessous) **And** taper un cadre mène à l'étape joueurs avec `cadre-47-2`, `cadre-47-1` ou `cadre-71-2` **And** `ANNULER` referme la pop-up en laissant l'étape `mode` telle quelle, aucun mode sélectionné.
   > ***Passe de rendu (Nathan, 2026-09-12), prime sur l'AC ci-dessus :*** les trois cadres sont sur **une seule ligne** en colonnes égales et **tous du même bleu d'accent** (aucun choix par défaut) ; `ANNULER`, seul en neutre, passe **sous** la ligne sur toute sa largeur ; le titre `CADRE` est **centré** ; la carte prend un gabarit resserré et des angles **à peine adoucis** (`--radius-modal`, 12 px), les CTA restant à angles vifs. Les CTA portent `--gradient-cta` — **le bleu exact de la tuile LIBRE** — en dégradé **interne à chaque bouton**, `ANNULER` le même en blanc voilé. **Taper à côté referme** (geste complet sur le voile, émet `secondary`) : un choix est annulable, à la différence d'une décision.
8. **Contrat de la variante liste** — **Given** `PromptModal` **When** il reçoit une liste de *n* actions **Then** il les rend empilées dans l'ordre reçu, la première en accent et les suivantes neutres, chacune ≥ 90 px, et n'affiche **aucun** CTA principal **And** un `secondaryLabel` fourni en plus est rendu **après** la liste **And** les usages existants à un ou deux CTA (« PARTIE EN COURS », « DISTANCE MANQUANTE », offre d'égalisatrice, « PARTIE TERMINÉE », « TERMINER LA PARTIE ? », « RECOMMENCER LA PARTIE ? ») gardent leur structure, leur ordre et leurs appels **inchangés**.
   > ***Passe de rendu (Nathan, 2026-09-12) :*** « la première en accent, les suivantes neutres » est **caduc** — toutes les actions portent le même accent, sur une ligne. Et les angles vifs + le gabarit resserré s'appliquent à **toutes** les pop-ups : les six usages existants changent donc d'allure (rayons à 0, carte plus compacte), sans rien changer à leur structure ni à leur code d'appel.
9. **Surtitre du mode choisi** — **Given** l'étape joueurs atteinte depuis un cadre **When** elle s'affiche **Then** le titre affiche le libellé complet du catalogue (`CADRE 47/2`, `CADRE 47/1`, `CADRE 71/2`) — comportement actuel, à ne pas casser ; les libellés et identifiants de `types/game.ts` ne changent pas.
10. **Retour depuis l'étape joueurs** — **Given** l'étape joueurs **When** je tape `RETOUR` (barre basse, toujours en place jusqu'à la 10.3) **Then** je reviens à l'étape `mode` pour un jeu de série et à l'accueil pour le 3 Bandes, noms et distances effacés comme aujourd'hui **And** aucune pop-up n'y survit (ni « DISTANCE MANQUANTE », ni le choix Cadre).
11. **Nettoyage et tests** — **Given** la story livrée **When** les tests tournent **Then** les `data-testid` `step-mode`, `mode-libre`, `mode-bande`, `mode-4billes` sont **conservés** (`mode-cadre` remplace `mode-cadre-47-2` sur l'écran, les trois cadres devenant des commandes de la pop-up) ; `HomeScreen.test.ts` et `PromptModal.test.ts` sont adaptés et étendus ; `GameView.test.ts` passe **sans modification** ; `npm test` et `npm run build` (dont `vue-tsc -b`) passent ; le rendu est vérifié dans Chrome aux trois formats de l'AC2.

## Tasks / Subtasks

- [x] **Task 1 — Tokens de la famille JDS (AC: 1, 5)**
  - [x] 1.1 `main.css`, bloc `@theme static` existant, à la suite des `--gradient-tile-*` : trois tokens commentés « Sélection JDS (Story 10.2) — famille dérivée de la tuile JEUX DE SÉRIES, du plus clair au plus sombre ». Valeurs retenues (même angle, même pas de luminosité que l'échelle de l'accueil) :
    - `--gradient-tile-jds-2: linear-gradient(160deg, #086AAE 0%, #034878 100%);`
    - `--gradient-tile-jds-3: linear-gradient(160deg, #065894 0%, #033C63 100%);`
    - `--gradient-tile-jds-4: linear-gradient(160deg, #05467A 0%, #022F4E 100%);`
  - [x] 1.2 Ne **rien** toucher d'autre dans `main.css` : `--gradient-tile-jds` sert à la fois la tuile `JEUX DE SÉRIES` de l'accueil et la tuile `LIBRE` de cet écran, c'est voulu (décision 3).
  - [x] 1.3 Après `npm run build` : `grep -o -- "--gradient-tile-jds-[234]:[^;]*" dist/assets/*.css` renvoie les trois. `@theme static` les émet même si un utilitaire manquait.
- [x] **Task 2 — Picto `arrow-left` (AC: 3)**
  - [x] 2.1 `types/ui.ts` : ajouter `'arrow-left'` à `PictoName` (la table de `PictoIcon` est exhaustive par typage, `vue-tsc` signalera l'oubli).
  - [x] 2.2 `PictoIcon.vue` : entrée `'arrow-left': ['M19 12H5', 'm12 19-7-7 7-7']` (Lucide, ISC — miroir exact d'`arrow-right` déjà présent).
  - [x] 2.3 `PictoIcon.test.ts` : un cas de plus pour `arrow-left` (deux `<path>`), sur le modèle des quatre existants.
- [x] **Task 3 — `PromptModal`, variante liste (AC: 7, 8)**
  - [x] 3.1 `types/ui.ts` : `export interface PromptAction { id: string; label: string }`.
  - [x] 3.2 `PromptModal.vue` : prop `actions?: readonly PromptAction[]` ; `primaryLabel` **devient optionnel** (`primaryLabel?: string`) — élargissement sans risque, les six appels existants le passent toujours. Emit supplémentaire `select: [id: string]`. `primary`/`secondary` inchangés.
  - [x] 3.3 Pied en **un seul markup linéaire**, sans branche d'ordre (voir le squelette des Dev Notes) : la liste d'actions, puis `prompt-secondary`, puis `prompt-primary` gardé par `!actions?.length`. Les deux ordres attendus en découlent sans condition — sans `actions` : secondaire puis principal, comme aujourd'hui ; avec `actions` : choix puis `ANNULER`, aucun principal. Chaque action porte `data-testid="prompt-action-<id>"`, `@pointerdown="emit('select', action.id)"`, les classes de `prompt-primary` pour la première (`bg-accent`, `text-on-accent`) et celles de `prompt-secondary` pour les suivantes (`bg-white/10`), toutes en `w-full min-h-[var(--size-touch-target)] text-label font-black touch-manipulation select-none`.
  - [x] 3.4 Ne pas ajouter de croix, ne pas poser de handler sur le voile : les tests `PromptModal.test.ts` le vérifient sur la source (`?raw`) et échoueront si un `@click`/`@pointerup` apparaît.
  - [x] 3.5 `PromptModal.test.ts` (rouge d'abord), cas nouveaux : liste rendue dans l'ordre avec ses testids ; première action en `bg-accent`, suivantes en `bg-white/10` ; chaque action `min-h-[var(--size-touch-target)]` ; `select` émis **une fois** avec le bon `id` au `pointerdown` ; `prompt-primary` absent quand `actions` est fourni ; `prompt-secondary` rendu après la dernière action (comparer l'ordre des nœuds du pied) ; **et** un cas de non-régression : sans `actions`, `prompt-secondary` précède toujours `prompt-primary`.
- [x] **Task 4 — `ModeTile`, couleurs de la famille (AC: 5)**
  - [x] 4.1 `ModeTile.vue` : union `TileColor` étendue à `'tile-jds-2' | 'tile-jds-3' | 'tile-jds-4'` et trois entrées de plus dans `GRADIENT_CLASSES`, **écrites en toutes lettres** (`'bg-(image:--gradient-tile-jds-2)'`, etc.) — le scanner Tailwind ne voit que des chaînes littérales complètes.
  - [x] 4.2 `ModeTile.test.ts` : trois lignes de plus dans l'`it.each` de correspondance couleur → classe. Rien d'autre ne change dans ce fichier.
- [x] **Task 5 — `HomeScreen`, étape `mode` (AC: 2, 3, 4, 5, 6, 7, 9, 10, 11)**
  - [x] 5.1 Découper le template en **trois** branches au lieu de deux : `v-if="step === 'category'"` (coquille accueil, inchangée) → `v-else-if="step === 'mode'"` (**nouvelle** coquille, même gabarit que l'accueil) → `v-else` (coquille actuelle des joueurs). Squelette au § « HomeScreen » des Dev Notes. Garder le conteneur racine unique qui englobe les trois branches **et** les pop-ups.
  - [x] 5.2 Retirer de la coquille joueurs la branche `mode` devenue morte : dans `headerTitle`, la ligne `if (step.value === 'mode') return selectedCategory.value?.label` disparaît (le titre de l'écran JDS est rendu par la nouvelle coquille, qui lit `selectedCategory?.label`). La branche `players` reste telle quelle.
  - [x] 5.3 Constantes et état d'écran dans `HomeScreen.vue` :
    - `JDS_SIDEBAR_ITEMS` : un seul item `{ id: 'back', picto: 'arrow-left', label: 'RETOUR', state: 'normal', action: back }`, **déclaré après** la fonction `back()` pour la lisibilité ; pas d'`exitItem`.
    - `JDS_TILE_LAYOUT`, constante d'écran : `[{ id: 'libre', color: 'tile-jds' }, { id: 'bande', color: 'tile-jds-2' }, { id: 'cadre', color: 'tile-jds-3', group: true }, { id: '4billes', color: 'tile-jds-4' }]` — ordre et couleurs, données de présentation portées par l'écran (même motif que `HOME_TILES`).
    - `jdsTiles`, **`computed`** (et non une constante comme `HOME_TILES`) : il résout `JDS_TILE_LAYOUT` contre `categoryModes`, lui-même `computed` sur `selectedCategory`. Pour les trois modes directs, titre = `mode.label` du catalogue et `soon = !mode.available` ; `CADRE` est un groupe de présentation : titre littéral `'CADRE'`, `soon` vrai si **aucun** des trois cadres n'est disponible.
    - `cadrePromptOpen = ref(false)`.
    - `cadreActions`, **`computed`** pour la même raison : les trois `GameMode` `['cadre-47-2', 'cadre-47-1', 'cadre-71-2']` résolus contre `categoryModes` en `PromptAction` — `id` = le `GameMode`, `label` = **`47/2` / `47/1` / `71/2`** et non le libellé complet du catalogue : le titre `CADRE` porte déjà le mot, la commande porte la variante.
  - [x] 5.4 Câblage : tuile de mode direct → `selectMode(mode)` (garde `available` et logique inchangées) ; tuile `CADRE` → `cadrePromptOpen = true` ; action de la pop-up → `selectMode(mode)` puis `cadrePromptOpen = false` ; `ANNULER` (`secondaryLabel`) → `cadrePromptOpen = false` seul.
  - [x] 5.5 Ajouter `cadrePromptOpen.value = false` au bloc de remise à zéro de `back()`, à côté de `distanceError` et pour la même raison (une pop-up seulement masquée par le garde `step` se rouvrirait au retour) — voir « Pièges ».
  - [x] 5.6 Rendre la pop-up de choix **à côté** des deux pop-ups existantes, gardée par `v-if="cadrePromptOpen && step === 'mode'"` : `<PromptModal title="CADRE" :actions="cadreActions" secondaryLabel="ANNULER" @select="…" @secondary="…" />`.
  - [x] 5.7 `HomeScreen.test.ts` — adaptations **exactes** (les numéros de ligne sont ceux du fichier actuel) :
    - helper `goToPlayersStep` (l. 8-11) : router les modes `cadre-*` par la pop-up (`mode-cadre` puis `prompt-action-<mode>`), les autres par leur tuile ;
    - l. 65-72 « opens the sub-mode step… » : attendre `mode-cadre` (et non `mode-cadre-47-2`) sur l'étape ;
    - l. 74-81 « goes back from the sub-mode step… » : presser `sidebar-item-back` au lieu de `back-button` ;
    - l. 94-101 « hides the back button on the root step only » : `back-button` absent sur `category` **et** sur `mode`, présent sur `players` — commentaire mis à jour (plus de barre basse sur les deux premiers écrans) ;
    - l. 104-113 « shows the logo on the home step only » : le titre du cas devient trompeur — la sidebar est désormais sur `category` **et** `mode`, absente sur `players` seulement ; renommer et réécrire en conséquence ;
    - l. 115-122 « does not render the bottom action bar… » : `action-bar` absente sur `category` et `mode`, présente sur `players` ;
    - l. 597-598 : `mode-cadre-47-2` → `mode-cadre` puis `prompt-action-cadre-47-2` ;
    - l. 505-506 et 566-567 (`mode-libre`) : **inchangés**, le testid survit.
  - [x] 5.8 `HomeScreen.test.ts` — cas **nouveaux** : titre `JEUX DE SÉRIES` rendu sur l'étape `mode` ; ordre et libellés des quatre tuiles (`LIBRE`, `1 BANDE`, `CADRE`, `4 BILLES`) ; aucune tuile ne rend de `tile-tagline` ; la sidebar de l'étape n'a qu'un item et pas de `sidebar-bottom` ; `RETOUR` ramène à `step-category` ; `CADRE` ouvre la pop-up avec exactement `47/2`, `47/1`, `71/2`, `ANNULER` ; chacun des trois cadres mène à `step-players` avec le bon `store.mode` après `DÉMARRER` ; `ANNULER` referme la pop-up en laissant `step-mode` affiché et aucun mode choisi.
  - [x] 5.9 `GameView.test.ts` : **aucune modification attendue** (l. 24 presse `mode-libre`, l. 1356 vérifie l'absence de `step-mode` pour le 3 Bandes). S'il casse, c'est un testid perdu : corriger le composant, pas le test.
- [x] **Task 6 — Documentation (AC: 1, 11)**
  - [x] 6.1 `_bmad-output/planning-artifacts/architecture.md`, section « Navigation & Shell (Epic 10, V1.1) » : note « *Livré en Story 10.2 (2026-09-12)* : étape `mode` sous la coquille de l'accueil (sidebar `RETOUR`, titre, quatre tuiles), `PromptModal` étendu d'une variante liste (`actions`, emit `select`, `PromptAction` dans `types/ui.ts`), picto `arrow-left`, famille `--gradient-tile-jds-2|3|4`. » Compléter la ligne `ui.ts` de l'arborescence (`PromptAction`).
  - [x] 6.2 `epics.md` (AC de la Story 10.2, UX-DR36) et `ux-design-specification.md` (§10.3 « Sélection JDS ») sont **déjà annotés** des décisions 2 et 3, à la création de la story (2026-09-12) : ne pas les réécrire. Y ajouter, **et seulement si la passe de rendu change quelque chose**, une note datée du même format — c'est ce qu'a fait la 10.1.
  - [x] 6.3 `CLAUDE.md` : **rien à changer** — le §7 couvre déjà les tokens de l'epic par `--gradient-tile-*`. Ne pas l'alourdir ; la description des composants de l'epic revient à la 10.7.
- [x] **Task 7 — Contrôle final (AC: 1-11)**
  - [x] 7.1 `npm test` (**536** tests au commit `658546e`, plus les nouveaux) et `npm run build` verts ; contrôle 1.3 des variables.
  - [x] 7.2 **Passe navigateur** (CLAUDE.md §9, une seule, en fin de story) : voir le § « Validation visuelle » des Dev Notes.

## Dev Notes

### État du code à l'arrivée (commit `658546e`, arbre propre, 536 tests verts)

- `HomeScreen.vue` (365 lignes) : racine `<div class="h-full w-full">` → branche `category` (coquille 10.1 : `bg-(image:--gradient-bg)`, `SideBar`, accroche, `<section>` des quatre tuiles) → branche `v-else` (`bg-bg`, `<header>` avec `h1`, `<main>` des étapes `mode`/`players`, `ActionBar`) → `PlayerSetupModal` → `PromptModal` « DISTANCE MANQUANTE ». L'étape `mode` est aujourd'hui une grille `grid-cols-2 md:grid-cols-3` de `<button>` (`HomeScreen.vue:252-268`).
- `selectMode(mode)` (`HomeScreen.vue:113-118`) : garde `available`, pose `selectedMode` et passe à `players`. **À réutiliser tel quel** pour les tuiles comme pour la pop-up — ne pas écrire un second chemin.
- `back()` (`HomeScreen.vue:120-137`) : efface noms, distances, `editing`, `distanceError`, `fixingDistances`, puis `mode` si la catégorie a plusieurs modes, sinon `goHome()`. Depuis l'étape `mode`, il tombe donc sur `goHome()` — c'est **exactement** le comportement attendu de `RETOUR` en sidebar (AC3) : passer `back` en `action` de l'item, pas `goHome`.
- `SideBar` (`SideBar.vue`) : `w-15` collée, en-tête rouge en biais, groupes `items` / `sidebar-bottom` (`mt-auto`), item `soon` = `disabled` + garde. Un item `normal` appelle son `action` au `pointerdown`. **Aucun changement** attendu dans ce composant : la 10.1 l'a livré avec son API complète.
- `ModeTile` (`ModeTile.vue`) : racine `<button>` unique, calque `tile-background` portant le dégradé, flèche `arrow-right` nue, badge `BIENTÔT` en état `soon`, `tagline` optionnelle non utilisée. Seule la table de couleurs change.
- `PromptModal` (`PromptModal.vue`) : voile **inerte** (aucun handler), pas de croix, pied `secondaryLabel` **au-dessus** de `primaryLabel`. Six appels : `HomeScreen.vue:356` et `GameView.vue:243,437,446,455,466`.
- `ActionBar` : `showBack` vaut vrai par défaut ; `HomeScreen` la rend sans `:showBack` depuis la 10.1. Elle reste sur l'étape `players` jusqu'à la 10.3 — **ne pas y toucher**.

### Tailwind dans ce projet — à relire avant d'écrire une classe

- **`--spacing` vaut 8 px** (CLAUDE.md §7) : `px-4` = 32 px, `pt-5` = 40 px, `gap-1.5` = 12 px. `min-h-[180px]` et `h-[34%]` restent en valeurs arbitraires.
- **Paysage uniquement** : pas de variante `portrait:`/`landscape:`, pas de `md:` pour l'orientation. L'accueil livré n'en a aucune, la sélection JDS n'en aura pas.
- **Utilitaires de la famille** : `bg-(image:--gradient-tile-jds-2)` et ses deux frères sont générés dès qu'ils apparaissent en toutes lettres dans une source scannée. Jamais de `` `bg-(image:--gradient-tile-${n})` ``.
- Ordre des classes : Layout → Sizing → Spacing → Typography → Colors → Effects (CLAUDE.md §8).

### `HomeScreen` — squelette de l'étape `mode`

```vue
<div v-else-if="step === 'mode'" data-testid="step-mode"
     class="flex h-full w-full bg-(image:--gradient-bg)">
  <SideBar :items="JDS_SIDEBAR_ITEMS" />
  <main class="flex min-w-0 flex-1 flex-col">
    <p data-testid="jds-title" class="px-4 pt-5 text-hero font-black leading-tight text-white">
      {{ selectedCategory?.label }}
    </p>
    <section class="mt-auto grid h-[34%] grid-cols-4 divide-x divide-border">
      <ModeTile v-for="tile in jdsTiles" :key="tile.id" :data-testid="`mode-${tile.id}`" … />
    </section>
  </main>
</div>
```

- `data-testid="step-mode"` **monte** sur la coquille de l'étape (il était sur la `<section>` de la grille) : `HomeScreen.test.ts` et `GameView.test.ts` n'en vérifient que la présence ou l'absence. Même déplacement que `step-category` en 10.1.
- La coquille est un **copier-adapter** de celle de l'accueil : même `flex`, même absence de marge, même `mt-auto` + `h-[34%]`. Si l'une des deux dérive au rendu, c'est la 10.2 qui s'aligne sur la 10.1, jamais l'inverse.
- Les quatre tuiles étant toutes disponibles aujourd'hui, l'état BIENTÔT n'apparaîtra sur aucune — la branche existe quand même (`soon` calculé), elle est déjà testée dans `ModeTile.test.ts` et ne demande aucun cas d'écran.

### `PromptModal` — pied attendu

```vue
<footer class="flex shrink-0 flex-col gap-3">
  <!-- Variante liste : les choix, la première en accent. Rien quand `actions` est absent. -->
  <button v-for="(action, index) in actions ?? []" :key="action.id"
          :data-testid="`prompt-action-${action.id}`"
          :class="index === 0 ? ACCENT_CLASSES : NEUTRAL_CLASSES"
          @pointerdown="emit('select', action.id)">{{ action.label }}</button>

  <!-- Secondaire : sous les choix en variante liste, au-dessus du principal sinon —
       le markup linéaire donne les deux ordres attendus sans aucune condition. -->
  <button v-if="secondaryLabel" data-testid="prompt-secondary" :class="NEUTRAL_CLASSES"
          @pointerdown="emit('secondary')">{{ secondaryLabel }}</button>

  <!-- Principal : jamais en variante liste. -->
  <button v-if="!actions?.length && primaryLabel" data-testid="prompt-primary" :class="ACCENT_CLASSES"
          @pointerdown="emit('primary')">{{ primaryLabel }}</button>
</footer>
```

- Extraire les deux jeux de classes en constantes (`ACCENT_CLASSES`, `NEUTRAL_CLASSES`) et les réutiliser pour `prompt-primary`/`prompt-secondary` : les trois familles de boutons doivent rester rigoureusement identiques, c'est ce qui fait que les pop-ups du produit se ressemblent.
- **Ne pas** transformer les usages existants en `actions` : « PARTIE EN COURS » et consorts gardent `primaryLabel`/`secondaryLabel`. La variante liste est un ajout, pas un remplacement (AC8).

### Pièges

- **Ordre du pied.** Aujourd'hui `ANNULER` (secondaire) est **au-dessus** du CTA principal ; dans la variante liste il est **en dessous** des choix — au-dessus, il s'intercalerait entre le titre et les cadres. Le markup linéaire de la tâche 3 donne les deux ordres sans condition : ne pas le « corriger » en ajoutant une branche. Verrouiller les deux formes par un test d'ordre des nœuds.
- **Pop-up masquée ≠ pop-up fermée.** `cadrePromptOpen` doit être remis à `false` par `back()`, comme `distanceError` l'est depuis la 1.4 (`HomeScreen.vue:126-130`) : sans ça, la pop-up rouvre d'elle-même au retour sur l'étape.
- **`mode-cadre-47-2` disparaît de l'écran.** Trois tests de `HomeScreen.test.ts` le cherchent (l. 71, 598, et le helper via `goToPlayersStep(wrapper, 'cadre-47-2')` l. 203) ; `GameView.test.ts` ne le connaît pas. Adapter les trois, ne pas réintroduire de testid mort sur la tuile `CADRE`.
- **`mode-libre` est lu par `GameView.test.ts:24`.** Le perdre casse un test d'intégration loin de l'accueil.
- **La tuile `CADRE` n'est pas un mode.** Ne pas l'ajouter au catalogue ni à l'union `GameMode` : `types/game.ts` ne change pas de cette story. Le groupe vit dans `HomeScreen`, comme l'ordre des tuiles de l'accueil.
- **`disabled` + garde, les deux** : le motif reste celui de la 10.1 et de `selectCategory`, y compris pour les commandes de la pop-up (aucune n'est désactivée aujourd'hui, mais `selectMode` garde `available`).
- **Ne pas toucher** à l'étape `players`, à `PlayerSetupModal`, à `ActionBar`, au store ni à `GameView` : chaque story laisse l'app jouable et ne retire un composant que pour le remplacer (epics Epic 10).
- **Aucune animation** sur ces écrans (accueil et sélection JDS sont l'écran de veille et son prolongement immédiat) : pas de `transition-*` ni d'`animate-*` ajoutés. `ModeTile.test.ts` le vérifie déjà sur son propre markup.

### Tests

- Vitest + Vue Test Utils + happy-dom. happy-dom ne calcule **aucun** CSS : les tests vérifient présence de classes, attributs et comportements, jamais une taille ni un débordement — c'est le rôle de la passe navigateur.
- Déclenchement : `trigger('pointerdown')`, jamais `click` (AR8).
- Cycle rouge-vert par composant ; pas de navigateur pendant l'implémentation (CLAUDE.md §9).
- `PromptModal.test.ts` lit sa propre source en `?raw` pour interdire croix et handlers de voile : tout ajout de handler y sera signalé.

### Validation visuelle (fin de story, une seule passe)

- `npm run build && npm run preview` (ou `npm run dev`). Demander à Nathan quel Chrome utiliser (deux sont connectés ; « Browser 1 (macOS) » les dernières fois).
- `resize_window` ne redimensionne pas le viewport : harnais temporaire `1score/public/_viewport-harness.html` qui charge l'app dans une `<iframe id="f">` dimensionnée par `?w=&h=`, **supprimé en fin de passe**. Formats, **paysage uniquement** : **1133×744** (iPad mini), **1194×834** (iPad 11″), **1920×1080** (21,5″, réductible par `transform: scale` pour la capture).
- Débordements : **`scrollWidth`/`scrollHeight` ne voient rien** sous `overflow-hidden`. Comparer les `getBoundingClientRect()` des titres de tuile et des tuiles à ceux de leur parent.
- À relever par format : barre latérale à 0,0 et 120 px de large, en-tête identique à l'accueil ; titre à 32 px du bord gauche ; rangée à 34 % de la hauteur, tuiles jointives du bord de la barre au bord droit ; quatre nuances **distinctes à l'œil** et dégradées du clair au sombre (le point à valider avec Nathan) ; titres entiers ; aucun arrondi, aucun défilement.
- Parcours : accueil → `JEUX DE SÉRIES` → l'écran JDS ; `RETOUR` → accueil ; `LIBRE` → étape joueurs, `RETOUR` → écran JDS ; `CADRE` → pop-up, `ANNULER` → écran JDS inchangé, puis `CADRE` → `47/1` → étape joueurs, surtitre `CADRE 47/1` ; démarrer une partie depuis un cadre, recharger → « PARTIE EN COURS » par-dessus l'accueil, puis `ANNULER`. Avant la passe, jeter toute sauvegarde `1score:game` restante.
- Captures d'onglet visible uniquement ; vérifications sur les valeurs DOM.
- Montrer le rendu à Nathan : **l'échelle des quatre bleus** est le seul point de design vraiment nouveau de cette story.

### Intelligence de la story précédente (10.1, `658546e`)

- **Le plan d'un epic ne survit pas au premier rendu.** La 10.1 a livré ses AC puis a été refondue avec Nathan en passe de rendu (angles vifs, éléments collés, palette resserrée, paysage seul). Les AC ci-dessus intègrent déjà ces décisions : ne pas retourner chercher les valeurs d'`epics.md` ou de la spec (rayons, marge de 16 px, `--color-tile-*` colorés) — elles sont caduques et les documents sont annotés.
- **Pièges de test rencontrés en 10.1, déjà payés une fois** : un commentaire HTML à la racine d'un gabarit en fait un fragment et fait perdre `classes()`/`attributes()` et le `data-testid` du parent (`ModeTile`) ; un sélecteur `[data-testid^="prefix-"]` attrape aussi les enfants (`SideBar`, d'où `sidebar-label`). Les mêmes garde-fous valent pour `prompt-action-*`.
- **`@theme static`** est accepté par Tailwind 4.3.3, aucun repli `:root` n'est nécessaire.
- **Reporté par la 10.1, à ne pas re-traiter ici** (`deferred-work.md`) : effet d'appui peu visible au doigt, plafonds de `clamp()` trop bas pour le 21,5″, fond d'accueil à retravailler. Le troisième touche `--gradient-bg`, donc aussi cet écran : si Nathan y revient, ce sera une passe transverse, pas cette story.
- **Revue de code groupée** : l'Epic 10 laisse chaque story en `review` sans relecture, revues et correctifs passés ensemble en fin d'epic (décision de Nathan, 2026-09-11). Ne pas proposer `bmad-code-review` à la livraison.

### Project Structure Notes

- Composants à plat dans `src/components/`, tests co-localisés (AR16), named exports hors SFC. `PromptAction` rejoint `types/ui.ts`, qui porte déjà `PictoName`, `ItemState` et `SideBarItem` — `game.ts` reste le modèle de partie et ne change pas.
- Aucun composant nouveau dans cette story : elle consomme `SideBar`, `ModeTile`, `PictoIcon` livrés en 10.1 et étend `PromptModal`. C'est le signe que la note de périmètre de la 10.1 (« API complète, les stories suivantes n'ont qu'à la nourrir ») a tenu.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.2] — AC d'origine, note de périmètre (`step`/`selectedCategory` laissés tels quels pour la 10.3)
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 10] — décisions de la passe de rendu 10.1, valables pour toute l'epic ; [#UX Design Requirements] — UX-DR31, UX-DR36, UX-DR37
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.2, #10.3 Sélection JDS, #10.7] — sidebar par écran, tuiles, pictos
- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation & Shell (Epic 10, V1.1)]
- [Source: explore/basic-ui-brainstorming-2026-09-11.md#JDS] — brief de Nathan (barre latérale conservée, flèche de retour, pop-up Cadre)
- [Source: _bmad-output/implementation-artifacts/10-1-refonte-de-laccueil-barre-laterale-tuiles-de-mode-fond-degrade.md] — coquille, tokens, pièges
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#dev-story 10-1] — reports en cours
- [Source: 1score/CLAUDE.md §2, §6, §7, §8, §9]
- [Source: 1score/src/components/HomeScreen.vue:113-137,244-268,356-363 ; PromptModal.vue ; ModeTile.vue ; SideBar.vue ; PictoIcon.vue]
- [Source: 1score/src/components/HomeScreen.test.ts:8-11,65-122,203,505-506,566-567,597-598 ; views/GameView.test.ts:24,1356]
- Mémoire projet « Validation visuelle Chrome » (harnais, débordements) et « Paysage uniquement »

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`) — workflow `bmad-dev-story`, 2026-09-12.

### Debug Log References

- **Typage de `JDS_TILE_LAYOUT`** : `vue-tsc` refusait `tile.group` (TS2339). Sous `as const`, une clé absente d'une entrée disparaît de sa branche d'union, et les trois tuiles non groupées n'avaient pas de `group`. Corrigé en portant `group: false` sur les quatre entrées plutôt qu'en élargissant le type — la constante reste littérale et le scanner Tailwind continue de voir les couleurs en toutes lettres.
- **Passe navigateur, harnais servi par le service worker** : sur `vite preview`, `navigateFallback` de Workbox renvoie `index.html` pour toute navigation, y compris `/_viewport-harness.html` — le harnais n'était jamais chargé (l'onglet affichait l'app). Passé sur `vite` (serveur de dev, sans SW) après désenregistrement du SW de l'origine. **À retenir pour les prochaines passes visuelles : le harnais ne fonctionne pas derrière `npm run preview`.**

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- **Tokens (AC1)** : `--gradient-tile-jds-2|3|4` ajoutés au bloc `@theme static` existant, aux valeurs de la Task 1.1 ; aucun token existant touché. Vérifiés dans `dist/assets/*.css` après build, variables **et** utilitaires `bg-(image:…)` émis.
- **Picto (AC3)** : `arrow-left` ajouté à `PictoName` et à la table de `PictoIcon` (miroir exact d'`arrow-right`, Lucide ISC), couvert par les cas existants de `PictoIcon.test.ts`.
- **`PromptModal`, variante liste (AC7, AC8)** : prop `actions`, emit `select`, `primaryLabel` devenu optionnel, `PromptAction` dans `types/ui.ts`. Pied en markup **linéaire** sans branche d'ordre — les deux ordres attendus en découlent. Les trois familles de boutons partagent `ACCENT_CLASSES`/`NEUTRAL_CLASSES` (extraites d'un `BUTTON_CLASSES` commun). Voile toujours inerte, aucune croix : les tests sur la source `?raw` restent verts. Les six appels existants sont inchangés et rendent à l'identique — vérifié en test (ordre secondaire → principal) et au navigateur sur « PARTIE EN COURS ».
- **`ModeTile` (AC5)** : `TileColor` étendue de trois valeurs, trois entrées de plus dans `GRADIENT_CLASSES`, écrites en toutes lettres. Rien d'autre ne bouge dans le composant.
- **`HomeScreen` (AC2, 4, 5, 6, 9, 10)** : template découpé en trois branches, la nouvelle coquille `mode` étant un copier-adapter de celle de l'accueil (même `flex`, même absence de marge, même `mt-auto` + `h-[34%]`). `JDS_SIDEBAR_ITEMS` (un seul item `RETOUR`, action `back`, pas de sortie), `JDS_TILE_LAYOUT` constante d'écran, `jdsTiles` et `cadreActions` en `computed`, `cadrePromptOpen` remis à `false` par `back()`. `selectMode` est le chemin **unique** vers l'étape joueurs, emprunté par les tuiles comme par la pop-up ; sa signature accepte `null` pour absorber une résolution manquante. `headerTitle` perd sa branche `mode`, devenue morte.
- **Tests (AC11)** : `mode-libre`, `mode-bande`, `mode-4billes` et `step-mode` conservés (`step-mode` monte sur la coquille) ; `mode-cadre` remplace `mode-cadre-47-2` sur l'écran. `GameView.test.ts` passe **sans modification**. 559 tests verts (536 au commit `658546e`, +23), `npm run build` (dont `vue-tsc -b`) vert.
- **Passe navigateur** (Chrome « Browser 1 », harnais iframe temporaire supprimé en fin de passe) — **1194×834**, **1133×744** et **1920×1080**, paysage seul : barre latérale à 0,0 et 120 px de large, en-tête identique à l'accueil ; titre à 32 px du bord de la zone ; rangée à 34 % de la hauteur exactement (284 / 253 / 367 px, toutes ≥ 180), tuiles jointives de la barre au bord droit ; titres entiers, `border-radius` à 0 partout, `scrollWidth`/`scrollHeight` égaux au viewport aux trois formats. Parcours vérifié de bout en bout : accueil → JDS → `RETOUR` → accueil ; `LIBRE` → joueurs (`LIBRE`) → `RETOUR` → JDS ; `CADRE` → pop-up → `ANNULER` (écran intact, aucun mode choisi) → `CADRE` → `47/1` → joueurs, surtitre `CADRE 47/1` ; partie démarrée en `cadre-47-2`, rechargement → « PARTIE EN COURS » par-dessus l'accueil avec `ANNULER` **au-dessus** de `REPRENDRE LA PARTIE`, puis `ANNULER`.
- **À montrer à Nathan (seul point de design neuf)** : l'échelle des quatre bleus. Les nuances sont distinctes à l'œil et bien ordonnées du clair au sombre, mais l'écart `LIBRE` → `1 BANDE` est le plus discret des trois. Rien n'est corrigé de ma propre initiative : `epics.md` et la spec UX ne sont pas réannotés, la Task 6.2 ne l'imposant qu'en cas de changement décidé en passe de rendu.
- **Passe de rendu de la pop-up (Nathan, 2026-09-12, après la première livraison)** : `PromptModal` prend les **angles vifs** par les tokens `--radius-container`/`--radius-cta` (les `rounded-3xl`/`rounded-2xl` de l'Epic 1 disparaissent du composant, un test sur la source `?raw` l'interdit désormais) et un gabarit resserré (`max-w-xl` au lieu de `max-w-2xl`, `p-3`/`gap-3`, pied en `gap-2`) — la carte du choix Cadre passe de 672×670 à **576×306**. La variante liste rend ses actions sur **une seule ligne** (`grid-flow-col` + `auto-cols-fr` : une seule classe pour n colonnes égales, sans classe construite à la volée), **toutes du même accent**, `ANNULER` seul en neutre sous la ligne et exactement aussi large que les trois réunis (vérifié au navigateur : 334→860 px pour des actions de 334→860). Titre centré en variante liste seulement, les pop-ups de décision gardant leur titre à gauche avec la bille du joueur. Non-régression revérifiée au navigateur sur « DISTANCE MANQUANTE » : ordre `ANNULER` → `RÉGLER LA DISTANCE` intact. 563 tests verts. `epics.md` (UX-DR37), la spec UX (fiche `PromptModal`) et `architecture.md` sont annotés.
- **Seconde passe de rendu (Nathan, 2026-09-12)** — quatre corrections, toutes vérifiées au navigateur :
  1. **Le bleu n'était pas le bon.** Les CTA prenaient `--color-accent` (`#1E88E5`), pas celui de la tuile `LIBRE`. Nouveau token `--gradient-cta`, copie exacte de `--gradient-tile-jds` (`#0A7CC9` → `#04558D`) : `getComputedStyle` donne désormais la **même** chaîne pour la tuile `LIBRE` et pour un CTA de cadre.
  2. **Dégradé dans chaque bouton**, jamais étalé sur la rangée : `--gradient-cta` pour les choix et le CTA principal, `--gradient-cta-neutral` (blanc voilé, même angle) pour `ANNULER` et tous les secondaires.
  3. **Carte à peine adoucie** : nouveau token `--radius-modal` (12 px), seule exception aux angles vifs de l'epic — les CTA restent à `--radius-cta` (0).
  4. **Tap en dehors = fermeture, en variante liste seulement.** Mécanique d'`armBackdropClose` reprise de `PlayerSetupModal` (geste COMPLET, `pointerId` mémorisé plutôt qu'un booléen, `pointercancel` qui désarme) et emit `secondary`. **Les pop-ups de décision gardent leur voile inerte** : la règle AC18 / Décision 12 (la pop-up de fin monte sous le doigt qui vient de valider une série, et « annuler » une fin de partie n'a pas de sens) n'est pas levée. Vérifié en vrai : relâchement isolé → n'ouvre rien ; geste complet sur le voile → ferme le choix Cadre en laissant l'étape `mode` intacte ; geste complet dans la carte → ne ferme pas ; geste complet sur le voile de « DISTANCE MANQUANTE » → **inerte**.
  Le voile n'a pas de `role="button"` : exception assumée à CLAUDE.md §2, déjà relevée en DT3 pour la 10.7. 565 tests verts.
- **Troisième passe de rendu (Nathan, 2026-09-12, « trop sombre »)** : `--gradient-cta` quitte le bleu de la tuile LIBRE pour le **haut** de l'échelle des bleus de l'epic — `#3C9AE3` → `--color-cloth` (le drap, base de tous les bleus du produit) — et le libellé des CTA passe en **blanc** au lieu de `--color-on-accent` (noir) ; `--gradient-cta-neutral` remonte de 0,14→0,05 à **0,22→0,10**. Une pop-up monte sur un fond déjà sombre qu'elle floute : elle doit ressortir, la parenté avec la tuile qui l'a ouverte pèse moins que la lisibilité. **Contraste mesuré** (blanc sur le dégradé) : **3,03:1** au point le plus clair, **5,03:1** au plus sombre, ~3,9:1 sous le texte lui-même (centré, donc sur la médiane). Les libellés faisant 23,9 px en `font-black`, c'est du **texte large** au sens WCAG, dont le seuil AA est 3:1 : conforme, mais **sans marge en haut du dégradé** — à revalider dans la passe contraste AA de la 10.7.
- **Quatrième passe de rendu (Nathan, 2026-09-12) — un seul bleu, fin de la série** : « utilise juste cette couleur de dégradé sur toutes les tuiles, ce sera plus simple, et les CTA qui demandent du bleu aussi ». `--gradient-blue` (`#2E8FDB` → `--color-cloth`, la couleur de la tuile 3 BANDES) devient LE bleu du produit et remplace d'un coup `--gradient-tile-3b`, `--gradient-tile-jds`, la famille `--gradient-tile-jds-2|3|4` (créée puis retirée dans la même story) et `--gradient-cta` ; `--gradient-neutral` remplace `--gradient-cta-neutral`. **Les tuiles BIENTÔT sont laissées telles quelles** : `--gradient-tile-quilles` et `--gradient-tile-casin` survivent, la nuance sombre y portant l'inactivité autant que le badge. Conséquence de conception : `ModeTile.color` passe **optionnel**, avec le bleu par défaut — une tuile ouverte n'a plus de couleur à choisir, l'écran n'en passe que pour les deux tuiles fermées, et `TileColor` se réduit à `'tile-quilles' | 'tile-casin'`. Vérifié au navigateur : `3 BANDES`, `JEUX DE SÉRIES`, les quatre tuiles JDS, les trois CTA de cadre et le CTA principal de « DISTANCE MANQUANTE » rendent **tous** la même chaîne `linear-gradient(160deg, rgb(46, 143, 219) 0%, rgb(5, 115, 187) 100%)` ; `QUILLES` et `CASIN` gardent leurs nuances sombres. Aucun token mort dans le CSS produit. Contraste blanc : **3,46:1** au point le plus clair (contre 3,03 avant), toujours AA texte large — la marge remonte un peu. 562 tests verts.
- **Flou du voile ramené à 8 px (Nathan, 2026-09-12)** : `backdrop-blur-md` (12 px) → `backdrop-blur-sm` (8 px) sur `PromptModal`, le voile `bg-black/60` restant inchangé. À 12 px la page derrière devenait illisible ; à 8 px elle reste reconnaissable, ce qui est le but d'une pop-up qui floute au lieu de masquer. `ScoreEntryModal` et `PlayerSetupModal` gardent 12 px : elles ne passent pas par `PromptModal` et leur rendu n'a pas été revu — à aligner dans la finition transverse de la 10.7.
- **Connu et hors périmètre** (déjà dans `deferred-work.md`, reporté par la 10.1) : au 1920×1080 le titre reste à 56 px et le titre de tuile à 36 px — plafonds de `clamp()` trop bas pour le 21,5″. `ScoreEntryModal` et `PlayerSetupModal` gardent leurs `rounded-*` littéraux : la direction anguleuse ne les a pas encore atteintes, ce sera la finition transverse de la 10.7.

### File List

- `1score/src/assets/main.css` — modifié (trois tokens `--gradient-tile-jds-2|3|4`)
- `1score/src/types/ui.ts` — modifié (`PictoName` + `arrow-left`, `PromptAction`)
- `1score/src/components/PictoIcon.vue` — modifié (tracé `arrow-left`)
- `1score/src/components/PictoIcon.test.ts` — modifié (cas `arrow-left`)
- `1score/src/components/PromptModal.vue` — modifié (variante liste, classes de bouton extraites)
- `1score/src/components/PromptModal.test.ts` — modifié (5 cas nouveaux, dont l'ordre du pied)
- `1score/src/components/ModeTile.vue` — modifié (trois couleurs de la famille JDS)
- `1score/src/components/ModeTile.test.ts` — modifié (trois lignes d'`it.each`)
- `1score/src/components/HomeScreen.vue` — modifié (coquille de l'étape `mode`, pop-up de cadre)
- `1score/src/components/HomeScreen.test.ts` — modifié (7 adaptations, 12 cas nouveaux)
- `_bmad-output/planning-artifacts/architecture.md` — modifié (note « Livré en Story 10.2 », ligne `ui.ts`)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — modifié (statut de la story)
- `_bmad-output/implementation-artifacts/10-2-refonte-de-la-selection-des-modes-jds-tuiles-et-choix-cadre.md` — modifié (cette fiche)

## Change Log

- 2026-09-12 — Flou du voile des pop-ups ramené de 12 px à 8 px.
- 2026-09-12 — Quatrième passe de rendu : UN seul bleu (`--gradient-blue`) pour toutes les tuiles ouvertes et tous les CTA ; tuiles BIENTÔT inchangées ; `ModeTile.color` devient optionnel ; `--gradient-tile-3b`, `--gradient-tile-jds`, `--gradient-tile-jds-2|3|4` et `--gradient-cta` supprimés (AC1 de la story caduc). 562 tests verts.
- 2026-09-12 — Troisième passe de rendu : CTA éclaircis au haut de l'échelle des bleus (`#3C9AE3` → `--color-cloth`), libellés en blanc, neutre remonté. Contraste AA texte large tout juste tenu (3,03:1 au point le plus clair) — à revalider en 10.7.
- 2026-09-12 — Seconde passe de rendu : CTA au bleu exact de la tuile LIBRE (`--gradient-cta`), dégradé interne à chaque bouton (`--gradient-cta-neutral` pour les secondaires), carte à peine adoucie (`--radius-modal`), fermeture au tap en dehors **en variante liste seulement** (voile inerte conservé pour les pop-ups de décision). 565 tests verts.
- 2026-09-12 — Passe de rendu de la pop-up avec Nathan : angles vifs par les tokens `--radius-*` et gabarit resserré pour **toutes** les pop-ups ; en variante liste, choix sur une ligne au même accent, `ANNULER` pleine largeur dessous, titre centré. `epics.md`, spec UX et `architecture.md` annotés. 563 tests verts.
- 2026-09-12 — Implémentation complète (bmad-dev-story). Étape `mode` passée sous la coquille de l'accueil (sidebar `RETOUR` seule, titre du catalogue, quatre tuiles jointives aux nuances `--gradient-tile-jds` → `-4`), `PromptModal` étendu d'une variante liste pour le choix du cadre, picto `arrow-left`. 559 tests verts, build vert, passe navigateur aux trois formats paysage. Statut → `review` (revue groupée en fin d'Epic 10).
- 2026-09-12 — Création de la fiche (bmad-create-story). Décisions de Nathan : aucune nouvelle référence visuelle (rendu 10.1 repris), aucune accroche de tuile, quatre nuances dérivées de `--gradient-tile-jds`, gabarit identique à l'accueil. `epics.md` et la spec UX à annoter en Task 6.2.
