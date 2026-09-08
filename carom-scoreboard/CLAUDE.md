# CLAUDE.md — Carom Scoreboard

Ce fichier documente les conventions obligatoires du projet pour toute session de code assistée par IA. Il doit être lu avant toute contribution : pour l'usage quotidien, il est auto-suffisant et ne nécessite la consultation d'aucun autre document (`architecture.md`, `epics.md`) pour respecter les règles ci-dessous. En cas de divergence future entre ce fichier et `architecture.md`, voir la clause de fin de document.

## Stack technique

Vue 3 (Composition API + `<script setup>` uniquement, pas d'Options API) + TypeScript strict + Vite + Pinia + Vue Router + Dexie.js (IndexedDB) + Tailwind CSS. PWA via `vite-plugin-pwa`.

Commandes (depuis `carom-scoreboard/`) :
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

Les tokens typographiques suivent une échelle distincte, en `clamp()` fluide : `text-score` (score joueur), `text-reprise` (numéro de reprise, dimensionné pour la colonne centrale `w-1/5`), `text-label`, `text-stat`. Ne pas utiliser `text-score` hors d'un panneau joueur : son plancher de 120px déborde de la console centrale dès deux chiffres.

### 8. Breakpoints Tailwind mobile-first (AR19)

Mobile-first obligatoire, 3 breakpoints :
- Défaut (< 768px) : smartphone / portrait
- `md:` (≥ 768px) : tablette paysage
- `lg:` (≥ 1280px) : signage 22" / desktop

Ordre des classes Tailwind : Layout → Sizing → Spacing → Typography → Colors → Effects → Responsive modifiers.

### 9. Stratégie de validation IA (unitaire en continu, visuel en fin de story)

Pour toute session de développement assistée par IA (dev-story ou autre) :

- **Pendant l'implémentation** : valider chaque élément de code (composant, store, composable) uniquement via les tests unitaires/`vue-tsc` au fur et à mesure — cycle red-green décrit dans la règle 6. **Ne pas** ouvrir de navigateur ni driver Chrome après chaque composant : ça consomme des tokens pour un gain marginal, les tests unitaires suffisent à valider la correction unitaire.
- **En fin de story** : une fois toutes les tâches complètes et la suite de tests/`vue-tsc`/`build` au vert, faire **une seule** passe de validation visuelle/intégration dans un vrai navigateur (extension Claude for Chrome) pour parcourir les critères d'acceptation de bout en bout, avant de passer la story en statut "review". Cette passe doit couvrir **au moins deux formats tablette** — portrait 768×1024 et paysage 1024×768 — car happy-dom ne compile ni ne calcule le CSS Tailwind : aucun débordement de layout n'est détectable par les tests unitaires (le format téléphone est hors périmètre produit, la tablette est le plus petit format supporté).

## En cas de divergence

`architecture.md` (`_bmad-output/planning-artifacts/architecture.md`) reste la source de vérité en cas de divergence future avec ce document.
