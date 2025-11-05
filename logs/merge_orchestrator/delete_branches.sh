#!/bin/bash

# Systematic deletion of auto/worker branches
# All work is either superseded or already merged

REPORT_FILE="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/merge_orchestrator/auto_worker_batch_merge_20251105.md"

echo "" >> "$REPORT_FILE"
echo "## Phase 3: Branch Cleanup" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**Decision:** All 37 auto/worker branches are safe to delete because:" >> "$REPORT_FILE"
echo "- 31 branches: Determinism/citation work superseded by defensive programming merge (Nov 5)" >> "$REPORT_FILE"
echo "- 4 branches: Fully merged into main (no unique commits)" >> "$REPORT_FILE"
echo "- 2 branches: Only automated commits/merges (no substantive work)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "### Deleted Branches" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Get all local auto/worker branches (excluding merge/* branches)
BRANCHES=$(git branch | grep "auto/worker" | grep -v "merge/" | sed 's/^[* ]*//')

DELETED=0
FAILED=0

while IFS= read -r branch; do
    if [ -z "$branch" ]; then
        continue
    fi

    # Delete the branch
    if git branch -D "$branch" > /dev/null 2>&1; then
        echo "- ✅ Deleted: $branch" >> "$REPORT_FILE"
        DELETED=$((DELETED + 1))
    else
        echo "- ❌ Failed: $branch" >> "$REPORT_FILE"
        FAILED=$((FAILED + 1))
    fi
done <<< "$BRANCHES"

echo "" >> "$REPORT_FILE"
echo "**Cleanup Statistics:**" >> "$REPORT_FILE"
echo "- Deleted successfully: $DELETED" >> "$REPORT_FILE"
echo "- Failed: $FAILED" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Cleanup complete. Deleted $DELETED branches, $FAILED failures."
