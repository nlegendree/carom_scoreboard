---
name: 1Score
description: Scoreboard tactile de billard carambole — un tableau d'affichage de compétition dont les cartes joueur sont seules en pleine lumière.
colors:
  blanc-pur: "#FFFFFF"
  jaune-franc: "#FFF200"
  encre-noire: "#000000"
  blanc-bandeau: "#ECECEC"
  jaune-bandeau: "#E6DA00"
  blanc-casse: "#F2F0EA"
  rouge-vif: "#FF2D46"
  rouge-alerte: "#FF3B30"
  rouge-profond: "#D0343F"
  rouge-cta-clair: "#F04553"
  rouge-cta-sombre: "#C41F2C"
  bleu-roi-clair: "#3B82F6"
  bleu-roi: "#1D4ED8"
  bleu-moyen: "#0668AD"
  bleu-sombre: "#033F6B"
  bleu-nuit: "#05508A"
  bleu-abysse: "#022B4D"
  marine-sombre: "#1E2438"
  marine-clair: "#272E49"
  ardoise-touche: "#3C4153"
  ardoise-touche-active: "#494E65"
  ardoise-cta: "#464B5D"
  ardoise-cta-sombre: "#323643"
  surface-voilee: "rgba(255, 255, 255, 0.08)"
  filet: "rgba(255, 255, 255, 0.22)"
  voile: "rgba(0, 0, 0, 0.25)"
typography:
  score-1:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "min(42vw, 40vh, 520px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  score-2:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "min(24vw, 40vh, 520px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  score-3:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "min(16vw, 40vh, 520px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  score-4:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "min(12vw, 40vh, 520px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  score-more:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "min(9vw, 40vh, 520px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  reprise:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(72px, 7.5vw, 144px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  clock:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "48cqmin"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  series:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(24px, 10cqw, 80px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "tabular-nums"
  adjust:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(30px, 2.5vw, 48px)"
    fontWeight: 900
    lineHeight: 1
  hero:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(48px, 4.75vw, 91px)"
    fontWeight: 900
    lineHeight: 1.25
  title:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(32px, 3.03vw, 58px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "{tracking.title}"
  label:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(20px, 2vw, 38px)"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "{tracking.label}"
  stat:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(14px, 1.2vw, 23px)"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "{tracking.stat}"
  picto:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(12px, 1vw, 19px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  key-numeric:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 65px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.025em"
  key-alpha:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(18px, 2vw, 38px)"
    fontWeight: 600
    lineHeight: 1
  field-value:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(24px, 2.61vw, 50px)"
    fontWeight: 900
    lineHeight: 1
  start-button:
    fontFamily: "Saira, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "clamp(20px, 1.62vw, 31px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "{tracking.label}"
tracking:
  title: "0.15em"
  label: "0.1em"
  stat: "0.25em"
rounded:
  none: "0px"
  tappable: "8px"
  block: "12px"
  popup: "12px"
  zone: "16px"
  full: "9999px"
shadows:
  key-relief: "inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 0 rgba(0,0,0,0.45)"
  key-relief-active: "inset 0 1px 0 rgba(255,255,255,0.06)"
  cta-relief-blue: "inset 0 1px 0 rgba(255,255,255,0.25), 0 {spacing.relief-depth} 0 #163A9E"
  cta-relief-red: "inset 0 1px 0 rgba(255,255,255,0.25), 0 {spacing.relief-depth} 0 #8A1520"
  cta-relief-neutral: "inset 0 1px 0 rgba(255,255,255,0.14), 0 {spacing.relief-depth} 0 #181B24"
  cta-relief-active: "inset 0 1px 0 rgba(255,255,255,0.10)"
  light-edge-field: "inset 0 1px 0 rgba(255,255,255,0.35)"
  popup: "0 32px 80px rgba(0,0,0,0.65)"
  sidebar: "6px 0 28px rgba(0,0,0,0.45)"
  bottom-bar: "0 -6px 24px rgba(0,0,0,0.45)"
spacing:
  base: "clamp(8px, 0.678vw, 13px)"
  xs: "calc({spacing.base} * 0.5)"
  sm: "{spacing.base}"
  md: "calc({spacing.base} * 2)"
  lg: "calc({spacing.base} * 3)"
  xl: "calc({spacing.base} * 4)"
  2xl: "calc({spacing.base} * 6)"
  touch-target: "calc({spacing.base} * 11.25)"
  sidebar: "calc({spacing.base} * 15)"
  start-button: "calc({spacing.base} * 13.75)"
  key-numeric: "calc({spacing.base} * 7.5)"
  key-alpha: "calc({spacing.base} * 7.125)"
  field-min: "calc({spacing.base} * 16.25)"
  field-max: "calc({spacing.base} * 27.5)"
  tile-min: "calc({spacing.base} * 22.5)"
  column-gutter: "calc({spacing.base} * 1)"
  relief-depth: "3px"
  popup-decision: "calc({spacing.base} * 72)"
  popup-pad: "calc({spacing.base} * 64)"
  popup-alpha: "calc({spacing.base} * 96)"
  pad-min: "calc({spacing.key-numeric} * 4 + {spacing.base} * 6)"
  alpha-min: "calc({spacing.key-alpha} * 6 + {spacing.base} * 5)"
components:
  button-accent:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-blue}"
    height: "{spacing.touch-target}"
  button-accent-active:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "{colors.blanc-pur}"
  button-neutral:
    backgroundColor: "{colors.ardoise-cta-sombre}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-neutral}"
    height: "{spacing.touch-target}"
  button-start:
    backgroundColor: "{colors.rouge-cta-sombre}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.start-button}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-red}"
    height: "{spacing.start-button}"
    padding: "0 16px"
  button-setup:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.stat}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-blue}"
    height: "{spacing.touch-target}"
    padding: "0 16px"
  button-bar-cta:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-blue}"
    height: "{spacing.touch-target}"
    padding: "0 32px"
  button-pass-turn:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.stat}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-blue}"
    height: "{spacing.touch-target}"
  icon-action:
    backgroundColor: "{colors.surface-voilee}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.picto}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.cta-relief-neutral}"
    size: "{spacing.touch-target}"
    padding: "0 8px"
  key:
    backgroundColor: "{colors.ardoise-touche}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.key-numeric}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.key-relief}"
    height: "{spacing.key-numeric}"
  key-active:
    backgroundColor: "{colors.ardoise-touche-active}"
    textColor: "{colors.blanc-pur}"
    shadow: "{shadows.key-relief-active}"
  mode-tile:
    backgroundColor: "{colors.bleu-roi}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "16px"
    height: "180px"
  sidebar-item:
    backgroundColor: "{colors.marine-sombre}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.picto}"
    rounded: "{rounded.none}"
    height: "{spacing.touch-target}"
    width: "{spacing.sidebar}"
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
    backgroundColor: "{colors.marine-clair}"
    textColor: "{colors.blanc-pur}"
    rounded: "{rounded.popup}"
    shadow: "{shadows.popup}"
    padding: "24px"
  summary-banner:
    backgroundColor: "{colors.blanc-casse}"
    textColor: "{colors.marine-sombre}"
    typography: "{typography.title}"
    padding: "24px 32px"
  summary-cell-victory:
    backgroundColor: "{colors.rouge-profond}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
  summary-cell-neutral:
    backgroundColor: "{colors.surface-voilee}"
    textColor: "{colors.blanc-pur}"
    typography: "{typography.label}"
  setup-field:
    backgroundColor: "rgba(0, 0, 0, 0.08)"
    textColor: "{colors.encre-noire}"
    typography: "{typography.field-value}"
    rounded: "{rounded.tappable}"
    shadow: "{shadows.light-edge-field}"
    height: "{spacing.field-min}"
---

# Design System: 1Score

> Source unique du visuel de 1Score (décision de Nathan, 2026-09-15). Les tokens du frontmatter sont **normatifs** ; `1score/src/assets/main.css` les applique, `CLAUDE.md` §7/§10 y renvoient. Ce document a été **extrait du code livré par l'Epic 10** (17 composants, 56 variables CSS), puis **arbitré au rendu par la Story 11.2** (2026-09-16) : il décrit ce qui existe, et les décisions de la passe design system y sont datées. Les titres de section sont en anglais parce que l'outillage les lit ; tout le reste est en français. Le contexte produit (salle sombre, lecture à 2 m, paysage seul, 1920×1080 en cible) est dans `PRODUCT.md` et n'est pas répété ici.

## Overview

**Creative North Star: "Le Tableau sous les projecteurs"**

1Score est un **tableau d'affichage de compétition**, pas une application. Sa structure vient des scoreboards coréens de club (Cueuny, Billiboard) : une grille dense collée aux bords, des bandeaux, des chiffres tabulaires énormes, des tuiles jointives séparées d'un filet, une coupe en biais qui casse la symétrie. Sa hiérarchie vient de la lumière : dans une salle noire, **les deux cartes joueur sont les seuls aplats clairs**, comme une table sous les projecteurs. Tout le reste, barre latérale, colonne centrale, fond, recule dans deux niveaux de marine sombre pour que le score se lise à deux mètres — un noir pur ne laissait plus de marche aux pop-ups ni à la barre (Story 11.2), le modèle Cueuny en donne deux.

