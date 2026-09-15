---
name: 1Score
description: Scoreboard tactile de billard carambole — un tableau d'affichage de compétition dont les cartes joueur sont seules en pleine lumière.
colors:
  blanc-pur: "#FFFFFF"
  jaune-franc: "#FFE000"
  encre-noire: "#000000"
  blanc-bandeau: "#ECECEC"
  jaune-bandeau: "#E6CA00"
  blanc-casse: "#F2F0EA"
  rouge-vif: "#FF2D46"
  rouge-alerte: "#FF3B30"
  rouge-profond: "#D0343F"
  rouge-profond-victoire: "#D0343F"
  rouge-clair: "#E2515B"
  bleu-clair: "#2E8FDB"
  bleu-drap: "#0573BB"
  bleu-moyen: "#0668AD"
  bleu-sombre: "#033F6B"
  bleu-nuit: "#05508A"
  bleu-abysse: "#022B4D"
  bleu-accent-focus: "#1E88E5"
  noir-bleute: "#0D1117"
  noir-barre: "#101318"
  anthracite-chrono: "#1C1F25"
  anthracite-touche: "#2E333B"
  anthracite-touche-active: "#3C434D"
  gris-ardoise: "#3A4049"
  gris-ardoise-sombre: "#262A31"
  gris-panneau: "#3A3F49"
  gris-panneau-sombre: "#23262C"
  gris-fond-clair: "#2A2E35"
  gris-fond-sombre: "#111317"
  surface-voilee: "rgba(255, 255, 255, 0.06)"
  filet: "rgba(255, 255, 255, 0.18)"
  filet-fort: "rgba(255, 255, 255, 0.40)"
  voile: "rgba(0, 0, 0, 0.25)"
