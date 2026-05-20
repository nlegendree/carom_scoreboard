---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Scoreboard billard français — produit commercial multi-plateforme'
session_goals: 'Générer des idées de fonctionnalités, définir le MVP, anticiper la roadmap business (vente tablette+logiciel, comptes utilisateurs, flux vidéo)'
selected_approach: 'ai-recommended'
techniques_used: ['Cross-Pollination', 'SCAMPER Method', 'Dream Fusion Laboratory']
ideas_generated: [30]
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitateur:** Nathan
**Date:** 2026-05-18

## Session Overview

**Sujet :** Scoreboard billard français — produit commercial multi-plateforme
**Objectifs :** Générer des idées de fonctionnalités, définir le MVP, anticiper la roadmap business (vente tablette+logiciel, comptes utilisateurs, flux vidéo)

### Contexte

Projet de scoreboard pour billard carambole (modes Carambole et Casin). Un prototype de référence existe dans `explore/scoreboard_test/`. Des photos de scoreboards utilisés par des millions de joueurs sont disponibles. La vision à terme : vendre le produit avec une tablette, comptes utilisateurs interconnectés, intégration flux vidéo.

## Sélection des Techniques

**Approche :** Recommandations IA
**Contexte d'analyse :** Scoreboard billard français avec focus MVP → vente → expansion

**Techniques recommandées :**

- **Cross-Pollination :** Transférer des solutions d'autres sports/domaines (eSports, tennis, poker) pour générer des idées inattendues
- **SCAMPER Method :** Explorer systématiquement chaque feature du produit existant sous 7 angles pour passer de "ce qui existe" à "ce qui est meilleur"
- **Dream Fusion Laboratory :** Partir de la vision idéale impossible et reverse-engineer le MVP — clarifier vision long terme vs. priorités immédiates

**Durée estimée :** ~60 minutes

---

## Inventaire Complet des Idées

### Technique 1 — Cross-Pollination

