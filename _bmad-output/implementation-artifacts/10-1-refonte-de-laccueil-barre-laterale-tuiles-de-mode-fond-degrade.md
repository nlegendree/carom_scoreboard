# Story 10.1: Refonte de l'accueil — barre latérale, tuiles de mode, fond dégradé

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur qui arrive devant la tablette du club,
I want un accueil 1Score premium — barre latérale, accroche, quatre tuiles de mode colorées sur un fond dégradé,
so that je reconnais le produit au premier regard et je choisis mon jeu d'un seul tap, sans rien lire (NFR12).

> **Cadrage (bmad-create-story, 2026-09-11).** Première story visuelle de l'Epic 10 (la 10.6 est livrée). Elle pose les fondations de l'epic : tokens, dégradé, `SideBar`, `ModeTile`, état BIENTÔT, jeu de pictos. **Périmètre : l'étape `category` de `HomeScreen` seulement.** Les étapes `mode` et `players`, le scoreboard et le récap gardent leur rendu actuel, barre basse comprise. Aucune règle de jeu, aucun état du store, aucune persistance ne change. Exigences : AR20, AR26 (item inerte), UX-DR25 à UX-DR35 (UX-DR32 reporté).

> **Décisions de Nathan à la création de la story (2026-09-11)** — elles priment sur les valeurs indicatives de la spec UX §10 et d'`epics.md`, tous deux annotés :
> 1. **Référence visuelle : `explore/resources/cueuny_home.png` seule.** À en retenir : colonne gauche sombre à pleine hauteur ; items picto au-dessus d'un libellé court, centrés ; sortie (« 앱 종료 », picto marche/arrêt) isolée en bas ; tuiles en rangée basse, titre en haut à gauche, flèche dans un rond en bas à droite. **Ne pas reprendre** : la bannière publicitaire, le fond clair, le logo en bas de colonne (chez nous l'en-tête porte le logo en haut).
> 2. **Police : `system-ui` pour l'instant.** Aucune police display n'est ajoutée : le mot `1Score`, l'accroche et les titres de tuiles sont en `font-black` système. Pas de fichier `.woff2`.
> 3. **Textes** : accroche **« À vous de jouer. »** ; **aucune accroche** sur les tuiles `3 BANDES` et `JEUX DE SÉRIES` (titre + flèche) ; `QUILLES` et `CASIN` n'ont que le badge ; libellé **`BIENTÔT` partout** (pas de « COMING SOON »).
> 4. **Logo : `1score/public/logo.png`, remplacé par Nathan** (carré sombre arrondi `#252525`, « 1S » blanc, 900×900, coins transparents). Il occupe l'en-tête de la sidebar. Le repli « rond `--color-cloth` portant 1 » est **abandonné**.
> 5. **Drap : `--color-cloth` = `#0573BB`**, médiane des pixels de `explore/resources/simonis-prestige.gif` hors texte blanc (la moyenne brute, `#2082C1`, est éclaircie par le mot « Prestige »). Remplace la valeur indicative `#2F6FB8`.

