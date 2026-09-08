# Story 1.2: Rédaction de CLAUDE.md

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a développeur (assisté par IA),
I want un fichier `CLAUDE.md` à la racine du projet documentant les conventions du projet,
so that chaque session de code IA génère un code cohérent avec l'architecture actée.

## Acceptance Criteria

1. **Given** le projet initialisé (Story 1.1) **When** je crée `CLAUDE.md` à la racine du sous-dossier applicatif `carom-scoreboard/` **Then** le fichier documente : les conventions de nommage (AR15), la règle Pointer Events (AR8), la gestion d'erreurs storage en couche service (AR12), les règles Pinia (AR17, AR18), les tests co-localisés (AR16) et les breakpoints Tailwind (AR19).
2. **Given** `CLAUDE.md` rédigé **When** un futur agent IA l'utilise comme référence avant de coder **Then** il dispose de toutes les règles obligatoires de l'architecture sans consulter un autre document.

## Tasks / Subtasks

- [x] Task 1 : Créer `carom-scoreboard/CLAUDE.md` (AC: #1)
  - [x] Subtask 1.1 : Section conventions de nommage — composants Vue PascalCase, stores/composables `use`+camelCase, services camelCase+suffixe `Service`, types PascalCase sans préfixe `I`, tests `Component.test.ts`, vues PascalCase+suffixe `View`, emits Vue kebab-case, actions Pinia verbe+nom, exports nommés uniquement (jamais de default export pour composables/services) (AR15)
  - [x] Subtask 1.2 : Section règle Pointer Events — `@pointerdown` obligatoire sur tout élément tactile interactif, jamais `@touchstart` ni `@click` seul ; rappel du CSS global obligatoire (`touch-action: manipulation`, `user-select: none`, `-webkit-tap-highlight-color: transparent`) (AR8)
  - [x] Subtask 1.3 : Section gestion d'erreurs storage — `try/catch` + `console.error` exclusivement dans la couche service (`storageService.ts`, `databaseService.ts`), jamais dans les composants (AR12)
  - [x] Subtask 1.4 : Section règles Pinia — toute mutation de store via une action Pinia nommée uniquement (jamais de mutation directe depuis un composant), `storeToRefs()` obligatoire pour toute propriété réactive consommée par un composant (AR17)
  - [x] Subtask 1.5 : Section async/await — `async/await` exclusif pour toute logique asynchrone des stores Pinia, jamais `.then().catch()` (AR18)
  - [x] Subtask 1.6 : Section tests co-localisés — `Component.test.ts` à côté de `Component.vue`, jamais de dossier `__tests__/` (AR16)
  - [x] Subtask 1.7 : Section breakpoints Tailwind — mobile-first obligatoire, 3 breakpoints (défaut < 768px, `md:` ≥ 768px, `lg:` ≥ 1280px) (AR19)
- [x] Task 2 : Valider l'autosuffisance du document (AC: #2)
  - [x] Subtask 2.1 : Relire `CLAUDE.md` en se plaçant du point de vue d'un agent IA sans accès à `architecture.md` ni `epics.md` — vérifier qu'aucune des 6 règles obligatoires (AR8, AR12, AR15, AR16, AR17, AR18, AR19) n'est absente ou ambiguë
  - [x] Subtask 2.2 : Vérifier qu'aucune règle documentée ne contredit `architecture.md` (source de vérité en cas de divergence future)

### Review Findings

- [x] [Review][Decision] Contradiction interne AR12 vs exemple AR18 — Résolu : l'exemple AR18 (`loadHistory`) a été réécrit pour déléguer l'appel Dexie à une fonction `databaseService.ts` (`fetchRecentGames`) qui porte le `try/catch`/`console.error`, conformément à l'« exclusivement » d'AR12 ; le store se contente désormais d'`await` sans son propre `try/catch`. [carom-scoreboard/CLAUDE.md:88-104]
- [x] [Review][Patch] Classe Tailwind invalide dans l'exemple AR8 (`touch-action-manipulation` n'existe pas ; la vraie classe est `touch-manipulation`) [carom-scoreboard/CLAUDE.md:39] — corrigé
- [x] [Review][Patch] Tension rédactionnelle entre l'affirmation d'auto-suffisance totale de l'intro et la section « En cas de divergence » qui renvoie vers `architecture.md` — reformulé pour clarifier que l'auto-suffisance vaut pour l'usage quotidien, l'architecture ne faisant foi qu'en cas de divergence future [carom-scoreboard/CLAUDE.md:3] — corrigé
- [x] [Review][Patch] Le CSS global obligatoire (AR8) ne cible que `button, [role="button"]`, alors que la règle textuelle exige `@pointerdown` sur « tout élément tactile/interactif critique » — ajouté une précision : tout élément interactif custom doit porter `role="button"` [carom-scoreboard/CLAUDE.md:44-49] — corrigé
- [x] [Review][Defer] Formule « élimine le délai 300ms iPad/Android » (AR8) potentiellement obsolète sur navigateurs modernes — héritée telle quelle de la formulation source `architecture.md`, à corriger au niveau de la source [carom-scoreboard/CLAUDE.md:35] — deferred, pre-existing
- [x] [Review][Defer] Breakpoint `lg:` documenté à ≥1280px ne correspond pas à la valeur par défaut Tailwind (1024px = `lg`, 1280px = `xl` par défaut) et aucun breakpoint explicite ne couvre la plage 768–1280px — hérité tel quel d'AR19 dans `architecture.md` [carom-scoreboard/CLAUDE.md:112-119] — deferred, pre-existing
- [x] [Review][Defer] L'exemple d'emit `update:score` (convention « kebab-case », AR15) contient un `:` non kebab-case — incohérence héritée de la formulation source [carom-scoreboard/CLAUDE.md:30] — deferred, pre-existing
- [x] [Review][Defer] Plusieurs règles (AR12 storage, AR17 mutations, AR18 async, AR16 tests, AR8 « élément critique ») sont formulées avec un périmètre strict (composant / store Pinia / fichiers nommés explicitement) laissant des zones grises pour les composables, les futurs fichiers `*Service.ts`, ou les tests de store/service — ambiguïtés héritées de la formulation exacte d'`architecture.md`, à traiter lors d'une story future touchant concrètement ces couches [carom-scoreboard/CLAUDE.md:16-119] — deferred, pre-existing
- [x] [Review][Defer] Aucune convention documentée pour l'identifiant de store Pinia (`defineStore('id', ...)`) ni pour les fichiers utilitaires génériques non préfixés `use` — absents du tableau de nommage source (AR15) [carom-scoreboard/CLAUDE.md:16-31] — deferred, pre-existing

