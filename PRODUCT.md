# Product

<!-- impeccable:product-schema 1 -->

> Ce fichier tient le **contexte d'usage** de 1Score pour l'agent de design. Il n'est pas un second PRD : le pourquoi du produit, les jalons et les FR/NFR vivent dans `_bmad-output/planning-artifacts/prd.md` ; le découpage en stories dans `epics.md` ; l'architecture dans `architecture.md` ; la dette dans `deferred-work.md` (règle d'or de `integration-bmad-impeccable.md`, §2). Rédigé le 2026-09-15 à partir de ces documents et d'un entretien avec Nathan ; les réponses de Nathan sont marquées *(confirmé)*.

## Platform

web

## Users

**Michel, joueur de club, 50-70 ans, aucune formation.** Il joue au billard carambole depuis des décennies, a toujours scoré sur un bloc-notes, et se retrouve seul devant une tablette fixée près du billard. Son job : démarrer une partie (mode, noms, distance), saisir chaque série en quelques secondes, corriger sans stress, lire les stats en fin de match. Critère non négociable du PRD : **il démarre une partie seul en moins de 30 secondes**, sans lire de texte explicatif.

**Didier, responsable de club, peu tech.** Reçoit la tablette préconfigurée, la fixe, l'allume ; deux joueurs l'utilisent le soir même sans explication. Il est le client payant (bundle tablette + abonnement SaaS) ; sa fierté de montrer l'outil aux clubs voisins est le vecteur de croissance.

**À partir de V2a (Epic 4) : le joueur identifié.** Compte à identifiant court, créé à la tablette ou sur une page web minimale ; identification par code ou recherche du nom ; l'invité reste le chemin le plus court et le seul disponible sans réseau. Un nom tapé à la main est un invité.

Hors périmètre actuel (V2/V3) : arbitre avec interface déportée, organisateur de tournoi, streameur.

## Product Purpose

Scoreboard tactile pour billard carambole français, PWA installée sur la tablette de club, 100 % offline pour le jeu. Il remplace le bloc-notes : scorer une partie correctement, sans friction, avec total, moyenne et meilleure série calculés sans que personne ne compte. Le succès, c'est une partie démarrée en 30 secondes, zéro perte de données, un club pilote en usage actif — puis, chaque partie enregistrée devenant une donnée, une plateforme pour le sport (profils joueurs, clubs, fédération).

État au 2026-09-15 : V1a + V1b (six modes JDS, 3 Bandes avec chrono) et V1.1 (refonte UI/UX premium « 1Score », Epic 10) livrés ; une passe design system s'intercale avant l'Epic 4 (profil joueur).

## Positioning

- **Accès radical** : le test « 60 ans / 30 secondes » appliqué à chaque écran. Aucun produit concurrent ne le passe ; il n'existe aucun produit équivalent sur le marché français.
- **Plateforme déguisée en outil** : un scoreboard simple dont l'usage quotidien construit la base de données du sport, sur le modèle coréen observé directement (scoring tablette → vidéo → classement national). Le compte suit le joueur d'une tablette à l'autre ; rien n'est stocké « sur la tablette ».
- **Premium dès la vitrine** : un club qui reçoit la tablette doit vouloir la montrer le premier soir (« MVP délectable »).

## Operating Context

- **Salle de billard sombre ou peu éclairée** : l'éclairage est concentré sur le tapis *(confirmé)*.
- **Écran allumé en continu, jamais en veille**, toute la journée d'ouverture ; l'accueil fait office d'écran de veille et de point d'entrée à la fois *(confirmé)*. NFR3 : fluidité maintenue après 8 heures sans rechargement.
- **Lecture debout à ~2 m depuis la table, saisie au doigt sur une tablette fixée sur support**, jamais prise en main *(confirmé)*. Le joueur pense à son jeu, pas à l'outil.
- **Paysage exclusivement** (décision Nathan, 2026-09-11). Formats : **1920×1080** = référence (écran 21,5″/22″ cible, **lui aussi tactile** *(confirmé)*), **1180×733** = format de travail réel de Nathan (iPad Air 4 en Sidecar, Chrome), petit format iPad en plancher (1133×744 / 1194×834). Ni téléphone ni portrait.
- **Borne fixe, sans clavier** : le clavier système est proscrit, toute saisie passe par les claviers dessinés dans l'app. Pas de clavier physique, donc pas de piège à focus ni d'`Escape`.
- **Deux patterns de saisie selon le mode** : JDS = score final de série au pavé numérique, saisie différée ; 3 Bandes = `+1` point par point par le joueur assis, chrono de tir permanent, pavé en secours.
- **Rituel de partie** : accueil → catégorie → mode → paramétrage joueurs (nom optionnel, distance obligatoire, bille et côté dissociés) → scoreboard → récap. Cinq écrans, une coquille commune (barre latérale contextuelle à gauche, contenu à droite).
- **Développement** : solo dev assisté par IA, méthode BMAD ; `npm run dev` depuis `1score/` ; déploiement Netlify sur push de `main`.
- **Références produit observées** : systèmes coréens Cueuny et Billiboard (captures dans `explore/resources/`).

## Capabilities and Constraints

**Livré (Epics 1, 2, 10)** : six modes JDS (Libre, Cadre 47/2, 47/1, 71/2, 1 Bande, 4 Billes) ; 3 Bandes avec chrono ; distance par joueur (handicap implicite) ; saisie au pavé, score négatif, auto-validation temporisée ; undo à deux niveaux (saisie en cours, dernière série) ; `PASSER LE TOUR` ; fin de partie détectée, égalisatrice ; récap automatique (total, moyenne, meilleure série) ; annonce vocale on/off ; alerte d'inactivité ; état sauvegardé après chaque action ; PWA installable, mise à jour appliquée à l'accueil.

**Contraintes techniques durables**
- Aucune ressource réseau au runtime : polices auto-hébergées, jamais de CDN, images en assets locaux ; zéro poids inutile hors ligne.
- Pointer Events sur tout élément tactile (retour < 100 ms), retour haptique.
- Identité de la PWA installée intouchable : `id`, `start_url`, `scope`, nom du manifest, clé `localStorage` `1score:game` (migration obligatoire sinon).
- Cibles Android 10+ et iPad 9e génération+ ; la cible d'installation est Safari/WebKit alors que le développement se fait sous Chrome — **WebKit n'a jamais vu l'UI de l'Epic 10** (contrôle à faire).
- Le jeu (règles, stores, persistance) est hors périmètre de toute passe visuelle.

**Terminologie** (français, libellés d'action en MAJUSCULES) : *reprise*, *série*, *distance* (objectif de score du joueur), *moyenne*, *meilleure série*, *RESTANT*, *JDS* (jeux de séries), *3 Bandes*, *bille blanche / bille jaune* (gauche = blanche, droite = jaune, fixées au côté), *PASSER LE TOUR*, *égalisatrice*, *invité*, *BIENTÔT* (mode visible, atténué, inerte).

**Faits explicitement non décidés** (ne pas inventer) : nombre de sets (FR15) ; règles de 5/9 Quilles et Casin (vitrine BIENTÔT jusqu'à validation fédérale) ; comportement réel de « Fermer l'application » ; police display (système en attendant) ; format du nom affiché pour les noms longs (fixé avec les comptes, Epic 4) ; architecture backend (prérequis de l'Epic 4) ; outillage lint/format.

## Brand Commitments

- **Nom : 1Score** (Story 10.6). L'hésitation 1Score/1Shot est close. Le dépôt GitHub, le dossier local et le site Netlify gardent l'ancien nom `carom_scoreboard` (renommage différé).
- **Voix : esport assumé, partout** *(confirmé)*. L'énergie compétitive des systèmes coréens s'exprime à tous les écrans, pas seulement au récap. Elle ne cède jamais sur la lisibilité à 2 m ni sur le calme de la correction : l'erreur reste réversible, visible, jamais punitive.
- **Assets actuels, non figés** *(confirmé : « pas provisoire, mais tout peut évoluer »)* : monogramme « 1S » blanc sur carré noir (`1score/public/logo.png`), images de billes blanche et jaune (`bille_blanche.png`, `bille_jaune.png`), icônes PWA. À traiter comme la marque en place, sans interdire leur évolution.
- **Direction visuelle acquise, validée au rendu par Nathan (Epic 10)** : paysage seul, angles vifs, palette resserrée bleus / noir-gris / rouge, coupes en biais, modèle Cueuny + Billiboard, référence du drap Simonis Prestige. Elle se **codifie** dans `DESIGN.md`, elle ne se rejuge pas ici.
- **Symétrie stricte des deux joueurs** : mêmes contrôles des deux côtés, seule la bille diffère ; le tour actif se signale par un liseré, jamais par la teinte du bloc.

## Evidence on Hand

- **Références visuelles réelles** : 20 captures et photos de systèmes coréens (Cueuny, Billiboard) dans `explore/resources/`, plus `cueuny.pdf` et `simonis-prestige.gif`. Une photo ou une capture en portrait vaut « intention seule, géométrie à décider au rendu ».
- **Brief écran par écran de Nathan** : `explore/basic-ui-brainstorming-2026-09-11.md`.
- **Assets** : logo, billes, icônes PWA dans `1score/public/`.
- **Qualité** : 704 tests verts, `vue-tsc` et build verts (rétro Epic 10) ; happy-dom ne calcule aucun CSS, donc aucun défaut visuel n'est couvert par les tests.
- **Absences à ne pas fabriquer** : aucune vraie partie jouée en club, aucun club pilote, aucun témoignage, aucune donnée d'usage, aucun chiffre de marché propre, aucune police display choisie, aucun tarif public.

## Product Principles

1. **Le test « 60 ans / 30 secondes » juge chaque écran.** Aucune lecture de texte explicatif pour démarrer ; pictogramme et position suffisent.
2. **L'erreur est réversible et aussi visible que la saisie.** La correction n'est jamais une action avancée ni cachée ; elle ne crée aucune tension entre joueurs.
3. **Le calcul est invisible, le jeu ne dépend jamais du réseau.** Totaux, moyennes, records : le système compte ; scorer ne transmet rien.
4. **Esport partout, lisible à 2 m d'abord.** Le ton compétitif est celui du produit ; il s'arrête là où la lisibilité en salle sombre ou le calme de la correction seraient entamés.
5. **Montrer l'ambition sans mentir.** Ce qui n'est pas livrable reste visible, atténué et inerte ; rien n'est promis à l'écran qui ne fonctionne pas.

## Accessibility & Inclusion

- Public senior, sans stylet : zones interactives **≥ 90 × 90 px** (NFR9) ; exception assumée pour les touches des claviers dessinés (≈ 57 px, comme le clavier natif iPad).
- Scores et statistiques lisibles à **2 m**, contraste **WCAG AA** minimum (NFR10) ; vue salle à 5 m sur 40″ prévue en V2+.
- L'information ne dépend jamais de la couleur seule (BIENTÔT = atténuation **et** badge).
- `prefers-reduced-motion` respecté pour les animations d'ornement ; les animations porteuses d'information (fondu du chrono, barre de rebours d'auto-validation) sont conservées.
- Pas de clavier physique : aucune navigation clavier ni piège à focus attendus (arbitrage « borne fixe »).
