# Story 11.4: Garde-fou outillé — scans aux trois formats, contraste calculé, écarts documentés, ré-audit

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (ou agent) qui livre une story visuelle,
I want qu'un script mesure aux trois formats ce que 1026 tests ne voient pas — contraste sur la surface réelle, tailles, cibles, rythme — sur **tous** les écrans et non le seul accueil, et que chaque écart assumé soit encodé avec sa raison,
so that le design system se maintienne mécaniquement, sans repasser par une table de contraste à la main.

> **Cadrage (bmad-create-story, 2026-09-17).** Quatrième et dernière story de code de l'Epic 11. Les trois précédentes ont produit **la matière** (échelle, palette, briques) ; celle-ci produit **l'instrument qui la surveille**. C'est une story d'**outillage** : à l'arrivée, l'app rend la même chose — sauf si un scan trouve un vrai défaut, auquel cas il se corrige ici.
>
> **Décision de Nathan (2026-09-17) : la 11.4 passe AVANT la passe de rendu V1.2** (formats de CTA, reliefs, découpe du scoreboard — entrée de `deferred-work.md` du jour). Conséquence à assumer : le ré-audit chiffré de l'AC7 mesure le design system **tel que l'Epic 11 le laisse**, pas le design final. La passe de rendu le périmera en partie, et rejouera l'audit en clôture — ce qui sera bon marché **parce que** cette story l'aura outillé. C'est le sens de l'ordre choisi : la passe de rendu tranchera sur des mesures, pas à l'œil.
>
> **Décision de Nathan (2026-09-17) : les écrans deviennent adressables par `?scene=`,** lu **avant le premier rendu** et désactivé en production. Les deux autres pistes (captures HTML statiques scannées en `file://`, rejeu de gestes après chargement) sont écartées : la seconde ne marche pas — `detect` ne sait pas attendre.
>
> **Nature des références visuelles : AUCUNE.** Rien ne se dessine ici. Le seul changement d'apparence possible est la **correction d'un défaut que le scan trouve** (candidat connu et nommé : le libellé de `PASSER LE TOUR`, AC4) — et elle passe par `DESIGN.md` d'abord, comme toute valeur. Aucune combinaison inédite à annoncer.
>
> **Ce que l'audit a mesuré et qui reste ouvert ici** (`design-system-audit-2026-09-15.md`) : §1 « limite du scan d'URL — le détecteur ne rend que l'accueil, rendre les écrans adressables est une tâche de la Story 11.4 », §6 « contraste mesuré sur la surface réelle en 10.7 : cette rigueur est celle qu'il faut outiller en 11.4 », §7.4 « scripts `design:check` aux trois formats, écrans adressables, contraste calculé par outil, `ignores` avec `--reason`, ré-audit chiffré ».
>
> **Quatre reports explicitement adressés à cette story**, tous dans `deferred-work.md` : les passes `/impeccable polish` et `/impeccable extract` de la revue 11.3 ; le miroir de `tokens.test.ts` qui recopie `DESIGN.md` à la main (revue 11.2 : « à faire lire le frontmatter YAML par le garde-fou outillé de la 11.4 ») ; le contraste de `PASSER LE TOUR` mesuré en un seul point (revue 11.2 : « aux scans de contraste de la 11.4 ») ; le durcissement du harnais (revue 11.2 : « à durcir si un second poste ou la 11.4 s'en sert » — elle s'en sert).
>
> **Tout l'outillage a été essayé à la création de la fiche** (2026-09-17, commit `a6ca706`, arbre propre). Ce qui marche, ce qui ne marche pas et les commandes exactes sont dans Dev Notes › État de l'outillage — **rien n'y est supposé**. Trois écarts au texte de l'AC d'`epics.md` en découlent, signalés en clair dans les AC, pas enfouis.

## Acceptance Criteria

**AC1 — Deux scripts, trois formats, sorties datées**
**Given** `1score/package.json`
**When** on lance `npm run design:check`
**Then** le détecteur Impeccable scanne l'application rendue **aux trois formats** (1920×1080, 1180×733, 1133×744) par `--viewport`, et `npm run design:check:file` scanne `src` ; les deux écrivent du JSON daté dans `.impeccable/baseline/`. ⚠️ **Nomenclature changée le 2026-09-18 (décision de Nathan, à la relecture) : UN SEUL récapitulatif par lancement** (`AAAA-MM-JJ-scan-url.json`, `AAAA-MM-JJ-scan-src.json`) et non un fichier par mesure. La première version suivait le texte de l'AC (`AAAA-MM-JJ-<scène>-<WxH>.json`, nomenclature des trois fichiers du 2026-09-15) : elle produisait **37 fichiers par passe, tous contenant exactement `[]`** quand l'app est propre. Le récapitulatif porte la même information — cible, format, code de sortie, constats en entier, et message d'erreur pour une mesure en échec plutôt qu'un `findings: []` qui la ferait passer pour propre. Les trois fichiers du 2026-09-15 ne bougent pas : ils sont la ligne de base
**And** les scripts appellent le **lanceur du dépôt** `../.claude/skills/impeccable/scripts/impeccable` et **non** `npx impeccable` — écart assumé au texte de l'AC d'`epics.md` et du §7 d'`integration-bmad-impeccable.md` : `npx impeccable` n'est pas installé et voudrait **télécharger la 4.1.0** alors que le dépôt embarque la **4.0.0** (binaire `darwin-arm64`, sans Node, hors ligne). Deux versions de détecteur = deux lignes de base incomparables ; la raison est écrite dans `package.json` à côté du script
**And** le **code de sortie est propagé** : `0` propre, `2` constats, `1` échec de scan — un script qui avale le `2` ne garde-fou rien. Le script d'URL **échoue clairement** si aucun serveur ne répond (`net::ERR_CONNECTION_REFUSED`, sortie `1`), il ne rend pas « 0 constat »

**AC2 — Les cinq écrans et les quatre pop-ups sont adressables, et scannés**
**Given** l'application, qui n'a qu'une route (`/`) et enchaîne ses écrans par état — de store **et** de composant
**When** le scan d'URL tourne
**Then** chacune des **douze scènes** est adressable par `?scene=<id>`, et les identifiants sont **exactement les noms de capture du harnais** (`01-accueil`, `02-jds`, `03-parametrage-vide`, `04-popup-clavier-alpha`, `05-popup-pave-numerique`, `06-parametrage-rempli`, `07-scoreboard-jds`, `08-popup-saisie-serie`, `09-scoreboard-jds-en-partie`, `10-popup-decision`, `11-recap`, `12-scoreboard-3bandes`) : **un seul vocabulaire** pour les scans et pour les captures
**And** la scène est atteinte **avant le premier rendu** (`main.ts` pour la part store, avant `app.mount()` ; `HomeScreen` et `GameView` sèment leur état local **une fois au setup**) — `detect` scanne à la fin du chargement et **n'attend rien** : une scène atteinte par un geste différé serait scannée trop tôt, en silence
**And** le mécanisme est **inerte en production** : garde `import.meta.env.DEV`, et la preuve est un `grep` sur `dist/` après `npm run build` — aucune occurrence de `scene` issue de ce code
**And** `src/stores/` reste **intact** (`git diff --stat -- 1score/src/stores` vide) : les scènes n'appellent que des actions publiques existantes (`startGame`, `openScoreEntry`, `appendScoreDigit`, `validateScoreInput`, `finishGame`, `incrementSeries`, `discardSavedGame`…)
**And** chaque scène **efface d'abord toute partie sauvegardée** (`discardSavedGame()`), sinon la pop-up `PARTIE EN COURS` se pose par-dessus l'écran visé et le scan mesure la mauvaise chose
**And** les **36 scans** (12 scènes × 3 formats) sont archivés et leurs constats relevés dans Dev Agent Record, écran par écran

**AC3 — Aucun ignore sans raison**
**Given** un écart assumé par Nathan que le détecteur signale
**When** il est encodé
**Then** il l'est dans `.impeccable/config.json` (`detector.ignoreValues` / `ignoreRules` / `ignoreFiles`) ou en commentaire en ligne (`<!-- impeccable-disable <règle> -- raison -->`), **toujours avec une raison qui cite** l'entrée de `deferred-work.md` ou la décision d'`epics.md`
**And** ⚠️ **le CLI ne porte `--reason` que sur `add-value`** (vérifié : `ignores add-rule` et `add-file` n'ont pas l'option) — un `ignoreRules` ou un `ignoreFiles` ne peut donc **pas** porter sa raison dans le fichier. Règle de la story : **on préfère `add-value`** ; si une règle entière doit tomber, sa raison est écrite dans `DESIGN.md` › Écarts assumés **et** son entrée listée dans la fiche — un `ignoreRules` nu est refusé
**And** la liste des ignores est **re-dérivée d'un scan réel**, pas recopiée : deux des cinq lignes du tableau d'`integration-bmad-impeccable.md` §8 sont **périmées** — la police système (Saira est auto-hébergée depuis la 11.2) et les noirs profonds (le fond est marine `#1E2438` depuis la 11.2). Chaque ligne périmée est signalée comme telle dans la fiche

