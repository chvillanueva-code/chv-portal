#!/usr/bin/env bash
# Sube padrón merge a chv-portal con GitHub CLI
# Uso: bash scrapers/push_padron_to_github.sh
# Requiere: gh auth login

set -eu

REPO="chvillanueva-code/chv-portal"
BRANCH="main"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
# Si el script está en scrapers/, la raíz del proyecto es el padre
if [[ "$(basename "$SCRIPT_DIR")" == "scrapers" ]]; then
  ROOT="${PADRON_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"
else
  ROOT="${PADRON_ROOT:-$SCRIPT_DIR}"
fi

echo "==> Auth check"
if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) no está instalado. https://cli.github.com/"
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: no hay sesión. Ejecutá: gh auth login"
  exit 1
fi
gh auth status

echo "==> Repo: $REPO | branch: $BRANCH"
echo "==> Root: $ROOT"

FILES=(
  "scrapers/data/README.md"
  "scrapers/data/merge_manifest.json"
  "scrapers/data/padron_azul.json"
  "scrapers/data/padron_matanza.json"
  "scrapers/data/padron_moron.json"
  "scrapers/data/padron_mdp.json"
  "scrapers/data/padron_sannicolas.json"
  "scrapers/data/padron_quilmes_electoral.json"
  "scrapers/data/padron_pba_martillerosba.json"
  "scrapers/data/padron_pba_martillerosba.csv"
  "scrapers/data/entities_merged_pba_latest.csv"
  "scrapers/data/entities_merged_pba_latest.json"
  "scrapers/data/entities_merged_pba_v1_2026-08-04.json"
  "directorio-inmobiliario/data/entities_pba_merged.js"
  "directorio-inmobiliario/data/entities_pba_merged.json"
  "directorio-inmobiliario/data/merge_manifest.json"
  "shared/entity-schema.js"
  "shared/ENTITY_SCHEMA.md"
)

TMP="$(mktemp -d 2>/dev/null || mktemp -d -t chv-padron)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

echo "==> Clone $REPO"
if ! gh repo clone "$REPO" "$TMP/repo" -- --depth 1 -b "$BRANCH"; then
  echo "ERROR: no se pudo clonar el repo"
  exit 1
fi
cd "$TMP/repo"

copied=0
missing=0
for f in "${FILES[@]}"; do
  src="$ROOT/$f"
  if [[ ! -f "$src" ]]; then
    echo "  skip: $f"
    missing=$((missing + 1))
    continue
  fi
  mkdir -p "$(dirname "$f")"
  cp "$src" "$f"
  echo "  + $f"
  copied=$((copied + 1))
done

echo "==> copiados=$copied omitidos=$missing"
if [[ "$copied" -eq 0 ]]; then
  echo "ERROR: no se encontró ningún archivo local."
  echo "Descomprimí chv-padron-pba-merge-v1.zip y poné PADRON_ROOT en la carpeta chv-padron-export"
  echo "Ejemplo: PADRON_ROOT=/ruta/chv-padron-export bash scrapers/push_padron_to_github.sh"
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo "Sin cambios para commit (ya está actualizado)"
  exit 0
fi

git config user.email "chv-portal@local"
git config user.name "CHV Portal Bot"

git commit -m "feat(padron): merge PBA + colegios departamentales v1"

echo "==> Push"
git push origin "HEAD:$BRANCH"
echo "==> OK https://github.com/$REPO"