## Dev Notes

### Nature de cette story — documentation pure, pas de code

Cette story ne produit aucun code fonctionnel : un unique fichier Markdown. Aucun test à écrire (rien à exécuter). Ne pas modifier le scaffold livré par la Story 1.1 (`src/`, `package.json`, etc.) — cette story est strictement additive.

### Emplacement de CLAUDE.md — décision actée

La Story 1.1 avait explicitement laissé cette décision ouverte ("Emplacement exact (racine du dépôt vs racine de `carom-scoreboard/`) à trancher dans cette story 1.2"). L'arborescence complète de l'architecture tranche sans ambiguïté : `CLAUDE.md` est à la racine du sous-dossier applicatif `carom-scoreboard/`, pas à la racine du dépôt Git (qui héberge aussi `_bmad/`, `_bmad-output/`, `docs/`, `explore/`, non concernés par ces conventions de code). [Source: architecture.md#Arborescence Complète (L415-417)]

### Contenu obligatoire — 6 règles, ni plus ni moins pour l'AC

L'AC1 liste exactement 6 règles obligatoires à documenter (AR15, AR8, AR12, AR17+AR18, AR16, AR19) — reprises intégralement dans les Tasks ci-dessus avec leur formulation exacte issue de l'architecture. Ne pas inventer de règles supplémentaires non actées (ex. ne pas documenter AR9 `shallowRef`, AR10 cache Service Worker, AR13/AR14 composables `useSpeech`/`useTimer` — hors périmètre de cette story, ils seront actés dans les stories qui les implémentent).

Un minimum de contexte de framing (nom du projet, stack technique en une ligne, commande `npm run dev`/`npm run build`/`npm test`) peut être ajouté en tête de fichier pour l'utilisabilité générale d'un `CLAUDE.md`, mais reste secondaire à l'AC — ne pas y consacrer d'effort disproportionné par rapport aux 6 règles obligatoires.

### Formulation exacte des règles (source unique de vérité : architecture.md)

Copier fidèlement le sens de ces règles, déjà validées et sourcées — ne pas reformuler de façon à en changer la portée :

- **AR15 — Nommage** : composants Vue `PascalCase` (`PlayerPanel.vue`) ; stores Pinia `camelCase`+préfixe `use` (`useGameStore.ts`) ; composables `camelCase`+préfixe `use` (`usePointerEvents.ts`) ; services `camelCase`+suffixe `Service` (`storageService.ts`) ; types `camelCase` pour le nom de fichier (`game.ts`), types TS eux-mêmes en `PascalCase` sans préfixe `I` (`GameState`, jamais `IGameState`) ; tests même nom + `.test.ts` ; vues `PascalCase`+suffixe `View` (`GameView.vue`) ; emits Vue en kebab-case (`update:score`) ; actions Pinia en verbe+nom (`setPlayerName`, `addReprise`, jamais `playerNameUpdate`) ; exports nommés uniquement, jamais de `default export` pour composables/services. [Source: architecture.md#Patterns de Nommage (L278-298)]
- **AR8 — Pointer Events** : `@pointerdown` partout sur les éléments tactiles/interactifs critiques, jamais `@touchstart` ni `@click` seul — élimine le délai 300ms iPad/Android. CSS global requis : `* { -webkit-tap-highlight-color: transparent; }` et `button, [role="button"] { touch-action: manipulation; user-select: none; }`. Interactions complexes → passer par `usePointerEvents.ts`, ne pas réimplémenter la logique pointer inline. [Source: architecture.md#Patterns Touch & Pointer (L335-350)]
- **AR12 — Erreurs storage en couche service** : `try/catch` + `console.error` dans `storageService.ts`/`databaseService.ts` uniquement — le composant appelant ne gère jamais l'erreur storage lui-même. [Source: architecture.md#Patterns Gestion d'État & Erreurs (L360-370)]
- **AR17 — Mutations Pinia & réactivité** : mutation de store exclusivement via une action Pinia nommée (`gameStore.addReprise(value)`), jamais de mutation directe depuis un composant (`gameStore.reprises.push(...)` interdit) ; `storeToRefs()` obligatoire pour préserver la réactivité (`const { player1 } = storeToRefs(gameStore)`, jamais `const player1 = gameStore.player1`). [Source: architecture.md#Patterns de Communication Vue (L317-333)]
- **AR18 — async/await exclusif** : toute logique asynchrone de store Pinia en `async/await`, jamais `.then().catch()`. [Source: architecture.md#Patterns Gestion d'État & Erreurs (L372-383)]
- **AR16 — Tests co-localisés** : `PlayerPanel.test.ts` à côté de `PlayerPanel.vue`, jamais de dossier `__tests__/`. [Source: architecture.md#Patterns de Structure (L302-307)]
- **AR19 — Breakpoints Tailwind mobile-first** : défaut (< 768px) = smartphone/portrait ; `md:` (≥ 768px) = tablette paysage ; `lg:` (≥ 1280px) = signage 22"/desktop. Ordre des classes Tailwind : Layout → Sizing → Spacing → Typography → Colors → Effects → Responsive modifiers. [Source: architecture.md#Patterns Tailwind CSS (L385-392)]

### Relevant architecture patterns and constraints

- Composition API + `<script setup>` uniquement (pas d'Options API) et TypeScript strict — déjà actés Story 1.1, non repris comme règle obligatoire de l'AC mais cohérent avec l'esprit du document si mentionné en intro.
- Le fichier `CLAUDE.md` doit être auto-suffisant (AC2) : un agent IA qui le lit avant de coder n'a besoin d'aucun autre document pour respecter les règles obligatoires de l'architecture.
- [Source: architecture.md#Règles Obligatoires — Tous Agents IA DOIVENT (L394-404)]

### Source tree components to touch

Un seul fichier à créer : `carom-scoreboard/CLAUDE.md`. Aucun autre fichier du scaffold Story 1.1 ne doit être modifié.

### Testing standards summary

Aucun test à écrire — story purement documentaire, aucune logique exécutable produite.

### Project Structure Notes

- Confirme et clôt la décision d'emplacement laissée ouverte par la Story 1.1 : `carom-scoreboard/CLAUDE.md` (pas de conflit avec l'arborescence architecture, qui l'avait déjà positionné ainsi dans le diagramme complet).
- Aucune divergence détectée avec la structure de projet actée.

### References

- [Source: epics.md#Story 1.2: Rédaction de CLAUDE.md (L308-323)]
- [Source: epics.md#Additional Requirements — AR2, AR8, AR12, AR15, AR16, AR17, AR18, AR19 (L121-146)]
- [Source: architecture.md#Patterns d'Implémentation & Règles de Consistance (L272-405)]
- [Source: architecture.md#Structure du Projet & Frontières Architecturales — Arborescence Complète (L406-479)]
- [Source: _bmad-output/implementation-artifacts/1-1-initialisation-du-projet.md#Dev Notes — Hors périmètre (L74-81) — décision d'emplacement CLAUDE.md explicitement différée à cette story]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

Aucun — story documentaire, aucune exécution de code requise.

### Completion Notes List

- Créé `carom-scoreboard/CLAUDE.md` documentant les 6 règles obligatoires listées à l'AC1 (AR15, AR8, AR12, AR17, AR18, AR16, AR19), avec leur formulation exacte reprise d'`architecture.md` (nommage, Pointer Events, erreurs storage en couche service, mutations/réactivité Pinia, async/await exclusif, tests co-localisés, breakpoints Tailwind mobile-first).
- Emplacement conforme à la décision actée : racine du sous-dossier applicatif `carom-scoreboard/`, pas la racine du dépôt Git.
- Ajout d'un minimum de framing en tête de fichier (stack technique, commandes `npm run dev`/`npm run build`/`npm test`) sans effort disproportionné par rapport aux 6 règles obligatoires, conformément aux Dev Notes.
- Relecture du document du point de vue d'un agent IA sans accès à `architecture.md`/`epics.md` (Subtask 2.1) : les 6 règles sont présentes, non ambiguës, avec exemples de code ✅/❌ pour chacune. Aucune règle hors périmètre (AR9, AR10, AR13, AR14) n'a été ajoutée.
- Vérification de non-contradiction avec `architecture.md` (Subtask 2.2) : les formulations sont reprises fidèlement des sections sourcées (L278-404), aucune divergence constatée.
- Aucun test écrit — story purement documentaire, aucune logique exécutable produite (cf. Dev Notes). Aucun fichier du scaffold Story 1.1 modifié.

### File List

- `carom-scoreboard/CLAUDE.md` (créé)

## Change Log

- 2026-09-08 : Création de `carom-scoreboard/CLAUDE.md` documentant les règles obligatoires AR8, AR12, AR15, AR16, AR17, AR18, AR19 (Story 1.2). Statut → review.
