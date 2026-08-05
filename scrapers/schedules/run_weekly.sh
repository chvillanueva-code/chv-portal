#!/usr/bin/env bash
# Job semanal — crawl profundo + enrich sellers (limit mayor) + export
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
LOG_DIR="${DIR}/output/logs"
mkdir -p "$LOG_DIR"
LOG="${LOG_DIR}/weekly_$(date +%Y%m%d).log"
export PATH="${PATH}:/root/.local/bin"
export PYTHONPATH="/root/.local/lib/python3.12/site-packages:${PYTHONPATH:-}"

{
  echo "=== WEEKLY $(date -Iseconds) ==="
  python3 run.py ml --profile weekly --enrich-sellers --enrich-limit 200
  python3 run.py merge
  python3 run.py export-marketplace
  if [[ -f output/ml_weekly_prev.json ]]; then
    python3 run.py diff --a output/ml_weekly_prev.json --b output/ml_weekly_latest.json \
      --out "output/logs/delta_weekly_$(date +%Y%m%d).json" || true
  fi
  if [[ -f output/ml_weekly_latest.json ]]; then
    cp output/ml_weekly_latest.json output/ml_weekly_prev.json
  fi
  echo "=== DONE $(date -Iseconds) ==="
} >> "$LOG" 2>&1
