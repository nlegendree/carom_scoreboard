# Story 2.1: Sélectionner le mode 3 Bandes et démarrer une partie avec chronomètre actif

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

> **Cadrage (bmad-create-story, 2026-09-10)** — première story d'Epic 2, isolée de V1a (AR14). L'epic ne donne que 3 AC (timer actif dès la première reprise, affichage rouge LED sur fond noir, pause/reprise « fondation arbitre déporté »). Revu une première fois avec Nathan (retrait de la pause, choix visuel), cinq décisions rendent la story implémentable telle quelle :
> 1. **Le déverrouillage de la catégorie est littéralement un changement d'un booléen.** `selectCategory()`/`selectMode()` de `HomeScreen.vue` gèrent déjà une catégorie à mode unique (le cas de `3bandes`, un seul mode dans son tableau) exactement comme elles le font pour n'importe quel mode JDS — même passage direct à l'étape joueurs, même `PlayerSetupModal`, même règle de distance obligatoire (supersession de la 1.10, qui ne distingue pas les modes). Basculer `available: true` sur l'entrée `3bandes` du catalogue (`types/game.ts`) suffit à ouvrir tout le parcours de démarrage — confirmé en lisant le code, pas seulement la note de périmètre de l'epic.
> 2. **Durée du chrono : 40 secondes**, sourcée de `ux-design-specification.md` l. 56 (« reset du chrono de tir (40s) »), pas inventée. Aucune autre valeur n'existe dans les specs.
> 3. **Le timer n'est PAS persisté** dans `GameState` : `AR14` l'isole explicitement (« isolé du périmètre V1a »), et rien dans l'architecture n'ajoute de champ chrono à `GameState`/`GameSnapshot`. Un rechargement (Story 1.12) restaure la partie 3 Bandes normalement, mais le chrono repart à 40s — il n'y a pas de règle produit qui impose de le figer à la seconde où la fermeture a eu lieu. Décision assumée, à confirmer au rendu si Nathan la juge insuffisante (point ouvert en fin de story).
> 4. **Pause/reprise retirée du périmètre (retour de Nathan, 2026-09-10).** L'AC de l'epic évoquait une « fondation pour l'arbitre déporté V2 », mais la pause n'a de sens qu'en compétition arbitrée — à l'entraînement, un chrono qui continue pendant une interruption est sans conséquence. Nathan situe ce besoin dans une **future épic Compétition/Arbitrage** (proche d'Epic 7), pas dans V1b. `useTimer.ts` ne porte donc **aucune** fonction pause/reprise : ni `pauseTimer()`, ni `resumeTimer()`, ni état `isPaused`. Consigné dans `deferred-work.md` (Task 5) pour ne pas le perdre.
> 5. **Affichage circulaire, pas la barre segmentée du Billiboard.** Nathan a comparé deux références physiques (`explore/resources/`) : le Billiboard (`IMG_6459.JPG`, `IMG_6151.JPG`, `IMG_9450.JPG`) affiche un petit chiffre digital (« 00:20 ») **plus** une barre horizontale segmentée (une dizaine de blocs jaune→rouge) — jugée « pas assez smooth », l'œil voit des paliers, pas un mouvement continu. Le CUESCO (`IMG_6034.JPG`, écran « SHOT CLOCK ») affiche à la place un **anneau circulaire plein** qui se vide progressivement autour d'un chiffre central — « permet d'afficher vraiment la barre en entier », rien n'est coupé ni comprimé dans une colonne étroite. La story retient la **forme circulaire** de CUESCO, mais **pas ses couleurs** (bleu) : `--color-alert` reste rouge sur fond noir, conforme à UX-DR4 (« rouge LED sur fond noir »), déjà actée pour ce composant. Nouveau composant dédié `ShotClock.vue` (Task 3), pas un bloc texte dans `CenterPanel.vue`.
>
> **Pour information, hors périmètre de CETTE story (Story 2.2 à venir) : le chrono se réinitialise aussi au tap +1 et au changement de joueur.** Nathan précise que la remise à 40s n'a pas lieu qu'au tap +1 (déjà anticipé par `resetTimer()`, Task 2) mais **aussi** quand la main passe à l'adversaire (bascule de tour), avec un **petit délai de grâce de 3s supplémentaires** après l'une ou l'autre action — mécanisme non précisé plus avant (buffer ajouté au reset ? fenêtre avant le vrai décompte ?). Cette story (2.1) n'a **aucune** intégration avec le tap +1 ni la bascule de tour — c'est tout le sujet de la Story 2.2, qui n'existe pas encore. La décision est consignée telle quelle dans `epics.md` › Story 2.2 (Task 5) pour que sa création future en parte, sans être devinée ni implémentée ici.
>
> **Hors périmètre, notée mais non traitée : le nombre de sets.** `epics.md` (note de périmètre de cette même story) signale que la configuration du nombre de sets — retirée de la Story 1.4 — « demande son propre point d'entrée, à définir avec cet Epic », mais **aucune des trois stories d'Epic 2** (2.1, 2.2, 2.3) ne porte d'AC dessus. C'est un vrai trou de planification, pas un oubli de cette story : ni l'UX (aucune maquette de réglage de sets) ni l'architecture n'en disent plus. Cette story n'y touche pas ; elle est consignée dans `deferred-work.md` (Task 5) comme point ouvert pour une future story.

## Story

As a joueur,
I want sélectionner le mode 3 Bandes au démarrage d'une partie,
So that je joue avec un chronomètre de série toujours actif, cohérent avec les règles officielles (FR13, AR14).

## Acceptance Criteria

### Déverrouillage et démarrage

1. **Given** l'écran d'accueil `HomeScreen` **When** j'observe la catégorie « 3 BANDES » **Then** elle n'est plus marquée « BIENTÔT » et n'est plus grisée — le mode `3bandes` du catalogue (`types/game.ts`) porte `available: true`.
2. **Given** la catégorie « 3 BANDES » (un seul mode) **When** je la sélectionne **Then** je passe directement à l'étape joueurs (comme toute catégorie à mode unique, `selectCategory()` inchangée) — pas d'étape mode intermédiaire.
3. **Given** l'étape joueurs pour une partie 3 Bandes **When** je démarre sans avoir réglé une distance **Then** la même pop-up « DISTANCE MANQUANTE » qu'en JDS s'affiche (règle globale de la 1.10, non spécifique à un mode) — aucune exception 3 Bandes n'existe pour la distance.
4. **Given** les deux distances réglées **When** je confirme **Then** `startGame('3bandes', …)` démarre la partie exactement comme n'importe quel mode JDS (mêmes panneaux, mêmes couleurs, même console centrale) — Epic 2 ne modifie ni `PlayerPanel` ni le flux de saisie du score.

### Chronomètre actif

5. **Given** une partie 3 Bandes qui vient de démarrer (reprise 1) **When** `GameView` affiche le scoreboard **Then** un compte à rebours démarre immédiatement à 40 secondes et décrémente d'une seconde chaque seconde, sans action requise du joueur (FR13, AR14).
6. **Given** le chronomètre en cours **When** je consulte l'écran **Then** le temps restant est affiché dans la console centrale (`CenterPanel`) sous la forme d'un **anneau circulaire** (`ShotClock.vue`) qui se vide progressivement — fond **noir**, arc et chiffre central en **rouge LED** (`--color-alert`, `#FF3B30`) — cohérent avec l'esthétique d'alerte/urgence (UX-DR4) et inspiré du « SHOT CLOCK » circulaire du CUESCO plutôt que de la barre segmentée du Billiboard (cadrage 5). Le composant est **absent** dans tous les autres modes (JDS) : `CenterPanel` ne l'affiche que si le mode de la partie en cours est `3bandes`.
7. **Given** le chronomètre atteint 0 **When** aucune autre action ne l'a arrêté ou réinitialisé **Then** l'affichage se fige à `0`, anneau entièrement vidé — aucune pénalité, aucun changement de tour, aucune saisie forcée : cette story ne porte aucune règle de faute au temps (hors périmètre, non spécifié par FR13/FR14).
8. **Given** une partie 3 Bandes qui redémarre sur place (`RECOMMENCER`, Story 1.15) ou une revanche (`UNE PARTIE DE PLUS`) **When** la nouvelle partie démarre **Then** le chronomètre repart de 40 secondes, anneau plein — jamais la valeur laissée par la partie précédente.
9. **Given** une partie 3 Bandes en cours **When** je quitte vers l'accueil (`FIN DE PARTIE` du récap, ou sortie confirmée) ou que le mode n'est pas `3bandes` **Then** le décompte s'arrête complètement — aucun intervalle ne continue à tourner en arrière-plan (pas de fuite, testable par l'absence de tick après la sortie).
10. **Given** le code livré **When** je lis les specs **Then** `epics.md`, `architecture.md`, `ux-design-specification.md` et `deferred-work.md` portent des notes datées documentant la durée (40s), la non-persistance du timer, le retrait de la pause/reprise du périmètre (reportée à une future épic Compétition/Arbitrage), et le trou de planification « nombre de sets » (Task 5).

