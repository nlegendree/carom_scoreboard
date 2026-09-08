# Story 1.4: Configurer les paramètres du match avant de démarrer

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur,
I want fixer la distance de jeu de chaque joueur avant de démarrer,
so that le match a un objectif clair, y compris quand les deux joueurs ne jouent pas la même distance.

## Acceptance Criteria

1. **Given** l'étape joueurs de `HomeScreen` **When** je regarde la barre d'action **Then** un bouton `FORMAT` est présent à gauche de `DÉMARRER`, affichant l'état courant du format : `DISTANCE LIBRE` tant qu'aucune distance n'est saisie, `DISTANCE 100` si les deux joueurs partagent la même, `100 / 80` si les distances sont dissociées (FR15, FR41).
2. **Given** le bouton `FORMAT` **When** je l'active **Then** une modale plein écran s'ouvre par-dessus l'étape joueurs — pas de route dédiée (AR6), pas de fermeture par tap en dehors (esprit UX-DR12) — avec exactement deux issues : `RETOUR` (abandonne les modifications) et `VALIDER` (les applique).
3. **Given** la modale de format ouverte pour la première fois **When** je l'observe **Then** **aucune distance n'est pré-remplie et aucun mode ne porte de distance par défaut** : la valeur affichée est `LIBRE` (0 = aucun objectif), et un pavé numérique 0-9 permet de saisir la distance, limitée à 3 chiffres (0-999).
4. **Given** la modale en mode lié (état par défaut) **When** je saisis une distance **Then** elle s'applique simultanément aux deux joueurs, sans avoir à la saisir deux fois.
5. **Given** le besoin de handicap (convention coréenne : deux joueurs peuvent jouer des distances différentes) **When** je dissocie explicitement les distances **Then** je saisis une valeur distincte pour la bille blanche et pour la bille jaune, et les deux valeurs sont conservées séparément.
6. **Given** un format validé **When** la partie démarre **Then** chaque `PlayerPanel` affiche **la distance de son propre joueur** en haut à droite ; si la distance vaut 0 (`LIBRE`), cet emplacement reste vide et aucune fin de partie automatique n'est induite.
7. **Given** une partie démarrée avec des distances dissociées **When** j'intervertis les billes avant la première reprise **Then** la distance suit le joueur — comme son nom et son score — tandis que la bille reste attachée au côté (UX-DR2, règle de la Story 1.3).
8. **Given** le critère de succès PRD « 60 ans / 30 secondes » **When** je ne touche pas au format **Then** le parcours de démarrage reste strictement identique à celui de la Story 1.3 : aucun écran supplémentaire à traverser, la modale est strictement optionnelle (NFR12).
9. **Given** les règles tactiles du projet **When** j'interagis avec le bouton `FORMAT`, le pavé numérique et les contrôles de la modale **Then** tous les événements passent par `@pointerdown` et toutes les zones interactives mesurent au moins 90×90 px (AR8, UX-DR8, NFR9).

## Tasks / Subtasks

