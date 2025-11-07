#!/bin/bash
# Audit fallback operators in simulation code
# Usage: ./scripts/audit_fallbacks.sh

set -euo pipefail

SIMULATION_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation"
OUTPUT_FILE="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/critical4_fallback_locations.txt"

echo "=== CRITICAL-4: Fallback Operator Audit ===" > "$OUTPUT_FILE"
echo "Date: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Find all ?? operators, exclude .bak files
grep -rn " ?? " "$SIMULATION_DIR" | grep -v "\.bak" >> "$OUTPUT_FILE"

# Count total
TOTAL=$(grep -rn " ?? " "$SIMULATION_DIR" | grep -v "\.bak" | wc -l)
echo "" >> "$OUTPUT_FILE"
echo "TOTAL FALLBACKS: $TOTAL" >> "$OUTPUT_FILE"

# Count by file
echo "" >> "$OUTPUT_FILE"
echo "=== BY FILE ===" >> "$OUTPUT_FILE"
grep -rn " ?? " "$SIMULATION_DIR" | grep -v "\.bak" | cut -d: -f1 | sort | uniq -c | sort -rn >> "$OUTPUT_FILE"

echo "✅ Audit complete. Results saved to $OUTPUT_FILE"
cat "$OUTPUT_FILE" | tail -20
