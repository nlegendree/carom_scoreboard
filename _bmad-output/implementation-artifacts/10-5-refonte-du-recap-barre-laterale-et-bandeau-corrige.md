# Story 10.5: Refonte du récap — barre latérale et bandeau corrigé

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur en fin de partie,
I want le récap dans le même habillage que le reste de l'application, avec `RECOMMENCER` et `QUITTER` dans la barre latérale,
so that la fin de partie est aussi soignée que le jeu et que je relance une revanche d'un tap (FR4, FR17).

> **Cadrage (bmad-create-story, 2026-09-14).** Cinquième story visuelle de l'Epic 10 (10.6, 10.1, 10.2, 10.3, 10.4 livrées) et **la plus petite** : `epics.md` la résume en « rien de nouveau — réutilise `SideBar` ». **Périmètre : `GameSummary.vue` et la branche `status === 'finished'` de `GameView.vue`.** C'est le **dernier écran du jeu qui garde le rendu d'avant l'epic** — et le seul endroit où la rupture visuelle se voit encore. Trois livrables : la coquille de l'epic (dégradé, `SideBar`, conteneur à contour), les deux CTA du bas déménagés en barre latérale (`<nav data-testid="summary-bar">` **provisoire** posé par la 10.4, à supprimer), et **DT6** (un nom de 20 lettres larges mange la distance). **Aucun changement de store** : `rematch()` et `resetGame()` sont appelées telles quelles — `useGameStore.ts` et `useGameStore.test.ts` ne sont **pas touchés**, c'est la preuve de non-régression de la story. Exigences : UX-DR31 (contenu sidebar), UX-DR53, DT6.

