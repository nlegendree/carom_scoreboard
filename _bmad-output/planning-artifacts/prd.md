---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
workflow_completed: true
completed_at: '2026-05-19'
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-05-18-now.md'
  - 'explore/resources/MECHANICS.md'
  - 'explore/resources/README.md'
  - 'explore/resources/ (20 photos scoreboards coréens — référence UX expérience terrain Nathan)'
workflowType: 'prd'
classification:
  projectType: 'web_app_pwa → saas_b2b'
  domain: 'sports_loisirs_niche (billard carambole français)'
  complexity: 'medium'
  projectContext: 'greenfield'
  prdScope: 'vision_complete_v1_to_v4 avec épics priorisés'
contextNotes: 'scoreboard_test = exemple open source trouvé sur internet. Photos = expérience personnelle Nathan en Corée du Sud avec systèmes coréens. Identité visuelle à définir séparément par Nathan.'
---

# Product Requirements Document — Carom Scoreboard

**Auteur :** Nathan
**Date :** 2026-05-19

---

## Résumé Exécutif

Le billard carambole français compte des milliers de clubs et de joueurs qui scorent encore sur papier. La fédération ressaisit les résultats manuellement. Aucun produit n'a adressé ce marché avec une approche produit moderne. **Carom Scoreboard** résout d'abord le problème immédiat — scorer une partie correctement, sans friction — tout en posant les fondations d'une plateforme de données pour l'ensemble du sport français.

Le client primaire est le club (bundle tablette + abonnement SaaS, ou abonnement seul). Le joueur individuel est un client secondaire et un vecteur de croissance organique. La trajectoire va du scoreboard autonome (V1) à l'infrastructure numérique officielle de la fédération française (V4), avec quatre étapes bornées, chacune finançant la suivante.

Le marché coréen, observé directement, valide cette trajectoire — les clubs coréens utilisent déjà des systèmes intégrés scoring + vidéo + classement national. La France a 5–10 ans de retard et le terrain n'est pas occupé.

### Ce qui rend ce produit spécial

**Accès radical :** Critère de design non-négociable — un joueur de 60 ans, seul, démarre une partie en moins de 30 secondes. Aucun concurrent actuel ne passe ce test.

**Plateforme déguisée en outil :** Le V1 est un scoreboard. Chaque partie enregistrée devient une donnée — profil joueur, historique de club, statistiques fédérales. La valeur de la base de données croît dès le premier usage.

**Timing fenêtre :** Les clubs français commencent à s'équiper (tablettes, TV, streaming). Ce produit arrive quand la demande se forme.

**Partenaire naturel :** La fédération française ressaisit les résultats manuellement. Ce produit est son fournisseur de données naturel — pas un concurrent, un allié.

---

## Classification du Projet

| Attribut | Valeur |
|---|---|
| Type | PWA tablette (web_app) → SaaS B2B |
| Domaine | Sports de niche — billard carambole français |
| Complexité | Moyenne |
| Contexte | Greenfield |
| Portée PRD | Vision complète V1→V4, épics priorisés |

---

## Critères de Succès

### Succès Utilisateur

- Un joueur sans formation démarre une partie (mode + noms + premier score) en **moins de 30 secondes**, seul
- En fin de match, le système affiche automatiquement score total, moyenne par reprise, meilleure série — **zéro calcul manuel**
- Un joueur retrouve l'historique d'une partie jouée **jusqu'à 30 jours en arrière** depuis le même appareil
- **Zéro perte de données** en cours de partie (fermeture accidentelle, coupure réseau)

### Succès Business

| Horizon | Cible |
|---|---|
| Lancement V1 | 1 club pilote en usage actif et validé |
| 6 mois post-lancement | 5 clubs payants, ≥ 100 parties scorées/mois |
| 12 mois | Feedback terrain suffisant pour lancer V2 |

### Succès Technique

- Réactivité tactile : retour visuel/haptique **< 100 ms** sur chaque appui
- PWA installable, **100 % offline** en V1, sans dépendance backend
- Compatible tablettes d'entrée de gamme : Android 10+, iPad 9e génération+
- Taux de complétion des parties démarrées : **> 80 %** sans incident technique

---

## Roadmap Produit

### Stratégie MVP

