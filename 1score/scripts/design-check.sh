#!/bin/sh
# Garde-fou outillé du design system (Story 11.4). Lancé par `npm run design:check`
# (application rendue) et `npm run design:check:file` (sources), depuis `1score/`.
#
#   sh scripts/design-check.sh url [--url http://localhost:5173/] [--scene <id>] [--viewport <WxH>]
#   sh scripts/design-check.sh src
#
# POURQUOI LE LANCEUR DU DÉPÔT ET PAS `npx impeccable` — écart assumé au texte de l'AC
# d'`epics.md` et au §7 d'`integration-bmad-impeccable.md` : `impeccable` n'est pas une
# dépendance npm du projet, et `npx impeccable` TÉLÉCHARGERAIT la 4.1.0 alors que le dépôt
# embarque la 4.0.0 (`.claude/skills/impeccable/scripts/impeccable`, binaire darwin-arm64,
# sans Node, hors ligne). Deux versions de détecteur = deux lignes de base incomparables,
# et la comparaison au 2026-09-15 de `.impeccable/baseline/` n'aurait plus de sens.
#
# CODES DE SORTIE, propagés et agrégés (un script qui avale le 2 ne garde-fou rien) :
#   0  aucun constat        2  au moins un constat        1  au moins un scan a échoué
# L'échec l'emporte sur le constat : un serveur éteint ne doit JAMAIS se lire « 0 constat ».
#
# Le texte du détecteur part sur stderr et le JSON sur stdout : on archive le JSON
# (`--json`), et le résumé lisible est dérivé de ce JSON — un seul scan par cible.
set -u

# ⚠️ LE DÉTECTEUR LIT SON CONTEXTE DANS LE RÉPERTOIRE COURANT, ET NE REMONTE PAS.
# `.impeccable/config.json` (les ignores et leurs raisons), `.impeccable/design.json` et
# `DESIGN.md` vivent tous À LA RACINE DU DÉPÔT. Lancé depuis `1score/`, le scan ne trouvait
# AUCUN des trois et mesurait sans design system ni ignores — sans le dire (vérifié le
# 2026-09-17 : le même ignore est inerte depuis `1score/` et actif depuis la racine).
# On se place donc à la racine, et les cibles sont nommées depuis elle.
cd "$(dirname "$0")/../.." || exit 1

IMPECCABLE=".claude/skills/impeccable/scripts/impeccable"
BASELINE_DIR=".impeccable/baseline"
SRC_TARGET="1score/src"
DATE=$(date +%Y-%m-%d)

# Les douze scènes, dans l'ordre du parcours du harnais (`scripts/render-static.cjs`).
# Ces identifiants sont EXACTEMENT les noms de capture du harnais et les valeurs de
# `?scene=` acceptées par `src/dev/scenes.ts` : un seul vocabulaire pour les scans,
# les captures et les scènes (AC2).
SCENES="01-accueil 02-jds 03-parametrage-vide 04-popup-clavier-alpha 05-popup-pave-numerique 06-parametrage-rempli 07-scoreboard-jds 08-popup-saisie-serie 09-scoreboard-jds-en-partie 10-popup-decision 11-recap 12-scoreboard-3bandes"
VIEWPORTS="1920x1080 1180x733 1133x744"

MODE=${1:-url}
[ $# -gt 0 ] && shift

BASE_URL="http://localhost:5173/"
while [ $# -gt 0 ]; do
  case "$1" in
    --url) BASE_URL=$2; shift 2 ;;
    --scene) SCENES=$2; shift 2 ;;
    --viewport) VIEWPORTS=$2; shift 2 ;;
    *) echo "design-check: argument inconnu « $1 »" >&2; exit 1 ;;
  esac
done

[ -x "$IMPECCABLE" ] || {
  echo "design-check: lanceur introuvable ($IMPECCABLE) depuis $(pwd)" >&2
  exit 1
}
mkdir -p "$BASELINE_DIR"

# UN SEUL FICHIER PAR LANCEMENT, et non un par mesure (décision de Nathan, 2026-09-18).
# La première version écrivait `AAAA-MM-JJ-<scène>-<WxH>.json`, soit 37 fichiers par passe —
# et quand tout est propre, 37 fichiers contenant exactement `[]`. Même information, 1 fichier :
# le récapitulatif porte CHAQUE mesure (cible, format, code de sortie, constats), donc on sait
# aussi bien qu'avant lesquelles sont passées et lesquelles ont trouvé quelque chose.
# ⚠️ Écart assumé au texte de l'AC1 de la Story 11.4, qui reprenait la nomenclature des trois
# fichiers du 2026-09-15. Ceux-là ne bougent pas : ils sont la ligne de base de comparaison.
RUN_FILE="$BASELINE_DIR/$DATE-scan-$MODE.json"
# Journal intermédiaire, une ligne par mesure : cible <TAB> format <TAB> code <TAB> fichier brut.
LEDGER=$(mktemp)
SCRATCH=$(mktemp -d)
cleanup() { rm -rf "$LEDGER" "$SCRATCH"; }
trap cleanup EXIT INT TERM

