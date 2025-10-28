#!/bin/bash

# Fix require() statements in phase files to use ES6 imports
# This is critical for browser worker compatibility

PHASE_DIR="src/simulation/engine/phases"

echo "=== Fixing require() statements in phase files ==="
echo ""

# Get list of files with require() (excluding backups)
FILES=$(grep -rl "require(" "$PHASE_DIR"/*.ts 2>/dev/null | grep -v ".bak")

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "Found $FILE_COUNT files with require() statements"
echo ""

for file in $FILES; do
  echo "Processing: $(basename "$file")"

  # Extract all require statements from the file
  REQUIRES=$(grep "require(" "$file" | grep -v "^//" | grep -v "^\s*//" | head -20)

  if [ -n "$REQUIRES" ]; then
    echo "  Found require() statements:"
    echo "$REQUIRES" | while read line; do
      echo "    $line"
    done
  fi

  echo ""
done

echo ""
echo "=== Manual conversion required ==="
echo "Due to the complexity of the transformations (moving imports to top,"
echo "preserving whitespace, handling multiline requires), this script only"
echo "identifies the files that need fixing."
echo ""
echo "Recommended approach:"
echo "1. Fix critical early-execution phases first (Compute, Allocation, etc.)"
echo "2. Fix remaining phases systematically"
echo "3. Test after each batch"
echo ""
echo "Pattern to follow:"
echo "  OLD: const { funcName } = require('../../module');"
echo "  NEW: import { funcName } from '../../module';  (at top of file)"
