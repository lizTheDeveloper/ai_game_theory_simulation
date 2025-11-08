#!/bin/bash
# Fix assertion imports that were inserted in wrong place

# Files with errors
ERROR_FILES="consciousnessGovernance resourceInitialization"

for base in $ERROR_FILES; do
  file="src/simulation/${base}.ts"
  echo "Fixing $file..."

  # Remove the incorrectly placed import
  sed -i '/^import { assertFinite } from/d' "$file"

  # Find last import line (after all imports complete)
  last_import=$(grep -n "^import\|^} from" "$file" | tail -1 | cut -d: -f1)

  # Add assertion import after last import
  sed -i "${last_import}a\\import { assertFinite } from './utils/assertions';" "$file"

  echo "Fixed: $file (added after line $last_import)"
done
