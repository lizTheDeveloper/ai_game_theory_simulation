#!/bin/bash

echo "=== State Validation Framework: Mutation Audit ===" 
echo "Date: $(date)"
echo ""

echo "## Overview Statistics"
echo "Total state mutations: $(grep -r "state\.[a-zA-Z]*\.[a-zA-Z]* =" src/simulation --include="*.ts" | wc -l)"
echo "Total assertion calls: $(grep -r "assert" src/simulation --include="*.ts" | wc -l)"
echo "Files with assertion imports: $(grep -r "import.*assert" src/simulation --include="*.ts" | wc -l)"
echo ""

echo "## Critical Phase Analysis"
echo ""

for phase in MortalityStabilizersPhase BayesianMortalityResolutionPhase ClimateImpactCascadePhase FamineSystemPhase HumanPopulationPhase AIAgentActionsPhase AILifecyclePhase; do
    file="src/simulation/engine/phases/${phase}.ts"
    if [ -f "$file" ]; then
        mutations=$(grep "state\.[a-zA-Z]*\.[a-zA-Z]* =" "$file" | wc -l)
        assertions=$(grep "assert" "$file" | wc -l)
        gap=$((mutations - assertions))
        echo "### $phase"
        echo "  Mutations: $mutations"
        echo "  Assertions: $assertions"
        echo "  Gap: $gap"
        echo ""
    fi
done

echo "## Top 10 Phases by Mutation Count"
for file in src/simulation/engine/phases/*.ts; do
    basename=$(basename "$file")
    count=$(grep "state\.[a-zA-Z]*\.[a-zA-Z]* =" "$file" | wc -l)
    echo "$count $basename"
done | sort -rn | head -10