typography:
  score:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "min(42vw, 40vh, 320px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  reprise:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(48px, 7.5vw, 120px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  hero:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(40px, 5vw, 56px)"
    fontWeight: 900
    lineHeight: 1.25
  title:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(28px, 3vw, 36px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.15em"
  label:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(16px, 2vw, 24px)"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "0.1em"
  stat:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(14px, 1.2vw, 18px)"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.2em"
  picto:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(11px, 1.1vw, 12px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  key-numeric:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 42px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  key-alpha:
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(16px, 2vw, 26px)"
    fontWeight: 600
    lineHeight: 1
rounded:
  none: "0px"
  key: "8px"
  modal: "12px"
  full: "9999px"
spacing:
  base: "8px"
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  touch-target: "90px"
  sidebar-width: "120px"
  start-button-height: "110px"
components:
  button-accent:
    backgroundColor: "{colors.bleu-drap}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
    height: "{spacing.touch-target}"
  button-accent-active:
    backgroundColor: "{colors.bleu-drap}"
    textColor: "{colors.blanc-pur}"
  button-neutral:
    backgroundColor: "{colors.gris-ardoise-sombre}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
    height: "{spacing.touch-target}"
  button-start:
    backgroundColor: "{colors.rouge-profond}"
    textColor: "{colors.blanc-pur}"
    rounded: "{rounded.none}"
    height: "{spacing.start-button-height}"
    padding: "0 16px"
  button-setup:
    backgroundColor: "{colors.bleu-drap}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.stat}"
    rounded: "{rounded.none}"
    height: "{spacing.touch-target}"
    padding: "0 16px"
  button-bar-cta:
    backgroundColor: "{colors.bleu-drap}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    height: "{spacing.touch-target}"
    padding: "0 32px"
  button-pass-turn:
    backgroundColor: "{colors.gris-ardoise-sombre}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.stat}"
    rounded: "{rounded.none}"
    height: "{spacing.touch-target}"
  icon-action:
    backgroundColor: "{colors.surface-voilee}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.picto}"
    rounded: "{rounded.none}"
    size: "{spacing.touch-target}"
    padding: "0 8px"
  key:
    backgroundColor: "{colors.anthracite-touche}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.key-numeric}"
    rounded: "{rounded.key}"
    height: "60px"
  key-active:
    backgroundColor: "{colors.anthracite-touche-active}"
    textColor: "{colors.blanc-pur}"
  mode-tile:
    backgroundColor: "{colors.bleu-drap}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "16px"
    height: "180px"
  sidebar-item:
    backgroundColor: "{colors.noir-barre}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.picto}"
    rounded: "{rounded.none}"
    height: "{spacing.touch-target}"
    width: "{spacing.sidebar-width}"
  player-card-white:
    backgroundColor: "{colors.blanc-pur}"
    textColor: "{colors.encre-noire}"
    rounded: "{rounded.none}"
  player-card-yellow:
    backgroundColor: "{colors.jaune-franc}"
    textColor: "{colors.encre-noire}"
    rounded: "{rounded.none}"
  player-band-white:
    backgroundColor: "{colors.blanc-bandeau}"
    textColor: "{colors.encre-noire}"
    padding: "20px 24px"
  player-band-yellow:
    backgroundColor: "{colors.jaune-bandeau}"
    textColor: "{colors.encre-noire}"
    padding: "20px 24px"
  popup-card:
    backgroundColor: "{colors.noir-bleute}"
    textColor: "{colors.blanc-pur}"
    rounded: "{rounded.modal}"
    padding: "24px"
  summary-banner:
    backgroundColor: "{colors.blanc-casse}"
    textColor: "{colors.noir-bleute}"
    typography: "{typography.title}"
    padding: "24px 32px"
  summary-cell-victory:
    backgroundColor: "{colors.rouge-profond-victoire}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
  summary-cell-neutral:
    backgroundColor: "{colors.surface-voilee}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
---

# Design System: 1Score

> Source unique du visuel de 1Score (décision de Nathan, 2026-09-15). Les tokens du frontmatter sont **normatifs** ; `1score/src/assets/main.css` les applique, `CLAUDE.md` §7/§10 y renvoient. Ce document a été **extrait du code livré par l'Epic 10** (17 composants, 56 variables CSS) : il décrit ce qui existe, et signale en clair les arbitrages que la passe design system doit trancher. Les titres de section sont en anglais parce que l'outillage les lit ; tout le reste est en français. Le contexte produit (salle sombre, lecture à 2 m, paysage seul, 1920×1080 en cible) est dans `PRODUCT.md` et n'est pas répété ici.

## Overview

**Creative North Star: "Le Tableau sous les projecteurs"**

1Score est un **tableau d'affichage de compétition**, pas une application. Sa structure vient des scoreboards coréens de club (Cueuny, Billiboard) : une grille dense collée aux bords, des bandeaux, des chiffres tabulaires énormes, des tuiles jointives séparées d'un filet, une coupe en biais qui casse la symétrie. Sa hiérarchie vient de la lumière : dans une salle noire, **les deux cartes joueur sont les seuls aplats clairs**, comme une table sous les projecteurs. Tout le reste, barre latérale, colonne centrale, fond, recule dans l'anthracite et le noir pour que le score se lise à deux mètres.

L'énergie est celle d'une retransmission esport, assumée sur tous les écrans : bleu saturé du drap sur les tuiles et les CTA, rouge profond pour ce qui engage (démarrer) et pour la marque, ruban rouge de victoire au récap, `VS` en italique gras. Elle ne cède jamais sur deux choses : la lisibilité en salle sombre, et le calme de la correction (l'erreur est réversible, jamais punie). Le système est plat par défaut ; seuls les objets qu'on tape ont du corps : les touches s'enfoncent, les CTA en dégradé s'assombrissent sous le doigt.

**Arbitrages ouverts**, hérités de l'Epic 10 et confiés à la passe design system (Nathan, 2026-09-15 : « j'attends de voir ce que ça peut donner ») : trois rayons coexistent sur des objets tapables (0, 8 et 12 px) ; les deux rouges `--color-brand-red` et `--color-victory-ribbon` valent la même couleur ; le bleu `--color-accent` (#1E88E5) ne sert plus qu'à l'anneau de focus ; l'échelle typographique plafonne dès la tablette alors que la cible est 1920×1080 ; le fond gris→noir « pourrait être plus engageant ».

**Key Characteristics:**
- Salle noire, cartes claires : le contraste clair/sombre porte toute la hiérarchie.
- Angles vifs et surfaces jointives, filets blancs à 18 % comme seul séparateur.
- Un seul bleu (drap → bleu clair), un seul rouge profond, un jaune franc sans bleu résiduel.
- Chiffres tabulaires en graisse 900, majuscules partout, aucune minuscule hors accroche.
- Coupe en biais (`clip-path`) comme signature : en-tête de la barre latérale, bandeau du récap.
- Rien ne bouge au repos ; le mouvement n'existe que comme retour d'appui ou porteur d'information.
- Pictos Lucide inline, trait 2 px, jamais remplis, jamais en police d'icônes.

## Colors

Une palette resserrée bleus / noir-gris / rouge, posée sur les deux seuls aplats clairs du produit : le blanc et le jaune des billes.

### Primary
- **Bleu drap** (#0573BB) : LE bleu du produit, médiane des pixels du drap Simonis Prestige. Point d'arrivée de tous les dégradés bleus ; jamais seul sur un bouton.
- **Bleu clair** (#2E8FDB) : point de départ du dégradé bleu (`--gradient-blue`, 160°, bleu clair → bleu drap). Tuiles de mode disponibles, CTA de réglage (`CHANGER DE BILLE`, `CHANGER DE CÔTÉ`), CTA de saisie de la barre basse, `VALIDER` et tout CTA principal de pop-up. Blanc dessus : 3,46:1 sur le stop clair, réservé au texte ≥ 24 px gras.
- **Bleu moyen / Bleu sombre** (#0668AD → #033F6B) et **Bleu nuit / Bleu abysse** (#05508A → #022B4D) : les deux dégradés sombres des tuiles `BIENTÔT` (Quilles, Casin). Ils disent l'inactivité autant que le badge. Une tuile qui s'ouvre bascule sur le dégradé bleu.

### Secondary
- **Rouge profond** (#D0343F) : rouge de marque, bandeau en biais de l'en-tête de la barre latérale, valeur de série en cours sur la carte joueur, point d'arrivée du dégradé rouge de `DÉMARRER` (**Rouge clair** #E2515B → rouge profond). Blanc dessus 4,95:1.
- **Rouge profond (victoire)** (#D0343F) : ruban de la colonne gagnante au récap. Même valeur, second token CSS (`--color-victory-ribbon`), maintenu distinct par décision de Nathan en 10.7 en attendant que ce document tranche. **À arbitrer à la passe.**
- **Rouge vif** (#FF2D46) : liseré de tour actif (`ring-8`) autour de la carte du joueur qui joue, et son prolongement autour du disque du chrono. Signal de tour, jamais d'alerte.
- **Rouge alerte** (#FF3B30, hsl 3 100 % 59 %) : point d'arrivée du fondu du chrono de tir (vert 130° → jaune → orange → rouge). Ne sert qu'au chrono.

### Tertiary
- **Jaune franc** (#FFE000) : carte du joueur de droite, bille jaune. Bleu à zéro, saturation pleine : c'est ce qui le rend franc plutôt que doré ou délavé (quatre essais en 10.4). Ne jamais y remettre de bleu « pour adoucir ». Encre noire dessus, très au-dessus d'AA.
- **Jaune bandeau** (#E6CA00) : bandeau haut de la carte jaune (nom, distance, restant, stats). Encre noire 12,81:1.
- **Blanc pur** (#FFFFFF) : carte du joueur de gauche, bille blanche ; et couleur de tout texte sur fond sombre.
- **Blanc bandeau** (#ECECEC) : bandeau haut de la carte blanche.
- **Blanc cassé** (#F2F0EA) : bande claire du bandeau du récap, seul aplat clair hors cartes joueur. Cassé et non pur pour ne pas éblouir en salle sombre ; texte en noir bleuté.

### Neutral
- **Noir bleuté** (#0D1117) : fond de page (`color-scheme: dark`), fond de la barre basse du scoreboard, carte de pop-up à 95 % d'opacité, encre sur le bandeau clair du récap.
- **Gris fond clair → Gris fond sombre → Noir** (#2A2E35 → #111317 → #000000, 160°, arrêts 0 / 55 / 100 %) : `--gradient-bg`, fond de tous les écrans hors jeu. Le scoreboard n'en a pas : ses trois colonnes couvrent l'écran.
- **Noir barre** (#101318) : aplat de la barre latérale, collé au bord gauche.
- **Surface voilée** (blanc 6 %) : colonne centrale du scoreboard, conteneur du récap, fond des pictos d'action, cellules neutres du récap. Un voile, pas une couleur : il prend la teinte de ce qu'il couvre.
- **Filet** (blanc 18 %) : contour par défaut de tout conteneur (1 px), séparateur des tuiles, bordure droite de la barre latérale. **Filet fort** (blanc 40 %) : déclaré, plus consommé depuis que `PASSER LE TOUR` a perdu son contour.
- **Anthracite touche / Anthracite touche active** (#2E333B / #3C434D) : plaques des claviers, au repos et enfoncées.
- **Gris ardoise → Gris ardoise sombre** (#3A4049 → #262A31) : `--gradient-neutral`, CTA neutres opaques (`ANNULER`, `PASSER LE TOUR`, secondaire de pop-up). Même famille que les touches pour s'asseoir au pied d'un clavier.
- **Gris panneau → Gris panneau sombre** (#3A3F49 → #23262C) : `--gradient-panel`, colonne centrale du paramétrage, nettement plus claire que le fond pour ne pas se lire comme un trou entre deux cartes.
- **Anthracite chrono** (#1C1F25) : disque du chrono de tir. C'est la surface voilée composée sur le noir bleuté, figée en opaque parce que le disque déborde sur les cartes claires. **À recalculer si l'un des deux bouge.**
- **Voile** (noir 25 %) : fond plein écran des quatre pop-ups, **sans flou**.
- **Encre noire** (#000000) : tout texte posé sur une carte joueur, bandeau compris.
- **Bleu accent focus** (#1E88E5) : anneau `focus-visible` de 4 px, seul usage restant. `--color-victory-gold` (#FFD54A) et `--gradient-field` sont déclarés et morts.

### Named Rules
**La Règle de la bille.** Gauche = blanche, droite = jaune, encre noire sur les deux, fixées au côté de la table. Le tour actif se signale par le liseré rouge vif, jamais par la teinte du bloc. Le récap et le paramétrage conservent les côtés du scoreboard.

**La Règle du bleu unique.** Un seul dégradé bleu pour toutes les tuiles disponibles et tout CTA qui demande du bleu : les modes sont des pairs, on ne les hiérarchise pas par la nuance. Le bleu drap n'est jamais posé seul sur un bouton. *(En vigueur ; Nathan veut voir des alternatives à la passe.)*

**La Règle du rouge qui engage.** Le rouge est réservé à la marque, à l'action qui engage la partie (`DÉMARRER`), à la valeur de série en cours et à la victoire. Un réglage qu'on peut retoucher est bleu ; un retour (`ANNULER`) est neutre. Jamais de rouge sur un refus.

**La Règle du voile clair.** Une pop-up pose un voile noir à 25 % et rien d'autre : jamais de flou, parce que la carte qu'on remplit doit rester lisible sous la pop-up.

## Typography

**Display Font:** system-ui (Avenir, Helvetica, Arial, sans-serif en repli)
**Body Font:** la même pile
**Label/Mono Font:** aucune ; `tabular-nums` sur tous les chiffres

**Character:** une seule famille, la police système, en attendant une police display non choisie (décision 10.1, dette consignée dans `deferred-work.md`). Le caractère vient de la graisse et de la casse : **900 partout où ça compte**, majuscules sur tous les libellés, chiffres tabulaires à fond de casse. Le texte ne descend en minuscules que pour l'accroche d'accueil (« À vous de jouer. »). Aucune police n'est chargée : zéro `@font-face`, zéro poids offline. **Toute l'échelle est calée sur la tablette** (plafonds atteints dès 1194 px) : la mettre à l'échelle de 1920×1080 est la dette n° 1 de la passe.

### Hierarchy
- **Score** (900, `min(42vw, 40vh, 320px)` à un chiffre, puis 24 / 16 / 12 vw à deux, trois, quatre chiffres, interligne 1) : le plus gros élément de l'écran, sans exception. La taille se choisit selon le nombre de caractères ; `vw` protège de la largeur de la carte, `vh` de sa hauteur, 320 px plafonne le signage. Le token historique `--text-score` (clamp 120–200 px) n'est plus utilisé par la carte.
- **Reprise** (900, `clamp(48px, 7.5vw, 120px)`, interligne 1) : numéro de reprise dans la colonne centrale, dimensionné pour un cinquième d'écran. Chrono de tir : `40cqmin` du disque, même graisse.
- **Hero** (900, `clamp(40px, 5vw, 56px)`, interligne serré) : accroche d'accueil, titre de la sélection JDS, `VS` du récap (italique, blanc 60 %).
- **Title** (900, `clamp(28px, 3vw, 36px)`, majuscules, interlettrage 0,15 em sur le titre de paramétrage, aucun sur les tuiles) : titre de tuile de mode, nom du mode en bandeau, noms et distances du bandeau de récap.
- **Label** (900, `clamp(16px, 2vw, 24px)`, majuscules, interlettrage 0,1 em sur les titres de pop-up et le CTA de barre) : tout CTA de pop-up, nom et distance sur la carte joueur, `RESTANT` / `POUR n`, valeurs du récap, titre de pop-up, message de pop-up (blanc 70 %, graisse normale).
- **Stat** (700, `clamp(14px, 1.2vw, 18px)`, majuscules, interlettrage 0,2 à 0,3 em) : `MOY` / `SÉRIE` (libellé à 60 %, valeur en 900), `REP`, libellés du récap (blanc 50 %), `BILLE BLANCHE`, `NOM` / `DISTANCE`, CTA de réglage et `PASSER LE TOUR`, badge `BIENTÔT` de tuile.
- **Picto** (700, `clamp(11px, 1.1vw, 12px)`, majuscules, **sans** interlettrage) : libellé sous picto dans la barre latérale et la barre basse. Le badge `BIENTÔT` des items tombe à 10 px.
- **Touche numérique** (600, `clamp(30px, 3.4vw, 42px)`, interlettrage serré) et **touche alpha** (600, `clamp(16px, 2vw, 26px)`) ; `AC` / `C` / `⌫` / `ESPACE` / `RESET` en `label` 700 blanc 55 %.
- **Valeurs intermédiaires** : série en cours sur la carte `clamp(24px, 10cqw, 64px)` en rouge profond ; valeur de champ au paramétrage `clamp(24px, 2.6vw, 40px)` ; `DÉMARRER` `clamp(16px, 1.6vw, 26px)`, interlettrage 0,05 em.

### Named Rules
**La Règle des chiffres nus.** Distance et restant s'écrivent sans libellé sur la carte joueur ; `MOY` et `SÉRIE` gardent le leur, sinon trois nombres nus se confondent. Un nom peut se tronquer (deux lignes puis ellipse) ; **un nombre rogné deviendrait faux, il ne se tronque jamais**.

**La Règle de la moyenne.** La moyenne s'affiche à trois décimales (convention fédérale), en tabulaire, partout.

## Layout

**Paysage exclusivement.** Formats de vérification : 1920×1080 (référence, écran 21,5″), 1180×733 (format de travail réel), 1133×744 et 1194×834 (iPad, plancher). Aucune variante portrait ni téléphone n'existe dans le code ; les paliers Tailwind `md` (768) et `lg` (1280) sont déclarés mais presque inutilisés. Les variantes des cartes joueur se font en **container queries** (`@min-[420px]`), jamais en breakpoints d'écran.

**Une coquille pour quatre écrans hors jeu** (accueil, sélection JDS, paramétrage, récap) : fond `--gradient-bg`, **barre latérale de 120 px** collée au bord gauche (aplat noir barre, filet à droite, en-tête de 120 px avec logo et mot `1Score` sur bandeau rouge coupé en biais, items empilés, sortie calée en bas), puis `<main>` à droite.
- **Accueil et sélection JDS** : accroche en haut à gauche (`px-4 pt-5`), puis une rangée de **quatre tuiles jointives sur 34 % de la hauteur**, collées à la barre et aux bords, séparées par un filet, hauteur minimale 180 px.
- **Paramétrage** : bandeau de titre centré à filet bas, puis zone `p-4 gap-4` en trois colonnes **espacées et cernées** : carte joueur (flex-1), colonne centrale à 1/4 sur `--gradient-panel` avec le bloc de trois commandes calé en bas, carte joueur. Divergence assumée avec les tuiles jointives des deux écrans précédents.
- **Récap** : `<main class="p-4">`, un seul conteneur à filet sur surface voilée, bandeau clair en tête, grille de cellules `gap-1`, colonne de libellés à 1/5.

**Le scoreboard n'a pas de coquille** : ni barre latérale, ni fond visible. Trois colonnes à fleur de bord, **2/5 · 1/5 · 2/5**, sur toute la hauteur restante, puis une **barre basse** sur fond noir bleuté (`py-2`) qui reproduit la même grille : CTA de saisie pleine largeur dans la colonne du joueur assis, espaceur central, quatre pictos d'action espacés de 12 px dans l'autre colonne, `QUITTER` au bord extérieur. Les deux groupes échangent de côté à chaque bascule de tour. Le disque du chrono déborde de 24 px (`--game-clock-bleed`) sur chaque carte, qui réserve une gouttière intérieure de 32 px.

**Pop-ups** : quatre pop-ups, un patron. Voile plein écran, carte centrée verticalement ; les trois hôtes de saisie se **centrent dans la zone laissée libre par la carte visée**, du côté opposé, via les insets `--setup-popup-inset-*` (paramétrage) et `--game-popup-inset-*` (scoreboard). Ces quatre insets recopient la géométrie d'un écran : **ce ne sont pas des tokens, la passe doit les rapatrier dans un layout.** Largeurs de carte : `max-w-xl` (décision), `max-w-lg` (pavé), `max-w-3xl` (clavier alpha).

**Rythme** : `--spacing` vaut **8 px** (le double du défaut Tailwind). Pas utilisés : 4, 8, 12, 16, 24, 32, 40, 48, 80. Padding intérieur des cartes joueur 24 px (`p-3`) sur le bandeau, 48 px (`p-6`) sur la carte de paramétrage, 24 px sur les cartes de pop-up. Cible tactile **90 × 90 px** minimum sur toute commande de jeu ; touches de clavier à 60 (numérique) et 57 px (alpha), exception assumée UX-DR8.

## Elevation & Depth

**Plat par défaut, par couches tonales.** Le système n'empile pas d'ombres : la profondeur vient de trois niveaux de valeur (noir de fond, surface voilée à 6 %, aplats clairs des cartes) et d'un filet blanc à 18 % qui cerne chaque conteneur. Les cartes joueur ne portent aucune ombre : leur clarté suffit à les faire avancer.

Le relief est réservé à **ce qui se tape** et à **ce qui flotte** :

### Shadow Vocabulary
- **Relief de touche** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 0 rgba(0,0,0,0.45)`) : plaques des claviers. À l'appui l'ombre portée disparaît, le filet clair tombe à 6 % et la touche descend d'un pixel : elle s'enfonce.
- **Filet de lumière** (`inset 0 1px 0 rgba(255,255,255,0.25)` sur `DÉMARRER`, `0.35` sur les champs de paramétrage) : un seul trait clair en haut, qui donne du corps sans ombre.
- **Ombre de pop-up** (`0 32px 80px rgba(0,0,0,0.65)`) : la carte de toute pop-up, posée sur le voile à 25 %. La seule ombre portée diffuse du produit.

**Retours d'appui** : `brightness(0.9)` sur les CTA en dégradé bleu et rouge, `brightness(1.25)` sur le neutre, `brightness(1.10)` au survol et `1.25` à l'appui sur les tuiles, fond blanc 15 % sur les pictos d'action, noir 16 % et opacité pleine sur `−` / `+`. **Instantanés** (aucune transition), sauf 75 ms sur les touches.

### Named Rules
**La Règle du relief tapable.** Un conteneur est plat et cerné ; seul un objet qu'on tape a du corps. Une ombre sur une carte joueur, une tuile ou une colonne est une faute.

**La Règle de l'inactif.** Ce qui n'est pas disponible s'atténue (`disabled` à 30 %, `BIENTÔT` à 45 % du fond) **et** porte un badge : l'information ne repose jamais sur la couleur seule. Cette atténuation ne se « corrige » pas au contraste (WCAG §1.4.3).

## Shapes

**Angles vifs.** `--radius-container` et `--radius-cta` valent 0 : cartes, tuiles, colonnes, barre latérale, CTA de réglage, CTA de barre, pictos d'action, champs de paramétrage, cellules du récap. « L'app doit se lire comme un outil tactile, pas comme une app mobile » (Nathan, 10.1).

**Deux exceptions, en vigueur et à arbitrer** : les **touches** et les **CTA de pop-up** (`ANNULER`, `VALIDER`, principal, secondaire, choix de cadre) à **8 px** (`--radius-key`) parce qu'ils se lisent comme des objets physiques côte à côte ; la **carte de pop-up** à **12 px** (`--radius-modal`) pour se détacher du fond. Nathan a évoqué de « peut-être les généraliser » : c'est l'un des arbitrages de la passe.

**Cercles** : billes (`rounded-full`, images PNG de 40 px), disque du chrono (`aspect-square`, `min(100cqw, 100cqh)`), arc SVG à rayon 36 et trait 7 sur un viewBox 100, cap plat.

**Filets** : 1 px blanc 18 % sur tout conteneur ; 2 px sur les champs de paramétrage (noir 25 %, rouge vif quand visé) ; liseré de tour `ring-8` intérieur rouge vif ; filet vertical `w-px` entre nom et distance sur le bandeau du récap.

**Coupes en biais** (signature) : en-tête de la barre latérale en deux calques `clip-path: polygon(0 0, 100% 0, 100% 92%, 0 72%)` rouge profond, puis un pli à 35 % ; bandeau du récap échancré de 32 px de chaque côté du `VS` (`polygon(0 0, 100% 0, calc(100% - 32px) 100%, 0 100%)` et son symétrique). Motif à reprendre sur les écrans à venir.

**Pictos** : Lucide, viewBox 24, trait 2 px arrondi, sans remplissage, SVG inline, `currentColor`. Tailles : 32 px (`size-4`) dans la barre latérale et la barre basse, 24 px (`size-3`) en ligne devant un libellé de réglage, 40 px (`size-5`) pour la flèche de tuile et le chevron de `DÉMARRER`.

## Components

### Buttons
Quatre familles, un principe : un gros CTA à libellé en majuscules, cible ≥ 90 px, retour d'appui instantané.
- **CTA accent** (pop-ups) : dégradé bleu, blanc, `label` 900, rayon 8 px, pleine largeur, `brightness(0.9)` à l'appui. `VALIDER` porte en bas une barre de rebours blanche de 16 px (`h-2`) qui se remplit en 3 s à chaque frappe (auto-validation).
- **CTA neutre** (pop-ups, `PASSER LE TOUR`) : dégradé ardoise opaque, blanc, sans contour. `ANNULER` prend un tiers de la largeur, `VALIDER` le reste. `PASSER LE TOUR` est à rayon 0, pleine largeur de colonne, picto au-dessus du libellé en `stat`.
- **CTA de réglage** (paramétrage) : dégradé bleu, rayon 0, picto 24 px en ligne devant le libellé en `stat` 700, empilés pleine largeur.
- **`DÉMARRER`** : dégradé rouge, rayon 0, 110 px de haut, chevron nu à gauche, filet de lumière. Le seul CTA rouge du produit.
- **CTA de barre basse** (`+ POINTS ADVERSAIRE`, `+1 ADVERSAIRE`) : dégradé bleu, rayon 0, `label` 900 interlettré 0,1 em, largeur de la colonne du joueur assis.
- **Correction `−` / `+`** : 90 px, noir 8 % sur la carte, `text-3xl` 900 à 60 % d'opacité ; rattrapage d'arbitrage, il ne doit pas concurrencer le score.
- **Focus** : anneau `focus-visible` de 4 px bleu accent, décalé de 2 px. Pas de navigation clavier attendue.

### Keys
- **Touche** : anthracite, rayon 8 px, relief de touche, 600, plancher 60 × 60 px (numérique, 3 colonnes, `gap-2`) ou 57 px de haut (alpha, 10 colonnes AZERTY sur 5 rangées, `gap-1`). Enfoncement à l'appui. Touches d'action (`AC`/`C`, `⌫`, `ESPACE`, `RESET`) en blanc 55 %. Les deux claviers partagent `KEY_CLASSES` : ils doivent rester identiques à l'œil.

### Chips
- **Badge `BIENTÔT`** : blanc 15 %, 700, `stat` sur les tuiles (`px-1.5 py-0.5`, calé en bas à droite), 10 px sur les items de barre. Toujours accompagné de l'atténuation du fond ou du picto.
- **`★ RECORD`** (récap, prévu Story 3.5) : noir 20 %, `stat` 700 interlettré 0,2 em.

### Cards / Containers
- **Carte joueur** (scoreboard) : aplat plein blanc ou jaune, encre noire, rayon 0, aucune ombre, `@container`. Trois zones : bandeau (aplat légèrement plus sombre, `px-3 py-2.5`, ligne 1 `NOM | DISTANCE`, ligne 2 `RESTANT` ou `POUR n` | `MOY · SÉRIE`), score géant centré, pied `−` / série en cours en rouge profond / `+`. Liseré de tour `ring-8` rouge vif en overlay `z-10` quand le joueur a la main ; le disque du chrono passe au-dessus (`z-20`) et le demi-anneau de `ShotClock` reprend le tracé.
- **Carte de paramétrage** : même aplat, filet à 18 %, `p-6`, en-tête à gauche (bille PNG 40 px + `BILLE BLANCHE` en `stat` interlettré 0,25 em à 75 %, sur noir 6 % et filet bas noir 12 %), puis deux champs.
- **Tuile de mode** : dégradé bleu (ou bleu sombre à 45 % si `BIENTÔT`), rayon 0, `p-2`, titre `title` 900 en haut à gauche, flèche nue 40 px en bas à droite ; jointive, séparée par un filet.
- **Colonne centrale** (scoreboard) : surface voilée, **sans contour** (le filet raccordait mal avec le disque), `REP` + numéro en haut, chrono `flex-1`, `PASSER LE TOUR` calé en bas ; sans chrono, le compteur se centre sur la hauteur entière.
- **Conteneur de récap** : surface voilée, filet, bandeau clair échancré en tête, cellules à `gap-1` où la couleur est portée par la cellule (rouge profond victoire / surface voilée), colonne de libellés blanc 50 %.
- **Carte de pop-up** : noir bleuté à 95 %, filet (blanc 12 % pour la décision, 18 % pour les saisies), rayon 12 px, `p-3`, ombre de pop-up, titre centré `label` interlettré 0,1 em, bille de 40 px optionnelle en en-tête.

### Inputs / Fields
- **Champ de paramétrage** (`NOM`, `DISTANCE`) : boîte claire teintée par transparence (noir 8 %), filet de lumière à 35 %, bordure 2 px noir 25 %, rayon 0, 130 à 220 px de haut, centrée. Vide : intitulé seul en `stat` interlettré à 60 %. Rempli : intitulé au-dessus à 65 %, valeur `clamp(24px, 2.6vw, 40px)` 900. **Visé : bordure rouge vif** (même signal non chromatique que le tour).
- Aucun champ natif nulle part : la valeur est du texte alimenté par les claviers dessinés.
- **Retours de saisie** : flash sombre (noir 25 %, 120 ms) sur la valeur qui change ; pulsation (`scale 1.12`, 180 ms) du pavé sur une frappe refusée ; haptique distincte dans les deux cas.

### Navigation
- **Barre latérale** : 120 px, noir barre, filet droit, en-tête rouge coupé en biais (logo 48 px + `1Score` en `picto` 900 interlettré 0,04 em), items de 90 px minimum (picto 32 px au-dessus, libellé `picto` 700 majuscules, `BIENTÔT` à 45 % + badge), item de sortie isolé en bas (`mt-auto`). Contextuelle : l'écran fournit ses items, la barre n'en code aucun.
- **Barre basse du scoreboard** : fond noir bleuté, grille 2/5 · 1/5 · 2/5, CTA de saisie et quatre **pictos d'action** (surface voilée, filet, rayon 0, 90 × 90 px, picto 32 px + libellé `picto`, blanc 15 % à l'appui, 30 % si inactif).

### Shot Clock (signature)
Disque anthracite chrono, dimensionné `min(100cqw, 100cqh)` de la colonne, débordant de 24 px sur chaque carte. Arc SVG rayon 36 / trait 7 / cap plat, piste à 20 %, se vidant depuis midi en 1 s linéaire ; couleur interpolée en HSL du vert (130°) au rouge alerte (3°) sur l'arc **et** le chiffre (`40cqmin`, 900, tabulaire). Demi-anneau rouge vif de 8 px, clippé à la bande de débordement, qui prolonge le liseré de tour autour du disque.

### Pop-ups (signature)
Un seul patron pour les quatre (`PromptModal`, `ScoreEntryDock`, `NumericPadDock`, `AlphaKeyboardSheet`) : voile noir 25 % sans flou, `role="dialog"`, carte à rayon 12 px, pied de CTA en `gap-2`. **Jamais de croix** : le retour est un gros CTA `ANNULER`, et toute pop-up qui en porte un se ferme aussi au tap dehors (geste complet, appui et relâchement du même pointeur). Une pop-up sans retour (fin de partie par série) garde un voile inerte. Titre toujours centré ; pas de message redondant.

## Do's and Don'ts

### Do:
- **Do** poser toute nouvelle commande sur l'un des quatre gabarits de CTA existants (accent, neutre, réglage, barre basse) plutôt qu'en créer un cinquième ; la passe a pour critère qu'un écran de plus n'ajoute ni composant de base ni token.
- **Do** écrire chaque libellé en majuscules, chaque nombre en `tabular-nums`, chaque texte sur carte joueur en encre noire.
- **Do** tenir 90 × 90 px sur toute commande de jeu, et mesurer le contraste sur la surface réelle (bandeau, boîte de champ), pas sur la carte nue.
- **Do** ranger une pop-up de saisie du côté opposé à la carte qu'elle remplit, carte entièrement visible et nette.
- **Do** reprendre la coupe en biais et le filet à 18 % comme vocabulaire de tout nouvel écran ; angles vifs sur les conteneurs, en attendant l'arbitrage des rayons.
- **Do** ajouter toute animation d'ornement à la garde `prefers-reduced-motion` de `main.css`, nommément ; une animation porteuse d'information (chrono, rebours) n'y entre pas.
- **Do** consigner tout écart au détecteur avec sa raison, en citant `deferred-work.md`.

### Don't:
- **Don't** mettre une croix de fermeture, ni un champ natif, ni le clavier système : le retour est un gros CTA `ANNULER`, la saisie passe par les claviers dessinés. *(Interdit durable, Nathan 2026-09-15.)*
- **Don't** signaler le tour, la disponibilité ou un champ visé par la couleur seule : liseré, badge, atténuation.
- **Don't** flouter un voile, ni assombrir au-delà de 25 % : ce qu'il y a dessous doit rester lisible.
- **Don't** utiliser `text-score` hors d'une carte joueur, ni un rouge sur un refus, ni le bleu drap seul sur un bouton.
- **Don't** construire une classe Tailwind à la volée, ni placer un commentaire HTML à la racine d'un gabarit, ni ajouter d'`overflow-hidden` sur la colonne centrale ou ses ancêtres (l'anneau du chrono serait rogné sans erreur).
- **Don't** charger une police, une icône ou une image depuis le réseau : tout est inline ou dans `public/`.
- **Don't** fusionner `--color-brand-red` et `--color-victory-ribbon`, ni changer `--color-shot-clock-face`, sans le faire dans ce document d'abord : c'est ici que la palette s'arbitre, plus story par story.
