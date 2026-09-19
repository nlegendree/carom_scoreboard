# CLAUDE.md — 1Score

Ce fichier documente les conventions obligatoires du projet pour toute session de code assistée par IA. Il doit être lu avant toute contribution : pour l'usage quotidien, il est auto-suffisant et ne nécessite la consultation d'aucun autre document (`architecture.md`, `epics.md`) pour respecter les règles ci-dessous. En cas de divergence future entre ce fichier et `architecture.md`, voir la clause de fin de document.

## Stack technique

Vue 3 (Composition API + `<script setup>` uniquement, pas d'Options API) + TypeScript strict + Vite + Pinia + Vue Router + Dexie.js (IndexedDB) + Tailwind CSS. PWA via `vite-plugin-pwa`.

**Offline** : aucune ressource réseau au runtime — polices auto-hébergées (`.woff2` dans `src/assets/`), jamais de CDN ni Google Fonts (FR45, NFR13). Le SW précache tout le build ; la mise à jour s'applique à l'accueil via `usePwaUpdate.ts`.

**Nom du produit** : 1Score depuis la Story 10.6 (manifest, `<title>`, dossier applicatif `1score/`, `package.json` en `1score` — npm refuse les majuscules —, clé `localStorage` `1score:game`). Gardent l'ancien nom jusqu'à leur renommage, prévu plus tard (`deferred-work.md`) : le dépôt GitHub `nlegendree/carom_scoreboard`, le dossier local `carom_scoreboard` et le site Netlify (son nom fixe l'adresse `*.netlify.app`, donc l'origine : le renommer fera perdre la partie sauvegardée et obligera à réinstaller la PWA). Ne pas changer la clé `localStorage` sans migration : la partie sauvegardée serait perdue à la mise à jour. Ne pas toucher non plus `id`, `start_url`, `scope` ni le nom du fichier `manifest.webmanifest` : ils identifient la PWA installée. Nom sous l'icône d'une PWA **déjà installée**, sans contournement : **iPadOS** le fige à l'ajout à l'écran d'accueil, il ne change qu'en retirant puis rajoutant l'app ; **Android (Chrome)** relit le manifest au lancement de l'app (au plus une fois par 24 h) et ne met le nom à jour qu'une fois toutes ses fenêtres fermées, l'appareil en charge et en Wi-Fi — une tablette de club laissée ouverte en permanence ne change donc de nom qu'après avoir été fermée puis relancée (`about://webapks` montre la date du dernier contrôle).

Commandes (depuis `1score/`) :
- `npm run dev` — serveur de développement
- `npm run build` — build de production
- `npm test` — exécute les tests (Vitest)

## Règles obligatoires

### 1. Conventions de nommage (AR15)

| Type | Convention | Exemple |
|---|---|---|
| Composants Vue | PascalCase | `PlayerPanel.vue` |
| Stores Pinia | camelCase + préfixe `use` | `useGameStore.ts` |
| Composables | camelCase + préfixe `use` | `usePointerEvents.ts` |
| Services | camelCase + suffixe `Service` | `storageService.ts` |
| Types (fichier) | camelCase | `game.ts` |
| Tests | même nom + `.test.ts` | `PlayerPanel.test.ts` |
| Vues (pages) | PascalCase + suffixe `View` | `GameView.vue` |

- **Types TypeScript** : PascalCase sans préfixe `I` (`GameState`, jamais `IGameState`).
- **Actions Pinia** : verbe + nom (`setPlayerName`, `addReprise`), jamais l'inverse (`playerNameUpdate` interdit).
- **Emits Vue** : kebab-case dans `defineEmits` (`update:score`, `game-finished`).
- **Exports** : named exports uniquement — jamais de `default export` pour composables ou services.

### 2. Pointer Events (AR8)

`@pointerdown` obligatoire sur tout élément tactile/interactif critique. Jamais `@touchstart` ni `@click` seul — élimine le délai 300ms iPad/Android.

```vue
<!-- ✅ Standard pour tous les boutons/zones tactiles -->
<button @pointerdown="handlePress">
```

⚠️ **Ne pas répéter `touch-manipulation select-none` sur un `<button>`** : la règle globale ci-dessous le couvre déjà, et `tokens.test.ts` refuse la redondance (Story 11.3). Le préfixe `-webkit-` de la règle globale n'est PAS décoratif — WebKit n'a `user-select` non préfixé que depuis Safari 17, et c'est lui qui tient la loupe iOS à distance sur les 17 gabarits qui ont perdu l'utilitaire.

CSS global obligatoire (`src/assets/main.css`) :

```css
* { -webkit-tap-highlight-color: transparent; }
button, [role="button"] { touch-action: manipulation; -webkit-user-select: none; user-select: none; }
```

Tout élément non-`<button>` utilisé comme zone tactile/interactive (ex. `<div @pointerdown>`) doit porter `role="button"` pour hériter de ce CSS.

**Exception : le voile plein écran d'une pop-up** (`PromptModal`, `NumericPadDock`, `AlphaKeyboardSheet`, `ScoreEntryDock`). Il garde ses handlers pointer **sans** `role="button"`, pour deux raisons : il porte déjà `role="dialog"` et un élément n'a qu'un rôle ; et il n'est pas un bouton — l'annoncer comme tel serait faux, alors que la fermeture porte déjà un nom, le CTA `ANNULER` de la carte. Le CSS que la règle cherche à faire hériter (`touch-action`, `user-select`) est sans objet sur un voile qui ne porte aucun texte. Exception appliquée depuis la Story 10.2, consignée ici par la 10.7 ; elle ne s'étend à aucun autre élément.

Pour toute interaction complexe (long press, tap avancé), utiliser `usePointerEvents.ts` — ne jamais réimplémenter la logique pointer inline.

### 3. Gestion d'erreurs storage en couche service (AR12)

`try/catch` + `console.error` exclusivement dans la couche service (`storageService.ts`, `databaseService.ts`). Le composant appelant ne gère jamais l'erreur storage lui-même.

```typescript
// storageService.ts — le composant ne gère pas l'erreur storage
export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('[storage] saveGameState failed:', e)
  }
}
```

### 4. Règles Pinia (AR17)

Toute mutation de store se fait exclusivement via une action Pinia nommée. Jamais de mutation directe depuis un composant.

```typescript
// ✅ Via action
gameStore.addReprise(value)
// ❌ Mutation directe interdite depuis un composant
gameStore.reprises.push(...)
```

`storeToRefs()` est obligatoire pour toute propriété réactive du store consommée par un composant.

```typescript
// ✅ Réactivité préservée
const { player1, player2, reprises } = storeToRefs(gameStore)
// ❌ Réactivité perdue
const player1 = gameStore.player1
```

### 5. async/await exclusif (AR18)

Toute logique asynchrone des stores Pinia utilise `async/await` exclusivement. Jamais `.then().catch()`.

```typescript
// databaseService.ts — le store ne gère pas l'erreur storage (cohérent avec AR12)
export async function fetchRecentGames(limit = 50): Promise<Game[]> {
  try {
    return await db.games.orderBy('startedAt').reverse().limit(limit).toArray()
  } catch (e) {
    console.error('[database] fetchRecentGames failed:', e)
    return []
  }
}

// useHistoryStore.ts — pas de try/catch ici, la couche service a déjà géré l'erreur
async function loadHistory(): Promise<void> {
  isLoading.value = true
  games.value = await fetchRecentGames()
  isLoading.value = false
}
```

### 6. Tests co-localisés (AR16)

`Component.test.ts` toujours à côté de `Component.vue`. Jamais de dossier `__tests__/`.

```
src/components/
├── PlayerPanel.vue
├── PlayerPanel.test.ts   ← co-localisé, pas de dossier __tests__/
```

### 7. Tokens visuels — `DESIGN.md` est la source, `main.css` applique

**Toute valeur visuelle (couleur, échelle typographique, interlettrage, espacement, rayon, ombre, taille de cible) vit dans `DESIGN.md`** (racine du dépôt, frontmatter normatif + sections) et dans son miroir `.impeccable/design.json`. `main.css` les **applique** dans ses blocs `@theme` / `@theme static` ; ce fichier n'en redit aucune. Décision de Nathan du 2026-09-15 (`integration-bmad-impeccable.md` §2, §13).

Règles de code qui en découlent :

- **Une valeur qui manque s'ajoute d'abord dans `DESIGN.md`, puis dans `main.css`, jamais dans un gabarit.** Aucune taille de texte, rayon, ombre ou interlettrage en valeur arbitraire `[...]` dans un `.vue` : si le token n'existe pas, c'est le design system qui a un trou, pas le composant.
- **Piège `--spacing`** : `main.css` fixe l'unité Tailwind à **8 px sur tablette, fluide jusqu'à 13 px à 1920** (`clamp(8px, 0.678vw, 13px)`, Story 11.1), soit le double du défaut au plancher. Tout utilitaire numérique (`p-4`, `gap-2`, `h-16`…) vaut donc le double de sa lecture « Tailwind par défaut », et grandit avec l'écran. Convention assumée (grille de 8, fluide), à ne pas « corriger » sans arbitrage produit. Les tailles de boîte nommées (`--size-touch-target`, `--size-sidebar`, `--size-popup-*`, `--size-key-*`, `--size-pad-min`…) en dérivent dans `main.css` et se lisent par `min-h-(--size-…)` / `w-(--size-…)` : aucun multiple de grille recopié ni `calc()` de taille dans un gabarit. La table de correspondance est dans `DESIGN.md` › Layout › Rythme.
- **Ne pas nommer un rôle `--text-*` comme un utilitaire Tailwind** (`start`, `center`, `nowrap`…) : `text-start` est `text-align: start`, Tailwind émettrait les deux règles pour la même classe (revue de la 11.1). `typography.test.ts` tient le miroir `DESIGN.md` ↔ `main.css` dans les deux sens pour `--text-*`, `--tracking-*` et `--size-*` ; `tokens.test.ts` fait de même pour `--radius-*` et `--shadow-*`, vérifie que tout `--color-*` / `--gradient-*` / `--radius-*` / `--shadow-*` a un consommateur, et que les gabarits n'écrivent que des `rounded-<token>` / `shadow-<token>` (un utilitaire inconnu n'émet rien, en silence).
- **`@theme static`** force l'émission des variables que Tailwind élaguerait faute d'utilitaire consommateur (lues par `bg-(image:--gradient-…)` ou par `var()`). Tout nouveau token d'image ou de calcul y va.
- Les clés `--text-*` sont le namespace qui génère `text-<nom>` (`--font-size-*` ne génère rien).

