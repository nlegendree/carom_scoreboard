# Story 10.6: Renommage du produit en 1Score

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a club qui installe l'application,
I want voir « 1Score » partout où le produit se nomme — nom sous l'icône d'accueil, onglet, manifest, documentation,
so that le nom du produit est cohérent avant que l'interface premium ne s'affiche.

> **Cadrage (bmad-create-story, 2026-09-11) — story courte, transverse, sans écran.** Première story de l'Epic 10 (ordre 10.6 → 10.1 → …) : la sidebar de la 10.1 affiche le mot `1Score`. Le PRD et la spec UX sont **déjà** renommés. Aucune règle de jeu, aucun état, aucune persistance ne change. Aucune référence visuelle à fournir (pas d'écran). Exigence : **AR27** (`epics.md`).

> **Révision (2026-09-11, Nathan, après la revue) — renommage étendu.** En dev, rien à préserver : le dossier applicatif devient `1score/` et la clé de sauvegarde `1score:game`, sans migration. Cela annule l'AC2 et la partie « dossier / clé » de l'AC4 ci-dessous. Restent à l'ancien nom, à renommer plus tard (`deferred-work.md`) : le dépôt GitHub `nlegendree/carom_scoreboard`, le dossier local `carom_scoreboard` et le site Netlify. Les chemins `carom-scoreboard/…` de cette fiche sont ceux d'avant la révision.

## Acceptance Criteria

1. **Given** le dépôt **When** la story est livrée **Then** le produit se nomme « 1Score » dans : le manifest PWA de `vite.config.ts` (`name: '1Score'`, `short_name: '1Score'`), `index.html` (`<title>1Score</title>`), `package.json` (`"name": "1score"` — **minuscules imposées par npm**, voir Dev Notes) et `package-lock.json` (mêmes deux champs `name`), `README.md` et `CLAUDE.md` (titre et mentions) ; l'`alt` du logo de `HomeScreen.vue` vaut `1Score` et son test suit ; `grep -ri "carom scoreboard" carom-scoreboard/src carom-scoreboard/index.html carom-scoreboard/vite.config.ts` ne renvoie **rien**.
2. **Given** une tablette avec une partie sauvegardée **When** l'application se met à jour **Then** la sauvegarde est retrouvée : `GAME_STORAGE_KEY` vaut toujours `'carom-scoreboard:game'` et `GAME_STORAGE_VERSION` reste `1` (aucune migration, décision assumée) ; un test de `storageService.test.ts` fige la valeur littérale de la clé.
3. **Given** une PWA déjà installée sous l'ancien nom **When** elle se met à jour **Then** rien ne casse : `id: '/'`, `start_url`, `scope`, le fichier `manifest.webmanifest` et les icônes sont inchangés (même identité d'application) ; le nom sous l'icône suit la limite de chaque plateforme, **documentée dans `CLAUDE.md` sans contournement** : **iPadOS** — nom figé à l'ajout à l'écran d'accueil, change seulement à la réinstallation ; **Android (Chrome)** — Chrome relit le manifest d'une PWA installée et met le nom à jour de lui-même, en général dans les un à deux jours qui suivent un lancement (`about://webapks` pour forcer).
   *Précision de la création de story : l'AC d'`epics.md` disait « ne changera qu'à la réinstallation » pour toutes les plateformes, ce qui est faux sur Android (web.dev, « How Chrome handles updates to the web app manifest ») — `epics.md` annoté.*
4. **Given** le déploiement **When** la story est livrée **Then** ne sont **pas** renommés : le dossier `carom-scoreboard/`, le dépôt Git, `netlify.toml` (`base = "carom-scoreboard"`), le site Netlify, la clé `localStorage`, `public/logo.png` et les icônes générées ; `npm test`, `vue-tsc` et `npm run build` passent, et `dist/manifest.webmanifest` / `dist/index.html` portent `1Score`.

## Tasks / Subtasks

- [x] **Task 1 — Manifest et `index.html` (AC: 1, 3)**
  - [x] 1.1 `carom-scoreboard/vite.config.ts:22-23` : `name: '1Score'`, `short_name: '1Score'`. **Ne toucher à rien d'autre** du bloc `manifest` (`id`, `start_url`, `scope`, `description`, couleurs) ni à `pwaAssets`/`workbox`.
  - [x] 1.2 `carom-scoreboard/index.html:9` : `<title>1Score</title>`. N'ajouter **aucune** balise (`<link rel="manifest">`, `apple-touch-icon`, `apple-mobile-web-app-title`) : `pwaAssets` injecte les liens au build (Story 1.13), et iOS lit déjà `1Score` dans le manifest comme dans `<title>`.