> **Décisions de Nathan à la création de la story (2026-09-14)** — elles priment sur les AC d'`epics.md` et la spec UX §10.3, à annoter en Task 7 :
>
> 1. **Références visuelles : les cinq `billiboard_recap*`** (`billiboard_recap.jpeg`, `_2.JPG`, `_3.JPG`, `_4.JPG`, `_teams.jpeg`) — le format actuel en vient, on reste dans cette famille. **Aucune référence Cueuny** pour cet écran.
> 2. **`RECOMMENCER` en haut, `QUITTER` en bas.** `RECOMMENCER` est un item normal sous l'en-tête ; `QUITTER` va dans le slot `exitItem` de `SideBar`, calé en bas et isolé. **Écart assumé à la lettre d'UX-DR31**, qui les liste tous deux en items dans l'ordre inverse : la convention de l'epic veut l'action la plus irréversible isolée en bas (comme `FERMER L'APPLICATION` à l'accueil et `ANNULER` au paramétrage), et la revanche est l'action fréquente.
> 3. **Les pastilles de bille restent, aux assets PNG du paramétrage** — `/bille_blanche.png` et `/bille_jaune.png`, ceux fournis par Nathan en 10.3 et servis par `PlayerSetupCard`. Les ronds `bg-player-white` / `bg-player-yellow` de `GameSummary` disparaissent, **dans le bandeau comme dans la ligne `RÉSULTAT`**.
> 4. **Aucune confirmation** : `RECOMMENCER` et `QUITTER` agissent au tap, comme les deux CTA d'aujourd'hui. La partie est finie, il n'y a rien à perdre — pas de `PromptModal` sur cet écran.

> **Caduc pour toute l'epic (passe de rendu 10.1, Nathan) :** le **portrait**. L'AC d'`epics.md` qui demande la vérification « dans les deux orientations » **ne s'applique pas** — aucune variante `portrait:` à écrire, aucune passe portrait à faire. Formats visés : **1133×744**, **1194×834**, **1920×1080**, tous en paysage.

## Acceptance Criteria

**AC1 — Coquille de l'epic**
**Given** une partie terminée
**When** le récap s'affiche
**Then** l'écran est bâti comme les autres écrans hors jeu : fond `--gradient-bg`, `SideBar` collée au bord gauche, zone principale en **conteneur à contour** — l'idiome maison est `border border-border bg-surface`, **sans classe de rayon** (`--radius-container` vaut 0, personne ne l'écrit)
**And** plus aucun arrondi hérité (`rounded-3xl` sur les colonnes, `rounded-full` sur les pastilles) ni `bg-bg` ne subsiste dans `GameSummary`

**AC2 — Barre latérale, contenu et places**
**Given** le récap
**When** la barre latérale s'affiche
**Then** elle porte `RECOMMENCER` (picto `rotate-ccw`) en **item**, sous l'en-tête, et `QUITTER` (picto `door`) en **`exitItem`**, calé en bas et isolé (décision 2)
**And** un tap sur `RECOMMENCER` relance une revanche immédiate (mêmes joueurs, mêmes distances, mêmes côtés) et un tap sur `QUITTER` ramène à l'accueil — **sans confirmation** (décision 4)
**And** le `<nav data-testid="summary-bar">` provisoire de `GameView` et ses deux boutons (`end-game-button`, `rematch-button`) **ont disparu** ; le récap n'a plus de barre basse

**AC3 — Bandeau : nom et distance dissociés (DT6)**
**Given** un nom de 20 caractères larges (« WWWWWWWWWWWWWWWWWWWW »)
**When** le bandeau s'affiche
**Then** le nom et la distance sont **deux éléments distincts** : le nom se tronque seul (ellipse), la distance est **toujours** visible, aux trois formats
**And** le couple suit le modèle de bandeau validé en 10.4 — `NOM` puis la distance en **nombre nu**, séparés d'un filet vertical, sans `/`

**AC4 — Pastilles de bille aux assets du paramétrage**
**Given** le récap
**When** il s'affiche
**Then** les pastilles du bandeau **et** celles de la ligne `RÉSULTAT` rendent `/bille_blanche.png` et `/bille_jaune.png` (`alt=""`, `aria-hidden="true"`, `object-contain`), servis depuis `public/` par une table littérale
**And** aucune classe `bg-player-white` / `bg-player-yellow` ne subsiste dans `GameSummary`

**AC5 — Côtés du scoreboard conservés**
**Given** des billes changées au paramétrage (carte blanche à droite)
**When** le récap s'affiche
**Then** la colonne de gauche est le joueur affiché à gauche pendant la partie, et le bandeau suit le même ordre (`whiteSide`, AR24)

**AC6 — Le récap reste terminal**
**Given** le récap
**When** je tape n'importe où hors de la barre latérale
**Then** rien ne se passe : `GameSummary` n'a **ni handler pointer, ni handler click, ni `defineEmits`**, et la `SideBar` est le seul endroit tapable de l'écran

**AC7 — Format Billiboard conservé**
**Given** le récap
**When** il s'affiche
**Then** le format ne change pas : bandeau `VS` avec le mode en surtitre discret, trois colonnes (joueur · libellés · joueur), cinq lignes `RÉSULTAT` · `POINTS` · `MOY` (3 décimales) · `SÉRIE` · `REPRISES`, colonne du vainqueur en `--color-victory-ribbon` avec le mot `VICTOIRE`, `ÉGALITÉ` des deux côtés le cas échéant, badge `★ RECORD` toujours présent et toujours inerte (Story 3.5)

**AC8 — Tests et non-régression**
**Given** la story livrée
**When** les tests tournent
**Then** `GameSummary.test.ts` et `GameView.test.ts` (branche récap) sont adaptés, la suite est verte, `npm run build` passe
**And** `useGameStore.ts` et `useGameStore.test.ts` **n'ont pas été touchés** (`git diff --stat` à zéro sur ces deux fichiers)
**And** le rendu est vérifié dans Chrome aux **trois formats paysage**, victoire à gauche, victoire à droite et égalité

## Tasks / Subtasks

- [x] **Task 1 — Coquille et conteneur** (AC: 1, 7)
  - [x] Dans `GameView.vue`, branche `finished` : envelopper dans un `<div class="flex min-h-0 flex-1 ... bg-(image:--gradient-bg)">` sur le modèle des trois étapes de `HomeScreen` (`SideBar` + `<main class="flex min-w-0 flex-1 ...">`)
  - [x] Dans `GameSummary.vue` : retirer `bg-bg` de la racine, poser le conteneur à contour (`border border-border bg-surface`, aucune classe de rayon), retirer les `rounded-3xl` des colonnes
  - [x] Fond du conteneur : `bg-surface` (blanc à 6 % sur le dégradé) par défaut ; si le panneau manque de corps au rendu, `bg-(image:--gradient-panel)` est le repli déjà employé par la colonne centrale du paramétrage — **arbitrage de passe de rendu, pas un AC**
  - [x] Vérifier qu'aucun commentaire HTML ne se trouve **à la racine** d'un gabarit (piège payé en 10.1, 10.3 et 10.4)

- [x] **Task 2 — Barre latérale du récap** (AC: 2)
  - [x] Déclarer dans `GameView.vue` `SUMMARY_SIDEBAR_ITEMS: SideBarItem[]` = `[{ id: 'restart', picto: 'rotate-ccw', label: 'RECOMMENCER', state: 'normal', action: () => gameStore.rematch() }]`
  - [x] Déclarer `SUMMARY_SIDEBAR_EXIT: SideBarItem` = `{ id: 'quit', picto: 'door', label: 'QUITTER', state: 'normal', action: () => gameStore.resetGame() }`
  - [x] Poser `<SideBar :items="SUMMARY_SIDEBAR_ITEMS" :exitItem="SUMMARY_SIDEBAR_EXIT" />` dans la branche `finished`
  - [x] Supprimer le `<nav data-testid="summary-bar">` provisoire et ses deux `<button>` ; vérifier qu'`ActionBar` n'est plus importée que pour la branche `playing`

- [x] **Task 3 — Bandeau : nom et distance dissociés** (AC: 3)
  - [x] Éclater `{{ name }} / {{ targetScore }}` en deux éléments : nom en `min-w-0 truncate`, distance en `shrink-0`, filet vertical entre les deux
  - [x] Garder `data-testid="summary-${side}"` sur le **conteneur** des deux, ajouter `summary-name` et `summary-distance` à l'intérieur
  - [x] Réécrire le cas `shows each player with his distance in the banner` (l. 40-46), qui attend aujourd'hui `'MICHEL / 100'` en une seule chaîne

- [x] **Task 4 — Pastilles aux assets PNG** (AC: 4)
  - [x] Remplacer `BALL_CLASSES: Record<PlayerId, string>` par `BALL_PICTOS: Record<PlayerId, string>` (`player1: '/bille_blanche.png'`, `player2: '/bille_jaune.png'`), table **littérale**
  - [x] Substituer les quatre `<span class="rounded-full">` (deux dans le bandeau, deux dans la ligne `RÉSULTAT`) par des `<img :src alt="" aria-hidden="true" class="… object-contain">`
  - [x] Un cas de test qui verrouille les deux chemins de fichier et l'absence de `bg-player-*`

- [x] **Task 5 — Tests de `GameView` (branche récap)** (AC: 2, 8)
  - [x] `GameView.test.ts:1091` (`press(wrapper, 'rematch-button')`) → `sidebar-item-restart`
  - [x] `GameView.test.ts:1111` (`press(wrapper, 'end-game-button')`) → `sidebar-item-quit`
  - [x] `GameView.test.ts:1291` (`rematch-button` existe après restauration d'une partie finie) → `sidebar-item-restart`
  - [x] Ajouter un cas : la branche `finished` rend une `SideBar` et **plus aucun** `[data-testid="summary-bar"]`

- [x] **Task 6 — Tests de `GameSummary`** (AC: 3, 5, 6, 7, 8)
  - [x] Cas DT6 : un joueur nommé `'W'.repeat(20)` → `summary-distance` rend la distance entière, `summary-name` porte `truncate`
  - [x] Conserver **sans les toucher** les cas de côtés (l. 140-160) et le cas `binds no pointer nor click handler at all` (l. 132-137, import `?raw`)
  - [x] Vérifier la suite complète et `npm run build` (et non `npx vue-tsc --noEmit` seul — voir Pièges)

- [x] **Task 7 — Annotations de documents** (AC: 2, 3)
  - [x] `epics.md` (Story 10.5 et UX-DR31) et `ux-design-specification.md` (§10.2 table par écran, §10.3 Récap) : consigner l'**écart de décision 2** (`QUITTER` en slot de sortie, `RECOMMENCER` en item) et la décision 3 (pastilles aux assets PNG)
  - [x] `deferred-work.md` : marquer **DT6 clos**
  - [x] `architecture.md` : une ligne sur la `SideBar` du récap avec les autres composants de l'epic

- [x] **Task 8 — Passe navigateur** (AC: 8) — voir « Validation visuelle » en Dev Notes
  - [x] Trois formats paysage, trois issues (victoire à gauche, victoire à droite, égalité), nom de 20 lettres larges
  - [x] Harnais `_viewport-harness.html` **supprimé en fin de passe**

## Dev Notes

### État du code à l'arrivée (commit `84399c5`, arbre propre, 659 tests verts)

- **`GameSummary.vue` (185 l.)** — purement présentationnel : aucun emit, aucun accès au store, `GameView` lui passe tout. Racine `flex h-full w-full flex-col bg-bg`. `SIDES` est un `computed` ordonné par `whiteSide` ; `BALL_CLASSES`, `VICTORY_COLUMN_CLASSES`, `NEUTRAL_COLUMN_CLASSES` sont des constantes littérales (scanner JIT). **Tout le travail de la story est là, plus quinze lignes dans `GameView`.**
- **`GameView.vue`, branche `finished`** — `<GameSummary class="min-h-0 flex-1" … />` suivi du `<nav data-testid="summary-bar">` **explicitement marqué provisoire** : *« ⚠️ PROVISOIRE — supprimé par la Story 10.5, qui refond le récap »*. Les deux `<button>` y ont gardé leurs classes et leurs `data-testid` d'origine le temps de la transition. C'est ce que cette story vient chercher.
- **`SideBar.vue`** — API complète depuis la 10.1 : `items: SideBarItem[]` + `exitItem?: SideBarItem`. Deux groupes, un seul gabarit, la sortie en `mt-auto`. `press()` garde l'état `soon`. **Rien à y changer** — c'est le quatrième écran qui la consomme.
- **`PictoIcon.vue`** — `door` et `rotate-ccw` **existent déjà** (ajoutés en 10.4 pour la barre basse du scoreboard). ⚠️ `rotate-ccw` n'est **pas** `refresh` (boucle double de CHANGER DE BILLE) ni `pass-turn` : trois tracés proches, trois rôles. **Aucun picto à ajouter dans cette story.**
- **`PlayerSetupCard.vue:40-44`** — le modèle exact de la décision 3 : `BALL_PICTOS: Record<PlayerColor, string>` → `/bille_blanche.png`, `/bille_jaune.png`, rendus en `<img … class="size-5 shrink-0 object-contain" alt="" aria-hidden="true">`.
- **`useGameStore.ts`** — `rematch()` (l. 506, garde `status === 'finished'`, repasse par `startGame` avec les mêmes noms, distances et `whiteSide`) et `resetGame()` (l. 623) sont **déjà exactement les deux actions demandées**. Ne rien ajouter, ne rien renommer.

### Décisions de rendu de l'epic, valables ici

Paysage uniquement · **angles vifs** (`--radius-container` / `--radius-cta` à 0, `--radius-modal` 12 px et `--radius-key` 8 px réservés aux pop-ups) · palette **bleus / noir-gris / rouge** · coller plutôt qu'espacer, filets entre éléments jointifs · retour visuel à l'appui sur tout élément tapable · aucune animation d'ambiance.

**Conséquence directe ici** : les `rounded-3xl` des colonnes et les `rounded-full` des pastilles sont les derniers arrondis non tokenisés du produit. Le rouge de victoire `--color-victory-ribbon` `#E63946` et le rouge de marque `--color-brand-red` `#D0343F` sont **deux tokens voisins mais distincts** — ne pas les fusionner, la colonne victorieuse et l'en-tête de la sidebar se retrouvent côte à côte à l'écran pour la première fois. **Le noter au rendu si la juxtaposition jure** ; c'est un arbitrage de Nathan, pas une correction à faire d'office.

