# Story 1.4: Nommer chaque joueur et fixer sa distance avant de démarrer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur,
I want me nommer et fixer ma distance de jeu depuis ma propre zone, avant de démarrer,
so that le match a un objectif clair, y compris quand les deux joueurs ne jouent pas la même distance.

## Acceptance Criteria

1. **Given** l'étape joueurs de `HomeScreen` **When** je tape la zone blanche ou la zone jaune **Then** une pop-up s'ouvre pour **ce joueur-là** : sa bille en pastille de couleur, son nom et sa distance. Aucun bouton de réglage ne s'ajoute à la barre d'action — la zone du joueur **est** le point d'entrée (FR15, FR41).
2. **Given** la pop-up ouverte **When** je l'observe **Then** c'est une **vraie modale** — carte centrée, arrière-plan de la page visible mais **flouté** — et non un écran plein. Elle se ferme par la **croix en haut à gauche** ou par un **tap en dehors de la carte**, les deux abandonnant les modifications ; `VALIDER`, sur toute la largeur de la carte, les applique. Pas de route dédiée (AR6).
3. **Given** la pop-up **When** je tape le champ `NOM` puis le champ `DISTANCE` **Then** le clavier du bas **s'adapte au champ visé, au même emplacement** : clavier alphabétique pour le nom, pavé numérique pour la distance. Le champ visé porte un liseré ; rien ne se déplace à l'écran lors de la bascule.
4. **Given** que l'écran est une **borne fixe** **When** je saisis quoi que ce soit **Then** la saisie passe exclusivement par les claviers de l'application : **la modale ne contient aucun champ natif**, donc le clavier du système ne peut pas se déclencher ni recouvrir l'interface.
5. **Given** le champ `NOM` **When** je tape **Then** je dispose de l'AZERTY, d'une rangée de chiffres (« MICHEL 2 »), des accents `É È À Ç` des prénoms français, d'une barre d'espace et d'un retour arrière ; le nom est limité à 20 caractères et `JOUEUR` n'est qu'un libellé d'attente grisé, jamais une valeur saisie.
6. **Given** le champ `DISTANCE` **When** je tape **Then** **aucune distance n'est pré-remplie et aucun mode ne porte de distance par défaut** : le libellé d'attente est `0` (aucun objectif), la saisie est limitée à 3 chiffres (0-999), le pavé offre `AC` (qui devient `C` dès qu'un chiffre est entré, convention calculatrice iOS) et un retour arrière.
7. **Given** le besoin de handicap (convention coréenne : deux joueurs peuvent jouer des distances différentes) **When** je règle chaque joueur depuis sa propre zone **Then** les deux distances sont conservées séparément — il n'existe ni mode « lié » ni action de dissociation, chaque joueur saisit la sienne.
8. **Given** un réglage validé **When** je reviens à l'étape joueurs **Then** la zone du joueur affiche son nom et sa distance ; la rouvrir la retrouve telle quelle. Revenir au choix du mode remet les deux joueurs à zéro.
9. **Given** un réglage validé **When** la partie démarre **Then** chaque `PlayerPanel` affiche **la distance de son propre joueur** en haut à droite ; si elle vaut 0, cet emplacement reste vide et aucune fin de partie automatique n'est induite.
10. **Given** une partie démarrée avec des distances différentes **When** j'intervertis les billes avant la première reprise **Then** la distance suit le joueur — comme son nom et son score — tandis que la bille reste attachée au côté (UX-DR2, règle de la Story 1.3).
11. **Given** le critère de succès PRD « 60 ans / 30 secondes » **When** je ne touche à aucune zone joueur **Then** le parcours de démarrage reste strictement identique à celui de la Story 1.3 : `DÉMARRER` lance la partie avec `JOUEUR 1` / `JOUEUR 2` et aucune distance (NFR12).
12. **Given** les règles tactiles du projet **When** j'interagis avec la pop-up **Then** tous les événements passent par `@pointerdown` — **à l'unique exception du voile, qui ferme au `@pointerup`** pour qu'une paume d'appui ne jette pas la saisie (revue du 2026-09-09) — et la modale entière tient dans l'écran sans défilement aux deux formats tablette ; `VALIDER` reste visible quel que soit le clavier affiché (AR8, UX-DR8, NFR9). **Les touches des claviers intégrés sont explicitement exemptées de la règle des 90×90 px** (planchers : 44 px pour les lettres, 60 px pour les chiffres) : aucun clavier alphabétique ne tient 10 colonnes à 90 px dans une pop-up. La règle reste entière pour toutes les commandes de jeu. Exception reportée dans UX-DR8 (`epics.md:156`).

## Tasks / Subtasks

> **Révision d'UX du 2026-09-09.** Les Tasks 1, 2, 6 et 7 sont inchangées et livrées. Les Tasks 3, 4 et 5 ont été **refaites** après rejet de la première UX par Nathan (voir Dev Notes § Révision d'UX) : le bouton `FORMAT` et la modale unique lié/dissocié n'existent plus.