### 8. Pas de breakpoint d'écran — container queries, grille fluide et `clamp()` (AR19, réécrite en 11.3)

**Le produit n'a qu'un seul format : le paysage, d'un iPad mini (1133×744) à un écran 21,5″ (1920×1080).** La tablette de référence intermédiaire est l'**iPad Air 11″, dont le viewport paysage réel mesure 1180×733** (1180×820 points, moins le chrome de Safari) — c'est le chiffre que scannent `design:check` et le harnais. ⚠️ Ne pas le « corriger » en 1194×834 : ce sont les points de l'iPad **Pro** 11″, qui n'est pas la cible (décision de Nathan, 2026-09-18, à la revue de la 11.4 — §9 portait l'autre chiffre et l'outillage le contredisait). Entre ces deux bornes il n'y a pas de rupture de mise en page à franchir, donc pas de palier à déclarer : l'écran grandit, la mise en page grandit avec lui. Le portrait et le téléphone sont hors périmètre produit (décision de Nathan, 2026-09-11) — ne pas écrire de variante `portrait:`.

Les trois outils qui remplacent les paliers :

- **`--spacing` fluide** — `clamp(8px, 0.678vw, 13px)` (Story 11.1). Toute la grille (`p-4`, `gap-2`, les `--size-*` qui en dérivent) suit l'écran sans qu'aucune classe ne change. Une valeur figée en pixels dans un gabarit casse cette propriété en silence : elle garde sa taille pendant que tout le reste grandit — c'est ce qui aplatissait le biais du bandeau de récap à 1920 avant la 11.3.
- **`clamp()` sur l'échelle typographique** — les rôles `--text-*` sont fluides entre les mêmes bornes (Story 11.1, `DESIGN.md` › Typography).
- **Container queries** — une variante qui dépend de la place réellement disponible pour un composant s'écrit en `@min-[…]:` sur son conteneur `@container`, jamais en breakpoint d'écran. Les cartes joueur en sont l'exemple : leur largeur dépend de la colonne, pas de la fenêtre.

