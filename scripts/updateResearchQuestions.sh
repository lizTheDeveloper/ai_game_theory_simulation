#!/bin/bash
#
# Automated Research Question Update Script
#
# This script:
# 1. Backs up Claude Code conversation history
# 2. Extracts research questions from conversations
# 3. Updates the wiki documentation
#
# Designed to be run by launchd on a schedule (daily/weekly)

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Log file
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/research-questions-update.log"

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "[$TIMESTAMP] Starting research question update..." >> "$LOG_FILE"

# Step 1: Backup conversations
echo "[$TIMESTAMP] Backing up conversations..." >> "$LOG_FILE"
cd "$PROJECT_DIR"
bash claude-conversations/backup-conversations.sh >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
    echo "[$TIMESTAMP] ERROR: Conversation backup failed" >> "$LOG_FILE"
    exit 1
fi

# Step 2: Extract research questions
echo "[$TIMESTAMP] Extracting research questions..." >> "$LOG_FILE"
npx tsx scripts/extractResearchQuestions.ts > docs/wiki/RESEARCH_QUESTIONS.md 2>> "$LOG_FILE"

if [ $? -ne 0 ]; then
    echo "[$TIMESTAMP] ERROR: Question extraction failed" >> "$LOG_FILE"
    exit 1
fi

# Count questions extracted
QUESTION_COUNT=$(grep -c "^-" docs/wiki/RESEARCH_QUESTIONS.md 2>/dev/null || echo "0")

echo "[$TIMESTAMP] Successfully extracted $QUESTION_COUNT questions" >> "$LOG_FILE"
echo "[$TIMESTAMP] Research question update complete" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
