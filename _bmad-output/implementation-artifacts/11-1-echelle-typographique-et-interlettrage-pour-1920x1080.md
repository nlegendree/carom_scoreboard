# Story 11.1: Échelle typographique et d'interlettrage conçue pour 1920×1080

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur debout à deux mètres de l'écran de 21,5″ du club,
I want que scores, titres, libellés et pictos soient dimensionnés pour cet écran, et non pour la tablette sur laquelle ils ont été dessinés,
so that l'écran de référence du produit (`PRODUCT.md`) porte une interface à sa taille, lisible sans effort (NFR10).

> **Cadrage (bmad-create-story, 2026-09-15).** Première story de code de l'Epic 11. Elle ne dessine rien de neuf : elle **met à l'échelle** le rendu validé par Nathan pendant l'Epic 10, et elle ferme la boucle « `DESIGN.md` nomme, `main.css` déclare, aucun gabarit n'écrit une valeur ». Périmètre : `DESIGN.md` (+ `.impeccable/design.json`), `main.css`, les classes de taille et d'interlettrage dans les gabarits, leurs tests. **Rien dans `src/stores/`**, aucune mise en page, aucune couleur (11.2), aucun composant nouveau (11.3).
>
> **Nature de la référence visuelle : aucune capture, aucune photo.** La référence est le rendu livré de l'Epic 10 à 1180×733, validé par Nathan. ⚠️ **Combinaison inédite à annoncer :** le format **1920×1080 n'a jamais servi de format de conception** — seulement de format de vérification « sans débordement ». Le rendu à 1920 avec une échelle qui y atteint ses plafonds **n'existe nulle part** : c'est une géométrie à découvrir au rendu statique, et c'est précisément pour ça que la validation avant câblage est obligatoire (rétro Epic 10, décision 1).
>
> **Ce que l'audit a mesuré** (`design-system-audit-2026-09-15.md`, §4) : tous les `clamp()` de `main.css` plafonnent entre 1091 et 1200 px de large (`text-picto` 12 dès 1091, `text-hero` 56 dès 1120, `text-tile-title` 36 et `text-label` 24 dès 1200) ; onze tailles sont écrites en `text-[...]` dans les gabarits ; sept interlettrages en `tracking-[...]` sans règle ; deux CTA sont sous WCAG AA sur le stop clair de leur dégradé ; le badge `BIENTÔT` est à 10 px.

## Acceptance Criteria

