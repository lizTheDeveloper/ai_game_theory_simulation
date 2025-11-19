#!/bin/bash
# Merge all remaining auto/* branches

BRANCHES=(
  "origin/auto/worker-20251113_110001"
  "origin/auto/worker-20251113_130001"
  "origin/auto/worker-20251113_140001"
  "origin/auto/worker-20251113_150001"
  "origin/auto/worker-20251113_160001"
  "origin/auto/worker-20251113_170001"
  "origin/auto/worker-20251113_190001"
  "origin/auto/worker-20251113_200001"
  "origin/auto/worker-20251113_210001"
  "origin/auto/worker-20251114_013001"
  "origin/auto/worker-20251114_023001"
  "origin/auto/worker-20251114_040000"
  "origin/auto/worker-20251114_043001"
  "origin/auto/worker-20251114_060001"
  "origin/auto/worker-20251114_063001"
  "origin/auto/researcher-20251116_123001"
  "origin/auto/researcher-20251116_133001"
  "origin/auto/researcher-20251116_143001"
)

AUTO_RESOLVE=(
  ".autonomous-worker.lock"
  ".researcher-worker.lock"
  "docs/underdocumented.json"
  "docs/function-doc-patches.json"
  "docs/wiki/README.md"
  "docs/wiki/RECENT_CHANGES.md"
  "docs/wiki/BIBLIOGRAPHY.md"
  "plans/MASTER_IMPLEMENTATION_ROADMAP.md"
  "plans/SIMULATION_ROADMAP.md"
  "research/UPDATE_QUEUE.md"
  "logs/autonomous/researcher/status_current.txt"
)

MERGED=0
MANUAL=0

for branch in "${BRANCHES[@]}"; do
  echo "=== [$((MERGED+MANUAL+1))/${#BRANCHES[@]}] $branch ==="

  if git merge "$branch" --no-edit > /dev/null 2>&1; then
    echo "✅ Clean merge"
    ((MERGED++))
    continue
  fi

  conflicts=$(git status --short | grep "^UU" | awk '{print $2}')

  if [ -z "$conflicts" ]; then
    ((MERGED++))
    continue
  fi

  all_auto=true
  for file in $conflicts; do
    is_auto=false
    for auto in "${AUTO_RESOLVE[@]}"; do
      if [ "$file" = "$auto" ]; then
        is_auto=true
        break
      fi
    done

    if echo "$file" | grep -qE "^research/|^reviews/|^reports/"; then
      is_auto=true
    fi

    if [ "$is_auto" = true ]; then
      git checkout --theirs "$file" > /dev/null 2>&1
      git add "$file" > /dev/null 2>&1
    else
      echo "❌ MANUAL: $file"
      all_auto=false
      ((MANUAL++))
      break 2
    fi
  done

  if [ "$all_auto" = true ]; then
    if git commit --no-edit > /dev/null 2>&1; then
      echo "✅ Auto-resolved"
      ((MERGED++))
    else
      echo "❌ Commit failed"
      ((MANUAL++))
      break
    fi
  fi
done

echo ""
echo "========================================"
echo "✅ Merged: $MERGED"
echo "❌ Manual: $MANUAL"
echo "========================================"