> **Décisions de Nathan en passe de rendu (2026-09-11)** — prises et validées au rendu dans Chrome. Elles **priment sur les AC 1, 2, 3, 4, 7 et 11 et sur le § « Validation visuelle »** ci-dessous, ainsi que sur la spec UX §10 et `epics.md`, qui sont annotés :
> 6. **Paysage uniquement, jamais de portrait.** Formats : iPad mini 1133×744, iPad 11″ 1194×834, écran 21,5″ 1920×1080 (cible d'installation à terme). Toute exigence propre au portrait est caduque : colonne de 96 px, grille 2×2, format 768×1024. Le manifest passe en `orientation: 'landscape'` et CLAUDE.md §9 est mis à jour.
> 7. **Angles vifs** : `--radius-container` et `--radius-cta` passent à `0px`. Plus de rond autour de la flèche des tuiles, plus de badge en pilule.
> 8. **Barre latérale collée au bord** (modèle Cueuny) : aplat `--color-sidebar` `#101318`, filet à droite, sans marge, contour ni fond translucide. **En-tête rouge en biais** : `--color-brand-red` `#D0343F`, coupe diagonale plus basse à droite et pli translucide, 120 px de haut. Libellés sans interlettrage, marge basse de 24 px.
> 9. **Tuiles collées** à la barre, aux bords de l'écran et entre elles, séparées d'un filet `--color-border` (modèle Billiboard). **Nuances de bleu en dégradé**, de la plus claire (`3 BANDES`) à la plus sombre (`CASIN`) : `--gradient-tile-*` remplace `--color-tile-*`. La tuile s'éclaircit au survol et à l'appui ; en BIENTÔT, le calque de dégradé passe à 45 %. La marge de 16 px autour de l'écran disparaît.
> 10. **Fond gris/noir** : `--gradient-bg` = `linear-gradient(160deg, #2A2E35 0%, #111317 55%, #000000 100%)`. Nathan envisage de le retravailler plus tard pour le rendre plus engageant.

## Acceptance Criteria

1. **Tokens** — **Given** `1score/src/assets/main.css` **When** la story est livrée **Then** les tokens UX-DR27 sont déclarés dans un bloc `@theme static` dédié à l'Epic 10 : `--color-cloth: #0573BB`, `--color-surface: rgba(255,255,255,0.06)`, `--color-border: rgba(255,255,255,0.18)`, `--color-border-strong: rgba(255,255,255,0.40)`, `--radius-container: 20px`, `--radius-cta: 16px`, `--color-tile-3b: var(--color-cloth)`, `--color-tile-jds: #1E8A5A`, `--color-tile-quilles: #E8842B`, `--color-tile-casin: #7B4FD1`, `--color-panel-white-band: #ECECEC`, `--color-panel-yellow-band: #E6B000`, `--gradient-bg: linear-gradient(160deg, var(--color-cloth) 0%, #0B1B33 55%, #000000 100%)` ; **tous** figurent dans `dist/assets/*.css` après `npm run build`, y compris ceux qu'aucun écran n'utilise encore.
   *Précision de la création de story : l'AC d'`epics.md` dit « n'importe quel écran » ; le dégradé est **déclaré** pour toute l'app mais **appliqué à l'accueil seulement** ici. Chaque écran le reçoit avec sa story (10.2, 10.3, variante assombrie en 10.4, 10.5), sinon on changerait le rendu d'écrans hors périmètre.*
2. **Coquille de l'accueil** — **Given** l'étape `category` **When** elle s'affiche **Then** son fond est `--gradient-bg`, sans image de fond ; une marge de 16 px sépare le contenu des quatre bords, le dégradé restant visible autour ; rien ne défile ni ne déborde en paysage 1024×768, en portrait 768×1024 et en iPad paysage avec barre Safari 1180×673.
3. **`SideBar` : colonne et en-tête** — **Given** l'accueil **When** il s'affiche **Then** `SideBar` occupe la colonne gauche : 96 px de large en portrait, 120 px en paysage, toute la hauteur utile, conteneur à contour de 2 px `--color-border`, rayon `--radius-container`, fond `--color-surface` **And** son en-tête, haut de 96 px, porte `<img src="/logo.png" alt="1Score">` au-dessus du mot `1Score` (`font-black`) **And** l'en-tête n'est pas un bouton : le taper ne fait rien.
4. **`SideBar` : items de l'accueil** — **Given** l'accueil **When** il s'affiche **Then** `ENTRAÎNEMENT` (picto cible) et `INSCRIPTION` (picto silhouette +) sont empilés sous l'en-tête, picto au-dessus du libellé, chacun ≥ 90×90 px, pleine largeur, 12 px d'écart, tous deux en état BIENTÔT **And** `FERMER L'APPLICATION` (picto marche/arrêt, libellé sur deux lignes) est calé **en bas** de la colonne, isolé du reste, en état BIENTÔT — aucune pop-up, aucun spike (AR26, UX-DR32 reportés hors Epic 10) **And** aucun libellé n'est coupé ni ne déborde de la colonne, en portrait comme en paysage.
5. **État BIENTÔT** — **Given** un item de sidebar ou une tuile en état BIENTÔT **When** il s'affiche puis qu'on le tape **Then** item : picto et libellé à 45 % d'opacité, petit badge `BIENTÔT` sous le libellé ; tuile : fond à 45 %, badge `BIENTÔT` à la place de la flèche **And** le contrôle porte `disabled` **et** le handler est gardé : le tap n'a **aucun effet** (ni navigation, ni pop-up, ni haptique).
6. **Accroche** — **Given** l'accueil **When** il s'affiche **Then** la zone principale montre en haut « À vous de jouer. » (`text-hero`, fluide de 40 à 56 px, `font-black`, blanc, aligné à gauche, 32 px de marge gauche, sans sous-texte).
7. **Tuiles** — **Given** l'accueil **When** il s'affiche **Then** la bande basse porte quatre `ModeTile`, dans l'ordre `3 BANDES` (`--color-tile-3b`), `JEUX DE SÉRIES` (`--color-tile-jds`), `QUILLES` (`--color-tile-quilles`), `CASIN` (`--color-tile-casin`) : conteneur à contour 2 px `--color-border`, rayon `--radius-container`, fond de sa couleur à 85 %, titre `text-tile-title` (28 à 36 px) `font-black` en haut à gauche, sur deux lignes au plus et jamais coupé, flèche `→` en bas à droite, **sans accroche** **And** `QUILLES` et `CASIN` sont en état BIENTÔT (AC5) **And** en **paysage**, une rangée de quatre tuiles de hauteur égale, ≈ 34 % de la hauteur utile et ≥ 180 px **And** en **portrait**, une grille 2×2, chaque tuile ≥ 180 px de haut.
   *Écart assumé à la spec (« une rangée de 4 tuiles »), à valider au rendu avec Nathan : en portrait il reste ≈ 624 px pour quatre tuiles, soit ≈ 144 px chacune, trop étroit pour « JEUX DE SÉRIES » à 28 px.*
8. **Veille** — **Given** l'accueil **When** il reste affiché **Then** rien ne bouge ni ne clignote : aucune animation ni transition sur l'étape `category`.
9. **Navigation** — **Given** l'accueil **When** je tape `3 BANDES` **Then** j'arrive directement à l'étape joueurs, mode `3bandes` **And When** je tape `JEUX DE SÉRIES` **Then** j'arrive à l'étape `mode`, rendu actuel (en-tête `h1`, grille, barre basse avec `RETOUR`) **And** `RETOUR` depuis `mode` ramène au **nouvel** accueil.
10. **Reprise de partie** — **Given** une sauvegarde au lancement **When** l'accueil s'affiche **Then** la pop-up « PARTIE EN COURS » se comporte exactement comme aujourd'hui (Story 1.12), par-dessus le nouvel accueil (`GameView.test.ts` vert sans modification).
11. **Nettoyage et tests** — **Given** la story livrée **When** les tests tournent **Then** la barre d'action basse n'est plus rendue sur l'étape `category` ; le champ `hint` du catalogue, qu'aucun écran n'affiche plus, est retiré ; les `data-testid` `step-category` et `category-<id>` sont **conservés** ; `SideBar`, `ModeTile` et `PictoIcon` ont leur test co-localisé (AR16) ; `HomeScreen.test.ts` est adapté ; `npm test` et `npm run build` (dont `vue-tsc -b`) passent ; le rendu est vérifié dans Chrome aux trois formats de l'AC2.

## Tasks / Subtasks

- [x] **Task 1 — Tokens (AC: 1)**
  - [x] 1.1 `main.css` : **nouveau** bloc `@theme static { … }` après le `@theme` existant, commenté « Epic 10 — Bloc Plein contenu (UX-DR27) », avec les 13 tokens de l'AC1. `static` force l'émission de toutes les variables : Tailwind 4.3 **élague** les variables de thème inutilisées (vérifié : `--color-on-alert` et `--color-victory-gold` sont absents du CSS construit aujourd'hui). Sans `static`, les bandeaux de carte (10.4) et `--gradient-bg` disparaîtraient du CSS.
  - [x] 1.2 Dans le `@theme` **existant**, trois tokens typographiques à côté des `--text-*` : `--text-hero: clamp(40px, 5vw, 56px)`, `--text-tile-title: clamp(28px, 3vw, 36px)`, `--text-picto: clamp(11px, 1.1vw, 12px)`. Ne pas toucher `--color-bg` ni `:root` : le scoreboard et le récap en dépendent.
  - [x] 1.3 Après `npm run build` : `grep -o -- "--color-cloth:[^;]*\|--gradient-bg:[^;]*\|--color-panel-yellow-band:[^;]*" dist/assets/*.css` renvoie les trois. Si `@theme static` n'est pas accepté, repli : même bloc dans `:root` pour les variables sans utilitaire (`--gradient-bg`, bandeaux), et le consigner.
- [x] **Task 2 — Pictos (AC: 3, 4, 7)**
  - [x] 2.1 `src/types/ui.ts` (nouveau) : `export type PictoName = 'training' | 'signup' | 'power' | 'arrow-right'`, `export type ItemState = 'normal' | 'soon'`, `export interface SideBarItem { id: string; picto: PictoName; label: string; state: ItemState; action?: () => void }`.
  - [x] 2.2 `src/components/PictoIcon.vue` (nouveau) : prop `name: PictoName` ; rend `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` avec un `<path>` par tracé, depuis une table `Record<PictoName, readonly string[]>` (exhaustive par typage). La taille vient de la classe posée par le parent (`size-4` = 32 px). Tracés au § « Pictos » des Dev Notes.
  - [x] 2.3 `PictoIcon.test.ts` : un `<path>` par tracé pour chaque nom, `aria-hidden="true"`, trait `2`, `fill="none"`.
- [x] **Task 3 — `SideBar` (AC: 3, 4, 5)**
  - [x] 3.1 `src/components/SideBar.vue` (nouveau), purement présentationnel : props `items: SideBarItem[]`, `exitItem?: SideBarItem`. En-tête logo + mot, liste d'items, sortie calée en bas (`mt-auto`). Squelette au § « SideBar » des Dev Notes. **Aucun contenu d'écran codé dans la barre** (UX-DR31) : l'écran fournit ses items.
  - [x] 3.2 Item `normal` : `<button type="button">` avec `@pointerdown` qui appelle `item.action?.()`. Item `soon` : `disabled`, `opacity-45` sur picto et libellé, badge `BIENTÔT`, et garde `if (item.state === 'soon') return` dans le handler (voir « Pièges »).
  - [x] 3.3 `SideBar.test.ts` (rouge d'abord) : en-tête avec `img[alt="1Score"]` et texte `1Score` ; un tap sur l'en-tête n'appelle rien ; items rendus dans l'ordre avec `data-testid="sidebar-item-<id>"` ; un item `normal` appelle son `action` au `pointerdown` ; un item `soon` est `disabled`, montre `BIENTÔT`, porte `opacity-45`, et n'appelle **pas** son `action` même si elle est fournie ; `exitItem` est rendu dans le groupe du bas, après les items, et absent quand la prop manque.
- [x] **Task 4 — `ModeTile` (AC: 5, 7)**
  - [x] 4.1 `src/components/ModeTile.vue` (nouveau) : props `title: string`, `color: 'tile-3b' | 'tile-jds' | 'tile-quilles' | 'tile-casin'`, `soon?: boolean`, `tagline?: string` (contrat UX-DR34 ; rendue seulement si fournie, l'accueil n'en passe pas). Racine unique `<button type="button">` pour que le `data-testid` posé par le parent retombe dessus. Emit `select`, gardé par `soon`.
  - [x] 4.2 Classes de couleur **écrites en toutes lettres** dans une table (scanner Tailwind, même motif que `BALL_CLASSES` de `PromptModal.vue:31-34`) : `bg-tile-3b/85` et `bg-tile-3b/45`, etc. Flèche : `PictoIcon name="arrow-right"` dans un rond à contour ; en BIENTÔT, badge `BIENTÔT` à la place.
  - [x] 4.3 `ModeTile.test.ts` : titre rendu ; flèche présente et badge absent hors BIENTÔT ; `soon` → `disabled`, badge présent, flèche absente, classe `/45`, **aucun** `select` au `pointerdown` ; hors BIENTÔT → `select` émis une fois, classe `/85` ; `tagline` rendue seulement si fournie.
- [x] **Task 5 — `HomeScreen`, étape `category` (AC: 2, 6, 7, 8, 9, 10, 11)**
  - [x] 5.1 Découper le template : `v-if="step === 'category'"` → **nouvelle coquille** (gradient, `p-2`, `SideBar` + zone principale) ; `v-else` → **coquille actuelle inchangée** (`bg-bg`, `<header>` avec le `h1`, `<main>` des étapes `mode`/`players`, `ActionBar`). Retirer du `<header>` l'`<img>` du logo et sa condition `step === 'category'`, devenue morte. Garder un conteneur racine unique qui englobe les deux branches **et** les pop-ups (`PlayerSetupModal`, `PromptModal`). Squelette au § « HomeScreen » des Dev Notes.
  - [x] 5.2 Constantes d'écran dans `HomeScreen.vue` : `HOME_SIDEBAR_ITEMS` (`training`/`ENTRAÎNEMENT`, `signup`/`INSCRIPTION`, tous deux `soon`) et `HOME_SIDEBAR_EXIT` (`close-app`/`FERMER L'APPLICATION`/`power`, `soon`) ; `HOME_TILES`, ordre et couleur : `3bandes`→`tile-3b`, `series`→`tile-jds`, `quilles`→`tile-quilles`, `casin`→`tile-casin`, résolus contre `GAME_CATEGORIES` par `id`. Titre = `category.label`, `soon = !isCategoryAvailable(category)`, `@select="selectCategory(category)"` (garde et logique inchangées).
  - [x] 5.3 `types/game.ts` : retirer `hint` de `CATALOG` et de `GameCategoryDescriptor` ; `git grep -n "hint" 1score/src` doit être vide ensuite.
  - [x] 5.4 `HomeScreen.test.ts` : « shows the logo on the home step only » cible désormais la sidebar (`[data-testid="sidebar"]` et `img[alt="1Score"]` présents sur `category`, absents sur `mode`) ; « hides the back button on the root step only » garde son attente, commentaire mis à jour (plus de barre du tout sur l'accueil) ; nouveaux cas : ordre des tuiles `3bandes, series, quilles, casin` ; trois items de sidebar BIENTÔT et `disabled`, dont `close-app` dans le groupe du bas ; taper chacun laisse `step-category` affiché ; `action-bar` absente de l'accueil (poser `data-testid="action-bar"` sur la `<nav>` d'`ActionBar` si besoin) ; accroche « À vous de jouer. » présente. Les autres tests (catégories désactivées, 3 Bandes direct, parcours joueurs) passent **sans changement d'attente**.
  - [x] 5.5 `GameView.test.ts` : **aucune modification attendue** (il presse `category-series`/`category-3bandes` et cherche `step-category`). S'il casse, c'est un testid perdu : corriger le composant, pas le test.
- [x] **Task 6 — Documentation (AC: 1, 11)**
  - [x] 6.1 `1score/CLAUDE.md` §7, paragraphe des tokens typographiques : ajouter `text-hero` (accroche d'accueil), `text-tile-title` (titre de tuile), `text-picto` (libellé sous picto), et une phrase : les tokens de conteneur de l'Epic 10 (`--color-surface`, `--color-border*`, `--radius-container`/`--radius-cta`, `--color-tile-*`, `--gradient-bg`) vivent dans le bloc `@theme static` de `main.css`. La description complète des composants de l'epic revient à la 10.7.
  - [x] 6.2 `_bmad-output/planning-artifacts/architecture.md`, section « Navigation & Shell (Epic 10, V1.1) » : note « *Livré en Story 10.1 (date)* : `SideBar` (props `items`/`exitItem`, `SideBarItem` dans `types/ui.ts`, contenu fourni par l'écran), `ModeTile`, `PictoIcon` (jeu de pictos SVG inline), tokens en `@theme static`, `--color-cloth` `#0573BB`, logo `public/logo.png` ; dégradé appliqué écran par écran. » Ajouter `SideBar.vue`, `ModeTile.vue`, `PictoIcon.vue` (+ tests) et `types/ui.ts` à l'arborescence.
- [x] **Task 7 — Contrôle final (AC: 1-11)**
  - [x] 7.1 `npm test` (**502** tests au dernier commit `cf87a1a`, plus les nouveaux) et `npm run build` verts ; contrôle 1.3 des variables.
  - [x] 7.2 **Icônes PWA** : `pwa-assets.config.ts` génère les icônes depuis `public/logo.png`, que Nathan vient de changer. Après le build, ouvrir `dist/pwa-192x192.png` et `dist/apple-touch-icon-180x180.png` : le « 1S » ou les anciennes trois billes ? Consigner le constat dans les Completion Notes et le **signaler à Nathan** ; ne rien régénérer ni supprimer dans `public/` sans son accord (hors périmètre).
  - [x] 7.3 **Passe navigateur** (CLAUDE.md §9, une seule, en fin de story) : voir le § « Validation visuelle » des Dev Notes.

## Dev Notes

### État du code à l'arrivée (commit `cf87a1a`)

- `HomeScreen.vue` (320 lignes) : `step: 'category' | 'mode' | 'players'` local ; racine `flex h-full w-full flex-col bg-bg` = `<header>` (logo `img` sur `category`, `h1` du titre sur `mode`/`players`) + `<main>` (trois sections `v-if`) + `ActionBar` (`showBack` faux sur `category`) + `PlayerSetupModal` + `PromptModal` « DISTANCE MANQUANTE ». Catégories : grille `grid-cols-2 md:grid-cols-4` de `<button :disabled>` affichant `label`, `hint` et `BIENTÔT`.
- `GameView.vue:235-251` : racine `flex h-dvh w-full flex-col` **sans fond** (le `:root` peint `--color-bg`) ; en `idle` elle rend `<HomeScreen />` puis la `PromptModal` « PARTIE EN COURS » (`fixed inset-0 z-50`, donc au-dessus de toute la coquille). Rien à changer dans `GameView`.
- Catalogue `types/game.ts` : ordre `series, 3bandes, quilles, casin` — l'ordre des tuiles (`3bandes` d'abord) est donc une donnée de **présentation**, portée par `HomeScreen`. `hint` n'est lu que par `HomeScreen.vue:203`.
- Aucune police, aucun composant d'icône : les SVG existants (sortie, recommencer) sont écrits en ligne, en double, dans `GameView.vue:316-414`. **Ne pas les migrer ici** : c'est la 10.4, avec `IconAction`.
- `public/logo.png` : **modifié par Nathan, non committé** (`git status` : ` M 1score/public/logo.png`) ; `explore/resources/simonis-prestige.gif` non suivi. Les deux partent dans le commit de la story.

### Tailwind dans ce projet — à relire avant d'écrire une classe

- **`--spacing` vaut 8 px** (CLAUDE.md §7) : `p-2` = 16 px (marge d'écran), `gap-2` = 16 px, `gap-1.5` = 12 px (écart des items), `pl-4` = 32 px (marge de l'accroche), `w-12` = 96 px, `w-15` = 120 px, `h-12` = 96 px (en-tête), `size-4` = 32 px (picto), `size-6` = 48 px (logo). Ne **pas** écrire `w-[120px]` quand l'échelle tombe juste ; `min-h-[180px]` (tuile) et `min-h-[var(--size-touch-target)]` (item, 90 px) restent en valeurs arbitraires.
- **Orientation** : Tailwind 4.3.3 fournit `portrait:` et `landscape:` (présents dans `node_modules/tailwindcss/dist/lib.js`). Largeur de la sidebar : `w-12 landscape:w-15` ; tuiles : `grid-cols-2 landscape:grid-cols-4`. Dans le harnais, l'orientation suit la taille de l'`iframe` : c'est ce qu'on veut. **Ne pas** utiliser `md:` pour l'orientation (768 px est `md` dans les deux sens).
- **Utilitaires générés par les tokens** : `bg-surface`, `border-border`, `border-border-strong`, `rounded-container`, `rounded-cta`, `bg-tile-jds/85` (modificateur d'opacité en `color-mix`, fonctionne aussi avec `--color-tile-3b: var(--color-cloth)`), `text-hero`, `text-tile-title`, `text-picto`, `opacity-45` (Tailwind 4 accepte toute valeur entière). Dégradé : `bg-(image:--gradient-bg)`.
- **Classes dynamiques** : jamais de `` `bg-${color}/85` `` — le scanner ne voit que des chaînes littérales complètes.
- Ordre des classes : Layout → Sizing → Spacing → Typography → Colors → Effects → Responsive (CLAUDE.md §8).

### `SideBar` — squelette attendu

```vue
<aside data-testid="sidebar"
  class="flex h-full w-12 shrink-0 flex-col gap-1.5 rounded-container border-2 border-border bg-surface p-1 landscape:w-15">
  <div data-testid="sidebar-header" class="flex h-12 shrink-0 flex-col items-center justify-center gap-0.5">
    <img src="/logo.png" alt="1Score" class="size-6" />
    <span class="text-picto font-black tracking-[0.04em] text-white">1Score</span>
  </div>
  <!-- items : v-for, puis <div class="mt-auto"> avec exitItem -->
</aside>
```

- Item : `flex min-h-[var(--size-touch-target)] w-full flex-col items-center justify-center gap-0.5 rounded-cta text-center text-white touch-manipulation select-none` ; libellé `text-picto font-bold uppercase leading-tight tracking-[0.04em]` ; badge `rounded-full bg-white/15 px-1 text-[10px] font-bold` (le badge garde son opacité, seuls picto et libellé passent à 45 %).
- `FERMER L'APPLICATION` passe sur deux lignes par le seul retour à la ligne naturel (`FERMER` / `L'APPLICATION`) ; pas de `<br>`.
- ⚠️ **Libellés en portrait (96 px, ≈ 80 px utiles)** : `ENTRAÎNEMENT`, `INSCRIPTION` et `L'APPLICATION` sont des mots insécables d'environ 80 à 100 px en gras capitales à 11 px. Mesurer au rendu (`getBoundingClientRect()` du libellé contre celui de l'item). S'ils débordent : d'abord réduire le padding horizontal de la colonne (`p-1` → `px-0.5`), puis le `tracking` à 0. Si ça ne suffit toujours pas, **ne pas** élargir la colonne, couper un mot ni changer un libellé de soi-même : le montrer à Nathan en passe de rendu.
- Pas de `role="button"` sur l'en-tête ni de handler : il est inerte par construction (UX-DR29).

### `ModeTile` — rendu attendu

- `<button type="button" class="relative flex min-h-[180px] flex-col justify-between rounded-container border-2 border-border p-2 text-left text-white touch-manipulation select-none">` + classe de couleur de la table.
- Titre `text-tile-title font-black uppercase leading-none` (deux lignes au plus : les titres sont courts et ne se tronquent jamais, pas d'ellipse). Flèche en bas à droite (`self-end`), rond à contour `border-2 border-border-strong` contenant `PictoIcon name="arrow-right" class="size-4"`.
- Tuile BIENTÔT : fond `/45` ; titre en blanc plein, le badge porte l'information, sans dépendre de la couleur seule (UX-DR22).
- La tuile `3 BANDES` est en `--color-cloth` : c'est une **tuile**, voulue par la spec. La règle « le bleu drap n'est jamais sur un bouton » vise les CTA (`DÉMARRER`, `VALIDER`, saisie), pas les tuiles de navigation.

### `HomeScreen` — squelette de l'étape `category`

```vue
<div class="h-full w-full">
  <div v-if="step === 'category'" data-testid="step-category"
       class="flex h-full w-full gap-2 bg-(image:--gradient-bg) p-2">
    <SideBar :items="HOME_SIDEBAR_ITEMS" :exitItem="HOME_SIDEBAR_EXIT" />
    <main class="flex min-w-0 flex-1 flex-col">
      <p data-testid="home-tagline" class="pt-4 pl-4 text-hero font-black leading-tight text-white">À vous de jouer.</p>
      <section class="mt-auto grid grid-cols-2 gap-2 landscape:h-[34%] landscape:grid-cols-4">
        <ModeTile v-for="tile in homeTiles" :key="tile.category.id" :data-testid="`category-${tile.category.id}`" … />
      </section>
    </main>
  </div>
  <div v-else class="flex h-full w-full flex-col bg-bg">
    <!-- header (h1 seul), main mode/players, ActionBar : inchangés -->
  </div>
  <!-- PlayerSetupModal, PromptModal : inchangés -->
</div>
```

- `data-testid="step-category"` passe sur la coquille de l'étape (il était sur la `<section>` des catégories) : `GameView.test.ts` n'en vérifie que la présence.
- En portrait, les deux rangées de la grille font chacune ≥ 180 px et laissent la moitié haute à l'accroche — vide assumé : cette bande accueillera l'identité du club (spec §10.3).
- `h-[34%]` en paysage suppose une hauteur définie sur la chaîne `GameView` (`h-dvh`) → racine `h-full` → coquille `h-full` → `main` `flex-1`. Vérifier au rendu que la rangée fait bien ≈ 34 % (≈ 250 px à 1024×768, ≈ 218 px à 1180×673) et que `min-h-[180px]` prend le relais sinon.
- **Aucune animation** : pas de `transition-*`, `animate-*` ni `active:scale` sur l'accueil (AC8). Un retour d'appui discret (`active:brightness-110`) est admis sur les tuiles disponibles : ce n'est pas un mouvement au repos.

### Pictos — tracés (viewBox 24, trait 2 px, sans remplissage ; dessins de Lucide, licence ISC)

| `PictoName` | Picto | Tracés `d` |
|---|---|---|
| `training` | cible | `M2 12a10 10 0 1 0 20 0a10 10 0 1 0 -20 0` · `M6 12a6 6 0 1 0 12 0a6 6 0 1 0 -12 0` · `M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0` |
| `signup` | silhouette + | `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2` · `M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0` · `M19 8v6` · `M22 11h-6` |
| `power` | marche/arrêt | `M12 2v10` · `M18.4 6.6a9 9 0 1 1-12.77.04` |
| `arrow-right` | flèche de tuile | `M5 12h14` · `m12 5 7 7-7 7` |

Un commentaire d'une ligne en tête de la table cite Lucide (ISC). Les 10.2 à 10.5 **ajoutent** leurs noms à `PictoName` et à la table (`back`, `close`, `settings`, `exit`, `restart`, `undo`, `swap-ball`, `swap-side`, `pass-turn`) : ne pas les créer maintenant.

### Pièges

- **`disabled` + garde, les deux** : `disabled` porte le visuel et l'état testable, la garde porte le comportement — les navigateurs ne s'accordent pas sur l'envoi des pointer events aux contrôles désactivés (Chromium en a changé en 2023, commentaire `GameView.vue:207-211`). Même motif que `selectCategory` aujourd'hui.
- **Testids** : `category-<id>` et `step-category` sont lus par `GameView.test.ts` (l. 21-23, 921, 1167, 1355…). Les perdre casse quinze tests loin de l'accueil.
- **Ne pas toucher** aux étapes `mode`/`players`, à `PlayerSetupModal`, à `ActionBar` (hors ajout éventuel d'un `data-testid`), au store ni à `GameView` : chaque story laisse l'app jouable et ne retire un composant que pour le remplacer (epics Epic 10).
- **`hint`** : le retirer du type **et** du catalogue ; `GameCategoryDescriptor` est un type public, `vue-tsc` signalera tout lecteur oublié.
- **Pas de police display** (décision 2) : ne pas ajouter Barlow/Manrope, ni `@font-face`, ni un paquet `@fontsource`. La règle offline (CLAUDE.md « Offline ») resterait d'ailleurs à respecter le jour où une police arrive.
- **Logo** : 134 Ko en 900×900, affiché à 48 px, précaché par le SW (`globPatterns` inclut `png`). Acceptable ; optimiser l'asset n'est pas dans cette story.
- **Contraste** (mesure complète en 10.7) : blanc sur `#0573BB` ≈ 5,0:1 ; blanc sur `#1E8A5A` ≈ 4,3:1, conforme pour un titre ≥ 24 px gras (3:1). Rien à corriger ici.
- **`FERMER L'APPLICATION`** : ni `window.close()`, ni pop-up « FERMER 1SCORE ? », ni `PromptModal` : l'item est un placeholder (AR26).
- **`--color-bg` et `:root`** restent le fond du scoreboard et du récap jusqu'à leurs stories : ne pas y poser le dégradé.

### Tests

- Vitest + Vue Test Utils + happy-dom. happy-dom ne calcule **aucun** CSS : les tests vérifient la présence des classes (`opacity-45`, `bg-tile-quilles/45`), les attributs (`disabled`) et les comportements (appel d'`action`, `emit`), jamais une taille ni un débordement — c'est le rôle de la passe navigateur.
- Déclenchement : `trigger('pointerdown')`, jamais `click` (AR8).
- Cycle rouge-vert par composant ; pas de navigateur pendant l'implémentation (CLAUDE.md §9).

### Validation visuelle (fin de story, une seule passe)

- `npm run build && npm run preview` (ou `npm run dev`). Demander à Nathan quel Chrome utiliser (deux sont connectés ; « Browser 1 (macOS) » la dernière fois).
- `resize_window` ne redimensionne pas le viewport : harnais temporaire `1score/public/_viewport-harness.html` qui charge l'app dans une `<iframe id="f">` dimensionnée par `?w=&h=`, **supprimé en fin de passe**. Formats : **1024×768, 768×1024, 1180×673** (rétro Epic 2). En 768×1024, faire défiler le harnais avant de capturer.
- Débordements : **`scrollWidth`/`scrollHeight` ne voient rien** sous `overflow-hidden`. Comparer les `getBoundingClientRect()` des libellés de sidebar, des titres de tuile et des tuiles à ceux de leur parent.
- À relever par format : marges de 16 px ; largeur de sidebar 96/120 ; en-tête 96 px ; items ≥ 90×90 ; `close-app` en bas ; hauteur des tuiles (≥ 180, ≈ 34 % en paysage) ; grille 4 ou 2×2 ; libellés et titres entiers ; badges BIENTÔT.
- Parcours : tap sur chaque item BIENTÔT et sur `QUILLES`/`CASIN` → rien ; `3 BANDES` → étape joueurs ; `JEUX DE SÉRIES` → étape `mode` puis `RETOUR` → nouvel accueil ; démarrer une partie, recharger → « PARTIE EN COURS » par-dessus le nouvel accueil, puis `ANNULER`. Avant la passe, jeter toute sauvegarde `1score:game` restante.
- Captures d'onglet visible uniquement (un onglet caché fige les transitions et ralentit les timers) ; vérifications sur les valeurs DOM.
- Montrer le rendu à Nathan : grille 2×2 en portrait (AC7) et libellés de la sidebar en portrait sont les deux points à valider.

### Intelligence des stories précédentes

- **10.6** (livrée, `8b0643f`, puis `cf87a1a`) : `alt="1Score"` du logo et son test existent déjà ; dossier `1score/`, clé `1score:game`. **502 tests**, build vert. Les fiches et traces datées citant l'ancien nom ne se réécrivent pas.
- **Rétro Epic 2** : spec et AC mis à jour **dans la même session** quand une story les change (d'où les annotations faites à la création de cette story) ; format 1180×673 dans le harnais ; les stories courtes le restent. Le plan d'un epic ne survit pas au premier rendu : les AC visuels (grille portrait, libellés) se valident avec Nathan, pas en force.
- **Story 1.3** (création de `HomeScreen`) : catégories indisponibles affichées et inertes, garde dans `selectCategory` ; catégorie à mode unique → étape joueurs directe (branche aujourd'hui atteinte par `3bandes`).
- **Story 1.13** : le SW précache tout le build, la mise à jour s'applique à l'accueil (`usePwaUpdate`, `status === 'idle'`) — inchangé, mais c'est l'écran de veille : rien ne doit y bloquer le rechargement.

### Git

- Message en français : `feat: story 10.1 - accueil refondu : barre latérale, tuiles de mode, fond dégradé`, puces courtes, ligne de co-auteur. Fichiers attendus : `main.css`, `types/ui.ts`, `types/game.ts`, `PictoIcon.vue`/`.test.ts`, `SideBar.vue`/`.test.ts`, `ModeTile.vue`/`.test.ts`, `HomeScreen.vue`/`.test.ts`, éventuellement `ActionBar.vue` (testid), `public/logo.png` (asset de Nathan), `explore/resources/simonis-prestige.gif`, `CLAUDE.md`, `architecture.md`, cette fiche, `sprint-status.yaml`. **Jamais** le harnais ni `dist/`.

### Project Structure Notes

- Composants à plat dans `src/components/` (pas de sous-dossier), tests co-localisés, named exports pour tout ce qui n'est pas un SFC. `types/ui.ts` suit la convention « Types (fichier) camelCase » ; c'est le premier type d'UI du projet, séparé de `game.ts` qui reste le modèle de partie.
- `PictoIcon` ne figure pas dans la liste de composants de la spec §10.4 : ajouté pour ne pas dupliquer les SVG entre `SideBar`, `ModeTile` puis `IconAction` (10.4), la duplication actuelle de `GameView` étant justement une dette (DT2). Écart consigné dans `architecture.md` (Task 6.2).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.1] — AC d'origine, note de périmètre (API complète de `SideBar`), précisions de la création de story
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] — AR20, AR26 ; [#UX Design Requirements] — UX-DR25 à UX-DR35
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.0 à 10.3, 10.7, 10.8] — Bloc Plein contenu, tokens, `SideBar`, accueil, pictos
- [Source: _bmad-output/planning-artifacts/architecture.md#Navigation & Shell (Epic 10, V1.1)]
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-11-refonte-ui.md] — brief écran par écran
- [Source: explore/basic-ui-brainstorming-2026-09-11.md#Home] — brief de Nathan
- [Source: explore/resources/cueuny_home.png] — référence visuelle retenue par Nathan
- [Source: explore/resources/simonis-prestige.gif] — couleur du drap
- [Source: 1score/CLAUDE.md §2, §6, §7, §8, §9]
- [Source: 1score/src/components/HomeScreen.vue, HomeScreen.test.ts, PromptModal.vue:31-34, views/GameView.vue:207-251]
- [Source: _bmad-output/implementation-artifacts/10-6-renommage-du-produit-en-1score.md] ; [epic-2-retro-2026-09-11.md#5]
- Mémoire projet « Validation visuelle Chrome » — harnais, débordements, choix du navigateur

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`), workflow bmad-dev-story.

### Debug Log References

- Test rouge `ModeTile` : un commentaire HTML à la racine du gabarit en faisait un fragment, `classes()`/`attributes()` ne retombaient plus sur le `<button>` (et le mot « transition » du commentaire déclenchait le test AC8). Commentaire déplacé dans le script, avec la raison.
- Test rouge `SideBar` : le sélecteur `[data-testid^="sidebar-item-"]` attrapait aussi le libellé ; testid du libellé renommé `sidebar-label`.
- `@theme static` accepté par Tailwind 4.3.3 : pas de repli `:root` nécessaire.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- **Task 1** : bloc `@theme static` (13 tokens UX-DR27) + `text-hero`/`text-tile-title`/`text-picto` dans le `@theme` existant. Après `npm run build`, les 16 variables sont présentes dans `dist/assets/*.css`, ainsi que `bg-tile-*/85`, `bg-tile-*/45`, `opacity-45`, `landscape:w-15`, `landscape:grid-cols-4`, `landscape:h-[34%]`.
- **Task 2** : `types/ui.ts` (`PictoName`, `ItemState`, `SideBarItem`) ; `PictoIcon` (table `Record<PictoName, readonly string[]>`, tracés Lucide ISC). 6 tests.
- **Task 3** : `SideBar` présentationnelle — en-tête inerte (logo + mot), items en un seul gabarit réparti en deux groupes (liste, puis sortie `mt-auto` dans `sidebar-bottom`), état `soon` = `disabled` + garde dans le handler, picto et libellé à `opacity-45`, badge à pleine opacité. 7 tests.
- **Task 4** : `ModeTile` racine `<button>` unique, table de classes littérales, flèche dans un rond `border-border-strong` (56 px, picto 32 px), badge `BIENTÔT` à la place en état `soon`, `tagline` optionnelle, `active:brightness-110` seulement sur tuile disponible, aucune transition. 9 tests.
- **Task 5** : `HomeScreen` découpé en deux coquilles (`category` : dégradé + `SideBar` + accroche + tuiles ; sinon : rendu actuel, `<header>` sans logo, `ActionBar` sans `:showBack` devenu toujours vrai). `HOME_SIDEBAR_ITEMS`, `HOME_SIDEBAR_EXIT`, `HOME_TILES` (ordre de présentation, `satisfies` sur `GameCategoryId`, résolu contre `GAME_CATEGORIES`). `hint` retiré du type et du catalogue (`grep -rn hint src` vide). `data-testid="action-bar"` posé sur la `<nav>` d'`ActionBar`. `HomeScreen.test.ts` : test du logo recentré sur la sidebar, commentaire du test « back button » mis à jour, 4 nouveaux cas (barre basse absente, accroche, ordre des tuiles, trois items BIENTÔT inertes). `GameView.test.ts` vert **sans modification**.
- **Task 6** : `CLAUDE.md` §7 (tokens typographiques + tokens de conteneur en `@theme static`) ; `architecture.md` (note « Livré en Story 10.1 », `types/ui.ts` et les trois composants dans l'arborescence).
- **Task 7.1** : `npm test` → 20 fichiers, **536 tests** verts (502 + 34) ; `npm run build` (dont `vue-tsc -b`) vert.
- **Task 7.2 — icônes PWA, à signaler à Nathan** : le build **régénère** les icônes depuis le nouveau `public/logo.png` — `dist/pwa-192x192.png` et `dist/apple-touch-icon-180x180.png` montrent bien le « 1S » blanc sur carré sombre. En revanche, `public/` contient encore les **anciennes** icônes du 2026-09-08 (trois billes sur fond bleu) : `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`. Elles ne partent pas dans le build (écrasées par la génération) mais restent servies par `npm run dev`. Rien régénéré ni supprimé (hors périmètre, accord de Nathan requis). **Mise à jour en fin de session** : les sept fichiers de `public/` (`pwa-*`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`) ont été **remplacés par Nathan pendant la session**, et non par l'agent. Indices : fichiers datés du 2026-09-11 21:47 (copie ayant gardé la date d'origine), permissions `600`, `.DS_Store` du dossier touché à 23:48, et `git status` qui ne les listait pas encore à 23:16. Ils portent le nouveau « 1S » : le constat ci-dessus est caduc.
- **Task 7.3 — première passe** (Browser 1, harnais iframe), aux formats de l'AC2 d'origine :
  - **1024×768 conforme.**
  - **Parcours réel conforme** (AC5, AC9, AC10) : les trois items et `QUILLES`/`CASIN` sont inertes au tap ; `3 BANDES` mène à l'étape joueurs et `RETOUR` ramène à l'accueil ; `JEUX DE SÉRIES` mène à l'étape `mode` (rendu d'avant) et `RETOUR` ramène au nouvel accueil. Une partie démarrée puis rechargée affiche « PARTIE EN COURS » par-dessus le nouvel accueil ; `ANNULER` jette la sauvegarde.
  - **Défaut en portrait 768×1024** : items de 76 px de large, et les trois libellés débordent (`ENTRAÎNEMENT` 96 px). Les deux replis des Dev Notes ne suffisaient pas (padding de 4 px : −6 px ; plus `tracking` à 0 : −3 px).
  - **Défaut en 1180×673** : `ENTRAÎNEMENT` 103 px pour un item de 100 px, car `text-picto` y atteint son plafond de 12 px.
  - Question posée à Nathan, qui a **écarté le portrait** (décision 6).
