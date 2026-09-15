# Audit technique du design system — ligne de base de la passe (2026-09-15)

**Auteur :** Amelia (Developer, agent IA) pour Nathan, via `/impeccable audit`
**Périmètre :** `1score/src` tel que livré par l'Epic 10 (commit `a03488e`), lu contre `DESIGN.md` (source unique du visuel) et `PRODUCT.md`
**Rôle du document :** ligne de base **chiffrée** de la passe design system (Epic 11). Chaque story de l'epic cite les constats qu'elle ferme ; l'audit se rejoue en fin d'epic pour mesurer l'écart. Il ne corrige rien.

---

## 1. Scan de référence (détecteur Impeccable)

Trois scans archivés dans `.impeccable/baseline/`, versionnés :

| Scan | Cible | Constats |
|---|---|---|
| `2026-09-15-statique-src.json` | `1score/src` (19 gabarits `.vue`, `main.css`, `index.html`) | 0 |
| `2026-09-15-accueil-1920x1080.json` | `http://localhost:5174/` rendu, format de référence | 3 × `undersized-ui-text` |
| `2026-09-15-accueil-1180x733.json` | idem, format de travail | 3 × `undersized-ui-text` |

Les trois constats sont le **même défaut** : le badge `BIENTÔT` à **10 px** (`SideBar.vue:90` sur deux items, `IconAction.vue:49`), sous le plancher de 11 px du texte fonctionnel. Aucun faux positif.

**Limite du scan d'URL :** l'application n'a qu'une route (`/`) et enchaîne ses écrans par état de store. Le détecteur ne rend donc que l'**accueil**. Les quatre autres écrans (sélection JDS, paramétrage, scoreboard, récap) et les quatre pop-ups sont couverts par le scan statique (0 constat) et par la lecture de code ci-dessous, pas par un rendu outillé. Rendre les écrans adressables au détecteur (paramètre d'URL de développement, ou état injecté) est une tâche de la Story 11.4.

---

## 2. Score de santé

| # | Dimension | Score | Constat clé |
|---|---|---|---|
| 1 | Accessibilité | **3** | Deux couples texte/fond sous AA sur des CTA (P1) ; badge `BIENTÔT` à 10 px |
| 2 | Performance | **4** | — |
| 3 | Responsive (trois formats paysage) | **2** | Toute l'échelle typographique plafonne avant 1280 px : le format de référence 1920×1080 reçoit une UI de tablette |
| 4 | Theming | **2** | 8 tokens morts, 4 « tokens » de position, 11 tailles de texte hors échelle, 7 interlettrages non tokenisés |
| 5 | Intégrité d'implémentation | **3** | Système cohérent et spécifique au produit ; mécanisme et chaînes de classes dupliqués, retour d'appui divergent sur un même CTA |
| | **Total** | **14/20** | **Bon** (dimensions faibles à traiter : responsive et theming) |

### Verdict d'intégrité : **PASS, avec réserves**

L'implémentation exprime un système **propre au produit** et non interchangeable : les deux cartes claires comme seuls aplats, la coupe en biais, le bleu drap mesuré sur le Simonis, les chiffres tabulaires en 900, la règle de la bille. Aucune couleur n'est écrite en dur dans un gabarit (une seule occurrence de `#D0343F` dans `src`, en **commentaire** de `GameSummary.vue:66`) : tout passe par les tokens de `main.css` et les utilitaires Tailwind. C'est la base sur laquelle la passe construit.

Les réserves sont celles que `DESIGN.md` et `integration-bmad-impeccable.md` §6 annonçaient, ici **mesurées** : le système est né écran par écran, et ses répétitions ne sont pas encore des composants.

---

## 3. Résumé