**Approche :** MVP Expérience — pas le minimum viable, le minimum délectable. Un club qui reçoit la tablette doit avoir envie de la montrer à ses voisins le premier soir.

**Équipe :** Solo dev assisté par IA (Claude Code). Discipline de scope critique — chaque feature justifie son coût en temps de développement.

**Horizon :** Pas de deadline fixe. Découpage en jalons pour shipper de la valeur tôt.

### V1a — Premier Déploiement

**Parcours couverts :** Michel (happy path), Michel (correction/undo)

**Capacités :**
- Modes JDS : Libre, Cadre, Bande — interface de saisie unique (pavé numérique, score final de série)
- Gestion des reprises : saisie libre par joueur, ordre non contraint
- Undo/correction : effacer saisie en cours + annuler dernière série validée
- Stats automatiques en fin de match : total, moyenne, meilleure série
- Annonce vocale du score (on/off)
- Alerte détection d'inactivité (partie ouverte sans saisie pendant X minutes)
- Historique local — 30 jours minimum
- Noms joueurs éditables inline
- PWA installable, 100 % offline, localStorage
- UX : démarrer une partie en < 30 secondes sans formation

**Hors scope V1a :** timer, mode 3 Bandes, Casin, 5 Quilles, comptes cloud, vue TV, overlay stream

### V1b — V1 Complet