### Ce que disent les références (décision 1 : les cinq `billiboard_recap*`)

Le format actuel en vient et a été validé en 1.10 : bandeau `NOM` / distance **VS** `NOM` / distance, trois colonnes, colonne du vainqueur en couleur. `billiboard_recap_teams.jpeg` montre la variante équipes — **hors périmètre** (le produit est en 1 contre 1 jusqu'à nouvel ordre), à ne pas interpréter comme une demande.

Ce qu'on va y chercher de neuf, c'est **le traitement du bandeau** : chez Billiboard, nom et nombre sont deux blocs distincts séparés d'un filet, le nombre nu, sans barre oblique. C'est déjà le modèle que Nathan a validé sur le bandeau de carte à la 1re passe de rendu de la 10.4 (`NOM | DISTANCE`, nombres nus) — AC3 s'aligne dessus, ce qui résout DT6 **et** rend les deux écrans cohérents.

### Où vit la `SideBar` — le piège d'architecture de cette story

**La `SideBar` va dans `GameView.vue`, pas dans `GameSummary.vue`.** C'est le seul point de la story où un dev peut partir de travers, parce que la spec UX §10.4 range la sidebar dans la ligne « `GameSummary` — modifié ».

Raisons, dans l'ordre :

1. `GameSummary` est **strictement présentationnel** : aucun emit, aucun accès au store — c'est écrit dans son commentaire de tête et **verrouillé par un test** qui lit le source en `?raw` et refuse `defineEmits`. Y mettre des items actionnables oblige à des emits, casse ce test et contredit AC6.
2. **Les quatre autres écrans font déjà l'inverse** : `HomeScreen` déclare `HOME_SIDEBAR_ITEMS`, `JDS_SIDEBAR_ITEMS`, `PLAYERS_SIDEBAR_ITEMS` et pose `<SideBar>` dans chacune de ses trois étapes. UX-DR31 dit explicitement « le contenu de chaque écran est fourni par l'écran, pas codé dans la barre ».
3. `rematch()` et `resetGame()` sont des actions de store que `GameView` appelle déjà — les items sont des closures d'une ligne.

`GameSummary` reste donc le **panneau de contenu** : il gagne son conteneur à contour et perd ses arrondis, rien de plus côté structure.

### Bandeau — la forme exacte attendue

```
<div data-testid="summary-player1">          ← conteneur, testid conservé
  <img src="/bille_blanche.png" …>           ← pastille (décision 3)
  <span data-testid="summary-name" class="min-w-0 truncate">MICHEL</span>
  <span aria-hidden="true">│</span>          ← filet, pas un « / »
  <span data-testid="summary-distance" class="shrink-0">100</span>
</div>
```

⚠️ **`truncate` seul ne suffit pas.** L'ellipse ne se déclenche que si le nom peut effectivement rétrécir : il faut `min-w-0` sur le span **et** sur chaque ancêtre flex jusqu'au bandeau, et `shrink-0` sur la distance — c'est exactement ce qui manquait en 1.10 et qui a produit DT6. `truncate` posé sur un enfant d'un `flex-1` sans `min-w-0` laisse le conteneur grandir au lieu de couper.

⚠️ **Le testid `summary-player1` couvre désormais les deux valeurs.** `banner.find('[data-testid="summary-player1"]').text()` rendra `'MICHEL│100'` (les `text()` de Vue Test Utils concatènent sans séparateur) : le cas l. 40-46 doit viser `summary-name` et `summary-distance` séparément, pas la chaîne agrégée. Le cas `orders the banner like the columns` (l. 156-160), qui compare des positions dans `banner.text()`, continue de passer tel quel.

### Pièges

- **Ne pas toucher au store.** `rematch()` et `resetGame()` existent, sont testées, et la story se juge sur `git diff --stat src/stores/` **vide** (AC8). Si un cas de `useGameStore.test.ts` casse, c'est qu'une règle a bougé par accident — chercher la régression, ne pas adapter le test.
- **`resetGame()` et `rematch()` sont appelées au `pointerdown`** via `SideBar.press()`, comme les deux boutons d'aujourd'hui. Aucune grâce anti-tap-fantôme n'est nécessaire : on quitte le récap, on n'y revient pas sous le doigt — et la barre latérale n'est pas là où se trouvait un CTA une seconde plus tôt (elle n'existe pas sur le scoreboard, UX-DR31).
- **Aucun commentaire HTML à la racine d'un gabarit** : il en fait un fragment, et la racine perd `classes()`/`attributes()` et son `data-testid`. Piège payé en 10.1 (`ModeTile`), rappelé en 10.3, **repayé en 10.4** (`CenterPanel`, deux cas tombés d'un coup).
- **Aucune classe construite à la volée** (`bg-(image:--gradient-${x})`) : le scanner JIT de Tailwind 4 ne voit que les classes écrites en toutes lettres. Tables `Record<…>` littérales, comme partout — y compris la nouvelle `BALL_PICTOS`.
- **`--spacing` vaut 8 px** : `gap-2` = 16 px, `p-4` = 32 px. Vérifier les espacements repris de l'ancien récap plutôt que de les recopier.
- **`npm run build`, pas `npx vue-tsc --noEmit`** (leçon de la 4e passe de la 10.4) : `--noEmit` laisse passer des pertes de narrowing que `vue-tsc -b` refuse. C'est la commande de validation de référence.
- **`scrollWidth` / `scrollHeight` ne voient rien sous `overflow-hidden`** (payé en 10.2, 10.3 et 10.4) : comparer les `getBoundingClientRect()` des enfants à celui du parent.
- **Les PNG de bille sont déjà précachés** : `vite.config.ts:42` inclut `png` dans `workbox.globPatterns`. Rien à changer pour l'offline (FR45, NFR13) — et **ne pas** les importer via `src/assets/`, ils sont servis depuis `public/` comme dans `PlayerSetupCard`.
- **`records` reste une prop inerte.** Le badge `★ RECORD` n'est jamais déclenché avant la Story 3.5 ; le garder tel quel, avec son défaut `false`.
- **Deux rouges voisins** : `--color-victory-ribbon` (colonne gagnante) et `--color-brand-red` (en-tête de la sidebar) vont se côtoyer. Ne pas en supprimer un de sa propre initiative.

