#!/bin/bash
# Auto-fix cron authentication for Claude Code
# Adds HOME variable to crontab so Claude can access session

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing Claude Code Authentication in Cron"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detect environment
if [ -d "/home/lizthedeveloper_gmail_com" ]; then
  HOME_DIR="/home/lizthedeveloper_gmail_com"
  echo "✅ Running on VM"
else
  HOME_DIR="$HOME"
  echo "✅ Running on Mac (will simulate)"
fi

echo "Home directory: $HOME_DIR"
echo ""

# Get current crontab
TEMP_CRON=$(mktemp)
crontab -l > "$TEMP_CRON" 2>/dev/null || touch "$TEMP_CRON"

# Check if HOME is already set
if grep -q "^HOME=" "$TEMP_CRON"; then
  echo "✅ HOME already set in crontab"
  CURRENT_HOME=$(grep "^HOME=" "$TEMP_CRON" | head -1)
  echo "   Current value: $CURRENT_HOME"

  if grep -q "^HOME=$HOME_DIR" "$TEMP_CRON"; then
    echo "✅ HOME is correctly set to $HOME_DIR"
    echo "   No changes needed!"
    rm "$TEMP_CRON"
    exit 0
  else
    echo "⚠️  HOME is set but to wrong directory"
    echo "   Updating..."
    # Remove old HOME line
    grep -v "^HOME=" "$TEMP_CRON" > "${TEMP_CRON}.new"
    mv "${TEMP_CRON}.new" "$TEMP_CRON"
  fi
fi

# Add HOME as first line
echo "🔧 Adding HOME=$HOME_DIR to crontab..."
{
  echo "HOME=$HOME_DIR"
  echo ""
  cat "$TEMP_CRON"
} > "${TEMP_CRON}.new"

# Install new crontab
crontab "${TEMP_CRON}.new"
rm "$TEMP_CRON" "${TEMP_CRON}.new"

echo "✅ Crontab updated successfully!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Updated Crontab (first 10 lines):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
crontab -l | head -10
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fix Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Wait for next merge orchestrator run (at :45)"
echo "2. Check logs: tail -f logs/merge_orchestrator/merge_*.log"
echo "3. Look for: '✅ Working tree cleaned by Claude Code'"
echo ""
