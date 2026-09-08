---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-05-20'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - 'explore/resources/README.md'
workflowType: 'architecture'
project_name: 'explore'
user_name: 'Nathan'
date: '2026-05-20'
---

# Architecture Decision Document

_Ce document se construit de manière collaborative au fil des étapes. Les sections sont ajoutées progressivement à mesure que nous prenons les décisions architecturales ensemble._

## Analyse du Contexte Projet

### Vue d'ensemble des Exigences

**Exigences Fonctionnelles :**
46 exigences réparties en 8 catégories sur 4 jalons (V1a, V1b, V2/V3, V4).
Cœur V1a : gestion de partie, saisie/correction, modes JDS, stats/historique, administration.
V1b ajoute uniquement le mode 3 Bandes avec timer. V2+ introduit cloud, real-time, multi-tenant.

**Exigences Non-Fonctionnelles :**
- Performance : retour tactile < 100 ms, chargement < 2s, 8h continu sans freeze
- Fiabilité : sauvegarde après chaque action, 100% offline V1
- Accessibilité : zones ≥ 90×90 px, lisibilité à 2 m, WCAG AA
- Sécurité : aucune donnée externe en V1, TLS 1.3 + RGPD + hébergement EU en V2+

**Échelle & Complexité :**
- Domaine primaire : PWA tablette → SaaS B2B
- Complexité : Faible-Moyenne en V1 (offline pur), Moyenne-Haute en V2+ (real-time multi-tenant)
- Prototype existant : Vue.js 3 + Vite + Service Worker dans `explore/`

### Contraintes & Dépendances Techniques

- Stack à décider (PRD laisse ouvert) — critères : perf tactile, PWA mature, offline robuste
- Cibles : Android 10+ et iPadOS 15+ uniquement
- V1 sans backend (contrainte sécurité + simplicité)
- Timer 3 Bandes isolé en V1b — ne bloque pas V1a
- Hébergement EU obligatoire dès V2+

### Préoccupations Transversales Identifiées

1. **State management offline** — persistence granulaire après chaque action
2. **Performance tactile** — interactions haute fréquence sur hardware limité
3. **Architecture multi-vues** — découplage saisie/rendu à anticiper dès V1
4. **Progressive enhancement** — chaque jalon livrable sans dette technique
5. **Accessibilité senior** — test "60 ans / 30 secondes" critère transversal

## Évaluation du Starter Template

### Domaine Technologique Primaire

PWA multi-plateforme — signage Android 22" + iPad (test primaire) > desktop > tablette > smartphone. Layout 3 colonnes paysage.
Référence visuelle : `explore/scoreboard_test/`

### Starters Évalués

Vue 3, React, SvelteKit, Solid.js — Vue 3 sélectionné : bundle 34KB (< React 45KB), performance tactile excellente, PWA officielle, TypeScript natif avec `<script setup>`, prototype existant en Vue 3.

### Starter Sélectionné : `@vite-pwa/create-pwa` (template vue-ts)

```bash
npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts
```

**Dépendances complémentaires :**

```bash
npm install -D tailwindcss @tailwindcss/vite   # Styling responsive multi-écran
npm install pinia vue-router@4                  # State + routing
npm install dexie                               # IndexedDB wrapper (historique 30j)
npm install -D vitest @vue/test-utils happy-dom # Tests
```

### Décisions Architecturales du Starter

**Langage & Runtime :** TypeScript strict — contexte maximal pour les modèles IA

**Framework :** Vue 3 + Composition API (`<script setup>`) uniquement — pas d'Options API

**Build :** Vite 7 + vite-plugin-pwa (Service Worker, manifest, offline complet)

**Styling :** Tailwind CSS v4 — responsive 3 breakpoints (signage/desktop ≥1280px, tablette 768-1279px, smartphone <768px)

**State Management :** Pinia — un store par domaine, structure plate

**Storage :**
- `localStorage` : état de la partie en cours (synchrone, petit volume)
- `Dexie.js` (IndexedDB) : historique des parties 30 jours (async, quota safe iOS Safari)

**Tests :** Vitest + Vue Test Utils + happy-dom

### Structure de Fichiers AI-Vibe-Codable

