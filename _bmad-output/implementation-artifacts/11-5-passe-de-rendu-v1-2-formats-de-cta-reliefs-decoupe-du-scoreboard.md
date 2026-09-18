# Story 11.5: Passe de rendu V1.2 — formats de CTA, reliefs, découpe du scoreboard

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur de club devant la tablette, et comme Nathan qui regarde l'écran,
I want que la dernière passe de rendu de la V1.2 arbitre au rendu les formats de CTA, les reliefs et la découpe du scoreboard,
so that l'Epic 11 se close sur un design **fini** et non sur un design system propre mais inachevé.

> **Cadrage (bmad-create-story, 2026-09-18).** **Cinquième et dernière story de l'Epic 11**, et la seule qui ne figurait pas au plan d'origine (11.0 → 11.4) : elle naît d'une décision de Nathan du 2026-09-17, consignée le jour même dans `deferred-work.md` et dans le commit `e38e315`. Les quatre premières ont produit **la matière** (échelle, palette, briques) puis **l'instrument** (scans, contraste, miroirs) ; celle-ci **dessine**. C'est une story de **RENDU** : Nathan tranche sur des images, pas sur du texte.
>
> **Ce qui la rend possible, et c'est tout l'argument de l'ordre choisi** (11.4 avant elle) : un format de variante de CTA se change **en un seul endroit** (`VARIANT_CLASSES` de `CtaButton.vue`, six variantes) ; un relief, un rayon, une taille ou un rôle typographique se changent **en deux**, et dans cet ordre imposé — frontmatter de `DESIGN.md` **puis** `main.css`, jamais dans un gabarit (`CLAUDE.md` §7). `tokens.test.ts` et `typography.test.ts` **lisent** le frontmatter depuis la 11.4 : la story ne peut pas déraper en silence. Et les douze scènes `?scene=` permettent de mesurer chaque proposition, aux trois formats, sans rejouer un parcours à la main.
>
> **Décision de Nathan à la création (2026-09-18) : tout en une story, la géométrie couplée du chrono EN PREMIER.** CTA, reliefs et découpe se rassemblent — « ce sont des décisions de RENDU, pas du refactor, et elles se rassemblent » (2026-09-17). La découpe est le point dur : elle exige du **markup**, pas une surcharge CSS, et elle est **bloquée** tant que le chrono n'est pas découplé. D'où l'ordre des tâches : le chrono d'abord, la découpe ensuite, le reste après.
>
> **Nature des références visuelles : AUCUNE — intention seule** (décision de Nathan à la création, 2026-09-18). Aucune capture d'`explore/resources` n'est reprise, pas même les `billiboard_scoreboard*` qui ont fondé le report. Les propositions se produisent **par surcharges CSS aux trois formats** (méthode rodée en 11.2 et 11.3) et Nathan tranche sur le rendu.
>
> **Combinaison inédite à annoncer** (méthode de l'epic) : **un rayon sur un conteneur**. `DESIGN.md` › Shapes énonce « conteneurs à angles vifs (aucun token, aucun `rounded-*`) : cartes joueur, tuiles, colonnes… ». Une carte joueur arrondie serait une **exception à une règle datée et arbitrée** (Nathan, 10.1 : « l'app doit se lire comme un outil tactile, pas comme une app mobile »). Si elle est prise, elle s'écrit dans `DESIGN.md` › Shapes, datée, **avant** le code ; si elle ne l'est pas, la découpe se fait à angles vifs et la règle reste intacte.
>
> **🔴 RÈGLE BLOQUANTE DE LA STORY (Nathan, 2026-09-18) : rien ne s'implémente avant une comparaison au rendu.** Toute décision d'apparence — un format de CTA, un relief, une gouttière, un rayon, une ombre — est **d'abord** rendue en **au plus deux propositions côte à côte, aux trois formats**, produites **sans toucher au code applicatif** (surcharges CSS injectées par le harnais), et Nathan tranche **sur les images**. C'est la méthode du travail des couleurs (Story 11.2, douze passes) : elle vaut ici pour **chacune** des trois familles de décisions, pas seulement pour la découpe. Une proposition câblée est une proposition qu'on n'ose plus jeter ; une surcharge se jette gratuitement.
>
> ⚠️ **L'unique exception, et elle est technique, pas visuelle : la Task 2 (découplage du chrono).** Elle ne *décide* rien — elle rend la découpe proposable, puisque les deux propositions de la 11.3 « marchaient » en surcharge et cassaient le disque. Elle est donc à **rendu constant** : les captures d'après doivent être **identiques au pixel** à celles d'avant (AC2). Si elles ne le sont pas, ce n'est pas une décision de rendu à soumettre, c'est une régression à corriger.
>
> **⚠️ L'epic se clôt sur cette story.** C'est elle qui rejoue `/impeccable audit` en dernier (le 19/20 de la 11.4 mesure la passe design system, pas le design final) et qui déroule la liste de contrôle du critère de sortie vers l'Epic 4.

## Acceptance Criteria

**AC1 — Ligne de base pixel, AVANT la première ligne de code**
**Given** un arbre propre — le **code applicatif est inchangé depuis `123cf19`**, les commits de plan ne touchant que la documentation —, `npm test` (**1107 attendus, 32 fichiers**) et `npm run build` verts
**When** la story démarre
**Then** les **36 captures** de référence (12 écrans × 3 formats : 1920×1080, 1180×733, 1133×744) sont prises par `node scripts/render-static.cjs <outDir> --override scripts/freeze-animations.css`, sur un **serveur de dev neuf**, et archivées hors dépôt ; `npm run design:check` et `npm run design:check:file` sont lancés et leur **code de sortie** noté
**And** ⚠️ **le gel des animations n'est pas optionnel** : sans `freeze-animations.css`, deux passes du même code divergent sur la pop-up de saisie (barre de rebours) — le harnais n'est déterministe qu'avec lui (établi à la revue de la 11.3, 12 écrans identiques au pixel sur deux passes)
**And** contrairement à la 11.3, ces captures **ne servent pas à prouver l'absence de changement** : elles servent d'**avant** dans les comparaisons soumises à Nathan, et à isoler ce qui bouge **sans avoir été décidé**

