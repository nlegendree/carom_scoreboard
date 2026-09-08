# Story 1.1: Initialisation du projet

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (assisté par IA),
I want le projet scaffoldé avec le starter Vue 3 + Vite PWA et les dépendances complémentaires installées,
so that chaque story suivante dispose d'une base fonctionnelle, buildable et installable.

## Acceptance Criteria

1. **Given** un environnement Node.js configuré, exécuté depuis la racine du dépôt Git **When** j'exécute `npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts` **Then** un projet Vue 3 + TypeScript + Vite est créé, dans le sous-dossier `carom-scoreboard/` du dépôt, avec le plugin PWA configuré (AR1).
2. **Given** le projet scaffoldé **When** j'installe les dépendances complémentaires (Tailwind CSS v4, `@tailwindcss/vite`, Pinia, vue-router@4, Dexie, Vitest, Vue Test Utils, happy-dom) **Then** `npm install` se termine sans erreur et `npm run build` produit un build fonctionnel (AR3).
3. **Given** la structure de fichiers définie en architecture **When** le projet est initialisé **Then** l'arborescence `src/types`, `src/stores`, `src/services`, `src/composables`, `src/components`, `src/views`, `src/router` est créée conformément à l'architecture.
4. **Given** la configuration Tailwind CSS v4 **When** je définis les tokens de fondation visuelle (`@theme` CSS) **Then** elle inclut la palette couleur (fond sombre, 4 couleurs joueur, accent bleu système, alerte rouge, victoire or — UX-DR1, UX-DR3, UX-DR5), l'échelle typographique fluide `clamp()` (UX-DR6), l'unité de base d'espacement 8px (UX-DR7), la taille minimale de zone tactile 90×90px (UX-DR8) et les 3 breakpoints responsive (UX-DR21).
5. **Given** la palette couleur définie **When** je la valide sur fond sombre **Then** le contraste WCAG AA (4.5:1 minimum) est respecté pour chaque combinaison texte/fond utilisée (UX-DR22, NFR10).
6. **Given** le projet buildé **When** je lance `npm run dev` **Then** l'application se charge sur un poste de développement standard sans erreur console.

## Tasks / Subtasks

- [x] **Task 1: Scaffolder le projet Vue 3 + Vite PWA** (AC: 1)
  - [x] 1.1 Depuis la **racine du dépôt Git** (`/Users/nathan/Developer/04_Projets/carom_scoreboard`), exécuter : `npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts`. Le CLI crée le sous-dossier `carom-scoreboard/` directement au bon endroit — pas de déplacement de fichiers nécessaire (repo layout monorepo : bmad à la racine, code applicatif dans `carom-scoreboard/`, cf. `architecture.md#Repository Layout`).
  - [x] 1.2 Si le scaffold a initialisé son propre `.git/` **à l'intérieur** de `carom-scoreboard/`, le supprimer — un seul dépôt Git doit subsister (celui déjà présent à la racine du repo).
  - [x] 1.3 Le `.gitignore` généré par le scaffold reste **local à `carom-scoreboard/`** (node_modules, dist, etc.) — ne pas le fusionner avec le `.gitignore` racine, qui gère un périmètre différent (`.DS_Store`, `./explore/scoreboard_test/`). Les deux coexistent, chacun scope à son dossier.
  - [x] 1.4 Vérifier `git status` depuis la racine : un seul dépôt, pas de repo imbriqué, tous les fichiers générés apparaissent sous `carom-scoreboard/`.
  - [x] 1.5 Toutes les commandes des Tasks suivantes (`npm install`, `npm run build`, `npm run dev`, etc.) s'exécutent avec `carom-scoreboard/` comme working directory.