```
src/
├── types/           ← interfaces TypeScript (référence pour les modèles IA)
│   ├── game.ts
│   └── player.ts
├── stores/          ← Pinia, un store par domaine
│   ├── useGameStore.ts
│   └── useHistoryStore.ts
├── services/        ← logique métier / storage
│   ├── storageService.ts   ← localStorage (état partie en cours)
│   └── databaseService.ts  ← Dexie.js (historique)
├── composables/     ← logique réutilisable
│   └── usePointerEvents.ts
├── components/      ← Vue SFCs flat (pas de sous-dossiers en V1)
│   ├── PlayerPanel.vue
│   ├── CenterPanel.vue
│   └── NumericPad.vue
└── App.vue
```

### Principes Architecture AI-Vibe-Codable

- Structure plate et prévisible — l'IA sait exactement où mettre chaque chose
- Composition API uniquement — imports explicites, meilleure génération IA
- TypeScript strict = semantic density maximale pour Claude/Gemini
- Zéro abstraction complexe — fonctions simples, types explicites, stores directs
- **`CLAUDE.md` à la racine = premier livrable avant tout code**

### Décisions Touch & Performance

- **Pointer Events API** (standard 2026) — élimine le délai 300ms sur iPad et Android signage
- `touch-action: manipulation` sur tous les éléments interactifs
- `user-select: none` + `-webkit-tap-highlight-color: transparent` globalement

### Compatibilité Multi-Plateforme

