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
