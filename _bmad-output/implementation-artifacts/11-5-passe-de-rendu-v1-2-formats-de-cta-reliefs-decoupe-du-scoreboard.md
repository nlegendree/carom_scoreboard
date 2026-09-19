# Story 11.5: Passe de rendu V1.2 — formats de CTA, reliefs, découpe du scoreboard

Status: review

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

- [x] **Task 1 — Ligne de base pixel et outillée** (AC1)
  - [x] Arbre propre, code applicatif inchangé depuis `123cf19` ; `npm test` (**1107 / 32 fichiers**) et `npm run build` verts, notés dans Dev Agent Record
  - [x] **Redémarrer `npm run dev`** (serveur neuf — voir Pièges), puis 36 captures avec `--override scripts/freeze-animations.css`, archivées hors dépôt ; noter le dossier dans Dev Agent Record
  - [x] `npm run design:check` + `npm run design:check:file`, **codes de sortie** notés
- [x] **Task 2 — Découpler la géométrie du chrono** (AC2) — *la première, et rien ne commence avant qu'elle soit verte*
  - [x] Écrire dans Dev Agent Record **les trois lectures actuelles** de `--game-clock-bleed` et ce que chacune suppose (voir Dev Notes › La géométrie couplée, terme à terme)
  - [x] Introduire la gouttière comme **une seule valeur** (arbitrage d'AC3 pris ici, et écrit) ; recomposer la largeur/marge de `CenterPanel`, le `clip-path` de `ShotClock`, la gouttière intérieure de `PlayerPanel`
  - [x] **Vérifier au navigateur**, trois formats, mode 3 Bandes (`?scene=12-scoreboard-3bandes`) : disque non tronqué, demi-anneau raccordé au liseré, aucun croissant flottant. **Les tests unitaires ne voient rien de tout ça** (happy-dom ne calcule aucun CSS)
  - [x] Cas limite explicite : **hauteur gouvernante** à 1920×1080 — le disque est plus étroit que sa zone
  - [x] **Preuve à rendu constant** : rejouer les captures `07`, `09`, `12` aux trois formats et les comparer à celles de la Task 1 — **identiques au pixel**, sinon corriger avant d'aller plus loin
- [x] **Task 3 — Découpe du scoreboard : propositions, arbitrage, livraison** (AC3)
  - [x] 🔴 **Comparaison au rendu AVANT tout code** : au plus deux propositions par surcharges CSS, aux trois formats, **en 3 Bandes et en JDS** ; **arbitrage obtenu et noté** dans Dev Agent Record
  - [x] Décision appliquée : `DESIGN.md` › Shapes / Layout **d'abord** (avec l'exception de rayon sur conteneur, datée, si elle est prise), `main.css` et le markup ensuite
  - [x] Barre basse traitée dans le même mouvement (découpée ou non — décision écrite)
  - [x] Scènes `07`, `09`, `12` re-regardées : elles montrent encore ce que leur nom annonce
- [x] **Task 4 — Formats de CTA** (AC4)
  - [x] 🔴 **Comparaison au rendu AVANT tout code** : au plus deux propositions, côte à côte, aux trois formats, sur les écrans où chaque variante vit ; soumises à Nathan, **arbitrage obtenu et noté** dans Dev Agent Record
  - [x] `DESIGN.md` › Components › Buttons **d'abord**, puis `VARIANT_CLASSES` / `main.css` ; **zéro valeur visuelle** dans `CtaButton.vue`
  - [x] Les trois contraintes préservées : pas de largeur sur `accent` / `neutral`, un seul retour d'appui pour le neutre, `DISABLED_CLASSES` commun aux six
  - [x] `CtaButton.test.ts` et `CtaButton.contrast.test.ts` mis à jour et verts
- [x] **Task 5 — Reliefs** (AC5)
  - [x] 🔴 **Comparaison au rendu AVANT tout code** : au plus deux propositions par relief, côte à côte, aux trois formats ; **arbitrage obtenu et noté**, puis frontmatter `shadows` de `DESIGN.md` **d'abord**, `main.css` ensuite
  - [x] Les deux arbitrages rouverts sont **re-tranchés et datés** : ombre de barre basse, verre des pop-ups
  - [x] Si la Règle du relief tapable est mise en défaut, elle est **réécrite**, pas contournée
- [x] **Task 6 — Contraste et passe navigateur** (AC6)
  - [x] `CtaButton.contrast.test.ts` remis à jour à chaque dégradé / taille / graisse qui bouge ; **vérifié par mutation** (casser une valeur doit rougir)
  - [x] Toute valeur de contraste écrite dans `DESIGN.md` est **mesurée**, avec le point de mesure nommé
  - [x] Passe navigateur manuelle, trois formats, **paysage seulement**, les douze scènes parcourues
- [x] **Task 7 — Scans, tests, build** (AC7)
  - [x] Serveur de dev **neuf**, puis `design:check` + `design:check:file` ; **codes de sortie** lus, constats corrigés ou encodés avec raison mesurée
  - [x] Snippets de `.impeccable/design.json` alignés sur ce que le code rend maintenant
  - [x] `npm test`, `npm run build` verts ; `git diff --stat -- 1score/src/stores` **vide**
  - [x] 36 captures d'**après**, comparées à celles de Task 1 : **tout écart doit être une décision**, ou c'est un défaut
- [x] **Task 8 — `useRejectFeedback`** (AC8) — *conditionnelle, reportable*
  - [x] Seulement si les trois hôtes de saisie ont déjà été ouverts par une décision de rendu ; sinon, laisser le report intact et le dire
- [x] **Task 9 — Clôture de l'epic** (AC9)
  - [x] `/impeccable audit` rejoué, score **en regard du 14/20 et du 19/20** ; `DESIGN.md` relu (pas écrasé) ; `/impeccable polish` sur les fichiers touchés
  - [x] `deferred-work.md` : reports de la story, entrée « passe de rendu V1.2 » **close**
  - [x] Liste de contrôle du critère de sortie mise à jour pour l'Epic 4
  - [x] `epics.md` › Epic 11 annotée de la Story 11.5 ; `sprint-status.yaml` → `review`

### Review Findings