- [x] **Task 2: Installer et configurer les dépendances complémentaires** (AC: 2)
  - [x] 2.1 `npm install -D tailwindcss @tailwindcss/vite`
  - [x] 2.2 `npm install pinia vue-router@4 dexie`
  - [x] 2.3 `npm install -D vitest @vue/test-utils happy-dom`
  - [x] 2.4 Ajouter le plugin `tailwindcss()` (importé depuis `@tailwindcss/vite`) dans `vite.config.ts`, à côté du plugin `VitePWA` déjà généré par le starter. **Ne pas créer de `tailwind.config.js`** — Tailwind v4 utilise une configuration CSS-first (`@theme` dans le CSS), pas de fichier JS.
  - [x] 2.5 Créer `vitest.config.ts` (fichier séparé, conforme à l'arborescence architecturale) avec l'environnement de test `happy-dom`.
  - [x] 2.6 Vérifier que `npm install` se termine sans erreur et que `npm run build` produit un build fonctionnel.

- [x] **Task 3: Créer l'arborescence `src/` conforme à l'architecture** (AC: 3)
  - [x] 3.1 Créer les dossiers `src/types`, `src/stores`, `src/services`, `src/composables`, `src/components`, `src/views`, `src/router`, chacun avec un fichier `.gitkeep` (Git ne suit pas les dossiers vides). **Aucun fichier de code métier** dans ces dossiers à ce stade — la séquence d'implémentation actée en architecture les remplit story par story (types → services → stores → composants → routing).
  - [x] 3.2 Conserver `src/assets/` généré par le starter — réutilisé à la Task 4.

- [x] **Task 4: Définir les tokens de fondation visuelle Tailwind CSS v4** (AC: 4, AC: 5)
  - [x] 4.1 Dans le CSS d'entrée généré par le starter (renommer en `src/assets/main.css` si besoin, pour cohérence avec l'architecture), poser `@import "tailwindcss";` puis un bloc `@theme { ... }`.
  - [x] 4.2 Couleurs joueur : `--color-player-yellow: #FFC72C`, `--color-player-white: #FFFFFF`, `--color-player-orange: #FF7A1A`, `--color-player-magenta: #F0388B`.
  - [x] 4.3 Accent système `--color-accent: #1E88E5`, alerte `--color-alert: #FF3B30`, victoire `--color-victory-gold: #FFD54A` et `--color-victory-ribbon: #E63946`.
  - [x] 4.4 Fond sombre `--color-bg: #0D1117` (valeur de première passe issue de `ux-design-specification.md` — approximative, susceptible d'être affinée par Nathan ; ne pas la considérer pixel-perfect finale).
  - [x] 4.5 Échelle typographique fluide : `--font-size-score` (`clamp()`, ~120–200px), `--font-size-label` (~16–24px), `--font-size-stat` (~14–18px). Les bornes min/max sont contractuelles ; la valeur préférée intermédiaire du `clamp()` ne l'est pas et peut être ajustée visuellement.
  - [x] 4.6 Unité de base d'espacement 8px (`--spacing: 8px` — déjà l'échelle par défaut Tailwind, la définir explicitement en token).
  - [x] 4.7 Taille minimale de zone tactile 90×90px (ex. `--size-touch-target: 90px`).
  - [x] 4.8 **Surcharger le breakpoint `lg` à 1280px** (`--breakpoint-lg: 1280px`). ⚠️ Le défaut Tailwind v4 pour `lg` est **1024px**, ce qui ne correspond PAS au découpage architectural (signage/desktop ≥1280px, tablette 768–1279px). Ne pas toucher `md` (768px, déjà conforme).
  - [x] 4.9 Ajouter le reset tactile global obligatoire (AR8) dans le même fichier CSS : `* { -webkit-tap-highlight-color: transparent; } button, [role="button"] { touch-action: manipulation; user-select: none; }`.
  - [x] 4.10 Valider le contraste WCAG AA (4.5:1 min.) pour chaque paire texte/fond : texte noir sur jaune `#FFC72C` et blanc `#FFFFFF` ; texte blanc sur orange `#FF7A1A` et magenta `#F0388B` ; texte blanc sur accent bleu `#1E88E5` ; texte sur fond `#0D1117` ; rouge alerte `#FF3B30` sur noir ; or `#FFD54A` / ruban `#E63946`. Utiliser un vérificateur de contraste (ex. WebAIM). Si un ratio échoue, ajuster la couleur de **texte** (jamais les couleurs de marque imposées) et documenter le résultat dans les Completion Notes.

