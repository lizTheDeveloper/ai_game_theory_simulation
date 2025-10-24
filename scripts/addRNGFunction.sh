#!/bin/bash
# Add RNGFunction to phase files that need it

for file in src/simulation/engine/phases/*.ts; do
  if grep -q "rng: RNGFunction" "$file"; then
    if ! grep "from '@/types/game'" "$file" | grep -q "RNGFunction"; then
      # Add RNGFunction to the import from @/types/game
      sed -i '' "s/import { \(.*\) } from '@\/types\/game';/import { \1, RNGFunction } from '@\/types\/game';/" "$file"
      echo "✓ Added RNGFunction to $(basename "$file")"
    fi
  fi
done
echo "Done!"