⚠️ **`--breakpoint-lg: initial` dans `@theme` est une GARDE, pas une survivance** : retirer la ligne ne suffirait pas — Tailwind v4 fournirait alors `lg` à 1024 px, donc **sur l'iPad**, et un `lg:` écrit par distraction s'appliquerait à 1180 (revue de la 11.2). `md:` (≥ 768 px) reste déclaré et vaut « à partir de la tablette paysage » : sous le plancher produit, il est toujours vrai.

Ordre des classes Tailwind : Layout → Sizing → Spacing → Typography → Colors → Effects → Responsive modifiers.

### 9. Stratégie de validation IA (unitaire en continu, visuel en fin de story)

Pour toute session de développement assistée par IA (dev-story ou autre) :

- **Commande de validation de référence : `npm run build`** (= `vue-tsc -b && vite build`), **pas** `npx vue-tsc --noEmit`. `--noEmit` laisse passer des pertes de narrowing que `vue-tsc -b` refuse : remplacer un `v-if="x !== null"` par un `v-if` sur un `computed` équivalent perd le narrowing `number | null` → `number` qu'attend le composant enfant, et seul le build le voit (leçon de la 4e passe de la Story 10.4). Une story n'est pas validée tant que `npm test` **et** `npm run build` ne sont pas verts tous les deux.
- **Pendant l'implémentation** : valider chaque élément de code (composant, store, composable) uniquement via les tests unitaires/`vue-tsc` au fur et à mesure — cycle red-green décrit dans la règle 6. **Ne pas** ouvrir de navigateur ni driver Chrome après chaque composant : ça consomme des tokens pour un gain marginal, les tests unitaires suffisent à valider la correction unitaire.
- **En fin de story, le garde-fou outillé** (Story 11.4) : `npm run design:check` (application rendue, les douze scènes `?scene=` aux trois formats) et `npm run design:check:file` (sources), tous deux à **0 constat** ou chaque constat étiqueté (un récapitulatif daté par lancement dans `.impeccable/baseline/`) — corrigé, ou encodé dans `.impeccable/config.json` avec sa raison et consigné dans `DESIGN.md` › Écarts assumés au détecteur. Lire le **code de sortie**, jamais la sortie : un scan propre n'imprime rien, et `1` veut dire « rien n'a été mesuré », pas « rien à signaler ».
  ⚠️ **Cette passe ne remplace PAS la passe navigateur, elle s'ajoute à elle.** Le détecteur est calibré web/SaaS : il ne voit ni géométrie inventée, ni logique, ni l'anneau qui recouvre le liseré, ni le médaillon qui déborde (`integration-bmad-impeccable.md` §7). Il est de surcroît **aveugle au contraste des libellés de CTA** — il ne résout le fond que sur l'élément qui porte le texte, et `CtaButton` met le dégradé sur le `<button>` (démonstration par mutation dans `DESIGN.md` › Écarts assumés au détecteur). C'est `CtaButton.contrast.test.ts` qui tient ce contraste-là, depuis la source.
