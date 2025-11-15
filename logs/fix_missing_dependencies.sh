#!/bin/bash
# Fix all missing phase dependencies
# Roy's batch fix (Nov 15, 2025)

set -e

PHASES_DIR="src/simulation/engine/phases"

echo "Fixing missing dependencies..."

# Fix: ai_alignment_evolution → doesn't exist, remove
sed -i "s/'ai_alignment_evolution'.*\/\/ Order.*$/\/\/ NOTE: ai_alignment_evolution phase doesn't exist - dependency removed/" \
  "$PHASES_DIR/AIAgentActionsPhase.ts" \
  "$PHASES_DIR/AILifecyclePhase.ts"

# Fix: technology-deployment → technology-diffusion
sed -i "s/'technology-deployment'/'technology-diffusion'/g" \
  "$PHASES_DIR/AntimicrobialResistancePhase.ts" \
  "$PHASES_DIR/ClimateDeploymentPhase.ts"

# Fix: survival_traits → human-survival-system
sed -i "s/'survival_traits'/'human-survival-system'/g" \
  "$PHASES_DIR/CooperativeSystemsPhase.ts"

# Fix: refugee-crisis → refugee_crisis
sed -i "s/'refugee-crisis'/'refugee_crisis'/g" \
  "$PHASES_DIR/GovernmentRelocationPhase.ts"

# Fix: society-agent-actions → society-actions
sed -i "s/'society-agent-actions'/'society-actions'/g" \
  "$PHASES_DIR/HumanEnhancementPhase.ts"

# Fix: nuclear_command_control → doesn't exist, remove
sed -i "s/'nuclear_command_control'.*$/\/\/ NOTE: nuclear_command_control phase doesn't exist - dependency removed/" \
  "$PHASES_DIR/InternationalRelationsPhase.ts" \
  "$PHASES_DIR/NuclearCrisisPhase.ts" \
  "$PHASES_DIR/NuclearWinterPhase.ts"

# Fix: ai_suffering → minimal_suffering
sed -i "s/'ai_suffering'/'minimal_suffering'/g" \
  "$PHASES_DIR/MinimalSufferingPhase.ts"

echo "✅ Fixed all missing dependencies"
echo "Running validation..."

npx tsx logs/find_all_violations.ts
