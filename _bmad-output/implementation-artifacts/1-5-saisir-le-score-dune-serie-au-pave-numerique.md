# Story 1.5: Saisir le score d'une série au pavé numérique

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a joueur,
I want saisir le score de ma série sur un pavé tactile,
so that j'enregistre mon résultat sans calcul mental ni ambiguïté sur la validation.

## Acceptance Criteria

> **Réécrits le 2026-09-09** après trois passes de refonte produit menées avec Nathan pendant l'implémentation. Ils décrivent l'écran tel qu'il est livré. L'historique des versions précédentes est au Change Log ; les AC d'origine (pavé permanent dans le panneau, overlay sur le bloc, emplacement réservé de `VALIDER`) sont **caducs**.

### Lecture du score

1. **Given** une partie en cours **When** j'observe un panneau joueur **Then** il ne porte que le strict nécessaire — en-tête, **score aussi grand que la carte le permet**, et deux boutons de correction — aucun pavé numérique n'y est visible.
2. **Given** un score de 1 à 4 chiffres **When** il s'affiche **Then** sa taille s'adapte au nombre de chiffres pour rester le plus grand possible **sans jamais déborder** de la carte, en paysage 1024×768 comme en portrait 768×1024. *(Le plafond FR7 de 999 porte sur une **série**, pas sur le total : un total à 4 chiffres est atteignable.)*
3. **Given** un panneau joueur **When** je lis son en-tête **Then** le **nom**, la **moyenne** de la partie en cours, la **meilleure série** et la **distance** tiennent sur **une seule ligne**. Si la place manque, seul le **nom** est tronqué — jamais une valeur chiffrée, qui deviendrait fausse à la lecture.

### Saisie d'une série

4. **Given** une partie en cours **When** j'observe la barre basse **Then** un bouton **`AJOUTER LES POINTS`** occupe **toute la largeur du bloc joueur** sous lequel il se trouve, et il est placé du côté du joueur qui **n'a pas** la main — au billard, c'est l'adversaire assis qui compte les points de celui qui joue. Le picto de **sortie** occupe la colonne opposée. Les deux échangent de place à chaque bascule de tour.
5. **Given** que j'appuie sur `AJOUTER LES POINTS` **Then** une **pop-up** de saisie s'ouvre — même coquille que la modale de configuration : voile flouté, carte centrée, croix de fermeture, CTA en pied — et elle **reste ouverte quand je relâche le doigt**.
6. **Given** la pop-up ouverte **When** je tape un chiffre **Then** la valeur en cours s'affiche en grand dans la carte, dans la couleur du joueur, avec un retour **haptique + visuel** en moins de 100 ms (FR11, NFR1, UX-DR17).
7. **Given** une saisie déjà à 3 chiffres (plafond FR7 : 999) **When** je tape un 4ᵉ chiffre **Then** la frappe est **ignorée** — la valeur ne change pas — et le refus est signalé par un retour haptique **distinct** (plus court et sec) plus une pulsation brève de la valeur, sans message ni blocage d'écran (UX-DR10).
8. **Given** une saisie en cours **When** je tape `⌫` **Then** le dernier chiffre est effacé ; **When** je tape `C` **Then** la saisie est vidée — dans les deux cas le total du joueur est inchangé.
9. **Given** une saisie en cours **When** je tape `VALIDER` **OU** que 3 secondes s'écoulent sans frappe **Then** la série est enregistrée sur le joueur **qui a la main**, la pop-up se referme et le total est mis à jour — les **deux chemins aboutissent exactement au même état** (FR2, FR7, UX-DR15).
10. **Given** une saisie en cours **When** je referme la pop-up par la croix **ou** par un tap complet en dehors de la carte **Then** rien n'est enregistré, aucun compteur ne bouge, le tour ne bascule pas, et la saisie abandonnée ne réapparaît pas à l'ouverture suivante.
11. **Given** un pavé vide **When** je tape `0` puis `VALIDER` **Then** une série de **0** est enregistrée (le 0 est le score de série le plus courant au carambole) ; **When** je tape ensuite un chiffre sur un buffer valant `0` **Then** ce chiffre **remplace** le zéro (`0` puis `7` donne `7`, jamais `07`).
12. **Given** une saisie vide **When** je tape `VALIDER` **Then** rien ne se passe — aucune série fantôme, aucun compteur, **et le tour ne bascule pas**.

### Alternance et reprises

13. **Given** ma série validée, par `VALIDER` **ou** par l'auto-validation à 3 s **When** elle est enregistrée **Then** le tour passe **automatiquement** à l'autre joueur et le liseré rouge se déplace sur son panneau (UX-DR14). Rentrer sa série **est** l'acte de rendre la main.
14. **Given** que je n'ai pas marqué **When** je tape la **zone de l'adversaire** **Then** le tour bascule sans que mon total change — mais une **série de 0 est bien enregistrée** : une reprise blanchie reste une reprise jouée et doit compter dans ma moyenne. Taper sa **propre** zone ne fait rien.
15. **Given** que c'est le joueur **blanc** (gauche) qui ouvre chaque reprise **When** j'observe la console centrale **Then** le numéro de **REPRISE** n'avance que lorsque le blanc **reprend la main** : la série du seul joueur blanc laisse l'affichage sur « REPRISE 1 », c'est la validation du jaune qui ouvre la suivante.

### Corrections

16. **Given** les boutons `−` et `+` en pied de carte **When** j'en presse un **Then** le total du joueur est corrigé de ±1 **sans toucher au déroulé de la partie** : aucune reprise créée, aucune bascule de tour, aucun effet sur la meilleure série. La correction entre en revanche dans le total, donc dans la moyenne, et **ne fait jamais basculer le tour** même sur le panneau de l'adversaire.
17. **Given** le bouton **`ÉCHANGER`** de la console centrale **When** je l'utilise **Then** il est disponible **pendant toute la partie**, et chaque joueur emporte de l'autre côté **tout son historique** — séries, total, moyenne, meilleure série et corrections.

### Transverses

18. **Given** la console centrale **When** je la regarde **Then** elle n'affiche plus le mode de jeu : il est choisi au démarrage et n'évolue pas.
19. **Given** l'ensemble de l'écran **When** j'interagis **Then** tous les événements passent par `@pointerdown` — aucun `@click` ni `@touchstart` (AR8). Seule exception documentée : le voile des pop-ups, qui ferme sur un geste **complet** (appui **et** relâchement sur le voile).
20. **Given** l'écran de partie **When** je mesure ses commandes **Then** toute zone de commande fait au moins 90×90 px (les touches de clavier relèvent de l'exception UX-DR8, plancher 60 px), et les contrastes texte/fond respectent WCAG AA sur le bloc **blanc** comme sur le bloc **jaune** (UX-DR22, NFR10). Le CTA et `VALIDER` portent l'accent système bleu, jamais une couleur joueur (UX-DR3).

## Tasks / Subtasks

> **Réécrites le 2026-09-09** pour décrire le travail réellement livré, refontes comprises. Le détail des étapes intermédiaires et des défauts corrigés en cours de route est au Change Log et dans le Dev Agent Record.

