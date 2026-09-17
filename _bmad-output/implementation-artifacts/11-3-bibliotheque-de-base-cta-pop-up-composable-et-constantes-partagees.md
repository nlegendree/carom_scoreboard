# Story 11.3: Bibliothèque de base — CTA et carte de pop-up communs, `useBackdropClose`, constantes partagées, insets rapatriés

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a agent qui ajoute l'écran d'identification joueur (Epic 4),
I want poser un CTA, une pop-up ou une touche en consommant un composant de base existant, sans recopier une chaîne de classes ni un mécanisme,
so that l'écran se construit sans créer un composant de strate 3 ni ajouter un token — le critère de sortie de l'epic.

> **Cadrage (bmad-create-story, 2026-09-16).** Troisième story de code de l'Epic 11, et celle que le **critère de sortie** mesure : la 11.1 a donné l'échelle, la 11.2 la palette, la 11.3 donne les **briques**. C'est une story de **refactor** : à l'arrivée, l'app rend **exactement** la même chose ; le juge n'est pas une capture validée, c'est une **comparaison avant/après, pixel pour pixel, aux trois formats**, sur les 5 écrans et les 4 pop-ups.
>
> **Deux natures de travail, dans cet ordre — décision de Nathan (2026-09-16).** D'abord le refactor (Tasks 1 à 8), prouvé identique à l'avant. **Puis une passe de rendu** (Task 9) sur l'observation Billiboard reportée par la 11.2 : cartes joueur légèrement arrondies, séparées par une marge, barre basse « mieux découpée ». Les deux ne se mélangent pas : la ligne de base du pixel-pour-pixel est prise **avant** la première ligne de refactor, et la découpe se propose **après** que le refactor est vert. Si la découpe n'est pas tranchée dans cette story, elle repart en `deferred-work.md` sans bloquer la livraison du refactor.
>
> **Nature des références visuelles.** Pour le refactor : **aucune** — la référence est le rendu livré par la 11.2 (marine Cueuny deux niveaux, verre des pop-ups, bleu roi, Saira), et tout écart est un bug. Pour la passe de découpe (Task 8) : `explore/resources/billiboard_scoreboard.JPG`, `billiboard_scoreboard_2.JPG`, `billiboard_player*.png` — ce sont des **PHOTOS**, donc **intention seule, géométrie à décider au rendu** (`integration-bmad-impeccable.md` §5). ⚠️ **Combinaison inédite à annoncer** : la découpe contredit frontalement la décision « conteneurs à angles vifs, aucun `rounded-*` » de `DESIGN.md` › Shapes, tranchée par Nathan cinq jours plus tôt. Ce n'est donc pas une application, c'est une **exception à arbitrer sur le rendu**, et `DESIGN.md` doit changer avant le code si elle est retenue.
>
> **Ce que l'audit a mesuré et qui reste ouvert ici** (`design-system-audit-2026-09-15.md` §4) : P2 « mécanismes et constantes dupliqués », P2 « retour d'appui divergent sur le CTA neutre », P2 « quatre tokens qui sont des positions », P3 « redondances de classes ». Recensement refait à la création de la fiche (commit `35e55b2`, arbre propre, **844 tests verts, 26 fichiers de test**) : voir Dev Notes › État du code à l'arrivée. Trois écarts au texte de l'AC d'`epics.md` y sont relevés et tranchés — ils sont signalés en clair dans les AC, pas enfouis.

## Acceptance Criteria

**AC1 — `useBackdropClose`, un seul mécanisme**
**Given** les quatre pop-ups (`PromptModal`, `ScoreEntryDock`, `NumericPadDock`, `AlphaKeyboardSheet`)
**When** la story est livrée
**Then** `armBackdropClose` / `disarmBackdropClose` / `closeFromBackdrop` **n'existent plus qu'une fois**, dans `src/composables/useBackdropClose.ts`, **testé seul** (`useBackdropClose.test.ts`) : geste complet exigé (appui **et** relâchement du **même** `pointerId`), `pointercancel` qui désarme, garde `enabled` qui rend le voile inerte, un `pointerup` sans `pointerdown` préalable sans effet, un second pointeur qui ne ferme pas ce que le premier a armé
**And** les quatre pop-ups le consomment **à travers `PopupCard`** (AC3), qui en est l'unique consommateur direct — lecture assumée de l'AC d'`epics.md` (« les quatre pop-ups le consomment ») : un mécanisme partagé par un composant partagé vaut mieux que quatre appels recopiés
**And** la **règle du voile** (`CLAUDE.md` §10) est **inchangée au comportement** : `PromptModal` continue de la dériver du libellé de son secondaire (`CANCEL_LABELS`), aucune pop-up ne gagne ni ne perd la fermeture au tap dehors, les pop-ups de fin de partie gardent leur voile inerte