- [ ] Task 1 : Types — la distance devient un attribut du joueur (AC: #5, #6, #7)
  - [ ] 1.1 `src/types/game.ts` : ajouter `targetScore: number` à `interface Player` (0 = aucun objectif / distance libre)
  - [ ] 1.2 `src/types/game.ts` : **retirer** `targetScore` de `interface GameState` — il n'existe plus au niveau partie, uniquement au niveau joueur
  - [ ] 1.3 Ne **rien** ajouter au catalogue `CATALOG`/`GAME_CATEGORIES` : décision produit du 2026-09-08 — aucun mode ne porte de distance par défaut (voir Dev Notes § Décisions produit)

- [ ] Task 2 : Store `useGameStore` (AC: #4, #5, #6, #7)
  - [ ] 2.1 Supprimer la constante `DEFAULT_TARGET_SCORE` et le `ref` `targetScore` du store ; `makePlayer()` initialise `targetScore: 0`
  - [ ] 2.2 `startGame(mode, player1Name, player2Name, targetScores?)` : 4e paramètre **optionnel** `{ player1: number; player2: number }`, défaut `{ player1: 0, player2: 0 }` ; chaque valeur est affectée au joueur correspondant. Ne pas transformer la signature en objet d'options : les appels existants (`HomeScreen`, tests de la Story 1.3) doivent continuer de fonctionner tels quels
  - [ ] 2.3 Normaliser toute distance entrante : entier, borné à `[0, 999]` (`Math.trunc` + clamp) — la garde vit dans l'action, pas dans le composant (esprit AR17, leçon de la revue 1.3 sur `swapPlayers()`)
  - [ ] 2.4 Vérifier que `swapPlayers()` transporte bien `targetScore` avec le joueur : le spread `{ ...player2.value, id: 'player1', color: 'white' }` le fait déjà — ajouter le **test** qui le prouve (AC#7), c'est le seul point de vigilance de la story sur cette action
  - [ ] 2.5 Vérifier que `resetGame()` remet les distances à 0 : il repasse par `makePlayer()`, donc c'est acquis — retirer la ligne `targetScore.value = DEFAULT_TARGET_SCORE` devenue caduque
  - [ ] 2.6 Tests `useGameStore.test.ts` : distance à 0 par défaut sur les deux joueurs ; `startGame` sans 4e argument laisse 0/0 ; `startGame` avec `{ player1: 100, player2: 80 }` affecte la bonne valeur à chaque joueur ; une valeur négative, décimale ou > 999 est normalisée ; `swapPlayers()` déplace la distance avec le joueur (100/80 → 80/100) et laisse les couleurs en place ; `resetGame()` remet 0/0. Adapter le test existant « has an idle status and the default target score by default »

- [ ] Task 3 : Composant `src/components/NumericPad.vue` + `NumericPad.test.ts` (AC: #3, #9)
  - [ ] 3.1 Composant **purement présentationnel**, sans état interne ni logique de score : props `disabled?: boolean` ; emits `digit: [value: number]`, `clear: []`. Le buffer de saisie, le plafond de 3 chiffres et la validation appartiennent au parent
  - [ ] 3.2 Grille tactile : `1`-`9`, `0`, `C` (efface la saisie) ; chaque touche `@pointerdown`, `min-h-[var(--size-touch-target)]`, `min-w-[var(--size-touch-target)]`, `touch-manipulation select-none`
  - [ ] 3.3 `data-testid` par touche : `digit-0` … `digit-9`, `clear-button` (convention des tests existants)
  - [ ] 3.4 Tests : chaque touche chiffre émet `digit` avec la bonne valeur sur `pointerdown` ; `C` émet `clear` ; `disabled` empêche toute émission ; aucun `@click` dans le template

- [ ] Task 4 : Composant `src/components/MatchFormatModal.vue` + `MatchFormatModal.test.ts` (AC: #2, #3, #4, #5, #9)
  - [ ] 4.1 Props : `player1Name: string`, `player2Name: string`, `targetScores: { player1: number; player2: number }` (valeurs à l'ouverture) ; emits `confirm: [targetScores: { player1: number; player2: number }]`, `cancel: []`
  - [ ] 4.2 État local : `linked` (booléen, `true` à l'ouverture sauf si les deux valeurs entrantes diffèrent), `focused: 'player1' | 'player2'`, et un buffer de saisie **par joueur** (`string`, `''` = 0/`LIBRE`)
  - [ ] 4.3 Conteneur plein écran recouvrant l'étape joueurs (`fixed inset-0 z-50 flex flex-col bg-bg`) : la barre d'action de la modale masque donc celle de `HomeScreen`, et `DÉMARRER` est inatteignable tant que la modale est ouverte
  - [ ] 4.4 Affichage : deux cartes côte à côte (blanche à gauche, jaune à droite, mêmes tokens `bg-player-white`/`bg-player-yellow` que `PlayerPanel` — **ne pas redéfinir de couleurs**), portant chacune le nom du joueur et sa distance courante (`LIBRE` si 0). La carte ciblée par le pavé est visuellement distinguée par la **présence** d'un liseré `ring-8 ring-turn-active ring-inset` (même signal non-chromatique que l'indicateur de tour, UX-DR14)
  - [ ] 4.5 Mode lié (défaut) : chaque frappe met à jour les **deux** distances (AC#4) ; un bouton `HANDICAP` (`data-testid="unlink-button"`) passe `linked` à `false` et cible la bille jaune. Taper directement sur la carte jaune produit le même effet
  - [ ] 4.6 Saisie : `NumericPad` en dessous des cartes ; le buffer ciblé se limite à 3 chiffres (au-delà, la frappe est **ignorée** — pas de message bloquant, le retour haptique distinct viendra avec la Story 1.5) ; `C` remet le buffer ciblé à `''` (donc `LIBRE`) ; pas de zéros de tête à l'affichage
  - [ ] 4.7 Issues : `VALIDER` (`data-testid="format-confirm-button"`, `bg-accent`/`text-on-accent` — jamais une couleur joueur, UX-DR3) émet `confirm` avec les deux entiers ; `RETOUR` via `ActionBar` émet `cancel`. Aucune fermeture par tap en dehors, aucun overlay cliquable
  - [ ] 4.8 Tests : ouverture avec 0/0 affiche `LIBRE` des deux côtés ; en mode lié, `digit(1)+digit(0)+digit(0)` porte 100 sur les deux joueurs ; après `HANDICAP`, la frappe suivante ne change que la bille jaune ; un 4e chiffre est ignoré (valeur reste à 3 chiffres) ; `C` ramène à `LIBRE` ; `confirm` émet bien `{ player1, player2 }` ; `cancel` n'émet aucune valeur ; ouverture avec deux valeurs différentes démarre en mode dissocié

- [ ] Task 5 : Câblage dans `HomeScreen.vue` + `HomeScreen.test.ts` (AC: #1, #2, #8)
  - [ ] 5.1 État local `targetScores` (`{ player1: 0, player2: 0 }`) et `isFormatOpen` (booléen) ; la modale est montée par `v-if` **au-dessus** de l'étape joueurs uniquement (`step === 'players'`)
  - [ ] 5.2 Bouton `FORMAT` (`data-testid="format-button"`) dans le slot `#actions` d'`ActionBar`, **à gauche** de `DÉMARRER` : style neutre (bordure/`bg-white/10`), jamais `bg-accent` — `DÉMARRER` reste l'unique action primaire du contexte (hiérarchie des boutons, UX spec)
  - [ ] 5.3 Libellé du bouton dérivé de l'état : `FORMAT · LIBRE` / `FORMAT · 100` / `FORMAT · 100 / 80` (un `computed`, testé)
  - [ ] 5.4 `confirm` de la modale → met à jour `targetScores` et referme ; `cancel` → referme sans rien changer
  - [ ] 5.5 `confirm()` (démarrage de partie) passe `targetScores` en 4e argument de `startGame`
  - [ ] 5.6 Revenir à l'étape mode/catégorie (`back()`) réinitialise `targetScores` à 0/0 — un format saisi pour un mode abandonné ne doit pas être silencieusement reconduit (même défaut que celui corrigé sur `resetGame()` en revue de la Story 1.3)
  - [ ] 5.7 Tests : le bouton `FORMAT` n'existe qu'à l'étape joueurs ; il ouvre la modale ; `VALIDER` met à jour son libellé ; `RETOUR` dans la modale laisse le libellé inchangé ; `DÉMARRER` sans jamais ouvrir la modale démarre avec 0/0 (AC#8) ; `DÉMARRER` après validation de 100/80 place ces distances sur les bons joueurs ; un retour en arrière puis un nouveau choix de mode repart à `LIBRE`

- [ ] Task 6 : Affichage de la distance (AC: #6)
  - [ ] 6.1 `PlayerPanel.vue` : **supprimer la prop `targetScore`** et lire `player.targetScore` — la distance appartient désormais au joueur
  - [ ] 6.2 Masquer complètement l'emplacement quand `player.targetScore === 0` (`v-if`) : pas de `—`, pas de `0` — rien à lire (NFR12). Conserver `data-testid="target-score"`
  - [ ] 6.3 `GameView.vue` : retirer `targetScore` de `storeToRefs` et des deux `<PlayerPanel>`
  - [ ] 6.4 Tests `PlayerPanel.test.ts` : distance affichée quand > 0, élément absent quand 0. Adapter `GameView.test.ts` au retrait de la prop
  - [ ] 6.5 **Ne pas** afficher le score restant ici — c'est la Story 1.6 (voir Dev Notes § Hors périmètre)

- [ ] Task 7 : Synchronisation des specs (les décisions produit de cette story invalident des écrits antérieurs)
  - [ ] 7.1 `epics.md`, Story 1.4 : remplacer l'AC « l'objectif de score est pré-rempli avec la distance de référence du mode choisi (portée par le catalogue `GAME_CATEGORIES`) » par la règle arrêtée le 2026-09-08 — **aucune distance par défaut**, distance **par joueur** (handicap), saisie au pavé numérique dans une modale de l'étape joueurs
  - [ ] 7.2 `epics.md`, Story 1.4 : remplacer la mention du nombre de sets par une note de périmètre — les sets relèvent du 3 Bandes et sont traités dans l'**Epic 2** ; FR15 n'est donc couvert que sur son volet « objectif de score » en V1a
  - [ ] 7.3 `epics.md`, Story 1.11 : noter que la détection de fin de **set** dépend de l'Epic 2, seule la détection sur objectif de score est réalisable en V1a
  - [ ] 7.4 `epics.md`, Story 1.5 : ajouter la note de périmètre manquante — « `NumericPad.vue` existe depuis la Story 1.4 (composant présentationnel, emits `digit`/`clear`) ; cette story le branche sur la saisie de score et lui ajoute haptique, plafond à 999 et validation hybride — elle ne le crée pas », sur le modèle des notes des Stories 1.8 et 1.15
  - [ ] 7.5 `epics.md`, Epic 2 / Story 2.1 : noter que la configuration du nombre de sets y est rattachée
  - [ ] 7.6 `architecture.md` : dans le snippet `src/types/game.ts`, déplacer `targetScore` de `GameState` vers `Player` ; ajouter `MatchFormatModal.vue` à la liste des composants principaux V1a ; préciser que `GAME_CATEGORIES` ne porte **aucune** distance de jeu
  - [ ] 7.7 `ux-design-specification.md` : ajouter `MatchFormatModal` aux Custom Components (rôle, états : lié / dissocié) et une ligne dans « Écran d'accueil et navigation » sur le réglage de format optionnel et l'absence de distance par défaut
  - [ ] 7.8 `sprint-change-proposal-2026-09-08.md` : ajouter sous le §4.2(b) une ligne datée indiquant que cet ajout d'AC est **superseded** par la décision du 2026-09-08 (pas de distance par défaut, distance par joueur) — son critère de succès n°2 y renvoie explicitement

- [ ] Task 8 : Validation de fin de story (CLAUDE.md §9)
  - [ ] 8.1 `npm test`, `npx vue-tsc -b` et `npm run build` verts
  - [ ] 8.2 **Une seule** passe navigateur (extension `claude-in-chrome`) en fin de story, sur `npm run dev`, aux formats **768×1024** et **1024×768** : parcours complet accueil → catégorie → mode → joueurs → FORMAT → 100 lié → VALIDER → DÉMARRER, puis handicap 100/80 → interversion → vérifier que la distance suit le joueur. Vérifier l'absence d'erreur console (`read_console_messages`) et l'absence de débordement de la modale
  - [ ] 8.3 Mettre à jour File List, Completion Notes et Change Log

## Dev Notes

### Décisions produit du 2026-09-08 (Nathan) — elles priment sur les écrits antérieurs

1. **Aucune distance par défaut, pour aucun mode.** Le catalogue `GAME_CATEGORIES` ne porte pas de distance et n'en portera pas dans cette story. À l'ouverture, la modale affiche `LIBRE` (0) des deux côtés. Ceci **annule** l'AC ajouté par `sprint-change-proposal-2026-09-08.md` §4.2(b) (« objectif pré-rempli avec la distance de référence du mode ») : ne pas l'implémenter, et corriger `epics.md` (Task 7.1).
2. **La distance appartient au joueur, pas à la partie.** Convention coréenne du handicap (observée en 3 Bandes) : les deux joueurs peuvent jouer des distances différentes. `targetScore` migre donc de `GameState` vers `Player` dès maintenant, pour éviter une migration ultérieure du store, de `PlayerPanel` et de la persistance (Story 1.12). L'association durable distance ↔ joueur ↔ mode est une piste V2+ (base joueurs, Epic 4) — **hors périmètre ici**.
3. **Réglage optionnel dans une modale, pas un écran de plus.** Le parcours par défaut reste `catégorie → mode → joueurs → jeu`, inchangé depuis la Story 1.3 (AC#8). La modale s'ouvre depuis l'étape joueurs, conformément à AR6 (« les réglages V1 sont des modales inline, sans route dédiée »).
4. **Saisie au pavé numérique** (et non par pas `−`/`+` ni par valeurs prédéfinies), d'où la création anticipée de `NumericPad.vue` en composant présentationnel réutilisable.
5. **Les sets sortent du périmètre de cette story** : notion propre au 3 Bandes, traitée dans l'Epic 2. FR15 n'est couvert ici que sur son volet « objectif de score ».

### Hors périmètre de cette story (ne pas anticiper)

- **Détection de fin de set ou de match** quand une distance est atteinte — **Story 1.11**. Cette story ne fait que *stocker* et *afficher* la distance ; aucun code ne doit poser `status = 'finished'`.
- **Affichage du score restant** vers l'objectif sur `PlayerPanel` — **Story 1.6** (son AC#3 le porte explicitement). Ici, seule la distance brute est affichée.
- **Saisie de score, haptique, plafond à 999 avec retour distinct, validation hybride 3 s, saisie négative** — **Stories 1.5 / 1.9**. `NumericPad` livré ici est muet : il émet `digit`/`clear`, rien d'autre. Ne pas y mettre de `navigator.vibrate`, de timer d'auto-validation ni de bouton `+/−`.
- **Modification du format en cours de partie** — FR41 et l'intitulé de la story portent sur la configuration **avant** démarrage. Ne pas ajouter d'action de store pour changer une distance en pleine partie.
- **Persistance `localStorage`** — **Story 1.12**. Le format vit en mémoire (store Pinia). Ne pas créer `storageService.ts`.
- **Nombre de sets** — Epic 2 (voir décision 5).
- **Distances de référence fédérales par mode** — aucune donnée fédérale ne doit être inventée ni codée en dur (décision 1).

### État du code au démarrage de cette story (déjà livré par la Story 1.3)

| Fichier | Ce qui existe | Ce que cette story en fait |
|---|---|---|
| `src/types/game.ts` | `GameState.targetScore: number`, catalogue `GAME_CATEGORIES` sans distance | Déplace `targetScore` dans `Player` ; catalogue inchangé |
| `src/stores/useGameStore.ts` | `targetScore` câblé en dur à 20 (`DEFAULT_TARGET_SCORE`), `startGame(mode, n1, n2)`, `swapPlayers()`, `resetGame()` | Supprime le champ de partie, ajoute le 4e paramètre de `startGame` |
| `src/components/HomeScreen.vue` | 3 étapes (`category` → `mode` → `players`), `ActionBar` avec slot `#actions` portant `DÉMARRER` | Ajoute le bouton `FORMAT` et la modale |
| `src/components/PlayerPanel.vue` | Prop `targetScore` affichée en haut à droite (`data-testid="target-score"`) | Lit `player.targetScore`, masque si 0 |
| `src/components/ActionBar.vue` | Barre basse commune, props `backLabel`/`showBack`, emit `back`, slot `#actions` | Réutilisée telle quelle dans la modale (`backLabel="RETOUR"`) — **ne pas en créer une variante** |
| `src/views/GameView.vue` | Passe `targetScore` aux deux panneaux | Retire la prop |

`NumericPad.vue` n'existe pas encore : c'est cette story qui le crée (il est listé dans `architecture.md` comme composant V1a et dans le roadmap UX « Phase 1 »).

### Pièges vérifiés en revue de la Story 1.3 — à ne pas rejouer

- **Classes Tailwind littérales obligatoires.** Une classe construite par template literal (`` `bg-player-${color}` ``) n'est pas vue par le scanner JIT de Tailwind v4 et n'est jamais générée. Le bug avait traversé toute la suite de tests (happy-dom ne compile pas le CSS). Dans la modale, écrire les classes de bille en toutes lettres, ou réutiliser la table `PLAYER_COLOR_CLASSES` de `PlayerPanel.vue`.
- **`--spacing` vaut 8px, pas 4px** (CLAUDE.md §7) : `p-6` = 48px, `gap-4` = 32px, `px-10` = 80px. Dimensionner la modale en gardant cette table en tête.
- **`text-score` (plancher 120px) déborde hors d'un panneau joueur.** Pour la distance affichée dans la modale, utiliser `text-reprise` (clamp 48-120px) ou `text-label` ; jamais `text-score`.
- **`reprises` est un `shallowRef`** : toute évolution doit **remplacer** le tableau, jamais le muter. Cette story n'y touche pas — ne pas l'oublier si un test en manipule.
- **`@pointerdown` seul, jamais `@click`** (AR8, décision assumée en revue : pas d'activation clavier). Les tests utilisent `trigger('pointerdown')`.
- **Gardes dans l'action, pas dans le template.** `selectMode` n'avait pas la garde de `selectCategory` ; `swapPlayers()` n'était gardé que par la vue. Normaliser/borner la distance dans `startGame`, pas seulement dans la modale.
- **Réinitialisation complète.** `resetGame()` oubliait `mode`/`targetScore`/`lastSaved`, ce qui reconduisait silencieusement l'état précédent. Même exigence ici pour `targetScores` au retour en arrière dans `HomeScreen` (Task 5.6).
- **Tests qui ne discriminent rien.** Deux tests de la Story 1.3 passaient même handler débranché. Chaque test de cette story doit échouer si la fonctionnalité est retirée — notamment celui du mode lié (vérifier les **deux** valeurs) et celui de l'interversion avec handicap (vérifier l'inversion, pas seulement l'égalité).

### Conventions à respecter (rappel ciblé)

- Composants `PascalCase`, tests co-localisés `Component.test.ts` (AR16) ; emits en kebab-case (`swap-players`) ; actions Pinia verbe+nom ; exports nommés (AR15).
- `storeToRefs()` pour toute lecture réactive du store dans un composant ; toute mutation par action (AR17).
- Mobile-first, `md:` ≥ 768px, `lg:` ≥ 1280px (AR19). La cible primaire est la **tablette** : le format téléphone est explicitement hors périmètre produit (confirmé en revue 1.3).
- Zones tactiles ≥ 90×90px via `min-h-[var(--size-touch-target)]` — **avec** `var(...)`, la syntaxe `min-h-[--size-touch-target]` ne produit rien en Tailwind v4 (bug corrigé en Story 1.3).
- Aucune nouvelle dépendance : tout se fait avec Vue 3.5 / Pinia / Tailwind v4 déjà installés. Aucune API navigateur nouvelle n'est requise par cette story (le `navigator.vibrate` de l'haptique appartient à la Story 1.5).

### Project Structure Notes

Nouveaux fichiers, tous sous `carom-scoreboard/src/`, conformes à l'arborescence d'`architecture.md` :

```
src/components/
├── NumericPad.vue          (nouveau)
├── NumericPad.test.ts      (nouveau)
├── MatchFormatModal.vue    (nouveau)
├── MatchFormatModal.test.ts(nouveau)
```

`services/` et `composables/` restent vides — aucune AC de cette story ne les nécessite (pas de persistance, pas d'interaction pointer complexe). `MatchFormatModal` est un composant, pas une vue : il n'a pas de route (AR6) et ne va pas dans `views/`.

### Questions ouvertes (non bloquantes)

- **Association durable distance ↔ joueur ↔ mode** (le joueur retrouve son handicap d'une partie à l'autre) : évoquée comme piste par Nathan, dépend de la base joueurs de l'Epic 4. Le modèle retenu ici (`Player.targetScore`) la rend possible sans refonte.
- **Saisie exacte au-delà de 999** : la limite de 3 chiffres est reprise de la contrainte de saisie de série (FR7). Une distance de 4 chiffres n'a pas de réalité en carambole ; à rouvrir seulement si un besoin concret apparaît.

### References

- [Source: epics.md#Story 1.4: Configurer les paramètres du match avant de démarrer (L364-384)] — AC de départ, amendés par les décisions produit ci-dessus (Task 7.1/7.2)
- [Source: epics.md#Story 1.5 (limite de périmètre NumericPad) (L386-408)]
- [Source: epics.md#Story 1.6 (score restant, hors périmètre ici) (L410-428)]
- [Source: epics.md#Story 1.11 (détection de fin de set/match) (L498-512)]
- [Source: epics.md#Additional Requirements — AR6, AR8, AR15-AR19 (L127-146)]
- [Source: epics.md#UX Design Requirements — UX-DR3, UX-DR8, UX-DR10, UX-DR12, UX-DR14, UX-DR19 (L147-173)]
- [Source: architecture.md#Architecture des Données — GameState/Player (L167-200)]
- [Source: architecture.md#Architecture Frontend — Routing, réglages en modales inline, composants V1a (L220-260)]
- [Source: architecture.md#Patterns de Nommage (L278-298)]
- [Source: architecture.md#Patterns de Communication Vue / Touch & Pointer (L317-350)]
- [Source: ux-design-specification.md#Écran d'accueil et navigation (L241-250)]
- [Source: ux-design-specification.md#Custom Components — NumericPad, PlayerPanel, ActionBar (L328-370)]
- [Source: ux-design-specification.md#Button Hierarchy / Feedback Patterns (L384-396)]
- [Source: prd.md#Modes de Jeu et Mécaniques de Saisie (L250-266)] — la distance est la seule chose qui distingue les 6 modes JDS
- [Source: prd.md#FR15, FR41 (L395, L436)]
- [Source: sprint-change-proposal-2026-09-08.md#4.2(b) Story 1.4] — AC de pré-remplissage, **superseded** (Task 7.8)
- [Source: 1-3-selectionner-un-mode-jds-et-demarrer-une-partie.md#Review Findings + Dev Notes] — pièges et conventions repris ci-dessus
- [Source: deferred-work.md#Deferred from code review of 1-3] — `shallowRef`, normalisation des noms, ordre des classes Tailwind
- [Source: carom-scoreboard/CLAUDE.md §2, §4, §6, §7, §9]

## Change Log

| Date | Change |
|---|---|
| 2026-09-08 | Création de la story. Trois décisions produit de Nathan la font diverger des écrits antérieurs : aucune distance par défaut par mode (annule l'AC ajouté par le change proposal §4.2(b)), distance **par joueur** dès la V1a pour supporter le handicap façon coréenne (`targetScore` migre de `GameState` vers `Player`), saisie au pavé numérique dans une modale optionnelle de l'étape joueurs (parcours de démarrage inchangé). Le nombre de sets sort du périmètre : notion propre au 3 Bandes, traitée dans l'Epic 2. |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
