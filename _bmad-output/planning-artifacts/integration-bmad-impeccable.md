# Interconnexion BMAD ↔ Impeccable — méthode pour un design system réutilisable

**Date :** 2026-09-15
**Auteur :** Amelia (Developer, agent IA) pour Nathan
**Statut :** validé par Nathan le 2026-09-15 (décisions du §12 tranchées, voir la note de fin)
**Origine :** rétrospective Epic 10 (`epic-10-retro-2026-09-15.md`, décisions 5 et 6)

---

## 0. Ce que ce document décide

Trois choses, et rien d'autre :

1. **Qui est la source unique de quoi** entre BMAD et Impeccable — c'est le point qui fait échouer ce genre d'intégration.
2. **Quelle commande Impeccable s'appelle à quelle étape BMAD**, sur ce projet précis.
3. **Comment on passe des 17 composants nés de l'Epic 10 à une bibliothèque réutilisable**, avec un garde-fou mécanique au lieu de mesures à la main.

Ce document ne rouvre aucune décision visuelle validée par Nathan. La direction (paysage seul, angles vifs, palette resserrée bleus / noir-gris / rouge, modèle Cueuny + Billiboard) est acquise : l'objectif est de la **codifier**, pas de la rejuger.

---

## 1. Le problème réel

### Ce que BMAD fait bien sur ce projet

Traçabilité des décisions (chaque écart est annoté, daté, attribué), découpage en stories avec critères d'acceptation, revue de code adversariale, backlog unique (`deferred-work.md`), rétrospectives qui suivent leurs propres engagements. Trois epics le prouvent.

### Ce qui lui manque, et que l'Epic 10 a facturé

| Manque | Ce que ça a coûté |
|---|---|
| **Aucun garde-fou mécanique sur le visuel** | 29 couples de contraste calculés **à la main** en 10.7 ; trois échecs AA trouvés à la création de la story, pas par un outil ; touches de clavier sous le plancher tactile découvertes à la dernière story de l'epic |
| **Pas de bibliothèque de composants, seulement des composants** | 4 copies d'`armBackdropClose`, 2 d'`ALIGN_CLASSES`, 2 de `BALL_PICTOS` |
| **Les tokens se décident story par story** | 4 valeurs de jaune joueur, 4 de bleu de CTA, une famille `--gradient-tile-jds-2\|3\|4` créée **et supprimée** dans la même story |
| **Rien ne relie une story à un rendu avant qu'il soit câblé** | ~19 passes de rendu après livraison ; la 2ᵉ passe de la 10.3 a jeté une mise en page entièrement câblée |

### Le risque de l'intégration elle-même

