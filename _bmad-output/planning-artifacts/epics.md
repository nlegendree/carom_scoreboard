---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
workflow_completed: true
completed_at: '2026-09-08'
revisions:
  - date: '2026-09-11'
    scope: 'Epic 10 — Refonte UI/UX Premium (1Score) : exigences AR20-AR27 et UX-DR25-UX-DR56 ajoutées, supersessions annotées, section Epic 10 et stories 10.1-10.7'
    stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
    completed_at: '2026-09-11'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-11-refonte-ui.md'
  - 'explore/basic-ui-brainstorming-2026-09-11.md'
  - '_bmad-output/implementation-artifacts/deferred-work.md'
  - 'explore/resources/billiboard_*, cueuny_* (références visuelles, fournies par Nathan story par story)'
---

# Carom Scoreboard → 1Score - Epic Breakdown *(renommé le 2026-09-11, Epic 10)*

## Overview

This document provides the complete epic and story breakdown for Carom Scoreboard, decomposing the requirements from the PRD, UX Design Specification, and Architecture Decision Document into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Gestion de Partie**

- FR1 : Un joueur peut démarrer une nouvelle partie en sélectionnant un mode de jeu et en saisissant les noms des deux joueurs
- FR2 : Un joueur peut saisir le score de sa série pour la reprise en cours
- FR3 : Le système calcule et affiche en temps réel le score total de chaque joueur
- FR4 : Un joueur peut terminer une partie et consulter un récapitulatif automatique
- FR5 : Un joueur peut démarrer une nouvelle partie sans effacer l'historique des parties précédentes
- FR6 : Le système préserve l'état complet de la partie en cours en cas de fermeture accidentelle de l'application

**2. Saisie & Correction**

- FR7 : Un joueur peut saisir un score numérique via un pavé tactile optimisé
- FR8 : Un joueur peut annuler sa saisie en cours avant validation
- FR9 : Un joueur peut annuler la dernière série validée
- FR10 : Un joueur peut saisir un score négatif (déduction du total)
- FR11 : Le système confirme chaque saisie par un retour haptique et visuel immédiat

**3. Modes de Jeu**

- FR12 : Un joueur peut sélectionner un mode JDS — Libre, Cadre 47/2, Cadre 47/1, Cadre 71/2, 1 Bande ou 4 Billes — avec reprises, séries entières, calcul de moyenne et meilleure série. Les six modes partagent le même mécanisme de saisie ; seule leur distance de jeu par défaut diffère.
- FR13 : Un joueur peut sélectionner le mode 3 Bandes avec timer de série actif en permanence *(V1b)*
- FR14 : En mode 3 Bandes, un joueur peut incrémenter son score point par point ou saisir le score global en fin de série *(V1b)*
- FR15 : Un joueur peut configurer le format du match avant le début d'une partie (objectif de score, nombre de sets)
- FR16 : Le système détecte et signale automatiquement la fin d'un set ou d'un match selon le format configuré

**4. Statistiques & Historique**

- FR17 : Le système affiche automatiquement en fin de match : score total, moyenne par reprise, meilleure série
- FR18 : Un joueur peut consulter la liste des parties jouées sur l'appareil
- FR19 : Un joueur peut consulter le détail complet d'une partie passée (reprises, séries, statistiques)
- FR20 : L'application conserve l'historique des parties pendant au minimum 30 jours
- FR21 : Un joueur enregistré peut consulter ses statistiques cumulées sur l'ensemble de sa carrière *(V2+)*
- FR22 : Un joueur enregistré peut visualiser l'évolution de sa moyenne au fil du temps *(V2+)*

**5. Présentation & Diffusion *(V2+)***

- FR23 : Un utilisateur peut activer un affichage grand format optimisé pour lecture depuis l'autre bout de la salle
- FR24 : Un streameur peut générer une URL d'overlay fond transparent compatible OBS/Streamlabs
- FR25 : L'overlay stream se met à jour en temps réel sans intervention de l'opérateur
- FR26 : Un organisateur peut diffuser les scores en cours sur un écran TV connecté au réseau local

**6. Compétition & Arbitrage *(V2+)***

- FR27 : Un arbitre peut contrôler le scoreboard (validation, correction, pause timer) depuis une interface déportée sans toucher la tablette
- FR28 : Un organisateur peut créer un tournoi, assigner des matchs aux tables disponibles et suivre la progression en temps réel
- FR29 : Le système affiche un tableau de bord centralisé de toutes les tables actives d'une compétition
- FR30 : Le système gère la progression d'un tournoi (classements, disponibilité des tables)
- FR31 : Un admin club peut activer un minuteur de facturation à la table pour les clubs proposant la location horaire *(V2+, optionnel)*

**7. Gestion des Joueurs & Clubs *(V2+)***

- FR32 : Un joueur peut créer un compte avec un identifiant court mémorisable
- FR33 : Un joueur peut s'identifier sur n'importe quelle tablette de club en saisissant son identifiant
- FR34 : Un admin club peut gérer les tables de son club (configuration, activation, désactivation)
- FR35 : Un admin club peut consulter les statistiques d'usage de son club
- FR36 : Le système synchronise automatiquement les données locales vers le cloud dès qu'une connexion réseau est disponible
- FR37 : Un admin club peut gérer son abonnement (palier, facturation)
- FR38 : Le système exporte les résultats dans un format compatible avec les systèmes fédéraux *(V3)*

**8. Administration & Configuration**

- FR39 : Un utilisateur peut modifier les noms des joueurs en cours de partie
- FR40 : Un utilisateur peut réinitialiser une partie en cours et en démarrer une nouvelle
- FR41 : Un utilisateur peut configurer les paramètres d'une partie (format sets, objectif de score, pattes Casin)
- FR42 : Un utilisateur peut activer ou désactiver l'annonce vocale du score après chaque série validée
- FR43 : Le système détecte l'absence de saisie prolongée et alerte l'utilisateur si une partie reste ouverte sans activité
- FR44 : Le système signale visuellement les moments clés d'une partie (record personnel dépassé, match point) *(V2+)*
- FR45 : L'application fonctionne sans connexion réseau
- FR46 : L'application peut être installée comme application native sur tablette (démarrage sans navigateur)

### NonFunctional Requirements

**Performance**

- NFR1 : Retour visuel et haptique suite à une action tactile : < 100 ms
- NFR2 : Chargement initial (premier affichage interactif) : < 2 secondes sur tablette d'entrée de gamme (Android 10+, 3 Go RAM)
- NFR3 : Fluidité maintenue (pas de freeze ni jank) après 8 heures d'utilisation continue sans rechargement
- NFR4 : En V2+ real-time, mises à jour de score reflétées sur tous les clients connectés en < 500 ms

**Fiabilité**

- NFR5 : État de la partie sauvegardé localement après chaque action — zéro perte en cas de fermeture ou crash
- NFR6 : L'application fonctionne sans connexion réseau sur tablette sans SIM ni WiFi
- NFR7 : En V2+, synchronisation différée garantit zéro perte de données pour les parties jouées offline, même après plusieurs jours sans réseau
- NFR8 : Taux de complétion des parties démarrées > 80 % sans incident technique

**Accessibilité Pratique**

- NFR9 : Zones interactives : taille minimale 90 × 90 px (usage tactile sans stylet)
- NFR10 : Scores et statistiques lisibles à 2 mètres — polices fluides `clamp()`, contraste WCAG AA minimum
- NFR11 : Vue salle lisible à 5 mètres sur écran 40" ou supérieur
- NFR12 : Démarrer une partie ne requiert aucune lecture de texte explicatif — actions compréhensibles par pictogramme et position

**Sécurité & Conformité**

- NFR13 : En V1, aucune donnée transmise à un serveur externe — tout reste sur l'appareil
- NFR14 : En V2+, communications client-serveur chiffrées en TLS 1.3 minimum
- NFR15 : En V2+, données personnelles hébergées dans l'Union Européenne — conformité RGPD
- NFR16 : En V2+, suppression complète des données d'un joueur accessible en < 3 actions

### Additional Requirements

**Starter Template (impacte Epic 1 / Story 1) :** Architecture spécifie explicitement l'initialisation du projet via le starter `@vite-pwa/create-pwa` (template `vue-ts`) :
`npm create @vite-pwa/pwa@latest 1score -- --template vue-ts`
Ceci doit être la toute première story d'implémentation, suivie immédiatement par la création de `CLAUDE.md`.