L'énergie est celle d'une retransmission esport, assumée sur tous les écrans : bleu roi sur les tuiles et les CTA, rouge saturé pour ce qui engage (démarrer), rouge profond pour la marque, ruban rouge de victoire au récap, `VS` en italique gras. Elle ne cède jamais sur deux choses : la lisibilité en salle sombre, et le calme de la correction (l'erreur est réversible, jamais punie). Le système est plat par défaut ; seuls les objets qu'on tape ont du corps : les touches s'enfoncent, les CTA en dégradé s'assombrissent sous le doigt.

**Arbitrages tranchés au rendu par la Story 11.2** (Nathan, 2026-09-16, douze passes de captures aux trois formats, surcharges injectées sans toucher au code) : **rayons** — un rayon unique de 8 px sur tout objet tapable, 0 sur les conteneurs, 12 px sur la carte de pop-up (Shapes) ; **rouges** — un seul rouge profond pour la marque, la série, le ruban de victoire (`--color-victory-ribbon` supprimé ; `DÉMARRER` a son propre rouge, voir la passe de fin) ; **bleu accent** — retiré, l'anneau de focus passe au rouge vif qui est déjà le signal « visé » du produit ; **fond** — après le gris → noir de l'Epic 10, le noir pur (« pas assez de contraste »), une gamme indigo, des teintes franches et des échelles de noir, le modèle **Cueuny** est retenu : deux niveaux de marine, une barre latérale sombre qui porte une ombre sur le contenu, des cartes de pop-up en verre léger, une colonne centrale du scoreboard fondue dans la base et une colonne de paramétrage sans fond (Colors › Neutral, Elevation). Les tokens morts sont retirés, les ombres et les rayons sont des tokens (`tokens.test.ts` verrouille le miroir). **Passe de fin de story sur les CTA** (Nathan, mêmes captures) : le **bleu roi** (#3B82F6 → #1D4ED8) remplace le bleu drap sur tous les CTA bleus et les tuiles, `DÉMARRER` passe au **rouge saturé** (#F04553 → #C41F2C, détaché du rouge de marque), et `PASSER LE TOUR` devient **bleu** : c'est une action de jeu, pas un retour. L'échelle typographique, qui plafonnait dès la tablette, est mise à l'échelle de 1920×1080 par la Story 11.1 (section Typography) ; tranchés à son rendu (Nathan, 2026-09-15, cinq passes) : les CTA de réglage restent en `label` sur deux lignes (« c'est bon comme ça », le stop clair n'est pas assombri) ; la grille fluide est adoptée (facteur 1,63 sur les boîtes : cibles de 146 px, touches de 98 px à 1920) ; le plafond du score reste à 520 px (inactif sous 1080 px de haut, il ne borne que le signage) ; `VS` reste en `hero` italique et le chiffre du chrono en `clock` (40 % du disque), tous deux vus aux trois formats sans réserve.

**Key Characteristics:**
- Salle noire, cartes claires : le contraste clair/sombre porte toute la hiérarchie.
- Conteneurs à angles vifs et surfaces jointives, filets blancs à 22 % comme seul séparateur ; 8 px sur tout ce qui se tape.
- Un seul bleu (bleu roi), un rouge de marque et un rouge de CTA, un jaune franc sans bleu résiduel ; deux niveaux de marine et rien d'autre en fond.
- Chiffres tabulaires en graisse 900, majuscules partout, aucune minuscule hors accroche.
- Coupe en biais (`clip-path`) comme signature : en-tête de la barre latérale, bandeau du récap.
- Rien ne bouge au repos ; le mouvement n'existe que comme retour d'appui ou porteur d'information.
- Pictos Lucide inline, trait 2 px, jamais remplis, jamais en police d'icônes.

## Colors

Une palette resserrée bleus / marine / rouge, posée sur les deux seuls aplats clairs du produit : le blanc et le jaune des billes. Chaque entrée du frontmatter `colors` est un token `--color-*` ou un arrêt de `--gradient-*` dans `main.css`, et chaque token y a au moins un consommateur (`tokens.test.ts`) ; exceptions : le blanc pur, l'encre noire et le voile sont les `white` / `black` de Tailwind (`text-white`, `bg-black/25`), et le rouge alerte est calculé par `ShotClock` en HSL, non lu d'un token.

### Primary
- **Bleu roi** (#1D4ED8) : LE bleu du produit depuis la Story 11.2 (Nathan, au rendu, sur le marine Cueuny : « tous les CTA bleus comme ça ») ; il remplace le bleu drap #0573BB de l'Epic 10, médiane du drap Simonis, qui ne s'accordait plus au marine. Point d'arrivée du dégradé bleu ; jamais seul sur un bouton.
- **Bleu roi clair** (#3B82F6) : point de départ du dégradé bleu (`--gradient-blue`, 160°, bleu roi clair → bleu roi). Tuiles de mode disponibles, CTA de réglage (`CHANGER DE BILLE`, `CHANGER DE CÔTÉ`), CTA de saisie de la barre basse, `PASSER LE TOUR`, `VALIDER` et tout CTA principal de pop-up. Blanc dessus : 3,68:1 sur le stop clair (tenable seulement par du « grand texte », soit ≥ 20 px gras), 5,18:1 à 72 % de la hauteur, là où le picto repousse le libellé `stat` de `PASSER LE TOUR` (mesuré le 2026-09-17, Story 11.4).
- **Bleu moyen / Bleu sombre** (#0668AD → #033F6B) et **Bleu nuit / Bleu abysse** (#05508A → #022B4D) : les deux dégradés sombres des tuiles `BIENTÔT` (Quilles, Casin). Ils disent l'inactivité autant que le badge. Une tuile qui s'ouvre bascule sur le dégradé bleu.

### Secondary
- **Rouge profond** (#D0343F, `--color-brand-red`) : rouge de marque, bandeau en biais de l'en-tête de la barre latérale, valeur de série en cours sur la carte joueur, **ruban de la colonne gagnante au récap**. Blanc dessus 4,95:1.
- **Rouge CTA clair → Rouge CTA sombre** (#F04553 → #C41F2C) : `--gradient-red`, le dégradé de `DÉMARRER`, seul CTA rouge. Plus saturé que le rouge de marque pour tenir face au bleu roi (Nathan, 11.2, six candidats dont l'ambre, l'émeraude et le jaune de la bille). Blanc dessus 3,70:1 sur le stop clair (`start-button` ≥ 20 px gras), 5,87:1 sur le sombre. **Un seul token** (Story 11.2, Nathan : « ça ne me choque pas ») : le second, `--color-victory-ribbon`, valait la même couleur et a été supprimé — deux rôles qui redivergeraient un jour repasseront par ce document.
- **Rouge vif** (#FF2D46) : liseré de tour actif (`ring-8`) autour de la carte du joueur qui joue, et son prolongement autour du disque du chrono. Signal de tour, jamais d'alerte.
- **Rouge alerte** (#FF3B30, hsl 3 100 % 59 %) : point d'arrivée du fondu du chrono de tir (vert 130° → jaune → orange → rouge). Ne sert qu'au chrono, qui le **calcule en HSL** dans `ShotClock` : aucun token `--color-alert` ne le porte (retiré en 11.2, il n'était lu nulle part) — exception connue au miroir couleurs ↔ tokens.

### Tertiary
- **Jaune franc** (#FFF200, teinte 57°) : carte du joueur de droite, bille jaune. Bleu à zéro, saturation pleine : c'est ce qui le rend franc plutôt que doré ou délavé (quatre essais en 10.4). Ne jamais y remettre de bleu « pour adoucir ». Encre noire 17,95:1. ⚠️ **Remonté de #FFE000 le 2026-09-19** (Nathan, au rendu, Story 11.5 : « un jaune plus peps ») : même principe — bleu à zéro —, teinte poussée vers le citron (52,7° → 57°) et plus lumineux. Écartés au même rendu : les jaunes chauds (#FFCF33, retour au doré), beurre (#FFE566) et fluo (#F5FF00, reflet vert), et les versions plus claires de celui-ci (#FFF533 à #FFF880 : dès #FFF766, il pâlit à côté de la carte blanche).
- **Jaune bandeau** (#E6DA00) : bandeau haut de la carte jaune (nom, distance, restant, stats), le jaune franc à 90 %. Encre noire 14,39:1.
- **Blanc pur** (#FFFFFF) : carte du joueur de gauche, bille blanche ; et couleur de tout texte sur fond sombre.
- **Blanc bandeau** (#ECECEC) : bandeau haut de la carte blanche.
- **Blanc cassé** (#F2F0EA) : bande claire du bandeau du récap, seul aplat clair hors cartes joueur. Cassé et non pur pour ne pas éblouir en salle sombre ; texte en marine sombre.

### Neutral
**Deux niveaux de marine, modèle Cueuny** (Story 11.2, Nathan, 2026-09-16 : une barre sombre qui se sépare du fond par une ombre, un fond un cran plus clair). Teinte 228°, saturation 30 % : la même famille que le drap, un ton en dessous. Ni dégradé ni noir pur : les aplats sont plats, la profondeur vient de la marche entre les deux niveaux et de l'ombre de la barre.
- **Marine sombre** (#1E2438, `--color-bg`) — **niveau 0**, la base : fond de page (`color-scheme: dark`), **barre latérale**, base du scoreboard et sa **barre basse**, **colonne centrale du scoreboard** (à plat, sans voile : un creux entre les deux cartes), **disque du chrono** (il est la colonne, il ne déborde en marine que sur les cartes claires — plus rien à recalculer), encre sur le bandeau clair du récap (13,5:1).
- **Marine clair** (#272E49, `--color-bg-raised`) — **niveau 1**, un cran au-dessus : fond des quatre écrans hors jeu (accueil, sélection JDS, paramétrage, récap ; le scoreboard n'en a pas, ses colonnes couvrent l'écran) et **carte de pop-up en verre léger** (88 % d'opacité, flou de 8 px de ce qui passe sous la carte seule ; le voile plein écran reste sans flou). Blanc dessus 13,4:1.
- **Surface voilée** (blanc 8 %) : conteneur et cellules du récap, fond des pictos d'action. Un voile, pas une couleur : il prend la teinte de ce qu'il couvre. Passé de 6 à 8 % en 11.2 pour garder sa marche sur le marine.
- **Filet** (blanc 22 %) : contour par défaut de tout conteneur (1 px), séparateur des tuiles, filet de toute carte de pop-up (la décision rejoint les saisies : un seul filet, plus de 12 %). Passé de 18 à 22 % en 11.2. La barre latérale n'a plus de filet droit : son ombre la sépare.
- **Ardoise touche / Ardoise touche active** (#3C4153 / #494E65) : plaques des claviers, au repos et enfoncées ; teintées dans la famille du marine pour s'asseoir sur la carte de pop-up.
- **Ardoise CTA → Ardoise CTA sombre** (#464B5D → #323643) : `--gradient-neutral`, CTA neutres opaques (`ANNULER`, secondaire de pop-up). Même famille que les touches. `PASSER LE TOUR` n'est plus neutre : il est bleu (11.2).
- **Colonne du paramétrage : aucune couleur.** Ni fond ni cadre (Nathan, 11.2 : « cette colonne rend vraiment moche ») — les trois commandes flottent sur le marine clair. `--gradient-panel` est supprimé.
- **Voile** (noir 25 %) : fond plein écran des quatre pop-ups, **sans flou**.
- **Encre noire** (#000000) : tout texte posé sur une carte joueur, bandeau compris.
- **Focus** : l'anneau `focus-visible` de 4 px est **rouge vif** (`--color-turn-active`), déjà le signal « visé » du produit ; le bleu accent (#1E88E5) est retiré. Sur une tuile ou un CTA bleu roi, l'anneau ne fait que 1,82:1 sur le stop sombre (#1D4ED8) et 1,00:1 sur le clair (le blanc y ferait 6,70:1) : écart connu, la borne n'a pas de clavier et l'anneau n'apparaît jamais en usage (`deferred-work.md`).
- **Retirés en 11.2, sans consommateur** : `--color-victory-gold` / `--color-on-victory-gold`, `--color-alert` / `--color-on-alert`, `--color-accent` / `--color-on-accent`, `--color-border-strong`, `--gradient-field`, `--radius-container` ; et `--color-victory-ribbon` / `--color-on-victory-ribbon` (fusion), `--color-sidebar` et `--color-shot-clock-face` (la barre et le disque sont le niveau 0), `--gradient-bg` et `--gradient-panel` (aplats).

### Named Rules
**La Règle de la bille.** Gauche = blanche, droite = jaune, encre noire sur les deux, fixées au côté de la table. Le tour actif se signale par le liseré rouge vif, jamais par la teinte du bloc. Le récap et le paramétrage conservent les côtés du scoreboard.

**La Règle du bleu unique.** Un seul dégradé bleu pour toutes les tuiles disponibles et tout CTA qui demande du bleu : les modes sont des pairs, on ne les hiérarchise pas par la nuance. Le bleu roi n'est jamais posé seul sur un bouton. *(En vigueur ; Nathan veut voir des alternatives à la passe.)*

**La Règle du rouge qui engage.** Le rouge est réservé à la marque, à la valeur de série en cours et à la victoire — **un seul token**, `--color-brand-red`, pour ces trois rôles — et à l'action qui engage la partie, `DÉMARRER`, qui a son propre dégradé rouge saturé (Story 11.2). Un réglage qu'on peut retoucher est bleu, une action de jeu (`PASSER LE TOUR`, `+1`) aussi ; un retour (`ANNULER`) est neutre. Jamais de rouge sur un refus. Le rouge vif reste à part : tour actif, champ visé, anneau de focus.

**La Règle du voile clair.** Une pop-up pose un voile noir à 25 % et rien d'autre : jamais de flou sur le voile, parce que la carte qu'on remplit doit rester lisible sous la pop-up. Le verre de la carte de pop-up (Story 11.2, densifié par la 11.5) ne floute que ce qui passe **sous la carte**, jamais l'écran.

**La Règle des deux niveaux.** Tout fond sombre est marine sombre (niveau 0) ou marine clair (niveau 1), rien d'autre : pas de troisième gris, pas de dégradé de fond, pas de noir pur. Ce qui est posé sur un niveau se détache par un voile blanc, un filet ou une ombre nommée, jamais par une teinte nouvelle.

## Typography

**Display Font:** Saira (variable, 100–900 ; system-ui, Avenir, Helvetica, Arial, sans-serif en repli) — token `--font-sans` de `main.css`, lu par `:root`
**Body Font:** la même famille
**Label/Mono Font:** aucune ; `tabular-nums` sur tous les chiffres

**Character:** une seule famille, **Saira** (Omnibus-Type, OFL 1.1), choisie au rendu par Nathan à la Story 11.2 parmi six candidates face à la police système (Inter, Barlow, Archivo, Saira, Exo 2, Titillium Web) : géométrique et sportive, des chiffres carrés, une graisse 900 qui reste nette, et 95 % de la largeur de `system-ui` — l'échelle ci-dessous tient sans retouche, les noms tiennent mieux. Le caractère vient de la graisse et de la casse : **900 partout où ça compte**, majuscules sur tous les libellés, chiffres tabulaires à fond de casse (`tabular-nums`, que Saira honore). Le texte ne descend en minuscules que pour l'accroche d'accueil (« À vous de jouer. »). **Auto-hébergée** : deux fichiers `.woff2` variables (latin, latin-ext) dans `src/assets/fonts/`, précachés par le service worker, `font-display: block` ; aucune ressource réseau au runtime. Aucune face italique n'est embarquée : le `VS` du récap est un oblique **synthétisé** par le navigateur (accepté par Nathan à la revue de la 11.2). La dette « police display non choisie » de la 10.1 est close.

**Échelle conçue pour 1920×1080** (Story 11.1). Chaque rôle est un `clamp()` dont le **plancher est le rendu validé à 1180×733** pendant l'Epic 10 et dont le **plafond est atteint à 1920 px de large**, jamais avant 1280 : sur l'écran de club, l'interface a sa taille ; sur la tablette, elle garde celle qui a été validée. Les rôles relatifs à un conteneur (`series`, `clock`) grandissent d'eux-mêmes avec leur carte ou leur disque, seul leur plafond est fixé ici. **L'échelle des textes n'a de sens que si les boîtes suivent** : la grille `--spacing` est fluide (Layout › Rythme), sinon `CONFIGURATION` à 19 px déborde d'une barre latérale de 120 px fixes et `ANNULER` à 38 px de son tiers d'une pop-up de 512 px (1re passe de rendu de la 11.1, qui avait dû brider `picto`, `label` et `stat` à 13 / 30 / 20 avant que Nathan ne tranche : « en 1920 toutes les proportions ne sont pas bonnes, tout est un peu trop petit »). Chaque rôle est un token `--text-<rôle>` de `main.css` (utilitaire `text-<rôle>`), et **aucun gabarit n'écrit une taille en valeur arbitraire** : un rôle qui manque s'ajoute ici d'abord.

### Hierarchy
Rendus indiqués aux trois formats de vérification : 1133 / 1180 / 1920 px de large.

- **Score** (`score-1` … `score-4`, `score-more` ; 900, interligne 1, tabulaire) : le plus gros élément de l'écran, sans exception. La taille se choisit selon le nombre de chiffres — `min(42vw, 40vh, 520px)` à un chiffre, puis 24 / 16 / 12 / 9 vw à deux, trois, quatre, cinq chiffres et plus : `vw` protège de la largeur de la carte, `vh` de sa hauteur (298 / 293 / 432 px), 520 px ne plafonne qu'au-delà de 1080 px de haut (signage). Le token historique `--text-score` est supprimé.
- **Reprise** (`reprise` ; 900, `clamp(72px, 7.5vw, 144px)` → 85 / 88 / 144, interligne 1) : numéro de reprise de la colonne centrale, dimensionné pour un cinquième d'écran.
- **Chrono** (`clock` ; 900, `48cqmin` du disque, tabulaire) : chiffre du chrono de tir, relatif au disque et non à l'écran.
- **Série en cours** (`series` ; 900, `clamp(24px, 10cqw, 80px)` → 45 / 47 / 77, rouge profond, tabulaire) : la valeur au pied de la carte joueur, relative à la largeur de la carte.
- **Correction** (`adjust` ; 900, `clamp(30px, 2.5vw, 48px)` → 30 / 30 / 48, à 60 % d'opacité) : `−` / `+` du pied de carte ; un rattrapage d'arbitrage, jamais en concurrence avec le score.
- **Hero** (`hero` ; 900, `clamp(48px, 4.75vw, 91px)` → 54 / 56 / 91, interligne serré) : accroche d'accueil, titre de la sélection JDS, `VS` du récap (italique synthétisé, blanc 60 %).
- **Title** (`title` ; 900, `clamp(32px, 3.03vw, 58px)` → 34 / 35 / 58, majuscules, interligne 1) : titre de tuile de mode, nom du mode en bandeau de paramétrage (interlettré `title`), noms et distances du bandeau de récap. Sans interlettrage sur les tuiles.
- **Label** (`label` ; 900, `clamp(20px, 2vw, 38px)` → 23 / 24 / 38, majuscules) : tout CTA de pop-up (interlettré `label`), nom et distance sur la carte joueur, `RESTANT` / `POUR n`, valeurs du récap, titre de pop-up (interlettré `label`), CTA de barre basse (interlettré `label`), message de pop-up (blanc 70 %, graisse normale), touches d'action des claviers. Plancher 20 px gras : c'est ce qui fait tenir le seuil AA « grand texte » (3:1) du blanc sur le stop clair du dégradé bleu (3,68:1) à tout format.
- **Stat** (`stat` ; 700, `clamp(14px, 1.2vw, 23px)` → 14 / 14 / 23, majuscules, interlettré `stat` sur les libellés) : `MOY` / `SÉRIE` (libellé à 60 %, valeur en 900), `REP`, libellés du récap (blanc 50 %), mode du récap, `BILLE BLANCHE`, `NOM` / `DISTANCE` et leurs placeholders, `PASSER LE TOUR` et les deux CTA de réglage (en 900), badge `BIENTÔT` de tuile. « Grand texte » (≥ 18,66 px en 700, seuil 3:1) seulement au-delà de 1555 px de large : sur tablette, tout ce qui est en `stat` sur un dégradé doit tenir 4,5:1.
- **Picto** (`picto` ; 700, `clamp(12px, 1vw, 19px)` → 12 / 12 / 19, majuscules, **sans** interlettrage) : libellé sous picto dans la barre latérale et la barre basse, badge `BIENTÔT` des items (jamais sous 12 px), mot `1Score` de l'en-tête (900, interlettré `title`).
- **Touche numérique** (`key-numeric` ; 600, `clamp(30px, 3.4vw, 65px)` → 38 / 40 / 65, interlettrage serré `tracking-tight`, −0,025 em, utilitaire standard) et **touche alpha** (`key-alpha` ; 600, `clamp(18px, 2vw, 38px)` → 23 / 24 / 38). `AC` / `C` / `⌫` / `ESPACE` / `RESET` en `label` 700 blanc 55 %.
- **Valeur de champ** (`field-value` ; 900, `clamp(24px, 2.61vw, 50px)` → 29 / 31 / 50) : `NOM` / `DISTANCE` remplis sur la carte de paramétrage.
- **`DÉMARRER`** (`start-button` ; 900, `clamp(20px, 1.62vw, 31px)` → 20 / 20 / 31, interlettré `label`) : plancher 20 px gras pour tenir 3:1 sur le stop clair du dégradé rouge (3,70:1).

### Interlettrage
Trois valeurs nommées, tokens `--tracking-<nom>` (utilitaire `tracking-<nom>`), et rien d'autre dans les gabarits :
- **`title`** (0,15 em) : titre de paramétrage, placeholders `NOM` / `DISTANCE`, touches d'action `AC` / `C` / `RESET`, mot `1Score`.
- **`label`** (0,1 em) : titres de pop-up, CTA de barre basse, `RÉSULTAT` du récap, `DÉMARRER`.
- **`stat`** (0,25 em) : libellés `stat` — mode du récap, `BILLE BLANCHE`, `NOM` / `DISTANCE` au-dessus d'une valeur, libellés du récap, `★ RECORD`, `ESPACE`.

Hors tokens : `tracking-tight` (−0,025 em, utilitaire standard) sur les chiffres du pavé numérique, seul interlettrage négatif du produit.

### Named Rules
**La Règle des chiffres nus.** Distance et restant s'écrivent sans libellé sur la carte joueur ; `MOY` et `SÉRIE` gardent le leur, sinon trois nombres nus se confondent. Un nom peut se tronquer (deux lignes puis ellipse) ; **un nombre rogné deviendrait faux, il ne se tronque jamais**.

**La Règle de la moyenne.** La moyenne s'affiche à trois décimales (convention fédérale), en tabulaire, partout.

## Layout

**Toute mesure en pixels de ce document est la valeur sur tablette** (grille `--spacing` à 8 px) ; à 1920 elle vaut × 1,63 (grille à 13 px), voir Rythme.

**Paysage exclusivement.** Formats de vérification : 1920×1080 (référence, écran 21,5″), 1180×733 (format de travail réel), 1133×744 et 1194×834 (iPad, plancher). Aucune variante portrait ni téléphone n'existe dans le code. **Il n'y a pas de palier d'écran** : entre l'iPad mini et le 21,5″, la mise en page grandit sans rupture (grille `--spacing` fluide et `clamp()` typographique, Story 11.1). `md:` (≥ 768) reste déclaré et vaut « à partir de la tablette paysage » — sous le plancher produit, il est toujours vrai. ⚠️ **`--breakpoint-lg: initial` est une GARDE, pas une survivance** : sans cette ligne, Tailwind v4 fournirait `lg` à 1024 px, donc SUR L'IPAD, et un `lg:` écrit par distraction s'appliquerait à 1180. Ne pas la retirer en croyant nettoyer un token mort (revue de la 11.2, contradiction levée à la revue de la 11.3). Les variantes des cartes joueur se font en **container queries** (`@min-[420px]`), jamais en breakpoints d'écran.

**Une coquille pour quatre écrans hors jeu** (accueil, sélection JDS, paramétrage, récap) : fond marine clair (`--color-bg-raised`, à plat), **barre latérale de 15 unités** (120 px sur tablette, 195 à 1920) collée au bord gauche (aplat marine sombre, **ombre portée sur le contenu** à sa droite, en-tête avec logo et mot `1Score` sur bandeau rouge coupé en biais, items empilés, sortie calée en bas), puis `<main>` à droite.
- **Accueil et sélection JDS** : accroche en haut à gauche (`px-4 pt-5`), puis une rangée de **quatre tuiles jointives sur 34 % de la hauteur**, collées à la barre et aux bords, séparées par un filet, hauteur minimale `tile-min-height`.
- **Paramétrage** : **le même format que le scoreboard** depuis la Story 11.5 (Nathan, au rendu, 2026-09-19, propositions « M » puis « T1 ») — un **grand bloc** voilé (`rounded-zone`, filet, marge et retrait d'**une unité**) contient trois blocs séparés d'une unité : carte joueur (`rounded-block`), colonne centrale à 1/4 **en creux** (base nue `bg-bg`, `rounded-block`, retrait d'une unité), carte joueur. **Plus de bandeau de titre** : le mode se lit **en tête de la colonne centrale**, au-dessus du bloc des trois commandes calé en bas — les cartes montent jusqu'en haut de l'écran. Le titre peut passer à la ligne, centré, plutôt que d'être tronqué (« CADRE 47/2 » dans un quart de largeur). Cet écran est appelé à évoluer (Nathan : « à terme cet écran sera modifié »).
- **Récap** : **le format du scoreboard** depuis la Story 11.5 (Nathan, au rendu, 2026-09-19, proposition « R1 ») — `<main class="p-1">`, un seul conteneur, qui est le **grand bloc** (`rounded-zone`, filet, surface voilée, `overflow-hidden` qui arrondit aussi le bandeau VS) ; sous le bandeau, trois **blocs-colonnes** au rayon de bloc, retrait et gouttière d'une unité : colonne du vainqueur, **colonne des libellés en creux** (base nue `bg-bg` portée par la colonne, libellés en blanc à **75 %** — 9,23:1 mesuré ; 50 % donnait 4,92:1, juste au seuil AA et terne à côté des cellules pleines), colonne du perdant. Les cellules restent jointives dans leur colonne (`gap-1`), la colonne des libellés à 1/5.

**Le scoreboard n'a pas de coquille, mais il a DEUX FORMES** depuis la Story 11.5 (Nathan, au rendu, 2026-09-18) : un **grand bloc** (`rounded-zone`, surface voilée, filet) qui contient les trois colonnes, et une **barre basse** de même rayon, toutes deux détachées des bords de l'écran d'**une unité** et séparées l'une de l'autre de la même unité. Dans le grand bloc, les trois colonnes restent à **2/5 · 1/5 · 2/5**, chacune dans son propre bloc (`rounded-block`) séparé d'**une unité de gouttière** — la colonne centrale garde la base marine sombre **nue**, elle se creuse dans le bloc qui l'entoure. La **barre basse** ne porte plus de grille propre : elle **reprend celle des colonnes**, terme à terme : CTA de saisie pleine largeur dans la colonne du joueur assis, espaceur central, quatre pictos d'action espacés d'une unité et demie (`gap-1.5`, 12 px sur tablette) dans l'autre colonne, `QUITTER` au bord extérieur. Les deux groupes échangent de côté à chaque bascule de tour.

**⚠️ Le disque du chrono NE DÉBORDE PLUS sur les cartes** (Nathan, au rendu, 2026-09-18, Story 11.5 — décision qui **renverse** l'AC16 de la Story 10.4). Le débordement était la signature de colonnes **soudées** : le disque mordait de 3 unités dans chaque carte voisine, un demi-anneau rouge reprenait le tracé du liseré de tour autour de lui, et les cartes réservaient une gouttière intérieure pour l'absorber. Dès que les colonnes deviennent des **blocs séparés**, cet empilement ne tient plus : la gouttière s'arrête contre le disque au lieu d'en faire le tour, et le blanc de la carte, le liseré rouge et la bande grise finissent tous les trois sur une diagonale. Quatre passes de rendu ont cherché un raccord propre — demi-anneau redessiné, cadre fermé par-dessus, anneau complet, colonne bombée — avant que Nathan ne tranche : « on va abandonner l'effet de débordement, ça me paraît trop complexe à faire ; contente-toi de mettre le chrono le plus gros possible dans le container ». **Le token `--game-clock-bleed` est retiré, le demi-anneau de `ShotClock` aussi**, et le liseré `ring-8` de la carte active redevient un **contour continu**, sans raccord à faire. Une autre manière de relier le chrono aux cartes reste à trouver (`deferred-work.md`).

**Le disque remplit son bloc.** La zone du chrono occupe toute la largeur de la colonne centrale — **le retrait de la colonne est annulé pour elle**, l'anneau va d'un bord à l'autre — et c'est la **largeur** de la colonne qui gouverne sa taille, aux trois formats (disque de 220 px à 1133, 229 à 1180, 373 à 1920 : exactement la colonne). Les trois éléments de la colonne (REP, chrono, `PASSER LE TOUR`) **gardent leur espacement de trois unités** : sans débordement, les resserrer ne rend pas un pixel au disque — vérifié au navigateur, `gap-1` et `gap-3` donnent la même taille. Ne pas resserrer en croyant agrandir le chrono.

**La gouttière entre les trois colonnes est UNE SEULE VALEUR** (`--game-column-gutter`, frontmatter `spacing` › `column-gutter`), **à une unité de grille** — 8 px sur tablette, 13 px à 1920 (Story 11.5, Tasks 2 et 3, 2026-09-18 ; introduite à `0` par le découplage, puis arbitrée au rendu par Nathan). Arbitrage pris explicitement : c'est un **token**, pas une constante d'écran transmise en prop. Raison : **plusieurs lectures dans plusieurs fichiers qui doivent coïncider au pixel** (`CLAUDE.md` §10), et une gouttière est un **rythme de mise en page**, pas une position d'écran (ce qui distinguait les quatre faux tokens d'inset rapatriés en 11.3). Les lectures (revue de code de la 11.5, 2026-09-19 — le débordement abandonné a fait tomber les deux lectures du chrono) :
- `GameView` — l'écart réel entre les trois colonnes du scoreboard (`gap` du grand bloc) ;
- `ActionBar` — l'écart entre les groupes de la barre basse : c'est lui qui fait tomber les boutons **exactement** sous les cartes (0,0 px mesuré aux trois formats) ;
- `HomeScreen` (paramétrage) et `GameSummary` (récap) — le même format carte · colonne · carte lit la même gouttière, au lieu d'un `gap-1` recopié.

⚠️ **Ni `CenterPanel`, ni `ShotClock`, ni `PlayerPanel` ne lisent la gouttière** : depuis l'abandon du débordement, la zone du chrono annule seulement le retrait de sa colonne (`-mx-1`), le disque remplit la colonne, et les cartes n'ont plus de gouttière intérieure (retirée à la revue du 2026-09-19, décision de Nathan : elle décentrait nom et score). Une lecture de plus serait une lecture à tenir pour rien.

*Historique — plafond de gouttière, CADUC.* Le 2026-09-18, tant que le disque débordait, la gouttière était plafonnée par la morsure du disque dans les cartes à 1920×1080 (0 → 21,5 px · 1 unité → 8,5 px · 2 unités → décollé). Le débordement étant abandonné le jour même, **ce plafond ne contraint plus rien** : la gouttière d'une unité est un choix de rendu, et une autre valeur se juge au rendu, pas contre cette mesure.

**La marge au pourtour et la gouttière valent la même unité, et ce ne sont PAS le même token.** La marge (entre l'écran et le grand bloc, entre le grand bloc et la barre, entre le bord du grand bloc et les blocs qu'il contient) s'écrit en **utilitaires de grille** (`m-1`, `p-1`) : une seule lecture chacune, rien à faire coïncider. La **gouttière** est un token parce qu'elle a **trois** lectures qui doivent coïncider au pixel. Qu'elles vaillent aujourd'hui la même unité est un choix de rythme, pas une identité : l'une peut changer sans l'autre.

**Pop-ups** : quatre pop-ups, un patron (`PopupCard`). Voile plein écran, carte centrée verticalement ; les trois hôtes de saisie se **centrent dans la zone laissée libre par la carte visée**, du côté opposé. **Le placement est transmis par l'écran, pas par un token** (Story 11.3) : `PopupCard` reçoit `align` (le côté où elle se pose) et `reserve` (la bande à réserver en face, en unités de grille) et les pose en style en ligne. `HomeScreen` déclare la géométrie de l'étape `players` (asymétrique : la barre latérale n'est que d'un côté), `GameView` celle du scoreboard (symétrique : 40 vw plus une gouttière) — chacune **à côté de la mise en page qu'elle mesure**. Les quatre insets `--*-popup-inset-*` qui vivaient dans `main.css` ont disparu : ils recopiaient la géométrie d'un écran, et **un token décrit une intention, jamais une position**. Largeurs de carte en unités de grille : `max-w-72` (décision), `max-w-64` (pavé), `max-w-96` (clavier alpha) — elles suivent l'écran.

**Rythme** : `--spacing` est **fluide** depuis la Story 11.1 (décision de Nathan, 2026-09-15) : `clamp(8px, 0.678vw, 13px)`, soit **8 px sur tablette** (le double du défaut Tailwind, plancher = rendu validé à 1180) et **13 px à 1920** (× 1,63, le facteur de l'échelle typographique). Tout utilitaire numérique (`p-4`, `gap-2`, `gap-1.5`, `size-4`…) et toute taille de boîte en découlent, **aucun gabarit n'écrit un pixel fixe** : cible tactile `touch-target` (90 → 146 px) sur toute commande de jeu ; touches `key-numeric` (60 → 98) et `key-alpha` (57 → 93), exception assumée UX-DR8, et les planchers de leurs grilles `pad-min` (288 → 468) et `alpha-min` (382 → 621) ; `DÉMARRER` `start-button` (110 → 179) ; champs de paramétrage `field-min` / `field-max` (130–220 → 211–358) ; tuiles `tile-min` (180 → 293) ; barre latérale `sidebar` (120 → 195) ; largeurs de pop-up `popup-decision` / `popup-pad` / `popup-alpha` (576 / 512 / 768 → 936 / 832 / 1248). **Chaque entrée est un token `--size-<nom>` de `main.css`**, lu par le gabarit (`w-(--size-sidebar)`, `max-w-(--size-popup-pad)`, `min-h-(--size-pad-min)`…), jamais recopié en multiple de grille ni en `calc()` dans un gabarit ; `typography.test.ts` tient le miroir dans les deux sens. Les bandes réservées aux pop-ups de saisie sont écrites en unités de grille, jamais en pixels — et depuis la Story 11.3 elles vivent dans l'écran qui les décrit, plus dans le namespace des tokens. Pas de la grille sur tablette : 4, 8, 12, 16, 24, 32, 40, 48, 80. Restent fixes, à dessein : les liserés (`ring-8`, 1 px de filet), les rayons (`--radius-*`) et les ombres (`--shadow-*`), qui sont des tokens de `main.css` et jamais des valeurs de gabarit.

## Elevation & Depth

**Plat par défaut, par couches tonales.** La profondeur vient de quatre niveaux de valeur (marine sombre, marine clair, surface voilée à 8 %, aplats clairs des cartes) et d'un filet blanc à 22 % qui cerne chaque conteneur. Les cartes joueur ne portent aucune ombre : leur clarté suffit à les faire avancer.

Le relief est réservé à **ce qui se tape**, à **ce qui flotte** et à **la barre latérale** (Story 11.2, modèle Cueuny : c'est son ombre qui la sépare du fond, plus un filet). Chaque ombre est un token `--shadow-<nom>` de `main.css` (frontmatter `shadows`), consommé par `shadow-<nom>` ; aucune ombre ne s'écrit en valeur arbitraire dans un gabarit :

### Shadow Vocabulary
- **Relief de touche** (`key-relief` : `inset 0 1px 0 rgba(255,255,255,0.10), 0 2px 0 rgba(0,0,0,0.45)`) : plaques des claviers. À l'appui (`key-relief-active` : `inset 0 1px 0 rgba(255,255,255,0.06)`) l'ombre portée disparaît, le filet clair tombe à 6 % et la touche descend d'un pixel : elle s'enfonce.
- **Relief de CTA** (Story 11.5, Nathan, au rendu, 2026-09-19, proposition « K1 ») : le relief de touche, étendu à **tous les CTA** et aux pictos de la barre basse — un filet de lumière en haut et une **tranche de 3 px dessous** (`spacing` › `relief-depth`, `--size-relief-depth`), **de la couleur du bouton en plus sombre** : `cta-relief-blue` (tranche `#163A9E`), `cta-relief-red` (`#8A1520`), `cta-relief-neutral` (`#181B24`, filet à 14 % seulement : il s'éclaircit à l'appui, un filet fort le ferait briller). ⚠️ Tranche **teintée**, jamais noire : une tranche noire se perdait sur les fonds sombres (creux du paramétrage, barre basse), mesuré au rendu. À l'appui (`cta-relief-active`), la tranche disparaît et le bouton **descend de `relief-depth`** — le même token que la tranche : il s'enfonce exactement de son épaisseur, et une seule valeur tient les deux (revue de code de la 11.5 : le `translate-y-[3px]` recopié dans deux gabarits est retiré). **Inactif, il est plat** : la tranche tombe avec l'opacité (`disabled:shadow-none` — revue du 2026-09-19, décision de Nathan : un bouton mort qui garde son relief a encore l'air de s'enfoncer). Remplace `light-edge-start`, le filet seul de `DÉMARRER`, dont la valeur survit dans `cta-relief-red`.
- **Filet de lumière** (`light-edge-field` : `inset 0 1px 0 rgba(255,255,255,0.35)` sur les champs de paramétrage) : un seul trait clair en haut, qui donne du corps sans ombre.
- **Ombre de pop-up** (`popup` : `0 32px 80px rgba(0,0,0,0.65)`) : la carte de toute pop-up, posée sur le voile à 25 %.
- **Ombre de barre** (`sidebar` : `6px 0 28px rgba(0,0,0,0.45)`) : la barre latérale la projette sur le contenu, à droite.
- **Ombre de barre basse** (`bottom-bar` : `0 -6px 24px rgba(0,0,0,0.45)`) : la barre basse du scoreboard la projette **vers le haut**, sur le grand bloc des colonnes. ⚠️ **Arbitrage de la 11.2 rouvert et re-tranché** (Story 11.5, Task 5, Nathan, au rendu, 2026-09-19, proposition « O2 » — écartée : « O1 », la même ombre sur les deux zones sœurs) : en 11.2 elle était écartée (« pas hyper bien intégrée ») sur une barre marine sombre à fleur de bord ; la barre est depuis devenue une **forme** détachée, sœur du grand bloc, et l'ombre la pose au-dessus de lui. Elle reste **discrète** sur la base marine — mesuré au rendu : sur un fond aussi sombre et à une unité d'écart, une ombre diffuse se lit à peine ; c'est un choix d'intention, pas de contraste.
Les ombres portées diffuses du produit sont donc **trois** : pop-up, barre latérale, barre basse.

**Retours d'appui** : sur tout CTA et tout picto de la barre basse, **la tranche disparaît et le bouton descend de 3 px** (Story 11.5), en plus de `brightness(0.9)` sur les CTA en dégradé bleu et rouge et `brightness(1.25)` sur le neutre ; `brightness(1.10)` au survol et `1.25` à l'appui sur les tuiles, fond blanc 15 % sur les pictos d'action, noir 16 % et opacité pleine sur `−` / `+`. **Instantanés** (aucune transition), sauf 75 ms sur les touches.

### Named Rules
**La Règle du relief tapable.** Un conteneur est plat et cerné ; seul un objet qu'on tape a du **corps** — la tranche de relief (`cta-relief-*`, `key-relief`), le filet de lumière et le rayon tapable (8 px). Un conteneur peut être **arrondi** (rayons `zone` et `block` de la mise en page carte · colonne · carte, Shapes) sans cesser d'être plat : l'arrondi donne une forme, pas un corps. Une ombre sur une carte joueur, une tuile, une colonne ou un bloc est une faute ; les trois ombres portées du produit vont à ce qui **flotte** (pop-up) et aux deux **barres** qui encadrent un écran (barre latérale, barre basse du scoreboard). *Réécrite le 2026-09-19 (Story 11.5, Task 5) : elle disait « rayon de 8 px » comme marque de ce qui se tape et ignorait les blocs arrondis, et elle comptait deux ombres portées.*

**La Règle de l'inactif.** Ce qui n'est pas disponible s'atténue (`disabled` à 30 %, `BIENTÔT` : fond à 45 % **et désaturé**, titre en blanc à 50 % — Story 11.5, Nathan, 2026-09-19, « griser les éléments » : le fond bleu seulement atténué se lisait encore comme une tuile ouverte ; le badge, lui, reste plein, c'est lui qui porte l'information) **et** porte un badge : l'information ne repose jamais sur la couleur seule. Cette atténuation ne se « corrige » pas au contraste (WCAG §1.4.3).

## Shapes

**Des rayons nommés par famille d'objets** (Story 11.2, Nathan, 2026-09-16 — l'unité demandée est « les mêmes arrondis partout » ; deux à l'origine, quatre depuis la Story 11.5 : `tappable`, `popup`, `zone`, `block`) :
- **Conteneurs à angles vifs** (aucun token, aucun `rounded-*`) : tuiles, barre latérale, bandeaux. « L'app doit se lire comme un outil tactile, pas comme une app mobile » (Nathan, 10.1). ⚠️ **La mise en page carte · colonne · carte fait exception depuis la Story 11.5** (scoreboard, paramétrage, récap) — voir ci-dessous ; la règle vaut intacte partout ailleurs.

**⚠️ EXCEPTION DATÉE ET MOTIVÉE — le scoreboard est en blocs arrondis** (Nathan, au rendu, 2026-09-18, Story 11.5, Task 3, quatre passes de comparaison). La règle des angles vifs a été **arbitrée en connaissance de cause**, et écartée **pour cet écran seul** :

- **Ce qui l'a motivée.** Le report de la 11.2 (photo `billiboard_scoreboard`) demandait « cartes joueur arrondies et séparées par une marge, barre basse mieux découpée ». Les deux premières propositions (marges seules, sans rayon) ont été écartées par Nathan : « les éléments du bas doivent être compris dans une espèce de **barre** un peu arrondie, l'élément central aussi et globalement toute la partie du haut aussi ». Une marge sépare ; elle ne donne pas de **forme** à ce qu'elle sépare. C'est la forme qui manquait.
- **Deux niveaux de forme, deux rayons nommés par famille d'objets** (la règle de nommage, elle, ne bouge pas) :
  - **Zone, 16 px** (`--radius-zone`, `rounded-zone`) : les deux formes de **niveau 1** du scoreboard — le **grand bloc** qui contient les trois colonnes, et la **barre basse**. Elles sont sœurs, elles ont le même rayon.
  - **Bloc, 12 px** (`--radius-block`, `rounded-block`) : les blocs **contenus** dans le grand bloc — les deux cartes joueur et la colonne centrale. Le rayon intérieur est plus petit que l'extérieur : c'est ce qui fait lire l'emboîtement.
- **Ce que l'exception NE dit PAS.** Elle ne rouvre ni les tuiles, ni la barre latérale, ni les bandeaux : ils restent à angles vifs. ⚠️ **Étendue le 2026-09-19** (Nathan, au rendu) : elle ne vaut plus pour le seul scoreboard mais pour **la mise en page carte · colonne · carte**, qu'il partage avec le **paramétrage des joueurs**. C'est cette anatomie qui porte les blocs arrondis, pas un écran nommé — un troisième écran qui l'adopterait en hériterait sans nouvelle exception. **Le récap l'a adoptée le jour même** (« R1 ») : les trois écrans à trois colonnes — scoreboard, paramétrage, récap — sont en blocs arrondis ; seuls l'accueil, la sélection JDS et la barre latérale restent à angles vifs.
- **Ce que l'exception a coûté.** Le débordement du disque du chrono sur les cartes : mesuré à 8,5 px seulement à 1920×1080 avec la gouttière d'une unité, puis **abandonné** le jour même (voir Layout). L'exception ne coûte plus rien de mesurable.
- **Le creux plutôt que le relief** (arbitrage de Nathan sur la dernière passe) : le **grand bloc est voilé** (`--color-surface`, filet `--color-border`) et la **colonne centrale reste nue** (`--color-bg`) — le centre se **creuse** dans le bloc, et le disque du chrono s'y loge comme dans une niche. La proposition inverse (bloc nu, centre voilé, le centre en relief) a été rendue côte à côte et écartée.
- **Tapable, 8 px** (`--radius-tappable`, `rounded-tappable`) : **tout ce qui se tape** — touches, CTA de pop-up, CTA de réglage, `DÉMARRER`, CTA de barre basse, pictos d'action, `PASSER LE TOUR`, `−` / `+`, champs de paramétrage. Un objet qu'on tape se lit comme un objet physique ; la valeur unique remplace les trois de l'Epic 10 (0 / 8 / 12 sur des voisins). Vérifié au rendu : à fleur de bord (CTA de barre, `PASSER LE TOUR`), les 8 px ne font pas « flotter » l'objet dans sa colonne.
- **Pop-up, 12 px** (`--radius-popup`, `rounded-popup`) : la carte des quatre pop-ups, pour se détacher du fond (validée en 10.x).

`--radius-cta`, `--radius-key`, `--radius-modal` et `--radius-container` (mort) sont retirés ; `tokens.test.ts` interdit tout `rounded-[…]` de gabarit et tout `--radius-*` que ce document ne nomme pas.

**Cercles** : billes (`rounded-full`, images PNG de 40 px), disque du chrono (`aspect-square`, `min(100cqw, 100cqh)`), arc SVG à rayon 43 et trait 6 sur un viewBox 100, cap plat.

**Filets** : 1 px blanc 22 % sur tout conteneur et sur toute carte de pop-up ; 2 px sur les champs de paramétrage (noir 25 %, rouge vif quand visé) ; liseré de tour `ring-8` intérieur rouge vif ; filet vertical `w-px` entre nom et distance sur le bandeau du récap. La barre latérale n'en a plus : son ombre la sépare.

**Coupes en biais** (signature) : en-tête de la barre latérale en deux calques `clip-path: polygon(0 0, 100% 0, 100% 92%, 0 72%)` rouge profond, puis un pli à 35 % ; bandeau du récap échancré de **4 unités de grille** de chaque côté du `VS` (`polygon(0 0, 100% 0, calc(100% - var(--spacing) * 4) 100%, 0 100%)` et son symétrique). ⚠️ En **unités**, pas en pixels, depuis la Story 11.3 : figé à 32 px, le biais valait 4 unités sur tablette mais 2,5 à 1920, où la coupe s'aplatissait et où la signature se perdait. Il garde désormais la même pente relative à tous les formats. Motif à reprendre sur les écrans à venir.

**Pictos** : Lucide, viewBox 24, trait 2 px arrondi, sans remplissage, SVG inline, `currentColor`. Tailles : 32 px (`size-4`) dans la barre latérale et la barre basse, 24 px (`size-3`) en ligne devant un libellé de réglage, 40 px (`size-5`) pour la flèche de tuile et le chevron de `DÉMARRER`.

## Components

### Buttons
**Six variantes, un seul gabarit** — `CtaButton.vue` depuis la Story 11.3 (contrat en fin de section). Un principe commun : un gros CTA à libellé en majuscules, cible ≥ 90 px, retour d'appui instantané, rayon tapable, encre blanche.

**La largeur décide du format** (Story 11.5, Task 4, Nathan, au rendu, 2026-09-19, proposition « A » — écartée : « B », les réglages en tonal). Deux formats, et deux seulement :
- **CTA large** (`accent`, `neutral`, `bar`, `start`) : libellé en `label` 900 **interlettré `label`**, picto éventuel en ligne. `accent` et `neutral` n'étaient pas interlettrés — le rôle `label` le prévoit pourtant —, et `VALIDER` se lisait plus serré que `+ POINTS ADVERSAIRE` ;
- **CTA de colonne étroite** (`setup`, `pass`) : **picto au-dessus**, libellé en `stat` 900 **interlettré `label`**, **sur une ligne** (vérifié à 1133, la colonne la plus étroite). `CHANGER DE BILLE` mettait son picto en ligne et passait sur deux lignes à côté d'un `PASSER LE TOUR` de même largeur qui mettait le sien au-dessus.
**Les six sont interlettrés `label`, sans exception** (Nathan, au rendu : « interlettre »). Couleurs, hauteurs, rayons et reliefs ne dépendent pas du format.
- **CTA accent** (pop-ups) : dégradé bleu, blanc, `label` 900 interlettré `label`, rayon tapable (8 px), largeur donnée par l'appelant, `brightness(0.9)` à l'appui. `VALIDER` porte en bas une barre de rebours blanche d'**une unité** (`h-1`, 8 px sur tablette — affinée de `h-2` par la Story 11.5) qui se remplit en 3 s à chaque frappe (auto-validation).
- **CTA neutre** (pop-ups) : dégradé ardoise opaque, blanc, `label` 900 interlettré `label`, sans contour. `ANNULER` prend un tiers de la largeur, `VALIDER` le reste. Il **s'éclaircit** à l'appui (`brightness(1.25)`) là où tous les autres s'assombrissent — c'est le seul retour d'appui du neutre depuis la Story 11.3 : les trois hôtes de saisie portaient `brightness(0.9)`, la pop-up de décision `1.25`, et le même objet ne peut pas réagir de deux façons.
- **`PASSER LE TOUR`** : dégradé bleu (depuis la 11.2 : une action de jeu, pas un retour), rayon tapable, pleine largeur de colonne, picto au-dessus du libellé en `stat` 900 interlettré `label` (Story 11.5, Task 4 : l'interlettrage ne déplace pas le libellé en hauteur, la mesure ci-après tient) — le picto le repousse à **72,2 % de la hauteur** du bouton, donc dans la partie sombre du dégradé à 160° : fond `#2a64e5`, **5,18:1** aux deux formats tablette et 5,25:1 à 1920 (mesuré au pixel le 2026-09-17, Story 11.4). ⚠️ La valeur « 4,95:1 au milieu du dégradé » annoncée jusque-là était une estimation, et le libellé n'est pas au milieu ; la mesure la remplace. C'est ce qui ferme le report de la revue de la 11.2 SANS monter le rôle en `label` : à 14 px/700 le seuil est 4,5:1 (le rôle `stat` est en 700, cf. frontmatter ; la valeur « 900 » écrite ici jusqu’au 2026-09-18 était fausse — sans effet sur la conclusion, 14 px étant sous le plancher « grand texte » de 18,66 px dans les deux cas), et 5,18:1 le tient — le stop clair (#3B82F6, 3,68:1) ne le tiendrait pas, mais le libellé ne s'y pose pas. Verrouillé par `CtaButton.contrast.test.ts`, exception à retrait automatique. ⚠️ **Famille à part, et c'est assumé** : l'AC d'`epics.md` en prévoyait cinq, `CtaButton` en porte six. Picto au-dessus (et non en ligne) et rôle `stat` (et non `label`) : l'absorber dans `accent` aurait demandé deux dérogations dans un composant fait pour en supprimer (écart tranché à la Story 11.3). L'état inactif, lui, n'est plus un motif de séparation — il est commun aux six depuis la revue du 2026-09-17.
- **CTA de réglage** (paramétrage) : dégradé bleu, rayon tapable, empilés pleine largeur de la colonne — **le format de `PASSER LE TOUR`** depuis la Story 11.5 : picto 32 px au-dessus, libellé en `stat` 900 interlettré `label`, sur une ligne. Contraste tenu par la **position** du libellé et non par sa taille : il tombe à 72,2 % de la hauteur, sur `#2963e4`, **5,25:1** aux trois formats (mesuré au pixel le 2026-09-19, `?scene=06-parametrage-rempli`). La 11.1 l'avait monté de `stat` en `label` 700 pour le contraste ; la mesure montre que la position suffit. Verrouillé par `CtaButton.contrast.test.ts`, exception à retrait automatique comme celle de `PASSER LE TOUR`.
- **`DÉMARRER`** : dégradé rouge, rayon tapable, `start-button` (110 px sur tablette), chevron nu à gauche, libellé `start-button` interlettré `label`, relief `cta-relief-red` (filet de lumière et tranche rouge sombre, Story 11.5). Le seul CTA rouge du produit.
- **CTA de barre basse** (`+ POINTS ADVERSAIRE`, `+1 ADVERSAIRE`) : dégradé bleu, rayon tapable, `label` 900 interlettré `label`, largeur de la colonne du joueur assis.
- **Correction `−` / `+`** : 90 px, noir 8 % sur la carte, rayon tapable, `adjust` 900 à 60 % d'opacité ; rattrapage d'arbitrage, il ne doit pas concurrencer le score.
- **Focus** : anneau `focus-visible` de 4 px rouge vif (`--color-turn-active`), décalé de 2 px. Pas de navigation clavier attendue.

### Keys
- **Touche** : ardoise touche, rayon tapable, relief `key-relief` (`key-relief-active` à l'appui), 600, plancher `key-numeric` × `key-numeric` (60 px sur tablette ; numérique, 3 colonnes, `gap-2`) ou `key-alpha` de haut (57 px sur tablette ; alpha, 10 colonnes AZERTY sur 5 rangées, `gap-1`). Enfoncement à l'appui. Touches d'action (`AC`/`C`, `⌫`, `ESPACE`, `RESET`) en blanc 55 %. Les deux claviers partagent `KEY_CLASSES` : ils doivent rester identiques à l'œil.

### Chips
- **Badge `BIENTÔT`** : blanc 15 %, 700, `stat` sur les tuiles (`px-1.5 py-0.5`, calé en bas à droite), `picto` sur les items de barre latérale et de barre basse. Toujours accompagné de l'atténuation du fond ou du picto.
- **`★ RECORD`** (récap, prévu Story 3.5) : noir 20 %, `stat` 700 interlettré `stat`.

### Cards / Containers
- **Carte joueur** (scoreboard) : aplat plein blanc ou jaune, encre noire, angles vifs, aucune ombre, `@container`. Trois zones : bandeau (aplat légèrement plus sombre, `px-3 py-2.5`, ligne 1 `NOM | DISTANCE`, ligne 2 `RESTANT` ou `POUR n` | `MOY · SÉRIE`), score géant centré, pied `−` / série en cours en rouge profond / `+`. Liseré de tour `ring-8` rouge vif en overlay `z-10` quand le joueur a la main ; le disque du chrono passe au-dessus (`z-20`) et le demi-anneau de `ShotClock` reprend le tracé.
- **Carte de paramétrage** : même aplat, filet à 22 %, `p-6`, en-tête à gauche (bille PNG 40 px + `BILLE BLANCHE` en `stat` interlettré `stat` à 75 %, sur noir 6 % et filet bas noir 12 %), puis deux champs.
- **Tuile de mode** : dégradé bleu (ou bleu sombre à 45 % si `BIENTÔT`), angles vifs, `p-2`, titre `title` 900 en haut à gauche, flèche nue 40 px en bas à droite ; jointive, séparée par un filet.
- **Colonne centrale** (scoreboard) : la base marine sombre, nue — **ni voile ni contour** (le voile faisait une pastille du disque du chrono, le filet raccordait mal avec lui) ; `REP` + numéro en haut, chrono `flex-1`, `PASSER LE TOUR` calé en bas ; sans chrono, le compteur se centre sur la hauteur entière.
- **Conteneur de récap** : surface voilée, filet, bandeau clair échancré en tête, cellules à `gap-1` où la couleur est portée par la cellule (rouge profond pour la victoire / surface voilée pour le reste — la même `bg-surface` que le conteneur), colonne de libellés blanc 50 %.
- **Carte de pop-up** : **verre dense** — marine clair à **95 %** et flou de **16 px** de ce qui passe sous la carte (`backdrop-blur-lg`, utilitaire standard, 16 px). ⚠️ **Arbitrage de la 11.2 rouvert et re-tranché** (Story 11.5, Task 5, Nathan, au rendu, 2026-09-19, proposition « V2 » — écartée : « V1 », carte opaque) : le verre léger (88 %, 8 px) laissait transparaître une **teinte olive** et le **fantôme du score géant** de la carte sous les touches du pavé ; à 95 % et 16 px, il n'en reste qu'un léger voile, et la carte reste du verre. Le reste : un seul filet à 22 % pour les quatre pop-ups (la décision avait 12 %, unifié en 11.2), rayon pop-up (12 px), `p-3`, ombre `popup`, titre centré `label` interlettré `label`, bille de 40 px optionnelle en en-tête.

### Inputs / Fields
- **Champ de paramétrage** (`NOM`, `DISTANCE`) : boîte claire teintée par transparence (noir 8 %), filet de lumière `light-edge-field` (35 %), bordure 2 px noir 25 %, rayon tapable, `field-min-height` à `field-max-height` (130 à 220 px sur tablette), centrée. Vide : intitulé seul en `stat` interlettré `title` à 60 %. Rempli : intitulé au-dessus en `stat` interlettré `stat` à 65 %, valeur `field-value` 900. **Visé : bordure rouge vif** (même signal non chromatique que le tour).
- Aucun champ natif nulle part : la valeur est du texte alimenté par les claviers dessinés.
- **Retours de saisie** : flash sombre (noir 25 %, 120 ms) sur la valeur qui change ; pulsation (`scale 1.12`, 180 ms) du pavé sur une frappe refusée ; haptique distincte dans les deux cas.

### Navigation
- **Barre latérale** : 15 unités (120 px sur tablette), marine sombre, **ombre `sidebar` portée sur le contenu** (plus de filet droit), en-tête rouge coupé en biais (logo 48 px + `1Score` en `picto` 900 interlettré `title`), items de 90 px minimum (picto 32 px au-dessus, libellé `picto` 700 majuscules, `BIENTÔT` à 45 % + badge), item de sortie isolé en bas (`mt-auto`). Contextuelle : l'écran fournit ses items, la barre n'en code aucun.
- **Barre basse du scoreboard** : une **forme** de rayon de zone (`rounded-zone`, surface voilée, filet — sœur du grand bloc des colonnes, Story 11.5) qui **reprend la grille des colonnes** (groupes en `flex-1` comme les cartes, espaceur central à 1/5, gouttière `--game-column-gutter`), CTA de saisie et quatre **pictos d'action** (surface voilée, filet, rayon tapable, relief `cta-relief-neutral`, 90 × 90 px, picto 32 px + libellé `picto`, blanc 15 % et enfoncement à l'appui, 30 % **et plat** si inactif).

### Shot Clock (signature)
Disque marine sombre (la couleur de la colonne : `bg-bg`, aucun token propre), dimensionné `min(100cqw, 100cqh)` de la zone, qui occupe toute la largeur de la colonne (retrait annulé) : **il ne déborde plus sur les cartes** depuis la Story 11.5. Arc SVG **rayon 43 / trait 6** / cap plat (Story 11.5, Nathan, 2026-09-19 : « agrandis-le un peu dans le cadre » — le rayon 36 de la 10.4 servait à détacher le médaillon des cartes qu'il chevauchait ; sans chevauchement, l'arc vient presque au bord), piste à 20 %, se vidant depuis midi en 1 s linéaire ; couleur interpolée en HSL du vert (130°) au rouge alerte (3°) sur l'arc **et** le chiffre (`clock`, **48 cqmin**, 900, tabulaire — suit l'agrandissement du disque intérieur, 80 % du diamètre contre 62 %). Plus de demi-anneau de tour : le liseré `ring-8` de la carte active est un contour continu.

### Pop-ups (signature)
Un seul patron pour les quatre (`PromptModal`, `ScoreEntryDock`, `NumericPadDock`, `AlphaKeyboardSheet`), et depuis la Story 11.3 ce patron **est un composant** — `PopupCard.vue` (contrat en fin de section) : voile noir 25 % sans flou, `role="dialog"`, carte en verre léger à rayon pop-up et filet 22 %, pied de CTA en `gap-2`. **Jamais de croix** : le retour est un gros CTA `ANNULER`, et toute pop-up qui en porte un se ferme aussi au tap dehors (geste complet, appui et relâchement du même pointeur). Une pop-up sans retour (fin de partie par série) garde un voile inerte. Titre toujours centré ; pas de message redondant.

### Bibliothèque de base (strate 3) — contrats

Trois briques sans aucune connaissance du jeu : aucun `useGameStore`, aucune règle de score, aucun `import` de `../stores`. Elles sont ce qu'un écran neuf consomme au lieu de recopier. Contrats extraits des composants livrés par la Story 11.3.

**`CtaButton.vue`** — le gabarit de CTA.
- *Props* : `variant: 'accent' | 'neutral' | 'setup' | 'start' | 'bar' | 'pass'`, `disabled?: boolean` (défaut `false`).
- *Émet* : `press`, sur `@pointerdown` — **jamais** `@click` (AR8 : un `@click` réintroduirait le délai de 300 ms sur iPad, qu'aucun test unitaire ne verrait).
- *Slot* : `default` — libellé, picto, barre de rebours.
- *Tokens consommés* : `--gradient-blue` / `--gradient-neutral` / `--gradient-red`, `--radius-tappable`, `--size-touch-target` (ou `--size-start-button` pour `start`), `--text-label` / `--text-stat` / `--text-start-button`, `--tracking-label`, `--shadow-cta-relief-blue` / `--shadow-cta-relief-red` / `--shadow-cta-relief-neutral` et `--shadow-cta-relief-active` à l'appui.
- *États* : repos, appui (`brightness(0.9)`, **`1.25` sur `neutral`**), `disabled` (**30 % d'opacité, sur les six variantes** — décision de Nathan à la revue du 2026-09-17 : l'état inactif ne portait que sur `pass`, si bien qu'un `accent` inactif rendait un CTA mort impossible à distinguer d'un CTA vivant. L'écran d'identification joueur de l'Epic 4 doit pouvoir griser son `VALIDER` sans rien créer).
- *Ce qui reste à l'appelant, et pourquoi* : la **largeur quand elle est contextuelle** (`w-1/3` d'`ANNULER`, `flex-1` de `VALIDER`), `mt-auto`, `relative overflow-hidden` (la barre de rebours de `VALIDER` s'y clippe), le `data-testid`. Tout se fusionne par `class`. Les variantes `accent` **et** `neutral` ne portent **aucune** largeur : deux utilitaires `w-*` sur le même élément se disputeraient `width`, et l'ordre de la feuille générée trancherait. (La 11.3 avait laissé un `w-full` sur `accent`, empilé sur le `flex-1` de ses trois appelants de saisie — retiré à la revue du 2026-09-17 ; ses deux emplacements de `PromptModal` sont étirés par leur conteneur, pied en `flex-col` et grille en `auto-cols-fr`.)
- *Ce qu'il ne porte pas* : `touch-manipulation select-none` — la règle globale de `main.css` couvre déjà tout `<button>`.

**`PopupCard.vue`** — le patron des quatre pop-ups.
- *Props* : `testid` et `cardTestid` (posés sur la racine rendue et sur la carte), `labelledBy?` **ou** `label?` (exclusifs : l'`id` du titre visible, ou l'`aria-label` statique), `width: 'decision' | 'pad' | 'alpha'`, `gap: 'sm' | 'md'`, `contain?` (`relative overflow-hidden`, la carte de décision seule), `footerLayout?: 'row' | 'column'`, `closeOnBackdrop?` (défaut `true`), `align?: TableSide` et `reserve?: string` (placement, voir Layout › Pop-ups).
- *Émet* : `backdrop-close`, sur un geste complet du voile.
- *Slots* : `default` (contenu), `footer` (pied de CTA, `gap-2`).
- *Tokens consommés* : `--radius-popup`, `--color-border`, `--color-bg-raised`, `--shadow-popup`, `--size-popup-decision` / `-pad` / `-alpha`, `--spacing`.
- *ARIA, et rien de plus* : `role="dialog"`, `aria-modal="true"`, un nom accessible. **Aucun** piège à focus, `tabindex` ni écoute d'`Escape` — la borne n'a pas de clavier (arbitrage durable). **Aucun `role="button"` sur le voile** : il porte déjà `role="dialog"`, un élément n'a qu'un rôle, et un voile sans texte n'est pas un bouton.
- ⚠️ `width` et `gap` sont des **noms**, pas des valeurs : ils indexent une table de classes écrites en toutes lettres. Une classe construite à partir d'un nom de token n'est pas vue par le scanner JIT et n'émet rien, en silence.

**`useBackdropClose(onClose, options?)`** — le mécanisme de fermeture au voile, dont `PopupCard` est l'unique consommateur direct.
- *Rend* : `{ onPointerdown, onPointerup, onPointercancel }`.
- *Option* : `enabled?: () => boolean` (défaut vrai) — une **fonction**, relue à chaque geste : `PromptModal` dérive la règle du libellé de son secondaire par un `computed`, dont la valeur change sur place.
- *Contrat* : le geste doit être **complet** (appui **et** relâchement du **même** `pointerId`) ; le `pointerId` est mémorisé et jamais un booléen (une paume posée sur le voile ne doit pas armer la fermeture au profit d'un autre doigt) ; `pointercancel` désarme ; `onClose` est appelé **une fois**, le pointeur désarmé **avant** l'appel.
- *Pourquoi le geste complet* : une pop-up qui monte **sous le doigt** au `pointerdown` de `VALIDER` ou de `+` reçoit le `pointerup` de ce geste sur un voile qu'elle n'a jamais armé — sans cette règle, elle se refermerait aussitôt ouverte.

## Écarts assumés au détecteur

Ce que le garde-fou outillé (`npm run design:check`, détecteur Impeccable 4.0.0) signale et que le produit **ne corrigera pas** — avec, pour chacun, ce qui a été mesuré. Chaque entrée a son pendant dans `.impeccable/config.json` (`detector.ignoreValues`, un `add-value` par scène, avec sa raison). **Aucun `ignoreRules` nu** : une règle entière ne tombe jamais, seule une paire règle × scène est levée. Relevé de la Story 11.4 (2026-09-17), sur les 36 scans des douze scènes aux trois formats.

| Règle | Où | Nature | Ce qui a été mesuré |
|---|---|---|---|
| `nested-cards` | scènes 03 à 06 (paramétrage) | **Écart assumé** | Les boîtes `NOM` et `DISTANCE` de `PlayerSetupCard` sont des **champs de saisie**, pas des cartes : boîte tapable posée sur la carte joueur, affordance voulue depuis la Story 10.3 (saisie en place, sans champ natif — interdit durable). Le détecteur, calibré web/SaaS, lit toute boîte arrondie remplie comme une carte. |
| `text-occlusion` | scènes 07 et 09 (`REP`) | **Faux positif prouvé** | Recouvrement réel **0,0 px** (`REP` bas 386,1 / nombre haut 386,1 à 1920) et lisibilité vérifiée en capture. La règle reconstruit la boîte d'encre du nombre depuis les métriques de la police, plus haute que sa boîte d'élément à cause de `leading-none`. Mutation : `leading-none` → `leading-normal` ferme le constat sans rien changer au rendu perçu. |
| `text-overflow` | scène 08 (valeur de série) | **Faux positif prouvé** | Le débordement mesuré est le **voile de flash de frappe**, enfant absolu volontairement débordant (`-inset-x-2 -inset-y-1` = 2 unités de grille, soit 26 px à 1920 et 16 px sur tablette — exactement les chiffres du constat). Il est `pointer-events-none`, animé jusqu'à `opacity: 0`, et la valeur garde 236 px de dégagement de chaque côté. Mutation : `inset-0` ferme le constat aux trois formats. |
| `low-contrast` | scène 10 (titre de pop-up) | **Faux positif prouvé** | La règle ne sait pas résoudre la composition à travers un `backdrop-filter` et mesure ce qui se trouve **sous** la carte, invisible. À opacité **100 %** — où rien ne peut transparaître et où le blanc sur `#272E49` vaut 13,35:1 — le constat sort encore (2,1 à 3,0:1) ; il ne se ferme qu'en retirant le flou, jamais en montant l'opacité (88 / 94 / 97 / 100 % tous signalés). La médiane rapportée par le détecteur lui-même, 13,2 à 13,8:1, est la vraie valeur. |

### ⚠️ Ce que le détecteur ne verra JAMAIS : le contraste des libellés de CTA

Établi par mutation le 2026-09-17 (Story 11.4), en réintroduisant les deux P1 de `design-system-audit-2026-09-15.md` : **le détecteur ne les ressort pas**. Quatre essais successifs sur la même page isolent la cause — ce n'est pas le dégradé :

| Essai | Résultat |
|---|---|
| Dégradé d'origine, libellé 14 px/700 (3,68:1 réel) | rien |
| Fond **plein** posé sur le `<button>`, même libellé | rien |
| Fond plein posé sur le `<span>` qui **porte** le texte | **détecté**, 3,5:1 |
| Dégradé posé sur le `<span>` qui **porte** le texte | **détecté**, 3,5:1 |

La règle `low-contrast` ne résout le fond que sur l'élément qui porte le texte et **ne remonte pas aux ancêtres**. Or `CtaButton` met le dégradé sur le `<button>` et le libellé dans le `<slot />` : le détecteur voit un fond transparent et passe. Il est donc, par construction, **aveugle au libellé des six CTA du produit**.

**Conséquence, et elle est structurante :** le contraste des CTA est calculé par `CtaButton.contrast.test.ts`, depuis la source — stops de dégradé lus dans `main.css`, tailles lues dans le frontmatter ci-dessus et graisses lues dans les classes de `CtaButton.vue` (⚠️ pas dans le frontmatter, contrairement à ce que ce paragraphe affirmait — revue du 2026-09-18), seuil WCAG appliqué aux trois formats. Le test tient la règle **conservatrice** (le libellé doit tenir le seuil contre l'arrêt le plus clair, donc où qu'il se pose) ; une variante n'y déroge que sur une mesure au pixel écrite avec sa date, et l'exception se retire d'elle-même dès qu'elle n'est plus nécessaire. **La passe navigateur reste obligatoire** : ni le détecteur ni ce test ne voient une géométrie inventée.

## Do's and Don'ts

### Do:
- **Do** poser toute nouvelle commande sur l'un des quatre gabarits de CTA existants (accent, neutre, réglage, barre basse) plutôt qu'en créer un cinquième ; la passe a pour critère qu'un écran de plus n'ajoute ni composant de base ni token.
- **Do** écrire chaque libellé en majuscules, chaque nombre en `tabular-nums`, chaque texte sur carte joueur en encre noire.
- **Do** tenir 90 × 90 px sur toute commande de jeu, et mesurer le contraste sur la surface réelle (bandeau, boîte de champ), pas sur la carte nue.
- **Do** ranger une pop-up de saisie du côté opposé à la carte qu'elle remplit, carte entièrement visible et nette.
- **Do** reprendre la coupe en biais, les deux niveaux de marine et le filet à 22 % comme vocabulaire de tout nouvel écran ; angles vifs sur les conteneurs, 8 px sur tout ce qui se tape, 12 px sur une carte de pop-up.
- **Do** ajouter toute animation d'ornement à la garde `prefers-reduced-motion` de `main.css`, nommément ; une animation porteuse d'information (chrono, rebours) n'y entre pas.
- **Do** consigner tout écart au détecteur dans « Écarts assumés au détecteur » ci-dessus ET dans `.impeccable/config.json` avec sa raison (`ignores add-value --reason`), en disant ce qui a été MESURÉ ; jamais un `ignoreRules` nu, que le CLI ne sait de toute façon pas doter d'une raison.
  > ⚠️ **Cette règle a changé le 2026-09-18** (décision de Nathan, à la revue de code de la 11.4). Elle demandait auparavant une raison **citant `deferred-work.md` ou `epics.md`**. Elle demande désormais de dire ce qui a été **mesuré**, pour deux raisons : une mesure est une preuve plus forte qu'un pointeur, et surtout ces ignores ne sont **pas des éléments de backlog** — quatre sont des écarts assumés définitifs (les boîtes `NOM`/`DISTANCE` sont des champs, pas des cartes) et quatre des faux positifs du détecteur. Les faire citer `deferred-work.md` y aurait ajouté huit lignes qui ne seront jamais faites, dans un fichier qui sert de vue de backlog. Le lien existe **en sens inverse** : `deferred-work.md` porte une entrée sur ce jeu d'ignores et sur la condition qui le rouvre. C'est le **cinquième écart** au texte des AC de la Story 11.4, consigné dans `epics.md` comme les quatre autres.

### Don't:
- **Don't** mettre une croix de fermeture, ni un champ natif, ni le clavier système : le retour est un gros CTA `ANNULER`, la saisie passe par les claviers dessinés. *(Interdit durable, Nathan 2026-09-15.)*
- **Don't** signaler le tour, la disponibilité ou un champ visé par la couleur seule : liseré, badge, atténuation.
- **Don't** flouter un voile, ni assombrir au-delà de 25 % : ce qu'il y a dessous doit rester lisible. Le verre d'une carte de pop-up ne floute que sous la carte.
- **Don't** utiliser la rampe `score-*` hors d'une carte joueur, ni un rouge sur un refus, ni le bleu roi seul sur un bouton.
- **Don't** écrire une taille de texte ou un interlettrage hors de l'échelle dans un gabarit — ni valeur arbitraire (`text-[…]`, `tracking-[…]`), ni utilitaire standard de Tailwind (`text-3xl`, `tracking-widest`) : le rôle s'ajoute ici, puis dans `main.css`. Ne pas nommer un rôle comme un utilitaire de Tailwind (`start`, `center`…) : `text-start` est `text-align: start`, les deux règles seraient émises. *(Verrouillé par un test de source depuis la 11.1.)*
- **Don't** construire une classe Tailwind à la volée, ni placer un commentaire HTML à la racine d'un gabarit, ni ajouter d'`overflow-hidden` sur la colonne centrale ou ses ancêtres (l'anneau du chrono serait rogné sans erreur).
- **Don't** charger une police, une icône ou une image depuis le réseau : tout est inline ou dans `public/`.
- **Don't** écrire une ombre ou un rayon en valeur arbitraire (`shadow-[…]`, `rounded-[…]`) dans un gabarit ou dans `keyClasses.ts`, ni déclarer un token `--color-*`, `--gradient-*`, `--radius-*` ou `--shadow-*` sans consommateur ou sans son entrée ici : c'est ici que la palette s'arbitre, plus story par story. *(Verrouillé par `tokens.test.ts` depuis la 11.2.)*
- **Don't** ajouter un second rouge, un troisième niveau de fond ou un bleu d'accent : un rôle nouveau se discute dans ce document, au rendu, avant tout token.