Revue de code du 2026-09-19 (bmad-code-review, 3 relecteurs sur `01402db..HEAD`, story EN COURS — Tasks 4 à 9 ouvertes : ce qui relève d'une task ouverte est écarté, pas relevé).

- [x] [Review][Patch] Gouttière intérieure morte des cartes — ✅ TRANCHÉ (Nathan, 2026-09-19) : retirer, ramener au retrait symétrique de la carte, rendu avant/après aux trois formats AVANT commit — — `INNER_GUTTER_CLASSES` (`pr-4`/`pl-4`, `PlayerPanel.vue:76-85`) réservait la place du débordement du chrono, abandonné par cette story ; le commentaire la justifie encore par `--game-clock-bleed`, token retiré, et `PlayerPanel.test.ts:196-215` la verrouille. Coût : 32 px (tablette) / 52 px (1920) morts côté centre, score et nom décentrés vers l'extérieur, nom tronqué plus tôt. Retirer (ou ramener au retrait `px-3` du pied) change le rendu → à trancher au rendu.
- [x] [Review][Patch] CTA inactif qui garde sa tranche de relief — ✅ TRANCHÉ (Nathan, 2026-09-19) : retirer la tranche à l'inactif (plat), rendu montré avant commit, écrit dans DESIGN.md — — `shadow-cta-relief-*` reste posé sous `disabled`/BIENTÔT, seule l'opacité tombe à 30 % : un bouton mort garde l'air d'un objet qu'on enfonce (Règle de l'inactif). Garder, ou retirer la tranche à l'état inactif (`CtaButton.vue`, `IconAction.vue`).
- [x] [Review][Patch] Le harnais de rendu attend `setup-header`, supprimé par `f1d4481` : timeout au paramétrage aux trois formats, plus aucune capture après `02-jds`, `design:check` cassé [1score/scripts/render-static.cjs:201,243]
- [x] [Review][Patch] `active:translate-y-[3px]` — valeur arbitraire dans deux gabarits (CLAUDE.md §7, AC4), couplée à l'épaisseur de tranche de `main.css` sans source commune : naître en token (`DESIGN.md` d'abord, `main.css` ensuite) lu par les ombres de relief ET l'enfoncement [1score/src/components/CtaButton.vue, 1score/src/components/IconAction.vue]
- [x] [Review][Patch] `GAME_POPUP_RESERVE` pas recalculé pour le grand bloc (`m-1` + filet + `p-1` + gouttière), à la différence de `SETUP_POPUP_RESERVE` ; commentaire « 40vw à fleur de bord » faux [1score/src/views/GameView.vue:105-115]
- [x] [Review][Patch] Lecteurs de `--game-column-gutter` faux partout : `CenterPanel` ne le lit plus, `ActionBar` le lit et n'est cité nulle part (CLAUDE.md §10, commentaire `GameView.vue:360-373`, `DESIGN.md` › Layout « trois lectures », `main.css`) [1score/CLAUDE.md:176]
- [x] [Review][Patch] `DESIGN.md` périmé ou contradictoire : paragraphes qui supposent encore le débordement (« déborder encore dans la carte », « Plafond mesuré de la gouttière », coût 21,5 → 8,5 px) ; « se resserrent d'une unité au lieu de trois » alors que `gap-3` est conservé ; « Deux rayons » pour quatre ; le récap dans la liste des angles vifs (et `GameView.vue` / `main.css` « QUE pour le scoreboard ») ; barre de rebours « 16 px (`h-2`) » → `h-1` ; barre basse « marine sombre, grille 2/5 · 1/5 · 2/5 » [DESIGN.md:428-532]
- [x] [Review][Patch] Fiche en retard sur le code : en-tête `Status: ready-for-dev` (sprint : `in-progress`) ; aucune trace des 8 commits du 2026-09-19 dans Dev Agent Record / Change Log (chrono 43/6/48cqmin, liseré arrondi, colonne `p-1`, paramétrage « M »/« T1 » et retrait du bandeau `setup-header`, récap « R1 », bille image de `PromptModal`, relief K1 + barre de rebours `h-1`, BIENTÔT grisé) ; arbitrage K1 non noté alors que la Task 4/5 l'exige ; passe 6 à cinq variantes (I, J, b, c, d) non signalée ; File List incomplète (≈15 fichiers) avec trois entrées périmées ; décompte « 16 écrans / quatre écrans de scoreboard » faux (3 scènes × 5 = 15) [_bmad-output/implementation-artifacts/11-5-…:3,273-391]
- [x] [Review][Patch] Renvois à `deferred-work.md` sans entrée : « une autre manière de relier le chrono aux cartes » (`main.css:256-265`, `DESIGN.md` › Layout) — créer l'entrée [_bmad-output/implementation-artifacts/deferred-work.md]
- [x] [Review][Patch] Rendu JDS de la découpe non attesté (AC3 « en 3 Bandes ET en JDS », Task 3 cochée) : une fois le harnais réparé, capturer la scène scoreboard JDS aux trois formats et le noter [_bmad-output/implementation-artifacts/11-5-…]
- [x] [Review][Patch] Gouttière du paramétrage et du récap en `gap-1` écrite en dur alors que le « même format » du scoreboard lit `--game-column-gutter` : lire le token (valeur identique, rendu inchangé) [1score/src/components/HomeScreen.vue:517, 1score/src/components/GameSummary.vue]
- [x] [Review][Patch] Groupes `flex-1` de la barre basse sans `min-w-0` : un contenu plus large que la carte (≈ 416 px demandés pour 431 à 1133) casse l'alignement au pixel en silence [1score/src/components/ActionBar.vue:121,136]
- [x] [Review][Patch] Tests qui ne tiennent pas ce qu'ils annoncent : `reproduces the column grid` ne vérifie pas le `p-1` du `<nav>` ; colonne des libellés du récap trouvée par position DOM (ajouter un `data-testid`) ; `column-gutter` exclu du miroir DESIGN.md ↔ main.css sans contrôle de remplacement ; commentaire « AC16 : l'anneau déborde » resté dans `CenterPanel.test.ts` [1score/src/components/ActionBar.test.ts, GameSummary.test.ts, 1score/src/assets/typography.test.ts:47-54]
- [x] [Review][Defer] `overflow-hidden` ajouté au récap pour arrondir le bandeau : rogne sans signal si la hauteur utile baisse (barre Safari) ou si la cellule `RÉSULTAT` se charge (badge record, Story 3.5) [1score/src/components/GameSummary.vue:110,186,198] — deferred, aucun cas réel aujourd'hui
- [x] [Review][Defer] Le `<h1>` du mode passe après la carte du joueur gauche dans l'ordre DOM : VoiceOver lit les champs avant le titre [1score/src/components/HomeScreen.vue:540] — deferred, lecteur d'écran hors usage en salle

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

- **⚠️ Le chemin Playwright par défaut du harnais NE RÉSOUT PAS sur cette machine.** `render-static.cjs:37-38` pointe vers `/Users/nathanlegendre/.nvm/…` ; le dossier personnel est `/Users/nathan`. **Le premier lancement échoue**, avec le message qui dit quoi faire (durci en 11.4). L'installation qui marche, vérifiée le 2026-09-18 :
  ```sh
  PLAYWRIGHT_MODULE=/Users/nathan/.npm/_npx/787f53666b8d4740/node_modules/playwright \
    node scripts/render-static.cjs <outDir> --override scripts/freeze-animations.css
  ```
  **Playwright 1.58.0 ↔ chromium-1208** (`~/Library/Caches/ms-playwright`) : exactement le couple documenté dans `deferred-work.md`. ⚠️ C'est un **cache `npx`**, donc purgeable sans préavis — si le chemin disparaît, relancer **sans** la variable pour obtenir le message d'aide, puis retrouver une installation par `find ~ -maxdepth 8 -type d -name playwright -not -path '*/carom_scoreboard/*'`. La version retrouvée doit correspondre au build de Chromium présent dans le cache.
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

Claude Opus 5 (`claude-opus-5`), workflow `bmad-dev-story`, 2026-09-18.

### Debug Log References

**Task 1 — ligne de base (2026-09-18).**
- Code applicatif **inchangé depuis `123cf19`** : `git diff --stat 123cf19..HEAD -- 1score DESIGN.md .impeccable` ne rend que `render-static.cjs`, et **en commentaires seuls** (le chemin Playwright documenté par `eee8029`).
- `npm test` : **1107 tests / 32 fichiers, verts** — exactement les attendus de l'AC1. `npm run build` : vert.
- Serveur de dev **redémarré** (`pkill -f vite` puis `npm run dev`) → `http://localhost:5173/`. ⚠️ Le harnais pointe par défaut sur **5174** (`render-static.cjs:79`) : le premier lancement a échoué sur `ERR_CONNECTION_REFUSED`. `--url http://localhost:5173/` le corrige — à ajouter aux Pièges.
- **36 captures** (12 écrans × 3 formats) avec `--override scripts/freeze-animations.css`, hors dépôt :
  `…/scratchpad/baseline-11.5/` (+ `audit.json`).
- `npm run design:check` → **code de sortie `0`** (propre). `npm run design:check:file` → **code de sortie `0`** (propre).

**Task 2 — les trois lectures de `--game-clock-bleed`, telles qu'elles étaient.**

