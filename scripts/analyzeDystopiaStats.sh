#!/bin/bash
# Dystopia Statistics Analyzer for Monte Carlo Logs
# Extracts dystopia-specific metrics from simulation logs

LOG_FILE="${1:-/tmp/mc_dystopia_240_50.log}"

if [ ! -f "$LOG_FILE" ]; then
    echo "Error: Log file not found: $LOG_FILE"
    exit 1
fi

echo "=================================================="
echo "DYSTOPIA STATISTICS ANALYZER"
echo "=================================================="
echo "Log file: $LOG_FILE"
echo ""

# Count dystopia entries/exits
echo "=== DYSTOPIA ENTRY/EXIT EVENTS ==="
DYSTOPIA_ENTRIES=$(grep -c "🚨 ENTERING DYSTOPIA:" "$LOG_FILE")
DYSTOPIA_EXITS=$(grep -c "✅ EXITING DYSTOPIA:" "$LOG_FILE")
DYSTOPIA_TRANSITIONS=$(grep -c "🔄 DYSTOPIA VARIANT CHANGE:" "$LOG_FILE")

echo "Total Dystopia Entries: $DYSTOPIA_ENTRIES"
echo "Total Dystopia Exits: $DYSTOPIA_EXITS"
echo "Total Variant Transitions: $DYSTOPIA_TRANSITIONS"
echo ""

# Extract dystopia variants
echo "=== DYSTOPIA VARIANTS DETECTED ==="
grep "🚨 ENTERING DYSTOPIA:" "$LOG_FILE" | sed -E 's/.*ENTERING DYSTOPIA: ([a-z_]+).*/\1/' | sort | uniq -c | sort -rn
echo ""

# Extract dystopia types from variant changes
echo "=== VARIANT TRANSITIONS ==="
grep "🔄 DYSTOPIA VARIANT CHANGE:" "$LOG_FILE" | sed -E 's/.*CHANGE: ([a-z_]+) → ([a-z_]+).*/FROM: \1 TO: \2/' | head -20
echo ""

# Count final outcomes
echo "=== FINAL OUTCOMES ==="
echo "Final Outcome: EXTINCTION - $(grep -c "Final Outcome: EXTINCTION" "$LOG_FILE")"
echo "Final Outcome: DYSTOPIA - $(grep -c "Final Outcome: DYSTOPIA" "$LOG_FILE")"
echo "Final Outcome: UTOPIA - $(grep -c "Final Outcome: UTOPIA" "$LOG_FILE")"
echo "Final Outcome: BOTTLENECK - $(grep -c "Final Outcome: BOTTLENECK" "$LOG_FILE")"
echo "Final Outcome: SLOWTAKE - $(grep -c "Final Outcome: SLOWTAKE" "$LOG_FILE")"
echo ""

# Duration statistics
echo "=== DYSTOPIA DURATION STATISTICS ==="
grep "Duration:" "$LOG_FILE" | sed -E 's/.*Duration: ([0-9]+) months.*/\1/' | awk '
{
    sum += $1
    count++
    durations[count] = $1
}
END {
    if (count > 0) {
        avg = sum / count
        # Calculate std dev
        sumsq = 0
        for (i = 1; i <= count; i++) {
            sumsq += (durations[i] - avg) ^ 2
        }
        stddev = sqrt(sumsq / count)

        # Sort for median
        asort(durations)
        if (count % 2 == 1) {
            median = durations[int(count/2) + 1]
        } else {
            median = (durations[count/2] + durations[count/2 + 1]) / 2
        }

        printf "Dystopia durations analyzed: %d\n", count
        printf "Average duration: %.1f months\n", avg
        printf "Median duration: %.1f months\n", median
        printf "Std deviation: %.1f months\n", stddev
        printf "Min duration: %d months\n", durations[1]
        printf "Max duration: %d months\n", durations[count]
    } else {
        print "No dystopia duration data found"
    }
}'
echo ""

# Severity analysis
echo "=== DYSTOPIA SEVERITY ANALYSIS ==="
grep "Severity:" "$LOG_FILE" | sed -E 's/.*Severity: ([0-9]+)%.*/\1/' | awk '
{
    sum += $1
    count++
    if (count == 1 || $1 > max) max = $1
    if (count == 1 || $1 < min) min = $1
}
END {
    if (count > 0) {
        printf "Severity measurements: %d\n", count
        printf "Average severity: %.1f%%\n", sum / count
        printf "Min severity: %d%%\n", min
        printf "Max severity: %d%%\n", max
    } else {
        print "No severity data found"
    }
}'
echo ""

# Population affected
echo "=== POPULATION IMPACT ==="
grep "Affected:" "$LOG_FILE" | sed -E 's/.*Affected: ([0-9]+)%.*/\1/' | awk '
{
    sum += $1
    count++
}
END {
    if (count > 0) {
        printf "Average population affected: %.1f%%\n", sum / count
    } else {
        print "No population impact data found"
    }
}'
echo ""

# Monte Carlo summary
echo "=== MONTE CARLO OUTCOME DISTRIBUTION ==="
TOTAL_RUNS=$(grep -c "Progress:" "$LOG_FILE" | head -1)
if [ -z "$TOTAL_RUNS" ] || [ "$TOTAL_RUNS" -eq 0 ]; then
    TOTAL_RUNS=$(grep "Total Runs:" "$LOG_FILE" | head -1 | sed -E 's/.*Total Runs: ([0-9]+).*/\1/')
fi

echo "Total runs: ${TOTAL_RUNS:-unknown}"
grep -A 4 "Outcome Distribution:" "$LOG_FILE" | tail -4
echo ""

# Dystopia entry reasons
echo "=== DYSTOPIA ENTRY REASONS (Top 10) ==="
grep "Reason:" "$LOG_FILE" | grep -A 1 "🚨 ENTERING DYSTOPIA:" | grep "Reason:" | sed -E 's/.*Reason: (.*)/\1/' | sort | uniq -c | sort -rn | head -10
echo ""

echo "=================================================="
echo "Analysis complete."
echo "=================================================="
