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
<button @pointerdown="handlePress" class="touch-manipulation select-none">
```

CSS global obligatoire (`src/assets/main.css`) :

```css
* { -webkit-tap-highlight-color: transparent; }
button, [role="button"] { touch-action: manipulation; user-select: none; }
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

### 7. Échelle d'espacement Tailwind — `--spacing` vaut 8px

`main.css` fixe `--spacing: 8px`, alors que le défaut de Tailwind v4 est `0.25rem` (4px). **Tout utilitaire numérique vaut donc le double de sa lecture naïve** :

| Classe écrite | Valeur réelle | Valeur si l'on suppose le défaut Tailwind |
|---|---|---|
| `p-4` | 32px | ~16px |
| `p-6` | 48px | ~24px |
| `gap-4` | 32px | ~16px |
| `px-10` | 80px | ~40px |
| `h-16 w-16` | 128×128px | ~64×64px |

Dimensionner en gardant cette table en tête : une valeur choisie « à la Tailwind » produira un élément deux fois trop grand. C'est une convention assumée du projet (grille de 8px), pas un bug — ne pas « corriger » `--spacing` sans arbitrage produit.

Les tokens typographiques suivent une échelle distincte, en `clamp()` fluide : `text-score` (score joueur), `text-reprise` (numéro de reprise, dimensionné pour la colonne centrale `w-1/5`), `text-label`, `text-stat`, et depuis l'Epic 10 `text-hero` (accroche d'accueil), `text-tile-title` (titre de tuile de mode), `text-picto` (libellé sous picto). Ne pas utiliser `text-score` hors d'un panneau joueur : son plancher de 120px déborde de la console centrale dès deux chiffres.

Les tokens de l'Epic 10 (`--color-surface`, `--color-border`/`--color-border-strong`, `--radius-container`/`--radius-cta`, `--color-sidebar`, `--color-brand-red`, `--color-cloth`, `--gradient-tile-*`, `--gradient-bg`) vivent dans le bloc `@theme static` de `main.css` : `static` force leur émission même quand aucun utilitaire ne les emploie encore. Direction visuelle (passe de rendu 10.1) : **angles vifs** (rayons à 0), palette **bleus / noir-gris / rouge**, fonds en dégradé posés par `bg-(image:--gradient-…)`, **coupes en biais** pour casser la symétrie (ex. bandeau rouge de l'en-tête de `SideBar`, `clip-path` en valeur arbitraire). `--color-brand-red` est le rouge de marque : ne pas le confondre avec `--color-alert` (chrono) ni `--color-turn-active` (liseré de tour).

### 8. Breakpoints Tailwind mobile-first (AR19)

Mobile-first obligatoire, 3 breakpoints :
- Défaut (< 768px) : smartphone / portrait
- `md:` (≥ 768px) : tablette paysage
- `lg:` (≥ 1280px) : signage 22" / desktop

Ordre des classes Tailwind : Layout → Sizing → Spacing → Typography → Colors → Effects → Responsive modifiers.

### 9. Stratégie de validation IA (unitaire en continu, visuel en fin de story)

Pour toute session de développement assistée par IA (dev-story ou autre) :

- **Commande de validation de référence : `npm run build`** (= `vue-tsc -b && vite build`), **pas** `npx vue-tsc --noEmit`. `--noEmit` laisse passer des pertes de narrowing que `vue-tsc -b` refuse : remplacer un `v-if="x !== null"` par un `v-if` sur un `computed` équivalent perd le narrowing `number | null` → `number` qu'attend le composant enfant, et seul le build le voit (leçon de la 4e passe de la Story 10.4). Une story n'est pas validée tant que `npm test` **et** `npm run build` ne sont pas verts tous les deux.
- **Pendant l'implémentation** : valider chaque élément de code (composant, store, composable) uniquement via les tests unitaires/`vue-tsc` au fur et à mesure — cycle red-green décrit dans la règle 6. **Ne pas** ouvrir de navigateur ni driver Chrome après chaque composant : ça consomme des tokens pour un gain marginal, les tests unitaires suffisent à valider la correction unitaire.
- **En fin de story** : une fois toutes les tâches complètes et la suite de tests/`vue-tsc`/`build` au vert, faire **une seule** passe de validation visuelle/intégration dans un vrai navigateur (extension Claude for Chrome) pour parcourir les critères d'acceptation de bout en bout, avant de passer la story en statut "review". Cette passe se fait **en paysage uniquement** — l'app n'est jamais utilisée en portrait (décision de Nathan, 2026-09-11) — et couvre au moins l'**iPad mini 1133×744** et l'**iPad 11″ 1194×834**, plus l'**écran 21,5″ 1920×1080** visé à terme, car happy-dom ne compile ni ne calcule le CSS Tailwind : aucun débordement de layout n'est détectable par les tests unitaires. Le téléphone et le portrait sont hors périmètre produit : ne pas écrire de variantes `portrait:`.

