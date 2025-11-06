#!/bin/bash
# Automated fix for Object.entries/keys non-determinism
# Adds .sort() to all Object iterations in simulation hot paths

set -euo pipefail

echo "================================================================"
echo " OBJECT ITERATION DETERMINISM FIX"
echo "================================================================"
echo ""
echo "This script will search for Object.entries/keys/values patterns"
echo "in simulation code and suggest fixes for non-deterministic usage."
echo ""
echo "Mode: AUDIT ONLY (no automatic fixes - too risky)"
echo ""

# Define hot path directories (called every month/agent/action)
HOT_PATHS=(
  "src/simulation/agents/"
  "src/simulation/engine/phases/"
  "src/simulation/*.ts"
)

# Search for Object iteration patterns
echo "📋 Searching for Object iteration patterns..."
echo ""

TOTAL_FOUND=0

for pattern in "Object.entries" "Object.keys" "Object.values"; do
  echo "=== Pattern: ${pattern}() ==="
  echo ""

  for path in "${HOT_PATHS[@]}"; do
    if [ -d "$(dirname "$path")" ]; then
      FILES=$(find $(dirname "$path") -name "$(basename "$path")" -type f 2>/dev/null | grep -v ".bak" | grep -v "test" || true)

      for file in $FILES; do
        if [ -f "$file" ]; then
          MATCHES=$(grep -n "$pattern" "$file" 2>/dev/null || true)
          if [ -n "$MATCHES" ]; then
            echo "📄 $file:"
            echo "$MATCHES" | head -5
            echo ""
            TOTAL_FOUND=$((TOTAL_FOUND + 1))
          fi
        fi
      done
    fi
  done
done

echo "================================================================"
echo "📊 SUMMARY"
echo "================================================================"
echo "Total files with Object iteration: $TOTAL_FOUND"
echo ""
echo "⚠️  MANUAL REVIEW REQUIRED"
echo ""
echo "For each file above, check if:"
echo "1. The code is in a hot path (executed frequently)"
echo "2. The iteration order affects weighted selection or state mutation"
echo "3. The Object.entries/keys/values is NOT already sorted"
echo ""
echo "If YES to all three, apply this fix:"
echo ""
echo "  // BEFORE:"
echo "  for (const [key, val] of Object.entries(obj)) { ... }"
echo ""
echo "  // AFTER:"
echo "  const sorted = Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0]));"
echo "  for (const [key, val] of sorted) { ... }"
echo ""
echo "================================================================"
echo ""
echo "✅ See docs/ISSUE_11_DETERMINISM_DEBUGGING_PROGRESS.md for details"
echo ""
