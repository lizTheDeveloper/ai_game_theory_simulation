#!/bin/bash

# Analyze auto/worker branches for truly unique work
# Check if branches have commits that aren't functionally equivalent to what's in main

REPORT_FILE="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/merge_orchestrator/unique_work_analysis.md"

echo "# Unique Work Analysis for Auto/Worker Branches" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "## Methodology" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "For each branch with unique commits, checking:" >> "$REPORT_FILE"
echo "1. Are commits related to determinism fixes (Math.random → rng)?" >> "$REPORT_FILE"
echo "2. Are commits related to citation corrections?" >> "$REPORT_FILE"
echo "3. Are commits only auto-commits/merges?" >> "$REPORT_FILE"
echo "4. Are there any truly unique features/fixes?" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Get branches with work (excluding fully merged ones)
BRANCHES=$(git branch | grep "auto/worker" | grep -v "merge/" | sed 's/^[* ]*//' | sort -r)

echo "## Branch Analysis" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

while IFS= read -r branch; do
    if [ -z "$branch" ]; then
        continue
    fi

    COMMIT_COUNT=$(git log main.."$branch" --oneline 2>/dev/null | wc -l)

    if [ "$COMMIT_COUNT" -eq 0 ]; then
        continue  # Skip fully merged branches
    fi

    echo "### $branch ($COMMIT_COUNT commits)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Check for specific types of work
    DETERMINISM_COMMITS=$(git log main.."$branch" --oneline --grep="determinism\|Math.random" 2>/dev/null | wc -l)
    CITATION_COMMITS=$(git log main.."$branch" --oneline --grep="citation" 2>/dev/null | wc -l)
    AUTO_COMMITS=$(git log main.."$branch" --oneline --grep="^chore: Auto-commit\|^chore: Add autonomous worker" 2>/dev/null | wc -l)
    MERGE_COMMITS=$(git log main.."$branch" --oneline --grep="^Merge" 2>/dev/null | wc -l)
    FEATURE_COMMITS=$(git log main.."$branch" --oneline --grep="^feat:\|^fix:" 2>/dev/null | wc -l)

    echo "**Commit breakdown:**" >> "$REPORT_FILE"
    echo "- Determinism-related: $DETERMINISM_COMMITS" >> "$REPORT_FILE"
    echo "- Citation-related: $CITATION_COMMITS" >> "$REPORT_FILE"
    echo "- Auto-commits: $AUTO_COMMITS" >> "$REPORT_FILE"
    echo "- Merge commits: $MERGE_COMMITS" >> "$REPORT_FILE"
    echo "- Feature/fix commits: $FEATURE_COMMITS" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Show feature/fix commits
    if [ "$FEATURE_COMMITS" -gt 0 ]; then
        echo "**Feature/fix commits:**" >> "$REPORT_FILE"
        git log main.."$branch" --oneline --grep="^feat:\|^fix:" --pretty=format:"- %s" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
    fi

    # Assessment
    AUTOMATED=$((AUTO_COMMITS + MERGE_COMMITS))
    if [ "$COMMIT_COUNT" -eq "$AUTOMATED" ]; then
        echo "**Assessment:** ✅ Only automated commits - safe to delete" >> "$REPORT_FILE"
    elif [ "$DETERMINISM_COMMITS" -gt 0 ] || [ "$CITATION_COMMITS" -gt 0 ]; then
        echo "**Assessment:** ⚠️ Contains determinism/citation work - likely superseded by defensive programming merge" >> "$REPORT_FILE"
    elif [ "$FEATURE_COMMITS" -gt 0 ]; then
        echo "**Assessment:** 🔍 Contains feature/fix work - needs manual review" >> "$REPORT_FILE"
    else
        echo "**Assessment:** ❓ Mixed work - needs investigation" >> "$REPORT_FILE"
    fi

    echo "" >> "$REPORT_FILE"
    echo "---" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

done <<< "$BRANCHES"

echo "" >> "$REPORT_FILE"
echo "## Recommendations" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "Based on this analysis:" >> "$REPORT_FILE"
echo "- Branches with ✅ assessment can be safely deleted" >> "$REPORT_FILE"
echo "- Branches with ⚠️ assessment are superseded by recent work (defensive programming merge)" >> "$REPORT_FILE"
echo "- Branches with 🔍 assessment need cherry-pick evaluation" >> "$REPORT_FILE"

echo "Analysis complete. Report saved to $REPORT_FILE"
