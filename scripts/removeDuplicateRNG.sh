#!/bin/bash
# Remove duplicate RNGFunction imports from @/types/config

for file in src/simulation/engine/phases/*.ts; do
  if grep -q "from '@/types/game'" "$file" && grep -q "RNGFunction.*from '@/types/game'" "$file"; then
    # Remove the import from @/types/config
    if grep -q "import { RNGFunction } from '@/types/config'" "$file"; then
      sed -i '' "/^import { RNGFunction } from '@\/types\/config';$/d" "$file"
      echo "✓ Removed duplicate from $(basename "$file")"
    fi
  fi
done
echo "Done!"
