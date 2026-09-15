# Story 10.7: Finition transverse — sémantique des pop-ups, `reduced-motion`, contraste

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur, y compris avec une sensibilité aux animations ou une vision réduite,
I want que toutes les pop-ups soient correctement annoncées, que rien n'anime inutilement si j'ai coupé les animations sur ma tablette, et que chaque texte reste lisible,
so that l'interface premium est aussi propre sous le capot qu'à l'écran (NFR10, UX-DR22).

> **Cadrage (bmad-create-story, 2026-09-14).** **Dernière story de l'Epic 10**, et la seule qui ne refonde aucun écran : contrôle transverse une fois les six autres livrées (10.6, 10.1, 10.2, 10.3, 10.4, 10.5 — toutes en `review`). Trois chantiers indépendants, plus la mise à jour de `CLAUDE.md` : **sémantique de dialogue** sur les pop-ups (DT3), **garde `prefers-reduced-motion`** (DT3), **passe contraste AA** (UX-DR56). **Aucun écran ne change de forme**, aucun composant n'est créé ni supprimé, aucune action de store n'est touchée. Exigences : UX-DR55, UX-DR56, DT3.
>
> ⚠️ **Le titre du fichier garde le mot « portrait »** (c'est la clé `sprint-status.yaml`, à ne pas renommer), mais **le portrait est caduc pour toute l'epic** depuis le 2026-09-11 (décision de Nathan, déjà annotée dans `epics.md` ligne 372 : « ~~passe portrait~~ passe iPad mini / iPad 11″ / 21,5″ »). L'AC d'`epics.md` qui demande une revue « en portrait (768×1024) et en paysage (1024×768) » **ne s'applique pas** : elle est remplacée par les trois formats **paysage** du projet. Aucune variante `portrait:` à écrire.

> **Décisions de Nathan à la création de la story (2026-09-14)** — elles priment sur les AC d'`epics.md` et sur la spec UX §10.6, à annoter en Task 6 :
>
> 1. **Aucune référence visuelle.** Ni `billiboard_*` ni `cueuny_*` : la story est une conformité chiffrée, pas une création. Les cinq écrans sont déjà validés au rendu ; un arbitrage de contraste se tranche au ratio, pas à la capture.
> 2. **Le ruban de victoire est assombri.** `--color-victory-ribbon` : **`#E63946` → `#D0343F`**. Le texte blanc y passe de **4,17:1 à 4,95:1**, conforme même au seuil 4,5:1 du texte courant — la dette ouverte par la 3e passe de rendu de la 10.5 est donc **close par la couleur** et non par une note. ⚠️ **Effet de bord assumé** : la valeur devient identique à `--color-brand-red`. Les **deux tokens restent deux tokens** (voir « Pièges ») — Nathan veut un design system des couleurs plus tard, hors Epic 10, et a explicitement demandé de ne pas improviser la palette story par story.
> 3. **Sous `prefers-reduced-motion: reduce`, deux animations survivent : le fondu du chrono et la barre de compte à rebours de l'auto-validation.** Toutes deux portent une **information** qu'aucun autre élément ne donne — le temps restant, et le fait que le score va se valider seul et changer le tour. **Le flash de frappe et la pulsation de refus de plafond sont coupés** : ce sont des retours de confort, l'haptique et l'affichage du chiffre suffisent. ⚠️ **Écart assumé à la lettre de l'AC d'`epics.md`**, qui n'exemptait que le chrono.
> 4. **Le contraste se mesure partout, et tout échec se corrige.** Pas seulement sur les trois cibles nommées par l'AC : les ~10 textes translucides du produit passent au même crible, au seuil **réel** de leur taille rendue aux trois formats. **Exception explicite : les états `BIENTÔT` à `opacity-45` restent tels quels** — WCAG exempte les commandes inactives (§1.4.3, « Inactive »), et l'atténuation *est* le signal.

## Acceptance Criteria

**AC1 — Sémantique de dialogue sur les QUATRE pop-ups**
**Given** `PromptModal`, `NumericPadDock`, `AlphaKeyboardSheet` et `ScoreEntryDock`
**When** l'un d'eux est monté
**Then** sa racine porte `role="dialog"`, `aria-modal="true"` et **soit** `aria-labelledby` vers l'`id` de son titre visible (`PromptModal`), **soit** `aria-label` décrivant sa fonction (les trois autres, qui n'ont aucun titre visible), chacun verrouillé par un cas de test
**And** l'`id` référencé par `aria-labelledby` est **unique par instance** (`useId()`, Vue 3.5) et non une chaîne littérale
**And** ⚠️ **ils sont QUATRE et non trois** : l'AC d'`epics.md` en nomme trois parce qu'elle a été écrite avant que la 10.4 remplace `ScoreEntryModal` par `ScoreEntryDock`

**AC2 — Le voile garde ses handlers sans `role="button"`**
**Given** le voile plein écran de chacune des quatre pop-ups
**When** on lit son markup
**Then** il porte toujours ses handlers pointer et **aucun** `role="button"` — l'ajouter le ferait annoncer comme un bouton alors qu'il n'en est pas un, et il porte déjà `role="dialog"`
**And** cette **exception explicite à CLAUDE.md §2** (« tout élément non-`<button>` utilisé comme zone tactile doit porter `role="button"` ») est écrite **dans `CLAUDE.md` §2 lui-même**, pas seulement dans la story

**AC3 — Garde `prefers-reduced-motion`**
**Given** un appareil réglé sur `prefers-reduced-motion: reduce`
**When** une saisie a lieu
**Then** le **flash de frappe** (`--animate-input-flash`) et la **pulsation de refus de plafond** (`--animate-input-reject`) ne jouent pas
**And** le **fondu du chrono** (`ShotClock`, `transition-[stroke-dashoffset,stroke]`) et la **barre de compte à rebours** (`--animate-input-countdown`) **jouent normalement** (décision 3)
**And** ⚠️ **le voile de flash reste invisible** : ses keyframes vont de `opacity: 1` à `0 forwards`, donc un simple `animation: none` laisserait un voile noir **permanent** sur la valeur de série — la garde doit le neutraliser par `opacity: 0`, pas par la seule suppression de l'animation
**And** la garde est une règle **globale** de `main.css` (aucune classe conditionnelle dans les composants), et un cas de test vérifie que le bloc `@media (prefers-reduced-motion: reduce)` existe et cible les deux animations coupées **sans** citer les deux conservées

**AC4 — Passe contraste AA : mesure**
**Given** la palette finale des six stories de l'epic
**When** on mesure les couples texte/fond (y compris les translucides composés sur leur fond réel)
**Then** chaque couple est consigné dans la story avec **son ratio**, **la taille rendue aux trois formats** et **le seuil qui s'applique** (4,5:1 texte courant ; 3:1 si ≥ 24 px, ou ≥ 18,66 px en gras)
**And** la mesure couvre **au moins** les couples de la table « Contraste » en Dev Notes, les trois cibles nommées par l'AC d'`epics.md` comprises
**And** les états `BIENTÔT` à `opacity-45` sont **exclus** de la mesure, avec la raison écrite (décision 4)

**AC5 — Passe contraste AA : correction**
**Given** les couples mesurés
**When** l'un échoue à son seuil réel
**Then** il est corrigé **dans le token ou la classe**, et le ratio d'après-correction est consigné
**And** `--color-victory-ribbon` passe à `#D0343F` (décision 2) ; `--color-on-victory-ribbon` reste `#FFFFFF` et son commentaire d'avertissement dans `main.css` est **réécrit** (les chiffres qu'il porte deviennent faux)
**And** la dette « Contraste du texte sur le ruban de victoire » de `deferred-work.md` est marquée **close**

