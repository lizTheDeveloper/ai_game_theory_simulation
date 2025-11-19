#!/bin/bash
# Batch merge script with automatic conflict resolution

# Auto-generated files that should always use --theirs
AUTO_FILES=(
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

# Merge a branch and auto-resolve conflicts
merge_branch() {
  local branch="$1"
  echo "=== Merging $branch ==="

  if git merge "$branch" --no-edit 2>&1; then
    echo "✅ Merged cleanly"
    return 0
  fi

  # Check for conflicts
  conflicted=$(git status --short | grep "^UU" | awk '{print $2}')

  if [ -z "$conflicted" ]; then
    echo "✅ Merged successfully"
    return 0
  fi

  echo "⚠️  Conflicts in: $conflicted"

  # Auto-resolve common files
  for file in $conflicted; do
    if printf '%s\n' "${AUTO_FILES[@]}" | grep -q "^$file$"; then
      echo "  Auto-resolving $file with --theirs"
      git checkout --theirs "$file"
      git add "$file"
    else
      echo "  ❌ Manual resolution needed for $file"
      return 1
    fi
  done

  # Commit if all resolved
  if git commit --no-edit 2>/dev/null; then
    echo "✅ Conflicts resolved and committed"
    return 0
  else
    echo "❌ Could not commit - manual intervention needed"
    return 1
  fi
}

# Export function for use
export -f merge_branch
