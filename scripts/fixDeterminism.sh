#!/usr/bin/env bash
#
# Fix Determinism - Automated Math.random() → deterministicRandom() Replacement
#
# CRITICAL BLOCKER FIX: Issue #11 - Simulation Non-Determinism
#
# This script replaces all Math.random() calls with deterministicRandom() in simulation code.
#
# Roy says: "35 files, 200+ call sites. This would take days to do manually. Automation FTW."

set -euo pipefail

echo "════════════════════════════════════════════════════════════════"
echo "  FIX DETERMINISM - Replace Math.random() → deterministicRandom()"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
FILES_PROCESSED=0
REPLACEMENTS_MADE=0
IMPORTS_ADDED=0

# Get list of files with Math.random() (excluding .bak files)
FILES=$(find /home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation -name "*.ts" -not -name "*.bak*" -exec grep -l "Math\\.random()" {} \;)

if [ -z "$FILES" ]; then
  echo "${GREEN}✅ No Math.random() calls found!${NC}"
  exit 0
fi

echo "📋 Found $(echo "$FILES" | wc -l) files with Math.random() calls"
echo ""

for FILE in $FILES; do
  echo "🔧 Processing: $FILE"

  # Count Math.random() occurrences before
  BEFORE_COUNT=$(grep -o "Math\.random()" "$FILE" | wc -l)

  # Check if file already imports deterministicRandom
  if grep -q "deterministicRandom" "$FILE"; then
    echo "   ℹ️  Already has deterministicRandom import"
  else
    # Add import after existing imports (find last import line)
    # Look for lines starting with "import" and add after the last one
    if grep -q "^import" "$FILE"; then
      # Find line number of last import
      LAST_IMPORT_LINE=$(grep -n "^import" "$FILE" | tail -1 | cut -d: -f1)

      # Insert import after last import line
      sed -i "${LAST_IMPORT_LINE}a\\import { deterministicRandom } from '@/simulation/utils/deterministicRng';" "$FILE"

      echo "   ✅ Added deterministicRandom import"
      IMPORTS_ADDED=$((IMPORTS_ADDED + 1))
    else
      # No imports found - add at top after initial comment block
      # Find first non-comment, non-empty line
      FIRST_CODE_LINE=$(grep -n "^[^/*]" "$FILE" | head -1 | cut -d: -f1)
      if [ -n "$FIRST_CODE_LINE" ]; then
        sed -i "${FIRST_CODE_LINE}i\\import { deterministicRandom } from '@/simulation/utils/deterministicRng';\n" "$FILE"
        echo "   ✅ Added deterministicRandom import (at top)"
        IMPORTS_ADDED=$((IMPORTS_ADDED + 1))
      else
        echo "   ${YELLOW}⚠️  Warning: Could not determine import location${NC}"
      fi
    fi
  fi

  # Replace Math.random() with deterministicRandom()
  sed -i 's/Math\.random()/deterministicRandom()/g' "$FILE"

  # Count replacements
  AFTER_COUNT=$(grep -o "deterministicRandom()" "$FILE" | wc -l)
  REPLACED=$((AFTER_COUNT - (AFTER_COUNT - BEFORE_COUNT)))

  echo "   ✅ Replaced $BEFORE_COUNT Math.random() → deterministicRandom()"

  REPLACEMENTS_MADE=$((REPLACEMENTS_MADE + BEFORE_COUNT))
  FILES_PROCESSED=$((FILES_PROCESSED + 1))
  echo ""
done

echo "════════════════════════════════════════════════════════════════"
echo "${GREEN}✅ PHASE 1 COMPLETE: Math.random() Replacement${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   Files processed:    $FILES_PROCESSED"
echo "   Imports added:      $IMPORTS_ADDED"
echo "   Replacements made:  $REPLACEMENTS_MADE"
echo ""
echo "🔍 Verify no Math.random() remain:"
echo "   grep -r 'Math\\.random()' src/simulation --include='*.ts' --exclude='*.bak*' | wc -l"
echo ""
echo "⚠️  NEXT STEPS:"
echo "   1. Update ALL phases to call setDeterministicRng(rng) at start"
echo "   2. Fix Date.now() ID generation (Phase 2)"
echo "   3. Run determinism verification test"
echo ""
