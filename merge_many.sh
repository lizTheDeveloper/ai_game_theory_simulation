#!/bin/bash
# Merge many branches sequentially with auto-conflict resolution

BRANCHES=(
  "origin/auto/researcher-20251115_163001"
  "origin/auto/researcher-20251115_173001"
  "origin/auto/researcher-20251115_183001"
  "origin/auto/researcher-20251115_193001"
  "origin/auto/researcher-20251115_203001"
  "origin/auto/researcher-20251115_213002"
)

# Auto-resolve files
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
FAILED=0

for branch in "${BRANCHES[@]}"; do
  echo "=== Merging $branch ==="

  if git merge "$branch" --no-edit 2>&1; then
    echo "✅ Clean merge"
    ((MERGED++))
    continue
  fi

  # Get conflicted files
  conflicts=$(git status --short | grep "^UU" | awk '{print $2}')

  if [ -z "$conflicts" ]; then
    echo "✅ Merged"
    ((MERGED++))
    continue
  fi

  echo "⚠️  Conflicts: $(echo $conflicts | tr '\n' ' ')"

  # Try auto-resolve
  all_resolved=true
  for file in $conflicts; do
    should_auto=false
    for auto_file in "${AUTO_RESOLVE[@]}"; do
      if [ "$file" = "$auto_file" ] || echo "$file" | grep -q "^research/"; then
        should_auto=true
        break
      fi
    done

    if [ "$should_auto" = true ]; then
      echo "  → Auto-resolving $file"
      git checkout --theirs "$file" && git add "$file"
    else
      echo "  ❌ Manual resolution needed: $file"
      all_resolved=false
    fi
  done

  if [ "$all_resolved" = true ]; then
    if git commit --no-edit 2>&1; then
      echo "✅ Resolved and committed"
      ((MERGED++))
    else
      echo "❌ Commit failed"
      ((FAILED++))
      break
    fi
  else
    echo "❌ Manual intervention required"
    ((FAILED++))
    break
  fi
done

echo ""
echo "========================================"
echo "Summary: $MERGED merged, $FAILED failed"
echo "========================================"
