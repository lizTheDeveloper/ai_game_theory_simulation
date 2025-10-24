#!/bin/bash
#
# Install/Uninstall Research Question Auto-Update Scheduler
#
# This script installs a launchd agent that runs daily at 2:00 AM to:
# 1. Backup Claude Code conversations
# 2. Extract research questions
# 3. Update docs/wiki/RESEARCH_QUESTIONS.md

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLIST_SOURCE="$SCRIPT_DIR/com.superalignment.research-questions.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.superalignment.research-questions.plist"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_usage() {
    echo -e "${BLUE}Research Question Auto-Update Scheduler${NC}"
    echo ""
    echo "Usage: $0 [install|uninstall|status|run-now]"
    echo ""
    echo "Commands:"
    echo "  install   - Install the scheduler (runs daily at 2:00 AM)"
    echo "  uninstall - Remove the scheduler"
    echo "  status    - Check if scheduler is running"
    echo "  run-now   - Run the update immediately (for testing)"
    echo ""
}

install_scheduler() {
    echo -e "${BLUE}Installing Research Question Scheduler...${NC}"

    # Create LaunchAgents directory if it doesn't exist
    mkdir -p "$HOME/Library/LaunchAgents"

    # Copy plist file
    cp "$PLIST_SOURCE" "$PLIST_DEST"

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to copy plist file${NC}"
        exit 1
    fi

    # Load the agent
    launchctl load "$PLIST_DEST"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Scheduler installed successfully${NC}"
        echo -e "${YELLOW}  Schedule: Daily at 2:00 AM${NC}"
        echo -e "${YELLOW}  Logs: logs/research-questions-update.log${NC}"
        echo ""
        echo "Run '$0 status' to check if it's running"
        echo "Run '$0 run-now' to test it immediately"
    else
        echo -e "${RED}✗ Failed to load scheduler${NC}"
        exit 1
    fi
}

uninstall_scheduler() {
    echo -e "${BLUE}Uninstalling Research Question Scheduler...${NC}"

    # Unload the agent
    launchctl unload "$PLIST_DEST" 2>/dev/null

    # Remove the plist file
    rm -f "$PLIST_DEST"

    echo -e "${GREEN}✓ Scheduler uninstalled${NC}"
}

check_status() {
    if launchctl list | grep -q "com.superalignment.research-questions"; then
        echo -e "${GREEN}✓ Scheduler is running${NC}"
        echo ""
        echo "Schedule: Daily at 2:00 AM"
        echo "Next run: $(date -v+1d -v2H -v0M '+%Y-%m-%d %H:%M:%S')"
        echo ""

        # Show recent log entries
        LOG_FILE="$(dirname "$SCRIPT_DIR")/logs/research-questions-update.log"
        if [ -f "$LOG_FILE" ]; then
            echo "Recent log entries:"
            tail -5 "$LOG_FILE"
        fi
    else
        echo -e "${YELLOW}⚠ Scheduler is not running${NC}"
        echo ""
        echo "Run '$0 install' to install it"
    fi
}

run_now() {
    echo -e "${BLUE}Running research question update now...${NC}"
    echo ""

    bash "$SCRIPT_DIR/updateResearchQuestions.sh"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ Update completed successfully${NC}"
        echo "Check docs/wiki/RESEARCH_QUESTIONS.md for updated questions"
    else
        echo ""
        echo -e "${RED}✗ Update failed${NC}"
        echo "Check logs/research-questions-update.log for details"
    fi
}

# Main command dispatcher
case "$1" in
    install)
        install_scheduler
        ;;
    uninstall)
        uninstall_scheduler
        ;;
    status)
        check_status
        ;;
    run-now)
        run_now
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