- [x] **Task 1 — Modèle de partie dans `useGameStore`** (AC: 7,8,9,11,12,13,14,15,16,17)
  - [x] 1.1 `MAX_SCORE_DIGITS = 3` en export nommé : **définition unique** du plafond, importée par la pop-up au lieu d'être réécrite.
  - [x] 1.2 Buffer de saisie : `appendScoreDigit` (retourne `false` sur refus, pour distinguer les deux haptiques), `clearScoreInput`, `backspaceScoreInput`. Règle du zéro : un buffer `'0'` est **remplacé** par le chiffre suivant, jamais préfixé.
  - [x] 1.3 `addReprise(playerId, value)` — seule action qui enregistre une série. Complète la dernière reprise si elle attend ce joueur, sinon en ouvre une nouvelle. ⚠️ `reprises` est un `shallowRef` (AR9) : le tableau est **remplacé**, jamais muté — un `push` figerait le compteur REPRISE et `ANNULER`.
  - [x] 1.4 `player.score` recalculé comme **somme des séries + correction manuelle**, jamais incrémenté : `reprises` reste la source de vérité, ce qui rendra la Story 1.8 exacte sans arithmétique inverse.
  - [x] 1.5 `switchTurn()` publique (l'Epic 2 y branchera sa bascule au tap) et `validateScoreInput(playerId)` — no-op strict sur buffer vide, sinon série + vidage + bascule. Chemin **unique** partagé par le bouton et l'auto-validation.
  - [x] 1.6 `passTurn()` — rendre la main sans marquer : enregistre une **série de 0** pour le joueur actif puis bascule. Le raccourci porte sur le geste, pas sur le modèle.
  - [x] 1.7 `adjustScore(playerId, delta)` + `scoreAdjustments` tenu **à part des reprises** : c'est ce qui permet de corriger le total sans créer de reprise ni toucher au tour. Volontairement **non borné** — un score peut passer sous zéro (pénalités, Story 1.9).
  - [x] 1.8 Getters `completedReprises`, `averages` et `bestSeries` par joueur. La moyenne divise par les reprises **de ce joueur**, pas par le nombre de lignes.
  - [x] 1.9 `swapPlayers()` disponible toute la partie, et **permute les colonnes de `reprises` et les corrections** : le score étant recalculé depuis ce tableau, sans permutation chaque joueur héritait du total de l'autre.
  - [x] 1.10 Tests store, dont les anti-régressions : `shallowRef` non muté, moyenne comptant une reprise blanchie, correction survivant à une série ultérieure, et **recalcul forcé après échange et après redémarrage** — sans quoi les assertions lisent une valeur transportée et ne prouvent rien (démontré par mutation).

- [x] **Task 2 — Composable `useHaptics`** (AC: 6,7)
  - [x] 2.1 `useHaptics()` → `{ tap, reject }`, export nommé (AR15).
  - [x] 2.2 Garde `typeof navigator.vibrate === 'function'` obligatoire : l'API est absente de happy-dom **et** de Safari iOS/iPadOS, et TypeScript ne protège pas (`lib.dom.d.ts` la déclare toujours présente).
  - [x] 2.3 Deux durées distinctes (40 ms / 15 ms) : c'est leur **différence** qui porte le sens du refus (UX-DR10), et c'est la seule chose que le test verrouille.

- [x] **Task 3 — `ScoreEntryModal.vue`, la pop-up de saisie** (AC: 5,6,7,8,9,10,19,20)
  - [x] 3.1 Coquille reprise de `PlayerSetupModal` pour que les deux pop-ups du produit se ressemblent. Présentationnelle : le buffer vit dans le store, elle le reçoit et émet.
  - [x] 3.2 Valeur en cours en grand dans la couleur du joueur, flash de succès, pulsation de refus. Plafond décidé **localement** depuis la constante importée, pour que l'haptique reste synchrone dans le handler (NFR1).
  - [x] 3.3 `VALIDER` avec compte à rebours visible, et timer d'auto-validation à 3 s nettoyé à la fermeture — sinon la série s'enregistrerait après coup.
  - [x] 3.4 ⚠️ **Fermeture par le voile sur un geste COMPLET** (appui *et* relâchement). Le seul relâchement refermait la pop-up à son ouverture même, le `pointerup` du geste qui a pressé le CTA retombant sur le voile fraîchement monté. Corrige aussi le doigt qui glisse de la carte vers le voile.

- [x] **Task 4 — `PlayerPanel.vue` réduit à la lecture du score** (AC: 1,2,3,14,16)
  - [x] 4.1 Toute la saisie retirée du panneau : plus de pavé, plus d'overlay, plus de `VALIDER`.
  - [x] 4.2 Taille du score par paliers selon le nombre de chiffres, chaque palier bornant largeur (`vw`), hauteur (`vh`) et plafond absolu. Paliers **calés au navigateur** : ~9 % de marge de chaque côté à 2, 3 et 4 chiffres dans les deux formats.
  - [x] 4.3 En-tête sur une ligne, densité pilotée par **container query** (`@container`) — c'est la largeur du **panneau** qui contraint (410 px en paysage, 307 px en portrait), pas celle de l'écran.
  - [x] 4.4 Panneau tapable (`role="button"`, `@pointerdown`) émettant `pass-turn`, avec garde : celui qui a la main est inerte, sinon le joueur actif se retirerait le tour.
  - [x] 4.5 Boutons `−` / `+` en pied, en filigrane, avec `@pointerdown.stop` **obligatoire** — sans quoi corriger le score de l'adversaire lui donnerait la main du même geste.

- [x] **Task 5 — Barre basse et console centrale** (AC: 4,17,18)
  - [x] 5.1 `ActionBar` : retour compact et `shrink-0`, emplacement d'actions occupant tout le reste.
  - [x] 5.2 `GameView` : grille alignée sur les panneaux (2/5 · 1/5 · 2/5), marges négatives annulant le padding de la barre — sans elles la colonne est plus étroite que le bloc et le CTA ne s'aligne pas dessus.
  - [x] 5.3 CTA côté joueur **assis**, pleine largeur de colonne ; picto de sortie (porte + flèche, SVG en `currentColor`) à l'opposé. `ActionBar` n'assure plus le retour en partie : une place fixe ne peut pas alterner.
  - [x] 5.4 `CenterPanel` : mode de jeu retiré, `ÉCHANGER` renommé et affiché toute la partie.

- [x] **Task 6 — Vérification qualité**
  - [x] 6.1 Suite complète verte, aucune régression ; `npx vue-tsc -b` et `npm run build` verts ; aucune dépendance ajoutée.
  - [x] 6.2 **Contre-vérification par mutation** de chaque test clé, à chaque passe. Trois tests non discriminants ont été démasqués et corrigés (voir Debug Log) — la revue 1.3 puis 1.4 en avaient trouvé six, ne pas rejouer ça.

- [x] **Task 7 — Passe de validation visuelle (CLAUDE.md §9)**
  - [x] 7.1 Parcours des AC de bout en bout dans un vrai navigateur, en **1024×768** et **768×1024**, à chaque passe de refonte.
  - [x] 7.2 Contrôles : aucun débordement (comparaison des bords réels — `scrollWidth` ne détecte rien sous `overflow-hidden`), aucune zone de commande sous 90×90 px, lisibilité sur bloc blanc **et** jaune, alignement du CTA sur le bloc, console sans erreur.
  - [x] 7.3 La fenêtre Chrome ne suit pas `resize_window` : contournement par la page-harnais iframe `public/_viewport-harness.html`, **supprimée** après chaque passe.

- [x] **Task 8 — Synchronisation des specs**
  - [x] 8.1 `ux-design-specification.md` — fiches `ActionBar`, `PlayerPanel` et `NumericPad` corrigées, §2.5 réécrite (la saisie est en pop-up, plus dans le panneau).
  - [x] 8.2 `epics.md` Story 1.5 — AC alignés sur l'implémentation.
  - [x] 8.3 `epics.md` — règle d'alternance et de moyenne consignée comme **règle produit de portée générale** (elle conditionne 1.6, 1.10, 1.11 et l'Epic 2), et notes d'impact ajoutées aux Stories 1.6 à 1.9.
  - [x] 8.4 `sprint-status.yaml` mis à jour.

### Review Findings

> Revue de code du 2026-09-09 (Blind Hunter + Edge Case Hunter + Acceptance Auditor). Suite : 191 tests verts, `vue-tsc` vert.

