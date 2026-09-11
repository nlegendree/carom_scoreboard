# Sprint Change Proposal — Refonte UI/UX Premium (1Score)

**Date :** 2026-09-11
**Auteur :** Nathan (PO) + agent Dev
**Déclencheur :** Aucune story en cours — brief de refonte visuelle et de navigation produit par Nathan (`explore/basic-ui-brainstorming-2026-09-11.md`), après livraison des Epics 1 et 2, inspiré de captures Billiboard/Cueuny (`explore/resources/`).
**Classification :** **Major** — nouvelle epic transverse à tous les écrans déjà livrés, nouveau primitif de navigation (barre latérale), plusieurs décisions UX déjà actées sont inversées, renommage du produit, et une mécanique de jeu change (interversion bille/côté dissociée, passage de tour). Route : passe UX (révision) puis `create-epics-and-stories` puis `sprint-planning`.
**Statut :** ✅ **décisions tranchées par Nathan le 2026-09-11** (voir tableau ci-dessous), y compris après une relecture écran par écran du brief qui a fait remonter des points de mécanique non couverts au premier passage.

---

## 1. Résumé de la situation

### Problème

Nathan veut qu'une V1 « vitrine, vendable » — interface premium, complète visuellement — soit livrée avant d'attaquer le chantier profil joueur (Epic 4). Le brief `explore/basic-ui-brainstorming-2026-09-11.md` est organisé **écran par écran** (Accueil, JDS, Paramétrage joueurs, Scoreboard, Récap) : Nathan a explicitement demandé qu'on reprenne l'analyse dans cette structure plutôt que par thème transversal, ce qui a fait remonter des changements de mécanique que la première lecture avait lissés en simple relabellisation.

**Type d'enjeu :** nouvelle exigence stratégique (une V1 « vitrine » avant la V1 « profil »), assortie d'un renommage produit, d'un revirement sur plusieurs décisions UX déjà actées, et de deux vraies évolutions de mécanique de jeu (interversion bille/côté, passage de tour).

### Preuves

- Nathan, 2026-09-11 : « j'ai retravaillé totalement les specs de l'UI je pense qu'on va devoir repartir sur une nouvelle EPIC complète » puis, après une première proposition : « enfaite je fais une refonte par écran donc ça vaut le coup de repasser sur chaque écran ».
- Brief `explore/basic-ui-brainstorming-2026-09-11.md`, structuré en 5 sections écran (Accueil, JDS, Paramétrage joueurs, Scoreboard, Récap).
- Décisions déjà actées et redemandées à l'inverse : CTA en texte sans glyphe (Story 1.7, « un mot, pas de glyphe ») ; absence de score restant en JDS (note de périmètre Story 1.6) ; `ÉCHANGER` disponible toute la partie (Story 1.5, confirmé en 1.7) ; passage de tour par tap sur la carte adverse (règle transverse Story 1.5, 2026-09-09, qui conditionne aussi l'Epic 2).

### Constat factuel

| Élément | Spec actuelle | Demande de Nathan | Décision |
|---|---|---|---|
| Navigation | Barre d'action **basse**, permanente, retour toujours à gauche (tous écrans) | Barre latérale **gauche**, **contenu différent selon l'écran** | Nouveau primitif — Epic 10, une déclinaison par écran (voir §2 « Détail par écran ») |
| CTA de jeu (QUITTER/ANNULER/RECOMMENCER/PARAMÈTRES) | Libellé texte, glyphes retirés en revue (Story 1.7) | Pictos seuls | **Picto + petit libellé dessous** |
| Score restant | Aucun en JDS ; `POUR n` propre au 3 Bandes | Un champ « RESTANT » | **RESTANT** (distance − score, permanent, tous modes) est **distinct** de `POUR n` (3 Bandes uniquement, inchangé) |
| Disposition de la carte joueur | En-tête une ligne : nom, moyenne, meilleure série, distance | Bandeau NOM/DISTANCE + RESTANT sous le nom ; MOY/SÉRIE **sous le score central** | **Réorganisation de la carte** — MOY/SÉRIE quittent le bandeau du haut |
| `ÉCHANGER` (bille/côté) en cours de partie | Disponible toute la partie, dans la colonne centrale (Story 1.5, confirmé 1.7) | Absent de la colonne centrale et de la barre basse du scoreboard | **Supprimé en cours de partie** — ne subsiste qu'avant `DÉMARRER` (voir ligne suivante) |
| Interversion au paramétrage | Une seule action (bille **et** côté échangés ensemble) | Deux CTA « CHANGER DE BILLE » et « CHANGER DE CÔTÉ » | **Deux actions indépendantes** — nouvelle mécanique de store, bille et position dissociées |
| Passage de tour | Tap sur la carte du joueur assis (JDS et 3 Bandes, règle transverse Story 1.5) | CTA centrale « PASSER LE TOUR » | **Remplace le tap** — un seul geste officiel désormais |
| Fermer l'application (sidebar Accueil) | N'existe pas | Item de sidebar | **Fonctionnel** — faisabilité technique à vérifier (fermeture d'une PWA installée) |
| Style visuel | Direction « Bloc Plein » : blocs pleine couleur, fond noir | Contours/conteneurs, fond imagé ou dégradé | Raffinement de « Bloc Plein », pas un remplacement |
| Nom du produit | Carom Scoreboard | 1Score ou 1Shot | **1Score** |
| Mode entraînement / Inscription / Configuration | N'existent pas | Nouveaux items de sidebar | **Placeholders inertes « BIENTÔT »** (sauf Fermer l'application, fonctionnel) |
| Modes JDS (Libre/Bande/Cadre/4 Billes) | Cadre 47/2, 47/1, 71/2 déjà couverts par FR12 | Tuile « Cadre » unique ouvrant un choix 47/2, 47/1, 71/2 | Réorganisation de navigation seulement — aucun nouveau scope, FR12 inchangée |