Ajoute uniquement :
- Mode 3 Bandes : timer obligatoire, saisie point par point OU score global + timer libre
- Pause/reprise timer (fondation pour l'arbitre V2)

*V1b est un jalon distinct — le timer est la feature la plus complexe du V1. Valider l'UX V1a d'abord.*

### V2/V3 — Growth : Données, Streaming & Réseau

- Backend cloud + synchronisation offline→cloud
- Profils joueurs : ID court, historique permanent, stats carrière
- Modèle coréen : compte créé dans l'app compagnon, identification rapide à la tablette par ID
- Layout live : overlay OBS fond transparent (URL publique), vue salle grand format (TV murale)
- Interface arbitre déportée (web remote, fallback Bluetooth)
- Intégration caméra + indexation vidéo par série
- Dashboard organisateur multi-tables, gestion de tournois
- Minuteur de facturation à la table (optionnel, pour clubs louant à l'heure)
- Signalisation des moments clés : record personnel, match point (signaux visuels/sonores discrets)
- Abonnement SaaS club (paliers 1-2 / 3-5 / illimité)
- Export données fédération (format à définir avec la fédération)
- Modes 5 Quilles et Casin complet (après validation des règles officielles)

### V4 — Vision : Écosystème Fédéral

- App mobile joueur (stats, historique, classements)
- Contrat fédéral officiel — infrastructure nationale de données
- Classement national alimenté automatiquement par tous les clubs affiliés

### Mitigation des Risques

| Risque | Impact | Mitigation |
|---|---|---|
| Complexité timer 3 Bandes | Technique | Isolé en V1b — ne bloque pas V1a |
| Adoption joueurs seniors | Marché | Test "60 ans / 30 secondes" appliqué à chaque écran avant dev |
| Scope creep solo dev | Ressources | Aucune feature sans jalon clairement défini |
| Règles 5 Quilles / Casin incomplètes | Domaine | Hors scope V1 — validation fédération avant implémentation |
| Fédération non coopérative | Marché | Produit viable sans fédération — clubs = marché principal |

---

## Parcours Utilisateurs

### Parcours 1 — Michel, joueur de club (happy path, V1)

**La situation :** Michel a 63 ans, joue au billard carambole depuis 30 ans au Club Boissy. Il a toujours scoré sur un bloc-notes. Son club vient de recevoir une tablette.

**Déroulé :** Il voit deux grandes zones "Joueur 1" et "Joueur 2". Il tape sur son nom, saisit "MICHEL", confirme. Son adversaire fait pareil. Il choisit son mode JDS. La partie commence. Après sa première reprise à 12, il entre "1", "2" sur le pavé — le score s'affiche. Reprise par reprise, chaque score est saisi en quelques secondes. En fin de match, l'écran affiche automatiquement total, moyenne, meilleure série. Michel dit "8,75 de moyenne, c'est mon record".

**Moment clé :** Il retrouve sa partie du mois dernier dans l'historique et voit que sa moyenne progresse.

**Nouvelle réalité :** Michel ne touche plus au bloc-notes. Il consulte ses stats avant chaque partie.

---

### Parcours 2 — Michel, erreur de saisie (edge case, V1)

**La situation :** Michel a saisi "22" alors que sa série était de 12.

**Déroulé :** Il appuie sur "Correction" — la saisie s'efface, il ressaisit "12". Plus tard, l'adversaire conteste le score d'une série déjà validée. Michel rappuie sur "Correction" — la dernière série repasse à null, le total revient en arrière. Aucun recalcul mental.

**Moment clé :** Pas de stress, pas de "on repart de combien ?". Le scoreboard gère l'arbitrage de fait.

**Nouvelle réalité :** Les corrections ne créent plus de tension entre joueurs.

---

### Parcours 3 — Didier, responsable de club (admin, V1)

**La situation :** Didier gère le Club Boissy, 8 tables, 120 adhérents. Intéressé mais pas très tech.

**Déroulé :** Il reçoit un colis — tablette préconfigurée, support de fixation, guide d'une page. Il fixe le support en 5 minutes, allume la tablette, l'app démarre. Il teste seul, 3 reprises. Ce soir-là, deux joueurs l'utilisent sans qu'il explique quoi que ce soit.

**Moment clé :** Fin du premier mois, Didier reçoit un récap : 47 parties scorées sur cette table. Il souscrit l'abonnement pour les 3 autres tables.

**Nouvelle réalité :** Didier a un outil de club dont il est fier. Il le montre aux clubs voisins.

---

### Parcours 4 — Karim, arbitre avec interface déportée (V2/V3)

**La situation :** Karim arbitre un match de championnat régional. Il ne veut pas toucher la tablette à chaque série.

**Déroulé :** Positionné à 1m50 de la table, interface déportée en main. Il valide chaque score, met en pause si un joueur conteste, corrige la dernière série — sans approcher la tablette.

**Moment clé :** Un joueur fait une série record. Karim valide — le score s'affiche simultanément sur la TV de la salle. L'ambiance monte.

**Nouvelle réalité :** Les compétitions officielles ont un arbitrage numérique propre.

---

### Parcours 5 — Sophie, organisatrice de tournoi (V2/V3)

**La situation :** Sophie organise un championnat, 16 joueurs, 8 tables en simultané.

**Déroulé :** Elle crée le tournoi en 10 minutes. Sur son dashboard : 8 tableaux en temps réel — table 1 en set 2, table 4 terminée, table 7 en attente. Elle assigne le match suivant à table 4 sans se déplacer.

**Moment clé :** Un résultat se publie — il remonte automatiquement dans le classement affiché sur la TV centrale.

**Nouvelle réalité :** Sophie gère un tournoi de 16 personnes seule, en 3 heures, sans feuille de match.

---

### Parcours 6 — Lucas, streameur (V2/V3)

**La situation :** Lucas retransmet les finales sur YouTube. Il veut un overlay propre sans 2 heures de bricolage.

**Déroulé :** Il active le mode stream, reçoit une URL, l'ajoute comme source navigateur dans OBS. Fond transparent, scores, reprise, timer — positionné en 30 secondes. L'overlay se met à jour en temps réel.

**Moment clé :** Un téléspectateur commente "enfin un vrai overlay billard, comme les streams coréens".

**Nouvelle réalité :** Le billard carambole français a une identité visuelle professionnelle en stream.

---

### Synthèse des Capacités Révélées par les Parcours

| Capacité | Parcours |
|---|---|
| Saisie tactile rapide, pavé numérique | 1, 2 |
| Undo/correction sans friction | 2 |
| Historique local + stats automatiques | 1, 3 |
| Bundle hardware + onboarding zéro friction | 3 |
| Interface déportée Bluetooth / web remote | 4 |
| Timer avec pause arbitre | 4 |
| Dashboard multi-tables temps réel | 5 |
| Gestion de tournoi (création, assignation, classement) | 5 |
| Overlay OBS fond transparent, URL publique | 6 |
| Affichage TV salle grand format | 4, 5 |

---

## Exigences Spécifiques au Domaine

### Modes de Jeu et Mécaniques de Saisie

| Mode | Famille | Saisie | Timer | Séries typiques |
|---|---|---|---|---|
| Libre | JDS | Score final au pavé | Non | 10–100+ |
| Cadre | JDS | Score final au pavé | Non | 10–100+ |
| Bande | JDS | Score final au pavé | Non | 10–100+ |
| 3 Bandes | Bandes | Clic/point ou score final | Oui (obligatoire) | 3–15 |
| 5 Quilles | À définir | À définir | À définir | À définir |
| Casin | À définir | Bouton par catégorie | Non (minuteur de partie) | Par catégorie |

**Règle timer 3 Bandes :** timer toujours actif. Saisie point par point (timer remis à zéro à chaque clic) ou score global en fin de série avec timer libre.

**Règle JDS :** aucun timer. Pavé numérique, score final de série.

### Règles en Attente de Validation

- **5 Quilles** — mécanique complète inconnue
- **Casin** — règles partielles documentées dans le prototype (9 catégories, pattes configurables), règles complètes à valider avec la fédération

**Périmètre V1 :** JDS (Libre/Cadre/Bande) + 3 Bandes uniquement. 5 Quilles et Casin complet hors scope jusqu'à validation des règles officielles.

### Contraintes Techniques

**Offline-first :** V1 100 % offline (localStorage). V2+ : synchronisation différée — offline d'abord, sync quand réseau disponible, zéro perte de données.

**RGPD :** Dès V2 (cloud + profils joueurs) — consentement explicite, droit à suppression, hébergement EU.

**Intégration fédération :** Format d'import inconnu. L'architecture V3 prévoit un export générique (JSON/CSV) adaptable aux exigences fédérales.

---

## Innovation & Patterns Nouveaux

### Zones d'Innovation Détectées

**1. Architecture multi-vues sur une seule source de données**
La tablette est un moteur de score alimentant simultanément plusieurs rendus : saisie tactile, TV grand format, overlay stream, interface arbitre. Aucun produit billard existant ne découple saisie et présentation.

**2. Interface arbitre sans fil modernisée**
Le concept existe sous forme de dongles USB sur mini PC. L'innovation est l'implémentation : Bluetooth natif ou web remote (URL sur n'importe quel device), sans matériel dédié.

**3. Infrastructure fédérale déguisée en outil**
Le club adopte un scoreboard simple — l'usage quotidien construit progressivement la base de données nationale. La fédération n'impose rien ; les données arrivent naturellement.

### Contexte Marché & Validation

- **Preuve de faisabilité :** Marché coréen observé directement — scoring tablette → streaming → infrastructure nationale. La France a 5–10 ans de retard.
- **Concurrence actuelle :** Zéro produit équivalent sur le marché français/européen.
- **Signal V1 :** 5 clubs payants et 100 parties/mois valident l'adoption avant d'investir en V2/V3.

### Approche de Validation

| Innovation | Hypothèse | Signal |
|---|---|---|
| Multi-vues | Les clubs veulent afficher sur TV | 50 % activent la vue salle en V2 |
| Interface arbitre | Les arbitres préfèrent une interface déportée | Adoption en compétition officielle |
| Cheval de Troie fédéral | La fédération intègre les données | 1 accord pilote en V3 |

### Risques et Mitigations

| Risque | Mitigation |
|---|---|
| Bluetooth non supporté sur certaines tablettes | Fallback web remote — URL navigateur sur n'importe quel device |
| Fédération refuse l'intégration | Produit viable sans fédération — clubs = marché principal |
| Résistance joueurs seniors | V1 conçu sur le test "60 ans / 30 secondes" |

---

## Exigences Techniques par Type de Projet

### Architecture PWA (V1)

| Critère | Exigence |
|---|---|
| Type | SPA/PWA installable |
| Cibles | Tablette Android 10+, iPad (iPadOS 15+) |
| Offline | 100 % fonctionnel sans réseau |
| Persistance | localStorage V1, sync cloud V2+ |
| SEO | Non requis |
| Real-time | Non en V1 — websockets/SSE en V2+ (stream, dashboard) |
| Stack | Décision en phase architecture — critères : perf tactile, PWA mature, offline robuste |

### Modèle d'Authentification (V2+)

**Modèle coréen adapté :**
1. Compte créé une fois dans l'app mobile compagnon (ou en ligne)
2. À la tablette de club, saisie de l'ID joueur (court, mémorisable) — profil chargé instantanément
3. Pas de mot de passe à la tablette — authentification forte dans l'app compagnon

**Rôles :**

| Rôle | Périmètre |
|---|---|
| Invité | Joue sans compte — données locales uniquement |
| Joueur enregistré | Profil cloud, historique, stats carrière — identifié par ID |
| Admin club | Tables, abonnements, tournois |
| Arbitre | Interface déportée (web remote) pour un match en cours |

### Architecture SaaS Multi-Tenant (V2+)

| Critère | Exigence |
|---|---|
| Modèle tenant | Un club = un tenant isolé |
| Paliers | 1-2 tables / 3-5 tables / illimité |
| Facturation | Abonnement mensuel ou annuel |
| Conformité | RGPD — hébergement EU |
| Scalabilité | Inconnue — pas de sur-engineering initial |
| Hébergement | Décision en phase architecture — critères : coût maîtrisé, EU, déploiement simple |

**Principe directeur :** commencer simple, scalabilité progressive selon adoption réelle. Stack, hébergement et base de données décidés en phase architecture.

---

## Exigences Fonctionnelles

### 1. Gestion de Partie

- **FR1 :** Un joueur peut démarrer une nouvelle partie en sélectionnant un mode de jeu et en saisissant les noms des deux joueurs
- **FR2 :** Un joueur peut saisir le score de sa série pour la reprise en cours
- **FR3 :** Le système calcule et affiche en temps réel le score total de chaque joueur
- **FR4 :** Un joueur peut terminer une partie et consulter un récapitulatif automatique
- **FR5 :** Un joueur peut démarrer une nouvelle partie sans effacer l'historique des parties précédentes
- **FR6 :** Le système préserve l'état complet de la partie en cours en cas de fermeture accidentelle de l'application

### 2. Saisie & Correction

- **FR7 :** Un joueur peut saisir un score numérique via un pavé tactile optimisé
- **FR8 :** Un joueur peut annuler sa saisie en cours avant validation
- **FR9 :** Un joueur peut annuler la dernière série validée
- **FR10 :** Un joueur peut saisir un score négatif (déduction du total)
- **FR11 :** Le système confirme chaque saisie par un retour haptique et visuel immédiat

### 3. Modes de Jeu

- **FR12 :** Un joueur peut sélectionner un mode JDS — Libre, Cadre ou Bande — avec reprises, séries entières, calcul de moyenne et meilleure série
- **FR13 :** Un joueur peut sélectionner le mode 3 Bandes avec timer de série actif en permanence *(V1b)*
- **FR14 :** En mode 3 Bandes, un joueur peut incrémenter son score point par point ou saisir le score global en fin de série *(V1b)*
- **FR15 :** Un joueur peut configurer le format du match avant le début d'une partie (objectif de score, nombre de sets)
- **FR16 :** Le système détecte et signale automatiquement la fin d'un set ou d'un match selon le format configuré

### 4. Statistiques & Historique

- **FR17 :** Le système affiche automatiquement en fin de match : score total, moyenne par reprise, meilleure série
- **FR18 :** Un joueur peut consulter la liste des parties jouées sur l'appareil
- **FR19 :** Un joueur peut consulter le détail complet d'une partie passée (reprises, séries, statistiques)
- **FR20 :** L'application conserve l'historique des parties pendant au minimum 30 jours
- **FR21 :** Un joueur enregistré peut consulter ses statistiques cumulées sur l'ensemble de sa carrière *(V2+)*
- **FR22 :** Un joueur enregistré peut visualiser l'évolution de sa moyenne au fil du temps *(V2+)*

### 5. Présentation & Diffusion *(V2+)*

- **FR23 :** Un utilisateur peut activer un affichage grand format optimisé pour lecture depuis l'autre bout de la salle
- **FR24 :** Un streameur peut générer une URL d'overlay fond transparent compatible OBS/Streamlabs
- **FR25 :** L'overlay stream se met à jour en temps réel sans intervention de l'opérateur
- **FR26 :** Un organisateur peut diffuser les scores en cours sur un écran TV connecté au réseau local

### 6. Compétition & Arbitrage *(V2+)*

- **FR27 :** Un arbitre peut contrôler le scoreboard (validation, correction, pause timer) depuis une interface déportée sans toucher la tablette
- **FR28 :** Un organisateur peut créer un tournoi, assigner des matchs aux tables disponibles et suivre la progression en temps réel
- **FR29 :** Le système affiche un tableau de bord centralisé de toutes les tables actives d'une compétition
- **FR30 :** Le système gère la progression d'un tournoi (classements, disponibilité des tables)
- **FR31 :** Un admin club peut activer un minuteur de facturation à la table pour les clubs proposant la location horaire *(V2+, optionnel)*

### 7. Gestion des Joueurs & Clubs *(V2+)*

- **FR32 :** Un joueur peut créer un compte avec un identifiant court mémorisable
- **FR33 :** Un joueur peut s'identifier sur n'importe quelle tablette de club en saisissant son identifiant
- **FR34 :** Un admin club peut gérer les tables de son club (configuration, activation, désactivation)
- **FR35 :** Un admin club peut consulter les statistiques d'usage de son club
- **FR36 :** Le système synchronise automatiquement les données locales vers le cloud dès qu'une connexion réseau est disponible
- **FR37 :** Un admin club peut gérer son abonnement (palier, facturation)
- **FR38 :** Le système exporte les résultats dans un format compatible avec les systèmes fédéraux *(V3)*

### 8. Administration & Configuration

- **FR39 :** Un utilisateur peut modifier les noms des joueurs en cours de partie
- **FR40 :** Un utilisateur peut réinitialiser une partie en cours et en démarrer une nouvelle
- **FR41 :** Un utilisateur peut configurer les paramètres d'une partie (format sets, objectif de score, pattes Casin)
- **FR42 :** Un utilisateur peut activer ou désactiver l'annonce vocale du score après chaque série validée
- **FR43 :** Le système détecte l'absence de saisie prolongée et alerte l'utilisateur si une partie reste ouverte sans activité
- **FR44 :** Le système signale visuellement les moments clés d'une partie (record personnel dépassé, match point) *(V2+)*
- **FR45 :** L'application fonctionne sans connexion réseau
- **FR46 :** L'application peut être installée comme application native sur tablette (démarrage sans navigateur)

---

## Exigences Non-Fonctionnelles

### Performance

- **NFR1 :** Retour visuel et haptique suite à une action tactile : **< 100 ms**
- **NFR2 :** Chargement initial (premier affichage interactif) : **< 2 secondes** sur tablette d'entrée de gamme (Android 10+, 3 Go RAM)
- **NFR3 :** Fluidité maintenue (pas de freeze ni jank) après **8 heures d'utilisation continue** sans rechargement
- **NFR4 :** En V2+ real-time, mises à jour de score reflétées sur tous les clients connectés en **< 500 ms**

### Fiabilité

- **NFR5 :** État de la partie sauvegardé localement après **chaque action** — zéro perte en cas de fermeture ou crash
- **NFR6 :** L'application fonctionne **sans connexion réseau** sur tablette sans SIM ni WiFi
- **NFR7 :** En V2+, synchronisation différée garantit **zéro perte de données** pour les parties jouées offline, même après plusieurs jours sans réseau
- **NFR8 :** Taux de complétion des parties démarrées **> 80 %** sans incident technique

### Accessibilité Pratique

- **NFR9 :** Zones interactives : taille minimale **90 × 90 px** (usage tactile sans stylet)
- **NFR10 :** Scores et statistiques lisibles à **2 mètres** — polices fluides `clamp()`, contraste WCAG AA minimum
- **NFR11 :** Vue salle lisible à **5 mètres** sur écran 40" ou supérieur
- **NFR12 :** Démarrer une partie ne requiert **aucune lecture de texte explicatif** — actions compréhensibles par pictogramme et position

### Identité Visuelle

L'identité visuelle du produit sera définie séparément par Nathan (direction artistique à fournir comme artefact de design). Elle n'est pas prescrite dans ce PRD. Elle sera intégrée comme contrainte de design à l'étape UX.

### Sécurité & Conformité

- **NFR13 :** En V1, **aucune donnée transmise** à un serveur externe — tout reste sur l'appareil
- **NFR14 :** En V2+, communications client-serveur chiffrées en **TLS 1.3 minimum**
- **NFR15 :** En V2+, données personnelles hébergées dans l'**Union Européenne** — conformité RGPD
- **NFR16 :** En V2+, suppression complète des données d'un joueur accessible en **< 3 actions**
