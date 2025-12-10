#!/bin/bash
# Merge Orchestrator - Claude Code Agent
# Actually fixes TypeScript errors instead of just failing
export PATH="$HOME/.local/bin:$PATH"

set -e
cd ~/ai_game_theory_simulation

# Lock check
LOCK_FILE="/tmp/merge-orchestrator.lock"
if [ -f "$LOCK_FILE" ]; then
  echo "⚠️  Already running"
  exit 0
fi
touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

echo "╔═══════════════════════════════════════════════════════╗"
echo "║     🔀 MERGE ORCHESTRATOR (Claude Code Agent)        ║"
echo "╚═══════════════════════════════════════════════════════╝"

git fetch origin

# Find branches to merge
BRANCHES=$(git branch -r | grep -E 'origin/auto/(worker|researcher)-' | head -10)
BRANCH_COUNT=$(echo "$BRANCHES" | grep -c 'auto/' || echo 0)

if [ "$BRANCH_COUNT" -eq 0 ]; then
  echo "✅ No branches to merge"
  exit 0
fi

echo "📋 Found $BRANCH_COUNT branches to process"

# Let Claude handle the merging and fixing
timeout 2700 claude --model sonnet --dangerously-skip-permissions << PROMPT
You are the merge orchestrator. Your job is to merge pending branches and FIX any issues.

## Branches to merge:
$BRANCHES

## Process:
1. For each branch, try to merge it into main
2. If there are TypeScript errors after merge, FIX THEM - don't just report
3. If there are test failures, FIX THEM
4. Commit your fixes and continue
5. Push successful merges to main

## Key rules:
- You ARE allowed to edit code to fix errors
- Fix imports, type errors, missing dependencies
- If a fix is complex, make a note but try your best
- Delete branches after successful merge: git push origin --delete <branch>

Start by checking git status and then process the branches one by one.
PROMPT

echo "✅ Merge orchestrator complete"
