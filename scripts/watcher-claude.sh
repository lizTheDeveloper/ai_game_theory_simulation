#!/bin/bash
# Watcher - Claude Code Agent
# Monitors workers and merge orchestrator, fixes issues

set -e
cd ~/ai_game_theory_simulation

echo "╔═══════════════════════════════════════════════════════╗"
echo "║       👁️ WATCHER (Claude Code Agent)                 ║"
echo "╚═══════════════════════════════════════════════════════╝"

# Gather status info
WORKER_ERRORS=$(tail -100 logs/cron_worker.log 2>/dev/null | grep -c "❌\|error\|fail" || echo 0)
MERGE_ERRORS=$(tail -100 logs/cron_merge.log 2>/dev/null | grep -c "BLOCKED\|❌\|error" || echo 0)
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || echo 0)
PENDING_BRANCHES=$(git branch -r | grep -c 'origin/auto/' || echo 0)

echo "📊 Status:"
echo "   Worker errors (last 100 lines): $WORKER_ERRORS"
echo "   Merge errors (last 100 lines): $MERGE_ERRORS"
echo "   TypeScript errors: $TS_ERRORS"
echo "   Pending branches: $PENDING_BRANCHES"

# If there are issues, let Claude fix them
if [ "$TS_ERRORS" -gt 0 ] || [ "$MERGE_ERRORS" -gt 10 ]; then
  echo "🔧 Issues detected - invoking Claude to fix..."
  
  timeout 1800 claude --dangerously-skip-permissions << PROMPT
You are the watcher agent. Issues have been detected that are blocking the autonomous system.

## Current Status:
- TypeScript errors: $TS_ERRORS
- Merge blocked count: $MERGE_ERRORS  
- Pending branches: $PENDING_BRANCHES

## Your job:
1. Run \`npx tsc --noEmit\` to see the TypeScript errors
2. FIX all the TypeScript errors in the codebase
3. Commit your fixes with message "fix: Resolve TypeScript errors blocking merges"
4. Push to main

## Common fixes needed:
- Missing imports (add \`import { describe, it, expect } from 'vitest'\`)
- Type mismatches (fix the types)
- Unknown type errors (add proper type annotations)

Be thorough - fix ALL errors so the merge orchestrator can proceed.
PROMPT

  echo "✅ Watcher remediation complete"
else
  echo "✅ System healthy - no intervention needed"
fi