status=0
# 1 (échec) l'emporte sur 2 (constats), qui l'emporte sur 0.
note() { case "$1:$status" in 1:*) status=1 ;; 2:0) status=2 ;; esac; }

# Résumé lisible d'une mesure — une ligne par constat, fichier et ligne compris. Le détecteur
# n'imprime rien sur stderr en mode `--json` : c'est la seule trace lisible, et elle vient du
# JSON réellement produit (pas d'un second scan).
summarize() {
  node -e '
    const fs = require("node:fs")
    const f = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
    for (const x of f) {
      const where = x.line ? `${x.file}:${x.line}` : x.file
      console.log(`      [${x.antipattern}] ${x.snippet || x.name} — ${where}`)
    }
  ' "$1" 2>/dev/null || echo "      (JSON illisible : $1)"
}

n=0
scan() {
  label=$1; target=$2; viewport=$3; shift 3
  n=$((n + 1))
  out="$SCRATCH/$n.json"
  # stdout = le JSON de la mesure, stderr = le message d'échec : les mélanger ferait un JSON
  # illisible le jour où le scan plante, c'est-à-dire le seul jour où on a besoin de lire.
  err="$SCRATCH/$n.err"
  "$IMPECCABLE" detect "$@" --json > "$out" 2> "$err"
  code=$?
  note $code
  case $code in
    0) printf '  %-34s propre\n' "$label" ;;
    2) printf '  %-34s CONSTATS\n' "$label"; summarize "$out" ;;
    *) printf '  %-34s ÉCHEC DE SCAN (exit %s)\n' "$label" "$code"
       sed 's/^/      /' "$err"
       # Ne pas laisser un JSON vide ou tronqué se faire passer pour une mesure.
       printf '%s\t%s\t%s\t%s\n' "$target" "$viewport" "$code" "$err" >> "$LEDGER"
       return ;;
  esac
  printf '%s\t%s\t%s\t%s\n' "$target" "$viewport" "$code" "$out" >> "$LEDGER"
}

# Assemble le récapitulatif du lancement. Les mesures gardent leurs constats en entier ; une
# mesure qui a ÉCHOUÉ garde son message d'erreur, pas un tableau vide qui la ferait passer
# pour propre.
write_run_file() {
  node -e '
    const fs = require("node:fs")
    const [ledger, out, date, mode, base, exitCode] = process.argv.slice(1)
    const scans = fs.readFileSync(ledger, "utf8").split("\n").filter(Boolean).map((line) => {
      const [target, viewport, code, file] = line.split("\t")
      const entry = { target, exit: Number(code) }
      if (viewport) entry.viewport = viewport
      if (Number(code) === 1) entry.error = fs.readFileSync(file, "utf8").trim()
      else entry.findings = JSON.parse(fs.readFileSync(file, "utf8"))
      return entry
    })
    fs.writeFileSync(out, JSON.stringify({
      date, mode, detector: "impeccable 4.0.0 (lanceur du dépôt)",
      ...(mode === "url" ? { baseUrl: base } : {}),
      exitCode: Number(exitCode),
      scans: scans.length,
      findings: scans.reduce((n, s) => n + (s.findings?.length ?? 0), 0),
      results: scans,
    }, null, 1) + "\n")
  ' "$LEDGER" "$RUN_FILE" "$DATE" "$MODE" "$BASE_URL" "$status"
}

case "$MODE" in
  src)
    echo "Scan des sources (impeccable 4.0.0 du dépôt) :"
    scan "$SRC_TARGET" "$SRC_TARGET" "" "$SRC_TARGET"
    ;;
  url)
    # Un serveur absent doit se dire tout de suite, pas se déguiser en « 0 constat »
    # douze fois de suite.
    echo "Scan de l'application rendue sur $BASE_URL :"
    for scene in $SCENES; do
      for vp in $VIEWPORTS; do
        scan "$scene $vp" "$scene" "$vp" "${BASE_URL%/}/?scene=$scene" --viewport "$vp"
      done
    done
    ;;
  *)
    echo "design-check: mode inconnu « $MODE » (attendu : url | src)" >&2
    exit 1
    ;;
esac

write_run_file

case $status in
  0) echo "→ aucun constat (exit 0)" ;;
  2) echo "→ des constats sont sortis (exit 2)" ;;
  1) echo "→ au moins un scan a ÉCHOUÉ (exit 1) — rien n'est mesuré, ne pas lire « propre »" ;;
esac
echo "  archivé : $RUN_FILE"
exit $status
