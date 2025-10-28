#!/bin/bash
#
# Install/manage launchd scheduler for YouTube transcript sync
# Usage:
#   bash install-transcript-scheduler.sh install   # Install and start scheduler
#   bash install-transcript-scheduler.sh uninstall # Remove scheduler
#   bash install-transcript-scheduler.sh status    # Check scheduler status
#   bash install-transcript-scheduler.sh run-now   # Run sync immediately (test)
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

PLIST_SOURCE="$SCRIPT_DIR/com.superalignment.transcripts.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.superalignment.transcripts.plist"
SYNC_SCRIPT="$SCRIPT_DIR/sync-and-rebuild-embeddings.sh"
LABEL="com.superalignment.transcripts"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

install_scheduler() {
    echo "=========================================="
    echo "Installing Transcript Sync Scheduler"
    echo "=========================================="
    echo ""

    # Step 1: Make sync script executable
    echo "Step 1: Making sync script executable..."
    if [ -f "$SYNC_SCRIPT" ]; then
        chmod +x "$SYNC_SCRIPT"
        echo "✓ Sync script is executable"
    else
        echo -e "${RED}❌ Error: Sync script not found at $SYNC_SCRIPT${NC}"
        exit 1
    fi
    echo ""

    # Step 2: Create LaunchAgents directory if needed
    echo "Step 2: Setting up LaunchAgents directory..."
    mkdir -p "$HOME/Library/LaunchAgents"
    echo "✓ LaunchAgents directory ready"
    echo ""

    # Step 3: Copy plist file
    echo "Step 3: Installing launch agent..."
    if [ -f "$PLIST_SOURCE" ]; then
        cp "$PLIST_SOURCE" "$PLIST_DEST"
        echo "✓ Copied plist to $PLIST_DEST"
    else
        echo -e "${RED}❌ Error: Plist file not found at $PLIST_SOURCE${NC}"
        exit 1
    fi
    echo ""

    # Step 4: Load launch agent
    echo "Step 4: Loading launch agent..."
    launchctl load "$PLIST_DEST" 2>&1

    if [ $? -eq 0 ]; then
        echo "✓ Launch agent loaded"
    else
        echo -e "${YELLOW}⚠️  Warning: Launch agent may already be loaded${NC}"
        echo "   Unloading and reloading..."
        launchctl unload "$PLIST_DEST" 2>/dev/null
        launchctl load "$PLIST_DEST"
    fi
    echo ""

    # Step 5: Verify
    echo "Step 5: Verifying installation..."
    if launchctl list | grep -q "$LABEL"; then
        echo -e "${GREEN}✓ Scheduler installed successfully!${NC}"
        echo ""
        echo "Schedule: Daily at 2:00 AM"
        echo "Script: $SYNC_SCRIPT"
        echo "Logs: $PROJECT_ROOT/logs/sync-embeddings_*.log"
        echo ""
        echo "Commands:"
        echo "  bash $0 status    # Check status"
        echo "  bash $0 run-now   # Run immediately (test)"
        echo "  bash $0 uninstall # Remove scheduler"
    else
        echo -e "${RED}❌ Installation verification failed${NC}"
        exit 1
    fi
}

uninstall_scheduler() {
    echo "=========================================="
    echo "Uninstalling Transcript Sync Scheduler"
    echo "=========================================="
    echo ""

    if [ -f "$PLIST_DEST" ]; then
        echo "Unloading launch agent..."
        launchctl unload "$PLIST_DEST" 2>/dev/null
        echo "✓ Launch agent unloaded"
        echo ""

        echo "Removing plist file..."
        rm "$PLIST_DEST"
        echo "✓ Plist file removed"
        echo ""

        echo -e "${GREEN}✓ Scheduler uninstalled successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Scheduler not installed (plist not found)${NC}"
    fi
}

check_status() {
    echo "=========================================="
    echo "Transcript Sync Scheduler Status"
    echo "=========================================="
    echo ""

    if launchctl list | grep -q "$LABEL"; then
        echo -e "${GREEN}✓ Scheduler is installed and loaded${NC}"
        echo ""
        echo "Details:"
        launchctl list | grep "$LABEL"
        echo ""
        echo "Schedule: Daily at 2:00 AM"
        echo "Script: $SYNC_SCRIPT"
        echo ""

        # Check for recent logs
        echo "Recent logs:"
        LATEST_LOG=$(ls -t "$PROJECT_ROOT/logs/sync-embeddings_"*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            echo "  Latest: $LATEST_LOG"
            echo "  Modified: $(stat -f "%Sm" "$LATEST_LOG")"
        else
            echo "  No sync logs found yet"
        fi
        echo ""

        # Check launchd logs
        echo "Launchd logs:"
        if [ -f "$PROJECT_ROOT/logs/launchd-transcripts-stdout.log" ]; then
            echo "  stdout: $PROJECT_ROOT/logs/launchd-transcripts-stdout.log"
        fi
        if [ -f "$PROJECT_ROOT/logs/launchd-transcripts-stderr.log" ]; then
            echo "  stderr: $PROJECT_ROOT/logs/launchd-transcripts-stderr.log"
        fi
    else
        echo -e "${RED}✗ Scheduler is not installed${NC}"
        echo ""
        echo "To install:"
        echo "  bash $0 install"
    fi
}

run_now() {
    echo "=========================================="
    echo "Running Transcript Sync Immediately"
    echo "=========================================="
    echo ""

    if [ -x "$SYNC_SCRIPT" ]; then
        echo "Executing: $SYNC_SCRIPT"
        echo ""
        bash "$SYNC_SCRIPT"
    else
        echo -e "${RED}❌ Error: Sync script not found or not executable${NC}"
        echo "   Expected: $SYNC_SCRIPT"
        exit 1
    fi
}

# Main command dispatcher
case "${1:-help}" in
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
    help|*)
        echo "YouTube Transcript Sync Scheduler"
        echo ""
        echo "Usage:"
        echo "  bash $0 install   # Install and start daily scheduler (2:00 AM)"
        echo "  bash $0 uninstall # Remove scheduler"
        echo "  bash $0 status    # Check if scheduler is running"
        echo "  bash $0 run-now   # Run sync immediately (test)"
        echo ""
        echo "What it does:"
        echo "  - Checks all YouTube channels for new videos"
        echo "  - Downloads transcripts for new videos"
        echo "  - Rebuilds FAISS embeddings index"
        echo "  - Updates SQLite database"
        echo "  - Logs everything to logs/sync-embeddings_*.log"
        ;;
esac
