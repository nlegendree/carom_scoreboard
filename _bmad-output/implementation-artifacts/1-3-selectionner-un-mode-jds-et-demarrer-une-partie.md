# Story 1.3: Sélectionner un mode JDS et démarrer une partie

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur (Michel),
I want sélectionner un mode de jeu JDS et saisir les deux noms de joueurs,
so that je peux démarrer une partie en moins de 30 secondes sans formation.

## Acceptance Criteria

1. **Given** je lance l'application sans partie en cours sauvegardée **When** l'écran d'accueil s'affiche **Then** il fait office d'écran de veille et présente directement, dans un bandeau bas façon Billiboard, les 4 catégories de jeu (Jeux de séries, 3 Bandes, Quilles, Casin) en gros blocs tactiles avec leur sous-titre — sans bouton de démarrage intermédiaire (UX-DR12).
2. **Given** l'écran d'accueil **When** je sélectionne une catégorie **Then** une catégorie à plusieurs modes ouvre un second niveau listant ses modes (Jeux de séries : Libre, Cadre 47/2, Cadre 47/1, Cadre 71/2, 1 Bande, 4 Billes ; Quilles : 5 et 9 Quilles) tandis qu'une catégorie à mode unique passe directement à l'étape suivante ; les catégories dont aucun mode n'est encore disponible sont affichées mais inertes et marquées "BIENTÔT".
2b. **Given** un mode sélectionné **When** l'étape des joueurs s'affiche **Then** elle présente deux grands panneaux façon CUESCO portant déjà la bille de leur côté (gauche blanc, droite jaune), avec les noms éditables inline, majuscules automatiques, 20 caractères max (UX-DR19).
3. **Given** les deux noms saisis (ou conservés par défaut) **When** je confirme **Then** la partie démarre, `GameView` affiche deux blocs pleins à chiffres noirs — blanc à gauche, jaune à droite (UX-DR2) — chacun avec le nom en haut à gauche et la distance de jeu en haut à droite, reprise 1 active.
3b. **Given** une partie qui vient de démarrer, avant la première reprise **When** j'appuie sur le bouton d'interversion de la console centrale **Then** les deux joueurs échangent de côté, la bille restant attachée au côté (gauche toujours blanche, droite toujours jaune) ; le bouton disparaît dès la première reprise validée.
4. **Given** les deux `PlayerPanel` affichés **When** je compare leurs contrôles et leur disposition **Then** ils sont strictement symétriques — chacun porte ses propres contrôles de saisie, et `CenterPanel` ne porte que des actions symétriques s'appliquant identiquement aux deux joueurs (ANNULER, interversion) : aucune saisie de score ni action favorisant un joueur n'y est centralisée (UX-DR9, UX-DR11 amendés en revue le 2026-09-08).
5. **Given** un joueur dont c'est le tour **When** j'observe l'indicateur de tour actif **Then** son panneau est encadré d'un liseré rouge épais (convention CUESCO/Billiboard) : le signal porté est la présence du cadre, pas sa teinte, ce qui reste lisible en cas de daltonisme et à distance (UX-DR14).
6. **Given** le critère de succès PRD "60 ans / 30 secondes" **When** un joueur non initié suit ce parcours complet (accueil → catégorie → mode → joueurs → prêt à saisir) **Then** l'ensemble prend moins de 30 secondes, sans lecture de texte explicatif requise (NFR12).

## Tasks / Subtasks