- **Score : 14/20 (Bon).**
- **Constats : 2 P1, 7 P2, 5 P3.**
- **Les cinq à traiter en premier :**
  1. Le libellé des CTA de réglage (`CHANGER DE BILLE`, `CHANGER DE CÔTÉ`) est blanc en `text-stat` 700 (14 à 18 px) sur le stop clair du dégradé bleu : **3,46:1**, sous les 4,5:1 du texte courant.
  2. `DÉMARRER` (`clamp(16px, 1.6vw, 26px)` 900 sur le stop clair du dégradé rouge, **3,78:1**) passe sous AA dès que le texte descend sous 18,66 px, c'est-à-dire aux deux formats iPad (18,1 px à 1133).
  3. L'échelle typographique entière (`clamp()` sur `vw`) atteint son plafond entre 1133 et 1194 px : à 1920×1080, le score, les titres, les libellés et les pictos ont la **même taille en pixels** que sur la tablette, sur un écran presque deux fois plus grand.
  4. Quatre mécanismes et constantes recopiés (fermeture au voile ×4, `ALIGN_CLASSES` ×2, `BALL_PICTOS` ×2, chaîne de classes du CTA de pop-up ×3), et un même CTA neutre qui **s'assombrit** dans trois pop-ups et **s'éclaircit** dans la quatrième.
  5. Huit tokens déclarés et non consommés, quatre `*-popup-inset-*` qui encodent la géométrie d'un écran, deux rouges de même valeur, trois rayons sur des objets tapables.
- **Suite :** les stories 11.1 à 11.4 de `epics.md`, dans cet ordre.

---

## 4. Constats détaillés

### P1 — majeurs (violation WCAG AA, à corriger avant la prochaine livraison)

**[P1] Libellé des CTA de réglage sous AA**
- **Où :** `HomeScreen.vue:80-81` (`SETUP_CTA_CLASSES` : `text-stat font-bold text-white` sur `bg-(image:--gradient-blue)`)
- **Catégorie :** Accessibilité
- **Impact :** les deux réglages du paramétrage se lisent moins bien qu'un texte courant AA, en salle sombre, à 2 m ; le stop clair `#2E8FDB` porte le blanc à 3,46:1, le stop sombre `#0573BB` à 5,03:1 — le dégradé traverse le seuil au milieu du bouton.
- **Standard :** WCAG 1.4.3 (4,5:1 texte courant ; 3:1 seulement à partir de 18,66 px gras)
- **Correction :** l'une des deux, tranchée par la Story 11.1 : monter le libellé en `text-label` (≥ 24 px gras à 1920, donc seuil 3:1, tenu) **ou** assombrir le stop clair de `--gradient-blue` jusqu'à 4,5:1 (≈ `#1F7FC9`, ce qui change toutes les tuiles et tous les CTA bleus — arbitrage de palette, Story 11.2).
- **Commande :** `/impeccable typeset` (11.1) ou `/impeccable colorize` (11.2)

**[P1] `DÉMARRER` sous AA aux formats iPad**
- **Où :** `HomeScreen.vue:517` (`text-[clamp(16px,1.6vw,26px)] font-black` sur `bg-(image:--gradient-red)`)
- **Catégorie :** Accessibilité
- **Impact :** le seul CTA qui engage la partie ; blanc sur le stop clair `#E2515B` = 3,78:1. À 1920 (26 px gras) et 1180 (18,9 px) le texte est « grand » et le seuil 3:1 tient ; à 1133 et 1194 (18,1 et 19,1 px) il oscille autour de 18,66 px, et l'iPad mini échoue.
- **Standard :** WCAG 1.4.3
- **Correction :** plancher du `clamp()` à 20 px, ou taille prise dans l'échelle de la 11.1 (`label`), ce qui règle aussi la taille hors échelle (P2 ci-dessous).
- **Commande :** `/impeccable typeset` (11.1)

### P2 — mineurs (à corriger dans la passe)

