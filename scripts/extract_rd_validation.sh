#!/bin/bash
# Extract RD-1 (Permafrost) and RD-3 (Geopolitical) validation metrics from Monte Carlo logs

LOG_FILE="logs/mc_permafrost_fix_test_20251128_192603.log"

echo "================================================================================"
echo "RD-1 PERMAFROST CARBON FEEDBACK VALIDATION"
echo "================================================================================"
echo ""

echo "CO2 Emissions Range (should be 3-6 Gt C/year, NOT trillions):"
grep "CO2:" "$LOG_FILE" | grep "Gt C/year" | sed 's/.*CO2: //' | sed 's/ Gt C.*//' | sort -n | uniq -c | tail -10
echo ""

echo "CH4 Emissions Range:"
grep "CH4:" "$LOG_FILE" | grep "Gt C/year" | sed 's/.*CH4: //' | sed 's/ Gt C.*//' | sort -n | uniq -c | tail -10
echo ""

echo "Permafrost Thaw Progression (% thawed):"
grep "PERMAFROST THAW" "$LOG_FILE" | grep "% thawed" | head -20
echo ""

echo "Warnings (High emissions or >50% loss):"
grep "WARNING.*permafrost" "$LOG_FILE" | wc -l
echo "Total permafrost warnings"
echo ""

echo "Arctic Amplification Cascade Events:"
grep "Arctic amplification" "$LOG_FILE" | wc -l
echo "Total Arctic cascade events"
echo ""

echo "================================================================================"
echo "RD-3 GEOPOLITICAL CONFLICT ESCALATION VALIDATION"
echo "================================================================================"
echo ""

echo "AI-Mediated De-escalation Events:"
grep "AI-MEDIATED DE-ESCALATION SUCCESS" "$LOG_FILE" | wc -l
echo "Total de-escalation successes"
echo ""

echo "Nuclear Deterrence Statistics:"
grep "Deterrence checks:" "$LOG_FILE"
echo ""

echo "Peace Stabilization Events:"
grep "PEACE STABILIZES DETERRENCE" "$LOG_FILE" | wc -l
echo "Total peace stabilization events"
echo ""

echo "Geopolitical Tension Levels:"
grep "Geopolitical tension:" "$LOG_FILE" | sed 's/.*tension: //' | sort -n | uniq -c
echo ""

echo "War-related Displacement:"
grep "war (conflict" "$LOG_FILE" | wc -l
echo "War displacement events"
echo ""

echo "================================================================================"
echo "CROSS-SYSTEM INTERACTIONS"
echo "================================================================================"
echo ""

echo "Conflict Impact on Population (by cause: conflict):"
grep "Conflict=" "$LOG_FILE" | sed 's/.*Conflict=//' | sed 's/M.*/M/' | head -10
echo ""

echo "Climate Impact on Population (by cause: climate):"
grep "Climate=" "$LOG_FILE" | sed 's/.*Climate=//' | sed 's/M.*/M/' | head -10
echo ""
