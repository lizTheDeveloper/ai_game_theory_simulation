#!/bin/bash
# Disk Space Audit: Identify what's consuming disk space
# Run this on VM to diagnose storage issues

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="/tmp/disk_audit_${TIMESTAMP}.txt"

# Detect environment
IS_VM=false
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  IS_VM=true
  PROJECT_ROOT="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
else
  PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi

{
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💾 Disk Space Audit - $(date)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Environment: $([ "$IS_VM" = "true" ] && echo "VM" || echo "Mac")"
  echo "Project root: $PROJECT_ROOT"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Overall Disk Usage"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  df -h
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 Root Directory Usage (Top 20)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  du -sh /* 2>/dev/null | sort -rh | head -20 || echo "Cannot access root directories"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📁 Project Directory Usage"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  if [ -d "$PROJECT_ROOT" ]; then
    echo "Total project size:"
    du -sh "$PROJECT_ROOT" 2>/dev/null || echo "Cannot calculate"
    echo ""
    echo "Top 30 directories/files in project:"
    du -ah "$PROJECT_ROOT" 2>/dev/null | sort -rh | head -30
  else
    echo "Project directory not found: $PROJECT_ROOT"
  fi
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📋 Log Files"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  if [ -d "$PROJECT_ROOT/logs" ]; then
    echo "Total logs size:"
    du -sh "$PROJECT_ROOT/logs" 2>/dev/null || echo "Cannot calculate"
    echo ""
    echo "Log subdirectories:"
    du -sh "$PROJECT_ROOT/logs"/* 2>/dev/null | sort -rh
    echo ""
    echo "Largest log files:"
    find "$PROJECT_ROOT/logs" -type f -exec du -h {} \; 2>/dev/null | sort -rh | head -20
  else
    echo "No logs directory found"
  fi
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🗂️  Node Modules"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  if [ -d "$PROJECT_ROOT/node_modules" ]; then
    echo "Total node_modules size:"
    du -sh "$PROJECT_ROOT/node_modules" 2>/dev/null || echo "Cannot calculate"
  else
    echo "No node_modules directory found"
  fi
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔧 Git Repository"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  if [ -d "$PROJECT_ROOT/.git" ]; then
    echo "Total .git size:"
    du -sh "$PROJECT_ROOT/.git" 2>/dev/null || echo "Cannot calculate"
    echo ""
    echo "Git object count:"
    find "$PROJECT_ROOT/.git/objects" -type f 2>/dev/null | wc -l
    echo ""
    echo ".git subdirectories:"
    du -sh "$PROJECT_ROOT/.git"/* 2>/dev/null | sort -rh | head -10
  else
    echo "Not a git repository"
  fi
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🗄️  Temporary Files"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "/tmp usage:"
  du -sh /tmp 2>/dev/null || echo "Cannot access /tmp"
  echo ""
  echo "Largest files in /tmp:"
  find /tmp -type f -exec du -h {} \; 2>/dev/null | sort -rh | head -10 || echo "Cannot access /tmp"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🏠 Home Directory"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  if [ "$IS_VM" = "true" ]; then
    HOME_DIR="/home/lizthedeveloper_gmail_com"
  else
    HOME_DIR="$HOME"
  fi
  echo "Home directory: $HOME_DIR"
  echo "Total size:"
  du -sh "$HOME_DIR" 2>/dev/null || echo "Cannot calculate"
  echo ""
  echo "Top directories in home:"
  du -sh "$HOME_DIR"/* 2>/dev/null | sort -rh | head -20 || echo "Cannot access home directories"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "💡 Recommendations"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Calculate sizes if possible
  LOGS_SIZE=$(du -sm "$PROJECT_ROOT/logs" 2>/dev/null | cut -f1 || echo "0")
  GIT_SIZE=$(du -sm "$PROJECT_ROOT/.git" 2>/dev/null | cut -f1 || echo "0")
  NODE_SIZE=$(du -sm "$PROJECT_ROOT/node_modules" 2>/dev/null | cut -f1 || echo "0")

  echo "Quick wins to free up space:"
  echo ""

  if [ "$LOGS_SIZE" -gt 100 ]; then
    echo "📋 LOGS: ${LOGS_SIZE}MB - Consider:"
    echo "   - Archive old logs: tar -czf logs_archive_$(date +%Y%m).tar.gz logs/"
    echo "   - Delete old logs: find logs/ -type f -mtime +30 -delete"
    echo "   - Compress logs: gzip logs/**/*.log"
    echo ""
  fi

  if [ "$GIT_SIZE" -gt 500 ]; then
    echo "🔧 GIT: ${GIT_SIZE}MB - Consider:"
    echo "   - Garbage collection: git gc --aggressive --prune=now"
    echo "   - Clean unreachable objects: git prune"
    echo ""
  fi

  if [ "$NODE_SIZE" -gt 500 ]; then
    echo "🗂️  NODE_MODULES: ${NODE_SIZE}MB - Consider:"
    echo "   - Clean cache: npm cache clean --force"
    echo "   - Reinstall: rm -rf node_modules && npm install --production"
    echo ""
  fi

  echo "🔍 System-wide cleanup (requires sudo):"
  echo "   - Clean package cache: sudo apt-get clean"
  echo "   - Remove old kernels: sudo apt-get autoremove"
  echo "   - Clean journal logs: sudo journalctl --vacuum-time=7d"
  echo ""

  echo "📦 Long-term solutions:"
  echo "   - Resize VM disk (requires cloud provider tools)"
  echo "   - Add additional storage volume"
  echo "   - Move to larger VM instance"
  echo "   - Archive old data to external storage"
  echo ""

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Summary"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Project breakdown:"
  echo "  Logs:         ${LOGS_SIZE}MB"
  echo "  Git:          ${GIT_SIZE}MB"
  echo "  Node modules: ${NODE_SIZE}MB"
  echo ""
  TOTAL_IDENTIFIABLE=$((LOGS_SIZE + GIT_SIZE + NODE_SIZE))
  echo "  Identifiable: ${TOTAL_IDENTIFIABLE}MB"
  echo ""

} | tee "$REPORT_FILE"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Audit complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Report saved to: $REPORT_FILE"
echo ""
echo "To share this report:"
echo "  cat $REPORT_FILE"
echo ""