### 10. Composants et conventions de l'Epic 10 (refonte UI/UX « 1Score »)

Cinq écrans partagent une même coquille : fond `bg-(image:--gradient-bg)`, `SideBar` à gauche, `<main>` à droite.

- **`SideBar` est CONTEXTUELLE et nourrie par l'écran.** Elle reçoit `items: SideBarItem[]` et `exitItem?: SideBarItem` ; elle ne code **aucun** contenu en propre. Chaque écran déclare ses propres constantes (`HOME_SIDEBAR_ITEMS`, `SUMMARY_SIDEBAR_ITEMS`/`SUMMARY_SIDEBAR_EXIT`…) et les lui passe. Ajouter un item **dans** `SideBar` est une faute : la barre ne sait pas sur quel écran elle est. Un `SideBarItem` porte `id`, `picto`, `label`, `state` et un `action?` optionnel ; l'`exitItem` est calé en bas, isolé du reste.
- **`ModeTile`** — tuile de mode de l'accueil et de la sélection JDS : `title`, `tagline?`, `color` (famille `--gradient-tile-*`), `soon`. L'état `BIENTÔT` atténue le fond à `opacity-45` **et** affiche un badge : l'information ne dépend jamais de la couleur seule (UX-DR30). Cette atténuation ne se « corrige » pas au contraste — WCAG §1.4.3 exempte les commandes inactives.
- **`IconAction`** — bouton picto + libellé de la barre basse du scoreboard : `picto`, `label`, `state?`, `disabled?`, émet `press`.
- **`PictoIcon`** — SVG **inline**, jamais de fichier ni de police d'icônes : une table `name` → tracés (Lucide, licence ISC), `viewBox` 24, trait 2 px, sans remplissage, `aria-hidden`. Ajouter un picto = ajouter une entrée dans `PATHS` et son nom au type `PictoName`.
- **Les trois hôtes de saisie portent les règles, les pavés restent muets** (UX-DR54). `NumericPadDock`, `AlphaKeyboardSheet` et `ScoreEntryDock` tiennent le plafond, le timer d'auto-validation, l'haptique et les animations de retour ; `NumericPad` et `AlphaKeyboard` n'émettent que la frappe. **Le buffer de saisie vit dans l'ÉCRAN**, pas dans l'hôte : l'hôte émet la valeur COMPLÈTE, jamais le seul caractère frappé — deux buffers divergeraient à la première frappe.
- **Les quatre pop-ups ont un seul patron** : racine `fixed inset-0 z-50 … bg-black/25` portant `role="dialog"`, `aria-modal="true"` et son nom accessible (`aria-labelledby` vers le titre visible pour `PromptModal`, `aria-label` statique pour les trois autres, qui n'ont pas de titre), puis une carte en `@pointerdown.stop`. L'`id` de titre vient de `useId()`, jamais d'une chaîne littérale. **Rien d'autre en ARIA** : pas de piège à focus, pas de `tabindex`, pas d'écoute de `Escape` — l'app tourne sur une tablette de club sans clavier (arbitrage « borne fixe »).
- **Tokens de conteneur** : `--size-touch-target` (90 px, le plancher de toute zone tactile hors claviers), `--game-popup-inset-left`/`-right` (les pop-ups de paramétrage se logent dans la zone libre, du côté OPPOSÉ à la carte visée), `--game-clock-bleed` (24 px — le débordement du chrono hors de la colonne centrale, **même token** que la largeur qui le clippe : trois usages dans trois fichiers doivent rester cohérents). Les cartes joueur sont des conteneurs `@container` : leurs variantes s'écrivent en `@min-[420px]:`, jamais en breakpoints d'écran.

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