- **En fin de story** : une fois toutes les tâches complètes et la suite de tests/`vue-tsc`/`build` au vert, faire **une seule** passe de validation visuelle/intégration dans un vrai navigateur (extension Claude for Chrome) pour parcourir les critères d'acceptation de bout en bout, avant de passer la story en statut "review". Cette passe se fait **en paysage uniquement** — l'app n'est jamais utilisée en portrait (décision de Nathan, 2026-09-11) — et couvre au moins l'**iPad mini 1133×744** et l'**iPad Air 11″ 1180×733**, plus l'**écran 21,5″ 1920×1080** visé à terme, car happy-dom ne compile ni ne calcule le CSS Tailwind : aucun débordement de layout n'est détectable par les tests unitaires. Le téléphone et le portrait sont hors périmètre produit : ne pas écrire de variantes `portrait:`.

### 10. Composants réutilisables — inventaire et contrat dans `DESIGN.md`

**L'inventaire des composants, leurs variantes, états et tokens consommés sont dans `DESIGN.md` › Components** (CTA, touches, cartes, barre latérale, pop-ups, chrono). Ne pas les redécrire ici ; ne pas créer un cinquième gabarit de CTA ou un nouveau token sans passer par `DESIGN.md` d'abord (critère de la passe design system : un écran de plus n'ajoute ni composant de base ni token).

Restent ici les **contrats de code** qui ne se voient pas à l'écran :

- **`SideBar` est CONTEXTUELLE et nourrie par l'écran.** Elle reçoit `items: SideBarItem[]` et `exitItem?: SideBarItem` ; elle ne code **aucun** contenu en propre. Chaque écran déclare ses propres constantes (`HOME_SIDEBAR_ITEMS`, `SUMMARY_SIDEBAR_ITEMS`/`SUMMARY_SIDEBAR_EXIT`…) et les lui passe. Ajouter un item **dans** `SideBar` est une faute : la barre ne sait pas sur quel écran elle est. Un `SideBarItem` porte `id`, `picto`, `label`, `state` et un `action?` optionnel ; l'`exitItem` est calé en bas, isolé du reste.
- **L'état inactif ne repose jamais sur la couleur seule** (`ModeTile` et items `BIENTÔT` : atténuation **et** badge, UX-DR30). Cette atténuation ne se « corrige » pas au contraste — WCAG §1.4.3 exempte les commandes inactives ; elle ne dispense pas de la taille minimale du badge.
- **`PictoIcon`** — SVG **inline**, jamais de fichier ni de police d'icônes : une table `name` → tracés (Lucide, licence ISC), `aria-hidden`. Ajouter un picto = ajouter une entrée dans `PATHS` et son nom au type `PictoName`.
- **Les trois hôtes de saisie portent les règles, les pavés restent muets** (UX-DR54). `NumericPadDock`, `AlphaKeyboardSheet` et `ScoreEntryDock` tiennent le plafond, le timer d'auto-validation, l'haptique et les animations de retour ; `NumericPad` et `AlphaKeyboard` n'émettent que la frappe. **Le buffer de saisie vit dans l'ÉCRAN**, pas dans l'hôte : l'hôte émet la valeur COMPLÈTE, jamais le seul caractère frappé — deux buffers divergeraient à la première frappe.
- **Les quatre pop-ups ont un seul patron, et depuis la Story 11.3 ce patron est un COMPOSANT** : `PopupCard` (voile, dialogue, carte en verre, pied de CTA en slot, fermeture au voile), qui consomme `useBackdropClose` et en est l'unique consommateur direct. Aucune pop-up ne réécrit ce qui suit — elle le reçoit : racine `fixed inset-0 z-50` portant le voile, `role="dialog"`, `aria-modal="true"` et son nom accessible (`aria-labelledby` vers le titre visible pour `PromptModal`, `aria-label` statique pour les trois autres, qui n'ont pas de titre), puis une carte ordinaire — **sans** `@pointerdown.stop` : ce qui distingue un geste sur le voile d'un geste sur la carte est la CIBLE de l'événement (`event.target === event.currentTarget`), jamais l'arrêt de propagation. L'arrêt laissait un armement périmé derrière lui, et ne protégeait rien au tactile, où la capture implicite du pointeur redirige le `pointerup` vers la cible du `pointerdown` (revue du 2026-09-17). L'`id` de titre vient de `useId()`, jamais d'une chaîne littérale. **Règle du voile (Nathan, 2026-09-15) : toute pop-up qui porte un CTA `ANNULER` ou `FERMER` se referme au tap dehors, et ce tap vaut ce CTA.** `PromptModal` la porte lui-même, dérivée du libellé du secondaire (`CANCEL_LABELS`) — aucune prop à poser par l'écran ; les trois hôtes de saisie ferment de même sur leur `ANNULER`. Une pop-up sans retour (« PARTIE TERMINÉE » par série, offre d'égalisatrice à `FIN DE PARTIE`) garde un voile inerte. La fermeture exige un geste **complet** (appui et relâchement du même pointeur sur le voile), ce qui protège les pop-ups qui montent sous le doigt au `pointerdown` de `VALIDER` ou de `+`. La garde `enabled` est relue aux **deux** temps du geste, et un `pointercancel` ne désarme que **son** pointeur — la paume rejetée par iPadOS ne doit pas désarmer le doigt actif. Sous capture implicite, c'est le point de DÉPART du geste qui commande, pas son point d'arrivée. **Rien d'autre en ARIA** : pas de piège à focus, pas de `tabindex`, pas d'écoute de `Escape` — l'app tourne sur une tablette de club sans clavier (arbitrage « borne fixe »).
- **Géométrie couplée** : `--game-column-gutter` (Story 11.5) est lu par `GameView` (l'écart réel entre les trois colonnes du scoreboard) et `CenterPanel` — deux usages qui doivent coïncider au pixel tant qu'ils lisent le **même** token. ⚠️ `--game-clock-bleed`, qui couplait jadis `ShotClock`, `CenterPanel` et `PlayerPanel`, est **retiré** : le chrono ne déborde plus sur les cartes (Nathan, au rendu, 2026-09-18). Ne pas le réintroduire sans rouvrir la décision dans `DESIGN.md` › Layout. Les `--*-popup-inset-*` recopiaient la mise en page d'un écran : ce n'étaient pas des tokens, et la **Story 11.3 les a rapatriés dans l'écran qui les décrit** (`HomeScreen` › `SETUP_POPUP_RESERVE`, `GameView` › `GAME_POPUP_RESERVE`, à côté du markup qu'ils mesurent). L'écran transmet à `PopupCard` le côté où la pop-up se pose (`align`) et la bande à réserver en face (`reserve`), que la carte pose en style en ligne. **Un token décrit une intention, jamais une position.**
- **Les cartes joueur sont des conteneurs `@container`** : leurs variantes s'écrivent en `@min-[…]:`, jamais en breakpoints d'écran.