**[UX #1] : Le Scoreboard Transparent**
_Concept :_ Une URL publique qui affiche le score avec fond transparent, intégrable dans OBS ou Streamlabs en une seconde comme source navigateur. Nativement "stream-ready".
_Nouveauté :_ Premier scoreboard billard pensé pour le streameur — aucun concurrent ne l'a résolu.

**[UX #2] : Architecture Multi-Vues**
_Concept :_ Une seule source de données, plusieurs rendus simultanés — vue joueur (tablette tactile), vue salle (second écran grand format), vue stream (overlay transparent), vue remote (mobile pour suivre à distance).
_Nouveauté :_ Découple la saisie des données de leur présentation. Le produit devient un moteur de score, pas un simple afficheur.

**[DATA #3] : Le Registre de Match**
_Concept :_ Chaque partie est enregistrée avec ses données complètes — reprises, séries, total, durée. Ces données alimentent un profil joueur avec moyenne calculée sur l'ensemble de sa carrière.
_Nouveauté :_ Le scoreboard ne disparaît plus à la fin de la partie — il devient un historique permanent.

**[RULES #4] : Formats de Compétition Intégrés**
_Concept :_ Le scoreboard connaît les formats officiels — "3 sets gagnants de 15 points" — et les applique automatiquement. Il sait quand un set est gagné, quand le match est terminé.
_Nouveauté :_ L'arbitrage des règles est automatique. Plus de disputes sur le score ou le format.

**[MODES #5] : Deux Contextes d'Usage**
_Concept :_ Mode "Compétition" — un organisateur crée les matchs depuis un tableau de bord, les joueurs n'ont qu'à scorer. Mode "Entraînement" — les joueurs créent leur match en 30 secondes, format libre.
_Nouveauté :_ Deux UX distinctes selon le contexte, même base de données. Les entraînements alimentent les stats autant que les compétitions.

**[ARCH #6] : Réseau de Tables**
_Concept :_ Chaque tablette est un nœud connecté. Un organisateur ouvre une compétition, assigne les matchs aux tables. Chaque score remonte en temps réel au dashboard central. Vue unifiée : table 1 — set 2 en cours (12-9), table 2 — terminé, table 3 — en attente.
_Nouveauté :_ Le billard carambole n'a jamais eu d'outil de gestion de compétition temps réel. Ce n'est pas un scoreboard — c'est une salle de compétition connectée.

**[DATA #7] : Le Classement Fédéral**
_Concept :_ Les résultats de toutes les compétitions — tous clubs confondus — alimentent un classement national. Chaque joueur a un profil avec sa moyenne historique, son nombre de matchs, son évolution.
_Nouveauté :_ Le scoreboard devient l'infrastructure de données officielle de la fédération française de billard.

**[PAIN #8] : Fin de la Double Saisie**
_Concept :_ Aujourd'hui : score sur papier → ressaisie manuelle sur le site fédéral. Avec ce produit : score sur tablette → export automatique disponible pour le site fédéral. Zéro ressaisie, zéro erreur.
_Nouveauté :_ Le produit n'est pas en concurrence avec le site fédéral — il en est le fournisseur de données.

**[BIZ #9] : Le Cheval de Troie Fédéral**
_Concept :_ Proposer à la fédération une API d'import — les clubs qui utilisent le scoreboard envoient leurs résultats en un clic. La fédération recommande officiellement l'outil à ses clubs affiliés.
_Nouveauté :_ La fédération devient le canal de distribution. Un accord = accès à tous les clubs de France.

**[DESIGN #10] : Le Mode "Salle"**
_Concept :_ Une vue grand format activable d'un tap — score en très grandes polices, contraste maximal, lisible depuis l'autre bout de la salle. Projetable sur une TV murale existante.
_Nouveauté :_ Les clubs qui ont déjà une TV peuvent l'utiliser immédiatement sans acheter de matériel supplémentaire.

**[DESIGN #11] : Onboarding Zéro Friction**
_Concept :_ Premier lancement = 3 écrans maximum. Nom joueur 1, nom joueur 2, format du match. La partie démarre. Pas de compte requis, pas de tutoriel.
_Nouveauté :_ Un joueur de 60 ans qui n'a jamais utilisé une tablette doit pouvoir démarrer seul en moins de 30 secondes.

**[DESIGN #12] : La Charte Visuelle "Salle de Billard"**
_Concept :_ Design qui évoque le billard — vert feutrine, bois sombre, typographies classiques. Pas un design générique de startup. Les clubs sont fiers de leur salle, le scoreboard doit être à la hauteur.
_Nouveauté :_ L'identité visuelle est un argument de vente — un joueur reconnaît son univers immédiatement. ⚠️ S'inspirer des photos dans `explore/resources/` pour la direction artistique.

**[BIZ #13] : Le Bundle "Clé en Main"**
_Concept :_ Tablette préconfigurée + support de fixation pour le bord du billard + un an d'abonnement inclus. Prix unique. Le club reçoit un colis, sort la tablette, fixe le support, allume — c'est prêt.
_Nouveauté :_ Élimine la friction technique qui bloque les clubs non-technophiles. Le produit physique justifie un prix premium vs une simple app.

**[BIZ #14] : Le Modèle SaaS Club**
_Concept :_ Abonnement mensuel ou annuel par club — pas par tablette. Un club paie un forfait et connecte autant de tables qu'il veut. Prix progressif par palier (1-2 tables / 3-5 tables / illimité).
_Nouveauté :_ Revenue récurrente prévisible. Le club qui grandit monte de palier sans renégociation.

**[BIZ #15] : La Fédération comme Revendeur**
_Concept :_ Accord de distribution avec la fédération — elle recommande officiellement le produit à ses clubs affiliés en échange d'un tarif préférentiel ou d'une commission.
_Nouveauté :_ Coût d'acquisition client quasi nul. Un seul accord = des centaines de clubs potentiels.

---

### Technique 2 — SCAMPER

**[INPUT #16] : Pavé Numérique + Accès Rapide Contextuel**
_Concept :_ Le pavé numérique reste central (séries de 35, 42, 10...). Des boutons d'accès rapide s'ajoutent selon le mode — en Casin : boutons par catégorie de tir ; en Carambole : possibilité de +1/+5 pour les petites séries.
_Nouveauté :_ L'interface de saisie s'adapte au mode de jeu, pas l'inverse.

**[UX #17] : Annonce Vocale Désactivable**
_Concept :_ Une voix annonce le score après chaque série validée. Option on/off dans les paramètres, volume réglable.
_Nouveauté :_ Utile en compétition pour que les spectateurs suivent sans regarder l'écran. Désactivable pour l'entraînement discret.

**[DATA #19] : Profils Joueurs avec Mode Invité**
_Concept :_ Les joueurs enregistrés ont un historique complet. Pour une partie rapide, un mode invité permet de jouer sans créer de compte. Les stats sont enregistrables a posteriori si le joueur veut les rattacher à son profil.
_Nouveauté :_ Zéro friction pour les nouveaux utilisateurs, valeur croissante pour les fidèles.

**[BIZ #20] : Gestion du Temps de Table**
_Concept :_ Le minuteur devient aussi un compteur de facturation. Le club configure un tarif horaire, la tablette affiche le temps écoulé et le montant dû.
_Nouveauté :_ Le scoreboard devient un outil de caisse pour les clubs qui louent leurs tables à l'heure.

**[VIDEO #21] : Intégration Vidéo Différée** *(Roadmap V4)*
_Concept :_ Une caméra fixe filme la table en continu. Quand l'adversaire valide un point, le système indexe le timestamp. Chaque série est retrouvable en vidéo après le match.
_Nouveauté :_ Déjà existant en Corée — personne ne l'a encore fait en France/Europe. Le Strava du billard.

**[UX #22] : Timeline de Match Interactive**
_Concept :_ Après chaque match, une courbe d'évolution des scores reprise par reprise. Cliquable pour naviguer dans l'historique. On voit le moment exact où la partie a basculé.
_Nouveauté :_ Transforme un score brut en récit de match. Valeur émotionnelle forte.

**[UX #23] : Moments Clés Amplifiés**
_Concept :_ Signaux visuels discrets pour les moments importants — record personnel dépassé, match point, victoire. Changement de couleur subtil, légère pulsation, son discret. Sobre mais présent.
_Nouveauté :_ Le scoreboard devient émotionnellement intelligent — il reconnaît la performance, pas juste le chiffre.

**[ÉLIM #24] : Suppression de l'Auto-Validation**
_Concept :_ La série ne se valide que sur action explicite — tap sur un bouton de confirmation. Pas de timer, pas d'ambiguïté.
_Nouveauté :_ Zéro stress de saisie. Le joueur est toujours maître de ce qui est enregistré.

**[ÉLIM #25] : Simplicité Radicale comme Principe**
_Concept :_ Chaque feature doit passer le test : un joueur de 60 ans peut-il comprendre ça seul en 10 secondes ? Sinon, c'est éliminé ou caché dans un menu avancé.
_Nouveauté :_ La simplicité n'est pas un défaut — c'est la feature principale du produit.

**[UX #26] : Détection d'Inactivité**
_Concept :_ Après X minutes sans saisie, une alerte douce — "Match toujours en cours ?" Oui / Non. Évite les parties zombies qui restent ouvertes par oubli.
_Nouveauté :_ Le scoreboard gère son propre cycle de vie.

---

### Technique 3 — Dream Fusion Laboratory

**[VISION #28] : Le Système Complet** *(Vision 10 ans)*
_Concept :_ Package hardware (tablette + caméra préconfigurées) + app scoreboard + app mobile (stats, news, historique de carrière) + cloud central + contrat fédéral officiel pour remontée automatique des résultats.
_Nouveauté :_ Pas une app — l'infrastructure numérique du billard français.

**[MVP #29] : Le Scoreboard Parfait** *(V1)*
_Concept :_ Une seule chose, faite parfaitement. Scoreboard tablette, tous les modes de jeu officiels (Carambole, Casin, formats sets), UX irréprochable, zéro bug.
_Nouveauté :_ La barre à franchir est basse — les clubs utilisent encore du papier. Un outil qui marche suffit pour les premiers adoptants.

**[ROAD #30] : La Roadmap en 4 Marches**
_Concept :_

| Étape | Ce qui s'ajoute | Ce que ça débloque |
|---|---|---|
| V1 — MVP | Scoreboard tablette, tous modes, UX clean | Premiers clubs, premières ventes |
| V2 — Données | Profils joueurs, historique, stats | Fidélisation, valeur croissante |
| V3 — Réseau | Multi-tables, dashboard organisateur | Clubs compétition, fédération |
| V4 — Écosystème | App mobile, caméra, contrat fédéral | Infrastructure nationale |

_Nouveauté :_ Chaque marche finance la suivante. La V1 est faisable maintenant.

---

## Organisation et Priorités

### Thèmes Identifiés

| Thème | Idées | Priorité Nathan |
|---|---|---|
| 1 — Expérience de Jeu (UX/UI) | #11, #12, #16, #17, #23, #24, #25, #26 | ✅ Prioritaire |
| 2 — Présentation & Diffusion | #1, #2, #10, #21, #22 | — |
| 3 — Données & Compétition | #3, #4, #5, #6, #7, #19 | ✅ Prioritaire |
| 4 — Stratégie Business | #8, #9, #13, #14, #15, #20 | — |
| 5 — Vision & Roadmap | #28, #29, #30 | ✅ Prioritaire |

---

## Plans d'Action

### Priorité 1 — Expérience de Jeu (UX/UI)

**Principe directeur :** Simplicité radicale — un joueur de 60 ans, seul, en 30 secondes.

1. Analyser les photos de `explore/resources/` — disposition, hiérarchie de l'info, couleurs des scoreboards physiques existants
2. Définir les 3-4 écrans du flow principal : accueil → config match → saisie → fin de match
3. Créer une maquette basse fidélité avant tout développement
4. Valider avec un vrai joueur de club si possible

### Priorité 2 — Données & Compétition

**Question clé à trancher :** V1 avec stockage local uniquement, ou cloud dès le départ ?

1. Lister exhaustivement tous les modes de jeu officiels du billard français
2. Modéliser le schéma de données : match → sets → reprises → séries → profil joueur
3. Définir le comportement mode invité vs. compte enregistré

### Priorité 3 — Roadmap

**Objectif :** La roadmap est un outil de vente autant qu'un plan technique.

1. Formaliser la roadmap V1→V4 dans le PRD avec critères de passage entre étapes
2. Identifier 2-3 clubs pilotes pour tester le V1
3. Prendre contact avec la fédération française — pas pour vendre, pour comprendre leurs besoins en données

---

## Synthèse de Session

**30 idées générées** sur 3 techniques, organisées en 5 thèmes.

**Découverte clé :** Ce projet n'est pas un scoreboard — c'est l'infrastructure numérique manquante du billard français. Les clubs utilisent encore du papier et des compteurs physiques. La fédération ressaisit les scores manuellement. La barre est basse, le marché est réel, et personne ne l'a encore adressé avec une approche produit moderne.

**Insight inattendu :** Les scoreboards coréens ont déjà l'intégration vidéo — c'est une validation que la V4 est faisable et désirable, pas juste une idée.

**Prochaine étape recommandée :** `/bmad-create-prd` — créer le PRD en s'appuyant sur cette session comme contexte de départ, avec `MECHANICS.md` et les photos de `explore/resources/` comme références.