- AR1 : Initialiser le projet avec le starter Vue 3 + Vite PWA (`@vite-pwa/create-pwa`, template vue-ts) — première story d'implémentation.
- AR2 : Créer `CLAUDE.md` à la racine du projet comme deuxième story d'implémentation, avant tout code fonctionnel — documente les conventions AI-vibe-codable (nommage, patterns, structure).
- AR3 : Installer et configurer les dépendances complémentaires : Tailwind CSS v4 (+ `@tailwindcss/vite`), Pinia, Vue Router 4, Dexie.js, Vitest + Vue Test Utils + happy-dom.
- AR4 : Implémenter l'architecture de stockage double — `localStorage` pour l'état de partie courante (synchrone, < 50 Ko) via `storageService.ts` ; `Dexie.js`/IndexedDB pour l'historique 30 jours (async, quota-safe iOS Safari) via `databaseService.ts`. *(Requalifié le 2026-09-11 : IndexedDB devient la **file locale de synchronisation** des parties vers le profil joueur, pas un historique consultable par appareil — `sprint-change-proposal-2026-09-11.md`.)*
- AR5 : Implémenter les types TypeScript stricts définis en architecture : `GameState`, `Player`, `Reprise`, `GameMode`, `GameStatus` (`types/game.ts`, Epic 1) et `GameRecord` (`types/history.ts`) — scaffoldé dès Epic 1 par anticipation architecturale (séquence d'implémentation : types avant services/stores), mais réellement utilisé à partir d'Epic 3 (historique). *(2026-09-11 : `types/history.ts` n'avait jamais été scaffoldé ; `GameRecord` sera créé avec l'Epic 3 redéfini, avec un identifiant joueur par côté.)*
- AR6 : Implémenter le routing Vue Router avec exactement 3 routes : `/` (GameView), `/history` (HistoryView), `/history/:id` (GameDetailView) ; les réglages V1 sont des modales inline sur GameView, sans route dédiée. *(2026-09-11 : `/history*` conditionnées à l'identification d'un joueur, livrées après le profil — `sprint-change-proposal-2026-09-11.md`.)*
- AR7 : Implémenter les stores Pinia `useGameStore` (état de partie + persistance localStorage) et `useHistoryStore` (historique + Dexie.js), structure plate un store par domaine. *(2026-09-11 : `useHistoryStore` porte la file de synchronisation et la consultation du profil, Epic 3 redéfini.)*
- AR8 : Utiliser exclusivement l'API Pointer Events (`@pointerdown`) sur tous les éléments tactiles interactifs — jamais `@touchstart` ni `@click` seul — pour éliminer le délai tactile 300ms sur iPad/Android ; appliquer le CSS global (`touch-action: manipulation`, `user-select: none`, `-webkit-tap-highlight-color: transparent`).
- AR9 : Utiliser `shallowRef` pour le tableau `reprises: Reprise[]` dans `useGameStore` afin d'éviter la réactivité profonde sur de longues sessions (NFR3 — 8h continu).
- AR10 : Configurer la stratégie de cache du Service Worker via vite-plugin-pwa : `cache-first` pour les assets JS/CSS, `StaleWhileRevalidate` pour le HTML. *(précisé en 1.13 : précache atomique, le HTML n'est pas `StaleWhileRevalidate` — cohérence HTML/assets hachés)*
- AR11 : Déployer sur Netlify avec auto-deploy GitHub sur push `main` — CI/CD zéro configuration, HTTPS + CDN mondial inclus. *(livré en 1.13 : `netlify.toml` à la racine du dépôt, rattachement du site manuel)*
- AR12 : Implémenter la gestion d'erreurs de toutes les opérations de stockage dans la couche service (`try/catch` + `console.error`) — jamais dans les composants (niveau de monitoring V1 ; Sentry/Plausible différés en V2+).
- AR13 : Implémenter le composable `useSpeech.ts` (Web Speech API) pour l'annonce vocale du score (FR42).
- AR14 : Implémenter le composable `useTimer.ts` pour le timer 3 Bandes, isolé du périmètre V1a (V1b uniquement). *Livré en Story 2.1 (2026-09-10) : `useTimer.ts` + `ShotClock.vue`.*
- AR15 : Respecter les conventions de nommage obligatoires : composants Vue en PascalCase, stores/composables Pinia en camelCase préfixés `use`, services en camelCase suffixés `Service`, types TypeScript en PascalCase (sans préfixe `I`), emits Vue en kebab-case, actions Pinia en verbe+nom (`setPlayerName`, `addReprise`), exports nommés uniquement (jamais de default export pour composables/services).
- AR16 : Co-localiser tous les tests de composants (`Component.test.ts` à côté de `Component.vue`), pas de dossier `__tests__/`.
- AR17 : Imposer toute mutation de store exclusivement via des actions Pinia (jamais de mutation directe depuis un composant) et utiliser `storeToRefs()` pour toute propriété réactive du store consommée par un composant.
- AR18 : Utiliser `async/await` exclusivement pour toute logique asynchrone des stores Pinia — jamais `.then().catch()`.
- AR19 : Appliquer Tailwind CSS en mobile-first avec les 3 breakpoints définis (défaut < 768px, `md:` ≥ 768px, `lg:` ≥ 1280px).

**Ajoutés le 2026-09-11 — Epic 10, Refonte UI/UX Premium (1Score)** *(`architecture.md` › « Navigation & Shell (Epic 10, V1.1) », `sprint-change-proposal-2026-09-11-refonte-ui.md`)* :

- AR20 : Introduire un primitif de coquille d'écran `SideBar`, **contextuel par écran** (contenu différent à l'Accueil, à la sélection JDS, au paramétrage joueurs et au récap), qui remplace `ActionBar` sur tous les écrans hors jeu. `ActionBar` **subsiste uniquement sur le scoreboard**, ses CTA passent en picto + libellé court, et `ANNULER` la rejoint depuis `CenterPanel`. Les routes Vue Router ne changent pas.
- AR21 : Scinder l'action `swapPlayers()` de `useGameStore` en **deux actions indépendantes** — bille seule (ex. `swapBallColors`) et côté seul (ex. `swapSides`) — disponibles **avant `DÉMARRER` uniquement**. Supprimer dans la même passe le champ `Player.id` positionnel redondant (toujours égal au nom du champ qui le contient, restampé manuellement à chaque échange).
- AR22 : Retirer `ÉCHANGER` du store **en cours de partie** : l'interversion n'existe plus qu'au paramétrage. Le backlog « `ÉCHANGER` pendant une reprise entamée casse la déduction de la série ouverte » (`deferred-work.md`, revue 2.1+2.2+2.4) est **clos, pas corrigé**. Retirer les tests qui vérifient la disponibilité d'`ÉCHANGER` en jeu.
- AR23 : Retirer le tap sur la carte du joueur adverse comme déclencheur de passage de tour ; une CTA centrale `PASSER LE TOUR` devient **l'unique déclencheur**, en JDS comme en 3 Bandes. L'action de store existante déclenchée par le tap est **remplacée, pas dupliquée** ; l'état « tapable pour rendre la main » de `PlayerPanel` disparaît ; les tests qui simulent ce tap sont convertis en déclenchement de `PASSER LE TOUR`. Toute action reste nommée et pilotable sans geste tactile (UX-DR23).
- AR24 : Règle de jeu réécrite : **« la bille blanche ouvre, où qu'elle soit »** — le compteur de reprises avance quand le joueur **à la bille blanche** reprend la main, la reprise égalisatrice appartient au joueur **à la bille jaune**, et le récap conserve les côtés du scoreboard. « Gauche = blanc » n'est plus une invariante du store (conséquence d'AR21).
- AR25 : `PlayerPanel` reçoit un champ **dérivé** `RESTANT = max(distance − score, 0)`, permanent, tous modes, masqué sans distance — calculé comme `POUR n` l'est déjà, **aucun nouvel état persisté**, `GameState` inchangé.
- AR26 : **Spike de faisabilité « Fermer l'application »** à mener avant la Story 10.1 : aucune API standard fiable ne ferme une PWA installée (`window.close()` ne fonctionne que sur une fenêtre ouverte par script). Cible = fermeture de la fenêtre après confirmation ; **repli documenté** = retour à l'accueil de l'application, la pop-up de confirmation restant identique. Le libellé ne promet rien de plus que ce que le spike confirme. **Décision de Nathan (2026-09-11, passe epics) : non prioritaire** — en Epic 10, l'item est **affiché dans la sidebar mais inerte** (état BIENTÔT, UX-DR30), **sans spike ni pop-up** ; le spike et le comportement réel sont reportés à une story ultérieure, hors Epic 10.
- AR27 : **Renommage « Carom Scoreboard » → « 1Score »** en un seul passage transverse : `CLAUDE.md`, manifest PWA (`name`, `short_name`, titre), `package.json`, titres d'écran et `<title>`. Le PRD est déjà renommé (2026-09-11). Le dossier `carom-scoreboard/` et le dépôt ne sont pas renommés (aucun bénéfice, risque de casser Netlify). *Révisé le 2026-09-11 après la revue de la 10.6 (Nathan, en dev) : dossier applicatif renommé `1score/` et clé de sauvegarde `1score:game` ; dépôt GitHub, dossier local et site Netlify à renommer plus tard (`deferred-work.md`).*

### UX Design Requirements

- UX-DR1 : Implémenter la direction visuelle "Bloc Plein" — blocs pleine couleur par panneau joueur, chiffre de score géant comme unique élément dominant, console centrale minimale (uniquement mode + numéro de reprise). *(**Raffiné le 2026-09-11, Epic 10** en « Bloc Plein contenu » : mêmes blocs, chacun dans un conteneur à contour sur un dégradé drap → noir — voir UX-DR25/26.)*
- UX-DR2 : Implémenter la convention de bille fixe par côté, conforme au carambole et aux scoreboards coréens de référence : **joueur de gauche = bille blanche** (bloc blanc `#FFFFFF`, chiffres noirs), **joueur de droite = bille jaune** (bloc jaune plein `#FFC72C`, chiffres noirs). Un bouton d'interversion permet d'échanger les deux joueurs de côté avant la première reprise ; la bille reste attachée au côté, jamais au joueur. *(Révisé le 2026-09-08 : remplace la règle initiale d'attribution dynamique à 4 couleurs, qui ne correspondait ni au matériel réel ni aux références CUESCO/Billiboard.)* **Supersédé le 2026-09-11 (Epic 10, Story 10.3, `sprint-change-proposal-2026-09-11-refonte-ui.md`) :** l'interversion unique devient deux actions indépendantes au paramétrage (`CHANGER DE BILLE`, `CHANGER DE CÔTÉ` — la bille peut désormais changer sans déplacer le joueur à l'écran, et inversement) ; `ÉCHANGER` disparaît en cours de partie, il ne subsiste qu'avant `DÉMARRER`.
- UX-DR3 : Réserver la couleur d'accent système (bleu `#1E88E5`) exclusivement aux actions neutres/système (+1, Valider) — jamais réutilisée comme couleur joueur, pour ne jamais confondre "marquer un point" et "action système".
- UX-DR4 : Implémenter la couleur d'alerte/urgence (rouge LED `#FF3B30` sur fond noir) pour l'affichage du chrono/décompte (périmètre V1b).
- UX-DR5 : Implémenter l'habillage victoire/récompense (or `#FFD54A` + ruban rouge `#E63946`) pour la médaille/mise en avant de l'écran de fin de partie.
- UX-DR6 : Implémenter le système typographique — sans-serif très grasse (800-900, ex. Barlow Condensed Black ou Rajdhani Bold) pour le chiffre de score géant ; sans-serif medium/bold (600-700, ex. Inter ou Manrope) pour les labels (nom joueur, AVG, HR, score restant) ; échelle fluide `clamp()` (score ~120-200px+, labels ~16-24px, stats secondaires ~14-18px).
- UX-DR7 : Appliquer une unité de base d'espacement de 8px ; les blocs joueur occupent quasiment 100% de leur colonne sans marge décorative — la densité vient de la taille des éléments, pas de leur nombre.
- UX-DR8 : Imposer une taille minimale de zone tactile de 90×90px sur tous les éléments interactifs (NFR9), plus stricte que le minimum WCAG 44×44px, pour l'accessibilité du public senior. **Exception unique, arbitrée le 2026-09-09 (Story 1.4) : les touches des claviers intégrés** (`AlphaKeyboard`, `NumericPad`). Aucun clavier alphabétique ne peut tenir 10 colonnes à 90px dans une pop-up — celui de l'iPad tourne autour de 65px. Plancher retenu : 44px pour les lettres, 60px pour les chiffres. La règle reste entière pour **toutes** les commandes de jeu, qui la respectent.
- UX-DR9 : Construire le composant `PlayerPanel` (×2, strictement symétrique) — chaque panneau autonome avec ses propres contrôles de saisie (pavé numérique, bouton +1 le cas échéant) ; aucune action affectant le score centralisée dans `CenterPanel`. *(**Supersédé le 2026-09-11, Epic 10, Story 10.4** : le panneau ne porte plus ni pavé ni geste de bascule — il **lit** l'état du joueur et garde seulement `−`/`+` ; la saisie passe par le dock central et le CTA de barre basse, le passage de tour par `PASSER LE TOUR` — voir UX-DR45 à UX-DR50.)*
- UX-DR10 : Construire le composant `NumericPad` avec les états : vide, saisie active, valeur hors limites (> 999, refus de saisie avec retour haptique court distinct, sans bloquer l'écran par un message).
- UX-DR11 : Construire le composant `CenterPanel` limité au contexte neutre/partagé (mode de jeu, numéro de reprise, alerte d'inactivité) et aux actions **symétriques**, qui s'appliquent identiquement aux deux joueurs : annulation de la dernière série (ANNULER) et interversion des billes. Jamais une action qui favorise un joueur ni une saisie de score, qui restent portées par chaque `PlayerPanel`. *(Amendé en revue de la Story 1.3, 2026-09-08 : la console centrale façon Billiboard/CUESCO porte ANNULER et l'interversion — la symétrie exigée porte sur l'absence de biais entre joueurs, pas sur l'absence de toute action.)* *(**Supersédé le 2026-09-11, Epic 10, Story 10.4** : `CenterPanel` **perd `ANNULER`** (→ barre basse) **et `ÉCHANGER`** (retiré du jeu), **gagne `PASSER LE TOUR`** — action symétrique, elle rend la main quel que soit le joueur actif — et héberge le dock de saisie le temps d'une saisie, sans y écrire de score. Voir UX-DR48/49.)*
- UX-DR12 : Construire l'écran d'accueil `HomeScreen` — plein écran, fusionnant veille et sélection de mode, zones tactiles aussi grandes que le reste de l'interface, navigation à deux niveaux (catégorie → mode) sans fermeture accidentelle possible. *(Révisé le 2026-09-08 : remplace la modale `ModeSelector` initiale.)* *(**Supersédé le 2026-09-11, Epic 10, Stories 10.1/10.2/10.3** : sidebar contextuelle, accroche display, tuiles `ModeTile` colorées, état joueurs réécrit en cartes + colonne de réglages — voir UX-DR33 à UX-DR44 ; la navigation à deux niveaux et l'absence de fermeture accidentelle restent.)*
- UX-DR13 : Construire le composant `GameSummary` façon "battle" — bandeau VS, médaille winner/loser, stats comparées côte à côte, état de mise en avant explicite en cas de nouveau record personnel. *Précisé le 2026-09-10 (Story 1.10) — **format Billiboard** : bandeau `NOM / distance` **VS** `NOM / distance` (mode de jeu en surtitre discret), deux colonnes joueur autour d'une colonne de libellés (`RÉSULTAT`, `POINTS`, `MOY`, `SÉRIE`, `REPRISES`), la **colonne du vainqueur mise en couleur** (ruban rouge) avec le mot `VICTOIRE` — c'est cette colonne colorée qui tient lieu de « médaille » —, et deux boutons en bas : `FIN DE PARTIE` et `UNE PARTIE DE PLUS`. L'état « nouveau record » existe par joueur, non déclenché avant la Story 3.5.* *(**Supersédé le 2026-09-11, Epic 10, Story 10.5** : les deux boutons du bas disparaissent au profit de la sidebar `RECOMMENCER` (item) / `QUITTER` (sortie) ; conteneur à contour ; nom et distance en deux éléments — voir UX-DR53.)* *(**Livré le 2026-09-14** : le bandeau rend `NOM │ distance`, nombre **nu** séparé d'un filet, sans `/` ; pastilles aux PNG de bille du paramétrage ; plus aucun arrondi.)* *(**1re passe de rendu, 2026-09-14** : plus de pastille dans le bandeau — une seule par joueur, dans sa cellule `RÉSULTAT` ; nom et distance en `text-tile-title` ; les cinq statistiques sont des **blocs séparés de 8 px** et l'aplat passe de la colonne à la cellule ; ordre `RÉSULTAT` · POINTS · REPRISES · MOY · SÉRIE.)*
- UX-DR14 : Implémenter un indicateur de tour actif non-dépendant de la seule teinte (daltonisme) : le panneau du joueur qui doit jouer est encadré d'un liseré rouge épais (`--color-turn-active`, convention CUESCO/Billiboard). Le signal est la **présence du cadre**, perceptible indépendamment de la perception des couleurs et à distance.
- UX-DR15 : Implémenter la validation hybride du score — tap explicite sur "Valider" OU validation automatique après 3 secondes d'inactivité suivant la dernière frappe ; les deux chemins doivent aboutir au même état résultant.
- UX-DR16 : Implémenter la correction avec le même poids visuel que la validation — bouton Corriger/Annuler toujours visible avec la même prominence que le pavé de saisie, jamais dans un sous-menu, accessible pendant la saisie (efface la saisie en cours) et après validation (annule la dernière série validée).
  - *Précision (Story 1.7, 2026-09-09)* : « pendant la saisie » est couvert par `C`, `⌫` et la croix de `ScoreEntryModal` (jugé suffisant, pas de bouton `CORRIGER` distinct) ; « après validation » est le bouton `ANNULER` de la console centrale, qui remonte d'**une action** à chaque appui — séries validées, mains rendues sans marquer, corrections `−`/`+` — jamais l'échange de côtés (`ÉCHANGER` est son propre inverse). *(**2026-09-11, Epic 10, Story 10.4** : « après validation » = `ANNULER` en **barre basse**, picto + libellé, même mécanisme d'undo ; `ÉCHANGER` n'existe plus en jeu — voir UX-DR51.)*
- UX-DR17 : Implémenter le retour haptique + visuel sur chaque tap, < 100ms (NFR1) — retour de succès affiché directement sur le bloc joueur concerné (flash bref), pas de toast/notification textuelle.
- UX-DR18 : Implémenter l'alerte d'inactivité (FR43) comme une notification douce et non-intrusive dans `CenterPanel` — jamais en plein écran, jamais une interruption brutale de la partie en cours.
- UX-DR19 : Implémenter la saisie du nom du joueur par **pop-up et claviers intégrés** — tap sur la zone du joueur pour ouvrir sa modale (`PlayerSetupModal`), saisie exclusivement au clavier applicatif (`AlphaKeyboard`), majuscules automatiques, limite 20 caractères, application à la validation. *Réécrit le 2026-09-09 (Story 1.4) : la version antérieure imposait une édition **inline sans modale séparée**. L'écran cible étant une **borne fixe** (décision produit du 2026-09-09), aucun champ natif ne doit exister — c'est ce qui empêche structurellement le clavier du système de monter par-dessus l'interface. L'édition inline supposait un `<input>` natif, donc exactement ce que la décision proscrit.* *(**Supersédé le 2026-09-11, Epic 10, Story 10.3** : `PlayerSetupModal` **supprimé** — chaque champ se règle **en place**, le nom via `AlphaKeyboardSheet` en bandeau bas, la distance via `NumericPadDock` en colonne centrale ; toujours **aucun champ natif**, majuscules automatiques, 20 caractères — voir UX-DR39 à UX-DR41.)*
- UX-DR20 : Implémenter l'état vide de la liste d'historique au premier lancement — message simple + invitation explicite à jouer une première partie (jamais un écran vide non expliqué). *(2026-09-11 : devient « aucune partie sur ce profil », joueur identifié — Epic 3 redéfini.)*
- UX-DR21 : Implémenter le layout responsive selon 3 breakpoints — signage/desktop ≥1280px et tablette 768-1279px : layout 3 colonnes paysage identique (tablette = cible primaire) ; smartphone <768px : layout empilé vertical (fallback).
- UX-DR22 : Assurer un contraste couleur WCAG AA (4.5:1 minimum) sur tous les blocs joueur et la console centrale, validé sur la palette finale (jaune/blanc/orange/rose sur fond sombre).
- UX-DR23 : Exposer toute action affectant le score comme une action Pinia nommée du store (ex. `addReprise()`, `undoLastSeries()`) jamais couplée exclusivement à un event handler tactile — contrainte architecturale pour la compatibilité future avec un pilotage à distance (V2+), s'applique à tout le travail UI lié au score en V1.
- UX-DR24 : Implémenter l'interaction tap-incrémental du mode 3 Bandes — le joueur assis (non-actif) tape sur sa propre zone pour ajouter un point à l'adversaire en train de jouer ; le pavé numérique reste disponible en backup pour saisir une série complète directement (périmètre V1b). *(Backup pavé **annulé** en Story 2.3, 2026-09-11.)* *(**Supersédé le 2026-09-11, Epic 10, Story 10.4** : le crédit d'un point passe par le CTA de barre basse `+1 ADVERSAIRE` côté assis (mécanique Story 2.2 inchangée) ; le geste **rendre la main** n'est plus un tap sur la carte mais la CTA `PASSER LE TOUR` — voir UX-DR49/51.)*

**Ajoutés le 2026-09-11 — Epic 10, Refonte UI/UX Premium (1Score)** *(`ux-design-specification.md` › « Refonte UI/UX Premium — 1Score », §10.0 à §10.8, qui **prime** sur les fiches antérieures ; références visuelles Cueuny et Billiboard dans `explore/resources/`, fournies par Nathan story par story)* :

*Fondations (transverses, Stories 10.1 à 10.5)*

- UX-DR25 : Implémenter la direction **« Bloc Plein contenu »** — les blocs gardent leur couleur pleine, mais **chaque élément vit dans un conteneur à contour** (`--color-border`, 2 px, `--radius-container`) : carte joueur, tuile, CTA, pavé, colonne centrale, barre latérale, et l'écran lui-même (marge de 16 px sur ses quatre bords, dégradé visible autour).
- UX-DR26 : Implémenter le **fond dégradé drap → noir** sur tous les écrans (`--gradient-bg`, indicatif `linear-gradient(160deg, var(--color-cloth) 0%, #0B1B33 55%, #000 100%)`), avec une **variante assombrie** sur le scoreboard (départ à 60 % de luminosité). **Aucune image de fond** (zéro asset, zéro poids offline) ; un emplacement image reste réservé à l'accueil. `--color-cloth` ≈ `#2F6FB8`, à pixel-picker sur l'image du drap Simonis Prestige fournie par Nathan avant de figer.
- UX-DR27 : Ajouter les tokens : `--color-cloth`, `--gradient-bg`, `--color-surface` (`rgba(255,255,255,0.06)`), `--color-border` (`rgba(255,255,255,0.18)`), `--color-border-strong` (`rgba(255,255,255,0.40)`), `--radius-container` (20 px), `--radius-cta` (16 px), `--color-tile-3b` (= cloth), `--color-tile-jds` (`#1E8A5A`), `--color-tile-quilles` (`#E8842B`), `--color-tile-casin` (`#7B4FD1`), `--color-panel-white-band` (`#ECECEC`), `--color-panel-yellow-band` (`#E6B000`). Inchangés : blanc/jaune de bille, accent bleu, rouge de tour actif, fondu du chrono, rouge/or de victoire. **Le bleu drap n'est jamais utilisé sur un bouton** — l'accent reste réservé aux CTA de saisie et de démarrage.
- UX-DR28 : Typographie et pictos — l'accroche d'accueil et le mot `1Score` en police display du score (Barlow Condensed Black ou équivalent), le reste en Inter/Manrope ; libellés de picto 11 à 12 px, majuscules, espacement +0,04 em. **Jeu de pictos unique** : trait 2 px, sans remplissage, 32 à 36 px, **SVG inline** (aucune police d'icônes), table de correspondance action → picto → libellé en §10.7 de la spec UX.
- UX-DR29 : Construire le composant **`SideBar`** — colonne **gauche**, largeur fixe 120 px en paysage (96 px en portrait, libellés sur deux lignes autorisés), conteneur à contour sur toute la hauteur, fond `--color-surface`. **En-tête** logo (asset à fournir ; repli : rond `--color-cloth` portant « 1 ») + mot `1Score`, hauteur 96 px, **tap sans effet**. **Items** empilés, picto au-dessus d'un libellé court, ≥ 90×90 px, pleine largeur, séparés de 12 px. L'item de **sortie** (croix, « Fermer l'application », « Quitter ») est toujours **calé en bas**, isolé du reste.
- UX-DR30 : Implémenter l'état **« BIENTÔT »** (sidebar, tuiles, `IconAction`) : picto et libellé à 45 % d'opacité, petit badge `BIENTÔT` sous le libellé, **tap sans effet, sans pop-up** — visible, atténué, inerte.
- UX-DR31 : Contenu de la `SideBar` par écran — **Accueil** : `MODE ENTRAÎNEMENT` (BIENTÔT), `INSCRIPTION` (BIENTÔT) ; sortie `FERMER L'APPLICATION` (**inerte, état BIENTÔT** — décision de Nathan, 2026-09-11 : non prioritaire, voir AR26). **Sélection JDS** : `RETOUR` → accueil. **Paramétrage joueurs** : `RETOUR` → écran précédent (sélection JDS, ou accueil pour le 3 Bandes) **saisies conservées**, `CONFIGURATION` (BIENTÔT) ; sortie croix `ANNULER` → accueil, saisies effacées. **Scoreboard : pas de barre latérale.** **Récap** : `RECOMMENCER` → revanche immédiate, mêmes joueurs et distances (ex-`UNE PARTIE DE PLUS`) ; sortie `QUITTER` → accueil (ex-`FIN DE PARTIE`). *(Amendé le 2026-09-14, Story 10.5, décision de Nathan : `RECOMMENCER` en **item**, `QUITTER` en **slot de sortie** — l'ordre ci-dessus listait les deux en items, l'inverse ; la convention de l'epic isole l'action irréversible en bas. Ni l'une ni l'autre n'ouvre de confirmation.)*
- UX-DR32 : `FERMER L'APPLICATION` ouvre un `PromptModal` **« FERMER 1SCORE ? »** avec `FERMER` / `ANNULER` ; le comportement de `FERMER` est celui validé par le spike AR26 (fermeture de la fenêtre, ou repli : retour à l'accueil de l'application, pop-up identique). **Reporté hors Epic 10** (décision de Nathan, 2026-09-11) : en Epic 10 l'item est un placeholder inerte, aucune pop-up n'est construite.

*Accueil et sélection JDS (Stories 10.1, 10.2)*

- UX-DR33 : Réécrire l'**Accueil** en sidebar complète + zone principale en deux bandes : **accroche** en haut (une phrase courte en display, 40 à 56 px fluide, blanc sur le dégradé, alignée à gauche avec 32 px de marge, sans sous-texte, libellé final à choisir par Nathan) et **tuiles** en bas. L'accueil reste **l'écran de veille** : rien n'y bouge, rien n'y clignote. La pop-up « PARTIE EN COURS » au lancement est inchangée.
- UX-DR34 : Construire le composant **`ModeTile`** — conteneur à contour, fond dans sa couleur `--color-tile-*` à 85 % d'opacité, titre (28 à 36 px, gras), **accroche** d'une ligne (16 à 18 px), **flèche `→`** en bas à droite. État BIENTÔT : fond à 45 %, flèche remplacée par le badge, tap sans effet. Rangée de tuiles de hauteur égale (≈ 34 % de la hauteur utile, ≥ 180 px).
- UX-DR35 : Accueil = 4 tuiles `3 BANDES` · `JEUX DE SÉRIES` · `QUILLES` (BIENTÔT) · `CASIN` (BIENTÔT), avec accroches (ex. « Le jeu des champions », « Libre, cadre, bande, 4 billes », « Bientôt sur 1Score »). **`3 BANDES` → paramétrage joueurs directement** ; `JEUX DE SÉRIES` → sélection JDS.
- UX-DR36 : **Sélection JDS** — sidebar réduite (`RETOUR`), titre `JEUX DE SÉRIES` en display, 4 tuiles `LIBRE` · `BANDE` · `CADRE` · `4 BILLES` (même gabarit, ~~toutes en `--color-tile-jds`~~, ~~accroches « Sans contrainte », « Une bande avant le second point », « 47/2 · 47/1 · 71/2 », « Deux billes rouges »~~). Aucun nouveau mode : FR12 inchangée. *(Amendé le 2026-09-12, création de la Story 10.2, décisions de Nathan : **aucune accroche** — titre et flèche seuls, comme à l'accueil — et **famille de quatre bleus dérivés de `--gradient-tile-jds`**, du plus clair au plus sombre, `LIBRE` reprenant exactement la couleur de la tuile `JEUX DE SÉRIES` de l'accueil.)*
- UX-DR37 : `CADRE` ouvre une **variante « liste » de `PromptModal`** à *n* CTA empilés — `47/2` · `47/1` · `71/2`, puis `ANNULER` neutre en dernier — voile inerte, aucune croix (règle PromptModal). Le choix mène au paramétrage joueurs. ***Revue de rendu de Nathan (2026-09-12, Story 10.2)*** : les CTA de la liste ne sont **pas empilés** mais sur **une seule ligne** en colonnes égales, **tous du même bleu d'accent** (aucun n'est le choix par défaut) ; `ANNULER` reste neutre, seul, **sous** la ligne et sur toute sa largeur ; le titre est **centré** en variante liste. La pop-up passe par ailleurs aux **angles vifs** (rayons pris aux tokens `--radius-container` / `--radius-cta`) et à un gabarit resserré (`max-w-xl`, padding réduit) — direction valable pour **toutes** les pop-ups du produit, celles à un ou deux CTA comprises. ***Complément de la même revue (2026-09-12) :*** l'accent des CTA n'est plus `--color-accent` mais `--gradient-cta`, **exactement le bleu de la tuile JEUX DE SÉRIES / LIBRE**, en dégradé **interne à chaque bouton** (jamais étalé sur la rangée) ; `ANNULER` porte le même dégradé en blanc voilé (`--gradient-cta-neutral`). La carte prend `--radius-modal` (12 px, seule exception aux angles vifs) ; les CTA restent à 0. **Le voile ferme la variante liste** sur un geste complet (appui ET relâchement dessus) et émet `secondary` — un choix est annulable ; les pop-ups de **décision** gardent leur voile **inerte** (AC18, Décision 12 : la pop-up de fin monte sous le doigt qui valide une série). ***Éclairci le 2026-09-12 (Nathan, « trop sombre ») :*** `--gradient-cta` passe au **haut** de l'échelle des bleus — `#3C9AE3` → `--color-cloth` — et le libellé des CTA passe en **blanc** (plus `--color-on-accent`) ; `--gradient-cta-neutral` remonte à 0,22 → 0,10. Blanc sur le point le plus clair du dégradé : **3,03:1**, conforme AA pour du texte large (les libellés font ~24 px en `font-black`) et ~3,9:1 sous le texte, centré sur la médiane — **à revalider dans la passe contraste de la 10.7**. ***Simplifié le 2026-09-12 (Nathan) :*** l'échelle d'une nuance par tuile est **abandonnée**. `--gradient-blue` (`#2E8FDB` → `--color-cloth`, la couleur de la tuile 3 BANDES) est **LE** bleu du produit : toutes les tuiles disponibles le portent, à l'accueil comme en sélection JDS, et tout CTA qui demande du bleu aussi. `--gradient-tile-jds`, la famille `-2|3|4` et `--gradient-cta` disparaissent ; seules survivent les deux nuances sombres des tuiles **BIENTÔT** (`--gradient-tile-quilles`, `--gradient-tile-casin`), laissées telles quelles — elles disent l'inactivité autant que le badge. Côté composant, `ModeTile.color` devient **optionnel** : une tuile ouverte n'a plus de couleur à choisir, l'écran n'en passe que pour les deux tuiles fermées.

*Paramétrage joueurs (Story 10.3)*

- UX-DR38 : Réécrire le paramétrage en **trois colonnes** (2/5 · 1/5 · 2/5 de la zone principale, hors sidebar) : carte du joueur **à la bille blanche** à gauche par défaut, **colonne de réglages** au centre, carte du joueur **à la bille jaune** à droite par défaut. **Carte joueur (paramétrage)** : conteneur à contour, fond plein couleur de bille, **médaillon de bille** en haut (rond de 64 px, blanc ou jaune sur fond sombre, avec liseré — il rend la bille lisible même quand les cartes ont changé de côté), puis deux **champs** centrés, chacun un conteneur à contour tapable : `NOM` (libellé d'attente `JOUEUR`, gris) et `DISTANCE` (libellé d'attente `0`, gris). Le champ **visé** porte le liseré rouge (présence, pas teinte).
- UX-DR39 : Construire **`NumericPadDock`** — le tap sur `DISTANCE` ouvre le **pavé numérique nu** (`NumericPad` sans carte ni en-tête) **dans la colonne centrale**, à la place des CTA de réglage ; ~~le reste de l'écran passe sous un **voile léger flouté** (blur 4 px, 30 % noir) **sauf la carte visée**~~ *(caduc — Story 10.3, 2026-09-12 : **aucun voile ni flou**, les deux cartes restent nettes et lisibles pendant la frappe)*, le champ `DISTANCE` visé **s'actualise à chaque touche**. Sous le pavé, `VALIDER` accent pleine largeur de colonne ; `AC`/`C`, `⌫` inchangés. Fermeture par `VALIDER`, par la croix en haut du dock, ou par le tap sur un autre champ (qui **valide** la saisie en cours) — la croix abandonne et restaure la valeur précédente. *(Révisé le 2026-09-12 : il n'y a plus de voile, donc plus de fermeture par geste sur le voile.)* Plafond 3 chiffres, frappe ignorée avec pulsation ; **plafond unique** `MAX_TARGET_SCORE` qui redescend vers le pavé (dette reprise). Le dock est l'**hôte** du plafond et de l'haptique ; le **buffer vit dans l'écran** (révisé le 2026-09-12 : c'est la carte qui l'affiche en direct, deux buffers divergeraient) ; `NumericPad` reste muet.
- UX-DR40 : Construire **`AlphaKeyboardSheet`** — le tap sur `NOM` ouvre l'`AlphaKeyboard` en **bandeau bas pleine largeur** (conteneur à contour, croix à gauche, `VALIDER` à droite), champ `NOM` actualisé en direct. *(Révisé le 2026-09-12 : **aucun voile** — le bandeau est monté dans le flux, les deux cartes restent entières au-dessus ; « ≈ 45 % » était une intention, la hauteur réelle est ≈ 56 % et la contrainte dure est « touches ≥ 57 px, rien qui déborde ».)* Clavier **complété** : tiret, apostrophe, `Ë Ï Î Ô Û` (dette reprise, avancée depuis l'Epic 4). Touches ≥ 57 px (exception UX-DR8 inchangée). Majuscules automatiques, 20 caractères.
- UX-DR41 : **Supprimer `PlayerSetupModal`** : plus de pop-up « joueur » regroupant nom et distance, chaque champ se règle en place. Le rattrapage **« DISTANCE MANQUANTE »** (Story 1.10) subsiste : `RÉGLER LA DISTANCE` **ouvre directement le dock sur le champ `DISTANCE` du premier joueur sans distance**, puis du second à la suite si elle manque encore.
- UX-DR42 : **Colonne centrale (état repos)** : titre du mode en surtitre discret (ex. `CADRE 47/2`), puis **une ligne de deux CTA neutres à contour** de demi-largeur — **`CHANGER DE BILLE`** (picto ⇄ sur deux billes) et **`CHANGER DE CÔTÉ`** (picto ⇄ horizontal) — puis **`DÉMARRER`** accent, pleine largeur, ≥ 110 px de haut. Modèle : Cueuny.
- UX-DR43 : **Mécanique dissociée bille/côté** — `CHANGER DE BILLE` : **les billes s'échangent, les joueurs restent en place** (la carte de gauche devient jaune — fond, bandeau, médaillon — celle de droite blanche ; noms et distances ne bougent pas). `CHANGER DE CÔTÉ` : **les cartes s'échangent de place, tout compris** (nom, distance, bille). Chacune est **son propre inverse**, disponible **jusqu'à `DÉMARRER` seulement**, jamais en cours de partie. Conséquence : « gauche = blanc » n'est plus une invariante ; la carte blanche reste le repère visuel de « celui qui ouvre » (AR24).
- UX-DR44 : Sidebar du paramétrage : `RETOUR` **conserve les saisies** ; croix `ANNULER` → accueil, joueurs effacés, **sans confirmation** (rien d'irréversible : pas de partie commencée) ; `CONFIGURATION` en BIENTÔT.

*Scoreboard, JDS et 3 Bandes (Story 10.4)*

- UX-DR45 : Réorganiser **`PlayerPanel`** en conteneur à contour, fond plein couleur de bille, **quatre zones** de haut en bas : (1) **bandeau** (22 % de la carte, fond `--color-panel-*-band`, ou à défaut une ligne de 1 px) avec **`NOM`** en haut à gauche (gras, **deux lignes max** puis troncature — seul le nom se tronque, jamais une valeur chiffrée), **`DISTANCE`** en haut à droite (libellé petit + valeur) et **`RESTANT`** juste sous le nom ; (2) **score** géant centré, règles de taille par nombre de chiffres inchangées, paliers ajustés (le bandeau et la ligne MOY/SÉRIE reprennent ≈ 10 % de hauteur) ; (3) **`MOY` · `SÉRIE`** sur une ligne sous le score (18 à 22 px, séparés par un point médian) ; (4) **pied** : `−` à gauche, `+` à droite (≥ 90×90 px, inchangés) et, entre les deux, la **zone de série** : série en cours en 3 Bandes, `POUR n` temporaire (3 Bandes, inchangé), **valeur en cours de saisie** en JDS quand le dock est ouvert, rien sinon.
- UX-DR46 : **`RESTANT = max(distance − score, 0)`**, permanent, **tous modes**, masqué sans distance, champ dérivé (AR25). Cohabitation avec `POUR n` en 3 Bandes pendant les 3 derniers points **assumée** : `RESTANT` est l'information de fond, `POUR n` l'annonce d'arbitre.
- UX-DR47 : **Le tap sur la carte n'a plus aucun effet** : l'état « tapable pour rendre la main » est retiré, `PlayerPanel` n'a plus que deux états, *repos* et *actif*. Tour actif = **liseré rouge épais sur le conteneur** (présence, pas teinte, UX-DR14 inchangée).
- UX-DR48 : Réduire **`CenterPanel`** (conteneur à contour, fond `--color-surface`) à trois éléments empilés : **`REP`** + compteur en haut, **chrono** (3 Bandes uniquement ; en JDS l'espace reste vide et `PASSER LE TOUR` remonte), **`PASSER LE TOUR`** en bas (CTA neutre à contour fort, pleine largeur de colonne, ≥ 90 px de haut, libellé sur deux lignes si besoin). **`ANNULER` et `ÉCHANGER` en sortent.** Le chrono (anneau, fondu vert → rouge, taille fluide, inchangé) **peut déborder** sur les cartes voisines de 12 à 20 px (au-dessus des cartes en `z-index`, cartes réservant une marge intérieure sur ce bord) — **facultatif** : si la colonne offre déjà un anneau ≥ 160 px, il ne déborde pas ; à valider au rendu. *(**Livré le 2026-09-14, Story 10.4 — décision 4 de Nathan** : le seuil des 160 px n'est PAS la règle de départ. Le débordement est le **premier jet**, systématique, à 15 px de chaque côté (mesuré aux trois formats) ; Nathan ajuste au rendu. ⚠️ Le débordement est porté par la COLONNE (`-mx-4` + `w-[calc(100%+64px)]` sur un conteneur `z-10`), jamais par `ShotClock`. Il se calcule sur la **content box** : la colonne portant `p-2`, un `-mx-2` ne reconstitue que sa border-box et l'anneau ne sort alors d'aucun pixel — défaut mesuré à la passe navigateur, invisible en test. **Écart constaté** : l'anneau recouvre le liseré de tour sur ~15 px de large, la carte `@container` créant un contexte d'empilement qui confine le `z-20` du liseré. Assumé au premier jet, à trancher avec Nathan.)*
- UX-DR49 : **`PASSER LE TOUR`**, unique geste de passage **sans marquer** : en **JDS**, enregistre une **série de 0** et bascule ; en **3 Bandes**, clôture la série comptée par les `+1` et bascule, le chrono repart à 40 avec ses 2 s de latence. **Une action dans la pile d'undo** (`ANNULER` la défait). **Toujours disponible** en partie ; masqué sous le dock quand le pavé est ouvert ; inerte pendant les pop-ups de fin. Rentrer une série au pavé (`VALIDER`, auto-validation) **continue de basculer automatiquement**.
- UX-DR50 : ⚠️ **CADUC dans sa forme (décision 2 de Nathan, 2026-09-12, livrée le 2026-09-14, Story 10.4)** — `ScoreEntryDock` n'est **pas** un dock central flouté mais une **pop-up LATÉRALE**, alignée sur le côté OPPOSÉ à la carte du joueur qui a la main, reprise de la coquille de `NumericPadDock` validée en 10.3 : voile `bg-black/25` **sans flou** (flouter rendrait illisible la seule chose qu'on doit lire pendant la frappe), **aucun en-tête** — ni croix, ni bille, ni nom —, `ANNULER` à la place de la croix, fermeture au tap dehors sur geste complet. La carte visée reste **entièrement visible et nette** et la valeur s'y écrit entre `−` et `+`. Le CTA `PASSER LE TOUR` est **masqué** sous la pop-up au lieu d'être recouvert. La largeur minimale de 220 px est **sans objet** (la pop-up dispose des 3/5 libérés). Géométrie portée par `--game-popup-inset-left|right`, propres au scoreboard (colonnes 2/5 · 1/5 · 2/5, **sans** barre latérale) — à ne pas confondre avec `--setup-popup-inset-*`. L'accusé de frappe (flash) se joue désormais **sur la carte**, là où la valeur change (UX-DR17) ; le refus, lui, pulse le pavé, sous le doigt. Restent vraies : sémantiques de `VALIDER`, auto-validation à 3 s, geste complet sur le voile, « une seule saisie à la fois », buffer dans le store (persisté, Story 1.12). Texte d'origine conservé ci-dessous pour mémoire.
  - *(d'origine)* **Saisie de série en JDS par dock central** (`ScoreEntryModal` → `ScoreEntryDock`, hébergé par `NumericPadDock`, **même contrat**) : le CTA de la barre basse ouvre le pavé nu dans la colonne centrale (croix en haut, `NumericPad`, `VALIDER` accent en pied avec son compte à rebours de 3 s), qui **recouvre `REP` et `PASSER LE TOUR`** le temps de la saisie. Voile flouté léger sur le reste, **sauf la carte du joueur qui a la main**, nette, où la valeur tapée s'affiche **entre `−` et `+`** en grand (même taille que `POUR n`), dans la couleur d'encre de la carte. Largeur minimale du dock **220 px** (débordement sur les bords intérieurs des cartes floutées accepté en portrait). Issues : `VALIDER`, auto-validation à 3 s, croix, geste complet sur le voile. « Une seule saisie à la fois » reste entière.
- UX-DR51 : Reconstruire **`ActionBar`** (scoreboard uniquement, calée sur les colonnes des cartes, deux groupes qui **échangent de côté à chaque bascule**, inchangé) : **côté du joueur assis**, le CTA de saisie accent large comme la carte — **`+ POINTS ADVERSAIRE`** en JDS (ouvre le dock), **`+1 ADVERSAIRE`** en 3 Bandes (crédite un point, haptique, chrono relancé — Story 2.2 inchangée) ; **côté opposé**, **quatre `IconAction`** du bord **extérieur** vers l'intérieur : **`QUITTER`** (porte) · **`PARAMÈTRES`** (engrenage, **BIENTÔT**) · **`RECOMMENCER`** (flèche circulaire) · **`ANNULER`** (flèche retour courbe). Comportements inchangés (`QUITTER` → « TERMINER LA PARTIE ? » ou accueil direct sans série ; `RECOMMENCER` → « RECOMMENCER LA PARTIE ? », grisé sur scoreboard intact ; `ANNULER` = undo multi-niveaux, grisé à pile vide). ~~En **portrait**, libellés masqués, pictos à 72 px.~~ *(**Caduc** : portrait hors périmètre produit, décision de Nathan du 2026-09-11 — aucune variante `portrait:` n'est écrite.)* *(**Livré le 2026-09-14** : `ActionBar` reçoit `ctaSide` (colonne d'écran) **et** `sideOwners` (joueur propriétaire de chaque colonne) — l'attribut `data-side` continue de nommer le JOUEUR, pas le côté, comme le lisent les tests de bascule depuis la 1.7. La résolution des côtés reste faite une seule fois par `GameView`.)* **Un seul markup pour les deux côtés** (ordre inversé par `flex-direction`) — fin de la duplication (dette reprise).
- UX-DR52 : Construire le composant **`IconAction`** — picto + libellé, ≥ 90×90 px libellé compris, fond `--color-surface`, contour, `--radius-cta`, séparés de 12 px ; états **normal / grisé / BIENTÔT**. *(Livré le 2026-09-14, Story 10.4 : séparation écrite `gap-[12px]` et non `gap-3`, qui vaudrait 24 px — `--spacing` est à 8 px. `disabled` **et** garde pour les états grisé et BIENTÔT.)*

*Récap et transverse (Stories 10.5, 10.7)*

- UX-DR53 : **`GameSummary`** — style Billiboard conservé (bandeau VS, trois colonnes, colonne du vainqueur en couleur victoire), désormais dans un **conteneur à contour** sur le dégradé, avec la **sidebar** `QUITTER` · `RECOMMENCER` ; la barre basse `FIN DE PARTIE` / `UNE PARTIE DE PLUS` **disparaît**. **Bandeau** : nom et distance dans **deux éléments distincts** — le nom se tronque seul (ellipse), la distance n'est **jamais** masquée (dette reprise). Côtés = ceux du scoreboard (la carte blanche peut être à droite). Toujours **terminal**.
- UX-DR54 : `NumericPad` et `AlphaKeyboard` passent en **style contour** (tokens UX-DR27), partagent toujours `keyClasses.ts`, et **restent muets** (ni buffer, ni plafond, ni timer, ni haptique — portés par leurs hôtes dock/sheet).
- UX-DR55 : *(livré en Story 10.7, 2026-09-14 — ⚠️ **QUATRE** pop-ups et non trois : `ScoreEntryDock` s'est ajouté quand la 10.4 a supprimé `ScoreEntryModal`. La garde `reduced-motion` épargne DEUX animations, le chrono **et** la barre de rebours — décision de Nathan, écart assumé.)* **Sémantique de dialogue** sur toutes les pop-ups, dock et sheet (`PromptModal`, `NumericPadDock`, `AlphaKeyboardSheet`) : `role="dialog"`, `aria-modal`, `aria-labelledby` vers le titre ; **garde `prefers-reduced-motion`** sur les animations d'ouverture/fermeture (dette reprise). L'arbitrage « borne fixe » reste : pas de gestion du focus clavier au-delà de ce qui est gratuit.
- UX-DR56 : *(livré en Story 10.7, 2026-09-14 — le token vaut `#E6CA00` et non `#E6B000` : encre noire à **12,81:1**, laissé tel quel. Les libellés de picto de la `SideBar` sont sur `--color-sidebar` (18,61:1), pas sur `--color-surface`. La mention « fond à 85 % » est caduque. Mesure élargie à TOUS les translucides ; trois échecs corrigés.)* **Contraste WCAG AA** à vérifier sur le bandeau jaune foncé (`#E6B000` + encre noire) et sur les libellés de picto sur `--color-surface` (UX-DR22). **Règles conservées** (spec §10.6), à ne pas perdre dans la refonte : bille fixe **à la carte** ; tour actif par présence d'un liseré ; zones tactiles ≥ 90×90 px hors claviers ; claviers intégrés, jamais le clavier système ; haptique + visuel < 100 ms ; `VALIDER` ou 3 s ; une seule saisie à la fois ; undo multi-niveaux grisé à pile vide ; pop-ups de décision sans croix, retour toujours nommé `ANNULER` ; règles de fin de partie, égalisatrice, `POUR n`, chrono 40 s en fondu ; aucune alerte d'inactivité ; mise à jour de l'app à l'accueil seulement.

**Reste à trancher, non bloquant** (spec §10.8, à porter par les stories concernées) : hex exact de `--color-cloth` (10.1) ; libellé de l'accroche d'accueil et les quatre accroches de tuiles (10.1) ; logo 1Score en SVG (10.1, repli prévu) ; débordement du chrono (10.4, option). *Le spike « Fermer l'application » sort de l'epic (item inerte en 10.1).*

### Dette reprise par l'Epic 10 *(ajouté le 2026-09-11, `deferred-work.md`)*

- DT1 : Plafond de distance défini deux fois (`MAX_DIGITS = 3` dans `PlayerSetupModal`, `MAX_TARGET_SCORE = 999` dans `useGameStore`) et `MAX_SCORE_DIGITS` encodant FR7 indépendamment — **une seule source**, qui redescend vers le pavé (Story 10.3, avec UX-DR39).
- DT2 : Markup dupliqué de la barre basse (`GameView.vue`, CTA/SVG copiés par colonne, alignement dépendant de `-mx-4`/`ml-4`/`mr-4`, aggravé par RECOMMENCER) — **markup unique** (Story 10.4, avec UX-DR51).
- DT3 : **CLOS en Story 10.7 (2026-09-14).** Pop-ups sans sémantique de dialogue ni garde `prefers-reduced-motion` (~~`ScoreEntryModal`, `PlayerSetupModal`~~ supprimés en 10.4 et 10.3 ; les quatre pop-ups vivantes sont `PromptModal`, `NumericPadDock`, `AlphaKeyboardSheet`, `ScoreEntryDock` ; `main.css`) — traité d'un bloc (Story 10.7, avec UX-DR55). Le voile plein écran garde ses handlers pointer **sans** `role="button"` : exception explicite à CLAUDE.md §2 à consigner.
- DT4 : Clavier alphabétique incomplet (tiret, apostrophe, `Ë Ï Î Ô Û`) — complété (Story 10.3, avec UX-DR40), avancé depuis la Story 4.2.
- DT5 : `Player.id` positionnel redondant — supprimé avec la scission de `swapPlayers` (Story 10.3, avec AR21).
- DT6 : Bandeau du récap : un nom de 20 lettres larges masque la distance — **CLOS le 2026-09-14 (Story 10.5)** : nom et distance sont deux éléments (`min-w-0 truncate` / `shrink-0`) séparés d'un filet, le nombre nu, au modèle de bandeau de carte de la 10.4.
- DT7 : **Clos sans code** : « `ÉCHANGER` pendant une reprise entamée casse la déduction de la série ouverte » — le mécanisme n'existe plus en jeu (Story 10.4, AR22). **Non repris** (restent dans leur file) : chrono non ancré sur l'horloge (consolidation technique V1), deux joueurs de même nom et renommage en partie (Epic 4), `PlayerPanel` en `role="button"` englobant deux `<button>` (disparaît de fait avec UX-DR47 — à vérifier en revue de la 10.4).

### FR Coverage Map

FR1: Epic 1 - Démarrer une partie (mode + noms joueurs)
FR2: Epic 1 - Saisir le score d'une série
FR3: Epic 1 - Calcul temps réel du score total
FR4: Epic 1 - Terminer une partie et récapitulatif automatique
FR5: Epic 3 - Nouvelle partie sans effacer les parties rattachées à un profil *(reformulé le 2026-09-11)*
FR6: Epic 1 - Préservation de l'état en cas de fermeture accidentelle
FR7: Epic 1 - Saisie via pavé tactile
FR8: Epic 1 - Annuler la saisie en cours
FR9: Epic 1 - Annuler la dernière série validée
FR10: Epic 1 - Saisie d'un score négatif
FR11: Epic 1 - Retour haptique/visuel de confirmation
FR12: Epic 1 - Sélection d'un mode JDS (Libre, Cadre 47/2, 47/1, 71/2, 1 Bande, 4 Billes)
FR13: Epic 2 - Sélection du mode 3 Bandes avec timer
FR14: Epic 2 - Incrémentation point par point ou score global en 3 Bandes
FR15: Epic 1 - Configuration du format du match
FR16: Epic 1 - Détection automatique de fin de set/match *(fin de **match** sur distance atteinte livrée en Story 1.10, règle de la reprise égalisatrice comprise — 2026-09-10 ; la fin de **set** reste hors V1a, Epic 2)*
FR17: Epic 1 - Affichage automatique des stats de fin de match
FR18: Epic 3 - Liste de mes parties depuis mon profil, puis depuis une tablette une fois identifié *(2026-09-11)*
FR19: Epic 3 - Détail complet d'une de mes parties passées *(joueur identifié, 2026-09-11)*
FR20: Epic 3 - Conservation sans limite sur le profil ; file locale conservée jusqu'à synchronisation *(2026-09-11)*
FR21: Epic 4 - Statistiques cumulées de carrière (record personnel compris — ex-3.5, 2026-09-11)
FR22: Epic 4 - Évolution de la moyenne dans le temps
FR23: Epic 6 - Affichage grand format vue salle
FR24: Epic 6 - URL overlay OBS/Streamlabs
FR25: Epic 6 - Mise à jour temps réel de l'overlay
FR26: Epic 6 - Diffusion des scores sur écran TV réseau local
FR27: Epic 7 - Contrôle arbitre via interface déportée
FR28: Epic 8 - Création de tournoi et assignation de matchs
FR29: Epic 8 - Tableau de bord centralisé multi-tables
FR30: Epic 8 - Gestion de la progression du tournoi
FR31: Epic 5 - Minuteur de facturation à la table
FR32: Epic 4 - Création de compte joueur avec identifiant court
FR33: Epic 4 - Identification sur n'importe quelle tablette de club
FR34: Epic 5 - Gestion des tables du club
FR35: Epic 5 - Statistiques d'usage du club
FR36: Epic 3 (déplacée depuis l'Epic 5 le 2026-09-11) - Synchronisation locale vers le cloud
FR37: Epic 5 - Gestion de l'abonnement club
FR38: Epic 9 - Export des résultats au format fédération
FR39: Epic 1 - Modifier les noms des joueurs en cours de partie
FR40: Epic 1 - Réinitialiser une partie en cours
FR41: Epic 1 - Configurer les paramètres d'une partie
FR42: Epic 1 - Activer/désactiver l'annonce vocale
FR43: Epic 1 - Détection et alerte d'inactivité *(story 1.17 **annulée** le 2026-09-10 : une série de JDS peut durer plus d'une heure, l'inactivité de partie n'est pas un signal ; la veille de la tablette, hors partie, est un sujet d'accueil)*
FR44: Epic 6 - Signalisation visuelle des moments clés
FR45: Epic 1 - Fonctionnement sans connexion réseau
FR46: Epic 1 - Installation comme application native

*Epic 10 (2026-09-11) : aucune FR nouvelle — refonte de présentation des FR1, FR2, FR4, FR7, FR8, FR9, FR11, FR12, FR13, FR14, FR17, FR40, FR41 déjà livrées (Epics 1-2), plus AR20-AR27, UX-DR25-UX-DR56 et DT1-DT7.*

## Epic List

### Epic 1: Démarrer et Jouer une Partie JDS (V1a)
Un joueur démarre une partie en moins de 30 secondes sans formation, saisit et corrige ses scores en modes JDS (Libre, Cadre 47/2, 47/1, 71/2, 1 Bande, 4 Billes) sans friction ni risque de perte de données, et voit ses statistiques calculées automatiquement à la fin du match.
**FRs couverts :** FR1, FR2, FR3, FR4, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR15, FR16, FR17, FR39, FR40, FR41, FR42, FR43, FR45, FR46
**Notes d'implémentation :** Story 1.1 = initialisation du projet (starter `@vite-pwa/create-pwa`, template vue-ts — AR1). Story 1.2 = création de `CLAUDE.md` (AR2), avant tout code fonctionnel. Couvre les fondations architecturales transverses (types, stores Pinia, services storage, Pointer Events, conventions de nommage — AR3-AR19) et les patterns UX cœur (Bloc Plein, couleurs joueur dynamiques, validation hybride, correction à poids égal, feedback haptique, symétrie des panneaux — UX-DR1-3, UX-DR6-12, UX-DR14-19, UX-DR22-23). NFR1, NFR2, NFR3, NFR5, NFR6, NFR8, NFR9, NFR10, NFR12, NFR13 s'appliquent directement.

### Epic 2: Jouer en Mode 3 Bandes avec Chronométrage (V1b)
Un joueur peut jouer une partie complète en mode 3 Bandes, avec un chronomètre de série toujours actif, en saisissant son score point par point (tap incrémental par le joueur assis) ou en score global en fin de série.
**FRs couverts :** FR13, FR14
**Notes d'implémentation :** Isolé du périmètre V1a — ne bloque pas Epic 1. Composable `useTimer.ts` (AR14). Couleur d'alerte chrono (UX-DR4) et interaction tap-incrémental (UX-DR24). S'appuie sur le shell `PlayerPanel`/`CenterPanel` déjà livré par Epic 1, sans le modifier.

### Epic 3: Parties rattachées au profil joueur (V2a) — *redéfini le 2026-09-11*
Une partie terminée est rattachée aux profils des joueurs identifiés, conservée localement jusqu'à synchronisation, puis consultable depuis le profil du joueur et, ensuite, depuis les tablettes du club — sans jamais être perdue en démarrant une nouvelle partie.
**FRs couverts :** FR5, FR18, FR19, FR20, FR36 (déplacée depuis l'Epic 5)
**Notes d'implémentation (2026-09-11, `sprint-change-proposal-2026-09-11.md`, approuvée par Nathan) :** s'exécute **APRÈS l'Epic 4** (numéro conservé). Conserve de l'ancienne 3.1 le socle `databaseService.ts`/`GameRecord`/déclencheur `finishGame`, requalifié en **file locale de synchronisation** (identifiant joueur par côté, `null` = invité, statut de sync). Abandonne l'historique par appareil, la rétention 30 jours et les records par nom (→ stats de carrière, Epic 4). Consultation : profil d'abord, tablette du club ensuite (décision 3 de Nathan). Les stories 3.1-3.5 sont à **réécrire** par une passe `create-epics-and-stories` une fois l'architecture backend décidée.
*Ancien objectif (V1a, abandonné) :* « retrouver ses parties jusqu'à 30 jours en arrière depuis le même appareil ». *Anciennes notes :* Routes `/history` et `/history/:id` (AR6), `useHistoryStore` + `databaseService.ts` (Dexie.js/IndexedDB — AR4, AR7). État vide au premier lancement (UX-DR20). Couvre les parties jouées en modes JDS (Epic 1) et 3 Bandes (Epic 2). Story 3.5 referme la dépendance ouverte en Epic 1 / Story 1.10 : détection du "nouveau record personnel" (UX-DR13), repoussée ici car elle nécessite l'historique multi-parties livré par cet epic.

### Epic 4: Comptes Joueurs & Suivi de Carrière (V2a) — *avancé le 2026-09-11, prochain epic après la consolidation V1*
Un joueur peut créer un compte avec un identifiant court mémorisable, s'identifier sur n'importe quelle tablette de club, consulter ses statistiques cumulées de carrière et visualiser l'évolution de sa moyenne dans le temps.
**FRs couverts :** FR21, FR22, FR32, FR33
**Notes d'implémentation :** *(2026-09-11, `sprint-change-proposal-2026-09-11.md`)* Précédé d'une **Story 4.0 — fondation backend et authentification**, elle-même conditionnée à une **décision d'architecture** (plateforme EU, auth ID court sans mot de passe à la tablette, modèle joueur/partie, RGPD). Décisions de Nathan : le compte se crée **à la tablette ou par une page web minimale** (pas d'app compagnon avant V4) ; l'identification à la tablette se fait **par code ou par recherche du nom** parmi les joueurs enregistrés ; l'**invité** reste le chemin le plus court (« 60 ans / 30 s » inchangé) ; sans réseau, on joue en invité. Absorbe l'ancienne 3.5 (record personnel = statistique de carrière). RGPD applicable dès ce jalon (NFR14, NFR15, NFR16). *Ancienne note :* ⚠️ Cet epic implique une app compagnon (mobile ou web) distincte de la PWA tablette, à développer en parallèle — précédent marché confirmé par CUESCO/Billiboard (référence UX, cf. `ux-design-specification.md`) qui séparent déjà création de compte (app/en ligne) et identification rapide à la tablette.

### Epic 5: Administration de Club Multi-Tables (V2/V3)
Un admin club peut gérer les tables de son club, consulter les statistiques d'usage, synchroniser automatiquement les données locales vers le cloud, gérer son abonnement SaaS et activer un minuteur de facturation à la table pour la location horaire.
**FRs couverts :** FR31, FR34, FR35, FR37 *(FR36 déplacée vers l'Epic 3 redéfini le 2026-09-11)*
**Notes d'implémentation :** Synchronisation offline→cloud garantissant zéro perte de données (NFR7) — *portée par l'Epic 3 redéfini depuis le 2026-09-11 (Story 5.2 déplacée)*. Hébergement EU + TLS 1.3 (NFR14, NFR15).

### Epic 6: Diffusion Grand Format & Overlay Stream (V2/V3)
Un organisateur peut diffuser les scores en cours sur un écran TV de salle, et un streameur peut générer une URL d'overlay fond transparent compatible OBS/Streamlabs, mise à jour en temps réel, avec mise en avant visuelle des moments clés d'une partie.
**FRs couverts :** FR23, FR24, FR25, FR26, FR44
**Notes d'implémentation :** Architecture multi-vues sur une seule source de données (découplage saisie/rendu déjà anticipé dès V1 en architecture). Real-time < 500ms (NFR4). Lisibilité à 5 mètres (NFR11).

### Epic 7: Arbitrage Déporté (V2/V3)
Un arbitre peut contrôler le scoreboard (validation, correction, pause du chronomètre) depuis une interface déportée (web remote ou Bluetooth) sans jamais toucher la tablette.
**FRs couverts :** FR27
**Notes d'implémentation :** Repose sur la contrainte architecturale actée dès V1 — toute action de score exposée en action Pinia nommée, jamais couplée exclusivement au geste tactile (UX-DR23). Fallback web remote si Bluetooth non supporté.

### Epic 8: Gestion de Tournoi Multi-Tables (V2/V3)
Un organisateur peut créer un tournoi, assigner les matchs aux tables disponibles et suivre la progression de toutes les tables actives en temps réel depuis un tableau de bord centralisé.
**FRs couverts :** FR28, FR29, FR30
**Notes d'implémentation :** Fonctionne de façon autonome, sans prérequis sur Epic 4 ni Epic 6. S'enrichit d'eux s'ils sont déjà livrés — le classement peut s'afficher sur l'écran TV si Epic 6 existe (cf. Story 8.3), et un match peut être associé à un compte joueur si Epic 4 existe — sans que l'un ou l'autre ne soit bloquant pour le fonctionnement du tournoi.

### Epic 9: Export Fédéral (V3)
Le système exporte les résultats des parties dans un format compatible avec les systèmes de la fédération française de billard carambole, pour alimenter automatiquement le futur classement national.
**FRs couverts :** FR38
**Notes d'implémentation :** Format d'import fédération inconnu à ce stade — export générique JSON/CSV adaptable (architecture V3).

### Epic 10: Refonte UI/UX Premium (1Score) (V1.1) — *ajouté le 2026-09-11, structure approuvée par Nathan le 2026-09-11*

> ⚠️ **Numéro conservé en fin de liste pour ne renommer aucun fichier de story existant, mais s'exécute EN RÉALITÉ juste après l'Epic 2, avant l'Epic 4** (`sprint-change-proposal-2026-09-11-refonte-ui.md`, approuvé par Nathan). Voir `sprint-status.yaml` pour l'ordre d'exécution réel.

Un club qui découvre le produit voit une interface premium et cohérente sur les cinq écrans du jeu déjà livré (accueil, sélection de mode, paramétrage joueurs, scoreboard, récap), sous le nom **1Score**, sans changement des règles de calcul de score. Deux mécaniques d'interaction évoluent : le passage de tour par une CTA dédiée `PASSER LE TOUR`, et l'interversion bille/côté dissociée en deux actions au paramétrage.
**FRs couverts :** aucune nouvelle FR — refonte de présentation des FR1, FR2, FR4, FR7, FR8, FR9, FR11, FR12, FR13, FR14, FR17, FR40, FR41 (Epics 1 et 2, livrées). Exigences propres : **AR20 à AR27, UX-DR25 à UX-DR56, DT1 à DT7.**
**Notes d'implémentation :** Découpage **par écran**, à la demande de Nathan. Chaque story laisse l'application complète et jouable : les anciens composants ne sont retirés que par la story qui les remplace. Ce que chaque story **crée** et ce qu'elle rattache :

| Story | Écran | Crée | Exigences |
|---|---|---|---|
| 10.6 | Renommage 1Score | rien de visuel (`CLAUDE.md`, manifest, `package.json`, titres) | AR27 |
| 10.1 | Accueil | tokens et dégradé, `SideBar`, `ModeTile`, état BIENTÔT, item « FERMER L'APPLICATION » **inerte** | AR20, AR26, UX-DR25 à UX-DR35 |
| 10.2 | Sélection JDS | variante « liste » de `PromptModal` (choix Cadre) | UX-DR36, UX-DR37 |
| 10.3 | Paramétrage joueurs | `NumericPadDock`, `AlphaKeyboardSheet`, actions bille/côté, suppression de `PlayerSetupModal`, retrait d'`ÉCHANGER` du jeu | AR21, AR22, AR24, UX-DR38 à UX-DR44, UX-DR54, DT1, DT4, DT5, DT7 |
| 10.4 | Scoreboard (JDS et 3 Bandes) | `IconAction`, `PASSER LE TOUR`, `ScoreEntryDock`, carte réorganisée, `CenterPanel` réduit, `ActionBar` reconstruite | AR23, AR25, UX-DR45 à UX-DR52, DT2 |
| 10.5 | Récap | rien de nouveau — réutilise `SideBar` | UX-DR53, DT6 |
| 10.7 | Finition transverse | sémantique de dialogue et garde `reduced-motion` sur toutes les pop-ups, contrôle de contraste AA, ~~passe portrait~~ passe iPad mini / iPad 11″ / 21,5″ (portrait abandonné le 2026-09-11) | UX-DR55, UX-DR56, DT3 |

**Ordre d'exécution : 10.6 → 10.1 → 10.2 → 10.3 → 10.4 → 10.5 → 10.7.** Le renommage passe en premier parce que la sidebar affiche le mot « 1Score » dès l'accueil. Les numéros restent ceux déjà cités dans le PRD, l'architecture, la spec UX et `sprint-status.yaml`.

**Décisions de Nathan à cette passe (2026-09-11) :** « Fermer l'application » n'est pas prioritaire — item de sidebar affiché mais inerte, sans spike ni pop-up (AR26/UX-DR32 reportés hors epic) ; la Story 10.4 reste **entière** malgré sa taille (fidélité au découpage par écran) ; la 10.7 est allégée à la finition transverse, la dette par écran étant portée par les 10.3, 10.4 et 10.5.

**Effet de bord :** en retirant `ÉCHANGER` du jeu en cours de partie, le backlog « `ÉCHANGER` pendant une reprise entamée casse la déduction de la série ouverte » (`deferred-work.md`, revue 2.1+2.2+2.4) devient sans objet — clos, pas corrigé (DT7).

---

## Epic 1: Démarrer et Jouer une Partie JDS (V1a)

Un joueur démarre une partie en moins de 30 secondes sans formation, saisit et corrige ses scores en modes JDS (Libre, Cadre 47/2, 47/1, 71/2, 1 Bande, 4 Billes) sans friction ni risque de perte de données, et voit ses statistiques calculées automatiquement à la fin du match.

### Story 1.1: Initialisation du projet

As a développeur (assisté par IA),
I want le projet scaffoldé avec le starter Vue 3 + Vite PWA et les dépendances complémentaires installées,
So that chaque story suivante dispose d'une base fonctionnelle, buildable et installable.

**Acceptance Criteria:**

**Given** un environnement Node.js configuré
**When** j'exécute `npm create @vite-pwa/pwa@latest 1score -- --template vue-ts`
**Then** un projet Vue 3 + TypeScript + Vite est créé avec le plugin PWA configuré (AR1)

**Given** le projet scaffoldé
**When** j'installe les dépendances complémentaires (Tailwind CSS v4, `@tailwindcss/vite`, Pinia, vue-router@4, Dexie, Vitest, Vue Test Utils, happy-dom)
**Then** `npm install` se termine sans erreur et `npm run build` produit un build fonctionnel (AR3)

**Given** la structure de fichiers définie en architecture
**When** le projet est initialisé
**Then** l'arborescence `src/types`, `src/stores`, `src/services`, `src/composables`, `src/components`, `src/views`, `src/router` est créée conformément à l'architecture

**Given** la configuration Tailwind CSS v4
**When** je définis les tokens de fondation visuelle (`tailwind.config`/CSS variables)
**Then** elle inclut la palette couleur (fond sombre, couleurs de bille blanc/jaune, accent bleu système, alerte rouge, victoire or — UX-DR1, UX-DR3, UX-DR5), l'échelle typographique fluide `clamp()` (UX-DR6), l'unité de base d'espacement 8px (UX-DR7), la taille minimale de zone tactile 90×90px (UX-DR8) et les 3 breakpoints responsive (UX-DR21)

**Given** la palette couleur définie
**When** je la valide sur fond sombre
**Then** le contraste WCAG AA (4.5:1 minimum) est respecté pour chaque combinaison texte/fond utilisée (UX-DR22, NFR10)

**Given** le projet buildé
**When** je lance `npm run dev`
**Then** l'application se charge sur un poste de développement standard sans erreur console

### Story 1.2: Rédaction de CLAUDE.md

As a développeur (assisté par IA),
I want un fichier `CLAUDE.md` à la racine documentant les conventions du projet,
So that chaque session de code IA génère un code cohérent avec l'architecture actée.

**Acceptance Criteria:**

**Given** le projet initialisé (Story 1.1)
**When** je crée `CLAUDE.md` à la racine
**Then** le fichier documente les conventions de nommage (AR15), la règle Pointer Events (AR8), la gestion d'erreurs storage en couche service (AR12), les règles Pinia (AR17, AR18), les tests co-localisés (AR16) et les breakpoints Tailwind (AR19)

**Given** `CLAUDE.md` rédigé
**When** un futur agent IA l'utilise comme référence avant de coder
**Then** il dispose de toutes les règles obligatoires de l'architecture sans consulter un autre document

### Story 1.3: Sélectionner un mode JDS et démarrer une partie

As a joueur (Michel),
I want sélectionner un mode de jeu JDS et saisir les deux noms de joueurs,
So that je peux démarrer une partie en moins de 30 secondes sans formation.

**Acceptance Criteria:**

**Given** je lance l'application sans partie en cours sauvegardée
**When** l'écran d'accueil s'affiche
**Then** `HomeScreen` fait office d'écran de veille et présente directement les 4 catégories de jeu en grandes cartes tactiles, sans bouton de démarrage intermédiaire (UX-DR12)

**Given** l'écran d'accueil
**When** je sélectionne une catégorie
**Then** une catégorie à plusieurs modes ouvre un second niveau listant ses modes, une catégorie à mode unique passe directement à l'étape suivante, et les catégories sans mode disponible restent affichées mais inertes, marquées « BIENTÔT »

**Given** un mode sélectionné
**When** l'étape des joueurs s'affiche
**Then** deux grands panneaux portant déjà la bille de leur côté présentent chacun le nom de son joueur ; taper une zone ouvre la pop-up de réglage de ce joueur (nom + distance), majuscules automatiques, 20 caractères max (UX-DR19) — *saisie inline remplacée par la pop-up en Story 1.4, cf. UX-DR19*

**Given** les deux noms saisis (ou conservés par défaut)
**When** je confirme
**Then** la partie démarre, `GameView` affiche deux blocs pleins à chiffres noirs — blanc à gauche, jaune à droite (UX-DR2) — avec le nom en haut à gauche et la distance de jeu en haut à droite, reprise 1 active

**Given** une partie qui vient de démarrer, avant la première reprise
**When** j'appuie sur le bouton d'interversion de la console centrale
**Then** les deux joueurs échangent de côté, la bille restant attachée au côté ; le bouton disparaît dès la première reprise validée

**Given** les deux `PlayerPanel` affichés
**When** je compare leurs contrôles et leur disposition
**Then** ils sont strictement symétriques — chacun porte ses propres contrôles de saisie, et `CenterPanel` ne porte que des actions symétriques s'appliquant identiquement aux deux joueurs (ANNULER, interversion) : aucune saisie de score ni action favorisant un joueur n'y est centralisée (UX-DR9, UX-DR11)

**Given** un joueur dont c'est le tour
**When** j'observe l'indicateur de tour actif
**Then** son panneau est encadré d'un liseré rouge épais : le signal porté est la présence du cadre, pas sa teinte, ce qui reste lisible en cas de daltonisme et à distance (UX-DR14)

**Given** le critère de succès PRD "60 ans / 30 secondes"
**When** un joueur non initié suit ce parcours complet (accueil → catégorie → mode → joueurs → prêt à saisir)
**Then** l'ensemble prend moins de 30 secondes, sans lecture de texte explicatif requise (NFR12)

### Story 1.4: Nommer chaque joueur et fixer sa distance avant de démarrer

As a joueur,
I want me nommer et fixer ma distance de jeu depuis ma propre zone, avant de démarrer,
So that le match a un objectif clair, y compris quand les deux joueurs ne jouent pas la même distance.

**Acceptance Criteria:**

**Given** l'étape joueurs de `HomeScreen`
**When** je tape la zone blanche ou la zone jaune
**Then** une pop-up s'ouvre pour **ce joueur-là**, portant sa bille, son nom et sa distance. Aucun bouton de réglage ne s'ajoute à la barre d'action : la zone du joueur **est** le point d'entrée (FR15, FR41 — hors pattes Casin, hors scope V1a)

**Given** la pop-up ouverte
**When** je l'observe
**Then** c'est une **vraie modale** — carte centrée, arrière-plan de la page visible mais **flouté**, et non un écran plein. Elle se ferme par la **croix en haut à gauche** ou par un **tap en dehors de la carte**, les deux abandonnant les modifications ; `VALIDER`, sur toute la largeur de la carte, les applique. Pas de route dédiée (AR6)

**Given** la pop-up
**When** je tape le champ `NOM` puis le champ `DISTANCE`
**Then** le clavier du bas **s'adapte au champ visé, au même emplacement** : clavier alphabétique pour le nom, pavé numérique pour la distance. Le champ visé porte un liseré ; rien ne se déplace à l'écran lors de la bascule

**Given** que l'écran cible est une **borne fixe** et non une tablette prise en main
**When** je saisis quoi que ce soit
**Then** la saisie passe exclusivement par les claviers de l'application : la modale **ne contient aucun champ natif**, donc le clavier du système ne peut ni se déclencher ni recouvrir l'interface

**Given** le champ `NOM`
**When** je tape
**Then** je dispose de l'AZERTY, d'une rangée de chiffres (« MICHEL 2 »), des accents `É È À Ç` des prénoms français, d'une barre d'espace et d'un retour arrière ; le nom est limité à 20 caractères et `JOUEUR` n'est qu'un libellé d'attente, jamais une valeur saisie

**Given** le champ `DISTANCE`
**When** je tape
**Then** **aucune distance n'est pré-remplie et aucun mode ne porte de distance par défaut** : le libellé d'attente est `0` (aucun objectif), la saisie est limitée à 3 chiffres (0-999), et le pavé offre `AC` — qui devient `C` dès qu'un chiffre est entré, convention calculatrice iOS — ainsi qu'un retour arrière

**Given** le besoin de handicap (convention coréenne : deux joueurs peuvent jouer des distances différentes)
**When** je règle chaque joueur depuis sa propre zone
**Then** les deux distances sont conservées séparément — il n'existe ni mode « lié » ni action de dissociation, chaque joueur saisit la sienne. La distance est un attribut du **joueur**, pas de la partie

**Given** aucun réglage explicite
**When** je démarre la partie
**Then** les deux joueurs s'appellent `JOUEUR 1` et `JOUEUR 2` et jouent sans distance (0) ; le parcours de démarrage est strictement identique à celui de la Story 1.3 et aucune fin de partie automatique n'est induite

**⚠️ Supersédé (Story 1.10, décision de Nathan, 2026-09-10) :** l'AC « aucun réglage explicite → sans distance (0) » ci-dessus est **caduc**. La **distance est obligatoire au démarrage** pour les deux joueurs : `DÉMARRER` sans distance n'ouvre qu'une pop-up d'erreur « DISTANCE MANQUANTE » (`PromptModal`, titre et CTA `RÉGLER LA DISTANCE` / `ANNULER`, sans croix) dont le premier ouvre la `PlayerSetupModal` du premier joueur sans distance directement sur le champ `DISTANCE` — et, si le blanc vient d'être réglé alors que le jaune manque encore, celle du jaune s'enchaîne d'elle-même (revue au rendu, 2026-09-10). Le **nom** reste optionnel (`JOUEUR 1` / `JOUEUR 2`). Le store, lui, reste permissif (0 = libre, aucune fin automatique) pour les tests et le pilotage déporté : c'est l'accueil qui impose la règle.

**Note de périmètre :** le champ `targetScore` existe depuis la Story 1.3 sur `GameState`, câblé en dur à 20. Cette story le **déplace sur `Player`** (handicap), supprime toute valeur par défaut et le pilote depuis la pop-up. Elle ne fait que *stocker* et *afficher* la distance : la détection de fin relève de la Story 1.11.

**Note de périmètre — sets :** le **nombre de sets** est retiré du périmètre de cette story. C'est une notion propre au 3 Bandes, traitée dans l'**Epic 2** (voir Story 2.1). FR15 n'est donc couvert en V1a que sur son volet « objectif de score ».

**Note de révision (2026-09-08) :** les AC de pré-remplissage par mode (« l'objectif de score est pré-rempli avec la distance de référence du mode choisi, portée par le catalogue `GAME_CATEGORIES` ») et de « distance par défaut du mode » sont **supprimés** par décision produit de Nathan : aucun mode ne porte de distance de référence, et aucune donnée fédérale ne doit être inventée. Cette décision supersede l'AC ajouté par `sprint-change-proposal-2026-09-08.md` §4.2(b).

**Note de révision (2026-09-09) :** une première implémentation plaçait un bouton `FORMAT` dans la barre d'action, ouvrant une modale plein écran unique avec un mode « lié » et un bouton `HANDICAP` pour dissocier les distances. Elle a été **rejetée à la revue de rendu** et entièrement remplacée par l'UX ci-dessus : une pop-up par joueur, ouverte depuis sa zone, avec le nom saisi dedans et des claviers intégrés. Le composant `MatchFormatModal.vue` a été supprimé.

### Story 1.5: Saisir le score d'une série au pavé numérique

As a joueur,
I want saisir le score de ma série sur un pavé tactile,
So that j'enregistre mon résultat sans calcul mental ni ambiguïté sur la validation.

> **AC réécrits le 2026-09-09** après trois passes de refonte produit menées avec Nathan pendant l'implémentation. Ils décrivent l'écran tel qu'il est livré. La version d'origine — pavé permanent dans le panneau, overlay sur le bloc joueur, emplacement réservé de `VALIDER` — est **caduque**.

**Acceptance Criteria:**

**Given** une partie en cours
**When** j'observe un panneau joueur
**Then** il ne porte que l'essentiel — en-tête, **score aussi grand que la carte le permet**, deux boutons de correction — et aucun pavé numérique. La taille du score s'adapte au nombre de chiffres (1 à 4) pour rester maximale sans jamais déborder, en paysage comme en portrait

**Given** un panneau joueur
**When** je lis son en-tête
**Then** le **nom**, la **moyenne** de la partie en cours, la **meilleure série** et la **distance** tiennent sur une seule ligne ; si la place manque, seul le nom est tronqué, jamais une valeur chiffrée

**Given** une partie en cours
**When** j'observe la barre basse
**Then** un bouton **`AJOUTER LES POINTS`** occupe toute la largeur du bloc joueur sous lequel il se trouve, placé du côté du joueur qui **n'a pas** la main — c'est l'adversaire assis qui compte les points de celui qui joue. Le picto de sortie occupe la colonne opposée, et les deux échangent de place à chaque bascule

**Given** que j'appuie sur `AJOUTER LES POINTS`
**When** la pop-up de saisie s'ouvre
**Then** elle reprend la coquille de la modale de configuration (voile flouté, carte centrée, croix, CTA en pied) et **reste ouverte quand je relâche le doigt**

**Given** la pop-up ouverte
**When** je tape un chiffre
**Then** la valeur en cours s'affiche en grand dans la couleur du joueur, avec un retour haptique + visuel en moins de 100ms (NFR1, FR11, UX-DR17)

**Given** une saisie déjà à 3 chiffres (plafond FR7 : 999)
**When** je tape un 4e chiffre
**Then** la frappe est ignorée, avec un retour haptique distinct (plus court/sec) et une pulsation brève de la valeur, sans message bloquant (UX-DR10)

**Given** une saisie en cours
**When** je tape sur "Valider" OU que 3 secondes s'écoulent sans frappe
**Then** la série est enregistrée sur le joueur **qui a la main**, la pop-up se referme, le total est mis à jour — les deux chemins aboutissent au même état (UX-DR15, FR2, FR7)

**Given** une saisie en cours
**When** je referme la pop-up par la croix ou par un tap complet en dehors
**Then** rien n'est enregistré, le tour ne bascule pas, et la saisie abandonnée ne réapparaît pas à l'ouverture suivante

**Given** un pavé vide
**When** je tape `0` puis "Valider"
**Then** une série de **0** est enregistrée (c'est le score de série le plus courant au carambole) ; un chiffre tapé sur un buffer valant `0` **remplace** le zéro (`0` puis `7` donne `7`, jamais `07`)

**Given** une saisie vide
**When** je tape sur "Valider"
**Then** rien ne se passe — aucune série fantôme, aucun compteur, et le tour ne bascule pas

**Given** ma série validée, par le bouton ou par l'auto-validation à 3s
**When** elle est enregistrée
**Then** le tour passe **automatiquement** à l'autre joueur et le liseré rouge se déplace sur son panneau (UX-DR14) — rentrer sa série **est** l'acte de rendre la main

**Given** que je n'ai pas marqué
**When** je tape la **zone de l'adversaire**
**Then** le tour bascule sans que mon total change, mais une **série de 0 est bien enregistrée** : une reprise blanchie reste une reprise jouée et compte dans ma moyenne. Taper sa propre zone ne fait rien

**Given** que c'est le joueur **blanc** (gauche) qui ouvre chaque reprise
**When** j'observe la console centrale
**Then** le numéro de REPRISE n'avance que lorsque le blanc **reprend** la main : la série du seul joueur blanc laisse l'affichage sur « REPRISE 1 » *(libellé `REP` depuis la Story 1.7, 2026-09-09)*

**Given** les boutons `−` et `+` en pied de carte
**When** j'en presse un
**Then** le total est corrigé de ±1 **sans toucher au déroulé** : aucune reprise créée, aucune bascule de tour, aucun effet sur la meilleure série. La correction entre dans le total, donc dans la moyenne

**Given** le bouton "Échanger" de la console centrale
**When** je l'utilise
**Then** il reste disponible **pendant toute la partie**, et chaque joueur emporte de l'autre côté tout son historique — séries, total, moyenne, meilleure série et corrections

**Given** l'écran de partie
**When** j'interagis avec ses commandes
**Then** tous les événements passent par `@pointerdown` (AR8) — seule exception documentée, le voile des pop-ups ferme sur un geste **complet** ; toute zone de commande fait au moins 90×90px (touches de clavier exceptées, UX-DR8) ; les contrastes respectent WCAG AA sur le bloc blanc comme sur le jaune (UX-DR22, NFR10) ; la console centrale n'affiche plus le mode de jeu

**Note de périmètre :** `NumericPad.vue` existe depuis la Story 1.4 (composant purement présentationnel, emits `digit`/`clear`/`backspace`, prop `hasInput` pilotant le seul libellé `AC`/`C`). Cette story le **branche** sur la saisie de série, dans une pop-up dédiée (`ScoreEntryModal.vue`), et lui ajoute le retour haptique, le refus au plafond et la validation hybride — elle ne le crée pas. La Story 1.4 livre également `AlphaKeyboard.vue` et `keyClasses.ts`, qui partage le style de touche entre les deux claviers.

**⚠️ Risque résiduel ouvert :** un seul CTA de saisie signifie qu'on ne peut plus saisir pour le joueur qui n'a pas la main. Le rattrapage d'une série oubliée passe donc par ANNULER — **Story 1.8, pas encore branchée**. Tant qu'elle ne l'est pas, un oubli n'est pas récupérable en partie. *(Levé par la Story 1.7, 2026-09-09 : `ANNULER` est branché.)*

**Règle produit de portée générale — alternance et moyenne** *(décision de Nathan, 2026-09-09 ; consignée ici et dans `ux-design-specification.md` §2.5)*. Elle **dépasse le cadre de la Story 1.5** et conditionne les Stories 1.6, 1.10, 1.11 et tout l'Epic 2 :
1. **Rentrer sa série, c'est rendre la main.** Dans les modes qui passent par le pavé (JDS), valider une série bascule le joueur actif — par le bouton comme par l'auto-validation à 3 s, qui devient donc aussi le *fallback* de bascule. Rendre la main **sans marquer** se fait au tap sur la zone de l'adversaire, ce qui enregistre une série de 0. En 3 Bandes, où la série ne passe pas par un pavé, la bascule reste un geste explicite — **les AC de l'Epic 2 ne la décrivent pas encore** et ne distinguent pas le geste « créditer +1 » du geste « rendre la main », qui visent la même zone (à préciser avant la Story 2.2). **Supersédé le 2026-09-11 (Epic 10, Story 10.4) :** le tap sur la zone de l'adversaire comme geste de passage de tour est **retiré** — une CTA centrale dédiée `PASSER LE TOUR` devient l'unique façon de rendre la main, en JDS comme en 3 Bandes. Rentrer une série au pavé continue de basculer automatiquement le joueur actif ; seul le geste de passage **sans marquer** change de forme.
2. **La reprise est ouverte par le joueur blanc.** Le compteur de reprise avance quand le joueur de gauche **reprend** la main, pas quand il la rend.
3. **La moyenne d'un joueur se fige quand il rend la main** : celle du blanc quand il rend la main, celle du jaune quand le blanc la reprend. Une reprise entamée mais non terminée par un joueur n'entre pas dans sa moyenne. **Une reprise blanchie, elle, compte** — sans quoi la moyenne monterait artificiellement.

### Story 1.6: Calcul et affichage du score total en temps réel

As a joueur,
I want voir mon score total se mettre à jour automatiquement après chaque série validée,
So that je n'ai jamais besoin de calculer quoi que ce soit moi-même.

**Acceptance Criteria:**

**Given** une série validée pour un joueur
**When** le score est enregistré
**Then** le score total affiché sur son `PlayerPanel` est recalculé et mis à jour immédiatement (FR3)

**Given** plusieurs reprises jouées par les deux joueurs
**When** j'observe les deux `PlayerPanel`
**Then** chaque total reflète exactement la somme des séries validées de ce joueur, sans divergence

**Given** un joueur en jeux de série avec une distance configurée (Story 1.4)
**When** j'observe son `PlayerPanel`
**Then** seule la **distance brute** est affichée en en-tête — **aucun score restant** n'apparaît en jeux de série

**⚠️ Note de périmètre (2026-09-09) — score restant retiré des JDS, reporté au 3 Bandes.** Les deux premiers AC sont **déjà satisfaits** par la Story 1.5 : le total est recalculé comme somme des séries (`recomputeScore`) et affiché en temps réel sur chaque panneau ; la **moyenne** de la partie en cours et la **meilleure série** y ont aussi été livrées, en tête de carte. L'AC d'origine « score restant vers l'objectif affiché à côté du score courant » (FR15, idée Billizone) est **retiré des jeux de série** sur décision produit de Nathan : au billard, on annonce « Pour 5 », « Pour 4 »… à mesure que le joueur **approche** de sa distance, ce qui suppose un score qui avance **point par point**. En JDS, la série se rentre en bloc au pavé — l'annonce n'a pas de sens, on n'affiche rien. Le compte à rebours est donc **propre au 3 Bandes** (saisie au tap `+1`) : `POUR 3` / `POUR 2` / `POUR 1` dès que le restant vaut 3 ou moins, affiché **sous le score, entre les boutons `−` et `+`** du pied de carte — voir la note de périmètre de la Story 2.2. La Story 1.6 ne contient plus que des tests de verrouillage (total lu dans le DOM du panneau, absence de restant en JDS) et cette synchronisation des specs : aucun code de production.

### Story 1.7: Annuler la saisie en cours avant validation

As a joueur (Michel qui se trompe de touche),
I want effacer ma saisie en cours avant validation,
So that une erreur de frappe ne devient jamais un score faux.

**Acceptance Criteria:**

**Given** une saisie en cours dans la pop-up de saisie (avant validation)
**When** j'appuie sur "Corriger"
**Then** la saisie s'efface, je reviens à un état de saisie vide, sans impact sur le total (FR8)

**Given** le bouton "Corriger" affiché pendant une saisie
**When** je le compare visuellement au bouton "Valider"
**Then** il a le même poids visuel, jamais relégué à un sous-menu (UX-DR16)

**⚠️ Impact de la Story 1.5 (2026-09-09) — story à réexaminer, elle est peut-être sans objet.** La saisie ayant quitté le panneau pour une pop-up, trois chemins d'annulation existent déjà et sont testés : la touche `C` (vide la saisie), la touche `⌫` (efface le dernier chiffre) et la **fermeture de la pop-up** par la croix ou par un tap en dehors, qui n'enregistre rien et ne laisse aucun buffer résiduel. Le besoin d'origine — « une erreur de frappe ne devient jamais un score faux » — est donc couvert. Reste à arbitrer avec Nathan : faut-il encore un bouton `CORRIGER` distinct dans la pop-up, et que ferait-il de plus que `C` ? Le second AC (poids visuel égal à `VALIDER`, UX-DR16) n'a plus de sujet tant que ce bouton n'existe pas.

**✅ Recadrage de Nathan (2026-09-09) — story livrée sous ce titre, mais avec un autre sujet.** Le bouton `CORRIGER` en pop-up est **sans objet** : `C`, `⌫` et la croix couvrent FR8, il n'apporterait rien. La story livre à la place le bouton **`ANNULER` de la console centrale** (présent depuis la 1.3, événement `undo` jusque-là sans écouteur) : à chaque appui, la partie **revient d'une action en arrière** — un *undo* multi-niveaux jusqu'au début de la partie, grisé à pile vide. Une action = une **série validée** (`VALIDER` ou auto-validation), une **main rendue sans marquer**, ou une **correction `−`/`+`** (un appui = une action). **`ÉCHANGER` n'est pas annulable** : on rappuie dessus pour revenir, et une annulation postérieure à un échange ne le défait jamais par effet de bord (les joueurs restent où ils sont, la main revient au joueur concerné là où il se trouve). Exposé comme action Pinia `undoLastAction()` + `canUndo`. Au passage : les pictos `↩`/`⇄` sont retirés d'`ANNULER`/`ÉCHANGER` (un mot, pas de glyphe), et `REPRISE` devient **`REP`**. La Story 1.8 est absorbée (voir ci-dessous). **Supersédé le 2026-09-11 (Epic 10, Story 10.4) :** `ANNULER` quitte la console centrale pour la barre basse, en **picto + petit libellé** (aux côtés de `QUITTER`/`RECOMMENCER`/`PARAMÈTRES`) — le mécanisme d'undo ne change pas. `ÉCHANGER` est **retiré du jeu en cours de partie** (voir note de la Story 1.3/UX-DR2 ci-dessus) : les précisions ci-dessus sur son inversibilité restent vraies pour la fenêtre d'avant `DÉMARRER` où il subsiste sous les CTA `CHANGER DE BILLE`/`CHANGER DE CÔTÉ`.

### Story 1.8: Annuler la dernière série validée

As a joueur (Michel dont l'adversaire conteste un score déjà validé),
I want annuler la dernière série validée,
So that je peux corriger une erreur sans recalcul manuel ni stress.

**Acceptance Criteria:**

**Given** une série déjà validée (dernière entrée du joueur concerné)
**When** j'appuie sur "Corriger" en dehors d'une saisie en cours
**Then** la dernière série validée repasse à `null`, le total revient à son état précédent (FR9)

**Given** une correction de série validée appliquée
**When** je vérifie l'historique de la reprise en cours
**Then** aucune série antérieure à la dernière n'est affectée

**Note de périmètre :** le bouton ANNULER de la console centrale existe déjà depuis la Story 1.3, affiché et désactivé tant qu'aucune reprise n'est enregistrée, et son événement `undo` n'est écouté par personne. Cette story le **branche** (écoute de l'événement dans `GameView` + action d'annulation dans `useGameStore`), elle ne le crée pas.

**⚠️ Impact de la Story 1.5 (2026-09-09) — priorité à relever.** Cette story est devenue le **seul chemin de rattrapage** d'une série oubliée ou attribuée au mauvais joueur : la 1.5 n'expose qu'un CTA de saisie, du côté du joueur assis, et on ne peut donc plus saisir pour celui qui n'a pas la main. Tant que la 1.8 n'est pas livrée, un oubli n'est pas récupérable en cours de partie. À considérer avant la 1.6 et la 1.7.

**✅ Absorbée par la Story 1.7 (décision de Nathan, 2026-09-09).** Ses deux AC sont le cas particulier « dernière action = une série » de l'`undoLastAction()` livré en 1.7 — à une nuance près, plus juste que l'énoncé : le snapshot restaure la **ligne d'avant** plutôt que de poser un `null` (si la série avait **ouvert** une reprise, la ligne disparaît et le compteur redescend ; si elle l'avait **complétée**, la case repasse à `null`). Pas d'action `undoLastSeries` séparée : deux annulations aux sémantiques différentes sur un seul bouton seraient un piège. `1-8` passe `done` avec la 1.7.

**Le terrain est prêt :** `reprises` est la source de vérité unique et `player.score` en est **recalculé** par somme (jamais incrémenté), ce qui rend l'annulation exacte sans arithmétique inverse — il suffit de remettre la dernière série à `null` et de recalculer. ⚠️ Trois pièges vérifiés en 1.5 : `reprises` est un `shallowRef`, le tableau doit être **remplacé** et jamais muté ; l'annulation doit décider si elle **remonte aussi le tour** (la validation le fait basculer) ; et le total porte un terme de **correction manuelle** (`scoreAdjustments`) tenu à part des reprises, qu'une annulation de série ne doit pas toucher.

### Story 1.9: Saisir un score négatif

As a joueur,
I want saisir un score négatif,
So that je peux enregistrer une pénalité ou déduction selon les règles du jeu.

**Acceptance Criteria:**

**Given** le pavé numérique actif
**When** je bascule le mode "négatif" avant ou pendant ma saisie
**Then** la valeur saisie est traitée comme une déduction du total au moment de la validation (FR10)

**Given** une valeur négative validée
**When** le total est recalculé
**Then** il reflète correctement la soustraction, sans jamais afficher un état incohérent (score affiché toujours cohérent avec l'historique des reprises)

**⚠️ Impact de la Story 1.5 (2026-09-09).** Le second AC est **déjà satisfait** : `addReprise` accepte une valeur négative sans cas particulier (testé), et le total étant recalculé comme somme des séries, la soustraction est exacte par construction. Il ne reste que la **bascule de signe dans la pop-up de saisie** et le champ `isNegative`. ⚠️ **Ne pas confondre avec les boutons `−` / `+`** livrés en 1.5 : ceux-là corrigent le **total** sans créer de reprise ; ils n'enregistrent pas une série négative. Noter aussi que la taille du score gère déjà le caractère `−` supplémentaire (le calcul porte sur la longueur de la chaîne affichée), et que la correction manuelle n'est volontairement pas bornée à zéro.

**❌ Annulée (décision de Nathan, 2026-09-10) — aucun code.** À la création de la story, aucune justification métier de FR10 n'a été retrouvée dans les specs : les règles du carambole (JDS, 3 bandes) ne retirent jamais de points — une faute termine la série. Le seul cas d'usage identifié par Nathan était la **correction d'une erreur** (« retirer 10 points ») ; il est couvert depuis la 1.5 par les boutons `−` / `+` du panneau, non bornés à zéro, et par `ANNULER` (1.7) pour défaire une série entière. Une saisie de série négative n'apporterait donc rien de plus qu'un second chemin de correction. FR10 est considéré comme **satisfait par les corrections manuelles** ; le champ `isNegative` de `GameState`/`GameSnapshot` reste déclaré et inerte (toujours `false`) — à retirer du modèle si une story future y touche (1.12 persistance). `1-9` passe `done` sans fichier de story. *Mise à jour (2026-09-10)* : `isNegative` **retiré en 1.12** (`GameState`, `GameSnapshot`, `mirrorSnapshot`, store, tests).

### Story 1.10: Terminer une partie et consulter le récapitulatif automatique

As a joueur (Michel qui termine son match),
I want voir un récapitulatif automatique en fin de partie,
So that ce moment devienne le plus gratifiant de la session.

**Acceptance Criteria:**

**Given** une partie terminée (déclenchement manuel)
**When** l'écran `GameSummary` s'affiche
**Then** il montre le score total, la moyenne par reprise et la meilleure série de chaque joueur, en format "battle" (bandeau VS, médaille) (FR4, FR17, UX-DR13)

**Given** le récapitulatif affiché
**When** je le consulte
**Then** aucune statistique n'exige de calcul mental — total, moyenne et meilleure série sont déjà calculés (FR17)

**Recadrage à la création (décision de Nathan, 2026-09-10) — périmètre élargi, voir le fichier de story pour les AC détaillés :**
- **La Story 1.11 est absorbée** : détection automatique de fin et récap sont une seule fonctionnalité. Le « déclenchement manuel » de l'AC ci-dessus devient un cas parmi trois (voir sortie).
- **Règles du jeu consignées (reprise égalisatrice)** : le blanc ouvre toujours et chaque joueur a **sa** distance. Si le **blanc** atteint sa distance le premier, il a joué une reprise de plus : le jaune a droit à la **reprise égalisatrice** (une série pour atteindre **sa** distance) — s'il y parvient c'est l'**égalité**, sinon le blanc gagne ; il peut y renoncer (le blanc gagne). Si le **jaune** atteint sa distance le premier, il **gagne immédiatement**. La série qui amène à la distance est **plafonnée au restant** (on s'arrête à la distance, tout dépassement est une erreur de saisie). Au 3 Bandes l'égalisatrice est optionnelle → réglage Epic 2.
- **Pop-ups de décision (`PromptModal`, voile inerte, sans croix ni message sur le scoreboard — revue au rendu du 2026-09-10)** : « X A ATTEINT SA DISTANCE » avec deux CTA `Y JOUE` / `FIN DE PARTIE` ; « PARTIE TERMINÉE » avec le seul CTA `VOIR LE RÉCAP` — le vainqueur se lit sur le récap, et on ne revient pas au scoreboard une fois la fin détectée. La détection ne réagit qu'aux **séries** (validation, main rendue), jamais aux corrections `−`/`+` ni à `ÉCHANGER`.
- **Distance obligatoire au démarrage** (pop-up d'erreur, voir la note de la Story 1.4).
- **Le picto de sortie ne jette plus la partie** : avec au moins une série, pop-up « TERMINER LA PARTIE ? » (`VOIR LE RÉCAP` / `ANNULER`, sans croix) dont le CTA mène au récap ; sans rien à récapituler, retour direct à l'accueil — le critère est « aucune action annulable » (`canUndo`), pas « aucune série » : des points ajoutés par `+` sans série demandent aussi confirmation *(revue de code 1.10, 2026-09-10)*. **Vainqueur en fin manuelle au prorata** (`score / distance`, égalité si égal).
- **Écran de récap façon Billiboard** (`explore/resources/IMG_6632.JPG`, voir UX-DR13) avec `FIN DE PARTIE` (accueil) et `UNE PARTIE DE PLUS` (revanche : même mode, mêmes joueurs, mêmes distances, mêmes côtés, scoreboard direct). Le récap est **terminal** : pas de `ANNULER` depuis `finished`, et une fin détectée n'est pas rattrapable non plus (revue au rendu, 2026-09-10) — la correction se fait avant la série gagnante, ou par `ANNULER` de la pop-up de sortie. `ÉCHANGER` est **bloqué pendant la reprise égalisatrice** (le drapeau est attaché au côté droit, un échange fabriquerait une égalité fantôme — revue de code 1.10, 2026-09-10).
- **Égalité = résultat final** pour l'instant ; la prolongation viendra dans une story ultérieure.

**Note de périmètre (V1a) :** la mise en avant visuelle "nouveau record personnel" (UX-DR13) n'est **pas** couverte par cette story — Epic 1 seul n'a pas accès à l'historique multi-parties nécessaire pour détecter un record de façon fiable (cette donnée est gérée par Epic 3). La détection de record est traitée comme une évolution différée en Epic 3 / Story 3.5, une fois l'historique disponible. `GameSummary` doit néanmoins prévoir dès cette story l'état visuel "nouveau record" (UX-DR13) sans le déclencher automatiquement, pour qu'Epic 3 / Story 3.5 puisse l'activer sans modifier le composant.

### Story 1.11: Détecter automatiquement la fin d'un set ou d'un match

**✅ Absorbée par la Story 1.10 (décision de Nathan, 2026-09-10) — aucun fichier de story.** La détection de fin obéit à la règle de la **reprise égalisatrice** (consignée dans la Story 1.10), inséparable du récap. Le second AC ci-dessous (« aucun objectif configuré → fin manuelle ») est **caduc** : la distance est désormais **obligatoire** au démarrage. La note de périmètre reste valable : la fin de **set** attend l'Epic 2 ; la détection est bien **par joueur** et un joueur en distance 0 (partie démarrée hors accueil) n'induit jamais de fin automatique.

As a joueur,
I want que le système détecte automatiquement quand le format configuré est atteint,
So that je n'ai jamais besoin d'une action manuelle "terminer le match".

**Acceptance Criteria:**

**Given** un format de match configuré (Story 1.4) avec objectif de score ou nombre de sets
**When** l'objectif est atteint après validation d'une série
**Then** le système bascule automatiquement vers l'écran `GameSummary` (Story 1.10) sans action manuelle supplémentaire (FR16)

**Given** aucun objectif configuré (les deux joueurs en distance libre, cas par défaut depuis la Story 1.4)
**When** la partie est en cours
**Then** le joueur termine manuellement via l'action explicite de la Story 1.10

**Note de périmètre :** la détection de fin de **set** dépend de la notion de set, introduite par l'**Epic 2** (3 Bandes) — elle n'est donc **pas** réalisable en V1a. Seule la détection sur **objectif de score** l'est. Cette détection doit par ailleurs se faire **par joueur** : depuis la Story 1.4 la distance est un attribut de `Player` et les deux joueurs peuvent en avoir de différentes (handicap) ; un joueur en distance libre (0) n'induit aucune fin automatique.

### Story 1.12: Préserver l'état de la partie en cas de fermeture accidentelle

As a joueur,
I want que l'état de ma partie soit sauvegardé après chaque action,
So that fermer l'application accidentellement ne fasse jamais perdre ma progression.

**Acceptance Criteria:**

**Given** une action de jeu quelconque (saisie, validation, correction)
**When** elle est effectuée
**Then** l'état complet de la partie est sauvegardé en `localStorage` immédiatement après (FR6, NFR5, AR4)

**Given** une partie sauvegardée en cours
**When** je ferme et rouvre l'application
**Then** la partie reprend exactement où elle en était, sans perte de donnée

**Given** une erreur de storage (quota dépassé, navigation privée restrictive)
**When** la sauvegarde échoue
**Then** l'erreur est gérée dans `storageService.ts` (try/catch + `console.error`), jamais dans le composant (AR12)

**Cadrage (Nathan, 2026-09-10) — feature de filet de sécurité, développée vite.** La tablette de club tourne quasiment 24 h/24 : la fermeture accidentelle est rare, la persistance sert surtout au **rechargement** (mise à jour PWA, `⌘R`, onglet tué par l'OS). Quatre décisions :
1. **Pop-up de reprise au lancement** : si une sauvegarde lisible existe, `PromptModal` « PARTIE EN COURS » par-dessus l'accueil, `REPRENDRE LA PARTIE` (scoreboard tel qu'il était) ou `ANNULER` (accueil, sauvegarde effacée). Pas de restauration silencieuse.
2. **La pile d'annulation complète est persistée** : après une reprise, `ANNULER` remonte les actions d'avant la fermeture, parité des côtés comprise.
3. **Fermeture pendant la saisie** : la pop-up de saisie se rouvre avec les chiffres déjà tapés (`entryOpen` monte de `GameView` dans le store).
4. **Aucune limite d'âge** : une sauvegarde de la veille est proposée telle quelle.

Au passage, la story **fixe le format persisté** : `GameState` = `+ scoreAdjustments, sidesSwapped, history, endPrompt, entryOpen`, `− isNegative`. Clé `1score:game`, enveloppe versionnée (version inconnue ou forme inattendue → jetée avec `console.warn`, pas de migration). Écriture par `watch` du store, une par action, jamais en `idle` (`resetGame` supprime l'entrée).

### Story 1.13: Fonctionner offline et s'installer comme application native

As a joueur de club,
I want que l'application fonctionne sans connexion réseau et s'installe sur la tablette,
So that le scoreboard soit toujours disponible sur les tablettes de club sans navigateur visible.

**Acceptance Criteria:**

**Given** un appareil sans connexion réseau
**When** j'utilise l'application
**Then** toutes les fonctionnalités V1a fonctionnent normalement, sans dépendance à un serveur externe (FR45, NFR6, NFR13)

**Given** le Service Worker généré par vite-plugin-pwa
**When** l'application est chargée une première fois
**Then** les assets JS/CSS sont mis en cache (`cache-first`) et le HTML en `StaleWhileRevalidate` (AR10)

**Given** le manifest PWA configuré
**When** j'utilise "ajouter à l'écran d'accueil" sur Android 10+ ou iPadOS 15+
**Then** l'application s'installe et se lance en mode standalone, sans barre de navigateur (FR46)

> **Note de cadrage (Story 1.13, 2026-09-10)** — quatre décisions : **(1)** cache = précache atomique de tout le build, pas de `StaleWhileRevalidate` pour le HTML (AR10 précisé : le HTML référence des assets hachés, un HTML « stale » casserait la page hors ligne) ; **(2)** mise à jour automatique vérifiée toutes les 60 min et appliquée **uniquement à l'accueil** (`status === 'idle'`), jamais pendant une partie, sans pop-up ni toast (`usePwaUpdate.ts`, `PWABadge.vue` supprimé) ; **(3)** déploiement Netlify inclus (`netlify.toml` à la racine du dépôt, rattachement du site manuel — AR11) ; **(4)** pas de verrouillage d'`orientation` dans le manifest, les deux formats tablette restent supportés.

### Story 1.14: Modifier les noms des joueurs en cours de partie

As a joueur,
I want modifier le nom d'un joueur en cours de partie,
So that je peux corriger une faute de frappe ou échanger les noms sans redémarrer.

**Acceptance Criteria:**

**Given** une partie en cours
**When** je tape sur le nom d'un joueur dans son `PlayerPanel`
**Then** le nom devient modifiable via la pop-up de réglage du joueur, alimentée par `AlphaKeyboard` (FR39, UX-DR19)

> **Note de périmètre (Story 1.4, 2026-09-09).** L'énoncé antérieur — « éditable inline […] sans modale séparée » — est **inapplicable** depuis la décision « borne fixe » : l'édition inline suppose un champ natif, et aucun ne doit exister. Cette story réutilise `PlayerSetupModal` plutôt que d'introduire un `<input>`.

**Given** un nouveau nom saisi
**When** je confirme
**Then** il est sauvegardé automatiquement, affiché en majuscules, limité à 20 caractères

**❌ Annulée (décision de Nathan, 2026-09-10) — aucun code.** La seule justification de FR39 est « corriger une faute de frappe ou échanger les noms ». L'échange est déjà couvert par `swapPlayers` (1.3/1.4), et la faute de frappe se corrige à l'accueil avant la première série via `PlayerSetupModal`. En partie, une faute dans un nom n'a **aucun effet durable** : pas d'historique en V1a, et à terme (Epic 4) le nom fiable viendra du **compte joueur** — un nom saisi à la main désigne un **invité**, hors suivi de carrière, dont l'orthographe n'importe pas. Côté implémentation, la story entrait en conflit avec le geste principal du `PlayerPanel` (tout tap sur la carte adverse rend la main) et aurait obligé à verrouiller la distance dans la pop-up de réglage. **Ne pas recréer par réflexe à l'Epic 4** : le vrai besoin sera « réassocier un compte joueur en cours de partie » (mauvais compte sélectionné, invité qui a en fait un compte), un périmètre différent à écrire le jour venu. `1-14` passe `done` sans fichier de story.

### Story 1.15: Réinitialiser une partie en cours

As a joueur,
I want réinitialiser la partie en cours et en démarrer une nouvelle,
So that je peux corriger rapidement une configuration de départ erronée sans quitter l'application.

**Acceptance Criteria:**

**Given** une partie en cours, à tout stade
**When** je déclenche l'action de réinitialisation
**Then** la partie en cours est abandonnée et le flow de démarrage (Story 1.3) est proposé à nouveau (FR40)

**Given** une réinitialisation confirmée
**When** elle s'applique
**Then** l'historique des parties précédentes n'est jamais affecté

**Note de périmètre :** le bouton QUITTER de la barre d'action et l'action `resetGame()` existent depuis la Story 1.3, mais s'exécutent **sans confirmation**. Cette story ajoute le garde-fou (confirmation avant abandon), elle ne crée ni le bouton ni l'action.

**Mise à jour (Story 1.10, 2026-09-10) :** la « confirmation avant abandon » est **livrée** par la pop-up de sortie de la 1.10 — le picto de sortie n'abandonne plus la partie, il ouvre « TERMINER LA PARTIE ? » dont le CTA mène au **récap** (fin manuelle, vainqueur au prorata) ; sans aucune série jouée, il ramène directement à l'accueil. Cette story reste pour un éventuel **abandon / réinitialisation sans récap** (repartir de zéro sans clore la partie dans les stats) — périmètre à réexaminer le jour venu.

**✅ Recadrée (décision de Nathan, 2026-09-10) :** le titre reste, le périmètre change. Le garde-fou « confirmation avant abandon » étant livré en 1.10, la story livre **RECOMMENCER** : un **second picto** dans la barre basse (flèche circulaire), **à côté du picto de sortie**, dans la même colonne — celle qui n'a pas `AJOUTER LES POINTS` — et qui change de côté avec lui. Derrière une pop-up de confirmation « RECOMMENCER LA PARTIE ? » (`RECOMMENCER` / `ANNULER`), la partie **repart de zéro sur place** : même mode, mêmes joueurs, mêmes distances, **chacun du côté où il est**, **sans récap et sans passer par l'accueil** (faux départ, échauffement, « on la refait »). Grisé sur un scoreboard intact. Action Pinia `restartGame()`, gardée sur `playing`, qui délègue à `startGame` comme `rematch()` — la partie ne passe **jamais** par `finished`. Le « quitter sans récap » (abandon sans clore) est **reporté à la Story 3.1** (Epic 3), seul endroit où il posera problème. Le picto de sortie, sa pop-up et ses libellés ne changent pas.

### Story 1.16: Activer/désactiver l'annonce vocale du score

As a joueur,
I want activer ou désactiver l'annonce vocale du score,
So that je peux entendre mon score sans regarder l'écran, ou couper le son si je préfère le silence.

**Acceptance Criteria:**

**Given** un réglage accessible depuis l'interface
**When** j'active l'annonce vocale
**Then** chaque série validée déclenche une annonce vocale du score via la Web Speech API (FR42, AR13, composable `useSpeech.ts`)

**Given** l'annonce vocale désactivée
**When** une série est validée
**Then** aucune annonce vocale n'est déclenchée

### Story 1.17: Détecter l'inactivité prolongée et alerter l'utilisateur

As a joueur ou responsable de club,
I want que le système détecte une partie ouverte sans activité prolongée,
So that une table ne reste jamais bloquée silencieusement en plein match.

**Acceptance Criteria:**

**Given** une partie ouverte sans aucune saisie pendant X minutes
**When** le seuil est dépassé
**Then** une alerte douce et non-intrusive s'affiche dans le `CenterPanel`, jamais en plein écran (FR43, UX-DR18)

**Given** l'alerte affichée
**When** une nouvelle saisie est effectuée
**Then** l'alerte se referme automatiquement, sans action supplémentaire de l'utilisateur

**❌ Annulée (décision de Nathan, 2026-09-10) — aucun code.** Au JDS (Libre, Cadre), une **seule série peut durer une heure ou plus** : aucune durée « sans saisie » ne distingue une table oubliée d'un joueur en pleine série, l'alerte serait fausse précisément quand la partie est la plus belle. Le besoin réel que ce FR croyait couvrir est **l'inactivité globale de la tablette**, pas celle de la partie : en Corée du Sud (CUESCO/Billiboard), les écrans ne s'éteignent **jamais** ; au plus, un **écran de veille** après une longue absence d'usage — et **jamais** pendant qu'un scoreboard est en cours. Cette veille relève de l'**accueil** (`HomeScreen`, qui fait déjà office de veille, UX-DR12), pas de la console centrale : si elle devient nécessaire, c'est une story d'accueil (écran de veille, identité du club) à écrire le jour venu, sans reprendre FR43. `1-17` passe `done` sans fichier de story ; UX-DR18 devient sans objet.

---

## Epic 2: Jouer en Mode 3 Bandes avec Chronométrage (V1b)

Un joueur peut jouer une partie complète en mode 3 Bandes, avec un chronomètre de série toujours actif, en saisissant son score point par point (tap incrémental par le joueur assis) ou en score global en fin de série.

### Story 2.1: Sélectionner le mode 3 Bandes et démarrer une partie avec chronomètre actif

As a joueur,
I want sélectionner le mode 3 Bandes au démarrage d'une partie,
So that je joue avec un chronomètre de série toujours actif, cohérent avec les règles officielles.

**Acceptance Criteria:**

**Given** l'écran d'accueil `HomeScreen` (Epic 1, Story 1.3)
**When** je sélectionne la catégorie "3 Bandes"
**Then** la partie démarre avec le composable `useTimer.ts` actif dès la première reprise (FR13, AR14)

**Given** le chronomètre de série actif
**When** je consulte l'écran pendant le jeu
**Then** le temps restant est affiché en rouge LED sur fond noir, cohérent avec l'esthétique d'alerte/urgence (UX-DR4)

**Given** le chronomètre en cours
**When** une action de pause est déclenchée (fondation pour l'arbitre déporté V2 — roadmap PRD V1b)
**Then** le chronomètre peut être mis en pause puis repris sans perdre l'état de la reprise en cours

**Note de périmètre :** l'écran de sélection existe déjà (Story 1.3). La catégorie "3 Bandes" y est affichée mais désactivée : cette story n'a **pas** à créer d'écran de sélection, il lui suffit de basculer `available: true` sur la catégorie dans `GAME_CATEGORIES`.

**Note de périmètre — sets :** la configuration du **nombre de sets** est rattachée à cet Epic, le set étant une notion propre au 3 Bandes. Elle a été explicitement retirée du périmètre de la Story 1.4, qui ne couvre FR15 que sur son volet « objectif de score ». Le réglage relevant du match et non d'un joueur, il ne se branchera pas sur la `PlayerSetupModal` de la Story 1.4 — qui est propre à un joueur — et demandera son propre point d'entrée, à définir avec cet Epic.

**Revue au rendu (Nathan, 2026-09-11) — deux correctifs livrés avec la Story 2.2 :** l'anneau se dimensionne en unités de conteneur (`min(100cqw, 100cqh)` de la place restante dans la colonne) au lieu d'un `w-full` fixe qui, sur un iPad en paysage avec la barre Safari (~1180×673), rognait REP et ÉCHANGER ; la couleur n'est plus un rouge fixe mais un **fondu vert (40 s) → jaune → orange → rouge (0 s)** sur l'arc et le chiffre, à la manière des chronos de tir traditionnels — le rouge d'UX-DR4 est le point d'arrivée.

**Note de livraison (Story 2.1, 2026-09-10) :**
- **Déverrouillage par un booléen** : `available: true` sur l'entrée `3bandes` du catalogue (`types/game.ts`), rien d'autre — `selectCategory()` gérait déjà les catégories à mode unique (passage direct à l'étape joueurs), la distance obligatoire (1.10) s'applique à l'identique.
- **Chrono de 40 s** (`SHOT_CLOCK_SECONDS`, sourcé de la spec UX « reset du chrono de tir (40s) »), **non persisté** dans `GameState` (AR14 l'isole de V1a) : un rechargement en pleine partie repart à 40. Décompte de 1 s en 1 s, figé à 0 sans pénalité ni bascule (aucune règle de faute au temps dans FR13/FR14). Repart de 40 à chaque `startGame()` interne (démarrage, `RECOMMENCER`, `UNE PARTIE DE PLUS`), s'arrête net en fin de partie et au retour à l'accueil.
- **Pause/reprise retirée du périmètre** (décision de Nathan, 2026-09-10) : le troisième AC ci-dessus n'est **pas** livré — la pause n'a de sens qu'en compétition arbitrée, pas à l'entraînement ; reportée à une future épic Compétition/Arbitrage (proche d'Epic 7). `useTimer.ts` n'expose ni `pauseTimer`, ni `resumeTimer`, ni `isPaused`.
- **Affichage circulaire** (`ShotClock.vue`, sous `REP` dans `CenterPanel`) : anneau SVG qui se vide en continu autour du chiffre central, rouge LED sur fond noir (UX-DR4) — forme inspirée du « SHOT CLOCK » du CUESCO (`explore/resources/IMG_6034.JPG`), la barre segmentée du Billiboard (`IMG_6459.JPG`) ayant été jugée « pas assez smooth ». Absent dans tous les autres modes.
- **Nombre de sets** : toujours non couvert — aucune des trois stories de l'Epic n'en porte d'AC, consigné dans `deferred-work.md`.

### Story 2.2: Incrémenter le score point par point (tap du joueur assis)

As a joueur assis (non-actif),
I want taper sur ma propre zone pour ajouter un point à l'adversaire en train de jouer,
So that le score de mon adversaire progresse en temps réel sans qu'il touche lui-même l'écran.

**Acceptance Criteria:**

**Given** une partie en mode 3 Bandes en cours, un joueur en train de tirer
**When** le joueur assis (non-actif) tape sur sa propre zone
**Then** un point est ajouté au score de l'adversaire en train de jouer, avec retour haptique + visuel immédiat (FR14, UX-DR24, NFR1)

**Given** un tap enregistré
**When** le point est ajouté
**Then** le chronomètre de série (Story 2.1) est réinitialisé à sa valeur de départ

*Note (2026-09-10, décision de Nathan, consignée depuis la Story 2.1) :* le chrono se réinitialise **non seulement au tap `+1`** mais **aussi au changement de joueur** (bascule de tour), avec un **petit délai de grâce de 3 s supplémentaires** après l'une ou l'autre action. Le mécanisme exact (buffer ajouté au reset ? fenêtre avant le vrai décompte ?) n'est pas précisé : à trancher à la création de cette story. La primitive `resetTimer()` de `useTimer.ts` (livrée en 2.1, sans appelant) est le point de branchement prévu.

**Note de livraison (Story 2.2, 2026-09-11, décisions de Nathan au rendu de la 2.1) :**
- **Geste tranché** (question ouverte depuis la Story 1.5) : le `+1` est le **CTA de la barre basse**, côté joueur assis — `AJOUTER LES POINTS` devient **`+1 POINT`** en 3 Bandes et crédite un point à celui qui a la main, sans ouvrir le pavé. Le **tap sur la carte** de l'assis reste le geste de **rendre la main** (`passTurn`). L'AC « le joueur assis tape sur sa propre zone pour ajouter un point » est **supersédé** par cette répartition.
- En 3 Bandes, la main rendue **clôture la série comptée au tap** (pas de reprise à 0 ajoutée par-dessus) ; sans tap, elle reste une série de 0. Le `+1` écrit dans la case du joueur de la reprise courante (`reprises` reste la source de vérité, `GameState` inchangé) ; un tap = une action annulable. Atteindre la distance au tap termine la série sur-le-champ (offre d'égalisatrice / victoire), comme au pavé.
- **Chrono** : relancé à 40 au `+1` **et** à la main rendue, avec **2 s de latence** avant le premier tick (valeur du jour, remplace les 3 s de la note précédente ; s'applique aussi au démarrage et à RECOMMENCER, un seul chemin `resetTimer`). Un tap pendant la latence la relance entièrement.
- **Non livré** : le compteur `POUR n` (note de périmètre ci-dessous) — non cité par Nathan, reste à confirmer ; le **pavé de secours** (Story 2.3) n'a plus de point d'entrée depuis que le CTA est le `+1` — à définir par la 2.3.

**Given** le score du joueur actif
**When** plusieurs points sont ajoutés au fil de la reprise
**Then** le total affiché reflète exactement le cumul des taps enregistrés pour cette reprise

**Note de périmètre (2026-09-09, reportée depuis la Story 1.6) — compte à rebours `POUR n`.** Le score restant vers l'objectif (FR15, idée Billizone) est **propre au 3 Bandes** et n'existe pas en jeux de série (décision produit de Nathan, voir Story 1.6). Il reprend la convention d'annonce de l'arbitre : `POUR 3` / `POUR 2` / `POUR 1`, avec `n = distance − score`, affiché **uniquement en mode `3bandes`**, **uniquement quand `1 ≤ n ≤ 3`** (à confirmer à la création de la story : afficher aussi au-dessus de 3 ?), et masqué en distance libre. Emplacement retenu : **sous le score, entre les boutons `−` et `+`** du pied du `PlayerPanel`. Il se met à jour au tap `+1` comme à la saisie de secours au pavé (Story 2.3) et à la correction manuelle `−`/`+`. Le calcul appartient au panneau (les deux termes sont sur `player`, transportés par l'interversion des billes) ; la détection de fin de partie (`score >= distance`) reste dans le store (Story 1.11). Ce point s'ajoute à la question **déjà ouverte** sur cette story (Story 1.5, décision 1) : distinguer le geste « créditer `+1` » du geste « rendre la main », qui visent la même zone.

### Story 2.3: Saisir un score global en fin de série (backup pavé numérique)

**⚠️ Annulée sans code (décision de Nathan, 2026-09-11) :** « on n'en a pas besoin au 3 Bandes » — le `+1 POINT` du joueur assis (Story 2.2) suffit, aucun pavé de secours n'est prévu dans ce mode. `ScoreEntryModal` reste le pavé des jeux de série ; en 3 Bandes rien ne l'ouvre, par choix. Les trois AC ci-dessous sont conservés pour mémoire.

As a joueur,
I want saisir directement le score global de la série au pavé numérique,
So that je peux corriger un oubli de tap ou saisir un résultat en une seule fois, avec un chronomètre libre.

**Acceptance Criteria:**

**Given** une partie en mode 3 Bandes en cours
**When** l'adversaire assis a oublié de taper au fil de l'eau
**Then** le pavé numérique complet (réutilisé de l'Epic 1, Story 1.5) reste disponible pour saisir directement le score global de la série (FR14)

**Given** une saisie via le pavé numérique en mode 3 Bandes
**When** elle est validée
**Then** le chronomètre de série n'est pas contraint par cette saisie (timer libre), contrairement au mode incrémental (Story 2.2)

**Given** une série saisie globalement
**When** elle remplace un comptage partiel par tap
**Then** le score final de la reprise reste cohérent, sans double comptage entre taps et saisie globale

### Story 2.4: Afficher le compte à rebours `POUR n` en 3 Bandes

*Story courte ajoutée le 2026-09-11 à la demande de Nathan (revue au rendu de la 2.2) — elle porte la note de périmètre `POUR n` reportée depuis la Story 1.6 dans la Story 2.2, que la 2.2 n'a pas livrée.*

As a joueur en 3 Bandes,
I want lire « POUR 3 », « POUR 2 », « POUR 1 » sous mon score quand j'approche de ma distance,
So that l'annonce de l'arbitre est sous mes yeux sans calcul mental (FR15, idée Billizone).

**Acceptance Criteria:**

**Given** une partie 3 Bandes, un joueur à 1, 2 ou 3 points de sa distance
**When** son panneau s'affiche
**Then** `POUR n` (`n = distance − score`) est affiché sous le score, entre les boutons `−` et `+`, et suit chaque mouvement du score (tap `+1`, correction `−`/`+`, `ANNULER`)

**Given** un restant supérieur à 3, nul ou négatif, ou une distance libre
**When** le panneau s'affiche
**Then** rien n'est affiché

**Given** une partie en jeux de série
**When** un joueur approche de sa distance
**Then** rien n'est affiché — l'annonce est propre au 3 Bandes (décision de la Story 1.6)

**Note de livraison (2026-09-11) :** prop `showRemaining` sur `PlayerPanel` (posée par `GameView` quand le mode est `3bandes`), calcul dans le panneau (les deux termes sont sur `player`, transportés par ÉCHANGER), `data-testid="remaining"`. Seuil fixé à 3 sans annonce au-delà (la question « afficher aussi au-dessus de 3 ? » est tranchée par défaut sur la convention d'arbitre — à rouvrir si Nathan le souhaite).

---

## Epic 3: Parties rattachées au profil joueur (V2a)

> ⚠️ **Epic redéfini le 2026-09-11** (décision de Nathan, `sprint-change-proposal-2026-09-11.md`) : les parties appartiennent au **profil joueur**, pas à la tablette. Cet epic s'exécute **après l'Epic 4** et ses stories ci-dessous sont **à réécrire** — elles restent en l'état, annotées, jusqu'à la passe `create-epics-and-stories` qui suivra la décision d'architecture backend. Cible : enregistrement local à `finishGame` avec l'identité des joueurs (file de synchronisation), synchronisation vers le profil (ex-5.2), consultation depuis le profil puis depuis les tablettes du club.

*Ancien objectif (abandonné) :* un joueur retrouve et consulte le détail de ses parties passées jusqu'à 30 jours en arrière depuis le même appareil, sans jamais perdre l'historique en démarrant une nouvelle partie.

### Story 3.1: Sauvegarder automatiquement une partie terminée dans l'historique

> ⚠️ **Recadrée le 2026-09-11, non développée** : la story détaillée (`3-1-…md`, créée le jour même) repasse en `backlog`. À réécrire après l'Epic 4 : même socle technique (Dexie, `GameRecord`, déclencheur `finishGame`), requalifié en **file locale de synchronisation** avec un identifiant joueur par côté.

As a joueur,
I want que chaque partie terminée soit automatiquement enregistrée dans l'historique,
So that je retrouve toutes mes parties passées, et que démarrer une nouvelle partie n'efface jamais les précédentes.

**Acceptance Criteria:**

**Given** une partie qui vient de se terminer, en mode JDS (Epic 1, Story 1.10) ou en mode 3 Bandes (Epic 2)
**When** le récapitulatif `GameSummary` s'affiche
**Then** un `GameRecord` complet (mode, noms, scores, reprises, stats, horodatages) est écrit dans Dexie.js/IndexedDB via `useHistoryStore` et `databaseService.ts` (FR5, AR4, AR7)

**Given** une partie enregistrée dans l'historique
**When** je démarre une nouvelle partie (Epic 1, Story 1.3)
**Then** aucune partie précédemment enregistrée dans l'historique n'est modifiée ni supprimée (FR5)

**Given** une erreur d'écriture Dexie (quota dépassé, navigation privée)
**When** la sauvegarde échoue
**Then** l'erreur est gérée dans `databaseService.ts` (try/catch + `console.error`), jamais dans le composant (AR12)

**À traiter ici (note du 2026-09-10, Story 1.15) :** une partie **recommencée** (picto RECOMMENCER, `restartGame()`) n'a **jamais** été `finished` et n'entre pas dans l'historique — « recommencer » n'est pas « terminer ». Le « quitter sans récap » (abandon d'une partie sans la clore) reste à définir dans cette story : abandon = partie non sauvegardée ? défaite ? Aujourd'hui, une partie qui a au moins une action annulable ne se quitte que par le récap (`FIN DE PARTIE`), qui écrira donc une ligne d'historique — mais deux sorties **sans récap** existent déjà et sont à couvrir dans la définition de l'abandon : le picto de sortie sur un scoreboard intact (`canUndo` faux → accueil direct, 1.10) et « PARTIE EN COURS » › `ANNULER` au lancement, qui jette une sauvegarde pouvant contenir des séries (1.12). *(Précision de la revue de code 1.15, 2026-09-10.)*

### Story 3.2: Consulter la liste des parties jouées

> ⚠️ **Supersédée le 2026-09-11** : la consultation se fait depuis le **profil du joueur** d'abord, puis depuis une tablette du club **une fois identifié** (décision 3 de Nathan). Pas de liste par appareil.

As a joueur,
I want consulter la liste des parties jouées sur l'appareil,
So that je retrouve rapidement mon historique de jeu.

**Acceptance Criteria:**

**Given** au moins une partie enregistrée dans l'historique
**When** j'accède à la route `/history`
**Then** `HistoryList.vue` affiche la liste des parties, triée de la plus récente à la plus ancienne (FR18, AR6)

**Given** aucune partie enregistrée (premier lancement)
**When** j'accède à `/history`
**Then** un message simple invite explicitement à jouer une première partie, jamais un écran vide non expliqué (UX-DR20)

**Given** la liste des parties affichée
**When** je tape sur une partie
**Then** je suis redirigé vers son détail (`/history/:id`, Story 3.3)

### Story 3.3: Consulter le détail complet d'une partie passée

> ⚠️ **Supersédée le 2026-09-11** : même règle que la 3.2 (profil d'abord, tablette ensuite, joueur identifié).

As a joueur,
I want consulter le détail complet d'une partie passée,
So that je peux revoir mes reprises, mes séries et mes statistiques de cette partie précise.

**Acceptance Criteria:**

**Given** une partie sélectionnée depuis la liste (Story 3.2)
**When** j'accède à la route `/history/:id`
**Then** `GameDetailView.vue` affiche le détail complet : mode, noms des joueurs, score final, moyenne, meilleure série, et le détail reprise par reprise (FR19, AR6)

**Given** un identifiant de partie invalide ou supprimé
**When** j'accède directement à `/history/:id`
**Then** un état d'erreur clair est affiché plutôt qu'un écran cassé

### Story 3.4: Conserver l'historique des parties pendant au minimum 30 jours

> ⚠️ **Supersédée le 2026-09-11** : les parties d'un profil sont conservées sans limite de durée côté cloud ; localement, la file de synchronisation est conservée **jusqu'à synchronisation confirmée** (NFR7).

As a joueur,
I want que mon historique soit conservé au moins 30 jours,
So that je peux suivre ma progression sur la durée, même sur un appareil peu utilisé.

**Acceptance Criteria:**

**Given** une partie enregistrée à une date donnée
**When** moins de 30 jours se sont écoulés
**Then** la partie reste consultable dans la liste et le détail de l'historique (FR20)

**Given** le volume de données stocké
**When** l'historique s'accumule
**Then** Dexie.js (IndexedDB) reste dans une limite de quota safe compatible iOS Safari, sans dégrader la fluidité de l'application (NFR3, AR4)

### Story 3.5: Détecter et signaler un nouveau record personnel en fin de partie

> ⚠️ **Fusionnée le 2026-09-11** dans les statistiques de carrière de l'Epic 4 (4.3/4.4) : le record se calcule sur le profil, pas par nom sur une tablette. La prop `records` de `GameSummary` reste inerte jusque-là. Les fins manuelles (`ending: 'manual'`, ancienne 3.1) seront exclues des records.

As a joueur (Michel qui bat sa moyenne),
I want que le système compare automatiquement le résultat de ma partie à mes parties précédentes,
So that je sois informé quand je bats un record personnel, sans avoir à comparer mentalement mes statistiques.

**Acceptance Criteria:**

**Given** une partie terminée et son `GameRecord` déjà écrit dans l'historique (Story 3.1)
**When** le système compare son score total, sa moyenne par reprise et sa meilleure série aux `GameRecord` précédents du même joueur (identifié par nom, V1a sans compte joueur)
**Then** il détermine si cette partie constitue un nouveau record personnel (UX-DR13)

**Given** un nouveau record détecté
**When** le récapitulatif `GameSummary` de la partie concernée est affiché (à la fin du match, Epic 1 / Story 1.10) ou consulté depuis le détail d'historique (Story 3.3)
**Then** l'état visuel "nouveau record" prévu dans `GameSummary` (UX-DR13) est activé — mise en avant spécifique, cohérente avec le format "battle"

**Given** l'absence de partie précédente enregistrée pour ce joueur (nom)
**When** sa première partie se termine
**Then** aucun "nouveau record" n'est signalé, faute de base de comparaison

**Note de dépendance :** cette story referme la dépendance ouverte depuis Epic 1 / Story 1.10 (portée volontairement réduite en V1a). Elle nécessite que `GameSummary` (Epic 1) expose déjà l'état visuel "nouveau record" sans le déclencher — cette story se limite à en calculer le déclenchement à partir de l'historique.

---

## Epic 4: Comptes Joueurs & Suivi de Carrière (V2a)

Un joueur peut créer un compte avec un identifiant court mémorisable, s'identifier sur n'importe quelle tablette de club, consulter ses statistiques cumulées de carrière et visualiser l'évolution de sa moyenne dans le temps.

> **Avancé le 2026-09-11** (décision de Nathan, `sprint-change-proposal-2026-09-11.md`) : prochain epic après la consolidation de la V1 jeu, **avant** l'Epic 3 redéfini. Décisions : compte créé à la tablette ou par une page web minimale (app compagnon → V4) ; identification par **code ou recherche du nom** ; invité conservé ; sans réseau, on joue en invité. Prérequis : **décision d'architecture backend** (Story 4.0).

### Story 4.0: Fondation backend et authentification *(ajoutée le 2026-09-11)*

As a développeur du produit,
I want une décision d'architecture backend appliquée (plateforme hébergée en Europe, authentification par identifiant court sans mot de passe à la tablette, modèle de données joueur/partie, couche réseau dans la PWA),
So that les stories de profil et de synchronisation reposent sur une fondation choisie et documentée, sans improvisation.

**Acceptance Criteria:**

**Given** `architecture.md`
**When** la passe Architecte est terminée
**Then** une section « Backend, Authentification & Synchronisation (V2a) » datée fixe la plateforme, l'hébergement EU (NFR15), le chiffrement (NFR14), le modèle d'auth (FR32, FR33), le modèle joueur/partie et la stratégie de synchronisation (file locale Dexie → API, NFR7)

**Given** la PWA
**When** la fondation est livrée
**Then** une couche service réseau existe (erreurs absorbées en couche service, AR12), l'environnement est configuré (variables, secrets Netlify), et **le jeu reste 100 % offline** — démarrer, scorer et terminer une partie ne dépend jamais du réseau (NFR6)

**Given** un joueur
**When** ses données sont créées côté cloud
**Then** le consentement et la suppression en moins de 3 actions sont prévus (NFR16), même si l'interface arrive avec les stories suivantes

### Story 4.1: Créer un compte joueur avec un identifiant court mémorisable

As a joueur souhaitant suivre sa progression au-delà d'un seul appareil,
I want créer un compte avec un identifiant court et mémorisable,
So that je peux retrouver mon profil sur n'importe quelle tablette de club.

**Acceptance Criteria:**

**Given** la tablette du club ou une page web minimale *(canal tranché par Nathan le 2026-09-11 — l'app compagnon reste V4)*
**When** je crée un compte
**Then** un identifiant court et mémorisable m'est attribué, sans mot de passe requis à la tablette de club (FR32, modèle coréen)

**Given** un compte créé
**When** je consulte mon profil
**Then** il est associé de façon unique à mon identifiant, prêt à être utilisé pour m'identifier sur une tablette de club (Story 4.2)

### Story 4.2: S'identifier sur une tablette de club avec son identifiant

As a joueur enregistré,
I want saisir mon identifiant sur n'importe quelle tablette de club,
So that mon profil et mes statistiques me suivent sans dépendre d'un appareil précis.

**Acceptance Criteria:**

**Given** une tablette de club affichant l'écran de démarrage d'une partie
**When** je saisis mon identifiant court (Story 4.1) **ou je recherche mon nom** parmi les joueurs enregistrés *(ajouté le 2026-09-11, décision de Nathan)*
**Then** mon profil est chargé instantanément, sans mot de passe (FR33) — le parcours reste sous 30 secondes et la zone joueur de l'accueil reste le point d'entrée (« qui joue ? » : recherche, code, ou invité)

**Given** un identifiant invalide ou inconnu
**When** je le saisis
**Then** un message clair m'indique que l'identifiant n'est pas reconnu, sans bloquer le parcours "invité"

**Given** un joueur qui préfère ne pas s'identifier, ou une tablette sans réseau
**When** il démarre une partie sans identifiant
**Then** il joue en mode invité, sans historique (rôle "Invité") — *sans réseau, l'identification et la synchronisation sont indisponibles, le jeu ne l'est jamais (décision de Nathan, 2026-09-11)*

### Story 4.3: Consulter mes statistiques cumulées de carrière

As a joueur enregistré,
I want consulter mes statistiques cumulées sur l'ensemble de ma carrière,
So that je vois ma progression globale, au-delà d'une seule partie ou d'un seul appareil.

**Acceptance Criteria:**

**Given** un joueur identifié (Story 4.2) ayant joué plusieurs parties, sur une ou plusieurs tablettes
**When** j'accède à mon profil
**Then** les statistiques cumulées (nombre de parties, moyenne globale, meilleure série toutes parties confondues) sont affichées (FR21) — *y compris le **record personnel** (ancienne Story 3.5, fusionnée ici le 2026-09-11) : `GameSummary` expose déjà l'état `records` par joueur, à déclencher depuis le profil*

**Given** des parties jouées identifiées sur différentes tablettes de club
**When** les statistiques de carrière sont calculées
**Then** elles agrègent l'ensemble des parties associées à mon compte, quelle que soit la tablette d'origine

### Story 4.4: Visualiser l'évolution de ma moyenne dans le temps

As a joueur enregistré,
I want visualiser l'évolution de ma moyenne au fil du temps,
So that je vois concrètement ma progression, comme Michel qui suit sa moyenne d'une partie à l'autre.

**Acceptance Criteria:**

**Given** un joueur identifié avec un historique de parties suffisant
**When** j'accède à la vue d'évolution de ma moyenne
**Then** un graphique ou une liste chronologique montre la progression de ma moyenne par partie ou par période (FR22)

**Given** une moyenne en progression
**When** je consulte cette vue
**Then** elle correspond au moment de fierté identifié dans le parcours UX ("fierté de la progression")

---

## Epic 5: Administration de Club Multi-Tables (V2/V3)

Un admin club peut gérer les tables de son club, consulter les statistiques d'usage, synchroniser automatiquement les données locales vers le cloud, gérer son abonnement SaaS et activer un minuteur de facturation à la table pour la location horaire.

### Story 5.1: Gérer les tables de son club

As a admin club (Didier),
I want gérer les tables de mon club (configuration, activation, désactivation),
So that je contrôle précisément quelles tables sont actives et utilisables par mes membres.

**Acceptance Criteria:**

**Given** un compte admin club (architecture V2+, rôle "Admin club")
**When** j'accède à l'interface de gestion des tables
**Then** je peux ajouter, configurer, activer ou désactiver chaque table de mon club (FR34)

**Given** une table désactivée
**When** un joueur tente de démarrer une partie sur cette table
**Then** l'accès est bloqué ou clairement signalé comme indisponible

### Story 5.2: Synchroniser automatiquement les données locales vers le cloud

> ⚠️ **Déplacée vers l'Epic 3 redéfini le 2026-09-11** (elle est le prérequis de « parties rattachées au profil »). Conservée ici jusqu'à la passe epics.

As a admin club,
I want que les données de mes tables se synchronisent automatiquement vers le cloud dès qu'une connexion réseau est disponible,
So that je ne perds jamais de données même après plusieurs jours hors ligne.

**Acceptance Criteria:**

**Given** une tablette ayant joué des parties hors ligne
**When** une connexion réseau redevient disponible
**Then** les données locales sont synchronisées automatiquement vers le cloud, sans action manuelle (FR36)

**Given** plusieurs jours sans réseau
**When** la synchronisation reprend
**Then** zéro perte de donnée n'est constatée, même pour les parties jouées offline sur cette période (NFR7)

**Given** des communications client-serveur
**When** la synchronisation s'exécute
**Then** elle est chiffrée en TLS 1.3 minimum (NFR14) et les données sont hébergées dans l'Union Européenne (NFR15)

### Story 5.3: Consulter les statistiques d'usage du club

As a admin club (Didier),
I want consulter les statistiques d'usage de mon club,
So that je vois concrètement la valeur apportée par l'outil (ex. "47 parties scorées ce mois-ci").

**Acceptance Criteria:**

**Given** des données synchronisées depuis les tables du club (Story 5.2)
**When** j'accède au tableau de bord d'usage
**Then** je vois le nombre de parties scorées par table, sur une période donnée (FR35)

**Given** plusieurs tables actives
**When** je consulte les statistiques
**Then** elles sont ventilées par table, cohérentes avec la gestion des tables (Story 5.1)

### Story 5.4: Gérer son abonnement club

As a admin club,
I want gérer mon abonnement (palier, facturation),
So that je peux faire évoluer mon nombre de tables couvertes selon mes besoins.

**Acceptance Criteria:**

**Given** un club avec un nombre de tables actives (Story 5.1)
**When** j'accède à la gestion de l'abonnement
**Then** je vois mon palier actuel (1-2 / 3-5 / illimité) et peux le modifier (FR37)

**Given** un changement de palier
**When** je le confirme
**Then** la facturation (mensuelle ou annuelle) est mise à jour en conséquence

### Story 5.5: Activer un minuteur de facturation à la table

As a admin club proposant la location horaire,
I want activer un minuteur de facturation sur une table,
So that je peux facturer mes clients à l'heure d'utilisation de la table.

**Acceptance Criteria:**

**Given** une table configurée (Story 5.1) dans un club proposant la location horaire
**When** j'active le minuteur de facturation
**Then** un chronomètre de facturation démarre, indépendant du chronomètre de jeu 3 Bandes (Epic 2) (FR31, optionnel V2+)

**Given** le minuteur de facturation actif
**When** la partie se termine ou la table est libérée
**Then** la durée de location facturable est affichée clairement à l'admin ou au joueur

---

## Epic 6: Diffusion Grand Format & Overlay Stream (V2/V3)

Un organisateur peut diffuser les scores en cours sur un écran TV de salle, et un streameur peut générer une URL d'overlay fond transparent compatible OBS/Streamlabs, mise à jour en temps réel, avec mise en avant visuelle des moments clés d'une partie.

### Story 6.1: Activer un affichage grand format lisible à distance

As a utilisateur (organisateur ou joueur),
I want activer un affichage grand format optimisé pour lecture à distance,
So that les scores restent lisibles depuis l'autre bout de la salle.

**Acceptance Criteria:**

**Given** l'application affichée sur un écran large (signage 22"+ ou TV connectée)
**When** j'active le mode affichage grand format
**Then** la typographie fluide `clamp()` s'adapte pour rester lisible à 5 mètres, sur un écran 40" ou supérieur (FR23, NFR11)

**Given** le mode grand format actif
**When** la partie progresse
**Then** l'affichage reste synchronisé avec la même source de données que la saisie tactile, sans latence perceptible (architecture multi-vues)

### Story 6.2: Diffuser les scores sur un écran TV du réseau local

As a organisateur,
I want diffuser les scores en cours sur un écran TV connecté au réseau local,
So that l'ensemble de la salle voit la progression du match sans se déplacer vers la tablette.

**Acceptance Criteria:**

**Given** une TV connectée au même réseau local que la tablette de score
**When** j'active la diffusion
**Then** l'écran TV affiche le mode grand format (Story 6.1) mis à jour en continu (FR26)

**Given** une mise à jour de score sur la tablette
**When** elle est validée
**Then** l'écran TV du réseau local reflète le changement en moins de 500ms (NFR4)

### Story 6.3: Générer une URL d'overlay stream temps réel

As a streameur (Lucas),
I want générer une URL d'overlay fond transparent compatible OBS/Streamlabs,
So that je peux intégrer les scores dans ma diffusion en 30 secondes, sans bricolage.

**Acceptance Criteria:**

**Given** une partie en cours
**When** j'active le mode stream
**Then** une URL d'overlay à fond transparent est générée, compatible comme source navigateur OBS/Streamlabs (FR24)

**Given** l'URL ajoutée comme source dans OBS
**When** un score est validé sur la tablette
**Then** l'overlay se met à jour en temps réel, sans intervention manuelle de l'opérateur (FR25, NFR4)

### Story 6.4: Signaler visuellement les moments clés d'une partie

As a joueur ou spectateur,
I want que le système signale visuellement les moments clés d'une partie,
So that un record personnel ou un match point soit immédiatement perçu, sans devoir suivre les chiffres en continu.

**Acceptance Criteria:**

**Given** un joueur qui dépasse son record personnel connu
**When** le score est validé
**Then** un signal visuel (et sonore discret) met en avant ce moment sur l'affichage principal, la vue grand format et l'overlay stream (FR44)

**Given** une situation de "match point" détectée selon le format configuré
**When** elle survient
**Then** un signal visuel discret la met en évidence, sans interrompre le jeu

---

## Epic 7: Arbitrage Déporté (V2/V3)

Un arbitre peut contrôler le scoreboard (validation, correction, pause du chronomètre) depuis une interface déportée (web remote ou Bluetooth) sans jamais toucher la tablette.

### Story 7.1: Se connecter à une interface déportée pour arbitrer un match

As a arbitre (Karim),
I want me connecter à l'interface déportée d'une table depuis mon propre appareil,
So that je peux arbitrer sans être physiquement à côté de la tablette.

**Acceptance Criteria:**

**Given** une tablette de club affichant un match en cours
**When** j'accède à l'interface déportée (URL web remote, ou appairage Bluetooth)
**Then** je suis connecté à la table sélectionnée sans avoir à toucher la tablette (FR27)

**Given** le Bluetooth non supporté sur mon appareil
**When** je tente de me connecter
**Then** le mode web remote (URL navigateur, n'importe quel device) prend automatiquement le relais (fallback — mitigation des risques PRD)

### Story 7.2: Valider et corriger un score depuis l'interface déportée

As a arbitre,
I want valider ou corriger le score d'une série depuis mon interface déportée,
So that je contrôle le déroulement du match sans jamais approcher la tablette.

**Acceptance Criteria:**

**Given** une interface déportée connectée à une table (Story 7.1)
**When** je valide un score
**Then** l'action appelle la même action Pinia nommée que la saisie tactile (`addReprise()`), garantissant un comportement identique quel que soit le point d'entrée (FR27, UX-DR23)

**Given** un score contesté après validation
**When** je déclenche une correction depuis l'interface déportée
**Then** la dernière série validée est annulée (`undoLastSeries()`), exactement comme depuis la tablette (FR27)

**Given** une action déclenchée depuis l'interface déportée
**When** elle est appliquée
**Then** la tablette et tout affichage connecté (vue salle, overlay) se mettent à jour en temps réel

### Story 7.3: Mettre en pause et reprendre le chronomètre depuis l'interface déportée

As a arbitre,
I want mettre en pause et reprendre le chronomètre d'une partie 3 Bandes depuis mon interface déportée,
So that je peux gérer une contestation ou un incident sans interrompre brutalement le déroulement du match.

**Acceptance Criteria:**

**Given** un match en mode 3 Bandes avec chronomètre actif (Epic 2, Story 2.1)
**When** je déclenche la pause depuis l'interface déportée
**Then** le chronomètre se met en pause sans perdre l'état de la reprise en cours (FR27)

**Given** le chronomètre en pause
**When** je déclenche la reprise depuis l'interface déportée
**Then** le chronomètre reprend exactement là où il s'était arrêté

---

## Epic 8: Gestion de Tournoi Multi-Tables (V2/V3)

Un organisateur peut créer un tournoi, assigner les matchs aux tables disponibles et suivre la progression de toutes les tables actives en temps réel depuis un tableau de bord centralisé.

### Story 8.1: Créer un tournoi et assigner des matchs aux tables disponibles

As a organisateur (Sophie),
I want créer un tournoi et assigner les matchs aux tables disponibles,
So that je peux organiser une compétition de plusieurs joueurs en quelques minutes, sans feuille de match papier.

**Acceptance Criteria:**

**Given** une liste de joueurs participants
**When** je crée un tournoi
**Then** je peux le configurer (nombre de joueurs, format) et le créer en moins de 10 minutes (FR28, parcours Sophie)

**Given** un tournoi créé
**When** j'assigne un match à une table disponible
**Then** le match apparaît comme actif sur cette table, et la table n'est plus proposée pour un autre match tant qu'elle est occupée (FR28)

### Story 8.2: Consulter un tableau de bord centralisé de toutes les tables actives

As a organisateur,
I want consulter un tableau de bord centralisé de toutes les tables actives d'une compétition,
So that je vois en un coup d'œil l'état de chaque table sans me déplacer.

**Acceptance Criteria:**

**Given** un tournoi en cours avec plusieurs tables assignées (Story 8.1)
**When** j'accède au tableau de bord
**Then** je vois l'état de chaque table en temps réel (en cours, terminée, en attente) (FR29)

**Given** une mise à jour de score sur une table
**When** elle est validée
**Then** le tableau de bord reflète le changement en moins de 500ms (NFR4)

### Story 8.3: Suivre la progression du tournoi (classements, disponibilité des tables)

As a organisateur,
I want que le système gère automatiquement la progression du tournoi,
So that je peux assigner le prochain match sans calculer moi-même les disponibilités ou les classements.

**Acceptance Criteria:**

**Given** un match terminé sur une table (Story 8.2)
**When** le résultat est enregistré
**Then** la table redevient disponible pour un nouveau match, et le classement du tournoi est recalculé automatiquement (FR30)

**Given** un classement mis à jour
**When** un résultat se publie
**Then** il remonte automatiquement dans le classement affiché sur l'écran TV centrale (cohérence avec Epic 6)

---

## Epic 9: Export Fédéral (V3)

Le système exporte les résultats des parties dans un format compatible avec les systèmes de la fédération française de billard carambole, pour alimenter automatiquement le futur classement national.

### Story 9.1: Exporter les résultats dans un format compatible avec les systèmes fédéraux

As a admin club ou représentant de la fédération,
I want exporter les résultats des parties dans un format compatible avec les systèmes de la fédération française,
So that la fédération peut intégrer nos données sans ressaisie manuelle.

**Acceptance Criteria:**

**Given** des parties enregistrées dans l'historique/le cloud (Epic 3, Epic 5)
**When** je déclenche un export
**Then** les résultats sont générés dans un format générique JSON/CSV adaptable (FR38, architecture V3)

**Given** un format spécifique requis par la fédération une fois défini
**When** l'export est adapté à ce format
**Then** aucune donnée n'est perdue dans la conversion, et le format reste conforme aux exigences fédérales officielles

**Given** un export réalisé
**When** je le partage ou le transmets
**Then** il inclut a minima : identité des joueurs, mode de jeu, scores, date, club — les données nécessaires à un futur classement national (roadmap PRD V4)

---

## Epic 10: Refonte UI/UX Premium (1Score) (V1.1)

*Section ajoutée le 2026-09-11 (`sprint-change-proposal-2026-09-11-refonte-ui.md`, spec UX §10.0-10.8). S'exécute **juste après l'Epic 2, avant l'Epic 4**, dans l'ordre **10.6 → 10.1 → 10.2 → 10.3 → 10.4 → 10.5 → 10.7**. Chaque story laisse l'application complète et jouable : un composant ancien n'est retiré que par la story qui le remplace, et les écrans non encore refondus gardent leur rendu actuel (barre basse comprise) jusqu'à leur story. Références visuelles : Nathan indique, à la création de chaque story, quelles captures de `explore/resources/` prendre en référence.*

> **Décisions de Nathan à la passe de rendu de la Story 10.1 (2026-09-11)** — valables pour **toute l'epic**, elles priment sur les AC ci-dessous et sur les valeurs indicatives de la spec UX §10 :
> - **Paysage uniquement, jamais de portrait.** Appareils : iPad mini (1133×744), iPad 11″ (1194×834), puis écran 21,5″ (1920×1080) à terme. Toute mention du portrait dans les AC de l'epic est **caduque** : colonne de 96 px, grille 2×2, pictos sans libellé en portrait, passes 768×1024. Les passes Chrome se font sur ces trois formats. Le manifest est en `orientation: 'landscape'`.
> - **Angles vifs** : `--radius-container` et `--radius-cta` à 0, ni pilules ni ronds décoratifs.
> - **Coller plutôt qu'espacer** : `SideBar` en aplat collé au bord de l'écran (modèle Cueuny), sans marge d'écran de 16 px ; éléments jointifs séparés par des filets (modèle Billiboard).
> - **Palette resserrée bleus / noir-gris / rouge**. Tuiles en nuances de bleu dégradées (`--gradient-tile-*`, qui remplace `--color-tile-*` vert, orange et violet) ; fond `--gradient-bg` gris vers noir (et non drap vers noir) ; rouge de marque `--color-brand-red` `#D0343F`.
> - **Coupes en biais pour casser la symétrie** (en-tête rouge de `SideBar` en 10.1), motif à reprendre sur les autres écrans.
> - Un retour visuel à l'appui sur les éléments tapables.

Un club qui découvre le produit voit une interface premium et cohérente sur les cinq écrans du jeu déjà livré, sous le nom **1Score**, sans changement des règles de calcul de score. Deux mécaniques d'interaction évoluent : le passage de tour par `PASSER LE TOUR`, et l'interversion bille/côté dissociée au paramétrage.

**Constat de code (2026-09-11, à la rédaction des stories) :** l'interversion n'existe aujourd'hui **qu'en partie** — `swapPlayers()` refuse tout état autre que `playing` — et le paramétrage garde noms et distances en **état local de `HomeScreen`**, transmis à `startGame()`. Le modèle du store pose `player1` = joueur de gauche = bille blanche, et toute la logique de jeu (ouverture de reprise, égalisatrice, `openSeriesValue`) s'appuie sur « `player1` ouvre ». La Story 10.3 en tient compte : elle **conserve l'invariant « `player1` = bille blanche = celui qui ouvre »** et rend le **côté d'affichage** indépendant, plutôt que de rendre la couleur variable dans la logique de jeu.

### Story 10.1: Refonte de l'accueil — barre latérale, tuiles de mode, fond dégradé

As a joueur qui arrive devant la tablette du club,
I want un accueil 1Score premium — barre latérale, accroche, quatre tuiles de mode colorées sur un fond dégradé,
So that je reconnais le produit au premier regard et je choisis mon jeu d'un seul tap, sans rien lire (NFR12).

*Fondations posées ici pour toute l'epic : tokens et dégradé (UX-DR25 à UX-DR28), `SideBar` (UX-DR29 à UX-DR31), `ModeTile` (UX-DR34), état BIENTÔT (UX-DR30). Périmètre : l'étape `category` de `HomeScreen` uniquement — les étapes `mode` et `players` gardent leur rendu actuel (barre basse comprise) jusqu'aux Stories 10.2 et 10.3.*

*Précisions de la création de story (2026-09-11, décisions de Nathan) — elles priment sur les AC ci-dessous : référence visuelle `cueuny_home.png` ; police `system-ui` en attendant une police display ; accroche « À vous de jouer. », **aucune accroche de tuile** (`QUILLES`/`CASIN` : badge `BIENTÔT` seul, libellé `BIENTÔT` partout) ; logo = `public/logo.png` fourni par Nathan (« 1S »), le repli « rond + 1 » est abandonné ; `--color-cloth` = `#0573BB` (médiane de `explore/resources/simonis-prestige.gif`). Le dégradé est déclaré pour toute l'app mais appliqué écran par écran : l'accueil ici, les autres écrans avec leur story. ~~En portrait, tuiles en grille 2×2, à valider au rendu.~~ *Rendu livré (2026-09-11, validé par Nathan) : barre latérale collée au bord, en aplat `#101318`, en-tête rouge coupé en biais de 120 px ; rangée de quatre tuiles bleues collées à la barre et aux bords, séparées de filets, à 34 % de la hauteur ; fond gris vers noir ; aucun arrondi — voir la note de l'Epic 10 et la fiche de story.*

**Exigences :** AR20 (`SideBar`), AR26 (item inerte), UX-DR25, UX-DR26, UX-DR27, UX-DR28, UX-DR29, UX-DR30, UX-DR31, UX-DR32 (reporté), UX-DR33, UX-DR34, UX-DR35.

**Acceptance Criteria:**

**Given** n'importe quel écran de l'application
**When** il s'affiche
**Then** le fond est le dégradé drap → noir (`--gradient-bg`, départ `--color-cloth`), sans aucune image, et les tokens UX-DR27 sont déclarés dans la feuille de tokens existante (`--color-cloth`, `--color-surface`, `--color-border`, `--color-border-strong`, `--radius-container`, `--radius-cta`, `--color-tile-*`, `--color-panel-*-band`)
**And** l'écran garde une marge de 16 px sur ses quatre bords, dégradé visible autour, sans défilement ni débordement en paysage comme en portrait (768×1024 et 1024×768)

**Given** l'accueil
**When** il s'affiche
**Then** une barre latérale `SideBar` occupe la colonne gauche (120 px en paysage, 96 px en portrait), conteneur à contour sur toute la hauteur, fond `--color-surface`
**And** son en-tête (96 px) porte le logo — repli : rond `--color-cloth` avec « 1 » tant que l'asset n'est pas fourni — et le mot `1Score` en police display ; un tap sur l'en-tête n'a aucun effet
**And** les items `ENTRAÎNEMENT` et `INSCRIPTION` sont empilés sous l'en-tête (picto au-dessus d'un libellé court, ≥ 90×90 px, pleine largeur, 12 px d'écart), tous deux en état BIENTÔT
**And** l'item `FERMER L'APPLICATION` (picto marche/arrêt, libellé sur deux lignes) est calé **en bas** de la colonne, isolé du reste, **en état BIENTÔT** — décision de Nathan du 2026-09-11 : affiché, inerte, aucun spike ni pop-up dans cette epic (AR26/UX-DR32 reportés)

**Given** un item, une tuile ou un picto en état BIENTÔT
**When** il s'affiche puis qu'on le tape
**Then** picto et libellé sont rendus à 45 % d'opacité avec un petit badge `BIENTÔT` sous le libellé, et le tap n'a **aucun effet** — ni navigation, ni pop-up, ni haptique

**Given** l'accueil
**When** il s'affiche
**Then** la zone principale montre en haut une accroche d'une phrase en police display (40 à 56 px fluide, blanc, alignée à gauche, marge 32 px, sans sous-texte — libellé provisoire « À vous de jouer. » jusqu'au choix de Nathan)
**And** en bas une rangée de quatre `ModeTile` de hauteur égale (≈ 34 % de la hauteur utile, ≥ 180 px) : `3 BANDES` (`--color-tile-3b`), `JEUX DE SÉRIES` (`--color-tile-jds`), `QUILLES` (`--color-tile-quilles`), `CASIN` (`--color-tile-casin`), chacune en conteneur à contour, fond de sa couleur à 85 %, avec un titre (28 à 36 px, gras), une accroche d'une ligne (16 à 18 px) et une flèche `→` en bas à droite
**And** `QUILLES` et `CASIN` sont en état BIENTÔT (fond à 45 %, badge à la place de la flèche)
**And** rien ne bouge ni ne clignote : l'accueil reste l'écran de veille

**Given** l'accueil
**When** je tape `3 BANDES`
**Then** j'arrive directement à l'étape joueurs (mode `3bandes`), sans écran intermédiaire

**Given** l'accueil
**When** je tape `JEUX DE SÉRIES`
**Then** j'arrive à l'étape de sélection des modes JDS (rendu actuel jusqu'à la Story 10.2)

**Given** une sauvegarde de partie au lancement
**When** l'accueil s'affiche
**Then** la pop-up « PARTIE EN COURS » se comporte exactement comme aujourd'hui (Story 1.12), par-dessus le nouvel accueil

**Given** l'accueil refondu
**When** il s'affiche
**Then** la barre d'action basse n'y est plus ; l'ancien `img[alt]` du logo et les tests de `HomeScreen` sont adaptés, `SideBar` et `ModeTile` ont chacun leur fichier de test co-localisé (AR16), et le rendu est vérifié dans Chrome en paysage et en portrait

**Note de périmètre :** `SideBar` est construit dès cette story avec son API complète (en-tête, liste d'items typés `{ picto, label, state: 'normal' | 'soon', action }`, item de sortie), pour que les Stories 10.2, 10.3 et 10.5 n'aient qu'à la nourrir. Le contenu de chaque écran (UX-DR31) est fourni par l'écran, pas codé dans la barre. L'hex de `--color-cloth` est pris au pixel-picker sur l'image du drap fournie par Nathan ; à défaut `#2F6FB8`.

### Story 10.2: Refonte de la sélection des modes JDS — tuiles et choix Cadre

As a joueur de jeux de séries,
I want choisir Libre, 1 Bande, Cadre (47/2, 47/1 ou 71/2) ou 4 Billes sur des tuiles du même style que l'accueil,
So that le parcours reste « catégorie → mode → joueurs » en moins de 30 secondes, avec la même lisibilité que l'accueil (FR12, NFR12).

*Périmètre : l'étape `mode` de `HomeScreen`. Aucun nouveau mode — FR12 inchangée ; seule la navigation regroupe les trois cadres.*

*Précisions de la création de story (2026-09-12, décisions de Nathan) — elles priment sur les AC ci-dessous : **aucune nouvelle référence visuelle**, la 10.2 reprend strictement le rendu validé à la 10.1 (sidebar collée en aplat, en-tête rouge en biais, tuiles jointives séparées de filets, fond gris/noir, angles vifs, paysage seul) ; **aucune accroche de tuile** (titre + flèche, comme à l'accueil) ; **couleurs = une famille dérivée de `--gradient-tile-jds`**, du plus clair au plus sombre (`LIBRE` reprend exactement la couleur de la tuile `JEUX DE SÉRIES` de l'accueil, les trois suivantes descendent d'un cran) et non une couleur unique ; **même gabarit que l'accueil** (titre à la place de l'accroche, rangée de quatre tuiles à 34 % de la hauteur).*

**Exigences :** UX-DR31 (contenu sidebar), UX-DR36, UX-DR37.

**Acceptance Criteria:**

**Given** l'étape de sélection JDS
**When** elle s'affiche
**Then** la `SideBar` ne porte que l'en-tête et l'item `RETOUR` (flèche gauche), qui ramène à l'accueil
**And** la barre d'action basse n'y est plus

**Given** l'étape de sélection JDS
**When** elle s'affiche
**Then** la zone principale titre `JEUX DE SÉRIES` en police display, puis quatre `ModeTile` de même gabarit que l'accueil : `LIBRE`, `1 BANDE`, `CADRE`, `4 BILLES` — libellé `1 BANDE` confirmé par Nathan le 2026-09-11, le catalogue reste tel quel *(2026-09-12 : ~~toutes en `--color-tile-jds`~~ → famille de quatre bleus dérivés de `--gradient-tile-jds`, du plus clair au plus sombre ; ~~accroches « Sans contrainte », « Une bande avant le second point », « 47/2 · 47/1 · 71/2 », « Deux billes rouges »~~ → **aucune accroche**, titre et flèche seuls)*

**Given** l'étape de sélection JDS
**When** je tape `LIBRE`, `1 BANDE` ou `4 BILLES`
**Then** j'arrive à l'étape joueurs avec le mode correspondant (`libre`, `bande`, `4billes`), comme aujourd'hui

**Given** l'étape de sélection JDS
**When** je tape `CADRE`
**Then** une pop-up `PromptModal` en **variante « liste »** s'ouvre avec, empilés, les CTA `47/2`, `47/1`, `71/2`, puis `ANNULER` neutre en dernier ; voile inerte, aucune croix, aucun message (règle PromptModal)
**And** taper un cadre mène à l'étape joueurs avec le mode correspondant (`cadre-47-2`, `cadre-47-1`, `cadre-71-2`) ; `ANNULER` referme la pop-up sans rien changer

**Given** `PromptModal`
**When** il reçoit une liste de *n* actions
**Then** il les rend empilées, toutes ≥ 90 px de haut, la première en accent et les suivantes neutres sauf indication contraire, sans casser ses usages existants à un ou deux CTA (tests `PromptModal.test.ts` étendus, usages « PARTIE EN COURS », « DISTANCE MANQUANTE », fins de partie inchangés)

**Given** l'étape joueurs atteinte depuis un cadre
**When** elle s'affiche
**Then** le surtitre du mode (rendu actuel, puis colonne centrale en 10.3) affiche le libellé complet (`CADRE 47/2`, etc.) — les libellés et identifiants du catalogue `types/game.ts` ne changent pas

**Note de périmètre :** le retour depuis l'étape joueurs vers cette étape (item `RETOUR` de la 10.3) doit retrouver l'étape `mode` pour un JDS et l'accueil pour le 3 Bandes — la 10.2 laisse `step` et `selectedCategory` tels quels pour que la 10.3 n'ait rien à réinventer.

### Story 10.3: Refonte du paramétrage joueurs — saisie en place, bille et côté dissociés

As a joueur qui prépare une partie,
I want régler mon nom et ma distance directement sur ma carte, changer de bille ou de côté d'un tap, puis démarrer,
So that la table est prête sans pop-up ni écran supplémentaire, et la répartition des billes correspond à la réalité de la table (FR1, FR41).

*Périmètre : l'étape `players` de `HomeScreen`. Crée `NumericPadDock` et `AlphaKeyboardSheet`, supprime `PlayerSetupModal`, scinde l'interversion en deux actions et **retire `ÉCHANGER` du jeu** (AR22 — avancé ici depuis la 10.4 : le modèle joueur change dans cette story, l'ancien `swapPlayers` n'a plus de sens). Reprend DT1 (plafond unique), DT4 (clavier complété), DT5 (`Player.id`).*

**Exigences :** AR21, AR22, AR24, UX-DR31 (contenu sidebar), UX-DR38, UX-DR39, UX-DR40, UX-DR41, UX-DR42, UX-DR43, UX-DR44, UX-DR54, DT1, DT4, DT5, DT7.

> **Annotation de livraison (Story 10.3, 2026-09-12).** Le **voile flouté** décrit ci-dessus (blur 4 px / 30 % noir, et la fermeture par geste complet sur le voile) est **caduc** : décision de Nathan à la création de la story — « il faut qu'on puisse lire les champs de nom et score qui vont se remplir en arrière-plan ». **Aucun voile, aucun flou** : le dock **remplace** les CTA dans la colonne centrale (élargie pendant la saisie) et le bandeau de nom est monté **dans le flux** sous la zone principale ; les cartes se resserrent mais restent **entières et nettes**. Les issues sont donc la croix, `VALIDER`, ou le tap sur un autre champ — jamais un tap dans le vide.
> Deux autres écarts assumés, mesurés à la passe navigateur : la zone principale est en **conteneurs espacés** (gouttières, marge autour) et non jointifs comme les tuiles des 10.1/10.2 ; et le bandeau fait **465 px** (≈ 56 % de 834 px), non « ≈ 45 % » — les 45 % étaient une intention, la contrainte dure (touches ≥ 57 px, deux cartes entières au-dessus, aucun débordement) est tenue aux trois formats. La barre croix / `VALIDER` du bandeau est au plancher des claviers intégrés (57 px, exception UX-DR8) : ce sont ces 33 px qui manquaient aux cartes à 1133×744.
> Enfin, le **buffer vit dans l'écran** et non dans le dock (écart à la lettre d'UX-DR39) : c'est la carte qui doit afficher la valeur en direct, et deux buffers divergeraient à la première frappe. Le dock et le bandeau gardent les **règles** (plafonds, espaces, première frappe qui remplace) et les **retours** (haptique, pulsation) ; les claviers restent muets (UX-DR54).

> **Deuxième passe de rendu (Nathan, 2026-09-12, après livraison).** Le rendu de la première passe est refusé (« archi moche ») ; les décisions ci-dessous priment sur l'annotation précédente :
> 1. **Bandeau de titre** en haut de la zone principale, le mode écrit **en grand et centré** (réf. Cueuny) — il ne tient plus en surtitre discret de la colonne centrale.
> 2. **Pastille de bille et médaillon rond sombre RETIRÉS** : la couleur pleine de la carte dit déjà la bille.
> 3. **Champs `NOM` et `DISTANCE` centrés** dans leur carte, chacun en box à **fondu grisé** (`--gradient-field`).
> 4. **Commandes façon Cueuny** : les deux réglages sont **bleus**, côte à côte ; `DÉMARRER` est **rouge** (`--gradient-red`), pleine largeur dessous, avec un **chevron**. Le liseré rouge du champ visé est conservé (« ça marche bien »).
> 5. **Les deux claviers deviennent de VRAIES POP-UPS** par-dessus l'écran, **voile flouté** compris — le dock en colonne centrale et le bandeau en flux sont abandonnés : le clavier intégré est une solution temporaire, la page n'a pas à refluer autour de lui. La valeur en cours reste visible parce qu'elle est **rappelée dans l'en-tête de la pop-up, calée entre la croix et `VALIDER`**, avec un **rappel de bille**. *(L'annotation « aucun voile » ci-dessus ne vaut donc plus que pour son intention — voir toujours ce qu'on tape — que ce rappel satisfait autrement.)*
>
> **Conséquence sur l'AC6** : un voile plein écran interdit de taper l'autre champ pendant une saisie. Les issues sont la croix et `VALIDER` ; la garde « ouvrir une saisie valide celle en cours » reste dans le code et sert l'enchaînement du rattrapage. **Conséquence sur l'AC10** : le surtitre du mode quitte la colonne centrale pour le bandeau. **Écart mesuré** : le picto des deux réglages est **au-dessus** du libellé et non en ligne comme la référence — la colonne centrale fait 1/5, soit 73 px par bouton à 1133×744, où un picto en ligne déborde.

> **Troisième passe de rendu (Nathan, 2026-09-12).** Un **bug** et une nouvelle série de correctifs, qui priment sur les annotations précédentes :
> 1. **`CHANGER DE CÔTÉ` n'intervertit QUE les noms et les distances** — les billes ne bougent pas, la gauche reste blanche. L'AC12 (« les cartes s'échangent de place, tout compris ») est **corrigée** : c'est le dual exact de `CHANGER DE BILLE`, qui laisse les joueurs en place. Seul `CHANGER DE BILLE` déplace donc la bille blanche d'un côté à l'autre, et donc `whiteSide`.
> 2. **Les deux réglages sont EMPILÉS**, pleine largeur, picto **en ligne** devant le libellé (Nathan teste sur un 14″).
> 3. **Pictos repris de la référence coréenne** : boucle de rafraîchissement pour la bille, deux flèches croisées pour le côté. Les deux ronds barrés d'une flèche sont abandonnés (« catastrophiques »).
> 4. **`DÉMARRER` : chevron à GAUCHE du mot**, dans une plaque translucide (« plus premium »).
> 5. **Cartes joueur allégées** : plus de marge (`p-6`), champs en box **claires** teintées de la carte et écrites à son encre — les pavés presque noirs étaient « trop cheap » et l'écran « un peu sombre ». Un champ vide porte **son seul intitulé** (`NOM`, `DISTANCE`) : ni « JOUEUR » ni « 0 », qui se lisaient comme de vraies valeurs.
> 6. **Cartes réduites, centre élargi** : la colonne centrale passe de 1/5 à **1/4**, sur une surface `--gradient-panel` nettement plus claire que le fond d'écran. L'AC1 (« trois colonnes 2/5 · 1/5 · 2/5 ») est donc **caduque**.

> **Quatrième passe de rendu (Nathan, 2026-09-12).** Priment sur tout ce qui précède :
> 1. **En-tête de carte** : un picto de bille et son nom (`BILLE BLANCHE` / `BILLE JAUNE`) en haut de chaque carte. *(Le picto est un disque CSS PLACEHOLDER — Nathan fournit les vrais pictos de bille, à servir depuis `public/` comme `logo.png`.)* L'espace laissé libre sous les champs reste vide, volontairement.
> 2. **Jaune revu** : `--color-player-yellow` passe de `#FFC72C` (trop or/orange) à `#FFD60A`.
> 3. **Pop-ups de saisie ALIGNÉES SUR UN CÔTÉ**, celui **opposé** à la carte qu'on remplit : cette carte reste entièrement visible et se remplit à vue. Conséquences directes — le rappel de la valeur **disparaît** des pop-ups (c'est la carte qui l'affiche), et le **voile n'est plus flouté** mais seulement très légèrement assombri, sans quoi la carte redeviendrait illisible.
> 4. **Fermeture au tap dehors** (geste complet, appui **et** relâchement) et **la croix cède la place à un `ANNULER`**, comme dans toutes les pop-ups du produit.
> 5. **Touches façon Cueuny** : plaques sombres légèrement adoucies (`--radius-key`, seule exception aux angles vifs avec la carte de pop-up), filet clair en haut, ombre portée en bas, et la touche s'enfonce à l'appui. `keyClasses.ts` étant partagé, `ScoreEntryModal` en hérite.

> **Cinquième passe de rendu (Nathan, 2026-09-12).** Priment sur tout ce qui précède :
> 1. **Pop-ups de saisie CENTRÉES dans la zone libre**, et non plus collées au bord : la carte visée occupe environ un tiers, la pop-up se centre dans le reste, avec une gouttière. Géométrie portée par `--setup-popup-inset-left` / `--setup-popup-inset-right`, qui **reproduisent la mise en page de l'étape `players` et doivent bouger avec elle**.
> 2. **`ANNULER` et `VALIDER` prennent le rayon des TOUCHES** (`--radius-key`) : des rectangles nets à côté de claviers en relief juraient. Vaut aussi pour les CTA de `PromptModal`.
> 3. **Touche `RESET`** dans le clavier alphabétique (rangée d'`ESPACE`), qui vide le nom d'un coup. `AlphaKeyboard` reste muet : il émet `clear`, son hôte vide le buffer.
> 4. **`PromptModal` repris** : titre **centré dans toutes les variantes**, **CTA principal AU-DESSUS du secondaire** (l'action proposée se lit avant son refus), **voile aligné sur celui des pop-ups de saisie** (`bg-black/25`, **sans flou**), et **fermeture au tap dehors via une prop `dismissible`** — **opt-in**, car les pop-ups de FIN DE PARTIE doivent garder leur voile inerte (AC18, Décision 12). « DISTANCE MANQUANTE » l'active.
> 5. **En-tête de carte revu** : contenu **aligné à gauche**, bandeau **pleine largeur** sur un aplat légèrement plus sombre que la carte, **filet affiné**, et les **vrais pictos de bille** fournis par Nathan (`public/bille_blanche.png`, `public/bille_jaune.png`).
> 6. **Contraste corrigé** : le gris des intitulés et des placeholders tombait à ~2:1 sur la carte jaune. Opacités relevées (placeholder 55 %, intitulé 65 %, en-tête 75 %) — au-delà de 9:1 sur les deux billes. **Ne pas les rebaisser sans revérifier sur le JAUNE**, qui est le cas limite.

> **Sixième passe de rendu (Nathan, 2026-09-12).** Trois retouches, qui priment sur ce qui précède :
> 1. **`ANNULER` devient OPAQUE et perd son contour clair.** `--gradient-neutral` passe d'un blanc voilé (0,22 → 0,10) à un gris sombre plein, de la famille de `--color-key` : le voilé laissait voir l'écran au travers et salissait le bouton sur tout fond chargé. Vaut partout — pop-ups de saisie et `PromptModal`. Les arrondis, eux, sont **validés** (« beaucoup mieux dans les modales », à généraliser peut-être plus tard).
> 2. **Jaune arrêté à `#FFE000`** après quatre essais : `#FFC72C` puis `#FFD60A` tiraient vers le doré (`#FFD60A` est à deux points de `#FFD700`, la couleur « or » littérale), `#FFE81A` partait à l'inverse dans le jaune lavé. `#FFE000` tient le milieu et surtout porte un **bleu à zéro**, donc une saturation pleine — c'est ce qui le rend franc plutôt que délavé. Ne pas y remettre de bleu « pour adoucir ».
> 3. **Le chevron de `DÉMARRER` perd sa plaque** : une flèche seule, plus large, à gauche du mot. La plaque translucide se lisait comme un bouton dans le bouton.

**Acceptance Criteria:**

**Given** l'étape joueurs
**When** elle s'affiche
**Then** la `SideBar` porte `RETOUR` (→ sélection JDS pour un jeu de série, → accueil pour le 3 Bandes, **saisies conservées**), `CONFIGURATION` (engrenage, BIENTÔT), et en bas la croix `ANNULER` (→ accueil, noms et distances effacés, sans confirmation)
**And** la barre d'action basse n'y est plus ; `DÉMARRER` vit dans la colonne centrale

**Given** l'étape joueurs
**When** elle s'affiche
**Then** la zone principale est en trois colonnes 2/5 · 1/5 · 2/5 : carte du joueur à la bille **blanche** à gauche par défaut, colonne de réglages au centre, carte du joueur à la bille **jaune** à droite par défaut
**And** chaque carte est un conteneur à contour, fond plein couleur de bille, avec un **médaillon de bille** en haut (rond de 64 px, liseré, blanc ou jaune sur fond sombre) puis deux champs centrés en conteneurs à contour tapables : `NOM` (attente `JOUEUR`, gris) et `DISTANCE` (attente `0`, gris)
**And** le champ visé porte le liseré rouge (`--color-turn-active`, présence et non teinte)

**Given** une carte joueur
**When** je tape `DISTANCE`
**Then** le pavé numérique nu (`NumericPad`, sans carte ni en-tête) s'ouvre **dans la colonne centrale** à la place des CTA, hébergé par `NumericPadDock` (croix en haut, `VALIDER` accent pleine largeur en pied), le reste de l'écran passe sous un voile flouté léger (blur 4 px, 30 % noir) **sauf la carte visée**, nette, dont le champ `DISTANCE` s'actualise à chaque touche
**And** `AC`/`C` et `⌫` se comportent comme aujourd'hui ; le plafond de 3 chiffres ignore la frappe avec pulsation ; ce plafond a **une seule source** (`MAX_TARGET_SCORE` du store, exposé au dock — `MAX_DIGITS` de `PlayerSetupModal` disparaît avec lui, DT1)
**And** `VALIDER` applique ; la croix ou un **geste complet** sur le voile (appui **et** relâchement) abandonne et restaure la valeur précédente

**Given** une carte joueur
**When** je tape `NOM`
**Then** l'`AlphaKeyboard` s'ouvre en **bandeau bas pleine largeur** (`AlphaKeyboardSheet`, ≈ 45 % de la hauteur, conteneur à contour, croix à gauche, `VALIDER` à droite), même voile flouté, carte visée nette, champ `NOM` actualisé en direct, majuscules automatiques, 20 caractères, touches ≥ 57 px
**And** `NumericPad` et `AlphaKeyboard` passent en style contour (tokens de la 10.1, `keyClasses.ts` partagé) et restent muets (UX-DR54)
**And** le clavier est **complété** du tiret, de l'apostrophe et de `Ë Ï Î Ô Û` (DT4) — `JEAN-PIERRE`, `D'ARTAGNAN`, `JOËL`, `ANAÏS`, `BENOÎT`, `JÉRÔME` sont saisissables
**And** `VALIDER` applique ; la croix ou un geste complet sur le voile abandonne

**Given** `PlayerSetupModal`
**When** la story est livrée
**Then** le composant et son test sont **supprimés** ; toute saisie passe par le dock et le bandeau ; aucun champ natif n'existe (règle « borne fixe », UX-DR19)

**Given** `DÉMARRER` tapé alors qu'au moins une distance vaut 0
**When** la pop-up « DISTANCE MANQUANTE » propose `RÉGLER LA DISTANCE`
**Then** ce CTA ouvre **directement le dock sur le champ `DISTANCE`** du premier joueur sans distance, puis, après validation, celui du second s'il en manque encore — un seul geste de rattrapage, comme en Story 1.10

**Given** la colonne centrale au repos
**When** elle s'affiche
**Then** elle porte le surtitre du mode (ex. `CADRE 47/2`), une ligne de deux CTA neutres à contour de demi-largeur — `CHANGER DE BILLE` (picto deux ronds ⇄) et `CHANGER DE CÔTÉ` (picto ⇄ horizontal) — puis `DÉMARRER` accent, pleine largeur, ≥ 110 px de haut

**Given** deux joueurs saisis, blanc à gauche
**When** je tape `CHANGER DE BILLE`
**Then** **les billes s'échangent, les joueurs restent en place** : la carte de gauche devient jaune (fond, bandeau, médaillon), celle de droite blanche ; noms et distances ne bougent pas
**And** un second tap remet les billes en place (action inverse d'elle-même)

**Given** deux joueurs saisis
**When** je tape `CHANGER DE CÔTÉ`
**Then** **les cartes s'échangent de place, tout compris** (nom, distance, bille) ; un second tap les remet en place

**Given** n'importe quelle combinaison des deux actions
**When** je tape `DÉMARRER`
**Then** le scoreboard affiche chaque joueur du côté et avec la bille choisis, et **le joueur à la bille blanche ouvre la partie** (a la main, ouvre les reprises), **où qu'il soit à l'écran** (AR24) ; la reprise égalisatrice appartient au joueur à la bille jaune ; moyenne, meilleure série, `POUR n`, undo et fin de partie sont inchangés (tests du store verts sans modification de leurs attentes de calcul)

**Given** une partie en cours
**When** le scoreboard s'affiche
**Then** `ÉCHANGER` n'existe plus (bouton retiré de `CenterPanel`, `swapPlayers()` et `sidesSwapped` retirés du store et de `GameState`, tests correspondants retirés — AR22, DT7 clos) ; le rendu du reste du scoreboard est celui d'aujourd'hui jusqu'à la Story 10.4

**Given** `GameState`
**When** son format change (côté d'affichage ajouté, `sidesSwapped` et `Player.id` retirés — DT5)
**Then** `GAME_STORAGE_VERSION` est incrémenté et une sauvegarde de l'ancien format est écartée proprement au lancement, comme le prévoit déjà la garde de lecture (Story 1.12)

**Given** la story livrée
**When** les tests tournent
**Then** `NumericPadDock`, `AlphaKeyboardSheet` et les nouvelles actions ont leurs tests co-localisés ; `HomeScreen.test.ts`, `GameView.test.ts` et `useGameStore.test.ts` sont adaptés ; le rendu est vérifié dans Chrome en paysage et en portrait, dock ouvert et bandeau ouvert

**Piste d'implémentation recommandée (à confirmer par le dev) :** conserver l'invariant du store « `player1` = bille blanche = celui qui ouvre » (`player2` = jaune) pour ne toucher **aucune** règle de jeu, et ajouter à `GameState` un seul champ d'affichage persisté (ex. `whiteSide: 'left' | 'right'`), qui remplace `sidesSwapped`. Au paramétrage, l'état reste local à `HomeScreen` comme aujourd'hui : `CHANGER DE BILLE` permute les noms/distances entre les deux emplacements **et** bascule `whiteSide` (les cartes ne bougent pas visuellement), `CHANGER DE CÔTÉ` bascule seulement `whiteSide` ; `startGame()` reçoit les deux joueurs résolus (blanc, jaune) et `whiteSide`. `GameView` et `GameSummary` placent `player1` à gauche ou à droite selon `whiteSide`. Le libellé « action de store dédiée » de la spec est ainsi porté par `startGame` et par le champ d'état, sans phase de paramétrage dans le store — l'écart est assumé, à consigner dans `architecture.md` à la livraison. `PlayerId` garde sa valeur de « côté de la partie » pour les reprises ; son commentaire dans `types/game.ts` est réécrit.

### Story 10.4: Refonte du scoreboard — carte joueur, `PASSER LE TOUR`, dock de saisie, barre basse en pictos

As a joueur en partie (JDS ou 3 Bandes),
I want une carte joueur qui montre mon nom, ma distance, mon restant, mon score, ma moyenne et ma série, une colonne centrale réduite à l'essentiel avec `PASSER LE TOUR`, et une barre basse en pictos,
So that je lis tout à 2 mètres et je passe la main par un geste explicite, sans jamais toucher une carte par erreur (FR2, FR3, FR7, FR8, FR9, FR13, FR14, NFR10).

*Périmètre : `GameView` et ses composants (`PlayerPanel`, `CenterPanel`, `ShotClock`, `ActionBar`, `ScoreEntryModal` → `ScoreEntryDock`). Crée `IconAction`, réutilise `NumericPadDock` (10.3). Reprend DT2 (markup unique). Aucune règle de score ne change. Story volontairement entière (décision de Nathan, 2026-09-11) : la plus grosse de l'epic.*

**Exigences :** AR20 (`ActionBar` scoreboard), AR23, AR25, UX-DR28 (pictos), UX-DR45, UX-DR46, UX-DR47, UX-DR48, UX-DR49, UX-DR50, UX-DR51, UX-DR52, DT2.

> **LIVRÉE le 2026-09-14** (dev-story, statut `review`). Écarts assumés par rapport aux AC ci-dessous, tous issus des **décisions 1 à 4 de Nathan** (2026-09-12) ou de la passe navigateur :
> 1. **Saisie latérale, pas de dock central** (décision 2) — voir UX-DR50, réécrit. Le « dock recouvrant `REP`/`PASSER LE TOUR` + voile flouté sauf la carte active » n'est pas livré : la pop-up se pose du côté opposé à la carte active, voile **sans flou**, `PASSER LE TOUR` **masqué** plutôt que recouvert.
> 2. **Bandeau de carte sans picto de bille** (décision 3) — la couleur pleine de la carte dit la bille en jeu ; l'en-tête `picto + BILLE BLANCHE/JAUNE` reste au paramétrage (10.3).
> 3. **Débordement du chrono systématique, pas optionnel** (décision 4) — voir UX-DR48. Le seuil des 160 px n'est pas la règle de départ.
> 4. **Portrait hors périmètre** (décision de Nathan du 2026-09-11) — aucune variante `portrait:`, aucun libellé masqué, aucun picto à 72 px. Formats livrés et mesurés : 1133×744, 1194×834, 1920×1080, **paysage uniquement**.
> 5. **Liseré de tour en overlay, pas en `ring` de racine** (passe navigateur) — un `ring-inset` se peint SOUS les enfants, et le bandeau opaque l'effaçait sur les 22 % hauts de la carte. Défaut invisible en test (happy-dom ne calcule aucun CSS).
> 6. **`openSeries` borné au joueur qui a la main** — la fonction privée `openSeriesValue` reste non nulle après le passage de main, ce qui convient à ses appelants internes mais ferait afficher une série « en cours » sur la carte d'un joueur assis.
> 7. **Barre du récap déplacée en `<nav>` inline dans `GameView`** — `ActionBar` est devenue la barre basse du scoreboard. Provisoire, **supprimé le 2026-09-14 par la Story 10.5** (barre latérale `RECOMMENCER` / `QUITTER`).
> **1re passe de rendu (Nathan, 2026-09-14)** — six changements, tous appliqués :
> - **bandeau de carte au modèle Billiboard de bout en bout** : ligne 1 `NOM | DISTANCE`, ligne 2 `RESTANT | MOY · SÉRIE`. `DISTANCE` et `RESTANT` deviennent des **nombres nus**, sans libellé ;
> - **la ligne `MOY · SÉRIE` sous le score est SUPPRIMÉE** : son aplat gris coupait la carte en deux pour trois valeurs secondaires. Elle remonte dans le bandeau. La carte n'a donc plus que **trois** zones ;
> - **zone de série en ROUGE** (`--color-brand-red`) et plus grosse (`clamp(24px,10cqw,64px)`), comme la référence Billiboard qui peint ce nombre en rouge entre ses deux boutons de correction ;
> - **`PASSER LE TOUR` perd son contour clair** (`--color-border-strong` dessinait un cadre dans un cadre) et prend le **picto de Billiboard** : la boucle circulaire à deux flèches, même tracé que `refresh` ;
> - **latence du chrono ramenée de 2 s à 1 s** (`SHOT_CLOCK_GRACE_MS`) : 2 s se lisaient comme un chrono en panne ;
> - **anneau du chrono rentré dans son disque** (rayon 36 au lieu de 42, trait 10 au lieu de 8) : collé au bord il se lisait comme un liseré ; avec sa marge sombre, le médaillon se détache des cartes sur lesquelles il déborde (modèle Cueuny).
>
> **2e passe de rendu (Nathan, 2026-09-14)** : le **liseré de tour passe devant l'anneau** du chrono (l'écart n° 8 ci-dessous est donc **clos**) ; anneau **plus gros** (débordement 16 → 24 px, gouttière des cartes 24 → 32 px), **trait affiné** (10 → 7) et **disque fondu** dans la colonne (`--color-shot-clock-face` au lieu de `bg-black`). **Correction de règle** : en 3 Bandes, `−`/`+` corrigent la **série en cours** au lieu d'empiler un ajustement séparé — sans quoi le total divergeait de la somme des reprises (défaut de la Story 2.2, rendu visible par l'affichage de la série).
>
> **3e passe de rendu (Nathan, 2026-09-14)** : le liseré de tour **contourne** le disque du chrono — demi-anneau rouge dans `ShotClock`, clippé sur la seule bande qui dépasse dans la carte, avec `--game-clock-bleed` comme source unique du débordement — au lieu de passer par-dessus ; cap de l'arc **plat** partout ; **bandeau de carte à hauteur libre** (l'AC1 qui le fixe à 22 % est caduc : il laissait la moitié de son aplat vide) et un cran d'air de plus entre ses deux lignes.
>
> 8. ~~**Écart constaté, non corrigé**~~ **✅ Clos à la 2e passe de rendu** : l'anneau débordant recouvre le liseré de tour sur ~15 px de large (la carte `@container` crée un contexte d'empilement qui confine le `z-20` du liseré). À trancher avec Nathan au rendu.

**Acceptance Criteria:**

**Given** une partie en cours
**When** une carte joueur s'affiche
**Then** elle est un conteneur à contour, fond plein couleur de bille, en quatre zones : (1) un **bandeau** (~~22 % de la carte~~ — *à hauteur LIBRE depuis la 3e passe de rendu : fixé à 22 %, il laissait la moitié de son aplat vide sous le texte*, fond `--color-panel-white-band` ou `--color-panel-yellow-band`) avec `NOM` en haut à gauche (gras, deux lignes max puis ellipse — jamais une valeur chiffrée tronquée), `DISTANCE` en haut à droite (libellé petit + valeur), `RESTANT` sous le nom (libellé petit + valeur) ; (2) le **score** géant centré, paliers de taille par nombre de chiffres ajustés à la hauteur restante ; (3) `MOY · SÉRIE` sur une ligne sous le score (18 à 22 px) ; (4) le **pied** `−` / zone de série / `+` (≥ 90×90 px)
**And** `RESTANT = max(distance − score, 0)` est affiché **dans tous les modes**, masqué sans distance, calculé dans le panneau (AR25) ; ~~`POUR n` reste propre au 3 Bandes et s'affiche dans la zone de série comme aujourd'hui (Story 2.4), redondance avec `RESTANT` assumée~~ — *__caduc, 4e passe de rendu__ : `POUR n` s'affiche dans le BANDEAU, **à la place** du restant dont il est l'expression, et la zone de série du pied reste occupée par la série en cours jusqu'au bout. Il n'y a plus de redondance à assumer.*

**Given** une carte joueur
**When** je la tape (n'importe où hors `−`/`+`)
**Then** **rien ne se passe** : l'état « tapable pour rendre la main » et l'émission `pass-turn` sont retirés de `PlayerPanel` ; le tour actif se lit au liseré rouge épais du conteneur (présence, pas teinte)

**Given** la colonne centrale
**When** elle s'affiche
**Then** *(4e passe : `PASSER LE TOUR` tient la même place dans les deux modes, en bas ; en JDS le compteur de reprises prend la place du chrono au lieu de laisser un vide)* elle est un conteneur ~~à contour~~ (`--color-surface` ; *contour retiré à la 3e passe de rendu : son filet s'interrompait derrière le disque du chrono et salissait le raccord du liseré de tour*) réduit à `REP` + compteur en haut, le chrono en 3 Bandes (anneau et fondu inchangés ; en JDS l'espace reste vide et `PASSER LE TOUR` remonte), et `PASSER LE TOUR` en bas (CTA neutre à contour fort, pleine largeur, ≥ 90 px, libellé sur deux lignes si besoin) ; `ANNULER` et `ÉCHANGER` n'y sont plus
**And** ~~le débordement de l'anneau sur les cartes (12 à 20 px, `z-index`, marge intérieure réservée) est **optionnel** : appliqué seulement si la colonne offre moins de 160 px d'anneau~~ *(**Écart livré, décision 4** : le débordement est **systématique**, 15 px de chaque côté, mesuré aux trois formats ; les cartes réservent 24 px sur leur bord intérieur)*, à valider au rendu avec Nathan

**Given** une partie en JDS, le joueur actif n'ayant rien saisi
**When** je tape `PASSER LE TOUR`
**Then** une **série de 0** est enregistrée pour lui et la main passe (règle d'alternance inchangée, seul le geste change)

**Given** une partie en 3 Bandes, des `+1` comptés pour le joueur actif
**When** je tape `PASSER LE TOUR`
**Then** la série comptée est clôturée, la main passe, le chrono repart à 40 avec ses 2 s de latence (Story 2.2)

**Given** `PASSER LE TOUR`
**When** j'y ai recours
**Then** c'est une action dans la pile d'undo (`ANNULER` la défait) ; il est toujours disponible en partie, masqué sous le dock pendant une saisie, inerte pendant les pop-ups de fin ; l'action de store `passTurn()` est **réutilisée** (AR23), les tests qui simulaient le tap sur la carte sont convertis en déclenchement de `PASSER LE TOUR`
**And** valider une série au pavé (`VALIDER`, auto-validation) continue de basculer la main sans passer par `PASSER LE TOUR`

**Given** une partie en JDS
**When** je tape `+ POINTS ADVERSAIRE` dans la barre basse
**Then** le pavé nu s'ouvre **dans la colonne centrale** (`ScoreEntryDock` = `NumericPadDock` avec croix, `NumericPad`, `VALIDER` accent et son compte à rebours de 3 s), recouvrant `REP` et `PASSER LE TOUR` ; le reste passe sous le voile flouté **sauf la carte du joueur qui a la main**, nette, où la valeur tapée s'affiche **entre `−` et `+`** dans la zone de série, à la taille de `POUR n`, couleur d'encre de la carte ; largeur minimale du dock 220 px (débordement sur les bords intérieurs des cartes floutées accepté en portrait)
**And** `VALIDER`, l'auto-validation à 3 s, la croix et le geste complet sur le voile ont **exactement** les sémantiques de `ScoreEntryModal` (Story 1.5) ; `entryOpen` et `currentInput` restent persistés et restaurés (Story 1.12) ; `ScoreEntryModal` et son test sont supprimés, ses tests migrés vers `ScoreEntryDock`

**Given** une partie en 3 Bandes
**When** je tape `+1 ADVERSAIRE` dans la barre basse
**Then** un point est crédité à celui qui joue, avec haptique et relance du chrono, exactement comme `+1 POINT` aujourd'hui (Story 2.2) ; aucun pavé ne s'ouvre

**Given** la barre basse
**When** elle s'affiche
**Then** elle reste calée sur les colonnes des cartes et ses deux groupes **échangent de côté à chaque bascule de tour** (inchangé) : côté du joueur **assis**, le CTA de saisie accent large comme la carte (`+ POINTS ADVERSAIRE` en JDS, `+1 ADVERSAIRE` en 3 Bandes) ; côté opposé, quatre `IconAction` du bord extérieur vers l'intérieur : `QUITTER` (porte), `PARAMÈTRES` (engrenage, **BIENTÔT**), `RECOMMENCER` (flèche circulaire), `ANNULER` (flèche retour courbe)
**And** `QUITTER` ouvre « TERMINER LA PARTIE ? » (ou ramène à l'accueil sans série), `RECOMMENCER` ouvre « RECOMMENCER LA PARTIE ? » (grisé sur scoreboard intact), `ANNULER` est l'undo multi-niveaux grisé à pile vide — comportements inchangés (Stories 1.7, 1.10, 1.15)
**And** en portrait, les libellés sont masqués et les pictos passent à 72 px pour tenir dans 307 px
**And** **un seul markup** rend les deux côtés (ordre inversé par `flex-direction`), fin de la duplication de `GameView.vue` (DT2)

**Given** `IconAction`
**When** il est utilisé
**Then** c'est un composant picto + libellé ≥ 90×90 px libellé compris, fond `--color-surface`, contour, `--radius-cta`, avec les états normal / grisé / BIENTÔT, testé isolément ; les pictos sont des SVG inline au trait 2 px (UX-DR28), table §10.7 de la spec UX

**Given** la story livrée
**When** les tests tournent
**Then** `PlayerPanel`, `CenterPanel`, `ActionBar`, `GameView`, `ShotClock` et le store ont leurs tests adaptés (aucun test ne cible plus le tap de passage ni `ÉCHANGER`, ni les libellés texte devenus pictos) ; le rendu est vérifié dans Chrome en paysage et en portrait, en JDS et en 3 Bandes, dock ouvert et fermé, pendant une offre d'égalisatrice

**Note de périmètre :** le `role="button"` englobant de `PlayerPanel` (dette revue 1.5) disparaît de fait avec le retrait du tap — à vérifier en revue. La cohabitation `RESTANT` / `POUR n` n'est pas un bug. Aucune nouvelle action de score (UX-DR23).

### Story 10.5: Refonte du récap — barre latérale et bandeau corrigé

As a joueur en fin de partie,
I want le récap dans le même habillage que le reste de l'application, avec `QUITTER` et `RECOMMENCER` dans la barre latérale,
So that la fin de partie est aussi soignée que le jeu et que je relance une revanche d'un tap (FR4, FR17).

*Périmètre : `GameSummary` et l'état « récap » de `GameView`. Reprend DT6 (troncature du nom). Réutilise `SideBar` (10.1).*

**Exigences :** UX-DR31 (contenu sidebar), UX-DR53, DT6.

> **Livrée le 2026-09-14 (dev-story) — écarts assumés, décisions de Nathan à la création de la story :**
> 1. **Places dans la barre latérale inversées par rapport à la lettre des AC** : `RECOMMENCER` est un **item** sous l'en-tête, `QUITTER` va dans le **slot de sortie** (`exitItem`), calé en bas et isolé. Convention de l'epic : l'action la plus irréversible est isolée en bas (comme `FERMER L'APPLICATION` à l'accueil et `ANNULER` au paramétrage), et la revanche est l'action fréquente. Voir aussi UX-DR31, annoté.
> 2. **Pastilles de bille aux assets PNG du paramétrage** (`/bille_blanche.png`, `/bille_jaune.png`, ceux fournis par Nathan en 10.3), dans le bandeau **comme** dans la ligne `RÉSULTAT` : les aplats `bg-player-white` / `bg-player-yellow` ont disparu de `GameSummary`.
> 3. **Aucune confirmation** sur `RECOMMENCER` ni sur `QUITTER` : la partie est finie, il n'y a rien à perdre — pas de `PromptModal` sur cet écran.
> 4. **Portrait caduc pour toute l'epic** (passe de rendu 10.1) : l'AC « dans les deux orientations » ne s'applique pas, la passe navigateur couvre les trois formats **paysage** (1133×744, 1194×834, 1920×1080).
> 5. La `SideBar` vit dans **`GameView`**, pas dans `GameSummary` : ce dernier reste strictement présentationnel (aucun emit, verrouillé par un test lisant son source). Même partage que sur les trois étapes de `HomeScreen`.
>
> **1re passe de rendu (Nathan, 2026-09-14)** — trois ajustements, aucun changement de règle :
> - **Les pastilles de bille sortent du bandeau** : la bille se lit déjà dans la ligne `RÉSULTAT`, la dire deux fois volait la place au nom. Il en reste **une par joueur**, dans sa cellule `RÉSULTAT`.
> - **Nom et distance grossis**, de `text-label` (16–24 px) à `text-tile-title` (28–36 px). DT6 tient toujours : vérifié au navigateur avec un nom de 20 `W` aux trois formats, le nom se tronque et la distance reste entière.
> - **Les cinq statistiques deviennent des BLOCS séparés** (réf. `billiboard_recap_2`) : marge de 8 px entre les cellules, le fond se voit au travers, et l'aplat de couleur passe de la **colonne** à la **cellule**. **Écart assumé à UX-DR13**, qui demandait des colonnes entières « et pas une grille de lignes » — la colonne victorieuse se lit toujours d'un bloc, rayée de fins traits de fond. **Ordre revu : `RÉSULTAT` · POINTS · REPRISES · MOY · SÉRIE** (la moyenne après le nombre de reprises dont elle se déduit).
>
> **2e passe de rendu (Nathan, 2026-09-14)** — deux ajustements :
> - **Toutes les valeurs à la même taille.** `POINTS` tenait seul en `text-reprise` (48–120 px) et écrasait les quatre autres lignes ; il passe en `text-label` comme elles. Effet de bord bienvenu : le `VS` redescendant de `text-reprise` à `text-hero`, le bandeau perd 50 px (153 → 103) et les cinq blocs y gagnent.
> - **Bandeau en BANDE CLAIRE** (réf. `billiboard_recap`) : un aplat `--color-banner` (#F2F0EA, blanc cassé — pas de blanc pur, l'écran est en salle sombre) court d'un bord à l'autre et porte les deux couples `NOM | distance` en `--color-bg`. Elle est fendue au milieu par une **échancrure en biais** — deux `clip-path` symétriques qui s'écartent vers le bas — où le `VS` se loge sur le fond sombre, le mode en surtitre au-dessus (AC13 tenu). Même grammaire que l'en-tête de `SideBar` : une coupe en biais pour casser la symétrie. ⚠️ Le rembourrage des deux bandes est **asymétrique** (`pr-10` / `pl-10`) : côté échancrure, le texte doit rester en deçà du biais, sans quoi la distance passerait dessous.
>
> **3e passe de rendu (Nathan, 2026-09-14)** : le texte de la colonne victorieuse passe en **blanc** (`--color-on-victory-ribbon` #000000 → #FFFFFF) — partout ailleurs le texte est blanc, et la colonne perdante juste à côté l'est aussi. ⚠️ Le blanc est le moins contrasté des deux sur ce rouge (4,17:1 contre 5,04:1 pour le noir) : il passe AA pour les tailles employées (« grand texte », seuil 3:1) mais pas le seuil 4,5:1 du texte courant — ~~à trancher à la passe contraste AA de la Story 10.7~~ **TRANCHÉ le 2026-09-14 par la Story 10.7 : le ruban est assombri à `#D0343F`, le blanc y tient 4,95:1 et passe même le seuil du texte courant. Le noir tombe à 4,24:1 — le blanc est désormais le plus contrasté des deux, et le choix de rendu n'a plus de contrepartie.**

**Acceptance Criteria:**

**Given** une partie terminée
**When** le récap s'affiche
**Then** il garde son format Billiboard (bandeau VS, trois colonnes, colonne du vainqueur en couleur victoire, `ÉGALITÉ` des deux côtés le cas échéant) dans un **conteneur à contour** sur le dégradé
**And** la `SideBar` porte `QUITTER` (porte, → accueil, ex-`FIN DE PARTIE`) et `RECOMMENCER` (flèche circulaire, → revanche immédiate, mêmes joueurs et distances, ex-`UNE PARTIE DE PLUS`) ; la barre basse et ses deux CTA disparaissent du récap

**Given** un nom de 20 caractères larges (ex. « WWWWWWWWWWWWWWWWWWWW »)
**When** le bandeau s'affiche
**Then** le nom et la distance sont deux éléments distincts : le nom se tronque seul (ellipse), la distance est **toujours** visible (DT6), dans les deux orientations

**Given** des billes changées au paramétrage (carte blanche à droite)
**When** le récap s'affiche
**Then** les côtés sont ceux du scoreboard : la colonne de gauche est le joueur affiché à gauche pendant la partie

**Given** le récap
**When** je tape n'importe où hors sidebar
**Then** rien ne se passe : le récap reste terminal, sans interaction dans le composant

**Given** la story livrée
**When** les tests tournent
**Then** `GameSummary.test.ts` et `GameView.test.ts` (état récap) sont adaptés ; le rendu est vérifié dans Chrome en paysage et en portrait, victoire à gauche, à droite et égalité

### Story 10.6: Renommage du produit en 1Score

As a club qui installe l'application,
I want voir « 1Score » partout où le produit se nomme — icône d'accueil, onglet, manifest, documentation,
So that le nom du produit est cohérent avant que l'interface premium ne s'affiche.

*Périmètre transverse, sans écran : à exécuter **en premier** dans l'epic (la sidebar de la 10.1 affiche le mot). Le PRD est déjà renommé.*

**Exigences :** AR27.

**Acceptance Criteria:**

**Given** le dépôt
**When** la story est livrée
**Then** `package.json` (`name`), le manifest PWA de `vite.config.ts` (`name: '1Score'`, `short_name: '1Score'`), `index.html` (`<title>`), `README.md` et `CLAUDE.md` (titre et mentions) portent « 1Score » ; plus aucune occurrence de « Carom Scoreboard » ne subsiste dans `1score/src`, les tests compris (l'`alt` du logo de `HomeScreen` est remplacé par le nouveau nom)

**Given** une tablette avec une partie sauvegardée
**When** l'application se met à jour
**Then** la sauvegarde est retrouvée : la clé `carom-scoreboard:game` de `localStorage` **n'est pas renommée** (décision assumée, sans migration)
*(Révisé le 2026-09-11 après la revue : clé renommée `1score:game`, sans migration — rien à préserver en dev.)*

**Given** une PWA déjà installée sous l'ancien nom
**When** elle se met à jour
**Then** aucun comportement ne casse ; le nom affiché sous l'icône ne changera qu'à la réinstallation — limite documentée dans `CLAUDE.md`, pas de contournement
*(Précisé le 2026-09-11 à la création de la story : vrai sur iPadOS ; sur Android, Chrome relit le manifest d'une PWA installée et met son nom à jour de lui-même dans les jours qui suivent un lancement, `id` inchangé — web.dev, « How Chrome handles updates to the web app manifest ». La limite documentée distingue les deux plateformes.)*

**Given** le déploiement
**When** la story est livrée
**Then** le dossier `carom-scoreboard/`, le dépôt Git, `netlify.toml` et le site Netlify ne sont **pas** renommés (aucun bénéfice utilisateur, risque sur le déploiement) ; `npm run build` et les tests passent
*(Révisé le 2026-09-11 après la revue : dossier renommé `1score/`, `netlify.toml` suit ; dépôt GitHub, dossier local et site Netlify à renommer plus tard.)*

### Story 10.7: Finition transverse — sémantique des pop-ups, `reduced-motion`, contraste et portrait

As a joueur, y compris avec une sensibilité aux animations ou une vision réduite,
I want que toutes les pop-ups, le dock et le bandeau clavier soient correctement annoncés, que rien n'anime si je l'ai désactivé, et que tout reste lisible en portrait,
So that l'interface premium est aussi propre sous le capot qu'à l'écran (NFR10, UX-DR22).

*Dernière story de l'epic : contrôle transverse une fois les cinq écrans refondus. Reprend DT3. Périmètre volontairement limité (décision de Nathan, 2026-09-11) : la dette par écran est portée par les Stories 10.3, 10.4 et 10.5.*

**Exigences :** UX-DR55, UX-DR56, DT3.

> **Livrée le 2026-09-14 (dev-story). Quatre décisions de Nathan, prises à la création de la story, PRIMENT sur les AC ci-dessous :**
>
> 1. **Aucune référence visuelle** (ni `billiboard_*` ni `cueuny_*`) : conformité chiffrée, pas création — un arbitrage de contraste se tranche au ratio, pas à la capture.
> 2. **Le ruban de victoire est assombri** : `--color-victory-ribbon` `#E63946` → **`#D0343F`**, ce qui porte le texte blanc de 4,17:1 à **4,95:1**. La dette ouverte par la 3e passe de rendu de la 10.5 est close **par la couleur**. ⚠️ Effet de bord assumé : la valeur devient identique à `--color-brand-red`, et les **deux tokens restent deux tokens** — design system des couleurs à écrire plus tard, hors Epic 10.
> 3. **Sous `prefers-reduced-motion: reduce`, DEUX animations survivent** : le fondu du chrono **et la barre de compte à rebours de l'auto-validation**. ⚠️ **Écart assumé à la lettre de l'AC ci-dessous**, qui n'exemptait que le chrono : le rebours dit que le score va se valider seul et changer le tour, information qu'aucun autre élément ne porte. Seuls le flash de frappe et la pulsation de refus de plafond sont coupés (retours de confort).
> 4. **Le contraste se mesure partout**, pas seulement sur les trois cibles nommées par l'AC : tous les textes translucides du produit, au seuil réel de leur taille rendue aux trois formats. **Exception : les états `BIENTÔT` à `opacity-45` sont exclus** — WCAG §1.4.3 exempte les commandes inactives, et l'atténuation *est* le signal.
>
> **Corrections d'AC constatées à la livraison :**
> - ⚠️ **Les pop-ups sont QUATRE, pas trois** : l'AC a été écrite avant que la Story 10.4 remplace `ScoreEntryModal` par `ScoreEntryDock`. Les quatre sont `PromptModal`, `NumericPadDock`, `AlphaKeyboardSheet` et `ScoreEntryDock`.
> - ⚠️ **L'AC « portrait (768×1024) et paysage (1024×768) » est CADUQUE** : le portrait est abandonné pour toute l'epic depuis le 2026-09-11 (déjà annoté au tableau des stories). La revue s'est faite aux **trois formats paysage** du projet — 1133×744, 1194×834, 1920×1080. Aucune variante `portrait:` n'a été écrite.
> - ⚠️ **Le token du bandeau jaune vaut `#E6CA00`, pas `#E6B000`** (écart de la spec, figé ici) : l'encre noire y donne **12,81:1**, très largement AA. Laissé tel quel.
> - ⚠️ **La mention « accroche et titres de tuiles sur leur fond à 85 % » est caduque** : plus aucune tuile n'est à 85 %, seules les tuiles `BIENTÔT` sont atténuées, à 45 % — et elles sont exemptées (décision 4).
> - ⚠️ **Les libellés de picto de la `SideBar` sont sur `--color-sidebar`, pas sur `--color-surface`** (18,61:1). Seul `IconAction` est sur `--color-surface` (16,12:1).
>
> **Trois échecs trouvés, trois corrigés** : ruban de victoire (4,17 → 4,95:1), barre de rebours `bg-white/70` → `bg-white` (2,45 → 3,46:1, objet graphique WCAG 1.4.11), placeholders de `PlayerSetupCard` `opacity-55` → `opacity-60` (4,20 → 4,98:1 sur la carte jaune — ⚠️ mesurés sur la BOX du champ `bg-black/8`, pas sur la carte nue). Un quatrième reste partiellement ouvert : l'accroche de `ModeTile`, passée de 2,78 à 3,46:1, toujours sous 4,5:1 à sa taille — **chemin affiché par aucune tuile**, consigné dans `deferred-work.md`.

**Acceptance Criteria:**

**Given** `PromptModal`, `NumericPadDock` (dock de distance et de série) et `AlphaKeyboardSheet`
**When** ils sont ouverts
**Then** chacun porte `role="dialog"`, `aria-modal="true"` et `aria-labelledby` vers son titre (ou `aria-label` quand il n'y a pas de titre visible), testé ; aucune gestion du focus clavier au-delà de ce qui est gratuit (arbitrage « borne fixe » inchangé)
**And** le voile plein écran garde ses handlers pointer **sans** `role="button"` : exception explicite à CLAUDE.md §2, consignée dans `CLAUDE.md`

**Given** `prefers-reduced-motion: reduce`
**When** une pop-up, le dock ou le bandeau s'ouvre ou se ferme
**Then** aucune animation ni transition ne joue (garde CSS globale sur les animations d'ouverture/fermeture et sur la pulsation de plafond) ; le fondu du chrono, qui porte une information, reste

**Given** la palette finale
**When** on mesure les contrastes
**Then** l'encre noire sur `--color-panel-yellow-band` (`#E6B000`), les libellés de picto sur `--color-surface` au-dessus du dégradé, l'accroche et les titres de tuiles sur leur fond à 85 % atteignent WCAG AA (4.5:1 texte courant, 3:1 texte ≥ 24 px gras) ; toute valeur en échec est corrigée dans les tokens, résultat consigné dans la story

**Given** les cinq écrans refondus
**When** on les passe en revue dans Chrome en portrait (768×1024) et en paysage (1024×768)
**Then** aucun débordement horizontal, aucune zone tactile < 90×90 px hors claviers, aucun libellé coupé ; les écarts relevés sont corrigés dans cette story s'ils tiennent en une retouche, sinon consignés dans `deferred-work.md`

**Given** `CLAUDE.md`
**When** la story est livrée
**Then** il décrit les nouveaux composants et conventions de l'epic (`SideBar` contextuelle nourrie par l'écran, `ModeTile`, `IconAction`, `NumericPadDock`/`AlphaKeyboardSheet` hôtes de la saisie, tokens de conteneur, jeu de pictos SVG inline) et retire les mentions de `PlayerSetupModal`, `ScoreEntryModal` et `ÉCHANGER`

**Note de périmètre :** pas d'ARIA au-delà des rôles de dialogue, pas de navigation clavier (hors scope V1). Le `focus-visible` sans chemin clavier (dette revue 1.4) reste tel quel.

