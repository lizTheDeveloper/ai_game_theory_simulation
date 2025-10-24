#!/bin/bash
# Fix phase type imports across all phase files

PHASE_DIR="src/simulation/engine/phases"

for file in "$PHASE_DIR"/*.ts; do
  echo "Processing $file..."

  # Check if file exists and is not empty
  if [ ! -s "$file" ]; then
    continue
  fi

  # Pattern 1: Files importing PhaseResult from PhaseOrchestrator
  # Replace: import { PhaseResult } from '../PhaseOrchestrator';
  # With: import { SimulationPhase, PhaseResult, PhaseContext } from '@/types/game';
  sed -i '' 's/import {[[:space:]]*PhaseResult[[:space:]]*} from '\''\.\.\/PhaseOrchestrator'\'';/import { SimulationPhase, PhaseResult, PhaseContext } from '\''@\/types\/game'\'';/' "$file"

  # Pattern 2: Files importing from ../../../types/game
  # Replace: import { ... PhaseResult ... } from '../../../types/game';
  # With proper import from @/types/game
  sed -i '' 's/import {[[:space:]]*PhaseResult[[:space:]]*} from '\''\.\.\/\.\.\/\.\.\/types\/game'\'';/import { SimulationPhase, PhaseResult, PhaseContext } from '\''@\/types\/game'\'';/' "$file"

  # Pattern 3: Files that already import from @/types/game but missing phase types
  # Check if file already has an import from @/types/game
  if grep -q "import.*from '@/types/game'" "$file"; then
    # If it has GameState or GameEvent but not PhaseResult, add phase types
    if grep "import.*from '@/types/game'" "$file" | grep -q "GameState\|GameEvent" && ! grep "import.*from '@/types/game'" "$file" | grep -q "PhaseResult"; then
      # Add phase types to existing import
      sed -i '' "s/import { \(.*\) } from '@\/types\/game';/import { \1, SimulationPhase, PhaseResult, PhaseContext } from '@\/types\/game';/" "$file"
    fi
  fi
done

echo "Done!"
