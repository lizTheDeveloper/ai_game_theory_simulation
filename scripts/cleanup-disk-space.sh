#!/bin/bash
# Disk Space Cleanup: Safe cleanup operations for VM
# Run this to free up space before resizing/migrating

set -e

# Detect environment
IS_VM=false
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
  PROJECT_ROOT="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
else
  PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Disk Space Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This will perform SAFE cleanup operations."
echo "No source code or important data will be deleted."
echo ""
echo "⚠️  WARNING: This will delete old logs and temporary files!"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

cd "$PROJECT_ROOT"

echo ""
echo "Starting cleanup..."
echo ""

INITIAL_USAGE=$(df -h . | awk 'NR==2 {print $5}')
echo "Initial disk usage: $INITIAL_USAGE"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. Archive old logs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Archiving old logs (>30 days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d logs/ ]; then
  mkdir -p logs/archive

  # Find and archive old log files
  OLD_LOGS=$(find logs/ -name "*.log" -type f -mtime +30 2>/dev/null | wc -l || echo "0")

  if [ "$OLD_LOGS" -gt 0 ]; then
    echo "Found $OLD_LOGS old log files"
    ARCHIVE_NAME="logs/archive/logs_$(date +%Y%m%d_%H%M%S).tar.gz"
    find logs/ -name "*.log" -type f -mtime +30 -print0 2>/dev/null | tar -czf "$ARCHIVE_NAME" --null -T - 2>/dev/null || echo "Failed to create archive"

    if [ -f "$ARCHIVE_NAME" ]; then
      ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
      echo "✅ Created archive: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

      # Delete archived files
      find logs/ -name "*.log" -type f -mtime +30 -delete 2>/dev/null || echo "Failed to delete some files"
      echo "✅ Deleted archived log files"
    else
      echo "⚠️  Failed to create archive, skipping deletion"
    fi
  else
    echo "ℹ️  No old logs found (>30 days)"
  fi
else
  echo "ℹ️  No logs directory"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. Compress recent logs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 2: Compressing recent logs (7-30 days)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d logs/ ]; then
  COMPRESSIBLE=$(find logs/ -name "*.log" -type f -mtime +7 ! -name "*.gz" 2>/dev/null | wc -l || echo "0")

  if [ "$COMPRESSIBLE" -gt 0 ]; then
    echo "Compressing $COMPRESSIBLE log files..."
    find logs/ -name "*.log" -type f -mtime +7 ! -name "*.gz" -exec gzip {} \; 2>/dev/null || echo "Some files failed to compress"
    echo "✅ Compressed recent logs"
  else
    echo "ℹ️  No compressible logs found"
  fi
else
  echo "ℹ️  No logs directory"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. Clean temporary files
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗑️  Step 3: Cleaning temporary files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean /tmp (carefully)
TMP_SIZE_BEFORE=$(du -sm /tmp 2>/dev/null | cut -f1 || echo "0")
find /tmp -type f -mtime +7 -delete 2>/dev/null || echo "Some temp files couldn't be deleted"
TMP_SIZE_AFTER=$(du -sm /tmp 2>/dev/null | cut -f1 || echo "0")
TMP_FREED=$((TMP_SIZE_BEFORE - TMP_SIZE_AFTER))
echo "✅ Freed ${TMP_FREED}MB from /tmp"

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. Git cleanup
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Step 4: Git garbage collection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d .git ]; then
  GIT_SIZE_BEFORE=$(du -sm .git 2>/dev/null | cut -f1 || echo "0")

  echo "Running git gc..."
  git gc --aggressive --prune=now 2>&1 || echo "Git gc failed"

  echo "Pruning unreachable objects..."
  git prune 2>&1 || echo "Git prune failed"

  GIT_SIZE_AFTER=$(du -sm .git 2>/dev/null | cut -f1 || echo "0")
  GIT_FREED=$((GIT_SIZE_BEFORE - GIT_SIZE_AFTER))
  echo "✅ Freed ${GIT_FREED}MB from .git"
else
  echo "ℹ️  Not a git repository"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. NPM cache cleanup
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 5: Cleaning NPM cache"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v npm >/dev/null 2>&1; then
  npm cache clean --force 2>&1 || echo "NPM cache clean failed"
  echo "✅ NPM cache cleaned"
else
  echo "ℹ️  NPM not installed"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. System cleanup (if sudo available)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧽 Step 6: System cleanup (requires sudo)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if sudo -n true 2>/dev/null; then
  echo "Cleaning package cache..."
  sudo apt-get clean 2>&1 || echo "apt-get clean failed"

  echo "Removing unused packages..."
  sudo apt-get autoremove -y 2>&1 || echo "apt-get autoremove failed"

  echo "Cleaning journal logs (keeping 7 days)..."
  sudo journalctl --vacuum-time=7d 2>&1 || echo "journalctl vacuum failed"

  echo "✅ System cleanup complete"
else
  echo "⚠️  Skipping (sudo not available)"
  echo "💡 Run manually:"
  echo "   sudo apt-get clean"
  echo "   sudo apt-get autoremove"
  echo "   sudo journalctl --vacuum-time=7d"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Summary
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Cleanup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FINAL_USAGE=$(df -h . | awk 'NR==2 {print $5}')
echo "Initial usage: $INITIAL_USAGE"
echo "Final usage:   $FINAL_USAGE"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "💡 If you still need more space:"
echo "   1. Review disk audit: ./scripts/disk-space-audit.sh"
echo "   2. Consider VM resize or migration"
echo "   3. Archive logs/ to external storage"
echo ""