- [x] **Task 5: Valider build et serveur de dev** (AC: 6)
  - [x] 5.1 Lancer `npm run dev`, vérifier le chargement sans erreur console sur un poste de développement standard.
  - [x] 5.2 Relancer `npm run build` après les changements Tailwind/tokens pour confirmer l'absence de régression.

### Review Findings

- [x] [Review][Decision] Ajouter `.nvmrc` pour figer la version Node — résolu : Nathan a choisi de l'ajouter immédiatement. Créé avec la version Node du poste de dev (`26.8.1`). [carom-scoreboard/.nvmrc]
- [x] [Review][Patch] Appliquer réellement le token `--color-bg` (#0D1117) et retirer le CSS clair hérité du starter qui l'annule (règle `:root` avec `background-color: #242424` et le bloc `@media (prefers-color-scheme: light)`) — sans ce correctif le fond sombre validé pour le contraste AA n'est jamais rendu à l'écran. [carom-scoreboard/src/assets/main.css]
- [x] [Review][Patch] Ajouter les tokens `--color-on-alert` et `--color-on-victory-gold`, manquants dans le bloc `@theme` alors que toutes les autres couleurs de marque ont leur paire de contraste AA (`--color-on-*`). [carom-scoreboard/src/assets/main.css]
- [x] [Review][Patch] Aligner `theme_color` (et ajouter `background_color`) du manifest PWA sur `--color-bg`, et compléter `display`/`start_url`/`scope` — le manifest garde actuellement les valeurs par défaut du starter (`theme_color: '#ffffff'`), en contradiction avec le thème sombre. [carom-scoreboard/vite.config.ts]
- [x] [Review][Patch] Ajouter `vitest.config.ts` et `pwa-assets.config.ts` au tableau `include` de `tsconfig.node.json` — ces fichiers créés/générés par cette story ne sont couverts par aucun tsconfig et échappent donc à `vue-tsc -b` et à l'IDE. [carom-scoreboard/tsconfig.node.json]
- [x] [Review][Patch] Corriger le formatage mineur : retour à la ligne final manquant en fin de fichier, ligne blanche parasite dans `index.html`. [carom-scoreboard/vite.config.ts, carom-scoreboard/index.html]
- [x] [Review][Defer] Durcir la gestion d'erreurs de `PWABadge.vue` (fetch/`r.update()` sans `.catch()`, statut HTTP non-200 ignoré, `setInterval` jamais nettoyé au démontage, pas de callback `onRegisterError`, listener `statechange` non retiré après activation) — deferred, pre-existing (composant généré tel quel par le starter, hors périmètre de cette story). [carom-scoreboard/src/components/PWABadge.vue]
- [x] [Review][Defer] Compléter `workbox.globPatterns` (polices `woff`/`woff2`) et fournir un `navigateFallback` de production une fois le routing en place (actuellement seul `devOptions.navigateFallback` est défini, et `devOptions.enabled` est `false`) — deferred, pre-existing (routing hors périmètre de cette story). [carom-scoreboard/vite.config.ts:14-22]
- [x] [Review][Defer] Résoudre l'incohérence `<html lang="en">` vs. commentaires/contenu en français, une fois le contenu réel de l'application introduit — deferred, pre-existing. [carom-scoreboard/index.html]
- [x] [Review][Defer] Ajouter un outillage lint/format (ESLint/Prettier) pour faire respecter mécaniquement les règles TypeScript strictes déjà activées — deferred, pre-existing. [carom-scoreboard/]

## Dev Notes

### Hors périmètre de cette story (ne pas anticiper)

- Routing (3 routes `/`, `/history`, `/history/:id`) — `src/router` reste un dossier vide, l'implémentation est pour une story ultérieure.
- Stores Pinia (`useGameStore`, `useHistoryStore`) — dossier vide uniquement.
- Types TypeScript (`game.ts`, `history.ts`) — dossier vide uniquement.
- `CLAUDE.md` — c'est la **Story 1.2**, immédiatement après celle-ci, avant tout code fonctionnel. Emplacement exact (racine du dépôt vs racine de `carom-scoreboard/`) à trancher dans cette story 1.2, pas ici.
- Tout composant Vue au-delà de ceux générés par le starter (`PlayerPanel`, `NumericPad`, etc.) — stories ultérieures.
- Déploiement Netlify (`netlify.toml`) — non couvert explicitement par une story d'Epic 1 identifiée ; à signaler au PM si besoin, ne pas l'ajouter ici de sa propre initiative.

### Relevant architecture patterns and constraints

- Composition API + `<script setup>` uniquement — jamais d'Options API.
- TypeScript strict activé.
- Tailwind CSS v4 = configuration **CSS-first** via `@theme`, pas de `tailwind.config.js`.
- Mobile-first obligatoire : défaut < 768px, `md:` ≥ 768px, `lg:` ≥ 1280px (breakpoint `lg` à surcharger, voir Task 4.8).
- Conventions de nommage (s'appliqueront aux stories suivantes, pas de code métier créé ici) : composants Vue PascalCase, stores/composables `use` + camelCase, services camelCase + suffixe `Service`, types PascalCase sans préfixe `I`, tests co-localisés `Component.test.ts` (jamais de dossier `__tests__/`).
- [Source: architecture.md#Décisions Architecturales du Starter, #Patterns de Nommage, #Patterns Tailwind CSS]

### Source tree components to touch

Tout se trouve sous `carom-scoreboard/` (sous-dossier applicatif du dépôt, cf. Repository Layout ci-dessous), jamais à la racine du dépôt Git.

`carom-scoreboard/` : `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore` (généré par le scaffold, local à ce dossier), `.nvmrc`, `public/manifest.json`, `public/favicon*`.

`carom-scoreboard/src/` : `main.ts`, `App.vue`, `assets/main.css` (tokens Tailwind), et les 7 dossiers vides listés en Task 3 (`.gitkeep`).

[Source: architecture.md#Repository Layout, #Arborescence Complète]

### Testing standards summary

Vitest + Vue Test Utils + happy-dom installés et configurés (`vitest.config.ts`) dans cette story, mais **aucun test à écrire** — aucun composant/logique métier n'existe encore. Les tests co-localisés (`Component.test.ts` à côté de `Component.vue`) commenceront avec les premiers composants (stories suivantes).

### Project Structure Notes

- **Repository Layout (monorepo)** : le dépôt Git racine contient déjà `_bmad/`, `_bmad-output/`, `docs/`, `explore/`, `.claude/`, etc. — tout est poussé sur le remote, y compris les artefacts BMad, pour rester synchronisé entre les deux postes de travail de Nathan. Le code applicatif ne vit **pas** à la racine du dépôt : il est isolé dans `carom-scoreboard/`, créé directement à cet emplacement par la commande de scaffold (Task 1) — aucune fusion/déplacement de fichiers n'est nécessaire. [Source: architecture.md#Repository Layout]
- `src/assets/` (sous `carom-scoreboard/`) n'est pas listé explicitement dans l'AC 3 (qui ne cite que types/stores/services/composables/components/views/router) mais existe déjà via le starter et est réutilisé pour les tokens Tailwind (Task 4) — pas un conflit, un ajout cohérent avec l'arborescence complète de l'architecture.
- Le prototype `explore/scoreboard_test/scoreboard/` (Vue 3 + Vite, dépôt Git et `node_modules` séparés, exclu du `.gitignore`) est une **référence visuelle/mécanique uniquement** — ne pas copier son code ni le modifier.

### References

- [Source: epics.md#Story 1.1: Initialisation du projet (L276-306)]
- [Source: epics.md#Additional Requirements — AR1, AR3, AR15, AR16, AR19 (L123-146)]
- [Source: epics.md#UX Design Requirements — UX-DR1, UX-DR3, UX-DR5, UX-DR6, UX-DR7, UX-DR8, UX-DR21, UX-DR22 (L147-172)]
- [Source: epics.md#NonFunctional Requirements — NFR9, NFR10 (L91-119)]
- [Source: architecture.md#Repository Layout]
- [Source: architecture.md#Évaluation du Starter Template (L56-145)]
- [Source: architecture.md#Structure du Projet & Frontières Architecturales (L406-475)]
- [Source: architecture.md#Patterns d'Implémentation & Règles de Consistance (L272-405)]
- [Source: ux-design-specification.md#Visual Design Foundation (L200-239)]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts` est un CLI interactif (prompts en mode raw TTY) — un premier essai de résolution automatique via `npx` a résolu le mauvais package (`create-pwa` non scopé au lieu de `@vite-pwa/create-pwa`), générant des fichiers parasites (`config.xml`, `manifest.json`, `service-worker.js`, dossiers `favicons/`, `icons/`, `launch-screens/`) à la racine du dépôt. Nettoyés avant de relancer avec la commande exacte de l'AC1, pilotée via un script `expect` pour répondre aux prompts (valeurs par défaut, génération d'assets PWA différée).
- `npm run build` : succès, bundle CSS passé de 1.76 kB à 8.71 kB après ajout du bloc `@theme` Tailwind (confirme la compilation des tokens).
- `npm run dev` : serveur démarré sur un port de test, `curl` renvoie HTTP 200 sur `/` et `/src/main.ts`, aucune erreur dans les logs Vite.
- `npx vitest run` : « No test files found » (attendu — aucun test à écrire dans cette story, cf. Testing standards summary).

### Completion Notes List

- Scaffold Vue 3 + TypeScript + Vite créé dans `carom-scoreboard/` via le starter officiel `@vite-pwa/pwa` (variant `vue-ts`), sans dépôt Git imbriqué (un seul `.git` à la racine).
- Dépendances complémentaires installées : Tailwind CSS v4 + `@tailwindcss/vite` (plugin ajouté dans `vite.config.ts`, pas de `tailwind.config.js` — config CSS-first), Pinia, vue-router@4, Dexie, Vitest + Vue Test Utils + happy-dom (config isolée dans `vitest.config.ts`).
- Arborescence `src/types`, `src/stores`, `src/services`, `src/composables`, `src/views`, `src/router` créée avec `.gitkeep` ; `src/components` déjà présent (starter) conservé avec `.gitkeep` ajouté également. `src/assets/` conservé et réutilisé pour les tokens visuels.
- CSS d'entrée renommé `src/style.css` → `src/assets/main.css` (import mis à jour dans `main.ts`) et enrichi d'un bloc `@theme` Tailwind v4 : couleurs joueur, accent, alerte, victoire, fond sombre `#0D1117`, échelle typographique fluide (`--font-size-score/label/stat`), `--spacing: 8px`, `--size-touch-target: 90px`, surcharge `--breakpoint-lg: 1280px`, reset tactile global (AR8). Le CSS de démonstration généré par le starter (styles du composant `HelloWorld`) a été conservé tel quel — hors périmètre de cette story.
- **Validation contraste WCAG AA (4.5:1 min., calcul manuel selon la formule de luminance relative WCAG)** :
  - Texte noir sur jaune `#FFC72C` : ~13.5:1 — conforme.
  - Texte noir sur blanc `#FFFFFF` : ~21:1 — conforme.
  - Texte **blanc** sur orange `#FF7A1A` : ~2.6:1 — **non conforme**. Texte **noir** sur orange : ~8.0:1 — conforme. → token `--color-on-player-orange: #000000` ajouté.
  - Texte **blanc** sur magenta `#F0388B` : ~3.7:1 — **non conforme**. Texte **noir** sur magenta : ~5.6:1 — conforme. → token `--color-on-player-magenta: #000000` ajouté.
  - Texte **blanc** sur accent bleu `#1E88E5` : ~3.7:1 — **non conforme**. Texte **noir** sur accent : ~5.7:1 — conforme. → token `--color-on-accent: #000000` ajouté.
  - Texte blanc sur fond `#0D1117` : ~18.9:1 — conforme.
  - Rouge alerte `#FF3B30` sur fond `#0D1117`/noir : ~5.3–5.9:1 — conforme (utilisable comme couleur de texte/icône sur fond sombre).
  - Or victoire `#FFD54A` sur fond `#0D1117` : ~13.4:1 — conforme (utilisable comme couleur de texte sur fond sombre).
  - Texte **blanc** sur ruban victoire `#E63946` : ~4.17:1 — **non conforme** (sous le seuil 4.5:1). Texte **noir** sur ruban : ~5.0:1 — conforme. → token `--color-on-victory-ribbon: #000000` ajouté.
  - Conformément à la consigne (« ajuster la couleur de texte, jamais les couleurs de marque »), des tokens `--color-on-*` ont été ajoutés dans `@theme` pour documenter/imposer la couleur de texte correcte à utiliser par les composants des stories suivantes (`PlayerPanel`, bandeau de victoire, etc.) sur chaque couleur de marque testée. Couleurs de marque non modifiées.
- `npm run build` et `npm run dev` validés sans erreur (AC6). Un script `test` (`vitest run`) a été ajouté à `package.json` pour rendre la suite Vitest exécutable dès les prochaines stories (aucun test n'existe encore, conforme au périmètre de cette story).
- Pas de `.nvmrc` généré par le starter (non exigé par une subtask explicite) — non ajouté de sa propre initiative, à signaler si Nathan le souhaite dans une story ultérieure.
- Déploiement Netlify (`netlify.toml`) volontairement non ajouté — hors périmètre explicite de cette story (cf. Dev Notes).

### File List

- `carom-scoreboard/.gitignore` (généré par le scaffold)
- `carom-scoreboard/.vscode/extensions.json` (généré par le scaffold)
- `carom-scoreboard/README.md` (généré par le scaffold)
- `carom-scoreboard/index.html` (généré par le scaffold)
- `carom-scoreboard/package.json` (généré + dépendances ajoutées + script `test`)
- `carom-scoreboard/package-lock.json` (généré)
- `carom-scoreboard/public/favicon.svg` (généré par le scaffold)
- `carom-scoreboard/pwa-assets.config.ts` (généré par le scaffold)
- `carom-scoreboard/tsconfig.json` (généré par le scaffold)
- `carom-scoreboard/tsconfig.app.json` (généré par le scaffold)
- `carom-scoreboard/tsconfig.node.json` (généré par le scaffold)
- `carom-scoreboard/vite.config.ts` (généré + plugin `tailwindcss()` ajouté)
- `carom-scoreboard/vitest.config.ts` (créé)
- `carom-scoreboard/src/main.ts` (import CSS mis à jour)
- `carom-scoreboard/src/App.vue` (généré par le scaffold, non modifié)
- `carom-scoreboard/src/vite-env.d.ts` (généré par le scaffold)
- `carom-scoreboard/src/assets/main.css` (renommé depuis `style.css` + tokens `@theme` + reset tactile)
- `carom-scoreboard/src/assets/vue.svg` (généré par le scaffold)
- `carom-scoreboard/src/components/HelloWorld.vue` (généré par le scaffold, non modifié)
- `carom-scoreboard/src/components/PWABadge.vue` (généré par le scaffold, non modifié)
- `carom-scoreboard/src/components/.gitkeep` (créé)
- `carom-scoreboard/src/types/.gitkeep` (créé)
- `carom-scoreboard/src/stores/.gitkeep` (créé)
- `carom-scoreboard/src/services/.gitkeep` (créé)
- `carom-scoreboard/src/composables/.gitkeep` (créé)
- `carom-scoreboard/src/views/.gitkeep` (créé)
- `carom-scoreboard/src/router/.gitkeep` (créé)

## Change Log

| Date | Description |
| --- | --- |
| 2026-09-08 | Story 1.1 implémentée : scaffold Vue 3 + Vite PWA, dépendances complémentaires, arborescence `src/`, tokens de fondation visuelle Tailwind v4 (avec validation et correction de contraste WCAG AA), build et dev serveur validés. Statut passé à "review". |
