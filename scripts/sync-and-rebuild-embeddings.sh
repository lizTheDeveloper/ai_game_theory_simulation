#!/bin/bash
#
# Master script to sync all YouTube channels, rebuild embeddings, and update SQLite database
# Designed to run via launchd at 2:00 AM daily
#

set -e  # Exit on error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Output file for logging
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$PROJECT_ROOT/logs/sync-embeddings_$TIMESTAMP.log"

# Ensure logs directory exists
mkdir -p "$PROJECT_ROOT/logs"

echo "========================================" | tee -a "$LOG_FILE"
echo "YouTube Transcript Sync & Rebuild" | tee -a "$LOG_FILE"
echo "Started: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Step 1: Sync all YouTube channels
echo "Step 1: Syncing YouTube channels..." | tee -a "$LOG_FILE"
cd "$PROJECT_ROOT/research/youtube-channels"

if [ -f "auto-sync.sh" ]; then
    bash auto-sync.sh 2>&1 | tee -a "$LOG_FILE"
    echo "✓ Channel sync complete" | tee -a "$LOG_FILE"
else
    echo "❌ Error: auto-sync.sh not found" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Step 2: Count transcripts
echo "Step 2: Counting transcripts..." | tee -a "$LOG_FILE"
TRANSCRIPT_COUNT=$(find "$PROJECT_ROOT/research" -name "*.vtt" -type f | wc -l | xargs)
echo "  Found $TRANSCRIPT_COUNT transcript files" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Step 3: Activate Python virtual environment
echo "Step 3: Activating Python environment..." | tee -a "$LOG_FILE"
cd "$PROJECT_ROOT"

if [ ! -d ".venv" ]; then
    echo "❌ Error: Virtual environment not found at .venv" | tee -a "$LOG_FILE"
    echo "   Run: python3 -m venv .venv && source .venv/bin/activate && pip install faiss-cpu sentence-transformers numpy" | tee -a "$LOG_FILE"
    exit 1
fi

source .venv/bin/activate
echo "✓ Virtual environment activated" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Step 4: Rebuild FAISS index with SQLite
echo "Step 4: Rebuilding FAISS index and SQLite database..." | tee -a "$LOG_FILE"
echo "  This may take 5-10 minutes depending on transcript count..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

python "$SCRIPT_DIR/build-transcript-embeddings-sqlite.py" 2>&1 | tee -a "$LOG_FILE"

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "✓ Index rebuild complete" | tee -a "$LOG_FILE"
else
    echo "" | tee -a "$LOG_FILE"
    echo "❌ Error: Index rebuild failed" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Step 5: Verify database
echo "Step 5: Verifying database..." | tee -a "$LOG_FILE"
DB_PATH="$PROJECT_ROOT/research/embeddings/transcripts.db"

if [ -f "$DB_PATH" ]; then
    VIDEO_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM videos;")
    CHUNK_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM chunks;")

    echo "  Database: $DB_PATH" | tee -a "$LOG_FILE"
    echo "  Videos: $VIDEO_COUNT" | tee -a "$LOG_FILE"
    echo "  Chunks: $CHUNK_COUNT" | tee -a "$LOG_FILE"
    echo "✓ Database verified" | tee -a "$LOG_FILE"
else
    echo "❌ Error: Database not found at $DB_PATH" | tee -a "$LOG_FILE"
    exit 1
fi

echo "" | tee -a "$LOG_FILE"

# Step 6: Summary
echo "========================================" | tee -a "$LOG_FILE"
echo "Sync Complete!" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Completed: $(date)" | tee -a "$LOG_FILE"
echo "Transcripts: $TRANSCRIPT_COUNT files" | tee -a "$LOG_FILE"
echo "Videos indexed: $VIDEO_COUNT" | tee -a "$LOG_FILE"
echo "Chunks created: $CHUNK_COUNT" | tee -a "$LOG_FILE"
echo "Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Deactivate virtual environment
deactivate

echo "✓ All done!" | tee -a "$LOG_FILE"