### Détail par écran (relecture du brief)

- **Accueil** — sidebar complète (logo, nom, Mode entraînement, Inscription, **Fermer l'application** — fonctionnel) ; fond imagé/dégradé ; 4 tuiles de mode colorées avec accroche.
- **JDS (sélection de mode)** — sidebar réduite à logo + nom + flèche retour (pas de menu complet ici) ; tuiles Libre/Bande/Cadre(pop-up 47/2·47/1·71/2)/4 Billes ; 3 Bandes saute directement au paramétrage joueurs ; Quilles/Casin en « COMING SOON » (déjà le patron existant).
- **Paramétrage joueurs** — sidebar avec logo + nom + retour + **Configuration** (placeholder) + croix d'annulation en bas ; zone centrale avec **CHANGER DE BILLE** et **CHANGER DE CÔTÉ** comme deux CTA indépendants, puis `DÉMARRER` ; pavé numérique retravaillé (moins « fat », piste : score en fond flouté).
- **Scoreboard** — carte joueur réorganisée (bandeau NOM/DISTANCE, RESTANT sous le nom, MOY/SÉRIE sous le score, `−`/`+` et série/`POUR n` en pied inchangés) ; colonne centrale réduite à REPRISES/CHRONO/**PASSER LE TOUR** (`ÉCHANGER` en sort) ; barre basse avec le CTA de saisie (`+1 ADVERSAIRE` / `+ POINTS ADVERSAIRE`, libellé clarifié mais mécanique inchangée) d'un côté, et QUITTER/ANNULER/RECOMMENCER/PARAMÈTRES en picto + libellé de l'autre.
- **Récap** — style Billiboard actuel conservé, sidebar ajoutée avec Quitter/Recommencer à la place des CTA actuels de la barre basse.

---

## 2. Analyse d'impact

### Checklist (résumé)

| # | Point | Statut |
|---|---|---|
| 1.1-1.3 | Déclencheur, problème, preuves | ✅ Done |
| 2.1-2.5 | Impact epics, nouvel epic, ordre | ⚠️ Action-needed — nouvelle **Epic 10** insérée après l'Epic 2, avant l'Epic 4 (et l'Epic 3 redéfini) |
| 3.1 | PRD | ⚠️ Action-needed — nom du produit, jalon roadmap V1.1 |
| 3.2 | Architecture | ⚠️ Action-needed — dissociation bille/côté dans le modèle joueur, retrait d'`ÉCHANGER` du store en jeu, remplacement du tap par `PASSER LE TOUR`, champ dérivé RESTANT, faisabilité de « Fermer l'application » |
| 3.3 | UX | ⚠️ Action-needed — le plus gros volume : navigation contextuelle par écran, direction visuelle, quasi tous les composants custom |
| 3.4 | Autres artefacts | ⚠️ Action-needed — `deferred-work.md` (un item se ferme de lui-même, d'autres repris), `CLAUDE.md`, manifest PWA / `package.json` (renommage) |
| 4.1-4.4 | Options | **Option 1 — Ajustement direct** : nouvel epic dans la structure existante, aucune story `done` rouverte, aucun rollback |
| 6.4 | `sprint-status.yaml` | À appliquer après approbation (ce document) |

### Impact Epic

- **Epic 1 et Epic 2 (jeu)** — logique de score/persistance globalement inchangée, mais deux mécaniques d'interaction évoluent réellement (voir ci-dessous), pas seulement leur habillage. Tous les composants visuels sont retouchés : `HomeScreen`, `ActionBar`, `PlayerPanel`, `PlayerSetupModal`, `ScoreEntryModal`, `NumericPad`, `CenterPanel`/`ShotClock`, `GameSummary`, `PromptModal`.
- **Nouvelle Epic 10 — Refonte UI/UX Premium (1Score)**, insérée **juste après l'Epic 2, avant l'Epic 4** (et donc avant l'Epic 3 redéfini). Numérotation choisie pour ne renommer aucun fichier de story existant.
- **Epic 3 et Epic 4** — non touchés sur le fond, pas encore de code.
- **Epics 5 à 9** — inchangés. **Aucun epic supprimé, aucun renuméroté.**

### Impact Story

| Story livrée | Composant / mécanique touchée | Nature du changement |
|---|---|---|
| 1.3 | `HomeScreen` | Sidebar complète, tuiles avec accroche/couleur, fond imagé/dégradé, « Fermer l'application » fonctionnelle |
| 1.4 | `PlayerSetupModal`, `NumericPad`, `AlphaKeyboard` | Pavé retravaillé, clavier complété, **`swapPlayers` scindé en deux actions indépendantes** (bille, côté) |
| 1.5, 2.2 | `ActionBar`, `PlayerPanel` | CTA en picto + libellé ; ajout RESTANT ; **retrait de l'état « tapable pour rendre la main »**, remplacé par la CTA `PASSER LE TOUR` ; réorganisation de la carte (MOY/SÉRIE sous le score) |
| 1.5 (règle transverse) | Règle « rentrer sa série, c'est rendre la main » (2026-09-09) | Le geste de passage de tour par tap est retiré ; la règle est réécrite autour de `PASSER LE TOUR` pour JDS et 3 Bandes |
| 1.7 | `CenterPanel` | `ANNULER` déménage vers la barre basse (picto + libellé) ; **`ÉCHANGER` est retiré du composant** (n'existe plus en jeu) |
| 1.10 | `GameSummary`, `PromptModal` | Sidebar ajoutée au récap ; correction de la troncature du nom à 20 caractères |
| 1.15 | `ActionBar` (RECOMMENCER) | Picto + libellé ; nettoyage du markup dupliqué |
| 2.1, 2.4 | `ShotClock`, `CenterPanel` | Layout revu (colonne réduite à REPRISES/CHRONO/PASSER LE TOUR) ; taille de l'anneau réexaminée |

**Effet de bord positif :** en retirant `ÉCHANGER` du jeu en cours de partie, le backlog « `ÉCHANGER` pendant une reprise entamée casse la déduction de la série ouverte » (`deferred-work.md`, revue 2.1+2.2+2.4) devient **sans objet** — le mécanisme incriminé n'existe plus. Item à clore, pas à corriger.

### Conflits d'artefacts

**PRD** — nom du produit (« Carom Scoreboard » → « 1Score ») ; ajout du jalon roadmap **V1.1 — Refonte UI/UX premium**.

**epics.md** — nouvelle section Epic 10 ; notes de supersession sur 1.5/1.7/1.15 (CTA), sur la règle transverse de passage de tour (1.5), et sur l'interversion bille/côté (1.4).

**architecture.md** — trois évolutions réelles à documenter, pas de simple habillage :
1. Modèle joueur : dissociation bille/côté — `swapPlayers()` actuel scindé en deux actions (`swapBallColor`, `swapSides` ou équivalent) ; à traiter en même temps que le nettoyage déjà noté du champ `Player.id` redondant (`deferred-work.md`, revue 1.3), puisque le modèle joueur est de toute façon retouché.
2. Passage de tour : retrait du geste de tap comme déclencheur, `PASSER LE TOUR` devient l'unique action ; impact sur `useGameStore` (l'action existante déclenchée par le tap est remplacée, pas dupliquée) et sur les tests qui simulent ce tap.
3. `ÉCHANGER` retiré du store en cours de partie — seule l'interversion pré-partie (paramétrage) subsiste.
- `PlayerPanel` reçoit en plus un champ dérivé RESTANT (pas de nouvel état persisté).
- « Fermer l'application » : aucune API standard fiable pour qu'une PWA installée se ferme elle-même (`window.close()` ne fonctionne que sur une fenêtre ouverte par script, pas sur l'app installée) — **risque technique à lever en amont du développement**, piste probable : confirmation puis tentative de fermeture avec repli sur un retour à l'accueil du système.

**ux-design-specification.md** — réécriture de la navigation (sidebar **contextuelle par écran**, cf. §1 « Détail par écran ») ; nouvelle direction visuelle en raffinement de « Bloc Plein » ; révision des fiches `ActionBar`, `PlayerPanel` (nouvelle disposition), `CenterPanel` (perte d'`ÉCHANGER`, ajout `PASSER LE TOUR`), `NumericPad`, `GameSummary`, `PlayerSetupModal` (nouvelles CTA bille/côté), `ScoreEntryModal`, `PromptModal`, `AlphaKeyboard`. Renvoyée à la passe `bmad-create-ux-design`.

**deferred-work.md** — à la demande de Nathan, cumul avec la dette déjà consignée qui touche les mêmes composants :
- **Clos automatiquement** : `ÉCHANGER` pendant une reprise entamée (mécanisme retiré).
- **Repris par l'Epic 10** : distance plafond dupliquée (`MAX_DIGITS`/`MAX_TARGET_SCORE`), markup dupliqué de la barre basse, pop-ups sans sémantique de dialogue ni garde `prefers-reduced-motion`, troncature du nom au récap, clavier alphabétique incomplet, taille de l'anneau du chrono, et `Player.id` redondant (à traiter avec la dissociation bille/côté).
- **Non repris**, laissés dans leur file actuelle : chrono non ancré sur l'horloge (dérive en onglet caché — consolidation technique V1), deux joueurs de même nom et renommage en partie (Epic 4).

**Autres** — `CLAUDE.md`, manifest PWA, `package.json` : renommage « 1Score ».

### Impact technique

- Deux évolutions dépassent l'habillage visuel : la dissociation bille/côté (nouvelle action de store) et le remplacement du tap par `PASSER LE TOUR` (retrait d'une action existante). Ni l'une ni l'autre ne touchent la persistance (`GameState`) au-delà de la forme déjà prévue.
- « Fermer l'application » est le seul point à risque technique réel de cette epic — à traiter comme une story courte avec un spike de faisabilité avant de promettre un comportement précis.
- Renommage mécanique mais transverse, à faire en un seul passage.
- Nouvelle sidebar = nouveau composant de coquille d'écran, contextuel par écran plutôt qu'un composant unique — impact sur toutes les vues, pas sur les stores de logique.
- Tests à mettre à jour : ceux qui simulent le tap pour passer le tour (remplacés par un déclenchement de `PASSER LE TOUR`), ceux qui vérifient la disponibilité d'`ÉCHANGER` en jeu (à retirer), ceux qui ciblent des libellés texte de CTA (`ANNULER`, `RECOMMENCER`) devenus picto + libellé.

---

## 3. Approche recommandée

**Option retenue : Ajustement direct (Option 1).** Nouvelle epic dans la structure existante, aucune story `done` rouverte, aucun rollback (rien à défaire, les deux évolutions de mécanique s'ajoutent/remplacent proprement), MVP non remis en cause sur le fond.

**Effort : élevé** (tous les écrans des Epics 1 et 2 sont retouchés, deux mécaniques d'interaction changent réellement, plus un nouveau primitif de navigation contextuel) **risque : moyen** — supérieur à une simple refonte visuelle à cause de la dissociation bille/côté et du remplacement du geste de passage de tour, qui touchent le store et ses tests, pas seulement l'affichage. Le risque business reste faible : aucune règle de calcul de score ne change.

**Alternatives écartées** : amender les Epics 1/2 existants (non, stories `done`, traçabilité BMad à préserver) ; attendre l'Epic 4 (non, contraire à l'objectif « vitrine dès maintenant » de Nathan).

**Séquence proposée.**
1. **Passe `bmad-create-ux-design` en révision** (Sally) : formaliser la navigation contextuelle par écran, la direction visuelle, et détailler précisément les deux mécaniques changées (dissociation bille/côté, `PASSER LE TOUR`) en s'appuyant sur `explore/resources/`.
2. **Passe `bmad-create-epics-and-stories`** sur l'Epic 10, découpée **par écran** comme le brief de Nathan, découpage à valider à cette étape :
   - **10.1 — Accueil** : sidebar complète, « Fermer l'application » fonctionnelle, tuiles colorées, fond dégradé.
   - **10.2 — Sélection de mode JDS** : sidebar réduite, regroupement Cadre, 3 Bandes direct au paramétrage.
   - **10.3 — Paramétrage joueurs** : sidebar + Configuration placeholder + croix d'annulation, pavé retravaillé, `CHANGER DE BILLE`/`CHANGER DE CÔTÉ` indépendants.
   - **10.4 — Scoreboard (JDS et 3 Bandes)** : carte réorganisée (RESTANT, MOY/SÉRIE), colonne centrale réduite, `PASSER LE TOUR` remplace le tap, `ÉCHANGER` retiré, barre basse en picto + libellé.
   - **10.5 — Récap** : sidebar avec Quitter/Recommencer, correction de la troncature du nom.
   - **10.6 — Renommage 1Score** : PRD, `CLAUDE.md`, manifest, `package.json` (transverse).
   - **10.7 — Nettoyage de la dette UI ciblée** : plafonds du pavé, markup dupliqué, sémantique de dialogue, clavier complété, `Player.id`.
3. **Passe `bmad-sprint-planning`** pour insérer l'Epic 10 dans `sprint-status.yaml` (après Epic 2, avant Epic 4/3).

**Le MVP n'est pas affecté sur le fond.** Jalons : **V1 (jeu, livré)** → **V1.1 (Epic 10, vitrine)** → **V2a (profil, Epics 4 puis 3)** → V2b → V3 → V4, inchangés.

---

## 4. Modifications proposées

*(Annotations datées à appliquer immédiatement après approbation ; le détail précis des stories relève des passes `bmad-create-ux-design` puis `bmad-create-epics-and-stories`.)*

### 4.1 PRD — `prd.md`
- Titre et occurrences : « Carom Scoreboard » → « **1Score** ».
- Roadmap : jalon **V1.1 — Refonte UI/UX premium** entre V1 (jeu) et V2a (profil joueur).

### 4.2 Epics — `epics.md`
- Nouvelle section **Epic 10 : Refonte UI/UX Premium (1Score)**, découpée en stories 10.1-10.7 (§3), séquencée après Epic 2, avant Epic 4.
- Notes de supersession sur 1.5, 1.7, 1.15 (CTA), sur la règle transverse de passage de tour (1.5, 2026-09-09), et sur l'interversion bille/côté (1.4).

### 4.3 Architecture — `architecture.md`
- Nouvelle sous-section « Navigation & Shell (Epic 10) » : sidebar contextuelle par écran.
- Modèle joueur : dissociation bille/côté (`swapPlayers` scindé), retrait de `Player.id` redondant.
- `useGameStore` : retrait de l'action déclenchée par le tap de passage de tour, remplacée par `PASSER LE TOUR` ; retrait d'`ÉCHANGER` en cours de partie.
- `PlayerPanel` : champ dérivé RESTANT.
- Note de risque : faisabilité de « Fermer l'application » (pas d'API standard de fermeture d'une PWA installée) — spike à mener avant la story 10.1.

### 4.4 UX — `ux-design-specification.md`
- Renvoyé à la passe `bmad-create-ux-design` dédiée.

### 4.5 Deferred work — `deferred-work.md`
- « `ÉCHANGER` pendant une reprise entamée » marqué **clos** (mécanisme retiré).
- Items listés en §2 « Repris par l'Epic 10 » annotés en conséquence.

### 4.6 Sprint status — `sprint-status.yaml` (après approbation)
- Ajout d'`epic-10` en `backlog` avec ses 7 stories, séquencé après `epic-2` et avant `epic-4`.

---

## 5. Handoff

**Classification : Major.**

| Rôle | Responsabilité |
|---|---|
| Nathan (PO) | A tranché nom, CTA, RESTANT, disposition de carte, sort d'`ÉCHANGER`, `PASSER LE TOUR`, dissociation bille/côté, « Fermer l'application ». Reste à valider le découpage 10.1-10.7 et fournir les assets visuels. |
| UX Designer (Sally / `bmad-create-ux-design`) | Révision complète de la spec UX (§4.4), navigation contextuelle par écran, détail des deux mécaniques changées. |
| Agent Dev | Spike de faisabilité « Fermer l'application » avant la story 10.1 ; développement de l'Epic 10 une fois les stories écrites ; ferme les items de `deferred-work.md` ciblés en §2. |

### Critères de succès

1. Les décisions de la section 1 sont reflétées sans contradiction dans PRD, epics, architecture et UX.
2. Aucune story déjà `done` n'est rouverte.
3. Les règles de calcul de score et la persistance ne changent pas ; seuls le passage de tour et l'interversion bille/côté évoluent, documentés explicitement.
4. `sprint-status.yaml` reflète l'Epic 10 (7 stories) et son ordre d'exécution.

### Suite immédiate

Approbation de Nathan → application de §4.1, §4.2, §4.3, §4.5, §4.6 (annotations datées) → `bmad-create-ux-design` en révision → `bmad-create-epics-and-stories` sur l'Epic 10 → `bmad-sprint-planning`.
