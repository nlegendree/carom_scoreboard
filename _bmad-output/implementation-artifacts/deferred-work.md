# Deferred Work

## Deferred from: code review of story-1.1 (2026-09-08)

- Durcir la gestion d'erreurs de `PWABadge.vue` (fetch/`r.update()` sans `.catch()`, statut HTTP non-200 ignoré, `setInterval` jamais nettoyé au démontage, pas de callback `onRegisterError`, listener `statechange` non retiré après activation) — composant généré tel quel par le starter PWA, hors périmètre de la story 1.1. [carom-scoreboard/src/components/PWABadge.vue]
- Compléter `workbox.globPatterns` (polices `woff`/`woff2`) et fournir un `navigateFallback` de production, une fois le routing implémenté (actuellement seul `devOptions.navigateFallback` est défini et `devOptions.enabled` est `false`). [carom-scoreboard/vite.config.ts]
- Résoudre l'incohérence `<html lang="en">` vs. contenu/commentaires en français, une fois le contenu réel de l'application introduit. [carom-scoreboard/index.html]
- Ajouter un outillage lint/format (ESLint/Prettier) pour faire respecter mécaniquement les règles TypeScript strictes déjà activées. [carom-scoreboard/]

## Deferred from: code review of 1-2-redaction-de-claude-md (2026-09-08)

- Formule « élimine le délai 300ms iPad/Android » (AR8) potentiellement obsolète sur navigateurs modernes — héritée telle quelle de la formulation source `architecture.md`, à corriger au niveau de la source. [carom-scoreboard/CLAUDE.md:35]
- Breakpoint `lg:` documenté à ≥1280px ne correspond pas à la valeur par défaut Tailwind (1024px = `lg`, 1280px = `xl` par défaut) et aucun breakpoint explicite ne couvre la plage 768–1280px — hérité tel quel d'AR19 dans `architecture.md`. [carom-scoreboard/CLAUDE.md:112-119]
- L'exemple d'emit `update:score` (convention « kebab-case », AR15) contient un `:` non kebab-case — incohérence héritée de la formulation source. [carom-scoreboard/CLAUDE.md:30]
- Plusieurs règles (AR12 storage, AR17 mutations, AR18 async, AR16 tests, AR8 « élément critique ») sont formulées avec un périmètre strict laissant des zones grises pour les composables, les futurs fichiers `*Service.ts`, ou les tests de store/service — ambiguïtés héritées de la formulation exacte d'`architecture.md`, à traiter lors d'une story future touchant concrètement ces couches. [carom-scoreboard/CLAUDE.md:16-119]
- Aucune convention documentée pour l'identifiant de store Pinia (`defineStore('id', ...)`) ni pour les fichiers utilitaires génériques non préfixés `use` — absents du tableau de nommage source (AR15). [carom-scoreboard/CLAUDE.md:16-31]

## Deferred from: code review of 1-3-selectionner-un-mode-jds-et-demarrer-une-partie (2026-09-08)

- **`status === 'finished'` sans branche de rendu** — `GameView.vue:25-49` ne couvre que `idle` et `playing`, sans `v-else`. Dès qu'un code posera `'finished'`, l'écran sera noir et sans issue (l'ActionBar QUITTER est à l'intérieur de la branche `playing`). Vérifié : `body.innerText` vide. À traiter par la Story 1.10/1.11.
- **`reprises` en `shallowRef` : les `push` futurs seront non réactifs** — `useGameStore.ts:11`. Trois `computed` de `GameView` dépendent de `reprises.value.length` ; un `shallowRef` ne notifie que sur remplacement de `.value`. Un `reprises.value.push(...)` laissera le compteur REPRISE bloqué sur 1, le bouton ANNULER grisé et l'interversion visible en pleine partie. Indétectable aujourd'hui car seules des affectations existent. AR9 impose `shallowRef` : la convention « toujours réassigner, jamais muter » doit être gravée dans CLAUDE.md avant la Story 1.5/1.8.
- **QUITTER destructif sans confirmation** — `GameView.vue:48` déclenche `resetGame()` sur `@pointerdown`, qui se déclenche au contact et ne peut pas être annulé en glissant le doigt hors du bouton. Note de périmètre déjà présente dans `epics.md:584` — Story 1.15.
- **Branche « catégorie à mode unique » = code mort non testé** — `HomeScreen.vue:38-43`. Les deux seules catégories mono-mode (`3bandes`, `casin`) sont `available: false`, donc bloquées par la garde en amont. Deviendra atteignable en Story 2.1.
- **Robustesse de la normalisation des noms de joueurs** — `HomeScreen.vue:62`. `slice(0,20)` coupe les paires de substitution (un emoji en position 20 devient un surrogate orphelin, chaîne invalide en UTF-8 — impactera la persistance Story 1.12 et la base joueurs Epic 4) ; `toUpperCase()` peut allonger la chaîne (`ß` → `SS`), faisant retronquer et perdre un caractère réel. Découper sur `[...value]` avant la mise en majuscule.
- **`Player.id` : champ positionnel redondant** — `types/game.ts:22`. Vaut toujours le nom du champ qui le contient, ce que `swapPlayers` doit restamper manuellement à chaque échange ; risque d'oubli sur les futures mutations (undo, restauration de sauvegarde).
- **Ordre des classes Tailwind non conforme à CLAUDE.md §7** — plusieurs occurrences (`HomeScreen.vue:97,116`, `CenterPanel.vue:28`). Aucun outillage lint/format n'existe encore dans le projet pour le détecter (déféré depuis la Story 1.1).
