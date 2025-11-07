#!/bin/bash
# Merge a branch, resolving log file conflicts by keeping them deleted

BRANCH=$1

if [ -z "$BRANCH" ]; then
  echo "Usage: $0 <branch-name>"
  exit 1
fi

echo "Merging $BRANCH..."

# Attempt merge
git merge "origin/$BRANCH" --no-edit -m "Merge $BRANCH (auto-resolved log conflicts)" || {
  echo "Conflicts detected, resolving..."

  # For all deleted log files, keep them deleted
  git status --short | grep "^DU" | awk '{print $2}' | while read file; do
    echo "  Keeping deleted: $file"
    git rm "$file"
  done

  # For all log files in conflicts, keep ours (main)
  git status --short | grep "\.log$" | awk '{print $2}' | while read file; do
    echo "  Resolving log conflict: $file"
    git checkout --ours "$file" 2>/dev/null || git rm "$file" 2>/dev/null
  done

  # Add all resolved files
  git add -u

  # For research/UPDATE_QUEUE.md, keep ours (it's auto-generated)
  if git status --short | grep -q "UPDATE_QUEUE"; then
    echo "  Keeping our UPDATE_QUEUE.md"
    git checkout --ours research/UPDATE_QUEUE.md
    git add research/UPDATE_QUEUE.md
  fi

  # Commit the merge
  git commit --no-edit
}

echo "✅ Merged $BRANCH"