- [x] [Review][Defer] `ÉCHANGER` en pleine reprise laisse le tour au même joueur physique et orpheline la reprise entamée — `swapPlayers` permute les colonnes mais `activePlayer` reste attaché au côté (règle 1.3, prise quand l'échange n'était possible qu'avant la première série). Séquence : blanc valide 5 → `[{5,null}]`, tour au jaune ; échange → `[{null,5}]`, le côté droit est maintenant le joueur qui vient de jouer et il a la main. Sa prochaine série ouvre une nouvelle ligne (`last.player2 !== null`), la ligne 1 reste `{null,5}` pour toujours et `completedReprises` accuse un retard d'une unité jusqu'à la fin de la partie. Aucun test ne couvre un échange pendant une reprise ouverte suivi d'une série. [1score/src/stores/useGameStore.ts:99-124,181-199] — deferred, décision de Nathan (2026-09-09) : comportement accepté et documenté (Décision 15), le tour reste attaché au côté ; `ANNULER` (1.8) sera le chemin de rattrapage
- [x] [Review][Patch] Tap fantôme à travers la pop-up qui disparaît à l'auto-validation — à 3 s, la pop-up se démonte et le tour bascule ; un doigt qui arrive quelques ms plus tard sur l'emplacement d'une touche atterrit sur le `PlayerPanel` en dessous, qui émet `pass-turn` : série de 0 pour le nouveau joueur actif et rebascule du tour, sans `ANNULER` disponible avant la 1.8. Corrigé : grâce de 300 ms après toute fermeture de la pop-up pendant laquelle `GameView` ignore `pass-turn` et `adjust-score` (choix de Nathan, 2026-09-09) ; test « ignores a tap on the panels right after the popup closed by itself ». [1score/src/views/GameView.vue]
- [x] [Review][Patch] `VALIDER` sur saisie vide referme la pop-up alors que l'AC12 dit « rien ne se passe » — `validateEntry` force `entryOpen = false` sans condition ; aucun test `GameView` ne couvre ce chemin [1score/src/views/GameView.vue:56-59]
- [x] [Review][Patch] La pulsation de refus joue à chaque ouverture de la pop-up — `animate-input-reject` est inconditionnelle sur le `span` keyé par `rejectKey` (0 au montage), le signal AC7 est dilué [1score/src/components/ScoreEntryModal.vue:157]
- [x] [Review][Patch] AC6/AC7 sans test discriminant dans `ScoreEntryModal.test.ts` — `tap()`/`reject()` jamais vérifiés (aucun mock de `navigator.vibrate` côté composant), `data-reject`/`data-flash` assertés nulle part, classe couleur de la valeur non vérifiée ; retirer `reject()`, `rejectKey += 1` ou `flashKey += 1` laisse la suite verte. Au passage : le test « swallows a keystroke once the ceiling is reached » monte avec 3 chiffres en timers réels sans démonter (timer de 3 s vivant après le test), et `mountPanel` de `PlayerPanel.test.ts` passe encore une prop `currentInput` que le composant ne déclare plus [1score/src/components/ScoreEntryModal.test.ts:27-33 ; 1score/src/components/PlayerPanel.test.ts:13-15]
- [x] [Review][Patch] Drapeau `backdropPressed` figé après un `pointercancel` ou en multi-touch — pas de `@pointercancel` ni de suivi du `pointerId` : un appui de paume annulé laisse le voile armé, et le prochain relâchement qui glisse hors de la carte jette la saisie. Idem dans `PlayerSetupModal` [1score/src/components/ScoreEntryModal.vue:126-127 ; 1score/src/components/PlayerSetupModal.vue:127-128]
- [x] [Review][Patch] Aucune garde `status === 'playing'` sur les nouvelles actions, contrairement à `swapPlayers` — `addReprise`, `passTurn`, `adjustScore`, `switchTurn`, `validateScoreInput` mutent librement un store `idle` (`passTurn()` y pousse une reprise). Inatteignable par l'UI aujourd'hui, mais incohérent avec la garde existante [1score/src/stores/useGameStore.ts:147-232]
- [x] [Review][Patch] Durée de l'auto-validation dupliquée en nombre magique — `AUTO_VALIDATE_DELAY_MS = 3000` et `input-countdown 3000ms` ne sont liés que par un commentaire ; lier `animation-duration` à la constante [1score/src/components/ScoreEntryModal.vue:29,195 ; 1score/src/assets/main.css:74]
- [x] [Review][Patch] Commentaires périmés qui contredisent le code — `main.css` décrit un « assombrissement sur le bloc joueur » alors que le flash est un `bg-white/25` sur la carte sombre de la modale ; le store dit que `PlayerPanel` importe `MAX_SCORE_DIGITS` (c'est `ScoreEntryModal`) et que le `boolean` de `appendScoreDigit` « distingue les deux haptiques » alors qu'aucun appelant ne le lit (la modale décide localement, choix justifié en Task 3.2) ; neuf références `AC#n` dans store/modale/CSS/composable utilisent l'ancienne numérotation d'avant la réécriture des AC [1score/src/assets/main.css:55 ; 1score/src/stores/useGameStore.ts:10,153]
- [x] [Review][Patch] Incohérences de la story avec le diff — la File List omet `PlayerSetupModal.vue`/`.test.ts` (modifiés) et les Completion Notes de la 2ᵉ refonte disent encore « laissée hors périmètre » ; les Dev Notes « Hors périmètre » interdisent toute zone tapable sur les panneaux (livrée par AC14) ; le tableau « État du code au démarrage » annonce `CenterPanel` inchangé, « rien à faire » sur `startGame`/`swapPlayers`/`resetGame` et un seul fichier nouveau (il y en a quatre, dont `ScoreEntryModal.vue` que les Project Structure Notes interdisent de créer) [_bmad-output/implementation-artifacts/1-5-saisir-le-score-dune-serie-au-pave-numerique.md]
- [x] [Review][Defer] Sortie destructive sur `pointerdown` sans confirmation, et qui change de colonne à chaque tour [1score/src/views/GameView.vue:113,145] — deferred, confirmation prévue Story 1.15 ; l'alternance est la décision produit AC4
- [x] [Review][Defer] Panneau entier en `role="button"` englobant deux vrais `<button>` (contenu interactif imbriqué interdit par ARIA), sans `tabindex`, ni `aria-disabled` quand il est inerte ; un appui de paume sur la carte adverse enregistre une série de 0 [1score/src/components/PlayerPanel.vue:100-105] — deferred, geste décidé par AC14, accessibilité clavier déjà hors cible (revue 1.4)
- [x] [Review][Defer] Pop-up sans `role="dialog"`/`aria-modal`, sans gestion du focus, et animations sans `prefers-reduced-motion` [1score/src/components/ScoreEntryModal.vue:120-130 ; 1score/src/assets/main.css:52-79] — deferred, pré-existant sur `PlayerSetupModal`, même arbitrage borne fixe
- [x] [Review][Defer] Voile de pop-up avec handlers pointer sans `role="button"` (CLAUDE.md §2) [1score/src/components/ScoreEntryModal.vue:120] — deferred, pré-existant sur `PlayerSetupModal` ; la règle mérite une exception explicite pour les voiles plutôt qu'un rôle ARIA erroné
- [x] [Review][Defer] Quarante lignes de CTA + SVG de sortie dupliquées pour les deux colonnes, et alignement dépendant du `px-4` d'`ActionBar` via `-mx-4`/`ml-4`/`mr-4` [1score/src/views/GameView.vue:106-176] — deferred, nettoyage sans impact fonctionnel
- [x] [Review][Defer] `MAX_TARGET_SCORE = 999` et `MAX_SCORE_DIGITS = 3` encodent FR7 indépendamment [1score/src/stores/useGameStore.ts:8-12] — deferred, pre-existing (déjà différé en revue 1.4, réconciliation hors périmètre par décision de la story)

## Dev Notes

### Décisions produit (état final, arbitrées par Nathan le 2026-09-09)

Les décisions 1 à 3 de la version initiale — `VALIDER` dans le panneau, overlay sur le bloc joueur, pavé actif des deux côtés — ont été **remplacées** par les décisions 8 à 11 ci-dessous. Elles sont conservées au Change Log pour l'historique.

4. **Le 0 est une valeur de série de plein droit.** Ne **pas** recopier `appendDigit` de `PlayerSetupModal.vue` : il refuse le zéro en tête parce qu'une distance de 0 signifie « pas d'objectif ». Une **série** de 0 est au contraire le cas le plus fréquent d'une partie de carambole. Les deux règles sont légitimement différentes.
5. **`reprises` est la source de vérité unique du score.** `player.score` est recalculé par somme à chaque enregistrement, jamais incrémenté. C'est ce qui rendra l'annulation (Story 1.8) exacte sans arithmétique inverse, et la saisie négative (Story 1.9) sans cas particulier. La correction manuelle (décision 12) est le seul terme tenu à part, et elle s'ajoute à cette somme.
6. **Alternance du tour : rentrer sa série, c'est rendre la main.** Dans les modes qui passent par le pavé numérique (JDS), la validation d'une série bascule `activePlayer`, sans geste supplémentaire — par le bouton comme par l'auto-validation à 3 s, qui devient donc aussi le **fallback de bascule**. La bascule manuelle au tap est l'affaire de l'**Epic 2**, pas de cette story, qui expose `switchTurn()` pour qu'il s'y branche.
7. **La reprise est ouverte par le joueur blanc ; la moyenne d'un joueur se fige quand il rend la main.** C'est toujours le joueur de gauche qui « met les reprises » : le compteur avance quand il **reprend** la main, pas quand il la rend. Corollaire : la moyenne d'un joueur se recalcule à la fin de **sa** série, et une reprise qu'il n'a pas jouée n'entre pas dans son compte.

8. **Le score prime sur tout le reste ; la saisie passe en pop-up** *(2026-09-09)*. Le pavé permanent dans le panneau mangeait la place du score, qui est l'information à lire à distance. Il est déplacé dans une pop-up ouverte par `AJOUTER LES POINTS`, ce qui rend la carte au score, à l'en-tête et aux corrections.
9. **Le CTA de saisie se place du côté du joueur qui n'a PAS la main** *(2026-09-09)*. Au billard, c'est l'adversaire assis qui compte les points de celui qui joue — fonctionnement observé sur les bornes de club. Le bouton est donc toujours à l'opposé du liseré de tour actif, tout en créditant le joueur **actif**. Il fait la largeur du bloc sous lequel il se trouve, et le picto de sortie occupe la colonne opposée.
10. **Rendre la main sans marquer se fait au tap sur la zone de l'adversaire** *(2026-09-09)*. Plus besoin de saisir `0` au pavé. ⚠️ Le raccourci porte sur le **geste**, pas sur le modèle : une **série de 0 est bien enregistrée**, sinon la moyenne monterait artificiellement (5 puis 3 en 3 reprises donnerait 4.000 au lieu de 2.667). Une reprise blanchie reste une reprise jouée.
11. **Un seul CTA, donc une seule saisie à la fois.** Conséquence assumée de la décision 9 : on ne peut plus saisir pour le joueur qui n'a pas la main. ⚠️ Le rattrapage d'une série oubliée passe désormais par `ANNULER` — **Story 1.8, pas encore branchée**. D'ici là, un oubli n'est pas récupérable ; c'est le principal risque résiduel de cette story.
12. **La correction manuelle ne touche pas au déroulé de la partie** *(2026-09-09)*. Les boutons `−` / `+` agissent sur un `scoreAdjustments` tenu **à part des reprises** : c'est ce qui permet de corriger un total sans créer de reprise, sans faire avancer le compteur et sans basculer le tour. Elle entre dans le total donc dans la moyenne, n'affecte pas la meilleure série, et suit son joueur à l'échange. Volontairement **non bornée** : un score peut légitimement passer sous zéro (pénalités, Story 1.9).
13. **`ÉCHANGER` reste disponible toute la partie** *(2026-09-09)*. ⚠️ Conséquence non évidente : le score étant **recalculé** depuis `reprises`, qui range les séries par côté, l'échange doit **permuter les colonnes de reprises et les corrections** — sans quoi chaque joueur hérite du total, de la moyenne et de la meilleure série de l'autre au premier recalcul.
14. **Le mode de jeu quitte la console centrale** *(2026-09-09)* : il est choisi au démarrage et n'évolue pas ; la colonne est réservée à ce qui change en cours de partie.
15. **`ÉCHANGER` en pleine reprise : le tour reste attaché au côté, conséquence acceptée** *(revue de code, 2026-09-09)*. Un échange fait après la série du blanc et avant celle du jaune redonne la main au joueur qui vient de jouer ; la reprise entamée reste orpheline (`{null, n}`) et `completedReprises` accuse une unité de retard jusqu'à la fin de la partie. Arbitré par Nathan : on ne déplace pas le tour et on n'interdit pas l'échange — le rattrapage passera par `ANNULER` (Story 1.8). Consigné dans `deferred-work.md`.
16. **Grâce de 300 ms sur les panneaux après fermeture de la pop-up** *(revue de code, 2026-09-09)*. À l'auto-validation, la pop-up disparaît sous le doigt et le tour a basculé : un appui qui arrive juste après tomberait sur le panneau devenu inactif et enregistrerait une série de 0. `GameView` ignore `pass-turn` et `adjust-score` pendant 300 ms après toute fermeture de la pop-up.

### Hors périmètre de cette story (ne pas anticiper)

- **Affichage du score restant vers l'objectif** — **Story 1.6**. ⚠️ À revoir : la mise à jour temps réel du total **et la moyenne** sont désormais livrées ici (décisions 8 et 10 ont rendu la moyenne nécessaire à l'écran). Il ne reste à la 1.6 que le **score restant vers l'objectif** — voir la note d'impact dans `epics.md`.
- **Bouton `CORRIGER` et son poids visuel égal à `VALIDER`** — **Story 1.7**. Cette story câble `C` et `⌫` dans la pop-up (mécanique de buffer) mais **n'ajoute pas** le bouton `CORRIGER`. ⚠️ À revoir avec la refonte : `C` et `⌫` étant déjà dans la pop-up et la fermeture sans validation étant déjà inerte, le besoin d'origine de la 1.7 est largement couvert — voir la note d'impact ajoutée dans `epics.md`.
- **Annulation de la dernière série validée** — **Story 1.8** (branchement du bouton `ANNULER` déjà présent en console centrale). Ne pas ajouter d'action d'annulation ici.
- **Saisie négative d'une SÉRIE, `isNegative`** — **Story 1.9**. `addReprise` **accepte** déjà une valeur négative sans cas particulier (testé), mais aucune bascule de signe n'est ajoutée au pavé. ⚠️ Ne pas confondre avec les boutons `−` / `+` livrés ici : ceux-là corrigent le **total**, ils n'enregistrent pas une série négative.
- **Détection de fin de set/match** quand la distance est atteinte — **Story 1.11**. Aucun code de cette story ne doit poser `status = 'finished'` (`GameView` n'a d'ailleurs toujours pas de branche de rendu pour cet état — défaut connu et déféré).
- **Persistance `localStorage`** — **Story 1.12**. `currentInput` vit en mémoire dans le store. Ne pas créer `storageService.ts`.
- **Tap incrémental, bouton `+1` et bascule manuelle du tour au tap sur le côté** — **Epic 2** (mode 3 Bandes, Stories 2.1/2.2, UX-DR24). Cette story implémente uniquement la bascule **automatique à la validation d'une série au pavé** (Décision 6) ; elle expose `switchTurn()` en action publique pour que l'Epic 2 s'y branche. ⚠️ Depuis la décision 10, les panneaux SONT tapables — mais uniquement pour rendre la main sans marquer (AC14) ; le tap incrémental reste à l'Epic 2.
- ~~**Affichage de la moyenne en cours de partie**~~ — **entré dans le périmètre le 2026-09-09** : la moyenne et la meilleure série sont affichées en tête de chaque carte. Le récapitulatif de fin de partie reste à la Story 1.10.
- **Annonce vocale du score après validation** — **Story 1.16**.

### État du code au démarrage de cette story

> ⚠️ La colonne « Ce que cette story en fait » date de la **première** implémentation et n'a pas été réécrite après les refontes. Ce qui a réellement été livré est décrit par les Tasks et le File List : `PlayerPanel` a **perdu** le pavé et l'overlay au profit de `ScoreEntryModal.vue` ; `startGame`/`swapPlayers`/`resetGame` **ont** été modifiés (corrections manuelles, permutation des colonnes de `reprises`) ; `CenterPanel.vue` **a** changé (mode retiré, `ÉCHANGER` permanent).

| Fichier | Ce qui existe déjà | Ce que cette story en fait |
|---|---|---|
| `src/components/NumericPad.vue` | Composant **présentationnel complet** : emits `digit`/`clear`/`backspace`, props `disabled`/`hasInput` (libellé `AC`/`C`), grille 3 colonnes, `@pointerdown`, `KEY_CLASSES` partagées | **Réutilisé tel quel.** Ne pas le modifier, ne pas y mettre de `navigator.vibrate`, de timer ni de plafond — il est muet par conception |
| `src/components/PlayerPanel.vue` | En-tête nom + distance, score géant centré, liseré de tour actif, `PLAYER_COLOR_CLASSES` littérales | Ajoute le pavé, l'overlay de saisie, le flash, le bouton `VALIDER` et le timer 3 s |
| `src/stores/useGameStore.ts` | `currentInput: { player1: '', player2: '' }` et `isNegative` **déjà déclarés et jamais utilisés** ; `activePlayer` initialisé à `player1` et **jamais modifié après le démarrage** ; `reprises` en `shallowRef` ; `startGame`/`swapPlayers`/`resetGame` réinitialisent et échangent déjà correctement `currentInput` | Branche `currentInput`, ajoute les actions de saisie, `addReprise` et `switchTurn`. **Rien à faire** sur `startGame`/`swapPlayers`/`resetGame` : ils gèrent déjà le buffer et remettent le tour à gauche. Ne **pas** déplacer le tour dans `swapPlayers` — il est attaché au côté (règle actée en revue 1.3) |
| `src/views/GameView.vue` | Câble les 2 panneaux + `CenterPanel`, calcule `repriseNumber`/`canUndo`/`canSwapPlayers` | Câble les 4 nouveaux événements et **corrige `repriseNumber`** |
| `src/components/CenterPanel.vue` | Affiche `REPRISE {{ repriseNumber }}`, bouton `ANNULER` désactivé tant que `canUndo` est faux | **Inchangé** — le calcul corrigé arrive par la prop |
| `src/components/keyClasses.ts` | Style de touche partagé, dessiné pour fond sombre | **Inchangé** — poser le pavé sur une surface sombre (Task 3.8) plutôt que le dupliquer |
| `src/types/game.ts` | `Reprise { player1: number \| null; player2: number \| null; timestamp }` | **Inchangé** — le modèle supporte déjà le remplissage progressif |

Suite de tests au démarrage : **98 tests, 9 fichiers, tous verts** (`vue-tsc -b` et `npm run build` verts également). Toute régression sur ces 98 est un échec de la story.

### Pièges vérifiés en revue des Stories 1.3 et 1.4 — à ne pas rejouer

- **`reprises` en `shallowRef` : `push` interdit.** Défaut explicitement déféré depuis la revue 1.3 avec la mention « avant la Story 1.5/1.8 » — c'est **ici** qu'il devient réel. Un `reprises.value.push(...)` laisse `repriseNumber`, `canUndo` et `canSwapPlayers` figés, et **aucun test naïf ne le détecte** puisque la valeur est bien dans le tableau. D'où la Task 1.10.
- **Tests qui ne discriminent rien.** Six tests non discriminants ont été prouvés par mutation sur les stories 1.3 et 1.4. Chaque test ajouté ici doit **échouer** si on retire le code qu'il prétend couvrir (Task 5.3).
- **Gardes dans l'action, pas dans le template.** Le plafond doit exister dans `appendScoreDigit` **et** être respecté par le composant via la constante partagée — jamais réécrit en dur dans le template.
- **Un plafond, une définition.** La revue 1.4 a déféré « le plafond de distance est défini deux fois, dans deux unités » (`MAX_DIGITS = 3` côté modale, `MAX_TARGET_SCORE = 999` côté store). **Ne pas créer une troisième définition** : `MAX_SCORE_DIGITS` est exporté une fois et importé par son unique consommateur. (Réconcilier les deux plafonds existants reste hors périmètre.)
- **Classes Tailwind littérales obligatoires.** Une classe construite par template literal n'est jamais générée par le scanner JIT de Tailwind v4, et happy-dom ne compile pas le CSS : le bug traverse toute la suite de tests sans être vu.
- **`--spacing` vaut 8px, pas 4px** (CLAUDE.md §7) : `p-4` = 32px, `gap-2` = 16px, `h-16` = 128px. Dimensionner le pavé en gardant cette table en tête.
- **`text-score` a un plancher de 120px** : il déborde partout ailleurs que dans un panneau joueur. Pour l'overlay, `text-reprise` (clamp 48-120px) est le repli sûr.
- **`min-h-[var(--size-touch-target)]` avec `var(...)`** — la forme `min-h-[--size-touch-target]` ne produit rien en Tailwind v4 (bug corrigé en 1.3).
- **`@pointerdown` seul, jamais `@click`** (AR8). Les tests déclenchent `trigger('pointerdown')`. Un test de la story 1.4 relit la source du composant via un import `?raw` pour prouver l'absence de `@click` — reprendre ce motif si utile (`node:fs` n'est **pas** typé dans `src/`, ne pas ajouter les types Node à `tsconfig.app.json`).
- **Un commentaire HTML au-dessus de la racine d'un template fait du composant un fragment à deux nœuds** : `wrapper.classes()` renvoie `[]` et l'héritage d'attributs est perdu. Mettre les commentaires **à l'intérieur** de la racine.