### 11. Animations et `prefers-reduced-motion`

Les animations vivent dans le `@theme` de `main.css` (`--animate-*`) et se consomment par classe. `main.css` porte une garde globale `@media (prefers-reduced-motion: reduce)` qui **cite nommément** les classes à couper.

- **Toute nouvelle animation d'ORNEMENT doit venir s'y ajouter à la main.** Une animation **porteuse d'information** (le fondu du chrono, la barre de rebours de l'auto-validation — elles disent le temps restant et le fait que le score va se valider seul) ne s'y ajoute **pas**, et la décision se documente dans le commentaire de la garde.
- **Jamais de garde attrape-tout** (`*, *::before, *::after { animation-duration: 0.01ms !important }`) : elle emporterait précisément les deux animations conservées.
- ⚠️ **`animation: none` ne suffit pas pour une animation en `forwards` dont l'état de départ est visible.** Le flash de frappe va de `opacity: 1` à `0` : sans animation, son voile noir resterait peint en permanence sur la valeur de série. La garde doit poser l'état final elle-même (`opacity: 0`).
- happy-dom ne calcule aucun CSS : un test peut verrouiller le **texte** de la règle (`main.css.test.ts`), jamais son effet. L'effet se vérifie au navigateur, `prefers-reduced-motion` émulé.

### 12. Pièges de gabarit

- **Aucun commentaire HTML à la racine d'un gabarit.** Un `<!-- … -->` placé avant l'élément racine fait du composant un **fragment** : la racine perd `classes()`, `attributes()` et son `data-testid`, et des cas tombent d'un coup sans rapport apparent avec le changement. Payé quatre fois dans l'Epic 10. Commenter **dans le `<script setup>`**, ou à l'intérieur de la racine.
- **Aucune classe Tailwind construite à la volée.** Le scanner JIT de Tailwind 4 ne voit que les classes écrites en toutes lettres : `opacity-60` littéral, jamais `` `opacity-${n}` ``.
- **`scrollWidth` / `scrollHeight` ne voient rien sous `overflow-hidden`.** Pour détecter un débordement, comparer les `getBoundingClientRect()` des enfants à celui du parent.

## En cas de divergence

`architecture.md` (`_bmad-output/planning-artifacts/architecture.md`) reste la source de vérité en cas de divergence future avec ce document.