- [x] **Task 2 — `package.json` et verrou (AC: 1)**
  - [x] 2.1 `carom-scoreboard/package.json:2` : `"name": "1score"`.
  - [x] 2.2 `carom-scoreboard/package-lock.json` lignes 2 et 8 : `"name": "1score"` — `npm install --package-lock-only` depuis `carom-scoreboard/` (ou édition des deux lignes) ; vérifier par `git diff` que **seules** ces deux lignes bougent (aucune dépendance résolue à nouveau).
- [x] **Task 3 — Logo de l'accueil (AC: 1)**
  - [x] 3.1 `carom-scoreboard/src/components/HomeScreen.vue:180` : `alt="1Score"`. Rien d'autre dans `HomeScreen` (la 10.1 le refond).
  - [x] 3.2 `carom-scoreboard/src/components/HomeScreen.test.ts:105,109` : sélecteur `img[alt="1Score"]` (test rouge d'abord, puis vert).
- [x] **Task 4 — Garde de la clé de sauvegarde (AC: 2)**
  - [x] 4.1 `carom-scoreboard/src/services/storageService.test.ts` : un test qui attend `GAME_STORAGE_KEY === 'carom-scoreboard:game'`, avec un commentaire d'une ligne (« ancien nom conservé à dessein, Story 10.6 : le renommer ferait perdre la partie sauvegardée à la mise à jour »). Ajouter le même commentaire au-dessus de `GAME_STORAGE_KEY` dans `storageService.ts:11`. Ne pas toucher `GAME_STORAGE_VERSION`.
- [x] **Task 5 — Documentation (AC: 1, 3, 4)**
  - [x] 5.1 `carom-scoreboard/CLAUDE.md:1` : `# CLAUDE.md — 1Score`. **Garder** la ligne 11 « Commandes (depuis `carom-scoreboard/`) » (nom de dossier, pas du produit).
  - [x] 5.2 `CLAUDE.md`, section « Stack technique », un paragraphe **Nom du produit** : 1Score depuis la Story 10.6 ; restent volontairement à l'ancien nom le dossier `carom-scoreboard/`, le dépôt, `netlify.toml`/le site Netlify et la clé `localStorage` `carom-scoreboard:game` (la renommer perd la partie sauvegardée) ; limite du nom sous l'icône d'une PWA déjà installée (iPadOS : réinstallation ; Android : mise à jour automatique par Chrome) — pas de contournement.
  - [x] 5.3 `carom-scoreboard/README.md` : remplacer le texte du template Vite (anglais, sans rapport) par un README court en français — titre `# 1Score`, une phrase (scoreboard tactile PWA pour billard carambole, tablette de club, hors ligne), les trois commandes (`npm run dev`, `npm test`, `npm run build`), renvoi vers `CLAUDE.md` pour les conventions. Pas plus.
  - [x] 5.4 `_bmad-output/planning-artifacts/architecture.md:143` (note Story 1.13 sur le manifest) : ajouter en fin de note « *Renommé `1Score` / `1Score` le … (Story 10.6, AR27).* » Ne **pas** réécrire les mentions historiques datées ailleurs (fiches de stories, `deferred-work.md`, rétros, spec UX : ce sont des traces).
- [x] **Task 6 — Contrôle final (AC: 1-4)**
  - [x] 6.1 `grep -rni "carom scoreboard" carom-scoreboard --exclude-dir=node_modules --exclude-dir=dist` → vide ; `grep -rn "carom-scoreboard:game" carom-scoreboard/src` → toujours `storageService.ts` et les 3 lignes de `GameView.test.ts` (inchangées).
  - [x] 6.2 `npm test` (501 tests au dernier commit → **502**), `npm run build` (inclut `vue-tsc -b`) verts.
  - [x] 6.3 `dist/manifest.webmanifest` : `"name":"1Score"`, `"short_name":"1Score"`, `"id":"/"` ; `dist/index.html` : `<title>1Score</title>` et **un seul** `<link rel="manifest">`.
  - [x] 6.4 **Passe navigateur réduite (écart assumé à CLAUDE.md §9)** : aucun rendu ne change (seul un `alt`), la passe deux formats n'apporte rien. `npm run build && npm run preview`, Chrome : titre d'onglet `1Score`, DevTools › Application › Manifest → nom `1Score`, aucun avertissement d'installabilité, et une partie en cours survit à un rechargement (AC2). Consigner l'écart dans les Completion Notes.

### Review Findings

- [x] [Review][Decision] Le commit de la story embarquerait le correct-course « refonte UI » — `architecture.md` (section « Navigation & Shell », l. 269+) et `sprint-status.yaml` (bloc `epic-10`) portent aussi des changements étrangers à la 10.6 ; l'annotation d'AC3 dans `epics.md`, elle, n'est dans aucune liste de fichiers et vit dans un fichier non committé avec tout l'Epic 10. Options : committer d'abord le correct-course (`plan: …`) puis la 10.6, ou staging partiel. **Résolu (Nathan)** : correct-course committé à part, sans la note de la ligne 143 d'`architecture.md` ni le statut de la 10.6.
- [x] [Review][Patch] Android : la mise à jour du nom exige que toutes les fenêtres de la PWA soient fermées, appareil en charge et en Wi-Fi — une tablette de club ouverte 24 h/24 ne la déclenche jamais ; « en général dans les un à deux jours qui suivent un lancement » est trompeur [carom-scoreboard/CLAUDE.md:11]
- [x] [Review][Patch] Donner la vraie raison de ne pas renommer le site Netlify : son nom fixe l'adresse `*.netlify.app`, donc l'origine — le renommer perdrait la partie sauvegardée et obligerait à réinstaller la PWA [carom-scoreboard/CLAUDE.md:11]

## Dev Notes

### Occurrences à traiter (relevé exhaustif `git grep -i carom`, 2026-09-11)

| Fichier:ligne | Actuel | Action |
|---|---|---|
| `vite.config.ts:22` | `name: 'Carom Scoreboard'` | → `'1Score'` |
| `vite.config.ts:23` | `short_name: 'Carom'` | → `'1Score'` (6 car., sous la limite de 12 affichée sous l'icône) |
| `index.html:9` | `<title>Carom Scoreboard</title>` | → `1Score` |
| `package.json:2`, `package-lock.json:2,8` | `carom-scoreboard` | → `1score` |
| `HomeScreen.vue:180` | `alt="Carom Scoreboard"` | → `1Score` |
| `HomeScreen.test.ts:105,109` | `img[alt="Carom Scoreboard"]` | → `1Score` |
| `CLAUDE.md:1` | `# CLAUDE.md — Carom Scoreboard` | → `1Score` |
| `CLAUDE.md:11` | ``depuis `carom-scoreboard/` `` | **garder** (dossier) |
| `storageService.ts:11` | `'carom-scoreboard:game'` | **garder** + commentaire |
| `GameView.test.ts:1237,1297,1304` | `'carom-scoreboard:game'` | **garder** |
| `netlify.toml:1,6` | commentaire + `base = "carom-scoreboard"` | **garder** |

Aucun `document.title`, aucun titre d'écran ni autre libellé ne porte le nom dans `src/` : AR27 évoque des « titres d'écran », il n'y en a pas aujourd'hui. `description` du manifest (« Scoreboard tactile pour billard carambole ») reste telle quelle.

### Pièges

- **npm refuse les majuscules** dans `name` (`validate-npm-package-name`) : `1score`, pas `1Score`. Un nom commençant par un chiffre est valide.
- **Ne pas changer l'identité de la PWA** : `id: '/'`, `start_url`, `scope` et le nom de fichier `manifest.webmanifest` identifient l'app installée. Les modifier créerait une seconde installation (Android) ou empêcherait la mise à jour du manifest (web.dev : « Don't change the name or location of your web app manifest file »).
- **Ne pas régénérer les icônes** : `public/logo.png` (trois billes sur fond marine, **aucun texte**) ne porte pas l'ancien nom. Le logo 1Score est un asset attendu de Nathan pour la 10.1 (repli : rond `--color-cloth` avec « 1 »). Pas de `npx pwa-assets-generator` ici.
- **Ne pas toucher la mise en page de `HomeScreen`** ni le `<img>` du logo au-delà de l'`alt` : la 10.1 remplace l'en-tête par la `SideBar`.
- **Clé `localStorage`** : la « nettoyer » par cohérence ferait perdre en silence la partie en cours de chaque tablette au rechargement qui suit la mise à jour (la garde de lecture de la Story 1.12 ne connaît que cette clé). C'est pour cela que la Task 4 la fige par un test.
- **`dist/` est ignoré par Git** (`.gitignore`) : ne pas le committer, il sert seulement au contrôle 6.3.

### Architecture et conventions

- Rien de nouveau : pas de composant, d'action de store ni de service. Conventions de `carom-scoreboard/CLAUDE.md` inchangées (tests co-localisés AR16, named exports, `@pointerdown`).
- `vite-plugin-pwa` 1.x + `pwaAssets` (preset `minimal2023`) injectent `<link rel="manifest">`, `theme-color`, favicons et `apple-touch-icon` dans `dist/index.html` : vérifié en Story 1.13, un ajout manuel ferait un doublon.
- Mise à jour sur les tablettes : `registerType: 'prompt'` + `usePwaUpdate.ts` appliquent la nouvelle version **à l'accueil seulement** ; le nouveau manifest est précaché avec le build, rien à faire de plus.

### Intelligence des stories précédentes

- Aucune story de l'Epic 10 n'est encore livrée. Dernier état du code : Epic 2 clos après la revue 2.1+2.2+2.4 (commit `6cae5a0`), **501 tests**, `vue-tsc` et build verts.
- Rétro Epic 2 : les petites stories restent courtes (la 2.4 tenait en 64 lignes) ; **quand une story change une spec, la spec est mise à jour dans la même session** (d'où la Task 5.4 et l'annotation d'`epics.md` faite à la création).
- Story 1.13 : c'est elle qui a posé le manifest (`Carom Scoreboard`/`Carom`, `id: '/'`, sans `orientation`) et la règle « ne pas lister les icônes à la main ». Ses fiches et `deferred-work.md:7` citent l'ancien nom : traces datées, on ne les réécrit pas.

### Git

- Messages en français, préfixe `feat: story 10.6 - …`, puces courtes, fin avec la ligne de co-auteur. Fichiers attendus au commit : `vite.config.ts`, `index.html`, `package.json`, `package-lock.json`, `README.md`, `CLAUDE.md`, `HomeScreen.vue`, `HomeScreen.test.ts`, `storageService.ts`, `storageService.test.ts`, `architecture.md`, cette fiche, `sprint-status.yaml`.

### Information technique à jour

- **Android / Chrome** : Chrome interroge de temps en temps le manifest d'une PWA installée et met à jour la WebAPK si elle a changé ; le nouveau nom apparaît en général dans les un à deux jours qui suivent un lancement. `about://webapks` › *Update* force la mise à jour et montre la date du dernier contrôle.
- **iPadOS / Safari** : le nom est proposé (et modifiable par l'utilisateur) au moment de l'ajout à l'écran d'accueil, puis stocké avec l'`id` du manifest ; un changement de manifest ne renomme pas l'icône existante — il faut retirer puis rajouter l'app.

### Project Structure Notes

- Tout le code vit dans `carom-scoreboard/` (non renommé) ; la documentation de planification dans `_bmad-output/planning-artifacts/`. Aucun conflit de structure.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 10.6: Renommage du produit en 1Score] — AC d'origine, périmètre transverse
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] — AR27
- [Source: _bmad-output/planning-artifacts/epics.md#Epic 10] — ordre d'exécution 10.6 en premier
- [Source: _bmad-output/planning-artifacts/sprint-change-proposal-2026-09-11-refonte-ui.md#4.1, #Autres] — décision « 1Score », PRD déjà renommé
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Refonte UI/UX Premium — 1Score] — logo et marque à fournir par Nathan
- [Source: _bmad-output/planning-artifacts/architecture.md#Compatibilité Multi-Plateforme] — note manifest Story 1.13
- [Source: _bmad-output/implementation-artifacts/1-13-fonctionner-offline-et-sinstaller-comme-application-native.md] — manifest, `pwaAssets`, icônes
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-09-11.md] — règle « spec mise à jour dans la même session »
- [Source: carom-scoreboard/src/services/storageService.ts:11-18] — clé et version de sauvegarde
- [Source: https://web.dev/articles/manifest-updates] — mise à jour du manifest d'une PWA installée par Chrome
- [Source: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/] — nom choisi à l'ajout + `id` du manifest sur iOS/iPadOS 16.4+

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (`claude-opus-5`)

### Debug Log References

- `HomeScreen.test.ts` › « shows the logo on the home step only » rouge avec `img[alt="1Score"]` avant la modification de `HomeScreen.vue`, vert après.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Manifest (`name`/`short_name` = `1Score`), `<title>`, `alt` du logo et `package.json`/`package-lock.json` (`1score`) renommés. Rien d'autre du bloc `manifest`, de `pwaAssets` ni de `workbox` n'a bougé.
- `package-lock.json` modifié à la main (deux lignes) : `git diff -U0` ne montre que les lignes 2 et 8, aucune dépendance résolue à nouveau.
- Clé de sauvegarde figée : test `keeps the pre-1Score storage key` dans `storageService.test.ts`, même commentaire au-dessus de `GAME_STORAGE_KEY`. `GAME_STORAGE_VERSION` inchangée.
- `CLAUDE.md` : titre renommé, paragraphe **Nom du produit** (ce qui reste à l'ancien nom et pourquoi, identité de la PWA, limite du nom sous l'icône iPadOS / Android). La ligne « Commandes (depuis `carom-scoreboard/`) » est gardée. `README.md` remplacé par un README court en français. Note Story 1.13 d'`architecture.md` annotée.
- Contrôles : grep « carom scoreboard » vide ; `carom-scoreboard:game` présent seulement dans `storageService.ts`, les 3 lignes inchangées de `GameView.test.ts` et le nouveau test. `npm test` **502/502** (501 + 1) ; `npm run build` (avec `vue-tsc -b`) vert ; `dist/manifest.webmanifest` : `name`/`short_name` `1Score`, `id`/`start_url`/`scope` `/` ; `dist/index.html` : `<title>1Score</title>`, un seul `<link rel="manifest">`.
- **Écart assumé à CLAUDE.md §9 (passe navigateur réduite, prévu par la Task 6.4)** : pas de passe deux formats tablette, puisque seul un `alt` change dans le rendu. `npm run build && npm run preview`, Chrome (Browser 1) : titre d'onglet `1Score` ; manifest servi lu depuis la page (`1Score`/`1Score`, `id: '/'`, `display: standalone`, icônes 64/192/512/512 maskable) ; service worker activé ; `alt` du logo `1Score`. Une partie démarrée (MICHEL/ANDRE, Cadre 47/2) est sauvegardée sous `carom-scoreboard:game` v1 ; après rechargement, la pop-up « PARTIE EN COURS » la propose et « REPRENDRE LA PARTIE » la restaure (AC2).
- **Limite de la passe** : l'extension n'ouvre pas les DevTools, donc le panneau Application › Manifest et ses avertissements d'installabilité n'ont pas été lus. Les critères que Chrome vérifie ont été contrôlés un par un à la place (nom, icônes 192 et 512, `start_url`, `display`, service worker actif). Sauvegarde de test et service worker de `localhost:4173` supprimés en fin de passe.
- Nom sous l'icône d'une PWA déjà installée : à constater sur appareil réel après le déploiement Netlify (iPadOS : réinstallation ; Android : mise à jour automatique par Chrome).

### File List

- `carom-scoreboard/vite.config.ts` (modifié)
- `carom-scoreboard/index.html` (modifié)
- `carom-scoreboard/package.json` (modifié)
- `carom-scoreboard/package-lock.json` (modifié)
- `carom-scoreboard/README.md` (modifié)
- `carom-scoreboard/CLAUDE.md` (modifié)
- `carom-scoreboard/src/components/HomeScreen.vue` (modifié)
- `carom-scoreboard/src/components/HomeScreen.test.ts` (modifié)
- `carom-scoreboard/src/services/storageService.ts` (modifié)
- `carom-scoreboard/src/services/storageService.test.ts` (modifié)
- `_bmad-output/planning-artifacts/architecture.md` (modifié)
- `_bmad-output/implementation-artifacts/10-6-renommage-du-produit-en-1score.md` (modifié)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)

## Change Log

- 2026-09-11 — Story 10.6 implémentée : produit renommé 1Score (manifest, `<title>`, `package.json`/verrou, `alt` du logo, `CLAUDE.md`, `README.md`, note d'`architecture.md`) ; clé `localStorage` figée par un test ; 502 tests, build vert, passe navigateur réduite. Statut → review.
- 2026-09-11 — Revue de code (Blind Hunter, Edge Case Hunter, Acceptance Auditor) : 4 AC conformes, 3 constats retenus, 17 écartés. `CLAUDE.md` corrigé (mise à jour du nom sous Android conditionnée à la fermeture de l'app, en charge et en Wi-Fi ; raison de ne pas renommer le site Netlify : l'origine) ; correct-course refonte UI committé à part avant la story. Statut → done.