- **Passe de rendu — décisions 6 à 10 appliquées** :
  - `main.css` : rayons à 0, ajout de `--color-sidebar`, `--color-brand-red` et `--gradient-tile-3b|jds|quilles|casin` (les `--color-tile-*` orange, vert et violet sont retirés), `--gradient-bg` gris/noir.
  - `SideBar` : `w-15` fixe, aplat, filet `border-r`, `pb-3`, en-tête `h-15` avec deux calques `aria-hidden` en `clip-path` (bandeau rouge, pli à 35 %), libellés sans `tracking`, badge carré.
  - `ModeTile` : fond sur un calque `tile-background` (`bg-(image:--gradient-tile-*)`, `opacity-45` en BIENTÔT), `hover:brightness-110 active:brightness-125` sur les tuiles disponibles seulement, flèche nue `size-5`, sans contour ni rayon.
  - `HomeScreen` : coquille sans marge ni `gap`, accroche `px-4 pt-5`, rangée `grid h-[34%] grid-cols-4 divide-x divide-border`, variantes `landscape:` supprimées.
  - `vite.config.ts` : `orientation: 'landscape'`.
  - `ModeTile.test.ts` : les attentes `bg-tile-*/85|45` sont remplacées par le calque de dégradé et l'effet d'appui (9 tests).
