#!/bin/bash
# Remove duplicate phase type imports from PhaseOrchestrator

for file in src/simulation/engine/phases/*.ts; do
  if grep -q "from '@/types/game'" "$file" && grep -q "SimulationPhase.*from '@/types/game'" "$file"; then
    # Remove imports from PhaseOrchestrator
    sed -i '' "/from '\.\.\/PhaseOrchestrator'/d" "$file"
    sed -i '' "/from '\.\.\/\.\.\/\.\.\/types\/game'/d" "$file"
    echo "✓ Cleaned up $(basename "$file")"
  fi
done
echo "Done!"
