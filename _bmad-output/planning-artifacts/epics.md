---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
workflow_completed: true
completed_at: '2026-09-08'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# Carom Scoreboard - Epic Breakdown

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
`npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts`
Ceci doit être la toute première story d'implémentation, suivie immédiatement par la création de `CLAUDE.md`.

- AR1 : Initialiser le projet avec le starter Vue 3 + Vite PWA (`@vite-pwa/create-pwa`, template vue-ts) — première story d'implémentation.
- AR2 : Créer `CLAUDE.md` à la racine du projet comme deuxième story d'implémentation, avant tout code fonctionnel — documente les conventions AI-vibe-codable (nommage, patterns, structure).
- AR3 : Installer et configurer les dépendances complémentaires : Tailwind CSS v4 (+ `@tailwindcss/vite`), Pinia, Vue Router 4, Dexie.js, Vitest + Vue Test Utils + happy-dom.
- AR4 : Implémenter l'architecture de stockage double — `localStorage` pour l'état de partie courante (synchrone, < 50 Ko) via `storageService.ts` ; `Dexie.js`/IndexedDB pour l'historique 30 jours (async, quota-safe iOS Safari) via `databaseService.ts`.
- AR5 : Implémenter les types TypeScript stricts définis en architecture : `GameState`, `Player`, `Reprise`, `GameMode`, `GameStatus` (`types/game.ts`, Epic 1) et `GameRecord` (`types/history.ts`) — scaffoldé dès Epic 1 par anticipation architecturale (séquence d'implémentation : types avant services/stores), mais réellement utilisé à partir d'Epic 3 (historique).
- AR6 : Implémenter le routing Vue Router avec exactement 3 routes : `/` (GameView), `/history` (HistoryView), `/history/:id` (GameDetailView) ; les réglages V1 sont des modales inline sur GameView, sans route dédiée.
- AR7 : Implémenter les stores Pinia `useGameStore` (état de partie + persistance localStorage) et `useHistoryStore` (historique + Dexie.js), structure plate un store par domaine.
- AR8 : Utiliser exclusivement l'API Pointer Events (`@pointerdown`) sur tous les éléments tactiles interactifs — jamais `@touchstart` ni `@click` seul — pour éliminer le délai tactile 300ms sur iPad/Android ; appliquer le CSS global (`touch-action: manipulation`, `user-select: none`, `-webkit-tap-highlight-color: transparent`).
- AR9 : Utiliser `shallowRef` pour le tableau `reprises: Reprise[]` dans `useGameStore` afin d'éviter la réactivité profonde sur de longues sessions (NFR3 — 8h continu).
- AR10 : Configurer la stratégie de cache du Service Worker via vite-plugin-pwa : `cache-first` pour les assets JS/CSS, `StaleWhileRevalidate` pour le HTML.
- AR11 : Déployer sur Netlify avec auto-deploy GitHub sur push `main` — CI/CD zéro configuration, HTTPS + CDN mondial inclus.
- AR12 : Implémenter la gestion d'erreurs de toutes les opérations de stockage dans la couche service (`try/catch` + `console.error`) — jamais dans les composants (niveau de monitoring V1 ; Sentry/Plausible différés en V2+).
- AR13 : Implémenter le composable `useSpeech.ts` (Web Speech API) pour l'annonce vocale du score (FR42).
- AR14 : Implémenter le composable `useTimer.ts` pour le timer 3 Bandes, isolé du périmètre V1a (V1b uniquement).
- AR15 : Respecter les conventions de nommage obligatoires : composants Vue en PascalCase, stores/composables Pinia en camelCase préfixés `use`, services en camelCase suffixés `Service`, types TypeScript en PascalCase (sans préfixe `I`), emits Vue en kebab-case, actions Pinia en verbe+nom (`setPlayerName`, `addReprise`), exports nommés uniquement (jamais de default export pour composables/services).
- AR16 : Co-localiser tous les tests de composants (`Component.test.ts` à côté de `Component.vue`), pas de dossier `__tests__/`.
- AR17 : Imposer toute mutation de store exclusivement via des actions Pinia (jamais de mutation directe depuis un composant) et utiliser `storeToRefs()` pour toute propriété réactive du store consommée par un composant.
- AR18 : Utiliser `async/await` exclusivement pour toute logique asynchrone des stores Pinia — jamais `.then().catch()`.
- AR19 : Appliquer Tailwind CSS en mobile-first avec les 3 breakpoints définis (défaut < 768px, `md:` ≥ 768px, `lg:` ≥ 1280px).

### UX Design Requirements

- UX-DR1 : Implémenter la direction visuelle "Bloc Plein" — blocs pleine couleur par panneau joueur, chiffre de score géant comme unique élément dominant, console centrale minimale (uniquement mode + numéro de reprise).
- UX-DR2 : Implémenter la convention de bille fixe par côté, conforme au carambole et aux scoreboards coréens de référence : **joueur de gauche = bille blanche** (bloc blanc `#FFFFFF`, chiffres noirs), **joueur de droite = bille jaune** (bloc jaune plein `#FFC72C`, chiffres noirs). Un bouton d'interversion permet d'échanger les deux joueurs de côté avant la première reprise ; la bille reste attachée au côté, jamais au joueur. *(Révisé le 2026-09-08 : remplace la règle initiale d'attribution dynamique à 4 couleurs, qui ne correspondait ni au matériel réel ni aux références CUESCO/Billiboard.)*
- UX-DR3 : Réserver la couleur d'accent système (bleu `#1E88E5`) exclusivement aux actions neutres/système (+1, Valider) — jamais réutilisée comme couleur joueur, pour ne jamais confondre "marquer un point" et "action système".
- UX-DR4 : Implémenter la couleur d'alerte/urgence (rouge LED `#FF3B30` sur fond noir) pour l'affichage du chrono/décompte (périmètre V1b).
- UX-DR5 : Implémenter l'habillage victoire/récompense (or `#FFD54A` + ruban rouge `#E63946`) pour la médaille/mise en avant de l'écran de fin de partie.
- UX-DR6 : Implémenter le système typographique — sans-serif très grasse (800-900, ex. Barlow Condensed Black ou Rajdhani Bold) pour le chiffre de score géant ; sans-serif medium/bold (600-700, ex. Inter ou Manrope) pour les labels (nom joueur, AVG, HR, score restant) ; échelle fluide `clamp()` (score ~120-200px+, labels ~16-24px, stats secondaires ~14-18px).
- UX-DR7 : Appliquer une unité de base d'espacement de 8px ; les blocs joueur occupent quasiment 100% de leur colonne sans marge décorative — la densité vient de la taille des éléments, pas de leur nombre.
- UX-DR8 : Imposer une taille minimale de zone tactile de 90×90px sur tous les éléments interactifs (NFR9), plus stricte que le minimum WCAG 44×44px, pour l'accessibilité du public senior. **Exception unique, arbitrée le 2026-09-09 (Story 1.4) : les touches des claviers intégrés** (`AlphaKeyboard`, `NumericPad`). Aucun clavier alphabétique ne peut tenir 10 colonnes à 90px dans une pop-up — celui de l'iPad tourne autour de 65px. Plancher retenu : 44px pour les lettres, 60px pour les chiffres. La règle reste entière pour **toutes** les commandes de jeu, qui la respectent.
- UX-DR9 : Construire le composant `PlayerPanel` (×2, strictement symétrique) — chaque panneau autonome avec ses propres contrôles de saisie (pavé numérique, bouton +1 le cas échéant) ; aucune action affectant le score centralisée dans `CenterPanel`.
- UX-DR10 : Construire le composant `NumericPad` avec les états : vide, saisie active, valeur hors limites (> 999, refus de saisie avec retour haptique court distinct, sans bloquer l'écran par un message).
- UX-DR11 : Construire le composant `CenterPanel` limité au contexte neutre/partagé (mode de jeu, numéro de reprise, alerte d'inactivité) et aux actions **symétriques**, qui s'appliquent identiquement aux deux joueurs : annulation de la dernière série (ANNULER) et interversion des billes. Jamais une action qui favorise un joueur ni une saisie de score, qui restent portées par chaque `PlayerPanel`. *(Amendé en revue de la Story 1.3, 2026-09-08 : la console centrale façon Billiboard/CUESCO porte ANNULER et l'interversion — la symétrie exigée porte sur l'absence de biais entre joueurs, pas sur l'absence de toute action.)*
- UX-DR12 : Construire l'écran d'accueil `HomeScreen` — plein écran, fusionnant veille et sélection de mode, zones tactiles aussi grandes que le reste de l'interface, navigation à deux niveaux (catégorie → mode) sans fermeture accidentelle possible. *(Révisé le 2026-09-08 : remplace la modale `ModeSelector` initiale.)*
- UX-DR13 : Construire le composant `GameSummary` façon "battle" — bandeau VS, médaille winner/loser, stats comparées côte à côte, état de mise en avant explicite en cas de nouveau record personnel.
- UX-DR14 : Implémenter un indicateur de tour actif non-dépendant de la seule teinte (daltonisme) : le panneau du joueur qui doit jouer est encadré d'un liseré rouge épais (`--color-turn-active`, convention CUESCO/Billiboard). Le signal est la **présence du cadre**, perceptible indépendamment de la perception des couleurs et à distance.
- UX-DR15 : Implémenter la validation hybride du score — tap explicite sur "Valider" OU validation automatique après 3 secondes d'inactivité suivant la dernière frappe ; les deux chemins doivent aboutir au même état résultant.
- UX-DR16 : Implémenter la correction avec le même poids visuel que la validation — bouton Corriger/Annuler toujours visible avec la même prominence que le pavé de saisie, jamais dans un sous-menu, accessible pendant la saisie (efface la saisie en cours) et après validation (annule la dernière série validée).
- UX-DR17 : Implémenter le retour haptique + visuel sur chaque tap, < 100ms (NFR1) — retour de succès affiché directement sur le bloc joueur concerné (flash bref), pas de toast/notification textuelle.
- UX-DR18 : Implémenter l'alerte d'inactivité (FR43) comme une notification douce et non-intrusive dans `CenterPanel` — jamais en plein écran, jamais une interruption brutale de la partie en cours.
- UX-DR19 : Implémenter la saisie du nom du joueur par **pop-up et claviers intégrés** — tap sur la zone du joueur pour ouvrir sa modale (`PlayerSetupModal`), saisie exclusivement au clavier applicatif (`AlphaKeyboard`), majuscules automatiques, limite 20 caractères, application à la validation. *Réécrit le 2026-09-09 (Story 1.4) : la version antérieure imposait une édition **inline sans modale séparée**. L'écran cible étant une **borne fixe** (décision produit du 2026-09-09), aucun champ natif ne doit exister — c'est ce qui empêche structurellement le clavier du système de monter par-dessus l'interface. L'édition inline supposait un `<input>` natif, donc exactement ce que la décision proscrit.*
- UX-DR20 : Implémenter l'état vide de la liste d'historique au premier lancement — message simple + invitation explicite à jouer une première partie (jamais un écran vide non expliqué).
- UX-DR21 : Implémenter le layout responsive selon 3 breakpoints — signage/desktop ≥1280px et tablette 768-1279px : layout 3 colonnes paysage identique (tablette = cible primaire) ; smartphone <768px : layout empilé vertical (fallback).
- UX-DR22 : Assurer un contraste couleur WCAG AA (4.5:1 minimum) sur tous les blocs joueur et la console centrale, validé sur la palette finale (jaune/blanc/orange/rose sur fond sombre).
- UX-DR23 : Exposer toute action affectant le score comme une action Pinia nommée du store (ex. `addReprise()`, `undoLastSeries()`) jamais couplée exclusivement à un event handler tactile — contrainte architecturale pour la compatibilité future avec un pilotage à distance (V2+), s'applique à tout le travail UI lié au score en V1.
- UX-DR24 : Implémenter l'interaction tap-incrémental du mode 3 Bandes — le joueur assis (non-actif) tape sur sa propre zone pour ajouter un point à l'adversaire en train de jouer ; le pavé numérique reste disponible en backup pour saisir une série complète directement (périmètre V1b).

### FR Coverage Map

FR1: Epic 1 - Démarrer une partie (mode + noms joueurs)
FR2: Epic 1 - Saisir le score d'une série
FR3: Epic 1 - Calcul temps réel du score total
FR4: Epic 1 - Terminer une partie et récapitulatif automatique
FR5: Epic 3 - Nouvelle partie sans effacer l'historique
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
FR16: Epic 1 - Détection automatique de fin de set/match
FR17: Epic 1 - Affichage automatique des stats de fin de match
FR18: Epic 3 - Liste des parties jouées
FR19: Epic 3 - Détail complet d'une partie passée
FR20: Epic 3 - Rétention de l'historique 30 jours minimum
FR21: Epic 4 - Statistiques cumulées de carrière
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
FR36: Epic 5 - Synchronisation locale vers le cloud
FR37: Epic 5 - Gestion de l'abonnement club
FR38: Epic 9 - Export des résultats au format fédération
FR39: Epic 1 - Modifier les noms des joueurs en cours de partie
FR40: Epic 1 - Réinitialiser une partie en cours
FR41: Epic 1 - Configurer les paramètres d'une partie
FR42: Epic 1 - Activer/désactiver l'annonce vocale
FR43: Epic 1 - Détection et alerte d'inactivité
FR44: Epic 6 - Signalisation visuelle des moments clés
FR45: Epic 1 - Fonctionnement sans connexion réseau
FR46: Epic 1 - Installation comme application native

## Epic List

### Epic 1: Démarrer et Jouer une Partie JDS (V1a)
Un joueur démarre une partie en moins de 30 secondes sans formation, saisit et corrige ses scores en modes JDS (Libre, Cadre 47/2, 47/1, 71/2, 1 Bande, 4 Billes) sans friction ni risque de perte de données, et voit ses statistiques calculées automatiquement à la fin du match.
**FRs couverts :** FR1, FR2, FR3, FR4, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR15, FR16, FR17, FR39, FR40, FR41, FR42, FR43, FR45, FR46
**Notes d'implémentation :** Story 1.1 = initialisation du projet (starter `@vite-pwa/create-pwa`, template vue-ts — AR1). Story 1.2 = création de `CLAUDE.md` (AR2), avant tout code fonctionnel. Couvre les fondations architecturales transverses (types, stores Pinia, services storage, Pointer Events, conventions de nommage — AR3-AR19) et les patterns UX cœur (Bloc Plein, couleurs joueur dynamiques, validation hybride, correction à poids égal, feedback haptique, symétrie des panneaux — UX-DR1-3, UX-DR6-12, UX-DR14-19, UX-DR22-23). NFR1, NFR2, NFR3, NFR5, NFR6, NFR8, NFR9, NFR10, NFR12, NFR13 s'appliquent directement.

### Epic 2: Jouer en Mode 3 Bandes avec Chronométrage (V1b)
Un joueur peut jouer une partie complète en mode 3 Bandes, avec un chronomètre de série toujours actif, en saisissant son score point par point (tap incrémental par le joueur assis) ou en score global en fin de série.
**FRs couverts :** FR13, FR14
**Notes d'implémentation :** Isolé du périmètre V1a — ne bloque pas Epic 1. Composable `useTimer.ts` (AR14). Couleur d'alerte chrono (UX-DR4) et interaction tap-incrémental (UX-DR24). S'appuie sur le shell `PlayerPanel`/`CenterPanel` déjà livré par Epic 1, sans le modifier.

### Epic 3: Consulter l'Historique des Parties (V1a)
Un joueur retrouve et consulte le détail de ses parties passées jusqu'à 30 jours en arrière depuis le même appareil, sans jamais perdre l'historique en démarrant une nouvelle partie.
**FRs couverts :** FR5, FR18, FR19, FR20
**Notes d'implémentation :** Routes `/history` et `/history/:id` (AR6), `useHistoryStore` + `databaseService.ts` (Dexie.js/IndexedDB — AR4, AR7). État vide au premier lancement (UX-DR20). Couvre les parties jouées en modes JDS (Epic 1) et 3 Bandes (Epic 2). Story 3.5 referme la dépendance ouverte en Epic 1 / Story 1.10 : détection du "nouveau record personnel" (UX-DR13), repoussée ici car elle nécessite l'historique multi-parties livré par cet epic.

### Epic 4: Comptes Joueurs & Suivi de Carrière (V2/V3)
Un joueur peut créer un compte avec un identifiant court mémorisable, s'identifier sur n'importe quelle tablette de club, consulter ses statistiques cumulées de carrière et visualiser l'évolution de sa moyenne dans le temps.
**FRs couverts :** FR21, FR22, FR32, FR33
**Notes d'implémentation :** Modèle d'authentification différé (ID court + app compagnon — architecture V2+). RGPD applicable (NFR14, NFR15, NFR16). ⚠️ Cet epic implique une app compagnon (mobile ou web) distincte de la PWA tablette, à développer en parallèle — précédent marché confirmé par CUESCO/Billiboard (référence UX, cf. `ux-design-specification.md`) qui séparent déjà création de compte (app/en ligne) et identification rapide à la tablette.

### Epic 5: Administration de Club Multi-Tables (V2/V3)
Un admin club peut gérer les tables de son club, consulter les statistiques d'usage, synchroniser automatiquement les données locales vers le cloud, gérer son abonnement SaaS et activer un minuteur de facturation à la table pour la location horaire.
**FRs couverts :** FR31, FR34, FR35, FR36, FR37
**Notes d'implémentation :** Synchronisation offline→cloud garantissant zéro perte de données (NFR7). Hébergement EU + TLS 1.3 (NFR14, NFR15).

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

---

## Epic 1: Démarrer et Jouer une Partie JDS (V1a)

Un joueur démarre une partie en moins de 30 secondes sans formation, saisit et corrige ses scores en modes JDS (Libre, Cadre 47/2, 47/1, 71/2, 1 Bande, 4 Billes) sans friction ni risque de perte de données, et voit ses statistiques calculées automatiquement à la fin du match.

### Story 1.1: Initialisation du projet

As a développeur (assisté par IA),
I want le projet scaffoldé avec le starter Vue 3 + Vite PWA et les dépendances complémentaires installées,
So that chaque story suivante dispose d'une base fonctionnelle, buildable et installable.

**Acceptance Criteria:**

**Given** un environnement Node.js configuré
**When** j'exécute `npm create @vite-pwa/pwa@latest carom-scoreboard -- --template vue-ts`
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

**Note de périmètre :** le champ `targetScore` existe depuis la Story 1.3 sur `GameState`, câblé en dur à 20. Cette story le **déplace sur `Player`** (handicap), supprime toute valeur par défaut et le pilote depuis la pop-up. Elle ne fait que *stocker* et *afficher* la distance : la détection de fin relève de la Story 1.11.

**Note de périmètre — sets :** le **nombre de sets** est retiré du périmètre de cette story. C'est une notion propre au 3 Bandes, traitée dans l'**Epic 2** (voir Story 2.1). FR15 n'est donc couvert en V1a que sur son volet « objectif de score ».

**Note de révision (2026-09-08) :** les AC de pré-remplissage par mode (« l'objectif de score est pré-rempli avec la distance de référence du mode choisi, portée par le catalogue `GAME_CATEGORIES` ») et de « distance par défaut du mode » sont **supprimés** par décision produit de Nathan : aucun mode ne porte de distance de référence, et aucune donnée fédérale ne doit être inventée. Cette décision supersede l'AC ajouté par `sprint-change-proposal-2026-09-08.md` §4.2(b).

**Note de révision (2026-09-09) :** une première implémentation plaçait un bouton `FORMAT` dans la barre d'action, ouvrant une modale plein écran unique avec un mode « lié » et un bouton `HANDICAP` pour dissocier les distances. Elle a été **rejetée à la revue de rendu** et entièrement remplacée par l'UX ci-dessus : une pop-up par joueur, ouverte depuis sa zone, avec le nom saisi dedans et des claviers intégrés. Le composant `MatchFormatModal.vue` a été supprimé.

### Story 1.5: Saisir le score d'une série au pavé numérique

As a joueur,
I want saisir le score de ma série sur un pavé tactile,
So that j'enregistre mon résultat sans calcul mental ni ambiguïté sur la validation.

**Acceptance Criteria:**

**Given** une reprise en cours et mon `PlayerPanel` actif
**When** je tape des chiffres sur mon pavé numérique
**Then** chaque tap déclenche un retour haptique + visuel affiché directement sur le bloc joueur (flash bref, jamais de toast/notification textuelle), en moins de 100ms (NFR1, FR11, UX-DR17), et la valeur en cours s'affiche dans un overlay centré

**Given** une saisie dépassant 999 (FR7)
**When** je tape un 4e chiffre
**Then** le pavé refuse la saisie au-delà de 3 chiffres avec un retour haptique distinct (plus court/sec), sans bloquer l'écran par un message (UX-DR10)

**Given** une saisie en cours affichée
**When** je tape sur "Valider" OU que 3 secondes s'écoulent sans interaction
**Then** le score est validé, le total est mis à jour, et les deux chemins aboutissent au même état (UX-DR15, FR2, FR7)

**Given** le pavé numérique
**When** j'interagis avec ses boutons
**Then** tous les événements utilisent `@pointerdown` — aucun délai tactile de 300ms perceptible sur iPad et Android (AR8)

**Note de périmètre :** `NumericPad.vue` existe depuis la Story 1.4 (composant purement présentationnel, emits `digit`/`clear`/`backspace`, prop `hasInput` pilotant le seul libellé `AC`/`C`, sans état ni logique de score). Cette story le **branche** sur la saisie de série et lui ajoute le retour haptique, le retour distinct au plafond de 999 et la validation hybride — elle ne le crée pas. La Story 1.4 livre également `AlphaKeyboard.vue` (clavier AZERTY intégré) et `keyClasses.ts`, qui partage le style de touche entre les deux claviers.

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

**Given** un format configuré avec objectif de score (Story 1.4)
**When** le total d'un joueur est mis à jour
**Then** le score restant vers l'objectif est affiché à côté du score courant sur son `PlayerPanel`

### Story 1.7: Annuler la saisie en cours avant validation

As a joueur (Michel qui se trompe de touche),
I want effacer ma saisie en cours avant validation,
So that une erreur de frappe ne devient jamais un score faux.

**Acceptance Criteria:**

**Given** une saisie en cours dans l'overlay (avant validation)
**When** j'appuie sur "Corriger"
**Then** la saisie s'efface, je reviens à un état de saisie vide, sans impact sur le total (FR8)

**Given** le bouton "Corriger" affiché pendant une saisie
**When** je le compare visuellement au bouton "Valider"
**Then** il a le même poids visuel, jamais relégué à un sous-menu (UX-DR16)

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

**Note de périmètre (V1a) :** la mise en avant visuelle "nouveau record personnel" (UX-DR13) n'est **pas** couverte par cette story — Epic 1 seul n'a pas accès à l'historique multi-parties nécessaire pour détecter un record de façon fiable (cette donnée est gérée par Epic 3). La détection de record est traitée comme une évolution différée en Epic 3 / Story 3.5, une fois l'historique disponible. `GameSummary` doit néanmoins prévoir dès cette story l'état visuel "nouveau record" (UX-DR13) sans le déclencher automatiquement, pour qu'Epic 3 / Story 3.5 puisse l'activer sans modifier le composant.

### Story 1.11: Détecter automatiquement la fin d'un set ou d'un match

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

**Given** le score du joueur actif
**When** plusieurs points sont ajoutés au fil de la reprise
**Then** le total affiché reflète exactement le cumul des taps enregistrés pour cette reprise

### Story 2.3: Saisir un score global en fin de série (backup pavé numérique)

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

---

## Epic 3: Consulter l'Historique des Parties (V1a)

Un joueur retrouve et consulte le détail de ses parties passées jusqu'à 30 jours en arrière depuis le même appareil, sans jamais perdre l'historique en démarrant une nouvelle partie.

### Story 3.1: Sauvegarder automatiquement une partie terminée dans l'historique

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

### Story 3.2: Consulter la liste des parties jouées

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

## Epic 4: Comptes Joueurs & Suivi de Carrière (V2/V3)

Un joueur peut créer un compte avec un identifiant court mémorisable, s'identifier sur n'importe quelle tablette de club, consulter ses statistiques cumulées de carrière et visualiser l'évolution de sa moyenne dans le temps.

### Story 4.1: Créer un compte joueur avec un identifiant court mémorisable

As a joueur souhaitant suivre sa progression au-delà d'un seul appareil,
I want créer un compte avec un identifiant court et mémorisable,
So that je peux retrouver mon profil sur n'importe quelle tablette de club.

**Acceptance Criteria:**

**Given** l'app compagnon mobile (ou un parcours équivalent, V2+)
**When** je crée un compte
**Then** un identifiant court et mémorisable m'est attribué, sans mot de passe requis à la tablette de club (FR32, modèle coréen — architecture V2+)

**Given** un compte créé
**When** je consulte mon profil
**Then** il est associé de façon unique à mon identifiant, prêt à être utilisé pour m'identifier sur une tablette de club (Story 4.2)

### Story 4.2: S'identifier sur une tablette de club avec son identifiant

As a joueur enregistré,
I want saisir mon identifiant sur n'importe quelle tablette de club,
So that mon profil et mes statistiques me suivent sans dépendre d'un appareil précis.

**Acceptance Criteria:**

**Given** une tablette de club affichant l'écran de démarrage d'une partie
**When** je saisis mon identifiant court (Story 4.1)
**Then** mon profil est chargé instantanément, sans mot de passe (FR33)

**Given** un identifiant invalide ou inconnu
**When** je le saisis
**Then** un message clair m'indique que l'identifiant n'est pas reconnu, sans bloquer le parcours "invité"

**Given** un joueur qui préfère ne pas s'identifier
**When** il démarre une partie sans identifiant
**Then** il joue en mode invité, données locales uniquement (rôle "Invité" — architecture V2+)

### Story 4.3: Consulter mes statistiques cumulées de carrière

As a joueur enregistré,
I want consulter mes statistiques cumulées sur l'ensemble de ma carrière,
So that je vois ma progression globale, au-delà d'une seule partie ou d'un seul appareil.

**Acceptance Criteria:**

**Given** un joueur identifié (Story 4.2) ayant joué plusieurs parties, sur une ou plusieurs tablettes
**When** j'accède à mon profil
**Then** les statistiques cumulées (nombre de parties, moyenne globale, meilleure série toutes parties confondues) sont affichées (FR21)

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