### Spécificités techniques externes (API Vibration)

- `navigator.vibrate(ms | number[])` est la **seule** API navigateur nouvelle de cette story. Aucune dépendance npm à ajouter.
- **Non implémentée par Safari/iOS/iPadOS**, à ce jour toutes versions confondues. Sur une borne iPad, il n'y aura **aucun retour haptique** : le flash visuel et la pulsation de refus portent seuls le feedback — raison pour laquelle AC#3 exige aussi un signal visuel de refus, et pas seulement l'haptique mentionné par UX-DR10. À confirmer par Nathan sur l'appareil cible réel.
- **Absente de happy-dom** (vérifié : aucune occurrence de `vibrate` dans `node_modules/happy-dom/lib/navigator/`). En test, `navigator.vibrate` est `undefined` — d'où la garde `typeof … === 'function'`, et le fait qu'une assignation directe (`navigator.vibrate = vi.fn()`) suffit à le simuler (vérifié en exécutant un test jetable dans ce projet).
- TypeScript **ne protège pas** : `lib.dom.d.ts` déclare `vibrate(pattern): boolean` comme toujours présent. Un appel non gardé compile parfaitement et casse à l'exécution.
- L'appel doit être **synchrone dans le handler `pointerdown`** : la contrainte NFR1 (< 100 ms) ne tolère ni `nextTick` ni attente d'un aller-retour store.

