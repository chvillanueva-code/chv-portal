#!/usr/bin/env bash
# Job diario — crawl liviano + enrich sellers + export marketplace
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
LOG_DIR="${DIR}/output/logs"
mkdir -p "$LOG_DIR" output/archive
LOG="${LOG_DIR}/daily_$(date +%Y%m%d).log"
export PATH="${PATH}:/root/.local/bin"
export PYTHONPATH="/root/.local/lib/python3.12/site-packages:${PYTHONPATH:-}"

{
  echo "=== DAILY $(date -Iseconds) ==="
  # 2 páginas Avellaneda + completar "publicado por" en hasta 80 fichas sin seller
  python3 run.py ml --profile daily --enrich-sellers --enrich-limit 80
  python3 run.py merge
  python3 run.py export-marketplace
  if [[ -f output/ml_daily_prev.json ]]; then
    python3 run.py diff --a output/ml_daily_prev.json --b output/ml_daily_latest.json \
      --out "output/logs/delta_daily_$(date +%Y%m%d).json" || true
  fi
  if [[ -f output/ml_daily_latest.json ]]; then
    cp output/ml_daily_latest.json output/ml_daily_prev.json
  fi
  echo "=== DONE $(date -Iseconds) ==="
} >> "$LOG" 2>&1