### Tests

- Vitest + Vue Test Utils + happy-dom : **aucun CSS n'est calculé**. Les tests vérifient classes, attributs, emits et comportements ; troncature réelle, chevauchements et lisibilité relèvent de la passe navigateur — c'est pour ça qu'elle est obligatoire. **DT6 en particulier ne peut pas être prouvé en test** : un cas peut verrouiller `truncate` + `min-w-0` + `shrink-0`, seul le navigateur dit si la distance survit.
- Déclenchement en `trigger('pointerdown')`, jamais `click` (AR8).
- **`GameSummary.test.ts` (161 l.)** — points de contact : l. 40-46 (bandeau, à réécrire), l. 120-128 (tailles, inchangé), l. 132-137 (`?raw`, **à conserver intact** — c'est la preuve d'AC6), l. 140-160 (côtés et ordre du bandeau, inchangés).
- **`GameView.test.ts` (1727 l.)** — trois call sites seulement : l. 1091, l. 1111, l. 1291. Le reste de la branche récap (résultats, cellules de stats, `summary-column[data-side]`) **ne doit pas bouger**.
- **`SideBar.test.ts`** ne doit pas bouger : le composant ne change pas. Si un cas casse, c'est que la story a modifié `SideBar` au lieu de la nourrir.
- **Sélecteur à préfixe** : `[data-testid^="sidebar-item-"]` attraperait les deux items indistinctement — viser `sidebar-item-restart` et `sidebar-item-quit` exactement (piège payé en 10.1).