**AC1 — `DESIGN.md` d'abord**
**Given** `DESIGN.md` › Typography et le frontmatter `typography`
**When** la story démarre
**Then** l'échelle cible est écrite **d'abord** dans `DESIGN.md` : un nom par rôle (score par nombre de chiffres, reprise, chrono, hero, title, label, stat, picto, touche numérique, touche alpha, valeur de champ, série en cours, `DÉMARRER`), chaque rôle avec sa plage `clamp()`, sa graisse et son interlettrage nommé (au plus trois valeurs d'interlettrage), le plafond de chaque `clamp()` étant **atteint à 1920 px de large**, pas avant 1280
**And** `.impeccable/design.json` reflète le même frontmatter

**AC2 — Gabarit statique validé avant câblage**
**Given** les cinq écrans et les quatre pop-ups rendus avec la nouvelle échelle (tokens appliqués, données en dur ou parcours réel, **aucun test écrit**)
**When** Nathan les passe en revue aux trois formats (1920×1080, 1180×733, petit iPad 1133×744)
**Then** il valide ou casse **avant** tout câblage ; les captures des trois formats sont jointes à la fiche (Dev Agent Record) ; aucune ligne de test n'est écrite avant cette validation

**AC3 — Zéro valeur arbitraire de typographie dans les gabarits**
**Given** `main.css` et les 19 gabarits `.vue`
**When** la story est livrée
**Then** chaque rôle de `DESIGN.md` est un token `--text-*` / `--tracking-*` de `main.css`, et **aucun gabarit** ne porte plus de `text-[...]` ni de `tracking-[...]` arbitraire (les cinq paliers du score et le chiffre du chrono inclus, exprimés en tokens) ; un test de source le verrouille
**And** le badge `BIENTÔT` (`SideBar`, `IconAction`) n'est plus sous 11 px à aucun format

**AC4 — Contraste AA des CTA à dégradé**
**Given** les CTA de réglage (`CHANGER DE BILLE`, `CHANGER DE CÔTÉ`) et `DÉMARRER`
**When** on mesure le contraste du blanc sur le **stop clair** de leur dégradé (`#2E8FDB` → 3,46:1 ; `#E2515B` → 3,78:1), à la taille rendue aux trois formats
**Then** chacun tient WCAG AA — par la **taille** dans cette story (≥ 18,66 px en graisse ≥ 700 à tout format, donc seuil 3:1) ; si la taille ne suffit pas à un format, l'assombrissement du stop est renvoyé à la 11.2 et consigné dans `deferred-work.md`, jamais tranché ici

**AC5 — Vérification aux trois formats, stores intacts**
**Given** les trois formats
**When** `npx impeccable detect` (URL rendue et `src`) et la passe navigateur manuelle sont rejoués
**Then** zéro constat `undersized-ui-text`, aucun débordement, aucun libellé coupé, aucune commande de jeu sous 90×90 px ; les touches alpha sont **re-mesurées** et leur largeur consignée (l'écart de la 10.7 se ferme en 11.3 avec les insets, pas ici)
**And** `git diff --stat -- src/stores` est vide ; `npm test` et `npm run build` verts

## Tasks / Subtasks

- [x] **Task 1 — Écrire l'échelle dans `DESIGN.md`** (AC1)
  - [x] Partir de la table « Échelle proposée » des Dev Notes ; ajuster, puis réécrire le frontmatter `typography` (un objet par rôle, `fontSize` en `clamp()`, `fontWeight`, `letterSpacing` **nommé**) et la section « Typography › Hierarchy » en français
  - [x] Ajouter un bloc `tracking` au frontmatter (trois valeurs nommées maximum) et retirer les mentions de valeurs d'interlettrage éparses de la section
  - [x] Recopier le frontmatter dans `.impeccable/design.json` (même structure de clés que l'existant)
  - [x] Noter dans « Arbitrages ouverts » ce qui reste à trancher au rendu (plafond du score, `VS`, chiffre du chrono)
- [x] **Task 2 — Appliquer dans `main.css` et les gabarits, SANS test, puis rendu statique** (AC2)
  - [x] `main.css` `@theme` : remplacer les sept `--text-*` par l'échelle de `DESIGN.md` ; ajouter `--text-score-1` … `--text-score-4`, `--text-score-more`, `--text-clock`, `--text-key-numeric`, `--text-key-alpha`, `--text-field-value`, `--text-series`, `--text-start` ; ajouter `--tracking-*` ; **supprimer `--text-score`** (remplacé par la rampe — c'est un token typographique, il relève de cette story et non de la 11.2)
  - [x] Remplacer chaque `text-[...]` et `tracking-[...]` des gabarits par l'utilitaire du token (inventaire fichier par fichier dans les Dev Notes) ; `SETUP_CTA_CLASSES` passe de `text-stat` au rôle retenu pour AC4
  - [x] `npm run dev`, captures aux trois formats des cinq écrans et des quatre pop-ups (JDS **et** 3 Bandes pour le scoreboard) ; les joindre au Dev Agent Record ; **s'arrêter et faire valider par Nathan**
  - [x] Intégrer ses retours (nouvelles captures si l'échelle bouge) jusqu'à validation ; consigner chaque décision de rendu dans la fiche, datée
- [x] **Task 3 — Câblage des tests** (AC3)
  - [x] Mettre à jour les cas qui nomment une classe de taille (liste dans Dev Notes › Tests) : même assertion, même intention, nom du token à la place de la valeur
  - [x] Ajouter `src/assets/typography.test.ts` (ou un `describe` dans `main.css.test.ts`) : lit `main.css?raw` (piège `test.css` déjà réglé dans `vitest.config.ts`) et vérifie que chaque rôle de `DESIGN.md` est déclaré ; lit chaque `.vue?raw` de `src/components` et `src/views` et vérifie qu'aucun ne contient `text-[` ni `tracking-[`
  - [x] `SideBar.test.ts` et `IconAction.test.ts` : le badge `BIENTÔT` porte le token de picto (plus `text-[10px]`)
- [x] **Task 4 — Contraste des CTA à dégradé** (AC4)
  - [x] Calculer, pour chaque format, la taille rendue du libellé des CTA de réglage et de `DÉMARRER` avec la nouvelle échelle ; vérifier ≥ 18,66 px gras partout, sinon relever le plancher du rôle
  - [x] Consigner la table (format × taille × seuil × ratio) dans le Dev Agent Record ; si un format ne passe pas par la taille, entrée `deferred-work.md` « à trancher en 11.2 : assombrir le stop clair »
- [x] **Task 5 — Vérification outillée et manuelle** (AC5)
  - [x] `.claude/skills/impeccable/scripts/impeccable detect --viewport 1920x1080 http://localhost:5174/`, idem `1180x733` et `1133x744`, plus `detect 1score/src` ; zéro `undersized-ui-text`
  - [x] Passe navigateur (extension Chrome) aux trois formats : cinq écrans, quatre pop-ups, JDS et 3 Bandes ; mesurer les touches alpha (`getBoundingClientRect`) et noter les largeurs
  - [x] `npm test`, `npm run build`, `git diff --stat -- src/stores` vide
- [x] **Task 6 — Clôture** (AC1, AC3)
  - [x] `/impeccable polish` sur les fichiers touchés ; `DESIGN.md` relu contre ce qui est livré (si un plafond a bougé au rendu, c'est `DESIGN.md` qui porte la valeur finale, puis `main.css`)
  - [x] Annoter `epics.md` (Story 11.1 : décisions de rendu, écarts) ; `deferred-work.md` si report ; `sprint-status.yaml` → `review`

### Review Findings

Revue de code du 2026-09-16 (bmad-code-review, trois relecteurs : Blind Hunter, Edge Case Hunter, Acceptance Auditor). Vérifié indépendamment avant triage : 747 tests verts, `npm run build` vert, `git diff --stat -- 1score/src/stores` vide, zéro `text-[…]` / `tracking-[…]` dans les 19 gabarits.

- [x] [Review][Decision → Patch] Planchers `picto` et `stat` descendus sous le rendu tablette validé — **tranché par Nathan (2026-09-16) : remontés à 12 et 14 px, appliqué.** — `--text-picto` passe de `clamp(11px, 1.1vw, 12px)` (12 px aux deux formats iPad) à `clamp(11px, 1vw, 19px)` (11,3 px à 1133, 11,8 px à 1180) ; `--text-stat` passe d'un plancher 14 à 13 (13,6 px à 1133). La règle de la story (« plancher = rendu validé à 1180 ») et la fiche (« tablette identique au pixel ») disent le contraire. Options : (1) remonter les planchers à 12 et 14 px (plafonds atteints à 1900 et 1917, toujours entre 1280 et 1920) ; (2) garder les valeurs livrées et corriger la fiche.
- [x] [Review][Decision → Patch] Tailles nommées dans `DESIGN.md` sans token dans `main.css` — **tranché par Nathan (2026-09-16, « rien de hardcodé ») : six tokens `--size-*` déclarés et consommés, clés du frontmatter `spacing` alignées sur les noms des tokens, appliqué.** — le frontmatter `spacing` déclare `sidebar-width`, `popup-decision-width`, `popup-pad-width`, `popup-alpha-width`, mais les gabarits écrivent `w-15`, `max-w-72`, `max-w-64`, `max-w-96` en clair ; les planchers de grille des pavés sont des formules dans le gabarit (`NumericPad.vue:35` `min-h-[calc(var(--size-key-numeric)*4+var(--spacing)*6)]`, `AlphaKeyboard.vue:49`). Options : (1) déclarer `--size-sidebar`, `--size-popup-*`, `--size-pad-min`, `--size-alpha-min` dans `main.css` et les consommer ; (2) retirer ces entrées du frontmatter et assumer les multiples de grille comme utilitaires Tailwind.
- [x] [Review][Patch] Collision `text-start` avec l'utilitaire cœur Tailwind `text-align: start` — confirmée dans le CSS émis (`dist` contient `.text-start{text-align:start}` ET `.text-start{font-size:var(--text-start)}`) ; `DÉMARRER` reçoit un alignement à gauche dès que le libellé se replie. Renommer le rôle (`start-button`, aligné sur `--size-start-button`) dans `DESIGN.md`, `design.json`, `main.css`, `HomeScreen.vue`, `typography.test.ts` [1score/src/assets/main.css:253, 1score/src/components/HomeScreen.vue:517]
- [x] [Review][Patch] Plafonds atteints après 1920 px pour trois rôles (AC1) — `title` `clamp(32px, 3vw, 58px)` → 1933 px, `field-value` `clamp(24px, 2.6vw, 50px)` → 1923 px, `start` `clamp(20px, 1.6vw, 31px)` → 1937,5 px ; le test tolère `1920 × 1,01` au lieu de corriger. Ajuster les coefficients (3,03 / 2,61 / 1,62 vw) dans `DESIGN.md`, `design.json`, `main.css` et retirer la tolérance [1score/src/assets/main.css:240, 1score/src/assets/typography.test.ts:53]
- [x] [Review][Patch] Miroir `design.json` partiel — Don't « utiliser `text-score` » non renommé en `score-*`, Don't `text-[…]` absent ; snippets : `.ds-btn-start` `letter-spacing:.05em` + `min-height:110px` + `font-size` en double, `.ds-sidebar-brand` `.04em`, `.ds-banner-mode` `.3em`, `.ds-key` `60px`, `.ds-tile` `180px` alors que `DESIGN.md` les met en `tracking-*` et `--size-*` [.impeccable/design.json:706, 722, 738, 746, 770, 840]
- [x] [Review][Patch] `CLAUDE.md` règle 7 périmée — « `main.css` fixe l'unité Tailwind à 8 px … à ne pas corriger sans arbitrage » alors que `--spacing` est fluide (`clamp(8px, 0.678vw, 13px)`) ; fichier hors du diff et de la File List [1score/CLAUDE.md:134]
- [x] [Review][Patch] Fiche 11.1 contradictoire — Debug Log « Cibles tactiles » garde les mesures d'avant la grille fluide (65×57 à 1920, contredit par la 4e passe : 82×93) ; décision 1 « Reste à valider par Nathan sur les captures de la 4e passe » après « validé en cinq passes » ; File List « sprint-status → `in-progress` » alors que le diff écrit `review` ; « Onze gabarits sur leurs seuls attributs `class` » alors que 16 `.vue` bougent et que `ShotClock` est restructuré [_bmad-output/implementation-artifacts/11-1-echelle-typographique-et-interlettrage-pour-1920x1080.md:200, 216, 213, 266]
- [x] [Review][Patch] `DESIGN.md` en retard sur les décisions et la grille fluide — « Arbitrages ouverts » liste encore la grille fluide et les CTA de réglage en `label`/`stat` comme à trancher ; rien sur `VS` ni le chiffre du chrono (Task 1.4) ; « quatre pictos espacés de 12 px » (désormais `gap-1.5`, fluide), « en-tête de 120 px », `40vh` « 293 px » à 1133×744 (298) [DESIGN.md:293, 362, 395, 471]
- [x] [Review][Patch] `deferred-work.md` non rafraîchi — touches alpha « 65×57 px à 1920 » (82×93 depuis la grille fluide), « `gap-2` (16 px) », inset « `calc(100vw * 0.4 + 32px)` » (désormais en unités de grille), `text-stat` « 14 px à 1133, 18 px à 1920 » (13 → 23) [_bmad-output/implementation-artifacts/deferred-work.md:163, 211, 215]
- [x] [Review][Patch] `typography.test.ts` fragile et à sens unique — la regex des plafonds exige des espaces exacts et le comptage `>= 10` laisse sortir un token reformaté sans échec ; `expect(files.length)` hors de tout `it` ; le verrou ne vérifie que TEXT_ROLES ⊆ `main.css` (un `--text-*` ajouté dans `main.css` sans `DESIGN.md` passe) ; les utilitaires standard `text-3xl`, `text-sm`, `tracking-widest`, `[font-size:…]`, `text-(--x)` passent ; glob limité à `../components/*.vue` (pas de sous-dossier) [1score/src/assets/typography.test.ts:13, 22, 45, 58]
- [x] [Review][Patch] `ShotClock.test.ts` — `aspect-square` non verrouillé sur les deux cercles (sans lui, cercle de hauteur nulle et demi-anneau invisible) ; sélecteur structurel anonyme `> span` sans testid ; `mountClock('left')` monté trois fois dans le même cas [1score/src/components/ShotClock.test.ts:150, 165, 181]
- [x] [Review][Patch] Commentaire faux sur le seuil « grand texte » — `PlayerSetupCard.vue` : « seuil 18,66 px atteint à 1920 seulement » alors que `1.2vw` ≥ 18,66 px dès 1555 px ; `design.json` `typographyMeta.stat` : « Jamais grand texte : 4,5:1 exigé » alors que le rôle vaut 23 px en 700 à 1920 [1score/src/components/PlayerSetupCard.vue:94, .impeccable/design.json (typographyMeta.stat)]
- [x] [Review][Patch] Commentaires reflués en lignes de plus de 100 caractères — remplacement injecté sans rejustifier le paragraphe [1score/src/components/AlphaKeyboard.vue:42, 1score/src/components/NumericPad.vue:22, 1score/src/components/PlayerSetupCard.vue:94]
- [x] [Review][Defer] Biais du bandeau de récap à 32 px fixes dans une grille fluide — `[clip-path:polygon(…calc(100%-32px)…)]` et `32px_100%` inchangés alors que `pl-10`/`pr-10` et `text-title` grandissent ×1,63 : la coupe « signature » s'aplatit à 1920 [1score/src/components/GameSummary.vue:131, 151] — deferred, mise en page hors périmètre 11.1, à revoir en 11.3
- [x] [Review][Defer] Deux syntaxes pour le même besoin — `min-h-[var(--size-touch-target)]` (13 usages antérieurs + tests) à côté de `min-h-(--size-start-button)` / `min-h-(--size-key-numeric)` (4 usages 11.1) [1score/src/components/HomeScreen.vue:81, 517] — deferred, pre-existing (balayage mécanique à faire en une fois)

Écartés (8) : score à 7 chiffres et plus (hors domaine), message de pop-up `label` en graisse normale (fond sombre, pas un dégradé, contraste ≥ 9:1), `generatedAt` édité à la main, garde « token hors `@theme` », garde « plancher atteint avant 1180 », écarts de périmètre (grille fluide, pop-ups, `ShotClock`) tranchés par Nathan et tracés, score +14 px sur iPad 11″ 1194×834 (la borne `40vh` gouverne par conception), `--spacing` non couvert par le test typographique.

## Dev Notes

### État du code à l'arrivée (commit `84fedc7`, arbre propre, 704 tests verts, 24 fichiers de test)

- **Sept tokens typographiques** dans `main.css` `@theme` (lignes 52-65) : `--text-score` `clamp(120px, 15vw, 200px)` (**mort** : la carte utilise sa rampe), `--text-label` `clamp(16px, 2vw, 24px)`, `--text-stat` `clamp(14px, 1.2vw, 18px)`, `--text-reprise` `clamp(48px, 7.5vw, 120px)`, `--text-hero` `clamp(40px, 5vw, 56px)`, `--text-tile-title` `clamp(28px, 3vw, 36px)`, `--text-picto` `clamp(11px, 1.1vw, 12px)`. Namespace `--text-*` = utilitaire `text-<nom>` (Tailwind v4 ; `--font-size-*` ne génère rien).
- **Onze tailles hors échelle**, toutes en valeur arbitraire :

| Fichier : ligne | Valeur | Rôle |
|---|---|---|
| `PlayerPanel.vue:91-96` (`SCORE_SIZE_CLASSES`, `SCORE_SIZE_FALLBACK`) | `text-[min(42vw,40vh,320px)]` / 24vw / 16vw / 12vw / 9vw | score à 1, 2, 3, 4, 5+ chiffres — **clés littérales** dans un `Record`, jamais construites (JIT) |
| `PlayerPanel.vue:286` | `text-[clamp(24px,10cqw,64px)]` | série en cours (rouge, container-relative) |
| `ShotClock.vue:142` | `text-[40cqmin]` | chiffre du chrono (relatif au disque) |
| `NumericPad.vue:28` (`KEY_SIZE`) | `text-[clamp(30px,3.4vw,42px)]` + `tracking-tight` | touche numérique |
| `AlphaKeyboard.vue:45` (`KEY_SIZE`) | `text-[clamp(16px,2vw,26px)]` | touche alpha |
| `PlayerSetupCard.vue:101,115` | `text-[clamp(24px,2.6vw,40px)]` | valeur de champ `NOM` / `DISTANCE` |
| `HomeScreen.vue:517` | `text-[clamp(16px,1.6vw,26px)]` | `DÉMARRER` |
| `SideBar.vue:90`, `IconAction.vue:49` | `text-[10px]` | badge `BIENTÔT` (détecteur : 3 constats) |

- **Sept interlettrages arbitraires** : `tracking-[0.04em]` (`SideBar.vue:54`, mot `1Score`), `[0.05em]` (`HomeScreen.vue:517`, `DÉMARRER`), `[0.1em]` (`ActionBar.vue:123`, `PromptModal.vue:146` — CTA de barre, titre de pop-up), `[0.15em]` (`HomeScreen.vue:467` titre de paramétrage, `PlayerSetupCard.vue:101,115` placeholders, `NumericPad.vue:51`, `AlphaKeyboard.vue:98` touches d'action), `[0.2em]` (`GameSummary.vue:174,204` libellés du récap), `[0.25em]` (`PlayerSetupCard.vue:82,97,111` `BILLE BLANCHE`, `NOM`, `DISTANCE`), `[0.3em]` (`GameSummary.vue:143` mode, `AlphaKeyboard.vue:88`). Plus `tracking-tight` sur la touche numérique.
- **Usages des tokens existants** (à garder tels quels, seul le token change de valeur) : `text-hero` ×3 (accroche, titre JDS, `VS`), `text-tile-title` ×4, `text-label` ×14, `text-stat` ×14, `text-picto` ×4, `text-reprise` ×3, `text-3xl` ×1 (`PlayerPanel.vue:110`, `−`/`+` — à nommer aussi, ou à laisser en utilitaire standard : à trancher au rendu).
- **Le score de la carte** : deux bornes par valeur, `vw` (largeur de la carte) et `vh` (hauteur), plafond 320 px « pour éviter un chiffre démesuré sur un signage 22″ » (commentaire `PlayerPanel.vue:84-89`). À 1920×1080, `40vh` = 432 px et le plafond 320 **bloque** : c'est le seul endroit où le plafond a été pensé pour 1920, et il a été pensé comme un frein. À rediscuter au rendu.

### Échelle proposée (point de départ du rendu, pas une décision)

Principe : **le plancher est la valeur validée à 1180×733** (ce que Nathan a vu et approuvé pendant l'Epic 10), **le plafond est atteint à 1920** (facteur 1920/1180 ≈ 1,63 quand rien ne s'y oppose), et le coefficient `vw` relie les deux. Constat utile : pour `stat`, `key-numeric`, `key-alpha`, `field-value` et `start`, le coefficient actuel est déjà bon — **seul le plafond est trop bas**. Pour `hero`, `title`, `label`, `picto`, le coefficient est trop fort (plafond atteint avant 1200) : il baisse et le plafond monte.

| Rôle (token) | Aujourd'hui | Rendu à 1180 / 1920 aujourd'hui | Proposition `clamp()` | Rendu à 1133 / 1180 / 1920 |
|---|---|---|---|---|
| `hero` | `clamp(40px, 5vw, 56px)` | 56 / 56 | `clamp(48px, 4.75vw, 91px)` | 54 / 56 / 91 |
| `title` (ex `tile-title`) | `clamp(28px, 3vw, 36px)` | 35 / 36 | `clamp(32px, 3vw, 58px)` | 34 / 35 / 58 |
| `label` | `clamp(16px, 2vw, 24px)` | 24 / 24 | `clamp(20px, 2vw, 38px)` | 23 / 24 / 38 |
| `stat` | `clamp(14px, 1.2vw, 18px)` | 14 / 18 | `clamp(13px, 1.2vw, 23px)` | 14 / 14 / 23 |
| `picto` | `clamp(11px, 1.1vw, 12px)` | 12 / 12 | `clamp(11px, 1vw, 19px)` | 11 / 12 / 19 |
| `reprise` | `clamp(48px, 7.5vw, 120px)` | 88 / 120 | `clamp(72px, 7.5vw, 144px)` | 85 / 88 / 144 |
| `key-numeric` | `clamp(30px, 3.4vw, 42px)` | 40 / 42 | `clamp(30px, 3.4vw, 65px)` | 38 / 40 / 65 |
| `key-alpha` | `clamp(16px, 2vw, 26px)` | 24 / 26 | `clamp(18px, 2vw, 38px)` | 23 / 24 / 38 |
| `field-value` | `clamp(24px, 2.6vw, 40px)` | 31 / 40 | `clamp(24px, 2.6vw, 50px)` | 29 / 31 / 50 |
| `start` (`DÉMARRER`) | `clamp(16px, 1.6vw, 26px)` | 19 / 26 | `clamp(20px, 1.6vw, 31px)` | **20** / 20 / 31 |
| `series` | `clamp(24px, 10cqw, 64px)` | 47 / 64 (plafond) | `clamp(24px, 10cqw, 80px)` | 45 / 47 / 77 |
| `score-1` … `score-4`, `score-more` | `min(42vw, 40vh, 320px)` … | 293 (vh) / **320** (plafond) | `min(42vw, 40vh, 520px)` … (même rampe, plafond ×1,63) | 298 / 293 / 432 (vh) |
| `clock` | `40cqmin` | relatif au disque | `40cqmin` en token, inchangé | — |
| badge `BIENTÔT` | `10px` | 10 / 10 | `picto` | 11 / 12 / 19 |

Interlettrages proposés (trois tokens) : `--tracking-title` **0,15 em** (titre de paramétrage, placeholders, touches d'action, `1Score` — absorbe 0,04 et 0,15), `--tracking-label` **0,1 em** (CTA de barre, titre de pop-up, `DÉMARRER` — absorbe 0,05 et 0,1), `--tracking-stat` **0,25 em** (libellés `stat` : mode, `BILLE BLANCHE`, `NOM`, `DISTANCE`, libellés du récap — absorbe 0,2, 0,25, 0,3). `tracking-tight` de la touche numérique reste un utilitaire standard (`−0,025 em`, documenté dans `DESIGN.md`). **Ces regroupements se jugent au rendu** ; s'ils sont refusés, on garde au plus trois valeurs, pas sept.

⚠️ **Ce qu'une échelle ×1,63 va faire bouger à 1920 et qu'il faut regarder en premier** : le bandeau de la carte joueur (`NOM | DISTANCE`, `RESTANT | MOY · SÉRIE` en `label`/`stat` sur deux lignes — hauteur libre depuis la 10.4, il va grandir), les tuiles (`title` 58 px sur une tuile de 34 % de hauteur, à quatre tuiles), la barre latérale (largeur **fixe** 120 px : `picto` 19 px sur `FERMER L'APPLICATION` en deux lignes doit encore tenir), les cellules du récap (`label` 38 px sur cinq lignes + bandeau `title` 58 px : vérifier la hauteur totale à 1080), le pied de la carte de paramétrage (champs `min-h-[130px] max-h-[220px]` avec une valeur à 50 px). Aucune mise en page ne se retouche ici : si une hauteur ne tient pas, on baisse le plafond du rôle, et on note pour la 11.2/11.3.

### Contraste — la règle qui décide AC4

Blanc sur le stop clair : `--gradient-blue` `#2E8FDB` = **3,46:1**, `--gradient-red` `#E2515B` = **3,78:1** (mesures de l'audit, §4). Seuil AA : 4,5:1 pour le texte courant, **3:1 dès 18,66 px en graisse ≥ 700** (WCAG 1.4.3, « large text » = 14 pt gras). Ni l'un ni l'autre ne passe 4,5 : la seule voie **dans cette story** est que le libellé soit « grand texte » à tout format.

- `SETUP_CTA_CLASSES` (`HomeScreen.vue:80-81`) est en `text-stat font-bold` : 14 px à 1180 → **échec**. Passer au rôle `label` (≥ 20 px gras partout dans la proposition) → 3,46 ≥ 3 ✅. C'est aussi ce que fait déjà le CTA de barre (`ActionBar.vue:123`, `text-label`). Vérifier au rendu que les deux libellés tiennent sur une ligne dans la colonne à 1/4 à 1133 (aujourd'hui `text-stat` + picto 24 px en ligne — c'est la raison de l'empilement pleine largeur, commentaire `HomeScreen.vue:76-79`).
- `DÉMARRER` : plancher **20 px** dans la proposition (19 aujourd'hui à 1180, 18,1 à 1133 → échec au mini). 20 px gras → 3,78 ≥ 3 ✅.
- Les autres blancs sur bleu (`VALIDER`, CTA de pop-up, tuiles) sont déjà en `label`/`title` gras : conformes au seuil 3:1 et le restent.
- Ne pas toucher aux dégradés : c'est la 11.2. Si Nathan refuse `label` sur les réglages, l'entrée `deferred-work.md` renvoie le stop clair à la 11.2.

### Pièges

- **Classes Tailwind littérales, jamais construites** (`CLAUDE.md` §12) : la rampe du score reste un `Record` à clés écrites en toutes lettres (`text-score-1` … `text-score-more`), comme aujourd'hui.
- **`--text-*` seulement** dans `@theme` pour générer `text-<nom>` ; pour l'interlettrage, le namespace Tailwind v4 est `--tracking-*` → `tracking-<nom>`. Vérifier dans le CSS émis (`npm run build`, ou l'inspecteur) que les utilitaires existent avant de conclure qu'un rendu « n'a pas changé ».
- **Les tests comparent des noms de classes** (`.classes()` sur happy-dom, qui ne calcule aucun CSS) : ils cassent au renommage, pas au changement de valeur. Un test qui passe ne prouve donc **rien** sur la taille rendue — d'où AC2 et AC5.
- **`main.css?raw` rend une chaîne vide sous Vitest** sans `test.css: { include: [/main\.css/] }` : déjà réglé dans `vitest.config.ts` (10.7), à ne pas défaire. Les `.vue?raw` fonctionnent tels quels.
- **`40vh` sur le score** : à 1180×733 la hauteur gouverne (293 px), à 1920×1080 c'est le plafond en px. Monter le plafond sans regarder le bandeau et le pied de la carte fait toucher le chiffre au pied (exactement le bug de la 10.4 qui a fait passer `46vh` → `40vh`).
- **Container queries** : `series` (`10cqw`) et `clock` (`40cqmin`) sont relatifs à la carte et au disque, pas à l'écran — ils grandissent déjà à 1920 ; seul leur plafond compte.
- **Aucun commentaire HTML à la racine d'un gabarit** (`CLAUDE.md` §12) ; les gabarits touchés le sont sur des attributs `class`, pas sur la structure.

### Tests

Cas existants à mettre à jour (même assertion, nom du token) :
- `ShotClock.test.ts:141` — `text-[40cqmin]` → `text-clock`
- `PlayerPanel.test.ts:172` — cherche une classe qui commence par `text-[` pour la rampe du score → `text-score-`
- `CenterPanel.test.ts:37` — `text-reprise` (inchangé si le nom reste)
- `GameSummary.test.ts:75,115,211-212` — `text-tile-title` → `text-title` ; `text-label` / `not text-reprise` inchangés
- `HomeScreen.test.ts:509` — `text-tile-title` → `text-title`
- `SideBar.test.ts`, `IconAction.test.ts` — si un cas nomme `text-[10px]` sur le badge, il passe au token de picto
- `main.css.test.ts` — n'est pas concerné (garde et contraste) ; le nouveau `describe` typographie s'y ajoute ou vit dans `typography.test.ts`

Test neuf (AC3) : source de `main.css` contient chaque `--text-<rôle>` et `--tracking-<nom>` listé ; aucun `.vue` de `src/components` / `src/views` ne contient `text-[` ni `tracking-[`. **Zéro modification** dans `src/stores/**` et `useGameStore.test.ts` (preuve : `git diff --stat`).

### Validation visuelle (rendu statique AVANT tests, puis passe finale)

- Deux passes navigateur, pas plus : la passe de **validation du gabarit** (Task 2, avant tests) et la passe **finale** (Task 5). Extension Claude for Chrome ; formats **1920×1080** (référence), **1180×733** (format de travail de Nathan, iPad Air en Sidecar sous Chrome), **1133×744** (plancher). Paysage seul.
- Détecteur : `.claude/skills/impeccable/scripts/impeccable detect --viewport <WxH> --json http://localhost:<port>/` ; l'app n'a qu'une route, seul l'accueil est rendu (limite consignée dans l'audit §1, à lever en 11.4) — les autres écrans se vérifient à la main.
- Ne pas ouvrir de navigateur entre les deux passes (`CLAUDE.md` §9).

### Ce que cette story NE fait pas

- Ni couleur, ni dégradé, ni rayon, ni ombre, ni token mort autre que `--text-score` → **11.2**.
- Ni composant CTA, ni `useBackdropClose`, ni insets, ni largeur des touches alpha → **11.3** (les touches sont **mesurées** ici, pas corrigées).
- Ni script `design:check`, ni `ignores` du détecteur → **11.4**.
- Aucune police display (dette 10.1, `deferred-work.md`) : `system-ui` reste.
- Aucun changement de mise en page : si l'échelle ne tient pas quelque part, c'est le plafond du rôle qui baisse, et la note va dans `epics.md`.

### Project Structure Notes

- `DESIGN.md` et `.impeccable/design.json` à la racine du dépôt (pas dans `1score/`) ; `main.css` dans `1score/src/assets/` ; gabarits dans `1score/src/components/` et `1score/src/views/GameView.vue` ; tests co-localisés (AR16).
- `CLAUDE.md` §7 (réécrit en 11.0) : toute valeur manquante s'ajoute d'abord dans `DESIGN.md`, puis `main.css`, jamais dans un gabarit — cette story est la première à l'appliquer.
- Commande de validation de référence : `npm run build` (`vue-tsc -b && vite build`), pas `--noEmit` (`CLAUDE.md` §9).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11 — Story 11.1] AC et cadrage
- [Source: _bmad-output/planning-artifacts/design-system-audit-2026-09-15.md#4] constats P1 (CTA de réglage, `DÉMARRER`), P2 (échelle, tailles hors échelle, interlettrages, `BIENTÔT`)
- [Source: DESIGN.md#Typography] échelle actuelle, règles des chiffres nus et de la moyenne, dette n° 1
- [Source: PRODUCT.md#Operating Context] 1920×1080 référence, 1180×733 travail, lecture à 2 m
- [Source: _bmad-output/planning-artifacts/integration-bmad-impeccable.md#5, #6, #11] cycle comp-first, strates, découpage
- [Source: _bmad-output/implementation-artifacts/epic-10-retro-2026-09-15.md#5, #9] rendu statique validé avant câblage, harnais 1920/1180
- [Source: 1score/CLAUDE.md#7, #9, #12] tokens, validation, pièges de gabarit
- [Source: _bmad-output/implementation-artifacts/10-7-…md#Completion Notes] mesure de contraste sur la surface réelle, piège `main.css?raw`
- [Source: _bmad-output/implementation-artifacts/deferred-work.md] touches alpha 47×57 (10.7), accroche `ModeTile` 3,46:1

## Dev Agent Record

### Agent Model Used

Claude Fable 5.1 (`claude-fable-5-1`), session dev-story du 2026-09-15.

### Debug Log References

- **Harnais 1920×1080 :** l'extension Chrome ne peut pas ouvrir un viewport de 1920 px sur l'écran de 1440×900 de la machine (fenêtre plafonnée à 1384×789). Le rendu statique est donc produit par **Playwright headless** (Chromium 1208 déjà en cache, module de `@executeautomation/playwright-mcp-server`), script `render.cjs` dans le scratchpad de session : trois contextes à `deviceScaleFactor: 1`, parcours réel piloté par `pointerdown` sur les `data-testid`, capture de 12 écrans par format (accueil, sélection JDS, paramétrage vide et rempli, pop-up clavier alpha, pop-up pavé, scoreboard JDS neuf / avec saisie ouverte / en partie, pop-up de décision, récap, scoreboard 3 Bandes). Chaque capture est doublée d'un **audit DOM** : taille rendue par rôle, tout élément à texte dont le contenu dépasse sa boîte ou celle de son parent, toute commande sous 90×90 px, largeur des touches. Même police qu'au navigateur (`system-ui` → SF Pro sur macOS).
- **1re passe (échelle proposée telle quelle) — trois débordements à 1920, aucun sur tablette :** (1) barre latérale : `picto` à 19 px fait déborder `ENTRAÎNEMENT` (148 px), `CONFIGURATION` (157 px), `FERMER L'APPLICATION` (139 px), `RECOMMENCER` (148 px) de leur colonne de 120 px (112 px utiles) ; (2) pop-ups de saisie : `ANNULER` en `label` 38 px mesure 181 px sur son tiers de 154 px (`NumericPadDock`, `ScoreEntryDock`, `AlphaKeyboardSheet` — cartes `max-w-lg` de 512 px) ; (3) `12` de la zone de série signalé par l'audit = **faux positif** (le voile absolu du flash de frappe, `-inset-x-2`, gonfle `scrollWidth` de 16 px).
- **2e passe :** `picto` plafonné à 13 px (`CONFIGURATION` 107 px, tout tient) ; `label` à 32 px : `ANNULER` mesure **153 px sur 154** — tient en SF Pro avec 1 px, donc déborderait avec Segoe UI ou Roboto sur l'écran du club. **3e passe :** `label` à 30 px → 144 px sur 154 (10 px de marge), `stat` descend à 20 px pour garder le rapport label/stat ≈ 1,5 à 1,7 du rendu validé sur tablette (24/14). Zéro débordement à 1920 ; sur tablette, seul constat restant : `JEAN PIERRE` (11 lettres) en ellipse dans le champ `NOM` et dans le bandeau du récap — **antérieur à la story** (`field-value` 30,68 px et `title` 35,4 px à 1180 sont au pixel les valeurs de l'Epic 10 : `clamp(24px,2.6vw,40px)` et `clamp(28px,3vw,36px)` y valaient la même chose), et conforme à la Règle des chiffres nus (« un nom peut se tronquer »).
- **4e passe — GRILLE FLUIDE (décision de Nathan, 2026-09-15, sur les captures de la 3e passe) :** « en 1920 toutes les proportions ne sont pas bonnes, tout est un peu trop petit » (valeurs du récap, `−`/`+`, barre basse). Cause : seuls les textes grandissaient, les boîtes restaient en pixels fixes (grille de 8 px, cibles de 90 px, barre de 120 px, pop-ups de 512 px), d'où les trois plafonds bridés. **Écart assumé au périmètre de la fiche (« aucune mise en page »)** : `--spacing` passe en `clamp(8px, 0.678vw, 13px)` (8 sur tablette, 13 à 1920 — le facteur 1,63 de l'échelle typographique), et toute taille de boîte en dérive (`--size-touch-target` 90 → 146, `--size-start-button` 110 → 179, `--size-key-numeric` 60 → 98, `--size-key-alpha` 57 → 93, `--size-field-min/max` 130–220 → 211–358, `--size-tile-min` 180 → 293, `--game-clock-bleed` 24 → 39, insets de pop-up en unités de grille) ; les cartes de pop-up passent de `max-w-lg/xl/3xl` (rem) à `max-w-64/72/96` (grille) ; `gap-[12px]` → `gap-1.5`. Plus un seul pixel fixe de boîte dans les gabarits (restent, à dessein : `ring-8`, `border-8`, `border-2`, rayons, ombres, `@min-[420px]`). Les trois plafonds sont **rouverts** : `label` 38, `stat` 23, `picto` 19. Une partie du travail prévu en 11.2 (« hauteurs en dur → tokens de taille ») est donc faite ici. Audit après passe : tablette identique au pixel (grille à 8 px), zéro débordement à 1920 (`ANNULER` 181 px sur un tiers de 251), touches alpha 82×93 et numériques 233×98 à 1920. Seul constat : `JEAN PIERRE` (11 lettres) en ellipse dans le bandeau du récap à 1920 aussi (365 px pour 357 disponibles, `title` 58 px + rembourrage `pl-10` de 130 px) — même comportement que sur tablette, conforme à la Règle des chiffres nus.
- **5e passe — BUG du demi-anneau de tour à 1920 (relevé par Nathan sur la capture `12-scoreboard-3bandes-1920x1080.png`) :** le croissant rouge autour du disque du chrono flottait dans la colonne, décroché du liseré de la carte. Cause mesurée (Playwright) : à 1920×1080, avec `REP` et `PASSER LE TOUR` à leur nouvelle taille, la zone du chrono fait 462 × 427 px et le disque (`min(100cqw, 100cqh)`) est gouverné par la **hauteur** — 427 px, centré, donc 17,5 px en retrait de chaque bord de la zone : il ne mord la carte que de 21,5 px et non des 39 px de `--game-clock-bleed`. Or le clip du demi-anneau était mesuré depuis le bord du **disque** (« garde `bleed` depuis mon bord ») : 18 px de croissant restaient peints dans la colonne. Sur tablette (284 × 331) la largeur gouverne, disque et zone coïncident, rien ne se voyait — le défaut était latent depuis la 10.4. Correctif : le demi-anneau devient une **couche de la zone** (`absolute inset-0` sur la racine de `ShotClock`, désormais `relative`) qui centre un cercle de la taille exacte du disque (`DISC_SIZE_CLASSES`, partagée) ; le clip porte sur cette couche, et la zone, elle, déborde toujours d'exactement `bleed`. Re-mesuré : couche = zone (729 → 1191 à 1920), clip `inset(0 calc(100% - 39px) 0 0)` ; tablette identique. `ShotClock.test.ts` à mettre à jour en Task 3 (le ring n'est plus enfant du disque).
- **Cibles tactiles :** aucune commande de jeu sous 90×90 px aux trois formats (audit `small` vide partout). Touches alpha mesurées avant la grille fluide : 47×57 (1133), 50×57 (1180), 65×57 (1920) ; valeurs finales après la 4e passe : **47×57 (1133), 50×57 (1180), 82×93 (1920)** — l'écart de largeur de la 10.7 sur tablette reste ouvert pour la 11.3. Touches numériques 143×60 (tablette) / 233×98 (1920).
- `npm run build` vert après application des tokens ; utilitaires vérifiés dans le CSS émis (`.text-score-1`, `.text-clock`, `.tracking-title{letter-spacing:var(--tracking-title)}`).

### Completion Notes List

**Story livrée le 2026-09-15, statut `review`.** Rendu validé par Nathan en cinq passes (AC2 : « c'est bon comme ça » pour les CTA de réglage, « C'est bon » sur la grille fluide et le correctif du demi-anneau). Captures des trois formats (36 PNG, 12 écrans × 3 formats) vues et validées par Nathan, puis non conservées dans le dépôt (décision de Nathan, 2026-09-16 : inutiles une fois validées — le rendu se rejoue avec Playwright).

**Vérification finale (AC5, Task 5).** `impeccable detect` : **zéro constat** à 1920×1080, 1180×733 et 1133×744 (URL, page d'accueil — seule route rendue, limite consignée dans l'audit §1) et zéro sur `1score/src`. Passe navigateur : produite par Playwright headless (extension Chrome incapable d'ouvrir 1920 px sur l'écran de 1440×900), 12 écrans × 3 formats (cinq écrans, quatre pop-ups, JDS et 3 Bandes) avec audit DOM à chaque capture : aucun débordement, aucun libellé coupé (hors ellipse volontaire d'un nom de 11 lettres), aucune commande de jeu sous 90×90 px. Touches alpha re-mesurées : **47×57 (1133), 50×57 (1180), 82×93 (1920)** — la largeur reste sous le plancher de 57 px sur tablette (écart de la 10.7, à fermer en 11.3). `npm test` : **747 tests verts** (25 fichiers, +43), `npm run build` (`vue-tsc -b && vite build`) vert, `git diff --stat -- 1score/src/stores` **vide**.

**Passe `/impeccable polish` (Task 6).** Périmètre : fichiers touchés, aucune valeur visuelle. Contrôle croisé `DESIGN.md` ↔ `main.css` : les 18 rôles et 3 interlettrages ont la même valeur des deux côtés, aucun token `--text-*` / `--tracking-*` / `--size-*` déclaré sans consommateur. Aucune critique antérieure en base (`critique-storage latest` vide). Corrigés : quatre commentaires devenus faux (`PlayerSetupCard` « 14 → 18 px », `SideBar` « plafond de 12 px », `ActionBar` « 12 px et non gap-3 », `CenterPanel` « 16 / 24 / 32 px ») et trois mentions de `DESIGN.md` (barre latérale, débordement du chrono, note générale « toute mesure en pixels = valeur sur tablette »). `DESIGN.md` relu contre le livré : c'est lui qui porte les valeurs finales (label 38, stat 23, picto 19, grille fluide), `main.css` les applique.

Ce qui est fait :
- **Task 1 (AC1).** `DESIGN.md` réécrit : frontmatter `typography` à 18 rôles (`score-1` … `score-4`, `score-more`, `reprise`, `clock`, `series`, `adjust`, `hero`, `title`, `label`, `stat`, `picto`, `key-numeric`, `key-alpha`, `field-value`, `start`), bloc `tracking` à trois valeurs (`title` 0,15 em, `label` 0,1 em, `stat` 0,25 em), section Typography › Hierarchy réécrite avec le rendu aux trois formats et une sous-section Interlettrage, Arbitrages ouverts mis à jour, mentions éparses (Buttons, Chips, Inputs, Navigation, Shot Clock, Do's and Don'ts, Layout › Rythme) alignées sur les noms de rôle. `.impeccable/design.json` : `typographyMeta` à 18 entrées, `trackingMeta` ajouté, snippets de composants en `var(--text-*)`. Rôle `adjust` ajouté (les `−`/`+` étaient en `text-3xl` fixe : à 1920 ils ne bougeaient pas).
- **Task 2 (AC2), câblage sans test.** `main.css` : les sept tokens remplacés, onze ajoutés, `--text-score` supprimé, trois `--tracking-*`. Seize gabarits retouchés — quinze sur leurs seuls attributs `class`, `ShotClock` restructuré (demi-anneau remonté en couche de la zone, 5e passe) — : plus aucun `text-[…]` ni `tracking-[…]` dans `src/components` et `src/views` (grep = 0). `SETUP_CTA_CLASSES` passe de `text-stat` à `text-label` (AC4). Commentaires de `PlayerPanel`, `ShotClock`, `CenterPanel` mis à jour.

Décisions de rendu (2026-09-15) :
1. **Grille fluide** (Nathan, sur les captures de la 3e passe) : les boîtes suivent l'écran au même facteur que les textes, voir Debug Log « 4e passe ». Les plafonds `picto` / `label` / `stat` sont à leur cible 19 / 38 / 23. **Validé par Nathan sur les captures de la 4e passe (« C'est bon »).**
2. **CTA de réglage en `label` (AC4) — VALIDÉ par Nathan** (« c'est bon comme ça ») : `CHANGER DE BILLE` / `CHANGER DE CÔTÉ` sur deux lignes (à tous les formats depuis la grille fluide), contraste par la taille (≥ 22,7 px gras → seuil 3:1, blanc sur #2E8FDB à 3,46:1 ✅). Aucune entrée `deferred-work.md` pour le stop clair.
3. **`DÉMARRER` plancher 20 px** (18,1 → 20 à 1133, 18,9 → 20 à 1180) : 3,78:1 sur #E2515B au seuil 3:1 ✅. Visuellement neutre sur tablette.
4. **Score plafonné à 520 px** : inactif aux trois formats (à 1920×1080 c'est `40vh` = 432 px qui gouverne), il ne borne que le signage au-delà de 1080 px de haut. Un chiffre remplit la carte sans toucher le bandeau ni le pied (captures 07/09/12 à 1920).
5. **Regroupement des interlettrages** : `1Score` passe de 0,04 à 0,15 em (61 px dans 120), `DÉMARRER` de 0,05 à 0,1, `ESPACE` de 0,3 à 0,25, libellés du récap de 0,2 à 0,25. À l'œil, aucun des quatre ne change de caractère.
6. **`adjust` (`−`/`+`)** : 30 px sur tablette (valeur d'aujourd'hui), 48 px à 1920.

Rien dans `src/stores/` (`git diff --stat -- 1score/src/stores` vide).

### Contraste des CTA à dégradé (AC4, Task 4)

Blanc sur le **stop clair** du dégradé, tailles **mesurées** au rendu (Playwright, `getComputedStyle`), seuil WCAG 1.4.3 « grand texte » = 3:1 dès 18,66 px en graisse ≥ 700, sinon 4,5:1 :

| CTA | Fond (stop clair) | Ratio | 1133 | 1180 | 1920 | Seuil | Verdict |
|---|---|---|---|---|---|---|---|
| `CHANGER DE BILLE` / `CHANGER DE CÔTÉ` (`label` 700) | `#2E8FDB` | 3,46:1 | 22,7 px | 23,6 px | 38 px | 3:1 | ✅ partout |
| `DÉMARRER` (`start-button` 900) | `#E2515B` | 3,78:1 | 20 px (plancher) | 20 px (plancher) | 30,7 px | 3:1 | ✅ partout |
| Avant la story, pour mémoire : réglages en `stat` 700 | `#2E8FDB` | 3,46:1 | 13,6 px | 14,2 px | 18 px | 4,5:1 | ❌ |
| Avant la story : `DÉMARRER` `clamp(16px, 1.6vw, 26px)` | `#E2515B` | 3,78:1 | 18,1 px | 18,9 px | 26 px | 4,5:1 sous 18,66 | ❌ à 1133 |

Les deux passent **par la taille**, à tout format : aucune entrée `deferred-work.md`, le stop clair reste tel quel pour la 11.2. Les autres blancs sur bleu (`VALIDER`, CTA de pop-up, tuiles) sont en `label` / `title` gras et restent au-dessus du seuil.

### Change Log

- 2026-09-16 — Revue de code (bmad-code-review, trois relecteurs) : 13 correctifs appliqués en lot — rôle `start` renommé `start-button` (collision avec `text-align: start`), planchers `picto` / `stat` remontés à 12 / 14 px (décision de Nathan), coefficients `title` / `field-value` / `start-button` ajustés pour atteindre le plafond avant 1920, six tokens `--size-*` de plus (barre latérale, trois largeurs de pop-up, planchers des grilles de touches — décision de Nathan : « rien de hardcodé »), miroir `design.json` complété, `CLAUDE.md` règle 7 mise à jour, test de source durci, fiche / `DESIGN.md` / `deferred-work.md` réalignés. Deux reports (bandeau du récap à 32 px, deux graphies `min-h-[var(…)]` / `min-h-(…)`).
- 2026-09-15 — Story 11.1 livrée (dev-story) : échelle typographique conçue pour 1920×1080 (18 rôles, 3 interlettrages, `DESIGN.md` source unique, `main.css` applique, zéro valeur arbitraire dans les gabarits, test de source), **grille `--spacing` fluide et tailles de boîte dérivées** (écart assumé au périmètre, décision de Nathan), CTA de réglage en `label` (AC4 par la taille), rôle `adjust`, correctif du demi-anneau de tour de `ShotClock` (bug latent révélé à 1920). 747 tests verts, build vert, stores intacts. Statut → `review`.

### File List

- `DESIGN.md` — frontmatter `typography` (18 rôles), `tracking` et `spacing` (grille fluide + tailles dérivées), sections Typography et Layout › Rythme, Arbitrages ouverts, mentions de rôles dans Components / Do's and Don'ts
- `.impeccable/design.json` — `typographyMeta`, `trackingMeta`, snippets en `var(--text-*)`
- `1score/src/assets/main.css` — tokens `--text-*` et `--tracking-*` ; `--spacing` fluide, `--size-*` dérivés, insets et `--game-clock-bleed` en unités de grille
- `1score/src/components/PlayerPanel.vue` — `text-score-1` … `text-score-more`, `text-series`, `text-adjust`
- `1score/src/components/ShotClock.vue` — `text-clock` ; demi-anneau de tour remonté en couche de la zone, `DISC_SIZE_CLASSES` partagée (bug 1920)
- `1score/src/components/NumericPad.vue` — `text-key-numeric`, `tracking-title`, `min-h/min-w-(--size-key-numeric)`, plancher de grille dérivé
- `1score/src/components/AlphaKeyboard.vue` — `text-key-alpha`, `tracking-stat`, `tracking-title`, `min-h-(--size-key-alpha)`, plancher de grille dérivé
- `1score/src/components/PlayerSetupCard.vue` — `text-field-value`, `tracking-stat`, `tracking-title`, `min-h/max-h-(--size-field-*)`
- `1score/src/components/HomeScreen.vue` — `text-label` (réglages), `text-title tracking-title`, `text-start-button tracking-label`, `min-h-(--size-start-button)`
- `1score/src/components/SideBar.vue` — `tracking-title`, badge en `text-picto`
- `1score/src/components/IconAction.vue` — badge en `text-picto`
- `1score/src/components/GameSummary.vue` — `text-title`, `tracking-stat`, `tracking-label`
- `1score/src/components/ActionBar.vue` — `tracking-label`, `gap-1.5`
- `1score/src/components/PromptModal.vue` — `tracking-label`, `max-w-72`
- `1score/src/components/ModeTile.vue` — `text-title`, `min-h-(--size-tile-min)`
- `1score/src/components/CenterPanel.vue` — largeur/marge de la zone du chrono en unités de grille
- `1score/src/components/ScoreEntryDock.vue`, `NumericPadDock.vue` — `max-w-64`
- `1score/src/components/AlphaKeyboardSheet.vue` — `max-w-96`
- `1score/src/assets/typography.test.ts` — NOUVEAU : rôles, interlettrages et tailles de boîte déclarés, miroir `DESIGN.md` ↔ `main.css` dans les deux sens, plafonds atteints entre 1280 et 1920 (forme exacte du `clamp()` exigée), aucune taille hors échelle (`text-[`, `tracking-[`, `text-3xl`…) dans les gabarits
- `1score/src/components/CenterPanel.test.ts`, `NumericPad.test.ts`, `ShotClock.test.ts`, `GameSummary.test.ts`, `HomeScreen.test.ts`, `PlayerPanel.test.ts`, `SideBar.test.ts`, `IconAction.test.ts` — même assertion, nom du token ; `ShotClock.test.ts` gagne le cas « clip à la zone, pas au disque »
- `_bmad-output/planning-artifacts/epics.md` — Story 11.1 annotée (décisions de rendu, écarts)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — 11-1 → `review`
