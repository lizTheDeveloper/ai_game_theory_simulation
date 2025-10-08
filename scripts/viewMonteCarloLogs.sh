#!/bin/bash
# Helper script to view and analyze Monte Carlo simulation logs

OUTPUT_DIR="$(dirname $0)/../monteCarloOutputs"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Monte Carlo Log Viewer${NC}"
echo -e "${BLUE}=====================${NC}\n"

# Check if output directory exists
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "No logs found. Run a Monte Carlo simulation first."
    exit 1
fi

# Count log files
LOG_COUNT=$(ls -1 "$OUTPUT_DIR"/*.log 2>/dev/null | wc -l)

if [ $LOG_COUNT -eq 0 ]; then
    echo "No log files found in $OUTPUT_DIR"
    exit 1
fi

echo -e "${GREEN}Found $LOG_COUNT log file(s)${NC}\n"

# List log files with details
echo "Recent log files:"
ls -lht "$OUTPUT_DIR"/*.log | head -10 | awk '{print "  " $9 " (" $6 " " $7 ", " $5 ")"}'
echo ""

# If no arguments, show menu
if [ $# -eq 0 ]; then
    echo "Usage:"
    echo "  $0 latest              # View the most recent log"
    echo "  $0 tail [N]            # Tail the most recent log (default: 50 lines)"
    echo "  $0 follow              # Follow the most recent log in real-time"
    echo "  $0 summary             # Show summary of all runs"
    echo "  $0 errors              # Show errors from the most recent log"
    echo "  $0 list                # List all log files"
    echo "  $0 <filename>          # View specific log file"
    exit 0
fi

LATEST_LOG=$(ls -t "$OUTPUT_DIR"/*.log | head -1)

case "$1" in
    latest)
        echo -e "${YELLOW}Viewing latest log: $LATEST_LOG${NC}\n"
        less "$LATEST_LOG"
        ;;
    tail)
        LINES=${2:-50}
        echo -e "${YELLOW}Last $LINES lines of: $LATEST_LOG${NC}\n"
        tail -n $LINES "$LATEST_LOG"
        ;;
    follow)
        echo -e "${YELLOW}Following: $LATEST_LOG${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"
        tail -f "$LATEST_LOG"
        ;;
    summary)
        echo -e "${YELLOW}Summary of all Monte Carlo runs:${NC}\n"
        for log in $(ls -t "$OUTPUT_DIR"/*.log); do
            echo "$(basename $log):"
            grep -E "(Runs:|Duration:|Outcome Distribution:|Utopia:|Dystopia:|Extinction:|Stalemate:)" "$log" | head -20 | sed 's/^/  /'
            echo ""
        done
        ;;
    errors)
        echo -e "${YELLOW}Errors/Warnings from: $LATEST_LOG${NC}\n"
        grep -E "(ERROR|WARN|❌|⚠️)" "$LATEST_LOG" | tail -50
        ;;
    list)
        echo "All log files:"
        ls -lht "$OUTPUT_DIR"/*.log
        ;;
    *)
        # Treat argument as filename
        if [ -f "$OUTPUT_DIR/$1" ]; then
            less "$OUTPUT_DIR/$1"
        elif [ -f "$1" ]; then
            less "$1"
        else
            echo "File not found: $1"
            exit 1
        fi
        ;;
esac