**AC2 — `CtaButton`, un seul gabarit de CTA, un retour d'appui par variante**
**Given** un composant de base **CTA** (strate 3 : aucun `useGameStore`, aucune règle de score, aucun `import` de `../stores`)
**When** on cherche une chaîne de classes de CTA dans les gabarits
**Then** **aucune n'est recopiée** : `PromptModal` (accent, neutre, choix), les trois hôtes de saisie (`ANNULER` / `VALIDER`), `HomeScreen` (deux réglages, `DÉMARRER`), `ActionBar` (CTA de barre) et `CenterPanel` (`PASSER LE TOUR`) consomment tous `CtaButton`
**And** le composant porte **six** variantes — `accent`, `neutral`, `setup`, `start`, `bar`, `pass` — et non les cinq de l'AC d'`epics.md` : **`PASSER LE TOUR` est une famille à part dans `DESIGN.md` › Components › Buttons** (picto au-dessus du libellé, rôle `stat`, `disabled`), l'absorber dans `accent` demanderait trois dérogations ; l'écart est consigné dans `DESIGN.md` et dans `epics.md`
**And** le **CTA neutre a un seul retour d'appui**, celui que `DESIGN.md` nomme (`brightness(1.25)`) : `PromptModal` le portait, les trois hôtes de saisie portaient `brightness(0.9)` — c'est le **seul changement visuel volontaire** du refactor, et il ne touche que l'**état enfoncé**, jamais l'état au repos (la comparaison pixel pour pixel d'AC7 se fait au repos, la différence se vérifie au doigt à la passe navigateur)
**And** un test de source verrouille la règle : aucun gabarit ne contient une chaîne portant à la fois `min-h-[var(--size-touch-target)]` (ou sa forme courte) et `bg-(image:--gradient-…)` hors de `CtaButton.vue`

**AC3 — `PopupCard`, un seul patron de pop-up, contrats écrits**
**Given** une **carte de pop-up** commune (strate 3)
**When** la story est livrée
**Then** `PopupCard.vue` porte le patron des quatre pop-ups : voile plein écran `fixed inset-0 z-50 bg-black/25`, `role="dialog"`, `aria-modal="true"`, nom accessible (`aria-labelledby` via `useId()` **ou** `aria-label` statique selon ce que l'appelant fournit), carte en verre (`rounded-popup border border-border bg-bg-raised/88 p-3 shadow-popup backdrop-blur-sm`), `@pointerdown.stop @pointerup.stop` sur la carte, fermeture au voile par `useBackdropClose`, et un **pied de CTA** (`footer`, `gap-2`) en slot
**And** **aucun `role="button"` sur le voile** (exception de `CLAUDE.md` §2, conservée telle quelle) et **rien d'autre en ARIA** : pas de piège à focus, pas de `tabindex`, pas d'écoute d'`Escape` (arbitrage « borne fixe »)
**And** `DESIGN.md` › Components documente le **contrat** de `CtaButton`, `PopupCard` et `useBackdropClose` — props, variantes, états, tokens consommés, slots — produit par `/impeccable extract` ; `.impeccable/design.json` › `components` le reflète (snippets à jour des six variantes)

**AC4 — Insets rapatriés, placement transmis par l'hôte, rendu identique au pixel**
**Given** `--setup-popup-inset-left/right` et `--game-popup-inset-left/right`
**When** la story est livrée
**Then** les **quatre variables ont disparu de `main.css`** et aucun gabarit ne les nomme
**And** la pop-up de saisie se place dans la zone libre **transmise par son hôte** : `PopupCard` reçoit `align: TableSide` (le côté où elle se pose) et `reserve: string` (la bande à réserver du côté opposé, en unités de grille), et pose son padding en style en ligne ; `HomeScreen` et `GameView` déclarent **chacun** la géométrie de **leur** écran, à côté de la mise en page qu'elle décrit — plus aucune position dans le namespace des tokens (`integration-bmad-impeccable.md` §6, strate 1 : « un token décrit une intention, jamais une position »)
**And** le rendu des trois pop-ups de saisie aux trois formats est **identique au pixel** à la ligne de base prise avant refactor (AC7)
**And** `ALIGN_CLASSES` **disparaît** au lieu de rejoindre un module partagé (écart assumé au texte de l'AC d'`epics.md`) : il n'existait que pour lire ces quatre variables, et `PopupCard` le remplace
**And** la **largeur des touches alpha est re-mesurée** aux trois formats ; l'écart au plancher UX-DR8 (57 px) est consigné avec la décision de Nathan, prise au rendu sur les trois leviers chiffrés de Dev Notes › Touches alpha

**AC5 — Constantes partagées**
**Given** `BALL_PICTOS` (`GameSummary.vue:56`, `PlayerSetupCard.vue:41`), `BALL_LABELS` (`PlayerSetupCard.vue:45`) et `BALL_CLASSES` (`PromptModal.vue:74`)
**When** la story est livrée
**Then** les trois vivent dans **un seul module** `src/components/ballAssets.ts` (même emplacement et même patron que `keyClasses.ts`), clés par `PlayerColor` ; `GameSummary` traduit son `PlayerId` en `PlayerColor` à l'appel (`player1` = bille blanche, règle déjà écrite dans son commentaire), sans dupliquer la table
**And** les chemins des pictos restent servis depuis `public/` (`FR45`, `NFR13` : aucune ressource réseau) et les classes restent **écrites en toutes lettres** (scanner JIT de Tailwind, `CLAUDE.md` §12)

**AC6 — Redondances et documents**
**Given** `main.css`, les gabarits et `CLAUDE.md`
**When** la story est livrée
**Then** `touch-manipulation select-none` n'est plus répété sur un `<button>` : la règle globale de `main.css` (`button, [role="button"] { touch-action: manipulation; user-select: none }`) suffit. ⚠️ **Une occurrence reste, et doit rester** : la racine `<div>` de `PlayerPanel.vue:183`, qui n'est ni `<button>` ni `role="button"` depuis la 10.4 — `PlayerPanel.test.ts:375-380` dit pourquoi (sans elle, un appui long sur le score sélectionne le texte). Le balayage est donc de **17 occurrences sur 18**
**And** `min-width: 320px` est retiré de `html, body, #app` (héritage du gabarit Vite, sans objet en paysage ≥ 1133)
**And** `CLAUDE.md` §8 est **réécrit** : plus de « trois breakpoints mobile-first », mais « pas de breakpoint d'écran — container queries sur les cartes, grille fluide et `clamp()` pour l'échelle » ; il cite `--breakpoint-lg: initial` comme la garde qui empêche Tailwind v4 de ressusciter `lg` à 1024 px (donc sur l'iPad), et l'ordre des classes Tailwind y reste
**And** les deux `clip-path` du bandeau de récap passent des **32 px fixes** aux unités de grille (`calc(100% - var(--spacing) * 4)` et son symétrique) — report de la revue 11.1 explicitement adressé à cette story : la coupe en biais, signature du design system, s'aplatissait sur le grand écran ; le résultat se regarde à 1920 (c'est le seul endroit où AC7 attend une différence, et elle doit être **visible et voulue**)

**AC7 — Preuve du refactor : avant/après, pixel pour pixel**
**Given** une **ligne de base** de captures produite par le harnais `1score/scripts/render-static.cjs` **avant la première ligne de code** (12 écrans × 3 formats : 1920×1080, 1180×733, 1133×744)
**When** le refactor est livré et le harnais rejoué dans les mêmes conditions
**Then** la comparaison est **identique au pixel** sur les cinq écrans et les quatre pop-ups, hors les deux différences attendues et nommées : le biais du bandeau de récap à 1920 (AC6) et, s'il bouge, le placement des pop-ups qui doit au contraire être **identique** — toute autre différence est un bug du refactor, pas un choix
**And** `npx impeccable detect` (URL rendue aux trois formats **et** `src`) : zéro constat, comme à l'arrivée
**And** passe navigateur manuelle : les quatre pop-ups s'ouvrent, se ferment au CTA **et** au tap dehors là où c'était le cas, les pop-ups de fin gardent leur voile inerte, l'auto-validation à 3 s marche, le retour d'appui de chaque variante de CTA se voit
**And** `npm test` et `npm run build` verts ; `git diff --stat -- 1score/src/stores` **vide** (`useGameStore.test.ts` sans retouche en est la preuve)

**AC8 — Passe de rendu : la découpe Billiboard (après le refactor, pas avant)**
**Given** le refactor livré et vert (AC7), et l'observation de Nathan du 2026-09-16 (photo Billiboard : cartes joueur et barre `+1` légèrement arrondies, séparées par une marge sombre, « il faudrait mieux découper cette barre »)
**When** un gabarit statique présente **au plus deux propositions**, côte à côte aux trois formats, produites **par surcharges CSS injectées** (`--override` du harnais) et **sans toucher au code**
**Then** Nathan tranche sur le rendu ; s'il retient une découpe, `DESIGN.md` › Shapes est réécrit **d'abord** (l'exception à « conteneurs à angles vifs » est nommée et bornée : quels conteneurs, quel rayon, quelle marge, quel token), puis `main.css` et les gabarits l'appliquent, puis les tests
**And** s'il n'est pas convaincu, la story se clôt **sans** la découpe et l'entrée reste dans `deferred-work.md` — le refactor ne dépend pas d'elle

**AC9 — Clôture**
**Given** la story livrée
**When** `/impeccable polish` est passé sur les fichiers touchés
**Then** `DESIGN.md` porte les contrats des trois briques et, le cas échéant, la découpe ; `epics.md` › Story 11.3 est annotée des décisions et des trois écarts assumés ; `deferred-work.md` reçoit les reports ; `sprint-status.yaml` passe à `review`
**And** le **critère de sortie de l'epic** est instruit : la fiche liste, nommément, ce qu'un écran neuf (identification joueur, Epic 4) peut désormais poser **sans créer un composant de strate 3 ni ajouter un token** — et ce qui lui manquerait encore, s'il manque quelque chose

## Tasks / Subtasks

- [x] **Task 1 — Ligne de base, avant toute modification** (AC7)
  - [x] Arbre propre sur `35e55b2` ; `npm test` (844 attendus) et `npm run build` verts, notés dans Dev Agent Record
  - [x] `npm run dev` depuis `1score/`, puis `node scripts/render-static.cjs <scratchpad>/baseline 1920x1080 1180x733 1133x744` — ajuster `--url` au port affiché ; conserver `audit.json` (tailles par rôle, débordements, cibles < 90 px, **largeur des touches alpha**)
  - [x] Noter dans la fiche les trois « débordements » connus et attendus (ellipse volontaire de `JEAN PIERRE` ×2, voile de flash absolu sur la valeur de série) : ce sont eux, et seulement eux, qui doivent se retrouver à l'arrivée
- [x] **Task 2 — `useBackdropClose`** (AC1)
  - [x] `src/composables/useBackdropClose.ts` — named export (`CLAUDE.md` §1), patron de `useHaptics` ; signature dans Dev Notes › Contrats
  - [x] `useBackdropClose.test.ts` co-localisé (AR16), cas listés dans Dev Notes › Tests
  - [x] **Ne pas encore débrancher les quatre pop-ups** : elles passeront par `PopupCard` à la Task 4
- [x] **Task 3 — `CtaButton`** (AC2)
  - [x] `src/components/CtaButton.vue` + `CtaButton.test.ts` — six variantes, table de classes littérales (Dev Notes › Contrats), `type="button"`, `@pointerdown` remonté tel quel, `disabled` passé, slot par défaut pour le contenu
  - [x] Câbler les consommateurs un par un, en lançant les tests du fichier touché à chaque fois : `PromptModal` (3 usages) → `NumericPadDock` (2) → `ScoreEntryDock` (2, dont `VALIDER` et sa barre de rebours en slot) → `AlphaKeyboardSheet` (2) → `HomeScreen` (3) → `ActionBar` (1) → `CenterPanel` (1)
  - [x] Unifier le retour d'appui du neutre sur `brightness(1.25)` et mettre `DESIGN.md` › Elevation › Retours d'appui en cohérence si sa formulation bouge
  - [x] Mettre à jour les assertions de classes des tests existants (liste dans Dev Notes › Tests) — **même assertion, nouvelle cible** : ce qui se lisait sur le `<button>` se lit sur le composant rendu
- [x] **Task 4 — `PopupCard`** (AC1, AC3, AC4)
  - [x] `src/components/PopupCard.vue` + `PopupCard.test.ts` — voile, dialogue, carte, pied en slot, `useBackdropClose`, props `align` / `reserve` (Dev Notes › Contrats)
  - [x] `PromptModal` : garde `CANCEL_LABELS`, `closesOnBackdrop`, son titre visible et `useId()`, la variante liste, la bille — et délègue voile + carte + fermeture à `PopupCard`
  - [x] Les trois hôtes de saisie : gardent **toutes** leurs règles (plafonds, `pristine`, timer d'auto-validation, haptique, `rejectKey`, `countdownKey`) et ne gardent **rien** du voile ni de la carte
  - [x] Vérifier que `data-testid` des racines et des cartes est **inchangé** (`prompt-modal`/`prompt-card`, `score-entry-dock`/`score-entry-card`, `numeric-pad-dock`/`dock-card`, `alpha-keyboard-sheet`/`sheet-card`) : des dizaines de cas de `GameView.test.ts` et `HomeScreen.test.ts` les lisent
- [x] **Task 5 — Insets rapatriés** (AC4)
  - [x] Retirer les quatre `--*-popup-inset-*` de `main.css` **et leur bloc de commentaire**
  - [x] `HomeScreen` : constante de géométrie du paramétrage, déclarée à côté du markup à trois colonnes qu'elle décrit ; `GameView` : celle du scoreboard (valeurs dans Dev Notes › Insets, à recopier au caractère près)
  - [x] Passer `align` + `reserve` aux trois hôtes ; supprimer les deux `ALIGN_CLASSES`
  - [x] Mettre à jour les assertions d'inset (`ScoreEntryDock.test.ts:298-301`, `NumericPadDock.test.ts:181-182`, `AlphaKeyboardSheet.test.ts:171-172`) : elles lisent désormais le style en ligne, et vérifient toujours l'**asymétrie** (côté visé réservé, côté libre à la gouttière)
  - [x] `CLAUDE.md` §10 : la phrase « les `--*-popup-inset-*` … la passe design system (Story 11.3) les rapatrie dans l'hôte » devient le constat de ce qui a été fait
- [x] **Task 6 — Constantes partagées** (AC5)
  - [x] `src/components/ballAssets.ts` (+ test de source si un cas le justifie) ; câbler `PlayerSetupCard`, `GameSummary`, `PromptModal`
- [x] **Task 7 — Redondances et documents** (AC6)
  - [x] Balayage `touch-manipulation select-none` : 17 retraits, **1 conservation** (`PlayerPanel.vue:183`) — vérifier que chaque élément touché est bien un `<button>` (inventaire dans Dev Notes) ; `IconAction.test.ts:69-70` perd son assertion, `PlayerPanel.test.ts:375-380` la garde **et** gagne un commentaire qui dit pourquoi elle est la dernière
  - [x] `min-width: 320px` retiré de `main.css`
  - [x] `CLAUDE.md` §8 réécrit (AC6) ; relire §7 et §10 pour qu'aucune phrase ne cite un état d'avant
  - [x] Bandeau de récap : deux `clip-path` en unités de grille (`GameSummary.vue:131,151`) ; regarder le résultat à 1920 **avant** de conclure
- [x] **Task 8 — Vérification du refactor** (AC7)
  - [x] `npm test`, `npm run build`, `git diff --stat -- 1score/src/stores` vide
  - [x] Harnais rejoué dans les mêmes conditions que la Task 1 ; **comparaison fichier par fichier** avec la ligne de base (Dev Notes › Comparaison) ; toute différence hors les deux attendues est un bug à corriger, pas à documenter
  - [x] `impeccable detect` aux trois formats + `src` : zéro constat
  - [x] Passe navigateur manuelle (AC7), pop-ups et retours d'appui compris
- [x] **Task 9 — Passe de rendu : découpe Billiboard** (AC8) — **écartée par Nathan, reportée**
  - [x] Références regardées (`billiboard_scoreboard.JPG`, `billiboard_scoreboard_2.JPG`) : des blocs qui FLOTTENT sur un fond sombre, séparés par une gouttière, chacun à petit rayon — intention seule, ce sont des photos en biais
  - [x] Deux surcharges rendues aux trois formats (B1 découpe complète, B2 découpe sobre) sur les quatre écrans de scoreboard ; page de comparaison A / B1 / B2 ouverte dans Chrome ; arrêt, Nathan a tranché
  - [x] **Écartée** : les deux propositions coupent net le débordement du disque du chrono (`--game-clock-bleed`), sa signature. Le corriger demande du markup (recalculer la géométrie couplée contre la gouttière), pas une surcharge. `DESIGN.md` › Shapes **inchangé** ; entrée écrite dans `deferred-work.md` en story de mise en page dédiée
- [x] **Task 10 — Clôture** (AC3, AC9)
  - [x] Contrats des trois briques extraits des composants livrés → `DESIGN.md` › Components › **Bibliothèque de base (strate 3)** (props, variantes, états, tokens consommés, slots, et le *pourquoi* de chaque borne) ; `.impeccable/design.json` › `components` complété des deux variantes qui manquaient (`button-bar`, `button-pass` — six au total), descriptions rattachées à `CtaButton` / `PopupCard`, biais du bandeau passé en unités de grille
  - [x] Passages de `DESIGN.md` que la story rend faux corrigés : Buttons (six variantes, un gabarit ; le neutre s'éclaircit), Layout › Pop-ups (placement transmis par l'écran, les quatre insets ont disparu), Shapes › Coupes en biais (4 unités et non 32 px), Pop-ups (signature) (le patron est un composant)
  - [x] `epics.md` › Story 11.3 annotée : livraison, preuve du pixel-pour-pixel, trois écarts assumés, deux décisions de Nathan ; `deferred-work.md` : quatre entrées ; `sprint-status.yaml` → `review`
  - [x] Instruction du critère de sortie écrite (voir Dev Agent Record › Critère de sortie de l'epic)

### Review Findings

> **Revue de code du 2026-09-17** (`bmad-code-review`, 3 relecteurs parallèles sur `35e55b2..HEAD`) : Blind Hunter (diff seul, aucun contexte), Edge Case Hunter (diff + dépôt), Acceptance Auditor (diff + fiche + `DESIGN.md` + `CLAUDE.md` + `epics.md`). 35 constats bruts → 20 après fusion des doublons, 4 écartés. **Convergence notable** : les deux premiers relecteurs, indépendamment, ont trouvé le même trio de défauts dans `useBackdropClose` — la brique que l'AC1 déclare « testée seule ».

- [x] [Review][Patch] **`disabled` est offert aux six variantes de `CtaButton`, une seule le rend visible** — `blind+edge`. La prop est partagée par tout `CtaButton` (`CtaButton.vue:27`) mais seul `pass` porte `disabled:opacity-30` (`:56`). Un `<CtaButton variant="accent" :disabled="…">` rend un bouton au dégradé bleu intact, pleine encre, sous aucun retour d'appui (`active:` ne s'applique pas à un `disabled`) et sans `aria-disabled` : l'app paraît en panne. `DESIGN.md` › Buttons **documente le trou** (« `disabled` (30 % d'opacité, variante `pass` seule) ») au lieu de le fermer. L'écran d'identification joueur de l'Epic 4 — celui que le critère de sortie désigne nommément — a un `VALIDER` à griser sur saisie vide. **Décision de Nathan (2026-09-17) : ÉTENDRE l'état inactif aux six variantes**, et réécrire `DESIGN.md` › Buttons pour qu'il dise l'état inactif universel au lieu de documenter le trou. Motif : l'écran d'identification joueur de l'Epic 4 doit pouvoir griser son `VALIDER` **sans rien créer** — c'est le critère de sortie de l'epic.
- [x] [Review][Patch] **Deux captures divergentes écartées comme « bruit », sans contre-essai archivé — REJOUÉ ET TRANCHÉ le 2026-09-17** — `auditor`. Le Dev Agent Record rapporte **quatre** captures divergentes là où AC7 en nomme deux : `05-popup-pave-numerique-1920x1080` (1 px) et surtout `08-popup-saisie-serie-1920x1080` (**15 270 px, 0,74 %**). L'explication (phases de `animate-input-flash` / `animate-input-countdown`) est plausible, mais elle porte sur **l'écran le plus remanié du refactor** — placement passé en style en ligne, et `w-full` ajouté à son `VALIDER` (voir le patch correspondant). Le contre-essai « deux exécutions du même code diffèrent pareillement » n'est pas archivé, aucune capture n'est au dépôt (`git diff --stat` ne contient aucun `.png`), et `impeccable` n'est pas installé sur la machine : **AC7 ne se recontrôle pas**. **Décision de Nathan (2026-09-17) : REJOUER la comparaison avec les animations gelées.** Fait, et **la conclusion de la story était juste — c'est la preuve qui manquait.**

⚠️ `prefers-reduced-motion` ne convenait PAS : la garde du produit **conserve** volontairement le chrono et la barre de rebours (décision de Nathan, Story 10.7), or c'est justement la barre de rebours qui court sous la pop-up de saisie. Le gel se fait donc par surcharge CSS injectée (`1score/scripts/freeze-animations.css`, ajouté au harnais) : chaque animation est ramenée à sa dernière image et y reste.

Protocole, entièrement reproductible :
1. arbre de travail `git worktree` sur `35e55b2` avec `node_modules` en lien symbolique, servi par un `npm run dev` à lui (port 5180) ; `HEAD` sur 5174 — **deux serveurs neufs**, le cache Tailwind d'un serveur de longue vie ne réélaguant pas (piège consigné en `deferred-work.md`) ;
2. le **même** harnais et le **même** binaire (Playwright 1.58 emprunté au cache npx, `chromium-1208` déjà présent) sur les deux côtés ;
3. **deux passes sur le code identique d'abord**, pour mesurer le bruit avant de conclure.

Résultats à 1920×1080, les 12 écrans :
- **bruit = ZÉRO.** Deux passes de `HEAD` sont identiques au pixel sur les 12 écrans. Le harnais est déterministe une fois les animations gelées, donc tout écart restant est réel.
- `05-popup-pave-numerique` : **IDENTIQUE** (le 1 px était du bruit d'animation) ;
- `08-popup-saisie-serie` : **IDENTIQUE** (les 15 270 px / 0,74 % étaient bien la barre de rebours en cours de course — c'est le seul écran où elle tourne) ;
- `11-recap` : **3 693 px (0,178 %)**, zone `895,53 → 1219,217` — le biais du bandeau, la différence DÉCLARÉE VOULUE ;
- les neuf autres : identiques.

Autrement dit **AC7 est tenu au sens strict** : une seule différence, celle qui était annoncée. La comparaison couvre aussi les correctifs de cette revue (dont le retrait du `w-full` d'`accent`), qui sont donc eux aussi prouvés sans effet de rendu. Captures non archivées au dépôt (choix de Nathan) ; le protocole, lui, l'est.
- [x] [Review][Defer] **AC9 déclaré tenu sans élément vérifiable : ni `/impeccable polish` ni `/impeccable extract`** — `auditor`. L'AC9 exige une passe `polish` sur les fichiers touchés, et l'AC3 que les contrats des trois briques soient « produits par `/impeccable extract` ». La Task 10 ne parle que de contrats « extraits des composants livrés » (à la main), et le Debug Log ne mentionne qu'`impeccable detect`. **Décision de Nathan (2026-09-17) : REPORTÉ EN 11.4**, la story d'outillage (garde-fous et scans) — les passes `polish` et `extract` y ont leur place, et l'écart est noté sans bloquer la livraison du refactor.

- [x] [Review][Patch] **`useBackdropClose` : un armement périmé survit à la pop-up et la ferme sur un geste parti de la carte** [`1score/src/composables/useBackdropClose.ts:36-46` + `1score/src/components/PopupCard.vue:119-120`] — `blind+edge`, **majeur**. Aucun chemin ne désarme un pointeur dont le `pointerup` est intercepté par le `@pointerup.stop` de la carte. À la souris (`pointerId` constant à `1`) : appui sur le voile → glisser sur la carte → relâcher ⇒ armé pour toute la vie de la pop-up. Puis appui **dans** la carte → glisser dehors → relâcher sur le voile ⇒ `event.pointerId === armedPointerId` ⇒ fermeture. Sur `ScoreEntryDock`, la série en cours de frappe est perdue. **Même cause, second symptôme** (`edge`) : au tactile, la **capture implicite du pointeur** redistribue le `pointerup` à la cible du `pointerdown`, donc `@pointerup.stop` de la carte ne protège rien — happy-dom ne l'implémente pas, ce qui fait réussir `PopupCard.test.ts:149-156` sur un cas qui ne se produit pas au navigateur. **Correctif** : garder par la cible de l'événement (`event.target === event.currentTarget` sur le voile) plutôt que par l'arrêt de propagation, et désarmer sur tout `pointerup`.
- [x] [Review][Patch] **`useBackdropClose` : `enabled` n'est lu qu'à l'armement, jamais au relâchement** [`1score/src/composables/useBackdropClose.ts:41-46`] — `blind+edge`, **majeur**. L'en-tête annonce « relu à chaque geste » ; `onPointerup` ne consulte que `armedPointerId`. `PromptModal` dérive `closesOnBackdrop` d'un `computed` qui peut basculer pendant que la pop-up reste montée : doigt posé quand le retour existe, prop à `false`, relâchement ⇒ `emit('secondary')` et `revertEnd()` sur un voile censé être inerte (AC18 / Décision 12). Le test `re-reads enabled at each gesture` (`:93-106`) ne change `allowed` **qu'entre deux gestes complets** — jamais dans l'intervalle où la relecture compte. **Correctif** : tester `isEnabled()` dans `onPointerup`, et réécrire le test pour qu'il bascule la garde entre `down` et `up`.
- [x] [Review][Patch] **`useBackdropClose` : `pointercancel` ignore le `pointerId` et désarme le doigt d'un autre** [`1score/src/composables/useBackdropClose.ts:27,48-50`] — `blind+edge`, **majeur**. La signature `() => void` rend le contrôle impossible, ce qui contredit frontalement l'argument écrit en tête du fichier (« le `pointerId` est MÉMORISÉ, jamais un booléen : une paume posée sur le voile n'arme pas la fermeture au profit d'un autre doigt »). Le `pointercancel` de la carte n'est pas arrêté par `PopupCard` et remonte jusqu'au voile : une paume rejetée par iPadOS désarme le doigt actif, le tap dehors ne ferme plus rien. **Correctif** : accepter le `PointerEvent` et ne désarmer que si l'id correspond.
- [x] [Review][Patch] **`useBackdropClose` : un second `pointerdown` écrase silencieusement le pointeur armé** [`1score/src/composables/useBackdropClose.ts:36-39`] — `edge`. `armedPointerId = event.pointerId` réaffecte sans condition : le dernier contact gagne. Doigt A armé, paume B posée, A relevé ⇒ rien ; B relevé plus tard ⇒ fermeture différée non intentionnelle. **Correctif** : ignorer l'armement si un pointeur est déjà armé.
- [x] [Review][Patch] **`w-full` ajouté à la variante `accent`, sur trois appelants qui portaient déjà `flex-1`** [`1score/src/components/CtaButton.vue:38-39`] — `blind+auditor`. Vérifié contre l'état antérieur : `git show 35e55b2:…/ScoreEntryDock.vue:187` ne portait que `flex-1`, sans aucune largeur. Le refactor crée donc exactement le conflit que le composant dit éviter pour `neutral` deux lignes plus bas (« deux utilitaires `w-*` se disputeraient `width`, et c'est l'ordre de la feuille générée qui trancherait »). Sans effet aujourd'hui (`flex-basis:0%` prime sur l'axe principal), mais dormant : sortez `accent` d'un conteneur flex et `w-full` reprend la main. C'est aussi une classe ajoutée **hors** du seul changement visuel annoncé par l'AC2. **Correctif** : retirer `w-full` d'`accent`.
- [x] [Review][Patch] **La règle globale qui remplace 17 `select-none` ne pose pas `-webkit-user-select`** [`1score/src/assets/main.css:292-295`] — `blind`, vérifié. L'utilitaire Tailwind retiré émettait `-webkit-user-select:none` **et** `user-select:none` ; la règle écrite à la main ne pose que la forme non préfixée. Sur les WebKit antérieurs à Safari 17, la sélection de texte et la loupe iOS reviennent d'un coup sur les 17 éléments (touches, tuiles de mode, items de barre latérale, pictos d'action). Invisible aux garde-fous : happy-dom ne calcule pas de CSS et la comparaison pixel est prise au repos. **Correctif** : ajouter `-webkit-user-select: none` (une ligne). À croiser avec le contrôle WebKit toujours ouvert dans `deferred-work.md`.
- [x] [Review][Patch] **Le garde-fou d'AC2 est aveugle aux littéraux gabarits — la forme exacte qu'il remplace** [`1score/src/assets/tokens.test.ts:242-243`] — `blind`. La regex ne reconnaît que `'…'` et `"…"`. Or le code supprimé par cette story écrivait précisément `const ACCENT_CLASSES = \`${BUTTON_CLASSES} bg-(image:--gradient-blue) …\`` : un développeur qui recopie demain une chaîne de CTA dans un template literal — l'idiome attesté du dépôt — passe sous le radar, `offenders` reste vide, la règle est verte. Les séquences échappées cassent aussi l'appariement. **La règle ne prouve donc pas l'invariant qu'AC2 lui confie.** **Correctif** : couvrir les backticks et les échappements.
- [x] [Review][Patch] **La règle « une seule occurrence de `touch-manipulation` » exclut un fichier entier, pas une occurrence** [`1score/src/assets/tokens.test.ts:295-305`] — `blind`. `PlayerPanel.vue` est retiré du balayage, alors qu'il contient aussi `ADJUST_BUTTON_CLASSES`, un `<button>` dont cette story vient de retirer les deux classes : les re-poser demain ne déclenche aucun test. Et `toMatch` se contente d'**au moins une** occurrence, pas d'exactement une. Le commentaire affirme « plus aucune occurrence ailleurs, et celle-ci toujours là » ; seule la seconde moitié est vérifiée, sur le mauvais grain. **Correctif** : compter les occurrences dans `PlayerPanel.vue` et n'exclure que la ligne `:183`.
- [x] [Review][Patch] **Le double croisement gauche/droite des insets rapatriés n'est verrouillé par aucune assertion** [`1score/src/components/HomeScreen.vue:95-98,175-177`] — `edge+blind`, **majeur** (trou de couverture). `SETUP_POPUP_RESERVE.left` contient `--size-sidebar`, `.right` non : les deux valeurs diffèrent d'une largeur de barre (120 px à 1133, 195 px à 1920). Le chemin passe par **deux inversions** — `entryPopupSide` = opposé de la carte visée, puis `entryPopupReserve` = opposé d'`entryPopupSide`, puis `PopupCard` inverse une troisième fois pour choisir le côté du padding. Le relecteur a vérifié que le mapping livré reproduit exactement l'ancien `ALIGN_CLASSES` : **ce n'est pas un défaut, c'est un trou**. Inverser le ternaire de `:176` laisse toute la suite verte, et la pop-up mord alors sur la carte qu'on remplit. Les tests d'hôtes n'assertent que `props('align')`, ou reçoivent une constante `RESERVE` unique — une valeur unique ne peut par construction pas révéler une permutation dans une table à deux entrées asymétriques. Aggravé par le typage : `Record<TableSide, string>` où les clés désignent le côté **réservé** et non le côté d'alignement, deux sens pour un même type. **Correctif** : asserter les deux valeurs distinctes de `reserve` aux deux côtés.
- [x] [Review][Patch] **`PopupCard` : `align` et `reserve` sont deux optionnels indépendants, et la dégradation est muette** [`1score/src/components/PopupCard.vue:92-98`] — `blind+edge`. `align` sans `reserve` ⇒ `?? GUTTER` ⇒ la pop-up se centre plein écran et **recouvre la carte visée**, précisément le défaut que la décision 2 de Nathan (2026-09-12) et l'AC9 de la 10.4 cherchent à éviter. `reserve` sans `align` ⇒ sortie anticipée, valeur ignorée sans signal. Les trois hôtes déclarent `reserve` requis, `PopupCard` l'accepte optionnel. `PopupCard.test.ts:169-194` passe toujours les deux ensemble. **Correctif** : lier les deux props par le type (paire ou rien).
- [x] [Review][Patch] **`PopupCard` peut rendre un `role="dialog"` anonyme, et la garde annoncée n'existe pas** [`1score/src/components/PopupCard.vue:34-35,58-59`] — `blind+edge`. Le commentaire déclare `label` et `labelledBy` « EXCLUSIFS l'un de l'autre », et la fiche parle d'une faute que le composant « peut refuser en développement » : aucune branche ne le vérifie. Ni l'un ni l'autre ⇒ `role="dialog" aria-modal="true"` sans nom accessible (échec WCAG 4.1.2, VoiceOver annonce « dialogue » et rien d'autre). Les deux ⇒ `aria-labelledby` gagne en silence et l'`aria-label` mort reste dans le DOM. `PopupCard.test.ts:84-98` teste chaque prop seule, jamais zéro ni les deux. **Correctif** : type union `{ label: string } | { labelledBy: string }`.
- [x] [Review][Patch] **`.impeccable/design.json` décrit des CTA que `CtaButton` ne rend pas** [`.impeccable/design.json:590-593,614`] — `blind+auditor`. L'AC3 exige des « snippets à jour des six variantes » ; seules les `description` ont été retouchées. `ds-btn-neutral` déclare encore `width:100%` — que le test `leaves the width of the neutral variant to its caller` **interdit** ; `ds-btn-accent` déclare `display:flex`, `padding:0 16px` et un `:hover{filter:brightness(1.05)}` que le composant n'émet pas ; `ds-btn-bar` / `ds-btn-pass` annoncent un `:focus-visible{outline:4px solid …}` absent du produit. Les quatre snippets antérieurs gardent `user-select:none;touch-action:manipulation`, que l'AC6 vient de retirer, tandis que les deux nouveaux ne les portent pas : **le jeu de six n'est pas homogène**. `impeccable detect` lit ce fichier — il mesure un composant qui n'existe pas. **Correctif** : régénérer les six `css`.
- [x] [Review][Patch] **Trois affirmations mutuellement exclusives sur `--breakpoint-lg`, dont deux dans la source de vérité** [`DESIGN.md:351,408`] — `auditor`. `CLAUDE.md:149`, réécrit par cette story, pose « `--breakpoint-lg: initial` dans `@theme` est une GARDE, pas une survivance » — confirmé par `main.css:144`. Mais `DESIGN.md:408` dit encore que « `lg` (1280) est déclaré mais presque inutilisé », et `DESIGN.md:351` range `--breakpoint-lg` parmi les tokens « retirés en 11.2, sans consommateur ». La Task 10 demandait justement de corriger les passages que la story rend faux. **Correctif** : aligner les deux passages de `DESIGN.md` sur `CLAUDE.md` §8.
- [x] [Review][Patch] **Commentaire de `PromptModal` qui envoie chercher dans le mauvais fichier** [`1score/src/components/PromptModal.vue:29`] — `auditor`. Seule occurrence de `armBackdropClose` restée dans `1score/src/`, pour un mécanisme qui vit désormais dans `useBackdropClose.ts` et se consomme à travers `PopupCard`. L'AC1 exige que ces noms « n'existent plus qu'une fois ». **Correctif** : réécrire le renvoi.
- [x] [Review][Patch] **`ballOf` : ternaire sans exhaustivité** [`1score/src/components/ballAssets.ts:36-38`] — `edge`. `player === 'player1' ? 'white' : 'yellow'` : tout ce qui n'est pas `player1` retombe sur `yellow`, sans `Record` ni `satisfies` qui casserait à la compilation si `PlayerId` gagnait une valeur. Défaut latent seulement, mais dans un module de base que le critère de sortie invite tout écran neuf à consommer. **Correctif** : table indexée `Record<PlayerId, PlayerColor>`.

- [x] [Review][Defer] **Aucun CTA n'est activable au clavier** [`1score/src/components/CtaButton.vue:64`] — `blind` — reporté, antérieur à la story. Un `<button>` activé à Entrée/Espace émet `click`, jamais `pointerdown` (WCAG 2.1.1). L'arbitrage « borne tactile sans clavier » est assumé de longue date côté pop-ups ; la story ne fait que l'étendre à `DÉMARRER`, `PASSER LE TOUR`, la barre basse et les réglages en le figeant dans la brique de base. À rouvrir si un écran au clavier apparaît.
- [x] [Review][Defer] **Deux `PopupCard` simultanées : même `z-50`, deux `aria-modal`, aucun arbitrage** [`1score/src/components/PopupCard.vue:105,108`] — `edge` — reporté, non atteignable aujourd'hui (vérifié : les voiles plein écran couvrent les déclencheurs de toutes les autres pop-ups). Seul l'ordre des blocs `v-if` de `GameView.vue:410-470` garantit aujourd'hui que les pop-ups de fin passent au-dessus de `ScoreEntryDock`.

**Correctifs appliqués le 2026-09-17** — 15 des 16 `patch`. `npm test` : **1026 tests verts** (29 fichiers, +13 sur la ligne de base de 1013), `npm run build` vert, `src/stores/` **intact** (`git diff --stat` vide).

Deux garde-fous ont été vérifiés PAR MUTATION, comme la 10.7 l'a institué — un test qui ne casse pas quand on casse le code ne prouve rien :
- la nouvelle assertion sur `reserve` échoue bien quand on remplace le ternaire d'inversion de `HomeScreen.vue:176` par `SETUP_POPUP_RESERVE[entryPopupSide.value]` (le trou de couverture est fermé, le code livré était juste) ;
- la regex durcie de `tokens.test.ts` attrape bien un `const A = \`${BASE} min-h-(--size-touch-target) bg-(image:--gradient-blue)\`` planté, et un `\'` échappé n'avale plus la suite du fichier.

`useBackdropClose` a changé de principe, pas seulement de détail : la garde passe de l'ARRÊT DE PROPAGATION à la CIBLE de l'événement (`event.target === event.currentTarget`), et les `@pointerdown.stop` / `@pointerup.stop` de la carte de `PopupCard` sont retirés. C'est ce qui supprime l'armement périmé à la racine et rend la règle indifférente à la capture implicite du pointeur. Contrat qui en découle, écrit dans le fichier et dans `CLAUDE.md` §10 : **sous capture implicite, c'est le point de DÉPART du geste qui commande, pas son point d'arrivée**. Six cas nouveaux couvrent la matrice (armement périmé, geste entièrement dans la carte, `enabled` basculé entre `down` et `up`, `pointercancel` d'un autre pointeur, second `pointerdown`).

`align`/`reserve` et `label`/`labelledBy` sont désormais tenus par le TYPE (`PlacementProps`, `NameProps` en unions) et non par un commentaire : la paire est indivisible, le nom accessible obligatoire et unique. `vue-tsc -b` valide les cinq appelants sans retouche.

**Écartés comme bruit (4)** : `ballOf` graverait « player1 = blanc » à tort (vérifié — c'est le modèle du store, `useGameStore.ts:69,658,733,743`, et `CHANGER DE BILLE` ne déplace que `whiteSide`) ; variante inconnue de `CtaButton` et `width`/`gap` hors table (`Record<union, string>` casse à la compilation) ; chemin Playwright en dur dans `render-static.cjs` (déjà consigné dans `deferred-work.md`, lot « durcir le harnais » de la revue 11.2).


## Dev Notes

### État du code à l'arrivée (commit `35e55b2`, arbre propre, **844 tests verts, 26 fichiers**)

**Le mécanisme de voile, quatre fois à l'identique** — `PromptModal.vue:94-109`, `ScoreEntryDock.vue:127-141`, `NumericPadDock.vue:96-110`, `AlphaKeyboardSheet.vue:71-85`. Corps rigoureusement identique (`backdropPointerId`, trois fonctions), à une différence près : `PromptModal` ouvre sur `if (!closesOnBackdrop.value) return` et émet `secondary` ; les trois autres émettent `cancel` sans garde. Trois handlers recopiés sur chaque racine (`@pointerdown` / `@pointerup` / `@pointercancel`).

**Les sept chaînes de CTA** (aucune n'est partagée) :

| Famille | Fichier | Chaîne, en bref |
|---|---|---|
| accent (pop-up) | `PromptModal.vue:86-88` | `BUTTON_CLASSES` + `bg-(image:--gradient-blue) text-white active:brightness-90` |
| neutre (pop-up) | `PromptModal.vue:89` | idem + `bg-(image:--gradient-neutral) active:brightness-125` ⚠️ |
| accent / neutre | `NumericPadDock.vue:149,156`, `ScoreEntryDock.vue:180,187`, `AlphaKeyboardSheet.vue:118,125` | recopiées **mot pour mot** ×3 fichiers ; neutre en `w-1/3 … active:brightness-90` ⚠️ |
| réglage | `HomeScreen.vue:80-81` (`SETUP_CTA_CLASSES`) | bleu, `text-label font-bold`, picto en ligne |
| `DÉMARRER` | `HomeScreen.vue:517` | `min-h-(--size-start-button) bg-(image:--gradient-red) text-start-button tracking-label shadow-light-edge-start` |
| barre basse | `ActionBar.vue:123` | bleu, `text-label font-black tracking-label` |
| `PASSER LE TOUR` | `CenterPanel.vue:147` | bleu, `flex-col` picto au-dessus, `text-stat`, `disabled:opacity-30` |

⚠️ Les deux marqueurs sont la **divergence du neutre** que l'audit relève (P2) : le même objet s'éclaircit dans `PromptModal` et s'assombrit dans les trois hôtes. `DESIGN.md` › Elevation › Retours d'appui documente `brightness(1.25)`.

**Hors périmètre CTA, à ne pas absorber** : `IconAction.vue:40` (picto d'action — **déjà** un composant de strate 3, quatre consommateurs, zéro constat à l'audit), `ModeTile.vue` (idem), `SideBar.vue:76` (item de barre, contextuel), `PlayerSetupCard.vue:56` (`FIELD_CLASSES`, un champ, pas un CTA), `PlayerPanel.vue:111-112` (`ADJUST_BUTTON_CLASSES` : **une** définition, **un** fichier, noir sur carte claire — ce n'est pas une duplication, la déplacer coûterait plus qu'elle ne rapporte), `keyClasses.ts` (touches, déjà partagé).

**La carte de pop-up, quatre fois à l'identique** — `rounded-popup border border-border bg-bg-raised/88 p-3 shadow-popup backdrop-blur-sm`, plus `flex max-h-full w-full flex-col gap-2|gap-3`, plus `@pointerdown.stop @pointerup.stop`. Seules varient : la largeur (`max-w-(--size-popup-decision|pad|alpha)`), le `gap`, `overflow-hidden` et `relative` sur `PromptModal` seul.

**Le voile, quatre fois à l'identique** — `fixed inset-0 z-50 flex items-center justify-center bg-black/25` + `p-4` (décision) ou `py-4` + `ALIGN_CLASSES` (saisie).

**Les quatre insets** — `main.css:232-252`, avec leur propre avertissement « ⚠️ À faire bouger AVEC cette mise en page : c'est le seul endroit où elle est dupliquée ». C'est le symptôme que `integration-bmad-impeccable.md` §6 nomme : *un token décrit une intention, jamais une position*.

**Les constantes dupliquées** — `BALL_PICTOS` en `Record<PlayerColor, string>` (`PlayerSetupCard.vue:41`) **et** en `Record<PlayerId, string>` (`GameSummary.vue:56`), mêmes deux chemins `/bille_blanche.png` et `/bille_jaune.png` ; `BALL_LABELS` (`PlayerSetupCard.vue:45`) ; `BALL_CLASSES` (`PromptModal.vue:74`, `bg-player-white|yellow`). `ALIGN_CLASSES` ×2 (`NumericPadDock.vue:39`, `AlphaKeyboardSheet.vue:40`) — identiques ; celui de `ScoreEntryDock.vue:54` lit les **autres** variables (géométrie du scoreboard), il n'est pas un doublon des deux premiers.

**`touch-manipulation select-none`, 18 usages de classe** (la 19e occurrence est un commentaire, `PlayerPanel.vue:19`) : `keyClasses.ts` (touches, `<button>` dans `NumericPad` et `AlphaKeyboard` — vérifié), `IconAction:40`, `ModeTile`, `SideBar:76`, `CenterPanel:147`, `ActionBar:123`, `HomeScreen:81,517`, `PromptModal:87`, `NumericPadDock:149,156`, `ScoreEntryDock:180,187`, `AlphaKeyboardSheet:118,125`, `PlayerSetupCard:56` — **tous des `<button>`** — et `PlayerPanel:112` (`<button>`) plus **`PlayerPanel:183`, un `<div>`** : la seule à conserver.

### Contrats des trois briques (à écrire dans `DESIGN.md` › Components à la Task 10)

**`useBackdropClose(onClose, options?)`** — `src/composables/useBackdropClose.ts`

```ts
export function useBackdropClose(
  onClose: () => void,
  options?: { enabled?: () => boolean },
): {
  onPointerdown: (event: PointerEvent) => void
  onPointerup: (event: PointerEvent) => void
  onPointercancel: () => void
}
```

- `enabled` **par défaut vrai** ; `PopupCard` lui passe `() => props.closeOnBackdrop`.
- Le `pointerId` est mémorisé, **jamais un booléen** : une paume posée sur le voile ne doit pas armer la fermeture au profit d'un autre doigt (revue du 2026-09-09).
- Le geste doit être **complet** : c'est ce qui protège les pop-ups qui montent **sous le doigt** au `pointerdown` de `VALIDER` ou de `+` — leur `pointerup` retombe sur un voile qui n'a jamais été armé.
- `onClose` est appelé **une fois**, et le pointeur est désarmé **avant** l'appel (sinon un `pointerup` rejoué refermerait deux fois).

**`CtaButton.vue`** — strate 3, aucune connaissance du jeu

```
props: variant: 'accent' | 'neutral' | 'setup' | 'start' | 'bar' | 'pass'
       disabled?: boolean
emits: press  (émis sur @pointerdown — AR8, jamais @click)
slots: default (contenu : libellé, picto, barre de rebours…)
```

Table de classes **littérales** (scanner JIT), une entrée par variante, toutes construites sur une base commune :

| Variante | Fond | Typographie | Géométrie | Appui |
|---|---|---|---|---|
| `accent` | `bg-(image:--gradient-blue)` | `text-label font-black` | `w-full min-h-(--size-touch-target)` | `active:brightness-90` |
| `neutral` | `bg-(image:--gradient-neutral)` | `text-label font-black` | idem (la largeur `w-1/3` reste à l'appelant) | **`active:brightness-125`** |
| `setup` | `bg-(image:--gradient-blue)` | `text-label font-bold` | `w-full min-h-(--size-touch-target)`, `gap-2`, picto en ligne | `active:brightness-90` |
| `start` | `bg-(image:--gradient-red)` | `text-start-button font-black tracking-label` | `min-h-(--size-start-button)`, `shadow-light-edge-start` | `active:brightness-90` |
| `bar` | `bg-(image:--gradient-blue)` | `text-label font-black tracking-label` | `w-full min-h-(--size-touch-target)` | `active:brightness-90` |
| `pass` | `bg-(image:--gradient-blue)` | `text-stat font-black leading-tight` | `flex-col`, picto au-dessus, `disabled:opacity-30` | `active:brightness-90` |

Toutes portent `rounded-tappable` et `text-white`, **aucune** ne porte `touch-manipulation select-none` (AC6). Ce qui reste à l'appelant : la **largeur** quand elle est contextuelle (`w-1/3`, `flex-1`), `mt-auto`, `relative overflow-hidden` (barre de rebours de `VALIDER`), `data-testid`.

⚠️ **Balayer les deux graphies de token de taille en passant** : la 11.1 a introduit la forme courte `min-h-(--size-…)`, treize usages antérieurs écrivent encore `min-h-[var(--size-touch-target)]` (report de la revue 11.1). `CtaButton` écrit la **forme courte**, et le balayage des usages restants (`IconAction`, `SideBar`, `PlayerPanel`, plus `IconAction.test.ts:69`, `PromptModal.test.ts`) se fait **ici**, en une fois — c'est exactement « hors de toute story de rendu » que le report demandait.

**`PopupCard.vue`** — strate 3

```
props: testid: string             // posé sur la RACINE rendue (voir Pièges)
       cardTestid: string         // posé sur la carte
       labelledBy?: string        // id du titre visible (PromptModal)
       label?: string             // aria-label statique (les trois hôtes)
       width: 'decision' | 'pad' | 'alpha'   // largeur de carte, table littérale
       gap: 'sm' | 'md'           // 'sm' → gap-2 (saisie), 'md' → gap-3 (décision)
       closeOnBackdrop?: boolean  // défaut true
       align?: 'left' | 'right'   // côté où la carte se pose (pop-ups de saisie)
       reserve?: string           // bande réservée du côté OPPOSÉ, en unités de grille
emits: backdrop-close
slots: default (contenu), footer (pied de CTA)
```

⚠️ `width` et `gap` sont des **noms**, pas des valeurs : ils indexent une table de classes **écrites en toutes lettres** (`decision` → `max-w-(--size-popup-decision)`, `pad` → `max-w-(--size-popup-pad)`, `alpha` → `max-w-(--size-popup-alpha)` ; `sm` → `gap-2`, `md` → `gap-3`). Une classe interpolée à partir d'un nom de token n'est pas vue par le scanner JIT et n'émet rien, en silence (`CLAUDE.md` §12).

- Sans `align` : voile `p-4`, carte centrée (`PromptModal`).
- Avec `align` : voile `py-4`, padding horizontal **en style en ligne** — `align: 'left'` ⇒ `paddingInlineStart: calc(var(--spacing) * 4)` et `paddingInlineEnd: reserve` ; `align: 'right'` ⇒ l'inverse. Une classe Tailwind est impossible ici (valeur dynamique, `CLAUDE.md` §12 : jamais de classe construite à la volée) — et c'est **une position, pas une valeur de design** : sa place est un style en ligne, pas un token.
- `labelledBy` et `label` sont **exclusifs** ; poser les deux est une faute que le composant peut refuser en développement.

### Insets — les valeurs à rapatrier, au caractère près

À retirer de `main.css:240-241` et `251-252`, à réécrire dans l'hôte :

| Hôte | Constante | Valeur |
|---|---|---|
| `HomeScreen` (paramétrage, étape `players`) | réservé **à gauche** | `calc(var(--size-sidebar) + var(--spacing) * 4 + (100vw - var(--size-sidebar) - var(--spacing) * 8) * 0.375)` |
| | réservé **à droite** | `calc((100vw - var(--size-sidebar) - var(--spacing) * 8) * 0.375 + var(--spacing) * 4)` |
| `GameView` (scoreboard) | réservé des deux côtés | `calc(100vw * 0.4 + var(--spacing) * 4)` |

Lecture de la géométrie, à recopier en commentaire à côté de la constante : le paramétrage est barre latérale (`--size-sidebar`) + padding de `<main>` (`p-4` = 4 unités) + deux cartes se partageant les 3/4 restants (donc 0,375 chacune du reste) + gouttière de 4 unités ; le scoreboard n'a pas de barre latérale, ses colonnes valent 2/5 · 1/5 · 2/5 à fleur de bord, l'inset réserve la carte visée (40vw) plus 4 unités. **L'asymétrie du paramétrage est réelle** (la barre latérale n'est que d'un côté) : deux valeurs, pas une.

⚠️ `--size-sidebar` et `--spacing` restent des tokens et restent lus : ce sont des **intentions** (largeur de la barre, unité de grille). Ce qui part, c'est le **produit** de ces intentions par une mise en page.

### Touches alpha — les trois leviers, chiffrés (AC4)

La largeur d'une touche est `(zone libre − 2 × p-3 − 9 × gap-1) / 10`. Vérifié par le calcul à la création de la fiche, et conforme aux mesures de la 11.1 :

| Format | `--spacing` | Zone libre | Touche | Plancher UX-DR8 |
|---|---|---|---|---|
| 1133×744 | 8 px | 593 px | **47,3 px** | 57 → −10 |
| 1180×733 | 8 px | 623 px | **50,3 px** | 57 → −7 |
| 1920×1080 | 13 px | 1013 px | **81,8 px** | 57 → OK |

Leviers, tous calculés sur 1133 (le seul format qui ne tient pas d'assez loin pour compter) :

- **9 colonnes** au lieu de 10 : 53,5 px — **ne suffit pas**, et recompose un AZERTY.
- **`gap-0.5`** au lieu de `gap-1` : 50,9 px — ne suffit pas.
- **Supprimer la gouttière extérieure** (`pl-4`/`pr-4`) : 50,5 px — ne suffit pas, et colle la pop-up au bord.
- **8 colonnes** : 61,1 px — tient, mais défigure le clavier.

**Donc, sauf à passer par-dessus la carte visée, le plancher de 57 px n'est pas atteignable à 1133 en gardant un AZERTY à 10 colonnes.** Le seuil est déjà une **exception assumée** (UX-DR8 / spec §10.6 : « touches ≈ 57 px, comme le clavier natif de l'iPad »), et la règle des 90×90 ne s'applique pas aux claviers. L'issue attendue est donc : **re-mesurer, consigner, et confirmer l'exception avec Nathan** — pas redessiner le clavier dans une story de refactor. Les quatre lignes ci-dessus sont là pour que la conversation dure trente secondes et se tienne sur des nombres.

### Découpe Billiboard — les deux propositions (Task 9, AC8)

Références (photos, intention seule) : `billiboard_scoreboard.JPG` et `billiboard_scoreboard_2.JPG` montrent des blocs qui **flottent** sur un fond sombre — carte joueur, colonne centrale et barre `+1` séparées par une gouttière sombre, chacune à petit rayon ; `billiboard_player*.png` montre le même vocabulaire appliqué à un écran de **choix de joueur**, c'est-à-dire précisément l'écran que l'Epic 4 doit construire.

- **A — l'existant** : trois colonnes jointives à fleur de bord, barre basse collée, angles vifs (décision `DESIGN.md` › Shapes, Nathan, 2026-09-16).
- **B — découpe** : gouttière d'une unité de grille entre les trois colonnes, entre elles et les bords, et entre la zone de jeu et la barre basse ; `--radius-tappable` (8 px) sur les cartes joueur, la colonne centrale et la barre basse ; le marine sombre du fond fait la séparation, aucune ombre ajoutée (Nathan a écarté l'ombre de barre basse en 11.2 : « pas hyper bien intégrée »).

⚠️ **À regarder au rendu, pas en théorie** : le débordement du disque du chrono (`--game-clock-bleed`, 3 unités) traverse la frontière entre colonne centrale et cartes — une gouttière la rouvre, et le demi-anneau de tour de `ShotClock` se clippe sur cette bande. Si B est retenue, c'est **le** point à vérifier aux trois formats avant de câbler quoi que ce soit. Le liseré de tour `ring-8` de la carte est le second.

Surcharges suffisantes pour produire B sans toucher au code : padding/gap sur la grille du scoreboard et `border-radius` sur les racines des colonnes, injectés par `--override` ; si un sélecteur manque, c'est le signe que la découpe demande du markup — dans ce cas, **ne pas câbler pour montrer**, décrire l'écart à Nathan et lui proposer une story de mise en page.

### Harnais de rendu

`1score/scripts/render-static.cjs` (dans le dépôt depuis la 11.2). Usage : `node scripts/render-static.cjs <outDir> [WxH …]`, options `--url`, `--override <fichier.css>`, `--focus <testid>`. Il pilote le parcours réel par `pointerdown` sur les `data-testid`, capture 12 écrans par format et joint un audit DOM (taille par rôle, débordements, cibles < 90 px, largeur des touches).

- **Playwright, pas l'extension Chrome** : l'écran de la machine (1440×900) ne permet pas d'ouvrir une fenêtre de 1920 px (plafond mesuré 1384×789, 11.1).
- ⚠️ **Le harnais lit les `data-testid`** : si un refactor en déplace ou en renomme un, le parcours casse en silence ou capture un autre écran — d'où la Task 4, dernier point.
- Le parsing d'arguments est fragile (report de la revue 11.2) : passer les arguments dans l'ordre documenté, vérifier que `outDir` existe, et regarder le nombre de fichiers produits avant de conclure quoi que ce soit d'une comparaison.
- **Deux passes navigateur seulement** (`CLAUDE.md` §9) : la ligne de base (Task 1) et la vérification (Task 8) — la passe de propositions de la Task 9 vient **après** et ne compte pas dans le cycle du refactor.

### Comparaison avant/après (AC7)

La preuve doit être mécanique, pas visuelle. Sur deux dossiers de captures de même nomenclature :

```bash
for f in baseline/*.png; do
  n=$(basename "$f")
  cmp -s "$f" "after/$n" || echo "DIFFÈRE: $n"
done
```

Attendu : **aucune ligne**, sauf `*-recap-*` à 1920 (biais du bandeau, AC6). Un `cmp` peut différer sur du bruit d'anti-aliasing selon la version de Chromium : si des lignes apparaissent, comparer les deux images côte à côte avant de conclure, et ne considérer comme bug que ce qui se **voit**. Comparer aussi les deux `audit.json` : mêmes tailles par rôle, mêmes trois débordements attendus, zéro cible sous 90 px, largeur de touche alpha identique.

### Pièges

- **`@pointerdown`, jamais `@click`** (AR8) : `CtaButton` remonte `@pointerdown` en `press`. Un `@click` réintroduirait le délai de 300 ms sur iPad, et aucun test unitaire ne le verrait.
- **Aucun commentaire HTML à la racine d'un gabarit** (`CLAUDE.md` §12) : `CtaButton` et `PopupCard` sont des composants neufs, c'est le moment exact où le piège se paie. Commenter dans `<script setup>`.
- **Aucune classe construite à la volée** : la table de variantes s'écrit en toutes lettres, y compris les six fonds. Un `` `bg-(image:--gradient-${x})` `` n'émettrait rien, en silence.
- **Le voile n'a pas de `role="button"`** (exception `CLAUDE.md` §2) : ne pas « corriger » en posant le rôle sur `PopupCard` pour hériter du CSS global — le voile ne porte aucun texte, et il porte déjà `role="dialog"`.
- **Le `data-testid` d'une racine de pop-up ne bouge pas.** Si `PopupCard` devient la racine rendue, c'est **elle** qui doit porter le `data-testid` transmis par l'appelant, sinon des dizaines de cas de `GameView.test.ts` et `HomeScreen.test.ts` tombent d'un coup.
- **Les quatre cartes ne sont pas rigoureusement identiques** : celle de `PromptModal` porte en plus `relative` et `overflow-hidden` (la variante liste, le titre centré), les trois autres non ; `ScoreEntryDock` porte `relative overflow-hidden` sur son `VALIDER`, pas sur sa carte. Ne pas généraliser `overflow-hidden` aux quatre « pour faire propre » : sur une carte de saisie il peut rogner un retour d'animation, et la comparaison pixel pour pixel ne le verrait pas (elle est prise au repos). Décider explicitement — soit un `contain?: boolean`, soit la seule carte de décision.
- **`ScoreEntryDock` garde son buffer dans le STORE**, `NumericPadDock` et `AlphaKeyboardSheet` dans l'ÉCRAN (`CLAUDE.md` §10). Ce n'est pas une incohérence à « harmoniser » : la saisie de série est persistée et restaurée par la Story 1.12.
- **`NumericPadDock` fige `pristine` à sa création**, et `HomeScreen` le remonte par `:key="entry.ball"`. Passer par `PopupCard` ne doit pas déplacer ce `key` : sans lui, un 4 tapé sur une distance à 25 donne 254.
- **Le `key` de relance des animations** (`rejectKey`, `countdownKey`) relance en recréant l'élément. Déplacer un de ces éléments dans un slot de `PopupCard` change son cycle de vie : vérifier que la pulsation de refus et la barre de rebours se rejouent bien (test + doigt).
- **`AUTO_VALIDATE_DELAY_MS` est la seule définition de la durée** : la `animation-duration` du rebours en dérive. Ne pas la recopier dans `PopupCard`.
- **`min-h-[var(--size-touch-target)]` vs `min-h-(--size-touch-target)`** : même CSS, deux graphies. Les tests qui assertent la chaîne exacte cassent au balayage — c'est attendu, la Task 3 les met à jour.
- **Retirer `touch-manipulation` d'un élément qui n'est pas un `<button>`** est une régression silencieuse : happy-dom ne calcule aucun CSS, aucun test ne la verra. Voir l'inventaire, et `PlayerPanel.vue:183`.
- **`--breakpoint-lg: initial` n'est pas décoratif** : le retirer en réécrivant `CLAUDE.md` §8 rendrait `lg:` à 1024 px, donc sur l'iPad (revue 11.2). §8 doit le citer comme la garde, pas comme une survivance.
- **`npm run build`, pas `vue-tsc --noEmit`** (`CLAUDE.md` §9) : un composant qui prend le relais d'un `<button>` fait perdre des narrowings que seul le build voit.

### Tests

**Nouveaux fichiers** (co-localisés, AR16) :

- `src/composables/useBackdropClose.test.ts` — geste complet ferme ; `pointerup` seul ne ferme pas ; `pointerdown` puis `pointerup` d'un **autre** `pointerId` ne ferme pas ; `pointercancel` désarme ; `enabled` faux ne ferme jamais ; deux `pointerup` d'affilée n'appellent `onClose` qu'une fois.
- `src/components/CtaButton.test.ts` — une assertion de classes par variante (fond, rôle typographique, rayon, appui) ; `press` émis au `pointerdown` et **pas** au `click` ; `disabled` posé et l'émission bloquée ; aucun `touch-manipulation` dans les classes rendues.
- `src/components/PopupCard.test.ts` — `role="dialog"`, `aria-modal`, `aria-labelledby` **ou** `aria-label` selon les props ; la carte stoppe `pointerdown`/`pointerup` ; `backdrop-close` émis sur geste complet et jamais quand `closeOnBackdrop` est faux ; `align` + `reserve` produisent le bon style en ligne des deux côtés ; le voile n'a **pas** de `role="button"`.

**Test de source** (patron de `typography.test.ts` / `tokens.test.ts`, `import.meta.glob(..., { query: '?raw' })`) : aucune chaîne de gabarit ne porte à la fois une hauteur de cible et un `bg-(image:--gradient-…)` hors de `CtaButton.vue` ; aucun gabarit ne nomme `--setup-popup-inset-` ni `--game-popup-inset-` ; `touch-manipulation` n'apparaît que dans `PlayerPanel.vue` ; plus aucun `min-h-[var(--size-`.

**Cas existants à mettre à jour** (même intention, nouvelle cible) : `PromptModal.test.ts` (classes de CTA, `min-h-[var(…)]` ×2, insets), `NumericPadDock.test.ts:181-182,196-197`, `ScoreEntryDock.test.ts:298-301`, `AlphaKeyboardSheet.test.ts:171-172,183-184`, `IconAction.test.ts:69-70` (perd `touch-manipulation`, garde le reste), `CenterPanel.test.ts`, `GameSummary.test.ts` (bandeau), `HomeScreen.test.ts` et `GameView.test.ts` (lecture des `data-testid` — ils ne doivent **pas** bouger). `PlayerPanel.test.ts:375-380` **reste tel quel** : c'est le seul cas qui protège la dernière occurrence.

**Zéro modification** dans `src/stores/**` — preuve : `git diff --stat`.

### Ce que cette story NE fait pas

- Ni `design:check`, ni écrans adressables par URL, ni `ignoreRules` outillés, ni ré-audit → **11.4**.
- Ni token nouveau, ni couleur, ni taille de texte, ni interlettrage : la palette (11.2) et l'échelle (11.1) sont closes. Si une brique **exige** un token, c'est que le design system a un trou — le dire dans la fiche, `DESIGN.md` d'abord.
- Ni absorption d'`IconAction`, `ModeTile`, `SideBar`, `PictoIcon`, `keyClasses` : ils sont déjà la strate 3 qui marche (zéro constat à l'audit).
- Ni `ADJUST_BUTTON_CLASSES` (`PlayerPanel`), ni `FIELD_CLASSES` (`PlayerSetupCard`) dans `CtaButton` : une définition, un fichier, un contexte (encre noire sur carte claire).
- Ni piège à focus, ni `Escape`, ni `tabindex` : la borne n'a pas de clavier (arbitrage durable).
- Ni mise en page du scoreboard **avant** que le refactor soit vert (AC8 vient après AC7, et peut ne pas aboutir).
- Ni `--game-clock-bleed` / `clip-path` de `ShotClock` : la géométrie couplée du chrono reste telle quelle, sauf si la découpe (AC8) la rouvre — auquel cas c'est une décision de rendu, consignée.

### Project Structure Notes

- `useBackdropClose.ts` et son test dans `src/composables/` (`useHaptics`, `useTimer`, `usePwaUpdate` y sont) ; `CtaButton.vue`, `PopupCard.vue`, `ballAssets.ts` et leurs tests dans `src/components/` (`keyClasses.ts` y est) ; `DESIGN.md` et `.impeccable/design.json` à la racine du dépôt.
- **Named exports uniquement**, jamais de `default export` pour un composable ou un module (`CLAUDE.md` §1). Composants en PascalCase, composables en `use` + camelCase, tests en `<même nom>.test.ts`.
- Commande de validation de référence : `npm run build` (`vue-tsc -b && vite build`), depuis `1score/`.
- `CLAUDE.md` §7 : une valeur qui manque s'ajoute d'abord dans `DESIGN.md`, puis `main.css`, **jamais** dans un gabarit — et, depuis cette story, jamais non plus dans un composant de base.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11 — Story 11.3] AC et cadrage ; [#Epic 11, critère de sortie] « la première story de l'Epic 4 se construit sans créer un composant de base ni ajouter un token » ; [#Story 11.2 › Livraison] palette marine, rayons, ombres, Saira
- [Source: _bmad-output/planning-artifacts/design-system-audit-2026-09-15.md#4 P2, #4 P3, #5, #7.3] mécanismes et constantes dupliqués, retour d'appui divergent, tokens qui sont des positions, redondances de classes, « les quatre pop-ups sont un patron, pas un composant »
- [Source: _bmad-output/planning-artifacts/integration-bmad-impeccable.md#5, #6] cycle comp-first, quatre strates, `SideBar` comme preuve du modèle, critère de réussite mesurable
- [Source: DESIGN.md#Components › Buttons, Keys, Cards / Containers, Pop-ups (signature)] les six familles de CTA, la carte de pop-up, le patron des quatre pop-ups ; [#Shapes] « conteneurs à angles vifs », l'exception que l'AC8 arbitre ; [#Elevation › Retours d'appui] `brightness(1.25)` sur le neutre ; [#Layout › Pop-ups] « ces quatre insets recopient la géométrie d'un écran : ce ne sont pas des tokens »
- [Source: 1score/CLAUDE.md#2, #7, #8, #9, #10, #12] pointer events et exception du voile, tokens, breakpoints à réécrire, validation, contrats de code (hôtes de saisie, patron des pop-ups, règle du voile, insets), pièges de gabarit
- [Source: 1score/src/assets/main.css:232-252] les quatre insets et leur avertissement ; [:331] `min-width: 320px` ; [:302-310] la règle globale `touch-action` / `user-select`
- [Source: 1score/src/components/PromptModal.vue:26-32,58-63,86-109] règle du voile dérivée du libellé, `CANCEL_LABELS`, mécanisme à extraire
- [Source: 1score/src/components/PlayerPanel.vue:17-19,183 ; PlayerPanel.test.ts:373-380] la seule occurrence de `touch-manipulation` à conserver, et son test
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#code review de l'Epic 10] mécanisme de fermeture dupliqué quatre fois, `ALIGN_CLASSES`, `BALL_PICTOS` ; [#code review de la story 11.1] biais du bandeau à 32 px fixes « à reprendre en 11.3 », deux graphies de `min-h` ; [#dev-story 11.2] découpe Billiboard reportée à la 11.3, verre des pop-ups à revoir si la géométrie change ; [#dev-story 10.7] touches alpha sous le plancher, trois pistes
- [Source: _bmad-output/implementation-artifacts/11-2-….md#Dev Notes › Harnais, #Dev Agent Record] harnais Playwright, `--override` / `--focus` / `--url`, méthode des passes de rendu sans code
- [Source: explore/resources/billiboard_scoreboard.JPG, billiboard_scoreboard_2.JPG, billiboard_player*.png] références de la découpe (photos : intention seule)
- [Source: PRODUCT.md#Operating Context] salle sombre, 1920×1080 référence, borne sans clavier

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`), workflow `bmad-dev-story`, session du 2026-09-16.

### Debug Log References

**Ligne de base (Task 1), commit `35e55b2`, arbre propre** : `npm test` → 844 tests verts, 26 fichiers ; `npm run build` vert. Harnais joué sur serveur `npm run dev` neuf : 36 captures (12 écrans × 3 formats) + `audit.json`. Trois débordements attendus et seulement eux : ellipse volontaire de `JEAN PIERRE` au paramétrage et au récap à 1133, voile de flash absolu sur la valeur de série aux trois formats. Zéro cible sous 90 px. **Touches alpha : 47 / 50 / 82 px** à 1133 / 1180 / 1920 — conforme aux 47,3 / 50,3 / 81,8 calculés à la création de la fiche.

**Le harnais ne démarrait pas sur cette machine** : `render-static.cjs` codait en dur un chemin Playwright (`/Users/nathanlegendre/.nvm/…`) qui n'existe pas ici. Rendu surchargeable par `PLAYWRIGHT_MODULE`, défaut inchangé ; Playwright 1.58 installé **dans le scratchpad**, hors du projet — aucune dépendance ajoutée à `package.json` (la version doit correspondre au build de Chromium du cache, 1208 ici).

**Vérification (Task 8)** : `npm test` → **1013 tests verts, 29 fichiers** ; `npm run build` vert ; `git diff --stat -- 1score/src/stores` **vide**. Harnais rejoué, **32 captures sur 36 identiques au pixel** (`cmp`). Les quatre écarts, tous instruits :

| Capture | Pixels différents | Verdict |
|---|---|---|
| `11-recap-1920x1080` | 3 693 (0,18 %), zone du bandeau | **Différence VOULUE** : le biais passe de 32 px figés à 4 unités de grille (52 px à 1920). Regardée à 1920 : visible et franche, la coupe ne s'aplatit plus. |
| `11-recap-1180x733` | 20 (0,002 %), écart ≤ 13/canal, sur l'échancrure | Anti-aliasing sous-pixel : `--spacing` vaut 8,0004 px à 1180 et non 8. Invisible. |
| `05-popup-pave-numerique-1920x1080` | **1** pixel, écart 5/canal | Bruit d'anti-aliasing entre deux sessions Chromium. Identique entre deux runs après refactor. |
| `08-popup-saisie-serie-1920x1080` | 15 270 (0,74 %) | **Bruit d'exécution, pas le refactor** : deux captures du MÊME code à la suite diffèrent de 15 322 pixels, même écart max et même zone. Ce sont les phases du flash de frappe (`animate-input-flash`, `forwards`) et de la barre de rebours (`animate-input-countdown`, 3 s) — les deux dépendent du temps écoulé. |

⚠️ **La CSS du serveur de dev était périmée.** Le serveur lancé pour la ligne de base émettait encore `pr-[var(--game-popup-inset-right)]` après le retrait des tokens : le cache Tailwind de Vite ne réélague pas ce qu'il a déjà généré. Sans effet de rendu (aucun gabarit ne les nomme plus), mais **toute la comparaison a été rejouée sur un serveur redémarré** pour lever le doute — mêmes quatre écarts, même conclusion. Reporté dans `deferred-work.md`.

**`impeccable detect`** : zéro constat sur `1score/src` **et** sur l'URL rendue à 1133×744, 1180×733 et 1920×1080.

**Audits DOM avant/après** : **zéro** rôle typographique différent aux trois formats, mêmes débordements attendus, zéro cible sous 90 px, largeurs de touche identiques (alpha 47/50/82, chiffre 143/143/233).

**Passe navigateur manuelle** (Chrome, harnais d'iframe, paysage seulement, 1133×744 / 1194×834 / 1920×1080 — le viewport Chrome n'est pas redimensionnable) :

- Règles du voile, toutes vérifiées en vrai : geste complet ferme ; `pointerup` seul sans effet ; **un second pointeur ne ferme pas ce que le premier a armé** ; `pointercancel` désarme ; tap DANS la carte sans effet ; le CTA qui ouvre une pop-up **sous le doigt** ne la referme pas au relâchement.
- Fermeture au CTA `ANNULER` sur les quatre ; **voile inerte** confirmé sur l'offre d'égalisatrice (secondaire `FIN DE PARTIE`), et son CTA ferme bien.
- Auto-validation : barre de rebours présente, `animation-duration` **3 s**, `animation-name: input-countdown` ; la pop-up se referme seule et le score passe à 12.
- Placement des pop-ups, au pixel de l'ancien token : **387,875 px** au paramétrage à 1133 (= `calc((1133 − 120 − 64) × 0,375 + 32)`) et **485,2 px** au scoreboard (= `calc(1133 × 0,4 + 32)`) ; asymétrie du paramétrage conservée et correctement miroitée.
- Retours d'appui : les deux règles sont bien ÉMISES par Tailwind (`.active\:brightness-125:active{filter:brightness(125%)}` et son pendant à 90 %), et `dock-close` porte `active:brightness-125` quand `dock-confirm` porte `active:brightness-90`.
- Aux trois formats : **aucun débordement**, **aucune cible sous 90 px**, carte de pop-up entièrement dans l'écran. (Débordement mesuré par `getBoundingClientRect`, jamais `scrollWidth` — il ne voit rien sous `overflow-hidden`.)
- CSS vérifiée sur serveur neuf : plus aucun `--*-popup-inset-*`, plus de `min-width: 320px`, les deux `clip-path` du récap en `calc(var(--spacing) * 4)`.

### Completion Notes List

**Ce qui a été construit.** Trois briques de strate 3 — `useBackdropClose` (le mécanisme de fermeture au voile, qui vivait recopié quatre fois), `CtaButton` (six variantes, qui remplace sept chaînes de classes dans six fichiers, dont trois recopiées mot pour mot) et `PopupCard` (le patron des quatre pop-ups : voile, dialogue, carte en verre, pied de CTA en slot, fermeture au voile) — plus `ballAssets.ts` pour les trois tables de bille. Les quatre insets `--*-popup-inset-*` ont quitté `main.css` : chaque écran déclare sa géométrie à côté de la mise en page qu'elle mesure (`HomeScreen` › `SETUP_POPUP_RESERVE`, `GameView` › `GAME_POPUP_RESERVE`) et la transmet en `align` + `reserve`.

**Trois écarts au texte de l'AC d'`epics.md`, assumés et consignés** (dans `DESIGN.md`, dans `epics.md` et ici) :
1. **Six variantes de CTA, pas cinq** — `PASSER LE TOUR` est une famille à part (picto au-dessus, rôle `stat`, état inactif) ; l'absorber dans `accent` demandait trois dérogations.
2. **`ALIGN_CLASSES` disparaît** au lieu de rejoindre un module partagé : il n'existait que pour lire les quatre insets, `PopupCard` le remplace.
3. **Les quatre pop-ups consomment `useBackdropClose` à travers `PopupCard`**, unique consommateur direct.

**Seul changement visuel volontaire** : le retour d'appui du CTA neutre unifié sur `brightness(1.25)`, celui que `DESIGN.md` nomme. État enfoncé seulement — la comparaison pixel se fait au repos, la différence se vérifie au doigt (faite).

**Une différence de rendu voulue, en plus** : le biais du bandeau de récap passe de 32 px figés à 4 unités de grille (report explicite de la revue 11.1). Elle ne se voit qu'à 1920, et elle est franche.

**Un balayage plus large que prévu** : la fiche demandait les deux graphies de `min-h-[var(--size-…)]`. `min-w-[var(--size-…)]` traînait dans les deux mêmes fichiers — même sujet, même CSS, zéro risque visuel : balayé aussi, et la règle de `tokens.test.ts` couvre désormais toute lecture de token de taille, pas seulement `min-h`.

**`touch-manipulation select-none`** : 17 retraits, **1 conservation** — la racine `<div>` de `PlayerPanel.vue:183`, qui n'est ni `<button>` ni `role="button"`. Chaque élément touché a été vérifié `<button>` un par un avant retrait ; `PlayerPanel.test.ts` gagne un commentaire disant qu'il est désormais le seul cas qui protège ces deux classes, et `tokens.test.ts` verrouille l'autre bout (plus aucune occurrence ailleurs, celle-ci toujours là).

**Décisions de Nathan prises au rendu (2026-09-16), toutes deux consignées dans `deferred-work.md`** :
- **Découpe Billiboard : reportée.** Deux propositions rendues aux trois formats par surcharges CSS pures. Les deux **coupent net le débordement du disque du chrono** (`--game-clock-bleed`, 3 unités sur chaque carte), qui est sa signature : dès qu'une gouttière s'ouvre, le cercle devient un cercle tronqué. Le corriger demande de recalculer la géométrie couplée (`ShotClock`, `CenterPanel`, `PlayerPanel`, plus le liseré `ring-8`) contre la gouttière — donc du markup, hors périmètre d'un refactor. `DESIGN.md` › Shapes **reste inchangé** : l'exception à « conteneurs à angles vifs » n'est pas prise.
- **Touches alpha : exception UX-DR8 confirmée**, pas corrigée. 47 / 50 / 82 px pour un plancher de 57 ; des quatre leviers, seul 8 colonnes atteint le plancher et défigure l'AZERTY.

### Critère de sortie de l'epic — ce qu'un écran neuf peut poser sans rien créer (AC9)

La question que mesure l'Epic 11 : *la première story de l'Epic 4 (identification joueur) se construit-elle sans créer un composant de strate 3 ni ajouter un token ?*

**Ce qu'elle peut poser tel quel, sans écrire une classe :**
- **un CTA**, dans l'une des six variantes (`accent`, `neutral`, `setup`, `start`, `bar`, `pass`) — avec son dégradé, sa hauteur de cible, son rayon, sa typographie, son retour d'appui et son `@pointerdown` ;
- **une pop-up complète** — voile, `role="dialog"`, nom accessible, carte en verre, pied de CTA, fermeture au tap dehors, et son placement latéral si elle doit épargner une carte ;
- **le mécanisme de fermeture au voile** seul, si un jour un autre objet en a besoin ;
- **un clavier** (`NumericPad`, `AlphaKeyboard`) et une **touche** (`KEY_CLASSES`) ;
- **un picto d'action** (`IconAction`), une **tuile de mode** (`ModeTile`), un **item de barre latérale** (`SideBar`, qui reçoit ses items de l'écran), un **picto** (`PictoIcon`) ;
- **une bille** — picto, libellé et classe de pastille (`ballAssets`) ;
- toute l'**échelle typographique**, la **palette**, les **rayons**, les **ombres** et les **tailles de boîte** en tokens (`--text-*`, `--tracking-*`, `--color-*`, `--gradient-*`, `--radius-*`, `--shadow-*`, `--size-*`), et la **grille fluide** `--spacing`.

**Ce qui lui manquerait encore, et qu'il faudra décider quand l'écran arrivera :**
- **une liste ou une grille de choix à n éléments** — l'accueil a ses tuiles de mode, le paramétrage ses deux cartes, mais il n'existe **aucun composant de sélection dans une liste** (choisir un joueur parmi vingt). `billiboard_player*.png` montre exactement cet écran : c'est la première chose que l'Epic 4 devra dessiner, et ce sera légitimement un composant de base **neuf** — pas un échec du critère, un trou identifié d'avance.
- **un champ de saisie réutilisable** — `FIELD_CLASSES` vit dans `PlayerSetupCard` et n'en est pas sorti (une définition, un fichier, encre noire sur carte claire). Dès qu'un second écran a besoin d'un champ **sur fond sombre**, il faudra le sortir et lui donner ses deux jeux de couleurs.
- **un état vide et un état de chargement** — aucun des deux n'existe nulle part dans le produit ; la liste de joueurs en aura besoin.
- **`ADJUST_BUTTON_CLASSES`** (`PlayerPanel`) reste local, à dessein : un contexte, un fichier.

**Verdict.** Pour tout ce qui est CTA, pop-up, touche, picto et token, le critère est **tenu** : un écran neuf consomme, il ne crée pas. La liste de sélection est le seul manque structurant, et il est nommé.

### File List

**Nouveaux (7)**
- `1score/src/composables/useBackdropClose.ts`
- `1score/src/composables/useBackdropClose.test.ts`
- `1score/src/components/CtaButton.vue`
- `1score/src/components/CtaButton.test.ts`
- `1score/src/components/PopupCard.vue`
- `1score/src/components/PopupCard.test.ts`
- `1score/src/components/ballAssets.ts`

**Modifiés — code (17)**
- `1score/src/assets/main.css` — les quatre `--*-popup-inset-*` retirés (avec leurs deux blocs de commentaire, remplacés par la note qui dit où ils sont partis) ; `min-width: 320px` retiré
- `1score/src/components/PromptModal.vue` — délègue voile, carte et fermeture à `PopupCard` ; trois CTA en `CtaButton` ; `BALL_CLASSES` sorti dans `ballAssets`
- `1score/src/components/ScoreEntryDock.vue` — idem ; `VALIDER` garde sa barre de rebours en slot ; prop `reserve`
- `1score/src/components/NumericPadDock.vue` — idem ; prop `reserve`
- `1score/src/components/AlphaKeyboardSheet.vue` — idem ; prop `reserve`
- `1score/src/components/HomeScreen.vue` — `SETUP_POPUP_RESERVE` + `entryPopupReserve` ; deux réglages et `DÉMARRER` en `CtaButton` ; `SETUP_CTA_CLASSES` supprimé
- `1score/src/views/GameView.vue` — `GAME_POPUP_RESERVE`, transmis à `ScoreEntryDock`
- `1score/src/components/ActionBar.vue` — CTA de barre en `CtaButton`
- `1score/src/components/CenterPanel.vue` — `PASSER LE TOUR` en `CtaButton`
- `1score/src/components/GameSummary.vue` — `BALL_PICTOS` consommé depuis `ballAssets` via `ballOf` ; les deux `clip-path` du bandeau en unités de grille
- `1score/src/components/PlayerSetupCard.vue` — `BALL_PICTOS` / `BALL_LABELS` sortis ; `touch-manipulation select-none` retiré
- `1score/src/components/PlayerPanel.vue` — `touch-manipulation select-none` retiré du `<button>` d'ajustement (**conservé sur la racine `<div>`, ligne 183**) ; graphies de token de taille
- `1score/src/components/IconAction.vue`, `ModeTile.vue`, `SideBar.vue`, `keyClasses.ts` — `touch-manipulation select-none` retiré (tous des `<button>`, vérifié un par un)
- `1score/scripts/render-static.cjs` — chemin Playwright surchargeable par `PLAYWRIGHT_MODULE`

**Modifiés — tests (7)**
- `1score/src/assets/tokens.test.ts` — trois `describe` de la 11.3 (un seul gabarit de CTA, insets rapatriés, aucune redondance de classe) ; `ballAssets.ts` ajouté au balayage des chaînes de classes
- `1score/src/components/PromptModal.test.ts` — graphies de token de taille
- `1score/src/components/ScoreEntryDock.test.ts`, `NumericPadDock.test.ts`, `AlphaKeyboardSheet.test.ts` — les assertions d'inset lisent le style en ligne et vérifient toujours l'asymétrie ; `RESERVE` de test ; « binds pointerdown only » devient « binds no click of its own »
- `1score/src/components/IconAction.test.ts` — perd l'assertion `touch-manipulation`, garde le reste ; graphies de token
- `1score/src/components/PlayerPanel.test.ts` — assertion **inchangée**, commentaire ajouté : elle est le dernier garde-fou de la seule occurrence conservée
- `1score/src/components/GameSummary.test.ts` — le biais doit être en unités de grille et sans pixel figé

**Modifiés — documents (5)**
- `DESIGN.md` — Components › **Bibliothèque de base (strate 3)** (contrats des trois briques) ; Buttons, Layout › Pop-ups, Shapes › Coupes en biais, Pop-ups (signature) mis en cohérence
- `.impeccable/design.json` — `button-bar` et `button-pass` ajoutés (six variantes), descriptions rattachées à `CtaButton` / `PopupCard`, biais du bandeau en unités de grille
- `1score/CLAUDE.md` — §8 **réécrit** (pas de breakpoint d'écran : container queries, grille fluide, `clamp()` ; `--breakpoint-lg: initial` nommée comme la garde) ; §10 mis à jour (le patron des pop-ups est un composant ; les insets sont rapatriés)
- `_bmad-output/planning-artifacts/epics.md` — Story 11.3 annotée (livraison, preuve, trois écarts, deux décisions)
- `_bmad-output/implementation-artifacts/deferred-work.md` — quatre reports

## Change Log

- **2026-09-16 — Story 11.3 livrée, statut `review`.** Bibliothèque de base : `useBackdropClose`, `CtaButton` (six variantes), `PopupCard`, `ballAssets`. Quatre insets rapatriés dans les écrans. Balayage des redondances (17 `touch-manipulation` sur 18, deux graphies de token de taille, `min-width: 320px`). `CLAUDE.md` §8 réécrit, contrats écrits dans `DESIGN.md`. **1013 tests verts (29 fichiers, +169), build vert, `src/stores/` intact, 32 captures sur 36 identiques au pixel, `impeccable detect` à zéro constat.** Deux différences de rendu voulues et nommées : le biais du bandeau de récap en unités de grille (visible à 1920) et le retour d'appui du CTA neutre unifié sur `brightness(1.25)` (état enfoncé seulement).
- **2026-09-16 — Décision de Nathan au rendu : découpe Billiboard écartée.** Les deux propositions coupent le débordement du disque du chrono ; le corriger demande du markup. Reportée en story de mise en page, `DESIGN.md` › Shapes inchangé.
- **2026-09-16 — Décision de Nathan : exception UX-DR8 des touches alpha confirmée.** 47 / 50 / 82 px pour un plancher de 57 ; quatre leviers chiffrés, aucun acceptable. Écart consigné.