**AC4 — Le contraste est calculé par l'outil, sur la surface réelle**
**Given** une story visuelle livrée
**When** elle se termine
**Then** le contraste est calculé par le détecteur (règle `low-contrast`, qui mesure **le stop de dégradé réel** sous le texte — vérifié à la création de la fiche) et **plus par une table manuelle dans la fiche** ; `CLAUDE.md` §9 décrit la passe outillée comme étape de fin de story, à côté de la passe navigateur qui reste obligatoire
**And** le garde-fou est **vérifié par mutation**, comme la 10.7 l'a institué : les **deux P1 de l'audit** (libellé de CTA de réglage `text-stat` sur `--gradient-blue` = 3,46:1 ; `DÉMARRER` à plancher 16 px sur `--gradient-red` = 3,78:1), réintroduits par surcharge CSS injectée, **doivent ressortir en constats**. S'ils ne ressortent pas, le scan ne prouve rien et la story le dit au lieu de le taire
**And** le report de la revue 11.2 est **tranché** : le libellé `PASSER LE TOUR` (`text-stat`, blanc sur `--gradient-blue`) est mesuré **sur sa surface réelle aux trois formats** ; s'il ne tient pas le seuil, il monte en `label` comme les CTA de réglage l'ont fait en 11.1 — `DESIGN.md` d'abord, `main.css` ensuite, jamais dans le gabarit (`CLAUDE.md` §7), et la valeur annoncée par `DESIGN.md` › Buttons (« 4,95:1 au milieu du dégradé ») est corrigée par la mesure

**AC5 — Les tests lisent `DESIGN.md`, ils ne le recopient plus**
**Given** `tokens.test.ts` (`RADIUS_ROLES`, `SHADOW_ROLES`) et `typography.test.ts` (`TEXT_ROLES`, `VIEWPORT_CLAMPED_ROLES`, `TRACKING_ROLES`, `SIZE_ROLES`), qui recopient aujourd'hui le frontmatter **à la main**
**When** la story est livrée
**Then** les listes sont **lues dans le frontmatter YAML de `DESIGN.md`** : renommer un rôle ou en ajouter un dans `DESIGN.md` sans toucher `main.css` **rougit**, et l'inverse aussi — le miroir devient un vrai miroir, et non la comparaison de deux listes écrites par la même main
**And** la lecture passe par `vitest.config.ts` › `server: { fs: { allow: ['..'] } }` : sans lui, l'import échoue sur `Denied ID …/DESIGN.md?raw` (vérifié dans les deux sens à la création de la fiche). Aucune dépendance YAML n'est ajoutée — le frontmatter se lit avec un parseur de quelques lignes, dans l'esprit des tests de source existants
**And** le garde-fou est **vérifié par mutation** : un rôle renommé dans `DESIGN.md` fait rougir, et un rôle retiré aussi