| Lecture | Où | Ce qu'elle écrit | Ce qu'elle suppose |
|---|---|---|---|
| 1 | `CenterPanel.vue:127` | `w-[calc(100% + 2*(bleed + spacing*2))]` / `mx-[calc(-1*(bleed + spacing*2))]` | que `spacing*2` compense **exactement** le `p-2` de la colonne (calcul sur la content box), et qu'au-delà il reste `bleed` de débordement réel **dans la carte** — vrai **uniquement si les colonnes se touchent** |
| 2 | `ShotClock.vue:42-43` | `clip-path: inset(0 calc(100% - bleed) 0 0)` et son symétrique | que la première bande `bleed` de la **zone**, mesurée depuis son bord, est celle qui se pose sur la carte |
| 3 | `PlayerPanel.vue:76-78` | `pr-4` / `pl-4` (4 unités) | que 4 unités absorbent les 3 unités de débordement ; le **fond** reste pleine largeur, seul le contenu recule |

**Ce que le découplage a changé, et ce qu'il n'a délibérément pas changé.** Une seule des trois lectures était réellement couplée à l'écart entre colonnes :
- **`CenterPanel` : corrigé.** Un troisième terme, `--game-column-gutter`, entre dans la demi-largeur : la zone doit **traverser** la gouttière **avant** de déborder dans la carte. Sans lui, toute gouttière rognait le débordement d'autant — c'est l'unique raison pour laquelle la découpe avait été écartée en 11.3.
- **`ShotClock` : inchangé, et c'est un RÉSULTAT.** ⚠️ **La fiche de la story pariait l'inverse** (Dev Notes › La géométrie couplée : « ne s'écrit plus `inset(0 calc(100% - bleed) 0 0)` mais quelque chose comme `inset(0 calc(100% - g - bleed) 0 g)` »). La dérivation, faite en coordonnées de zone et vérifiée au navigateur, dit le contraire : la zone commence à `bleed` du bord de carte **quelle que soit** la gouttière, donc `[0, bleed]` est **sur la carte**, `[bleed, bleed + g]` **est** la gouttière, et le reste est la colonne. Décaler le clip de `g` aurait peint du rouge **en pleine colonne**, décroché du liseré. La formule de la fiche aurait introduit le bug qu'elle cherchait à éviter.
- **`PlayerPanel` : inchangé, et c'est une décision écrite.** Sa gouttière intérieure absorbe le débordement **dans la carte** (`bleed` seul) ; la part `g` tombe **hors** de la carte. Réserver `bleed + g` creuserait un blanc que rien n'occuperait. La contrainte reste `4 unités ≥ 3 unités`, indépendante de la découpe.

Les deux non-lectures sont **verrouillées par un cas de test chacune** (`ShotClock.test.ts`, `PlayerPanel.test.ts`) : sans elles, la prochaine découpe « réparerait » ce qui n'est pas cassé.

**Arbitrage pris (AC3) : token, pas constante d'écran.** `--game-column-gutter`, frontmatter `spacing` › `column-gutter` de `DESIGN.md`, puis `main.css` (`@theme static`). Raison : **trois lectures dans trois fichiers qui doivent coïncider au pixel** — l'argument même qui a fait de `--game-clock-bleed` un token (`CLAUDE.md` §10) — et une gouttière est un **rythme de mise en page**, pas une position d'écran (ce qui distinguait les quatre faux tokens d'inset rapatriés en 11.3). Conséquence de miroir : `typography.test.ts` réclamait un `--size-column-gutter` ; l'entrée rejoint `clock-bleed` dans `SPACING_EXCLUDED`, avec sa raison écrite.