### Project Structure Notes

Quatre fichiers nouveaux, conformes à l'arborescence d'`architecture.md` (le dossier `composables/` était prévu et encore vide) :

```
src/components/
├── ScoreEntryModal.vue       (nouveau — la pop-up de saisie, décision 8)
├── ScoreEntryModal.test.ts   (nouveau — co-localisé, AR16)
src/composables/
├── useHaptics.ts             (nouveau)
├── useHaptics.test.ts        (nouveau — co-localisé, AR16)
```

Modifiés : `src/stores/useGameStore.ts` (+ test), `src/components/PlayerPanel.vue` (+ test), `src/views/GameView.vue` (+ test).

~~Ne **pas** créer de composant `ScoreEntryOverlay.vue` : l'overlay est un état de `PlayerPanel` selon la fiche UX~~ — caduc depuis la décision 8 : la saisie vit dans `ScoreEntryModal.vue`, et la fiche UX a été mise à jour en conséquence. Ne **pas** créer `services/` ni toucher au routeur — cette story n'a ni persistance ni nouvelle route.

`usePointerEvents.ts` (prévu en architecture pour les interactions complexes de type long press) n'est **pas** requis ici : un `@pointerdown` simple suffit à tout ce que fait cette story.

### Questions tranchées le 2026-09-09 (Nathan)

Les trois questions ouvertes à la création de la story ont été arbitrées et sont devenues les Décisions 6 et 7 ci-dessus :

1. **Alternance du tour** → bascule **automatique** à la validation de la série, par les deux chemins (bouton et 3 s). Entre dans le périmètre de cette story.
2. **Reprise incomplète et moyenne** → la reprise est ouverte par le joueur blanc ; la moyenne d'un joueur se fige quand il rend la main, donc une reprise qu'il n'a pas jouée n'entre pas dans sa moyenne.
3. **Auto-validation** → confirmée, elle se déclenche bien automatiquement, et emporte désormais aussi la bascule de tour.

### Questions ouvertes restantes (non bloquantes)

1. **Epic 2 — le geste de bascule manuelle en 3 Bandes est ambigu dans les specs.** Le fonctionnement décrit par Nathan est : le joueur assis tape sa zone (ou un `+1`) pour créditer l'adversaire en train de jouer, puis « il suffit d'appuyer sur le côté jaune pour passer au tour du joueur jaune ». Ces deux gestes visent la même zone. Les AC de la Story 2.2 couvrent le tap incrémental mais **aucun AC de l'Epic 2 ne décrit la bascule de tour** ni ne distingue les deux gestes (bouton `+1` dédié vs. tap sur la zone ? appui long ? zone séparée ?). À préciser avant la Story 2.2 — sans impact sur la Story 1.5, dont la bascule est automatique.
2. **Auto-validation et inactivité longue.** Un buffer laissé à l'écran se valide seul au bout de 3 s **et rend la main**, y compris si le joueur s'est éloigné en pleine frappe. C'est le comportement demandé par UX-DR15 et confirmé ; l'alerte d'inactivité de FR43 (Story 1.17) devra composer avec.

### References

