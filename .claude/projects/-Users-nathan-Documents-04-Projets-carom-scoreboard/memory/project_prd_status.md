---
name: project-prd-status
description: Status of the PRD and key product decisions for Carom Scoreboard
metadata:
  type: project
---

PRD completed on 2026-05-19 at `_bmad-output/planning-artifacts/prd.md`.

**Why:** Full V1→V4 product vision documented through bmad-create-prd workflow.

**How to apply:** Use this PRD as the source of truth for all downstream work (architecture, UX, epics).

## Key Decisions

- V1a scope: JDS modes (Libre/Cadre/Bande) only — no timer, no 3 Bandes, no cloud
- V1b: adds 3 Bandes with mandatory timer
- "Carambole" is the sport name, not a game mode — no "Carambole mode" in the product
- 5 Quilles and Casin full rules: hors scope V1, pending federation validation
- Auth model (V2+): Korean model — account in companion app, short ID at tablet
- Stack: open decision, deferred to architecture phase
- Visual identity: defined separately by Nathan (not prescribed in PRD)
- Client primaire: clubs (SaaS subscription); joueurs = secondary/organic growth
- Solo dev + Claude Code, no hard deadline, ship V1a fast