## Tasks / Subtasks

- [x] **Task 1 — Déverrouiller la catégorie 3 Bandes (AC: 1, 2, 3, 4)**
  - [x] 1.1 `src/types/game.ts` : sur l'entrée `{ id: '3bandes', label: '3 BANDES', available: false }` du catalogue (l. 42), passer `available` à `true`. Rien d'autre ne change dans ce fichier — pas de nouveau champ, pas de nouveau type (le mode `'3bandes'` existe déjà dans l'union `GameMode`).
  - [x] 1.2 Aucun changement dans `HomeScreen.vue` ni `PlayerSetupModal.vue` : `selectCategory()` (catégorie à mode unique → étape joueurs directe), la règle de distance obligatoire (1.10) et `startGame()` sont déjà génériques par rapport au mode.
  - [x] 1.3 `HomeScreen.test.ts` : ajouter un test qui sélectionne `category-3bandes` et vérifie le passage direct à `step-players` (même recette que `goToPlayersStep` existant sur un mode JDS à catégorie unique), pour couvrir explicitement le déverrouillage — le test existant `marks categories whose modes are all unavailable as disabled` continue de cibler `quilles`, inchangé.

- [x] **Task 2 — `useTimer.ts` : composable du chronomètre de série (AC: 5, 7, 8, 9)**
  - [x] 2.1 Créer `src/composables/useTimer.ts` (exports nommés, AR15) :
    - `export const SHOT_CLOCK_SECONDS = 40` (cadrage 2, sourcé `ux-design-specification.md` l. 56).
    - `export function useTimer()` — appelé une fois dans `GameView.vue` (pas dans `App.vue` : contrairement à `useSpeech`/`usePwaUpdate`, sa valeur alimente directement un prop de template, cf. Task 3).
    - Interne : `const gameStore = useGameStore(); const { status, mode, startedAt } = storeToRefs(gameStore)`.
    - État réactif retourné : `const secondsRemaining = ref(SHOT_CLOCK_SECONDS)` — **aucun état de pause** (cadrage 4, retiré du périmètre).
    - `let intervalId: ReturnType<typeof setInterval> | undefined` (variable de module du composable, comme `usePwaUpdate`).
    - `function stopInterval(): void { clearInterval(intervalId); intervalId = undefined }`.
    - `function tick(): void { if (secondsRemaining.value <= 0) { stopInterval(); return }; secondsRemaining.value -= 1; if (secondsRemaining.value <= 0) stopInterval() }` — le décompte s'arrête de lui-même à 0 (AC7), pas de valeur négative.
    - `function startInterval(): void { stopInterval(); intervalId = setInterval(tick, 1000) }`.
    - `function resetTimer(): void { secondsRemaining.value = SHOT_CLOCK_SECONDS; startInterval() }` — **exportée** : ne sert à rien dans CETTE story (rien ne l'appelle sauf le watcher interne), mais c'est la primitive que la Story 2.2 branchera sur le tap +1 et la bascule de tour (« le chronomètre … est réinitialisé à sa valeur de départ », cf. note de cadrage sur les futurs déclencheurs). Ne pas la garder privée : c'est exactement le point d'extension attendu par AR14.
    - `watch([status, mode, startedAt], () => { if (status.value === 'playing' && mode.value === '3bandes') { resetTimer() } else { stopInterval(); secondsRemaining.value = SHOT_CLOCK_SECONDS } }, { immediate: true })` — **trois dépendances, pas une seule** : `startedAt` seul rate la transition `finished`/`idle` (`finishGame()`/`resetGame()` ne touchent pas `startedAt`), `status` seul rate un `restartGame()`/`rematch()` qui reste sur `'playing'` sans jamais repasser par `'idle'` (le `watch` ne se redéclenche pas sur une valeur inchangée) — `startedAt` change, lui, à **chaque** `startGame()` interne (`Date.now()`), y compris pour `restartGame`/`rematch`/`resumeGame`. C'est ce triplet qui couvre AC5, AC8 et AC9 sans code spécifique à chaque bouton.
    - `onScopeDispose(() => stopInterval())` — déclaré de façon **synchrone** dans le corps du composable (piège consigné en 1.13/1.16, jamais dans un callback).
    - `return { secondsRemaining, resetTimer }`.
  - [x] 2.2 Tests `useTimer.test.ts` (`setActivePinia(createPinia())` en `beforeEach`, `vi.useFakeTimers()`/`vi.useRealTimers()` comme `ScoreEntryModal.test.ts`, exécuter `useTimer()` dans un `effectScope()` et `scope.stop()` en fin de test pour vérifier le désabonnement) :
    - hors partie (`idle`) : `secondsRemaining === 40`, aucun tick même après `vi.advanceTimersByTime(5000)`.
    - `startGame('3bandes', …)` : `secondsRemaining` démarre à 40 et descend à 39 après 1000ms, à 35 après 5000ms (AC5).
    - `startGame('libre', …)` (JDS) : `secondsRemaining` reste à 40, aucun tick après 5000ms (le chrono n'existe pas hors 3 Bandes).
    - descente jusqu'à 0 : `vi.advanceTimersByTime(40000)` → `secondsRemaining === 0` ; `vi.advanceTimersByTime(5000)` de plus → toujours `0`, jamais négatif (AC7).
    - `store.restartGame()` (après quelques séries) sur une partie 3 Bandes à `secondsRemaining === 12` → repasse à `40` immédiatement (AC8) ; idem `store.rematch()` après `finishGame()`.
    - `store.finishGame()` puis `vi.advanceTimersByTime(5000)` → `secondsRemaining` reste figé (arrêté, pas de tick) — AC9.
    - `store.resetGame()` (retour accueil) sur une partie 3 Bandes en cours → `secondsRemaining` retombe à `40`, aucun tick ensuite (AC9).
    - `resetTimer()` appelée directement (simulant le futur tap +1/bascule de tour de 2.2) sur un chrono à `7` → revient à `40` et continue de décompter (prépare 2.2 sans le construire).
    - `scope.stop()` puis `store.startGame('3bandes', …)` et avance de temps → aucun tick (désabonnement propre, pas de fuite d'intervalle entre tests).

- [x] **Task 3 — `ShotClock.vue` : anneau circulaire, et branchement dans `CenterPanel` (AC: 6, 7, 8)**
  - [x] 3.1 Créer `src/components/ShotClock.vue` — composant dédié (pas un bloc texte dans `CenterPanel.vue`, cadrage 5) :
    ```vue
    <script setup lang="ts">
    import { computed } from 'vue'

    const props = defineProps<{ secondsRemaining: number; totalSeconds: number }>()

    // Anneau SVG classique (cercle + `stroke-dasharray`/`stroke-dashoffset`), inspiré du
    // « SHOT CLOCK » circulaire du CUESCO (cadrage 5) — pas de librairie, cohérent avec les
    // icônes SVG inline déjà présentes dans GameView.vue.
    const RADIUS = 42
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS

    const dashoffset = computed(() => {
      const ratio = Math.max(0, Math.min(1, props.secondsRemaining / props.totalSeconds))
      return CIRCUMFERENCE * (1 - ratio)
    })
    </script>

    <template>
      <div data-testid="shot-clock" class="flex w-full flex-col items-center gap-1">
        <span data-testid="shot-clock-label" class="text-stat text-alert/70">CHRONO</span>
        <div
          class="relative flex aspect-square w-full items-center justify-center rounded-full bg-black"
          role="img"
          :aria-label="`Chronomètre de série : ${secondsRemaining} secondes restantes`"
        >
          <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke-width="8" class="stroke-alert/20" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke-width="8"
              stroke-linecap="round"
              class="stroke-alert transition-[stroke-dashoffset] duration-1000 ease-linear"
              :style="{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashoffset }"
            />
          </svg>
          <span data-testid="shot-clock-value" class="text-reprise leading-none font-black tabular-nums text-alert">{{ secondsRemaining }}</span>
        </div>
      </div>
    </template>
    ```
    L'anneau se vide en tournant dans le sens horaire depuis midi (`-rotate-90` sur le `<svg>` fait partir le tracé du haut) ; la transition CSS `duration-1000 ease-linear` synchronisée sur le tick d'une seconde (`useTimer.ts`) donne un mouvement continu entre deux paliers — c'est précisément ce qui manque à la barre segmentée du Billiboard (cadrage 5). `text-reprise` (déjà dimensionné pour la colonne `w-1/5`) porte le chiffre central, comme le compteur REP. `stroke-alert`/`bg-black` : `--color-alert` (`#FF3B30`) est **déjà scaffoldé depuis la Story 1.1** (`main.css`, commentaire « réservé au chrono UX-DR4 ») — ne pas le confondre avec `--color-on-alert` (texte noir sur fond rouge plein), qui n'est **pas** utilisé ici : UX-DR4 demande explicitement du rouge sur fond **noir**. `bg-black` littéral (pas `bg-bg`, qui vaut `#0D1117`, un gris-bleu très sombre mais pas noir).
  - [x] 3.2 `src/components/ShotClock.test.ts` : `secondsRemaining: 40, totalSeconds: 40` → `stroke-dashoffset` à `0` (anneau plein) ; `secondsRemaining: 0` → `stroke-dashoffset` à la circonférence complète (anneau vide) ; `secondsRemaining: 20, totalSeconds: 40` → `stroke-dashoffset` à la moitié de la circonférence ; le chiffre central (`shot-clock-value`) affiche toujours `secondsRemaining` tel quel, y compris `0` ; `aria-label` contient la valeur courante.
  - [x] 3.3 `CenterPanel.vue` : ajouter la prop `secondsRemaining: number | null` (`defineProps<{ repriseNumber: number; canUndo: boolean; secondsRemaining: number | null }>()`) et importer `SHOT_CLOCK_SECONDS` depuis `../composables/useTimer`. Sous le bloc REP existant et **avant** le bouton `ANNULER` (le composant est un `flex-col`, l'ajout empile simplement un troisième bloc, pas de contrainte 90×90px comme la colonne de pictos de la barre basse en 1.16) : `<ShotClock v-if="secondsRemaining !== null" :secondsRemaining="secondsRemaining" :totalSeconds="SHOT_CLOCK_SECONDS" />`.
  - [x] 3.4 `CenterPanel.test.ts` : ajouter `secondsRemaining: null` à `baseProps` (défaut JDS). Nouveaux tests : `secondsRemaining` à `null` → `ShotClock` absent (`findComponent({ name: 'ShotClock' })`) ; `secondsRemaining` à `40` → présent, reçoit `secondsRemaining: 40` et `totalSeconds: 40` en props ; `secondsRemaining` à `0` → toujours monté (pas de disparition du composant) ; le bloc REP et les boutons existants restent inchangés (non-régression des tests déjà verts).

- [x] **Task 4 — Brancher `useTimer` dans `GameView` (AC: 5, 6, 8, 9)**
  - [x] 4.1 `GameView.vue` : `import { useTimer } from '../composables/useTimer'` ; `const { secondsRemaining } = useTimer()` (`resetTimer` n'est pas consommée par cette story — c'est le point d'extension de la Story 2.2).
  - [x] 4.2 Template : `<CenterPanel :repriseNumber="repriseNumber" :canUndo="canUndo" :secondsRemaining="mode === '3bandes' ? secondsRemaining : null" @undo="undoLastAction" @swap-players="swapPlayers" />` — le filtrage par mode est fait ici (pas dans le composable ni dans `CenterPanel`, qui restent l'un et l'autre génériques) : `useTimer` tourne pour toute partie mais ne décompte que si `mode === '3bandes'` (Task 2), et `GameView` ne transmet la valeur à l'affichage que dans ce même cas — double garde volontaire, cohérente avec le fait que `secondsRemaining` du composable vaut `40` (valeur de repos) hors 3 Bandes plutôt que `null`.
  - [x] 4.3 `GameView.test.ts` : nouveau `describe('GameView — chronomètre 3 Bandes')` (`vi.useFakeTimers()`/`vi.useRealTimers()` en `beforeEach`/`afterEach`, comme les blocs « auto-validation » existants) :
    - démarrer une partie `3bandes` (deux distances réglées, comme le test « home → game » existant mais avec `category-3bandes` → passage direct à `step-players`) → `shot-clock` présent, valeur `40` ; après `vi.advanceTimersByTime(3000)` → `37`.
    - démarrer une partie `libre` (JDS) → `shot-clock` absent, même après avance de temps.
    - `RECOMMENCER` (`restart-button` puis confirmation) sur une partie 3 Bandes à `secondsRemaining < 40` → revient à `40` après confirmation.
    - sortie vers l'accueil (`FIN DE PARTIE` sans série, ou récap → `FIN DE PARTIE`) puis avance de temps → aucune ré-apparition, aucun effet observable (le composant `CenterPanel` n'est plus monté, mais l'intervalle du composable ne doit pas non plus tourner dans le vide — couvert directement par `useTimer.test.ts`, ce test-ci vérifie seulement l'absence de `shot-clock` après sortie).

- [x] **Task 5 — Specs, retrait de la pause et trous de planification (AC: 10)**
  - [x] 5.1 `epics.md` › Story 2.1 : note datée (catégorie déverrouillée par un booléen, chrono 40s non persisté, pause/reprise retirée du périmètre — reportée à une future épic Compétition/Arbitrage, affichage circulaire inspiré du CUESCO plutôt que la barre segmentée du Billiboard) ; AR14 → « livré en 2.1 (`useTimer.ts`, `ShotClock.vue`) ».
  - [x] 5.1bis `epics.md` › Story 2.2 (à venir) : ajouter une note datée 2026-09-10, sourcée « décision de Nathan » — le chrono se réinitialise non seulement au tap +1 mais aussi au changement de joueur (bascule de tour), avec un petit délai de grâce de 3s supplémentaires après l'une ou l'autre action ; mécanisme exact non précisé, à trancher à la création de la Story 2.2. Ne rien implémenter ici, seulement consigner pour que la future création de story en parte.
  - [x] 5.2 `architecture.md` : « Arborescence » → `composables/useTimer.ts`, `components/ShotClock.vue` (retirer la mention « hors scope V1a » de la l. 617, devenue caduque) ; « Gaps Identifiés » si `useTimer.ts` y figurait → « livré en 2.1 » ; « Mapping Exigences → Fichiers » FR13/FR14 → `types/game.ts` (catalogue), `useTimer.ts`, `ShotClock.vue`, `CenterPanel.vue`.
  - [x] 5.3 `ux-design-specification.md` : fiche `CenterPanel` → note *Story 2.1* (anneau circulaire `ShotClock`, fond noir/rouge, présent uniquement en 3 Bandes, sous REP — référence visuelle CUESCO `explore/resources/IMG_6034.JPG`, barre segmentée Billiboard écartée).
  - [x] 5.4 `deferred-work.md` : nouvelle entrée « Deferred from: bmad-create-story 2-1 » avec **trois** points — (a) **pause/reprise du chronomètre** : retirée du périmètre V1b sur décision de Nathan (2026-09-10), à reprendre dans une future épic Compétition/Arbitrage (proche d'Epic 7) si le besoin se confirme ; (b) **trou de planification « nombre de sets »** : `epics.md` signale depuis la Story 1.4 que la configuration du nombre de sets (FR15) doit trouver « son propre point d'entrée » dans Epic 2, mais aucune des trois stories (2.1, 2.2, 2.3) ne le couvre ; aucune maquette UX n'existe ; (c) **non-persistance du chrono** (cadrage 3) — si un rechargement en pleine partie 3 Bandes s'avère gênant en usage réel (tablette qui recharge après une mise à jour PWA pendant le jeu, Story 1.13/1.12), envisager d'ajouter le chrono à `GameState` (incrémente `GAME_STORAGE_VERSION`).
  - [x] 5.5 `sprint-status.yaml` → `in-progress` au démarrage du dev, `review` en fin ; `epic-2` déjà passé `in-progress` par cette création de story (première story de l'epic).

- [x] **Task 6 — Passe visuelle unique (CLAUDE.md §9)** : une fois toutes les tâches vertes, `npm run dev` + extension Claude for Chrome, harnais iframe (`public/_viewport-harness.html`) pour 1024×768 et 768×1024, démarrer une partie 3 Bandes depuis l'accueil (catégorie visible et active, passage direct joueurs, distance obligatoire identique au JDS) ; observer l'anneau `ShotClock` (fond noir, arc et chiffre rouges, sous REP, ne déborde pas de la colonne `w-1/5`) se vider en continu au fil des secondes — vérifier que le mouvement est perçu comme fluide (transition CSS, pas de saut brusque), contrairement à la barre segmentée écartée (cadrage 5) ; vérifier son absence sur une partie JDS ; `RECOMMENCER` remet l'anneau plein ; sortie vers l'accueil fait disparaître le composant. Supprimer le harnais en fin de passe.

- [x] **Task 7 — Qualité** : `npm test`, `npx vue-tsc -b`, `npm run build` verts ; aucune régression sur les **428 tests / 15 fichiers** de départ (vérifiés le 2026-09-10) ; aucune dépendance ajoutée (le chrono est un `setInterval` natif) ; aucun harnais résiduel.

## Dev Notes

### Décisions de cadrage (bmad-create-story, 2026-09-10)

1. Déverrouillage = un booléen (`available: true`), tout le reste du parcours de démarrage est déjà générique au mode — vérifié en lisant `HomeScreen.vue`, pas supposé depuis la note de l'epic.
2. Chrono = 40 secondes, sourcé `ux-design-specification.md` l. 56 — aucune autre durée n'existe dans les specs, pas de valeur inventée.
3. Chrono NON persisté dans `GameState` (AR14 l'isole explicitement) — un rechargement en cours de partie 3 Bandes fait repartir le chrono à 40s. Point ouvert si Nathan le juge insuffisant à l'usage (Task 5.4).
4. **Pause/reprise retirée du périmètre** (retour de Nathan, 2026-09-10) — utile en compétition arbitrée, pas à l'entraînement ; reportée à une future épic Compétition/Arbitrage. `useTimer.ts` n'expose ni `pauseTimer`, ni `resumeTimer`, ni `isPaused`.
5. **Affichage circulaire** (`ShotClock.vue`), inspiré du « SHOT CLOCK » du CUESCO (`explore/resources/IMG_6034.JPG`) — écarté : la barre segmentée du Billiboard (`IMG_6459.JPG`), jugée « pas assez smooth » par Nathan. Couleurs du projet conservées (rouge/noir, UX-DR4), pas celles du CUESCO (bleu).
6. « Nombre de sets » (FR15) : **trou de planification hérité de l'epic**, non traité par cette story ni par aucune des deux suivantes (2.2, 2.3) — consigné, pas résolu (Task 5.4).
7. Pour information, non traité ici : le chrono se réinitialisera aussi au changement de joueur (pas seulement au tap +1), avec 3s de grâce supplémentaires — décision de Nathan consignée dans `epics.md` › Story 2.2 pour la création future de cette story (Task 5.1bis).

### Ce que cette story NE fait PAS

- Aucune règle de jeu 3 Bandes : ni incrémentation point par point (Story 2.2), ni saisie globale backup (Story 2.3), ni reset du chrono au tap ou au changement de joueur. `resetTimer()` est exposée pour 2.2, mais rien dans 2.1 ne l'appelle en dehors du démarrage/redémarrage de partie.
- Aucune pénalité, faute au temps ou action forcée quand le chrono atteint 0 — il se fige, c'est tout.
- **Aucune pause/reprise du chronomètre**, ni fonction ni bouton — retirée du périmètre (cadrage 4), reportée à une future épic Compétition/Arbitrage.
- Aucune configuration du nombre de sets, aucune modale ou point d'entrée pour ce réglage.
- Aucune règle de reprise égalisatrice spécifique au 3 Bandes (notée dans `ux-design-specification.md` comme « un réglage de l'Epic 2 », non plus précisée) : la logique de fin de partie générique du store (`checkEndOfGame`, 1.10) s'applique telle quelle, sans adaptation.
- Aucun changement à `PlayerPanel`, `ScoreEntryModal`, `GameSummary` ni au flux de saisie du score : une partie 3 Bandes utilise aujourd'hui exactement le même pavé numérique qu'une partie JDS (Story 2.3 documentera ce réemploi, ne le construit pas).
- Aucun champ ajouté à `GameState`/`GameSnapshot`/`GAME_STORAGE_VERSION`.

### État du code au démarrage

| Fichier | Aujourd'hui | Ce que la story y fait |
|---|---|---|
| `src/types/game.ts` (164 l.) | Catalogue `CATALOG` avec `3bandes` → `available: false` (l. 42) ; types `GameMode`/`GameCategoryId` dérivés du catalogue | `available: false` → `true`, une ligne |
| `src/components/HomeScreen.vue` | `selectCategory()` gère déjà les catégories à mode unique → étape joueurs directe ; distance obligatoire générique (1.10) | **inchangé** |
| `src/components/CenterPanel.vue` (49 l.) | `repriseNumber`, `canUndo` en props ; bloc REP + boutons ANNULER/ÉCHANGER en `flex-col` | `+ secondsRemaining: number \| null`, `<ShotClock>` conditionnel |
| `src/views/GameView.vue` (472 l.) | `CenterPanel` reçoit déjà `repriseNumber`/`canUndo` ; aucune dépendance au mode dans le template hors affichage | `+ useTimer()`, `+ :secondsRemaining` sur `CenterPanel` |
| `src/composables/usePwaUpdate.ts` (80 l.) | Composable avec `intervalId` en variable de module, `onScopeDispose` synchrone, `watch` multi-source avec `immediate` | **modèle direct** de `useTimer.ts` (intervalle, cleanup, watch) |
| `src/composables/useHaptics.ts` | Composable minimal sans état, garde de présence | référence de style (exports nommés, pas de classe) |
| `src/App.vue` (9 l.) | `usePwaUpdate()` seul | **inchangé** — `useTimer()` est appelé dans `GameView.vue`, pas ici (sa valeur alimente un prop de template) |
| `src/components/ScoreEntryModal.vue`/`.test.ts` | `setTimeout` pour l'auto-validation 3s, testé avec `vi.useFakeTimers()`/`advanceTimersByTime` | **modèle** du test à `setInterval` de `useTimer.test.ts` |
| `src/stores/useGameStore.ts` (~748 l.) | `startGame()` pose `startedAt = Date.now()` à chaque appel (y compris `restartGame`/`rematch`/`resumeGame`, qui délèguent tous à `startGame`) ; `finishGame()`/`resetGame()` ne touchent PAS `startedAt` | **inchangé** — `useTimer` s'y abonne en lecture seule (`storeToRefs`) |

### Pièges à ne pas rejouer (revues 1.3 → 1.16)

- **`restartGame()`/`rematch()` ne repassent jamais par `status: 'idle'`** : un `watch` sur `status` seul ne se redéclenche pas si la valeur ne change pas. D'où le triplet `[status, mode, startedAt]` (Task 2.1) — `startedAt` change, lui, à chaque appel de `startGame()`.
- **`finishGame()`/`resetGame()` ne touchent pas `startedAt`** : un `watch` sur `startedAt` seul raterait l'arrêt du chrono à la fin de partie ou au retour accueil. D'où `status` dans le même triplet.
- **`onScopeDispose` synchrone** dans le corps du composable, jamais dans un callback (1.13, 1.16).
- **`lib.dom.d.ts`** ne ment pas ici : `setInterval`/`clearInterval` existent bien dans happy-dom, contrairement à `speechSynthesis`/`vibrate` — pas de garde de présence nécessaire pour `useTimer.ts`.
- **`--color-alert` ≠ `--color-on-alert`** : le premier est le rouge (`#FF3B30`), à utiliser en `text-alert` sur fond noir ; le second est le noir prévu pour du texte sur un fond `bg-alert` (rouge plein) — ne pas les inverser, la story n'utilise que le premier.
- **`bg-bg` n'est pas noir** (`#0D1117`, gris-bleu très sombre) : UX-DR4 demande un fond noir littéral pour le chrono, donc `bg-black`, pas `bg-bg`.
- **`text-reprise`, pas `text-score`**, pour tout chiffre affiché dans la colonne centrale `w-1/5` (plancher de `text-score` à 120px, déborde dès deux chiffres — piège consigné depuis la 1.5/1.16).
- **Tailwind v4 JIT** : classes écrites en toutes lettres, pas de classes générées dynamiquement par template string.
- **Fake timers** : `vi.useRealTimers()` en fin de test (ou en `afterEach`) pour ne pas polluer les fichiers de test suivants — recette déjà appliquée dans `GameView.test.ts` et `ScoreEntryModal.test.ts`.

### Project Structure Notes

- Nouveaux : `carom-scoreboard/src/composables/useTimer.ts`, `src/composables/useTimer.test.ts`, `src/components/ShotClock.vue`, `src/components/ShotClock.test.ts`.
- Modifiés : `src/types/game.ts` (1 ligne), `src/components/CenterPanel.vue` + test, `src/views/GameView.vue` + test, `src/components/HomeScreen.test.ts` (1 test ajouté) ; specs `_bmad-output/planning-artifacts/{epics,architecture,ux-design-specification}.md`, `_bmad-output/implementation-artifacts/{deferred-work.md,sprint-status.yaml}`.
- Nommage (AR15) : `useTimer` (composable, pas de store — pas d'état de partie), fonction verbe+nom (`resetTimer`), constante `SHOT_CLOCK_SECONDS` en export nommé ; `ShotClock` (composant PascalCase) ; `data-testid="shot-clock"`/`"shot-clock-label"`/`"shot-clock-value"`.
- Stack inchangée : Vue 3.5 `<script setup>`, Pinia 4, Tailwind 4, Vitest 5 + happy-dom 20. Aucune dépendance ajoutée — `setInterval` et SVG natifs, pas de librairie de graphique circulaire.

### Point à confirmer au rendu (non bloquant)

- **Non-persistance du chrono.** La story part du principe qu'un rechargement en pleine partie 3 Bandes peut légitimement remettre le chrono à 40s (AR14 isole le timer de la persistance V1a, rien dans l'architecture ne l'ajoute à `GameState`). Si Nathan considère à l'usage que c'est gênant (ex. un arbitre qui recharge la page perd son chrono), l'ajout à `GameState` est une extension mineure mais qui incrémente `GAME_STORAGE_VERSION` — à arbitrer plus tard, pas anticipé ici (Task 5.4).
- **Taille exacte de l'anneau.** La story dimensionne `ShotClock` en `aspect-square w-full` dans la colonne `w-1/5` de `CenterPanel`, empilé sous REP et au-dessus d'`ANNULER` — la passe visuelle (Task 6) doit confirmer qu'il ne pousse pas les boutons hors de l'écran en portrait (le budget vertical de cette colonne est déjà serré, cf. 1.16 sur la colonne des pictos). Si trop haut, réduire l'anneau (`w-4/5` au lieu de `w-full`) plutôt que de retirer le libellé CHRONO.

### References

- [Source: epics.md#Story 2.1 (AC FR13, AR14, note de périmètre sets) ; epics.md#Story 2.2 (reset du chrono au tap, à venir) ; epics.md#Story 2.3 (timer libre au pavé, à venir) ; AR14 (`useTimer.ts`, isolé V1a) ; AR15, AR17]
- [Source: prd.md l. 118-121, 259, 266 (« timer obligatoire », « règle timer 3 Bandes : toujours actif », V1b jalon distinct) ; FR13, FR14]
- [Source: ux-design-specification.md l. 56 (chrono de tir 40s, reset au tap — Epic 2) ; l. 121/128/372 (score restant « POUR n », propre au 3 Bandes, Story 2.2) ; l. 208 (égalisatrice 3 Bandes « réglage de l'Epic 2 », non précisé) ; l. 237 (UX-DR4, rouge LED sur fond noir) ; l. 206 (rappel du flow tap incrémental)]
- [Source: architecture.md l. 27, 45 (V1b isolé, ne bloque pas V1a) ; l. 617 (`useTimer.ts` marqué « hors scope V1a », à corriger en 2.1) ; l. 175-235 (catalogue `GAME_CATEGORIES`, `GameState`/`GameSnapshot` sans champ chrono)]
- [Source: code — `types/game.ts` (catalogue CATALOG, l. 24-59), `HomeScreen.vue` (`selectCategory`/`selectMode`, gestion générique des catégories à mode unique), `CenterPanel.vue` (structure `flex-col`, `text-reprise`), `GameView.vue` (branchement de `CenterPanel`), `useGameStore.ts` (`startGame`/`restartGame`/`rematch`/`resumeGame` posent `startedAt` ; `finishGame`/`resetGame` ne le touchent pas), `usePwaUpdate.ts` (modèle intervalle + `onScopeDispose` + `watch` multi-source), `main.css` (`--color-alert`/`--color-on-alert` déjà scaffoldés, commentaire « réservé au chrono UX-DR4 »)]
- [Source: 1-16 story — modèle de cadrage en décisions numérotées, tableau « état du code », section « pièges à ne pas rejouer », gabarit `useSpeech`/`useHaptics` pour un composable testé en isolation]
- [Source: deferred-work.md l. 64 — coût de la pile d'annulation « à revoir avec le +1 par point du 3 Bandes (Epic 2) », pertinent pour la Story 2.2, pas 2.1]
- [Source: sonde du 2026-09-10 — `npm test` : 428 tests / 15 fichiers verts avant cette story ; `grep -rn "3bandes" src/` : seules les deux occurrences du catalogue, aucun autre couplage à défaire]
- [Source: retour de Nathan, 2026-09-10 (conversation de révision) — pause/reprise retirée du périmètre V1b, reportée à une future épic Compétition/Arbitrage ; chrono à réinitialiser aussi au changement de joueur, +3s de grâce, à traiter en Story 2.2 ; choix visuel circulaire plutôt que la barre segmentée du Billiboard]
- [Source: `explore/resources/IMG_6034.JPG` — écran CUESCO « SHOT CLOCK », anneau circulaire plein autour d'un chiffre central, référence visuelle retenue pour `ShotClock.vue` (forme, pas couleur)]
- [Source: `explore/resources/IMG_6459.JPG`, `IMG_6151.JPG`, `IMG_9450.JPG` — écrans Billiboard, chiffre digital + barre horizontale segmentée (jaune→rouge), référence visuelle écartée (« pas assez smooth »)]
- [Source: `explore/resources/cueuny.pdf` (brochure CUESCO) — confirme le positionnement CUESCO comme scoreboard officiel fédération coréenne/UMB, déjà cité comme référence visuelle et structurelle principale dans `ux-design-specification.md`]

## Change Log

| Date | Changement |
|---|---|
| 2026-09-10 | Création de la story (bmad-create-story) : 4 décisions de cadrage (déverrouillage par booléen, chrono 40s sourcé UX spec, non-persistance assumée, pause/reprise sans bouton visible), trou de planification « nombre de sets » consigné pour une future story. |
| 2026-09-10 | Implémentation (bmad-dev-story) : Tasks 1 à 5 livrées — catégorie 3 BANDES déverrouillée, `useTimer.ts` (40 s, watch `[status, mode, startedAt]`, sans pause ni persistance), `ShotClock.vue` (anneau SVG rouge sur noir) branché dans `CenterPanel` via `GameView`, specs annotées. 457 tests / 17 fichiers, `vue-tsc` et `build` verts. **Task 6 (passe visuelle Chrome) et Task 7 (contrôle final) restent à faire** — session interrompue à la demande de Nathan (budget tokens), à reprendre. |
| 2026-09-11 | Fin de l'implémentation (bmad-dev-story) : Task 6 passe visuelle Chrome (1024×768 et 768×1024, harnais iframe recréé puis supprimé) et Task 7 contrôle final (457 tests / 17 fichiers, `vue-tsc`, `build` verts, aucune dépendance) — story passée en `review`. |
| 2026-09-10 | Révision après retour de Nathan : pause/reprise **retirée** du périmètre (fonctions et AC10/11 supprimées) et reportée à une future épic Compétition/Arbitrage ; affichage repensé en **anneau circulaire** (`ShotClock.vue`, composant dédié) inspiré du CUESCO (`IMG_6034.JPG`) plutôt que la barre segmentée du Billiboard, jugée pas assez smooth ; note ajoutée pour la future Story 2.2 (reset du chrono aussi au changement de joueur, +3s de grâce) sans l'implémenter ici. |

## Dev Agent Record

### Agent Model Used

claude-fable-5-1 (Claude Fable 5.1)

### Debug Log References

- Base de départ vérifiée : 428 tests / 15 fichiers verts. Après implémentation : 457 tests / 17 fichiers, `npx vue-tsc -b` et `npm run build` verts, aucune dépendance ajoutée.
- Les callbacks de `watch` (flush `pre`) sont différés d'une microtâche : les tests de `useTimer` attendent `nextTick()` après chaque mutation du store plutôt que d'imposer `flush: 'sync'` au composable (qui aurait déclenché trois fois par `startGame()`).
- Passe visuelle : un onglet Chrome en arrière-plan aligne `setInterval` sur la seconde entière et ne peint pas les transitions CSS tant qu'il n'est pas affiché — une capture a montré un anneau à moitié plein sous un chiffre `0` alors que `getComputedStyle` donnait bien l'offset final (263,9 = circonférence). Vérifié par échantillonnage : l'offset animé reste à chaque instant entre les cibles de `v` et `v+1`. Artefact d'onglet caché, pas un défaut du composant — sur la tablette l'écran est toujours au premier plan.
- Sans la prop `secondsRemaining`, `CenterPanel` recevait `undefined` (≠ `null`) et montait l'anneau même en JDS — c'est le test « shows no shot clock during a series game » qui l'a révélé avant le branchement dans `GameView`.

### Completion Notes List

- **Task 1** : `available: true` sur `3bandes` (une ligne). Test HomeScreen : catégorie active, sans « BIENTÔT », passage direct à `step-players`.
- **Task 2** : `useTimer.ts` conforme à la spec — `SHOT_CLOCK_SECONDS = 40`, `secondsRemaining`, `resetTimer` (sans appelant en 2.1), `setInterval` natif, `onScopeDispose` synchrone, `watch([status, mode, startedAt], …, { immediate: true })`. En `finished`/`idle` la valeur revient au repos (40) et l'intervalle est coupé. 11 tests dans un `effectScope` (AC5, AC7, AC8, AC9, désabonnement).
- **Task 3** : `ShotClock.vue` (anneau SVG `stroke-dashoffset`, `-rotate-90`, transition 1 s linéaire, `bg-black` littéral, `stroke-alert`/`text-alert`, libellé `CHRONO`, chiffre en `text-reprise`, `data-testid="shot-clock-arc"` ajouté pour tester l'offset). `CenterPanel` : prop `secondsRemaining: number | null`, `<ShotClock v-if="secondsRemaining !== null">` entre REP et ANNULER. 5 + 4 tests.
- **Task 4** : `GameView` appelle `useTimer()` une fois ; `shotClockSeconds` (computed) ne transmet la valeur que si `mode === '3bandes'`. 4 tests : parcours complet depuis l'accueil (distance obligatoire vérifiée au passage), absence en JDS, `RECOMMENCER` → 40, sortie → disparition.
- **Task 5** : notes datées dans `epics.md` (Story 2.1 livraison, Story 2.2 reset au changement de joueur + 3 s de grâce, AR14), `architecture.md` (arborescence, mapping FR13/FR14, gap `useTimer` livré), `ux-design-specification.md` (fiche CenterPanel), `deferred-work.md` (pause/reprise, nombre de sets, non-persistance). `sprint-status.yaml` → `in-progress`.
- **Task 6 — Passe visuelle** (2026-09-11, Chrome, harnais iframe `public/_viewport-harness.html` recréé puis supprimé, `localStorage` vidé avant chaque format) :
  - **1024×768** : accueil → « 3 BANDES » actif, sans « BIENTÔT » (QUILLES/CASIN restent grisés) ; sélection → `step-players` direct, aucun `step-mode` ; DÉMARRER sans distance → « DISTANCE MANQUANTE » avec ANNULER / RÉGLER LA DISTANCE ; 30/30 réglés → partie `3bandes`, `status: playing`, mêmes panneaux qu'en JDS. Console centrale (colonne 410–615 px) : REP en haut (y 56–133), anneau `ShotClock` 173×173 px (y 194–367) fond `rgb(0,0,0)`, arc et chiffre `rgb(255,59,48)`, chiffre 76,8 px, libellé CHRONO ; ANNULER (y 399–489) et ÉCHANGER (y 521–611) sous l'anneau, dans la colonne (646 px), `scrollWidth`/`scrollHeight` = viewport. Décompte 39 → 34 → 22 → 0 observé, figé à `0` anneau vide (offset = circonférence). Après une série de 2, RECOMMENCER → pop-up « RECOMMENCER LA PARTIE ? » → 40, REP 1, offset 6,6 après le premier tick ; échantillonnage sur 8 lectures : offset animé toujours entre les cibles de `v` et `v+1` (mouvement continu, pas de saut). Sortie → accueil, `status: idle`, `shot-clock` absent et toujours absent 2,5 s plus tard. Partie `libre` démarrée depuis l'accueil : REP et ANNULER présents, `shot-clock` absent, toujours absent après 2,5 s.
  - **768×1024** : même parcours (catégorie active, joueurs direct, « DISTANCE MANQUANTE ») ; colonne centrale 154 px (x 307–461, h 902), REP y 219–277, anneau 122×122 px (y 338–460) noir/rouge, chiffre 57,6 px, ANNULER y 492–582, ÉCHANGER y 614–704 — 198 px de marge sous ÉCHANGER, rien n'est poussé hors écran ; `scrollWidth` = 768, `scrollHeight` = 1024. Le `w-full` de l'anneau tient en portrait, pas besoin de passer en `w-4/5`.
  - Console Chrome vierge (aucune erreur ni exception), rechargement sur l'accueil sans `pendingRestore`.
  - *Observation, non bloquante* : au RECOMMENCER, la transition CSS fait « se remplir » l'anneau de vide à plein en 1 s (rembobinage visible) plutôt que de sauter directement à plein. Perçu comme un mouvement plutôt qu'un défaut ; à trancher par Nathan au rendu si la remise à plein doit être instantanée (ajouter une classe sans transition le temps du reset).
- **Task 7 — Qualité** (2026-09-11) : `npm test` 457/457 (17 fichiers, 428 de départ + 29 nouveaux, aucune régression), `npx vue-tsc -b` vert, `npm run build` vert (PWA 12 entrées précachées), aucune dépendance ajoutée (`package.json`/`package-lock.json` inchangés), harnais supprimé, arbre de travail propre.
- **Task 5.5** : `sprint-status.yaml` → `review` (2026-09-11).

### File List

- `carom-scoreboard/src/types/game.ts` (modifié — `available: true`)
- `carom-scoreboard/src/composables/useTimer.ts` (nouveau)
- `carom-scoreboard/src/composables/useTimer.test.ts` (nouveau)
- `carom-scoreboard/src/components/ShotClock.vue` (nouveau)
- `carom-scoreboard/src/components/ShotClock.test.ts` (nouveau)
- `carom-scoreboard/src/components/CenterPanel.vue` (modifié)
- `carom-scoreboard/src/components/CenterPanel.test.ts` (modifié)
- `carom-scoreboard/src/components/HomeScreen.test.ts` (modifié)
- `carom-scoreboard/src/views/GameView.vue` (modifié)
- `carom-scoreboard/src/views/GameView.test.ts` (modifié)
- `_bmad-output/planning-artifacts/epics.md` (modifié)
- `_bmad-output/planning-artifacts/architecture.md` (modifié)
- `_bmad-output/planning-artifacts/ux-design-specification.md` (modifié)
- `_bmad-output/implementation-artifacts/deferred-work.md` (modifié)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modifié)
- Temporaire (créé puis supprimé) : `carom-scoreboard/public/_viewport-harness.html`