- **iPadOS** : PWA standalone ✅ (la restriction EU s'applique à iPhone uniquement)
- **Android signage 22"** : Chrome Android, PWA installable, touch natif ✅
- **Desktop** : souris + clavier, Pointer Events unifient les deux ✅
- **iOS 26** : standalone PWA universel par défaut (à venir)

### Note d'Initialisation

La création du projet et la rédaction du `CLAUDE.md` sont les **deux premières stories d'implémentation**, avant tout code fonctionnel.

## Décisions Architecturales Fondamentales

### Analyse des Priorités

**Décisions Critiques (bloquent l'implémentation) :**
- Modèles de données `GameState`, `Player`, `Reprise`, `GameRecord` (types TypeScript)
- Routing V1 : 3 routes (`/`, `/history`, `/history/:id`)
- Hébergement : Netlify (usage commercial autorisé sur free tier)

**Décisions Importantes (façonnent l'architecture) :**
- Séparation `localStorage` (état courant) / `Dexie.js` IndexedDB (historique)
- Structure des stores Pinia : `useGameStore`, `useHistoryStore`
- CI/CD : Netlify auto-deploy depuis GitHub (zéro configuration)

**Décisions Différées (post-MVP) :**
- Authentification : ID court joueur + app compagnon (V2+)
- API backend : REST ou tRPC (V2+)
- Monitoring : Sentry + Plausible RGPD-friendly (V2+)
- Validation runtime : Zod ou équivalent (V2+)

### Architecture des Données

**État de partie — `localStorage` (synchrone, < 50 KB)**

```typescript
// src/types/game.ts
type GameMode = 'libre' | 'cadre' | 'bande' | '3bandes'
type GameStatus = 'idle' | 'playing' | 'finished'

interface Player { id: 'player1' | 'player2'; name: string; score: number }
interface Reprise { player1: number | null; player2: number | null; timestamp: number }

interface GameState {
  mode: GameMode
  status: GameStatus
  player1: Player
  player2: Player
  reprises: Reprise[]
  currentInput: { player1: string; player2: string }
  isNegative: { player1: boolean; player2: boolean }
  startedAt: number | null
  lastSaved: string
}
```

**Historique — IndexedDB via Dexie.js (async, quota safe iOS Safari)**

```typescript
// src/types/history.ts
interface GameRecord {
  id?: number  // auto-increment Dexie
  mode: GameMode
  player1Name: string
  player2Name: string
  player1Score: number
  player2Score: number
  reprises: Reprise[]
  startedAt: number
  finishedAt: number
  stats: {
    player1: { avg: number; best: number; totalReprises: number }
    player2: { avg: number; best: number; totalReprises: number }
  }
}
```

Validation : TypeScript compile-time uniquement en V1 (pas de Zod — YAGNI).

### Authentification & Sécurité

V1 : aucune authentification. Toutes les données restent locales sur l'appareil (NFR13).
V2+ (différé) : ID court joueur + auth dans app compagnon mobile (modèle coréen — défini PRD).

### Architecture Frontend

**Routing V1 (Vue Router 4) :**

| Route | Composant | Usage |
|---|---|---|
| `/` | `GameView.vue` | Scoreboard principal |
| `/history` | `HistoryView.vue` | Liste des parties |
| `/history/:id` | `GameDetailView.vue` | Détail d'une partie |

Réglages en V1 : modales inline sur `GameView`, pas de route dédiée.

**Stores Pinia :**
- `useGameStore` : état courant de partie + persistance `localStorage`
- `useHistoryStore` : historique des parties + `Dexie.js`

**Composants principaux V1a :**
- `PlayerPanel.vue` (×2) — zone joueur avec pavé numérique
- `CenterPanel.vue` — reprises, stats, contrôles
- `NumericPad.vue` — saisie tactile
- `ModeSelector.vue` — modal sélection mode de jeu
- `GameSummary.vue` — récapitulatif fin de partie

### Infrastructure & Déploiement

**Hébergement V1 : Netlify**
- Usage commercial autorisé sur free tier (critique : V2+ = SaaS payant clubs)
- Auto-deploy GitHub → push sur `main` = déploiement automatique
- HTTPS + CDN mondial inclus, zéro configuration manuelle
- 300 build minutes/mois — suffisant pour dev solo

**CI/CD :** Netlify built-in — pas de GitHub Actions nécessaire pour V1.

**Monitoring V1 :** `try/catch` sur opérations storage + `console.error`.
**Monitoring V2+ (différé) :** Sentry (erreurs) + Plausible (analytics RGPD-friendly, sans cookie).

### Analyse d'Impact

**Séquence d'implémentation issue de ces décisions :**
1. Init projet + `CLAUDE.md`
2. Types TypeScript (`game.ts`, `history.ts`)
3. Services storage (`storageService.ts`, `databaseService.ts`)
4. Stores Pinia (`useGameStore`, `useHistoryStore`)
5. Composants UI (PlayerPanel, CenterPanel, NumericPad)
6. Routing + vues (GameView, HistoryView, GameDetailView)

**Dépendances croisées :**
- Les types → utilisés par stores ET services → utilisés par composants
- `useGameStore` dépend de `storageService.ts` (localStorage)
- `useHistoryStore` dépend de `databaseService.ts` (Dexie.js)
- `GameView` orchestre `PlayerPanel` + `CenterPanel` via `useGameStore`

## Patterns d'Implémentation & Règles de Consistance

### Points de Conflit Identifiés

6 catégories où différentes sessions IA pourraient faire des choix incompatibles : nommage, structure, format, communication Vue, touch/pointer, état & erreurs.

### Patterns de Nommage

**Fichiers & Répertoires :**

| Type | Convention | Exemple |
|---|---|---|
| Composants Vue | PascalCase | `PlayerPanel.vue` |
| Stores Pinia | camelCase + préfixe `use` | `useGameStore.ts` |
| Composables | camelCase + préfixe `use` | `usePointerEvents.ts` |
| Services | camelCase + suffixe `Service` | `storageService.ts` |
| Types | camelCase | `game.ts` |
| Tests | même nom + `.test.ts` | `PlayerPanel.test.ts` |
| Vues (pages) | PascalCase + suffixe `View` | `GameView.vue` |

**TypeScript :** PascalCase sans préfixe `I` (`GameState`, pas `IGameState`). `type` pour unions/aliases, `interface` pour objets structurés.

**Pinia — Actions :** Verbe + Nom : `setPlayerName`, `addReprise`, `undoLastSeries`. Jamais : `playerNameUpdate`, `repriseAdd`.

**Vue — Emits :** kebab-case dans `defineEmits` → `update:score`, `game-finished`.

**Exports :** named exports partout, jamais de default export pour composables/services.

### Patterns de Structure

**Tests co-localisés :**
```
src/components/
├── PlayerPanel.vue
├── PlayerPanel.test.ts   ← co-localisé, pas de dossier __tests__/
```

**Props :** `defineProps` avec types TypeScript explicites, aucune prop sans type.

### Patterns de Format

- **Timestamps :** `number` Unix (`Date.now()`) en stockage, `Intl.DateTimeFormat` à l'affichage
- **Null vs Undefined :** `null` = valeur absente intentionnelle, `undefined` = propriété optionnelle
- **JSON / état :** camelCase exclusivement (`player1Score`, pas `player_1_score`)

### Patterns de Communication Vue

**Réactivité store → composant :** `storeToRefs()` obligatoire
```typescript
// ✅ Réactivité préservée
const { player1, player2, reprises } = storeToRefs(gameStore)
// ❌ Réactivité perdue
const player1 = gameStore.player1
```

**Mise à jour du store :** uniquement via actions Pinia, jamais mutation directe depuis un composant.
```typescript
// ✅ Via action
gameStore.addReprise(value)
// ❌ Mutation directe interdite depuis un composant
gameStore.reprises.push(...)
```

### Patterns Touch & Pointer

**Règle universelle :** `@pointerdown` partout, jamais `@touchstart` ni `@click` seul sur éléments critiques.

```vue
<!-- ✅ Standard pour tous les boutons/zones tactiles -->
<button @pointerdown="handlePress" class="touch-action-manipulation select-none">
```

**CSS global obligatoire (index.css) :**
```css
* { -webkit-tap-highlight-color: transparent; }
button, [role="button"] { touch-action: manipulation; user-select: none; }
```

**Interactions complexes :** utiliser `usePointerEvents.ts`, ne pas réimplémenter la logique pointer inline.

### Patterns Gestion d'État & Erreurs

**Loading & erreurs dans le store, pas dans les composants :**
```typescript
const isLoading = ref(false)
const error = ref<string | null>(null)
```

**Gestion d'erreurs storage dans la couche service :**
```typescript
// storageService.ts — le composant ne gère pas l'erreur storage
export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[storage] saveGameState failed:', e)
  }
}
```

**Pattern async Pinia :** `async/await` uniquement, jamais `.then().catch()`
```typescript
async function loadHistory(): Promise<void> {
  isLoading.value = true; error.value = null
  try {
    games.value = await db.games.orderBy('startedAt').reverse().limit(50).toArray()
  } catch (e) {
    error.value = 'Impossible de charger l\'historique'
    console.error('[history] loadHistory failed:', e)
  } finally { isLoading.value = false }
}
```

### Patterns Tailwind CSS

**Mobile-first obligatoire :**
- Default (< 768px) : smartphone / portrait
- `md:` (≥ 768px) : tablette paysage
- `lg:` (≥ 1280px) : signage 22" / desktop

**Ordre des classes :** Layout → Sizing → Spacing → Typography → Colors → Effects → Responsive modifiers

### Règles Obligatoires — Tous Agents IA DOIVENT

1. Utiliser Composition API + `<script setup>` uniquement — pas d'Options API
2. Nommer les fichiers selon la table de nommage ci-dessus sans exception
3. Utiliser `@pointerdown` (pas `@click` seul) sur tous les éléments interactifs tactiles
4. Écrire les tests co-localisés avec le fichier source
5. Passer par les actions Pinia pour toute mutation de store
6. Utiliser `storeToRefs()` pour les propriétés réactives du store
7. Gérer les erreurs storage dans la couche service, pas dans les composants
8. Utiliser `async/await` exclusivement (pas `.then().catch()`)
9. Respecter le mobile-first Tailwind avec les 3 breakpoints définis

## Structure du Projet & Frontières Architecturales

### Repository Layout

Le dépôt Git racine (déjà existant, contient `_bmad/`, `_bmad-output/`, `docs/`, `explore/`, `.claude/`) héberge tout — artefacts BMad inclus — pour rester synchronisé entre les deux postes de travail de Nathan. Le code applicatif ne vit pas à la racine du dépôt : il est isolé dans un sous-dossier dédié `carom-scoreboard/`, dont l'arborescence complète est détaillée ci-dessous. Toute commande `npm`/`vite`/`vitest` s'exécute avec ce sous-dossier comme working directory.

### Arborescence Complète

```
carom-scoreboard/               ← sous-dossier applicatif, PAS la racine du dépôt Git
│
├── CLAUDE.md                    ← 🔑 Guide IA (premier fichier créé)
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts               ← Vite + vite-plugin-pwa + Tailwind plugin
├── vitest.config.ts
├── .gitignore
├── .nvmrc                       ← Node version fixée
├── netlify.toml                 ← Config déploiement Netlify
│
├── public/
│   ├── manifest.json            ← PWA manifest (icônes, nom, display standalone)
│   ├── favicon.ico
│   ├── favicon-192.png
│   └── favicon-512.png
│
└── src/
    ├── main.ts                  ← Entry point : Vue + Pinia + Router
    ├── App.vue                  ← Root : <router-view> uniquement
    │
    ├── router/
    │   └── index.ts             ← Routes : /, /history, /history/:id
    │
    ├── types/                   ← Interfaces TypeScript (référence IA)
    │   ├── game.ts              ← GameState, Player, Reprise, GameMode, GameStatus
    │   └── history.ts           ← GameRecord
    │
    ├── services/                ← Couche isolation storage
    │   ├── storageService.ts    ← localStorage (état partie courante)
    │   └── databaseService.ts   ← Dexie.js / IndexedDB (historique)
    │
    ├── stores/                  ← Pinia stores
    │   ├── useGameStore.ts      ← État partie + persistance localStorage
    │   └── useHistoryStore.ts   ← Historique + Dexie.js
    │
    ├── composables/             ← Logique réutilisable
    │   └── usePointerEvents.ts  ← Pointer Events (long press, tap)
    │
    ├── views/                   ← Pages (une par route)
    │   ├── GameView.vue         ← Route / — scoreboard principal
    │   ├── HistoryView.vue      ← Route /history
    │   └── GameDetailView.vue   ← Route /history/:id
    │
    ├── components/              ← Composants (flat, co-testés)
    │   ├── PlayerPanel.vue      ← Zone joueur : score + pavé numérique
    │   ├── PlayerPanel.test.ts
    │   ├── CenterPanel.vue      ← Zone centre : reprises, stats, contrôles
    │   ├── CenterPanel.test.ts
    │   ├── NumericPad.vue       ← Pavé numérique tactile
    │   ├── NumericPad.test.ts
    │   ├── ModeSelector.vue     ← Modal sélection mode de jeu
    │   ├── ModeSelector.test.ts
    │   ├── GameSummary.vue      ← Récapitulatif fin de partie
    │   ├── GameSummary.test.ts
    │   ├── HistoryList.vue      ← Liste des parties passées
    │   └── HistoryList.test.ts
    │
    └── assets/
        ├── main.css             ← Tailwind + CSS global + touch resets
        └── icons/               ← SVG icônes (modes de jeu, boutons)
```

### Frontières & Flux de Données

```
Utilisateur (touch/pointer)
        ↓ @pointerdown
  [Composant]              PlayerPanel, NumericPad, CenterPanel
        ↓  action()
  [Store Pinia]            useGameStore, useHistoryStore
        ↓  save()
  [Service]                storageService → localStorage
                           databaseService → IndexedDB (Dexie.js)
```

**Règles de communication :**
- Parent → Enfant : `props` typés
- Enfant → Parent : `emit` kebab-case
- Vue ↔ Store : `storeToRefs()` + actions Pinia
- Pas de `provide/inject` en V1

### Mapping Exigences → Fichiers

| Catégorie FR | Fichiers |
|---|---|
| FR1-FR6 — Gestion de partie | `useGameStore.ts`, `GameView.vue`, `PlayerPanel.vue` |
| FR7-FR11 — Saisie & Correction | `NumericPad.vue`, `useGameStore.ts` |
| FR12-FR16 — Modes de jeu | `ModeSelector.vue`, `types/game.ts` |
| FR17-FR20 — Stats & Historique | `GameSummary.vue`, `useHistoryStore.ts`, `databaseService.ts`, `HistoryView.vue`, `GameDetailView.vue` |
| FR39-FR43 — Admin & Config | `ModeSelector.vue`, `PlayerPanel.vue` (noms éditables inline), `CenterPanel.vue` (FR43 — alerte d'inactivité) |
| NFR1-NFR4 — Performance tactile | `usePointerEvents.ts`, `assets/main.css` |
| NFR5-NFR8 — Fiabilité offline | `storageService.ts`, `databaseService.ts` |

### Points d'Intégration

**Internes :**
- `App.vue` → `router/index.ts` → vues → composants → stores → services
- `useGameStore` → `storageService` (sync après chaque action)
- `useHistoryStore` → `databaseService` (async, IndexedDB)

**Externes V1 :**
- Netlify CDN (distribution statique)
- Service Worker (cache offline — généré par vite-plugin-pwa)

**Externes V2+ (différés) :**
- API cloud (sync offline→cloud)
- Sentry (monitoring erreurs)
- Plausible (analytics)

## Résultats de Validation

### Cohérence ✅

Toutes les décisions sont compatibles. Aucune contradiction détectée. Écosystème unifié Vue 3 + Vite 7. Pointer Events supporté sur toutes les cibles (iPad Safari 13+, Chrome Android). Dexie.js compatible iOS Safari.

### Couverture des Exigences ✅

| Catégorie | Couverture | Fichiers |
|---|---|---|
| FR1-FR6 Gestion partie | ✅ | `useGameStore`, `GameView`, `PlayerPanel` |
| FR7-FR11 Saisie/Correction | ✅ | `NumericPad`, `useGameStore` |
| FR12-FR16 Modes de jeu | ✅ | `ModeSelector`, `types/game.ts` |
| FR17-FR20 Stats/Historique | ✅ | `GameSummary`, `useHistoryStore`, vues history |
| FR39-FR43 Admin/Config | ✅ | `PlayerPanel`, `ModeSelector`, `CenterPanel` |
| FR45-FR46 Offline + PWA | ✅ | vite-plugin-pwa + `manifest.json` |
| NFR1 < 100ms tactile | ✅ | Pointer Events + touch-action |
| NFR2 < 2s chargement | ✅ | Vite build + cache Service Worker |
| NFR5 Sauvegarde chaque action | ✅ | `storageService` dans watchers store |
| NFR13 Aucune donnée externe V1 | ✅ | Pas d'API externe |

### Gaps Identifiés & Corrections

**Ajouts à l'arborescence :**
```
src/composables/
├── usePointerEvents.ts
├── useSpeech.ts          ← Web Speech API (FR42 — annonce vocale)
└── useTimer.ts           ← Timer 3 Bandes (V1b — hors scope V1a)
```

**Note workbox (vite.config.ts) :** stratégie `cache-first` pour assets JS/CSS, `StaleWhileRevalidate` pour HTML → à configurer lors de l'init projet.

**Note performance (CLAUDE.md) :** utiliser `shallowRef` pour `reprises: Reprise[]` dans `useGameStore` — évite la réactivité profonde sur grande liste (NFR3 — 8h continu).

### Checklist de Complétude

**✅ Contexte & Analyse**
- [x] PRD analysé (46 FR, 4 jalons)
- [x] Complexité évaluée, contraintes identifiées
- [x] Préoccupations transversales cartographiées

**✅ Décisions Architecturales**
- [x] Stack complète avec versions vérifiées
- [x] Starter template + commande exacte
- [x] Patterns touch/pointer, storage dual, hébergement, routing

**✅ Patterns d'Implémentation**
- [x] Nommage exhaustif, communication Vue, async, erreurs, Tailwind
- [x] 9 règles obligatoires pour agents IA

**✅ Structure du Projet**
- [x] Arborescence complète, frontières, flux de données, mapping FR → fichiers

### Statut Final

**PRÊT POUR L'IMPLÉMENTATION — Confiance : Élevée**

**Points forts :** Stack battle-tested connue des modèles IA, patterns explicites sans ambiguïté, progressive enhancement clair V1a→V1b→V2+, compatibilité multi-plateforme validée (iPad EU ✅, Android signage ✅).

**Prochaine étape :** Créer `CLAUDE.md` + initialiser le projet avec `npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts`.
