# Sprint Change Proposal — Les parties appartiennent au profil joueur, pas à la tablette

**Date :** 2026-09-11
**Auteur :** Nathan (PO) + agent Dev
**Story déclencheuse :** 3.1 — Sauvegarder automatiquement une partie terminée dans l'historique (créée en `ready-for-dev` le 2026-09-11, **non lancée**)
**Classification :** **Major** — replan fondamental : un backend et des comptes joueurs entrent dans le périmètre avant l'historique, alors que la V1 du PRD est « 100 % offline, sans dépendance backend ». Route PM (PRD) + Architecte (backend), puis re-planification des epics.
**Statut :** ✅ **approuvée par Nathan le 2026-09-11**, avec les trois décisions suivantes : (1) **réseau** — un club sans WiFi ne peut ni identifier un joueur ni synchroniser, le jeu reste jouable en invité ; (2) **création du compte** à la tablette ou par une page web minimale (l'app compagnon reste V4) ; (3) **consultation** des parties sur le profil d'abord, sur la tablette du club ensuite. §4.2, §4.4, §4.5, §4.6 appliqués le jour même ; §4.1 (PRD) et §4.3 (architecture) appliqués au niveau des notes datées et des requalifications — le **choix de la plateforme backend** reste à produire par la passe Architecte.

---

## 1. Résumé de la situation

### Problème

À la création de la Story 3.1 (historique local IndexedDB par tablette), Nathan a tranché : **stocker les parties sur une tablette n'a pas de sens**. Dans un club, les joueurs changent de billard ; un historique par appareil ne représente rien pour eux. La cible est le modèle observé en Corée : chaque joueur a un **compte** (créé via une app), il le **connecte sur la tablette** par un code ou en cherchant son nom s'il est déjà enregistré, et **chaque match est retrouvable sur son profil**. À terme, les résultats individuels doivent aussi être consultables sur les tablettes du club. Priorité : **travailler le profil joueur avant le stockage des parties**.

**Type d'enjeu :** pivot de séquencement d'une vision déjà écrite. Le modèle coréen figure dans le PRD (« Modèle d'Authentification (V2+) », Epic 4, Epic 5.2), mais après une V1 « tout local ». Le changement n'invente pas d'exigence : il **avance** les comptes et **retire** l'historique par appareil.

### Preuves

- Nathan, 2026-09-11 : « pour moi ça n'a pas de sens de stocker les résultats des matchs sur une tablette car ça ne représentera rien car les joueurs vont jouer sur différents billards […] c'est plus intéressant de travailler sur un profil joueur qui sera stocké etc… avant de travailler le stockage des parties. »
- Décisions antérieures qui allaient déjà dans ce sens : Story 1.14 annulée (« nom saisi à la main = invité, base joueurs à venir en Epic 4 », 2026-09-10) ; clavier alphabétique incomplet reporté « à revoir avec la base joueurs de l'Epic 4 » (revue 1.4).
- PRD, parcours 1 : « Il retrouve sa partie du mois dernier dans l'historique » — écrit en supposant **une** tablette. Rôle « Invité : joue sans compte — données locales uniquement » — l'invité reste pertinent.
- Epic 3 tel qu'écrit : liste et détail **sur la tablette**, rétention **30 jours**, records **par nom** — trois béquilles d'un monde sans comptes, sans valeur une fois le profil en place.

### Constat factuel

| Élément | PRD / epics | Décision de Nathan |
|---|---|---|
| Historique | Local, par appareil, 30 jours (FR18-20, V1a) | Rattaché au profil joueur, permanent, multi-tablettes |
| Comptes joueurs | V2/V3 (Epic 4), après Epic 3 | **Avant** le stockage des parties |
| Backend | Aucun en V1 (NFR13, « sans dépendance backend ») | Nécessaire pour un profil qui suit le joueur |
| Identification à la tablette | ID court (FR33) | ID/code **ou recherche par nom** d'un joueur déjà enregistré |
| Consultation | Tablette (`/history`, `/history/:id`) | App du joueur d'abord ; tablettes du club « à terme » |
| Story 3.1 | `ready-for-dev` | Ne pas développer telle quelle |

---

## 2. Analyse d'impact

### Checklist (résumé)

| # | Point | Statut |
|---|---|---|
| 1.1-1.3 | Déclencheur, problème, preuves | ✅ Done |
| 2.1 | Epic 3 réalisable tel quel ? | ⚠️ Non — objectif à redéfinir (voir ci-dessous) |
| 2.2-2.5 | Changements d'epics, dépendances, ordre | ⚠️ Action-needed — Epic 4 avant Epic 3, 5.2 déplacée, Epic 3 redéfini |
| 3.1 | PRD | ⚠️ Action-needed — succès utilisateur, roadmap, FR5/FR18-20, NFR13, rôles |
| 3.2 | Architecture | ⚠️ Action-needed — section backend/auth à décider (aujourd'hui « V2+, différé »), `GameRecord` + identifiant joueur, IndexedDB requalifié en file de synchronisation |
| 3.3 | UX | ⚠️ Action-needed — Flow 1 (identification sans casser « 60 ans / 30 s »), zone joueur de l'accueil, fiche HistoryList/GameDetailView, clavier |
| 3.4 | Autres artefacts | ⚠️ Action-needed — RGPD (NFR14-16) activés, hébergement EU, secrets/CI Netlify, `CLAUDE.md` (couche réseau), `deferred-work.md` |
| 4.1-4.4 | Options | Hybride : révision du MVP (Option 3) + ajustement direct des epics (Option 1) ; rollback non viable |
| 6.4 | `sprint-status.yaml` | ✅ Done — appliqué le 2026-09-11 après approbation |

### Impact Epic

- **Epic 1 et Epic 2 (jeu)** — livrés, aucun impact. Ils constituent la V1 « jeu ». Restent les trous déjà consignés (voir §3, étape 1).
- **Epic 3 — Consulter l'historique des parties (V1a)** — **ne peut plus être livré tel quel.** Son objectif (« retrouver ses parties jusqu'à 30 jours en arrière depuis le même appareil ») est invalidé. Redéfinition proposée : **« Parties rattachées au profil joueur »** — enregistrement local à la clôture **avec l'identité des joueurs**, synchronisation vers le profil, consultation depuis le profil (app) puis depuis les tablettes du club. Ce qui survit de la 3.1 : le service Dexie et le `GameRecord`, requalifiés en **file locale d'écriture avant synchronisation** (NFR7 : zéro perte hors ligne) — pas en historique consultable. Ce qui tombe : liste/détail sur tablette **sans identification** (3.2, 3.3), rétention 30 jours (3.4), records par nom (3.5 → statistiques de carrière, Epic 4).
- **Epic 4 — Comptes joueurs & suivi de carrière (V2/V3)** — devient **le prochain epic**, avant l'Epic 3. Il lui manque une story de fondation : **le choix et la mise en place du backend** (plateforme, hébergement EU, modèle d'auth par ID court, modèle de données joueur/partie), aujourd'hui « à décider en phase architecture » et jamais décidé. La 4.2 s'enrichit de la **recherche par nom** demandée par Nathan. La 4.1 doit trancher **où** le compte se crée : l'app compagnon du PRD est un second produit ; une création **depuis la tablette du club** (ou une page web minimale) est le chemin court.
- **Epic 5 — Administration de club** — la **5.2 (synchronisation locale → cloud)** est le prérequis technique de « parties sur le profil » : elle quitte l'Epic 5 pour l'Epic 3 redéfini. Le reste (tables, abonnement, stats d'usage, minuteur) est inchangé et reste après.
- **Epics 6 à 9** — inchangés sur le fond ; l'Epic 6 (overlay/TV) et 7 (arbitre) profiteront du backend une fois en place, l'Epic 9 (export fédéral) devient plus naturel avec des parties rattachées à des joueurs identifiés.
- **Aucun epic supprimé, aucun renuméroté.** Seuls l'**ordre** et le **contenu** des Epics 3 et 4 changent.

### Impact Story

| Story | Impact | Action proposée |
|---|---|---|
| 3.1 (`ready-for-dev`) | Périmètre valable pour la partie « fondation Dexie / `GameRecord` / déclencheur `finishGame` », **invalide** pour l'esprit « historique de la tablette » ; il manque l'identité des joueurs dans l'enregistrement | Repasser en `backlog` ; recadrer après l'Epic 4 (ajout d'un `playerId` par côté, sémantique « file de sync ») |
| 3.2, 3.3 | Liste et détail par appareil, sans identification | Remplacer par « consulter mes parties depuis mon profil » (app) et, plus tard, « depuis une tablette du club, une fois identifié » |
| 3.4 | Rétention 30 jours locale | Remplacer par « la file locale est conservée jusqu'à synchronisation confirmée » |
| 3.5 | Record personnel par nom, sur une tablette | Fusionner dans les statistiques de carrière (4.3/4.4), calculées sur le profil |
| 4.1 | Création de compte « app compagnon (ou parcours équivalent) » | Trancher le canal de création (tablette / web / app) |
| 4.2 | Identification par ID court | Ajouter la **recherche par nom** ; l'invité reste possible |
| 4.3, 4.4 | Stats et évolution | Inchangées sur le fond ; absorbent la 3.5 |
| 5.2 | Sync cloud | Déplacée dans l'Epic 3 redéfini |
| Nouvelle 4.0 | Fondation backend et authentification | À créer (spike/ADR puis implémentation) |
| 1.16 (`ready-for-dev`, reportée) | Aucun | Inchangée |

### Conflits d'artefacts

**PRD** — cinq points :
1. *Critères de succès utilisateur* : « retrouve l'historique d'une partie jouée jusqu'à 30 jours en arrière **depuis le même appareil** » — à remplacer par « retrouve ses parties sur son profil, depuis n'importe quelle tablette ou depuis son app ».
2. *Succès technique* : « PWA installable, 100 % offline en V1, sans dépendance backend » — à requalifier : le **jeu** reste 100 % offline ; les **comptes et l'historique** requièrent le réseau quand il est disponible, avec file locale de synchronisation.
3. *Roadmap* : V1a liste « Historique local — 30 jours minimum » (à retirer) ; V2/V3 porte « Backend cloud + sync », « Profils joueurs », « Modèle coréen » (à avancer dans un nouveau jalon juste après la V1 jeu).
4. *FR5, FR18, FR19, FR20* : « sur l'appareil », « 30 jours » — à réécrire en termes de profil ; FR21/FR22 (V2+) et FR32/FR33/FR36 perdent leur marqueur V2+.
5. *NFR13* « En V1, aucune donnée transmise à un serveur externe » — à borner au jeu ; NFR14-16 (TLS, hébergement EU, suppression en < 3 actions) deviennent **actifs dès le jalon profil**. Le tableau des rôles est conservé (l'invité reste).

**epics.md** — objectif et notes de l'Epic 3 ; stories 3.1-3.5 ; 4.1-4.2 ; 5.2 ; *FR Coverage Map* (FR5, FR18-22, FR32, FR33, FR36) ; *Additional Requirements* AR4/AR6/AR7 (Dexie « historique 30 jours », routes `/history`, `useHistoryStore`) et AR5 (`GameRecord`) à requalifier ; UX-DR20 (état vide de l'historique) déplacé.

**architecture.md** — *Authentification & Sécurité* (« V2+ différé ») et *Décisions Architecturales Fondamentales* (« API backend REST ou tRPC (V2+) », « Validation runtime Zod (V2+) ») : une **décision** est maintenant due — plateforme (critères PRD : coût maîtrisé, EU, déploiement simple), auth ID court sans mot de passe à la tablette, modèle de données joueur/partie, stratégie de sync (file locale Dexie → API). *Architecture des Données* : `GameRecord` + identifiant joueur par côté, section « Historique — IndexedDB » requalifiée en file de synchronisation. *Routing* : `/history` et `/history/:id` conditionnés à l'identification. *Structure* : ajout d'une couche réseau (`services/apiService.ts` ou équivalent), variables d'environnement, secrets sur Netlify.

**ux-design-specification.md** — *Flow 1* : une étape d'identification (code ou recherche par nom) doit entrer dans le parcours **sans casser « 60 ans / 30 secondes »** (l'invité reste le chemin le plus court) ; *HomeScreen / PlayerSetupModal* : la zone joueur ouvre « qui joue ? » (recherche, code, invité) plutôt qu'une simple saisie de nom ; *Flow 3* : « historique local 30 jours » → « profil » ; fiche *HistoryList / GameDetailView* : consultation conditionnée à l'identification ; *AlphaKeyboard* : la recherche par nom rend le tiret et l'apostrophe nécessaires (dette reportée de la 1.4, désormais due).

**Autres** — `CLAUDE.md` (couche réseau, gestion des erreurs réseau, environnement) ; `deferred-work.md` (notes 1.4 clavier, 1.14 renommage, 1.15 « quitter sans récap », 3.1 à requalifier) ; `netlify.toml` / variables d'env ; mentions RGPD (consentement, suppression) à concevoir.

### Impact technique

- Rien à défaire dans le code livré : Epics 1 et 2 ne touchent pas à l'historique. `GameSummary` garde sa prop `records` inerte.
- La 3.1 telle que rédigée resterait techniquement juste (Dexie, `finishGame` comme déclencheur, plain objects, `fake-indexeddb`) mais **incomplète** (pas d'identité joueur) et **mal nommée** (historique vs file de sync). Ne pas la développer avant l'Epic 4 évite une migration de schéma Dexie.
- Nouveau périmètre technique : backend + auth + sync + RGPD. C'est le **premier vrai saut de complexité** du projet (le PRD le classait « Moyenne-Haute en V2+ »). Il justifie une passe d'architecture dédiée avant toute story de code.

---

## 3. Approche recommandée

**Option retenue : hybride — révision du MVP (Option 3) + ajustement direct des epics (Option 1).**

Effort : élevé (backend, auth, sync : plusieurs semaines de dev solo). Risque : moyen (nouvelle couche technique, RGPD), atténué par une passe d'architecture avant le code et par le maintien du jeu 100 % offline. Impact calendaire : la « V1 complète » selon le PRD (jeu + historique local) est **abandonnée** au profit d'une **V1 jeu** (déjà livrée, à consolider) suivie d'un jalon **profil joueur**.

**Justification.** L'historique par appareil ne sert ni le joueur (il change de table), ni le club (les données ne s'agrègent pas), ni la « plateforme déguisée en outil » du PRD (la valeur naît des parties rattachées à des joueurs). Le développer pour le remplacer ensuite serait du travail jeté. À l'inverse, le modèle coréen est déjà la cible écrite du PRD ; l'avancer ne crée pas de dette de vision, seulement un saut technique qu'il faut préparer.

**Alternatives écartées.**
- *Ajustement direct seul* (livrer l'Epic 3 local, puis migrer) — non : double travail, migration de données, et l'historique local serait montré aux clubs pilotes puis retiré.
- *Rollback* — rien à annuler : la 3.1 n'a produit qu'un fichier de story.
- *Profil joueur local à la tablette* (base joueurs sans backend) — contredit le point de Nathan : un profil par tablette ne suit pas le joueur d'un billard à l'autre.

**Séquence proposée.**

1. **Consolider la V1 jeu** — court, avant tout chantier backend, conformément à « des choses plus prio pour une V1 clean ». Candidats déjà consignés, à arbitrer par Nathan (aucun n'est imposé ici) : mécanisme ÉCHANGER mi-reprise (backlog) ; prolongation en cas d'égalité (story à créer, 1.10) ; nombre de sets, FR15 (trou de planification : trancher ou abandonner) ; chrono qui dérive en onglet caché et ne survit pas au rechargement ; veille de la tablette côté accueil ; outillage lint. Et le critère PRD qui manque encore : **un club pilote en usage réel** — faire jouer de vraies parties avant d'ajouter une couche.
2. **Décision d'architecture backend** (Winston / `bmad-create-architecture` en mode révision) : plateforme EU, auth ID court + recherche par nom, modèle joueur/partie, file de sync, RGPD. Livrable : sections « Backend & Authentification » et « Synchronisation » de `architecture.md`, décision datée.
3. **Epic 4 — Profil joueur** : 4.0 fondation backend/auth ; 4.1 création de compte (canal à trancher) ; 4.2 identification à la tablette par code **ou recherche par nom**, invité conservé ; 4.3/4.4 stats de carrière (absorbent la 3.5).
4. **Epic 3 redéfini — Parties rattachées au profil** : 3.1 recadrée (enregistrement local à `finishGame` **avec identifiants joueurs**, file de sync) ; ex-5.2 synchronisation ; consultation depuis le profil (app), puis depuis les tablettes du club.
5. Epics 5 (reste), 6, 7, 8, 9 — inchangés, après.

**Le MVP est affecté.** Le jalon « V1a = jeu + historique local » disparaît. Nouveau découpage proposé : **V1 (jeu, Epics 1-2, livré)** → **V2a (profil joueur & parties, Epics 4 puis 3)** → **V2b (club, Epic 5)** → V3 (diffusion, arbitrage, tournois) → V4 (fédéral). Le critère business « 1 club pilote en usage actif » reste le juge de la V1.

---

## 4. Modifications proposées

*(À appliquer après approbation. Les réécritures de stories 3.x/4.x en détail relèvent d'une passe `bmad-create-epics-and-stories` sur les Epics 3 et 4 une fois le PRD et l'architecture révisés — ci-dessous, le niveau objectif/notes suffit à cadrer.)*

### 4.1 PRD — `prd.md`

**(a) Succès utilisateur**

> **AVANT :** `- Un joueur retrouve l'historique d'une partie jouée **jusqu'à 30 jours en arrière** depuis le même appareil`
>
> **APRÈS :** `- Un joueur identifié retrouve **toutes** ses parties sur son profil, quelle que soit la tablette du club sur laquelle il a joué ; un invité joue sans compte et sans historique`

**(b) Succès technique**

> **AVANT :** `- PWA installable, **100 % offline** en V1, sans dépendance backend`
>
> **APRÈS :** `- PWA installable ; le **jeu** est 100 % offline (démarrer, scorer, terminer une partie ne dépend jamais du réseau) ; comptes et historique passent par le cloud, avec file locale de synchronisation — zéro perte hors ligne`

**(c) Roadmap** — V1a : retirer « Historique local — 30 jours minimum » ; ajouter après V1b un jalon **« V2a — Profil joueur & parties »** : backend cloud EU, compte joueur à identifiant court, identification à la tablette par code ou recherche par nom, invité conservé, parties rattachées au profil et synchronisées, stats de carrière. V2/V3 conserve le reste (club, streaming, arbitrage, tournois). Note datée renvoyant à cette proposition.

**(d) Exigences fonctionnelles**

> **FR5 — APRÈS :** `Un joueur peut démarrer une nouvelle partie sans effacer les parties précédemment rattachées à un profil`
> **FR18 — APRÈS :** `Un joueur identifié peut consulter la liste de ses parties depuis son profil (app), et depuis une tablette du club une fois identifié`
> **FR19 — APRÈS :** `Un joueur identifié peut consulter le détail complet d'une de ses parties passées (reprises, séries, statistiques)`
> **FR20 — APRÈS :** `Les parties rattachées à un profil sont conservées sans limite de durée ; une partie jouée hors ligne est conservée localement jusqu'à sa synchronisation`
> **FR21, FR22, FR32, FR33, FR36 :** retirer le marqueur *(V2+)*, remplacer par *(V2a)*. **FR33 — AJOUT :** `… en saisissant son identifiant **ou en recherchant son nom** parmi les joueurs enregistrés`.

**(e) NFR13**

> **AVANT :** `En V1, aucune donnée transmise à un serveur externe — tout reste sur l'appareil`
>
> **APRÈS :** `Le jeu ne dépend d'aucun serveur : scorer une partie ne transmet rien. Les données de profil et de parties sont transmises uniquement au backend du produit, pour les joueurs identifiés, et jamais pour un invité. NFR14-16 s'appliquent dès V2a.`

### 4.2 Epics — `epics.md`

**(a) Epic 3** — nouveau titre : **« Parties rattachées au profil joueur (V2a) »**. Objectif : « Une partie terminée est rattachée aux profils des joueurs identifiés, conservée localement jusqu'à synchronisation, puis consultable depuis le profil et depuis les tablettes du club. » FRs : FR5, FR18, FR19, FR20, FR36. Notes : dépend de l'Epic 4 ; conserve `databaseService`/`GameRecord` de la 3.1 comme file de sync ; retire routes-sans-identification, rétention 30 j, records par nom. Prérequis affiché : Epic 4 terminé.

**(b) Epic 4** — sous-titre **(V2a)**, placé **avant** l'Epic 3 dans l'ordre d'exécution (numéros conservés). Ajout **Story 4.0 « Fondation backend et authentification »** (plateforme EU, auth ID court, modèle joueur/partie, RGPD de base). **4.1** : canal de création à trancher (note). **4.2** : + recherche par nom, invité conservé, contrainte « 60 ans / 30 s ». **4.3/4.4** : absorbent la 3.5 (record personnel = statistique de carrière).

**(c) Epic 5** — **5.2** déplacée vers l'Epic 3 redéfini (note « déplacée le 2026-09-11 »).

**(d) Stories 3.1-3.5** — 3.1 : note « ⚠️ recadrée le 2026-09-11 : non développée en l'état ; à réécrire après l'Epic 4 avec l'identité des joueurs, comme file locale de synchronisation ». 3.2-3.5 : notes « supersédées / fusionnées » avec renvoi.

**(e) FR Coverage Map, AR4-AR7, UX-DR20** — mises à jour de cohérence (Dexie = file de sync ; routes `/history*` conditionnées ; `useHistoryStore` ; état vide → « aucune partie sur ce profil »).

### 4.3 Architecture — `architecture.md`

- Nouvelle section **« Backend, Authentification & Synchronisation (V2a) »** — **à décider** par une passe d'architecture : plateforme, hébergement EU, auth ID court sans mot de passe à la tablette, recherche par nom, modèle joueur/partie, file locale Dexie → API, gestion hors ligne, RGPD. Cette proposition ne choisit pas la plateforme.
- *Architecture des Données* : `GameRecord` reçoit un identifiant joueur par côté (`null` = invité) et un statut de synchronisation ; « Historique — IndexedDB » requalifié en « File locale de synchronisation ».
- *Authentification & Sécurité* : « V1 : aucune » conservé pour le jeu ; « V2a » remplace « V2+ (différé) ».
- *Routing* : `/history*` conditionnées à l'identification.
- *Structure* : couche réseau (`services/`), variables d'environnement, note `netlify.toml`.

### 4.4 UX — `ux-design-specification.md`

- *Flow 1* : étape « qui joue ? » sur la zone joueur — recherche par nom, saisie d'un code, ou invité (chemin le plus court, sans réseau). Critère inchangé : moins de 30 secondes, sans lecture.
- *PlayerSetupModal / AlphaKeyboard* : tiret et apostrophe (dette 1.4) requis pour la recherche par nom.
- *Flow 3* : « Historique local 30 jours » → « Profil joueur ».
- *HistoryList / GameDetailView* : « consultation des parties du joueur identifié » ; état vide « aucune partie sur ce profil ».

### 4.5 Sprint status — `sprint-status.yaml` (après approbation)

- `3-1-…` : `ready-for-dev` → `backlog` (story recadrée, non lancée) ; `epic-3` : `in-progress` → `backlog`.
- Les stories 3-2 à 3-5 restent `backlog` en attendant la réécriture (clés conservées jusqu'à la passe epics).
- Ajout `4-0-fondation-backend-et-authentification: backlog` ; `5-2` conservée jusqu'au déplacement par la passe epics.
- Commentaire d'en-tête : ordre d'exécution **4 → 3 → 5**.

### 4.6 Story 3.1 — `3-1-sauvegarder-…md`

- Statut → `backlog` ; encadré de tête complété : « ⚠️ Recadrée le 2026-09-11 avant tout dev (voir `sprint-change-proposal-2026-09-11.md`) : les parties se rattachent au profil joueur, pas à la tablette. Le contenu technique (Dexie, `GameRecord`, déclencheur `finishGame`, `fake-indexeddb`) reste valable comme **file locale de synchronisation**, à reprendre après l'Epic 4 avec l'identité des joueurs. »

---

## 5. Handoff

**Classification : Major.**

| Rôle | Responsabilité |
|---|---|
| Nathan (PO) | Approuve ou amende cette proposition ; tranche les trois décisions ci-dessous ; choisit les items de consolidation V1 à traiter avant le chantier profil. |
| PM (John / `bmad-edit-prd`) | Applique §4.1 ; re-baseline des jalons (V1 jeu → V2a profil). |
| Architecte (Winston / `bmad-create-architecture` en révision) | Décision backend/auth/sync (§4.3) — **prérequis** de toute story 4.x. |
| Agent Dev | Applique §4.2, §4.4, §4.5, §4.6 ; met à jour `deferred-work.md` et `CLAUDE.md` ; puis `bmad-create-epics-and-stories` sur les Epics 3 et 4 et `bmad-sprint-planning` pour refléter le nouvel ordre. |

### Décisions attendues de Nathan

1. **Réseau** : accepter qu'un club sans WiFi ne puisse ni identifier un joueur ni synchroniser — le jeu reste jouable en invité. *(Recommandation : oui ; c'est la réalité des systèmes coréens.)*
2. **Canal de création du compte** : app compagnon (second produit, coût élevé), page web minimale, ou création directement à la tablette par le joueur/le club. *(Recommandation : tablette ou web minimal en V2a ; l'app compagnon reste V4 avec l'app mobile joueur du PRD.)*
3. **Consultation sur tablette** : dès V2a (une fois identifié, voir mes parties sur la tablette) ou seulement sur le profil/app d'abord. *(Recommandation : profil d'abord, tablette ensuite — la tablette reste un outil de jeu.)*

### Critères de succès

1. Aucune mention d'« historique par appareil / 30 jours » ne subsiste dans le PRD, `epics.md`, l'architecture et l'UX, hors notes datées.
2. Une décision d'architecture backend datée existe avant la première story 4.x.
3. Le parcours de démarrage reste sous 30 secondes pour un invité comme pour un joueur identifié.
4. Le jeu (Epics 1-2) reste 100 % offline et non régressé.

### Suite immédiate

Approbation de Nathan → application de §4.5 et §4.6 dans la foulée, puis §4.2/§4.4 ; §4.1 et §4.3 par les passes PM et Architecte. Entre-temps, la consolidation V1 (§3, étape 1) peut démarrer sans attendre le backend.
