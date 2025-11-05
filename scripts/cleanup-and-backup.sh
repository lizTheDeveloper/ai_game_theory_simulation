#!/bin/bash
# Cleanup and Backup: Archive logs to GCS, prune merged branches, free space
# Run this on VM to free up significant disk space

set -e

# Configuration
IS_VM=false
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
  PROJECT_ROOT="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
else
  PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

GCS_BUCKET="gs://multiverseschool-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

cd "$PROJECT_ROOT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 VM Cleanup & Backup - $TIMESTAMP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

INITIAL_USAGE=$(df -h . | awk 'NR==2 {print $5}')
echo "Initial disk usage: $INITIAL_USAGE"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. Archive logs to GCS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 1: Archiving logs to GCS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v gsutil >/dev/null 2>&1; then
  LOGS_SIZE=$(du -sm logs/ 2>/dev/null | cut -f1 || echo "0")
  echo "Current logs size: ${LOGS_SIZE}MB"
  echo ""

  # Create timestamped archive in GCS
  ARCHIVE_PATH="${GCS_BUCKET}/archives/${TIMESTAMP}/"

  echo "Uploading logs to ${ARCHIVE_PATH}..."
  if gsutil -m rsync -r logs/ "${ARCHIVE_PATH}" 2>&1; then
    echo "✅ Logs backed up to GCS: ${ARCHIVE_PATH}"

    # Compress and keep locally for 7 days
    echo "Compressing old logs (>7 days)..."
    find logs/ -name "*.log" -type f -mtime +7 ! -name "*.gz" -exec gzip {} \; 2>/dev/null || true

    # Delete very old logs (>30 days) now that they're in GCS
    echo "Deleting logs older than 30 days (backed up to GCS)..."
    DELETED=$(find logs/ -type f -mtime +30 -delete -print 2>/dev/null | wc -l || echo "0")
    echo "✅ Deleted $DELETED old log files"
  else
    echo "⚠️  GCS upload failed - keeping all local logs"
  fi
else
  echo "⚠️  gsutil not found - skipping GCS backup"
  echo "💡 Install with: curl https://sdk.cloud.google.com | bash"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. Prune merged git branches
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌿 Step 2: Pruning merged git branches"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GIT_SIZE_BEFORE=$(du -sm .git 2>/dev/null | cut -f1 || echo "0")
echo "Git repo size: ${GIT_SIZE_BEFORE}MB"

# Update remote refs
echo "Fetching latest from origin..."
git fetch --prune origin 2>&1 || true

# Count branches
LOCAL_BRANCHES=$(git branch | wc -l)
REMOTE_BRANCHES=$(git branch -r | wc -l)
echo "Local branches: $LOCAL_BRANCHES"
echo "Remote branches: $REMOTE_BRANCHES"
echo ""

# Find merged branches
echo "Finding merged branches..."
MERGED_BRANCHES=$(git branch --merged main | grep -v "^\*" | grep -v "main" | grep -v "master" || true)
MERGED_COUNT=$(echo "$MERGED_BRANCHES" | grep -c . || echo "0")

if [ "$MERGED_COUNT" -gt 0 ]; then
  echo "Found $MERGED_COUNT merged branches:"
  echo "$MERGED_BRANCHES" | head -10
  [ "$MERGED_COUNT" -gt 10 ] && echo "... and $((MERGED_COUNT - 10)) more"
  echo ""

  echo "Deleting merged local branches..."
  echo "$MERGED_BRANCHES" | xargs -r git branch -d 2>&1 || true
  echo "✅ Deleted $MERGED_COUNT merged local branches"
else
  echo "ℹ️  No merged branches to delete"
fi

echo ""

# Delete remote tracking branches that no longer exist
echo "Cleaning up stale remote tracking branches..."
git remote prune origin 2>&1 || true
echo "✅ Pruned stale remote branches"

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. Git garbage collection
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 3: Git garbage collection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Running git gc --aggressive..."
git gc --aggressive --prune=now 2>&1 || true

echo "Pruning unreachable objects..."
git prune --expire=now 2>&1 || true

GIT_SIZE_AFTER=$(du -sm .git 2>/dev/null | cut -f1 || echo "0")
GIT_FREED=$((GIT_SIZE_BEFORE - GIT_SIZE_AFTER))

echo "✅ Git cleaned"
echo "   Before: ${GIT_SIZE_BEFORE}MB"
echo "   After:  ${GIT_SIZE_AFTER}MB"
echo "   Freed:  ${GIT_FREED}MB"

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Summary
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Cleanup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FINAL_USAGE=$(df -h . | awk 'NR==2 {print $5}')
echo "Disk usage:"
echo "  Before: $INITIAL_USAGE"
echo "  After:  $FINAL_USAGE"
echo ""

LOCAL_BRANCHES_AFTER=$(git branch | wc -l)
REMOTE_BRANCHES_AFTER=$(git branch -r | wc -l)

echo "Git branches:"
echo "  Local:  $LOCAL_BRANCHES → $LOCAL_BRANCHES_AFTER (deleted $((LOCAL_BRANCHES - LOCAL_BRANCHES_AFTER)))"
echo "  Remote: $REMOTE_BRANCHES → $REMOTE_BRANCHES_AFTER"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "GCS archive: ${ARCHIVE_PATH}"
echo ""
