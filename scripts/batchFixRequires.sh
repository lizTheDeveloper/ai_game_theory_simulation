#!/bin/bash

# Batch fix all require() statements in phase files
# Converts: const { funcName } = require('../../module');
# To: import { funcName } from '../../module';

PHASE_DIR="src/simulation/engine/phases"

echo "=== Batch fixing require() in phase files ==="
echo ""

# Get list of files with require() (excluding backups)
FILES=$(grep -rl "require(" "$PHASE_DIR"/*.ts 2>/dev/null | grep -v ".bak" | grep -v "ComputeGrowthPhase\|ComputeAllocationPhase\|AILifecyclePhase\|AIAgentActionsPhase\|ExtinctionTriggersPhase")

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "Found $FILE_COUNT files remaining to fix"
echo ""

FIXED=0

for file in $FILES; do
  echo "Processing: $(basename "$file")"

  # Extract import statements to add at the top
  IMPORTS=""

  # Find all require() statements and convert them
  while IFS= read -r line; do
    if [[ "$line" =~ const[[:space:]]+\{([^}]+)\}[[:space:]]*=[[:space:]]*require\([\'\"](.*)[\'\"]\) ]]; then
      FUNCS="${BASH_REMATCH[1]}"
      MODULE="${BASH_REMATCH[2]}"

      # Build import statement
      IMPORT="import { $FUNCS } from '$MODULE';"
      echo "  Converting: $IMPORT"
      IMPORTS="$IMPORTS$IMPORT\n"

      # Remove the require line from file
      sed -i.bak "/const.*{.*$FUNCS.*}.*require/d" "$file"
    fi
  done < <(grep "require(" "$file" | grep -v "^//" | grep "const.*{")

  if [ -n "$IMPORTS" ]; then
    # Find the line with existing imports
    IMPORT_LINE=$(grep -n "^import.*from '@/types/game'" "$file" | cut -d: -f1 | head -1)

    if [ -n "$IMPORT_LINE" ]; then
      # Insert new imports after the existing import
      echo -e "$IMPORTS" | sed -i.bak2 "${IMPORT_LINE}a\\
$(echo -e "$IMPORTS" | sed 's/\\n/\n/g')
" "$file" 2>/dev/null || {
        # Fallback: append imports at line 15 (after existing imports)
        LINE_15=$(sed -n '15p' "$file")
        sed -i.bak3 "15a\\
$(echo -e "$IMPORTS" | sed 's/\\n/\n/g')
" "$file"
      }

      FIXED=$((FIXED + 1))
      echo "  ✓ Fixed"
    else
      echo "  ✗ Could not find import line"
    fi
  fi

  echo ""
done

echo ""
echo "=== Summary ==="
echo "Files processed: $FIXED"
echo ""
echo "Cleaning up backup files..."
find "$PHASE_DIR" -name "*.bak*" -delete
echo "Done!"
