#!/bin/bash
# Final batch of auto branches

BRANCHES=$(git branch -r | grep -E "(auto/worker-202511|auto/researcher-202511)" | while read b; do
  c=$(git log --oneline HEAD.."$b" 2>/dev/null | wc -l)
  [ "$c" -gt 0 ] && echo "$b"
done)

if [ -z "$BRANCHES" ]; then
  echo "No branches left to merge"
  exit 0
fi

echo "$BRANCHES" | while read branch; do
  echo "=== Merging $branch ==="
  
  if git merge "$branch" --no-edit 2>&1; then
    echo "✅ Merged cleanly"
    continue
  fi

  # Auto-resolve all conflicts with --theirs
  conflicts=$(git status --short | grep "^UU" | awk '{print $2}')
  
  if [ -z "$conflicts" ]; then
    echo "✅ Merged"
    continue
  fi

  # Check if any need manual intervention (simulation .ts files)
  needs_manual=false
  for file in $conflicts; do
    if echo "$file" | grep -qE "src/simulation/.*\.ts$" && ! echo "$file" | grep -qE "(initialization|config)"; then
      echo "❌ MANUAL NEEDED: $file"
      needs_manual=true
      break
    fi
  done

  if [ "$needs_manual" = true ]; then
    echo "Stopping for manual resolution..."
    exit 1
  fi

  # Auto-resolve all files
  for file in $conflicts; do
    git checkout --theirs "$file" && git add "$file"
  done

  git commit --no-edit && echo "✅ Auto-resolved"
done
