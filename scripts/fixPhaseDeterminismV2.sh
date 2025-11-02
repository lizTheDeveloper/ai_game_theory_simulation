#!/usr/bin/env bash
#
# Fix Phase Determinism V2 - Add setDeterministicRng(rng) to all phases
#
# IMPROVED VERSION: Handles multi-line imports correctly
#
# Roy says: "v1 broke multi-line imports. v2 finds the REAL last import line."

set -euo pipefail

echo "════════════════════════════════════════════════════════════════"
echo "  FIX PHASE DETERMINISM V2 - Add setDeterministicRng(rng) Calls"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Counters
FILES_PROCESSED=0
IMPORTS_ADDED=0
SET_CALLS_ADDED=0

# Get all phase files (excluding .bak)
PHASE_FILES=$(find /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases -name "*.ts" -not -name "*.bak*")

for FILE in $PHASE_FILES; do
  echo "🔧 Processing: $(basename "$FILE")"

  # Check if file already imports setDeterministicRng
  if grep -q "setDeterministicRng" "$FILE"; then
    echo "   ℹ️  Already has setDeterministicRng import"
  else
    # Find the LAST closing brace of imports (handles multi-line imports)
    # Look for patterns like:
    # import { ... } from '...';
    # import {
    #   ...
    # } from '...';

    # Strategy: Find last line containing "} from" or "; $" that's part of an import
    LAST_IMPORT_LINE=$(grep -n "^import\|} from\|';$" "$FILE" | grep -B 999 "^import" | tail -1 | cut -d: -f1)

    if [ -n "$LAST_IMPORT_LINE" ]; then
      # Insert import after last import-related line
      sed -i "${LAST_IMPORT_LINE}a\\import { setDeterministicRng } from '@/simulation/utils/deterministicRng';" "$FILE"
      echo "   ✅ Added setDeterministicRng import after line $LAST_IMPORT_LINE"
      IMPORTS_ADDED=$((IMPORTS_ADDED + 1))
    else
      echo "   ⚠️  Could not find import location"
    fi
  fi

  # Find execute method and add setDeterministicRng(rng) at start
  if grep -q "execute.*rng.*:" "$FILE"; then
    # Check if setDeterministicRng(rng) already present in execute method
    if grep -A 5 "execute.*rng.*:" "$FILE" | grep -q "setDeterministicRng(rng)"; then
      echo "   ℹ️  Already calls setDeterministicRng(rng)"
    else
      # Find line with execute method
      EXECUTE_LINE=$(grep -n "execute.*rng.*:" "$FILE" | head -1 | cut -d: -f1)

      # Find next line with opening brace after execute
      BRACE_LINE=$(tail -n +$EXECUTE_LINE "$FILE" | grep -n "{" | head -1 | cut -d: -f1)
      BRACE_LINE=$((EXECUTE_LINE + BRACE_LINE - 1))

      # Insert setDeterministicRng(rng); after opening brace
      sed -i "${BRACE_LINE}a\\    setDeterministicRng(rng);" "$FILE"

      echo "   ✅ Added setDeterministicRng(rng) call"
      SET_CALLS_ADDED=$((SET_CALLS_ADDED + 1))
    fi
  else
    echo "   ⚠️  No execute method with rng parameter found"
  fi

  FILES_PROCESSED=$((FILES_PROCESSED + 1))
  echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "✅ PHASE DETERMINISM UPDATE COMPLETE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   Phase files processed:     $FILES_PROCESSED"
echo "   Imports added:             $IMPORTS_ADDED"
echo "   setDeterministicRng calls: $SET_CALLS_ADDED"
echo ""
