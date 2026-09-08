# Story 1.1: Initialisation du projet

Status: ready-for-dev

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

- [ ] **Task 1: Scaffolder le projet Vue 3 + Vite PWA** (AC: 1)
  - [ ] 1.1 Depuis la **racine du dépôt Git** (`/Users/nathan/Developer/04_Projets/carom_scoreboard`), exécuter : `npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts`. Le CLI crée le sous-dossier `carom-scoreboard/` directement au bon endroit — pas de déplacement de fichiers nécessaire (repo layout monorepo : bmad à la racine, code applicatif dans `carom-scoreboard/`, cf. `architecture.md#Repository Layout`).
  - [ ] 1.2 Si le scaffold a initialisé son propre `.git/` **à l'intérieur** de `carom-scoreboard/`, le supprimer — un seul dépôt Git doit subsister (celui déjà présent à la racine du repo).
  - [ ] 1.3 Le `.gitignore` généré par le scaffold reste **local à `carom-scoreboard/`** (node_modules, dist, etc.) — ne pas le fusionner avec le `.gitignore` racine, qui gère un périmètre différent (`.DS_Store`, `./explore/scoreboard_test/`). Les deux coexistent, chacun scope à son dossier.
  - [ ] 1.4 Vérifier `git status` depuis la racine : un seul dépôt, pas de repo imbriqué, tous les fichiers générés apparaissent sous `carom-scoreboard/`.
  - [ ] 1.5 Toutes les commandes des Tasks suivantes (`npm install`, `npm run build`, `npm run dev`, etc.) s'exécutent avec `carom-scoreboard/` comme working directory.

- [ ] **Task 2: Installer et configurer les dépendances complémentaires** (AC: 2)
  - [ ] 2.1 `npm install -D tailwindcss @tailwindcss/vite`
  - [ ] 2.2 `npm install pinia vue-router@4 dexie`
  - [ ] 2.3 `npm install -D vitest @vue/test-utils happy-dom`
  - [ ] 2.4 Ajouter le plugin `tailwindcss()` (importé depuis `@tailwindcss/vite`) dans `vite.config.ts`, à côté du plugin `VitePWA` déjà généré par le starter. **Ne pas créer de `tailwind.config.js`** — Tailwind v4 utilise une configuration CSS-first (`@theme` dans le CSS), pas de fichier JS.
  - [ ] 2.5 Créer `vitest.config.ts` (fichier séparé, conforme à l'arborescence architecturale) avec l'environnement de test `happy-dom`.
  - [ ] 2.6 Vérifier que `npm install` se termine sans erreur et que `npm run build` produit un build fonctionnel.

- [ ] **Task 3: Créer l'arborescence `src/` conforme à l'architecture** (AC: 3)
  - [ ] 3.1 Créer les dossiers `src/types`, `src/stores`, `src/services`, `src/composables`, `src/components`, `src/views`, `src/router`, chacun avec un fichier `.gitkeep` (Git ne suit pas les dossiers vides). **Aucun fichier de code métier** dans ces dossiers à ce stade — la séquence d'implémentation actée en architecture les remplit story par story (types → services → stores → composants → routing).
  - [ ] 3.2 Conserver `src/assets/` généré par le starter — réutilisé à la Task 4.

- [ ] **Task 4: Définir les tokens de fondation visuelle Tailwind CSS v4** (AC: 4, AC: 5)
  - [ ] 4.1 Dans le CSS d'entrée généré par le starter (renommer en `src/assets/main.css` si besoin, pour cohérence avec l'architecture), poser `@import "tailwindcss";` puis un bloc `@theme { ... }`.
  - [ ] 4.2 Couleurs joueur : `--color-player-yellow: #FFC72C`, `--color-player-white: #FFFFFF`, `--color-player-orange: #FF7A1A`, `--color-player-magenta: #F0388B`.
  - [ ] 4.3 Accent système `--color-accent: #1E88E5`, alerte `--color-alert: #FF3B30`, victoire `--color-victory-gold: #FFD54A` et `--color-victory-ribbon: #E63946`.
  - [ ] 4.4 Fond sombre `--color-bg: #0D1117` (valeur de première passe issue de `ux-design-specification.md` — approximative, susceptible d'être affinée par Nathan ; ne pas la considérer pixel-perfect finale).
  - [ ] 4.5 Échelle typographique fluide : `--font-size-score` (`clamp()`, ~120–200px), `--font-size-label` (~16–24px), `--font-size-stat` (~14–18px). Les bornes min/max sont contractuelles ; la valeur préférée intermédiaire du `clamp()` ne l'est pas et peut être ajustée visuellement.
  - [ ] 4.6 Unité de base d'espacement 8px (`--spacing: 8px` — déjà l'échelle par défaut Tailwind, la définir explicitement en token).
  - [ ] 4.7 Taille minimale de zone tactile 90×90px (ex. `--size-touch-target: 90px`).
  - [ ] 4.8 **Surcharger le breakpoint `lg` à 1280px** (`--breakpoint-lg: 1280px`). ⚠️ Le défaut Tailwind v4 pour `lg` est **1024px**, ce qui ne correspond PAS au découpage architectural (signage/desktop ≥1280px, tablette 768–1279px). Ne pas toucher `md` (768px, déjà conforme).
  - [ ] 4.9 Ajouter le reset tactile global obligatoire (AR8) dans le même fichier CSS : `* { -webkit-tap-highlight-color: transparent; } button, [role="button"] { touch-action: manipulation; user-select: none; }`.
  - [ ] 4.10 Valider le contraste WCAG AA (4.5:1 min.) pour chaque paire texte/fond : texte noir sur jaune `#FFC72C` et blanc `#FFFFFF` ; texte blanc sur orange `#FF7A1A` et magenta `#F0388B` ; texte blanc sur accent bleu `#1E88E5` ; texte sur fond `#0D1117` ; rouge alerte `#FF3B30` sur noir ; or `#FFD54A` / ruban `#E63946`. Utiliser un vérificateur de contraste (ex. WebAIM). Si un ratio échoue, ajuster la couleur de **texte** (jamais les couleurs de marque imposées) et documenter le résultat dans les Completion Notes.

- [ ] **Task 5: Valider build et serveur de dev** (AC: 6)
  - [ ] 5.1 Lancer `npm run dev`, vérifier le chargement sans erreur console sur un poste de développement standard.
  - [ ] 5.2 Relancer `npm run build` après les changements Tailwind/tokens pour confirmer l'absence de régression.

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

### Debug Log References

### Completion Notes List

### File List
