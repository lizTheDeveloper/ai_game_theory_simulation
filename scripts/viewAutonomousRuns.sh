#!/bin/bash
# View autonomous worker runs in chronological order with summaries

LOG_DIR="logs/autonomous"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          📊 AUTONOMOUS WORKER RUN HISTORY                         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ ! -d "$LOG_DIR" ]; then
    echo -e "${YELLOW}⚠️  No autonomous worker logs found${NC}"
    exit 0
fi

# Get all metrics files
METRICS_FILES=$(find "$LOG_DIR" -name "metrics_*.json" 2>/dev/null | sort)

if [ -z "$METRICS_FILES" ]; then
    echo -e "${YELLOW}⚠️  No metrics files found${NC}"
    echo ""
    echo "Available logs:"
    ls -lh "$LOG_DIR"/*.log 2>/dev/null || echo "No logs found"
    exit 0
fi

# Count total runs
TOTAL_RUNS=$(echo "$METRICS_FILES" | wc -l)
echo -e "${CYAN}📈 Total runs: $TOTAL_RUNS${NC}"
echo ""

# Process each metrics file
RUN_NUM=1
while IFS= read -r metrics_file; do
    if [ -f "$metrics_file" ]; then
        # Extract metrics using jq if available, otherwise use grep/sed
        if command -v jq &> /dev/null; then
            TIMESTAMP=$(jq -r '.timestamp' "$metrics_file" 2>/dev/null || echo "unknown")
            BRANCH=$(jq -r '.branch' "$metrics_file" 2>/dev/null || echo "unknown")
            DURATION=$(jq -r '.duration_seconds' "$metrics_file" 2>/dev/null || echo "0")
            CLAUDE_DURATION=$(jq -r '.claude_duration_seconds' "$metrics_file" 2>/dev/null || echo "0")
            CHANGED_FILES=$(jq -r '.changed_files' "$metrics_file" 2>/dev/null || echo "0")
            COMMITS=$(jq -r '.commits_made' "$metrics_file" 2>/dev/null || echo "0")
            EXIT_CODE=$(jq -r '.claude_exit_code' "$metrics_file" 2>/dev/null || echo "unknown")
        else
            # Fallback parsing without jq
            TIMESTAMP=$(grep '"timestamp"' "$metrics_file" | sed 's/.*": "\(.*\)".*/\1/')
            DURATION=$(grep '"duration_seconds"' "$metrics_file" | sed 's/.*: \([0-9]*\).*/\1/')
            CHANGED_FILES=$(grep '"changed_files"' "$metrics_file" | sed 's/.*: \([0-9]*\).*/\1/')
            COMMITS=$(grep '"commits_made"' "$metrics_file" | sed 's/.*: \([0-9]*\).*/\1/')
        fi

        # Calculate human-readable duration
        MINUTES=$((DURATION / 60))
        SECONDS=$((DURATION % 60))

        # Determine status emoji
        if [ "$EXIT_CODE" = "0" ]; then
            STATUS="${GREEN}✅ Success${NC}"
        elif [ "$EXIT_CODE" = "124" ]; then
            STATUS="${YELLOW}⏱️  Timeout${NC}"
        else
            STATUS="${RED}❌ Error (exit $EXIT_CODE)${NC}"
        fi

        # Display run summary
        echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}Run #$RUN_NUM - $TIMESTAMP${NC}"
        echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "  Status:        $STATUS"
        echo -e "  Duration:      ${CYAN}${MINUTES}m ${SECONDS}s${NC}"
        echo -e "  Claude Time:   ${CYAN}$((CLAUDE_DURATION / 60))m $((CLAUDE_DURATION % 60))s${NC}"
        echo -e "  Files Changed: ${CYAN}$CHANGED_FILES${NC}"
        echo -e "  Commits:       ${CYAN}$COMMITS${NC}"
        echo -e "  Branch:        ${CYAN}$BRANCH${NC}"

        # Check if log file exists and show key info
        LOG_FILE="$LOG_DIR/worker_$TIMESTAMP.log"
        if [ -f "$LOG_FILE" ]; then
            LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
            echo -e "  Log Size:      ${CYAN}$LOG_SIZE${NC}"
            echo -e "  Log Path:      ${CYAN}$LOG_FILE${NC}"

            # Extract key events from log
            echo ""
            echo -e "  ${YELLOW}Key Events:${NC}"
            grep -E "PRE-FLIGHT|GIT SYNC|CLAUDE CODE|GIT OPERATIONS|METRICS" "$LOG_FILE" | \
                grep -E "^\[.*\]" | \
                tail -5 | \
                sed 's/^/    /'
        fi

        echo ""
        RUN_NUM=$((RUN_NUM + 1))
    fi
done <<< "$METRICS_FILES"

# Summary statistics
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    📊 SUMMARY STATISTICS                          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if command -v jq &> /dev/null; then
    # Calculate aggregates
    TOTAL_DURATION=0
    TOTAL_COMMITS=0
    TOTAL_FILES=0

    while IFS= read -r metrics_file; do
        if [ -f "$metrics_file" ]; then
            DURATION=$(jq -r '.duration_seconds' "$metrics_file" 2>/dev/null || echo "0")
            COMMITS=$(jq -r '.commits_made' "$metrics_file" 2>/dev/null || echo "0")
            FILES=$(jq -r '.changed_files' "$metrics_file" 2>/dev/null || echo "0")

            TOTAL_DURATION=$((TOTAL_DURATION + DURATION))
            TOTAL_COMMITS=$((TOTAL_COMMITS + COMMITS))
            TOTAL_FILES=$((TOTAL_FILES + FILES))
        fi
    done <<< "$METRICS_FILES"

    echo -e "${CYAN}Total Runtime:     $(($TOTAL_DURATION / 3600))h $(($TOTAL_DURATION % 3600 / 60))m${NC}"
    echo -e "${CYAN}Total Commits:     $TOTAL_COMMITS${NC}"
    echo -e "${CYAN}Total Files:       $TOTAL_FILES${NC}"
    echo -e "${CYAN}Avg Runtime/Run:   $(($TOTAL_DURATION / $TOTAL_RUNS / 60))m $(($TOTAL_DURATION / $TOTAL_RUNS % 60))s${NC}"
fi

echo ""
echo -e "${YELLOW}💡 To view a specific log:${NC}"
echo -e "   ${CYAN}cat logs/autonomous/worker_TIMESTAMP.log${NC}"
echo ""
echo -e "${YELLOW}💡 To view current status:${NC}"
echo -e "   ${CYAN}cat logs/autonomous/status_current.txt${NC}"
echo ""
