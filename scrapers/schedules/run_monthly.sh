#!/usr/bin/env bash
# Job mensual — full Avellaneda (~42 págs) + archivo histórico
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$DIR"
LOG_DIR="${DIR}/output/logs"
mkdir -p "$LOG_DIR" output/archive
LOG="${LOG_DIR}/monthly_$(date +%Y%m%d).log"
STAMP=$(date +%Y%m)
export PYTHONPATH="${PYTHONPATH:-}:/root/.local/lib/python3.12/site-packages"
{
  echo "=== MONTHLY $(date -Iseconds) ==="
  python3 run.py ml --profile monthly
  python3 run.py merge
  if [[ -f output/unified_latest.json ]]; then
    cp output/unified_latest.json "output/archive/unified_${STAMP}.json"
  fi
  if [[ -f output/ml_monthly_latest.json ]]; then
    cp output/ml_monthly_latest.json "output/archive/ml_monthly_${STAMP}.json"
  fi
  python3 run.py export-marketplace
  echo "=== DONE $(date -Iseconds) ==="
} >> "$LOG" 2>&1