- [Source: epics.md#Story 1.5: Saisir le score d'une série au pavé numérique (L412-436)] — AC d'origine et note de périmètre sur `NumericPad`
- [Source: epics.md#Story 1.6 (total temps réel, score restant — hors périmètre ici) (L438-456)]
- [Source: epics.md#Story 1.7 (annulation de la saisie en cours) (L458-472)]
- [Source: epics.md#Story 1.8 (annulation de la dernière série validée) (L474-490)]
- [Source: epics.md#Story 1.9 (score négatif) (L492-506)]
- [Source: epics.md#Story 2.2: Incrémenter le score point par point (tap du joueur assis) (L682-700)] — bascule manuelle du tour en 3 Bandes, **non couverte** par ses AC (question ouverte n°1)
- [Source: décision produit de Nathan, 2026-09-09 (conversation)] — alternance automatique du tour à la validation d'une série, ouverture de la reprise par le joueur blanc, moyenne figée quand le joueur rend la main, auto-validation confirmée
- [Source: epics.md#Functional Requirements — FR2, FR7, FR8, FR9, FR10, FR11 (L24-36)]
- [Source: epics.md#NonFunctional Requirements — NFR1, NFR9, NFR10 (L95-110)]
- [Source: epics.md#Additional Requirements — AR8, AR9, AR15-AR19 (L134-145)]
- [Source: epics.md#UX Design Requirements — UX-DR3, UX-DR8, UX-DR9, UX-DR10, UX-DR11, UX-DR14, UX-DR15, UX-DR16, UX-DR17, UX-DR22, UX-DR23 (L151-171)]
- [Source: architecture.md#Architecture des Données — GameState.currentInput, Reprise (L167-210)]
- [Source: architecture.md#Patterns de Communication Vue — storeToRefs, actions Pinia (L345-362)]
- [Source: architecture.md#Patterns Touch & Pointer (L363-379)]
- [Source: architecture.md#Règles Obligatoires — Tous Agents IA DOIVENT (L422-433)]
- [Source: ux-design-specification.md#2.5 Experience Mechanics — pavé toujours actif, overlay, validation hybride (L190-198)]
- [Source: ux-design-specification.md#Flow 2 — Saisir & Corriger un score (L292-308)]
- [Source: ux-design-specification.md#Custom Components — PlayerPanel, NumericPad, ActionBar (L342-385)]
- [Source: ux-design-specification.md#Button Hierarchy / Feedback Patterns (L400-411)]
- [Source: prd.md#FR2, FR7, FR11]
- [Source: 1-4-configurer-les-parametres-du-match-avant-de-demarrer.md#Review Findings + Dev Notes] — pièges, conventions et compromis repris ci-dessus
- [Source: deferred-work.md#Deferred from code review of 1-3] — `shallowRef` : « la convention "toujours réassigner, jamais muter" doit être gravée avant la Story 1.5/1.8 »
- [Source: deferred-work.md#Deferred from code review of 1-4] — plafond défini deux fois, à ne pas aggraver
- [Source: explore/scoreboard_test/scoreboard/src/components/PlayerScore.vue:168-305] — prototype d'origine : `addDigit`, plafond à 3 chiffres, `startAutoValidateTimer` à 3000 ms, `validateSeries`
- [Source: explore/scoreboard_test/scoreboard/src/components/ReprisesDisplay.vue:27-50] — barre de progression de l'auto-validation du prototype
- [Source: 1score/CLAUDE.md §1, §2, §4, §6, §7, §8, §9]

## Change Log

| Date | Change |
|---|---|
| 2026-09-09 | **Revue de code (3 couches) — story passée en `done`.** 2 décisions, 8 patches, 6 différés, 7 bruits écartés. Décisions de Nathan : l'échange en reprise ouverte est **accepté et documenté** (Décision 15, différé) ; le tap fantôme après auto-validation est corrigé par une **grâce de 300 ms** sur les panneaux (Décision 16). Patches appliqués : `VALIDER` à vide ne referme plus la pop-up (AC12) ; pulsation de refus réservée au refus (ne joue plus à l'ouverture) ; voile des deux pop-ups suivi par `pointerId` et désarmé sur `pointercancel` ; gardes `status === 'playing'` sur les actions de geste du store ; `animation-duration` du compte à rebours liée à `AUTO_VALIDATE_DELAY_MS` ; commentaires réalignés (numérotation AC réécrite, flash, import de `MAX_SCORE_DIGITS`) ; tests ajoutés sur l'haptique tap/refus, le flash, la couleur de la valeur, la validation à vide, `pointercancel`/`pointerId` et les gardes idle. Suite portée à **204 tests** verts ; `vue-tsc` et `build` verts. 4 mutations sur le nouveau code, 4 tuées. |
| 2026-09-09 | **Story et specs réalignées sur l'implémentation, à la demande de Nathan, avant passage en revue.** Les **AC ont été entièrement réécrits** (20 critères organisés en cinq sections) et les **tâches refondues** pour décrire le travail réellement livré : les AC d'origine décrivaient le pavé permanent dans le panneau, l'overlay sur le bloc joueur et l'emplacement réservé de `VALIDER`, tous **caducs** après trois passes de refonte. Les Décisions 1 à 3 sont remplacées par les Décisions 8 à 14 (score prioritaire et saisie en pop-up, CTA côté joueur assis, tap pour rendre la main avec série de 0, CTA unique et son risque résiduel, correction manuelle hors déroulé, `ÉCHANGER` permanent et permutation des historiques, mode retiré de la console). `epics.md` : AC de la Story 1.5 réécrits, et **notes d'impact ajoutées aux Stories 1.6, 1.7, 1.8 et 1.9**, dont le périmètre a bougé — la 1.6 perd le total temps réel et la moyenne, la 1.7 est peut-être devenue sans objet, la 1.8 devient le seul chemin de rattrapage et voit sa priorité relevée, la 1.9 ne garde que la bascule de signe. `ux-design-specification.md` : §2.5 réécrite, fiches `PlayerPanel`, `NumericPad`, `CenterPanel` et `ActionBar` corrigées, fiche `ScoreEntryModal` ajoutée, et deux règles générales amendées (la barre d'action dont les contrôles alternent désormais sur l'écran de partie, et UX-DR11 qui se lit comme « aucune action qui *modifie* un score hors des panneaux »). Aucun changement de code : suite toujours à **191 tests** verts, `vue-tsc` et `build` verts. |
| 2026-09-09 | **En-tête sur une seule ligne + même correction appliquée à `PlayerSetupModal`.** Nom, MOY, SÉRIE et distance tiennent désormais sur **une seule ligne** d'en-tête. Leur densité est pilotée par une **container query** (`@container` sur le panneau) et non par un breakpoint d'écran : c'est la largeur du **panneau** qui contraint — 410 px en paysage, 307 px en portrait — et un breakpoint ne verrait pas la différence. Deux pièges relevés au passage : le seuil `@sm` (384 px) ne se déclenchait dans **aucun** des deux formats, la *content box* du panneau ne faisant que 378 px en paysage (seuil recalé à 420 px, pour n'agrandir les statistiques que sur un signage large) ; et l'en-tête portait un `px-2` **redondant** avec celui du panneau, qui coûtait 32 px de largeur au nom, soit trois caractères de plus tronqués. La même correction de voile que `ScoreEntryModal` a été appliquée à **`PlayerSetupModal`**, sur demande : le défaut y était bien réel, prouvé par deux tests rouges avant correction. Suite portée à **191 tests** ; 6 mutations, **6 tuées**. |
| 2026-09-09 | **Deuxième passe de refonte + correction d'un bug de la popup.** (1) **Bug corrigé** : la popup se refermait dès qu'on relâchait le doigt du CTA — elle s'ouvre au `pointerdown`, et le `pointerup` du même geste retombait sur le voile fraîchement monté, pris pour un « tap en dehors ». Un tap en dehors exige désormais un geste **complet** sur le voile (appui ET relâchement), ce qui règle aussi le doigt qui glisse de la carte vers le voile. (2) **CTA inversé** : il se place du côté du joueur qui **n'a pas** la main — c'est l'adversaire assis qui compte les points de celui qui joue — tout en créditant le joueur actif. (3) Le CTA fait **exactement la largeur du bloc joueur** (mesuré : 410 px pour un panneau de 410 px). (4) `QUITTER` devient un **picto de sortie** (porte + flèche, signalétique d'évacuation), placé à l'opposé du CTA et se déplaçant avec lui. (5) **MOY et SÉRIE remontent en tête de carte**, sur leur propre ligne. (6) **Boutons − / + en pied de carte** : correction manuelle du total **sans toucher au déroulé** — ni reprise, ni bascule de tour, ni meilleure série. Suite portée à **188 tests** ; 16 mutations sur le nouveau code, **16 tuées** (dont 3 après correction de tests non discriminants, voir Debug Log) ; passe visuelle refaite dans les deux formats, console sans erreur. |
| 2026-09-09 | ⚠️ **Refonte de l'écran de partie sur décision produit de Nathan, APRÈS la première implémentation.** Les AC et les tâches ci-dessus décrivent la version précédente et **n'ont pas encore été réécrits** — Nathan a demandé qu'on implémente d'abord et qu'on reprenne la story ensuite. Ce qui a changé : (1) **le pavé quitte le panneau joueur** pour une **popup** ouverte par un bouton **« AJOUTER LES POINTS »** dans la barre basse, afin que le score occupe toute la carte ; (2) **un seul CTA**, qui suit le joueur actif et change donc de côté à chaque bascule, avec un `QUITTER` réduit ; (3) **rendre la main sans marquer** en tapant la zone de l'adversaire — une **série de 0 est enregistrée** (une reprise blanchie reste une reprise jouée, sans quoi la moyenne monterait artificiellement) ; (4) **moyenne de la partie en cours et meilleure série** affichées en pied de chaque carte ; (5) le bouton d'interversion devient **« ÉCHANGER »** et reste disponible **toute la partie** ; (6) le **mode de jeu disparaît** de la console centrale. Sont donc caducs : AC#1 (pavé toujours visible dans le panneau), AC#2 (overlay sur le bloc joueur — la valeur se lit désormais dans la popup), AC#10 (emplacement réservé de `VALIDER` dans le panneau) et la Décision 3 (les deux pavés vivants simultanément — le rattrapage d'un oubli passera par `ANNULER`, **Story 1.8, pas encore branchée**). Restent valables et vérifiés : le plafond de 3 chiffres, la règle du zéro, l'auto-validation à 3 s, la bascule automatique du tour, l'ouverture de reprise par le joueur blanc, la validation à vide inerte, `@pointerdown` partout et les contrastes WCAG AA. Suite portée à **167 tests**, tous verts ; 21 mutations appliquées au nouveau code, **21 tuées** ; passe visuelle refaite en 1024×768 et 768×1024, console sans erreur. |
| 2026-09-09 | **Implémentation terminée — story passée en `review`.** Suite portée de 98 à **145 tests**, tous verts, aucune régression ; `vue-tsc -b` et `npm run build` verts ; aucune dépendance ajoutée. Contre-vérification par mutation : 19 mutants, 19 tués, aucun test non discriminant. La passe de validation visuelle a révélé et corrigé trois défauts que les tests unitaires ne pouvaient pas voir (happy-dom ne compile pas le CSS) : le score géant débordait sur l'en-tête une fois le pavé installé, l'overlay de saisie laissait transparaître le score, et la 3ᵉ colonne du pavé était rognée en portrait 768×1024. Cette dernière correction touche `NumericPad.vue` — son plancher de largeur passe de 90 px à 60 px, l'exception UX-DR8 des claviers intégrés — avec son test mis à jour ; la modale de configuration est inchangée (touches 266×60, vérifié dans le navigateur). Specs synchronisées : fiche `ActionBar` corrigée, §2.5 de l'UX précisée, AC de précision reportés dans `epics.md`, et règle d'alternance/moyenne consignée comme règle produit de portée générale dans les deux documents. |
| 2026-09-09 | **Alternance des joueurs ajoutée au périmètre, sur décision produit de Nathan.** Les trois questions ouvertes de la création sont tranchées : la validation d'une série au pavé **bascule automatiquement le tour** (bouton comme auto-validation à 3 s, qui devient le fallback de bascule) ; la reprise est **ouverte par le joueur blanc**, et la moyenne d'un joueur se fige quand il rend la main ; l'auto-validation est bien automatique. Ajout de l'action `switchTurn()`, publique pour que l'Epic 2 y branche sa bascule manuelle au tap. Le pavé reste actif des deux côtés — le liseré est un indicateur, pas une garde. AC portées de 11 à 12. Point signalé hors périmètre : les AC de l'Epic 2 ne décrivent pas la bascule manuelle du 3 Bandes et ne distinguent pas le geste « créditer +1 » du geste « rendre la main », qui visent la même zone. |
| 2026-09-09 | Création de la story. Trois points tranchés à l'analyse et à répercuter dans les specs (Task 7) : `VALIDER` vit dans le panneau du joueur et non dans l'`ActionBar` (deux saisies simultanées possibles, `currentInput` étant un couple) ; l'overlay de saisie est centré sur le bloc du joueur et non dans la console centrale comme le faisait le prototype ; le `0` est une valeur de série légitime, à l'inverse de la règle du champ DISTANCE de la Story 1.4. Deux défauts déférés depuis les revues 1.3 et 1.4 deviennent actifs ici et sont traités : le `push` interdit sur `reprises` en `shallowRef`, et la définition unique du plafond de saisie. Un défaut latent est corrigé : `repriseNumber` s'incrémentait dès la validation du seul joueur de gauche. |

## Dev Agent Record

### Agent Model Used

Claude Opus 5 (claude-opus-5)

### Debug Log References

- **Deux tests non discriminants démasqués par mutation (2ᵉ refonte), puis corrigés.** Même cause dans les deux cas : `swapPlayers` et `startGame` **réécrivent l'objet joueur avec un `score` déjà calculé**, si bien qu'une correction de score restée du mauvais côté — ou non réinitialisée — reste invisible tant qu'aucun **recalcul** n'a lieu. Les assertions lisaient une valeur transportée, pas recalculée. Corrigé en forçant un recalcul (une série enregistrée après l'échange, après le nouveau démarrage, après le reset). Un troisième cas a été trouvé dans la foulée : le test du `resetGame` passait par `startGame`, qui réinitialise lui aussi et masquait donc un oubli côté reset. **C'est exactement le piège déjà rencontré sur les colonnes de reprises** — à retenir pour tout état dérivé de `reprises`.
- **Défaut de layout trouvé en portrait (2ᵉ refonte)** : « MOY x.xxx SÉRIE n » posé à côté du nom réclame ~250 px et débordait du panneau, qui n'en fait que 307 en portrait. Un breakpoint n'aurait rien résolu — c'est la largeur du **panneau** qui contraint, pas celle de l'écran ; les statistiques ont donc leur propre ligne.
- **Fausse alerte levée par la mesure** : le score « 2 » paraissait tronqué en bas sur la capture. Vérification faite, il dispose de 87 px de marge en haut comme en bas — c'est la forme du glyphe en graisse Black. Ne pas conclure d'une miniature compressée.

- **Contre-vérification par mutation (Task 5.3)** — 19 mutations appliquées une à une, suite relancée à chaque fois : **19 tuées, 0 survivante**. Cibles couvertes : plafond de 3 chiffres (côté store *et* côté `PlayerPanel`), règle du zéro, remplissage de reprise, score calculé par somme, no-op sur buffer vide, bascule de tour à la validation, `push` sur le `shallowRef`, correction de `repriseNumber`, `completedReprises`, distinction des deux haptiques, garde `navigator.vibrate`, redémarrage du timer, nettoyage au démontage, emplacement réservé de `VALIDER`, transmission de `hasInput`, overlay, pulsation de refus, flash de succès. Aucun test non discriminant, à la différence des revues 1.3 et 1.4.
- **Passe visuelle (Task 6)** — `resize_window` répond « success » sans que le viewport bouge (défaut déjà constaté en Story 1.4) : contournement par la page-harnais `public/_viewport-harness.html`, **supprimée** en fin de passe comme prévu. Parcours complet des 12 AC en 1024×768 et 768×1024, console sans erreur.
- Trois défauts visuels trouvés et corrigés pendant cette passe (détail en notes de complétion) : score géant débordant sur l'en-tête, overlay laissant transparaître le score, 3ᵉ colonne du pavé rognée en portrait.
- Les scripts d'audit DOM longs font expirer `Runtime.evaluate` (CDP, 45 s) : découper en séquences courtes.

### Completion Notes List

**⚠️ Troisième passe du 2026-09-09 — état actuel de l'en-tête et des pop-ups**

- **En-tête sur une seule ligne** : nom, MOY, SÉRIE et distance. La densité passe par une **container query** — `@container` sur le panneau, seuil sur sa largeur propre. Deux mesures ont corrigé mes hypothèses : le seuil `@sm` (384 px) ne se déclenchait dans **aucun** format, la *content box* du panneau valant 378 px en paysage tablette ; et le `px-2` de l'en-tête faisait doublon avec celui du panneau, volant 32 px au nom. Résultat mesuré : nom **non tronqué** dans les deux formats avec les noms par défaut, et « CHRISTOPHE » + distance 100 tient en paysage. ⚠️ **Limite assumée** : en portrait (panneau de 307 px), un nom d'une dizaine de caractères accompagné d'une distance est tronqué — trois statistiques et un nom long ne tiennent pas ensemble dans cette largeur. Le nom est le seul élément élastique : une valeur chiffrée rognée serait *fausse* à la lecture, jamais tronquée.
- **`PlayerSetupModal` : même correction de voile appliquée** (sur demande). Le défaut y était bien réel — deux tests de régression rouges avant correction — et non seulement théorique : la modale y échappait parce que sa carte, très large, interceptait le relâchement, ce qu'un simple changement de layout aurait suffi à casser.

**⚠️ Deuxième refonte du 2026-09-09**

- **Bug corrigé (signalé par Nathan)** : la popup ne tenait ouverte que tant que le doigt restait sur le CTA. Elle s'ouvre au `pointerdown` ; le `pointerup` du même geste retombait sur le voile qui venait d'apparaître sous le doigt, et le voile le prenait pour un tap en dehors. Un tap en dehors exige maintenant un geste **complet** sur le voile. ⚠️ **`PlayerSetupModal` porte la même faiblesse** (voile qui ferme au seul `pointerup`) : le bug n'y est pas visible aujourd'hui parce que la carte, très large, intercepte le relâchement — mais c'est un coup de chance de layout. Correction identique de six lignes, d'abord laissée hors périmètre puis **appliquée à la passe suivante** (voir Change Log).
- **CTA du côté du joueur assis** : il se place à l'opposé du liseré de tour actif, car c'est l'adversaire qui compte les points de celui qui joue, et il crédite bien le joueur **actif**. Il fait **exactement la largeur du bloc joueur** — obtenu en annulant le padding de la barre par des marges négatives, sans quoi la colonne est plus étroite que le panneau.
- **Sortie en picto** (porte + flèche, SVG en `currentColor`), à l'opposé du CTA et se déplaçant avec lui. `ActionBar` n'assure plus le retour en partie (`:showBack="false"`) : une place fixe ne peut pas alterner.
- **MOY et SÉRIE en tête de carte**, sur leur propre ligne, ce qui libère le bas.
- **Boutons − / + en pied de carte** : le total est corrigé via un `scoreAdjustments` tenu **à part des reprises**. C'est ce qui permet de corriger sans toucher au déroulé — la correction n'est pas une série, elle ne crée pas de reprise, ne fait pas basculer le tour et n'entre pas dans la meilleure série. Elle est en revanche intégrée au total, donc à la moyenne, et **suit son joueur** à l'échange comme les reprises. Volontairement **non bornée** : un score peut légitimement passer sous zéro (pénalités, Story 1.9). `.stop` obligatoire sur ces boutons — la carte rend la main au tap, sans quoi corriger le score de l'adversaire lui donnerait la main du même geste.

**⚠️ Première refonte du 2026-09-09**

Sur décision produit de Nathan, l'écran de partie a été repensé après la première implémentation : voir l'entrée du Change Log. Les notes qui suivent décrivent la version initiale et restent valables pour tout ce que la refonte n'a pas touché (store de saisie, `useHaptics`, plafond, règle du zéro, auto-validation, bascule de tour). Ce que la refonte a ajouté :

- **`ScoreEntryModal.vue`** — popup de saisie reprenant la coquille de `PlayerSetupModal` (voile flouté, carte centrée, croix, CTA en pied). Elle porte le pavé, la valeur en cours en grand, le flash de succès, la pulsation de refus, `VALIDER` et son compte à rebours, et le timer d'auto-validation à 3 s nettoyé à la fermeture. Présentationnelle : le buffer reste dans le store.
- **`PlayerPanel.vue`** — allégé de toute saisie. Nom et distance en tête, **score maximal** au centre, **moyenne et meilleure série** en pied. Le panneau devient tapable (`role="button"`, `@pointerdown`) et émet `pass-turn`, avec une garde : celui qui a déjà la main est inerte, sinon le joueur actif se retirerait le tour.
- **Taille du score** — une taille unique ne pouvait pas convenir : le panneau fait 40 % de la largeur, et ce qui tient à un chiffre déborde à trois. La taille suit donc le nombre de caractères, chaque palier bornant à la fois la largeur (`vw`), la hauteur (`vh`) et un plafond absolu. Paliers calés au navigateur pour laisser ~10 % de marge de chaque côté, mesurés à **9 % à deux, trois et quatre chiffres** dans les deux formats. Le palier à quatre chiffres n'est pas théorique : le plafond de 999 porte sur une **série**, pas sur le total — un 1029 est apparu pendant la passe visuelle.
- **Store** — `passTurn()` (série de 0 puis bascule), `averages` et `bestSeries` par joueur. `swapPlayers()` perd sa garde sur les reprises et **permute les colonnes de `reprises`** : le score étant recalculé depuis ce tableau, sans cette permutation chaque joueur héritait au premier recalcul du total, de la moyenne et de la meilleure série de l'autre. Vérifié dans le navigateur : après échange en pleine partie, JOUEUR 1 emporte ses 123 points, sa moyenne et sa série de l'autre côté.
- **`ActionBar.vue`** — retour compact et `shrink-0`, emplacement d'actions occupant tout le reste. **Défaut trouvé à la passe visuelle** : le CTA, d'abord centré dans sa moitié de barre, **recouvrait `QUITTER`** quand c'était au joueur de gauche. Il est désormais collé du côté du joueur actif par marge automatique — plus de recouvrement possible quelle que soit la largeur du libellé.
- **`CenterPanel.vue`** — le mode de jeu disparaît, `ÉCHANGER` remplace `BLANC / JAUNE` et ne disparaît plus à la première série.

**Trois tests existants verrouillaient des règles remplacées** et ont été réécrits avec leur justification : le refus d'intervertir après la première série, la disparition du bouton d'interversion, et l'affichage du mode en console centrale.

**Notes de la première implémentation (conservées)**

**Ce qui a été implémenté

- **Store** (`useGameStore.ts`) — `MAX_SCORE_DIGITS` exporté (définition unique du plafond), `appendScoreDigit` (retourne `false` sur refus, règle du zéro), `clearScoreInput`, `backspaceScoreInput`, `addReprise` (remplissage de la reprise en attente ou ouverture d'une nouvelle, tableau **remplacé** et jamais muté), `switchTurn` (publique, pour l'Epic 2), `validateScoreInput` (no-op strict sur buffer vide, sinon série + vidage + bascule) et le getter `completedReprises`. `player.score` est recalculé comme **somme des séries** du joueur dans `reprises` : `reprises` reste la source de vérité unique (Décision 5), ce qui rendra les Stories 1.8 et 1.9 triviales.
- **Composable** (`useHaptics.ts`) — `tap` (40 ms) / `reject` (15 ms), gardés par `typeof navigator.vibrate === 'function'`. Absent de happy-dom **et** de Safari iOS/iPadOS : sur la borne cible il n'y aura aucun retour haptique, le flash et la pulsation portent seuls le feedback.
- **`PlayerPanel.vue`** — reste présentationnel (props `currentInput`, emits `digit`/`clear`/`backspace`/`validate`, aucun accès au store). Overlay de saisie centré sur son propre bloc, flash de succès, pulsation de refus, bouton `VALIDER` à emplacement réservé avec compte à rebours visible, timer d'auto-validation à 3 s piloté par le même `watch` et nettoyé au démontage. Le plafond est décidé localement à partir de la constante **importée** du store, pour que l'haptique reste synchrone dans le handler `pointerdown` (NFR1).
- **`GameView.vue`** — un événement, une action ; aucune logique de score ni de tour dans la vue. `repriseNumber` corrigé en `completedReprises + 1` (il affichait « REPRISE 2 » dès la première série du seul joueur de gauche).
- **`main.css`** — trois animations CSS (`input-flash`, `input-reject`, `input-countdown`) déclarées en tokens `@theme`. Les retours visuels sont portés par le compositeur du navigateur et relancés par la `key` de l'élément : un seul timer JS dans toute la story (l'auto-validation).

**Trois défauts trouvés par la passe visuelle, invisibles aux tests unitaires** (happy-dom ne compile pas le CSS) :

1. **Score géant débordant sur l'en-tête.** Le pavé consomme désormais le bas du panneau : en 1024×768 il ne restait que 93 px de haut pour un glyphe de 154 px (`--text-score` = 15vw), qui chevauchait le nom du joueur. Corrigé en récupérant de la marge verticale (`py-2`, `mt-2`, `p-1`) et en **plafonnant** le token par la hauteur disponible : `text-[min(var(--text-score),18vh)]`. Le token reste la référence, il est seulement borné — aucune valeur en dur, valable sur tous les formats.
2. **Overlay laissant transparaître le score.** La valeur en cours était posée dans une pastille sombre trop courte : le score géant dépassait au-dessus et en dessous, et on lisait un mélange des deux nombres. L'overlay couvre maintenant toute la zone de score avec un fond **opaque**. La pulsation de refus porte sur la valeur seule (animer le fond le ferait déborder de la zone).
3. **3ᵉ colonne du pavé rognée en portrait 768×1024.** `NumericPad` imposait `min-w-[var(--size-touch-target)]` (90 px), soit 302 px pour trois colonnes, alors qu'un panneau joueur en portrait n'en offre que 227. Plancher ramené à **60 px sur les deux axes** — l'exception UX-DR8 des claviers intégrés. Aucun effet sur la modale de configuration, vérifié dans le navigateur : ses touches y font 266×60, très au-dessus du plancher. Le test de dimensionnement de `NumericPad` a été mis à jour en conséquence (il verrouillait un plancher que la réalité invalide).

**Mesures relevées dans le navigateur** — paysage 1024×768 : touches 99×60, `VALIDER` 330×90, score 138 px dans une zone de 157 px, aucun débordement. Portrait 768×1024 : touches 65×60, `VALIDER` 227×90, aucun débordement. Toutes les zones de **commande** (`VALIDER`, `ANNULER`, `BLANC/JAUNE`, `QUITTER`) sont à ≥ 90×90 px ; seules les touches de clavier descendent à 60 px, ce que couvre l'exception UX-DR8. Le compte à rebours de `VALIDER` a été mesuré à 0 → 0,33 → 0,66 puis disparition à l'auto-validation : l'animation et le timer restent synchrones.

**Vérifié de bout en bout dans Chrome** : AC#2 (overlay), AC#3 (4ᵉ et 5ᵉ frappes ignorées, valeur figée à « 735 »), AC#4 (`⌫` puis `C`, total inchangé), AC#5 (bouton **et** 3 s aboutissent au même état), AC#6 (le liseré passe sur le panneau adverse), AC#7 (`0` puis `7` donne `7`), AC#8 (validation à vide totalement inerte, tour compris), AC#9 (« REPRISE 1 » après la seule série du blanc, « REPRISE 2 » après celle du jaune), AC#10 (mesuré : le pavé ne bouge d'aucun pixel à l'apparition de `VALIDER`), AC#12 (accent `#1E88E5` sur texte noir, 5,7:1).

**Hors périmètre respecté** : aucun bouton `CORRIGER` (1.7), aucune annulation (1.8), aucune UI de saisie négative (1.9 — `addReprise` accepte pourtant déjà une valeur négative, testé), aucun `status = 'finished'` (1.11), aucune persistance (1.12), aucun score restant (1.6/1.10). *(Note de première implémentation — la moyenne et la zone tapable de rendu de main sont entrées dans le périmètre aux refontes suivantes.)* Aucune dépendance ajoutée.

**Point signalé, non bloquant** : le retour haptique ne peut pas être vérifié dans ce navigateur (API Vibration absente de Safari iOS/iPadOS). Les durées 40 ms / 15 ms sont un point de départ — à confirmer par Nathan sur l'iPad cible, où il n'y aura de toute façon aucune vibration.

### File List

**Nouveaux**
- `1score/src/components/ScoreEntryModal.vue`
- `1score/src/components/ScoreEntryModal.test.ts`
- `1score/src/composables/useHaptics.ts`
- `1score/src/composables/useHaptics.test.ts`

**Modifiés**
- `1score/src/stores/useGameStore.ts`
- `1score/src/stores/useGameStore.test.ts`
- `1score/src/components/PlayerPanel.vue`
- `1score/src/components/PlayerPanel.test.ts`
- `1score/src/components/PlayerSetupModal.vue`
- `1score/src/components/PlayerSetupModal.test.ts`
- `1score/src/components/NumericPad.vue`
- `1score/src/components/NumericPad.test.ts`
- `1score/src/components/CenterPanel.vue`
- `1score/src/components/CenterPanel.test.ts`
- `1score/src/components/ActionBar.vue`
- `1score/src/views/GameView.vue`
- `1score/src/views/GameView.test.ts`
- `1score/src/assets/main.css`
- `_bmad-output/planning-artifacts/ux-design-specification.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Créés puis supprimés**
- `1score/public/_viewport-harness.html` (harnais de la passe visuelle, Task 6.3)