**AC6 — Revue des cinq écrans aux trois formats paysage**
**Given** les cinq écrans refondus (accueil, sélection JDS, paramétrage, scoreboard, récap) et les quatre pop-ups
**When** on les passe en revue dans Chrome aux **trois formats paysage** — 1133×744, 1194×834, 1920×1080 (le portrait est caduc, voir Cadrage)
**Then** aucun débordement horizontal, aucune zone tactile < 90×90 px hors claviers (seuil clavier ≥ 57/60 px, UX-DR22), aucun libellé coupé
**And** les écarts relevés sont corrigés **dans cette story s'ils tiennent en une retouche**, sinon consignés dans `deferred-work.md` avec la mesure

**AC7 — `CLAUDE.md` à jour (DT3, clôture de l'epic)**
**Given** `CLAUDE.md`
**When** la story est livrée
**Then** il décrit les composants et conventions nés de l'epic : **`SideBar` contextuelle nourrie par l'écran** (les items viennent de l'écran, jamais codés dans la barre), **`ModeTile`**, **`IconAction`**, **`NumericPadDock` / `AlphaKeyboardSheet` / `ScoreEntryDock` hôtes de la saisie** (les pavés restent muets, UX-DR54), **`PictoIcon`** et son jeu de SVG inline, les **tokens de conteneur**
**And** il ne mentionne plus `PlayerSetupModal`, `ScoreEntryModal` ni `ÉCHANGER` **comme éléments vivants** (ils ont été supprimés en 10.3 et 10.4)
**And** §2 porte l'exception du voile (AC2), §9 porte que la commande de validation de référence est **`npm run build`** et non `npx vue-tsc --noEmit` (dette de la 4e passe de la 10.4, explicitement « à consigner dans CLAUDE.md §9 à la Story 10.7 »)

**AC8 — Tests et non-régression**
**Given** la story livrée
**When** les tests tournent
**Then** la suite est verte et `npm run build` passe
**And** `src/stores/` **n'a pas été touché** (`git diff --stat src/stores/` vide) — aucun des trois chantiers ne touche à la logique de jeu
**And** les cas existants des quatre pop-ups ne sont **pas réécrits**, seulement complétés : un attribut ajouté ne change aucun comportement

## Tasks / Subtasks

- [x] **Task 1 — Sémantique de dialogue** (AC: 1, 2)
  - [x] `PromptModal.vue` — racine (l. 102) : `role="dialog"`, `aria-modal="true"`, `:aria-labelledby="titleId"` ; `const titleId = useId()` (import depuis `vue`), posé en `:id="titleId"` sur le `<h2 data-testid="prompt-title">` (l. 127)
  - [x] `NumericPadDock.vue` — racine (l. 114) : `role="dialog"`, `aria-modal="true"`, `aria-label="Réglage de la distance"` (aucun titre visible)
  - [x] `AlphaKeyboardSheet.vue` — racine (l. 72) : `role="dialog"`, `aria-modal="true"`, `aria-label="Saisie du nom"`
  - [x] `ScoreEntryDock.vue` — racine (l. 146) : `role="dialog"`, `aria-modal="true"`, `aria-label="Saisie du score"`
  - [x] Vérifier qu'**aucun** des quatre voiles ne reçoit `role="button"` au passage, et que leurs `@pointerdown`/`@pointerup` existants ne bougent pas
  - [x] Un cas par composant : la racine porte les trois attributs ; pour `PromptModal`, que `aria-labelledby` **égale** l'`id` réel du `<h2>` (et non une chaîne en dur)
  - [x] **Ne pas** ajouter de piège à focus, de `tabindex`, ni d'écoute clavier : l'arbitrage « borne fixe » est inchangé (note de périmètre d'`epics.md`)

- [x] **Task 2 — Garde `prefers-reduced-motion`** (AC: 3)
  - [x] Dans `main.css`, **après** le bloc `@theme`, ajouter un bloc global :
    ```css
    @media (prefers-reduced-motion: reduce) {
      /* Coupées : retours de confort. L'haptique et l'affichage du chiffre suffisent. */
      .animate-input-reject { animation: none; }
      /* ⚠️ PAS `animation: none` : les keyframes vont de opacity 1 à 0 `forwards`, donc
         sans animation le voile resterait peint en permanence sur la valeur de série. */
      .animate-input-flash { animation: none; opacity: 0; }
    }
    ```
  - [x] **Ne rien écrire** pour `--animate-input-countdown` ni pour les `transition-*` de `ShotClock` : ils sont conservés (décision 3). Ne pas non plus poser de garde attrape-tout du genre `*, *::before, *::after { animation: none !important }` — elle les emporterait
  - [x] Un cas dans `PlayerPanel.test.ts` (ou un test dédié à `main.css`) : lire `main.css` en `?raw` et vérifier que le bloc `@media (prefers-reduced-motion: reduce)` existe, cite `animate-input-flash` **avec** `opacity: 0`, cite `animate-input-reject`, et ne cite **ni** `animate-input-countdown` **ni** `stroke-dashoffset`
  - [x] ⚠️ happy-dom ne calcule aucun CSS : ce test verrouille le **texte** de la règle, pas son effet. La vérification réelle se fait au navigateur (Task 7)

- [x] **Task 3 — Passe contraste : mesure** (AC: 4)
  - [x] Reprendre la table « Contraste » des Dev Notes (elle est déjà calculée) et la **revérifier** après toute retouche, avec la formule WCAG 2.x (luminance relative, seuil `0.03928`), les translucides **composés** sur leur fond réel
  - [x] Pour chaque couple, noter la **taille rendue** aux trois formats (table « Tailles rendues » en Dev Notes) et en déduire le seuil applicable — ⚠️ le seuil « grand texte » est **≥ 24 px**, ou **≥ 18,66 px en gras** ; `text-label` rend 22,66 / 23,88 / 24 px en `font-black`, il est donc « grand » aux trois formats, et `text-stat` rend 14 / 14,33 / 18 px, il ne l'est **jamais**
  - [x] Consigner la table finale (avant/après) dans la section « Completion Notes » de cette story — c'est ce que demande l'AC d'`epics.md` (« résultat consigné dans la story »)

- [x] **Task 4 — Passe contraste : corrections** (AC: 5)
  - [x] `main.css` — `--color-victory-ribbon: #E63946` → **`#D0343F`** (décision 2) ; **réécrire** le commentaire au-dessus de `--color-on-victory-ribbon` : les chiffres « blanc 4,17:1 / noir 5,04:1 » et la piste « assombrir vers `--color-brand-red` » deviennent faux et trompeurs
  - [x] ⚠️ **Ne pas fusionner** `--color-victory-ribbon` et `--color-brand-red`, ni remplacer l'un par l'autre : deux rôles, deux tokens, même valeur temporairement (voir « Pièges »). Ajouter une ligne de commentaire disant exactement ça
  - [x] `ScoreEntryDock.vue:196` — la barre de rebours `bg-white/70` donne **2,45:1** sur `--gradient-blue` : c'est un **objet graphique porteur d'information** (WCAG 1.4.11, seuil 3:1), pas du texte. Passer à `bg-white` → **3,46:1**
  - [x] `PlayerSetupCard.vue:96,110` — placeholders `opacity-55` : **4,43:1** sur la carte jaune en `text-stat` (jamais « grand texte ») → passer à **`opacity-60`** (5,26:1). Sur la carte blanche, `opacity-55` donne déjà 4,74:1 — la même valeur convient aux deux, garder **une seule** classe
  - [x] `ModeTile.vue:64` — `tile-tagline` en `text-white/80` donne **2,78:1** sur `--gradient-blue`, échec net en `text-stat` (jamais « grand texte »). ⚠️ **Aucune tuile n'en affiche aujourd'hui** (décision de Nathan en 10.1 : aucune accroche de tuile ; `HomeScreen.test.ts:234` verrouille leur absence), mais la prop est **volontairement gardée au contrat** — `ModeTile.vue:13` le dit en toutes lettres et `ModeTile.test.ts:68-75` la teste. **Ne pas la supprimer** : passer à **`text-white`** (3,46:1, conforme au seuil 3:1 seulement si l'accroche est un jour rendue en ≥ 24 px — ce que `text-stat` ne fait pas). Le chemin n'étant pas affiché, **le corriger et le consigner** suffit ; si Nathan rouvre un jour les accroches de tuile, la taille devra monter en même temps — le noter dans `deferred-work.md`
  - [x] Relever tout autre échec trouvé en Task 3 et le corriger au même principe : remonter l'opacité au **premier palier conforme**, jamais changer une teinte de marque sans arbitrage
  - [x] `deferred-work.md` — marquer **close** la dette « Contraste du texte sur le ruban de victoire, à trancher à la passe AA (Story 10.7) »

- [x] **Task 5 — `CLAUDE.md`** (AC: 2, 7)
  - [x] §2 (Pointer Events) : ajouter l'**exception du voile** — un voile plein écran de pop-up porte ses handlers pointer **sans** `role="button"`, parce qu'il n'est pas un bouton et qu'il porte déjà `role="dialog"` ; nommer les quatre composants concernés
  - [x] §9 (Stratégie de validation) : la commande de référence est **`npm run build`** (= `vue-tsc -b && vite build`), **pas** `npx vue-tsc --noEmit`, qui laisse passer des pertes de narrowing — leçon de la 4e passe de la 10.4, dette explicitement adressée à cette story
  - [x] Nouvelle section (ou extension de §7) : les composants de l'Epic 10 — `SideBar` **nourrie par l'écran** (`items` + `exitItem`, jamais de contenu codé dans la barre ; cinq écrans la consomment), `ModeTile`, `IconAction`, `PictoIcon` (SVG inline, table `name` → tracé, trait 2 px), les trois hôtes de saisie `NumericPadDock` / `AlphaKeyboardSheet` / `ScoreEntryDock` qui **portent les règles** (buffer dans l'écran, plafond, timer, haptique) pendant que `NumericPad` et `AlphaKeyboard` **restent muets** (UX-DR54)
  - [x] Ajouter la règle **`prefers-reduced-motion`** : toute nouvelle animation d'ornement doit être coupée dans le bloc de garde ; une animation **porteuse d'information** (chrono, rebours) ne l'est pas, et la décision se documente
  - [x] Ajouter le piège **« aucun commentaire HTML à la racine d'un gabarit »** — payé quatre fois dans l'epic (10.1 `ModeTile`, 10.3, 10.4 `CenterPanel`, rappelé en 10.5) : il fait de la racine un fragment, qui perd `classes()`, `attributes()` et son `data-testid`
  - [x] Vérifier qu'aucune mention vivante de `PlayerSetupModal`, `ScoreEntryModal` ou `ÉCHANGER` ne subsiste (à ce jour `CLAUDE.md` n'en porte aucune — **confirmer**, ne pas supposer)

- [x] **Task 6 — Annotations de documents** (AC: 4, 5)
  - [x] `epics.md` (Story 10.7, UX-DR55, UX-DR56) : consigner les **quatre décisions** — aucune référence visuelle ; ruban assombri ; rebours conservé sous `reduced-motion` (**écart à la lettre de l'AC**) ; mesure élargie à tous les translucides, `BIENTÔT` exempté. Marquer l'AC portrait **caduc** (déjà annoté ligne 372, le redire dans le corps de la story) et corriger « trois pop-ups » en **quatre**
  - [x] `ux-design-specification.md` §10.6 : le token vaut **`#E6CA00`** et non `#E6B000` (l'écart est déjà noté, le figer avec le ratio mesuré **12,81:1**) ; les libellés de picto de la `SideBar` sont sur **`--color-sidebar`** et non `--color-surface` (seul `IconAction` est sur `--color-surface`) ; la mention « accroche et titres de tuiles sur leur fond à **85 %** » est **caduque** — plus aucune tuile n'est à 85 %, seules les tuiles `BIENTÔT` sont atténuées, à 45 %
  - [x] `architecture.md` : une entrée « Livré en Story 10.7 » avec la garde `reduced-motion` (et **pourquoi** deux animations y échappent), les quatre `role="dialog"`, et le changement de `--color-victory-ribbon`
  - [x] `deferred-work.md` : consigner ce qui n'a pas été corrigé en Task 4 / Task 7, avec sa mesure

- [x] **Task 7 — Passe navigateur** (AC: 3, 6) — voir « Validation visuelle » en Dev Notes
  - [x] Trois formats paysage × cinq écrans × quatre pop-ups
  - [x] **Vérifier la garde `reduced-motion` pour de vrai** : émuler `prefers-reduced-motion: reduce` et confirmer que (a) le flash de frappe ne laisse **aucun voile résiduel** sur la valeur de série — c'est le piège de l'AC3 —, (b) la pulsation de plafond ne joue plus, (c) le chrono descend toujours en continu, (d) la barre de rebours se remplit toujours
  - [x] Mesurer les zones tactiles ≥ 90×90 px hors claviers, et relire les libellés longs (`FERMER L'APPLICATION`, `CONFIGURATION`, `ENTRAÎNEMENT`, `RECOMMENCER`, `PASSER LE TOUR`, `CHANGER DE BILLE`)
  - [x] Contrôler le ruban de victoire assombri **à côté** de l'en-tête rouge de la sidebar du récap : c'est le seul endroit où les deux rouges, désormais identiques, se touchent
  - [x] Harnais `_viewport-harness.html` **supprimé en fin de passe**

### Review Findings

*(revue de code groupée de fin d'Epic 10, 2026-09-15 — constats transverses et reports)*

- [x] [Review][Patch] *(corrigé : commentaires déplacés dans le `<script setup>`)* Commentaire HTML à la racine du gabarit (CLAUDE.md §12, règle écrite par cette story sans balayer le code) : `SideBar.vue:29` et `ShotClock.vue:79` sont rendus en fragment en dev/test — racine sans `classes()`/`attributes()` [1score/src/components/SideBar.vue:29 ; 1score/src/components/ShotClock.vue:79]
- [x] [Review][Patch] *(corrigé, les six)* Commentaires périmés qui contredisent le code livré : `GameSummary.vue:65-67` (deux rouges « distincts », même valeur depuis la 10.7), `HomeScreen.vue:447-448` (bandeau « monté dans le flux »), `:478-481` (« colonne 1/5 », le dock « prend la place des CTA » — 1re passe abandonnée, classe `w-1/4`), `:556-558` (commentaire DISTANCE MANQUANTE posé au-dessus de la pop-up CADRE), `CenterPanel.vue:110-114` (`-mx-4` / 24 px pour un code à 40 / 32 px), `main.css` (la garde renvoie à « CLAUDE.md §10 », la règle est au §11)
- [x] [Review][Patch] *(consigné ci-dessous, dans les Completion Notes)* Couple de contraste non consigné (AC4, « chaque couple ») : `text-brand-red` de la zone de série sur les cartes blanche et jaune, renvoyé « à la passe AA de la 10.7 » par `PlayerPanel.vue:280-281` ; recalculé ≈ 4,95:1 (blanc) et ≈ 3,75:1 (jaune `#FFE000`), conforme au seuil 3:1 du grand texte (`clamp(24px,…)` gras) — à consigner dans les Dev Notes, le code est bon
- [x] [Review][Defer] Rechargement PWA appliqué dès `status === 'idle'`, donc aussi en plein paramétrage : noms et distances tapés perdus [1score/src/composables/usePwaUpdate.ts:68-77] — deferred, pre-existing (1.13)
- [x] [Review][Defer] Auto-validation 3 s après `REPRENDRE` quand `entryOpen` et le buffer sont restaurés, sans frappe (`watch` `immediate`) [1score/src/components/ScoreEntryDock.vue:97-107] — deferred, pre-existing (1.5/1.12, même code dans `ScoreEntryModal`)
- [x] [Review][Defer] Deux joueurs à la distance (joueur 1 amené par `+` hors de son tour, joueur 2 par série) → joueur 2 seul vainqueur au lieu d'une égalité [1score/src/stores/useGameStore.ts:438-447] — deferred, pre-existing (1.10)
- [x] [Review][Defer] Quatre copies de `armBackdropClose`/`disarmBackdropClose`/`closeFromBackdrop` (`ScoreEntryDock`, `NumericPadDock`, `AlphaKeyboardSheet`, `PromptModal`), deux d'`ALIGN_CLASSES`, deux de `BALL_PICTOS` → composable `useBackdropClose` et constantes partagées — deferred, refactor sans bug, hors correctif de revue
- [x] [Review][Defer] Demi-anneau de tour du chrono : clip fixe de `--game-clock-bleed` qui suppose un disque débordant d'exactement 24 px ; si la hauteur contraint `min(100cqw,100cqh)` (iPad avec barre Safari, ~1180×673), le disque ne déborde plus et le demi-anneau se peint en pleine colonne [1score/src/components/ShotClock.vue:40-43 ; CenterPanel.vue:121 ; PlayerPanel.vue:76-79] — deferred, indécidable en revue de code, à vérifier au navigateur à ce format

## Dev Notes

### État du code à l'arrivée (commit `d757f31`, arbre propre, 664 tests verts, 23 fichiers de test)

- **Aucun `role="dialog"` n'existe dans le produit.** Le seul rôle ARIA posé est `role="timer"` sur `ShotClock:91`. Les `aria-label` existants sont sur des boutons isolés (`NumericPad:68`, `PlayerPanel:269,300`) et les `aria-hidden` sur des décorations. **Tout est à ajouter, rien n'est à défaire.**
- **Les quatre pop-ups ont le même squelette** : racine `fixed inset-0 z-50 flex items-center justify-center bg-black/25` portant les handlers de voile, puis une carte (`prompt-card`, `dock-card`, `sheet-card`, `score-entry-card`) en `@pointerdown.stop`. Racines : `PromptModal:102`, `NumericPadDock:114`, `AlphaKeyboardSheet:72`, `ScoreEntryDock:146`. **Un seul patron, quatre applications.**
- **Seul `PromptModal` a un titre visible** (`<h2 data-testid="prompt-title">`, l. 127-129, alimenté par la prop `title: string`, toujours passée). Les trois autres n'ont ni titre ni prop qui dise ce qu'ils remplissent — ils reçoivent `value` et `align`, rien de plus. D'où `aria-label` statique plutôt que `aria-labelledby` (AC1).
- **Vue 3.5.22** : `useId()` est disponible. C'est ce qui donne un `id` unique par instance sans compteur maison.
- **Les quatre animations** vivent toutes dans le `@theme` de `main.css` (l. 77, 85, 96) et sont consommées par classe : `animate-input-flash` (`PlayerPanel:295`), `animate-input-reject` (`NumericPadDock:133`, `ScoreEntryDock:164`), `animate-input-countdown` (`ScoreEntryDock:196`). Le fondu du chrono n'est pas une animation mais **trois transitions** (`ShotClock:118,129,139`).
- **`main.css` fait 263 lignes**, dont un `@theme` (l. 3-100) et un `@theme static` (l. 104-224) suivis des règles globales. Le bloc de garde va **après**, avec les autres règles globales.
- **`src/stores/` n'est touché par aucun des trois chantiers.** `git diff --stat src/stores/` vide est la preuve de non-régression de la story (AC8), comme en 10.4 et 10.5.

### Sémantique de dialogue — ce qu'on fait, et surtout ce qu'on ne fait pas

On pose **trois attributs par racine**. C'est tout.

On **ne** pose **pas** : piège à focus, `tabindex`, `autofocus`, écoute de `Escape`, `inert` sur l'arrière-plan, `aria-live`. L'arbitrage « borne fixe » d'`epics.md` est explicite : *« aucune gestion du focus clavier au-delà de ce qui est gratuit »* et *« pas de navigation clavier (hors scope V1) »*. L'app tourne sur une tablette de club sans clavier ; un piège à focus n'aurait rien à piéger et introduirait un chemin non testé.

⚠️ **Le voile ne prend pas `role="button"`.** C'est contre-intuitif au regard de CLAUDE.md §2, qui l'exige de « tout élément non-`<button>` utilisé comme zone tactile ». La raison : le voile porte déjà `role="dialog"`, et un élément n'a qu'un rôle ; l'annoncer comme un bouton serait faux, alors que taper dedans **ferme** — comportement déjà nommé par le CTA `ANNULER` de la carte. Le CSS global que §2 cherche à faire hériter (`touch-action`, `user-select`) est sans objet sur un voile plein écran qui ne porte aucun texte. **Cette exception était déjà appliquée dans le code depuis la 10.2** (`PromptModal:28-30` le dit en commentaire) ; la story la fait remonter dans `CLAUDE.md` (AC2), ce que DT3 demandait.

### `reduced-motion` — le piège qui vaut la story

```css
--animate-input-flash: input-flash 120ms ease-out forwards;
@keyframes input-flash { from { opacity: 1; } to { opacity: 0; } }
```

L'élément qui la porte (`PlayerPanel:291-296`) est un `<span class="… bg-black/25 animate-input-flash">` **posé en absolu par-dessus la valeur de série**, sur une carte joueur à fond clair. Son état au repos, sans animation, est **`opacity: 1`** — un voile noir à 25 % **peint en permanence** sur le chiffre. L'animation est ce qui l'efface.

Donc : `animation: none` seul **crée un défaut d'affichage permanent** pour exactement les utilisateurs qu'on cherche à servir, et **aucun test unitaire ne peut le voir** (happy-dom ne calcule pas le CSS). D'où `animation: none; opacity: 0;` dans la garde, et la vérification (a) de la Task 7.

`animate-input-reject` n'a pas ce problème : ses keyframes partent et reviennent à `scale(1)`, sans `forwards`. `animation: none` y suffit.

**Ne pas écrire de garde attrape-tout.** Le motif qui circule (`*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }`) emporterait le fondu du chrono **et** la barre de rebours, c'est-à-dire précisément les deux que la décision 3 conserve. Cibler les deux classes, nommément.

### Contraste — mesures déjà faites (à revérifier, pas à refaire de zéro)

Formule WCAG 2.x, translucides **composés** sur leur fond réel (`--color-surface` sur le stop médian de `--gradient-bg` `#111317`, etc.).

| Couple | Ratio | Seuil réel | Verdict |
|---|---|---|---|
| encre noire sur `--color-panel-yellow-band` `#E6CA00` | **12,81:1** | 4,5 | ✅ (cible n° 1 de l'AC) |
| encre noire sur `--color-panel-white-band` `#ECECEC` | 17,78:1 | 4,5 | ✅ |
| encre noire sur `--color-player-yellow` `#FFE000` | 15,91:1 | 4,5 | ✅ |
| **blanc sur `--color-victory-ribbon` `#E63946`** | **4,17:1** | 4,5 | ⚠️ **corriger** → `#D0343F` = **4,95:1** ✅ |
| blanc sur `--gradient-blue` (stop clair `#2E8FDB`) | 3,46:1 | 3 (`text-label` ≥ 18,66 px gras) | ✅ **de justesse** |
| blanc sur `--gradient-blue` (stop sombre `#0573BB`) | 5,03:1 | 3 | ✅ |
| blanc sur `--gradient-red` (stop clair `#E2515B`) | 3,78:1 | 3 (`DÉMARRER`, `text-label` gras) | ✅ |
| blanc sur `--gradient-neutral` (stop clair) | 10,45:1 | 3 | ✅ |
| blanc sur `--color-key` `#2E333B` | 12,71:1 | 4,5 | ✅ |
| `--color-bg` sur `--color-banner` `#F2F0EA` | 16,61:1 | 3 | ✅ |
| libellé de picto blanc sur `--color-sidebar` `#101318` | **18,61:1** | 4,5 | ✅ (cible n° 2, ⚠️ fond = `--color-sidebar`, pas `--color-surface`) |
| `IconAction` blanc sur `--color-surface` / fond médian | 16,12:1 | 4,5 | ✅ (la vraie cible n° 2) |
| accroche blanche sur `--gradient-bg` | > 14:1 | 3 | ✅ (cible n° 3) |
| `tile-title` blanc sur `--gradient-blue` clair | 3,46:1 | 3 (≥ 34 px gras) | ✅ |
| **`tile-tagline` `text-white/80` sur `--gradient-blue` clair** | **2,78:1** | 4,5 (`text-stat`) | ❌ **échec — chemin non affiché, voir Task 4** |
| `GameSummary` libellés `text-white/50` sur cellule `bg-white/6` | 4,65:1 | 4,5 | ✅ de justesse |
| `GameSummary` `summary-mode` `text-white/50` | 5,05:1 | 4,5 | ✅ |
| `GameSummary` `VS` `text-white/60` | 6,62:1 | 3 | ✅ |
| `CenterPanel` `REP` `text-white/60` | 7,18:1 | 4,5 | ✅ |
| clavier, libellés d'action `text-white/55` sur `--color-key` | 5,03:1 | 4,5 | ✅ |
| `PromptModal` message `text-white/70` sur la carte | 9,50:1 | 3 | ✅ |
| **barre de rebours `bg-white/70` sur `--gradient-blue` clair** | **2,45:1** | **3 (WCAG 1.4.11, objet graphique)** | ❌ **corriger** → `bg-white` = 3,46:1 |
| **`PlayerSetupCard` placeholders `opacity-55` sur carte jaune** | **4,43:1** | 4,5 (`text-stat`) | ❌ **corriger** → `opacity-60` = 5,26:1 |
| `PlayerSetupCard` placeholders `opacity-55` sur carte blanche | 4,74:1 | 4,5 | ✅ (`opacity-60` y convient aussi) |
| `PlayerSetupCard` libellés `opacity-65` sur carte jaune | 6,33:1 | 4,5 | ✅ |
| `PlayerPanel` `MOY`/`SÉRIE` `opacity-60` sur carte blanche / jaune | 5,74 / 5,26:1 | 4,5 | ✅ |
| texte de base `rgba(255,255,255,0.87)` sur fond médian | 14,10:1 | 4,5 | ✅ |

**Trois échecs, trois corrections**, toutes listées en Task 4. Le reste passe — dont les trois cibles nommées par l'AC d'`epics.md`, confortablement.

#### Tailles rendues (ce qui décide du seuil)

Seuil « grand texte » WCAG : **≥ 24 px**, ou **≥ 18,66 px en gras**. Les tokens sont en `clamp()` fluide, donc la taille dépend de la largeur d'écran :

| Token | 1133 px | 1194 px | 1920 px | « Grand texte » ? |
|---|---|---|---|---|
| `text-label` `clamp(16px, 2vw, 24px)` | 22,66 | 23,88 | 24,00 | **oui** aux trois formats (toujours employé en `font-black`) |
| `text-stat` `clamp(14px, 1.2vw, 18px)` | 14,00 | 14,33 | 18,00 | **non**, jamais → seuil 4,5:1 |
| `text-tile-title` `clamp(28px, 3vw, 36px)` | 33,99 | 35,82 | 36,00 | **oui** |
| `text-picto` `clamp(11px, 1.1vw, 12px)` | 12,00 | 12,00 | 12,00 | **non** → seuil 4,5:1 |

⚠️ **`text-label` n'est « grand » que parce que l'app démarre à 1133 px.** Son plancher est 16 px : sous 933 px de large il repasserait en texte courant et `blanc sur --gradient-blue` (3,46:1) **échouerait**. C'est sans objet pour le produit (tablette paysage uniquement), mais c'est la raison pour laquelle plusieurs verdicts ✅ tiennent — à consigner, pas à découvrir plus tard.

### Pièges

- **Deux tokens rouges, pas un.** Après la décision 2, `--color-victory-ribbon` et `--color-brand-red` valent tous deux `#D0343F`. **Ne pas en supprimer un**, ne pas écrire `var(--color-brand-red)` dans la définition de l'autre, ne pas remplacer les usages. Ils portent deux rôles (ruban de victoire / rouge de marque) qui peuvent rediverger ; et Nathan a demandé le 2026-09-14 un **design system des couleurs à écrire plus tard, hors Epic 10**, en précisant de ne pas improviser la palette story par story. Fusionner ici, c'est improviser.
- **Le voile de flash reste peint si on le coupe naïvement** — le point central de la story, détaillé plus haut. `opacity: 0`, pas seulement `animation: none`.
- **Pas de garde `reduced-motion` attrape-tout** : elle emporterait le chrono et le rebours.
- **`npm run build`, pas `npx vue-tsc --noEmit`** : `--noEmit` laisse passer des pertes de narrowing que `vue-tsc -b` refuse (leçon de la 4e passe de la 10.4). C'est d'ailleurs ce que la Task 5 va inscrire dans `CLAUDE.md` §9 — autant l'appliquer en écrivant la story.
- **Aucun commentaire HTML à la racine d'un gabarit** : il en fait un fragment, et la racine perd `classes()`, `attributes()` et son `data-testid`. Payé en 10.1, 10.3, 10.4, rappelé en 10.5. ⚠️ **Risque direct ici** : la Task 1 touche les quatre racines de pop-up, et la tentation d'y documenter le `role="dialog"` au plus près est exactement le geste qui casse. Commenter **dans le `<script setup>`**, comme le fait déjà le code.
- **Aucune classe construite à la volée** : le scanner JIT de Tailwind 4 ne voit que les classes écrites en toutes lettres. Vaut aussi pour les corrections de contraste (`opacity-60` écrit littéralement).
- **`--spacing` vaut 8 px** : `gap-2` = 16 px, `p-4` = 32 px. Rien à dimensionner ici, mais à garder en tête si une retouche de la Task 7 touche un espacement.
- **`scrollWidth` / `scrollHeight` ne voient rien sous `overflow-hidden`** (payé en 10.2, 10.3 et 10.4) : comparer les `getBoundingClientRect()` des enfants à celui du parent.
- **Ne pas « corriger » les états `BIENTÔT`** (`opacity-45` sur `ModeTile:57`, `SideBar:75,80`). WCAG §1.4.3 exempte explicitement les commandes inactives, et l'atténuation *est* le signal (doublé du badge `BIENTÔT`, qui ne dépend pas de la couleur seule — UX-DR30).
- **`--color-panel-yellow-band` `#E6CA00` a été calculé pour l'ancien jaune `#FFC72C`** et n'a pas suivi la carte à `#FFE000`. Il passe AA très largement (12,81:1) et Nathan l'a validé au rendu de la 10.4 (« le bandeau se distingue encore de la carte ») : **le laisser tel quel**, juste figer le chiffre dans la spec (Task 6).

### Tests

- Vitest + Vue Test Utils + happy-dom : **aucun CSS n'est calculé**. Les cas vérifient des attributs, des classes et du texte de règle CSS ; l'effet réel de la garde `reduced-motion` et tous les ratios perçus relèvent de la passe navigateur.
- Déclenchement en `trigger('pointerdown')`, jamais `click` (AR8).
- **Fichiers touchés, et de combien** : `PromptModal.test.ts` (296 l.), `NumericPadDock.test.ts` (227 l.), `AlphaKeyboardSheet.test.ts` (171 l.), `ScoreEntryDock.test.ts` (319 l.) — **un cas ajouté chacun**, aucun cas existant réécrit (AC8). Plus un cas de garde CSS (Task 2).
- **Lire `main.css` en `?raw`** pour le cas de la garde : c'est le motif déjà employé par `GameSummary.test.ts` pour prouver l'absence de `defineEmits`. Vérifier le **texte** de la règle — présence des deux classes coupées, `opacity: 0` sur le flash, absence de `animate-input-countdown` et de `stroke-dashoffset` dans le bloc.
- **`useGameStore.test.ts` ne doit pas bouger.** Si un cas casse, une règle de jeu a bougé par accident : chercher la régression, ne pas adapter le test.
- **`ShotClock.test.ts` (186 l.) ne doit pas bouger** non plus : ses transitions sont conservées telles quelles.
- ⚠️ **Un `aria-label` ajouté peut casser un sélecteur existant** qui viserait un texte agrégé (`wrapper.text()`) — vérifier, mais a priori aucun : les `aria-label` ne rendent pas de texte.

### Validation visuelle (fin de story, une seule passe)

- `npm run dev` — **pas `npm run preview`** : derrière le service worker, `navigateFallback` renvoie `index.html` pour toute navigation et le harnais n'est jamais chargé (piège payé en 10.2).
- `resize_window` ne redimensionne pas le viewport : harnais temporaire `1score/public/_viewport-harness.html` chargeant l'app dans une `<iframe>` dimensionnée par `?w=&h=`, **supprimé en fin de passe**. ⚠️ Poser `flex: 0 0 auto` sur l'iframe, sinon un format plus large que la fenêtre est comprimé sans rien signaler (défaut trouvé en 10.4 : 1920 mesurait 1456). Formats **paysage** : 1133×744, 1194×834, 1920×1080. Demander à Nathan quel Chrome utiliser (« Browser 1 (macOS) » les dernières fois).
- **Émuler `prefers-reduced-motion`** : via CDP (`Emulation.setEmulatedMedia`) ou, plus simple depuis l'onglet, DevTools → *Rendering* → *Emulate CSS media feature prefers-reduced-motion*. Si l'émulation n'est pas accessible depuis l'extension, **replier sur `matchMedia` forcé** : injecter temporairement une règle `@media` équivalente et le noter comme tel dans les notes de complétion — mais **ne pas déclarer la garde vérifiée sans l'avoir vue**.
- **Les quatre vérifications de la Task 7** dans l'ordre : voile de flash (aucun résidu noir sur la valeur de série), pulsation de plafond (frapper un 4e chiffre : rien ne bouge, l'haptique reste), chrono (descente continue), rebours (la barre se remplit toujours sous `VALIDER`).
- **Parcours complet** : accueil → `JEUX DE SÉRIES` → `LIBRE` → paramétrage (ouvrir les deux claviers : distance et nom) → `DÉMARRER` → scoreboard (ouvrir le dock de score, dépasser le plafond, laisser l'auto-validation aller au bout) → `QUITTER` → `PromptModal` de fin → récap. Les quatre pop-ups sont vues en une passe.
- **Zones tactiles** : mesurer, ne pas supposer. `SideBar` (120 px de large × `min-h-[var(--size-touch-target)]`), `IconAction` de la barre basse, `−`/`+` des cartes joueur, `PASSER LE TOUR`, CTA de pop-up. Claviers **exclus** (seuil ≥ 57/60 px, UX-DR22).
- **Libellés longs** : `FERMER L'APPLICATION` (2 lignes), `CONFIGURATION` (13), `ENTRAÎNEMENT` (12 — avait dépassé de 3 px en 10.1, l'interlettrage a été retiré pour ça), `RECOMMENCER` (11), `CHANGER DE BILLE`, `PASSER LE TOUR`.
- **Le ruban assombri** : le regarder au récap, à côté de l'en-tête rouge de la sidebar. Les deux rouges sont désormais la **même** valeur ; si le raccord devient une tache uniforme là où Nathan lisait deux zones, le signaler — c'est un arbitrage de rendu, pas une correction à faire d'office.

### Intelligence de la story précédente (10.5, `d757f31`)

- **Première story de l'epic sans aucun défaut à la passe navigateur** (10.3 : six passes de rendu, 10.4 : cinq, 10.5 : trois). Ce qui a changé : la story portait des mesures chiffrées **avant** l'implémentation, et les décisions de Nathan étaient prises à la création. Même méthode ici — la table de contraste est déjà calculée.
- **DT6 a été clos par une mécanique CSS que les tests ne pouvaient pas prouver** (`min-w-0` + `truncate` + `shrink-0`) : il a fallu le navigateur, et le remesurer **trois fois** quand la taille de police puis le fond ont changé. Même leçon ici pour la garde `reduced-motion` : le cas de test verrouille le texte de la règle, le navigateur seul dit si le voile a disparu.
- **`git diff --stat src/stores/` vide comme preuve de non-régression** : le dispositif a bien fonctionné en 10.4 et 10.5, reconduit ici (AC8).
- **Les annotations de documents ont été faites en Task dédiée, en fin de story** (Task 7 en 10.5, Task 6 ici) : c'est ce qui a permis d'y écrire les écarts réellement constatés plutôt que ceux prévus.

### Ce que cette story NE fait pas

- **Aucune refonte visuelle.** Les cinq écrans sont figés ; les seules retouches admises sont les trois corrections de contraste et ce qu'une mesure de la Task 7 imposerait « en une retouche ».
- **Aucun ARIA au-delà des rôles de dialogue** (note de périmètre d'`epics.md`), aucune navigation clavier, aucun piège à focus.
- **Le `focus-visible` sans chemin clavier** (dette de la revue 1.4, `main.css:259`) **reste tel quel**.
- **Aucune passe portrait** (voir Cadrage), aucune variante `portrait:`.
- **Aucun design system de couleurs** : demandé par Nathan le 2026-09-14, explicitement **hors Epic 10**.
- **`FERMER L'APPLICATION` reste inerte** (AR26/UX-DR32 reportés hors epic) : ne pas lui écrire de pop-up au prétexte qu'on passe sur les pop-ups.

### Project Structure Notes

Aucun fichier créé, aucun supprimé. Fichiers touchés, tous existants :

```
1score/src/assets/main.css                      ← garde reduced-motion, --color-victory-ribbon
1score/src/components/PromptModal.vue           ← role/aria-modal/aria-labelledby + useId()
1score/src/components/NumericPadDock.vue        ← role/aria-modal/aria-label
1score/src/components/AlphaKeyboardSheet.vue    ← role/aria-modal/aria-label
1score/src/components/ScoreEntryDock.vue        ← role/aria-modal/aria-label + barre de rebours
1score/src/components/PlayerSetupCard.vue       ← opacity-55 → opacity-60
1score/src/components/ModeTile.vue              ← tile-tagline : text-white/80 → text-white (prop gardée)
   + les .test.ts co-localisés correspondants   ← un cas ajouté chacun
1score/CLAUDE.md                                ← AC7
_bmad-output/planning-artifacts/{epics,architecture,ux-design-specification}.md
_bmad-output/implementation-artifacts/deferred-work.md
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.7] — AC d'origine (⚠️ « trois pop-ups » et l'AC portrait sont caducs)
- [Source: _bmad-output/planning-artifacts/epics.md#UX-DR55] — sémantique de dialogue et garde `reduced-motion`
- [Source: _bmad-output/planning-artifacts/epics.md#UX-DR56] — contraste AA et règles conservées
- [Source: _bmad-output/planning-artifacts/epics.md#DT3] — dette reprise, exception du voile à consigner dans `CLAUDE.md`
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.6] — règles conservées, écart `#E6B000` / `#E6CA00`
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#3e passe de rendu de la story 10.5] — dette du ruban de victoire, close par la décision 2
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#4e passe de rendu de la story 10.4] — `npm run build` à consigner dans `CLAUDE.md` §9
- [Source: 1score/CLAUDE.md#2] — Pointer Events, à amender de l'exception du voile
- [Source: 1score/CLAUDE.md#9] — stratégie de validation, à amender

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`) — bmad-dev-story, 2026-09-14.

### Debug Log References

- `npx vitest run` — **684 tests verts**, 24 fichiers (664 à l'arrivée, +20 cas).
- `npm run build` (= `vue-tsc -b && vite build`) — vert. Commande de référence, pas `--noEmit` (dette de la 10.4, désormais inscrite dans `CLAUDE.md` §9).
- `git diff --stat src/stores/` — **vide**, preuve de non-régression (AC8).
- Passe navigateur : Chrome « Browser 1 (macOS) », `npm run dev` sur `:5174`, harnais `_viewport-harness.html` (supprimé en fin de passe), trois formats paysage.

### Completion Notes List

**Task 1 — Sémantique de dialogue (AC1, AC2).** Les quatre racines de pop-up portent `role="dialog"` + `aria-modal="true"`. `PromptModal` se nomme par `aria-labelledby` vers l'`id` de son `<h2>`, produit par `useId()` ; les trois autres par un `aria-label` statique (`Réglage de la distance`, `Saisie du nom`, `Saisie du score`). Aucun piège à focus, `tabindex`, `Escape` ni `inert` — arbitrage « borne fixe » inchangé. Aucun voile ne prend `role="button"`. **9 cas ajoutés**, aucun cas existant réécrit.

⚠️ **Le test d'unicité d'`id` a d'abord été écrit faux** : deux `mount()` séparés créent deux applications, et `useId()` compte **par application** — les deux rendaient `v-0` et le cas ne prouvait rien. Corrigé en montant les deux instances dans **une seule** application (`h()`, le compilateur d'exécution n'étant pas embarqué). **Confirmé au navigateur** : quand deux `PromptModal` coexistent réellement (fin de partie + `TERMINER LA PARTIE ?`), les `id` valent `v-0` et `v-1`, chacun résolvant vers un titre unique.

**Task 2 — Garde `prefers-reduced-motion` (AC3).** Bloc global dans `main.css`, après les règles globales. Coupe `animate-input-reject` (`animation: none`) et `animate-input-flash` (`animation: none` **+ `opacity: 0`**). N'écrit rien pour `animate-input-countdown` ni pour les transitions de `ShotClock` ; aucune garde attrape-tout. **5 cas** dans un fichier neuf, `src/assets/main.css.test.ts`.

⚠️ **Piège d'outillage rencontré, absent des Dev Notes** : `import source from './main.css?raw'` rend **une chaîne vide**. Vitest remplace par défaut tout import CSS par `''`, **`?raw` compris** — le motif employé partout ailleurs pour lire une source (`.vue?raw`) ne marche pas sur un `.css`. Le premier jet du test passait donc en ne vérifiant **rien**, et son échec initial venait de la chaîne vide, pas de l'absence de la règle. Corrigé par `test.css: { include: [/main\.css/] }` dans `vitest.config.ts`, puis le test a été **vérifié par mutation** (retirer `opacity: 0` → 1 échec ; ajouter `animate-input-countdown` à la garde → 1 échec).

**Task 3 — Mesure du contraste (AC4).** Table entière recalculée avec la formule WCAG 2.x (translucides **composés** sur leur fond réel). La table des Dev Notes est confirmée sur tous les verdicts, à trois nuances près :
- **`PlayerSetupCard` placeholders : 4,20:1 et non 4,43:1** sur la carte jaune — ils sont posés sur la **box du champ** (`bg-black/8`), pas sur la carte nue. L'échec est donc **pire** que prévu ; la correction prescrite tient quand même.
- `GameSummary` libellés `text-white/50` : **5,05:1** mesuré (4,65 annoncé) — ✅ dans les deux cas.
- `REP`/`VS` : les deux lignes de la table étaient interverties (`VS` = 7,18:1 sur le fond médian, `REP` = 6,62:1 sur `--color-surface`) — ✅ dans les deux cas.

**Couple renvoyé par le code et oublié à la livraison, consigné à la revue de fin d'Epic 10 (2026-09-15)** : la zone de série de `PlayerPanel` en `text-brand-red` (`#D0343F`) sur les cartes — **4,95:1** sur `--color-player-white`, **3,75:1** sur `--color-player-yellow` `#FFE000` — conforme au seuil 3:1 du grand texte (`clamp(24px,10cqw,64px)` en `font-black`), sous 4,5:1 sur le jaune : ne pas réduire cette taille sans revoir la teinte.

**Couples hors table, mesurés au titre de la décision 4**, tous conformes : libellé de bille `opacity-75` (9,68 / 8,24:1), intitulés `opacity-65` sur box de champ (6,55 / 5,85:1), `−`/`+` de `PlayerPanel` `opacity-60` sur `bg-black/8` (5,44 / 4,98:1, seuil 3:1 car `text-3xl`), `MOY`/`SÉRIE` sur les bandeaux réels `#ECECEC` / `#E6CA00` (5,49 / 4,87:1). Les `disabled:opacity-30` (`CenterPanel`, `IconAction`) et les `BIENTÔT` à `opacity-45` sont **exclus** (WCAG §1.4.3, commandes inactives).

**Task 4 — Corrections (AC5).**

| Correction | Avant | Après | Seuil |
|---|---|---|---|
| `--color-victory-ribbon` `#E63946` → **`#D0343F`** (blanc dessus) | 4,17:1 ❌ | **4,95:1** ✅ | 4,5 |
| `ScoreEntryDock` barre de rebours `bg-white/70` → **`bg-white`** | 2,45:1 ❌ | **3,46:1** ✅ | 3 (WCAG 1.4.11) |
| `PlayerSetupCard` placeholders `opacity-55` → **`opacity-60`** (carte jaune) | 4,20:1 ❌ | **4,98:1** ✅ | 4,5 |
| *idem, carte blanche* | 4,54:1 ✅ | **5,44:1** ✅ | 4,5 |
| `ModeTile` accroche `text-white/80` → **`text-white`** | 2,78:1 ❌ | **3,46:1** ⚠️ | 4,5 |

Le noir sur le ruban assombri tombe à **4,24:1** : le blanc devient le **plus** contrasté des deux, et comme il passe le seuil du texte courant, la marge **ne dépend plus de la taille** des valeurs. Le commentaire de `main.css` a été réécrit en conséquence. Dette du ruban **close** dans `deferred-work.md`. Les deux tokens rouges valent la même couleur et **restent deux tokens**, verrouillé par un cas.

⚠️ **L'accroche de `ModeTile` reste sous son seuil** (3,46 < 4,5 pour un `text-stat`) : c'est le seul écart connu non résolu. **Aucune tuile ne l'affiche** (décision de Nathan en 10.1, verrouillée par `HomeScreen.test.ts`) et la prop est gardée au contrat ; consigné dans `deferred-work.md` avec la consigne « rouvrir les accroches oblige à en remonter la taille ».

**Deux cas existants ont dû suivre la valeur corrigée** (`PlayerSetupCard.test.ts`, `HomeScreen.test.ts` : `opacity-55` → `opacity-60`). Ce n'est pas une réécriture de comportement au sens de l'AC8 — même assertion, même intention, valeur mise à jour.

**Task 5 — `CLAUDE.md` (AC7).** §2 porte l'exception du voile en nommant les quatre composants ; §9 pose `npm run build` comme commande de référence, avec la raison (narrowing). Trois sections neuves : **§10** composants et conventions de l'Epic 10 (`SideBar` nourrie par l'écran, `ModeTile`, `IconAction`, `PictoIcon`, les trois hôtes de saisie et le buffer dans l'écran, le patron unique des pop-ups, les tokens de conteneur), **§11** animations et `prefers-reduced-motion` (dont le piège `forwards`), **§12** pièges de gabarit (commentaire à la racine, classes à la volée, `scrollWidth` sous `overflow-hidden`). Vérifié et non supposé : `CLAUDE.md` ne portait **aucune** mention de `PlayerSetupModal`, `ScoreEntryModal` ni `ÉCHANGER`.

**Task 6 — Annotations (AC4, AC5).** `epics.md` : les quatre décisions, « trois pop-ups » → **quatre**, AC portrait **caduc**, DT3 **clos**, UX-DR55/UX-DR56 annotés, note de la 3e passe de la 10.5 tranchée. `ux-design-specification.md` §10.6 : `#E6CA00` figé avec son ratio, fond réel des libellés de picto corrigé, mention « 85 % » marquée caduque. `architecture.md` : entrée « Livré en Story 10.7 » avec le *pourquoi* des deux animations épargnées. `deferred-work.md` : dette du ruban close + cinq entrées neuves.

**Task 7 — Passe navigateur (AC3, AC6).** Cinq écrans × quatre pop-ups × trois formats paysage (1133×744, 1194×834, 1920×1080), parcours complet JDS **et** 3 Bandes. **Aucun débordement horizontal, aucun libellé coupé, aucune commande de jeu sous 90×90 px.** Les quatre pop-ups ont été vues en conditions réelles avec leurs attributs corrects — `DISTANCE MANQUANTE`, `PARTIE EN COURS`, `TERMINER LA PARTIE ?` et la fin de partie pour `PromptModal`.

**La garde `reduced-motion` a été vérifiée sur la règle RÉELLEMENT LIVRÉE**, et non sur une règle équivalente réécrite : la `CSSMediaRule` a été retrouvée dans la feuille de styles compilée et sa **condition** basculée à `all`, les déclarations testées restant celles qui partent en production.

- **(a) Voile de flash — le piège central, confirmé** : garde livrée → `opacity: 0`, animation `none`, élément **présent** et invisible. **Contrôle décisif** : en retirant la seule déclaration `opacity` de la règle vivante (ne laissant que `animation: none`, ce qu'aurait écrit une garde naïve), l'opacité calculée remonte à **`1`** — le voile noir serait bien resté peint en permanence sur la valeur de série. Le piège était réel et la garde le neutralise.
- **(b) Pulsation de plafond** : au 4e chiffre, la classe `animate-input-reject` est bien posée (`data-reject="1"`, le refus est enregistré) mais `animation-name: none` — elle ne joue pas.
- **(c) Chrono** : `transition-property: stroke-dashoffset, stroke` à `1s` **conservée**, décompte 37 → 35 → 34, `stroke-dashoffset` et teinte qui évoluent.
- **(d) Barre de rebours** : `animation-name: input-countdown`, `3s`, `background: rgb(255,255,255)` — joue toujours, en blanc plein.

**Un écart relevé, consigné et non corrigé** (AC6 l'autorise explicitement) : les touches du clavier alphabétique mesurent **47×57 px à 1133**, **51×57 à 1194**, **65×57 à 1920** — la **largeur** est sous le plancher de 57 px sur les deux formats iPad. Antérieur à cette story (clavier de la 10.3). Ce n'est pas « une retouche » : la largeur d'une touche est la largeur de la pop-up divisée par 10 colonnes, et cette largeur vient de `--game-popup-inset-*`, c'est-à-dire de la décision de rendu du 2026-09-12 (la pop-up se loge du côté opposé à la carte visée, **qui doit rester visible**). Élargir les touches ferait passer la pop-up sur la carte. Détaillé dans `deferred-work.md` avec ses trois pistes.

**Points de rendu laissés à Nathan** (arbitrages, pas des défauts) :
- **Les deux rouges sont désormais la même valeur** et se côtoient au récap. Ils ne se touchent pas (l'en-tête de sidebar est dans l'angle, la colonne victorieuse commence plus bas) et le raccord ne fait pas tache — mais c'est à voir.
- Le ruban assombri change légèrement la tonalité du récap : le rouge est plus sourd qu'en `#E63946`.

### File List

- `1score/src/assets/main.css` — garde `prefers-reduced-motion`, `--color-victory-ribbon` `#E63946` → `#D0343F`, commentaire de `--color-on-victory-ribbon` réécrit
- `1score/src/assets/main.css.test.ts` — **nouveau**, 5 cas (garde + contraste)
- `1score/src/components/PromptModal.vue` — `role`/`aria-modal`/`aria-labelledby`, `useId()`
- `1score/src/components/PromptModal.test.ts` — 3 cas ajoutés
- `1score/src/components/NumericPadDock.vue` — `role`/`aria-modal`/`aria-label`
- `1score/src/components/NumericPadDock.test.ts` — 2 cas ajoutés
- `1score/src/components/AlphaKeyboardSheet.vue` — `role`/`aria-modal`/`aria-label`
- `1score/src/components/AlphaKeyboardSheet.test.ts` — 2 cas ajoutés
- `1score/src/components/ScoreEntryDock.vue` — `role`/`aria-modal`/`aria-label`, barre de rebours `bg-white/70` → `bg-white`
- `1score/src/components/ScoreEntryDock.test.ts` — 3 cas ajoutés
- `1score/src/components/PlayerSetupCard.vue` — placeholders `opacity-55` → `opacity-60`
- `1score/src/components/PlayerSetupCard.test.ts` — 1 cas ajouté, 3 assertions suivies
- `1score/src/components/ModeTile.vue` — accroche `text-white/80` → `text-white`
- `1score/src/components/ModeTile.test.ts` — 1 cas ajouté
- `1score/src/components/HomeScreen.test.ts` — 2 assertions suivies (`opacity-55` → `opacity-60`)
- `1score/vitest.config.ts` — `test.css: { include: [/main\.css/] }`
- `1score/CLAUDE.md` — §2 (exception du voile), §9 (`npm run build`), §10/§11/§12 neuves
- `_bmad-output/planning-artifacts/epics.md` — décisions, corrections d'AC, DT3 clos
- `_bmad-output/planning-artifacts/ux-design-specification.md` — §10.6 et table des tokens
- `_bmad-output/planning-artifacts/architecture.md` — entrée « Livré en Story 10.7 »
- `_bmad-output/implementation-artifacts/deferred-work.md` — dette du ruban close, 6 entrées neuves
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — statut de la story

### Change Log

| Date | Version | Description |
|---|---|---|
| 2026-09-14 | 1.0 | Story 10.7 livrée : sémantique de dialogue sur les quatre pop-ups (`useId()`, exception du voile consignée dans `CLAUDE.md` §2, DT3 close), garde `prefers-reduced-motion` ciblée (flash + refus coupés par `animation: none` **et** `opacity: 0` ; chrono et rebours conservés), passe contraste AA élargie à tous les translucides — trois échecs corrigés (ruban `#D0343F`, rebours `bg-white`, placeholders `opacity-60`), un consigné (accroche de `ModeTile`, chemin non affiché). `CLAUDE.md` gagne §10/§11/§12. 684 tests verts, `npm run build` vert, `src/stores/` intact. Passe navigateur aux trois formats paysage, garde vérifiée sur la règle réellement livrée : un écart relevé et consigné (largeur des touches alpha sur les formats iPad). |
