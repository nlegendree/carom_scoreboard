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
npm create @vite-pwa/pwa@latest 1score -- --template vue-ts
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
- `Dexie.js` (IndexedDB) : historique des parties 30 jours (async, quota safe iOS Safari) *(requalifié le 2026-09-11 : **file locale de synchronisation** des parties vers le profil joueur, `sprint-change-proposal-2026-09-11.md`)*

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
- *Note (Story 1.13, 2026-09-10)* : **mise à jour de la PWA différée à l'accueil** — `registerType: 'prompt'` + `src/composables/usePwaUpdate.ts` (vérification toutes les 60 min si en ligne via `registration.update()`, application par `updateServiceWorker(true)` **uniquement** quand `status === 'idle'`, jamais pendant `playing`/`finished`, sans pop-up ni toast). Le rechargement est fait **par le composable** sur `controllerchange` : le module `virtual:pwa-register` ne recharge que si `isUpdate` est vrai, et `workbox-window` classe comme externe (`isUpdate: false`) toute mise à jour trouvée plus de 60 s après l'enregistrement — le cas de la vérification horaire. `PWABadge.vue` du starter est **supprimé**.

### Compatibilité Multi-Plateforme

- **iPadOS** : PWA standalone ✅ (la restriction EU s'applique à iPhone uniquement)
- **Android signage 22"** : Chrome Android, PWA installable, touch natif ✅
- **Desktop** : souris + clavier, Pointer Events unifient les deux ✅
- **iOS 26** : standalone PWA universel par défaut (à venir)
- *Note (Story 1.13, 2026-09-10)* : manifest `Carom Scoreboard` / `Carom`, `lang: 'fr'`, `id: '/'`, `display: 'standalone'`, **sans `orientation`** (les deux formats tablette sont supportés) ; `index.html` en `lang="fr"` avec `apple-mobile-web-app-capable` / `apple-mobile-web-app-status-bar-style="black"`. Installabilité sur iPad et Android à vérifier sur appareil réel après déploiement Netlify. *Renommé `1Score` / `1Score` le 2026-09-11 (Story 10.6, AR27).* *`orientation: 'landscape'` ajouté le 2026-09-11 (passe de rendu de la Story 10.1, décision de Nathan) : l'app ne tourne qu'en paysage — iPad mini, iPad 11″, puis écran 21,5″ — et le portrait sort du périmètre.*

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

**Décisions Différées (post-MVP) :** *(2026-09-11 : les deux premières deviennent **dues** pour le jalon V2a — à produire par une passe Architecte avant la Story 4.0, voir « Backend, Authentification & Synchronisation » ci-dessous)*
- Authentification : ID court joueur + app compagnon (V2+) → **V2a, création à la tablette ou page web minimale, identification par code ou recherche de nom**
- API backend : REST ou tRPC (V2+) → **V2a, plateforme à décider (critères PRD : coût maîtrisé, hébergement EU, déploiement simple)**
- Monitoring : Sentry + Plausible RGPD-friendly (V2+)
- Validation runtime : Zod ou équivalent (V2+)

### Architecture des Données

**État de partie — `localStorage` (synchrone, < 50 KB)**

```typescript
// src/types/game.ts
type GameCategoryId = 'series' | '3bandes' | 'quilles' | 'casin'

type GameMode =
  | 'libre' | 'cadre-47-2' | 'cadre-47-1' | 'cadre-71-2' | 'bande' | '4billes'
  | '3bandes'
  | 'quilles-5' | 'quilles-9'
  | 'casin'

type GameStatus = 'idle' | 'playing' | 'finished'

// La bille est attachée au côté : gauche blanche, droite jaune (UX-DR2).
type PlayerColor = 'white' | 'yellow'

// `targetScore` est porté par le JOUEUR et non par la partie : deux joueurs peuvent jouer
// des distances différentes (handicap, convention coréenne observée en 3 Bandes).
// 0 = distance libre, aucun objectif — c'est la valeur par défaut, aucun mode n'en impose
// d'autre (décision produit du 2026-09-08, Story 1.4).
interface Player {
  id: 'player1' | 'player2'
  name: string
  score: number
  color: PlayerColor
  targetScore: number
}
interface Reprise { player1: number | null; player2: number | null; timestamp: number }

interface GameState {
  mode: GameMode
  status: GameStatus
  player1: Player
  player2: Player
  activePlayer: 'player1' | 'player2'
  reprises: Reprise[]
  currentInput: { player1: string; player2: string }
  // Persistance (Story 1.12, 2026-09-10) — forme EXACTE de ce qui est écrit en localStorage
  scoreAdjustments: { player1: number; player2: number }  // corrections −/+ (1.7), à part des reprises
  whiteSide: 'left' | 'right'      // côté d'affichage de la bille blanche (10.3) — remplace `sidesSwapped` (1.7)
  history: GameSnapshot[]          // pile d'annulation COMPLÈTE, persistée intégralement
  startedAt: number | null
  lastSaved: string
  // Fin de partie (Story 1.10, 2026-09-10)
  winner: PlayerId | null          // null tant que la partie n'est pas finie, ou égalité
  finishedAt: number | null
  equalizingReprise: boolean       // reprise égalisatrice en cours (côté droit)
  endPrompt: EndPrompt | null      // pop-up de décision ouverte, restaurée telle quelle (1.12)
  entryOpen: boolean               // pop-up de saisie ouverte, rouverte avec son buffer (1.12)
}
```

*Note (2026-09-10, Story 1.12)* : `isNegative` (Story 1.9, annulée) est **retiré** de `GameState`, `GameSnapshot`, `mirrorSnapshot` et du store.

*Note (2026-09-10, Story 1.10)* : `PlayerId = 'player1' | 'player2'` est un type nommé de `game.ts`. La détection de fin vit dans le **store** (`checkEndOfGame` en fin des actions de série), qui expose une pop-up de décision `endPrompt: EndPrompt | null` (`equalizing-offer` ou `over` avec `winner`) ; `GameView` ne fait que l'afficher et appeler `finishGame()`, seule action de clôture, qui déduit le vainqueur du contexte (pop-up ou prorata). *(Note 2026-09-10, Story 1.15 : `restartGame()` = `startGame(...)` avec le mode, les noms et les distances courants, gardée sur `playing` — même recette que `rematch()`, gardée sur `finished`. Une partie recommencée ne passe **jamais** par `finished` : ni récap, ni vainqueur, ni ligne d'historique.)* `equalizingReprise` fait partie de `GameSnapshot` (annuler la série gagnante défait l'offre acceptée) ; `endPrompt`, `winner` et `finishedAt` n'y sont pas — le récap est terminal, `undoLastAction` reste un no-op hors `playing`. `endPrompt` fait en revanche partie de `GameState` et est **restauré en 1.12**.

**Persistance (Story 1.12, 2026-09-10)** — filet de sécurité pour une tablette qui tourne 24 h/24 : la fermeture accidentelle est rare, le cas réel est le **rechargement** (mise à jour de la PWA par le Service Worker, `⌘R`, onglet tué par l'OS).
- `storageService.ts` est le **seul** point de contact avec `localStorage` (AR12, vérifié par test `?raw` sur `GameView`, `HomeScreen`, `useGameStore`). Clé `1score:game`, enveloppe versionnée `{ version: 1, savedAt, state: GameState }` ; une autre version ou une forme inattendue est **jetée** (`console.warn` + suppression), pas migrée. Un stockage qui lève est absorbé (`console.error`), la partie continue en mémoire sans message au joueur.
- Le store construit `persistedState = computed<GameState>` (complet par typage) et un `watch` (flush `pre`, ni `immediate` ni `sync`) écrit **une fois par action, dans le même tick** ; un état `idle` n'est jamais écrit — `resetGame()` **supprime** l'entrée. Aucun `beforeunload`/`pagehide`. Pas de debounce (le prototype `explore/` en avait un de 500 ms).
- La **pile d'annulation est persistée intégralement** (décision de Nathan) : après une reprise, `ANNULER` remonte les actions d'avant la fermeture, parité des côtés respectée. Coût : ≈ 52 octets par reprise et par snapshot en JSON (≈ 350 Ko pour 100 actions sur 60 reprises), au-dessus du repère « < 50 Ko » d'AR4 mais loin du quota ; à revoir avec le `+1` par point du 3 Bandes (Epic 2), un bornage à l'écriture est une ligne.
- `entryOpen` monte de la vue dans le store : une fermeture pendant la saisie rouvre la pop-up de saisie avec ses chiffres (le compte à rebours de 3 s repart).
- Reprise en trois actions : `checkSavedGame()` (appelée par `main.ts` avant le montage, remplit `pendingRestore`), `resumeGame()` (joueurs restampés `id`/`color`, pile remplacée, `status` posé en dernier), `discardSavedGame()`. `GameView` affiche, en `idle`, une `PromptModal` « PARTIE EN COURS » (`REPRENDRE LA PARTIE` / `ANNULER`) par-dessus l'accueil. Aucune limite d'âge de la sauvegarde.

Le catalogue des modes (`GAME_CATEGORIES`) vit dans ce même fichier : il décrit les catégories, leurs modes et leur disponibilité, et sert de source unique à l'écran d'accueil. Il ne porte **pas** les règles de score propres à chaque mode, qui arrivent avec la story de chaque mode. Il ne porte **aucune distance de jeu** non plus : la distance est saisie par l'utilisateur dans `PlayerSetupModal` et vit sur `Player.targetScore` (décision produit du 2026-09-08 — aucune distance de référence par mode, aucune donnée fédérale codée en dur).

**Historique — IndexedDB via Dexie.js (async, quota safe iOS Safari)** *(requalifié le 2026-09-11 : **file locale de synchronisation** — l'esquisse ci-dessous recevra un identifiant joueur par côté (`null` = invité), un type de fin et un statut de sync ; la forme détaillée proposée par l'ancienne Story 3.1 — par côté, distance, vainqueur, corrections, stats dénormalisées — reste la base)*

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

V1 (jeu) : aucune authentification ; scorer une partie ne transmet rien (NFR13 réécrit le 2026-09-11).
V2a *(avancé le 2026-09-11, décision de Nathan)* : ID court joueur sans mot de passe à la tablette, identification par code **ou recherche du nom** ; compte créé à la tablette ou par une page web minimale (app compagnon → V4) ; invité conservé ; sans réseau, jeu en invité.

### Backend, Authentification & Synchronisation (V2a) — *à décider*

*Section ouverte le 2026-09-11 (`sprint-change-proposal-2026-09-11.md`), à remplir par une passe Architecte avant la Story 4.0.* Doit fixer : la plateforme et son hébergement en Europe (NFR15), le chiffrement (NFR14), le modèle d'authentification (FR32, FR33), le modèle de données joueur/partie (`GameRecord` avec identifiant joueur par côté, `null` = invité, statut de synchronisation), la stratégie de synchronisation (file locale Dexie → API, reprise après coupure, NFR7), la couche réseau de la PWA (`services/`, erreurs absorbées en couche service — AR12), la configuration d'environnement (variables, secrets Netlify) et les obligations RGPD (consentement, suppression en < 3 actions — NFR16). Invariant non négociable : **le jeu reste 100 % offline** (NFR6).

### Navigation & Shell (Epic 10, V1.1) — *ajouté le 2026-09-11*

*Section ouverte par `sprint-change-proposal-2026-09-11-refonte-ui.md`, à détailler par une passe `bmad-create-ux-design` avant la Story 10.1.* Remplace `ActionBar` par une barre latérale sur les écrans hors-jeu, **contextuelle par écran** (contenu différent sur l'Accueil, la sélection JDS, le paramétrage joueurs et le récap — voir `epics.md` Epic 10). Sur l'écran de jeu, `ActionBar` est conservée mais ses CTA passent en picto + libellé court, et `ANNULER` la rejoint depuis `CenterPanel`.

Trois évolutions dépassent l'habillage visuel et touchent `useGameStore` :
1. **Interversion bille/côté dissociée** — l'action `swapPlayers()` actuelle (échange simultané) est scindée en deux actions indépendantes (bille seule, côté seul). À traiter avec le nettoyage déjà noté du champ `Player.id` redondant (toujours égal au nom du champ qui le contient), puisque le modèle joueur est de toute façon retouché.
2. **`ÉCHANGER` retiré du jeu en cours de partie** — l'interversion (sous ses deux nouvelles formes) n'est disponible qu'au paramétrage, avant `DÉMARRER`. Effet de bord : le backlog « `ÉCHANGER` pendant une reprise entamée casse la déduction de la série ouverte » devient sans objet.
3. **Passage de tour par CTA dédiée** — le tap sur la carte du joueur adverse comme geste de passage de tour est retiré ; une CTA centrale `PASSER LE TOUR` devient l'unique déclencheur, en JDS comme en 3 Bandes. L'état « tapable pour rendre la main » de `PlayerPanel` disparaît.

`PlayerPanel` reçoit en plus un champ **dérivé** RESTANT (`distance − score`, permanent, tous modes) — pas de nouvel état persisté, calculé comme `POUR n` (3 Bandes) l'est déjà. MOY/SÉRIE quittent le bandeau du haut pour se placer sous le score central.

**Risque technique à lever avant la Story 10.1 :** « Fermer l'application » (item de sidebar Accueil, fonctionnel) n'a pas d'équivalent standard fiable pour une PWA installée — `window.close()` ne fonctionne que sur une fenêtre ouverte par script. Spike de faisabilité requis (piste : confirmation puis tentative de fermeture, repli sur un retour à l'accueil du système). *Reporté hors Epic 10 (Nathan, 2026-09-11, passe epics) : l'item est affiché inerte, le spike viendra avec une story ultérieure.*

*Passe epics du 2026-09-11 :* le retrait d'`ÉCHANGER` du store (point 2) est livré par la **Story 10.3** avec la scission de `swapPlayers` (le modèle joueur change à ce moment-là), et non par la 10.4. Piste retenue pour la scission : conserver l'invariant « `player1` = bille blanche = celui qui ouvre » et ajouter à `GameState` un champ d'affichage persisté (ex. `whiteSide: 'left' | 'right'`) qui remplace `sidesSwapped` — aucune règle de jeu touchée, `GAME_STORAGE_VERSION` incrémenté.

***Confirmé à la livraison de la Story 10.3 (2026-09-12).*** La piste a été retenue telle quelle :

- `GameState.whiteSide: 'left' | 'right'` remplace `sidesSwapped`, avec `GAME_STORAGE_VERSION = 2` (une sauvegarde en version 1 est écartée au lancement, vérifié au navigateur : aucune pop-up « PARTIE EN COURS », entrée supprimée, accueil normal).
- `whiteSide` entre dans `GameState` mais **PAS** dans `GameSnapshot` : il ne change jamais en cours de partie, l'undo n'a rien à en faire. Effet en cascade voulu — `mirrorSnapshot`, le champ `sidesSwapped` du snapshot et la branche miroir d'`undoLastAction` sont devenus du **code mort et ont été supprimés** ; `undoLastAction` redevient une restauration directe.
- `Player.id` est supprimé (DT5) : la **bille** est la seule identité du joueur dans la partie, `makePlayer` prend une couleur. `resumeGame` restampe `color` seule, dans la pile aussi.
- `startGame` gagne un 5e paramètre optionnel (`whiteSide = 'left'`) ; `rematch()` et `restartGame()` le reconduisent, `resetGame()` le remet à `'left'`.
- **Aucune règle de calcul n'a bougé** : toutes les attentes de moyenne, meilleure série, `POUR n`, égalisatrice, undo et fin de partie de `useGameStore.test.ts` passent sans retouche — seuls les cas d'interversion ont été supprimés, le mécanisme n'existant plus.
- ⚠️ **Piège de vue, à retenir** : `player1` étant la bille blanche et non le joueur de gauche, `GameView` résout **une seule fois** `leftPlayer`/`rightPlayer` (et `leftId`/`rightId`) et en fait dériver **l'ordre des panneaux ET la colonne du CTA** de la barre basse. Les faire dériver séparément place le CTA sous la carte du joueur qui a la main — l'inverse exact de la règle (c'est l'**assis** qui compte pour celui qui joue). Même vigilance dans `GameSummary`, dont `SIDES` est devenu un `computed` ordonné par `whiteSide` (AR24 : le récap conserve les côtés du scoreboard).
- **Composant hors spec §10.4, consigné ici** : `PlayerSetupCard.vue` — carte de paramétrage purement présentationnelle, rendue deux fois par `HomeScreen`, sortie de la réécriture de l'étape joueurs comme `PictoIcon` était sorti de la 10.1.

*Livré en Story 10.1 (2026-09-11)* : `SideBar` (props `items`/`exitItem`, type `SideBarItem` dans `types/ui.ts`, contenu fourni par l'écran, sortie calée en bas), `ModeTile` (tuile de mode, état BIENTÔT `disabled` + garde), `PictoIcon` (jeu de pictos SVG inline, tracés Lucide ISC, étendu par les stories suivantes — ajouté hors liste de la spec §10.4 pour ne pas dupliquer les SVG entre `SideBar`, `ModeTile` et `IconAction`), tokens de l'epic en `@theme static` dans `main.css`, `--color-cloth` `#0573BB`, logo `public/logo.png`. Dégradé `--gradient-bg` appliqué écran par écran : l'accueil (étape `category`) seulement en 10.1, les étapes `mode`/`players` gardent `ActionBar`. « Fermer l'application » affiché inerte (BIENTÔT), sans spike. *Passe de rendu (Nathan) :*
- paysage uniquement ;
- angles vifs (`--radius-*` à 0) ;
- `SideBar` en aplat `--color-sidebar` collé au bord, en-tête rouge `--color-brand-red` coupé en biais par `clip-path` ;
- tuiles collées avec filets, fonds `--gradient-tile-*` (nuances de bleu) sur un calque dédié, qui passe à 45 % en BIENTÔT ;
- `--gradient-bg` gris/noir.

*Livré en Story 10.2 (2026-09-12)* : l'étape `mode` (sélection JDS) passe sous la **coquille de l'accueil** — `--gradient-bg`, `SideBar` collée au bord ne portant que `RETOUR` (aucun item de sortie), titre de la catégorie lu au catalogue, rangée de quatre `ModeTile` jointives à 34 % de la hauteur — et perd `ActionBar`, qui ne subsiste que sur l'étape `players` jusqu'à la 10.3. `PromptModal` gagne une **variante liste** (prop `actions: readonly PromptAction[]`, emit `select`, `primaryLabel` devenu optionnel, `PromptAction` dans `types/ui.ts`) : *n* commandes empilées à la place du CTA principal, la première en accent, le secondaire rendu **après** la liste — le pied est un markup linéaire, sans branche d'ordre, et les six appels existants rendent à l'identique. Elle sert le choix du cadre : la tuile `CADRE` est un **groupe de présentation**, pas un mode (`GameMode` inchangé), qui ouvre `47/2` · `47/1` · `71/2`. Picto `arrow-left` ajouté à `PictoIcon`, famille de tokens `--gradient-tile-jds-2|3|4` dérivée de `--gradient-tile-jds` (les quatre tuiles JDS descendent du plus clair au plus sombre, `LIBRE` héritant de la couleur de sa tuile parente à l'accueil — décision de Nathan, 2026-09-12). Aucun changement de store, de règle ni de persistance.

*Passe de rendu de la Story 10.2 (Nathan, 2026-09-12), valable pour **toutes** les pop-ups :* `PromptModal` passe aux **angles vifs** — rayons pris aux tokens `--radius-container` (carte) et `--radius-cta` (boutons), à la place des `rounded-3xl`/`rounded-2xl` hérités de l'Epic 1 — et à un gabarit resserré (`max-w-xl`, paddings et gouttières réduits d'un cran). En variante liste : les choix tiennent sur **une seule ligne** (`grid-flow-col` + `auto-cols-fr`, jamais un `grid-cols-n` construit à la volée), **tous du même accent** (aucun choix par défaut), `ANNULER` seul en neutre **sous** la ligne et sur toute sa largeur, titre **centré**. Les pop-ups à un ou deux CTA gardent leur titre à gauche et leur ordre secondaire → principal. Les CTA prennent `--gradient-cta` — **le bleu de la tuile JEUX DE SÉRIES / LIBRE**, dégradé **interne à chaque bouton** — et `--gradient-cta-neutral` pour le secondaire ; la carte prend `--radius-modal` (12 px, seule exception aux angles vifs de l'epic). **Le voile ferme la variante liste** (geste complet appui + relâchement, `pointerId` mémorisé, `pointercancel` qui désarme — mécanique de `PlayerSetupModal`) en émettant `secondary` : un choix est annulable. Les pop-ups de **décision** gardent leur voile **inerte** — la règle AC18 / Décision 12 tient, la pop-up de fin montant sous le doigt qui vient de valider une série. Le voile n'a pas de `role="button"` : exception assumée à CLAUDE.md §2, déjà relevée en DT3. *Éclairci le même jour (« trop sombre ») :* `--gradient-cta` prend le **haut** de l'échelle des bleus (`#3C9AE3` → `--color-cloth`) et le libellé des CTA passe en **blanc** ; `--gradient-cta-neutral` remonte à 0,22 → 0,10. Blanc sur le point le plus clair : 3,03:1 — AA pour du texte large, ce que sont ces libellés (~24 px `font-black`) — **à revalider dans la passe contraste de la 10.7**.

*Simplification du 2026-09-12 (Nathan), qui clôt la série :* une seule teinte pour tout ce qui est bleu. `--gradient-blue` (`#2E8FDB` → `--color-cloth`) remplace `--gradient-tile-3b`, `--gradient-tile-jds`, la famille `--gradient-tile-jds-2|3|4` **et** `--gradient-cta` ; `--gradient-neutral` remplace `--gradient-cta-neutral`. Seules restent les deux nuances sombres des tuiles **BIENTÔT** (`--gradient-tile-quilles`, `--gradient-tile-casin`) : la couleur y porte l'inactivité au même titre que le badge. `ModeTile.color` passe donc **optionnel** — une tuile ouverte n'a pas de couleur à choisir, seules les deux tuiles fermées en reçoivent une — et l'AC1 de la Story 10.2 (les trois tokens `--gradient-tile-jds-*`) est **caduc**. Blanc sur `#2E8FDB` : 3,46:1, AA pour du texte large.

*Livré en Story 10.4 (2026-09-14)* — refonte du **scoreboard** (`GameView` en `status === 'playing'`). **Aucune règle de score ne change** : `useGameStore.test.ts` passe sans une seule retouche, hors trois cas ajoutés. Deux composants nouveaux, un supprimé, un getter dérivé :

- **`IconAction.vue`** — picto + libellé d'une commande secondaire de barre basse (props `picto`, `label`, `state`, `disabled` ; emit `press`). Cible tactile de 90 px portant sur le **bloc entier, libellé compris**. `disabled` **et** garde, pour l'état grisé comme pour BIENTÔT.
- **`ScoreEntryDock.vue`** — remplace `ScoreEntryModal.vue` (supprimé avec son test, ses 295 lignes de cas migrées). **Coquille** de `NumericPadDock` (pop-up latérale, voile `bg-black/25` sans flou, `ALIGN_CLASSES`, `pointerId` mémorisé, `ANNULER`/`VALIDER` au pied) + **logique** de `ScoreEntryModal` (plafond `MAX_SCORE_DIGITS`, pulsation de refus, timer `AUTO_VALIDATE_DELAY_MS`, garde `VALIDER` à vide, compte à rebours visible lié à la constante). Emits **identiques** à ceux de la modale : le branchement de `GameView` n'a pas bougé. Props `currentInput` + `align` ; **pas** de `color`/`name` — la carte visée est visible, la pop-up ne rappelle plus rien.
  - ⚠️ **Deux plafonds, deux rôles** : `MAX_SCORE_DIGITS` (série, 3 chiffres, FR7) ici, `MAX_TARGET_SCORE` (distance, 999) dans `NumericPadDock`. Les confondre ne casserait aucun type.
  - ⚠️ **Le buffer reste dans le store** (`currentInput`), contrairement au paramétrage de la 10.3 où il vit dans l'écran : il est persisté et restauré avec `entryOpen` par la Story 1.12. Vérifié au navigateur (rechargement en pleine saisie : pop-up rouverte du bon côté, buffer restitué sur la carte).
- **`openSeries`** — getter **dérivé** du store (`computed` `{ player1, player2 }`), même famille que `averages`/`bestSeries`/`repriseCounts`. Aucun état nouveau, aucune persistance : `GameState`, `GameSnapshot` et `GAME_STORAGE_VERSION` (2) sont inchangés. ⚠️ **Borné au joueur qui a la main** : la fonction privée `openSeriesValue`, écrite en 2.2, reste non nulle **après** le passage de main — ce qui convient à ses deux appelants internes (`passTurn`, `incrementSeries`, qui l'interrogent toujours sur le joueur actif) mais afficherait une série « en cours » sur la carte d'un joueur assis.
- **`ActionBar.vue`** — réécrite en barre basse de scoreboard (props `ctaSide`, `sideOwners`, `ctaLabel`, `ctaTestId`, `canUndo`, `canRestart` ; emits `cta`, `quit`, `restart`, `undo`). **Un seul markup** pour les deux côtés, l'ordre venant de `flex-row`/`flex-row-reverse` : **DT2 est close**, avec la duplication CTA/SVG et les marges négatives `-mx-4`/`ml-4`/`mr-4` de `GameView`. `sideOwners` porte le joueur propriétaire de chaque colonne d'écran : `data-side` continue de nommer le **joueur**, pas le côté. ⚠️ Avec `flex-row-reverse`, l'ordre du DOM ne suit plus l'ordre visuel — un test de position doit lire la classe de direction, pas un index. La barre du **récap** (`FIN DE PARTIE` / `UNE PARTIE DE PLUS`) descend en `<nav>` inline dans `GameView`, **provisoire jusqu'à la Story 10.5**.
- **`PlayerPanel.vue`** — quatre zones (bandeau 22 % / score géant / `MOY · SÉRIE` / pied). `RESTANT` est un champ **dérivé calculé dans le panneau** (AR25). L'emit `pass-turn`, le handler de racine, la garde `if (props.active) return` et le `role="button"` englobant sont retirés : la dette de la revue 1.5 est close, la carte n'a plus que deux états. `touch-manipulation select-none` restent en classes, le CSS global ne ciblant que `button, [role="button"]`.
- **`CenterPanel.vue`** — réduit à `REP` · chrono · `PASSER LE TOUR` (emit `pass-turn`, props `passTurnDisabled`/`entryOpen`). `passTurn()` du store est **réutilisée telle quelle** (AR23) : seul le geste qui l'appelle change. `ShotClock` n'a pas bougé — le débordement de l'anneau est porté par la colonne.

*Passe de validation visuelle (2026-09-14, Chrome, 1133×744 · 1194×834 · 1920×1080, paysage), deux défauts que les tests ne pouvaient pas voir (happy-dom ne calcule aucun CSS) :*
- **liseré de tour effacé sur 22 % de la carte** — un `ring-inset` se peint au-dessus du fond de l'élément mais **sous ses enfants**, et le bandeau opaque le masquait. Le liseré devient un **overlay** (`absolute inset-0 z-20`) rendu après les quatre zones ;
- **anneau du chrono ne débordant d'aucun pixel** — le débordement se calcule sur la **content box** : la colonne portant `p-2`, `-mx-2` + `w-[calc(100%+32px)]` ne reconstituait que sa border-box. Corrigé en `-mx-4` + `w-[calc(100%+64px)]`, mesuré à 15 px de chaque côté ; les cartes réservent 24 px sur leur bord intérieur.

*Reste à trancher avec Nathan (non corrigé) :* l'anneau débordant **recouvre le liseré de tour** sur sa largeur, la carte `@container` créant un contexte d'empilement (`contain: layout`) qui confine le `z-20` du liseré.

*1re passe de rendu de la Story 10.4 (Nathan, 2026-09-14)* — six ajustements, aucun changement de règle :
- **carte à TROIS zones** : le bandeau prend le modèle Billiboard de bout en bout (`NOM | DISTANCE` puis `RESTANT | MOY · SÉRIE`, les deux premiers en **nombres nus**), et la ligne `MOY · SÉRIE` sous le score est supprimée avec son aplat ;
- **zone de série en `--color-brand-red`** et plus grosse. Choisi plutôt que `--color-turn-active` : plus sombre, il tient le texte large sur le jaune (≈ 4,1:1) comme sur le blanc (≈ 5,4:1) — à revalider à la passe AA de la 10.7 ;
- **`PASSER LE TOUR` sans contour**, et picto `pass-turn` **redéfini** sur la boucle circulaire à deux flèches de Billiboard. ⚠️ Même tracé que `refresh`, volontairement : les deux vivent sur des écrans qui ne se croisent jamais (CHANGER DE BILLE au paramétrage, PASSER LE TOUR au scoreboard) et restent deux entrées distinctes pour pouvoir diverger. `PictoIcon.test.ts` documente ce couple au lieu d'exiger l'unicité de toutes les formes ;
- **`SHOT_CLOCK_GRACE_MS` : 2000 → 1000** ;
- **`ShotClock` : arc rentré** (`RADIUS` 42 → 36, trait 8 → 10, chiffre 44 → 40 cqmin), marge sombre tout autour façon Cueuny.

⚠️ **Dette de test remboursée au passage.** La grâce du chrono est un réglage de rendu (3 s → 2 s → 1 s) et une dizaine de cas la **recopiaient en dur** dans leurs `advanceTimersByTime` : le passage à 1 s en cassait huit dans `useTimer.test.ts` et huit dans `GameView.test.ts`, tous sans rapport avec ce qu'ils testent. Ils la **dérivent** désormais de `SHOT_CLOCK_GRACE_MS` (un seul cas la fige, volontairement). Deux pièges relevés à cette occasion : le premier décrément tombe à **grâce + un tick**, `startInterval` n'étant armé qu'à la fin de la grâce ; et le cas « relance pendant la grâce » avait des attentes en dur qui la dépassaient dès 1 s — il ne testait plus ce qu'il dit. Même traitement pour `ShotClock.test.ts`, qui recopiait le rayon de l'arc : il le **lit** sur l'élément et verrouille la relation `dashoffset = C × (1 − ratio)`, pas la valeur du jour.

*2e passe de rendu de la Story 10.4 (Nathan, 2026-09-14)* :
- **le liseré de tour passe DEVANT l'anneau du chrono.** `@container` descend de la racine de `PlayerPanel` sur un wrapper intérieur : `container-type` implique `contain: layout`, donc un **contexte d'empilement** qui enfermait le `z-20` du liseré dans la carte et laissait l'anneau (`z-10`, colonne voisine) passer devant. La racine reste `relative` sans `z-index` — elle ne crée aucun contexte, le liseré remonte au contexte racine et gagne. C'est la sortie retenue parmi les deux consignées à la livraison ;
- **anneau plus gros** : débordement porté de 16 à 24 px de chaque côté (`-mx-5` + `w-[calc(100%+80px)]`), gouttière des cartes de 24 à 32 px. Le rayon de l'arc ne bouge pas : c'est le disque entier qui grandit ;
- **trait de l'arc affiné** (`STROKE_WIDTH` 10 → 7) : le disque ayant grossi, un trait épais redevenait lourd ;
- **le disque se fond dans la colonne.** `bg-black` littéral tranchait sur le gris-bleu de la colonne et se lisait comme une pastille posée dessus. Nouveau token `--color-shot-clock-face` (`#1C1F25`). ⚠️ C'est `--color-surface` **composé** sur `--color-bg` : une variable CSS ne sait pas faire cette composition, la valeur est donc figée et **doit être recalculée** si l'un des deux bouge. Opaque et non translucide comme la colonne, parce que le disque déborde sur des cartes claires.

**Correction de règle (`adjustScore`), défaut relevé par Nathan à cette passe.** Tant qu'une **série est ouverte** — 3 Bandes, joueur qui a la main —, `−`/`+` corrigent désormais **la série en cours** (`writeLastReprise`) au lieu d'empiler dans `scoreAdjustments`. L'ancien comportement faisait diverger le total de la somme des reprises : `−` baissait le score mais laissait la série affichée, la meilleure série et la moyenne sur une valeur fausse jusqu'à la fin de la partie. Le défaut datait de la Story 2.2 ; il devient visible avec la série affichée en grand sur la carte (AC3c). **Borné au 3 Bandes** : c'est le seul mode où une série se compte point par point, donc le seul où corriger revient à corriger ce comptage — en JDS la série est saisie d'un bloc et se corrige par `ANNULER` puis ressaisie, et le comportement de la Story 1.7 n'y change pas d'un iota. Une série ne peut pas devenir négative : sous zéro, la correction retombe sur l'ajustement séparé, qui reste volontairement non borné (Story 1.9).

*3e passe de rendu de la Story 10.4 (Nathan, 2026-09-14)* :
- **le liseré de tour CONTOURNE le disque du chrono au lieu de passer par-dessus.** Le liseré redevient confiné dans la carte (`@container` remis sur la racine, donc contexte d'empilement) et le disque repasse devant lui ; c'est un **demi-anneau rouge** dessiné dans `ShotClock` (`turnRingSide`, relayé par `CenterPanel.turnSide` depuis `GameView`) qui prend le relais, collé au bord du disque, de la même épaisseur que le `ring-8` de la carte. ⚠️ Il n'est **pas** clippé à la moitié du disque mais à la seule bande qui dépasse dans la carte : un demi-anneau s'arrête au centre du disque, donc en pleine colonne, et le rouge y dessine un crochet au lieu d'un contournement ;
- ⚠️ **l'ordre de peinture est forcé par des z-index EXPLICITES des deux côtés** — liseré à `z-10`, débordement du chrono à `z-20` — et non laissé au contexte d'empilement que `@container` (`contain: layout`) est censé créer sur la racine de la carte. Mesuré au navigateur : il ne suffit pas, le liseré droit restait visible **en travers** du disque, avec un raccord sale aux deux extrémités de l'arc. Le liseré est donc bel et bien **masqué** par le disque sur la hauteur de celui-ci, et le demi-anneau reprend le tracé exactement là où il s'interrompt — les extrémités coïncident, l'arc étant clippé au même `--game-clock-bleed` dont la colonne s'élargit ;
- **la colonne centrale perd son contour** (`border-border`), contrairement à la lettre de l'AC5 : le filet clair courait verticalement à son bord et s'interrompait derrière le disque, laissant voir un trait gris et une délimitation nette juste là où le tracé doit être invisible. Les deux cartes en aplat plein la délimitent déjà par contraste ;
- **nouveau token `--game-clock-bleed` (24 px)**, source unique du débordement : la colonne s'élargit de cette valeur (plus son padding) et le clip du liseré s'y cale. Les deux valeurs recopiées séparément se décalaient visiblement au raccord ;
- **cap de l'arc PLAT en toutes circonstances** (`stroke-linecap="butt"`) : les extrémités arrondies débordaient de la piste. Ce qui n'était qu'un cas particulier à zéro — un dash de longueur nulle laissait un point à midi, AC7 — devient la règle, et le `computed` qui le gérait disparaît ;
- **bandeau de carte à hauteur LIBRE** (`h-[22%]` retiré), avec un cran d'air de plus entre ses deux lignes. Fixé à 22 %, il laissait la moitié de son aplat vide sous le texte. Il vaut désormais ~16 % avec un nom court, ~21 % avec un nom sur deux lignes : c'est le contenu qui commande. L'AC1 parle de 22 %, la référence ne montre qu'un cartouche serré autour de son texte.

*4e passe de rendu de la Story 10.4 (Nathan, 2026-09-14)* :
- **`POUR n` quitte le pied de la carte pour le bandeau**, à la place du restant dont il est l'expression (« c'est le but des points restants »). Les deux disaient la même chose à deux endroits pendant trois points ; **l'AC2, qui assumait cette redondance, est caduc**. Conséquence voulue : la **zone de série reste occupée jusqu'au bout** — la série en cours ne disparaît plus trois points avant la fin, précisément quand on la regarde le plus. Sa priorité tombe à deux cas : valeur en cours de frappe, puis série ouverte ;
- **`PASSER LE TOUR` tient la MÊME PLACE dans les deux modes**, en bas de la colonne — c'est un geste répété des dizaines de fois par partie, il doit tomber sous le même doigt. La colonne centrait sa pile : sans chrono, le CTA remontait au milieu et changeait d'endroit entre un JDS et un 3 Bandes. Elle passe en `justify-between`, et le **compteur de reprises prend la place du chrono** en JDS au lieu de laisser un vide. ⚠️ Un seul markup : c'est la **classe** du bloc de reprises qui change (`shrink-0` ↔ `flex-1 justify-center`), pas sa position dans le gabarit — le dupliquer pour le déplacer rouvrirait DT2 en miniature.

*5e passe de rendu (Nathan, 2026-09-14)* : en JDS, le compteur de reprises est **sorti du flux** et centré sur la **hauteur entière** de la colonne (`absolute top-1/2 -translate-y-1/2` ; le CTA passe en `mt-auto` puisqu'il ne reste plus rien pour le pousser). En `flex-1 justify-center`, il se centrait sur la place restant **au-dessus du CTA**, soit une cinquantaine de pixels trop haut — les scores, eux, se centrent dans une carte dont le bandeau et le pied s'équilibrent, donc à peu près sur le milieu de la zone de jeu. Mesuré après correction : centre des scores 309 px, centre du bloc de reprises 311 px. ⚠️ En 3 Bandes, le chrono reste à `flex-1` et son centre tombe à 319 px, soit **10 px sous** celui des scores : le REP du haut et le CTA du bas ne sont pas symétriques. Non corrigé — imperceptible sur un disque de 273 px, et toute compensation en dur serait fragile.

⚠️ **`vue-tsc --noEmit` ne suffit pas à valider ce composant.** Remplacer le `v-if="secondsRemaining !== null"` du chrono par un `v-if` sur un `computed` équivalent fait perdre le narrowing `number | null` → `number` pour `ShotClock` : `--noEmit` laisse passer, `npm run build` (`vue-tsc -b`) refuse. C'est le build qui fait foi.

*Tokens ajoutés :* `--game-popup-inset-left` / `--game-popup-inset-right` (`calc(100vw * 0.4 + 32px)`) dans `@theme static`. ⚠️ Même dette de géométrie dupliquée que `--setup-popup-inset-*`, mais **pas la même géométrie** : le scoreboard n'a pas de barre latérale et ses colonnes valent 2/5 · 1/5 · 2/5. À faire bouger avec la mise en page.

*Livré en Story 10.5 (2026-09-14)* — refonte du **récap** (`GameView` en `status === 'finished'`), dernier écran du jeu à garder le rendu d'avant l'epic. **Aucun fichier nouveau ni supprimé, aucun token nouveau, aucun changement de store** : `rematch()` et `resetGame()` sont appelées telles quelles, `git diff --stat src/stores/` est vide — c'est la preuve de non-régression de la story.

- **`SideBar` sur son quatrième écran**, sans une ligne de changement dans le composant : `GameView` déclare `SUMMARY_SIDEBAR_ITEMS` (`RECOMMENCER`, picto `rotate-ccw`) et `SUMMARY_SIDEBAR_EXIT` (`QUITTER`, picto `door`) et les lui passe. ⚠️ **La barre vit dans `GameView`, pas dans `GameSummary`**, bien que la spec UX §10.4 range la sidebar dans la ligne « `GameSummary` — modifié » : le composant est strictement présentationnel (aucun emit, aucun accès au store), verrouillé par un test qui lit son source en `?raw` et refuse `defineEmits`. Même partage que sur les trois étapes de `HomeScreen`. `QUITTER` est dans le **slot de sortie** et `RECOMMENCER` en item — écart assumé à la lettre d'UX-DR31, qui les liste dans l'ordre inverse (décision de Nathan) ; aucune des deux n'ouvre de confirmation.
- **Le `<nav data-testid="summary-bar">` provisoire de la 10.4 est supprimé** avec ses deux boutons (`end-game-button`, `rematch-button`) : `ActionBar` ne sert plus qu'au scoreboard. Le récap n'a plus de barre basse.
- **`GameSummary.vue`** devient le **panneau de contenu** de la coquille : `bg-bg` cède la place au conteneur à contour (`border border-border bg-surface`, aucune classe de rayon — `--radius-container` vaut 0), le dégradé `--gradient-bg` étant posé par `GameView`. Les `rounded-3xl` des colonnes et les `rounded-full` des pastilles et du badge record disparaissent : c'étaient les derniers arrondis en dur du produit.
- **DT6 close.** Le bandeau éclate `{{ name }} / {{ targetScore }}` en **deux éléments** — nom en `min-w-0 truncate`, distance en `shrink-0 tabular-nums`, filet vertical entre les deux, nombre **nu** sans `/` — au modèle de bandeau de carte validé à la 1re passe de rendu de la 10.4, ce qui rend les deux écrans cohérents. ⚠️ `truncate` seul ne suffit pas : `min-w-0` est nécessaire **sur le span et sur son conteneur flex**, sans quoi le conteneur grandit au lieu de couper. C'est exactement ce qui manquait en 1.10. `summary-player1` / `summary-player2` restent sur le **conteneur** des deux valeurs — un test qui lisait sa chaîne agrégée doit viser `summary-name` et `summary-distance` séparément.
- **`BALL_CLASSES` → `BALL_PICTOS`** : les pastilles du bandeau **et** de la ligne `RÉSULTAT` rendent `/bille_blanche.png` et `/bille_jaune.png`, les assets fournis par Nathan en 10.3 et servis depuis `public/` (déjà précachés, `vite.config.ts` inclut `png`). Table littérale, comme partout. Plus aucun `bg-player-*` dans le composant.
- ⚠️ **`--color-victory-ribbon` (#E63946) et `--color-brand-red` (#D0343F) se côtoient pour la première fois** à l'écran — colonne gagnante et en-tête de la sidebar. Deux tokens voisins mais **distincts** : ne pas les fusionner sans arbitrage de Nathan.

*1re passe de rendu de la Story 10.5 (Nathan, 2026-09-14)* — trois ajustements, aucun changement de règle ni de store :
- **Les pastilles de bille sortent du bandeau.** Il en reste **une par joueur**, dans sa cellule `RÉSULTAT` : la bille y était dite deux fois, et le couple nom/distance avait besoin de la place.
- **Nom et distance montent de `text-label` à `text-tile-title`** (16–24 px → 28–36 px). ⚠️ **DT6 reste clos** : remesuré aux trois formats avec un nom de 20 `W`, le nom se tronque seul (1133 : 233 / 683 px ; 1194 : 257 / 719 px) et la distance reste entière. Le `truncate` tient parce que `min-w-0` est posé sur le span **et** sur son conteneur — grossir la police ne change rien à cette mécanique, seulement au seuil où elle se déclenche.
- **L'aplat de couleur passe de la COLONNE à la CELLULE** (réf. `billiboard_recap_2`) : chaque statistique est un bloc, les blocs sont séparés de 8 px (`gap-1`) et le fond se voit au travers. Constantes `CELL_CLASSES` et `LABEL_CELL_CLASSES` ; la colonne de libellés prend le même `bg-white/6` que la colonne perdante, seul le texte les distingue. **Écart assumé à UX-DR13**, qui justifiait les colonnes pleines par « des colonnes, pas une grille de lignes » : la colonne victorieuse se lit toujours d'un bloc. ⚠️ **Conséquence de test** : `column(…).classes()` ne porte plus `bg-victory-ribbon` — trois cas (deux dans `GameSummary.test.ts`, un dans `GameView.test.ts`) visent désormais les cellules. Le `data-testid="summary-column"` et les `data-side` n'ont pas bougé.
- **Ordre des lignes : `RÉSULTAT` · POINTS · REPRISES · MOY · SÉRIE** — la moyenne après le nombre de reprises dont elle se déduit. Un cas verrouille l'ordre des libellés **et** celui des cellules, les deux devant rester alignés.

*2e passe de rendu de la Story 10.5 (Nathan, 2026-09-14)* :
- **Toutes les valeurs à la même taille.** `POINTS` quitte `text-reprise` pour `text-label`, comme les quatre autres : seul en très grand, il écrasait les lignes voisines. Le `VS` du bandeau descend au passage de `text-reprise` à `text-hero` — **le bandeau perd 50 px** (153 → 103 au 1194×834) et les cinq blocs y gagnent d'autant (104 → 122 px). ⚠️ Le cas de `GameSummary.test.ts` qui verrouillait `text-reprise` sur `summary-points` (NFR10, lisibilité à 2 m) vérifie désormais que les **quatre** valeurs portent `text-label` et **aucune** `text-reprise`.
- **Bandeau en bande claire, fendue en biais** (réf. `billiboard_recap`). **Nouveau token `--color-banner` (#F2F0EA)** dans `@theme static` — blanc cassé et non blanc pur, l'app tourne en salle sombre ; c'est le seul aplat clair hors cartes joueur. Le texte s'y pose en `--color-bg` (#0D1117, contraste ≈ 17:1). Les deux bandes sont taillées par des `clip-path` en valeur arbitraire, symétriques, qui s'écartent **vers le bas** : le `VS` et le surtitre de mode se logent dans l'échancrure, sur le fond sombre. Même grammaire que l'en-tête de `SideBar`.
  - ⚠️ **Rembourrage asymétrique obligatoire** (`pl-4 pr-10` à gauche, `pl-10 pr-4` à droite) : côté échancrure le texte doit rester en deçà du biais. Mesuré au 1194 : la distance gauche s'arrête à 507 px pour une bande finissant à 587 — 80 px de marge, le biais n'en mord que 32.
  - ⚠️ **Le filet entre nom et distance passe de `bg-border-strong` à `bg-bg/30`** : un filet blanc translucide est invisible sur un aplat clair.
- **DT6 revérifié une troisième fois** avec le bandeau clair et le nom en `text-tile-title` : nom tronqué (1133 : 160 / 683 px ; 1194 : 199 / 719 px), distance entière aux trois formats.

*3e passe de rendu de la Story 10.5 (Nathan, 2026-09-14)* : **le texte de la colonne victorieuse passe en BLANC**. `--color-on-victory-ribbon` : `#000000` → `#FFFFFF`. Partout ailleurs dans l'app le texte est blanc, et la colonne perdante juste à côté l'est aussi — le noir se lisait comme une inversion.

⚠️ **À savoir pour la passe contraste AA (Story 10.7)** : sur `--color-victory-ribbon` (#E63946), le blanc donne **4,17:1** et le noir **5,04:1** — le blanc est donc le choix le MOINS contrasté des deux. Il passe AA pour les tailles employées ici (tout est en `text-label`, ≥ 24 px et gras, donc « grand texte », seuil 3:1) mais **pas** le seuil 4,5:1 du texte courant. Deux conséquences à retenir : ne pas descendre la taille de ces valeurs sans revoir la teinte, et si le seuil 4,5 est visé, assombrir le ruban vers `--color-brand-red` (#D0343F) porterait le blanc à 4,95:1. Consigné dans `main.css` au-dessus du token.

### Architecture Frontend

**Routing V1 (Vue Router 4) :**

| Route | Composant | Usage |
|---|---|---|
| `/` | `GameView.vue` | Scoreboard principal |
| `/history` | `HistoryView.vue` | Liste des parties |
| `/history/:id` | `GameDetailView.vue` | Détail d'une partie |

Réglages en V1 : modales inline sur `GameView`, pas de route dédiée.

**État d'implémentation :** seule la route `/` est déclarée en V1a. `/history` et `/history/:id` seront ajoutées avec l'Epic 3, quand `HistoryView` et `GameDetailView` existeront réellement. *(2026-09-11 : Epic 3 redéfini — ces routes montrent les parties **du joueur identifié**, après le profil (Epic 4) ; consultation sur le profil d'abord, tablette ensuite.)*

**Stores Pinia :**
- `useGameStore` : état courant de partie + persistance `localStorage`
- `useHistoryStore` : historique des parties + `Dexie.js`

**Composants principaux V1a :**
- `PlayerPanel.vue` (×2) — zone joueur avec pavé numérique
- `CenterPanel.vue` — reprises, stats, contrôles
- `NumericPad.vue` — pavé numérique tactile, purement présentationnel (emits `digit`/`clear`/`backspace`)
- `AlphaKeyboard.vue` — clavier AZERTY intégré, purement présentationnel (emits `input`/`backspace`). L'écran cible étant une **borne fixe**, la saisie de texte ne doit jamais dépendre du clavier du système
- `PlayerSetupModal.vue` — réglage du **nom (optionnel) et de la distance (obligatoire depuis la Story 1.10) d'un joueur**, ouvert en tapant sa zone : pop-up centrée sur arrière-plan flouté (AR6), sans aucun champ natif, avec bascule de clavier selon le champ visé
- `PromptModal.vue` — pop-up de **décision** réutilisable (Story 1.10, 2026-09-10) : même coquille que les pop-ups de saisie mais **voile inerte**, sans croix (le retour est un CTA secondaire `ANNULER` — revue de code 1.10), CTA principal/secondaire ; sert à l'erreur de distance, à l'offre de reprise égalisatrice, à « PARTIE TERMINÉE », à la confirmation de sortie et, depuis la 1.15 (2026-09-10), à la confirmation de recommencement « RECOMMENCER LA PARTIE ? »
- `HomeScreen.vue` — écran d'accueil : veille, sélection catégorie → mode, zones joueur ouvrant leur réglage
- `ActionBar.vue` — barre d'action basse commune à tous les écrans (retour, CTA contextuels)
- `GameSummary.vue` — récapitulatif fin de partie, format Billiboard (bandeau VS, colonnes joueur, colonne du vainqueur en couleur) — purement présentationnel, sans interaction (Story 1.10)

### Infrastructure & Déploiement

**Hébergement V1 : Netlify**
- Usage commercial autorisé sur free tier (critique : V2+ = SaaS payant clubs)
- Auto-deploy GitHub → push sur `main` = déploiement automatique
- HTTPS + CDN mondial inclus, zéro configuration manuelle
- 300 build minutes/mois — suffisant pour dev solo

**CI/CD :** Netlify built-in — pas de GitHub Actions nécessaire pour V1.

*Note (Story 1.13, 2026-09-10)* : livré — `netlify.toml` **à la racine du dépôt** (`base = "1score"`, `publish = "dist"`, `command = "npm run build"`, redirection SPA `/* → /index.html 200`). Le rattachement du dépôt GitHub `nlegendree/carom_scoreboard` au site Netlify est une action manuelle, hors code.

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

Le dépôt Git racine (déjà existant, contient `_bmad/`, `_bmad-output/`, `docs/`, `explore/`, `.claude/`) héberge tout — artefacts BMad inclus — pour rester synchronisé entre les deux postes de travail de Nathan. Le code applicatif ne vit pas à la racine du dépôt : il est isolé dans un sous-dossier dédié `1score/`, dont l'arborescence complète est détaillée ci-dessous. Toute commande `npm`/`vite`/`vitest` s'exécute avec ce sous-dossier comme working directory.

### Arborescence Complète

```
1score/               ← sous-dossier applicatif, PAS la racine du dépôt Git
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
├── netlify.toml                 ← Config déploiement Netlify (Story 1.13 : remonté à la RACINE du dépôt, `base` désigne 1score/)
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
    │   ├── ui.ts                ← PictoName, ItemState, SideBarItem (Epic 10, Story 10.1), PromptAction (Story 10.2)
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
    │   ├── usePointerEvents.ts  ← Pointer Events (long press, tap)
    │   ├── usePwaUpdate.ts      ← Mise à jour PWA différée à l'accueil (Story 1.13)
    │   └── useTimer.ts          ← Chrono de tir 3 Bandes, 40 s, non persisté (Story 2.1, AR14)
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
    │   ├── ShotClock.vue        ← Anneau du chrono 3 Bandes, fondu vert→rouge sur noir (Story 2.1, revue 2026-09-11)
    │   ├── ShotClock.test.ts
    │   ├── NumericPad.vue       ← Pavé numérique tactile
    │   ├── NumericPad.test.ts
    │   ├── AlphaKeyboard.vue    ← Clavier AZERTY intégré (borne fixe, pas de clavier système)
    │   ├── AlphaKeyboard.test.ts
    │   ├── PlayerSetupModal.vue ← Nom + distance d'un joueur (pop-up, AR6)
    │   ├── PlayerSetupModal.test.ts
    │   ├── PromptModal.vue      ← Pop-up de décision, voile inerte (Story 1.10)
    │   ├── PromptModal.test.ts
    │   ├── keyClasses.ts        ← Style de touche partagé par les deux claviers
    │   ├── HomeScreen.vue       ← Écran d'accueil (veille + sélection catégorie/mode + joueurs)
    │   ├── HomeScreen.test.ts
    │   ├── SideBar.vue          ← Barre latérale des écrans hors jeu, contenu fourni par l'écran (Story 10.1)
    │   ├── SideBar.test.ts
    │   ├── ModeTile.vue         ← Tuile de mode de l'accueil, état BIENTÔT (Story 10.1)
    │   ├── ModeTile.test.ts
    │   ├── PictoIcon.vue        ← Jeu de pictos SVG inline (Story 10.1)
    │   ├── PictoIcon.test.ts
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
| FR12-FR16 — Modes de jeu | `HomeScreen.vue`, `types/game.ts` (catalogue `GAME_CATEGORIES`) ; FR13/FR14 (3 Bandes, Stories 2.1, 2.2) : `types/game.ts` (catalogue), `useTimer.ts`, `ShotClock.vue`, `CenterPanel.vue`, `useGameStore.ts` (`incrementSeries`), `GameView.vue` (`+1 POINT`) |
| FR17-FR20 — Stats & Historique | `GameSummary.vue`, `useHistoryStore.ts`, `databaseService.ts`, `HistoryView.vue`, `GameDetailView.vue` |
| FR39-FR43 — Admin & Config | `HomeScreen.vue`, `PlayerPanel.vue` (noms éditables inline), `CenterPanel.vue` (FR43 — alerte d'inactivité : **story 1.17 annulée** le 2026-09-10, rien à construire) |
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
| FR12-FR16 Modes de jeu | ✅ | `HomeScreen`, `types/game.ts` |
| FR17-FR20 Stats/Historique | ✅ | `GameSummary`, `useHistoryStore`, vues history |
| FR39-FR43 Admin/Config | ✅ | `PlayerPanel`, `HomeScreen`, `CenterPanel` |
| FR45-FR46 Offline + PWA | ✅ | vite-plugin-pwa + manifest (`vite.config.ts`) — livré en Story 1.13 (précache intégral, `usePwaUpdate.ts`, `netlify.toml`) |
| NFR1 < 100ms tactile | ✅ | Pointer Events + touch-action |
| NFR2 < 2s chargement | ✅ | Vite build + cache Service Worker — livré en Story 1.13 (précache de 12 entrées, ~292 Ko) |
| NFR5 Sauvegarde chaque action | ✅ | `storageService` dans watchers store — livré en Story 1.12 (`watch` sur `persistedState`, une écriture par action) |
| NFR13 Aucune donnée externe V1 | ✅ | Pas d'API externe |

### Gaps Identifiés & Corrections

**Ajouts à l'arborescence :**
```
src/composables/
├── usePointerEvents.ts
├── useSpeech.ts          ← Web Speech API (FR42 — annonce vocale)
└── useTimer.ts           ← Timer 3 Bandes (V1b) — livré en Story 2.1 (2026-09-10)
```
*Note (Story 2.1, 2026-09-10)* : `useTimer.ts` expose `SHOT_CLOCK_SECONDS = 40` et `useTimer()` → `{ secondsRemaining, resetTimer }`, appelé une fois dans `GameView.vue` (sa valeur alimente un prop de `CenterPanel`, contrairement à `usePwaUpdate` appelé dans `App.vue`). Décompte par `setInterval` natif, redémarré sur `watch([status, mode, startedAt])` — `startedAt` change à chaque `startGame()` interne (RECOMMENCER, revanche), `status` couvre l'arrêt en fin de partie et au retour accueil. **Pas d'état de pause** (retiré du périmètre V1b, décision de Nathan) et **pas de persistance** : aucun champ chrono dans `GameState`/`GameSnapshot`. Affichage par `ShotClock.vue` (anneau SVG `stroke-dashoffset`, rouge `--color-alert` sur `bg-black`, UX-DR4). *Story 2.2 (2026-09-11)* : `SHOT_CLOCK_GRACE_MS = 2000` — `resetTimer()` remet 40 puis attend 2 s avant le premier tick, gardée par le mode (no-op hors 3 Bandes) ; appelée par `GameView` au `+1 POINT` (`incrementSeries`) et à la main rendue (`passTurn`). Store : `incrementSeries()` écrit dans la case du joueur de la reprise courante (`openSeriesValue` déduit la série ouverte de la dernière reprise, aucun champ ajouté à `GameState`) ; `passTurn()` n'ajoute une reprise à 0 que sans série ouverte. `ShotClock.vue` : taille en unités de conteneur (`container-type: size`, `min(100cqw,100cqh)`, chiffre en `cqmin`), couleur HSL interpolée vert → rouge (revue de Nathan).

**Note workbox (vite.config.ts) :** stratégie `cache-first` pour assets JS/CSS, `StaleWhileRevalidate` pour HTML → à configurer lors de l'init projet.
*Précisé en Story 1.13 (2026-09-10)* : **précache atomique, pas de `StaleWhileRevalidate` pour le HTML.** Le HTML référence des assets hachés ; un `index.html` servi « stale » pointerait vers des fichiers que `cleanupOutdatedCaches` a supprimés → page cassée hors ligne. `generateSW` précache tout le build (`globPatterns` avec `woff2`, `navigateFallback: 'index.html'`, `cleanupOutdatedCaches`, `clientsClaim`), ce qui satisfait l'intention d'AR10 (JS/CSS depuis le cache, HTML renouvelé à chaque déploiement) en gardant HTML et assets cohérents. Pas de `runtimeCaching` : aucune ressource réseau au runtime.

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

**Prochaine étape :** Créer `CLAUDE.md` + initialiser le projet avec `npm create @vite-pwa/pwa@latest 1score -- --template vue-ts`.