**AC6 — Les deux passes reportées par la 11.3 ont lieu**
**Given** le report de la revue 11.3 (« AC9 / AC3 : `/impeccable polish` et `/impeccable extract` n'ont pas eu lieu »)
**When** la story se termine
**Then** `/impeccable extract` est passé et son résultat **comparé** aux contrats de `DESIGN.md` › Bibliothèque de base écrits à la main en 11.3 — **comparé, pas substitué** : tout écart qui rouvrirait une décision déjà tranchée (six variantes de CTA, `ALIGN_CLASSES` supprimé, `useBackdropClose` consommé à travers `PopupCard`) est **écarté et dit**, et seuls les manques réels sont ajoutés
**And** `/impeccable polish` est passé sur les fichiers touchés par la story, et ce qu'il propose hors périmètre (formats de CTA, reliefs) part dans l'entrée « passe de rendu V1.2 » de `deferred-work.md` au lieu d'être appliqué ici

**AC7 — Ré-audit chiffré et clôture de la passe**
**Given** `design-system-audit-2026-09-15.md` (14/20, ligne de base)
**When** la story se termine
**Then** `/impeccable audit` est **rejoué** et son score consigné **à côté** de la ligne de base, dimension par dimension, avec ce qui a fermé chaque constat P1/P2/P3 (ou pourquoi il reste ouvert) ; `DESIGN.md` est relu contre le code livré (`/impeccable document`) — ⚠️ **en relecture, pas en écrasement** : le document porte des décisions datées de Nathan qu'aucune régénération ne doit effacer
**And** `deferred-work.md` reçoit les reports de la story, et l'entrée « passe de rendu V1.2 » est mise à jour du séquencement tranché (11.4 avant, ré-audit à rejouer en clôture de la passe de rendu)
**And** le **critère de sortie de l'epic** est instruit sous la forme d'une **liste de contrôle** à dérouler à la création de la première story de l'Epic 4 — l'écran d'identification joueur n'existe pas encore, sa fiche non plus, et l'AC d'`epics.md` (« vérifié sur la fiche de la première story de l'Epic 4 ») **ne peut pas** être tenue dans cette story : l'écart est nommé. La 11.3 a déjà nommé les quatre manques (liste de sélection, champ sur fond sombre, état vide, état de chargement) ; la 11.4 y ajoute ce que ses scans ont appris
**And** ⚠️ **l'epic ne se clôt pas ici** : la passe de rendu V1.2 suit (décision du 2026-09-17), et c'est elle qui rejouera l'audit en dernier

**AC8 — Harnais durci, bornes comprises** *(la plus basse priorité : peut être reportée sans bloquer le reste)*
**Given** `1score/scripts/render-static.cjs`, que cette story utilise pour les surcharges de mutation d'AC4
**When** la story se termine
**Then** les plantages qu'un second poste rencontre sont fermés (report de la revue 11.2, **borné à cette liste**) : `outDir` absent, `--url` / `--override` en dernier argument, fichier de surcharge introuvable, format sans `x`, `audit.json` jamais écrit quand un format plante
**And** le chemin Playwright par défaut cesse d'être un chemin personnel : `PLAYWRIGHT_MODULE` reste la surcharge, mais l'absence du module **dit quoi faire** au lieu de jeter un `MODULE_NOT_FOUND`
**And** rien d'autre n'est refait dans ce script : il est hors build, non testé, et ce n'est pas le sujet de la story

## Tasks / Subtasks

- [x] **Task 1 — Ligne de base outillée, avant toute modification** (AC1, AC2)
  - [x] Arbre propre sur `a6ca706` ; `npm test` (**1026 attendus, 29 fichiers**) et `npm run build` verts, notés dans Dev Agent Record
  - [x] `npm run dev` depuis `1score/` (serveur **neuf** — voir Pièges), puis scan de l'accueil aux trois formats et de `src` avec le lanceur du dépôt ; comparer aux trois fichiers de `.impeccable/baseline/` du 2026-09-15 et **noter ce qui a fermé** (attendu : les 3 `undersized-ui-text` du badge `BIENTÔT`, fermés par la 11.1)
- [x] **Task 2 — Les deux scripts npm** (AC1)
  - [x] `design:check` et `design:check:file` dans `1score/package.json`, lanceur du dépôt, `--viewport` par format, JSON daté dans `.impeccable/baseline/`
  - [x] Commentaire dans `package.json` (ou `README`) disant **pourquoi pas `npx impeccable`** : 4.1.0 téléchargée contre 4.0.0 embarquée, deux lignes de base incomparables
  - [x] Vérifier les trois codes de sortie à la main : scan propre (`0`), scan avec constat (`2`, en injectant une faute), serveur éteint (`1`)
- [x] **Task 3 — Les douze scènes adressables** (AC2)
  - [x] `src/dev/scenes.ts` : table des douze scènes (état store + état d'écran), `readScene()` qui rend `null` hors `import.meta.env.DEV`, **named exports** (`CLAUDE.md` §1)
  - [x] `main.ts` : après `checkSavedGame()`, **avant** `app.mount()` — `discardSavedGame()` puis application de la part store de la scène
  - [x] `HomeScreen` : semer `step`, `selectedCategory`, `selectedMode`, `players`, `whiteSide`, `entry`, `draft`, `distanceError`, `cadrePromptOpen` — **une fois, au setup**, jamais dans un `watch`
  - [x] `GameView` : semer `exitPromptOpen` (scène `10-popup-decision`)
  - [x] Test de source : la garde `import.meta.env.DEV` existe sur chaque point d'entrée ; `npm run build` puis `grep -r scene 1score/dist/assets` ne rend rien de ce code
  - [x] `git diff --stat -- 1score/src/stores` **vide**
- [x] **Task 4 — Scanner les douze scènes aux trois formats** (AC2)
  - [x] 36 scans, JSON archivé, **relevé écran par écran** dans Dev Agent Record : ce qui est propre, ce qui sort, ce qui est un faux positif (et pourquoi)
  - [x] Tout constat **réel** est corrigé ici (`DESIGN.md` d'abord si une valeur bouge) ; tout constat **assumé** part en AC3 ; aucun constat ne reste sans l'une des deux étiquettes
- [x] **Task 5 — Encoder les écarts assumés, avec raison** (AC3)
  - [x] `.impeccable/config.json` créé (il n'existe pas) ; un `add-value --reason` par écart, chaque raison citant `deferred-work.md` ou `epics.md`
  - [x] Candidats connus, **à confirmer par le scan et non à encoder d'avance** : accroche `ModeTile` à 3,46:1 (affichée par aucune tuile), anneau de focus rouge sur bleu roi à 1,82:1 (borne sans clavier), touches alpha 47/50/82 px pour un plancher de 57 (exception UX-DR8 confirmée par Nathan), commandes inactives sous le seuil (`disabled:opacity-30`, exclues par WCAG §1.4.3)
  - [x] **Ne pas reprendre** les deux lignes périmées du §8 (police système, noirs profonds) : les signaler périmées dans la fiche
  - [x] `impeccable ignores list` en sortie de tâche, collé dans Dev Agent Record
- [x] **Task 6 — Contraste : la preuve par mutation, puis `PASSER LE TOUR`** (AC4)
  - [x] Surcharge CSS qui réintroduit les deux P1 de l'audit ; scanner ; **les deux doivent ressortir**. Résultat consigné tel quel, même s'il est décevant
  - [x] Mesurer `PASSER LE TOUR` sur sa surface réelle aux trois formats ; trancher (report de la revue 11.2) ; corriger `DESIGN.md` › Buttons de la valeur mesurée
  - [x] `CLAUDE.md` §9 : la passe outillée entre comme étape de fin de story, **à côté** de la passe navigateur manuelle qui reste obligatoire (le détecteur ne voit ni géométrie inventée ni logique — `integration-bmad-impeccable.md` §7)
- [x] **Task 7 — Les tests lisent `DESIGN.md`** (AC5)
  - [x] `vitest.config.ts` : `server: { fs: { allow: ['..'] } }`, avec le commentaire qui dit pourquoi (à côté du piège `test.css.include` déjà documenté)
  - [x] Parseur de frontmatter minimal (quelques lignes, aucune dépendance) ; `tokens.test.ts` et `typography.test.ts` dérivent leurs six listes de `DESIGN.md`
  - [x] **Mutation** : renommer un rôle dans `DESIGN.md` → rouge ; en retirer un → rouge ; remettre
- [x] **Task 8 — Harnais durci** (AC8) — *dernière, reportable*
  - [x] Les cinq plantages listés, et rien d'autre ; message clair si Playwright manque
- [x] **Task 9 — `extract` et `polish`** (AC6)
  - [x] `/impeccable extract` → comparer aux contrats écrits en 11.3 ; écarts qui rouvrent une décision tranchée : **écartés et dits**
  - [x] `/impeccable polish` sur les fichiers touchés ; ce qui relève du rendu part dans l'entrée « passe de rendu V1.2 »
- [x] **Task 10 — Ré-audit et clôture** (AC7)
  - [x] `npm test`, `npm run build` verts ; `git diff --stat -- 1score/src/stores` vide ; `design:check` + `design:check:file` propres (ou constats tous étiquetés)
  - [x] Passe navigateur manuelle aux trois formats, **paysage seulement** (`CLAUDE.md` §9) : les douze scènes s'ouvrent bien par `?scene=`, et l'app sans paramètre se comporte **exactement** comme avant
  - [x] `/impeccable audit` rejoué ; score dimension par dimension **en regard** du 14/20 ; `DESIGN.md` relu (pas écrasé)
  - [x] `deferred-work.md` : reports de la story + mise à jour de l'entrée « passe de rendu V1.2 » (séquencement tranché) ; `epics.md` › Story 11.4 annotée des décisions et des trois écarts ; `sprint-status.yaml` → `review`
  - [x] Liste de contrôle du critère de sortie écrite pour la première story de l'Epic 4 (AC7)

## Dev Notes

### État de l'outillage à l'arrivée (essayé le 2026-09-17, commit `a6ca706`, arbre propre)

**Rien de ce paragraphe n'est supposé : tout a été lancé.**

| Fait | Détail |
|---|---|
| **Le binaire vit dans le dépôt** | `.claude/skills/impeccable/scripts/impeccable` — lanceur `sh`, binaire `bin/darwin-arm64/impeccable` (12,8 Mo), **version 4.0.0**, aucun Node requis. Depuis `1score/` : `../.claude/skills/impeccable/scripts/impeccable` |
| **`npx impeccable` ne marche pas** | `npx --no-install impeccable` → `missing packages ["impeccable@4.1.0"]`. Sans `--no-install`, npx **télécharge la 4.1.0** : version différente du binaire embarqué |
| **`detect src` : 0 constat, exit 0** | Confirme le relevé de la 11.3. ⚠️ Un scan propre n'affiche **rien du tout** — pas même « 0 constat ». Ne pas conclure « le scan n'a pas tourné » : lire le code de sortie |
| **`detect <url>` marche vraiment** | `detect http://localhost:5174/ --viewport 1920x1080\|1180x733\|1133x744` → **0 constat aux trois**, exit 0. Les 3 `undersized-ui-text` de la ligne de base du 2026-09-15 (badge `BIENTÔT` à 10 px) sont **fermés** par la 11.1 |
| **URL injoignable = exit 1** | `Error: net::ERR_CONNECTION_REFUSED` — le script ne peut pas confondre « rien à signaler » et « rien scanné » |
| **`--json` sort sur stdout, le texte sur stderr** | Scan propre en JSON : `[]`. Rediriger `2>` pour garder le texte |
| **Aucun `.impeccable/config.json`** | `ignores list` : `ignoreRules (none)`, `ignoreFiles (none)`, `ignoreValues (none)`, `designSystem: enabled`. Tout est à créer |
| **`--reason` n'existe que sur `add-value`** | `ignores add-rule <rule>` et `add-file <glob>` n'ont pas l'option. C'est la contrainte qui fonde la règle d'AC3 |
| **`audit`, `document`, `extract`, `polish` ne sont PAS des commandes CLI** | Le binaire n'expose que `detect`, `ignores`, `help`, `install`, `link`, `update`, `check`. Les autres sont des **workflows d'agent** décrits dans `.claude/skills/impeccable/reference/<nom>.md` — à lire et à dérouler, pas à lancer |
| **`detect` lit `DESIGN.md` et `.impeccable/design.json`** | Activé par défaut (`designSystem: enabled`) ; `--no-design-system` pour s'en passer. C'est pourquoi la revue 11.3 tenait à régénérer les six snippets de `design.json` : **le détecteur mesure contre eux** |
| **Scripts npm : absents** | `1score/package.json` n'a que `dev`, `build`, `preview`, `test` |

### Le détecteur sait calculer le contraste sur un dégradé — vérifié

Page de sondage (blanc sur `linear-gradient(#3B82F6, #1D4ED8)`, blanc sur `#2E8FDB`, gris sur marine, texte à 10 px) :

```
[low-contrast] 3.7:1 (need 4.5:1) — text #ffffff on #3b82f6
[low-contrast] 3.5:1 (need 4.5:1) — text #ffffff on #2e8fdb
[low-contrast] 4.3:1 (need 4.5:1) — text #888888 on #1e2438
[undersized-ui-text] 10px functional text "BIENTOT" (below 11px floor)
4 anti-patterns found.   (exit 2)
```

**Il nomme le stop de dégradé réel** (`#3b82f6`, le stop clair) : c'est exactement la mesure « sur la surface réelle » que la 10.7 faisait à la main et que l'AC4 veut automatiser. Il applique aussi le seuil « grand texte » (3:1) — c'est pourquoi l'accueil est propre aujourd'hui : la 11.1 a monté les libellés de CTA de réglage en `--text-label` (plancher **20 px** gras), ce qui bascule le seuil de 4,5:1 à 3:1 et fait passer le 3,46:1.

> **Donc : le scan de l'accueil est propre parce que l'accueil a été corrigé, pas parce que le détecteur est aveugle.** La mutation d'AC4 est là pour le prouver, et c'est la seule chose qui distingue un garde-fou d'un placebo.

### Pourquoi le scan ne voit qu'un écran, et ce qu'il faut semer par scène

Une seule route (`router/index.ts` : `/` → `GameView`, plus un catch-all de redirection). Tout le reste est de l'**état**, et il vit à **trois endroits** :

| Où | Ce qu'il porte | Scènes concernées |
|---|---|---|
| **store** (`useGameStore`) | `mode`, `status`, joueurs, reprises, `entryOpen`, `currentInput`, `endPrompt`, `whiteSide` | 07 → 12 |
| **`HomeScreen`** (refs locales, `:105-134`) | `step`, `selectedCategory`, `selectedMode`, `players`, `whiteSide`, `entry`, `draft`, `distanceError`, `cadrePromptOpen`, `fixingDistances` | 01 → 06 |
| **`GameView`** (refs locales, `:219,283`) | `exitPromptOpen`, `restartPromptOpen` | 10 |

État visé par scène, calqué sur le parcours du harnais (`scripts/render-static.cjs:113-180`) :

| Scène | État à poser |
|---|---|
| `01-accueil` | rien (mais **effacer la sauvegarde**) |
| `02-jds` | `step='mode'`, catégorie `series` |
| `03-parametrage-vide` | `step='players'`, `selectedMode='libre'`, joueurs vides |
| `04-popup-clavier-alpha` | idem + `entry={ball:'white',field:'name'}`, `draft='MICHEL'` |
| `05-popup-pave-numerique` | blanc nommé + `entry={ball:'white',field:'distance'}`, `draft='30'` |
| `06-parametrage-rempli` | blanc `MICHEL`/30, jaune `JEAN PIERRE`/25 |
| `07-scoreboard-jds` | `startGame('libre','MICHEL','JEAN PIERRE',{player1:30,player2:25})` |
| `08-popup-saisie-serie` | idem + `openScoreEntry()` + `appendScoreDigit` ×2 (`'12'`) |
| `09-scoreboard-jds-en-partie` | idem + trois séries validées (12, 7, 15) |
| `10-popup-decision` | scène 09 + `exitPromptOpen=true` (**`GameView`**) |
| `11-recap` | scène 09 + `finishGame()` → `status='finished'` |
| `12-scoreboard-3bandes` | `startGame('3bandes',…,{15,15})` + `incrementSeries()` ×3 |

⚠️ **`JEAN PIERRE` déborde volontairement** au paramétrage et au récap à 1133 (ellipse assumée, relevée en 11.3) : c'est un débordement **attendu**, pas un constat.

### Pourquoi « avant le premier rendu », et pas un rejeu de gestes

`detect` charge l'URL et scanne **à la fin du chargement**. Il n'a ni option d'attente, ni sélecteur à guetter. Une scène atteinte par des `pointerdown` différés serait scannée **avant** d'exister — et le scan rendrait « 0 constat » sur l'accueil en croyant mesurer le scoreboard. D'où la règle : `main.ts` avant `app.mount()`, et un semis **au setup** dans les deux hôtes, jamais dans un `watch` ni un `onMounted` asynchrone.

`main.ts` a déjà exactement ce point d'accroche (`checkSavedGame()` appelé avant le montage, pour la Story 1.12) : la scène s'applique juste après, en commençant par `discardSavedGame()`.

### Faire lire `DESIGN.md` par les tests — le blocage et sa levée, tous deux vérifiés

Sans réglage :

```
Error: Denied ID /Users/…/carom_scoreboard/DESIGN.md?raw
```

Vite refuse tout fichier hors racine du projet (`1score/`). La levée, essayée et vue verte :

```ts
// vitest.config.ts
export default defineConfig({
  server: { fs: { allow: ['..'] } },   // DESIGN.md vit à la RACINE DU DÉPÔT, un cran au-dessus
  …
})
```

Un simple `import design from '../../../DESIGN.md?raw'` suffit ensuite — pas besoin d'`import.meta.glob`, et **aucun** réglage `test.css` (ce piège-là ne vaut que pour le CSS). Aucune dépendance YAML : le frontmatter est plat, deux niveaux d'indentation, et se lit en une dizaine de lignes.

Ce qu'il y a à lire (frontmatter de `DESIGN.md`, entre les deux `---`, lignes 1 à 292) : `colors`, `typography`, `tracking`, `rounded`, `shadows`, `spacing`, `components`. Les six listes à dériver :

| Liste | Source dans le frontmatter | Exclusions à conserver (elles ont une raison) |
|---|---|---|
| `TEXT_ROLES` | `typography` | — |
| `VIEWPORT_CLAMPED_ROLES` | `typography`, entrées dont la taille contient `vw` | les `cqw` / `cqmin` / `min()` ne se lisent pas sur l'écran |
| `TRACKING_ROLES` | `tracking` | — |
| `SIZE_ROLES` | `spacing` | hors `base`, `xs`…`2xl` (utilitaires Tailwind) et `clock-bleed` (porté par `--game-clock-bleed`) |
| `RADIUS_ROLES` | `rounded` | hors `none` / `full` (Tailwind) |
| `SHADOW_ROLES` | `shadows` | — |

Ces exclusions **se dérivent**, elles ne se recopient pas : c'est tout l'objet de l'AC5.

### Pièges

- **Un serveur de dev de longue vie ment sur la CSS.** Le cache Tailwind de Vite ne réélague pas ce qu'il a déjà généré (piège consigné en 11.3, il a fait rejouer toute la comparaison pixel). **Redémarrer `npm run dev` avant tout scan qui compte.**
- **Un scan propre n'écrit rien.** Lire `$?`, pas la sortie. `0` propre, `2` constats, `1` échec.
- **Le texte va sur stderr, le JSON sur stdout.** Un `> fichier.json` sans `--json` produit un fichier vide et une impression de succès.
- **`detect` lit `.impeccable/design.json`.** Un snippet qui décrit un composant que le code ne rend plus fait mesurer un fantôme (c'est le constat de la revue 11.3, corrigé). Si un composant change ici, le snippet suit.
- **Ne pas encoder un ignore « pour faire propre ».** Un `ignoreRules` sans raison est une dette silencieuse (`integration-bmad-impeccable.md` §8) — et le CLI ne sait même pas lui en attacher une.
- **Le détecteur est calibré web/SaaS.** Il **ne verra pas** l'anneau qui recouvre le liseré, le médaillon qui déborde, la géométrie couplée du chrono. La passe navigateur reste obligatoire : c'est écrit au §7 d'`integration-bmad-impeccable.md`, et §9 de `CLAUDE.md` doit le dire aussi après la Task 6.
- **La sauvegarde automatique suit les scènes.** Un `watch` du store persiste l'état à chaque changement (`useGameStore.ts:709`) : une scène jouée laisse une partie sauvegardée, et la visite suivante ouvre `PARTIE EN COURS` **par-dessus** l'écran visé. D'où `discardSavedGame()` en tête de chaque scène.
- **`import.meta.env.DEV` est remplacé statiquement** : c'est ce qui fait disparaître le code de production. Le garder **au plus près du point d'entrée** ; une garde posée derrière un appel de fonction non inlinable laisserait la table des scènes dans le bundle.
- **Aucun commentaire HTML à la racine d'un gabarit** (`CLAUDE.md` §12) — vaut pour toute retouche de `HomeScreen` / `GameView`.
- **`npm run build`, pas `vue-tsc --noEmit`** (`CLAUDE.md` §9).
- **`src/stores/` est intouchable sur toute l'epic.** Si une scène semble exiger une action de store nouvelle, c'est que la scène est mal choisie : la reconstruire à partir des actions publiques existantes.
- **Le 1920×1080 ne s'ouvre pas dans Chrome sur cette machine** (plafond mesuré 1384×789, 11.1) : les vérifications à 1920 passent par Playwright ou par `detect --viewport`, jamais par la fenêtre.

### Tests

**Nouveaux ou modifiés :**

- `vitest.config.ts` — `server.fs.allow`, commenté.
- `src/assets/tokens.test.ts` et `src/assets/typography.test.ts` — les six listes dérivées du frontmatter de `DESIGN.md` (AC5). **Les cas existants ne changent pas d'intention**, seulement de source.
- Test de source des scènes — la garde `import.meta.env.DEV` est présente sur chaque point d'entrée ; aucune scène ne touche `src/stores/`.

**Vérifications par mutation** (obligatoires, la 10.7 en a fait la règle : *un test qui ne casse pas quand on casse le code ne prouve rien*) :

1. rôle renommé dans `DESIGN.md` → `typography.test.ts` / `tokens.test.ts` rouges (AC5) ;
2. rôle retiré de `DESIGN.md` → rouges aussi (l'autre sens du miroir) ;
3. les deux P1 de l'audit réintroduits par surcharge → `low-contrast` les signale (AC4).

**Zéro modification** dans `src/stores/**` — preuve : `git diff --stat`.

### Ce que cette story NE fait pas

- **Aucune décision de rendu** : ni format de CTA, ni relief, ni découpe du scoreboard. Tout ça est la passe V1.2, qui vient **après** (décision de Nathan, 2026-09-17). Ce que `polish` proposerait dans ce registre part en report, il ne s'applique pas.
- **Aucun token nouveau, aucune couleur, aucune taille inventée.** Seule exception possible : la correction d'un défaut que le scan trouve (candidat : `PASSER LE TOUR`), et elle passe par `DESIGN.md` d'abord.
- **Aucune nouvelle dépendance** : ni Playwright dans `package.json` (il reste emprunté), ni parseur YAML, ni `impeccable` en npm.
- **Aucune route nouvelle** : `?scene=` est un paramètre, pas une route. Le catch-all du routeur reste tel quel.
- **Aucun piège à focus, aucun `Escape`, aucun `tabindex`** : arbitrage « borne fixe », inchangé.
- **Aucune reprise de `useGameStore`**, ni des règles de jeu, ni de la persistance.
- **Pas de CI** : les scripts se lancent à la main, en fin de story. Les brancher sur un hook ou une action GitHub est une décision qui n'a pas été prise.

### Project Structure Notes

- `src/dev/scenes.ts` — dossier neuf `src/dev/`, qui dit par son nom que rien n'en sort en production. **Named exports** uniquement (`CLAUDE.md` §1) ; test co-localisé (AR16) si un cas le justifie.
- `.impeccable/config.json` — **versionné** (le `.gitignore` n'exclut que `config.local.json`, `hook.cache.json`, `review/`, `*.png`, `live/*`).
- `.impeccable/baseline/*.json` — versionnés, nomenclature `AAAA-MM-JJ-<scène>-<WxH>.json`.
- Scripts npm dans `1score/package.json` ; le lanceur est au-dessus (`../.claude/skills/…`), donc chemin relatif depuis `1score/`.
- `CLAUDE.md` §7 : une valeur qui manque s'ajoute d'abord dans `DESIGN.md`, puis `main.css`, **jamais** dans un gabarit ni dans un composant de base.
- Commande de validation de référence : `npm run build` (`vue-tsc -b && vite build`), depuis `1score/`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 11 — Story 11.4] les cinq AC d'origine ; [#Epic 11, critère de sortie] « la première story de l'Epic 4 se construit sans créer un composant de base ni ajouter un token » ; [#Epic 11, méthode] `DESIGN.md` avant `main.css`, gabarit statique validé, `detect` aux trois formats, passe navigateur, `polish` en clôture
- [Source: _bmad-output/planning-artifacts/design-system-audit-2026-09-15.md#1] limite du scan d'URL, « tâche de la Story 11.4 » ; [#4 P1] les deux couples sous AA qui servent de mutation ; [#6] « contraste mesuré sur la surface réelle en 10.7 : cette rigueur est celle qu'il faut outiller en 11.4 » ; [#7.4] le contenu attendu de la story
- [Source: _bmad-output/planning-artifacts/integration-bmad-impeccable.md#7] ce que le détecteur attrape et **ce qu'il n'attrapera jamais** ; [#8] écarts assumés et méthode des `ignores` (⚠️ tableau daté du 2026-09-15, deux lignes périmées) ; [#2] règle d'or des sources uniques ; [#3] cartographie des commandes
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#code review de la story 11.2] `tokens.test.ts` recopie `DESIGN.md` « à faire lire par le garde-fou outillé de la 11.4 », harnais à durcir, `PASSER LE TOUR` à mesurer « aux scans de contraste de la 11.4 » ; [#code review de la story 11.3] `polish` et `extract` reportés en 11.4 ; [#dev-story 11.3] passe de rendu V1.2, CSS de serveur de dev périmée, chemin Playwright ; [#dev-story 10.7] touches alpha, accroche `ModeTile`, garde `reduced-motion` ; [#dev-story 11.2] anneau de focus à 1,82:1
- [Source: _bmad-output/implementation-artifacts/11-3-….md#Dev Agent Record] 1026 tests / 29 fichiers, protocole de comparaison déterministe (worktree + `freeze-animations.css`), critère de sortie instruit et ses quatre manques
- [Source: 1score/CLAUDE.md#1, #7, #9, #11, #12] nommage et named exports, tokens, stratégie de validation (**§9 à compléter, Task 6**), animations et `reduced-motion`, pièges de gabarit
- [Source: 1score/src/main.ts:13-19] `checkSavedGame()` avant `app.mount()` — le point d'accroche des scènes ; [src/router/index.ts] route unique et catch-all
- [Source: 1score/src/components/HomeScreen.vue:105-134] les dix refs locales à semer ; [src/views/GameView.vue:219,283] `exitPromptOpen` / `restartPromptOpen`
- [Source: 1score/src/stores/useGameStore.ts:709-716,764-813] `watch` de persistance et surface publique des actions (aucune à ajouter) ; [src/services/storageService.ts] écriture locale
- [Source: 1score/scripts/render-static.cjs:113-180] le parcours des douze écrans, dont les noms deviennent les identifiants de scène
- [Source: 1score/src/assets/tokens.test.ts:14-17 ; typography.test.ts:17-39] les six listes recopiées à la main, à dériver
- [Source: DESIGN.md:1-292] frontmatter — `colors`, `typography`, `tracking`, `rounded`, `shadows`, `spacing`, `components` ; [#Buttons] « 4,95:1 au milieu du dégradé » pour `PASSER LE TOUR`, à corriger par la mesure
- [Source: .claude/skills/impeccable/reference/audit.md, extract.md, polish.md, document.md] les quatre workflows d'agent (ce ne sont pas des commandes CLI)
- [Source: PRODUCT.md#Operating Context] salle sombre, lecture à 2 m, 1920×1080 référence, paysage seul, borne sans clavier

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`), session dev-story du 2026-09-17 (débordant sur le 2026-09-18 : les fichiers de `.impeccable/baseline/` portent la date du jeu **final**).

### Debug Log References

#### Ligne de base (Task 1, commit `a6ca706`, arbre propre)

`npm test` **1026 / 29 fichiers** vert, `npm run build` vert. Serveur de dev **neuf** (piège de la CSS de longue vie), scan de l'accueil et de `src` :

| Cible | 2026-09-15 (ligne de base) | À l'arrivée | Lecture |
|---|---|---|---|
| accueil 1920×1080 | 3 × `undersized-ui-text` | **0** | Badge `BIENTÔT` à 10 px : **fermé par la 11.1** (monté en `stat`, plancher 14 px) |
| accueil 1180×733 | 3 × `undersized-ui-text` | **0** | idem |
| accueil 1133×744 | — | **0** | format non couvert en 2026-09-15 |
| `src` (statique) | 0 | **0** | inchangé |

#### ⚠️ Le détecteur ne lisait RIEN de son contexte (découvert en Task 5)

`detect` lit `.impeccable/config.json`, `.impeccable/design.json` et `DESIGN.md` **dans le répertoire courant, sans remonter**. Les trois vivent à la racine du dépôt. Lancé depuis `1score/`, le scan mesurait donc **sans design system et sans ignores**, en silence. Vérifié dans les deux sens : le même `ignoreValues` est inerte depuis `1score/` et actif depuis la racine. `design-check.sh` se place désormais à la racine (`cd "$(dirname "$0")/../.."`) et nomme ses cibles depuis elle. Les 36 scans ont été **rejoués** avec le contexte actif : jeu de constats identique — les tokens sont cohérents, mais les ignores ne pouvaient pas fonctionner avant cette correction.

#### Les trois codes de sortie, vérifiés à la main (Task 2)

| Cas | Attendu | Obtenu |
|---|---|---|
| Scan propre (`design:check:file`) | `0` | `0`, « aucun constat » |
| Faute injectée (`cubic-bezier` de rebond dans un `.css`) | `2` | `2`, `[bounce-easing]` nommé |
| Serveur éteint (`--url http://localhost:59999/`) | `1` | `1`, `net::ERR_CONNECTION_REFUSED` — jamais « 0 constat » |

L'agrégation respecte la priorité **échec > constat > propre** : sur 36 scans, un seul échec impose `1` à l'ensemble.

#### Les douze scènes rendent bien douze écrans différents (Task 3)

Vérifié par Playwright emprunté (`PLAYWRIGHT_MODULE`), 1920×1080, un testid signant chaque écran — **avant** de lancer les 36 scans, faute de quoi ils auraient mesuré douze fois l'accueil :

`01-accueil` +home-tagline · `02-jds` +jds-title · `03-parametrage-vide` +setup-header · `04-popup-clavier-alpha` +setup-header +alpha-keyboard-sheet · `05-popup-pave-numerique` +setup-header +numeric-pad-dock · `06-parametrage-rempli` +setup-header · `07-scoreboard-jds` +score · `08-popup-saisie-serie` +score +score-entry-dock · `09-scoreboard-jds-en-partie` +score · `10-popup-decision` +score +prompt-modal · `11-recap` +game-summary · `12-scoreboard-3bandes` +shot-clock-value. **Aucun `prompt-modal` parasite** hors scène 10.

**Deux défauts trouvés en chemin, tous deux par un test ou une mesure, aucun par relecture :**

1. **`validateScoreInput` ne referme pas la pop-up** — c'est l'écran qui le fait (`GameView.validateEntry` → `closeScoreEntry`). Sans ça, les scènes 09, 10 et 11 auraient été scannées avec le dock de saisie posé **par-dessus** le scoreboard. Trouvé par le test unitaire de la scène 09 (`entryOpen` attendu `false`).
2. **Une scène laissait une partie sauvegardée derrière elle** (voir plus bas, § passe navigateur).

**Absence du build, prouvée** (`npm run build` puis `grep` sur `dist/`) : `scene` 0 · `applyStoreScene` 0 · `keepSceneOutOfStorage` 0 · `SCENE_IDS` 0 · `MICHEL` 0. Le bundle est **identique à l'octet près** à celui de `a6ca706` recompilé dans un worktree (155 062 o) ; les 28 octets d'écart du premier essai étaient un renommage d'identifiant du minifieur **dans le runtime Vue** (`vo` → `bo`), vérifié par diff au premier point de divergence. `git diff --stat -- 1score/src/stores` **vide**.

#### Les 36 scans, écran par écran (Task 4)

24 constats, **quatre causes**, 12 scans propres d'emblée. Chacune a été menée jusqu'à sa cause par mutation — aucune n'a été classée « faux positif » à vue.

| Constat | Scènes | Verdict | Preuve |
|---|---|---|---|
| `nested-cards` ×2 | 03, 04, 05, 06 (×3 formats = 12) | **Écart assumé** | Les boîtes `NOM` / `DISTANCE` sont des **champs**, pas des cartes (saisie en place, Story 10.3). Capture à l'appui. |
| `text-occlusion` « REP recouvert à 100 % » | 07, 09 (×3 = 6) | **Faux positif prouvé** | Recouvrement réel **0,0 px** (REP bas 386,1 / nombre haut 386,1) ; capture : REP parfaitement lisible. Mutation `leading-none` → `leading-normal` : **ferme le constat**. La règle reconstruit la boîte d'encre depuis les métriques de la police. |
| `text-overflow` « déborde de 26 px » | 08 (×3 = 3) | **Faux positif prouvé** | Le débordement est le **voile de flash de frappe**, `-inset-x-2 -inset-y-1` = 2 unités de grille = **26 px à 1920 et 16 px sur tablette** — exactement les chiffres du constat. Mutation `inset-0` : **ferme le constat aux trois formats**. `pointer-events-none`, animé à `opacity: 0`, 236 px de dégagement. |
| `low-contrast` « 2,6:1 sur backdrop filter » | 10 (×3 = 3) | **Faux positif prouvé** | À opacité **100 %**, où rien ne peut transparaître et où le blanc sur `#272E49` vaut 13,35:1, le constat **sort encore** (2,1 à 3,0:1). Il ne se ferme qu'en retirant le **flou** — jamais en montant l'opacité (88 / 94 / 97 / 100 % tous signalés). La règle mesure ce qu'il y a **sous** la carte. La médiane du détecteur lui-même (13,2 à 13,8:1) est la vraie valeur. |

Après encodage des huit ignores : **36 scans propres, exit 0**. `design:check:file` : propre, exit 0.

#### `impeccable ignores list` en sortie de Task 5

```
Shared:
  ignoreRules:  (none)
  ignoreFiles:  (none)
  ignoreValues: nested-cards=*   [*scene=03-parametrage-vide*]        - ÉCART ASSUMÉ. …
                nested-cards=*   [*scene=04-popup-clavier-alpha*]     - ÉCART ASSUMÉ. …
                nested-cards=*   [*scene=05-popup-pave-numerique*]    - ÉCART ASSUMÉ. …
                nested-cards=*   [*scene=06-parametrage-rempli*]      - ÉCART ASSUMÉ. …
                text-occlusion=* [*scene=07-scoreboard-jds*]          - FAUX POSITIF PROUVÉ. …
                text-occlusion=* [*scene=09-scoreboard-jds-en-partie*] - FAUX POSITIF PROUVÉ. …
                text-overflow=*  [*scene=08-popup-saisie-serie*]      - FAUX POSITIF PROUVÉ. …
                low-contrast=*   [*scene=10-popup-decision*]          - FAUX POSITIF PROUVÉ. …
  designSystem: enabled
```

**Zéro `ignoreRules`, zéro `ignoreFiles`** : huit `add-value` scopés par scène, chacun avec sa raison mesurée (482 à 647 caractères). `low-contrast` **reste active sur les onze autres scènes** — c'est la règle dont l'AC4 dépend, elle ne tombe pas.

**Les deux lignes périmées du §8 d'`integration-bmad-impeccable.md` n'ont PAS été reprises** : la police système (Saira est auto-hébergée depuis la 11.2) et les noirs profonds (le fond est marine `#1E2438` depuis la 11.2). Aucun scan ne les produit. **Les quatre candidats annoncés à la création n'ont pas été encodés non plus** — le scan ne les sort pas : accroche `ModeTile` (affichée par aucune tuile), anneau de focus rouge sur bleu roi (le détecteur ne voit pas `:focus-visible`), touches alpha sous le plancher (le détecteur n'applique pas UX-DR8), commandes inactives (`disabled:opacity-30`, exclues par WCAG §1.4.3). **Rien n'a été encodé d'avance.**

#### ⚠️ La mutation d'AC4 a ÉCHOUÉ — et c'est le résultat le plus important de la story (Task 6)

Les deux P1 de l'audit réintroduits par surcharge CSS (libellé de CTA de réglage en `text-stat` 700, `DÉMARRER` au plancher 16 px) : **le détecteur ne signale RIEN**, aux trois formats.

La mutation avait bien pris — mesuré au navigateur : `change-ball-button` à **14,0 px / 700** à 1133 (seuil 4,5:1) pour un contraste réel de **3,68:1** sur le stop clair ; `confirm-button` à **16,0 px / 900** pour **3,70:1**. Deux violations AA franches, invisibles au scan.

Cause isolée par quatre essais successifs sur la même page — **ce n'est pas le dégradé** :

| Essai | Résultat |
|---|---|
| A. Dégradé d'origine, libellé 14 px/700 (3,68:1 réel) | **rien** |
| B. Fond **plein** `#2E8FDB` posé sur le `<button>` | **rien** |
| C. Fond plein posé sur le `<span>` qui **porte** le texte | **détecté**, 3,5:1 |
| D. Dégradé posé sur le `<span>` qui **porte** le texte | **détecté**, 3,5:1 (stop clair nommé) |

La règle `low-contrast` ne résout le fond que sur l'élément qui porte le texte et **ne remonte pas aux ancêtres**. `CtaButton` met le dégradé sur le `<button>` et le libellé dans le `<slot />` : le détecteur est, **par construction, aveugle au libellé des six CTA du produit** — c'est-à-dire à tout ce que l'AC4 lui confiait.

**Conséquence tirée, plutôt que tue** : `1score/src/components/CtaButton.contrast.test.ts` refait le calcul **depuis la source** — stops lus dans `main.css`, tailles et graisses lues dans le frontmatter de `DESIGN.md` (même source unique que l'AC5), seuil WCAG (24 px, ou 18,66 px en ≥ 700) appliqué aux trois formats. Règle **conservatrice** : le libellé doit tenir le seuil contre l'arrêt **le plus clair**, donc où qu'il se pose. Vérifié par mutation :

| Mutation | Attendu | Obtenu |
|---|---|---|
| P1 nº1 : CTA de réglage remis en `stat` (avant la 11.1) | rouge | ✅ rouge |
| P1 nº2 : `DÉMARRER` remis au plancher 16 px | rouge | ✅ rouge |
| Régression nouvelle : `accent` descendu en `stat` | rouge | ✅ rouge |
| Exception périmée : `pass` monté en `label` | rouge | ✅ rouge (elle se retire d'elle-même) |

#### `PASSER LE TOUR` : le report de la revue 11.2, tranché par la mesure

Le garde-fou l'a signalé immédiatement : `pass` est en rôle `stat` (**14,2 px** à 1180, **14,0 px** à 1133), donc pas « grand texte », donc seuil **4,5:1** — que le stop clair du dégradé bleu (`#3B82F6`, **3,68:1**) ne tient pas.

Mesuré sur sa **surface réelle**, au pixel, aux trois formats : le picto est **au-dessus** du libellé, ce qui le repousse à **72,2 % de la hauteur** du bouton — donc dans la partie sombre du dégradé à 160°. Fond réel `#2a64e5` : **5,18:1** à 1133 et 1180, **5,25:1** à 1920. *(Les ~3,0:1 relevés en balayant les pixels sont les bords anti-aliasés du texte blanc lui-même, pas le fond.)*

**Décision : aucune montée en `label` n'est due.** La condition de l'AC4 (« s'il ne tient pas le seuil ») n'est pas remplie : 5,18:1 ≥ 4,5:1 aux trois formats. L'écart est encodé en **exception mesurée** dans `CtaButton.contrast.test.ts`, avec sa valeur, sa position et sa date — et le test vérifie qu'elle est encore **nécessaire**, si bien qu'elle disparaîtra d'elle-même le jour où quelqu'un montera le rôle.

**`DESIGN.md` est corrigé par la mesure**, aux deux endroits qui portaient le chiffre : « 4,95:1 au milieu du dégradé » était une **estimation**, et le libellé n'est pas au milieu.

#### Les tests lisent `DESIGN.md` (Task 7) — miroir vérifié dans les deux sens

`vitest.config.ts` › `server: { fs: { allow: ['..'] } }` (sans lui : `Error: Denied ID …/DESIGN.md?raw`). Parseur de frontmatter maison, **aucune dépendance YAML** — il refuse un troisième niveau d'indentation plutôt que de rendre une liste tronquée en silence.

Les six listes sont **dérivées**, exclusions comprises : `VIEWPORT_CLAMPED_ROLES` n'est plus une liste tenue à la main mais « les rôles que `sizeAtWidth` sait résoudre » — ce qui écarte d'office les `cqw` (dépendants d'un conteneur) **et** les `min(42vw, 40vh, 520px)` des scores (dépendants aussi de la hauteur). Premier jet trop large : un filtre sur « contient `vw` » ramenait les cinq rôles `score-*` ; le test l'a dit.

| Mutation dans `DESIGN.md` | Attendu | Obtenu |
|---|---|---|
| `typography: label` renommé en `libelle` | rouge | ✅ rouge |
| `typography: stat` retiré | rouge | ✅ rouge |
| `rounded: tappable` renommé en `tapable` | rouge | ✅ rouge |
| `shadows: sidebar` retiré | rouge | ✅ rouge |

#### Harnais durci (Task 8) — les cinq plantages listés, et rien d'autre

| Cas | Avant | Après |
|---|---|---|
| `outDir` absent | `ERR_INVALID_ARG_TYPE` | « dossier de sortie manquant » + usage |
| `--url` en dernier argument | retombait **en silence** sur l'URL par défaut | « --url attend une valeur » |
| `--override` en dernier argument | **silence total** : on croyait injecter du CSS, on n'injectait rien | « --override attend une valeur » |
| Fichier de surcharge introuvable | `ENOENT` nu | chemin + répertoire courant |
| Format sans `x` (`1920`) | hauteur `NaN`, captures **fausses** et non absentes | « format illisible (attendu LARGEURxHAUTEUR) » |
| Playwright absent | `MODULE_NOT_FOUND` | dit quoi faire : `PLAYWRIGHT_MODULE`, et deux commandes pour trouver le module |

`audit.json` est désormais écrit **après chaque format** : un plantage sur le troisième n'emporte plus les deux premiers. Parcours réel rejoué après durcissement : **12 écrans capturés**, `audit.json` complet.

#### Passe navigateur (Task 10) — un vrai défaut trouvé, et corrigé

Parcours complet **sans `?scene=`**, à 1180×733 : accueil → JDS → paramétrage → scoreboard → série validée (score 12). Sauvegarde `localStorage` présente (902 car.), rechargement → pop-up `PARTIE EN COURS`. Comportement d'origine intact, **aucune erreur console**.

⚠️ **Défaut trouvé** : après une visite d'une scène de scoreboard, la visite suivante **sans paramètre** ouvrait `PARTIE EN COURS` par-dessus l'accueil. Le `watch` de persistance enregistre la partie que la scène vient de jouer ; `discardSavedGame()` en **tête** de scène ne protège que la scène, pas la session d'après. Autrement dit : **lancer `npm run design:check` polluait la session de travail suivante.**

⚠️ Et `discardSavedGame()` **ne pouvait pas** servir à le corriger : c'est un **no-op dès que `status !== 'idle'`** (garde volontaire du store), donc précisément sur les scènes 07 à 12. Mon premier test passait par accident — le `watch` est en flush `pre` et n'avait pas encore écrit. Corrigé par `keepSceneOutOfStorage(clear)`, qui reçoit `clearGameState` de la **couche service** (jamais une action de store nouvelle : `src/stores/` est intouchable) et l'appelle sur `pagehide`. Les deux tests ont été réécrits pour attendre le flush (`await nextTick()`) et **prouver** que le `watch` a bien écrit avant de vérifier le nettoyage.

Re-vérifié après correction : « après une scène, visite sans paramètre : accueil OK, **pop-up parasite non** ». Passe Chrome réelle (extension) : scène 09 rendue correctement (`PASSER LE TOUR` lisible), accueil propre juste après, aucune erreur console.

#### Passes `extract` et `polish` (Task 9)

**`/impeccable extract`** — comparé aux contrats de `DESIGN.md` › Bibliothèque de base écrits à la main en 11.3, **pas substitué**.

- **Aucun écart ne rouvre une décision tranchée.** Les six variantes de CTA (et non cinq), la suppression d'`ALIGN_CLASSES`, `useBackdropClose` consommé à travers `PopupCard` : rien dans la passe ne les remet en cause. Les 13 snippets de `.impeccable/design.json` correspondent aux composants réellement rendus.
- **Aucune valeur arbitraire dans les gabarits** (`text-[…]`, `rounded-[…]`, `shadow-[…]`, `tracking-[…]`) : les seules occurrences sont dans des **tests** qui les interdisent et dans des **commentaires**. Aucun `--*-popup-inset-*` ne subsiste hors d'un commentaire qui explique leur départ en 11.3.
- **Un manque réel trouvé, et reporté** : le mécanisme d'animation de rejet (`rejectKey` + classe) est recopié **trois fois** à l'identique dans les trois hôtes de saisie. Seuil d'extraction atteint (3 usages, même intention). Non traité ici — c'est un refactor de comportement dans les trois pop-ups les plus délicates, dans une story où « l'app rend la même chose » ; consigné dans `deferred-work.md` avec son correctif (`useRejectFeedback()`, les **règles** restant dans chaque hôte par UX-DR54).

**`/impeccable polish`** — sur les fichiers touchés par la story. Ceux-ci sont un module de scènes hors build, deux points d'accroche en `<script setup>`, des tests, deux scripts et de la documentation : **aucun n'est visuel**, et la passe ne produit donc aucune proposition de rendu. Les propositions de rendu connues (formats de CTA, reliefs, découpe du scoreboard) restent dans l'entrée « passe de rendu V1.2 » de `deferred-work.md`, mise à jour du séquencement tranché.

#### Ré-audit chiffré (Task 10) — 19/20 contre 14/20

| # | Dimension | 2026-09-15 | Maintenant | Ce qui a fermé, ou pourquoi ça reste ouvert |
|---|---|---|---|---|
| 1 | Accessibilité | **3** | **3** | Les **deux P1 sont fermés** (11.1 : CTA de réglage en `label`, `DÉMARRER` en `start-button` à plancher 20 px) et désormais **gardés mécaniquement** ; les 3 `undersized-ui-text` du badge `BIENTÔT` aussi. Reste ouvert, et assumé : **aucun CTA n'est activable au clavier** (`@pointerdown` seul, WCAG 2.1.1), arbitrage « borne de club sans clavier » consigné en 11.3. C'est ce qui empêche le 4. |
| 2 | Performance | **4** | **4** | Inchangé. Le bundle de production est **identique à l'octet près** à celui de la ligne de base. |
| 3 | Responsive (trois formats paysage) | **2** | **4** | Le constat de fond est fermé par la 11.1 : sur les 11 rôles en `clamp(px, vw, px)`, **0 plafonne avant 1280 px** (contre la totalité avant). Grille fluide, cibles ≥ 90 px, **aucun débordement sur 36 scans** aux trois formats. Le seul débordement connu (`JEAN PIERRE` en ellipse à 1133) est voulu. |
| 4 | Theming | **2** | **4** | 8 tokens morts → **0** (`tokens.test.ts` exige un consommateur pour chacun) ; 4 « tokens » de position → **0** (rapatriés en 11.3) ; 11 tailles hors échelle et 7 interlettrages non tokenisés → **0 valeur arbitraire** dans les gabarits ; 3 rayons sur des objets tapables → **1** (`tappable`). Le seul doublon de valeur restant (`on-player-white` / `on-player-yellow`, tous deux `#000000`) est **deux rôles sémantiques sur deux surfaces différentes**, pas une redondance. Et depuis cette story le miroir `DESIGN.md` ↔ `main.css` est **réel** dans les deux sens. |
| 5 | Intégrité d'implémentation | **3** | **4** | Les quatre duplications du constat P2 sont fermées (11.3 : `useBackdropClose`, `ALIGN_CLASSES` supprimé, `CtaButton`, `PopupCard`), et le retour d'appui divergent du CTA neutre est unifié. Le système est cohérent et spécifique au produit, documenté et **tenu par des tests**. Un seul point ouvert, mineur et reporté : le mécanisme de rejet recopié ×3. |
| | **Total** | **14/20** | **19/20** | **Excellent** (18-20 : polissage mineur) |

**Verdict d'intégrité : PASS.** Ce que la ligne de base appelait ses réserves — « le système est né écran par écran, et ses répétitions ne sont pas encore des composants » — n'est plus vrai : elles sont des composants, et ce sont désormais des **tests** qui l'entretiennent, plus une relecture.

⚠️ **Portée de ce chiffre, à ne pas surinterpréter** : il mesure le design system **tel que l'Epic 11 le laisse**, pas le design final. La passe de rendu V1.2 suit (décision de Nathan, 2026-09-17) et le périmera en partie ; elle devra le rejouer en clôture — ce qui sera bon marché **parce que** cette story l'a outillé. **L'epic ne se clôt pas ici.**

`DESIGN.md` a été **relu contre le code livré, jamais régénéré** (`/impeccable document` en relecture) : il porte des décisions datées de Nathan qu'aucune régénération ne doit effacer. Deux corrections y sont entrées, toutes deux **par la mesure** (valeur de contraste de `PASSER LE TOUR`), plus la section « Écarts assumés au détecteur ».

### Liste de contrôle du critère de sortie de l'epic (AC7)

⚠️ **Écart assumé au texte de l'AC d'`epics.md`**, qui demande de vérifier le critère « sur la fiche de la première story de l'Epic 4 ». Cette fiche **n'existe pas** et l'écran d'identification joueur non plus : le critère ne peut pas être *vérifié* ici, seulement **instruit**. À dérouler à la création de la première story de l'Epic 4 :

1. **Zéro composant de base créé.** L'écran se construit-il avec `CtaButton` (six variantes), `PopupCard`, `PictoIcon`, `SideBar`, `NumericPad` / `AlphaKeyboard` et leurs hôtes ? Tout besoin d'un septième gabarit de CTA ou d'une seconde carte de pop-up est un **échec du critère** — le nommer, ne pas le contourner.
2. **Zéro token ajouté.** Une taille, un rayon, une ombre, un interlettrage ou une couleur qui manque est un **trou du design system**, pas un besoin de l'écran : il s'ajoute dans `DESIGN.md` **puis** `main.css` (`CLAUDE.md` §7), et il compte comme un échec du critère.
3. **Les quatre manques déjà nommés par la 11.3**, à confirmer ou infirmer sur l'écran réel : liste de sélection, champ sur fond sombre, état vide, état de chargement.
4. **Ce que la 11.4 y ajoute** :
   - **L'écran doit être adressable par `?scene=`** dès sa création — sinon il échappe à `design:check`, comme les onze écrans y échappaient avant cette story. Son identifiant suit le vocabulaire du harnais (`13-…`), et la scène se pose **avant le premier rendu**.
   - **Un `VALIDER` grisé est déjà disponible** : `DISABLED_CLASSES` est commun aux six variantes depuis la revue du 2026-09-17 — le critère veut qu'il le soit **sans rien créer**.
   - **Un champ de saisie sur fond sombre est le manque le plus probable** : les deux champs existants (`NOM`, `DISTANCE`) vivent sur une carte joueur **claire**. Mesurer son contraste **avant** de le dessiner ; `CtaButton.contrast.test.ts` ne couvre que les CTA.
   - **Deux pop-ups simultanées restent non arbitrées** (`z-50` en dur, `aria-modal` inconditionnel, report de la revue 11.3) : l'identification joueur est le candidat nommé pour ouvrir une confirmation par-dessus une saisie.
   - **Lancer `npm run design:check` en fin de story**, serveur de dev **neuf**, et lire le **code de sortie**.

### Completion Notes List

- **Deux scripts npm** (`design:check`, `design:check:file`) appuyés sur le lanceur 4.0.0 du dépôt, aux trois formats, JSON daté dans `.impeccable/baseline/`, **codes de sortie propagés et agrégés** (échec > constat > propre), les trois vérifiés à la main.
- **Douze scènes adressables par `?scene=`**, identifiants identiques aux noms de capture du harnais, posées **avant le premier rendu**, **absentes du build** (grep sur `dist/` à 0, bundle identique à l'octet près), `src/stores/` **intact**.
- **36 scans propres**, 24 constats menés chacun jusqu'à sa cause : un écart assumé et **trois faux positifs prouvés par mutation**. Huit ignores `add-value` scopés par scène avec leur raison mesurée, **zéro `ignoreRules` nu**.
- ⚠️ **La mutation d'AC4 a échoué, et la story le dit** : le détecteur est **aveugle au contraste des libellés de CTA** (cause isolée en quatre essais). `CtaButton.contrast.test.ts` reprend le calcul depuis la source et **attrape les deux P1**, une régression nouvelle, et retire son exception quand elle devient inutile.
- **Report de la revue 11.2 tranché par la mesure** : `PASSER LE TOUR` tient **5,18:1** sur sa surface réelle (à 72,2 % de la hauteur, pas au milieu) — pas de montée en `label` ; `DESIGN.md` corrigé aux deux endroits.
- **`tokens.test.ts` et `typography.test.ts` LISENT le frontmatter de `DESIGN.md`**, exclusions dérivées comprises ; miroir vérifié par quatre mutations.
- **Harnais durci** sur les cinq plantages listés, plus un message utile quand Playwright manque ; `audit.json` écrit après chaque format.
- **Un défaut réel trouvé à la passe navigateur et corrigé** : une scène laissait une partie sauvegardée, et la visite suivante *sans paramètre* ouvrait `PARTIE EN COURS`. `discardSavedGame()` ne pouvait pas le corriger (no-op hors `idle`) ; l'effacement passe par la couche service, sur `pagehide`.
- **Ré-audit 19/20** contre 14/20, dimension par dimension. ⚠️ L'epic **ne se clôt pas** : la passe de rendu V1.2 suit et rejouera l'audit.
- **Deux défauts trouvés par la 11.4 l'ont été par un test ou une mesure, aucun par relecture** — c'est, en petit, la démonstration de ce que la story cherchait à installer.

### File List

**Nouveaux**
- `1score/scripts/design-check.sh`
- `1score/src/dev/scenes.ts`
- `1score/src/dev/scenes.test.ts`
- `1score/src/assets/designFrontmatter.ts`
- `1score/src/assets/designFrontmatter.test.ts`
- `1score/src/components/CtaButton.contrast.test.ts`
- `.impeccable/config.json`
- `.impeccable/baseline/2026-09-18-scan-url.json` (récapitulatif des 36 mesures) et `2026-09-18-scan-src.json`

**Modifiés**
- `1score/package.json` (deux scripts)
- `1score/README.md` (commandes + raison du lanceur du dépôt)
- `1score/CLAUDE.md` (§9 : passe outillée, et ce qu'elle ne remplace pas)
- `1score/vitest.config.ts` (`server.fs.allow`)
- `1score/src/main.ts` (scène avant `app.mount()`, nettoyage du stockage)
- `1score/src/components/HomeScreen.vue` (semis de la part écran, au `setup`)
- `1score/src/views/GameView.vue` (semis d'`exitPromptOpen`, au `setup`)
- `1score/src/assets/tokens.test.ts` (listes dérivées de `DESIGN.md`)
- `1score/src/assets/typography.test.ts` (listes dérivées de `DESIGN.md`)
- `1score/scripts/render-static.cjs` (durcissement)
- `DESIGN.md` (contraste de `PASSER LE TOUR` corrigé ×2, section « Écarts assumés au détecteur »)
- `_bmad-output/implementation-artifacts/deferred-work.md` (7 reports + séquencement V1.2 tranché)
- `_bmad-output/planning-artifacts/epics.md` (Story 11.4 annotée)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Supprimés** — aucun.

## Change Log

- **2026-09-18 — Sortie des scans ramenée à un fichier par lancement (décision de Nathan, à la relecture).** La nomenclature de l'AC1 produisait 37 fichiers par passe, **tous contenant exactement `[]`** quand l'app est propre. Remplacée par un récapitulatif unique et daté par mode, qui porte chaque mesure et garde le message d'erreur d'une mesure en échec. Les trois fichiers de ligne de base du 2026-09-15 sont conservés tels quels. Les trois chemins (propre / constat / échec) re-vérifiés à la main après le changement.
- **2026-09-17 — Story livrée (dev-story).** 1095 tests / 32 fichiers (1026 / 29 à l'arrivée), build vert, `src/stores/` intact, 36 scans propres, ré-audit **19/20** contre 14/20. Trois résultats qui ne figuraient pas au plan : (1) **le détecteur ne lisait ni `DESIGN.md`, ni `design.json`, ni les ignores** quand on le lançait depuis `1score/` — il ne remonte pas les répertoires, et ne le disait pas ; (2) **la mutation d'AC4 a échoué** — le détecteur est aveugle au contraste des libellés de CTA parce que sa règle ne remonte pas aux ancêtres, cause isolée en quatre essais, d'où `CtaButton.contrast.test.ts` qui refait le calcul depuis la source et attrape les deux P1 ; (3) **une scène laissait une partie sauvegardée derrière elle**, si bien qu'un scan polluait la session de travail suivante — et `discardSavedGame()` ne pouvait pas le corriger, étant un no-op hors `idle`. Le report de la revue 11.2 sur `PASSER LE TOUR` est tranché **par la mesure** (5,18:1 sur sa surface réelle, à 72,2 % de la hauteur et non au milieu) : pas de montée en `label`, et `DESIGN.md` corrigé de la valeur estimée qu'il annonçait. Quatre écarts au texte des AC, tous signalés dans `epics.md` et ici.

- **2026-09-17 — Fiche créée (bmad-create-story).** Story d'outillage : deux scripts de scan, douze scènes adressables par `?scene=`, ignores avec raison, contraste calculé par l'outil et **prouvé par mutation**, tests qui lisent le frontmatter de `DESIGN.md` au lieu de le recopier, passes `extract` / `polish` reportées par la 11.3, ré-audit chiffré contre le 14/20. Deux décisions de Nathan à la création : **11.4 avant la passe de rendu V1.2** (le ré-audit mesure donc la passe design system, pas le design final) et **adressage par `?scene=` lu avant le premier rendu**. Trois écarts assumés au texte de l'AC d'`epics.md`, signalés dans les AC : lanceur du dépôt au lieu de `npx impeccable`, `--reason` impossible sur `ignoreRules` / `ignoreFiles`, critère de sortie instruit en liste de contrôle faute de fiche Epic 4 existante. Aucune référence visuelle (rien ne se dessine) ; outillage entièrement essayé à la création — le détecteur calcule bien le contraste sur le stop de dégradé réel, et l'accueil est propre aux trois formats.
