---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
---

# Implementation Readiness Assessment Report

**Date:** 2026-09-08
**Project:** explore

## Document Inventory

### PRD
**Whole Documents:**
- `prd.md` (25 172 octets, modifié le 19 mai 2026)

### Architecture
**Whole Documents:**
- `architecture.md` (22 973 octets, modifié le 20 mai 2026)

### Epics & Stories
**Whole Documents:**
- `epics.md` (64 319 octets, modifié le 8 septembre 2026)

### UX Design
**Whole Documents:**
- `ux-design-specification.md` (31 969 octets, modifié le 8 septembre 2026)
- `ux-design-directions.html` (16 965 octets, modifié le 7 septembre 2026)

## Issues Found

- Aucun doublon whole/sharded détecté pour aucun type de document.
- Deux fichiers UX présents : `ux-design-specification.md` (spécification finale probable) et `ux-design-directions.html` (exploration de directions visuelles, format HTML, antérieur d'un jour). Documents à usage différent, pas un conflit de doublon au sens strict — à confirmer avec l'utilisateur lequel sert de référence pour l'évaluation.
- Aucun document manquant : PRD, Architecture, Epics, UX sont tous présents.

## Documents retenus pour l'évaluation

- PRD : `prd.md`
- Architecture : `architecture.md`
- Epics & Stories : `epics.md`
- UX : `ux-design-specification.md` (document de référence) — `ux-design-directions.html` traité comme document d'appui/exploration

## PRD Analysis

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
- FR12 : Un joueur peut sélectionner un mode JDS — Libre, Cadre ou Bande — avec reprises, séries entières, calcul de moyenne et meilleure série
- FR13 : Un joueur peut sélectionner le mode 3 Bandes avec timer de série actif en permanence (V1b)
- FR14 : En mode 3 Bandes, un joueur peut incrémenter son score point par point ou saisir le score global en fin de série (V1b)
- FR15 : Un joueur peut configurer le format du match avant le début d'une partie (objectif de score, nombre de sets)
- FR16 : Le système détecte et signale automatiquement la fin d'un set ou d'un match selon le format configuré

**4. Statistiques & Historique**
- FR17 : Le système affiche automatiquement en fin de match : score total, moyenne par reprise, meilleure série
- FR18 : Un joueur peut consulter la liste des parties jouées sur l'appareil
- FR19 : Un joueur peut consulter le détail complet d'une partie passée (reprises, séries, statistiques)
- FR20 : L'application conserve l'historique des parties pendant au minimum 30 jours
- FR21 : Un joueur enregistré peut consulter ses statistiques cumulées sur l'ensemble de sa carrière (V2+)
- FR22 : Un joueur enregistré peut visualiser l'évolution de sa moyenne au fil du temps (V2+)

**5. Présentation & Diffusion (V2+)**
- FR23 : Un utilisateur peut activer un affichage grand format optimisé pour lecture depuis l'autre bout de la salle
- FR24 : Un streameur peut générer une URL d'overlay fond transparent compatible OBS/Streamlabs
- FR25 : L'overlay stream se met à jour en temps réel sans intervention de l'opérateur
- FR26 : Un organisateur peut diffuser les scores en cours sur un écran TV connecté au réseau local

**6. Compétition & Arbitrage (V2+)**
- FR27 : Un arbitre peut contrôler le scoreboard (validation, correction, pause timer) depuis une interface déportée sans toucher la tablette
- FR28 : Un organisateur peut créer un tournoi, assigner des matchs aux tables disponibles et suivre la progression en temps réel
- FR29 : Le système affiche un tableau de bord centralisé de toutes les tables actives d'une compétition
- FR30 : Le système gère la progression d'un tournoi (classements, disponibilité des tables)
- FR31 : Un admin club peut activer un minuteur de facturation à la table pour les clubs proposant la location horaire (V2+, optionnel)

**7. Gestion des Joueurs & Clubs (V2+)**
- FR32 : Un joueur peut créer un compte avec un identifiant court mémorisable
- FR33 : Un joueur peut s'identifier sur n'importe quelle tablette de club en saisissant son identifiant
- FR34 : Un admin club peut gérer les tables de son club (configuration, activation, désactivation)
- FR35 : Un admin club peut consulter les statistiques d'usage de son club
- FR36 : Le système synchronise automatiquement les données locales vers le cloud dès qu'une connexion réseau est disponible
- FR37 : Un admin club peut gérer son abonnement (palier, facturation)
- FR38 : Le système exporte les résultats dans un format compatible avec les systèmes fédéraux (V3)

**8. Administration & Configuration**
- FR39 : Un utilisateur peut modifier les noms des joueurs en cours de partie
- FR40 : Un utilisateur peut réinitialiser une partie en cours et en démarrer une nouvelle
- FR41 : Un utilisateur peut configurer les paramètres d'une partie (format sets, objectif de score, pattes Casin)
- FR42 : Un utilisateur peut activer ou désactiver l'annonce vocale du score après chaque série validée
- FR43 : Le système détecte l'absence de saisie prolongée et alerte l'utilisateur si une partie reste ouverte sans activité
- FR44 : Le système signale visuellement les moments clés d'une partie (record personnel dépassé, match point) (V2+)
- FR45 : L'application fonctionne sans connexion réseau
- FR46 : L'application peut être installée comme application native sur tablette (démarrage sans navigateur)

**Total FRs : 46**

### Non-Functional Requirements

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
- NFR10 : Scores et statistiques lisibles à 2 mètres — polices fluides clamp(), contraste WCAG AA minimum
- NFR11 : Vue salle lisible à 5 mètres sur écran 40" ou supérieur
- NFR12 : Démarrer une partie ne requiert aucune lecture de texte explicatif — actions compréhensibles par pictogramme et position

**Sécurité & Conformité**
- NFR13 : En V1, aucune donnée transmise à un serveur externe — tout reste sur l'appareil
- NFR14 : En V2+, communications client-serveur chiffrées en TLS 1.3 minimum
- NFR15 : En V2+, données personnelles hébergées dans l'Union Européenne — conformité RGPD
- NFR16 : En V2+, suppression complète des données d'un joueur accessible en < 3 actions

**Total NFRs : 16**

### Additional Requirements

- **Identité Visuelle** : non prescrite dans le PRD — définie séparément par Nathan comme artefact de design, à intégrer comme contrainte à l'étape UX (section « Identité Visuelle » du PRD, pas de NFR numéroté).
- **Contraintes techniques domaine** :
  - Offline-first : V1 100 % offline (localStorage) ; V2+ sync différée offline→cloud, zéro perte
  - RGPD dès V2 (consentement explicite, droit à suppression, hébergement EU)
  - Intégration fédération : format d'import inconnu — export générique JSON/CSV adaptable prévu en V3
- **Règles de jeu en attente de validation** : 5 Quilles (mécanique complète inconnue) et Casin (règles partielles, à valider avec la fédération) — explicitement hors scope V1
- **Contraintes de scope/roadmap** :
  - V1a : JDS (Libre/Cadre/Bande) uniquement — 3 Bandes, timer, comptes cloud, vue TV, overlay stream hors scope
  - V1b : ajoute uniquement le mode 3 Bandes (timer obligatoire) + pause/reprise timer
  - V2/V3 : backend cloud, profils joueurs, layout live/overlay, interface arbitre, caméra/vidéo, dashboard tournoi, facturation table, SaaS abonnement, export fédération, 5 Quilles/Casin complet
  - V4 : app mobile joueur, contrat fédéral officiel, classement national
- **Critères de succès explicites** (utilisateur/business/technique) définis en section dédiée, à utiliser pour vérifier que les epics couvrent bien ces cibles mesurables (ex. < 30 s démarrage partie, > 80 % complétion parties, 5 clubs payants à 6 mois).

### PRD Completeness Assessment

Le PRD est structuré, complet dans sa forme (résumé exécutif, critères de succès, roadmap V1a→V4, 6 parcours utilisateurs détaillés, exigences domaine, exigences techniques par type de projet, 46 FR et 16 NFR numérotées). Les FR/NFR sont clairement étiquetées avec leur version cible (V1a/V1b/V2+/V3) ce qui facilite le traçage vers les epics. Points de vigilance identifiés pour la suite de l'évaluation :
- Les règles complètes des modes 5 Quilles et Casin restent "à définir" — c'est assumé et documenté comme hors-scope V1, cohérent avec la mitigation des risques.
- Aucune exigence numérotée ne couvre explicitement l'identité visuelle/design system — normal puisque délégué à l'étape UX, mais à vérifier que le document UX comble ce vide.
- Le champ "Stack" et "Hébergement" sont explicitement renvoyés à la phase architecture — à vérifier que `architecture.md` tranche bien ces points.

## Epic Coverage Validation

### Epic FR Coverage Extracted (depuis `epics.md`, section "FR Coverage Map")

Le document epics.md contient une carte de couverture explicite (FR1→FR46) assignant chaque FR à un epic unique, cohérente avec les sections "FRs couverts" de chacun des 9 epics :

- Epic 1 (Démarrer et Jouer une Partie JDS, V1a) : FR1, FR2, FR3, FR4, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR15, FR16, FR17, FR39, FR40, FR41, FR42, FR43, FR45, FR46 (21 FRs)
- Epic 2 (Mode 3 Bandes, V1b) : FR13, FR14 (2 FRs)
- Epic 3 (Historique, V1a) : FR5, FR18, FR19, FR20 (4 FRs)
- Epic 4 (Comptes Joueurs & Carrière, V2/V3) : FR21, FR22, FR32, FR33 (4 FRs)
- Epic 5 (Administration Club, V2/V3) : FR31, FR34, FR35, FR36, FR37 (5 FRs)
- Epic 6 (Diffusion & Overlay Stream, V2/V3) : FR23, FR24, FR25, FR26, FR44 (5 FRs)
- Epic 7 (Arbitrage Déporté, V2/V3) : FR27 (1 FR)
- Epic 8 (Gestion de Tournoi, V2/V3) : FR28, FR29, FR30 (3 FRs)
- Epic 9 (Export Fédéral, V3) : FR38 (1 FR)

**Total FRs en epics : 46** (21+2+4+4+5+5+1+3+1 = 46), chaque FR assigné à un seul epic (pas de duplication).

### FR Coverage Analysis

| FR | Epic | Story | Statut |
|---|---|---|---|
| FR1 | Epic 1 | 1.3 | ✓ Couvert |
| FR2 | Epic 1 | 1.5 | ✓ Couvert |
| FR3 | Epic 1 | 1.6 | ✓ Couvert |
| FR4 | Epic 1 | 1.10 | ✓ Couvert |
| FR5 | Epic 3 | 3.1 | ✓ Couvert |
| FR6 | Epic 1 | 1.12 | ✓ Couvert |
| FR7 | Epic 1 | 1.5 | ✓ Couvert |
| FR8 | Epic 1 | 1.7 | ✓ Couvert |
| FR9 | Epic 1 | 1.8 | ✓ Couvert |
| FR10 | Epic 1 | 1.9 | ✓ Couvert |
| FR11 | Epic 1 | 1.5 | ✓ Couvert |
| FR12 | Epic 1 | 1.3 | ✓ Couvert |
| FR13 | Epic 2 | 2.1 | ✓ Couvert |
| FR14 | Epic 2 | 2.2, 2.3 | ✓ Couvert |
| FR15 | Epic 1 | 1.4 | ✓ Couvert |
| FR16 | Epic 1 | 1.11 | ✓ Couvert |
| FR17 | Epic 1 | 1.10 | ✓ Couvert |
| FR18 | Epic 3 | 3.2 | ✓ Couvert |
| FR19 | Epic 3 | 3.3 | ✓ Couvert |
| FR20 | Epic 3 | 3.4 | ✓ Couvert |
| FR21 | Epic 4 | 4.3 | ✓ Couvert |
| FR22 | Epic 4 | 4.4 | ✓ Couvert |
| FR23 | Epic 6 | 6.1 | ✓ Couvert |
| FR24 | Epic 6 | 6.3 | ✓ Couvert |
| FR25 | Epic 6 | 6.3 | ✓ Couvert |
| FR26 | Epic 6 | 6.2 | ✓ Couvert |
| FR27 | Epic 7 | 7.1, 7.2, 7.3 | ✓ Couvert |
| FR28 | Epic 8 | 8.1 | ✓ Couvert |
| FR29 | Epic 8 | 8.2 | ✓ Couvert |
| FR30 | Epic 8 | 8.3 | ✓ Couvert |
| FR31 | Epic 5 | 5.5 | ✓ Couvert |
| FR32 | Epic 4 | 4.1 | ✓ Couvert |
| FR33 | Epic 4 | 4.2 | ✓ Couvert |
| FR34 | Epic 5 | 5.1 | ✓ Couvert |
| FR35 | Epic 5 | 5.3 | ✓ Couvert |
| FR36 | Epic 5 | 5.2 | ✓ Couvert |
| FR37 | Epic 5 | 5.4 | ✓ Couvert |
| FR38 | Epic 9 | 9.1 | ✓ Couvert |
| FR39 | Epic 1 | 1.14 | ✓ Couvert |
| FR40 | Epic 1 | 1.15 | ✓ Couvert |
| FR41 | Epic 1 | 1.4 | ✓ Couvert |
| FR42 | Epic 1 | 1.16 | ✓ Couvert |
| FR43 | Epic 1 | 1.17 | ✓ Couvert |
| FR44 | Epic 6 | 6.4 | ✓ Couvert |
| FR45 | Epic 1 | 1.13 | ✓ Couvert |
| FR46 | Epic 1 | 1.13 | ✓ Couvert |

Vérification croisée effectuée : chaque FR listé dans la "FR Coverage Map" d'epics.md est également référencé explicitement dans les critères d'acceptation d'au moins une story de l'epic assigné (spot-check systématique sur les 46 FR, aucune divergence trouvée entre la carte de couverture et le contenu réel des stories).

### Missing Requirements

Aucune. Les 46 FR du PRD sont couverts sans exception, sans duplication d'assignation entre epics.

### Coverage Statistics

- Total PRD FRs : 46
- FRs couverts dans les epics : 46
- Pourcentage de couverture : **100 %**

**Note complémentaire — NFR et exigences additionnelles :** Les 16 NFR et les exigences additionnelles (AR1-AR19, UX-DR1-DR24) du PRD/architecture/UX sont également repris intégralement dans la section "Requirements Inventory" d'epics.md et référencés nommément dans les critères d'acceptation des stories concernées (ex. NFR1/NFR9/UX-DR17 → Story 1.5 ; NFR7/NFR14/NFR15 → Story 5.2 ; AR1 → Story 1.1). Ce niveau de traçabilité dépasse le strict périmètre FR demandé par cette étape et sera reconfirmé à l'étape d'alignement UX et à l'étape d'alignement architecture.

## UX Alignment Assessment

### UX Document Status

**Found.** `ux-design-specification.md` (14 étapes complétées, workflow terminé le 8 septembre 2026) + `ux-design-directions.html` (5 pistes visuelles explorées, référencées explicitement depuis la spec comme mockups d'appui pour la direction retenue "Bloc Plein").

### A. Alignement UX ↔ PRD

- Personas et parcours cohérents : Michel (joueur, parcours 1-2 PRD) et Didier (admin club, parcours 3 PRD) sont repris nommément comme cibles UX V1 ; les personas V2/V3 (Karim arbitre, Sophie organisatrice, Lucas streameur) sont explicitement déclarés hors scope de cette session UX, cohérent avec le séquencement roadmap du PRD (V1a/V1b d'abord).
- Les défis UX identifiés (anxiété de la correction, lisibilité à distance, couleur dynamique par joueur) tracent directement vers NFR9-NFR12 et FR8/FR9 du PRD — aucune divergence.
- Palette couleur, typographie, espacement 8px, zones tactiles 90×90px de la spec UX sont bit-à-bit identiques aux UX-DR1-DR8 déjà repris dans epics.md — cohérence confirmée sur toute la chaîne PRD → UX → Epics.
- Contrainte de compatibilité future "pilotage à distance" (actions Pinia nommées, jamais couplées uniquement au geste tactile) tracée correctement jusqu'à Epic 7 (Arbitrage Déporté, FR27, UX-DR23) — bon exemple de traçabilité longue distance V1→V2+.
- **Point d'attention (non bloquant) :** la spec UX indique explicitement que la palette/typographie documentées sont une "première passe... approximative", et que Nathan formalisera le système définitif plus tard à partir des captures d'écran coréennes (`explore/resources/`). Le PRD délègue bien l'identité visuelle à l'étape UX, mais cette délégation n'est donc pas totalement clôturée — les tokens visuels restent susceptibles de changer après le début de l'implémentation.

### B. Alignement UX ↔ Architecture

- Le choix "Design System Custom" (Tailwind + composants Vue, sans librairie établie) et la liste des composants (`PlayerPanel`, `NumericPad`, `CenterPanel`, `ModeSelector`, `GameSummary`, `HistoryList`, `GameDetailView`) correspondent exactement à la section "Composants principaux V1a" et à l'arborescence `src/components/` de `architecture.md`.
- Les 3 routes, les 3 breakpoints responsive, l'usage de Pointer Events et `storeToRefs()` sont repris sans modification depuis l'architecture — aucune contradiction.
- **Écart identifié :** le tableau "Mapping Exigences → Fichiers" de `architecture.md` (section Structure du Projet, et sa reprise dans "Couverture des Exigences") assigne FR39-FR43 uniquement à `ModeSelector.vue` et `PlayerPanel.vue`. Or FR43 (alerte d'inactivité) est explicitement localisée dans `CenterPanel.vue` par la spec UX (UX-DR18 : "notification douce et non-intrusive dans le CenterPanel") et par epics.md (Story 1.17). `CenterPanel.vue` est absent de ce mapping alors qu'il porte une exigence FR réelle — incohérence mineure de documentation entre architecture.md et UX/epics (déjà correctement résolue dans epics.md, donc sans impact sur l'implémentation, mais `architecture.md` mériterait une correction pour rester une source de vérité fiable).
- **Incohérence interne mineure à `architecture.md` :** la première section ("Structure de Fichiers AI-Vibe-Codable", en tête de document) nomme les fichiers de service `storage.ts` et `database.ts`, tandis que la section faisant autorité plus loin ("Structure du Projet & Frontières Architecturales") les renomme `storageService.ts` / `databaseService.ts`, conformément à la convention de nommage (`AR15`/table de nommage — suffixe `Service` obligatoire). epics.md et les ARs utilisent déjà systématiquement la forme correcte suffixée — aucun risque d'implémentation, mais document à nettoyer pour éviter toute confusion future.
- **Couverture partielle du tableau d'auto-validation architecture :** la section "Résultats de Validation → Couverture des Exigences" de `architecture.md` ne valide explicitement que 6 catégories de FR (FR1-6, FR7-11, FR12-16, FR17-20, FR39-43, FR45-46) et 4 NFR (NFR1, NFR2, NFR5, NFR13) sur les 46 FR / 16 NFR du PRD — les FR21-38 (V2/V3) et la majorité des NFR (NFR3, NFR4, NFR6-12, NFR14-16) n'y figurent pas explicitement. Ceci reste cohérent avec le fait que l'architecture V1 documentée se concentre sur le périmètre V1a/V1b ; epics.md comble ce vide en re-citant ces NFR directement dans les stories concernées (ex. NFR3 → Story 3.4, NFR4 → Story 6.2/8.2, NFR14/NFR15 → Story 5.2). Aucun blocage, mais `architecture.md` seul ne suffit pas comme preuve de couverture complète — la vérification doit passer par epics.md.

### Warnings

- ⚠️ Identité visuelle (couleurs/typographie) marquée "première passe approximative" dans la spec UX — à reconfirmer par Nathan avant que les tokens ne soient considérés figés en production ; sans impact bloquant car l'architecture (Tailwind config/CSS variables, Story 1.1) rend ces tokens facilement modifiables.
- ⚠️ Aucune spec UX dédiée n'existe pour les epics V2/V3/V4 (Epic 4 à 9) — leurs critères d'acceptation UX (dashboard, overlay, interface arbitre) sont rédigés directement dans epics.md sans validation utilisateur/UX amont équivalente à celle faite pour le V1a. Non bloquant pour le lancement V1, mais à anticiper avant le développement de ces epics.
- ~~⚠️ `architecture.md` contient deux écarts de documentation mineurs (mapping FR39-43 incomplet sans `CenterPanel.vue` ; nommage `storage.ts`/`database.ts` vs `storageService.ts`/`databaseService.ts`)~~ — **✅ CORRIGÉ (2026-09-08)** : `CenterPanel.vue` ajouté au mapping FR39-FR43 (2 occurrences) ; nommage unifié vers `storageService.ts`/`databaseService.ts` sur les 3 occurrences restantes du document.

## Epic Quality Review

Revue rigoureuse des 9 epics et de leurs 39 stories contre les standards create-epics-and-stories (valeur utilisateur, indépendance, dépendances, sizing, timing de création des entités).

### A. Valeur Utilisateur — Titres et Objectifs d'Epic

Les 9 titres d'epic sont tous centrés utilisateur ("Démarrer et Jouer une Partie JDS", "Consulter l'Historique", "Administration de Club Multi-Tables", etc.) — aucun n'est un jalon technique déguisé en epic ("Setup Database", "API Development"). ✅ Conforme sur les 9 epics.

**Exception documentée et acceptée :** Epic 1 / Story 1.1 (init projet) et Story 1.2 (rédaction `CLAUDE.md`) sont des stories techniques sans valeur utilisateur directe — mais c'est le pattern explicitement attendu et validé par le standard lui-même quand l'architecture spécifie un starter template (le standard exige justement que Story 1 = "Set up initial project from starter template"). ✅ Pas une violation.

### B. Indépendance des Epics

Vérification systématique : chaque epic ne doit dépendre que d'epics précédents dans l'ordre du document, jamais d'un epic futur.

| Epic | Dépend de (déclaré) | Sens de la dépendance | Statut |
|---|---|---|---|
| Epic 1 | Aucun (fondation) | — | ✅ sauf exception ci-dessous |
| Epic 2 | Epic 1 (shell PlayerPanel/CenterPanel) | Arrière | ✅ |
| Epic 3 | Epic 1 & Epic 2 (parties jouées) | Arrière | ✅ |
| Epic 4 | Architecture V2+ (auth différée), aucun epic V1 | — | ✅ |
| Epic 5 | Architecture V2+ (cloud) | — | ✅ |
| Epic 6 | Architecture multi-vues V1 (pas un epic) | — | ✅ |
| Epic 7 | Epic 2 (Story 7.3 pause chrono 3 Bandes) | Arrière | ✅ |
| Epic 8 | Epic 4 & Epic 6 ("s'appuie sur... sans en dépendre strictement") | Arrière | ✅ (formulation ambiguë, cf. Minor) |
| Epic 9 | Epic 3 & Epic 5 (données historique/cloud) | Arrière | ✅ |

**🔴 Violation critique identifiée — Epic 1, Story 1.10 dépend en réalité d'Epic 3 (dépendance avant, non déclarée) :**

Story 1.10 ("Terminer une partie et consulter le récapitulatif automatique") a pour critère d'acceptation : *"Given qu'un joueur a dépassé son record personnel connu localement / When le récapitulatif s'affiche / Then une mise en avant visuelle spécifique signale le nouveau record"* (UX-DR13, reprise de la spec UX : "état de mise en avant explicite en cas de nouveau record personnel").

Détecter un "record personnel connu localement" nécessite de comparer la partie en cours à l'historique des parties précédentes — or cette donnée n'existe que via `useHistoryStore`/`databaseService.ts` (Dexie/IndexedDB), qui est livré par **Epic 3** (Story 3.1), documenté et séquencé *après* Epic 1. Aucun champ "meilleure moyenne connue" n'existe dans `GameState` (localStorage, architecture.md) qui permettrait de faire ce calcul sans interroger l'historique.

- **Impact :** Epic 1 ne peut pas être considéré comme livrable de façon autonome et complète (règle : "Epic 1 must stand alone completely") — un des critères d'acceptation de sa dernière story dépend fonctionnellement d'un epic qui le suit dans le document.
- **Différence avec les autres dépendances arrière du tableau ci-dessus :** toutes les autres dépendances inter-epics sont explicitement documentées dans les "Notes d'implémentation" de l'epic dépendant (ex. Epic 3 cite Epic 1/2, Epic 9 cite Epic 3/5). Epic 1 ne mentionne nulle part sa dépendance vers Epic 3 dans ses notes.
- **Recommandation :** deux options — (a) documenter explicitement cette dépendance dans les notes d'Epic 1 et s'assurer qu'Epic 3 (au moins Story 3.1) est implémentée avant que Story 1.10 ne soit considérée "terminée", ou (b) réduire le périmètre V1a de Story 1.10 à une détection de record limitée à la session en cours (sans historique), en repoussant la détection de record cross-parties à Epic 3/4 une fois l'historique disponible.
- **✅ CORRIGÉ (2026-09-08) — option (b) retenue par Nathan.** Story 1.10 ne couvre plus la détection de "nouveau record personnel" (AC retirée, remplacée par une note de périmètre explicite : `GameSummary` doit prévoir l'état visuel "nouveau record" sans le déclencher). Une nouvelle **Story 3.5 : Détecter et signaler un nouveau record personnel en fin de partie** a été ajoutée à Epic 3 — elle referme la dépendance en comparant les `GameRecord` de l'historique une fois celui-ci disponible (Story 3.1), et active l'état visuel préparé par Epic 1. Epic 1 est désormais livrable et testable de façon totalement autonome.

### C. Qualité des Stories & Critères d'Acceptation

- **Format Given/When/Then :** respecté sur l'intégralité des 39 stories, sans exception. ✅
- **Spécificité et testabilité :** critères systématiquement chiffrés (< 100 ms, > 999, 30 secondes, 3 secondes, < 500 ms, 20 caractères, 90×90 px) plutôt que vagues. ✅ Aucune AC du type "l'utilisateur peut se connecter" sans précision trouvée.
- **Couverture des cas d'erreur/limites :** point fort du document — la plupart des stories à risque couvrent explicitement leurs cas limites (Story 1.1 refus de saisie >999 avec retour haptique distinct ; Story 1.12 erreur de storage gérée en couche service ; Story 3.2 état vide premier lancement ; Story 3.3 identifiant de partie invalide ; Story 4.2 identifiant inconnu ; Story 5.2 zéro perte après plusieurs jours offline). ✅

### D. Timing de Création des Entités (DB/Types)

- Le schéma Dexie/IndexedDB n'est pas créé prématurément en Story 1.1 (qui ne crée que l'arborescence de dossiers vide) — il est implémenté au moment où l'historique en a réellement besoin, dans Epic 3 / Story 3.1 (`databaseService.ts`). ✅ Conforme au principe "tables créées quand nécessaire, pas toutes d'un coup en Story 1".
- **🟡 Minor — ✅ CORRIGÉ (2026-09-08) :** l'exigence additionnelle AR5 (création des types `GameState`, `Player`, `Reprise`, `GameMode`, `GameStatus`, **et `GameRecord`**) était rattachée globalement aux "fondations architecturales transverses" d'Epic 1, alors que `GameRecord` est fonctionnellement l'entité d'Epic 3 (historique). AR5 précise désormais explicitement que `GameRecord` est scaffoldé dès Epic 1 par anticipation architecturale mais réellement utilisé à partir d'Epic 3.

### E. Sizing des Stories

- La majorité des 39 stories sont correctement dimensionnées (une capacité utilisateur claire, 2-4 AC).
- **🟡 Minor :** Story 1.3 ("Sélectionner un mode JDS et démarrer une partie") regroupe un nombre de préoccupations assez large — affichage de la modale, saisie des noms, démarrage effectif, symétrie stricte des `PlayerPanel`, indicateur de tour non-dépendant de la couleur, ET le test global "60 ans/30 secondes". Ce n'est pas une violation bloquante (toutes les AC restent cohérentes avec l'objectif unique "démarrer une partie"), mais un candidat à surveiller si la story s'avère trop lourde à développer/tester en un seul incrément.
- **🟡 Minor — ✅ CORRIGÉ (2026-09-08) :** la formulation de la note d'implémentation d'Epic 8 ("s'appuie sur l'architecture multi-vues d'Epic 6 et les comptes joueurs d'Epic 4, sans en dépendre strictement pour fonctionner de façon autonome") était ambiguë — elle mélangeait dépendance et indépendance dans la même phrase. Reformulée pour clarifier qu'Epic 8 est autonome sans Epic 4 ni Epic 6, et s'enrichit d'eux seulement s'ils sont déjà livrés.

### Compliance Checklist par Epic

| Epic | Valeur utilisateur | Indépendance | Sizing stories | Pas de dépendance avant | Timing DB/entités | AC claires | Traçabilité FR |
|---|---|---|---|---|---|---|---|
| Epic 1 | ✅ | ✅ (corrigé, cf. ci-dessous) | ⚠️ (Story 1.3, minor, non traité) | ✅ (corrigé, cf. ci-dessous) | ✅ | ✅ | ✅ |
| Epic 2 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 3 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 4 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 5 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 6 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 7 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 8 | ✅ | ✅ (note reformulée) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Epic 9 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Résumé des Violations par Sévérité

**🔴 Critique (1) :** Epic 1 / Story 1.10 — dépendance non déclarée vers Epic 3 pour la détection de "record personnel" en fin de partie. **✅ Corrigé (2026-09-08)** — option (b) : périmètre réduit en V1a, évolution ajoutée en Epic 3 / Story 3.5.

**🟠 Majeur (0) :** Aucun.

**🟡 Mineur (3) :** Attribution imprécise du type `GameRecord` (AR5) à Epic 1 plutôt qu'Epic 3 — **✅ Corrigé**. Formulation ambiguë de la note d'indépendance d'Epic 8 — **✅ Corrigé**. Sizing de Story 1.3 à surveiller — **non traité**, laissé tel quel (préoccupation de sizing, pas une violation structurelle ; à surveiller en développement plutôt qu'à corriger a priori).

## Summary and Recommendations

### Overall Readiness Status

**READY** — Les fondations sont solides (PRD complet et numéroté, architecture cohérente, UX alignée, couverture FR 100 %). L'unique point critique (dépendance non déclarée Epic 1 → Epic 3) a été corrigé le 2026-09-08 : Story 1.10 a été recentrée sur le périmètre V1a, et une nouvelle Story 3.5 referme la dépendance en Epic 3. Les deux incohérences de documentation dans `architecture.md` et deux des trois points mineurs de qualité des epics ont également été corrigés. Le projet est prêt pour le lancement de la phase d'implémentation.

### Critical Issues Requiring Immediate Action

Aucune. Le point critique identifié (Epic 1 / Story 1.10 dépendant d'Epic 3 pour la détection du "record personnel") a été résolu par correction directe des documents (voir Recommended Next Steps, point 1).

### Recommended Next Steps

1. **✅ Fait — Dépendance Epic 1 ↔ Epic 3 tranchée (option b).** Story 1.10 ne couvre plus la détection de "nouveau record personnel" ; `GameSummary` expose l'état visuel correspondant sans le déclencher. Nouvelle **Story 3.5** ajoutée à Epic 3 pour calculer et activer ce déclenchement une fois l'historique disponible.
2. **✅ Fait — `architecture.md` corrigé** sur les deux points de documentation : `CenterPanel.vue` ajouté au mapping FR39-FR43 (porte FR43, l'alerte d'inactivité) ; nommage unifié vers `storageService.ts`/`databaseService.ts` sur les 4 occurrences du document (déjà cohérent partout ailleurs — epics.md, ARs).
3. **✅ Fait — Points mineurs de qualité des epics corrigés :** attribution du type `GameRecord` clarifiée dans AR5 (scaffoldé en Epic 1, utilisé à partir d'Epic 3) ; note d'indépendance d'Epic 8 reformulée sans ambiguïté.
4. **Non traité, à surveiller en développement (non bloquant) :** sizing de Story 1.3 (regroupe plusieurs préoccupations UX) — pas une violation structurelle, à réévaluer si elle s'avère trop lourde à développer/tester en un seul incrément.
5. **À faire avant de considérer les tokens visuels comme définitifs :** confirmer avec Nathan le statut de l'identité visuelle (couleurs/typographie actuellement en "première passe approximative" dans la spec UX) — non bloquant pour démarrer le développement puisque l'architecture rend ces tokens facilement modifiables (Tailwind config, Story 1.1), mais à clarifier pour éviter un rework visuel en cours de route.
6. **À anticiper avant le développement des epics V2/V3/V4 :** aucune spec UX dédiée n'existe encore pour Epic 4 à 9 — attendu à ce stade de la roadmap V1-first, mais à combler avant leur mise en chantier.

### Final Note

Cette évaluation a identifié **8 constats** au total (Alignement UX : 2 écarts de documentation + 2 avertissements ; Qualité des Epics : 1 violation critique + 3 points mineurs) — la validation de couverture FR (étape 3) n'a produit aucun constat, avec une couverture de 100 % (46/46 FR) sans duplication. **6 des 8 constats ont été corrigés directement dans `architecture.md` et `epics.md` le 2026-09-08** (le point critique via l'option b — périmètre réduit + évolution en Epic 3 — décidée par Nathan). Les 2 constats restants sont un point de sizing à surveiller (Story 1.3, non bloquant) et deux avertissements informatifs sur l'identité visuelle provisoire et l'absence de spec UX pour les epics V2+ (tous deux non bloquants pour démarrer V1a). Le plan est prêt pour la phase d'implémentation.

---

**Rapport généré le :** 2026-09-08
**Corrections appliquées le :** 2026-09-08
**Évaluateur :** Agent BMad — Implementation Readiness Assessment
