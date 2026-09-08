# Deferred Work

## Deferred from: code review of story-1.1 (2026-09-08)

- Durcir la gestion d'erreurs de `PWABadge.vue` (fetch/`r.update()` sans `.catch()`, statut HTTP non-200 ignoré, `setInterval` jamais nettoyé au démontage, pas de callback `onRegisterError`, listener `statechange` non retiré après activation) — composant généré tel quel par le starter PWA, hors périmètre de la story 1.1. [carom-scoreboard/src/components/PWABadge.vue]
- Compléter `workbox.globPatterns` (polices `woff`/`woff2`) et fournir un `navigateFallback` de production, une fois le routing implémenté (actuellement seul `devOptions.navigateFallback` est défini et `devOptions.enabled` est `false`). [carom-scoreboard/vite.config.ts]
- Résoudre l'incohérence `<html lang="en">` vs. contenu/commentaires en français, une fois le contenu réel de l'application introduit. [carom-scoreboard/index.html]
- Ajouter un outillage lint/format (ESLint/Prettier) pour faire respecter mécaniquement les règles TypeScript strictes déjà activées. [carom-scoreboard/]
