#!/bin/bash

echo "=== Comprehensive State Mutation Audit ===" 
echo "Date: $(date)"
echo ""

# More comprehensive mutation patterns
echo "## Mutation Pattern Analysis"
echo "Pattern 1 - Direct assignment (state.x.y =): $(grep -r "state\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]* =" src/simulation --include="*.ts" | wc -l)"
echo "Pattern 2 - Nested assignment (state.x.y.z =): $(grep -r "state\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]* =" src/simulation --include="*.ts" | wc -l)"
echo "Pattern 3 - Array push/splice: $(grep -r "state\.[a-zA-Z_].*\.push\|\.splice\|\.unshift" src/simulation --include="*.ts" | wc -l)"
echo "Pattern 4 - Object spread mutation: $(grep -r "state\.[a-zA-Z_].* = {.*..." src/simulation --include="*.ts" | wc -l)"
echo ""

echo "## Assertion Pattern Analysis"
echo "assertFinite calls: $(grep -r "assertFinite" src/simulation --include="*.ts" | wc -l)"
echo "assertDefined calls: $(grep -r "assertDefined" src/simulation --include="*.ts" | wc -l)"
echo "assertInRange calls: $(grep -r "assertInRange" src/simulation --include="*.ts" | wc -l)"
echo "assertProbability calls: $(grep -r "assertProbability" src/simulation --include="*.ts" | wc -l)"
echo "assertStateProperty calls: $(grep -r "assertStateProperty" src/simulation --include="*.ts" | wc -l)"
echo "assertNonEmpty calls: $(grep -r "assertNonEmpty" src/simulation --include="*.ts" | wc -l)"
echo "assertRegionalConsistency calls: $(grep -r "assertRegionalConsistency" src/simulation --include="*.ts" | wc -l)"
echo ""

echo "## Top 20 Phases by Total State Access (mutations + reads)"
for file in src/simulation/engine/phases/*.ts; do
    basename=$(basename "$file")
    # Count both mutations and state reads
    mutations=$(grep -c "state\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]* =" "$file" 2>/dev/null || echo "0")
    nested=$(grep -c "state\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]* =" "$file" 2>/dev/null || echo "0")
    total=$((mutations + nested))
    if [ $total -gt 0 ]; then
        echo "$total $basename"
    fi
done | sort -rn | head -20

