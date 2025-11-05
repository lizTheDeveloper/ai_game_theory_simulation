#!/bin/bash

# Systematic analysis of auto/worker branches
# Output: categorization of branches by merge status

REPORT_FILE="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/merge_orchestrator/auto_worker_batch_merge_20251105.md"

echo "# Auto/Worker Branch Merge Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "## Phase 1: Branch Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Get all local auto/worker branches (excluding merge/* branches)
BRANCHES=$(git branch | grep "auto/worker" | grep -v "merge/" | sed 's/^[* ]*//' | sort -r)

TOTAL=0
EMPTY=0
HAS_WORK=0

echo "### Branch Status" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

while IFS= read -r branch; do
    if [ -z "$branch" ]; then
        continue
    fi

    TOTAL=$((TOTAL + 1))

    # Check for unique commits
    COMMIT_COUNT=$(git log main.."$branch" --oneline 2>/dev/null | wc -l)

    if [ "$COMMIT_COUNT" -eq 0 ]; then
        echo "- **$branch**: ✅ Fully merged (0 unique commits)" >> "$REPORT_FILE"
        EMPTY=$((EMPTY + 1))
    else
        echo "- **$branch**: 🔍 Has $COMMIT_COUNT unique commit(s)" >> "$REPORT_FILE"
        HAS_WORK=$((HAS_WORK + 1))

        # Show commit subjects
        echo "  - Commits:" >> "$REPORT_FILE"
        git log main.."$branch" --oneline --pretty=format:"    - %s" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi
done <<< "$BRANCHES"

echo "" >> "$REPORT_FILE"
echo "### Summary Statistics" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Total branches analyzed:** $TOTAL" >> "$REPORT_FILE"
echo "- **Fully merged (can delete):** $EMPTY" >> "$REPORT_FILE"
echo "- **Has unique work (needs review):** $HAS_WORK" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Analysis complete. Report saved to $REPORT_FILE"