**[P2] Badge `BIENTÔT` à 10 px** — `SideBar.vue:90`, `IconAction.vue:49` (`text-[10px]`) ; catégorie Accessibilité ; détecteur `undersized-ui-text` ×3. L'exemption WCAG §1.4.3 des commandes inactives porte sur le **contraste**, pas sur la **taille** : le badge est l'information qui dit « inerte », il doit se lire. Correction : `text-picto` (11 à 12 px, déjà l'échelle des libellés de barre) ou la valeur que la 11.1 fixe pour 1920. `/impeccable typeset` (11.1).

**[P2] Échelle typographique calée sur la tablette** — `main.css:56-65` (`--text-*`), `PlayerPanel.vue` (rampe du score `min(42vw, 40vh, 320px)` et suivantes), `NumericPad.vue:28`, `AlphaKeyboard.vue:45`, `PlayerSetupCard.vue`, `HomeScreen.vue:517` ; catégorie Responsive. Tous les `clamp()` plafonnent avant 1280 px (`text-hero` 56 dès 1120 px, `text-tile-title` 36 dès 1200, `text-label` 24 dès 1200, `text-picto` 12 dès 1091). À 1920×1080, format de **référence** (`PRODUCT.md`), l'UI est celle de la tablette, agrandie de rien : `DESIGN.md` la nomme « dette n° 1 ». Correction : Story 11.1, une échelle unique en `clamp()` dont les plafonds sont **atteints à 1920**, vérifiée au rendu statique aux trois formats. `/impeccable typeset`.

**[P2] Onze tailles de texte hors échelle** — `text-[clamp(24px,2.6vw,40px)]` ×2, `text-[clamp(30px,3.4vw,42px)]`, `text-[clamp(16px,2vw,26px)]`, `text-[clamp(16px,1.6vw,26px)]`, `text-[clamp(24px,10cqw,64px)]`, `text-[40cqmin]`, cinq paliers de score `text-[min(…)]`, plus `text-[10px]` ×2 ; catégorie Theming. Le frontmatter de `DESIGN.md` en a déjà nommé quatre (`key-numeric`, `key-alpha`, `score`, `reprise`) sans que `main.css` les déclare. Correction : chaque taille devient un `--text-*` ou est absorbée par l'échelle (11.1).

**[P2] Sept interlettrages non tokenisés** — `tracking-[0.04em]`, `[0.05em]`, `[0.1em]` ×3, `[0.15em]` ×5, `[0.2em]` ×2, `[0.25em]` ×3, `[0.3em]` ×2 ; catégorie Theming. Aucune règle ne dit lequel va avec quelle taille ; `DESIGN.md` en documente quatre. Correction : deux ou trois valeurs nommées (`--tracking-label`, `--tracking-stat`…) attachées à leur taille (11.1).

**[P2] Mécanismes et constantes dupliqués** — `armBackdropClose`/`disarmBackdropClose`/`closeFromBackdrop` à l'identique dans `ScoreEntryDock`, `NumericPadDock`, `AlphaKeyboardSheet`, `PromptModal` ; `ALIGN_CLASSES` dans `NumericPadDock.vue:40` et `AlphaKeyboardSheet.vue:41` ; `BALL_PICTOS` dans `GameSummary` et `PlayerSetupCard` ; la chaîne `min-h-[var(--size-touch-target)] w-1/3 rounded-key bg-(image:--gradient-neutral) text-label font-black text-white touch-manipulation select-none active:brightness-90` copiée mot pour mot dans `NumericPadDock.vue:149`, `ScoreEntryDock.vue:180`, `AlphaKeyboardSheet.vue:118`, et son pendant accent dans les trois mêmes fichiers ; catégorie Intégrité. Correction : `useBackdropClose()`, un module de constantes, un composant de base **CTA** (strate 3, sans connaissance du jeu) consommé par les quatre pop-ups, `HomeScreen` et `CenterPanel` (11.3). `/impeccable extract`.

**[P2] Retour d'appui divergent sur le CTA neutre** — `PromptModal.vue:91` (`active:brightness-125`, le neutre **s'éclaircit**) contre `NumericPadDock.vue:149`, `ScoreEntryDock.vue:180`, `AlphaKeyboardSheet.vue:118` (`active:brightness-90`, il **s'assombrit**) ; catégorie Intégrité. `DESIGN.md` (« `brightness(1.25)` sur le neutre ») a documenté `PromptModal` et pas les trois hôtes. C'est exactement le défaut d'unité que Nathan nomme (« CTA identiques »). Correction : une valeur, portée par le composant CTA (11.3), `DESIGN.md` mis à jour.

**[P2] Quatre tokens qui sont des positions** — `--setup-popup-inset-left/right`, `--game-popup-inset-left/right` (`main.css:173-185`), consommés par `NumericPadDock.vue:40`, `AlphaKeyboardSheet.vue:41`, `ScoreEntryDock.vue:55` ; catégorie Theming. Ils recopient la largeur de la barre latérale, le padding de `<main>`, la colonne à 1/4 et les 2/5 du scoreboard ; `main.css` lui-même les marque « ⚠️ À faire bouger AVEC cette mise en page ». Un token décrit une intention, pas une géométrie. Correction : la pop-up reçoit la zone libre de son hôte (prop `side` + largeur de la carte visée mesurée, ou un layout `PopupHost` qui la calcule), et les quatre variables disparaissent (11.3). Effet de bord attendu : la largeur des touches alpha (47 px à 1133, sous le plancher de 57 — report de la 10.7) découle de ces insets et se re-mesure à cette occasion.

### P3 — finition

**[P3] Huit tokens morts** — `--color-victory-gold`, `--color-on-victory-gold`, `--gradient-field`, `--color-on-accent`, `--color-on-alert`, `--color-border-strong`, `--breakpoint-lg`, `--text-score` (déclarés dans `main.css`, consommés par aucun gabarit ; mentions résiduelles en commentaire seulement : `CenterPanel.vue:94,135`, `GameSummary.vue:62`) ; `--color-accent` ne sert plus qu'à l'anneau `focus-visible`. Catégorie Theming. Correction : supprimer ou requalifier dans `DESIGN.md` d'abord, puis `main.css` (11.2). Les tests `main.css.test.ts` qui verrouillent certains d'entre eux s'ajustent avec.

**[P3] Deux rouges, trois rayons** — `--color-brand-red` = `--color-victory-ribbon` = `#D0343F`, distinct par décision de Nathan en 10.7 « en attendant que ce document tranche » ; `--radius-container`/`--radius-cta` 0, `--radius-key` 8, `--radius-modal` 12 sur des objets tapables voisins (touches à 8, CTA de pop-up à 8, CTA de barre à 0, pictos d'action à 0). Catégorie Theming. Ce sont les arbitrages ouverts de `DESIGN.md` : Story 11.2, au rendu statique.

**[P3] Ombre de pop-up et filets de lumière en littéraux** — `shadow-[0_32px_80px_rgba(0,0,0,0.65)]` recopié dans les quatre pop-ups ; `shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]` (`DÉMARRER`) et `…0.35)]` (champs) ; catégorie Theming. `DESIGN.md` les nomme déjà (« ombre de pop-up », « filet de lumière »). Correction : `--shadow-popup`, `--shadow-key-relief`, `--shadow-light-edge` (11.2), consommés par le composant CTA et la carte de pop-up (11.3).

**[P3] Hauteurs en dur dans les classes** — `min-h-[110px]` (`DÉMARRER`), `min-h-[130px] max-h-[220px]` (champ de paramétrage), `min-h-[382px]` / `min-h-[288px]` (grilles des claviers), `min-h-[180px]` (tuile), `gap-[12px]` (rangée de pictos, alors que `gap-1.5` vaut 12 px sur la grille de 8). Catégorie Theming. `DESIGN.md` porte `start-button-height: 110px` sans que `main.css` le déclare. Correction : tokens de taille (11.2) ou valeurs de grille (11.3).

**[P3] Redondances de classes** — `touch-manipulation select-none` sur chaque `<button>` alors que `main.css:237-241` pose déjà `touch-action: manipulation; user-select: none` sur `button, [role="button"]` ; `min-width: 320px` sur `html, body, #app` (héritage du gabarit Vite, sans objet en paysage ≥ 1133) ; `CLAUDE.md` §8 impose trois breakpoints mobile-first alors qu'aucun `md:` ni `lg:` n'existe dans `src` et que le produit est paysage seul. Catégorie Intégrité. Correction : nettoyage en 11.3 ; §8 de `CLAUDE.md` à réécrire en « pas de breakpoint d'écran, container queries sur les cartes » (hors périmètre de la purge §7/§10 de ce jour, à traiter avec la 11.3).

---

## 5. Motifs systémiques

- **Le token existe, la règle d'usage n'existe pas.** Tailles, interlettrages, ombres, hauteurs : les valeurs sont nommées dans `DESIGN.md`, absentes de `main.css`, et écrites en `[...]` dans les gabarits. La passe doit **fermer la boucle** : tout ce que `DESIGN.md` nomme, `main.css` le déclare, et aucun gabarit n'écrit une valeur arbitraire de typographie, de rayon ou d'ombre.
- **Les quatre pop-ups sont un patron, pas un composant.** Même voile, même carte, même pied de CTA, même fermeture au tap dehors — recopiés quatre fois. C'est le candidat le plus rentable à l'extraction (strate 3).
- **L'échelle est une échelle de tablette.** Toute la typographie a été validée à 1133/1194 sous Sidecar ; 1920×1080 n'a jamais servi de format de conception, seulement de format de vérification « sans débordement ».
- **Ce qui marche est ce qui est passé par un composant.** `SideBar` (quatre écrans consommateurs, jamais rouvert), `PictoIcon`, `ModeTile`, `IconAction` : zéro constat. La preuve que le modèle tient.

## 6. Ce qui tient, à conserver

- **Zéro couleur en dur dans les gabarits**, tout passe par les tokens ; `@theme static` force leur émission.
- **Sémantique de dialogue** sur les quatre pop-ups (`role`, `aria-modal`, nom accessible par `useId()`), voile sans `role="button"`, aucun piège à focus : cohérent avec la borne fixe.
- **Garde `prefers-reduced-motion` ciblée**, qui conserve le chrono et le rebours, et documente pourquoi.
- **Aucune ressource réseau**, pictos SVG inline, aucune police chargée.
- **Performance** : animations en `transform`/`opacity` seulement, aucun `will-change`, aucun flou, `transition` limitée à l'arc du chrono ; retours d'appui instantanés.
- **Cibles tactiles** : 90 × 90 px tenus sur toute commande de jeu (14 usages de `--size-touch-target`), exception documentée des claviers.
- **Contraste mesuré sur la surface réelle** en 10.7 (bandeaux, box de champ) : cette rigueur est celle qu'il faut outiller en 11.4.

---

## 7. Actions recommandées, dans l'ordre

1. **[P1] `/impeccable typeset`** — Story 11.1 : échelle typographique et interlettrages pour 1920×1080, qui absorbe les onze tailles hors échelle, remonte le libellé des CTA de réglage et le plancher de `DÉMARRER` au-dessus du seuil AA, et sort le badge `BIENTÔT` des 10 px.
2. **[P3] `/impeccable colorize`** puis **`/impeccable document`** — Story 11.2 : palette et rayons arbitrés au rendu statique (deux rouges, trois rayons, `--gradient-bg`, bleu accent), tokens morts retirés, ombres et hauteurs tokenisées ; `DESIGN.md` réécrit **avant** `main.css`.
3. **[P2] `/impeccable extract`** — Story 11.3 : `useBackdropClose()`, constantes partagées, composant CTA de base à retour d'appui unique, carte de pop-up commune, insets rapatriés dans l'hôte ; nettoyage des redondances.
4. **[P2] `/impeccable audit`** rejoué — Story 11.4 : scripts `design:check` aux trois formats, écrans adressables au détecteur, contraste calculé par outil (plus de table manuelle), `ignores` avec `--reason` citant `deferred-work.md`, ré-audit chiffré contre ce document.
5. **`/impeccable polish`** en clôture de chaque story, avant `review`.

> Ces commandes peuvent s'enchaîner une par une, toutes à la fois, ou dans l'ordre que tu préfères. Rejouer `/impeccable audit` après les correctifs donne la mesure de la passe.