### Validation visuelle (fin de story, une seule passe)

- `npm run dev` — **pas `npm run preview`** : derrière le service worker, `navigateFallback` renvoie `index.html` pour toute navigation et le harnais n'est jamais chargé (piège payé en 10.2).
- `resize_window` ne redimensionne pas le viewport : harnais temporaire `1score/public/_viewport-harness.html` chargeant l'app dans une `<iframe>` dimensionnée par `?w=&h=`, **supprimé en fin de passe**. ⚠️ Poser `flex: 0 0 auto` sur l'iframe, sinon un format plus large que la fenêtre est comprimé sans rien signaler (défaut trouvé en 10.4 : 1920 mesurait 1456). Formats **paysage** : 1133×744, 1194×834, 1920×1080. Demander à Nathan quel Chrome utiliser (« Browser 1 (macOS) » les dernières fois).
- **À mesurer, par format** : `summary-distance` entier avec un nom de 20 `W` (DT6 — **le point de la story**) ; les deux items de sidebar ≥ 90×90 px, libellés non tronqués (`RECOMMENCER` fait 11 caractères — `ENTRAÎNEMENT` (12) et `CONFIGURATION` (13) tiennent déjà dans la colonne, mais c'est l'interlettrage qui avait fait dépasser `ENTRAÎNEMENT` de 3 px en 10.1 : le mesurer, pas le supposer) ; `QUITTER` bien calé en bas et isolé ; les cinq lignes de stats alignées entre les trois colonnes ; pastilles PNG nettes et non déformées sur les deux fonds (ribbon rouge et neutre) ; aucun défilement, aucun débordement.
- **Les trois issues** : victoire à gauche, victoire à droite (`whiteSide: 'right'` — démarrer en changeant de bille au paramétrage), **égalité** (les deux colonnes neutres, `ÉGALITÉ` des deux côtés).
- **Parcours** : accueil → `JEUX DE SÉRIES` → `LIBRE` → deux joueurs avec distances courtes (2 et 2, pour finir vite) → `DÉMARRER` → atteindre la distance → offre d'égalisatrice / « PARTIE TERMINÉE » → récap ; puis `RECOMMENCER` → **scoreboard neuf, mêmes joueurs, mêmes distances, mêmes côtés** ; refaire une fin → `QUITTER` → **accueil**.
- **Sortie manuelle** : depuis le scoreboard, `QUITTER` (barre basse) → « TERMINER LA PARTIE ? » → `VOIR LE RÉCAP` → vainqueur au prorata. Vérifier que le picto `door` de la barre basse et celui de la sidebar du récap se ressemblent assez pour se lire comme la même action.
- **Reprise** : recharger sur un récap affiché → la partie finie est restaurée avec sa sidebar (Story 1.12, cas `GameView.test.ts:1281`).

### Intelligence de la story précédente (10.4, `84399c5`)

- **Le plan ne survit pas au premier rendu.** La 10.3 a enchaîné **six** passes de rendu avec Nathan, la 10.4 **cinq**. Cette story est bien plus petite, mais la règle tient : livrer les AC, **montrer**, corriger. Ne pas retourner chercher dans `epics.md` ou la spec des valeurs déjà caduques (portrait, arrondis, `bg-accent`, barre basse du récap) — les documents sont annotés, les décisions 1 à 4 priment.
- **Les défauts qui comptent sont invisibles en test** (happy-dom ne calcule aucun CSS). La 10.4 a livré deux défauts CSS que 646 tests verts n'ont pas vus : un liseré effacé par un enfant opaque, un anneau qui ne débordait d'aucun pixel parce que le calcul se faisait sur la content box. **Le pendant ici est DT6 lui-même** — un `truncate` sans `min-w-0` passera tous les tests et ratera la story. **Mesurer, ne pas regarder.**
- **Revue de code groupée** : l'Epic 10 laisse chaque story en `review` sans relecture, revues et correctifs passés ensemble en fin d'epic (décision de Nathan, 2026-09-11). **Ne pas proposer `bmad-code-review` à la livraison** ; passer la story en `review` dans `sprint-status.yaml` et enchaîner.
- **Reporté, à ne pas traiter ici** (`deferred-work.md`) : sémantique de dialogue et garde `prefers-reduced-motion` des pop-ups (DT3), passe contraste AA, plafonds de `clamp()` trop bas pour le 21,5″, `--color-shot-clock-face` figée à la main, bandeaux de carte de hauteurs différentes → **Story 10.7** et revue de fin d'epic.
- **Observation hors périmètre héritée de la 10.4** : cinq assertions de `GameView.test.ts` visent `[data-testid="prompt-close"]`, un testid qu'aucun composant n'émet — elles ne peuvent pas échouer. **Ne pas les corriger ici**, c'est un sujet de la revue de fin d'epic.

### Project Structure Notes