- **Passe finale** en 1133×744, 1194×834 et 1920×1080 (ce dernier réduit par `transform: scale` pour la capture) :
  - barre à 0,0, 120 px sur toute la hauteur ; en-tête de 120 px, mot `1Score` 10 px au-dessus de la coupe ;
  - libellés avec au moins 11 px de marge ; sortie à 24 px du bas ;
  - accroche à 32 px, en 56 px ;
  - tuiles jointives de la barre au bord droit et au bas de l'écran, 34 % de la hauteur, titres entiers ;
  - aucun arrondi, aucune transition, aucun élément hors écran, aucun défilement ;
  - éclaircissement au survol vérifié en capture.
  - **Nathan a validé le rendu** (« super propre »).
- **Reporté** (consigné dans `deferred-work.md`) :
  - l'effet d'appui est à peine visible au doigt, car la navigation part au `pointerdown` ;
  - sur 21,5″, les plafonds de `text-picto`, `text-tile-title` et `text-hero` (12, 36, 56 px) rendent l'accueil petit ;
  - fond d'accueil à retravailler (souhait de Nathan).
- Harnais `public/_viewport-harness.html` supprimé, serveur de dev arrêté, onglet fermé. Tests et build relancés après suppression : voir Change Log.

### File List

- `1score/src/assets/main.css` (modifié)
- `1score/src/types/ui.ts` (nouveau)
- `1score/src/types/game.ts` (modifié — `hint` retiré)
- `1score/src/components/PictoIcon.vue` (nouveau)
- `1score/src/components/PictoIcon.test.ts` (nouveau)
- `1score/src/components/SideBar.vue` (nouveau)
- `1score/src/components/SideBar.test.ts` (nouveau)
- `1score/src/components/ModeTile.vue` (nouveau)
- `1score/src/components/ModeTile.test.ts` (nouveau)
- `1score/src/components/HomeScreen.vue` (modifié)
- `1score/src/components/HomeScreen.test.ts` (modifié)
- `1score/src/components/ActionBar.vue` (modifié — `data-testid="action-bar"`)
- `1score/vite.config.ts` (modifié — manifest `orientation: 'landscape'`)
- `1score/CLAUDE.md` (modifié — §7 tokens et direction visuelle, §9 paysage uniquement)
- `_bmad-output/planning-artifacts/architecture.md` (modifié)
- `_bmad-output/planning-artifacts/epics.md` (annoté — décisions de la passe de rendu ; déjà modifié à la création de la story)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (annoté — idem)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modifié — reports de la passe de rendu)
- `_bmad-output/implementation-artifacts/10-1-refonte-de-laccueil-barre-laterale-tuiles-de-mode-fond-degrade.md` (cette fiche)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)
- `1score/public/logo.png` (asset de Nathan, modifié avant la story)
- `1score/public/pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico` (assets de Nathan, remplacés par lui pendant la session : nouveau « 1S »)
- `explore/resources/simonis-prestige.gif` (référence de Nathan, ajoutée avant la story)

## Change Log

- 2026-09-11 — Implémentation Story 10.1 (Tasks 1 à 7.2) : tokens Epic 10 en `@theme static`, `PictoIcon`, `SideBar`, `ModeTile`, accueil refondu (dégradé, sidebar, accroche, tuiles), `hint` retiré, docs à jour ; 536 tests et build verts. Passe navigateur (7.3) en attente.
- 2026-09-11 — Passe navigateur et passe de rendu avec Nathan :
  - **Paysage uniquement** : manifest en `landscape`, CLAUDE.md §9 mis à jour.
  - **Angles vifs**.
  - **Barre latérale** collée au bord, avec un en-tête rouge en biais.
  - **Tuiles bleues** en dégradé, collées et séparées par des filets.
  - **Fond gris/noir**.
  - Docs annotées : `epics.md`, spec UX, `architecture.md`, `deferred-work.md`.
  - Rendu validé par Nathan. Harnais supprimé. Statut → `review`.
- 2026-09-11 — Story committée et **laissée en `review` sans revue de code** : Nathan préfère avancer et grouper les revues et correctifs en fin d'Epic 10 (consigné dans `deferred-work.md`).
