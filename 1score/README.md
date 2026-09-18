# 1Score

Scoreboard tactile pour billard carambole : une PWA pensée pour la tablette de club, qui fonctionne hors ligne.

## Commandes

- `npm run dev` — serveur de développement
- `npm test` — tests (Vitest)
- `npm run build` — build de production
- `npm run design:check` — garde-fou du design system sur l'**application rendue** : les douze scènes (`?scene=`) aux trois formats (1920×1080, 1180×733, 1133×744). Exige `npm run dev` lancé ; port autre que 5173 : `npm run design:check -- --url http://localhost:5174/`
- `npm run design:check:file` — le même garde-fou sur les **sources** (`src`)

Chacun écrit **un seul fichier récapitulatif daté** dans `.impeccable/baseline/` (`AAAA-MM-JJ-scan-url.json`, `AAAA-MM-JJ-scan-src.json`) portant chaque mesure — cible, format, code de sortie, constats — et tous deux **propagent le code de sortie** : `0` propre, `2` constats, `1` échec de scan (un serveur éteint ne se lit pas « 0 constat »).

> **Pourquoi le lanceur du dépôt et pas `npx impeccable`** — écart assumé, Story 11.4. `impeccable` n'est pas une dépendance npm du projet : `npx impeccable` **téléchargerait la 4.1.0** alors que le dépôt embarque la **4.0.0** (`.claude/skills/impeccable/scripts/impeccable`, binaire `darwin-arm64`, sans Node, hors ligne). Deux versions de détecteur donneraient deux lignes de base incomparables, et la comparaison au relevé du 2026-09-15 dans `.impeccable/baseline/` perdrait son sens. Détail dans l'en-tête de `scripts/design-check.sh`.

Conventions du projet : voir [`CLAUDE.md`](./CLAUDE.md).