Le visuel est **déjà** décrit à trois endroits : `ux-design-specification.md` (111 Ko), `CLAUDE.md` §7/§10/§11/§12, et les **56 tokens** de `main.css`. Impeccable en ajoute quatre : `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `.impeccable/surfaces/*.md`.

**Sept sources concurrentes, c'est zéro source.** La section 2 est donc la plus importante du document — le reste n'a de valeur que si elle tient.

---

## 2. Règle d'or : une seule source par sujet

| Sujet | Source unique | Les autres |
|---|---|---|
| Pourquoi le produit existe, jalons, FR/NFR | `prd.md` (BMAD) | `PRODUCT.md` **n'est pas** un second PRD : il tient le contexte d'usage pour l'agent de design — salle sombre, lecture à 2 m, doigt sur verre, paysage seul, écran 21,5″ — et **renvoie** au PRD pour le reste |
| Découpage en epics et stories, AC, décisions datées | `epics.md` + fiches de story (BMAD) | inchangé, Impeccable n'y touche pas |
| Architecture technique, store, services | `architecture.md` (BMAD) | inchangé |
| **Tokens, échelle typographique, palette, rayons, espacements** | **`DESIGN.md` + `.impeccable/design.json`** | `main.css` **applique** ces valeurs ; `CLAUDE.md` §7 **renvoie** à `DESIGN.md` au lieu de les redire |
| **Inventaire et contrat des composants réutilisables** | **`DESIGN.md`** (section composants, alimentée par `/impeccable extract`) | `CLAUDE.md` §10 renvoie ; la spec UX garde les **fiches d'intention**, pas les valeurs |
| **Direction visuelle par écran** | **`.impeccable/surfaces/<écran>.md`** | `ux-design-specification.md` redevient ce qu'elle aurait dû rester : **intention d'écran, parcours, règles d'usage** — pas des px |
| Dette, reports, écarts assumés | `deferred-work.md` (BMAD) | les `ignoreRules` / `ignoreValues` d'Impeccable **citent** l'entrée de `deferred-work.md` correspondante |
| Conventions de code, pièges | `CLAUDE.md` | inchangé, sauf §7 et §10 qui deviennent des renvois |

> **Condition d'entrée non négociable.** Si `DESIGN.md` est adopté, la **première tâche** de la passe est de vider `CLAUDE.md` §7/§10 de leurs valeurs et de les remplacer par un renvoi, et de purger `ux-design-specification.md` de ses px au profit d'intentions. Sans ça, on n'a pas intégré deux outils : on a créé une divergence de plus.
>
> C'est exactement la logique de la décision « le backlog, c'est `deferred-work.md`, pas de fichier à part » de la rétro Epic 2.

---

## 3. Cartographie : quelle commande à quelle étape

| Étape BMAD | Commande Impeccable | Ce qu'elle produit | Quand |
|---|---|---|---|
| — (préalable, une fois) | `/impeccable init` | `PRODUCT.md`, `.impeccable/config.json` | au démarrage de la passe |
| — (préalable, une fois) | `/impeccable document` | `DESIGN.md` **généré depuis le code existant** | juste après `init` |
| — (préalable, une fois) | `/impeccable extract` | composants et tokens remontés en design system | après `document` |
| `bmad-create-ux-design` | `/impeccable shape` | `.impeccable/surfaces/<écran>.md` — contrat de direction par écran | à la conception d'un écran |
| `bmad-create-story` | *(rien)* | la story **cite** le surface contract en `[Source: …]`, comme elle cite déjà `epics.md` | à la création |
| `bmad-dev-story`, avant câblage | `/impeccable craft` ou rendu statique | gabarit figé à valider par Nathan | **décision 1 de la rétro Epic 10** |
| `bmad-dev-story`, passe visuelle | `npx impeccable detect <url>` | constats mécaniques (contraste, cibles tactiles, rembourrage, hiérarchie) | à la place des mesures à la main |
| `bmad-dev-story`, finition | `/impeccable polish` | alignement au design system | avant de passer en `review` |
| `bmad-code-review` | `/impeccable critique` + `audit` | `.impeccable/critique/*.md` | en plus des trois relecteurs BMAD, pas à leur place |
| `bmad-retrospective` | — | les rapports `critique/` alimentent le §3 « ce qui a coûté cher » | en fin d'epic |

### Trois correspondances qui tombent juste

1. **`buildPath: "comp"` = la décision 1 de la rétro.** Impeccable distingue `"comp"` (design d'abord, plus lent, plus fidèle) et `"code"` (directement dans le code). La rétro Epic 10 a tranché : **rendu statique validé avant câblage**. Donc `buildPath: "comp"` dans `.impeccable/config.json` — ce n'est pas un réglage d'outil, c'est la décision de Nathan rendue exécutable.
2. **`.impeccable/surfaces/*.md` = un contrat par écran.** Le produit en a exactement **cinq** : accueil, sélection JDS, paramétrage joueurs, scoreboard, récap. Un fichier chacun, et le trou « où vit la direction visuelle de cet écran » se referme.
3. **`detect --json` rend le visuel testable.** Codes de sortie : `0` propre, `2` constats, `1` échec de scan. C'est la première fois que la qualité visuelle de ce projet peut **échouer comme un test échoue**, au lieu d'être vérifiée à l'œil sur trois captures.

---

## 4. Mise en place — la séquence exacte

```bash
# 1. Installer, pour Claude Code, à la racine du dépôt
npx impeccable install --providers=claude --scope=project

# 2. Contexte produit (une fois). Réponses à préparer :
#    public = joueurs de club, 50-70 ans, pas de formation
#    usage  = salle sombre, écran allumé en continu, lecture à 2 m, doigt sur verre
#    format = paysage exclusivement ; cible 21,5"/22" en 1920x1080 ; travail en 1180x733
#    voix   = ~~sobre, aucune animation décorative~~ → **esport assumé partout** (réponse de Nathan à l'init du 2026-09-15 ; l'accueil reste l'écran de veille)
/impeccable init

# 3. Extraire le design system de ce qui existe déjà — NE PAS repartir de zéro
/impeccable document
/impeccable extract

# 4. Premier scan de référence, avant toute correction, pour avoir la ligne de base
npm run dev
npx impeccable detect http://localhost:5173 --json > .impeccable/baseline.json
```

**Points d'attention à l'installation :**

- `/impeccable init` propose `buildPath` → choisir **`comp`**. *(2026-09-15 : non proposé — le chemin comp exige une génération d'images, absente de la session Claude Code ; rien n'est écrit dans `.impeccable/config.json`, le chemin effectif est code-first. La décision 1 de la rétro — gabarit statique validé avant câblage — est une étape du cycle du §5, pas ce réglage.)*
- L'installation pose des **hooks Claude Code** (`hook.enabled`). Sur un projet qui a déjà ses conventions, les laisser actifs au début pour voir ce qu'ils font, et les couper (`hook.enabled: false`) s'ils parasitent le flux BMAD. Un run ponctuel sans hooks : `--settings '{"disableAllHooks": true}'`.
- **Commiter** `.impeccable/config.json`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/surfaces/`. **Ne pas commiter** `.impeccable/*.png`, `review/`, `live/`, `hook.cache.json` — l'outil pose les `.gitignore` qu'il faut, à vérifier.

---

## 5. Le cycle par story, en comp-first

C'est le cycle qui répare les ~19 passes de rendu de l'Epic 10.

```
1. bmad-create-story          → fiche BMAD : AC, périmètre, décisions, pièges
   /impeccable shape          → .impeccable/surfaces/<écran>.md : direction visuelle
   ↳ la fiche cite le surface contract en [Source: …]
   ↳ ⚠️ si la référence est une PHOTO : « intention seule, géométrie à décider au rendu »
   ↳ ⚠️ si le rendu COMBINE deux références : « n'existe nulle part, géométrie à inventer »

2. RENDU STATIQUE            → gabarit figé, données en dur, AUCUN comportement
   ↳ Nathan valide ou casse. On jette ici, pas après câblage.

3. bmad-dev-story            → store, tests, cas — sur un gabarit déjà validé

4. Passe de vérification     → npx impeccable detect sur les 3 formats
   ↳ 1920×1080 (référence), 1180×733 (travail), petit format (plancher)
   ↳ + passe navigateur manuelle pour ce que l'outil ne voit pas (parcours, gestes)

5. /impeccable polish        → alignement au design system avant `review`

6. bmad-code-review          → 3 relecteurs BMAD + /impeccable critique
```

**L'étape 2 est celle qui compte.** Sans elle, le reste n'est qu'un outillage posé sur le même problème.

---

## 6. Des 17 composants à une bibliothèque réutilisable

C'est la demande centrale : *« un design system réutilisable sur toute l'app, avec des composants réutilisables »*.

### État des lieux, sans complaisance

17 composants dans `src/components/`, **une seule vue** (`GameView.vue`), 56 tokens dans `main.css`. Ce n'est pas encore une bibliothèque : c'est un ensemble né écran par écran. Trois symptômes mesurables :

| Symptôme | Preuve |
|---|---|
| **Mécanisme dupliqué** | `armBackdropClose` / `disarmBackdropClose` / `closeFromBackdrop` à l'identique dans `ScoreEntryDock`, `NumericPadDock`, `AlphaKeyboardSheet`, `PromptModal` |
| **Constantes dupliquées** | `ALIGN_CLASSES` (×2), `BALL_PICTOS` (×2) |
| **Tokens qui ne sont pas des tokens** | `--setup-popup-inset-left/right` et `--game-popup-inset-left/right` **recopient la mise en page d'un écran** ; `--game-clock-bleed` couple `ShotClock`, `CenterPanel` et `PlayerPanel` sans qu'aucun ne garantisse la géométrie de l'autre |
| **Doublon sémantique non tranché** | `--color-brand-red` et `--color-victory-ribbon` ont **la même valeur** `#D0343F` et restent **deux tokens**, verrouillé par un test |

### Les quatre strates à poser

**Strate 1 — Primitives (tokens).** Couleur, typographie, espacement, rayon, durée. Règle : un token décrit une **intention** (`--color-brand-red`), jamais une **position** (`--setup-popup-inset-left`). Les quatre `*-popup-inset-*` ne sont pas des tokens : ce sont des calculs de mise en page à rapatrier dans le composant ou dans un layout dédié. Sortie : `DESIGN.md` + `.impeccable/design.json`.

**Strate 2 — Comportements partagés (composables).** Le premier est écrit : `useBackdropClose()` (le report de la revue). Règle : un mécanisme présent dans **deux** composants devient un composable. `useHaptics` et `useTimer` montrent que le projet sait déjà le faire.

**Strate 3 — Composants de base, sans connaissance du jeu.** Déjà là et sains : `PictoIcon`, `IconAction`, `ModeTile`, `SideBar`, `PromptModal`. **`SideBar` est la preuve que le modèle marche** — quatre écrans consommateurs, fichier jamais rouvert après la 10.1. Règle : un composant de cette strate ne connaît ni `useGameStore`, ni les règles de score. `PromptModal` a déjà absorbé trois variantes (décision, liste, `revertible`) sans casser ses six appels : c'est le patron à suivre.

**Strate 4 — Composants métier.** `PlayerPanel`, `CenterPanel`, `GameSummary`, `PlayerSetupCard`, `ShotClock`, les trois hôtes de saisie. Ils connaissent le jeu et **consomment** les strates 1-3.

### Ce que `/impeccable extract` apporte ici

Il remonte composants et tokens vers le design system et les inscrit dans `DESIGN.md`. La valeur n'est pas de découvrir les composants — on les connaît — mais d'obtenir **un contrat écrit et unique** pour chacun : props, variantes, états, tokens consommés. C'est ce qui manque aujourd'hui, et c'est ce qui permet à un agent d'en réutiliser un **sans relire son code**.

### Le critère de réussite, mesurable

> La prochaine story qui ajoute un écran (l'identification joueur de l'Epic 4) doit se construire **sans créer un seul composant de strate 3** et **sans ajouter un seul token**.

Si elle y arrive, le design system existe. Sinon, il manque une brique — et on saura laquelle.

---

## 7. Le garde-fou mécanique

Deux scripts dans `1score/package.json` :

```json
{
  "scripts": {
    "design:check": "impeccable detect http://localhost:5173 --json",
    "design:check:file": "impeccable detect src --json"
  }
}
```

**Où il tourne :** sur `npm run dev`, aux **trois formats du harnais** (1920×1080 en référence, 1180×733 en format de travail, un petit format en plancher). Le scan d'URL lit le **DOM rendu et la mise en page calculée** — donc il voit ce que happy-dom ne verra jamais. C'est la réponse directe au constat de la rétro : *« 704 tests ne protègent d'aucun défaut visuel »*.

**Ce qu'il attrape et qui a vraiment coûté dans l'Epic 10 :**

| Règle du détecteur | Défaut réel de l'Epic 10 |
|---|---|
| contraste insuffisant | trois échecs AA trouvés à la main en 10.7 (ruban de victoire, barre de rebours, placeholders) |
| cibles tactiles trop petites | touches du clavier alpha à **47×57 px** sur iPad, sous le plancher, découvert à la dernière story |
| rembourrage insuffisant / rythme | débordements trouvés au navigateur en 10.1 et 10.3 |
| hiérarchie de titres | — |

**Ce qu'il n'attrapera pas**, et qu'il ne faut pas lui demander : l'anneau qui recouvre le liseré, le médaillon qui déborde de sa carte, `CHANGER DE CÔTÉ` qui fait voyager les billes. Ce sont des défauts de **géométrie inventée** et de **logique**, pas de conformité. La passe navigateur manuelle reste obligatoire.

---

## 8. Écarts assumés : les encoder, pas les subir

Le détecteur d'Impeccable est calibré sur le web/SaaS. Il **va** signaler des choix validés par Nathan :

| Ce qu'il signalera | Décision du projet |
|---|---|
| police système / `Inter` | `system-ui` assumé en 10.1, en attendant une police display |
| noir pur ou quasi | `--color-sidebar` `#101318`, `--gradient-bg` gris → noir — l'écran vit en salle sombre |
| texte gris sur fond coloré | opacités réduites sur cartes joueur, **toutes mesurées AA** en 10.7 |
| accroche `ModeTile` à 3,46:1 | écart connu, **affichée par aucune tuile**, consigné dans `deferred-work.md` |
| commandes inactives sous le seuil | `disabled:opacity-30`, `BIENTÔT` à `opacity-45` — exclus par WCAG §1.4.3 |

**La méthode**, qui colle à la culture du projet (« écart assumé, annoté, daté ») :

```bash
npx impeccable ignores add-value "system-ui" --reason "Police display non choisie — décision Nathan 10.1, deferred-work.md"
npx impeccable ignores list
```

Règle : **aucune suppression sans `--reason`**, et la raison cite l'entrée de `deferred-work.md` ou la décision d'`epics.md`. Pour un cas ponctuel, le commentaire en ligne : `<!-- impeccable-disable rule-name: raison -->`.

Un `ignoreRules` sans raison est une dette silencieuse — exactement ce que ce projet n'a jamais accepté.

---

## 9. Ce qu'Impeccable ne remplace pas

Honnêtement, et c'est important pour ne pas se tromper d'attente :

- **Il n'aurait évité aucune des ~19 passes de rendu de l'Epic 10.** L'échelle typographique pour un 21,5″ à 2 mètres est un **arbitrage d'usage** ; l'anneau + liseré était une **géométrie inventée**. Ni l'un ni l'autre n'est un problème de design system.
- **Il ne décide pas la direction.** Angles vifs, palette resserrée, modèle Cueuny/Billiboard : c'est déjà tranché et validé au rendu. Il la **codifie**.
- **Il ne remplace ni les 704 tests, ni la revue de code BMAD**, ni la passe navigateur manuelle.
- **Il ne connaît pas les règles du billard.** `src/stores/` reste hors de sa portée — et cette epic a prouvé que c'est exactement la frontière à tenir.

---

## 10. Risques et précautions

| Risque | Gravité | Traitement |
|---|---|---|
| **Sources de vérité multipliées** | 🔴 élevé | Section 2, appliquée **avant** toute autre tâche de la passe |
| **Support Vue non confirmé** (doc centrée React) | 🟠 moyen | Utiliser `document` / `extract` / `audit` / `critique` / `typeset` (basés DOM et tokens) ; **ne pas** lui laisser écrire des composants Vue sans relecture |
| **Faux positifs contre des décisions validées** | 🟠 moyen | Section 8 : `ignores` documentés dès le premier scan |
| **Live mode exécute `impeccable:manual-edit-validate`** depuis `package.json` avec tes permissions | 🟠 moyen | Ne pas définir ce script, ou le relire avant d'utiliser le live mode |
| **Hooks Claude Code parasitant le flux BMAD** | 🟡 faible | `hook.enabled: false` si gêne ; `--settings '{"disableAllHooks": true}'` pour un run |
| **Détecteur qui devient un but en soi** | 🟠 moyen | Le critère de réussite est celui du §6 (un écran de plus sans nouveau composant ni token), pas « zéro constat » |
| **Scan d'URL et CSS cross-origin** | 🟡 faible | Scanner `localhost` en dev, pas le site Netlify |

---

## 11. Démarrage — ce qui se fait dans l'ordre

1. **Pousser `main`** (2 commits en attente : revue Epic 10 + rétrospective).
2. **Contrôle WebKit gratuit** : `npm run dev`, ouvrir dans **Safari sur le Mac**. À faire avant d'outiller quoi que ce soit — si `@container` ou `clip-path` cassent sur le moteur cible, ça change le périmètre de la passe.
3. `npx impeccable install --providers=claude --scope=project`, puis `/impeccable init` avec `buildPath: "comp"`.
4. `/impeccable document` puis `/impeccable extract` → `DESIGN.md`.
5. **Scan de référence** aux trois formats, `--json`, archivé comme ligne de base.
6. **Appliquer la section 2** : `CLAUDE.md` §7/§10 réduits à des renvois, spec UX purgée de ses px. *C'est la tâche qui conditionne tout le reste.*
7. **Découper la passe en stories BMAD** avec `DESIGN.md` comme spec :
   - **échelle typographique pour 1920×1080** (dette n°1 : `text-hero` 56, `text-tile-title` 36, `text-picto` 12, score plafonné à 320 px, tous calés sur la tablette) ;
   - **palette arbitrée** (les deux rouges de valeur identique, les trois exceptions aux angles vifs `--radius-modal` 12 / `--radius-key` 8) ;
   - **`useBackdropClose()` + constantes partagées** (4 copies, 2 doublons) ;
   - **les quatre `*-popup-inset-*` sortis des tokens** ;
   - **contraste outillé** en remplacement de la table manuelle.
8. **Vérifier le critère de réussite** sur la première story de l'Epic 4 : un écran de plus, zéro composant de strate 3 créé, zéro token ajouté.

---

## 12. Décisions attendues de Nathan

1. **Adopter `DESIGN.md` comme source unique du visuel**, avec la purge de `CLAUDE.md` §7/§10 et de la spec UX que ça implique — ou renoncer à l'intégration. *Il n'y a pas de demi-mesure viable ici.*
2. **`buildPath: "comp"`** confirmé (cohérent avec la décision 1 de la rétro).
3. **Périmètre de la passe** : les cinq chantiers du point 7, ou un sous-ensemble.
4. **Le contrôle WebKit** (point 2) est-il dans la passe ou traité à part ?

---

## 13. Décisions prises par Nathan (2026-09-15, à l'`init`)

1. **DESIGN.md source unique du visuel : oui.** `/impeccable document` s'enchaîne immédiatement ; la purge de `CLAUDE.md` §7/§10 et des px de la spec UX est la première tâche de la passe (§2).
2. **`buildPath: "comp"` : sans objet** dans cette session (voir la note du §4). Le gabarit statique avant câblage reste obligatoire.
3. **Périmètre de la passe, dans les mots de Nathan :** *« la création d'un vrai design system : réutilisation de composants, identicité des composants (CTA identiques, mêmes arrondis), il faut qu'il y ait une unité, mêmes couleurs, etc. Tout ce qui fait une belle interface de jeu agréable à jouer. »* Les cinq chantiers du §11.7 sont des moyens ; le critère est l'**unité** — un seul CTA, un seul rayon, une seule palette, partout — et le plaisir de jeu.
4. **Contrôle WebKit : à part, plus tard.** Reste une action de la rétro Epic 10, hors passe.

Note d'`init` : `PRODUCT.md` écrit à la racine ; `.impeccable/live/config.json` posé (mode live inerte tant qu'il n'est pas lancé, aucun script `impeccable:manual-edit-validate` défini).

