#!/bin/bash

echo "=== Critical Phase Analysis: Mutations vs Assertions ==="
echo ""

for phase in ExogenousShockPhase EmergencyResponsePhase CriticalJuncturePhase MortalityStabilizersPhase ClimateImpactCascadePhase FamineSystemPhase HumanPopulationPhase AIAgentActionsPhase AILifecyclePhase; do
    file="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/${phase}.ts"
    if [ -f "$file" ]; then
        muts=$(grep "state\." "$file" | grep -c " = " || echo 0)
        asserts=$(grep -c "assert" "$file" || echo 0)
        gap=$((muts - asserts))
        printf "%-35s Mutations: %3d  Assertions: %3d  Gap: %3d\n" "$phase" "$muts" "$asserts" "$gap"
    fi
done
