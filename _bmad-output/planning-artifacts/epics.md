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
- UX-DR13 : Construire le composant `GameSummary` façon "battle" — bandeau VS, médaille winner/loser, stats comparées côte à côte, état de mise en avant explicite en cas de nouveau record personnel. *Précisé le 2026-09-10 (Story 1.10) — **format Billiboard** : bandeau `NOM / distance` **VS** `NOM / distance` (mode de jeu en surtitre discret), deux colonnes joueur autour d'une colonne de libellés (`RÉSULTAT`, `POINTS`, `MOY`, `SÉRIE`, `REPRISES`), la **colonne du vainqueur mise en couleur** (ruban rouge) avec le mot `VICTOIRE` — c'est cette colonne colorée qui tient lieu de « médaille » —, et deux boutons en bas : `FIN DE PARTIE` et `UNE PARTIE DE PLUS`. L'état « nouveau record » existe par joueur, non déclenché avant la Story 3.5.*
- UX-DR14 : Implémenter un indicateur de tour actif non-dépendant de la seule teinte (daltonisme) : le panneau du joueur qui doit jouer est encadré d'un liseré rouge épais (`--color-turn-active`, convention CUESCO/Billiboard). Le signal est la **présence du cadre**, perceptible indépendamment de la perception des couleurs et à distance.
- UX-DR15 : Implémenter la validation hybride du score — tap explicite sur "Valider" OU validation automatique après 3 secondes d'inactivité suivant la dernière frappe ; les deux chemins doivent aboutir au même état résultant.
- UX-DR16 : Implémenter la correction avec le même poids visuel que la validation — bouton Corriger/Annuler toujours visible avec la même prominence que le pavé de saisie, jamais dans un sous-menu, accessible pendant la saisie (efface la saisie en cours) et après validation (annule la dernière série validée).
  - *Précision (Story 1.7, 2026-09-09)* : « pendant la saisie » est couvert par `C`, `⌫` et la croix de `ScoreEntryModal` (jugé suffisant, pas de bouton `CORRIGER` distinct) ; « après validation » est le bouton `ANNULER` de la console centrale, qui remonte d'**une action** à chaque appui — séries validées, mains rendues sans marquer, corrections `−`/`+` — jamais l'échange de côtés (`ÉCHANGER` est son propre inverse).
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
FR16: Epic 1 - Détection automatique de fin de set/match *(fin de **match** sur distance atteinte livrée en Story 1.10, règle de la reprise égalisatrice comprise — 2026-09-10 ; la fin de **set** reste hors V1a, Epic 2)*
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
FR43: Epic 1 - Détection et alerte d'inactivité *(story 1.17 **annulée** le 2026-09-10 : une série de JDS peut durer plus d'une heure, l'inactivité de partie n'est pas un signal ; la veille de la tablette, hors partie, est un sujet d'accueil)*
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
1. **Rentrer sa série, c'est rendre la main.** Dans les modes qui passent par le pavé (JDS), valider une série bascule le joueur actif — par le bouton comme par l'auto-validation à 3 s, qui devient donc aussi le *fallback* de bascule. Rendre la main **sans marquer** se fait au tap sur la zone de l'adversaire, ce qui enregistre une série de 0. En 3 Bandes, où la série ne passe pas par un pavé, la bascule reste un geste explicite — **les AC de l'Epic 2 ne la décrivent pas encore** et ne distinguent pas le geste « créditer +1 » du geste « rendre la main », qui visent la même zone (à préciser avant la Story 2.2).
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

**✅ Recadrage de Nathan (2026-09-09) — story livrée sous ce titre, mais avec un autre sujet.** Le bouton `CORRIGER` en pop-up est **sans objet** : `C`, `⌫` et la croix couvrent FR8, il n'apporterait rien. La story livre à la place le bouton **`ANNULER` de la console centrale** (présent depuis la 1.3, événement `undo` jusque-là sans écouteur) : à chaque appui, la partie **revient d'une action en arrière** — un *undo* multi-niveaux jusqu'au début de la partie, grisé à pile vide. Une action = une **série validée** (`VALIDER` ou auto-validation), une **main rendue sans marquer**, ou une **correction `−`/`+`** (un appui = une action). **`ÉCHANGER` n'est pas annulable** : on rappuie dessus pour revenir, et une annulation postérieure à un échange ne le défait jamais par effet de bord (les joueurs restent où ils sont, la main revient au joueur concerné là où il se trouve). Exposé comme action Pinia `undoLastAction()` + `canUndo`. Au passage : les pictos `↩`/`⇄` sont retirés d'`ANNULER`/`ÉCHANGER` (un mot, pas de glyphe), et `REPRISE` devient **`REP`**. La Story 1.8 est absorbée (voir ci-dessous).

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

Au passage, la story **fixe le format persisté** : `GameState` = `+ scoreAdjustments, sidesSwapped, history, endPrompt, entryOpen`, `− isNegative`. Clé `carom-scoreboard:game`, enveloppe versionnée (version inconnue ou forme inattendue → jetée avec `console.warn`, pas de migration). Écriture par `watch` du store, une par action, jamais en `idle` (`resetGame` supprime l'entrée).

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

**À traiter ici (note du 2026-09-10, Story 1.15) :** une partie **recommencée** (picto RECOMMENCER, `restartGame()`) n'a **jamais** été `finished` et n'entre pas dans l'historique — « recommencer » n'est pas « terminer ». Le « quitter sans récap » (abandon d'une partie sans la clore) reste à définir dans cette story : abandon = partie non sauvegardée ? défaite ? Aujourd'hui, une partie qui a au moins une action annulable ne se quitte que par le récap (`FIN DE PARTIE`), qui écrira donc une ligne d'historique — mais deux sorties **sans récap** existent déjà et sont à couvrir dans la définition de l'abandon : le picto de sortie sur un scoreboard intact (`canUndo` faux → accueil direct, 1.10) et « PARTIE EN COURS » › `ANNULER` au lancement, qui jette une sauvegarde pouvant contenir des séries (1.12). *(Précision de la revue de code 1.15, 2026-09-10.)*

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
