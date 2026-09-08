# Sprint Change Proposal — Extension du catalogue de modes de jeu

**Date :** 2026-09-08
**Auteur :** Nathan (PO) + agent Dev
**Story déclencheuse :** 1.3 — Sélectionner un mode JDS et démarrer une partie (statut `review`)
**Classification :** Moderate — réorganisation de backlog et mise à jour d'artefacts, sans replan fondamental

---

## 1. Résumé de la situation

### Problème

Pendant la revue UI de la Story 1.3, Nathan a demandé d'étendre immédiatement la liste des modes de jeu au-delà du périmètre prévu, afin de valider dès maintenant le **mécanisme de sélection** qui devra porter tous les modes à terme. L'écran d'accueil présente désormais 4 catégories et 10 modes, alors que le PRD acte un périmètre V1 limité à « JDS (Libre/Cadre/Bande) + 3 Bandes ».

**Type d'enjeu :** nouvelle exigence produit émergée en cours d'implémentation (pas une erreur technique, pas un échec d'approche).

### Comment le problème est apparu

La Story 1.3 devait livrer une modale de sélection à 3 boutons (Libre, Cadre, Bande). Après démonstration visuelle, Nathan a réorienté l'UI vers les références coréennes CUESCO/Billiboard, ce qui a conduit à :

- fusionner l'écran de veille et la sélection de mode,
- structurer la sélection en 2 niveaux (catégorie → mode),
- et donc à devoir peupler ces catégories avec la liste réelle des modes du carambole.

### Constat factuel

| Élément | État PRD/epics | État du code livré |
|---|---|---|
| Modes JDS | Libre, Cadre, Bande (3) | Libre, Cadre 47/2, Cadre 47/1, Cadre 71/2, 1 Bande, 4 Billes (6) |
| 3 Bandes | Epic 2 (V1b) | Catégorie visible à l'accueil, désactivée |
| Quilles | Hors scope V1, règles inconnues | Catégorie visible, désactivée, 5 et 9 Quilles |
| Casin | Hors scope V1, règles à valider | Catégorie visible, désactivée |
| Couleur joueur | UX-DR2 : 4 couleurs tirées par partie | Bille fixe par côté (blanc/jaune) |

---

## 2. Analyse d'impact

### Impact Epic

- **Epic 1 (V1a)** — reste réalisable tel quel. Aucune story ne devient caduque. Deux stories voient leur périmètre précisé (1.4, 1.15) et deux ont reçu une amorce d'UI (1.5, 1.8).
- **Epic 2 (V1b, 3 Bandes)** — inchangé sur le fond. La sélection du mode passera par le catalogue existant : la Story 2.1 devra basculer `available: true` sur la catégorie plutôt que créer son propre écran de sélection. C'est une simplification, pas un surcoût.
- **Epics 3 à 9** — aucun impact.
- **Aucun nouvel epic n'est nécessaire** (décision PO : Quilles et Casin restent des emplacements vitrine sans engagement de livraison).
- **Aucun changement de séquencement ni de priorité.**

### Impact Story

| Story | Impact | Action |
|---|---|---|
| 1.3 | Périmètre élargi, déjà implémenté et validé visuellement | Aligner les AC dans `epics.md` sur la story détaillée |
| 1.4 | Doit désormais gérer une distance de jeu **par mode** | Étendre les AC (décision PO) |
| 1.5 | Emplacement du CTA de saisie déjà réservé dans la barre d'action | Note de contexte, pas de changement d'AC |
| 1.8 | Bouton ANNULER déjà présent, désactivé, non branché | Note de contexte, pas de changement d'AC |
| 1.15 | Bouton QUITTER déjà présent, sans confirmation | Préciser que la story ajoute le garde-fou |
| 2.1 | Réutilise le catalogue au lieu d'un écran dédié | Note de contexte |

### Conflits d'artefacts

**PRD** — 3 conflits directs :
1. Liste des modes JDS du périmètre V1a (3 modes déclarés vs 6 livrés).
2. Tableau « Modes de Jeu et Mécaniques de Saisie » : ne connaît ni les variantes de Cadre, ni 4 Billes, ni 9 Quilles.
3. Phrase « Périmètre V1 : JDS (Libre/Cadre/Bande) + 3 Bandes uniquement » : à requalifier pour distinguer *jouable* et *visible en vitrine*.

**epics.md** — FR12 énumère « Libre, Cadre ou Bande ». UX-DR2 et UX-DR14 ont **déjà été corrigés** pendant l'implémentation (convention de bille fixe, liseré rouge).

**architecture.md** — le snippet `GameState` (L167-190) est dépassé : `GameMode` à 4 valeurs, pas de `PlayerColor`, pas d'`activePlayer`, pas de `targetScore`. La liste des composants V1a cite `ModeSelector.vue`, remplacé par `HomeScreen.vue`, et ignore `ActionBar.vue`.

**ux-design-specification.md** — UX-DR2/UX-DR14 déjà alignés. Il manque la description du pattern d'accueil à 2 niveaux et de la barre d'action persistante.

### Impact technique

Aucune dette introduite. Le catalogue `GAME_CATEGORIES` est déclaratif : ajouter un mode ou activer une catégorie est une modification de données, pas de logique. Les 6 jeux de séries partagent le même moteur de saisie, donc leur activation n'ajoute aucun code.

Deux anticipations mineures à assumer explicitement :
- `targetScore` est câblé à 20 en dur (sera piloté par la Story 1.4) ;
- `resetGame()` s'exécute sans confirmation (garde-fou attendu en Story 1.15).

---

## 3. Approche recommandée

**Option retenue : Ajustement direct (Option 1).**

Effort : faible. Risque : faible. Impact calendaire : nul.

**Justification.** Le changement n'invalide aucun travail réalisé et ne remet en cause ni les objectifs du PRD, ni le MVP, ni l'architecture. Il élargit une liste de données et documente une convention UI. Les alternatives ont été écartées :

- **Rollback** — non viable et non souhaitable : le code livré est validé visuellement par le PO et constitue une amélioration nette de l'UX. Rien à annuler.
- **Révision du MVP** — disproportionné : le MVP « démarrer et jouer une partie JDS en moins de 30 secondes » est inchangé. Seule la liste des modes proposés s'allonge, sans ajout de moteur de score.

**Le MVP n'est pas affecté.** Le périmètre *jouable* de V1a reste les jeux de séries ; ce qui change, c'est qu'il en compte 6 au lieu de 3, tous servis par le même mécanisme de saisie.

---

## 4. Modifications proposées

### 4.1 PRD — `prd.md`

**(a) Périmètre V1a, liste des modes**

> **AVANT :** `- Modes JDS : Libre, Cadre, Bande — interface de saisie unique (pavé numérique, score final de série)`
>
> **APRÈS :** `- Modes JDS : Libre, Cadre 47/2, Cadre 47/1, Cadre 71/2, 1 Bande, 4 Billes — interface de saisie unique (pavé numérique, score final de série), identique pour les six modes ; seule la distance de jeu par défaut les distingue`

*Rationale :* les 6 modes partagent le même moteur ; les livrer ensemble ne coûte rien de plus et correspond à l'usage réel en club.

**(b) Hors scope V1a**

> **AVANT :** `**Hors scope V1a :** timer, mode 3 Bandes, Casin, 5 Quilles, comptes cloud, vue TV, overlay stream`
>
> **APRÈS :** `**Hors scope V1a :** timer, mode 3 Bandes, Casin, Quilles, comptes cloud, vue TV, overlay stream. 3 Bandes, Quilles et Casin apparaissent à l'écran d'accueil comme **emplacements vitrine désactivés** (marqués « BIENTÔT ») : ils donnent à voir l'ambition du produit sans engagement de livraison en V1a.`

**(c) Tableau « Modes de Jeu et Mécaniques de Saisie »**

> **APRÈS :** remplacer les lignes Libre/Cadre/Bande par les six modes de la famille JDS (Libre, Cadre 47/2, Cadre 47/1, Cadre 71/2, 1 Bande, 4 Billes — tous : saisie score final au pavé, pas de timer, séries 10–100+), et ajouter une ligne `9 Quilles` à côté de `5 Quilles` (famille et mécanique à définir).

**(d) Périmètre V1 — requalification**

> **AVANT :** `**Périmètre V1 :** JDS (Libre/Cadre/Bande) + 3 Bandes uniquement. 5 Quilles et Casin complet hors scope jusqu'à validation des règles officielles.`
>
> **APRÈS :** `**Périmètre V1 jouable :** les 6 modes JDS (V1a) + 3 Bandes (V1b). **Visible mais désactivé :** Quilles (5 et 9) et Casin, présentés en vitrine à l'accueil jusqu'à validation des règles officielles par la fédération. Aucune story n'est ouverte sur ces deux modes tant que leurs règles ne sont pas documentées.`

### 4.2 Epics — `epics.md`

**(a) FR12**

> **AVANT :** `- FR12 : Un joueur peut sélectionner un mode JDS — Libre, Cadre ou Bande — avec reprises, séries entières, calcul de moyenne et meilleure série`
>
> **APRÈS :** `- FR12 : Un joueur peut sélectionner un mode JDS — Libre, Cadre 47/2, Cadre 47/1, Cadre 71/2, 1 Bande ou 4 Billes — avec reprises, séries entières, calcul de moyenne et meilleure série. Les six modes partagent le même mécanisme de saisie ; seule leur distance de jeu par défaut diffère.`

**(b) Story 1.4 — nouveau critère d'acceptation**

> **AJOUT :**
> `**Given** un mode JDS sélectionné`
> `**When** j'accède aux options de format`
> `**Then** l'objectif de score est pré-rempli avec la distance de référence du mode choisi (portée par le catalogue `GAME_CATEGORIES`), et reste librement modifiable`

*Rationale :* décision PO — éviter une story supplémentaire, et servir l'objectif « démarrer en moins de 30 secondes » en évitant une saisie systématique.

**(c) Story 1.15 — précision de périmètre**

> **AJOUT en note :** `Le bouton QUITTER de la barre d'action existe depuis la Story 1.3 et réinitialise la partie sans confirmation. Cette story ajoute le garde-fou (confirmation avant abandon), elle ne crée pas le bouton.`

**(d) Story 2.1 — précision de périmètre**

> **AJOUT en note :** `La sélection du mode 3 Bandes se fait via le catalogue de l'écran d'accueil livré en Story 1.3 : il suffit de basculer `available: true` sur la catégorie. Cette story n'a pas à créer d'écran de sélection.`

**(e) UX-DR2 et UX-DR14** — *déjà mis à jour pendant l'implémentation de la Story 1.3.* Aucune action supplémentaire.

### 4.3 Architecture — `architecture.md`

**(a) Snippet `GameState` (L167-190)** — aligner sur `src/types/game.ts` : `GameCategoryId`, `GameMode` à 10 valeurs, `PlayerColor = 'white' | 'yellow'`, `Player.color`, `GameState.activePlayer` et `GameState.targetScore`.

**(b) Composants principaux V1a**

> **AVANT :** `- ModeSelector.vue — modal sélection mode de jeu`
>
> **APRÈS :** `- HomeScreen.vue — écran d'accueil : veille, sélection catégorie → mode, saisie des joueurs`
> `- ActionBar.vue — barre d'action basse commune à tous les écrans (retour, CTA contextuels)`

**(c) Routing** — noter que seule la route `/` est implémentée en V1a, `/history` et `/history/:id` arrivant avec l'Epic 3.

### 4.4 UX — `ux-design-specification.md`

**(a) Ajouter le pattern d'accueil** : écran de veille avec bandeau bas de cartes catégorie (référence Billiboard), navigation à 2 niveaux, catégories indisponibles affichées et grisées.

**(b) Ajouter la règle de navigation** : barre d'action basse présente sur **tous** les écrans, y compris le scoreboard, le retour occupant toujours la même position.

### 4.5 Sprint status — `sprint-status.yaml`

**Aucune modification structurelle.** Aucun epic ni story ajouté, supprimé ou renuméroté (conséquence directe de la décision « vitrine sans story »).

---

## 5. Handoff

**Classification : Moderate** — mise à jour d'artefacts de planification et précisions de backlog, sans replan.

| Rôle | Responsabilité |
|---|---|
| Agent Dev | Applique les modifications 4.1 à 4.4 sur les documents. Aucun changement de code : le code est déjà conforme à la cible. |
| Nathan (PO) | Valide la proposition. Reste décisionnaire sur l'ouverture éventuelle de stories Quilles/Casin quand les règles fédérales seront disponibles. |

### Critères de succès

1. Aucune contradiction restante entre le PRD, `epics.md` et le comportement réel de l'application.
2. La Story 1.4 porte explicitement la distance par défaut par mode avant d'être développée.
3. Un futur code-review de la Story 1.3 ne peut plus conclure à une violation d'UX-DR2 ou du périmètre des modes.
4. Le statut « vitrine » de Quilles et Casin est écrit noir sur blanc, pour qu'aucune session future ne les prenne pour un engagement de livraison.

### Suite immédiate

Story 1.3 reste en `review` — le code-review peut être lancé une fois ces documents alignés.