**AC2 — La géométrie couplée du chrono est DÉCOUPLÉE, et prouvée, avant toute gouttière**
**Given** `--game-clock-bleed` (3 unités), lu par trois composants qui doivent coïncider au pixel — `CenterPanel` (largeur et marge négative de la zone), `ShotClock` (taille du disque, `clip-path` du demi-anneau de tour) et `PlayerPanel` (gouttière intérieure `pr-4` / `pl-4`)
**When** une gouttière apparaît entre les trois colonnes
**Then** le disque du chrono **déborde toujours de `--game-clock-bleed` DANS chaque carte**, gouttière franchie : il n'est ni tronqué, ni décollé, ni rogné — c'est exactement ce qui a fait écarter les deux propositions de la 11.3
**And** le **demi-anneau de tour** reprend le tracé du liseré `ring-8` **au bon endroit** : la bande rouge conservée est celle qui se pose **sur la carte**, jamais celle qui survole la gouttière
**And** la vérification est faite **au navigateur aux trois formats** et en **3 Bandes** (seul mode où le chrono existe, scène `12-scoreboard-3bandes`), pas seulement à 1180 : à 1920×1080 c'est la **hauteur** qui gouverne la taille du disque (427 px de disque pour 462 de zone en 11.1) — le cas qui avait laissé 18 px de croissant flotter
**And** ⚠️ **aucun `overflow-hidden`** n'apparaît sur la colonne centrale ni sur aucun de ses ancêtres : l'anneau serait rogné **sans le moindre message d'erreur**
**And** ⚠️ **cette tâche est à RENDU CONSTANT** : tant qu'aucune gouttière n'est décidée, les captures de `07`, `09` et `12` après découplage sont **identiques au pixel** à celles de l'AC1 (même protocole : animations gelées, serveur neuf). Le découplage ne décide rien — il rend la découpe *proposable*. Tout écart ici est une **régression**, pas une proposition

