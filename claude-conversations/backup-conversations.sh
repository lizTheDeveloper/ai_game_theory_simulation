#!/bin/bash

# Claude Code Conversation Backup Script
# Backs up conversation history from ~/.claude/projects/ to this repo
#
# Usage:
#   bash backup-conversations.sh          # Backup only
#   bash backup-conversations.sh --redact # Backup + redact sensitive info

# Configuration
# IMPORTANT: Update PROJECTS array with your Claude Code project directory names
# These are directory names from ~/.claude/projects/ (run: ls ~/.claude/projects/)
# Format: Directory name as it appears in ~/.claude/projects/
# Example: If your project is at ~/src/myproject, the directory might be:
#          "-Users-yourusername-src-myproject"
#
# To find your project names: ls -1 ~/.claude/projects/
PROJECTS=(
    "-Users-annhoward-src-superalignmenttoutopia"
    "-Users-annhoward-src-ai-game-theory-simulation"
)
CLAUDE_BASE="$HOME/.claude/projects"
BACKUP_DIR="$(dirname "$0")"  # Same directory as this script
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REDACT=false

# Parse arguments
if [[ "$1" == "--redact" ]]; then
    REDACT=true
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Claude Code Conversation Backup ===${NC}"
echo "Backing up ${#PROJECTS[@]} projects"
echo ""

TOTAL_FILES=0
TOTAL_NEW_FILES=0
ERRORS=0

# Loop through each project
for PROJECT in "${PROJECTS[@]}"; do
    SOURCE_DIR="$CLAUDE_BASE/$PROJECT"

    # Create project-specific subdirectory
    if [[ "$PROJECT" == *"superalignmenttoutopia"* ]]; then
        PROJECT_BACKUP="$BACKUP_DIR"  # Main project goes to root
        PROJECT_NAME="superalignmenttoutopia"
    else
        # Extract project name from path
        PROJECT_NAME=$(echo "$PROJECT" | sed 's/-Users-annhoward-src-//')
        PROJECT_BACKUP="$BACKUP_DIR/$PROJECT_NAME"
        mkdir -p "$PROJECT_BACKUP"
    fi

    echo -e "${BLUE}Project: $PROJECT_NAME${NC}"
    echo "  Source: $SOURCE_DIR"
    echo "  Destination: $PROJECT_BACKUP"

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo -e "  ${YELLOW}⚠ Source directory not found, skipping${NC}"
        echo ""
        continue
    fi

    # Count files before backup
    BEFORE_COUNT=$(ls -1 "$PROJECT_BACKUP"/*.jsonl 2>/dev/null | wc -l)

    # Copy all JSONL files
    echo -e "  ${YELLOW}Copying conversation files...${NC}"
    cp "$SOURCE_DIR"/*.jsonl "$PROJECT_BACKUP/" 2>/dev/null

    # Check if copy was successful
    if [ $? -eq 0 ]; then
        AFTER_COUNT=$(ls -1 "$PROJECT_BACKUP"/*.jsonl 2>/dev/null | wc -l)
        NEW_FILES=$((AFTER_COUNT - BEFORE_COUNT))

        echo -e "  ${GREEN}✓ Success${NC}"
        echo "    Files: $AFTER_COUNT"
        if [ $NEW_FILES -gt 0 ]; then
            echo "    New: $NEW_FILES"
            TOTAL_NEW_FILES=$((TOTAL_NEW_FILES + NEW_FILES))
        fi

        TOTAL_FILES=$((TOTAL_FILES + AFTER_COUNT))
    else
        echo -e "  ${RED}✗ Failed to copy files${NC}"
        ERRORS=$((ERRORS + 1))
    fi

    echo ""
done

# Summary
echo -e "${GREEN}=== Backup Summary ===${NC}"
echo "  Total projects: ${#PROJECTS[@]}"
echo "  Total files: $TOTAL_FILES"
echo "  New files: $TOTAL_NEW_FILES"
echo "  Errors: $ERRORS"

# Calculate total size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
echo "  Total size: $TOTAL_SIZE"

# Log backup event
echo "$TIMESTAMP - Backed up $TOTAL_FILES files across ${#PROJECTS[@]} projects ($TOTAL_SIZE)" >> "$BACKUP_DIR/backup.log"

# Run redaction if requested
if [ "$REDACT" = true ]; then
    echo ""
    echo -e "${BLUE}=== Running Redaction ===${NC}"

    # Check if Python 3 is available
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}✗ Python 3 not found. Skipping redaction.${NC}"
        echo "  Install Python 3 to use redaction feature."
    else
        # Check if Presidio is installed
        if python3 -c "import presidio_analyzer" 2>/dev/null; then
            echo -e "${GREEN}✓ Presidio installed${NC}"
            REDACT_CMD="python3"
        else
            echo -e "${YELLOW}⚠ Presidio not installed (falling back to regex-only mode)${NC}"
            echo "  For better detection: pip install -r scripts/redaction-requirements.txt"
            REDACT_CMD="python3"
        fi

        # Run redaction script
        cd "$(dirname "$BACKUP_DIR")" # Go to project root

        # Use .venv python if available, otherwise system python
        if [ -f ".venv/bin/python3" ]; then
            PYTHON_CMD=".venv/bin/python3"
        elif [ -f "venv/bin/python3" ]; then
            PYTHON_CMD="venv/bin/python3"
        else
            PYTHON_CMD="python3"
        fi

        $PYTHON_CMD scripts/redact-conversations.py

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Redaction complete${NC}"
        else
            echo -e "${RED}✗ Redaction failed${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi
fi

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All operations complete!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Completed with $ERRORS errors${NC}"
    exit 1
fi
