# Story 11.1: Échelle typographique et d'interlettrage conçue pour 1920×1080

Status: ready-for-dev

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

- [ ] **Task 1 — Écrire l'échelle dans `DESIGN.md`** (AC1)
  - [ ] Partir de la table « Échelle proposée » des Dev Notes ; ajuster, puis réécrire le frontmatter `typography` (un objet par rôle, `fontSize` en `clamp()`, `fontWeight`, `letterSpacing` **nommé**) et la section « Typography › Hierarchy » en français
  - [ ] Ajouter un bloc `tracking` au frontmatter (trois valeurs nommées maximum) et retirer les mentions de valeurs d'interlettrage éparses de la section
  - [ ] Recopier le frontmatter dans `.impeccable/design.json` (même structure de clés que l'existant)
  - [ ] Noter dans « Arbitrages ouverts » ce qui reste à trancher au rendu (plafond du score, `VS`, chiffre du chrono)
- [ ] **Task 2 — Appliquer dans `main.css` et les gabarits, SANS test, puis rendu statique** (AC2)
  - [ ] `main.css` `@theme` : remplacer les sept `--text-*` par l'échelle de `DESIGN.md` ; ajouter `--text-score-1` … `--text-score-4`, `--text-score-more`, `--text-clock`, `--text-key-numeric`, `--text-key-alpha`, `--text-field-value`, `--text-series`, `--text-start` ; ajouter `--tracking-*` ; **supprimer `--text-score`** (remplacé par la rampe — c'est un token typographique, il relève de cette story et non de la 11.2)
  - [ ] Remplacer chaque `text-[...]` et `tracking-[...]` des gabarits par l'utilitaire du token (inventaire fichier par fichier dans les Dev Notes) ; `SETUP_CTA_CLASSES` passe de `text-stat` au rôle retenu pour AC4
  - [ ] `npm run dev`, captures aux trois formats des cinq écrans et des quatre pop-ups (JDS **et** 3 Bandes pour le scoreboard) ; les joindre au Dev Agent Record ; **s'arrêter et faire valider par Nathan**
  - [ ] Intégrer ses retours (nouvelles captures si l'échelle bouge) jusqu'à validation ; consigner chaque décision de rendu dans la fiche, datée
- [ ] **Task 3 — Câblage des tests** (AC3)
  - [ ] Mettre à jour les cas qui nomment une classe de taille (liste dans Dev Notes › Tests) : même assertion, même intention, nom du token à la place de la valeur
  - [ ] Ajouter `src/assets/typography.test.ts` (ou un `describe` dans `main.css.test.ts`) : lit `main.css?raw` (piège `test.css` déjà réglé dans `vitest.config.ts`) et vérifie que chaque rôle de `DESIGN.md` est déclaré ; lit chaque `.vue?raw` de `src/components` et `src/views` et vérifie qu'aucun ne contient `text-[` ni `tracking-[`
  - [ ] `SideBar.test.ts` et `IconAction.test.ts` : le badge `BIENTÔT` porte le token de picto (plus `text-[10px]`)
- [ ] **Task 4 — Contraste des CTA à dégradé** (AC4)
  - [ ] Calculer, pour chaque format, la taille rendue du libellé des CTA de réglage et de `DÉMARRER` avec la nouvelle échelle ; vérifier ≥ 18,66 px gras partout, sinon relever le plancher du rôle
  - [ ] Consigner la table (format × taille × seuil × ratio) dans le Dev Agent Record ; si un format ne passe pas par la taille, entrée `deferred-work.md` « à trancher en 11.2 : assombrir le stop clair »
- [ ] **Task 5 — Vérification outillée et manuelle** (AC5)
  - [ ] `.claude/skills/impeccable/scripts/impeccable detect --viewport 1920x1080 http://localhost:5174/`, idem `1180x733` et `1133x744`, plus `detect 1score/src` ; zéro `undersized-ui-text`
  - [ ] Passe navigateur (extension Chrome) aux trois formats : cinq écrans, quatre pop-ups, JDS et 3 Bandes ; mesurer les touches alpha (`getBoundingClientRect`) et noter les largeurs
  - [ ] `npm test`, `npm run build`, `git diff --stat -- src/stores` vide
- [ ] **Task 6 — Clôture** (AC1, AC3)
  - [ ] `/impeccable polish` sur les fichiers touchés ; `DESIGN.md` relu contre ce qui est livré (si un plafond a bougé au rendu, c'est `DESIGN.md` qui porte la valeur finale, puis `main.css`)
  - [ ] Annoter `epics.md` (Story 11.1 : décisions de rendu, écarts) ; `deferred-work.md` si report ; `sprint-status.yaml` → `review`

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

### Debug Log References

### Completion Notes List

### File List