**AC3 — La découpe du scoreboard est arbitrée au rendu, et livrée**
**Given** le report de la 11.2 (Nathan, photo Billiboard : « cartes joueur arrondies et séparées par une marge, barre basse mieux découpée ») et les deux propositions écartées de la 11.3 (**B1** gouttière d'une unité partout + rayon tapable + surface voilée sous la colonne centrale ; **B2** zone de jeu soudée mais décollée des bords et de la barre)
**When** l'AC2 est tenue
**Then** **au plus deux propositions** sont rendues côte à côte aux trois formats, en 3 Bandes **et** en JDS (le chrono change tout), et Nathan tranche **sur le rendu**, avant câblage définitif
**And** la valeur de gouttière est **une seule valeur lue par tous** : soit un token d'intention du frontmatter `spacing` de `DESIGN.md` (recommandé — c'est exactement le cas qui a justifié `--game-clock-bleed` : trois composants qui doivent coïncider au pixel), soit une constante d'écran de `GameView` transmise en prop (le patron des insets rapatriés en 11.3). **L'arbitrage est pris explicitement et écrit**, il n'est pas subi : `CLAUDE.md` §10 dit « un token décrit une intention, jamais une position »
**And** si un **rayon sur conteneur** est retenu, `DESIGN.md` › Shapes reçoit l'exception **datée et motivée** avant le code, et `tokens.test.ts` la laisse passer parce qu'elle est nommée — pas parce qu'elle est arbitraire
**And** la **barre basse** est traitée dans le même mouvement (c'est la moitié du report) : sa découpe, ou son absence de découpe, est une décision prise, pas un oubli
**And** ⚠️ **si Nathan écarte à nouveau les deux propositions**, l'entrée est close comme **écartée définitivement** — avec ce qui a été essayé et mesuré — et **non re-reportée** une troisième fois : `DESIGN.md` › Shapes reste intact, et la story se termine sur les CTA et les reliefs. Un report qui revient trois fois est une décision qu'on refuse de prendre

**AC4 — Formats de CTA : six variantes, un seul endroit**
**Given** `VARIANT_CLASSES` de `CtaButton.vue` (`accent`, `neutral`, `setup`, `start`, `bar`, `pass`) et `DESIGN.md` › Components › Buttons
**When** Nathan demande à revoir « des formats de CTA »
**Then** les propositions sont rendues **par surcharges CSS**, aux trois formats, sur les écrans où chaque variante vit réellement (scènes 01/03/06 pour `setup` et `start`, 04/05/08/10 pour `accent` et `neutral`, 07/09/12 pour `bar` et `pass`) ; Nathan tranche, puis `DESIGN.md` est réécrit **en premier** et `CtaButton.vue` / `main.css` appliquent
**And** **aucune valeur visuelle n'entre dans `CtaButton.vue`** : hauteur par `--size-*`, rayon par `--radius-*`, fond par `--gradient-*`, texte par `--text-*` / `--tracking-*`, ombre par `--shadow-*`. Un format qui exige une valeur nouvelle est un **trou du design system** : la valeur naît dans `DESIGN.md`, jamais dans la table
**And** les trois contraintes déjà payées sont **préservées** : `accent` et `neutral` ne portent **aucune largeur** (deux utilitaires `w-*` sur le même élément se disputeraient `width`) ; le neutre a **un seul** retour d'appui, `brightness(1.25)`, et il s'éclaircit là où les autres s'assombrissent ; `DISABLED_CLASSES` reste **commun aux six** (un `accent` inactif doit se distinguer d'un `accent` vivant — le `VALIDER` grisé de l'Epic 4 en dépend)
**And** toute classe reste écrite **en toutes lettres** dans la table : le scanner JIT de Tailwind 4 n'émet rien d'une interpolation, **en silence**

**AC5 — Reliefs : le vocabulaire d'ombres est rouvert, et refermé sur une décision**
**Given** `DESIGN.md` › Elevation & Depth — six tokens `--shadow-*`, la Règle du relief tapable (« un conteneur est plat et cerné ; seul un objet qu'on tape a du corps ») et les deux seules ombres portées du produit (pop-up, barre latérale)
**When** Nathan demande à revoir « des reliefs »
**Then** les propositions passent par le frontmatter `shadows` de `DESIGN.md` **puis** `main.css`, jamais par un `shadow-[…]` de gabarit (`tokens.test.ts` le refuse, et il lit désormais le frontmatter)
**And** ⚠️ **deux arbitrages de la 11.2 sont explicitement rouverts, et re-tranchés** — pas contournés : l'**ombre de barre basse** (écartée par Nathan : « pas hyper bien intégrée ») et le **verre des pop-ups** (flou 8 px à 88 %, dont le report note que le jaune de la carte joueur transparaît et tire vers l'olive — à revoir si la géométrie des pop-ups bouge). Chaque décision est datée dans `DESIGN.md`, l'ancienne n'est pas effacée en silence
**And** si la Règle du relief tapable est mise en défaut par une décision de Nathan, **c'est la règle qui est réécrite**, datée — une exception non écrite est une divergence de plus

**AC6 — Contraste : mesuré, pas estimé — et le détecteur ne suffit pas**
**Given** que le détecteur Impeccable est **aveugle au contraste des libellés de CTA** (établi par mutation en 11.4 : sa règle `low-contrast` ne résout le fond que sur l'élément qui **porte** le texte et ne remonte pas aux ancêtres, or `CtaButton` met le dégradé sur le `<button>`)
**When** un dégradé, une taille de texte ou une graisse de CTA change
**Then** `CtaButton.contrast.test.ts` est **mis à jour et vert** : c'est lui, et lui seul, qui tient le contraste des six variantes depuis la source, aux trois formats, avec la bascule de seuil WCAG (4,5:1, ou 3:1 à ≥ 18,66 px gras)
**And** toute valeur de contraste écrite dans `DESIGN.md` est **mesurée sur la surface réelle**, jamais estimée « au milieu du dégradé » : la 11.4 a dû corriger `PASSER LE TOUR` de 4,95:1 estimé à **5,18:1 mesuré** (le libellé est à 72,2 % de la hauteur, pas au milieu)
**And** la **passe navigateur manuelle** aux trois formats a lieu, en **paysage seulement** (`CLAUDE.md` §9) : le détecteur ne voit ni géométrie inventée, ni anneau qui recouvre un liseré, ni médaillon qui déborde — c'est-à-dire **précisément** ce que cette story touche

**AC7 — Les douze scènes tiennent, et les scans sont propres ou étiquetés**
**Given** les douze scènes `?scene=` et les huit ignores scopés de `.impeccable/config.json`
**When** la story se termine
**Then** les douze scènes s'ouvrent encore et montrent **ce que leur nom annonce** : une découpe qui change la mise en page du scoreboard ne doit pas laisser `07`, `09` ou `12` sur un écran devenu faux
**And** `npm run design:check` et `npm run design:check:file` sont lancés sur **serveur de dev neuf** et lus **par leur code de sortie** (`0` propre, `2` constats, `1` échec — un scan propre n'imprime rien) ; tout constat est **corrigé** ou **encodé avec sa raison mesurée** dans `.impeccable/config.json` et `DESIGN.md` › Écarts assumés au détecteur. Aucun constat ne reste sans l'une des deux étiquettes
**And** les **douze scènes sont rouvertes une à une** après le dernier changement de markup : le semis vit dans `HomeScreen` / `GameView` / `main.ts`, et un refactor de mise en page peut le casser sans qu'aucun test ne bronche
**And** si un composant change de rendu, les snippets de `.impeccable/design.json` qui le décrivent **suivent** : le détecteur mesure contre eux, et un snippet périmé lui fait mesurer un fantôme
**And** `npm test` et `npm run build` sont verts, et **`src/stores/` est intact** (`git diff --stat -- 1score/src/stores` vide) — la règle vaut sur toute l'epic

**AC8 — `useRejectFeedback`, si et seulement si les CTA ont déjà bougé** *(la plus basse priorité : reportable sans bloquer le reste)*
**Given** le mécanisme d'animation de rejet recopié **trois fois à l'identique** (`rejectKey` + `:class="rejectKey > 0 && 'animate-input-reject'"` dans `AlphaKeyboardSheet.vue:37,54,82-85`, `NumericPadDock.vue:51,72,103-107`, `ScoreEntryDock.vue:64,86,134-138`), trouvé par la passe `/impeccable extract` de la 11.4 et nommé « candidat naturel pour la passe de rendu V1.2 »
**When** les trois hôtes de saisie ont déjà été ouverts par une décision de rendu
**Then** un composable `useRejectFeedback()` rendant `{ rejectKey, reject }` remplace les trois copies ; **les règles restent dans chaque hôte** (ce qui compte comme un rejet : plafond de nom, plafond de chiffres) — UX-DR54 et `CLAUDE.md` §10 : les hôtes portent les règles, les pavés restent muets
**And** si les trois hôtes n'ont **pas** été touchés par ailleurs, ce refactor **ne se fait pas ici** et reste dans `deferred-work.md` : ouvrir les trois pop-ups les plus délicates du produit pour un refactor seul n'est pas le sujet d'une story de rendu

**AC9 — Clôture de l'Epic 11**
**Given** `design-system-audit-2026-09-15.md` (14/20) et le ré-audit de la 11.4 (19/20, qui mesurait le design system et non le design final)
**When** la story se termine
**Then** `/impeccable audit` est **rejoué une dernière fois** et son score consigné **en regard des deux précédents**, dimension par dimension ; `DESIGN.md` est **relu** contre le code livré (`/impeccable document` en relecture, ⚠️ **jamais en écrasement** : il porte des décisions datées de Nathan) ; `/impeccable polish` passe sur les fichiers touchés
**And** `deferred-work.md` reçoit les reports de la story, et l'entrée « passe de rendu V1.2 » est **close** (elle a été écrite pour être consommée ici)
**And** la **liste de contrôle du critère de sortie** (fiche 11.4, AC7) est déroulée et **mise à jour de ce que cette story a appris** — elle sera lue à la création de la première story de l'Epic 4 : zéro composant de base créé, zéro token ajouté, écran adressable par `?scene=`, `VALIDER` grisé disponible, champ sur fond sombre à mesurer avant de le dessiner, deux pop-ups simultanées non arbitrées
**And** `epics.md` › Epic 11 est annotée de cette story (elle n'y figurait pas : l'epic y annonce `11.0 → 11.4`), et `sprint-status.yaml` passe la clé en `review`

## Tasks / Subtasks

- [ ] **Task 1 — Ligne de base pixel et outillée** (AC1)
  - [ ] Arbre propre, code applicatif inchangé depuis `123cf19` ; `npm test` (**1107 / 32 fichiers**) et `npm run build` verts, notés dans Dev Agent Record
  - [ ] **Redémarrer `npm run dev`** (serveur neuf — voir Pièges), puis 36 captures avec `--override scripts/freeze-animations.css`, archivées hors dépôt ; noter le dossier dans Dev Agent Record
  - [ ] `npm run design:check` + `npm run design:check:file`, **codes de sortie** notés
- [ ] **Task 2 — Découpler la géométrie du chrono** (AC2) — *la première, et rien ne commence avant qu'elle soit verte*
  - [ ] Écrire dans Dev Agent Record **les trois lectures actuelles** de `--game-clock-bleed` et ce que chacune suppose (voir Dev Notes › La géométrie couplée, terme à terme)
  - [ ] Introduire la gouttière comme **une seule valeur** (arbitrage d'AC3 pris ici, et écrit) ; recomposer la largeur/marge de `CenterPanel`, le `clip-path` de `ShotClock`, la gouttière intérieure de `PlayerPanel`
  - [ ] **Vérifier au navigateur**, trois formats, mode 3 Bandes (`?scene=12-scoreboard-3bandes`) : disque non tronqué, demi-anneau raccordé au liseré, aucun croissant flottant. **Les tests unitaires ne voient rien de tout ça** (happy-dom ne calcule aucun CSS)
  - [ ] Cas limite explicite : **hauteur gouvernante** à 1920×1080 — le disque est plus étroit que sa zone
  - [ ] **Preuve à rendu constant** : rejouer les captures `07`, `09`, `12` aux trois formats et les comparer à celles de la Task 1 — **identiques au pixel**, sinon corriger avant d'aller plus loin
- [ ] **Task 3 — Découpe du scoreboard : propositions, arbitrage, livraison** (AC3)
  - [ ] 🔴 **Comparaison au rendu AVANT tout code** : au plus deux propositions par surcharges CSS, aux trois formats, **en 3 Bandes et en JDS** ; **arbitrage obtenu et noté** dans Dev Agent Record
  - [ ] Décision appliquée : `DESIGN.md` › Shapes / Layout **d'abord** (avec l'exception de rayon sur conteneur, datée, si elle est prise), `main.css` et le markup ensuite
  - [ ] Barre basse traitée dans le même mouvement (découpée ou non — décision écrite)
  - [ ] Scènes `07`, `09`, `12` re-regardées : elles montrent encore ce que leur nom annonce
- [ ] **Task 4 — Formats de CTA** (AC4)
  - [ ] 🔴 **Comparaison au rendu AVANT tout code** : au plus deux propositions, côte à côte, aux trois formats, sur les écrans où chaque variante vit ; soumises à Nathan, **arbitrage obtenu et noté** dans Dev Agent Record
  - [ ] `DESIGN.md` › Components › Buttons **d'abord**, puis `VARIANT_CLASSES` / `main.css` ; **zéro valeur visuelle** dans `CtaButton.vue`
  - [ ] Les trois contraintes préservées : pas de largeur sur `accent` / `neutral`, un seul retour d'appui pour le neutre, `DISABLED_CLASSES` commun aux six
  - [ ] `CtaButton.test.ts` et `CtaButton.contrast.test.ts` mis à jour et verts
- [ ] **Task 5 — Reliefs** (AC5)
  - [ ] 🔴 **Comparaison au rendu AVANT tout code** : au plus deux propositions par relief, côte à côte, aux trois formats ; **arbitrage obtenu et noté**, puis frontmatter `shadows` de `DESIGN.md` **d'abord**, `main.css` ensuite
  - [ ] Les deux arbitrages rouverts sont **re-tranchés et datés** : ombre de barre basse, verre des pop-ups
  - [ ] Si la Règle du relief tapable est mise en défaut, elle est **réécrite**, pas contournée
- [ ] **Task 6 — Contraste et passe navigateur** (AC6)
  - [ ] `CtaButton.contrast.test.ts` remis à jour à chaque dégradé / taille / graisse qui bouge ; **vérifié par mutation** (casser une valeur doit rougir)
  - [ ] Toute valeur de contraste écrite dans `DESIGN.md` est **mesurée**, avec le point de mesure nommé
  - [ ] Passe navigateur manuelle, trois formats, **paysage seulement**, les douze scènes parcourues
- [ ] **Task 7 — Scans, tests, build** (AC7)
  - [ ] Serveur de dev **neuf**, puis `design:check` + `design:check:file` ; **codes de sortie** lus, constats corrigés ou encodés avec raison mesurée
  - [ ] Snippets de `.impeccable/design.json` alignés sur ce que le code rend maintenant
  - [ ] `npm test`, `npm run build` verts ; `git diff --stat -- 1score/src/stores` **vide**
  - [ ] 36 captures d'**après**, comparées à celles de Task 1 : **tout écart doit être une décision**, ou c'est un défaut
- [ ] **Task 8 — `useRejectFeedback`** (AC8) — *conditionnelle, reportable*
  - [ ] Seulement si les trois hôtes de saisie ont déjà été ouverts par une décision de rendu ; sinon, laisser le report intact et le dire
- [ ] **Task 9 — Clôture de l'epic** (AC9)
  - [ ] `/impeccable audit` rejoué, score **en regard du 14/20 et du 19/20** ; `DESIGN.md` relu (pas écrasé) ; `/impeccable polish` sur les fichiers touchés
  - [ ] `deferred-work.md` : reports de la story, entrée « passe de rendu V1.2 » **close**
  - [ ] Liste de contrôle du critère de sortie mise à jour pour l'Epic 4
  - [ ] `epics.md` › Epic 11 annotée de la Story 11.5 ; `sprint-status.yaml` → `review`

## Dev Notes

### Ce qui distingue cette story des quatre précédentes

| | 11.1 / 11.2 | 11.3 | 11.4 | **11.5** |
|---|---|---|---|---|
| Nature | propositions au rendu | refactor | outillage | **propositions au rendu + markup** |
| Preuve | validation de Nathan | **pixel identique** | mutation | **validation de Nathan + tout écart non décidé est un défaut** |
| Markup | non (11.2), oui (11.1, grille) | non | non | **oui — c'est ce qui bloquait la découpe** |

⚠️ **Le piège de cette story est l'inverse de celui de la 11.3.** Là-bas, un pixel qui bougeait était un bug. Ici, des pixels **doivent** bouger — et le risque est qu'un écart **non décidé** se cache parmi les écarts voulus. D'où les 36 captures d'avant (AC1) et la comparaison de fin (Task 7) : elles ne prouvent plus l'immobilité, elles **isolent l'imprévu**.

### La géométrie couplée du chrono, terme à terme

C'est **le** point dur, et c'est pour lui que la découpe a été écartée en 11.3. Trois composants lisent `--game-clock-bleed` (`main.css:256`, `calc(var(--spacing) * 3)` — 24 px sur tablette, 39 à 1920) et doivent coïncider **au pixel** :

| Composant | Ligne | Ce qu'il écrit | Ce qu'il suppose |
|---|---|---|---|
| `CenterPanel` | `:127` | `w-[calc(100% + 2 * (bleed + spacing*2))]` et `mx-[calc(-1 * (bleed + spacing*2))]` | que le `+ spacing*2` compense **exactement** le `p-2` de la colonne (calcul sur la **content box**), et qu'au-delà il ne reste que `bleed` de débordement réel **dans la carte** |
| `ShotClock` | `:42-43` | `clip-path: inset(0 calc(100% - bleed) 0 0)` (gauche) / symétrique | que la bande conservée, **mesurée depuis le bord de la ZONE**, est celle qui se pose sur la carte. Vrai tant que la zone dépasse de `bleed` exactement |
| `ShotClock` | `:49` | `aspect-square w-[min(100cqw,100cqh)]` | rien — mais c'est la source du cas limite : **le disque n'a pas la largeur de sa zone** quand la hauteur gouverne |
| `PlayerPanel` | `:76-78` | `pr-4` / `pl-4` (4 unités) | que 4 unités absorbent les 3 unités de débordement. Le **fond** reste pleine largeur, seul le contenu recule |
| `PlayerPanel` | `:332` | `ring-8 ring-inset` en `z-10` overlay | que le disque passe **au-dessus** (`z-20` sur la zone) et que le demi-anneau de `ShotClock` reprend le tracé |

**Ce qu'une gouttière `g` change.** La zone doit désormais traverser la gouttière **en plus** de déborder dans la carte, sinon le disque est coupé net — c'est exactement le constat de la 11.3. Le raisonnement (à **vérifier au navigateur**, pas à croire) :

- `CenterPanel` : la demi-largeur ajoutée passe de `bleed + spacing*2` à `bleed + g + spacing*2`, des deux côtés.
- `ShotClock` : le clip est mesuré depuis le bord de la zone, qui est maintenant à `bleed + g` du bord de carte. Garder `bleed` **sur la carte** ne s'écrit plus `inset(0 calc(100% - bleed) 0 0)` mais quelque chose comme `inset(0 calc(100% - g - bleed) 0 g)` — la bande rouge ne doit **pas** survoler la gouttière, sans quoi le raccord au liseré `ring-8` se fait dans le vide.
- `PlayerPanel` : la gouttière intérieure doit rester **≥ `bleed`**, pas `≥ bleed + g` (la part `g` tombe hors de la carte).
- Si les cartes prennent un rayon, `ring-inset` le suit automatiquement (il épouse le rayon de l'élément) — mais **le demi-anneau de `ShotClock` ne le sait pas** : il est circulaire, et son raccord avec un liseré arrondi est à regarder à l'œil, aux trois formats.

⚠️ **Aucun `overflow-hidden`** sur la colonne centrale ni ses ancêtres : l'anneau serait rogné **sans erreur**. Et `scrollWidth` / `scrollHeight` ne voient rien sous `overflow-hidden` (`CLAUDE.md` §12) — pour détecter un débordement, comparer les `getBoundingClientRect()` des enfants à celui du parent.

### Token ou constante d'écran, pour la gouttière ?

Arbitrage à prendre **explicitement** (AC3), les deux patrons existent dans le projet :

- **Token d'intention** (frontmatter `spacing` de `DESIGN.md` → `main.css`) — le patron de `--game-clock-bleed`. **Recommandé ici** : trois composants doivent lire la **même** valeur et coïncider au pixel, c'est précisément l'argument qui a fait de `bleed` un token (`CLAUDE.md` §10, « trois usages dans trois fichiers qui restent cohérents tant qu'ils lisent le même token »).
- **Constante d'écran transmise en prop** — le patron des insets rapatriés en 11.3 (`GAME_POPUP_RESERVE` dans `GameView`), fondé sur « un token décrit une intention, jamais une position ». Une gouttière **est** un rythme de mise en page, pas une position : c'est ce qui penche vers le token.

Quel que soit le choix : **une seule valeur, lue par tous**, jamais recopiée. C'est la recopie qui a créé les quatre faux tokens d'inset.

### Méthode des passes de rendu (rodée en 11.2 et 11.3) — **préalable bloquant, pas une option**

> **Nathan, 2026-09-18 : « avant chaque implémentation je veux une comparaison visuelle comme ce qu'on a fait pour le travail des couleurs ».** Les douze passes de la 11.2 sont la référence : l'aller-retour est la norme, pas l'exception, et aucune ligne de code applicatif ne s'écrit sur une intention décrite en texte.


1. `npm run dev` **redémarré** (voir Pièges), URL notée — le port varie (`5173`/`5174`/`5175`).
2. Surcharges CSS dans un fichier, injectées par `node scripts/render-static.cjs <outDir> --override <fichier.css>` : un `:root { … }` injecté en fin de `<head>` gagne sur le `@theme` de `main.css` (même spécificité, source postérieure), et les utilitaires Tailwind qui lisent la variable en `var()` suivent. **Aucune ligne de code applicatif n'est touchée pour proposer.**
3. Au plus **deux** propositions par arbitrage, rendues **côte à côte aux trois formats** — c'est le format que Nathan a tranché douze fois en 11.2.
4. Nathan tranche. **Puis** `DESIGN.md` d'abord, `main.css` / le markup ensuite.
5. ⚠️ **Une surcharge CSS ne peut pas proposer un changement de markup.** La découpe en est l'exemple : les deux propositions de la 11.3 « marchaient » en surcharge et cassaient le chrono. Pour l'AC3, la proposition n'est crédible **qu'après** l'AC2 — c'est l'ordre imposé des tâches.
6. `--focus` ajoute deux captures avec l'anneau `:focus-visible` forcé au clavier (ni la souris ni `pointerdown` ne le déclenchent).

### Pièges

- **⚠️ Le chemin Playwright par défaut du harnais NE RÉSOUT PAS sur cette machine.** `render-static.cjs:37-38` pointe vers `/Users/nathanlegendre/.nvm/…`, et le dossier personnel est `/Users/nathan` — le premier lancement échoue. **Vérifié le 2026-09-18**, l'installation qui marche est :
  ```sh
  PLAYWRIGHT_MODULE=/Users/nathan/.npm/_npx/787f53666b8d4740/node_modules/playwright \
    node scripts/render-static.cjs <outDir> --override scripts/freeze-animations.css
  ```
  Playwright **1.58.0** ↔ **chromium-1208** dans `~/Library/Caches/ms-playwright` : c'est exactement le couple documenté dans `deferred-work.md`. ⚠️ C'est un **cache `npx`**, il peut être purgé : si le chemin disparaît, le relancer sans la variable donne le message qui dit quoi faire (durci en 11.4).
- **Un serveur de dev de longue vie ment sur la CSS.** Le cache Tailwind de Vite ne réélague pas ce qu'il a déjà généré : des utilitaires morts continuent d'être émis. **Redémarrer `npm run dev` avant toute capture ou tout scan qui compte** — la comparaison pixel de la 11.3 a dû être entièrement rejouée pour cette raison.
- **Le harnais n'est déterministe qu'avec `freeze-animations.css`.** `prefers-reduced-motion` ne suffit pas : la garde du produit **conserve volontairement** le chrono et la barre de rebours.
- **`npm run design:check` efface la partie sauvegardée du navigateur de travail** (`scenes.ts:229`, `discardSavedGame()` en tête de chaque scène — nécessaire, sinon `PARTIE EN COURS` recouvre les douze écrans). Ne pas lancer un scan au milieu d'une vérification manuelle en cours.
- **Les points de semis des scènes vivent DANS le markup que cette story touche** : `HomeScreen.vue:137-156` et `GameView.vue` sèment leur état local **au `setup`**, et `main.ts` applique la part store **avant `app.mount()`**. Un refactor de mise en page qui déplace ou renomme une ref locale casse une scène **en silence** — `scenes.test.ts` ne compare que les douze **identifiants**, jamais leur contenu.
- **`?scene=` re-sème `HomeScreen` à chaque remontage** (`HomeScreen.vue:137-156`, pas de mémoire de « déjà semé ») : tant que le paramètre reste dans l'URL, revenir à l'accueil réécrase `step`, `players`, `draft`… **Retirer le paramètre de l'URL** avant toute manipulation manuelle, sinon elle est annulée sans indice visible.
- **Le contenu des scènes n'est confronté à rien** : `scenes.test.ts` ne verrouille que les **noms**. Les états vivent en double — semés par `scenes.ts`, joués par clics dans `render-static.cjs:186-243`. Si cette story change un écran, **vérifier que `?scene=NN-…` et la capture `NN-….png` montrent toujours la même chose**.
- **Le 1920×1080 ne s'ouvre pas dans Chrome sur cette machine** (plafond mesuré 1384×789) : tout ce qui se vérifie à 1920 passe par Playwright ou `detect --viewport`, jamais par la fenêtre.
- **`detect` lit son contexte dans le répertoire courant et ne remonte pas** : `design-check.sh` se place à la racine, c'est délibéré. Un `detect` lancé à la main depuis `1score/` mesure **sans design system ni ignores**, sans le dire.
- **Un scan propre n'imprime rien.** Lire `$?`, jamais la sortie. `0` propre, `2` constats, `1` échec.
- **`detect` lit `.impeccable/design.json`** : un snippet qui décrit un composant que le code ne rend plus fait mesurer un fantôme. Si un composant change ici, **le snippet suit**.
- **Le détecteur est aveugle au contraste des libellés de CTA** — sa règle ne remonte pas aux ancêtres, et `CtaButton` met le dégradé sur le `<button>`. C'est `CtaButton.contrast.test.ts` qui tient ce contraste. Ne pas conclure « propre » d'un scan de CTA.
- **Aucune classe Tailwind construite à la volée** (`CLAUDE.md` §12) : le scanner JIT ne voit que les classes écrites en toutes lettres. Une table indexée par nom de variante n'émet rien si elle interpole.
- **Aucun commentaire HTML à la racine d'un gabarit** : il en ferait un fragment, et la racine perdrait `classes()`, `attributes()` et son `data-testid`. Payé quatre fois dans l'Epic 10.
- **`--breakpoint-lg: initial` est une GARDE**, pas une survivance : la retirer donnerait `lg` à 1024 px, donc **sur l'iPad**.
- **`npm run build`, pas `vue-tsc --noEmit`** : `--noEmit` laisse passer des pertes de narrowing que `vue-tsc -b` refuse.
- **`src/stores/` est intouchable sur toute l'epic.** Aucune décision de rendu ne peut l'exiger.
- **iPad Air 11″ = 1180×733**, pas 1194×834 (ce sont les points de l'iPad **Pro**, qui n'est pas la cible — corrigé le 2026-09-18).

### Tests

**Attendus modifiés** — tous existants, aucun fichier de test nouveau n'est prévu :

- `CtaButton.test.ts` et `CtaButton.contrast.test.ts` — suivent les formats de CTA (AC4, AC6). Le contraste se **vérifie par mutation** : casser une valeur doit rougir.
- `CenterPanel.test.ts`, `ShotClock.test.ts`, `PlayerPanel.test.ts` — suivent la géométrie découplée (AC2). ⚠️ Ils verrouillent le **texte** des classes, jamais leur effet : happy-dom ne calcule aucun CSS. **Un test vert ne prouve pas que le chrono est d'aplomb** — seule la passe navigateur le prouve.
- `tokens.test.ts` / `typography.test.ts` — n'ont **rien à mettre à jour à la main** : ils lisent le frontmatter de `DESIGN.md` depuis la 11.4. S'ils rougissent, c'est que `DESIGN.md` et `main.css` ont divergé, et c'est exactement leur travail.
- `ActionBar.test.ts`, `GameView.test.ts` — si la découpe touche la barre basse ou la grille des colonnes.
- `main.css.test.ts` — si la garde `prefers-reduced-motion` doit citer une animation nouvelle (`CLAUDE.md` §11 : une animation d'**ornement** s'y ajoute à la main, une animation **porteuse d'information** ne s'y ajoute pas, et la décision se documente dans le commentaire de la garde).

**Vérifications qui ne sont pas des tests unitaires, et qui sont obligatoires :**

1. **Passe navigateur, trois formats, paysage seulement**, chrono en 3 Bandes (AC2, AC6).
2. **36 captures d'après**, comparées à celles de Task 1 : tout écart doit être **une décision** (AC7).
3. **`design:check` + `design:check:file`** sur serveur neuf, lus par leur code de sortie (AC7).

### Ce que cette story NE fait pas

- **Aucune reprise de `src/stores/`**, ni des règles de jeu, ni de la persistance.
- **Aucun nouvel écran, aucune nouvelle route.** L'écran d'identification joueur est l'Epic 4 ; cette story lui prépare le terrain, elle ne le dessine pas.
- **Aucune navigation clavier, aucun piège à focus, aucun `Escape`, aucun `tabindex`** : arbitrage « borne de club sans clavier », inchangé. L'anneau de focus à 1,82:1 sur bleu roi reste un report ouvert (il n'apparaît jamais en usage).
- **Aucune nouvelle dépendance** : Playwright reste emprunté, hors `package.json`.
- **Aucun portrait, aucune variante téléphone** : hors périmètre produit depuis le 2026-09-11.
- **Aucun changement de nomenclature des scènes** : les douze identifiants sont le vocabulaire commun des scans, des captures et de `?scene=`.
- **Pas de CI** : les scripts se lancent à la main, en fin de story.

### Project Structure Notes

- Fichiers de rendu attendus : `DESIGN.md` (frontmatter + Shapes / Elevation / Components / Layout), `1score/src/assets/main.css`, `1score/src/components/CtaButton.vue`, `CenterPanel.vue`, `ShotClock.vue`, `PlayerPanel.vue`, `ActionBar.vue`, `1score/src/views/GameView.vue`, `.impeccable/design.json`.
- Surcharges de proposition : fichiers `.css` jetables, **hors dépôt** (le `.gitignore` de `.impeccable/` exclut déjà `*.png` et `live/*`) ; seul `scripts/freeze-animations.css` est versionné.
- Ordre imposé (`CLAUDE.md` §7) : `DESIGN.md` → `main.css` → gabarit. Jamais l'inverse, jamais une valeur arbitraire `[...]` dans un `.vue`.
- Nommage (`CLAUDE.md` §1) : composables `useXxx` en `src/composables/`, **named exports** uniquement ; tests co-localisés (AR16).
- Commande de validation de référence : `npm run build` (`vue-tsc -b && vite build`), depuis `1score/`.

### References

- [Source: _bmad-output/implementation-artifacts/deferred-work.md#dev-story 11.3] entrée « **Passe de rendu V1.2** » (2026-09-17) — périmètre, méthode, les deux points durs, séquencement ; entrée « **Découpe Billiboard** » — B1 / B2 et pourquoi les deux cassent le chrono ; [#dev-story 11.2] « cartes joueur arrondies et marge noire » (Nathan, photo Billiboard), verre des pop-ups qui tire vers l'olive, anneau de focus à 1,82:1 ; [#dev-story 11.4] détecteur aveugle au contraste des CTA, `useRejectFeedback` ×3, pièges du CLI d'ignores ; [#code review 11.4] `design:check` efface la sauvegarde, `?scene=` re-sème `HomeScreen`, contenu des scènes non confronté
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11] critère de sortie dans les mots de Nathan, méthode des quatre stories de code (`DESIGN.md` avant `main.css`, gabarit validé avant câblage, `detect` aux trois formats, `polish` en clôture, nature des références visuelles à citer) ; [#Story 11.2] les douze passes de rendu et le format d'arbitrage ; [#Story 11.4] « ⚠️ l'epic ne se clôt PAS sur cette story : la passe de rendu V1.2 suit »
- [Source: _bmad-output/implementation-artifacts/11-4-….md#Liste de contrôle du critère de sortie] les cinq points à dérouler vers l'Epic 4 ; [#Ré-audit chiffré] 19/20 et sa portée limitée ; [#Pièges] serveur de dev, code de sortie, `design.json`, `import.meta.env.DEV`
- [Source: _bmad-output/implementation-artifacts/11-3-….md#Dev Agent Record] protocole de comparaison déterministe (worktree + `freeze-animations.css`), 32/36 captures identiques, quatre leviers chiffrés des touches alpha
- [Source: DESIGN.md#Shapes] « conteneurs à angles vifs » — la règle dont la découpe serait l'exception ; [#Elevation & Depth] les six `--shadow-*`, la Règle du relief tapable, l'ombre de barre basse écartée ; [#Components › Buttons] les six variantes et leurs contrats ; [#Layout] la grille 2/5 · 1/5 · 2/5, le débordement du chrono, le rythme fluide ; [#Écarts assumés au détecteur] les huit ignores et la cécité aux libellés de CTA
- [Source: 1score/CLAUDE.md#7] `DESIGN.md` source, `main.css` applique, piège `--spacing` ; [#8] pas de breakpoint, container queries, garde `--breakpoint-lg` ; [#9] validation (build, passe outillée, passe navigateur paysage aux trois formats) ; [#10] `SideBar` contextuelle, patron des pop-ups, **géométrie couplée**, « un token décrit une intention, jamais une position » ; [#11] animations et `prefers-reduced-motion` ; [#12] pièges de gabarit
- [Source: 1score/src/components/CtaButton.vue:43-73] `DISABLED_CLASSES` et `VARIANT_CLASSES` — **le seul endroit** où un format de CTA se change
- [Source: 1score/src/components/CenterPanel.vue:105-133] la zone élargie du chrono et son calcul sur la content box ; [ShotClock.vue:41-49,144-170] `TURN_RING_CLIP_CLASSES`, `DISC_SIZE_CLASSES`, le demi-anneau et le bug de 11.1 ; [PlayerPanel.vue:70-78,332] `INNER_GUTTER_CLASSES` et le liseré `ring-8`
- [Source: 1score/src/views/GameView.vue:345-410] les trois colonnes et la barre basse ; [ActionBar.vue:120-137] la grille 2/5 · 1/5 · 2/5 de la barre
- [Source: 1score/src/assets/main.css:125-138,197-198,211-230,256,277-284] tokens de taille, rayons, dégradés, `--game-clock-bleed`, ombres
- [Source: 1score/scripts/render-static.cjs:1-30,113-243] usage du harnais, `--override`, `--focus`, le parcours des douze écrans ; [scripts/freeze-animations.css] le gel obligatoire ; [scripts/design-check.sh:1-40] les douze scènes et les codes de sortie
- [Source: PRODUCT.md#Operating Context] salle sombre, lecture à 2 m, 1920×1080 en référence, paysage seul, borne sans clavier

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2026-09-18 — Comparaison au rendu érigée en RÈGLE BLOQUANTE (Nathan, à la relecture de la fiche) :** « avant chaque implémentation je veux une comparaison visuelle comme ce qu'on a fait pour le travail des couleurs ». La méthode des passes de rendu n'était portée que par le texte des AC 3/4/5 ; elle devient un **préalable explicite** — au plus deux propositions côte à côte aux trois formats, produites sans toucher au code applicatif, arbitrage de Nathan obtenu **et noté** avant la première ligne. Une exception nommée, et elle est technique : la **Task 2 (découplage du chrono)** ne décide rien et passe donc à **rendu constant**, prouvé au pixel contre la ligne de base — tout écart y est une régression, pas une proposition.
- **2026-09-18 — Fiche créée (bmad-create-story).** Cinquième et dernière story de l'Epic 11, née de la décision de Nathan du 2026-09-17 (`deferred-work.md`, commit `e38e315`) : elle ne figurait pas au plan d'origine `11.0 → 11.4`. Story de **RENDU** — formats de CTA, reliefs et découpe du scoreboard rassemblés, parce que « ce sont des décisions de rendu, pas du refactor ». **Trois décisions de Nathan à la création** : (1) story numérotée **11.5**, avec sa section ajoutée à `epics.md` et sa clé à `sprint-status.yaml` ; (2) **aucune référence visuelle — intention seule**, pas même les `billiboard_scoreboard*` qui ont fondé le report : les propositions sortent de surcharges CSS aux trois formats et Nathan tranche au rendu ; (3) **tout en une story**, la découpe comprise, avec la **géométrie couplée du chrono traitée en premier** — c'est elle qui a fait écarter les deux propositions de la 11.3, et aucune gouttière n'est crédible avant qu'elle soit découplée. **Combinaison inédite annoncée** : un rayon sur un conteneur contredirait « conteneurs à angles vifs » (`DESIGN.md` › Shapes, décision de Nathan du 10.1) — si l'exception est prise, elle s'écrit datée dans `DESIGN.md` avant le code. **Deux arbitrages de la 11.2 explicitement rouverts** : l'ombre de barre basse (écartée : « pas hyper bien intégrée ») et le verre des pop-ups. Piège structurant de la story, inverse de celui de la 11.3 : des pixels **doivent** bouger, et le risque est qu'un écart **non décidé** se cache parmi les écarts voulus — d'où les 36 captures d'avant et leur comparaison de fin. Ligne de base : commit `123cf19`, **1107 tests / 32 fichiers**, build vert, 36 scans propres, ré-audit 19/20. ⚠️ **L'epic se clôt sur cette story** : c'est elle qui rejoue l'audit en dernier.
