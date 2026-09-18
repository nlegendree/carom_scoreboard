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

# Liste CANONIQUE, figée avant l'analyse des arguments : `--scene` écrase `SCENES`, et c'est
# contre celle-ci qu'on valide ce qu'on nous demande de scanner.
KNOWN_SCENES="$SCENES"

MODE=${1:-url}
[ $# -gt 0 ] && shift

BASE_URL="http://localhost:5173/"

# Une option EN DERNIER ARGUMENT n'a pas de valeur : sous `set -u`, `$2` faisait avorter le
# script sur « unbound variable », sans aucun des trois messages finaux et avec un code de
# sortie hors convention (1 sous bash, 2 — « des constats » ! — sous dash). C'est le plantage
# que l'AC8 vient de fermer dans `render-static.cjs` ; il renaissait ici (revue du 2026-09-18).
need_value() {
  [ "$2" -ge 2 ] || {
    echo "design-check: $1 attend une valeur, et n'en a pas reçu." >&2
    exit 1
  }
}

while [ $# -gt 0 ]; do
  case "$1" in
    --url) need_value --url $#; BASE_URL=$2; shift 2 ;;
    --scene) need_value --scene $#; SCENES=$2; shift 2 ;;
    --viewport) need_value --viewport $#; VIEWPORTS=$2; shift 2 ;;
    *) echo "design-check: argument inconnu « $1 »" >&2; exit 1 ;;
  esac
done

# ⚠️ ZÉRO MESURE NE DOIT PAS SE LIRE « PROPRE ». Une liste vide (`--scene ""`) ne faisait
# tourner aucune boucle et rendait `scans: 0, findings: 0, exitCode: 0` — et une scène mal
# orthographiée (`07-scoreboard-JDS`, `07-scoreboard-jd`) faisait rendre `null` à `readScene()`,
# donc scanner L'ACCUEIL douze fois en croyant mesurer le scoreboard. C'est le placebo décrit
# en tête de `src/dev/scenes.ts`, déplacé d'un cran vers la ligne de commande (revue du 2026-09-18).
if [ "$MODE" = url ]; then
  [ -n "$(printf '%s' "$SCENES" | tr -d ' ')" ] || {
    echo "design-check: aucune scène à scanner — une liste vide ne se lit pas « propre »." >&2
    exit 1
  }
  [ -n "$(printf '%s' "$VIEWPORTS" | tr -d ' ')" ] || {
    echo "design-check: aucun format à scanner — une liste vide ne se lit pas « propre »." >&2
    exit 1
  }
  for scene in $SCENES; do
    case " $KNOWN_SCENES " in
      *" $scene "*) ;;
      *) echo "design-check: scène inconnue « $scene » — elle scannerait l'accueil et rendrait « propre »." >&2
         echo "  scènes connues : $KNOWN_SCENES" >&2
         exit 1 ;;
    esac
  done
  # Une `--url` portant déjà une query donnait `…/?dev=1/?scene=07-…` : Vite sert l'index,
  # `readScene()` rend `null`, l'accueil est scanné. On refuse plutôt que de mesurer à côté.
  case "$BASE_URL" in
    *\?*) echo "design-check: --url ne doit pas porter de query (le script ajoute « ?scene= »)." >&2
          exit 1 ;;
  esac
fi

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
# ⚠️ TOUT code hors {0,2} est un ÉCHEC, pas seulement `1`. La première version ne retenait que
# le `1` littéral : un binaire tué (137), un Chromium en segfault (139), un `bad CPU type`
# (126) ou un `command not found` (127) affichaient « ÉCHEC DE SCAN » dans le corps et
# ressortaient `exit 0` — le placebo exact que l'AC1 existe pour empêcher (revue du 2026-09-18).
note() {
  case "$1" in
    0) ;;
    2) [ "$status" = 0 ] && status=2 ;;
    *) status=1 ;;
  esac
}
# Un scan a-t-il échoué ? Sert au journal comme à `write_run_file` : la frontière « échec »
# est définie ICI, une seule fois, pour que les deux ne puissent pas diverger.
failed() { [ "$1" != 0 ] && [ "$1" != 2 ]; }

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
    const [ledger, out, date, mode, base, exitCode, scenes, viewports] = process.argv.slice(1)
    const scans = fs.readFileSync(ledger, "utf8").split("\n").filter(Boolean).map((line) => {
      const [target, viewport, code, file] = line.split("\t")
      const entry = { target, exit: Number(code) }
      if (viewport) entry.viewport = viewport
      // Même frontière que `failed()` côté shell : TOUT code hors {0,2} porte un message
      // d’erreur, jamais un tableau de constats. Tester `=== 1` faisait tenter un JSON.parse
      // sur le texte de stderr pour un code 127/139 : node mourait, aucune archive n’était
      // écrite, et le script annonçait quand même « archivé » (revue du 2026-09-18).
      // ⚠️ Apostrophe TYPOGRAPHIQUE obligatoire ici : ce bloc vit dans un `node -e '…'`,
      // et une apostrophe droite y fermerait la chaîne du shell.
      if (Number(code) !== 0 && Number(code) !== 2) entry.error = fs.readFileSync(file, "utf8").trim()
      else entry.findings = JSON.parse(fs.readFileSync(file, "utf8"))
      return entry
    })
    fs.writeFileSync(out, JSON.stringify({
      date, mode, detector: "impeccable 4.0.0 (lanceur du dépôt)",
      ...(mode === "url" ? { baseUrl: base } : {}),
      exitCode: Number(exitCode),
      // PORTÉE du lancement. Sans elle, un `--scene`/`--viewport` restreint écrase le
      // récapitulatif complet du même jour et devient indistinguable d’un scan complet qui
      // aurait planté après la première mesure (revue du 2026-09-18). Un lancement partiel
      // se dénonce désormais tout seul.
      ...(mode === "url" ? { scenes: scenes.split(" ").filter(Boolean), viewports: viewports.split(" ").filter(Boolean) } : {}),
      scans: scans.length,
      findings: scans.reduce((n, s) => n + (s.findings?.length ?? 0), 0),
      results: scans,
    }, null, 1) + "\n")
  ' "$LEDGER" "$RUN_FILE" "$DATE" "$MODE" "$BASE_URL" "$status" "$SCENES" "$VIEWPORTS"
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

# ⚠️ L'archivage peut échouer (JSON tronqué, disque plein) : un récapitulatif absent ne doit
# pas passer pour écrit, et surtout pas laisser croire que la passe s'est bien terminée.
if write_run_file; then
  archived=$RUN_FILE
else
  archived=""
  status=1
  echo "design-check: l'archivage a ÉCHOUÉ — aucun récapitulatif écrit" >&2
fi

case $status in
  0) echo "→ aucun constat (exit 0)" ;;
  2) echo "→ des constats sont sortis (exit 2)" ;;
  1) echo "→ au moins un scan a ÉCHOUÉ (exit 1) — rien n'est mesuré, ne pas lire « propre »" ;;
esac
[ -n "$archived" ] && echo "  archivé : $archived"
exit $status
