#!/bin/bash
# Auto-deploy script - runs once on VM to fix cron auth
# This script deletes itself after running

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Only run on VM
if [ ! -d "/home/lizthedeveloper_gmail_com" ]; then
  echo "Not on VM - skipping auto-deploy"
  exit 0
fi

echo "🚀 Auto-deploying cron auth fix..."

# Run the fix
cd "$PROJECT_ROOT"
./scripts/fix-cron-auth.sh

# Log completion
echo "$(date): Cron auth fix deployed successfully" >> logs/auto_deploy.log

# Delete this auto-deploy script (one-time use)
rm -f "$0"

echo "✅ Auto-deploy complete (self-deleted)"