- [x] Task 1 : Types TypeScript `src/types/game.ts` (AC: #1, #2, #3, #4, #5)
  - [x] ~~1.1 Définir `GameMode = 'libre' | 'cadre' | 'bande' | '3bandes'`~~ **superseded par 9.1** (union de 10 modes dérivée du catalogue) et `GameStatus = 'idle' | 'playing' | 'finished'` (repris tels quels d'`architecture.md`)
  - [x] ~~1.2 Définir `PlayerColor = 'yellow' | 'white' | 'orange' | 'magenta'`~~ **superseded par 9.2** (réduit à `'white' | 'yellow'`) — **extension non présente dans le snippet `architecture.md`**, nécessaire pour UX-DR2 (voir Dev Notes § Écarts avec `architecture.md`)
  - [x] 1.3 Définir `interface Player { id: 'player1' | 'player2'; name: string; score: number; color: PlayerColor }` — champ `color` ajouté au-delà du snippet architecture (même justification)
  - [x] 1.4 Définir `interface Reprise { player1: number | null; player2: number | null; timestamp: number }` (repris tel quel, non peuplé dans cette story)
  - [x] 1.5 Définir `interface GameState { mode: GameMode; status: GameStatus; player1: Player; player2: Player; activePlayer: 'player1' | 'player2'; reprises: Reprise[]; currentInput: { player1: string; player2: string }; isNegative: { player1: boolean; player2: boolean }; startedAt: number | null; lastSaved: string }` — champ `activePlayer` ajouté au-delà du snippet architecture (nécessaire pour AC#5/UX-DR14)
  - [x] ~~1.6 Exporter `GAME_MODE_LABELS` littéral~~ **superseded par 9.1** (dérivé du catalogue, exhaustif par construction) — ancien libellé : (`{ libre: 'LIBRE', cadre: 'CADRE', bande: 'BANDE', '3bandes': '3 BANDES' }`) — évite la duplication du libellé entre `ModeSelector` et `CenterPanel`
  - [x] 1.7 Supprimer `src/types/.gitkeep`

- [x] Task 2 : Store Pinia `src/stores/useGameStore.ts` + `useGameStore.test.ts` (AC: #3, #4, #5)
  - [x] 2.1 Setup store (`defineStore('game', () => { ... })`) — id `'game'`, cohérent avec le préfixe `use` du nom de fichier sans le répéter dans l'id
  - [x] 2.2 State : refs individuelles pour `mode`, `status`, `player1`, `player2`, `activePlayer`, `startedAt`, `currentInput`, `isNegative`, `lastSaved` ; `reprises` en `shallowRef<Reprise[]>([])` (AR9, évite la réactivité profonde sur les sessions longues)
  - [x] ~~2.3 `startGame` tire 2 couleurs distinctes au hasard~~ **superseded par 9.2** (bille attachée au côté) — ancien libellé : `startGame(mode, player1Name, player2Name)` tire 2 couleurs au hasard parmi les 4 de `PlayerColor`, les assigne à `player1`/`player2` (jamais un ordre fixe), initialise `score: 0` pour les deux, `status = 'playing'`, `activePlayer = 'player1'`, `reprises = []`, `startedAt = Date.now()`, `currentInput = { player1: '', player2: '' }`, `isNegative = { player1: false, player2: false }`, `lastSaved = new Date().toISOString()`
  - [x] 2.4 Exposer un état initial `status: 'idle'` par défaut (aucune persistance dans cette story — voir Dev Notes § Hors périmètre)
  - [x] ~~2.5 Test `player1.color !== player2.color` parmi 4 couleurs~~ **superseded par 9.2** — ancien libellé : vérifie `mode`, noms, `player1.color !== player2.color`, les deux couleurs `∈ ['yellow','white','orange','magenta']`, `status === 'playing'`, `activePlayer === 'player1'`, `reprises` vide, `score` à 0 pour les deux
  - [x] 2.6 Supprimer `src/stores/.gitkeep`

- [x] ~~Task 3 : Composant `src/components/ModeSelector.vue` + `.test.ts`~~ — **entièrement superseded par la Task 9.4** : `ModeSelector.vue` n'a jamais été livré, il a été remplacé par `HomeScreen.vue` (accueil-veille + bandeau de catégories + second niveau + étape joueurs, sans bouton de démarrage). Les sous-tâches 3.1 à 3.5 ci-dessous décrivent le composant abandonné et sont conservées pour l'historique uniquement.
  - [x] 3.1 Modale plein écran, 2 étapes internes (`ref` local, ex. `step: 'mode' | 'names'`) — pas de fermeture par tap en dehors (UX-DR12)
  - [x] 3.2 Étape `mode` : 3 gros boutons tactiles (Libre / Cadre / Bande — **pas** 3 Bandes, hors périmètre V1a/Epic 2), `@pointerdown`, ≥90×90px, libellés via `GAME_MODE_LABELS`
  - [x] 3.3 Étape `names` : 2 champs de saisie texte, valeur par défaut `'JOUEUR 1'` / `'JOUEUR 2'`, transformation majuscule automatique à la saisie, `maxlength="20"`
  - [x] 3.4 Bouton "Confirmer" (couleur accent système `bg-accent`/`text-on-accent`, jamais une couleur joueur — UX-DR3) → appelle `gameStore.startGame(mode, name1, name2)`
  - [x] 3.5 Tests : sélection d'un mode affiche l'étape noms ; confirmation avec noms par défaut appelle `startGame` avec `'JOUEUR 1'`/`'JOUEUR 2'` ; saisie minuscule est bien mise en majuscule ; saisie > 20 caractères est tronquée/refusée

- [x] Task 4 : Composant `src/components/PlayerPanel.vue` + `.test.ts` (AC: #3, #4, #5)
  - [x] 4.1 Props typées : `player: Player`, `active: boolean`
  - [x] 4.2 Bloc plein écran de la couleur du joueur (`bg-player-{color}` / `text-on-player-{color}`, tokens déjà définis dans `main.css` — story 1.1, ne pas recréer de couleurs)
  - [x] 4.3 Affiche `player.name` et `player.score`
  - [x] ~~4.4 Indicateur combinant **au moins 2 signaux non-couleur**~~ **superseded par 10.5** : le marqueur ▶ et l'opacité réduite ont été retirés, le signal retenu est la **présence** du liseré rouge épais `ring-8 ring-turn-active` (et non sa teinte), conforme à l'AC#5 réécrit et à UX-DR14. Ancien libellé : indicateur combinant au moins 2 signaux non-couleur quand `active === true` (ex. icône/marqueur visible + luminosité/opacité réduite du panneau inactif) — ne jamais reposer sur la seule teinte du bloc (UX-DR14)
  - [x] 4.5 Aucun contrôle de saisie fonctionnel dans cette story (`NumericPad` = Story 1.5, hors périmètre — voir Dev Notes)
  - [x] 4.6 Tests : rendu du nom/score, classe de couleur correcte selon `player.color`, présence du marqueur actif seulement si `active === true`

- [x] Task 5 : Composant `src/components/CenterPanel.vue` + `.test.ts` (AC: #3, #4)
  - [x] 5.1 Props : `mode: GameMode`, `repriseNumber: number`
  - [x] ~~5.2 Affiche **uniquement** le mode et la reprise, **aucune** action affectant le score~~ **superseded par 10.6 et par l'amendement d'UX-DR11 du 2026-09-08** : `CenterPanel` porte aussi les actions symétriques ANNULER et interversion. Ancien libellé : affiche uniquement le libellé du mode et le numéro de reprise
  - [x] 5.3 Tests : affichage correct du libellé de mode et du numéro de reprise

- [x] Task 6 : Vue `src/views/GameView.vue` + `.test.ts` (AC: #1, #3, #4, #5)
  - [x] 6.1 `storeToRefs(gameStore)` pour lire `status`, `player1`, `player2`, `activePlayer`, `mode`, `reprises`
  - [x] ~~6.2 Si `status === 'idle'` : écran de démarrage avec un bouton unique~~ **superseded par 9.4** (plus de bouton de démarrage, `GameView` monte directement `HomeScreen`) — ancien libellé : écran de démarrage avec un bouton unique (`bg-accent`, gros pictogramme, pas de texte explicatif long — NFR12) qui affiche `ModeSelector`
  - [x] 6.3 Si `status === 'playing'` : layout 3 colonnes (`PlayerPanel` / `CenterPanel` / `PlayerPanel`) strictement symétrique, `repriseNumber = reprises.length + 1`, `active` calculé depuis `activePlayer`
  - [x] 6.4 Tests : bascule idle → playing après confirmation dans `ModeSelector` (via le store), les deux `PlayerPanel` reçoivent des couleurs différentes

- [x] Task 7 : Router `src/router/index.ts` (AC: #1)
  - [x] 7.1 `createRouter` + `createWebHistory`, une seule route `/` → `GameView.vue` dans cette story (voir Dev Notes § Écarts avec `architecture.md` — routes `/history` et `/history/:id` différées à l'Epic 3)
  - [x] 7.2 Supprimer `src/router/.gitkeep`

- [x] Task 8 : Câblage `main.ts` / `App.vue`, nettoyage du starter (AC: #1)
  - [x] 8.1 `main.ts` : `createPinia()` + `app.use(pinia)`, `app.use(router)`
  - [x] 8.2 `App.vue` : remplacer le contenu démo par `<router-view />` (+ `<PWABadge />` conservé)
  - [x] 8.3 Supprimer `src/components/HelloWorld.vue` et `src/assets/vue.svg` (boilerplate du starter, plus référencés)
  - [x] 8.4 Supprimer `src/components/.gitkeep` et `src/views/.gitkeep`

- [x] Task 9 : Révision UI post-démo (AC: #1, #2, #2b, #3, #3b, #5) — demandée par Nathan après validation visuelle de la première version
  - [x] 9.1 Catalogue de modes déclaratif dans `types/game.ts` : `GameCategoryId`, `GameMode` étendu à 10 valeurs, `GAME_CATEGORIES` (4 catégories → modes), `GAME_MODE_LABELS` dérivé du catalogue, `isCategoryAvailable()`
  - [x] 9.2 `PlayerColor` réduit à `'white' | 'yellow'` ; `startGame()` assigne la bille par côté (plus de tirage aléatoire) ; tokens couleur orange/magenta retirés de `main.css`
  - [x] 9.3 Action `swapPlayers()` : échange les joueurs de côté, la bille restant attachée au côté
  - [x] 9.4 `ModeSelector.vue` remplacé par `HomeScreen.vue` : écran de veille + bandeau de catégories + second niveau de modes + étape noms, sans bouton de démarrage
  - [x] 9.5 `PlayerPanel` : blanc → `bg-player-white`/texte noir, jaune → `bg-black`/texte jaune ; tour actif = liseré `ring-8 ring-accent` + marqueur ▶
  - [x] 9.6 `CenterPanel` : bouton d'interversion émettant `swap-players`, visible seulement avant la première reprise
  - [x] 9.7 Correction des tokens `main.css` : `--font-size-*` → `--text-*` (namespace attendu par Tailwind v4, sinon aucun utilitaire `text-score`/`text-label`/`text-stat` n'est généré) et `min-h-[--size-touch-target]` → `min-h-[var(...)]`
  - [x] 9.8 Mise à jour d'UX-DR2 dans `epics.md` et `ux-design-specification.md`

- [x] Task 10 : Seconde révision UI (AC: #1, #2b, #3, #3b, #5) — retours de Nathan sur captures CUESCO/Billiboard
  - [x] 10.1 Logo `explore/resources/image.png` recadré en `public/logo.png`, source des assets PWA/favicon (`pwa-assets.config.ts`) ; ancien `favicon.svg` Vite supprimé
  - [x] 10.2 Logo affiché en header **uniquement sur l'écran d'accueil** (retiré des autres écrans après retour de Nathan : superflu dès qu'on a navigué) ; les écrans suivants ne gardent que le titre du contexte
  - [x] 10.3 `ActionBar.vue` : barre d'action basse présente sur **tous** les écrans, flèche de retour toujours au même endroit, slot d'actions à droite (accueillera les CTA +1 / pavé numérique de la Story 1.5)
  - [x] 10.4 Étape joueurs refondue façon CUESCO : deux grands panneaux portant déjà la bille de leur côté (blanc / jaune), noms éditables inline — structure qui accueillera la sélection depuis la base joueurs du club (Epic 4)
  - [x] 10.5 `PlayerPanel` : bloc jaune plein à chiffres noirs (aligné Billiboard), nom en haut à gauche, distance en haut à droite, score géant centré, liseré **rouge** `ring-turn-active` sur le joueur actif
  - [x] 10.6 `CenterPanel` élargi (`w-1/5`) : numéro de reprise en très grand, bouton ANNULER (désactivé tant qu'aucune reprise — branché par la Story 1.8), bouton d'interversion en dessous
  - [x] 10.7 Store : `targetScore` (défaut 20, rendu configurable par la Story 1.4) et action `resetGame()` pour le retour depuis le scoreboard
  - [x] 10.8 Token `--color-turn-active` ajouté ; `--color-on-player-yellow` restauré (le bloc jaune est de nouveau plein à texte noir)

### Review Findings

Revue de code adversariale du 2026-09-08 (3 couches parallèles : Blind Hunter, Edge Case Hunter, Acceptance Auditor) + vérification navigateur réelle aux dimensions tablette (768×1024, 1024×768, 1366×1024, 1920×1080). Périmètre confirmé par Nathan : **tablette au minimum, jamais téléphone** — les findings propres au format téléphone ont été écartés après vérification qu'ils sont absents dès 768px.

#### Décisions requises

- [x] [Review][Decision] **TRANCHÉ (Nathan, 2026-09-08) : bouton conservé, spec amendée.** AC#4 et UX-DR11 sont à amender pour autoriser explicitement ANNULER et l'interversion sur la console centrale (convention Billiboard/CUESCO), et la note de périmètre manquante est à ajouter à la Story 1.8 dans `epics.md`. Le code ne bouge pas. Voir le correctif dédié ci-dessous. — Bouton ANNULER dans `CenterPanel` — viole l'AC#4/UX-DR11 et l'interdiction explicite des Dev Notes (« Toute tentation d'y ajouter un bouton lié au score est une violation directe »). Aggravé : `GameView` n'écoute jamais `@undo`, l'émission part dans le vide. C'est la seule dérive de scope non régularisée dans `epics.md` (les Stories 1.4, 1.15 et 2.1 ont leur note de périmètre, la 1.8 n'en a pas). Options : (a) retirer le bouton et le rendre à la Story 1.8 côté joueur, (b) le conserver et amender AC#4/UX-DR11 + ajouter la note de périmètre à la Story 1.8. [carom-scoreboard/src/components/CenterPanel.vue:25-32]
- [x] [Review][Decision] **TRANCHÉ (Nathan, 2026-09-08) : assumé, pas de besoin clavier pour l'instant.** AR8/CLAUDE.md §2 reste inchangé, `@pointerdown` seul est confirmé comme convention du projet. Aucun correctif. — `@pointerdown` sans `click` — aucun élément interactif n'est activable au clavier ni par lecteur d'écran (vérifié : `focus()` + `MouseEvent('click')` ne déclenche rien sur les 6 boutons). Conforme à AR8/CLAUDE.md §2 qui impose `@pointerdown` et proscrit `@click` seul, donc ce n'est pas un écart d'implémentation mais une conséquence de la convention. Options : (a) assumer (app tactile dédiée, tablette de club), (b) amender AR8 en `@pointerdown` + `@keydown.enter/.space`. [carom-scoreboard/src/components/HomeScreen.vue:98,117,156 ; ActionBar.vue:14 ; CenterPanel.vue:29,38]
- [x] [Review][Decision] **TRANCHÉ (Nathan, 2026-09-08) : comportement actuel conservé** — le tour reste attaché au côté, pas à la personne. La règle produit est donc fixée : le joueur de gauche commence, l'interversion avant la reprise 1 ne change pas qui commence. À reporter dans les Dev Notes § Questions ouvertes et à tester explicitement en Story 1.5. — `swapPlayers()` ne déplace pas `activePlayer` — vérifié en navigateur : après interversion, le liseré rouge reste sur le panneau gauche, donc sur l'autre humain. Le tour suit le côté, pas la personne. Sans effet aujourd'hui (interversion possible seulement avant la reprise 1), mais piégera la Story 1.5/1.6. Les Dev Notes § Questions ouvertes reconnaissent déjà que la règle produit n'est pas fixée. À trancher avec le PO. [carom-scoreboard/src/stores/useGameStore.ts:34-40]
- [x] [Review][Decision] **TRANCHÉ (Nathan, 2026-09-08) : conservé** — l'échelle de 8px est la bonne pratique retenue pour le projet. À documenter explicitement dans CLAUDE.md pour que la prochaine session ne lise pas `h-16` comme 64px. — `--spacing: 8px` double toute l'échelle Tailwind — le défaut Tailwind v4 est `0.25rem` (4px) ; le token le fixe à 8px, donc chaque utilitaire vaut 2× ce que sa lecture suggère (`h-16` = 128px et non 64, `p-6` = 48px, `px-10` = 80px, `gap-4` = 32px — confirmé dans le CSS compilé). Cause racine des débordements observés. Options : (a) conserver et documenter la convention dans CLAUDE.md, (b) revenir à l'échelle standard et diviser par deux toutes les valeurs numériques des composants. [carom-scoreboard/src/assets/main.css:38]

#### Correctifs

- [x] [Review][Patch] Un nom de joueur vidé ou composé d'espaces démarre une partie anonyme — ni `trim()`, ni test de vacuité, ni repli sur la valeur par défaut ; confirmé en navigateur (scoreboard affiché avec un panneau sans nom, non corrigeable avant la Story 1.14). L'AC#3 dit « ou conservés par défaut ». [carom-scoreboard/src/components/HomeScreen.vue:61-69]
- [x] [Review][Patch] Bouton RETOUR inerte sur l'écran d'accueil — `back()` tombe dans `goHome()` qui repose l'état déjà courant ; confirmé en navigateur (deux appuis sans effet). Contrôle mort permanent sur le premier écran, à rebours du NFR12. [carom-scoreboard/src/components/HomeScreen.vue:53-59,150]
- [x] [Review][Patch] Le compteur de reprise déborde de sa colonne dès 2 chiffres, sur toutes les tablettes — mesuré : « 88 » = 164px pour 138px utiles (iPad portrait), 209/189 (iPad paysage), 273/257 (iPad Pro) ; « 100 » déborde même en signage 1920. `--text-score` a un plancher de 120px incompatible avec `w-1/5`. Latent tant que `reprises` n'est pas alimenté, certain dès la Story 1.8. [carom-scoreboard/src/components/CenterPanel.vue:15,20-22]
- [x] [Review][Patch] `public/logo.png` fait 450 Ko en 645×645 pour un affichage en 128px — copié tel quel dans `dist/` et précaché par le service worker, soit ~73 % des 612 Ko du précache d'une PWA offline-first. [carom-scoreboard/public/logo.png]
- [x] [Review][Patch] Le caret saute en fin de champ à chaque frappe minuscule — champ contrôlé `:value` + `@input` dont la valeur normalisée diffère du DOM ; toute correction en milieu de nom devient impossible. Contre-intuitif pour la cible « 60 ans ». [carom-scoreboard/src/components/HomeScreen.vue:61-65]
- [x] [Review][Patch] `swapPlayers()` n'est gardé que par la vue, pas par l'action — appelable en `idle`/`finished` ou après une reprise, et échange les scores avec les joueurs ; `currentInput`/`isNegative` ne sont pas échangés alors que `player1`/`player2` le sont (désynchronisation garantie dès la Story 1.5). Viole l'esprit d'AR17. [carom-scoreboard/src/stores/useGameStore.ts:34-40]
- [x] [Review][Patch] `resetGame()` ne réinitialise ni `mode`, ni `targetScore`, ni `lastSaved` alors qu'il réinitialise tout le reste — une distance de jeu héritée sera silencieusement reconduite au démarrage suivant dès la Story 1.4. [carom-scoreboard/src/stores/useGameStore.ts:43-52]
- [x] [Review][Patch] `GameState` diverge d'`architecture.md` et n'est utilisé nulle part — `architecture.md` déclare désormais `targetScore: number` (ajouté par ce même lot), l'interface ne le porte pas, et aucun fichier ne l'importe. Elle diverge donc de la réalité du store dès sa première story. [carom-scoreboard/src/types/game.ts:34-45]
- [x] [Review][Patch] `as Record<GameMode, string>` sur `Object.fromEntries` ment au compilateur — ajouter un membre à l'union `GameMode` sans l'ajouter au catalogue compile sans erreur et produit un libellé vide dans `CenterPanel`. Utiliser `satisfies` ou dériver l'union du catalogue. [carom-scoreboard/src/types/game.ts:101-103]
- [x] [Review][Patch] `selectMode` n'a pas la garde de disponibilité que `selectCategory` possède — seule protection : l'attribut `disabled` du template. Dès qu'une catégorie mixera modes disponibles et non disponibles (cas prévu par le catalogue), un mode non implémenté pourra démarrer. Ajouter aussi le marqueur « BIENTÔT » au niveau mode, absent alors qu'il existe au niveau catégorie. [carom-scoreboard/src/components/HomeScreen.vue:48-51]
- [x] [Review][Patch] Aucune route catch-all — toute URL autre que `/` (favori obsolète, deep link, restauration PWA) rend un `<router-view />` vide, donc une page blanche sans issue en PWA installée. [carom-scoreboard/src/router/index.ts:6]
- [x] [Review][Patch] Deux tests ne discriminent rien — « ignores categories whose modes are all unavailable » n'assertionne que l'état initial (passerait même si le handler était débranché) ; le test de troncature à 20 caractères n'atteint le `slice(0,20)` que parce que `setValue` contourne `maxlength`, branche inatteignable en production. [carom-scoreboard/src/components/HomeScreen.test.ts:49-55,71-83]
- [x] [Review][Patch] `ActionBar.vue` est le seul composant du projet sans test co-localisé — viole AR16 / CLAUDE.md §6. Son `backLabel` par défaut et son slot `actions` ne sont couverts qu'indirectement. [carom-scoreboard/src/components/ActionBar.vue]
- [x] [Review][Patch] `h-screen`/`w-screen` → `h-dvh` — `100vh` inclut les barres de navigateur rétractables et `100vw` la largeur de scrollbar ; `html/body/#app { height: 100% }` est déjà en place. [carom-scoreboard/src/views/GameView.vue:24]
- [x] [Review][Patch] `aria-label` divergent du texte visible (« Retour » vs « RETOUR ») — l'aria-label écrase le nom accessible et crée un point de divergence (WCAG 2.5.3). Nettoyer au passage les résidus du starter Vite dans `main.css` (`a`/`a:hover` en violet `#646cff`, hors palette). [carom-scoreboard/src/components/ActionBar.vue:14,17 ; src/assets/main.css:72-79]
- [x] [Review][Patch] Amender la spec pour régulariser le bouton ANNULER (suite décision ①) — réécrire l'AC#4 de la story et d'`epics.md` ainsi qu'UX-DR11 (`epics.md` + `ux-design-specification.md`) pour autoriser explicitement ANNULER et l'interversion sur la console centrale ; ajouter à la Story 1.8 dans `epics.md` la note de périmètre manquante (« le bouton existe depuis la Story 1.3, désactivé et non branché ; cette story le branche, elle ne le crée pas »), sur le modèle des Stories 1.4, 1.15 et 2.1. Corriger aussi la Task 5.2 qui affirme encore « aucune action affectant le score ».
- [x] [Review][Patch] Documenter la règle de tour arrêtée en décision ③ — reporter dans les Dev Notes § Questions ouvertes que le tour est attaché au **côté** et non à la personne (le joueur de gauche commence, l'interversion ne change pas qui commence), et ajouter le test d'`activePlayer` après `swapPlayers` manquant dans `useGameStore.test.ts`. [carom-scoreboard/src/stores/useGameStore.test.ts]
- [x] [Review][Patch] Documenter l'échelle d'espacement retenue en décision ④ — ajouter à CLAUDE.md que `--spacing` vaut 8px (et non les 4px par défaut de Tailwind v4), donc que tout utilitaire numérique vaut le double de sa lecture naïve (`h-16` = 128px, `p-6` = 48px, `gap-4` = 32px). Sans cette note, la prochaine session dimensionnera à contresens. [carom-scoreboard/CLAUDE.md]
- [x] [Review][Patch] Documentation de story périmée après les Tasks 9 et 10 — les Tasks 1.1, 1.2, 1.6, 2.3, 2.5, 3.1→3.5, 4.4, 5.2, 6.2 et 9.5 sont cochées `[x]` tout en décrivant du code qui n'existe pas (`ModeSelector.vue` jamais livré, `PlayerColor` à 4 valeurs, tirage aléatoire des couleurs, « au moins 2 signaux non-couleur » alors que seul le liseré subsiste). La File List omet `CLAUDE.md`, `epics.md`, `ux-design-specification.md`, `architecture.md`, `prd.md`, `sprint-change-proposal-2026-09-08.md` et `sprint-status.yaml`. Le Debug Log annonce 13 tests, l'exécution en donne 22, et décrit un parcours de validation navigateur (« bouton démarrage → mode ») supprimé depuis la Task 9.4. Les Dev Notes interdisent encore `targetScore` que le code livre (régularisé dans `epics.md:384` mais pas dans la story).

#### Différés

- [x] [Review][Defer] `status === 'finished'` n'est rendu par aucune branche — écran noir sans issue (l'ActionBar QUITTER est dans la branche `playing`) ; vérifié : `body.innerText` vide. Aucun code ne pose `'finished'` aujourd'hui — appartient à la Story 1.10/1.11. [carom-scoreboard/src/views/GameView.vue:25-49] — deferred, pre-existing
- [x] [Review][Defer] `reprises` en `shallowRef` : tout `push` futur sera non réactif — trois `computed` dépendent de `reprises.value.length` ; `shallowRef` ne notifie que sur remplacement de `.value`. `reprises.value.push(...)` laissera le compteur bloqué sur 1, ANNULER grisé et l'interversion visible en pleine partie. Indétectable aujourd'hui (seules des affectations existent). Convention à graver avant la Story 1.5/1.8. [carom-scoreboard/src/stores/useGameStore.ts:11] — deferred, pre-existing
- [x] [Review][Defer] QUITTER déclenche `resetGame()` sur `@pointerdown`, sans confirmation ni annulation possible en glissant le doigt hors du bouton — note de périmètre déjà présente dans `epics.md:584`, Story 1.15. [carom-scoreboard/src/views/GameView.vue:48] — deferred, pre-existing
- [x] [Review][Defer] La branche « catégorie à mode unique passe directement à l'étape suivante » est du code mort non testé — les deux seules catégories mono-mode (`3bandes`, `casin`) sont `available: false` donc bloquées en amont. Deviendra atteignable en Story 2.1. [carom-scoreboard/src/components/HomeScreen.vue:38-43] — deferred, pre-existing
- [x] [Review][Defer] Robustesse de la normalisation des noms : `slice(0,20)` coupe les paires de substitution (emoji tronqué en surrogate orphelin, invalide en UTF-8 — impactera la persistance Story 1.12 et la base joueurs Epic 4) et `toUpperCase()` peut allonger la chaîne (`ß` → `SS`). Également : `Player.id` est un champ positionnel redondant qu'il faut restamper à chaque mutation, et l'ordre des classes Tailwind (CLAUDE.md §7) n'est pas respecté à plusieurs endroits — aucun outillage lint n'existe pour le détecter. [carom-scoreboard/src/components/HomeScreen.vue:62] — deferred, pre-existing

#### Écartés (7)

Format téléphone (hors périmètre, confirmé par Nathan — et vérifié absent dès 768px) : débordement horizontal du scoreboard à 390px ; accueil inutilisable en paysage téléphone 740×360 ; `overflow-hidden` du `main` de l'accueil. Faux positifs du Blind Hunter (qui ne voyait que le diff textuel, binaires exclus) : `logo.png` prétendu manquant et `favicon.svg` supprimé sans remplaçant (le fichier existe, `index.html` ne l'a jamais référencé, build vert) ; `--size-touch-target` prétendu non défini (`main.css:41`, 90px). `createWebHistory()` sans `BASE_URL` (aucun `base` configuré, scope `/`). `role="button"` sur les `<label>` de l'étape noms (l'ajouter serait une régression a11y sur un label d'input).


## Dev Notes

### Nature de cette story — première story de code fonctionnel

Story 1.1 (scaffold) et 1.2 (`CLAUDE.md`) n'ont produit aucun composant, store ni route. Cette story est la **première** à introduire du code métier réel : elle pose les fondations transverses de l'Epic 1 (types, premier store Pinia, premiers composants co-testés, premier routing) *en même temps* qu'elle livre la fonctionnalité de démarrage de partie. Les stories suivantes de l'Epic 1 réutiliseront ces fondations sans les recréer.

### Hors périmètre de cette story (ne pas anticiper)

- **`NumericPad.vue`** et toute logique de saisie de score fonctionnelle (haptique, overlay de saisie, validation, refus >999) — **Story 1.5**. `PlayerPanel` dans cette story affiche uniquement nom + score (statique à 0), sans pavé numérique.
- **Persistance `localStorage`** (`storageService.ts`, sauvegarde après chaque action, reprise de partie après fermeture) — **Story 1.12** exclusivement. Ne pas créer `storageService.ts` dans cette story : l'état du `GameState` reste 100% en mémoire (store Pinia), le champ `lastSaved` est peuplé en mémoire mais jamais écrit sur disque ici. Le "Given je lance l'application sans partie en cours sauvegardée" de l'AC#1 est trivialement vrai tant qu'aucune persistance n'existe — ne pas construire de logique de détection de reprise de partie par anticipation.
- **Configuration du format de match** (objectif de score, nombre de sets — FR15/FR41) — **Story 1.4**. `startGame()` ne prend aucun paramètre de format. **Amendé en Task 10.7** : le champ `targetScore` existe bien dans `useGameStore` et dans `GameState`, câblé en dur à 20 et affiché en haut à droite de chaque `PlayerPanel` ; la Story 1.4 le *pilote* (défaut par mode + configuration), elle ne le crée pas — note de périmètre correspondante dans `epics.md:384`.
- **Édition du nom en cours de partie** (tap sur le nom dans `PlayerPanel` pour le modifier — FR39, UX-DR19 appliqué à un joueur déjà en partie) — **Story 1.14**. La saisie de nom de cette story n'a lieu que dans `ModeSelector`, avant le début de la partie ; `PlayerPanel` affiche le nom en lecture seule.
- **Routes `/history` et `/history/:id`** — différées à l'Epic 3 (Stories 3.2, 3.3), quand `HistoryView`/`GameDetailView` seront réellement implémentées. Créer des vues stub vides maintenant n'apporterait aucune valeur (violerait YAGNI) ; `src/router/index.ts` ne déclare que `/` dans cette story.
- **`usePointerEvents.ts`** — réservé aux interactions complexes (long press, etc., AR8). Les boutons de cette story (mode, noms, confirmer) sont des `@pointerdown` simples et directs sur les éléments ; ne pas créer un composable inutilisé par anticipation.
- **Alternance du tour entre les deux joueurs** (logique de progression `activePlayer` après validation d'une série) — dépend de la saisie de score, donc **Story 1.5/1.6**. Cette story fixe seulement l'état initial `activePlayer = 'player1'` au démarrage et l'affiche visuellement (AC#5) ; aucune logique de bascule n'est implémentée ici.

### Écarts avec `architecture.md` — extensions justifiées du modèle de données

Le snippet `GameState`/`Player` d'`architecture.md` (L167-190) ne suffit pas à satisfaire les AC de cette story :

1. **`Player.color: PlayerColor`** (nouveau) — UX-DR2 exige une couleur "assignée par partie, jamais par position", or aucun champ couleur n'existe dans le snippet. Réutiliser directement les 4 valeurs déjà tokenisées dans `main.css` (story 1.1) : `yellow` → `bg-player-yellow`/`text-on-player-yellow`, `white` → `bg-player-white`/`text-on-player-white`, `orange` → `bg-player-orange`/`text-on-player-orange`, `magenta` → `bg-player-magenta`/`text-on-player-magenta`.
2. **`GameState.activePlayer: 'player1' | 'player2'`** (nouveau) — AC#5/UX-DR14 exigent un indicateur de tour actif, absent du snippet.

Ces deux ajouts suivent les conventions déjà actées (camelCase, PascalCase pour les types) et n'entrent en conflit avec aucune règle de `CLAUDE.md`. Si une session future de développement architecture (ex. Story 1.4) devait faire évoluer `GameState` différemment, ce fichier `types/game.ts` reste la source de vérité vivante — `architecture.md` n'est qu'un point de départ illustratif pour ce type précis (contrairement au routing ou aux conventions de nommage, qui sont, eux, prescriptifs).

### Store Pinia — pattern à suivre pour les stores futurs

`useGameStore` est le **premier** store du projet ; son pattern (setup store, id court sans préfixe `use`, `shallowRef` pour les tableaux volumineux, actions verbe+nom) sera copié par `useHistoryStore` (Epic 3) et par les stories suivantes de l'Epic 1 qui ajouteront des actions à ce même store (`addReprise`, `undoLastSeries`, etc. — ne pas les créer ici, elles n'ont pas d'AC dans cette story). Toute mutation passe exclusivement par `startGame()` — aucun composant ne doit écrire directement sur `gameStore.player1.score = ...` (AR17).

### Composants — responsabilités strictes (symétrie UX-DR9/UX-DR11)

- `PlayerPanel` : autonome, ne connaît que "son" joueur via `props.player` + `props.active`. Aucune logique partagée entre les deux instances au-delà de ce que `GameView` leur passe individuellement.
- `CenterPanel` : strictement neutre (mode + numéro de reprise). Toute tentation d'y ajouter un bouton lié au score (ex. "passer le tour") est une violation directe de l'AC#4/UX-DR11 — refuser cette approche même si elle semble plus simple à coder.
- `ModeSelector` : composant autonome avec son propre état d'étape interne (`mode` → `names`), ne lit/n'écrit le store qu'au moment de `startGame()`.

### Tests — patterns établis dans cette story

`vitest.config.ts` (happy-dom) et les dépendances (`@vue/test-utils`) sont déjà installés depuis la Story 1.1, mais **aucun test n'existe encore dans le projet** — c'est cette story qui inaugure le pattern de co-localisation (`Component.test.ts` à côté de `Component.vue`, AR16). Utiliser `wrapper.trigger('pointerdown')` de Vue Test Utils pour simuler les interactions tactiles (cohérent avec AR8 — ne pas tester via `click`). Pour `useGameStore.test.ts`, instancier un pinia frais par test (`setActivePinia(createPinia())`) avant chaque assertion. L'AC#6 (parcours < 30 secondes) est une exigence UX qualitative, pas testable unitairement de façon fiable — la valider manuellement en parcourant le flow (lancement → mode → noms → écran de jeu prêt), pas par un test automatisé de timing.

### Previous story intelligence (Stories 1.1, 1.2)

- Tokens couleur/typo/espacement déjà définis dans `carom-scoreboard/src/assets/main.css` (`@theme` Tailwind v4 CSS-first, pas de `tailwind.config.js`) — **réutiliser tel quel**, ne pas redéfinir de couleurs.
- Breakpoint `lg:` déjà surchargé à 1280px dans `main.css` (`--breakpoint-lg: 1280px`) — utiliser `lg:` normalement dans les classes Tailwind, il correspond déjà au signage/desktop voulu par l'architecture malgré la valeur par défaut Tailwind différente.
- Convention d'id de store Pinia (`defineStore('id', ...)`) non documentée dans `CLAUDE.md` (gap identifié en revue de la Story 1.2, `deferred-work.md`) — **résolue par cette story** : id court sans préfixe (`'game'` pour `useGameStore`), à répliquer pour `useHistoryStore` → `'history'` (Epic 3).
- `PWABadge.vue` doit rester monté dans `App.vue` (ne pas le supprimer en nettoyant le boilerplate — seuls `HelloWorld.vue` et les logos démo sont du boilerplate à retirer).
- Aucun outillage lint/format n'existe encore (déferré depuis Story 1.1) — respecter les conventions manuellement, `vue-tsc -b` reste le seul filet de sécurité TypeScript.

### Project Structure Notes

- Tous les nouveaux fichiers vivent sous `carom-scoreboard/src/`, conformément à l'arborescence complète d'`architecture.md` (L412-479) : `types/`, `stores/`, `components/`, `views/`, `router/`.
- Écart assumé et documenté ci-dessus : routing limité à `/` dans cette story (architecture liste 3 routes comme décision "critique", mais leur implémentation complète n'est pas requise avant que `HistoryView`/`GameDetailView` existent réellement).
- `services/` et `composables/` restent vides (`.gitkeep` conservés) — aucune AC de cette story ne les nécessite.

### Questions ouvertes (non bloquantes pour le développement)

- ~~Aucune règle produit ne précise quel joueur commence.~~ **TRANCHÉ en revue le 2026-09-08 (Nathan)** : le tour est attaché au **côté**, pas à la personne. Le joueur de gauche (bille blanche) commence, et l'interversion des billes avant la première reprise ne change pas qui commence — `swapPlayers()` déplace donc les joueurs sans toucher `activePlayer`. Comportement couvert par le test « keeps the turn on the left side when players swap » (`useGameStore.test.ts`).

### References

- [Source: epics.md#Story 1.3: Sélectionner un mode JDS et démarrer une partie (L324-354)]
- [Source: epics.md#Story 1.4 (limite de périmètre format) (L356-371)]
- [Source: epics.md#Story 1.5 (limite de périmètre NumericPad) (L372-395)]
- [Source: epics.md#Story 1.14 (limite de périmètre édition nom en partie) (L538-553)]
- [Source: epics.md#Additional Requirements — AR4-AR9, AR15-AR19, AR23 (L127-146, L171)]
- [Source: epics.md#UX Design Requirements — UX-DR2, UX-DR9, UX-DR11, UX-DR12, UX-DR14, UX-DR19 (L150, L157, L159-160, L167)]
- [Source: architecture.md#Architecture des Données — GameState/Player/Reprise (L167-213)]
- [Source: architecture.md#Architecture Frontend — Routing, Stores, Composants principaux V1a (L220-241)]
- [Source: architecture.md#Patterns de Nommage (L278-298)]
- [Source: architecture.md#Patterns de Communication Vue (L317-333)]
- [Source: architecture.md#Patterns Touch & Pointer (L335-350)]
- [Source: architecture.md#Structure du Projet — Arborescence Complète (L412-479)]
- [Source: ux-design-specification.md#Flow 1 — Démarrer une partie (L266-276)]
- [Source: ux-design-specification.md#Custom Components — PlayerPanel, ModeSelector, CenterPanel (L328-355)]
- [Source: ux-design-specification.md#Color System (L204-220)]
- [Source: prd.md#Parcours 1 — Michel, joueur de club (L156-164)]
- [Source: _bmad-output/implementation-artifacts/1-1-initialisation-du-projet.md#Hors périmètre de cette story (L74-81) — routing/stores/types explicitement différés à cette story]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#Deferred from code review of 1-2 — gap convention id de store Pinia, résolu ci-dessus]

## Change Log

| Date | Change |
|---|---|
| 2026-09-08 | Revue de code adversariale (3 couches) + vérification navigateur aux formats tablette. 4 décisions tranchées par Nathan (bouton ANNULER conservé avec spec amendée ; pas de besoin d'accessibilité clavier ; tour attaché au côté ; échelle `--spacing: 8px` conservée) et 19 correctifs appliqués. Défauts corrigés : nom de joueur vide démarrant une partie anonyme, bouton RETOUR inerte sur l'accueil, compteur de reprise débordant de la console centrale dès 2 chiffres (nouveau token `--text-reprise`), logo PWA de 450 Ko ramené à 90 Ko (précache 612 → 252 Ko), caret sautant en fin de champ à chaque frappe, `swapPlayers()` sans garde, `resetGame()` incomplet, `GameState` divergent d'`architecture.md`, union `GameMode` désormais dérivée du catalogue, `selectMode` sans garde de disponibilité, route catch-all absente, `h-screen` → `h-dvh`, résidus du starter Vite dans `main.css`. Tests : 22 → 38. |
| 2026-09-08 | Implémentation complète de la story : types `game.ts`, store `useGameStore`, composants `ModeSelector`/`PlayerPanel`/`CenterPanel`, vue `GameView`, routing `/`, câblage `main.ts`/`App.vue`, nettoyage du starter Vite. Statut → review. |
| 2026-09-08 | Seconde révision UI (retours sur captures CUESCO/Billiboard) : logo produit en header cliquable + favicon/assets PWA ; barre d'action basse permanente avec retour toujours au même endroit, y compris sur le scoreboard ; étape joueurs en deux grands panneaux portant la bille ; bloc jaune repassé en plein à chiffres noirs ; liseré rouge sur le joueur actif ; nom en haut à gauche et distance en haut à droite de chaque panneau ; console centrale élargie avec reprise en très grand, bouton annuler et interversion. Token `--color-on-player-yellow` restauré (sa suppression rendait le texte du panneau jaune illisible en blanc). |
| 2026-09-08 | Révision UI demandée par Nathan après démo : bille fixée au côté (gauche blanc/chiffres noirs, droite noir/chiffres jaunes) remplaçant l'attribution aléatoire — UX-DR2 corrigée dans les specs ; écran de veille et sélection de mode fusionnés en un `HomeScreen` façon Billiboard, sans bouton Play ; catalogue de modes étendu à 4 catégories / 10 modes ; bouton d'interversion des joueurs. Deux bugs de tokens Tailwind v4 corrigés au passage (`--font-size-*` ne génère aucun utilitaire, il faut `--text-*` ; `min-h-[--var]` doit s'écrire `min-h-[var(--var)]`) — sans quoi ni le score géant ni les zones tactiles de 90px n'étaient appliqués. |
| 2026-09-08 | Validation visuelle end-to-end dans Chrome (extension `claude-in-chrome`) : correction d'un bug bloquant AC#3 — `PlayerPanel.vue` construisait ses classes couleur via template literal (`` `bg-player-${color}` ``), invisible au scanner JIT de Tailwind v4 donc jamais généré en CSS. Remplacé par une table de correspondance à classes littérales complètes. Non détecté par les tests unitaires (happy-dom ne compile pas le CSS Tailwind). |

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5 (claude-sonnet-5)

### Debug Log References

- `npm test` (Vitest, happy-dom) : 6 fichiers de tests, 38 tests, tous verts (après revue de code du 2026-09-08 ; 5 fichiers / 22 tests avant les correctifs de revue).
- `npx vue-tsc -b` : aucune erreur TypeScript.
- `npm run build` : build de production réussi (Vite + PWA/Workbox).
- Cycle red-green appliqué pour chaque fichier testé : test écrit et exécuté en échec (import du fichier source inexistant) avant l'implémentation, puis re-exécuté au vert après.
- Validation visuelle end-to-end effectuée via l'extension Chrome (`claude-in-chrome`). **Parcours d'origine périmé depuis la Task 9.4** (il décrivait « bouton démarrage → mode », or le bouton de démarrage n'existe plus). Parcours réellement valide : accueil-veille → catégorie JEUX DE SÉRIES → mode LIBRE → étape joueurs → DÉMARRER → scoreboard. Revalidé en revue le 2026-09-08 aux formats 768×1024, 1024×768, 1366×1024 et 1920×1080. A révélé un bug non détecté par les tests unitaires : voir Change Log et Completion Notes (couleurs `PlayerPanel` absentes, corrigé). Après correctif, capture d'écran conforme à l'AC#3/#4/#5 (couleurs de fond appliquées, layout symétrique, marqueur de tour actif + opacité réduite du panneau inactif). Aucune erreur console relevée (`read_console_messages`).
- AC#6 (parcours < 30 secondes) : exigence UX qualitative non testable unitairement, validée qualitativement par le parcours manuel ci-dessus (aucune lecture de texte requise, flow direct en quelques clics).

### Completion Notes List

- Fondations transverses posées comme prévu par les Dev Notes : premiers types (`src/types/game.ts`), premier store Pinia (`useGameStore`, pattern setup store id court + `shallowRef` pour `reprises`), premiers composants co-testés (`ModeSelector`, `PlayerPanel`, `CenterPanel`), première vue (`GameView`), premier routing (`/` uniquement).
- Écarts avec `architecture.md` appliqués tels que documentés dans les Dev Notes : ajout de `Player.color` et `GameState.activePlayer`.
- Hors périmètre volontairement non implémenté (conforme aux Dev Notes) : `NumericPad`/saisie fonctionnelle, persistance `localStorage`, configuration de format de match, édition du nom en cours de partie, routes `/history*`, `usePointerEvents.ts`, logique d'alternance du tour.
- Nettoyage du starter Vite effectué (Task 8) : suppression de `HelloWorld.vue`, `vue.svg`, tous les `.gitkeep` des dossiers désormais peuplés (`types`, `stores`, `components`, `views`, `router`) ; `services/` et `composables/` conservent leur `.gitkeep` (aucune AC ne les nécessite dans cette story).
- Ajustement mineur non listé explicitement dans les tâches mais nécessaire à l'AC#1/#3 (modale et layout plein écran) : nettoyage des styles globaux hérités du starter Vite dans `main.css` (`body`/`#app` centraient le contenu avec `max-width`/`padding`, ce qui aurait empêché tout affichage plein écran). Remplacé par un simple `height: 100%` sur `html, body, #app`. Aucune règle de couleur/typo/spacing existante (tokens `@theme` de la Story 1.1) n'a été touchée.
- `activePlayer` initial fixé arbitrairement à `'player1'`, conformément à l'hypothèse documentée dans les Dev Notes § Questions ouvertes (à confirmer avec le PO ultérieurement, sans impact sur cette story).
- Rationalisation des modes (révision UI) : le catalogue `GAME_CATEGORIES` ne déclare que ce dont l'accueil a besoin (id, libellé, sous-titre, disponibilité). Les particularités de score de chaque mode (chrono 3 Bandes, barème Quilles, pattes Casin) restent **hors** du catalogue tant que chaque mode n'a pas sa story — le PRD les documente comme "à définir"/"hors scope V1". Les 6 jeux de séries sont marqués disponibles car ils partagent exactement la même mécanique de saisie ; seule la distance de jeu les distingue, ce que traitera la Story 1.4.
- Bug corrigé suite à la validation visuelle finale : `PlayerPanel.vue` générait ses classes de couleur (`bg-player-{color}`/`text-on-player-{color}`) via un template literal dynamique, invisible au scanner JIT de Tailwind v4 (qui a besoin de la classe complète littérale dans le source pour la générer) — les panneaux joueurs s'affichaient donc sans aucune couleur de fond, en contradiction directe avec l'AC#3/UX-DR2. Remplacé par une `Record<PlayerColor, string>` à classes littérales complètes. Corrigé avant passage en review ; taille du CSS buildé passée de 8.56 kB à 9.09 kB, confirmant la génération effective des classes.

### File List

- `carom-scoreboard/src/types/game.ts` (nouveau)
- `carom-scoreboard/src/stores/useGameStore.ts` (nouveau)
- `carom-scoreboard/src/stores/useGameStore.test.ts` (nouveau)
- `carom-scoreboard/src/components/HomeScreen.vue` (nouveau — remplace `ModeSelector.vue`)
- `carom-scoreboard/src/components/ActionBar.vue` (nouveau)
- `carom-scoreboard/public/logo.png` (nouveau — logo produit recadré depuis `explore/resources/image.png`)
- `carom-scoreboard/public/favicon.ico`, `apple-touch-icon-180x180.png`, `pwa-*.png`, `maskable-icon-512x512.png` (régénérés depuis le logo)
- `carom-scoreboard/public/favicon.svg` (supprimé — ancien logo Vite)
- `carom-scoreboard/pwa-assets.config.ts` (modifié — source des assets = `public/logo.png`)
- `carom-scoreboard/src/components/HomeScreen.test.ts` (nouveau — remplace `ModeSelector.test.ts`)
- `carom-scoreboard/src/components/PlayerPanel.vue` (nouveau)
- `carom-scoreboard/src/components/PlayerPanel.test.ts` (nouveau)
- `carom-scoreboard/src/components/CenterPanel.vue` (nouveau)
- `carom-scoreboard/src/components/CenterPanel.test.ts` (nouveau)
- `carom-scoreboard/src/views/GameView.vue` (nouveau)
- `carom-scoreboard/src/views/GameView.test.ts` (nouveau)
- `carom-scoreboard/src/router/index.ts` (nouveau)
- `carom-scoreboard/src/main.ts` (modifié — câblage Pinia + Router)
- `carom-scoreboard/src/App.vue` (modifié — remplacement du contenu démo par `<router-view />`)
- `carom-scoreboard/src/assets/main.css` (modifié — nettoyage des styles hérités du starter Vite en conflit avec un layout plein écran)
- `carom-scoreboard/src/components/HelloWorld.vue` (supprimé)
- `carom-scoreboard/src/assets/vue.svg` (supprimé)
- `carom-scoreboard/src/types/.gitkeep` (supprimé)
- `carom-scoreboard/src/stores/.gitkeep` (supprimé)
- `carom-scoreboard/src/components/.gitkeep` (supprimé)
- `carom-scoreboard/src/views/.gitkeep` (supprimé)
- `carom-scoreboard/src/router/.gitkeep` (supprimé)
- `carom-scoreboard/src/components/ActionBar.test.ts` (nouveau — ajouté en revue de code, AR16)
- `carom-scoreboard/CLAUDE.md` (modifié — règle 8 de validation IA, puis règle 7 sur l'échelle d'espacement ajoutée en revue)
- `_bmad-output/planning-artifacts/epics.md` (modifié — UX-DR2 en Task 9.8, puis UX-DR11/AC#4 amendés et note de périmètre Story 1.8 ajoutée en revue)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (modifié — UX-DR2 en Task 9.8, puis rôle de `CenterPanel` amendé en revue)
- `_bmad-output/planning-artifacts/architecture.md` (modifié — `targetScore` ajouté à `GameState`, via le change proposal)
- `_bmad-output/planning-artifacts/prd.md` (modifié — via le change proposal)
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-08.md` (nouveau)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié — statut de la story)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modifié — différés de la revue de code)