**Preuve à rendu constant (AC2).** Serveur de dev redémarré, 36 captures rejouées, comparaison octet à octet :
- passe « après » vs ligne de base : **35 / 36 identiques**, une divergence — `05-popup-pave-numerique-1920x1080`.
- **Cette divergence n'est pas une régression** : une **troisième** passe, sur le **même** code, diverge de la deuxième sur ce **seul** fichier, et se retrouve **identique à la ligne de base sur les 36**. Mesure du diff : **1 pixel**, delta maximal **5/255**, en (326, 735).
- Conclusion : `freeze-animations.css` ne rend pas cet écran **strictement** déterministe à 1920 (la fiche l'annonçait pour la barre de rebours) ; le bruit résiduel est d'**un pixel**. Les 12 écrans du scoreboard (`07`, `09`, `12`) sont **identiques au pixel aux trois formats**. À noter dans les Pièges pour la comparaison finale de la Task 7 : un écart d'un pixel sur cet écran est du bruit, pas une décision.

**Vérification au navigateur (AC2), 3 Bandes, `?scene=12-scoreboard-3bandes`, trois formats.** Mesure des `getBoundingClientRect()` (jamais `scrollWidth`, aveugle sous `overflow-hidden`), gouttière injectée par surcharge, **sans toucher au code applicatif** :

| Gouttière | 1920×1080 — zone dans carte / **disque dans carte** | 1180×733 | 1133×744 |
|---|---|---|---|
| 0 px (livré) | 39 / **21,5** | 24 / **24** | 24 / **24** |
| 8 px | 39 / **13,5** | 24 / **24** | 24 / **24** |
| 13 px (1 unité à 1920) | 39 / **8,5** | 24 / **24** | 24 / **24** |
| 16 px | 39 / **5,5** | 24 / **24** | 24 / **24** |
| 21 px | 39 / **0,5** | 24 / **24** | 24 / **24** |
| 26 px | 39 / **−4,5 (DÉCOLLÉ)** | 24 / **21,6** | 24 / **24** |

- **Le découplage est prouvé** : la **zone** déborde de `bleed` exactement (39 à 1920, 24 sur tablette) **pour toute gouttière** — elle la traverse. C'est ce qui rend la découpe proposable.
- **Cas limite de la hauteur gouvernante, confirmé au chiffre près** : à 1920 le disque fait **427 px pour 462 de zone**, il ne mord la carte que de **21,5 px**, et **une gouttière les consomme un pour un**. Aux deux formats tablette, c'est la **largeur** qui gouverne : le disque grandit **avec** la zone et garde ses 24 px, jusqu'à ce que la hauteur reprenne la main (~24 px de gouttière à 1180).
- **⚠️ PLAFOND MESURÉ, à porter à l'arbitrage de la Task 3 : au-delà de ~21 px à 1920, le disque se décolle des cartes** — le débordement du chrono n'existe plus. En unités de grille fluide : **1 unité passe** (13 px à 1920, 8,5 px de morsure restante), **2 unités ne passent pas** (26 px, décollé). La proposition **B1 de la 11.3 (« gouttière d'une unité partout »)** tombe donc **juste sous** le plafond — elle était géométriquement possible, c'est le couplage, non la valeur, qui la faisait échouer.
- **Aucun ancêtre rogneur** : la sonde remonte du chrono à `<body>` en lisant `overflow-x/y` calculé — aucun `overflow-hidden` sur la colonne centrale ni sur ses ancêtres, à toutes les gouttières mesurées.
- Raccord du demi-anneau vérifié **à l'œil** sur gros plans aux trois formats (g = 0 et g = 13 px) : le liseré `ring-8` contourne le disque sans rupture, la bande rouge se pose **sur la carte**, aucun croissant ne flotte, aucun pixel rouge dans la gouttière.

**Task 3 — la découpe, en sept passes de rendu.** Toutes produites **par surcharges CSS**, aucun fichier applicatif touché avant l'arbitrage. Ce que Nathan a écarté, et **pourquoi** — c'est le chemin qui fait la décision, pas seulement le point d'arrivée :

| Passe | Proposition | Verdict de Nathan |
|---|---|---|
| 1 | **A** cartes détachées (marge + rayon) · **B** bloc soudé détaché | écartées : « les éléments du bas doivent être compris dans une espèce de **barre** un peu arrondie, l'élément central aussi et globalement toute la partie du haut aussi. Un peu comme `billiboard_scoreboard` » |
| 2 | **C** quatre blocs (carte / centre / carte + barre) · **D** deux grandes formes | « c'est ça, par contre les blocs michel, rep et j-pierre doivent aussi être dans un **grand bloc en commun** » |
| 3 | **E** centre en creux · **F** centre en relief, dans un grand bloc | « j'aime beaucoup celui-là… réduire les marges pour que les **boutons aient les mêmes marges que les blocs du dessus** et qu'ils prennent tout l'espace sous les cards » |
| 4 | **E2 / F2**, barre alignée sur la grille des colonnes | **E retenu** — centre en creux |
| 5 | **G / H**, réparation du chrono décollé à 1920 | « le but c'est que le chrono soit **le plus visible possible**… réduire un peu la largeur de la ligne verte mais garder la même marge… refaire propre la **bordure** et le **liseré rouge en contour** » |
| 6 | **I** chrono dans son bloc · **J** chrono débordant · puis **b** cadre fermé, **c** anneau complet, **d** rouge contournant | « il faut que le rouge **et le bord du cadre** contournent l'anneau, là c'est cut un peu » |
| 7 | **K** anneaux concentriques · **L** colonne bombée (croquis de Nathan) | ⚠️ **K rejeté sèchement** : « c'est n'importe quoi ce contour, la ligne grise fait tout le tour, pourquoi ? » — j'avais dessiné des anneaux **concentriques au disque** au lieu de suivre le **contour de la colonne**. Puis, sur L : **abandon** — « on va abandonner l'effet de débordement, ça me paraît trop complexe à faire… contente-toi de mettre le chrono le plus gros possible dans le container, tu peux retirer la padding autour de l'anneau » |

⚠️ **Écart à la règle bloquante « au plus deux propositions », consigné à la revue du 2026-09-19** : la passe 6 en a montré **cinq** — `I` et `J` d'abord, puis `b`, `c`, `d`, trois variantes de `J` produites dans la même passe en réponse à la remarque de Nathan sur le raccord. L'écart n'a pas été signalé sur le moment.

**Ce qui est livré (arbitrage de Nathan, 2026-09-18).**
- **Deux niveaux de forme.** Un **grand bloc** (`rounded-zone`, 16 px, surface voilée, filet) contient les trois colonnes ; dedans, **trois blocs** (`rounded-block`, 12 px) séparés d'**une unité** de gouttière. La **barre basse** est la sœur du grand bloc : même rayon, même voile, même filet. Tout est décollé des bords de l'écran d'une unité.
- **Le centre en creux** : le grand bloc est voilé, la colonne centrale garde la base marine sombre **nue** (`bg-bg` explicite — sans lui elle hériterait du voile et le creux disparaîtrait). La proposition inverse a été rendue côte à côte et écartée.
- **La barre basse ne porte plus sa propre grille**, elle reprend celle des colonnes : groupes latéraux en `flex-1` comme les cartes, espaceur central à `w-1/5` comme la colonne centrale, même gouttière, même retrait, pictos étirés. **Mesuré : 0,0 px d'écart** à 1920, 1180 et 1133, à gauche comme à droite. Trois largeurs recopiées (`w-2/5` + `px-2`) ne pouvaient **pas** coïncider avec des colonnes que la gouttière rétrécit.
- **L'exception à « conteneurs à angles vifs »** est écrite, datée et **bornée au scoreboard** dans `DESIGN.md` › Shapes, **avant** la première ligne de code. Tuiles, barre latérale, récap et bandeaux restent à angles vifs.
- **⚠️ Le débordement du chrono est ABANDONNÉ** — décision qui **renverse l'AC16 de la Story 10.4**. Conséquences appliquées : `--game-clock-bleed` retiré de `DESIGN.md` et de `main.css`, demi-anneau de `ShotClock` supprimé, prop `turnRingSide` supprimée, prop `turnSide` de `CenterPanel` et son `computed` dans `GameView` supprimés (la colonne redevient entièrement générique), et le `ring-8` de la carte active **redevient un contour continu, sans raccord à faire**.
- **Le chrono remplit son bloc** : la zone annule le retrait de la colonne (`w-[calc(100% + 4 unités)] -mx-2`). **Mesuré : le disque fait exactement la largeur de la colonne aux trois formats** — 373 px à 1920, 229 à 1180, 220 à 1133. C'est le maximum possible dans le conteneur.

**⚠️ Ce que j'ai failli ajouter pour rien, et que la mesure a écarté.** J'avais resserré la colonne centrale (`gap-3` → `gap-1`) pour rendre de la hauteur au disque. Sans débordement, c'est la **largeur** qui gouverne aux trois formats : `gap-1` et `gap-3` donnent **exactement la même taille** (vérifié au navigateur). Le resserrement était donc un changement de rendu **non demandé et sans effet** — il est annulé, et la raison est écrite dans le gabarit pour que personne ne le refasse.

**⚠️ Le piège de `CLAUDE.md` §12, payé une cinquième fois.** J'ai posé un commentaire HTML **à la racine** du gabarit d'`ActionBar` : le composant est devenu un fragment et la racine a perdu son `data-testid`. Un seul cas est tombé (`keeps the action-bar testid the view and its tests rely on`) — celui qui existe précisément pour ça. Commentaire rentré **dans** le `<nav>`.

**Task 3 — vérifications.**
- `npm test` : **1115 tests / 32 fichiers, verts** (1107 à la ligne de base ; +8 nets, le solde de cas ajoutés et de cas retirés avec le demi-anneau). `npm run build` vert. `git diff --stat -- 1score/src/stores` **vide**.
- `npm run design:check` → **code de sortie `0`**, `npm run design:check:file` → **`0`**, sur serveur de dev neuf.
- **36 captures d'après comparées à la ligne de base : 15 ont bougé**, et chacune est une décision — les trois scènes de scoreboard (`07`, `09`, `12`) et les **deux pop-ups qui se posent dessus** (`08`, `10`, dont le fond est le scoreboard), aux trois formats. La 16e, `05-popup-pave-numerique-1920x1080`, est le **bruit d'un pixel** déjà caractérisé à la Task 2 (delta 5/255 en (326, 735), identique d'une passe à l'autre sur le même code).

**Reports ouverts par la Task 3** (à porter dans `deferred-work.md`) :
- **Relier le chrono aux cartes autrement.** Le débordement est abandonné, pas remplacé : « je vais réfléchir à une autre manière de faire ». Sept passes de rendu et leurs mesures sont consignées ci-dessus pour ne pas les refaire à l'aveugle.
- **La gouttière intérieure des cartes** (`INNER_GUTTER_CLASSES`, `pr-4` / `pl-4`) n'avait qu'une raison : absorber le débordement. Cette raison a disparu. Elle est **conservée en l'état** — la retirer déplacerait le score sur les deux cartes, ce qui est une décision de rendu que Nathan n'a pas prise. ➡️ **Tranché à la revue de code du 2026-09-19** (Nathan) : retirée, rendu avant/après aux trois formats.

### Completion Notes List

- **Task 1 — ligne de base.** 1107 tests / 32 fichiers, build vert, 36 captures de référence, `design:check` et `design:check:file` à **0**. Ligne de base intacte : la story part d'un arbre où le code applicatif n'a pas bougé depuis `123cf19`.
- **Task 2 — géométrie du chrono découplée (AC2).** Gouttière introduite comme **une seule valeur** (`--game-column-gutter`, token de frontmatter), lue par `GameView` (l'écart réel) et `CenterPanel` (la zone qui la traverse) ; `ShotClock` et `PlayerPanel` ne la lisent **pas**, par décision dérivée, vérifiée et verrouillée par un test chacun. **Rendu constant prouvé** : 36 captures identiques au pixel à la ligne de base (au bruit d'un pixel près sur un écran non déterministe, caractérisé). Plafond de gouttière **mesuré** aux trois formats — c'est l'entrée chiffrée de l'arbitrage de la Task 3.
- **Task 3 — découpe arbitrée et livrée (AC3).** Sept passes de comparaison au rendu, toutes par surcharges CSS ; le tableau du Debug Log garde ce que chacune a écarté et pourquoi. Livré : deux niveaux de forme (grand bloc 16 px / trois blocs 12 px), centre en creux, barre basse alignée sur la grille des colonnes à **0,0 px**, exception à `Shapes` datée et bornée au scoreboard. **Le débordement du chrono est abandonné** (renverse l'AC16 de la 10.4) : token, demi-anneau et deux props morts retirés, le liseré de la carte active redevient un contour continu, et le disque remplit exactement la colonne aux trois formats.

- **Passes de rendu du 2026-09-19, hors Tasks 1 à 3** (consignées à la revue de code du jour : la fiche n'avait été mise à jour qu'au premier commit de la story). Chaque ligne est un commit, chaque décision est de Nathan au rendu :
  - `79f0710` — anneau du chrono agrandi dans son bloc (rayon 36 → 43, trait 7 → 6, chiffre 40 → 48 cqmin) : « agrandis-le un peu dans le cadre » ; frontmatter `clock` d'abord.
  - `d4d3837` — le liseré de tour prend le rayon de la carte (`rounded-block`) : son bord intérieur restait à angle vif.
  - `6e9bd3d` — colonne centrale `p-2` → `p-1` : « le même padding que là », celui de `+1 ADVERSAIRE` dans sa barre ; la zone du chrono suit (`-mx-2` → `-mx-1`).
  - `f1d4481` — paramétrage au format du scoreboard, propositions « M » puis « T1 » : grand bloc, centre en creux, **bandeau `setup-header` retiré** (il doublait le filet du grand bloc ; renverse la revue du 2026-09-12), mode en tête de la colonne centrale, bandeau de carte resserré ; `SETUP_POPUP_RESERVE` recalculée ; exception de Shapes étendue.
  - `43145c4` — récap au format du scoreboard, proposition « R1 » : grand bloc, trois blocs-colonnes, libellés en creux à 75 % (4,92 → 9,23:1).
  - `3458484` — la pastille de `PromptModal` (« JOUEUR N A FINI ») affiche l'image de la bille (`BALL_PICTOS`) au lieu d'un aplat ; `BALL_CLASSES` retirée, sans autre consommateur.
  - `87c6776` — **relief des CTA, proposition « K1 »** : tranche teintée sous les six variantes et les pictos, enfoncement à l'appui ; barre de rebours de `VALIDER` `h-2` → `h-1` (« un peu plus discrète »). ⚠️ C'est du travail des **Tasks 4 et 5**, livré avant qu'elles soient ouvertes : l'arbitrage (« K1 ») est noté ici, mais **les propositions concurrentes de K1 n'ont pas été consignées** au moment du rendu. Les deux arbitrages rouverts de la 11.2 (ombre de barre basse, verre des pop-ups) restent à re-trancher en Task 5.
  - `607ba5a` — tuiles `BIENTÔT` grisées (fond désaturé, titre à 50 %) : « griser les éléments ».
- **Jaune joueur, 2026-09-19** (Nathan, au rendu, « un jaune plus moderne », puis « plus peps ») : `#FFE000` → **`#FFF200`** (bandeau `#E6CA00` → `#E6DA00`, le jaune à 90 %), bleu toujours à zéro, teinte 52,7° → 57°. Quatre passes par surcharges CSS aux formats 1180 et 1920, sur le paramétrage et les deux scoreboards : chaud `#FFCF33` / beurre `#FFE566` (écartés : pas assez peps), citron `#FFEB00` / fluo `#F5FF00`, déclinaisons du citron (`#FFF200` retenu ; bandeau marqué `#D6C500` et version adoucie `#FFEE33` écartés), puis quatre versions plus claires (`#FFF533` à `#FFF880`, écartées : « on reste sur A1 pour l'instant »). ⚠️ Écart assumé à « au plus deux propositions » : Nathan a demandé les déclinaisons. Encre noire 17,95:1 sur la carte, 14,39:1 sur le bandeau ; placeholder de champ 4,96 → 5,18:1. `DESIGN.md` d'abord, `main.css` ensuite. `.impeccable/design.json` garde les `oklch` de l'ancien jaune : à régénérer en Task 7.
- **Task 4 — formats de CTA (AC4), 2026-09-19.** Constat de départ, au rendu : aucune règle commune — `accent` et `neutral` non interlettrés alors que le rôle `label` le prévoit (`VALIDER` plus serré que `+ POINTS ADVERSAIRE`), et deux colonnes de même largeur qui plaçaient leur picto différemment (`CHANGER DE BILLE` en ligne sur deux lignes, `PASSER LE TOUR` au-dessus). **Deux propositions** par surcharges CSS, aux trois formats, sur les scènes où vivent les six variantes (06, 04/05/08/10, 07/09/12) : « A » — la largeur décide du format (large : `label` 900 interlettré ; étroit : picto au-dessus, `stat` 900 sur une ligne) — et « B » — A plus les réglages en tonal (fond bleu translucide, filet, sans relief), `DÉMARRER` seul CTA plein du paramétrage. **Nathan retient A.** Au rendu de contrôle, les réglages de la proposition étaient interlettrés (la surcharge les attrapait par `text-label`) : le code s'y aligne, puis Nathan étend l'interlettrage à `PASSER LE TOUR` (« interlettre ») — **les six sont interlettrés `label`, sans exception**. Contraste des réglages en `stat` (4,5:1 exigé, le stop clair donne 3,68:1) tenu par la POSITION du libellé, comme `pass` : mesuré au pixel, `#2963e4` sous le libellé à 72,2 % de la hauteur, **5,25:1** au pire des trois formats — exception mesurée ajoutée à `CtaButton.contrast.test.ts`. `PASSER LE TOUR` remesuré interlettré par la même méthode : 5,25:1 au pire (la valeur inscrite, 5,18:1 du 2026-09-17, reste la plus prudente). Contrôle : rendu du code identique à la proposition au bruit d'anticrénelage près. Les trois contraintes de l'AC4 tiennent (aucune largeur sur `accent`/`neutral`, un seul retour d'appui du neutre, `DISABLED_CLASSES` commun) ; aucune valeur nouvelle dans `CtaButton.vue`. 1137 tests (+6), build vert, `design:check` et `design:check:file` à 0.
- **Task 5 — reliefs (AC5), 2026-09-19.** Le relief des CTA (« K1 », `87c6776`) était déjà livré ; restaient les **deux arbitrages rouverts de la 11.2**. Deux propositions chacun, par surcharges CSS aux trois formats (scènes 07/09/12 pour la barre, 04/05/08/10 pour les pop-ups) :
  - **Ombre de barre basse** — « O1 » la même ombre douce sur les deux zones sœurs, « O2 » la barre seule, projetée vers le haut. Constat mesuré et dit à Nathan avant son choix : sur la base marine et à une unité d'écart, une ombre diffuse se lit à peine (zoom 1920 : les trois versions presque identiques). **Nathan retient O2** — nouveau token `bottom-bar` (`0 -6px 24px rgba(0,0,0,0.45)`), frontmatter `shadows` d'abord, `main.css` ensuite, consommé par `ActionBar`.
  - **Verre des pop-ups** — le verre léger (88 %, flou 8 px) laissait transparaître une teinte olive et le fantôme du score géant sous le pavé. « V1 » opaque, « V2 » verre dense 95 % + flou 16 px. **Nathan retient V2** — `bg-bg-raised/95 backdrop-blur-lg` dans `PopupCard` (utilitaires standard, aucun token nouveau). L'ignore `low-contrast` de la scène 10 (faux positif à travers `backdrop-filter`) reste valable : le flou demeure.
  - **Règle du relief tapable réécrite**, datée : elle faisait du « rayon de 8 px » la marque de ce qui se tape (les conteneurs sont désormais arrondis en `zone`/`block` sans avoir de corps) et comptait deux ombres portées (trois désormais : pop-up, barre latérale, barre basse).
  Contrôle : rendu du code identique à la proposition au bruit connu près. 1139 tests (+2), build vert, `design:check` et `design:check:file` à 0.
- **Task 6 — contraste et passe navigateur (AC6), 2026-09-19.**
  - **`CtaButton.contrast.test.ts` vérifié par MUTATION**, deux sens : (1) stop sombre de `--gradient-blue` éclairci (`#1D4ED8` → `#2D5EE8`) → rouge (« ne fait confiance à une mesure que si la surface mesurée n'a pas bougé » — les exceptions `setup` et `pass` exigent une remesure) ; (2) `setup` remonté en `label` → rouge (« ne garde aucune exception mesurée devenue inutile »). Les deux restaurés, suite verte.
  - **Toute valeur de contraste touchée par la story porte son point de mesure** dans `DESIGN.md` : jaune franc 17,95:1 et jaune bandeau 14,39:1 (calculés sur l'aplat plein) ; libellés du récap 9,23:1 (calculé : blanc 75 % composé sur la base nue `#1E2438`, seul fond sous le texte — la valeur était écrite sans point) ; verre des pop-ups (V2) : 13,35:1 sur l'aplat plein, **11,47:1 au pire** à travers le verre (95 % de `#272E49` sur un aplat blanc pur dessous ; le verre léger à 88 % descendait à 9,16:1) ; réglages 5,25:1 et `PASSER LE TOUR` mesurés au pixel (Task 4). Les valeurs antérieures à la story (stops de dégradé, anneau de focus, ruban) sont des calculs sur hexadécimaux déjà nommés : non retouchées.
  - **Passe navigateur, paysage seul, les douze scènes aux trois formats** (1133×744, 1180×733, 1920×1080 — Chromium headless par le harnais, Chrome ne pouvant ouvrir 1920 sur l'écran de 1440×900). Contrôle outillé par rectangles (`getBoundingClientRect`, jamais `scrollWidth` — `CLAUDE.md` §12) : texte hors écran, texte rogné par un ancêtre qui coupe, texte hors de son bouton, texte tronqué, cible de moins de 44 px → **0 constat sur 36 écrans**. ⚠️ Le contrôle est lui-même vérifié par mutation : une première version ne voyait PAS un libellé débordant d'un bouton qui ne rogne rien (60 px dans 229) ; la règle « hors de son bouton » a été ajoutée et le détecte, et une hauteur de `PASSER LE TOUR` forcée à 30 px sort en « cible basse ». Puis relecture des planches aux trois formats : rien d'anormal.
- **Task 7 — scans, tests, build (AC7), 2026-09-19.**
  - **`.impeccable/design.json` réaligné** (sidecar de `DESIGN.md`) : jaunes en OKLCH (`#FFF200` → `oklch(94.1% 0.200 105.7)`, `#E6DA00` → `oklch(87.0% 0.185 105.6)` — la conversion retrouve au dixième les valeurs de l'ancien jaune, elle est donc fiable) ; ombres en miroir du frontmatter (`light-edge-start` retirée, quatre `cta-relief-*` et `bottom-bar` ajoutées : 6 → 10) ; snippets des six CTA et du picto d'action (tranche, enfoncement de `--size-relief-depth`, inactif plat, interlettrage `label`, réglage au format de `PASSER LE TOUR`) et de la carte de pop-up (verre dense 95 % / 16 px, CTA en relief) ; règles nommées, do et don't recopiés de `DESIGN.md` (trois règles et un do avaient divergé). Deux « Do » de `DESIGN.md` périmés corrigés au passage (« quatre gabarits de CTA » → six variantes ; « angles vifs sur les conteneurs » → sauf la mise en page carte · colonne · carte).
  - **36 captures d'après comparées à la ligne de base de la Task 1.** ⚠️ Le dossier archivé à la Task 1 (`…/scratchpad/baseline-11.5/`) a disparu avec le scratchpad de sa session ; la ligne de base est **reconstituée à l'identique** en rendant `123cf19` (code applicatif inchangé depuis, attesté à la Task 1) dans un worktree, même harnais, même gel des animations, même binaire. Résultat : **JDS (02) identique** aux trois formats ; **accueil (01)** : seul le quart bas-droit bouge, les tuiles `BIENTÔT` grisées (`607ba5a`) ; **paramétrage (03–06), scoreboard (07–10, 12), récap (11)** : tous changés, et chacun par des décisions de la story (format du scoreboard « M »/« T1 »/« R1 », découpe et chrono, jaune `#FFF200`, formats de CTA « A », relief « K1 », ombre de barre « O2 », verre « V2 »). Aucun écran qu'aucune décision ne touchait n'a bougé ; le contenu des écrans changés a été relu à la Task 6 (planches aux trois formats, contrôle par rectangles à 0).
  - Serveur de dev **neuf** : `design:check` → **0**, `design:check:file` → **0**. `npm test` : **1139 tests / 32 fichiers**, verts. `npm run build` : vert. `git diff --stat 123cf19..HEAD -- 1score/src/stores` : **vide**.
- **Task 8 — `useRejectFeedback` (AC8) : REPORTÉE, comme la condition le prévoit.** Aucune décision de rendu de la story n'a rouvert les trois hôtes de saisie (`NumericPadDock`, `AlphaKeyboardSheet`, `ScoreEntryDock`) : ils n'ont reçu que des changements communs (verre de `PopupCard`, formats de CTA). L'entrée de `deferred-work.md` reste ouverte, annotée.
- **Task 9 — clôture de l'epic (AC9), 2026-09-19.**

  **Ré-audit `/impeccable audit` — 19/20, contre 14/20 (ligne de base) et 19/20 (11.4).**

  | # | Dimension | 09-15 | 11.4 | 11.5 | Ce qui a bougé, et pourquoi |
  |---|---|---|---|---|---|
  | 1 | Accessibilité | 3 | 3 | **3** | Tous les contrastes touchés **mesurés et nommés** (réglages 5,25:1 en `stat` tenus par la position, verre 11,47:1 au pire, jaunes ≥ 14:1) et le test de contraste **vérifié par mutation** ; `role="dialog"`/`aria-modal`/nom accessible intacts sur les quatre pop-ups. Plafond inchangé : **aucun CTA activable au clavier** (`@pointerdown` seul, WCAG 2.1.1 — arbitrage « borne sans clavier »). Un P3 nouveau : l'ordre DOM du paramétrage (titre après la carte gauche), reporté à la revue. |
  | 2 | Performance | 4 | 4 | **4** | JS **identique** à la ligne de base (155,06 → 155,14 kB, gzip 54,84 → 54,74) ; CSS **+2 kB** (34,85 → 36,88, gzip +0,21 kB) — les reliefs, rayons et formats. Deux filtres ajoutés, tous deux bornés : flou 16 px sur la seule carte de pop-up **ouverte** (8 px avant), `grayscale` statique sur deux tuiles `BIENTÔT`. Aucune animation de propriété de mise en page, aucun `will-change`. P2 hérité : WebKit n'a jamais rendu l'UI (PRODUCT.md) — le flou 16 px est le premier coût à y mesurer. |
  | 3 | Responsive (trois formats paysage) | 2 | 4 | **4** | **0 constat sur 36 écrans** au contrôle par rectangles (hors écran, rogné, hors de son bouton, tronqué, cible < 44 px), contrôle lui-même vérifié par mutation ; libellés des CTA étroits sur une ligne jusqu'à 1133 ; gouttière intérieure morte des cartes retirée. |
  | 4 | Theming | 2 | 4 | **4** | Chaque valeur nouvelle **née dans `DESIGN.md`** puis `main.css` : `relief-depth` (qui remplace le `translate-y-[3px]` recopié), quatre `cta-relief-*`, `bottom-bar`, `column-gutter`, rayons `zone`/`block`. Garde-fous étendus : `translate-[xy]-[…]` interdit, valeur de `column-gutter` en miroir, tous deux vérifiés par mutation ; `design.json` réaligné (ombres 6 → 10, jaunes en OKLCH, snippets). |
  | 5 | Intégrité d'implémentation | 3 | 4 | **4** | Détecteur à **0** (`design:check`, `design:check:file`) ; une règle de format explicite (« la largeur décide du format ») au lieu de six variantes sans loi commune ; `DESIGN.md` relu contre le code — ses paragraphes caducs (débordement du chrono, « deux rayons », récap à angles vifs, barre basse) réécrits et datés, **aucune régénération**. Seul point ouvert : le mécanisme de rejet recopié ×3 (Task 8). |
  | | **Total** | **14/20** | **19/20** | **19/20** | **Excellent** — le score tient **alors que** la story a changé le rendu de dix écrans sur douze. |

  **Verdict d'intégrité : PASS.** La passe de rendu n'a pas dégradé le système qu'elle dessinait : chaque décision de Nathan est entrée par `DESIGN.md`, chaque valeur par un token, et chaque garde-fou ajouté a été vérifié par mutation avant d'être cru.

  **Constats restants (aucun P0/P1)** : P2 — vérification WebKit/iPad réel jamais faite (le flou 16 px et `-webkit-backdrop-filter` en tête) ; P2 — `useRejectFeedback` ×3 (Task 8) ; P3 — ordre DOM du titre au paramétrage ; P3 — `overflow-hidden` du récap qui rognerait sans signal (reportés à la revue).

  **`/impeccable polish` sur les fichiers touchés — passe d'inspection, 0 correctif.** Méthode : relecture des planches des douze scènes aux trois formats (Task 6) et du code touché, triage « défaut local / token manquant / pattern / concept ». Aucun défaut local restant après la revue de code ; aucun token manquant (le seul, `relief-depth`, est né à la revue). Deux observations **de rendu**, proposées et non appliquées (toute décision d'apparence passe par Nathan au rendu, règle bloquante de la story) : à 1920, les libellés `stat` des réglages paraissent petits dans des boutons qui ont grandi avec la grille ; l'accueil et la sélection JDS restent à angles vifs à côté de trois écrans en blocs arrondis — c'est la règle écrite (Shapes), pas une dérive, mais le contraste entre les deux familles d'écrans est désormais visible.

  **`DESIGN.md` relu, pas écrasé** : `/impeccable document` n'a pas été lancé en génération ; les corrections sont entrées une à une, datées (revue de code, Tasks 4 à 7).

  **Liste de contrôle du critère de sortie — ce que la 11.5 ajoute** aux points instruits par la 11.3 et la 11.4 (fiche 11.4 › Liste de contrôle), à dérouler à la création de la première story de l'Epic 4 :
  - **Le format d'un CTA se déduit de sa largeur** : large → `label` 900 interlettré ; colonne étroite → picto au-dessus, `stat` 900 sur une ligne. Un CTA de l'écran d'identification qui ne rentre dans aucun des deux est un **échec du critère**, pas une variante de plus.
  - **Un `VALIDER` grisé est plat** (`disabled:shadow-none`, commun aux six) : rien à créer.
  - **Choisir la famille de l'écran avant de le dessiner** : trois colonnes carte · colonne · carte → grand bloc `zone` + blocs `block` + gouttière `--game-column-gutter` ; sinon angles vifs. Une troisième famille serait un échec du critère.
  - **Une pop-up nouvelle hérite du verre dense** via `PopupCard` : aucune opacité ni flou à poser.
  - **Tout contraste écrit porte son point de mesure** ; un libellé en `stat` sur dégradé exige une exception mesurée dans `CtaButton.contrast.test.ts`, pas une estimation.
- **Revue de code du 2026-09-19** (`01402db..HEAD`, trois relecteurs) : voir Tasks › Review Findings. Deux décisions de Nathan — gouttière intérieure des cartes **retirée**, CTA et pictos inactifs **plats** (`disabled:shadow-none`) —, et le rendu JDS de la découpe attesté (scènes `07` et `09` aux trois formats, comparées à `HEAD`).

### File List

- `DESIGN.md` — frontmatter `spacing` › `column-gutter` ; Layout : les trois lectures, l'arbitrage token/constante, le plafond mesuré
- `1score/src/assets/main.css` — `--game-column-gutter` (`@theme static`) ; `--game-clock-bleed` retiré ; rayons `zone`/`block` ; `clock` ; `--shadow-cta-relief-*` (K1) ; `--size-relief-depth` (revue)
- `1score/src/views/GameView.vue` — `data-testid="game-columns"`, `gap-(--game-column-gutter)` sur la rangée des trois colonnes
- `1score/src/views/GameView.test.ts` — la gouttière vient du token partagé
- `1score/src/components/CenterPanel.vue` — la zone du chrono annule seulement le retrait de la colonne (`-mx-1`), sans lire la gouttière ; colonne `p-1`, centre en creux
- `1score/src/components/CenterPanel.test.ts` — attendu mis à jour
- `1score/src/components/PlayerPanel.vue` — rayon de bloc, liseré arrondi ; gouttière intérieure et prop `side` retirées (revue)
- `1score/src/components/PlayerPanel.test.ts` — rayon de bloc, liseré, retrait symétrique
- `1score/src/assets/typography.test.ts` — `column-gutter` rejoint `clock-bleed` dans `SPACING_EXCLUDED`
- `1score/src/components/ActionBar.vue` — ombre `shadow-bottom-bar` (Task 5) ; la barre reprend la grille des colonnes (groupes en `flex-1`, gouttière et retrait partagés, pictos étirés), rayon de zone, voile et filet
- `1score/src/components/ActionBar.test.ts` — deux cas : la grille reprise, les pictos étirés
- `1score/src/components/ShotClock.vue` — demi-anneau et prop `turnRingSide` retirés (débordement abandonné)
- `1score/src/components/ShotClock.test.ts` — les cinq cas du demi-anneau remplacés par trois garde-fous (rien de rouge, rien du tour, plus aucune lecture du token retiré)
- `1score/src/components/CtaButton.vue`, `CtaButton.test.ts` — relief K1, enfoncement par `--size-relief-depth`, inactif plat ; Task 4 : six variantes interlettrées, `setup` au format de `pass`
- `1score/src/components/CtaButton.contrast.test.ts` — exception mesurée de `setup` (Task 4)
- `1score/src/components/PopupCard.vue`, `PopupCard.test.ts` — verre dense 95 % / flou 16 px (Task 5)
- `1score/src/components/IconAction.vue`, `IconAction.test.ts` — même relief, même enfoncement, inactif plat
- `1score/src/components/ScoreEntryDock.vue`, `ScoreEntryDock.test.ts` — barre de rebours `h-1`
- `1score/src/components/ModeTile.vue`, `ModeTile.test.ts` — `BIENTÔT` grisé
- `1score/src/components/GameSummary.vue`, `GameSummary.test.ts` — format du scoreboard (« R1 »), gouttière par le token
- `1score/src/components/HomeScreen.vue`, `HomeScreen.test.ts` — pictos de réglage `size-4` (Task 4) ; format du scoreboard (« M »/« T1 »), `setup-header` retiré, `SETUP_POPUP_RESERVE`, gouttière par le token
- `1score/src/components/PlayerSetupCard.vue` — rayon de bloc, bandeau resserré
- `1score/src/components/PromptModal.vue`, `PromptModal.test.ts` — image de bille
- `1score/src/components/ballAssets.ts` — `BALL_CLASSES` retirée
- `1score/src/views/GameView.vue` — grand bloc ; `GAME_POPUP_RESERVE` recalculée (revue)
- `1score/src/assets/tokens.test.ts` — `shadow-none` admis, `translate-[xy]-[…]` interdit (revue)
- `1score/scripts/render-static.cjs` — attend `setup-mode-label` au lieu de `setup-header` (revue)
- `1score/CLAUDE.md` — §10 : `--game-clock-bleed` retiré, lecteurs de `--game-column-gutter`
- `.impeccable/design.json` — sidecar réaligné (Task 7)
- `.impeccable/baseline/2026-09-19-scan-src.json`, `2026-09-19-scan-url.json` — scans du 2026-09-19 (antérieurs à `87c6776` et `607ba5a` : à rejouer en Task 7)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — clé en `in-progress`, puis `review` (Task 9)
- `_bmad-output/implementation-artifacts/deferred-work.md` — reports de la revue, « relier le chrono aux cartes », entrée « passe de rendu V1.2 » CLOSE, `useRejectFeedback` annoté (Task 9)
- `_bmad-output/planning-artifacts/epics.md` — Story 11.5 annotée de sa livraison (Task 9)

## Change Log

- **2026-09-19 — Task 8 reportée, Task 9 : clôture de l'Epic 11. Story en `review`.** Ré-audit **19/20** (14/20 à la ligne de base, 19/20 en 11.4) — le score tient après la refonte de rendu de dix écrans sur douze ; polish en inspection, 0 correctif, deux observations de rendu proposées ; `deferred-work.md` (« passe de rendu V1.2 » close), `epics.md` et `sprint-status.yaml` à jour ; liste de contrôle du critère de sortie complétée pour l'Epic 4.

- **2026-09-19 — Task 7, clôture technique.** `design.json` réaligné sur `DESIGN.md` (jaunes, dix ombres, snippets des CTA et de la pop-up, règles) ; 36 captures comparées à la ligne de base reconstituée depuis `123cf19` — tout écart est une décision ; scans à 0, 1139 tests, build vert, stores intacts.

- **2026-09-19 — Task 6, contraste et passe navigateur.** Test de contraste vérifié par mutation dans les deux sens ; points de mesure écrits pour toute valeur touchée par la story (dont les libellés du récap et le verre des pop-ups, 11,47:1 au pire) ; passe des douze scènes aux trois formats, 0 constat, contrôle lui-même vérifié par mutation.

- **2026-09-19 — Task 5, reliefs : les deux arbitrages de la 11.2 re-tranchés** (Nathan, au rendu). Barre basse : ombre projetée vers le haut (« O2 », token `bottom-bar`). Pop-ups : verre dense 95 % / flou 16 px (« V2 »), la teinte olive et le fantôme du score disparaissent. Règle du relief tapable réécrite.

- **2026-09-19 — Task 4, formats de CTA : « la largeur décide du format »** (Nathan, au rendu, « A » contre « B » tonal). Large : `label` 900 ; étroit (réglages, `PASSER LE TOUR`) : picto au-dessus, `stat` 900 sur une ligne ; les six interlettrés `label`. Contraste des réglages mesuré à 5,25:1.

- **2026-09-19 — Jaune joueur `#FFE000` → `#FFF200`** (Nathan, au rendu : « plus peps »), bandeau `#E6DA00`. Quatre passes de comparaison, consignées au Dev Agent Record.

- **2026-09-19 — Revue de code (bmad-code-review, trois relecteurs sur `01402db..HEAD`).** 2 décisions de Nathan (gouttière intérieure des cartes retirée ; CTA et pictos inactifs plats), 11 correctifs, 2 reports, 7 constats écartés (relevant des Tasks 5 à 7 ouvertes, ou sans objet). Le plus grave : le harnais de rendu attendait `setup-header`, supprimé par `f1d4481` — plus aucune capture après `02-jds`. Fiche remise à jour des huit commits du jour.

- **2026-09-18 — Découpe arbitrée en sept passes de rendu, et débordement du chrono ABANDONNÉ.** Le scoreboard passe en blocs arrondis (exception datée à `DESIGN.md` › Shapes, bornée à cet écran) : un grand bloc voilé de rayon 16 contenant trois blocs de rayon 12, centre en creux, barre basse alignée sur la grille des colonnes à 0,0 px. ⚠️ **L'AC16 de la Story 10.4 est renversée** : le disque du chrono ne déborde plus sur les cartes. Le débordement était la signature de colonnes soudées ; en blocs séparés, la gouttière s'arrêtait contre le disque au lieu d'en faire le tour et tout ce qu'il croisait finissait sur une diagonale. Quatre passes ont cherché un raccord propre avant l'abandon (Nathan : « trop complexe à faire »). `--game-clock-bleed`, le demi-anneau et deux props deviennent morts et sont retirés ; le liseré de la carte active redevient un contour continu ; le disque remplit exactement sa colonne.

- **2026-09-18 — Comparaison au rendu érigée en RÈGLE BLOQUANTE (Nathan, à la relecture de la fiche) :** « avant chaque implémentation je veux une comparaison visuelle comme ce qu'on a fait pour le travail des couleurs ». La méthode des passes de rendu n'était portée que par le texte des AC 3/4/5 ; elle devient un **préalable explicite** — au plus deux propositions côte à côte aux trois formats, produites sans toucher au code applicatif, arbitrage de Nathan obtenu **et noté** avant la première ligne. Une exception nommée, et elle est technique : la **Task 2 (découplage du chrono)** ne décide rien et passe donc à **rendu constant**, prouvé au pixel contre la ligne de base — tout écart y est une régression, pas une proposition.
- **2026-09-18 — Fiche créée (bmad-create-story).** Cinquième et dernière story de l'Epic 11, née de la décision de Nathan du 2026-09-17 (`deferred-work.md`, commit `e38e315`) : elle ne figurait pas au plan d'origine `11.0 → 11.4`. Story de **RENDU** — formats de CTA, reliefs et découpe du scoreboard rassemblés, parce que « ce sont des décisions de rendu, pas du refactor ». **Trois décisions de Nathan à la création** : (1) story numérotée **11.5**, avec sa section ajoutée à `epics.md` et sa clé à `sprint-status.yaml` ; (2) **aucune référence visuelle — intention seule**, pas même les `billiboard_scoreboard*` qui ont fondé le report : les propositions sortent de surcharges CSS aux trois formats et Nathan tranche au rendu ; (3) **tout en une story**, la découpe comprise, avec la **géométrie couplée du chrono traitée en premier** — c'est elle qui a fait écarter les deux propositions de la 11.3, et aucune gouttière n'est crédible avant qu'elle soit découplée. **Combinaison inédite annoncée** : un rayon sur un conteneur contredirait « conteneurs à angles vifs » (`DESIGN.md` › Shapes, décision de Nathan du 10.1) — si l'exception est prise, elle s'écrit datée dans `DESIGN.md` avant le code. **Deux arbitrages de la 11.2 explicitement rouverts** : l'ombre de barre basse (écartée : « pas hyper bien intégrée ») et le verre des pop-ups. Piège structurant de la story, inverse de celui de la 11.3 : des pixels **doivent** bouger, et le risque est qu'un écart **non décidé** se cache parmi les écarts voulus — d'où les 36 captures d'avant et leur comparaison de fin. Ligne de base : commit `123cf19`, **1107 tests / 32 fichiers**, build vert, 36 scans propres, ré-audit 19/20. ⚠️ **L'epic se clôt sur cette story** : c'est elle qui rejoue l'audit en dernier.