- [x] Task 1 : Types — la distance devient un attribut du joueur (AC: #7, #9, #10)
  - [x] 1.1 `src/types/game.ts` : ajouter `targetScore: number` à `interface Player` (0 = aucun objectif)
  - [x] 1.2 `src/types/game.ts` : **retirer** `targetScore` de `interface GameState`
  - [x] 1.3 Ne **rien** ajouter au catalogue `CATALOG`/`GAME_CATEGORIES` : aucun mode ne porte de distance par défaut

- [x] Task 2 : Store `useGameStore` (AC: #7, #9, #10, #11)
  - [x] 2.1 Supprimer `DEFAULT_TARGET_SCORE` et le `ref` `targetScore` ; `makePlayer()` initialise `targetScore: 0`
  - [x] 2.2 `startGame(mode, player1Name, player2Name, targetScores?)` : 4e paramètre **optionnel**, défaut `{ player1: 0, player2: 0 }` ; les appels de la Story 1.3 continuent de fonctionner tels quels
  - [x] 2.3 Normaliser toute distance entrante : entier borné à `[0, 999]` — la garde vit dans l'action, pas dans le composant (AR17)
  - [x] 2.4 Test prouvant que `swapPlayers()` transporte `targetScore` avec le joueur (AC#10)
  - [x] 2.5 `resetGame()` repasse par `makePlayer()` : distances remises à 0
  - [x] 2.6 Tests `useGameStore.test.ts` : 0 par défaut, `startGame` sans 4e argument, affectation par joueur, normalisation, interversion 100/80 → 80/100, `resetGame()`

- [x] Task 3 : Composant `src/components/NumericPad.vue` + `NumericPad.test.ts` (AC: #3, #6, #12)
  - [x] 3.1 Purement présentationnel : props `disabled?`, `hasInput?` ; emits `digit`, `clear`, `backspace`. Le buffer, le plafond et la validation appartiennent au parent
  - [x] 3.2 Grille 3×4 : `1`-`9` puis `AC`/`C` · `0` · `⌫`. Rang du bas plein, `0` sous le `8`
  - [x] 3.3 `hasInput` pilote le seul libellé d'effacement : `AC` tant que rien n'est saisi, `C` ensuite (convention calculatrice iOS)
  - [x] 3.4 Touches : surface propre, liseré, coins arrondis, creux à l'appui ; hauteur partagée via `auto-rows-fr` pour grandir sur un grand écran
  - [x] 3.5 `data-testid` : `digit-0` … `digit-9`, `clear-button`, `backspace-button`
  - [x] 3.6 Tests : chaque chiffre émet sa valeur, `clear` et `backspace` distincts, libellé `AC`/`C`, `disabled` bloque tout, aucun `@click`

- [x] Task 4 : Composant `src/components/AlphaKeyboard.vue` + `AlphaKeyboard.test.ts` (AC: #4, #5, #12)
  - [x] 4.1 Purement présentationnel : prop `disabled?` ; emits `input: [char]`, `backspace`
  - [x] 4.2 Disposition AZERTY sur 10 colonnes, rangée de chiffres en haut, accents `É È À Ç` en 4e rangée, `ESPACE` + `⌫` en dernière rangée
  - [x] 4.3 Style de touche **partagé** avec `NumericPad` via `src/components/keyClasses.ts` : les deux claviers doivent être identiques à l'œil quand ils se remplacent
  - [x] 4.4 `data-testid` : `key-<caractère>`, `key-space`, `key-backspace`
  - [x] 4.5 Tests : émission par touche, chiffres, accents, espace, retour arrière, `disabled`, aucun `@click`

- [x] Task 5 : Composant `src/components/PlayerSetupModal.vue` + test (AC: #1 à #6, #12)
  - [x] 5.1 Props : `color: PlayerColor`, `name: string`, `targetScore: number` ; emits `confirm: [{ name, targetScore }]`, `cancel: []`
  - [x] 5.2 **Vraie pop-up** : voile `bg-black/60 backdrop-blur-md` sur toute la surface, carte centrée `max-w-4xl` arrondie, ombre portée. La page reste visible derrière, floutée
  - [x] 5.3 Fermeture : croix `✕` en haut à gauche **et** tap sur le voile ; la carte arrête la propagation (`@pointerdown.stop`) pour qu'un tap dedans ne referme pas
  - [x] 5.4 **Aucun champ natif** : nom et distance sont du texte affiché, alimenté uniquement par les claviers de l'application, avec un caret clignotant sur le champ visé. C'est ce qui garantit que le clavier du système ne peut pas se déclencher (AC#4)
  - [x] 5.5 Deux champs côte à côte : `NOM` (libellé d'attente `JOUEUR` grisé, 20 caractères max, pas d'espace en tête) et `DISTANCE` (libellé d'attente `0` grisé, 3 chiffres max, pas de zéro de tête). Le champ visé porte `border-turn-active`
  - [x] 5.6 Un **seul emplacement** de clavier : `AlphaKeyboard` si le nom est visé, `NumericPad` sinon. Zone en `flex-1 min-h-0`, claviers en `auto-rows-fr` — les touches se partagent la place restante et grandiront sur un grand écran
  - [x] 5.7 `VALIDER` (`data-testid="setup-confirm-button"`, `w-full`, `bg-accent`/`text-on-accent`) émet `confirm` avec le nom brut et la distance entière
  - [x] 5.8 Tests : ouverture sur le champ nom, bascule de clavier, saisie lettre à lettre, chiffres dans un nom, retour arrière, plafonds 20/3, libellés d'attente, `AC`/`C`, croix, tap extérieur, tap intérieur sans fermeture, flou du voile, **absence de tout champ natif**, `w-full` sur `VALIDER`, aucun `@click`

- [x] Task 6 : Câblage dans `HomeScreen.vue` + `HomeScreen.test.ts` (AC: #1, #8, #11)
  - [x] 6.1 Les deux zones joueur deviennent des `<button>` (`player1-zone`, `player2-zone`) ouvrant la modale du joueur correspondant ; **plus aucun champ de saisie en ligne**
  - [x] 6.2 **Supprimer** le bouton `FORMAT` de la barre d'action : `DÉMARRER` y redevient seul
  - [x] 6.3 Chaque zone affiche le nom du joueur et sa distance (masquée si 0)
  - [x] 6.4 Les noms sont vides tant que le joueur ne s'est pas nommé — `JOUEUR 1` / `JOUEUR 2` sont des **libellés d'attente**, posés seulement au démarrage. Sans ça la modale s'ouvrait pré-remplie et la première frappe donnait « JOUEUR 1MICHEL »
  - [x] 6.5 `confirm` de la modale → nettoie le nom, enregistre la distance, referme ; `cancel` → referme sans rien changer
  - [x] 6.6 `confirm()` (démarrage) passe les noms normalisés et `targetScores` à `startGame`
  - [x] 6.7 `back()` réinitialise noms **et** distances
  - [x] 6.8 Tests : ouverture par zone avec la bonne bille, nom et distance affichés sur la zone, abandon par la croix, démarrage sans réglage (AC#11), distances portées au bon joueur, réouverture sur les valeurs, réinitialisation au retour

- [x] Task 7 : Affichage de la distance (AC: #9)
  - [x] 7.1 `PlayerPanel.vue` : supprimer la prop `targetScore`, lire `player.targetScore`
  - [x] 7.2 Masquer complètement l'emplacement quand la distance vaut 0 (`v-if`)
  - [x] 7.3 `GameView.vue` : retirer `targetScore` de `storeToRefs` et des deux `<PlayerPanel>`
  - [x] 7.4 Tests `PlayerPanel.test.ts` et `GameView.test.ts`
  - [x] 7.5 **Ne pas** afficher le score restant ici — c'est la Story 1.6

- [x] Task 8 : Synchronisation des specs
  - [x] 8.1 `epics.md`, Story 1.4 : AC réécrits sur l'UX finale (pop-up par joueur, claviers intégrés, aucune distance par défaut)
  - [x] 8.2 `epics.md`, Story 1.4 : note de périmètre sur les sets, renvoyés à l'Epic 2
  - [x] 8.3 `epics.md`, Story 1.11 : la détection de fin de **set** dépend de l'Epic 2
  - [x] 8.4 `epics.md`, Story 1.5 : note de périmètre `NumericPad` (existe depuis la 1.4, avec `digit`/`clear`/`backspace`)
  - [x] 8.5 `epics.md`, Epic 2 / Story 2.1 : le nombre de sets y est rattaché
  - [x] 8.6 `architecture.md` : `targetScore` sur `Player`, `PlayerSetupModal` et `AlphaKeyboard` dans les composants V1a, `GAME_CATEGORIES` sans distance
  - [x] 8.7 `ux-design-specification.md` : `PlayerSetupModal` et `AlphaKeyboard` en Custom Components, règle des claviers intégrés sur borne fixe
  - [x] 8.8 `sprint-change-proposal-2026-09-08.md` : §4.2(b) marqué **superseded**

- [x] Task 9 : Validation de fin de story (CLAUDE.md §9)
  - [x] 9.1 `npm test`, `vue-tsc -b` et `npm run build` verts
  - [x] 9.2 Passe navigateur aux formats **768×1024** et **1024×768** : ouverture par zone, bascule de clavier, saisie nom + distance, `AC`/`C`, retour arrière, croix, tap extérieur, démarrage, interversion. Absence d'erreur console et de débordement
  - [x] 9.3 Mettre à jour File List, Completion Notes et Change Log

### Review Findings

> Revue du 2026-09-09 (`bmad-code-review`, 3 couches : Blind Hunter, Edge Case Hunter, Acceptance Auditor).
> Base vérifiée : 89/89 tests verts, `vue-tsc -b` et `npm run build` verts, aucune dépendance ajoutée, aucun code hors périmètre.
> Les constats marqués **(mutation)** ont été prouvés en supprimant le code concerné et en constatant que la suite restait verte.
>
> **Traitement (2026-09-09).** 6 décisions tranchées par Nathan, 17 patches appliqués, 4 reports, 7 constats écartés comme bruit.
> Suite portée de **89 à 98 tests**, tous verts ; `vue-tsc -b` et `npm run build` verts ; passe navigateur refaite aux deux formats tablette.
> Chaque correctif a été **contre-vérifié par mutation** : supprimer le code corrigé fait désormais échouer au moins un test (8 mutations testées, 8 détectées).

- [x] [Review][Defer] Couverture du clavier alphabétique — ni trait d'union ni apostrophe, et seuls `É È À Ç` parmi les accents. `JEAN-PIERRE`, `MARIE-CLAUDE`, `D'ARTAGNAN`, `JOËL`, `ANAÏS`, `BENOÎT`, `JÉRÔME` sont insaisissables, sans contournement possible (le clavier est la seule voie de saisie). Le code est conforme à l'AC#5 tel qu'écrit, mais l'AC#5 ne couvre pas son propre cas d'usage déclaré (« les accents courants des prénoms français »). [src/components/AlphaKeyboard.vue:14-19] — **reporté** : à revoir avec la base joueurs de l'Epic 4, où les noms seront sélectionnés plutôt que tapés.
- [x] [Review][Decision] Fermeture au contact sur le voile, saisie perdue — le voile émet `cancel` sur `@pointerdown`, donc la modale se ferme avant même que le doigt se lève, et tout le nom et la distance saisis sont jetés. Sur `max-w-4xl` il reste 192 px de fond de chaque côté en 1280 px : une paume d'appui suffit. Tension entre AR8 (`@pointerdown` seul) et la protection de la saisie. [src/components/PlayerSetupModal.vue:73-77]
- [x] [Review][Decision] Une distance déjà réglée à 3 chiffres est inéditable — à la réouverture, `distance` vaut `'100'`, donc `distance.length >= MAX_DIGITS` et **toute** touche du pavé est ignorée sans aucun signal. C'est le parcours le plus fréquent après la première saisie (corriger un handicap) et il donne un pavé numérique apparemment en panne ; la seule issue est de trouver `⌫` ou `C`. Aucun test ne couvre la réouverture sur 3 chiffres suivie d'une frappe. [src/components/PlayerSetupModal.vue:41,59]
- [x] [Review][Decision] Géométrie de la modale — la carte est en `h-full max-h-[900px]` : elle mesure 704×900 en 768×1024 et 896×704 en 1024×768, soit 88 à 92 % de l'écran, l'arrière-plan flouté se réduisant à un liseré de 32-64 px. C'est le motif même du rejet de la première UX. Corollaire : sous ~726 px de hauteur (tablette 1024×600, courante en borne de club), le clavier déborde d'une carte sans `overflow`, et `VALIDER` — plus loin dans le DOM et opaque — se peint par-dessus la dernière rangée : taper `ESPACE`/`⌫`/`0` **valide** au lieu de saisir. Calcul : fixe 374 px (p-4 64 + 3×gap-3 72 + header 58 + champs 90 + footer 90) + pavé mini 288 px (4×60 + 3×16) = 662 px + 64 px de voile. Marge de 42 px seulement aux formats cibles actuels. [src/components/PlayerSetupModal.vue:80,143]
- [x] [Review][Decision] AC#12 non satisfait tel qu'écrit — `AlphaKeyboard` plafonne à `min-h-[44px]` sans aucun `min-w`, `NumericPad` à `min-h-[60px]` ; la convention du projet impose `min-h-[var(--size-touch-target)]` (90 px). C'est déclaré en « Compromis assumés » n°1 et 2 et arbitré verbalement, mais l'AC#12 et UX-DR8/NFR9 ne portent pas la trace de cet arbitrage. À formaliser dans les AC plutôt que dans les seules Completion Notes.
- [x] [Review][Decision] Task 8 incomplète — UX-DR19 laissé en contradiction frontale avec l'UX livrée. Six endroits affirment encore l'édition inline du nom « sans modale séparée » : `epics.md:167` (UX-DR19), `epics.md:342` (AC de la Story 1.3, désormais faux dans le code), `epics.md:594` (Story 1.14, rendue inapplicable par la décision « borne fixe »), `ux-design-specification.md:247`, `:287`, `:414`. La Task 8.7 est cochée alors que `ux-design-specification.md` n'a reçu que des blocs ajoutés en dessous, laissant les deux affirmations côte à côte.

- [x] [Review][Patch] Caret absent sur le champ `DISTANCE` — Task 5.4 exige « un caret clignotant sur le champ visé », seul `name-field` en porte un [src/components/PlayerSetupModal.vue:132-137]
- [x] [Review][Patch] Le liseré du champ visé n'est prouvé par aucun test **(mutation)** — supprimer `:class="focused === … ? 'border-turn-active bg-white/6' : 'border-white/12'"` sur les deux champs laisse 89/89 verts. Aucune occurrence de `turn-active` ni de `border-` dans le fichier de test. Par ailleurs le signal est purement chromatique (les deux champs portent toujours `border-2`, seule la teinte change), alors que la fiche écrite par la Task 8.7 promet « la **présence** d'un liseré […] signal non-chromatique » [src/components/PlayerSetupModal.test.ts]
- [x] [Review][Patch] AC#8 non prouvé pour le nom **(mutation)** — remplacer `:name="names[editing]"` par `:name="''"` laisse 89/89 verts. Le test « reopens a zone on the values already set for it » ne vérifie que `targetScore` [src/components/HomeScreen.test.ts]
- [x] [Review][Patch] Test `uppercases the name typed in the modal` tautologique **(mutation)** — retirer `.toUpperCase()` de `applySetup` laisse 89/89 verts : le clavier n'émet que des majuscules et l'utilitaire de test met lui-même en majuscule avant de mapper les touches. Aucun chemin ne produit de minuscule [src/components/HomeScreen.vue:99, src/components/HomeScreen.test.ts]
- [x] [Review][Patch] Test `refuses a leading space` non discriminant **(mutation)** — il passe même avec `appendChar` entièrement neutralisé, car `nameOf()` lit le libellé d'attente `JOUEUR` et non la valeur [src/components/PlayerSetupModal.test.ts]
- [x] [Review][Patch] Les espaces de fin consomment le quota de 20 caractères puis sont trimés — `MICHEL` + 14 `ESPACE` remplit le buffer à 20, le clavier cesse silencieusement de répondre alors que le rendu HTML replie les espaces, et `.trim()` ne laisse que 6 caractères à la validation. Le plafond utile est arbitrairement inférieur à 20 [src/components/PlayerSetupModal.vue:47-52]
- [x] [Review][Patch] Espaces internes multiples non repliés — `MICHEL␣␣␣␣DUPONT` part tel quel dans le store ; tout consommateur non-HTML futur (persistance 1.12, base joueurs Epic 4, comparaison de noms) verra une chaîne différente de celle affichée [src/components/HomeScreen.vue:99]
- [x] [Review][Patch] `editing` n'est pas réinitialisé par `back()` — latent : la modale disparaît par le garde `step === 'players'` du `v-if`, puis **se rouvre toute seule** au retour sur l'étape joueurs, sur un mode différent et des valeurs qui viennent d'être effacées. Le seul rempart actuel est que le voile `fixed inset-0 z-50` recouvre le bouton RETOUR — un ordre de superposition qu'aucun test ne verrouille [src/components/HomeScreen.vue:73-85]
- [x] [Review][Patch] Libellé d'attente de la zone joueur indiscernable d'un nom validé — la modale grise soigneusement son placeholder (`text-white/25`), la zone affiche `JOUEUR 1` dans le même style qu'un nom saisi. Avant `DÉMARRER`, rien ne dit si la bille blanche a été réglée [src/components/HomeScreen.vue:181]
- [x] [Review][Patch] Le ref local `name` masque la prop `name` du même composant — asymétrique avec `distance`/`props.targetScore`, correctement nommés. Le remontage forcé par `:key="editing"` est le seul mécanisme qui rend la copie ponctuelle sûre, et il n'est verrouillé par aucun test [src/components/PlayerSetupModal.vue:38]
- [x] [Review][Patch] Micro-déplacement à la bascule de champ — caret rendu **avant** le libellé quand le nom est vide (`mr-0.5`), **après** quand il est rempli : viser `NOM` vide décale `JOUEUR` vers la droite, ce que l'AC#3 (« rien ne se déplace ») interdit [src/components/PlayerSetupModal.vue:107-121]
- [x] [Review][Patch] Documentation périmée par la Révision d'UX — commentaire mort dans `HomeScreen.test.ts:17-18` (« la modale porte sa propre barre d'action […] son RETOUR » : la modale n'a ni barre d'action ni RETOUR) ; dans « État du code au démarrage », la ligne `HomeScreen.vue` annonce encore « Ajoute le bouton `FORMAT` » et la ligne `ActionBar.vue` « Réutilisée telle quelle dans la modale » alors que `PlayerSetupModal` ne l'importe pas ; renvoi « Task 5.6 » à corriger en « Task 6.7 »

- [x] [Review][Defer] Le plafond de distance est défini deux fois, dans deux unités — `MAX_DIGITS = 3` (modale) et `MAX_TARGET_SCORE = 999` (store) ne s'accordent que par coïncidence numérique ; si la règle produit passe à 500, la zone joueur affichera 999 et `startGame` reclampera silencieusement [src/components/PlayerSetupModal.vue:9, src/stores/useGameStore.ts:8] — deferred, latent
- [x] [Review][Defer] Aucune protection contre deux joueurs de même nom — les deux panneaux affichent le même libellé et `swapPlayers()` échange les côtés : plus rien ne dit à qui appartient quel score [src/components/HomeScreen.vue:94-102] — deferred, hors périmètre de la story
- [x] [Review][Defer] `button:focus-visible` promet une interaction clavier qu'AR8 interdit — le contour de 4 px se dessine au `Tab`, mais `Entrée`/`Espace` émettent `click` et aucune touche ne réagit [src/assets/main.css:83-86] — deferred, pré-existant (Story 1.3), AR8 assumé

## Dev Notes

### Révision d'UX du 2026-09-09 (Nathan) — elle prime sur tout ce qui suit

La première implémentation (bouton `FORMAT` dans la barre d'action ouvrant une modale plein écran unique, avec mode « lié » et bouton `HANDICAP` pour dissocier) a été **rejetée à la revue de rendu** : « c'est pas clean et ça reprend pas l'aspect modale que je voulais ». Elle a été entièrement remplacée.

1. **Un réglage par joueur, depuis sa propre zone.** Plus de bouton `FORMAT`, plus de notion de distances liées ni de dissociation. Chaque joueur tape sa zone (blanche ou jaune) et règle **son** nom et **sa** distance. Le handicap n'est plus un mode : c'est la conséquence naturelle de deux saisies indépendantes.
2. **Une vraie pop-up, pas un écran plein.** Carte centrée, arrière-plan flouté, croix en haut à gauche, fermeture au tap extérieur. *L'interdiction de fermeture au tap extérieur qui figurait dans la version précédente de cette story était une extrapolation : UX-DR12 porte sur la navigation de `HomeScreen`, pas sur les modales. AR6 (« modales inline, sans route dédiée ») est respecté.*
3. **Le nom est saisi dans la modale**, plus en ligne sur la carte joueur.
4. **Claviers intégrés, clavier système bloqué.** L'écran cible est une **borne fixe** (décision produit du 2026-09-09), pas une tablette prise en main : le clavier du système n'a pas à monter par-dessus l'interface. La modale ne contient donc **aucun champ natif** — garantie par construction plutôt que par `inputmode="none"`.
5. **Raisonner en tactile tablette, viser le premium.** Consigne générale de Nathan sur ce projet, pas seulement pour cette story.

### Décisions produit du 2026-09-08 (Nathan) — toujours valables

1. **Aucune distance par défaut, pour aucun mode.** Le catalogue `GAME_CATEGORIES` ne porte pas de distance et n'en portera pas dans cette story. À l'ouverture, la modale affiche `LIBRE` (0) des deux côtés. Ceci **annule** l'AC ajouté par `sprint-change-proposal-2026-09-08.md` §4.2(b) (« objectif pré-rempli avec la distance de référence du mode ») : ne pas l'implémenter, et corriger `epics.md` (Task 7.1).
2. **La distance appartient au joueur, pas à la partie.** Convention coréenne du handicap (observée en 3 Bandes) : les deux joueurs peuvent jouer des distances différentes. `targetScore` migre donc de `GameState` vers `Player` dès maintenant, pour éviter une migration ultérieure du store, de `PlayerPanel` et de la persistance (Story 1.12). L'association durable distance ↔ joueur ↔ mode est une piste V2+ (base joueurs, Epic 4) — **hors périmètre ici**.
3. **Réglage optionnel, pas un écran de plus.** Le parcours par défaut reste `catégorie → mode → joueurs → jeu`, inchangé depuis la Story 1.3 (AC#11). Le réglage s'ouvre depuis l'étape joueurs, conformément à AR6.
4. **Saisie au pavé numérique** (et non par pas `−`/`+` ni par valeurs prédéfinies), d'où la création anticipée de `NumericPad.vue` en composant présentationnel réutilisable. La révision du 2026-09-09 y ajoute `AlphaKeyboard.vue` pour le nom.
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
| `src/components/HomeScreen.vue` | 3 étapes (`category` → `mode` → `players`), `ActionBar` avec slot `#actions` portant `DÉMARRER` | Rend les deux zones joueur tapables, chacune ouvrant `PlayerSetupModal` ; `DÉMARRER` reste seul dans la barre |
| `src/components/PlayerPanel.vue` | Prop `targetScore` affichée en haut à droite (`data-testid="target-score"`) | Lit `player.targetScore`, masque si 0 |
| `src/components/ActionBar.vue` | Barre basse commune, props `backLabel`/`showBack`, emit `back`, slot `#actions` | **Inchangée, et non utilisée par la modale** : `PlayerSetupModal` porte sa croix et son `VALIDER` pleine largeur, pas de barre d'action |
| `src/views/GameView.vue` | Passe `targetScore` aux deux panneaux | Retire la prop |

`NumericPad.vue` n'existe pas encore : c'est cette story qui le crée (il est listé dans `architecture.md` comme composant V1a et dans le roadmap UX « Phase 1 »).

### Pièges vérifiés en revue de la Story 1.3 — à ne pas rejouer

- **Classes Tailwind littérales obligatoires.** Une classe construite par template literal (`` `bg-player-${color}` ``) n'est pas vue par le scanner JIT de Tailwind v4 et n'est jamais générée. Le bug avait traversé toute la suite de tests (happy-dom ne compile pas le CSS). Dans la modale, écrire les classes de bille en toutes lettres, ou réutiliser la table `PLAYER_COLOR_CLASSES` de `PlayerPanel.vue`.
- **`--spacing` vaut 8px, pas 4px** (CLAUDE.md §7) : `p-6` = 48px, `gap-4` = 32px, `px-10` = 80px. Dimensionner la modale en gardant cette table en tête.
- **`text-score` (plancher 120px) déborde hors d'un panneau joueur.** Pour la distance affichée dans la modale, utiliser `text-reprise` (clamp 48-120px) ou `text-label` ; jamais `text-score`.
- **`reprises` est un `shallowRef`** : toute évolution doit **remplacer** le tableau, jamais le muter. Cette story n'y touche pas — ne pas l'oublier si un test en manipule.
- **`@pointerdown` seul, jamais `@click`** (AR8, décision assumée en revue : pas d'activation clavier). Les tests utilisent `trigger('pointerdown')`.
- **Gardes dans l'action, pas dans le template.** `selectMode` n'avait pas la garde de `selectCategory` ; `swapPlayers()` n'était gardé que par la vue. Normaliser/borner la distance dans `startGame`, pas seulement dans la modale.
- **Réinitialisation complète.** `resetGame()` oubliait `mode`/`targetScore`/`lastSaved`, ce qui reconduisait silencieusement l'état précédent. Même exigence ici pour `targetScores` au retour en arrière dans `HomeScreen` (Task 6.7).
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
├── AlphaKeyboard.vue       (nouveau)
├── AlphaKeyboard.test.ts   (nouveau)
├── PlayerSetupModal.vue    (nouveau)
├── PlayerSetupModal.test.ts(nouveau)
├── keyClasses.ts           (nouveau — style de touche partagé par les deux claviers)
```

`MatchFormatModal.vue`, créé puis supprimé le 2026-09-09 avec la première UX, n'existe plus.

`services/` et `composables/` restent vides — aucune AC de cette story ne les nécessite (pas de persistance, pas d'interaction pointer complexe). `PlayerSetupModal` est un composant, pas une vue : il n'a pas de route (AR6) et ne va pas dans `views/`.

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
| 2026-09-09 | **Revue de code (3 couches adverses) et traitement des constats.** 6 décisions tranchées : voile en `@pointerup` (une paume d'appui ne jette plus la saisie), première frappe remplaçant une distance déjà réglée (une distance à 3 chiffres était inéditable, tout le pavé restait inerte), carte à hauteur de contenu + `overflow-hidden` (la modale occupait 88-92 % de l'écran ; elle tombe à **66 %** en portrait, et plus rien ne peut se peindre sous `VALIDER`), exemption des touches de clavier à la règle 90×90 tracée dans l'AC#12 et UX-DR8, réécriture d'UX-DR19 et de ses 5 renvois (6 endroits affirmaient encore l'édition inline, contredite par l'UX livrée), couverture du clavier (trait d'union, apostrophe, `Ë Ï Î Ô Û`) reportée à l'Epic 4. 17 patches appliqués : caret manquant sur `DISTANCE`, 4 tests non discriminants prouvés par mutation, espaces de fin mangeant le plafond de 20, `editing` non réinitialisé par `back()`, placeholder de zone non grisé, shadowing `name`/`props.name`, planchers de clavier alignés à 288 px (la carte se redimensionnait de 4 px à la bascule), docs périmées. Suite portée de 89 à **98 tests**. |
| 2026-09-09 | **Révision d'UX complète après rejet du rendu par Nathan.** La modale `FORMAT` unique (mode lié / bouton `HANDICAP`) est supprimée au profit d'**une pop-up par joueur**, ouverte en tapant sa zone : carte centrée sur arrière-plan flouté, croix en haut à gauche, fermeture au tap extérieur, `VALIDER` pleine largeur. Le nom quitte la carte joueur pour la modale. L'écran cible étant une **borne fixe**, la saisie passe par des claviers intégrés (`AlphaKeyboard` AZERTY + chiffres + accents, `NumericPad` avec `AC`/`C` et retour arrière) et la modale ne contient **aucun champ natif**, ce qui empêche structurellement le clavier système de se déclencher. `MatchFormatModal` supprimée ; `AlphaKeyboard`, `PlayerSetupModal` et `keyClasses.ts` créés. Suite portée à 89 tests, tous verts. Deux défauts trouvés au rendu et corrigés : `VALIDER` sortait de la carte, et la modale s'ouvrait pré-remplie du nom par défaut (« JOUEUR 1MICHEL »). |
| 2026-09-09 | Passe de validation visuelle (Task 8.2) faite en 1024×768 et 768×1024 via une page-harnais iframe (fenêtre Chrome non redimensionnable) : aucun débordement, aucune erreur console, aucune zone tactile sous 90×90 px, AC#3/#4/#5/#6/#7 vérifiés à l'écran. Un défaut cosmétique relevé en portrait (retour à la ligne du libellé `FORMAT`), laissé à arbitrage. Story passée en `review`. |
| 2026-09-09 | Implémentation des Tasks 1 à 7 et de la Task 8.1/8.3. 4 fichiers créés (`NumericPad`, `MatchFormatModal` et leurs tests), 9 modifiés. Suite de tests portée de 38 à 75 tests, tous verts ; `vue-tsc -b` et `npm run build` verts. Specs resynchronisées : `epics.md` (Stories 1.4, 1.5, 1.11, 2.1), `architecture.md` (`targetScore` sur `Player`, `MatchFormatModal` ajoutée), `ux-design-specification.md` (Custom Component + réglage optionnel du format), `sprint-change-proposal-2026-09-08.md` (§4.2(b) marqué superseded). Task 8.2 (passe navigateur) non exécutée : extension Chrome non connectée. |
| 2026-09-08 | Création de la story. Trois décisions produit de Nathan la font diverger des écrits antérieurs : aucune distance par défaut par mode (annule l'AC ajouté par le change proposal §4.2(b)), distance **par joueur** dès la V1a pour supporter le handicap façon coréenne (`targetScore` migre de `GameState` vers `Player`), saisie au pavé numérique dans une modale optionnelle de l'étape joueurs (parcours de démarrage inchangé). Le nombre de sets sort du périmètre : notion propre au 3 Bandes, traitée dans l'Epic 2. |

## Dev Agent Record

### Agent Model Used

- Tasks 1.1/1.2 (déplacement de `targetScore` dans `Player`) : session antérieure, modèle différent, interrompue avant la Task 2 — les cases n'avaient pas été cochées et le code ne compilait plus (`vue-tsc` en erreur sur `useGameStore.ts` et `PlayerPanel.test.ts`).
- Tasks 1.3 à 8 : `claude-opus-5`.

### Debug Log References

- **`node_modules` absent au démarrage** de la session : `npm install` rejoué (452 paquets). Le `package-lock.json` a perdu 110 lignes d'entrées de plateformes optionnelles au passage — **aucune dépendance ajoutée ni supprimée** (`git diff` sur le lockfile ne contient aucune nouvelle clé `node_modules/`).
- **Fragment à deux nœuds racine sur `MatchFormatModal`** : le commentaire HTML placé au-dessus du `<div>` racine faisait du composant un fragment, `wrapper.classes()` renvoyait `[]` et l'héritage d'attributs était perdu. Commentaire déplacé à l'intérieur de la racine.
- **`node:fs` non typé dans `src/`** : les tests qui relisent la source d'un composant pour prouver l'absence de `@click` (AR8) échouaient sous `vue-tsc`, `tsconfig.app.json` n'exposant que les types `vite/client`. Résolu par un import `?raw` (typé par `vite/client`) plutôt qu'en ajoutant les types Node à la config de l'app — y ajouter `node` aurait laissé passer `process` et consorts dans du code navigateur.

- **Fenêtre Chrome non redimensionnable** pendant la passe visuelle : `resize_window` répondait « success » sans que le viewport bouge (1384×823, fenêtre en plein écran macOS). Contourné par une page-harnais temporaire (`public/_viewport-harness.html`) affichant l'application dans une iframe aux dimensions exactes demandées — `contentWindow.innerWidth/innerHeight` confirmés à 1024×768 puis 768×1024, donc breakpoints Tailwind et débordements évalués sur le vrai viewport de l'application. **Harnais supprimé après la passe.**

### Completion Notes List

**Livré et testé (89 tests verts, `vue-tsc -b` et `npm run build` verts, passe navigateur faite aux deux formats tablette).**

- **Types et store (Tasks 1-2)** — `targetScore` vit sur `Player`, plus sur `GameState`. `startGame` prend un 4e paramètre **optionnel**, donc les appels de la Story 1.3 fonctionnent inchangés. Normalisation `Math.trunc` + clamp `[0, 999]` dans l'action, avec garde `Number.isFinite`.
- **`NumericPad.vue` (Task 3)** — présentationnel : `digit`, `clear`, `backspace`. Rang du bas `AC`/`C` · `0` · `⌫`, le `0` sous le `8`. `hasInput` ne pilote que le libellé d'effacement.
- **`AlphaKeyboard.vue` (Task 4)** — AZERTY 10 colonnes, rangée de chiffres, accents `É È À Ç`, espace et retour arrière. Style de touche partagé avec le pavé via `keyClasses.ts`, pour que la bascule d'un clavier à l'autre soit invisible.
- **`PlayerSetupModal.vue` (Task 5)** — pop-up centrée sur voile flouté, croix, tap extérieur, `VALIDER` pleine largeur. Champs `NOM` et `DISTANCE` sans aucun élément natif, caret clignotant sur le champ visé. Un seul emplacement de clavier, en `flex-1 min-h-0`, claviers en `auto-rows-fr`.
- **`HomeScreen.vue` (Task 6)** — zones joueur tapables, bouton `FORMAT` supprimé, `DÉMARRER` seul dans la barre. `back()` réinitialise noms et distances.
- **`PlayerPanel` / `GameView` (Task 7)** — la prop `targetScore` disparaît, le panneau lit `player.targetScore` et masque l'emplacement à 0.

**Deux défauts trouvés à la validation visuelle et corrigés :**

1. **`VALIDER` sortait de la carte** — 28 px de débordement en 1024×768, bien plus en basculant sur le pavé numérique, plus haut que l'AZERTY. Corrigé en donnant la place restante à la zone clavier : en-tête, champs et `VALIDER` sont fixes, les touches se partagent le reste et grandiront sur un plus grand écran. Débordement mesuré à **0** dans les deux formats et avec les deux claviers.
2. **La modale s'ouvrait pré-remplie** du nom par défaut, donc la première frappe donnait « JOUEUR 1MICHEL ». `JOUEUR 1` / `JOUEUR 2` sont désormais des **libellés d'attente** ; le nom réel n'est posé qu'au démarrage de la partie. Attrapé par un test, pas à l'œil.

**Compromis assumés, à valider en revue :**

1. **Touches de lettres sous 90 px.** Dix colonnes dans une pop-up donnent des touches de **~57 px de large en portrait 768** et ~77 px en paysage — sous la règle projet des 90×90 px (AR8, NFR9). Aucun clavier alphabétique ne peut respecter cette règle à cette largeur ; celui de l'iPad tourne autour de 65 px. La règle garde tout son sens pour les commandes de jeu, qui elles la respectent. Nathan a arbitré en connaissance de cause, l'écran cible devant s'agrandir.
2. **Pavé numérique à 266×65 px** en 1024×768 : très large, un peu moins haut que 90. Même arbitrage.
3. **`0` sans double largeur.** Il fallait loger `AC`, `0` et `⌫` sur le rang du bas ; la grille 3×4 est régulière mais le `0` n'est plus élargi.
4. **Pas de bouton `AC` inerte.** `AC` sur un champ vide n'a aucun effet — comportement voulu, repris de la calculatrice iOS.

**Vérification que je ne peux pas faire :** la garantie « le clavier iPadOS ne se déclenche pas » a été construite en supprimant tout champ natif, et un test verrouille cette absence. Mais la confirmation sur **un vrai iPad** appartient à Nathan — Chrome sur macOS ne la fournit pas.

**Point signalé, hors périmètre :** `epics.md:40` (FR12), `prd.md:100` et `prd.md:264` affirment encore que les six modes JDS « ne se distinguent que par leur distance de jeu par défaut », en tension avec la décision « aucune distance par défaut ». Lisible comme une affirmation sur le jeu et non sur l'application, donc **non modifié** : toucher au PRD est une décision produit.

### File List

**Créés**

- `carom-scoreboard/src/components/NumericPad.vue`
- `carom-scoreboard/src/components/NumericPad.test.ts`
- `carom-scoreboard/src/components/AlphaKeyboard.vue`
- `carom-scoreboard/src/components/AlphaKeyboard.test.ts`
- `carom-scoreboard/src/components/PlayerSetupModal.vue`
- `carom-scoreboard/src/components/PlayerSetupModal.test.ts`
- `carom-scoreboard/src/components/keyClasses.ts`

**Créé puis supprimé** (première UX, abandonnée le 2026-09-09)

- `carom-scoreboard/src/components/MatchFormatModal.vue`
- `carom-scoreboard/src/components/MatchFormatModal.test.ts`

**Modifiés — code**

- `carom-scoreboard/src/types/game.ts`
- `carom-scoreboard/src/stores/useGameStore.ts`
- `carom-scoreboard/src/stores/useGameStore.test.ts`
- `carom-scoreboard/src/components/HomeScreen.vue`
- `carom-scoreboard/src/components/HomeScreen.test.ts`
- `carom-scoreboard/src/components/PlayerPanel.vue`
- `carom-scoreboard/src/components/PlayerPanel.test.ts`
- `carom-scoreboard/src/views/GameView.vue`
- `carom-scoreboard/src/views/GameView.test.ts`
- `carom-scoreboard/package-lock.json` (effet de bord de `npm install`, aucune dépendance modifiée)

**Modifiés — specs**

- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-08.md`
- `_bmad-output/implementation-artifacts/1-4-configurer-les-parametres-du-match-avant-de-demarrer.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

> Le **nom de fichier et la clé de sprint restent inchangés** (`1-4-configurer-les-parametres-du-match-avant-de-demarrer`) bien que le titre de la story ait évolué : la clé est l'identifiant stable du suivi de sprint.
