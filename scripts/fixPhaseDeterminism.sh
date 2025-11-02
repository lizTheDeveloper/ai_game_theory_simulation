#!/usr/bin/env bash
#
# Fix Phase Determinism - Add setDeterministicRng(rng) to all phases
#
# CRITICAL BLOCKER FIX: Issue #11 - Simulation Non-Determinism (Part 2)
#
# This script adds setDeterministicRng(rng) calls to all phase execute() methods.
#
# Roy says: "115 phases. If I miss even ONE, non-determinism persists. Automation essential."

set -euo pipefail

echo "════════════════════════════════════════════════════════════════"
echo "  FIX PHASE DETERMINISM - Add setDeterministicRng(rng) Calls"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
    echo "   ℹ️  Already has setDeterministicRng"
  else
    # Add import after existing imports
    if grep -q "^import" "$FILE"; then
      # Find line number of last import
      LAST_IMPORT_LINE=$(grep -n "^import" "$FILE" | tail -1 | cut -d: -f1)

      # Insert import after last import line
      sed -i "${LAST_IMPORT_LINE}a\\import { setDeterministicRng } from '@/simulation/utils/deterministicRng';" "$FILE"

      echo "   ✅ Added setDeterministicRng import"
      IMPORTS_ADDED=$((IMPORTS_ADDED + 1))
    fi
  fi

  # Find execute method and add setDeterministicRng(rng) at start
  # Look for pattern: execute(state: GameState, rng:
  # Then find the opening { and insert setDeterministicRng(rng); after it

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
    echo "   ${YELLOW}⚠️  No execute method with rng parameter found${NC}"
  fi

  FILES_PROCESSED=$((FILES_PROCESSED + 1))
  echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "${GREEN}✅ PHASE DETERMINISM UPDATE COMPLETE${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   Phase files processed:     $FILES_PROCESSED"
echo "   Imports added:             $IMPORTS_ADDED"
echo "   setDeterministicRng calls: $SET_CALLS_ADDED"
echo ""
echo "⚠️  NEXT STEPS:"
echo "   1. Type check: npx tsc --noEmit"
echo "   2. Fix Date.now() ID generation (Phase 2)"
echo "   3. Run determinism verification test"
echo ""