- **Aucun fichier nouveau, aucun fichier supprimé.** Composants à plat dans `src/components/`, tests co-localisés (AR16).
- `types/ui.ts` **ne bouge pas** : `SideBarItem`, `ItemState` et les `PictoName` `door` / `rotate-ccw` existent tous. `types/game.ts` ne bouge pas non plus — aucun état nouveau, `GAME_STORAGE_VERSION` reste à 2.
- `main.css` **ne bouge pas** : aucun token nouveau. Si le rendu en réclame un, c'est un ajustement de passe, pas une exigence d'AC.
- `vite.config.ts` ne bouge pas (`png` déjà précaché).
- Documents à annoter (Task 7) : `epics.md`, `ux-design-specification.md`, `architecture.md`, `deferred-work.md` (DT6 clos), `sprint-status.yaml`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.5] — AC d'origine et note de périmètre ; [#Epic 10] — décisions de la passe de rendu 10.1, valables pour toute l'epic ; [#Requirements Inventory] — UX-DR31, UX-DR53, DT6
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.2 Barre latérale contextuelle, #10.3 Récap, #10.4, #10.5] — contenu de sidebar par écran, bandeau nom/distance, table des composants, flows amendés
- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation & Shell (Epic 10, V1.1)] — `SideBar` livrée en 10.1 avec son API complète, piège `player1` ≠ joueur de gauche dans `GameSummary` (AR24)
- [Source: explore/resources/billiboard_recap.jpeg, _2.JPG, _3.JPG, _4.JPG, _teams.jpeg] — références retenues par Nathan (décision 1) ; [Source: explore/basic-ui-brainstorming-2026-09-11.md] — brief d'origine écran par écran
- [Source: _bmad-output/implementation-artifacts/10-4-…md] — barre provisoire du récap à supprimer, pièges de test, protocole de passe navigateur, cinq passes de rendu ; [#10-1-…md] — API de `SideBar` ; [#deferred-work.md] — DT6 à clore, reports 10.7
- [Source: 1score/CLAUDE.md §1, §2, §4, §6, §7, §8, §9]
- [Source: 1score/src/components/GameSummary.vue ; SideBar.vue ; PlayerSetupCard.vue:36-50 ; PictoIcon.vue]
- [Source: 1score/src/views/GameView.vue (branche `finished`) ; components/HomeScreen.vue:255-275,380-455 (modèle de déclaration des items de sidebar)]
- [Source: 1score/src/stores/useGameStore.ts:486-530,623-641 — `finishGame`, `rematch`, `resetGame` ; types/game.ts:1-25 ; types/ui.ts]
- [Source: 1score/src/components/GameSummary.test.ts:40-46,120-160 ; views/GameView.test.ts:1057-1115,1281-1291]
- Mémoire projet « Validation visuelle Chrome », « Paysage uniquement », « Revues groupées en fin d'Epic 10 », « Direction visuelle anguleuse et bleue », « Références visuelles par story »

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`) — workflow `bmad-dev-story`, 2026-09-14.

### Debug Log References

- `npm test` : **663 tests verts** (23 fichiers) — 659 à l'arrivée, +4 cas ajoutés.
- `npm run build` (`vue-tsc -b && vite build`) : vert.
- `git diff --stat src/stores/` : **vide** (AC8) — `useGameStore.ts` et `useGameStore.test.ts` n'ont pas été ouverts.
- Passe navigateur : Chrome « Browser 1 (macOS) », `npm run dev`, harnais `public/_viewport-harness.html` (supprimé en fin de passe), trois formats paysage 1133×744 · 1194×834 · 1920×1080.

### Completion Notes List

**Ce qui a été implémenté**

- **Coquille (AC1)** — la branche `finished` de `GameView` gagne `<div class="flex min-h-0 flex-1 bg-(image:--gradient-bg)">` + `SideBar` + `<main class="… p-4">`, sur le modèle des trois étapes de `HomeScreen`. `GameSummary` perd `bg-bg` et devient le **panneau de contenu** : `border border-border bg-surface`, aucune classe de rayon. `bg-surface` a suffi au rendu, le repli `--gradient-panel` n'a pas été nécessaire.
- **Barre latérale (AC2)** — `SUMMARY_SIDEBAR_ITEMS` (`RECOMMENCER`, `rotate-ccw`, `rematch()`) et `SUMMARY_SIDEBAR_EXIT` (`QUITTER`, `door`, `resetGame()`) déclarées dans `GameView`, deux closures d'une ligne. Le `<nav data-testid="summary-bar">` provisoire de la 10.4 et ses deux boutons sont supprimés. `SideBar.vue` et `SideBar.test.ts` **n'ont pas bougé** : c'est son quatrième écran consommateur.
- **DT6 (AC3)** — `{{ name }} / {{ targetScore }}` éclaté en deux éléments : `summary-name` en `min-w-0 truncate`, filet `<span class="h-4 w-px bg-border-strong">`, `summary-distance` en `shrink-0 tabular-nums`, nombre **nu**. `min-w-0` posé aussi sur le conteneur `summary-player1|2`, qui conserve son `data-testid`.
- **Pastilles (AC4)** — `BALL_CLASSES` → `BALL_PICTOS` (table littérale), quatre `<img src alt="" aria-hidden="true" class="size-5 shrink-0 object-contain">` dans le bandeau et la ligne `RÉSULTAT`. Plus aucun `bg-player-*` ni `rounded-full` (le badge `★ RECORD` a perdu le sien au passage — angles vifs).
- **Documents (Task 7)** — `epics.md` (Story 10.5, UX-DR31, UX-DR13, DT6, note 7 de la 10.4), `ux-design-specification.md` (§10.2 table, §10.3 Récap, §10.4 table, fiche `GameSummary`), `architecture.md` (bloc « Livré en Story 10.5 »), `deferred-work.md` (**DT6 barré, clos**).

**Passe de validation visuelle — aucun défaut trouvé**

Contrairement aux 10.3 (six passes) et 10.4 (cinq, dont deux défauts CSS invisibles en test), rien n'a dû être corrigé. Mesuré, pas regardé :

| Vérification | 1133×744 | 1194×834 | 1920×1080 |
|---|---|---|---|
| Débordement / défilement | 0 / 0 | 0 / 0 | 0 / 0 |
| **DT6** — nom de 20 `W` | tronqué (193 / 455 px), distance **entière** | tronqué (218 / 480 px), distance **entière** | tient entier (482 px), distance entière |
| Items de sidebar | 119×90 | 119×90 | 119×90 |
| Libellés `RECOMMENCER` / `QUITTER` | non tronqués, une ligne | idem | idem |
| `QUITTER` calé en bas | bas à 720 / 744 | bas à 810 / 834 | bas à 1056 / 1080 |
| Cinq lignes alignées entre les trois colonnes | ✅ | ✅ au pixel (273·383·493·604·714) | ✅ |

- **Pastilles PNG** : rendues 40×40 sur des sources 512×512 (`object-contain`), nettes et non déformées sur le ruban rouge comme sur le neutre.
- **Trois issues vérifiées** : victoire à gauche, victoire à droite (`whiteSide: 'right'` — les colonnes **et** le bandeau suivent, AC5), égalité (deux colonnes neutres, `ÉGALITÉ` des deux côtés).
- **Parcours réel** : accueil → `JEUX DE SÉRIES` → `LIBRE` → distances 2 et 2 → `DÉMARRER` → distance atteinte → `FIN DE PARTIE` → récap ; `RECOMMENCER` → **scoreboard neuf, mêmes joueurs, mêmes distances, mêmes côtés, REP 1** ; sortie manuelle `QUITTER` (barre basse) → « TERMINER LA PARTIE ? » → `VOIR LE RÉCAP` ; `QUITTER` (sidebar) → **accueil**. Les deux pictos `door` (barre basse et sidebar) se lisent bien comme la même action.
- **AC6 vérifié au navigateur** : deux taps hors sidebar (milieu du récap, bandeau) laissent `status === 'finished'`.
- **Reprise (Story 1.12)** : rechargement sur un récap affiché → « PARTIE EN COURS » → `REPRENDRE` → récap restauré **avec sa sidebar**.

**Points de rendu pour Nathan (aucun n'est un écart aux AC)**

1. **Les deux rouges se côtoient pour la première fois** — `--color-brand-red` (#D0343F, bandeau de l'en-tête de sidebar) et `--color-victory-ribbon` (#E63946, colonne gagnante). À l'écran ils se distinguent et ne jurent pas, mais c'est un arbitrage qui te revient : ils restent deux tokens séparés, rien n'a été fusionné.
2. **Le bandeau fait 153 px de haut** au 1194×834, la hauteur venant du `VS` en `text-reprise`. Hérité de la 1.10, non touché — la 10.4 avait fait passer le bandeau de carte à hauteur libre pour le même motif.
3. **Les colonnes restent espacées** (`gap-2` = 16 px, `p-4` = 32 px autour) alors que la direction de l'epic dit « coller plutôt qu'espacer, filets entre éléments jointifs ». AC7 demandait de conserver le format Billiboard : je ne l'ai pas retouché de ma propre initiative.

**Écarts assumés** — décisions 1 à 4 de Nathan (références `billiboard_recap*` seules ; `RECOMMENCER` en item / `QUITTER` en sortie, contre la lettre d'UX-DR31 ; pastilles aux PNG ; aucune confirmation) et **portrait caduc** pour toute l'epic. Tous consignés dans `epics.md`, `ux-design-specification.md` et `architecture.md` (Task 7). Cinquième écart, d'architecture : **la `SideBar` est posée par `GameView`**, alors que la spec UX §10.4 la range sous `GameSummary` — ce dernier reste strictement présentationnel, comme AC6 l'exige.

**1re passe de rendu (Nathan, 2026-09-14)** — trois ajustements demandés au vu du rendu, aucun changement de règle ni de store :

1. **Plus de pastille de bille dans le bandeau.** La bille se lit déjà dans la ligne `RÉSULTAT` ; la dire deux fois volait la place au nom. Il en reste **une par joueur**, dans sa cellule `RÉSULTAT`.
2. **Nom et distance grossis** de `text-label` (16–24 px) à `text-tile-title` (28–36 px). ⚠️ **DT6 reste clos** : remesuré aux trois formats avec 20 `W` — 1133 : nom 233 px pour 683 de contenu, 1194 : 257 pour 719, distance entière partout. Grossir la police déplace le seuil de troncature, pas la mécanique (`min-w-0` sur le span **et** son conteneur).
3. **Les cinq statistiques deviennent des BLOCS séparés** (réf. `billiboard_recap_2` fournie par Nathan) : `gap-1` = 8 px entre les cellules, le fond se voit au travers, et l'aplat de couleur passe de la **colonne** à la **cellule** (constantes `CELL_CLASSES` / `LABEL_CELL_CLASSES`). La colonne de libellés prend le même `bg-white/6` que la colonne perdante, comme sur la référence. **Écart assumé à UX-DR13**, qui justifiait les colonnes pleines par « des colonnes, pas une grille de lignes » — la colonne victorieuse se lit toujours d'un bloc, rayée de fins traits de fond. **Nouvel ordre : `RÉSULTAT` · POINTS · REPRISES · MOY · SÉRIE.**

*Effet sur les tests* : `column(…).classes()` ne porte plus `bg-victory-ribbon` — deux cas de `GameSummary.test.ts` (vérification des cinq cellules) et un de `GameView.test.ts` visent désormais les cellules ; un cas verrouille l'ordre des libellés **et** celui des cellules, les deux devant rester alignés. **663 tests verts**, build vert, `src/stores/` toujours intact. Passe navigateur refaite aux trois formats : aucun débordement (blocs de 87 px au 1133, 104 au 1194, 146 au 1920), égalité et victoires des deux côtés revérifiées.

*Les points 2 et 3 de « Points de rendu pour Nathan » ci-dessus (hauteur du bandeau, colonnes espacées) sont **caducs** : le bandeau a grossi et les blocs sont désormais espacés volontairement. Le point 1 (les deux rouges voisins) reste ouvert.*

**2e passe de rendu (Nathan, 2026-09-14)** — deux ajustements :

1. **Toutes les valeurs à la même taille.** `POINTS` tenait seul en `text-reprise` (48–120 px) et écrasait les quatre autres lignes ; il passe en `text-label` comme elles. Le `VS` du bandeau descend au passage de `text-reprise` à `text-hero` : **le bandeau perd 50 px** (153 → 103 au 1194×834) et les cinq blocs y gagnent (104 → 122 px). Le cas NFR10 qui verrouillait `text-reprise` sur `summary-points` vérifie désormais que les **quatre** valeurs portent `text-label` et aucune `text-reprise`.
2. **Bandeau en BANDE CLAIRE fendue en biais** (réf. `billiboard_recap` fournie par Nathan). Nouveau token **`--color-banner` (#F2F0EA)** — blanc cassé, pas blanc pur : c'est le seul aplat clair de l'app hors cartes joueur, et l'écran vit en salle sombre. Les deux couples `NOM | distance` s'y posent en `--color-bg` (contraste ≈ 17:1). Deux `clip-path` symétriques s'écartent vers le bas et ménagent l'**échancrure** où se logent le `VS` et le surtitre de mode, sur le fond sombre — même grammaire que l'en-tête de `SideBar` (coupe en biais). Le filet entre nom et distance passe de `bg-border-strong` à `bg-bg/30` : un filet blanc translucide est invisible sur un aplat clair.

*Deux pièges payés ici* : le rembourrage des bandes doit être **asymétrique** (`pl-4 pr-10` / `pl-10 pr-4`), sinon la distance passe sous le biais — mesuré au 1194, elle s'arrête à 507 px pour une bande finissant à 587, soit 80 px de marge pour un biais de 32. Et **DT6 a été revérifié une troisième fois** sur le fond clair : nom tronqué (1133 : 160 / 683 px ; 1194 : 199 / 719 px), distance entière aux trois formats. **664 tests verts**, build vert, `src/stores/` intact.

**3e passe de rendu (Nathan, 2026-09-14)** — un seul ajustement : **le texte de la colonne victorieuse passe en BLANC**. `--color-on-victory-ribbon` : `#000000` → `#FFFFFF`. Partout ailleurs dans l'app le texte est blanc, et la colonne perdante juste à côté l'est aussi — le noir se lisait comme une inversion.

⚠️ **À savoir pour la passe contraste AA (Story 10.7)** : sur `--color-victory-ribbon` (#E63946), le blanc donne **4,17:1** et le noir **5,04:1** — le blanc est donc le choix le MOINS contrasté des deux. Il passe AA pour les tailles employées ici (tout est en `text-label`, ≥ 24 px et gras, donc « grand texte », seuil 3:1) mais **pas** le seuil 4,5:1 du texte courant. Deux conséquences à retenir : ne pas descendre la taille de ces valeurs sans revoir la teinte, et si le seuil 4,5 est visé, assombrir le ruban vers `--color-brand-red` (#D0343F) porterait le blanc à 4,95:1. Consigné dans `main.css` au-dessus du token.

**664 tests verts**, build vert, `src/stores/` intact.

**Non traité ici, volontairement** — les cinq assertions de `GameView.test.ts` visant `[data-testid="prompt-close"]`, testid qu'aucun composant n'émet (sujet de la revue de fin d'epic) ; les reports de la 10.7 (DT3, contraste AA, plafonds de `clamp()`, `--color-shot-clock-face`).

### File List

- `1score/src/components/GameSummary.vue` — modifié
- `1score/src/components/GameSummary.test.ts` — modifié
- `1score/src/views/GameView.vue` — modifié
- `1score/src/views/GameView.test.ts` — modifié
- `_bmad-output/planning-artifacts/epics.md` — annoté (Task 7)
- `_bmad-output/planning-artifacts/ux-design-specification.md` — annoté (Task 7)
- `_bmad-output/planning-artifacts/architecture.md` — annoté (Task 7)
- `_bmad-output/implementation-artifacts/deferred-work.md` — DT6 clos (Task 7)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — statut de la story
- `_bmad-output/implementation-artifacts/10-5-refonte-du-recap-barre-laterale-et-bandeau-corrige.md` — ce fichier

*Aucun fichier créé ni supprimé. `1score/public/_viewport-harness.html` a existé le temps de la passe navigateur et a été supprimé.*

## Change Log

| Date | Version | Description | Auteur |
|---|---|---|---|
| 2026-09-14 | 0.1 | Story créée (bmad-create-story) — décisions de Nathan : références `billiboard_recap*`, `RECOMMENCER` en item / `QUITTER` en slot de sortie, pastilles aux assets PNG du paramétrage, aucune confirmation | Nathan / Claude Opus 5 |
| 2026-09-14 | 1.0 | Story livrée (dev-story) — coquille de l'epic + `SideBar` (`RECOMMENCER` item / `QUITTER` sortie), `<nav>` provisoire de la 10.4 supprimé, **DT6 clos** (nom et distance dissociés), pastilles aux PNG de bille. 663 tests verts, build vert, `src/stores/` intact. Passe navigateur aux trois formats paysage, trois issues : aucun défaut. | Nathan / Claude Opus 5 |
| 2026-09-14 | 1.1 | 1re passe de rendu (Nathan) — pastilles retirées du bandeau, nom et distance en `text-tile-title`, cinq statistiques en blocs séparés de 8 px (aplat porté par la cellule, écart assumé à UX-DR13), ordre `RÉSULTAT` · POINTS · REPRISES · MOY · SÉRIE. DT6 remesuré et toujours clos. 663 tests verts. | Nathan / Claude Opus 5 |
| 2026-09-14 | 1.2 | 2e passe de rendu (Nathan) — toutes les valeurs à la même taille (`POINTS` quitte `text-reprise`, bandeau allégé de 50 px), bandeau en bande claire `--color-banner` fendue par une échancrure en biais où se loge le VS. DT6 revérifié sur fond clair. 664 tests verts. | Nathan / Claude Opus 5 |
| 2026-09-14 | 1.3 | 3e passe de rendu (Nathan) — texte de la colonne victorieuse en blanc (`--color-on-victory-ribbon` #000000 → #FFFFFF). Chiffres de contraste consignés pour la passe AA de la 10.7. 664 tests verts. | Nathan / Claude Opus 5 |
