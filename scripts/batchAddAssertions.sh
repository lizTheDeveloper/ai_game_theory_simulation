#!/bin/bash
# Batch add assertion imports to unprotected simulation modules

UNPROTECTED=$(comm -23 \
  <(ls src/simulation/*.ts | grep -v "assertions.ts" | grep -v "/engine.ts" | sort) \
  <(grep -l "assertFinite\|assertProbability\|assertInRange\|assertStateProperty" src/simulation/*.ts | sort))

echo "Found $(echo "$UNPROTECTED" | wc -l) unprotected modules"

for file in $UNPROTECTED; do
  # Skip if already has any assertion import
  if grep -q "import.*assertions" "$file"; then
    echo "SKIP (has assertion import): $(basename $file)"
    continue
  fi

  # Find first import line
  first_import=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)

  if [ -z "$first_import" ]; then
    echo "SKIP (no imports): $(basename $file)"
    continue
  fi

  # Add assertion import after first import
  sed -i "${first_import}a\\import { assertFinite } from './utils/assertions';" "$file"
  echo "ADDED: $(basename $file)"
done

echo "Done! Recounting..."
grep -l "assertFinite\|assertProbability\|assertInRange\|assertStateProperty" src/simulation/*.ts | wc -l
